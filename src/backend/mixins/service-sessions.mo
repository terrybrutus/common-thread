import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Error "mo:core/Error";

// The browser keeps a random secret; only its SHA-256 hash reaches this canister.
// The AI service checks that hash through a signature-verified mainnet query.
mixin () {
  type Session = { owner : Principal; expires : Int };
  let serviceSessions : Map.Map<Text, Session>;

  public shared ({ caller }) func openServiceSession(hash : Text) : async Int {
    if (caller.isAnonymous()) throw Error.reject("Sign in first");
    if (hash.size() != 64) throw Error.reject("Invalid session");
    for (c in hash.chars()) {
      if (not ((c >= '0' and c <= '9') or (c >= 'a' and c <= 'f'))) throw Error.reject("Invalid session");
    };
    switch (serviceSessions.get(hash)) {
      case (?old) { if (old.owner != caller) throw Error.reject("Invalid session") };
      case null {};
    };
    let now = Time.now();
    var owned = 0;
    for ((key, value) in serviceSessions.entries().toArray().values()) {
      if (value.expires <= now) serviceSessions.remove(key)
      else if (value.owner == caller) {
        owned += 1;
        if (owned >= 5) serviceSessions.remove(key);
      };
    };
    let expires = now + 1_800_000_000_000;
    serviceSessions.add(hash, { owner = caller; expires });
    expires;
  };

  public query func checkServiceSession(hash : Text) : async ?Principal {
    if (hash.size() != 64) return null;
    switch (serviceSessions.get(hash)) {
      case (?session) { if (session.expires > Time.now()) ?session.owner else null };
      case null null;
    };
  };

  public shared ({ caller }) func closeServiceSession(hash : Text) : async () {
    switch (serviceSessions.get(hash)) {
      case (?session) { if (session.owner == caller) serviceSessions.remove(hash) };
      case null {};
    };
  };
};
