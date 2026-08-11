import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import { buildLearningRecord, exportFilename } from "@/lib/profile/export";

/**
 * Downloads the signed-in learner's own learning record.
 *
 * A route rather than a server action because the browser needs to save a file,
 * and `<a download>` does that with no JavaScript at all.
 *
 * The identity comes from the session and nowhere else. There is deliberately
 * no `?userId=` parameter and no route segment — the only record this endpoint
 * can produce is the caller's own, which makes the authorisation question
 * unanswerable rather than merely answered correctly.
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    // 401 with no body: an unauthenticated caller learns nothing about whether
    // any particular record exists.
    return new NextResponse(null, { status: 401 });
  }

  try {
    const record = await buildLearningRecord(user.id);

    return new NextResponse(JSON.stringify(record, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        // The filename is generated from the date, never from learner-supplied
        // text — a quote or newline in this header is response splitting.
        "content-disposition": `attachment; filename="${exportFilename()}"`,
        // A personal record should not sit in a shared cache.
        "cache-control": "no-store, private",
      },
    });
  } catch {
    console.error("[profile/export] failed to build learning record");
    return NextResponse.json(
      { error: "We couldn't build your export. Please try again in a moment." },
      { status: 500 },
    );
  }
}
