const legacyStoryQuestions = [
  "How did you meet, or what's an early memory you share?",
  "Which places mean something to you both?",
  "What do you both get excited about or do together?",
  "Any little details only you two would recognize?",
];
export const storyQuestions = [
  "Who is this about, and how do you know them? An early memory works too.",
  "Which places matter to them or to your shared story?",
  "What do they enjoy, or what do you enjoy doing together?",
  "What people, nicknames, sayings, or small details would they recognize?",
];

export const storyHints = [
  "A few names, a milestone, or something memorable. Explain who people are when it helps.",
  "Homes, schools, workplaces, trips, or favorite spots. Say what makes each meaningful.",
  "Name a few specific favorites; short lists are welcome.",
  "Mention what each detail means, whenever it isn't obvious.",
];

export type StoryScope = "self" | "someone" | "group";
export function questionsFor(scope?: StoryScope) {
  if (!scope) return storyQuestions;
  return {
    self: [
      "What's an early memory or milestone from your life?",
      "Which places matter to you, and why?",
      "What do you enjoy—shows, food, hobbies, or routines?",
      "What people, pets, nicknames, or little details are part of your story?",
    ],
    someone: [
      "Who is this about, and how do you know them? An early memory works too.",
      "Which places matter to them or to your shared story?",
      "What do they enjoy, or what do you enjoy doing together?",
      "What people, nicknames, sayings, or small details would they recognize?",
    ],
    group: [
      "Who's in this group, and how did it come together? An early memory works too.",
      "Which places matter to this group, and why?",
      "What activities, favorites, or traditions connect this group?",
      "What names, sayings, inside jokes, or little details would the group recognize?",
    ],
  }[scope];
}

export function storyNotes(
  answers: string[],
  extra: { question: string; answer: string }[] = [],
  scope?: StoryScope,
): string {
  return [
    ...(scope ? questionsFor(scope) : legacyStoryQuestions).map(
      (question, index) => ({
        question,
        answer: answers[index] || "",
      }),
    ),
    ...extra,
  ]
    .flatMap(({ question, answer: value }) => {
      const answer = value.trim();
      return answer ? [`${question}\n${answer}`] : [];
    })
    .join("\n\n");
}
