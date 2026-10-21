// Pure, shared by browser sync and private cloud saves. No credentials or runtime code.
export function mergeBriefs(primary, secondary) {
  const text = (a, b) => !a ? b || "" : !b || a.includes(b) ? a : b.includes(a) ? b : a;
  const result = { ...secondary, ...primary };
  for (const key of ["memories", "freeStory", "conversation", "notes"]) if (primary[key] !== undefined || secondary[key] !== undefined) result[key] = text(primary[key], secondary[key]);
  if (primary.storyAnswers || secondary.storyAnswers) result.storyAnswers = Array.from({ length: 4 }, (_, i) => text(primary.storyAnswers?.[i], secondary.storyAnswers?.[i]));
  if (primary.extraAnswers || secondary.extraAnswers) {
    const answers = new Map();
    for (const item of [...(primary.extraAnswers || []), ...(secondary.extraAnswers || [])]) {
      const key = item.question.trim().toLowerCase();
      const existing = answers.get(key);
      answers.set(key, existing ? { ...existing, answer: text(existing.answer, item.answer) } : { ...item });
    }
    if (answers.size > 8) throw new Error("Both story copies are kept on your devices. Download a backup before combining more than eight extra answers.");
    result.extraAnswers = [...answers.values()];
  }
  const history = [...(secondary.playedConnections || []), ...(primary.playedConnections || [])];
  if (history.length) {
    const key = item => `${item.rule}|${(item.sourceWords || item.words).map(w => w.normalize("NFC").toLowerCase()).sort().join("|")}`;
    result.playedConnections = [...new Map(history.map(item => [key(item), item])).values()].slice(-80);
  }
  if (primary.usedTerms || secondary.usedTerms) result.usedTerms = [...new Set([...(secondary.usedTerms || []), ...(primary.usedTerms || [])])].slice(-320);
  return result;
}
