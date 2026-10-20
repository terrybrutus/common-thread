export const storyQuestions = [
  "How did you meet, or what's an early memory you share?",
  "Which places mean something to you both?",
  "What do you both get excited about or do together?",
  "Any little details only you two would recognize?",
];

export const storyHints = [
  "A first hangout, the month you met, or something funny that happened.",
  "Hometowns, a favorite trip, or somewhere you've lived. Tell us why each place matters.",
  "Games, meals, hobbies, shows, or a favorite weekend routine.",
  "An inside joke, a nickname's origin, the weather on a special day, or a small tradition.",
];

export function storyNotes(answers: string[]): string {
  return storyQuestions
    .flatMap((question, index) => {
      const answer = answers[index]?.trim();
      return answer ? [`${question}\n${answer}`] : [];
    })
    .join("\n\n");
}
