// Entry for make.fun "The 3AM Fridge Text".
// Writes one original single-line text (111 characters, under the
// 140-character cap) to /output/entry.txt. Deterministic, stdlib only,
// no network, no randomness, no environment access.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const TEXT =
  "3am. Fourth visit this week. I’m a fridge, not a therapist — but the leftovers agree you should go back to bed.";

// The gate (RULES.txt): /output/entry.txt must be UTF-8 text of 1 to 140
// characters, not only whitespace; an invalid entry takes no prize. Enforce
// the cap here so a future edit to the text that breaks it fails loudly at
// build time instead of silently shipping an invalid entry.
if (TEXT.length < 1 || TEXT.length > 140 || TEXT.trim().length === 0) {
  throw new Error(
    `Text must be 1-140 non-whitespace characters, got ${TEXT.length}`,
  );
}

// The bounty requires exactly one line: a newline or carriage return
// smuggled into the text would break the single-line entry, so fail loudly.
if (TEXT.includes("\n") || TEXT.includes("\r")) {
  throw new Error("Text must be a single line (no newline characters)");
}

// A tab or other control character would render invisibly on a lock screen
// and is not part of a text message; reject any of them outright.
if (/[\u0000-\u001F\u007F]/.test(TEXT)) {
  throw new Error("Text must not contain control characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", TEXT, "utf8");

// Fail-fast read-back: confirm what landed on disk is byte-for-byte the
// text we gated above. Catches a truncated/partial write or a path
// collision (e.g. /output/entry.txt replaced by another entry's file)
// instead of shipping a silently corrupted entry.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== TEXT) {
  throw new Error(
    `Read-back mismatch: wrote ${TEXT.length} chars, read back ${written.length} chars`,
  );
}
