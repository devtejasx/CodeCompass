-- Removes the AI mentor.
--
-- Phase 10 shipped two things that were only ever coupled by a shared release:
-- a deterministic personalisation engine, and a conversational mentor layered
-- on top of it. The engine stays exactly as it is — every recommendation,
-- percentage, study plan and weekly summary is computed from UserActivity and
-- the Phase 3-9 progress tables, none of which this migration touches.
--
-- What goes is the mentor and everything that existed only to serve it:
--
--   mentor_messages / mentor_conversations — the stored chats
--   ai_usage                               — one row per model call, kept for
--                                            rate limiting. The mentor was the
--                                            only writer, so with it gone the
--                                            table has no source.
--   profiles.mentorSolutionPolicy          — how much help the mentor gave on a
--                                            problem. Nothing else read it.
--
-- **This is destructive and irreversible.** Conversation transcripts are
-- deleted, not archived. They were never part of the learning record — the
-- profile export and the public profile both excluded them by name — so no
-- other feature loses a source, but the text itself does not survive this.
--
-- Tables go before their enum types, because a type cannot be dropped while a
-- column still refers to it.

-- DropTable
DROP TABLE IF EXISTS "mentor_messages";

-- DropTable
DROP TABLE IF EXISTS "mentor_conversations";

-- DropTable
DROP TABLE IF EXISTS "ai_usage";

-- DropColumn
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "mentorSolutionPolicy";

-- DropEnum
DROP TYPE IF EXISTS "MentorRole";

-- DropEnum
DROP TYPE IF EXISTS "MentorSolutionPolicy";

-- DropEnum
DROP TYPE IF EXISTS "AIRequestKind";
