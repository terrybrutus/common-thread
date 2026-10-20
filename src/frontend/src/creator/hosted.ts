export const CLAUDE_SERVICE =
  "https://common-thread-claude-service.terrbrutus.chatgpt.site";

export function hostedOperation(
  operation: "generate" | "save-story" | "load-story",
  brief: unknown,
): Promise<unknown> {
  const channel = crypto.randomUUID();
  // Open synchronously during the player's button click, before the first await.
  const popup = window.open(
    `${CLAUDE_SERVICE}/bridge?channel=${encodeURIComponent(channel)}&origin=${encodeURIComponent(window.location.origin)}`,
    "_blank",
    "popup,width=600,height=740",
  );
  if (!popup)
    return Promise.reject(
      new Error(
        "Allow pop-ups for Common Thread, then press Make our puzzle again to open your private Claude connection.",
      ),
    );
  return new Promise((resolve, reject) => {
    const clean = () => {
      window.removeEventListener("message", receive);
      clearTimeout(timeout);
      clearInterval(closed);
    };
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== CLAUDE_SERVICE ||
        event.source !== popup ||
        event.data?.channel !== channel
      )
        return;
      if (event.data.type === "common-thread-ready")
        popup.postMessage(
          { type: "common-thread-brief", channel, brief, operation },
          CLAUDE_SERVICE,
        );
      if (
        event.data.type === "common-thread-result" &&
        (typeof event.data.text === "string" || event.data.value !== undefined)
      ) {
        clean();
        resolve(event.data.value ?? event.data.text);
        window.focus();
      }
      if (event.data.type === "common-thread-error") {
        clean();
        reject(new Error(String(event.data.error).slice(0, 1000)));
      }
    };
    window.addEventListener("message", receive);
    const timeout = setTimeout(() => {
      clean();
      reject(
        new Error(
          "The private Claude window timed out. Sign in there if needed, return here, and try again. Your answers are saved.",
        ),
      );
    }, 300000);
    const closed = setInterval(() => {
      if (popup.closed) {
        clean();
        reject(
          new Error(
            "The Claude window was closed before the puzzle arrived. Your answers are saved; try again when ready.",
          ),
        );
      }
    }, 1000);
  });
}

export async function hostedGeneration(brief: unknown): Promise<string> {
  const result = await hostedOperation("generate", brief);
  if (typeof result !== "string")
    throw new Error("The private service returned an invalid puzzle.");
  return result;
}
