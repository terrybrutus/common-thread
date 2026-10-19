import { type FriendChallenge, validateChallenge } from "./schema";

export function encodeChallenge(challenge: FriendChallenge): string {
  const clean = validateChallenge(challenge);
  const bytes = new TextEncoder().encode(JSON.stringify(clean));
  const code = btoa(
    Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  if (code.length > 20000)
    throw new Error(
      "This challenge is too long to share. Shorten its explanations or note.",
    );
  return code;
}
export function decodeChallenge(input: string): FriendChallenge {
  let code = input.trim();
  if (code.includes("#thread=")) code = code.split("#thread=")[1];
  else if (code.startsWith("thread=")) code = code.slice(7);
  if (!code || code.length > 20000 || !/^[A-Za-z0-9_-]+$/.test(code))
    throw new Error(
      "That challenge code doesn't look complete. Ask your friend for a fresh copy.",
    );
  try {
    const binary = atob(code.replaceAll("-", "+").replaceAll("_", "/"));
    const json = new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(binary, (char) => char.charCodeAt(0)),
    );
    return validateChallenge(JSON.parse(json));
  } catch (error) {
    if (
      error instanceof Error &&
      /group|word|category|characters|format|source|style|mode|hint|explanation|title|topic|note/i.test(
        error.message,
      )
    )
      throw error;
    throw new Error(
      "That challenge couldn't be read. Ask your friend for a fresh copy.",
    );
  }
}
export function challengeLink(
  challenge: FriendChallenge,
  base = window.location.href,
): string {
  const url = new URL(base);
  url.hash = `thread=${encodeChallenge(challenge)}`;
  return url.toString();
}
