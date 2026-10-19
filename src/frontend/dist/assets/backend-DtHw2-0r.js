import { V as Variant, T as Text, N as Null, R as Record, f as Vec, g as Nat, B as Bool, F as Float64, i as Int, j as Service, k as Func, l as Principal, m as Nat8, H as HttpAgent, A as Actor } from "./StorageClient-B-B-7qnt.js";
import { E } from "./StorageClient-B-B-7qnt.js";
import "./index-BTRD9NlQ.js";
const Error$1 = Variant({
  "FrontendOriginsNotConfigured": Null,
  "MixedSsoSources": Record({
    "otherKeys": Vec(Text),
    "ssoKeys": Vec(Text)
  }),
  "Stale": Record({ "ageNs": Nat }),
  "MalformedCandid": Null,
  "AmbiguousAttribute": Record({
    "field": Text,
    "sources": Vec(Text)
  }),
  "NoAttributes": Null,
  "UnknownNonce": Null,
  "UntrustedSsoSource": Record({ "domain": Text }),
  "MissingField": Text,
  "FrontendOriginMismatch": Record({
    "got": Text,
    "expected": Vec(Text)
  })
});
const Result__1 = Variant({ "ok": Null, "err": Error$1 });
const UserRole$1 = Variant({
  "admin": Null,
  "user": Null,
  "guest": Null
});
const Value = Variant({
  "int": Int,
  "nat": Nat,
  "float": Float64,
  "bool": Bool,
  "null": Null,
  "text": Text
});
const Cell = Record({ "value": Value, "name": Text });
const Result = Record({
  "hasMore": Bool,
  "rows": Vec(Vec(Cell))
});
const GenerationBrief = Record({
  "topic": Text,
  "familiarity": Text,
  "interests": Text,
  "difficulty": Text,
  "notes": Text,
  "purpose": Text
});
Service({
  "_initialize_access_control": Func([], [], []),
  "_internet_identity_sign_in_finish": Func([], [Result__1], []),
  "_internet_identity_sign_in_start": Func([], [Vec(Nat8)], []),
  "assignCallerUserRole": Func([Principal, UserRole$1], [], []),
  "execute": Func([Text], [Result], ["query"]),
  "generatePersonalPuzzle": Func([GenerationBrief], [Text], []),
  "getApiDoc": Func([], [Text], ["query"]),
  "getCallerUserRole": Func([], [UserRole$1], ["query"]),
  "isCallerAdmin": Func([], [Bool], ["query"]),
  "schema": Func([], [Text], ["query"])
});
const idlFactory = ({ IDL }) => {
  const Error2 = IDL.Variant({
    "FrontendOriginsNotConfigured": IDL.Null,
    "MixedSsoSources": IDL.Record({
      "otherKeys": IDL.Vec(IDL.Text),
      "ssoKeys": IDL.Vec(IDL.Text)
    }),
    "Stale": IDL.Record({ "ageNs": IDL.Nat }),
    "MalformedCandid": IDL.Null,
    "AmbiguousAttribute": IDL.Record({
      "field": IDL.Text,
      "sources": IDL.Vec(IDL.Text)
    }),
    "NoAttributes": IDL.Null,
    "UnknownNonce": IDL.Null,
    "UntrustedSsoSource": IDL.Record({ "domain": IDL.Text }),
    "MissingField": IDL.Text,
    "FrontendOriginMismatch": IDL.Record({
      "got": IDL.Text,
      "expected": IDL.Vec(IDL.Text)
    })
  });
  const Result__12 = IDL.Variant({ "ok": IDL.Null, "err": Error2 });
  const UserRole2 = IDL.Variant({
    "admin": IDL.Null,
    "user": IDL.Null,
    "guest": IDL.Null
  });
  const Value2 = IDL.Variant({
    "int": IDL.Int,
    "nat": IDL.Nat,
    "float": IDL.Float64,
    "bool": IDL.Bool,
    "null": IDL.Null,
    "text": IDL.Text
  });
  const Cell2 = IDL.Record({ "value": Value2, "name": IDL.Text });
  const Result2 = IDL.Record({
    "hasMore": IDL.Bool,
    "rows": IDL.Vec(IDL.Vec(Cell2))
  });
  const GenerationBrief2 = IDL.Record({
    "topic": IDL.Text,
    "familiarity": IDL.Text,
    "interests": IDL.Text,
    "difficulty": IDL.Text,
    "notes": IDL.Text,
    "purpose": IDL.Text
  });
  return IDL.Service({
    "_initialize_access_control": IDL.Func([], [], []),
    "_internet_identity_sign_in_finish": IDL.Func([], [Result__12], []),
    "_internet_identity_sign_in_start": IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
    "assignCallerUserRole": IDL.Func([IDL.Principal, UserRole2], [], []),
    "execute": IDL.Func([IDL.Text], [Result2], ["query"]),
    "generatePersonalPuzzle": IDL.Func([GenerationBrief2], [IDL.Text], []),
    "getApiDoc": IDL.Func([], [IDL.Text], ["query"]),
    "getCallerUserRole": IDL.Func([], [UserRole2], ["query"]),
    "isCallerAdmin": IDL.Func([], [IDL.Bool], ["query"]),
    "schema": IDL.Func([], [IDL.Text], ["query"])
  });
};
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["admin"] = "admin";
  UserRole2["user"] = "user";
  UserRole2["guest"] = "guest";
  return UserRole2;
})(UserRole || {});
class Backend {
  constructor(actor, _uploadFile, _downloadFile, processError) {
    this.actor = actor;
    this._uploadFile = _uploadFile;
    this._downloadFile = _downloadFile;
    this.processError = processError;
  }
  async _initialize_access_control() {
    if (this.processError) {
      try {
        const result = await this.actor._initialize_access_control();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._initialize_access_control();
      return result;
    }
  }
  async _internet_identity_sign_in_finish() {
    if (this.processError) {
      try {
        const result = await this.actor._internet_identity_sign_in_finish();
        return from_candid_Result__1_n1(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._internet_identity_sign_in_finish();
      return from_candid_Result__1_n1(this._uploadFile, this._downloadFile, result);
    }
  }
  async _internet_identity_sign_in_start() {
    if (this.processError) {
      try {
        const result = await this.actor._internet_identity_sign_in_start();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._internet_identity_sign_in_start();
      return result;
    }
  }
  async assignCallerUserRole(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n5(this._uploadFile, this._downloadFile, arg1));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n5(this._uploadFile, this._downloadFile, arg1));
      return result;
    }
  }
  async execute(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.execute(arg0);
        return from_candid_Result_n6(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.execute(arg0);
      return from_candid_Result_n6(this._uploadFile, this._downloadFile, result);
    }
  }
  async generatePersonalPuzzle(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.generatePersonalPuzzle(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.generatePersonalPuzzle(arg0);
      return result;
    }
  }
  async getApiDoc() {
    if (this.processError) {
      try {
        const result = await this.actor.getApiDoc();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getApiDoc();
      return result;
    }
  }
  async getCallerUserRole() {
    if (this.processError) {
      try {
        const result = await this.actor.getCallerUserRole();
        return from_candid_UserRole_n14(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCallerUserRole();
      return from_candid_UserRole_n14(this._uploadFile, this._downloadFile, result);
    }
  }
  async isCallerAdmin() {
    if (this.processError) {
      try {
        const result = await this.actor.isCallerAdmin();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isCallerAdmin();
      return result;
    }
  }
  async schema() {
    if (this.processError) {
      try {
        const result = await this.actor.schema();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.schema();
      return result;
    }
  }
}
function from_candid_Cell_n10(_uploadFile, _downloadFile, value) {
  return from_candid_record_n11(_uploadFile, _downloadFile, value);
}
function from_candid_Error_n3(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n4(_uploadFile, _downloadFile, value);
}
function from_candid_Result__1_n1(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n2(_uploadFile, _downloadFile, value);
}
function from_candid_Result_n6(_uploadFile, _downloadFile, value) {
  return from_candid_record_n7(_uploadFile, _downloadFile, value);
}
function from_candid_UserRole_n14(_uploadFile, _downloadFile, value) {
  return "admin" in value ? "admin" : "user" in value ? "user" : "guest" in value ? "guest" : value;
}
function from_candid_Value_n12(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n13(_uploadFile, _downloadFile, value);
}
function from_candid_record_n11(_uploadFile, _downloadFile, value) {
  return {
    value: from_candid_Value_n12(_uploadFile, _downloadFile, value.value),
    name: value.name
  };
}
function from_candid_record_n7(_uploadFile, _downloadFile, value) {
  return {
    hasMore: value.hasMore,
    rows: from_candid_vec_n8(_uploadFile, _downloadFile, value.rows)
  };
}
function from_candid_variant_n13(_uploadFile, _downloadFile, value) {
  return "int" in value ? {
    __kind__: "int",
    int: value.int
  } : "nat" in value ? {
    __kind__: "nat",
    nat: value.nat
  } : "float" in value ? {
    __kind__: "float",
    float: value.float
  } : "bool" in value ? {
    __kind__: "bool",
    bool: value.bool
  } : "null" in value ? {
    __kind__: "null",
    null: value.null
  } : "text" in value ? {
    __kind__: "text",
    text: value.text
  } : value;
}
function from_candid_variant_n2(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: from_candid_Error_n3(_uploadFile, _downloadFile, value.err)
  } : value;
}
function from_candid_variant_n4(_uploadFile, _downloadFile, value) {
  return "FrontendOriginsNotConfigured" in value ? {
    __kind__: "FrontendOriginsNotConfigured",
    FrontendOriginsNotConfigured: value.FrontendOriginsNotConfigured
  } : "MixedSsoSources" in value ? {
    __kind__: "MixedSsoSources",
    MixedSsoSources: value.MixedSsoSources
  } : "Stale" in value ? {
    __kind__: "Stale",
    Stale: value.Stale
  } : "MalformedCandid" in value ? {
    __kind__: "MalformedCandid",
    MalformedCandid: value.MalformedCandid
  } : "AmbiguousAttribute" in value ? {
    __kind__: "AmbiguousAttribute",
    AmbiguousAttribute: value.AmbiguousAttribute
  } : "NoAttributes" in value ? {
    __kind__: "NoAttributes",
    NoAttributes: value.NoAttributes
  } : "UnknownNonce" in value ? {
    __kind__: "UnknownNonce",
    UnknownNonce: value.UnknownNonce
  } : "UntrustedSsoSource" in value ? {
    __kind__: "UntrustedSsoSource",
    UntrustedSsoSource: value.UntrustedSsoSource
  } : "MissingField" in value ? {
    __kind__: "MissingField",
    MissingField: value.MissingField
  } : "FrontendOriginMismatch" in value ? {
    __kind__: "FrontendOriginMismatch",
    FrontendOriginMismatch: value.FrontendOriginMismatch
  } : value;
}
function from_candid_vec_n8(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_vec_n9(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n9(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Cell_n10(_uploadFile, _downloadFile, x));
}
function to_candid_UserRole_n5(_uploadFile, _downloadFile, value) {
  return value == "admin" ? {
    admin: null
  } : value == "user" ? {
    user: null
  } : value == "guest" ? {
    guest: null
  } : value;
}
function createActor(canisterId, _uploadFile, _downloadFile, options = {}) {
  const agent = options.agent || HttpAgent.createSync({
    ...options.agentOptions
  });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
  }
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
export {
  Backend,
  E as ExternalBlob,
  UserRole,
  createActor
};
