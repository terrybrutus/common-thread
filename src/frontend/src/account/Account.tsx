import {
  InternetIdentityProvider,
  loadConfig,
  useInternetIdentity,
} from "@caffeineai/core-infrastructure";
import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ACCOUNT_DELETED_EVENT,
  ACCOUNT_RELOAD_EVENT,
  accountRequest,
  accountToken,
  clearAccountCache,
  setAccountGeneration,
  setAccountSession,
  storageKey,
} from "./session";

type Account = {
  owner: string | null;
  configured: boolean;
  busy: boolean;
  error: string;
  login: () => void;
  logout: () => Promise<void>;
};
const Context = createContext<Account>({
  owner: null,
  configured: false,
  busy: false,
  error: "",
  login() {},
  async logout() {},
});
export const useAccount = () => useContext(Context);
const idl = () =>
  IDL.Service({
    openServiceSession: IDL.Func([IDL.Text], [IDL.Int], []),
    closeServiceSession: IDL.Func([IDL.Text], [], []),
  });
type Sessions = {
  openServiceSession(hash: string): Promise<bigint>;
  closeServiceSession(hash: string): Promise<void>;
};
const hex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
function SignedAccount({ children }: { children: ReactNode }) {
  const ii = useInternetIdentity();
  const owner =
    ii.identity && !ii.identity.getPrincipal().isAnonymous()
      ? ii.identity.getPrincipal().toText()
      : null;
  const [active, setActive] = useState<string | null | undefined>(undefined);
  const [erased, setErased] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [resetError, setResetError] = useState("");
  const [boot, setBoot] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [bootError, setBootError] = useState("");
  useEffect(() => {
    const change = () => {
      setErased(true);
      setActive(owner);
    };
    const reload = () => {
      setActive(undefined);
      setBoot((v) => v + 1);
    };
    window.addEventListener(ACCOUNT_RELOAD_EVENT, reload);
    window.addEventListener(ACCOUNT_DELETED_EVENT, change);
    return () => {
      window.removeEventListener(ACCOUNT_DELETED_EVENT, change);
      window.removeEventListener(ACCOUNT_RELOAD_EVENT, reload);
    };
  }, [owner]);
  const current = useRef<
    | { actor: Sessions; token: string; hash: string; expires: number }
    | undefined
  >(undefined);
  const opening = useRef<Promise<string> | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    setEpoch(boot);
    setLeaving(false);
    setErased(false);
    setResetError("");
    setBootError("");
    setActive(undefined);
    current.current = undefined;
    opening.current = undefined;
    async function token(): Promise<string> {
      if (current.current && current.current.expires > Date.now() + 60000)
        return current.current.token;
      if (opening.current) return opening.current;
      const pending = (async () => {
        const config = await loadConfig();
        const actor = Actor.createActor<Sessions>(idl, {
          agent: new HttpAgent({
            host: config.backend_host,
            identity: ii.identity,
          }),
          canisterId: config.backend_canister_id,
        });
        const secret = hex(crypto.getRandomValues(new Uint8Array(32)));
        const hash = hex(
          new Uint8Array(
            await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(secret),
            ),
          ),
        );
        const expires = Number(await actor.openServiceSession(hash)) / 1e6;
        if (cancelled) {
          void actor.closeServiceSession(hash);
          throw new Error("Your account changed.");
        }
        current.current = { actor, token: secret, hash, expires };
        return secret;
      })();
      opening.current = pending;
      try {
        return await pending;
      } finally {
        if (opening.current === pending) opening.current = undefined;
      }
    }
    setAccountSession(owner || "guest", owner ? token : undefined);
    if (!owner) setActive(null);
    else
      void accountRequest("/api/account")
        .then((data) => {
          if (cancelled) return;
          const version = String(data.account.first_seen);
          try {
            if (
              localStorage.getItem(storageKey("account-generation")) !== version
            )
              clearAccountCache();
            localStorage.setItem(storageKey("account-generation"), version);
          } catch {
            /* Cloud accounts work without browser storage. */
          }
          setAccountGeneration(version);
          setActive(owner);
        })
        .catch((e) => {
          if (!cancelled) setBootError(e.message);
        });
    return () => {
      cancelled = true;
      setAccountSession("guest");
      current.current = undefined;
    };
  }, [owner, ii.identity, boot]);
  const logout = async () => {
    setLeaving(true);
    const session = current.current;
    setAccountSession("guest");
    ii.clear();
    if (session) await session.actor.closeServiceSession(session.hash);
  };
  if (leaving)
    return (
      <section className="welcome">
        <h1>Signing out…</h1>
        {ii.loginError && (
          <>
            <p role="alert">Sign-out didn’t finish. Please try again.</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => ii.clear()}
            >
              Try again
            </button>
          </>
        )}
      </section>
    );
  if (active !== owner)
    return (
      <section className="welcome">
        <h1>
          {bootError ? "Your account couldn’t open" : "Opening your account…"}
        </h1>
        {bootError && (
          <>
            <p role="alert">{bootError}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setBoot((v) => v + 1)}
            >
              Try again
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                void logout();
              }}
            >
              Sign out and play
            </button>
          </>
        )}
      </section>
    );
  return (
    <Context.Provider
      value={{
        owner,
        configured: true,
        busy: ii.isInitializing || ii.isLoggingIn,
        error: ii.loginError?.message || "",
        login: () => ii.login({ provider: "google" }),
        logout,
      }}
    >
      <div key={`${owner || "guest"}-${epoch}`}>
        {erased ? (
          <section className="welcome">
            <h1>Your saved data was deleted</h1>
            <p>
              Older device copies won’t be uploaded again automatically. You can
              start with an empty account.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                void accountRequest("/api/account", { startFresh: true })
                  .then((data) => {
                    clearAccountCache();
                    const version = String(data.account.first_seen);
                    setAccountGeneration(version);
                    try {
                      localStorage.setItem(
                        storageKey("account-generation"),
                        version,
                      );
                    } catch {
                      /* Optional cache. */
                    }
                    setErased(false);
                    setEpoch((v) => v + 1);
                  })
                  .catch((e) => setResetError(e.message));
              }}
            >
              Start fresh
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                void logout();
              }}
            >
              Sign out
            </button>
            <p role="alert">{resetError}</p>
          </section>
        ) : (
          children
        )}
      </div>
    </Context.Provider>
  );
}
export function AccountRoot({ children }: { children: ReactNode }) {
  const [configured, setConfigured] = useState<boolean>();
  useEffect(() => {
    void loadConfig()
      .then((c) =>
        setConfigured(
          Boolean(
            c.backend_canister_id && c.backend_canister_id !== "undefined",
          ),
        ),
      )
      .catch(() => setConfigured(false));
  }, []);
  if (configured === undefined) return <output>Opening Common Thread…</output>;
  return configured ? (
    <InternetIdentityProvider withAttributes={false}>
      <SignedAccount>{children}</SignedAccount>
    </InternetIdentityProvider>
  ) : (
    <>{children}</>
  );
}
function hasLegacyBeta() {
  try {
    return Boolean(localStorage.getItem("common-thread-stories-v1"));
  } catch {
    return false;
  }
}
export function AccountMenu() {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [share, setShare] = useState(false);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    if (open && node && !node.open) {
      if (typeof node.showModal === "function") node.showModal();
      else node.setAttribute("open", "");
      node.querySelector<HTMLElement>("h2")?.focus();
    }
  }, [open]);
  useEffect(() => {
    if (open && account.owner)
      void accountRequest("/api/account")
        .then((data) => {
          setEmail(data.account.email);
          setShare(Boolean(data.account.show_email));
        })
        .catch((e) => setMessage(e.message));
  }, [open, account.owner]);
  async function run(action: () => Promise<void>) {
    try {
      setMessage("");
      await action();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Please try again.");
    }
  }
  return (
    <>
      <button
        type="button"
        className="text-button"
        disabled={account.busy || !account.configured}
        onClick={() => (account.owner ? setOpen(true) : account.login())}
      >
        {account.busy
          ? "Signing in…"
          : account.owner
            ? "My account"
            : "Sign in with Google"}
      </button>
      {account.error && (
        <span role="alert">Sign-in didn't complete. Please try again.</span>
      )}
      {open && (
        <dialog
          ref={dialog}
          onCancel={() => setOpen(false)}
          className="account-dialog"
          aria-labelledby="account-title"
        >
          <h2 id="account-title" tabIndex={-1}>
            My account
          </h2>
          <p>
            Your stories and learning topics are saved to this account. Other
            players cannot open them.
          </p>
          <label>
            <input
              type="checkbox"
              checked={share}
              onChange={(e) => setShare(e.target.checked)}
            />{" "}
            Let Terry know I tried the game
          </label>
          {share && (
            <label>
              Email (optional)
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                autoComplete="email"
              />
              <small>
                Visible only in Terry’s visitor list. This does not sign you up
                for marketing.
              </small>
            </label>
          )}
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              void run(async () => {
                await accountRequest("/api/account", {
                  update: true,
                  email,
                  showEmail: share,
                });
                setMessage("Saved.");
              })
            }
          >
            Save preference
          </button>
          <details>
            <summary>Export, restore or delete my data</summary>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                void run(async () => {
                  const data = await accountRequest("/api/account/export");
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "common-thread-account.json";
                  a.click();
                  URL.revokeObjectURL(url);
                })
              }
            >
              Download my data
            </button>
            {hasLegacyBeta() && (
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  void run(async () => {
                    const { legacyOwnerOperation } = await import(
                      "../creator/hosted"
                    );
                    const token = await accountToken();
                    await legacyOwnerOperation("restore-beta", { token });
                    const legacy = localStorage.getItem(
                      "common-thread-stories-v1",
                    );
                    if (legacy) {
                      const { parseProfile } = await import(
                        "../creator/library"
                      );
                      const { mergeCloudLibrary } = await import(
                        "../creator/sync"
                      );
                      const raw = JSON.parse(legacy);
                      const cloud = await accountRequest("/api/story/load");
                      const merged = mergeCloudLibrary(
                        {
                          activeId: raw.activeId,
                          profiles: raw.profiles.map(parseProfile),
                        },
                        cloud.profiles.map(parseProfile),
                      );
                      for (const profile of merged.profiles)
                        await accountRequest("/api/story/save", {
                          ...profile,
                          updatedAt: Math.max(
                            Date.now(),
                            profile.updatedAt + 1,
                          ),
                        });
                    }
                    setMessage(
                      "Earlier private stories restored. Open Your memories to load them.",
                    );
                  })
                }
              >
                Restore my private-beta stories
              </button>
            )}
            {hasLegacyBeta() && (
              <p className="field-help">
                Restore requires the original private-beta account. It never
                copies someone else’s stories automatically.
              </p>
            )}
            {hasLegacyBeta() && (
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  void run(async () => {
                    const { legacyOwnerOperation } = await import(
                      "../creator/hosted"
                    );
                    const data = await legacyOwnerOperation("visitors", {});
                    const url = URL.createObjectURL(
                      new Blob([JSON.stringify(data, null, 2)], {
                        type: "application/json",
                      }),
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "common-thread-visitors.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  })
                }
              >
                Owner: download visit summary
              </button>
            )}
            <button
              type="button"
              className="text-button danger-button"
              onClick={() =>
                void run(async () => {
                  if (
                    !window.confirm(
                      "Delete this account’s saved stories, topics and visitor preference? Download a backup first if you want to keep them.",
                    )
                  )
                    return;
                  await accountRequest("/api/account/delete");
                  clearAccountCache();
                  await account.logout();
                  setOpen(false);
                })
              }
            >
              Delete my saved data
            </button>
          </details>
          <output>{message}</output>
          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                void run(async () => {
                  await account.logout();
                  setOpen(false);
                })
              }
            >
              Sign out
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
