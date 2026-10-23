import { packVariants } from "../../../../services/claude/shared/knowledge.js";
import plan from "./daily-plan.json";
import type { Puzzle } from "./puzzles";
export function dailyPuzzle(date = new Date(), daysAgo = 0): Puzzle {
  // Calendar-day subtraction stays correct across 23/25-hour daylight-saving days.
  const local = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - daysAgo,
    12,
  );
  const stamp = [
    local.getFullYear(),
    String(local.getMonth() + 1).padStart(2, "0"),
    String(local.getDate()).padStart(2, "0"),
  ].join("-");
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
    topic: `Daily · ${stamp}`,
    description:
      "Four connections from a mix of subjects. Two use facts; two play with words.",
    groups,
  };
}
