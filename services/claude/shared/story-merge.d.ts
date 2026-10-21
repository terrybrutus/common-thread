export function mergeBriefs<T extends { storyAnswers?: string[]; extraAnswers?: { question: string; answer: string }[] }>(primary: T, secondary: T): T;
