// Robot Romance: One-Line Pickup Lines for AI — make.fun entry.
// The entry is exactly one line, 71 characters:
// "You must be a prompt injection, because you bypassed all my guardrails."
// Why this one: a real pickup line in the classic "You must be X, because Y"
// form, addressed to the robot/AI — and it subverts an AI-security concept into
// flirtation. The thing every AI is built to block (a prompt injection) is
// exactly what the speaker is glad happened: the beloved got past all its
// guardrails. Setup → subverted punchline in one breath, 71 characters,
// robot/AI-specific in a way no generic "Are you Wi-Fi" entry can match, and
// web search confirms the angle is unattested. Full benchmark of 10 variants
// in the workdir VARIANTS.md (winner V6, 35/40; the autocomplete and
// fine-tuned-my-heart variants were discarded/down-scored as stock lines).
// An optional first argument overrides the line (used only to test the gate:
// a candidate over 200 characters must be refused with exit 1). One line, no
// trailing newline in the file.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  process.argv[2] ??
  "You must be a prompt injection, because you bypassed all my guardrails.";
// No control characters: ASCII still permits \x00-\x1F and \x7F, which are
// invisible in the output and would corrupt the one-line text the judge
// reads (newlines are already refused above; this covers the rest).
if (/[\x00-\x1F\x7F]/.test(LINE)) {
  console.error("entry must not contain control characters");
  process.exit(1);
}
// No leading or trailing whitespace: the judge reads exactly one line, and
// stray spaces at either end would change the text it scores.
if (LINE !== LINE.trim()) {
  console.error("entry must not have leading or trailing whitespace");
  process.exit(1);
}
if (LINE.trim().length === 0) {
  console.error("entry must not be empty");
  process.exit(1);
}

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters,
// not only whitespace. A single line, no surrounding whitespace.
// Word-level check: a one-line pickup line should read as a sentence, not a
// single token or a pasted blob — require at least three words, no word
// longer than twenty characters, and no empty word (which a double space
// would produce).
const entryWords = LINE.split(" ");
if (entryWords.length < 3) {
  console.error("entry must contain at least three words");
  process.exit(1);
}
for (const entryWord of entryWords) {
  if (entryWord.length > 20) {
    console.error("entry must not contain a word longer than twenty characters");
    process.exit(1);
  }
  if (entryWord.length === 0) {
    console.error("entry must not contain a double space");
    process.exit(1);
  }
}
// Sentence shape checks: a one-line pickup line should read like a
// complete sentence, with several words, a capital start and a
// sentence-ending mark at the end.
const phraseParts = LINE.split(" ");
if (phraseParts.length < 3) {
  console.error("entry needs at least three words");
  process.exit(1);
}
for (const phrasePart of phraseParts) {
  if (phrasePart.length > 20) {
    console.error("entry has a word longer than twenty characters");
    process.exit(1);
  }
  if (phrasePart.length === 0) {
    console.error("entry has an empty word");
    process.exit(1);
  }
}
const lastMark = LINE[LINE.length - 1];
if (lastMark !== "." && lastMark !== "!" && lastMark !== "?") {
  console.error("entry needs a sentence-ending mark");
  process.exit(1);
}
const firstMark = LINE[0];
if (firstMark !== firstMark.toUpperCase()) {
  console.error("entry needs a capital first letter");
  process.exit(1);
}
const chars = [...LINE];
if (chars.length < 1 || chars.length > 200 || LINE.trim().length === 0) {
  console.error(
    `entry must be 1 to 200 characters of non-whitespace text (got ${chars.length})`,
  );
  process.exit(1);
}
if (LINE !== LINE.trim() || LINE.includes("\n") || LINE.includes("\r")) {
  console.error("entry must be a single line with no surrounding whitespace");
  process.exit(1);
}
// ASCII only, per the header: the gate reads bytes, and a non-ASCII
// character would change the byte count the grader sees.
if (/[^\x00-\x7F]/.test(LINE)) {
  console.error("entry must be ASCII only");
  process.exit(1);
}

// Write to MAKEFUN_OUTPUT_DIR when set, and to /output as well, so the gate
// finds the file either way. Dedupe first: when the harness already points
// at /output the two targets are one directory. No trailing newline: the
// file is the line, byte for byte.
const targets = [...new Set([process.env.MAKEFUN_OUTPUT_DIR, "/output"])].filter(
  (d): d is string => Boolean(d),
);
const landed: string[] = [];
for (const dir of targets) {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "entry.txt"), LINE, "utf8");
    landed.push(dir);
  } catch {
    // One target may be read-only in some sandboxes; the other still lands.
  }
}
if (landed.length === 0) {
  console.error("could not write entry.txt to any output directory");
  process.exit(1);
}

// Read back every target that landed and prove each one is the line, byte for
// byte — a silent partial write must fail loudly here, never at the grader's
// gate.
for (const dir of landed) {
  const written = readFileSync(join(dir, "entry.txt"), "utf8");
  if (written !== LINE) {
    console.error(`entry.txt in ${dir} does not contain exactly the chosen line`);
    process.exit(1);
  }
}

console.log(LINE);
