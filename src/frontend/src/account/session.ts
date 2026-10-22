export const ACCOUNT_EVENT = "common-thread-account";
export const ACCOUNT_RELOAD_EVENT = "common-thread-account-reload";
export const ACCOUNT_DELETED_EVENT = "common-thread-account-deleted";
let scope = "guest";
let generation = "";
let sessionRevision = 0;
export function setAccountGeneration(value: string) {
  generation = value;
  sessionRevision++;
}
let authorize: (() => Promise<string>) | undefined;
export function storageKey(key: string) {
  return `ct-account:${scope}:${key}`;
}
export function accountScope() {
  return scope;
}
export function setAccountSession(
  owner: string,
  token?: () => Promise<string>,
) {
  sessionRevision++;
  scope = owner;
  generation = "";
  authorize = token;
  window.dispatchEvent(new Event(ACCOUNT_EVENT));
  window.dispatchEvent(new Event("common-thread-connection"));
}
export function hasAccountSession() {
  return Boolean(authorize);
}
export async function accountToken() {
  if (!authorize) throw new Error("Sign in to make and save your own puzzles.");
  return authorize();
}
export class AccountServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public question?: unknown,
  ) {
    super(message);
  }
}
export async function accountRequest(path: string, input: unknown = {}) {
  const owner = scope;
  const revision = sessionRevision;
  const token = await accountToken();
  if (revision !== sessionRevision)
    throw new Error(
      "The signed-in account changed. Open your saved items again.",
    );
  const response = await fetch(
    `https://common-thread-claude-service.terrbrutus.chatgpt.site${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Account-Version": generation,
      },
      body: JSON.stringify(input),
    },
  );
  const data = await response.json();
  if (owner !== scope || revision !== sessionRevision)
    throw new Error(
      "The signed-in account changed. Open your saved items again.",
    );
  if (response.status === 409 && data.code === "account_changed") {
    clearAccountCache();
    window.dispatchEvent(new Event(ACCOUNT_RELOAD_EVENT));
  }
  if (response.status === 410 && data.code === "account_deleted") {
    clearAccountCache();
    window.dispatchEvent(new Event(ACCOUNT_DELETED_EVENT));
  }
  if (!response.ok)
    throw new AccountServiceError(
      data.error ||
        "Your account couldn't be reached. Your local copy is kept.",
      data.code,
      data.question,
    );
  return data;
}
export function clearAccountCache() {
  const prefix = `ct-account:${scope}:`;
  try {
    for (const key of Object.keys(localStorage))
      if (key.startsWith(prefix)) localStorage.removeItem(key);
  } catch {
    /* Cloud deletion still works when browser storage is unavailable. */
  }
}
