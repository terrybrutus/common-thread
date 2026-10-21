import { mergeBriefs } from "../../../../services/claude/shared/story-merge.js";
import type { StoryLibrary, StoryProfile } from "./library";
export const storyContent = (profile: StoryProfile) =>
  JSON.stringify([profile.name, profile.brief]);
export const hasStory = (profile: StoryProfile) =>
  Boolean(
    profile.brief.storyAnswers?.some((a) => a.trim()) ||
      profile.brief.extraAnswers?.some((a) => a.answer.trim()) ||
      profile.brief.freeStory?.trim() ||
      profile.brief.memories?.trim() ||
      profile.brief.notes.trim() ||
      profile.brief.conversation?.trim(),
  );
export function mergeProfile(
  local: StoryProfile,
  cloud: StoryProfile,
): StoryProfile {
  const [primary, secondary] =
    local.updatedAt >= cloud.updatedAt ? [local, cloud] : [cloud, local];
  return {
    ...primary,
    brief: mergeBriefs(primary.brief, secondary.brief),
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
  };
}
export function mergeCloudLibrary(
  local: StoryLibrary,
  remote: StoryProfile[],
): StoryLibrary {
  const profiles = [...local.profiles];
  for (const cloud of remote) {
    const index = profiles.findIndex((p) => p.id === cloud.id);
    if (index < 0) profiles.push(cloud);
    else profiles[index] = mergeProfile(profiles[index], cloud);
  }
  if (profiles.length > 20)
    throw new Error(
      "Your copies are kept on each device. Download a backup before combining more than 20 stories.",
    );
  const active = profiles.find((p) => p.id === local.activeId);
  const newest = remote
    .filter(hasStory)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  return {
    profiles,
    activeId:
      active && hasStory(active) ? active.id : newest?.id || local.activeId,
  };
}
