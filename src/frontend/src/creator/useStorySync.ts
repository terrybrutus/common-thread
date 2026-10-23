import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CONNECTION_EVENT,
  connectStoryCloud,
  hostedOperation,
  isStoryConnected,
} from "./hosted";
import { type StoryLibrary, parseProfile } from "./library";
import { hasStory, mergeCloudLibrary, storyContent } from "./sync";
export function useStorySync(
  library: StoryLibrary,
  setLibrary: Dispatch<SetStateAction<StoryLibrary>>,
  enabled = true,
) {
  const latest = useRef(library);
  latest.current = library;
  const known = useRef(new Map<string, string>());
  const hydrated = useRef(false);
  const loading = useRef(false);
  const saving = useRef(false);
  const mounted = useRef(true);
  const [saveTick, setSaveTick] = useState(0);
  const [connected, setConnected] = useState(isStoryConnected);
  const [message, setMessage] = useState(
    "Saved on this device. Connect your story to use it on another computer.",
  );
  async function load() {
    if (!enabled || !isStoryConnected() || loading.current || saving.current)
      return;
    loading.current = true;
    try {
      const data = (await hostedOperation("load-story", {}, true)) as {
        profiles: unknown[];
      };
      if (!Array.isArray(data.profiles))
        throw new Error(
          "Your cloud story couldn't be read. Your local answers are kept.",
        );
      const profiles = data.profiles.map(parseProfile);
      for (const p of profiles) known.current.set(p.id, storyContent(p));
      if (!mounted.current) return;
      mergeCloudLibrary(latest.current, profiles);
      setLibrary((current) => {
        const next = mergeCloudLibrary(current, profiles);
        return JSON.stringify(current) === JSON.stringify(next)
          ? current
          : next;
      });
      hydrated.current = true;
      setSaveTick((value) => value + 1);
      setMessage(
        "Account connected. Story changes save automatically across your devices.",
      );
    } catch (error) {
      if (mounted.current)
        setMessage(
          error instanceof Error
            ? error.message
            : "Couldn't sync. Your answers are saved on this device.",
        );
    } finally {
      loading.current = false;
    }
  }
  async function save() {
    if (
      !enabled ||
      !hydrated.current ||
      !isStoryConnected() ||
      loading.current ||
      saving.current
    )
      return;
    saving.current = true;
    let completed = false;
    try {
      while (mounted.current && isStoryConnected()) {
        const changed = latest.current.profiles.filter(
          (p) => hasStory(p) && known.current.get(p.id) !== storyContent(p),
        );
        if (!changed.length) break;
        setMessage("Saving your story across computers…");
        for (const profile of changed) {
          const data = (await hostedOperation("save-story", profile, true)) as {
            profile?: unknown;
          };
          const saved = data.profile ? parseProfile(data.profile) : profile;
          known.current.set(profile.id, storyContent(saved));
          if (!mounted.current) return;
          mergeCloudLibrary(latest.current, [saved]);
          setLibrary((current) => {
            const next = mergeCloudLibrary(current, [saved]);
            return JSON.stringify(current) === JSON.stringify(next)
              ? current
              : next;
          });
          // React may not have rendered the merged acknowledgement yet.
          if (storyContent(profile) === storyContent(saved))
            known.current.set(profile.id, storyContent(profile));
        }
        // Coalesce later keystrokes through the next debounce instead of looping on a pending render.
        break;
      }
      completed = true;
      if (mounted.current) setMessage("Saved across your computers.");
    } catch (error) {
      if (mounted.current)
        setMessage(
          error instanceof Error
            ? error.message
            : "Couldn't sync. Your answers are saved on this device.",
        );
    } finally {
      saving.current = false;
      if (
        completed &&
        mounted.current &&
        latest.current.profiles.some(
          (p) => hasStory(p) && known.current.get(p.id) !== storyContent(p),
        )
      )
        setSaveTick((value) => value + 1);
    }
  }
  // Connection and polling subscribe once; the latest library lives in a ref.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Polling must not restart on each keystroke.
  useEffect(() => {
    mounted.current = true;
    if (!enabled) return;
    const change = () => {
      const ready = isStoryConnected();
      setConnected(ready);
      if (ready) void load();
      else {
        hydrated.current = false;
        setMessage(
          "Saved on this device. Sign in with Google to sync across devices.",
        );
      }
    };
    change();
    window.addEventListener(CONNECTION_EVENT, change);
    const poll = setInterval(() => void load(), 20000);
    window.addEventListener("focus", load);
    return () => {
      mounted.current = false;
      clearInterval(poll);
      window.removeEventListener(CONNECTION_EVENT, change);
      window.removeEventListener("focus", load);
    };
  }, [enabled]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Save the latest coalesced edits only after cloud hydration.
  useEffect(() => {
    if (!enabled || !connected) return;
    const timer = setTimeout(() => void save(), 1200);
    return () => clearTimeout(timer);
  }, [library, connected, enabled, saveTick]);
  return {
    connected,
    message: enabled ? message : "",
    connect: () => {
      try {
        connectStoryCloud();
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Couldn't connect your story.",
        );
      }
    },
  };
}
