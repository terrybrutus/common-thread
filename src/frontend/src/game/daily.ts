import { packVariants } from "../../../../services/claude/shared/knowledge.js";
import plan from "./daily-plan.json";
import type { Puzzle } from "./puzzles";
export function dailyPuzzle(date = new Date(), daysAgo = 0): Puzzle {
  const stamp = new Date(date.getTime() - daysAgo * 86400000)
    .toISOString()
    .slice(0, 10);
  const day = Math.floor(Date.parse(`${stamp}T00:00:00Z`) / 86400000);
  const choices = plan[((day % plan.length) + plan.length) % plan.length];
  const groups = choices.map((key) => {
    const [pack, id] = key.split(":");
    const group = packVariants(pack).find((g) => g.id === id);
    if (!group) throw new Error("Daily puzzle unavailable.");
    return { ...group, id: key };
  });
  return {
    id: `daily-${stamp}`,
    title: daysAgo ? `Daily puzzle · ${stamp}` : "Today’s Common Thread",
    topic: `Daily · ${stamp} (UTC)`,
    description:
      "Four connections from a mix of subjects. Two use facts; two play with words.",
    groups,
  };
}
