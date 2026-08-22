import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.lang.reflect.Array;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The Java grading harness.
 *
 * Compiled once, into the runner image, and never regenerated per problem. That
 * is the point: it takes the entry point's name on the command line, finds the
 * method by reflection, and reads the declared parameter types off it. The
 * execution service therefore never needs to know a problem's signature -
 * which is what lets one authored test case, written as JSON, run unchanged in
 * five languages without a schema column describing its types.
 *
 * It lives on its own classpath entry, so a learner who defines a class called
 * CodeCompassHarness gets a compile error in their own file rather than a
 * grader that quietly does something else.
 *
 * The JSON parser below is deliberately small and dependency-free. It parses
 * exactly what the wire contract can contain - arrays, numbers, strings,
 * booleans and null - and refuses everything else. It is fed only by
 * CodeCompass, never by the submission.
 */
public final class CodeCompassHarness {

    private static final String WORK = "/work";
    private static final String CASES = WORK + "/cases.json";
    private static final String RESULTS = WORK + "/results.jsonl";

    /** EX_SOFTWARE. The service reads it as "the harness failed", not "they did". */
    private static final int HARNESS_FAILURE = 70;

    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.err.println("harness: no entry point given");
            System.exit(HARNESS_FAILURE);
        }

        /*
         * A thread with a large stack, rather than the main thread.
         *
         * Recursion is the point of a third of this catalog - depth of a tree,
         * backtracking, divide and conquer - and the main thread's stack is
         * whatever the OS gave the process, which -Xss does not change. A
         * correct recursive solution overflowing on a skewed test tree would be
         * failed for the JVM's default rather than for anything the learner
         * wrote, so the work runs where the stack size is ours to set.
         */
        Runner runner = new Runner(args[0]);
        Thread thread = new Thread(null, runner, "grade", 256L * 1024 * 1024);
        thread.start();
        thread.join();

        if (runner.harnessFailure != null) {
            System.err.println(runner.harnessFailure);
            System.exit(HARNESS_FAILURE);
        }
        if (runner.thrown != null) {
            // The learner's exception, printed as their own runtime would print
            // it. The service scrubs the trace before anybody sees it.
            runner.thrown.printStackTrace();
            System.exit(1);
        }
    }

    private static final class Runner implements Runnable {
        private final String entryPoint;
        Throwable thrown;
        String harnessFailure;

        Runner(String entryPoint) {
            this.entryPoint = entryPoint;
        }

        @Override
        public void run() {
            Writer out = null;
            try {
                List<Object> cases = readCases();
                Method method = findMethod(entryPoint);
                out = new BufferedWriter(new FileWriter(RESULTS, StandardCharsets.UTF_8));

                for (int i = 0; i < cases.size(); i++) {
                    Object entry = cases.get(i);
                    if (!(entry instanceof List)) {
                        harnessFailure = "harness: case " + i + " is not an argument list";
                        return;
                    }
                    @SuppressWarnings("unchecked")
                    List<Object> args = (List<Object>) entry;

                    // Coerced afresh for every case, so a solution that sorts
                    // the array it was handed cannot corrupt a later case.
                    Object[] call = coerceAll(method, args, i);
                    if (call == null) return;

                    Object value;
                    try {
                        value = method.invoke(null, call);
                    } catch (InvocationTargetException failure) {
                        thrown = failure.getCause() == null ? failure : failure.getCause();
                        return;
                    } catch (IllegalAccessException | IllegalArgumentException refused) {
                        // Not the learner's exception: the method exists but
                        // could not be called with these arguments, which means
                        // the signature and the test cases disagree. Reported
                        // as a harness failure so it becomes SYSTEM_ERROR and
                        // no attempt is recorded against them.
                        harnessFailure = "harness: cannot call " + entryPoint
                                + " (" + refused.getClass().getSimpleName() + ")";
                        return;
                    }

                    StringBuilder line = new StringBuilder(64);
                    line.append("{\"i\":").append(i).append(",\"v\":");
                    writeJson(line, value);
                    line.append("}\n");
                    out.write(line.toString());
                    out.flush();
                }
            } catch (IOException error) {
                harnessFailure = "harness: " + error.getClass().getSimpleName();
            } catch (RuntimeException | StackOverflowError | OutOfMemoryError error) {
                // A stack overflow or an exhausted heap is the learner's
                // program, not ours, so it is rethrown as their failure.
                thrown = error;
            } finally {
                if (out != null) {
                    try {
                        out.close();
                    } catch (IOException ignored) {
                        // Nothing useful left to do; the report is already written.
                    }
                }
            }
        }

        private Object[] coerceAll(Method method, List<Object> args, int index) {
            Class<?>[] types = method.getParameterTypes();
            if (types.length != args.size()) {
                harnessFailure = "harness: case " + index + " has " + args.size()
                        + " arguments for a method taking " + types.length;
                return null;
            }
            Object[] call = new Object[types.length];
            for (int p = 0; p < types.length; p++) {
                call[p] = coerce(args.get(p), types[p]);
            }
            return call;
        }

        private List<Object> readCases() throws IOException {
            String text = new String(Files.readAllBytes(Paths.get(CASES)), StandardCharsets.UTF_8);
            Object parsed = Json.parse(text);
            if (!(parsed instanceof List)) {
                throw new IOException("cases.json is not an array");
            }
            @SuppressWarnings("unchecked")
            List<Object> cases = (List<Object>) parsed;
            return cases;
        }

        private Method findMethod(String name) throws IOException {
            Class<?> solution;
            try {
                solution = Class.forName("Solution");
            } catch (ClassNotFoundException missing) {
                throw new IOException("no class named Solution");
            }
            for (Method candidate : solution.getDeclaredMethods()) {
                if (candidate.getName().equals(name)) {
                    candidate.setAccessible(true);
                    return candidate;
                }
            }
            throw new IOException("Solution has no method named " + name);
        }
    }

    // ── Coercion ────────────────────────────────────────────────────────────

    /**
     * One parsed JSON value into the type the learner's method declared.
     *
     * The declared type is the authority. A JSON number becomes an int, a long
     * or a double depending on what the parameter is, and an array becomes
     * whatever component type it holds - including Integer[], which is how a
     * tree's missing children are spelled, and which is the reason this cannot
     * simply cast.
     */
    private static Object coerce(Object value, Class<?> type) {
        if (type.isArray()) {
            Class<?> component = type.getComponentType();
            if (!(value instanceof List)) {
                return Array.newInstance(component, 0);
            }
            List<?> items = (List<?>) value;
            Object array = Array.newInstance(component, items.size());
            for (int i = 0; i < items.size(); i++) {
                Array.set(array, i, coerce(items.get(i), component));
            }
            return array;
        }

        if (value == null) return null;

        if (type == int.class || type == Integer.class) {
            return Integer.valueOf(((Number) value).intValue());
        }
        if (type == long.class || type == Long.class) {
            return Long.valueOf(((Number) value).longValue());
        }
        if (type == double.class || type == Double.class) {
            return Double.valueOf(((Number) value).doubleValue());
        }
        if (type == float.class || type == Float.class) {
            return Float.valueOf(((Number) value).floatValue());
        }
        if (type == boolean.class || type == Boolean.class) {
            return Boolean.valueOf(Boolean.TRUE.equals(value));
        }
        if (type == char.class || type == Character.class) {
            String text = String.valueOf(value);
            return Character.valueOf(text.isEmpty() ? ' ' : text.charAt(0));
        }
        if (type == String.class) {
            return String.valueOf(value);
        }
        return value;
    }

    // ── Serialisation ───────────────────────────────────────────────────────

    /**
     * A returned value as JSON, decided by its runtime class.
     *
     * Same trick as the coercion, in reverse: the value knows what it is, so
     * the harness does not need to be told the return type either.
     */
    private static void writeJson(StringBuilder out, Object value) {
        if (value == null) {
            out.append("null");
            return;
        }
        if (value instanceof Boolean) {
            out.append(((Boolean) value).booleanValue() ? "true" : "false");
            return;
        }
        if (value instanceof Double || value instanceof Float) {
            double number = ((Number) value).doubleValue();
            // JSON has no NaN and no infinity, and a program that produced one
            // has an answer nothing can match. null is the honest encoding.
            out.append(Double.isFinite(number) ? trimDouble(number) : "null");
            return;
        }
        if (value instanceof Number) {
            out.append(value.toString());
            return;
        }
        if (value instanceof Character) {
            writeString(out, value.toString());
            return;
        }
        if (value instanceof CharSequence) {
            writeString(out, value.toString());
            return;
        }
        if (value.getClass().isArray()) {
            out.append('[');
            int length = Array.getLength(value);
            for (int i = 0; i < length; i++) {
                if (i > 0) out.append(',');
                writeJson(out, Array.get(value, i));
            }
            out.append(']');
            return;
        }
        if (value instanceof Iterable) {
            out.append('[');
            boolean first = true;
            for (Object item : (Iterable<?>) value) {
                if (!first) out.append(',');
                first = false;
                writeJson(out, item);
            }
            out.append(']');
            return;
        }
        if (value instanceof Map) {
            out.append('{');
            boolean first = true;
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) value).entrySet()) {
                if (!first) out.append(',');
                first = false;
                writeString(out, String.valueOf(entry.getKey()));
                out.append(':');
                writeJson(out, entry.getValue());
            }
            out.append('}');
            return;
        }
        // Nothing in the catalog returns anything else. Encoded as its own
        // toString so it becomes a visible wrong answer rather than a crash.
        writeString(out, value.toString());
    }

    /** Drops the trailing ".0" Java prints for a whole double. */
    private static String trimDouble(double number) {
        String text = Double.toString(number);
        return text.endsWith(".0") ? text.substring(0, text.length() - 2) : text;
    }

    private static void writeString(StringBuilder out, String value) {
        out.append('"');
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"': out.append("\\\""); break;
                case '\\': out.append("\\\\"); break;
                case '\n': out.append("\\n"); break;
                case '\r': out.append("\\r"); break;
                case '\t': out.append("\\t"); break;
                default:
                    if (c < 0x20) {
                        out.append(String.format("\\u%04x", (int) c));
                    } else {
                        out.append(c);
                    }
            }
        }
        out.append('"');
    }

    // ── JSON ────────────────────────────────────────────────────────────────

    /**
     * A recursive-descent parser for the subset the wire contract uses.
     *
     * Small enough to read in one sitting, which is the whole reason it is here
     * rather than a library: the runner image should contain the JDK, the
     * learner's classes and nothing else with a supply chain.
     */
    private static final class Json {
        private final String text;
        private int at;

        private Json(String text) {
            this.text = text;
        }

        static Object parse(String text) throws IOException {
            Json parser = new Json(text);
            parser.skip();
            Object value = parser.value();
            parser.skip();
            if (parser.at != text.length()) throw new IOException("trailing JSON");
            return value;
        }

        private void skip() {
            while (at < text.length() && Character.isWhitespace(text.charAt(at))) at++;
        }

        private Object value() throws IOException {
            if (at >= text.length()) throw new IOException("unexpected end of JSON");
            char c = text.charAt(at);
            if (c == '[') return array();
            if (c == '{') return object();
            if (c == '"') return string();
            if (text.startsWith("true", at)) { at += 4; return Boolean.TRUE; }
            if (text.startsWith("false", at)) { at += 5; return Boolean.FALSE; }
            if (text.startsWith("null", at)) { at += 4; return null; }
            return number();
        }

        private List<Object> array() throws IOException {
            at++;
            List<Object> items = new ArrayList<>();
            skip();
            if (at < text.length() && text.charAt(at) == ']') { at++; return items; }
            while (true) {
                skip();
                items.add(value());
                skip();
                if (at >= text.length()) throw new IOException("unterminated array");
                char c = text.charAt(at++);
                if (c == ']') return items;
                if (c != ',') throw new IOException("expected , in array");
            }
        }

        private Map<String, Object> object() throws IOException {
            at++;
            Map<String, Object> entries = new LinkedHashMap<>();
            skip();
            if (at < text.length() && text.charAt(at) == '}') { at++; return entries; }
            while (true) {
                skip();
                String key = string();
                skip();
                if (at >= text.length() || text.charAt(at++) != ':') {
                    throw new IOException("expected : in object");
                }
                skip();
                entries.put(key, value());
                skip();
                if (at >= text.length()) throw new IOException("unterminated object");
                char c = text.charAt(at++);
                if (c == '}') return entries;
                if (c != ',') throw new IOException("expected , in object");
            }
        }

        private String string() throws IOException {
            if (at >= text.length() || text.charAt(at) != '"') {
                throw new IOException("expected a string");
            }
            at++;
            StringBuilder out = new StringBuilder();
            while (at < text.length()) {
                char c = text.charAt(at++);
                if (c == '"') return out.toString();
                if (c != '\\') { out.append(c); continue; }
                if (at >= text.length()) break;
                char escape = text.charAt(at++);
                switch (escape) {
                    case '"': out.append('"'); break;
                    case '\\': out.append('\\'); break;
                    case '/': out.append('/'); break;
                    case 'b': out.append('\b'); break;
                    case 'f': out.append('\f'); break;
                    case 'n': out.append('\n'); break;
                    case 'r': out.append('\r'); break;
                    case 't': out.append('\t'); break;
                    case 'u':
                        if (at + 4 > text.length()) throw new IOException("short \\u escape");
                        out.append((char) Integer.parseInt(text.substring(at, at + 4), 16));
                        at += 4;
                        break;
                    default: throw new IOException("unknown escape");
                }
            }
            throw new IOException("unterminated string");
        }

        private Object number() throws IOException {
            int start = at;
            if (at < text.length() && (text.charAt(at) == '-' || text.charAt(at) == '+')) at++;
            boolean fractional = false;
            while (at < text.length()) {
                char c = text.charAt(at);
                if (c >= '0' && c <= '9') { at++; continue; }
                if (c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') {
                    fractional = true;
                    at++;
                    continue;
                }
                break;
            }
            if (start == at) throw new IOException("expected a number");
            String slice = text.substring(start, at);
            try {
                // Integers stay integral so an int parameter is not handed a
                // double that has already lost precision on the way in.
                return fractional ? (Object) Double.valueOf(slice) : (Object) Long.valueOf(slice);
            } catch (NumberFormatException malformed) {
                throw new IOException("malformed number");
            }
        }
    }

    private CodeCompassHarness() {}
}
