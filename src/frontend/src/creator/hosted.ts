import { StoryQuestionError, cleanStoryQuestion } from "./followUp";
export const CLAUDE_SERVICE =
  "https://common-thread-claude-service.terrbrutus.chatgpt.site";
export const CONNECTION_EVENT = "common-thread-connection";
type Operation = "generate" | "save-story" | "load-story";
type Pending = {
  operation: Operation;
  brief: unknown;
  sent: boolean;
  timer: ReturnType<typeof setTimeout>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};
let connection:
  | {
      popup: Window;
      channel: string;
      ready: boolean;
      requests: Map<string, Pending>;
      receive: (event: MessageEvent) => void;
      closed: ReturnType<typeof setInterval>;
    }
  | undefined;
const notify = () => window.dispatchEvent(new Event(CONNECTION_EVENT));
export function isStoryConnected() {
  return Boolean(connection?.ready && !connection.popup.closed);
}
export function disconnectStoryCloud() {
  const current = connection;
  if (!current) return;
  connection = undefined;
  window.removeEventListener("message", current.receive);
  clearInterval(current.closed);
  for (const pending of current.requests.values()) {
    clearTimeout(pending.timer);
    pending.reject(
      new Error(
        "The story connection closed. Your changes are saved on this device; reconnect to sync.",
      ),
    );
  }
  current.requests.clear();
  notify();
}
export function connectStoryCloud() {
  if (connection && !connection.popup.closed) {
    if (!connection.ready) connection.popup.focus?.();
    return;
  }
  disconnectStoryCloud();
  const channel = crypto.randomUUID();
  const popup = window.open(
    `${CLAUDE_SERVICE}/bridge?channel=${encodeURIComponent(channel)}&origin=${encodeURIComponent(window.location.origin)}`,
    "common-thread-connection",
    "popup,width=480,height=480",
  );
  if (!popup)
    throw new Error(
      "Allow pop-ups for Common Thread to connect your saved story. Your answers are still saved on this device.",
    );
  const requests = new Map<string, Pending>();
  const send = (requestId: string, pending: Pending) => {
    if (pending.sent || !connection?.ready) return;
    pending.sent = true;
    popup.postMessage(
      {
        type: "common-thread-brief",
        channel,
        requestId,
        brief: pending.brief,
        operation: pending.operation,
      },
      CLAUDE_SERVICE,
    );
  };
  const receive = (event: MessageEvent) => {
    if (
      event.origin !== CLAUDE_SERVICE ||
      event.source !== popup ||
      event.data?.channel !== channel ||
      !connection ||
      connection.popup !== popup
    )
      return;
    if (event.data.type === "common-thread-ready") {
      if (!connection.ready) {
        connection.ready = true;
        notify();
        window.focus();
      }
      for (const [id, pending] of requests) send(id, pending);
      return;
    }
    const id =
      event.data.requestId ||
      (requests.size === 1 ? requests.keys().next().value : undefined);
    if (!id) return;
    const pending = requests.get(id);
    if (!pending) return;
    if (
      event.data.type === "common-thread-result" &&
      (typeof event.data.text === "string" || event.data.value !== undefined)
    ) {
      clearTimeout(pending.timer);
      requests.delete(id);
      pending.resolve(event.data.value ?? event.data.text);
      if (pending.operation === "generate") window.focus();
    } else if (event.data.type === "common-thread-error") {
      clearTimeout(pending.timer);
      requests.delete(id);
      pending.reject(
        event.data.code === "needs_story" && pending.operation === "generate"
          ? new StoryQuestionError(cleanStoryQuestion(event.data.question))
          : new Error(String(event.data.error).slice(0, 1000)),
      );
      if (pending.operation === "generate") window.focus();
    }
  };
  window.addEventListener("message", receive);
  connection = {
    popup,
    channel,
    ready: false,
    requests,
    receive,
    closed: setInterval(() => {
      if (popup.closed) disconnectStoryCloud();
    }, 1000),
  };
}
export function hostedOperation(
  operation: Operation,
  brief: unknown,
  background = false,
): Promise<unknown> {
  try {
    if (background && !isStoryConnected())
      throw new Error(
        "Reconnect to sync this story. Your answers are saved on this device.",
      );
    connectStoryCloud();
  } catch (error) {
    return Promise.reject(error);
  }
  const current = connection!;
  const requestId = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const pending: Pending = {
      operation,
      brief,
      sent: false,
      resolve,
      reject,
      timer: setTimeout(() => {
        current.requests.delete(requestId);
        reject(
          new Error(
            "The story connection timed out. Your answers are saved on this device; reconnect and try again.",
          ),
        );
      }, 300000),
    };
    current.requests.set(requestId, pending);
    if (current.ready) {
      pending.sent = true;
      current.popup.postMessage(
        {
          type: "common-thread-brief",
          channel: current.channel,
          requestId,
          brief,
          operation,
        },
        CLAUDE_SERVICE,
      );
    }
  });
}
export async function hostedGeneration(brief: unknown): Promise<string> {
  const result = await hostedOperation("generate", brief);
  if (typeof result !== "string")
    throw new Error("The private service returned an invalid puzzle.");
  return result;
}
