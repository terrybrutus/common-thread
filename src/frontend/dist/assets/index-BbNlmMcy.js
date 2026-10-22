var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var _focused, _cleanup, _setup, _a, _provider, _providerCalled, _b, _online, _cleanup2, _setup2, _c, _gcTimeout, _d, _initialState, _revertState, _cache, _client, _retryer, _defaultOptions, _abortSignalConsumed, _Query_instances, isInitialPausedFetch_fn, dispatch_fn, _e, _client2, _observers, _mutationCache, _retryer2, _Mutation_instances, dispatch_fn2, _f, _mutations, _scopes, _mutationId, _g, _queries, _h, _queryCache, _mutationCache2, _defaultOptions2, _queryDefaults, _mutationDefaults, _mountCount, _unsubscribeFocus, _unsubscribeOnline, _i;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var REACT_ELEMENT_TYPE$2 = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE$2 = Symbol.for("react.fragment");
function jsxProd(type, config, maybeKey) {
  var key = null;
  void 0 !== maybeKey && (key = "" + maybeKey);
  void 0 !== config.key && (key = "" + config.key);
  if ("key" in config) {
    maybeKey = {};
    for (var propName in config)
      "key" !== propName && (maybeKey[propName] = config[propName]);
  } else maybeKey = config;
  config = maybeKey.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE$2,
    type,
    key,
    ref: void 0 !== config ? config : null,
    props: maybeKey
  };
}
reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE$2;
reactJsxRuntime_production.jsx = jsxProd;
reactJsxRuntime_production.jsxs = jsxProd;
{
  jsxRuntime.exports = reactJsxRuntime_production;
}
var jsxRuntimeExports = jsxRuntime.exports;
var Subscribable = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
    this.subscribe = this.subscribe.bind(this);
  }
  subscribe(listener) {
    this.listeners.add(listener);
    this.onSubscribe();
    return () => {
      this.listeners.delete(listener);
      this.onUnsubscribe();
    };
  }
  hasListeners() {
    return this.listeners.size > 0;
  }
  onSubscribe() {
  }
  onUnsubscribe() {
  }
};
var FocusManager = (_a = class extends Subscribable {
  constructor() {
    super();
    __privateAdd(this, _focused);
    __privateAdd(this, _cleanup);
    __privateAdd(this, _setup);
    __privateSet(this, _setup, (onFocus) => {
      if (typeof window !== "undefined" && window.addEventListener) {
        const listener = () => onFocus();
        window.addEventListener("visibilitychange", listener, false);
        return () => {
          window.removeEventListener("visibilitychange", listener);
        };
      }
      return;
    });
  }
  onSubscribe() {
    if (!__privateGet(this, _cleanup)) {
      this.setEventListener(__privateGet(this, _setup));
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _cleanup)) == null ? void 0 : _a2.call(this);
      __privateSet(this, _cleanup, void 0);
    }
  }
  setEventListener(setup) {
    var _a2;
    __privateSet(this, _setup, setup);
    (_a2 = __privateGet(this, _cleanup)) == null ? void 0 : _a2.call(this);
    __privateSet(this, _cleanup, setup((focused) => {
      if (typeof focused === "boolean") {
        this.setFocused(focused);
      } else {
        this.onFocus();
      }
    }));
  }
  setFocused(focused) {
    const changed = __privateGet(this, _focused) !== focused;
    if (changed) {
      __privateSet(this, _focused, focused);
      this.onFocus();
    }
  }
  onFocus() {
    const isFocused = this.isFocused();
    this.listeners.forEach((listener) => {
      listener(isFocused);
    });
  }
  isFocused() {
    var _a2;
    if (typeof __privateGet(this, _focused) === "boolean") {
      return __privateGet(this, _focused);
    }
    return ((_a2 = globalThis.document) == null ? void 0 : _a2.visibilityState) !== "hidden";
  }
}, _focused = new WeakMap(), _cleanup = new WeakMap(), _setup = new WeakMap(), _a);
var focusManager = new FocusManager();
var defaultTimeoutProvider = {
  // We need the wrapper function syntax below instead of direct references to
  // global setTimeout etc.
  //
  // BAD: `setTimeout: setTimeout`
  // GOOD: `setTimeout: (cb, delay) => setTimeout(cb, delay)`
  //
  // If we use direct references here, then anything that wants to spy on or
  // replace the global setTimeout (like tests) won't work since we'll already
  // have a hard reference to the original implementation at the time when this
  // file was imported.
  setTimeout: (callback, delay) => setTimeout(callback, delay),
  clearTimeout: (timeoutId) => clearTimeout(timeoutId),
  setInterval: (callback, delay) => setInterval(callback, delay),
  clearInterval: (intervalId) => clearInterval(intervalId)
};
var TimeoutManager = (_b = class {
  constructor() {
    // We cannot have TimeoutManager<T> as we must instantiate it with a concrete
    // type at app boot; and if we leave that type, then any new timer provider
    // would need to support the default provider's concrete timer ID, which is
    // infeasible across environments.
    //
    // We settle for type safety for the TimeoutProvider type, and accept that
    // this class is unsafe internally to allow for extension.
    __privateAdd(this, _provider, defaultTimeoutProvider);
    __privateAdd(this, _providerCalled, false);
  }
  setTimeoutProvider(provider) {
    __privateSet(this, _provider, provider);
  }
  setTimeout(callback, delay) {
    return __privateGet(this, _provider).setTimeout(callback, delay);
  }
  clearTimeout(timeoutId) {
    __privateGet(this, _provider).clearTimeout(timeoutId);
  }
  setInterval(callback, delay) {
    return __privateGet(this, _provider).setInterval(callback, delay);
  }
  clearInterval(intervalId) {
    __privateGet(this, _provider).clearInterval(intervalId);
  }
}, _provider = new WeakMap(), _providerCalled = new WeakMap(), _b);
var timeoutManager = new TimeoutManager();
function systemSetTimeoutZero(callback) {
  setTimeout(callback, 0);
}
var isServer = typeof window === "undefined" || "Deno" in globalThis;
function noop$6() {
}
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function isValidTimeout(value) {
  return typeof value === "number" && value >= 0 && value !== Infinity;
}
function timeUntilStale(updatedAt, staleTime) {
  return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function resolveStaleTime(staleTime, query) {
  return typeof staleTime === "function" ? staleTime(query) : staleTime;
}
function resolveEnabled(enabled, query) {
  return typeof enabled === "function" ? enabled(query) : enabled;
}
function matchQuery(filters, query) {
  const {
    type = "all",
    exact,
    fetchStatus,
    predicate,
    queryKey,
    stale
  } = filters;
  if (queryKey) {
    if (exact) {
      if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) {
        return false;
      }
    } else if (!partialMatchKey(query.queryKey, queryKey)) {
      return false;
    }
  }
  if (type !== "all") {
    const isActive = query.isActive();
    if (type === "active" && !isActive) {
      return false;
    }
    if (type === "inactive" && isActive) {
      return false;
    }
  }
  if (typeof stale === "boolean" && query.isStale() !== stale) {
    return false;
  }
  if (fetchStatus && fetchStatus !== query.state.fetchStatus) {
    return false;
  }
  if (predicate && !predicate(query)) {
    return false;
  }
  return true;
}
function matchMutation(filters, mutation) {
  const { exact, status, predicate, mutationKey } = filters;
  if (mutationKey) {
    if (!mutation.options.mutationKey) {
      return false;
    }
    if (exact) {
      if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) {
        return false;
      }
    } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) {
      return false;
    }
  }
  if (status && mutation.state.status !== status) {
    return false;
  }
  if (predicate && !predicate(mutation)) {
    return false;
  }
  return true;
}
function hashQueryKeyByOptions(queryKey, options) {
  const hashFn = (options == null ? void 0 : options.queryKeyHashFn) || hashKey;
  return hashFn(queryKey);
}
function hashKey(queryKey) {
  return JSON.stringify(
    queryKey,
    (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
      result[key] = val[key];
      return result;
    }, {}) : val
  );
}
function partialMatchKey(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    return Object.keys(b).every((key) => partialMatchKey(a[key], b[key]));
  }
  return false;
}
var hasOwn = Object.prototype.hasOwnProperty;
function replaceEqualDeep(a, b, depth = 0) {
  if (a === b) {
    return a;
  }
  if (depth > 500) return b;
  const array = isPlainArray(a) && isPlainArray(b);
  if (!array && !(isPlainObject(a) && isPlainObject(b))) return b;
  const aItems = array ? a : Object.keys(a);
  const aSize = aItems.length;
  const bItems = array ? b : Object.keys(b);
  const bSize = bItems.length;
  const copy = array ? new Array(bSize) : {};
  let equalItems = 0;
  for (let i = 0; i < bSize; i++) {
    const key = array ? i : bItems[i];
    const aItem = a[key];
    const bItem = b[key];
    if (aItem === bItem) {
      copy[key] = aItem;
      if (array ? i < aSize : hasOwn.call(a, key)) equalItems++;
      continue;
    }
    if (aItem === null || bItem === null || typeof aItem !== "object" || typeof bItem !== "object") {
      copy[key] = bItem;
      continue;
    }
    const v = replaceEqualDeep(aItem, bItem, depth + 1);
    copy[key] = v;
    if (v === aItem) equalItems++;
  }
  return aSize === bSize && equalItems === aSize ? a : copy;
}
function isPlainArray(value) {
  return Array.isArray(value) && value.length === Object.keys(value).length;
}
function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  }
  const ctor = o.constructor;
  if (ctor === void 0) {
    return true;
  }
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  if (Object.getPrototypeOf(o) !== Object.prototype) {
    return false;
  }
  return true;
}
function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function sleep(timeout) {
  return new Promise((resolve) => {
    timeoutManager.setTimeout(resolve, timeout);
  });
}
function replaceData(prevData, data, options) {
  if (typeof options.structuralSharing === "function") {
    return options.structuralSharing(prevData, data);
  } else if (options.structuralSharing !== false) {
    return replaceEqualDeep(prevData, data);
  }
  return data;
}
function addToEnd(items, item, max = 0) {
  const newItems = [...items, item];
  return max && newItems.length > max ? newItems.slice(1) : newItems;
}
function addToStart(items, item, max = 0) {
  const newItems = [item, ...items];
  return max && newItems.length > max ? newItems.slice(0, -1) : newItems;
}
var skipToken = /* @__PURE__ */ Symbol();
function ensureQueryFn(options, fetchOptions) {
  if (!options.queryFn && (fetchOptions == null ? void 0 : fetchOptions.initialPromise)) {
    return () => fetchOptions.initialPromise;
  }
  if (!options.queryFn || options.queryFn === skipToken) {
    return () => Promise.reject(new Error(`Missing queryFn: '${options.queryHash}'`));
  }
  return options.queryFn;
}
function addConsumeAwareSignal(object, getSignal, onCancelled) {
  let consumed = false;
  let signal;
  Object.defineProperty(object, "signal", {
    enumerable: true,
    get: () => {
      signal ?? (signal = getSignal());
      if (consumed) {
        return signal;
      }
      consumed = true;
      if (signal.aborted) {
        onCancelled();
      } else {
        signal.addEventListener("abort", onCancelled, { once: true });
      }
      return signal;
    }
  });
  return object;
}
var environmentManager = /* @__PURE__ */ (() => {
  let isServerFn = () => isServer;
  return {
    /**
     * Returns whether the current runtime should be treated as a server environment.
     */
    isServer() {
      return isServerFn();
    },
    /**
     * Overrides the server check globally.
     */
    setIsServer(isServerValue) {
      isServerFn = isServerValue;
    }
  };
})();
function pendingThenable() {
  let resolve;
  let reject;
  const thenable = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  thenable.status = "pending";
  thenable.catch(() => {
  });
  function finalize(data) {
    Object.assign(thenable, data);
    delete thenable.resolve;
    delete thenable.reject;
  }
  thenable.resolve = (value) => {
    finalize({
      status: "fulfilled",
      value
    });
    resolve(value);
  };
  thenable.reject = (reason) => {
    finalize({
      status: "rejected",
      reason
    });
    reject(reason);
  };
  return thenable;
}
var defaultScheduler = systemSetTimeoutZero;
function createNotifyManager() {
  let queue = [];
  let transactions = 0;
  let notifyFn = (callback) => {
    callback();
  };
  let batchNotifyFn = (callback) => {
    callback();
  };
  let scheduleFn = defaultScheduler;
  const schedule = (callback) => {
    if (transactions) {
      queue.push(callback);
    } else {
      scheduleFn(() => {
        notifyFn(callback);
      });
    }
  };
  const flush = () => {
    const originalQueue = queue;
    queue = [];
    if (originalQueue.length) {
      scheduleFn(() => {
        batchNotifyFn(() => {
          originalQueue.forEach((callback) => {
            notifyFn(callback);
          });
        });
      });
    }
  };
  return {
    batch: (callback) => {
      let result;
      transactions++;
      try {
        result = callback();
      } finally {
        transactions--;
        if (!transactions) {
          flush();
        }
      }
      return result;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (callback) => {
      return (...args) => {
        schedule(() => {
          callback(...args);
        });
      };
    },
    schedule,
    /**
     * Use this method to set a custom notify function.
     * This can be used to for example wrap notifications with `React.act` while running tests.
     */
    setNotifyFunction: (fn) => {
      notifyFn = fn;
    },
    /**
     * Use this method to set a custom function to batch notifications together into a single tick.
     * By default React Query will use the batch function provided by ReactDOM or React Native.
     */
    setBatchNotifyFunction: (fn) => {
      batchNotifyFn = fn;
    },
    setScheduler: (fn) => {
      scheduleFn = fn;
    }
  };
}
var notifyManager = createNotifyManager();
var OnlineManager = (_c = class extends Subscribable {
  constructor() {
    super();
    __privateAdd(this, _online, true);
    __privateAdd(this, _cleanup2);
    __privateAdd(this, _setup2);
    __privateSet(this, _setup2, (onOnline) => {
      if (typeof window !== "undefined" && window.addEventListener) {
        const onlineListener = () => onOnline(true);
        const offlineListener = () => onOnline(false);
        window.addEventListener("online", onlineListener, false);
        window.addEventListener("offline", offlineListener, false);
        return () => {
          window.removeEventListener("online", onlineListener);
          window.removeEventListener("offline", offlineListener);
        };
      }
      return;
    });
  }
  onSubscribe() {
    if (!__privateGet(this, _cleanup2)) {
      this.setEventListener(__privateGet(this, _setup2));
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _cleanup2)) == null ? void 0 : _a2.call(this);
      __privateSet(this, _cleanup2, void 0);
    }
  }
  setEventListener(setup) {
    var _a2;
    __privateSet(this, _setup2, setup);
    (_a2 = __privateGet(this, _cleanup2)) == null ? void 0 : _a2.call(this);
    __privateSet(this, _cleanup2, setup(this.setOnline.bind(this)));
  }
  setOnline(online) {
    const changed = __privateGet(this, _online) !== online;
    if (changed) {
      __privateSet(this, _online, online);
      this.listeners.forEach((listener) => {
        listener(online);
      });
    }
  }
  isOnline() {
    return __privateGet(this, _online);
  }
}, _online = new WeakMap(), _cleanup2 = new WeakMap(), _setup2 = new WeakMap(), _c);
var onlineManager = new OnlineManager();
function defaultRetryDelay(failureCount) {
  return Math.min(1e3 * 2 ** failureCount, 3e4);
}
function canFetch(networkMode) {
  return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
}
var CancelledError = class extends Error {
  constructor(options) {
    super("CancelledError");
    this.revert = options == null ? void 0 : options.revert;
    this.silent = options == null ? void 0 : options.silent;
  }
};
function createRetryer(config) {
  let isRetryCancelled = false;
  let failureCount = 0;
  let continueFn;
  const thenable = pendingThenable();
  const isResolved = () => thenable.status !== "pending";
  const cancel = (cancelOptions) => {
    var _a2;
    if (!isResolved()) {
      const error = new CancelledError(cancelOptions);
      reject(error);
      (_a2 = config.onCancel) == null ? void 0 : _a2.call(config, error);
    }
  };
  const cancelRetry = () => {
    isRetryCancelled = true;
  };
  const continueRetry = () => {
    isRetryCancelled = false;
  };
  const canContinue = () => focusManager.isFocused() && (config.networkMode === "always" || onlineManager.isOnline()) && config.canRun();
  const canStart = () => canFetch(config.networkMode) && config.canRun();
  const resolve = (value) => {
    if (!isResolved()) {
      continueFn == null ? void 0 : continueFn();
      thenable.resolve(value);
    }
  };
  const reject = (value) => {
    if (!isResolved()) {
      continueFn == null ? void 0 : continueFn();
      thenable.reject(value);
    }
  };
  const pause = () => {
    return new Promise((continueResolve) => {
      var _a2;
      continueFn = (value) => {
        if (isResolved() || canContinue()) {
          continueResolve(value);
        }
      };
      (_a2 = config.onPause) == null ? void 0 : _a2.call(config);
    }).then(() => {
      var _a2;
      continueFn = void 0;
      if (!isResolved()) {
        (_a2 = config.onContinue) == null ? void 0 : _a2.call(config);
      }
    });
  };
  const run = () => {
    if (isResolved()) {
      return;
    }
    let promiseOrValue;
    const initialPromise = failureCount === 0 ? config.initialPromise : void 0;
    try {
      promiseOrValue = initialPromise ?? config.fn();
    } catch (error) {
      promiseOrValue = Promise.reject(error);
    }
    Promise.resolve(promiseOrValue).then(resolve).catch((error) => {
      var _a2;
      if (isResolved()) {
        return;
      }
      const retry = config.retry ?? (environmentManager.isServer() ? 0 : 3);
      const retryDelay = config.retryDelay ?? defaultRetryDelay;
      const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
      const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
      if (isRetryCancelled || !shouldRetry) {
        reject(error);
        return;
      }
      failureCount++;
      (_a2 = config.onFail) == null ? void 0 : _a2.call(config, failureCount, error);
      sleep(delay).then(() => {
        return canContinue() ? void 0 : pause();
      }).then(() => {
        if (isRetryCancelled) {
          reject(error);
        } else {
          run();
        }
      });
    });
  };
  return {
    promise: thenable,
    status: () => thenable.status,
    cancel,
    continue: () => {
      continueFn == null ? void 0 : continueFn();
      return thenable;
    },
    cancelRetry,
    continueRetry,
    canStart,
    start: () => {
      if (canStart()) {
        run();
      } else {
        pause().then(run);
      }
      return thenable;
    }
  };
}
var Removable = (_d = class {
  constructor() {
    __privateAdd(this, _gcTimeout);
  }
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout();
    if (isValidTimeout(this.gcTime)) {
      __privateSet(this, _gcTimeout, timeoutManager.setTimeout(() => {
        this.optionalRemove();
      }, this.gcTime));
    }
  }
  updateGcTime(newGcTime) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      newGcTime ?? (environmentManager.isServer() ? Infinity : 5 * 60 * 1e3)
    );
  }
  clearGcTimeout() {
    if (__privateGet(this, _gcTimeout)) {
      timeoutManager.clearTimeout(__privateGet(this, _gcTimeout));
      __privateSet(this, _gcTimeout, void 0);
    }
  }
}, _gcTimeout = new WeakMap(), _d);
var Query = (_e = class extends Removable {
  constructor(config) {
    super();
    __privateAdd(this, _Query_instances);
    __privateAdd(this, _initialState);
    __privateAdd(this, _revertState);
    __privateAdd(this, _cache);
    __privateAdd(this, _client);
    __privateAdd(this, _retryer);
    __privateAdd(this, _defaultOptions);
    __privateAdd(this, _abortSignalConsumed);
    __privateSet(this, _abortSignalConsumed, false);
    __privateSet(this, _defaultOptions, config.defaultOptions);
    this.setOptions(config.options);
    this.observers = [];
    __privateSet(this, _client, config.client);
    __privateSet(this, _cache, __privateGet(this, _client).getQueryCache());
    this.queryKey = config.queryKey;
    this.queryHash = config.queryHash;
    __privateSet(this, _initialState, getDefaultState$1(this.options));
    this.state = config.state ?? __privateGet(this, _initialState);
    this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  get promise() {
    var _a2;
    return (_a2 = __privateGet(this, _retryer)) == null ? void 0 : _a2.promise;
  }
  setOptions(options) {
    this.options = { ...__privateGet(this, _defaultOptions), ...options };
    this.updateGcTime(this.options.gcTime);
    if (this.state && this.state.data === void 0) {
      const defaultState = getDefaultState$1(this.options);
      if (defaultState.data !== void 0) {
        this.setState(
          successState(defaultState.data, defaultState.dataUpdatedAt)
        );
        __privateSet(this, _initialState, defaultState);
      }
    }
  }
  optionalRemove() {
    if (!this.observers.length && this.state.fetchStatus === "idle") {
      __privateGet(this, _cache).remove(this);
    }
  }
  setData(newData, options) {
    const data = replaceData(this.state.data, newData, this.options);
    __privateMethod(this, _Query_instances, dispatch_fn).call(this, {
      data,
      type: "success",
      dataUpdatedAt: options == null ? void 0 : options.updatedAt,
      manual: options == null ? void 0 : options.manual
    });
    return data;
  }
  setState(state, setStateOptions) {
    __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "setState", state, setStateOptions });
  }
  cancel(options) {
    var _a2, _b2;
    const promise = (_a2 = __privateGet(this, _retryer)) == null ? void 0 : _a2.promise;
    (_b2 = __privateGet(this, _retryer)) == null ? void 0 : _b2.cancel(options);
    return promise ? promise.then(noop$6).catch(noop$6) : Promise.resolve();
  }
  destroy() {
    super.destroy();
    this.cancel({ silent: true });
  }
  get resetState() {
    return __privateGet(this, _initialState);
  }
  reset() {
    this.destroy();
    this.setState(this.resetState);
  }
  isActive() {
    return this.observers.some(
      (observer) => resolveEnabled(observer.options.enabled, this) !== false
    );
  }
  isDisabled() {
    if (this.getObserversCount() > 0) {
      return !this.isActive();
    }
    return this.options.queryFn === skipToken || !this.isFetched();
  }
  isFetched() {
    return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
  }
  isStatic() {
    if (this.getObserversCount() > 0) {
      return this.observers.some(
        (observer) => resolveStaleTime(observer.options.staleTime, this) === "static"
      );
    }
    return false;
  }
  isStale() {
    if (this.getObserversCount() > 0) {
      return this.observers.some(
        (observer) => observer.getCurrentResult().isStale
      );
    }
    return this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(staleTime = 0) {
    if (this.state.data === void 0) {
      return true;
    }
    if (staleTime === "static") {
      return false;
    }
    if (this.state.isInvalidated) {
      return true;
    }
    return !timeUntilStale(this.state.dataUpdatedAt, staleTime);
  }
  onFocus() {
    var _a2;
    const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus());
    observer == null ? void 0 : observer.refetch({ cancelRefetch: false });
    (_a2 = __privateGet(this, _retryer)) == null ? void 0 : _a2.continue();
  }
  onOnline() {
    var _a2;
    const observer = this.observers.find((x) => x.shouldFetchOnReconnect());
    observer == null ? void 0 : observer.refetch({ cancelRefetch: false });
    (_a2 = __privateGet(this, _retryer)) == null ? void 0 : _a2.continue();
  }
  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      this.clearGcTimeout();
      __privateGet(this, _cache).notify({ type: "observerAdded", query: this, observer });
    }
  }
  removeObserver(observer) {
    if (this.observers.includes(observer)) {
      this.observers = this.observers.filter((x) => x !== observer);
      if (!this.observers.length) {
        if (__privateGet(this, _retryer)) {
          if (__privateGet(this, _abortSignalConsumed) || __privateMethod(this, _Query_instances, isInitialPausedFetch_fn).call(this)) {
            __privateGet(this, _retryer).cancel({ revert: true });
          } else {
            __privateGet(this, _retryer).cancelRetry();
          }
        }
        this.scheduleGc();
      }
      __privateGet(this, _cache).notify({ type: "observerRemoved", query: this, observer });
    }
  }
  getObserversCount() {
    return this.observers.length;
  }
  invalidate() {
    if (!this.state.isInvalidated) {
      __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "invalidate" });
    }
  }
  async fetch(options, fetchOptions) {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j, _k, _l;
    if (this.state.fetchStatus !== "idle" && // If the promise in the retryer is already rejected, we have to definitely
    // re-start the fetch; there is a chance that the query is still in a
    // pending state when that happens
    ((_a2 = __privateGet(this, _retryer)) == null ? void 0 : _a2.status()) !== "rejected") {
      if (this.state.data !== void 0 && (fetchOptions == null ? void 0 : fetchOptions.cancelRefetch)) {
        this.cancel({ silent: true });
      } else if (__privateGet(this, _retryer)) {
        __privateGet(this, _retryer).continueRetry();
        return __privateGet(this, _retryer).promise;
      }
    }
    if (options) {
      this.setOptions(options);
    }
    if (!this.options.queryFn) {
      const observer = this.observers.find((x) => x.options.queryFn);
      if (observer) {
        this.setOptions(observer.options);
      }
    }
    const abortController = new AbortController();
    const addSignalProperty = (object) => {
      Object.defineProperty(object, "signal", {
        enumerable: true,
        get: () => {
          __privateSet(this, _abortSignalConsumed, true);
          return abortController.signal;
        }
      });
    };
    const fetchFn = () => {
      const queryFn = ensureQueryFn(this.options, fetchOptions);
      const createQueryFnContext = () => {
        const queryFnContext2 = {
          client: __privateGet(this, _client),
          queryKey: this.queryKey,
          meta: this.meta
        };
        addSignalProperty(queryFnContext2);
        return queryFnContext2;
      };
      const queryFnContext = createQueryFnContext();
      __privateSet(this, _abortSignalConsumed, false);
      if (this.options.persister) {
        return this.options.persister(
          queryFn,
          queryFnContext,
          this
        );
      }
      return queryFn(queryFnContext);
    };
    const createFetchContext = () => {
      const context2 = {
        fetchOptions,
        options: this.options,
        queryKey: this.queryKey,
        client: __privateGet(this, _client),
        state: this.state,
        fetchFn
      };
      addSignalProperty(context2);
      return context2;
    };
    const context = createFetchContext();
    (_b2 = this.options.behavior) == null ? void 0 : _b2.onFetch(context, this);
    __privateSet(this, _revertState, this.state);
    if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== ((_c2 = context.fetchOptions) == null ? void 0 : _c2.meta)) {
      __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "fetch", meta: (_d2 = context.fetchOptions) == null ? void 0 : _d2.meta });
    }
    __privateSet(this, _retryer, createRetryer({
      initialPromise: fetchOptions == null ? void 0 : fetchOptions.initialPromise,
      fn: context.fetchFn,
      onCancel: (error) => {
        if (error instanceof CancelledError && error.revert) {
          this.setState({
            ...__privateGet(this, _revertState),
            fetchStatus: "idle"
          });
        }
        abortController.abort();
      },
      onFail: (failureCount, error) => {
        __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "failed", failureCount, error });
      },
      onPause: () => {
        __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "pause" });
      },
      onContinue: () => {
        __privateMethod(this, _Query_instances, dispatch_fn).call(this, { type: "continue" });
      },
      retry: context.options.retry,
      retryDelay: context.options.retryDelay,
      networkMode: context.options.networkMode,
      canRun: () => true
    }));
    try {
      const data = await __privateGet(this, _retryer).start();
      if (data === void 0) {
        if (false) ;
        throw new Error(`${this.queryHash} data is undefined`);
      }
      this.setData(data);
      (_f2 = (_e2 = __privateGet(this, _cache).config).onSuccess) == null ? void 0 : _f2.call(_e2, data, this);
      (_h2 = (_g2 = __privateGet(this, _cache).config).onSettled) == null ? void 0 : _h2.call(
        _g2,
        data,
        this.state.error,
        this
      );
      return data;
    } catch (error) {
      if (error instanceof CancelledError) {
        if (error.silent) {
          return __privateGet(this, _retryer).promise;
        } else if (error.revert) {
          if (this.state.data === void 0) {
            throw error;
          }
          return this.state.data;
        }
      }
      __privateMethod(this, _Query_instances, dispatch_fn).call(this, {
        type: "error",
        error
      });
      (_j = (_i2 = __privateGet(this, _cache).config).onError) == null ? void 0 : _j.call(
        _i2,
        error,
        this
      );
      (_l = (_k = __privateGet(this, _cache).config).onSettled) == null ? void 0 : _l.call(
        _k,
        this.state.data,
        error,
        this
      );
      throw error;
    } finally {
      this.scheduleGc();
    }
  }
}, _initialState = new WeakMap(), _revertState = new WeakMap(), _cache = new WeakMap(), _client = new WeakMap(), _retryer = new WeakMap(), _defaultOptions = new WeakMap(), _abortSignalConsumed = new WeakMap(), _Query_instances = new WeakSet(), isInitialPausedFetch_fn = function() {
  return this.state.fetchStatus === "paused" && this.state.status === "pending";
}, dispatch_fn = function(action) {
  const reducer = (state) => {
    switch (action.type) {
      case "failed":
        return {
          ...state,
          fetchFailureCount: action.failureCount,
          fetchFailureReason: action.error
        };
      case "pause":
        return {
          ...state,
          fetchStatus: "paused"
        };
      case "continue":
        return {
          ...state,
          fetchStatus: "fetching"
        };
      case "fetch":
        return {
          ...state,
          ...fetchState(state.data, this.options),
          fetchMeta: action.meta ?? null
        };
      case "success":
        const newState = {
          ...state,
          ...successState(action.data, action.dataUpdatedAt),
          dataUpdateCount: state.dataUpdateCount + 1,
          ...!action.manual && {
            fetchStatus: "idle",
            fetchFailureCount: 0,
            fetchFailureReason: null
          }
        };
        __privateSet(this, _revertState, action.manual ? newState : void 0);
        return newState;
      case "error":
        const error = action.error;
        return {
          ...state,
          error,
          errorUpdateCount: state.errorUpdateCount + 1,
          errorUpdatedAt: Date.now(),
          fetchFailureCount: state.fetchFailureCount + 1,
          fetchFailureReason: error,
          fetchStatus: "idle",
          status: "error",
          // flag existing data as invalidated if we get a background error
          // note that "no data" always means stale so we can set unconditionally here
          isInvalidated: true
        };
      case "invalidate":
        return {
          ...state,
          isInvalidated: true
        };
      case "setState":
        return {
          ...state,
          ...action.state
        };
    }
  };
  this.state = reducer(this.state);
  notifyManager.batch(() => {
    this.observers.forEach((observer) => {
      observer.onQueryUpdate();
    });
    __privateGet(this, _cache).notify({ query: this, type: "updated", action });
  });
}, _e);
function fetchState(data, options) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
    ...data === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function successState(data, dataUpdatedAt) {
  return {
    data,
    dataUpdatedAt: dataUpdatedAt ?? Date.now(),
    error: null,
    isInvalidated: false,
    status: "success"
  };
}
function getDefaultState$1(options) {
  const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
  const hasData = data !== void 0;
  const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
  return {
    data,
    dataUpdateCount: 0,
    dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: false,
    status: hasData ? "success" : "pending",
    fetchStatus: "idle"
  };
}
function infiniteQueryBehavior(pages) {
  return {
    onFetch: (context, query) => {
      var _a2, _b2, _c2, _d2, _e2;
      const options = context.options;
      const direction = (_c2 = (_b2 = (_a2 = context.fetchOptions) == null ? void 0 : _a2.meta) == null ? void 0 : _b2.fetchMore) == null ? void 0 : _c2.direction;
      const oldPages = ((_d2 = context.state.data) == null ? void 0 : _d2.pages) || [];
      const oldPageParams = ((_e2 = context.state.data) == null ? void 0 : _e2.pageParams) || [];
      let result = { pages: [], pageParams: [] };
      let currentPage = 0;
      const fetchFn = async () => {
        let cancelled = false;
        const addSignalProperty = (object) => {
          addConsumeAwareSignal(
            object,
            () => context.signal,
            () => cancelled = true
          );
        };
        const queryFn = ensureQueryFn(context.options, context.fetchOptions);
        const fetchPage = async (data, param, previous) => {
          if (cancelled) {
            return Promise.reject();
          }
          if (param == null && data.pages.length) {
            return Promise.resolve(data);
          }
          const createQueryFnContext = () => {
            const queryFnContext2 = {
              client: context.client,
              queryKey: context.queryKey,
              pageParam: param,
              direction: previous ? "backward" : "forward",
              meta: context.options.meta
            };
            addSignalProperty(queryFnContext2);
            return queryFnContext2;
          };
          const queryFnContext = createQueryFnContext();
          const page = await queryFn(queryFnContext);
          const { maxPages } = context.options;
          const addTo = previous ? addToStart : addToEnd;
          return {
            pages: addTo(data.pages, page, maxPages),
            pageParams: addTo(data.pageParams, param, maxPages)
          };
        };
        if (direction && oldPages.length) {
          const previous = direction === "backward";
          const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
          const oldData = {
            pages: oldPages,
            pageParams: oldPageParams
          };
          const param = pageParamFn(options, oldData);
          result = await fetchPage(oldData, param, previous);
        } else {
          const remainingPages = pages ?? oldPages.length;
          do {
            const param = currentPage === 0 ? oldPageParams[0] ?? options.initialPageParam : getNextPageParam(options, result);
            if (currentPage > 0 && param == null) {
              break;
            }
            result = await fetchPage(result, param);
            currentPage++;
          } while (currentPage < remainingPages);
        }
        return result;
      };
      if (context.options.persister) {
        context.fetchFn = () => {
          var _a3, _b3;
          return (_b3 = (_a3 = context.options).persister) == null ? void 0 : _b3.call(
            _a3,
            fetchFn,
            {
              client: context.client,
              queryKey: context.queryKey,
              meta: context.options.meta,
              signal: context.signal
            },
            query
          );
        };
      } else {
        context.fetchFn = fetchFn;
      }
    }
  };
}
function getNextPageParam(options, { pages, pageParams }) {
  const lastIndex = pages.length - 1;
  return pages.length > 0 ? options.getNextPageParam(
    pages[lastIndex],
    pages,
    pageParams[lastIndex],
    pageParams
  ) : void 0;
}
function getPreviousPageParam(options, { pages, pageParams }) {
  var _a2;
  return pages.length > 0 ? (_a2 = options.getPreviousPageParam) == null ? void 0 : _a2.call(options, pages[0], pages, pageParams[0], pageParams) : void 0;
}
var Mutation = (_f = class extends Removable {
  constructor(config) {
    super();
    __privateAdd(this, _Mutation_instances);
    __privateAdd(this, _client2);
    __privateAdd(this, _observers);
    __privateAdd(this, _mutationCache);
    __privateAdd(this, _retryer2);
    __privateSet(this, _client2, config.client);
    this.mutationId = config.mutationId;
    __privateSet(this, _mutationCache, config.mutationCache);
    __privateSet(this, _observers, []);
    this.state = config.state || getDefaultState();
    this.setOptions(config.options);
    this.scheduleGc();
  }
  setOptions(options) {
    this.options = options;
    this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(observer) {
    if (!__privateGet(this, _observers).includes(observer)) {
      __privateGet(this, _observers).push(observer);
      this.clearGcTimeout();
      __privateGet(this, _mutationCache).notify({
        type: "observerAdded",
        mutation: this,
        observer
      });
    }
  }
  removeObserver(observer) {
    __privateSet(this, _observers, __privateGet(this, _observers).filter((x) => x !== observer));
    this.scheduleGc();
    __privateGet(this, _mutationCache).notify({
      type: "observerRemoved",
      mutation: this,
      observer
    });
  }
  optionalRemove() {
    if (!__privateGet(this, _observers).length) {
      if (this.state.status === "pending") {
        this.scheduleGc();
      } else {
        __privateGet(this, _mutationCache).remove(this);
      }
    }
  }
  continue() {
    var _a2;
    return ((_a2 = __privateGet(this, _retryer2)) == null ? void 0 : _a2.continue()) ?? // continuing a mutation assumes that variables are set, mutation must have been dehydrated before
    this.execute(this.state.variables);
  }
  async execute(variables) {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    const onContinue = () => {
      __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, { type: "continue" });
    };
    const mutationFnContext = {
      client: __privateGet(this, _client2),
      meta: this.options.meta,
      mutationKey: this.options.mutationKey
    };
    __privateSet(this, _retryer2, createRetryer({
      fn: () => {
        if (!this.options.mutationFn) {
          return Promise.reject(new Error("No mutationFn found"));
        }
        return this.options.mutationFn(variables, mutationFnContext);
      },
      onFail: (failureCount, error) => {
        __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, { type: "failed", failureCount, error });
      },
      onPause: () => {
        __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, { type: "pause" });
      },
      onContinue,
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => __privateGet(this, _mutationCache).canRun(this)
    }));
    const restored = this.state.status === "pending";
    const isPaused = !__privateGet(this, _retryer2).canStart();
    try {
      if (restored) {
        onContinue();
      } else {
        __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, { type: "pending", variables, isPaused });
        if (__privateGet(this, _mutationCache).config.onMutate) {
          await __privateGet(this, _mutationCache).config.onMutate(
            variables,
            this,
            mutationFnContext
          );
        }
        const context = await ((_b2 = (_a2 = this.options).onMutate) == null ? void 0 : _b2.call(
          _a2,
          variables,
          mutationFnContext
        ));
        if (context !== this.state.context) {
          __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, {
            type: "pending",
            context,
            variables,
            isPaused
          });
        }
      }
      const data = await __privateGet(this, _retryer2).start();
      await ((_d2 = (_c2 = __privateGet(this, _mutationCache).config).onSuccess) == null ? void 0 : _d2.call(
        _c2,
        data,
        variables,
        this.state.context,
        this,
        mutationFnContext
      ));
      await ((_f2 = (_e2 = this.options).onSuccess) == null ? void 0 : _f2.call(
        _e2,
        data,
        variables,
        this.state.context,
        mutationFnContext
      ));
      await ((_h2 = (_g2 = __privateGet(this, _mutationCache).config).onSettled) == null ? void 0 : _h2.call(
        _g2,
        data,
        null,
        this.state.variables,
        this.state.context,
        this,
        mutationFnContext
      ));
      await ((_j = (_i2 = this.options).onSettled) == null ? void 0 : _j.call(
        _i2,
        data,
        null,
        variables,
        this.state.context,
        mutationFnContext
      ));
      __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, { type: "success", data });
      return data;
    } catch (error) {
      try {
        await ((_l = (_k = __privateGet(this, _mutationCache).config).onError) == null ? void 0 : _l.call(
          _k,
          error,
          variables,
          this.state.context,
          this,
          mutationFnContext
        ));
      } catch (e) {
        void Promise.reject(e);
      }
      try {
        await ((_n = (_m = this.options).onError) == null ? void 0 : _n.call(
          _m,
          error,
          variables,
          this.state.context,
          mutationFnContext
        ));
      } catch (e) {
        void Promise.reject(e);
      }
      try {
        await ((_p = (_o = __privateGet(this, _mutationCache).config).onSettled) == null ? void 0 : _p.call(
          _o,
          void 0,
          error,
          this.state.variables,
          this.state.context,
          this,
          mutationFnContext
        ));
      } catch (e) {
        void Promise.reject(e);
      }
      try {
        await ((_r = (_q = this.options).onSettled) == null ? void 0 : _r.call(
          _q,
          void 0,
          error,
          variables,
          this.state.context,
          mutationFnContext
        ));
      } catch (e) {
        void Promise.reject(e);
      }
      __privateMethod(this, _Mutation_instances, dispatch_fn2).call(this, { type: "error", error });
      throw error;
    } finally {
      __privateGet(this, _mutationCache).runNext(this);
    }
  }
}, _client2 = new WeakMap(), _observers = new WeakMap(), _mutationCache = new WeakMap(), _retryer2 = new WeakMap(), _Mutation_instances = new WeakSet(), dispatch_fn2 = function(action) {
  const reducer = (state) => {
    switch (action.type) {
      case "failed":
        return {
          ...state,
          failureCount: action.failureCount,
          failureReason: action.error
        };
      case "pause":
        return {
          ...state,
          isPaused: true
        };
      case "continue":
        return {
          ...state,
          isPaused: false
        };
      case "pending":
        return {
          ...state,
          context: action.context,
          data: void 0,
          failureCount: 0,
          failureReason: null,
          error: null,
          isPaused: action.isPaused,
          status: "pending",
          variables: action.variables,
          submittedAt: Date.now()
        };
      case "success":
        return {
          ...state,
          data: action.data,
          failureCount: 0,
          failureReason: null,
          error: null,
          status: "success",
          isPaused: false
        };
      case "error":
        return {
          ...state,
          data: void 0,
          error: action.error,
          failureCount: state.failureCount + 1,
          failureReason: action.error,
          isPaused: false,
          status: "error"
        };
    }
  };
  this.state = reducer(this.state);
  notifyManager.batch(() => {
    __privateGet(this, _observers).forEach((observer) => {
      observer.onMutationUpdate(action);
    });
    __privateGet(this, _mutationCache).notify({
      mutation: this,
      type: "updated",
      action
    });
  });
}, _f);
function getDefaultState() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}
var MutationCache = (_g = class extends Subscribable {
  constructor(config = {}) {
    super();
    __privateAdd(this, _mutations);
    __privateAdd(this, _scopes);
    __privateAdd(this, _mutationId);
    this.config = config;
    __privateSet(this, _mutations, /* @__PURE__ */ new Set());
    __privateSet(this, _scopes, /* @__PURE__ */ new Map());
    __privateSet(this, _mutationId, 0);
  }
  build(client2, options, state) {
    const mutation = new Mutation({
      client: client2,
      mutationCache: this,
      mutationId: ++__privateWrapper(this, _mutationId)._,
      options: client2.defaultMutationOptions(options),
      state
    });
    this.add(mutation);
    return mutation;
  }
  add(mutation) {
    __privateGet(this, _mutations).add(mutation);
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const scopedMutations = __privateGet(this, _scopes).get(scope);
      if (scopedMutations) {
        scopedMutations.push(mutation);
      } else {
        __privateGet(this, _scopes).set(scope, [mutation]);
      }
    }
    this.notify({ type: "added", mutation });
  }
  remove(mutation) {
    if (__privateGet(this, _mutations).delete(mutation)) {
      const scope = scopeFor(mutation);
      if (typeof scope === "string") {
        const scopedMutations = __privateGet(this, _scopes).get(scope);
        if (scopedMutations) {
          if (scopedMutations.length > 1) {
            const index2 = scopedMutations.indexOf(mutation);
            if (index2 !== -1) {
              scopedMutations.splice(index2, 1);
            }
          } else if (scopedMutations[0] === mutation) {
            __privateGet(this, _scopes).delete(scope);
          }
        }
      }
    }
    this.notify({ type: "removed", mutation });
  }
  canRun(mutation) {
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const mutationsWithSameScope = __privateGet(this, _scopes).get(scope);
      const firstPendingMutation = mutationsWithSameScope == null ? void 0 : mutationsWithSameScope.find(
        (m) => m.state.status === "pending"
      );
      return !firstPendingMutation || firstPendingMutation === mutation;
    } else {
      return true;
    }
  }
  runNext(mutation) {
    var _a2;
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const foundMutation = (_a2 = __privateGet(this, _scopes).get(scope)) == null ? void 0 : _a2.find((m) => m !== mutation && m.state.isPaused);
      return (foundMutation == null ? void 0 : foundMutation.continue()) ?? Promise.resolve();
    } else {
      return Promise.resolve();
    }
  }
  clear() {
    notifyManager.batch(() => {
      __privateGet(this, _mutations).forEach((mutation) => {
        this.notify({ type: "removed", mutation });
      });
      __privateGet(this, _mutations).clear();
      __privateGet(this, _scopes).clear();
    });
  }
  getAll() {
    return Array.from(__privateGet(this, _mutations));
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (mutation) => matchMutation(defaultedFilters, mutation)
    );
  }
  findAll(filters = {}) {
    return this.getAll().filter((mutation) => matchMutation(filters, mutation));
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  resumePausedMutations() {
    const pausedMutations = this.getAll().filter((x) => x.state.isPaused);
    return notifyManager.batch(
      () => Promise.all(
        pausedMutations.map((mutation) => mutation.continue().catch(noop$6))
      )
    );
  }
}, _mutations = new WeakMap(), _scopes = new WeakMap(), _mutationId = new WeakMap(), _g);
function scopeFor(mutation) {
  var _a2;
  return (_a2 = mutation.options.scope) == null ? void 0 : _a2.id;
}
var QueryCache = (_h = class extends Subscribable {
  constructor(config = {}) {
    super();
    __privateAdd(this, _queries);
    this.config = config;
    __privateSet(this, _queries, /* @__PURE__ */ new Map());
  }
  build(client2, options, state) {
    const queryKey = options.queryKey;
    const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
    let query = this.get(queryHash);
    if (!query) {
      query = new Query({
        client: client2,
        queryKey,
        queryHash,
        options: client2.defaultQueryOptions(options),
        state,
        defaultOptions: client2.getQueryDefaults(queryKey)
      });
      this.add(query);
    }
    return query;
  }
  add(query) {
    if (!__privateGet(this, _queries).has(query.queryHash)) {
      __privateGet(this, _queries).set(query.queryHash, query);
      this.notify({
        type: "added",
        query
      });
    }
  }
  remove(query) {
    const queryInMap = __privateGet(this, _queries).get(query.queryHash);
    if (queryInMap) {
      query.destroy();
      if (queryInMap === query) {
        __privateGet(this, _queries).delete(query.queryHash);
      }
      this.notify({ type: "removed", query });
    }
  }
  clear() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        this.remove(query);
      });
    });
  }
  get(queryHash) {
    return __privateGet(this, _queries).get(queryHash);
  }
  getAll() {
    return [...__privateGet(this, _queries).values()];
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (query) => matchQuery(defaultedFilters, query)
    );
  }
  findAll(filters = {}) {
    const queries = this.getAll();
    return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  onFocus() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onFocus();
      });
    });
  }
  onOnline() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onOnline();
      });
    });
  }
}, _queries = new WeakMap(), _h);
var QueryClient = (_i = class {
  constructor(config = {}) {
    __privateAdd(this, _queryCache);
    __privateAdd(this, _mutationCache2);
    __privateAdd(this, _defaultOptions2);
    __privateAdd(this, _queryDefaults);
    __privateAdd(this, _mutationDefaults);
    __privateAdd(this, _mountCount);
    __privateAdd(this, _unsubscribeFocus);
    __privateAdd(this, _unsubscribeOnline);
    __privateSet(this, _queryCache, config.queryCache || new QueryCache());
    __privateSet(this, _mutationCache2, config.mutationCache || new MutationCache());
    __privateSet(this, _defaultOptions2, config.defaultOptions || {});
    __privateSet(this, _queryDefaults, /* @__PURE__ */ new Map());
    __privateSet(this, _mutationDefaults, /* @__PURE__ */ new Map());
    __privateSet(this, _mountCount, 0);
  }
  mount() {
    __privateWrapper(this, _mountCount)._++;
    if (__privateGet(this, _mountCount) !== 1) return;
    __privateSet(this, _unsubscribeFocus, focusManager.subscribe(async (focused) => {
      if (focused) {
        await this.resumePausedMutations();
        __privateGet(this, _queryCache).onFocus();
      }
    }));
    __privateSet(this, _unsubscribeOnline, onlineManager.subscribe(async (online) => {
      if (online) {
        await this.resumePausedMutations();
        __privateGet(this, _queryCache).onOnline();
      }
    }));
  }
  unmount() {
    var _a2, _b2;
    __privateWrapper(this, _mountCount)._--;
    if (__privateGet(this, _mountCount) !== 0) return;
    (_a2 = __privateGet(this, _unsubscribeFocus)) == null ? void 0 : _a2.call(this);
    __privateSet(this, _unsubscribeFocus, void 0);
    (_b2 = __privateGet(this, _unsubscribeOnline)) == null ? void 0 : _b2.call(this);
    __privateSet(this, _unsubscribeOnline, void 0);
  }
  isFetching(filters) {
    return __privateGet(this, _queryCache).findAll({ ...filters, fetchStatus: "fetching" }).length;
  }
  isMutating(filters) {
    return __privateGet(this, _mutationCache2).findAll({ ...filters, status: "pending" }).length;
  }
  /**
   * Imperative (non-reactive) way to retrieve data for a QueryKey.
   * Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
   *
   * Hint: Do not use this function inside a component, because it won't receive updates.
   * Use `useQuery` to create a `QueryObserver` that subscribes to changes.
   */
  getQueryData(queryKey) {
    var _a2;
    const options = this.defaultQueryOptions({ queryKey });
    return (_a2 = __privateGet(this, _queryCache).get(options.queryHash)) == null ? void 0 : _a2.state.data;
  }
  ensureQueryData(options) {
    const defaultedOptions = this.defaultQueryOptions(options);
    const query = __privateGet(this, _queryCache).build(this, defaultedOptions);
    const cachedData = query.state.data;
    if (cachedData === void 0) {
      return this.fetchQuery(options);
    }
    if (options.revalidateIfStale && query.isStaleByTime(resolveStaleTime(defaultedOptions.staleTime, query))) {
      void this.prefetchQuery(defaultedOptions);
    }
    return Promise.resolve(cachedData);
  }
  getQueriesData(filters) {
    return __privateGet(this, _queryCache).findAll(filters).map(({ queryKey, state }) => {
      const data = state.data;
      return [queryKey, data];
    });
  }
  setQueryData(queryKey, updater, options) {
    const defaultedOptions = this.defaultQueryOptions({ queryKey });
    const query = __privateGet(this, _queryCache).get(
      defaultedOptions.queryHash
    );
    const prevData = query == null ? void 0 : query.state.data;
    const data = functionalUpdate(updater, prevData);
    if (data === void 0) {
      return void 0;
    }
    return __privateGet(this, _queryCache).build(this, defaultedOptions).setData(data, { ...options, manual: true });
  }
  setQueriesData(filters, updater, options) {
    return notifyManager.batch(
      () => __privateGet(this, _queryCache).findAll(filters).map(({ queryKey }) => [
        queryKey,
        this.setQueryData(queryKey, updater, options)
      ])
    );
  }
  getQueryState(queryKey) {
    var _a2;
    const options = this.defaultQueryOptions({ queryKey });
    return (_a2 = __privateGet(this, _queryCache).get(
      options.queryHash
    )) == null ? void 0 : _a2.state;
  }
  removeQueries(filters) {
    const queryCache = __privateGet(this, _queryCache);
    notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        queryCache.remove(query);
      });
    });
  }
  resetQueries(filters, options) {
    const queryCache = __privateGet(this, _queryCache);
    return notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        query.reset();
      });
      return this.refetchQueries(
        {
          type: "active",
          ...filters
        },
        options
      );
    });
  }
  cancelQueries(filters, cancelOptions = {}) {
    const defaultedCancelOptions = { revert: true, ...cancelOptions };
    const promises = notifyManager.batch(
      () => __privateGet(this, _queryCache).findAll(filters).map((query) => query.cancel(defaultedCancelOptions))
    );
    return Promise.all(promises).then(noop$6).catch(noop$6);
  }
  invalidateQueries(filters, options = {}) {
    return notifyManager.batch(() => {
      __privateGet(this, _queryCache).findAll(filters).forEach((query) => {
        query.invalidate();
      });
      if ((filters == null ? void 0 : filters.refetchType) === "none") {
        return Promise.resolve();
      }
      return this.refetchQueries(
        {
          ...filters,
          type: (filters == null ? void 0 : filters.refetchType) ?? (filters == null ? void 0 : filters.type) ?? "active"
        },
        options
      );
    });
  }
  refetchQueries(filters, options = {}) {
    const fetchOptions = {
      ...options,
      cancelRefetch: options.cancelRefetch ?? true
    };
    const promises = notifyManager.batch(
      () => __privateGet(this, _queryCache).findAll(filters).filter((query) => !query.isDisabled() && !query.isStatic()).map((query) => {
        let promise = query.fetch(void 0, fetchOptions);
        if (!fetchOptions.throwOnError) {
          promise = promise.catch(noop$6);
        }
        return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
      })
    );
    return Promise.all(promises).then(noop$6);
  }
  fetchQuery(options) {
    const defaultedOptions = this.defaultQueryOptions(options);
    if (defaultedOptions.retry === void 0) {
      defaultedOptions.retry = false;
    }
    const query = __privateGet(this, _queryCache).build(this, defaultedOptions);
    return query.isStaleByTime(
      resolveStaleTime(defaultedOptions.staleTime, query)
    ) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
  }
  prefetchQuery(options) {
    return this.fetchQuery(options).then(noop$6).catch(noop$6);
  }
  fetchInfiniteQuery(options) {
    options.behavior = infiniteQueryBehavior(options.pages);
    return this.fetchQuery(options);
  }
  prefetchInfiniteQuery(options) {
    return this.fetchInfiniteQuery(options).then(noop$6).catch(noop$6);
  }
  ensureInfiniteQueryData(options) {
    options.behavior = infiniteQueryBehavior(options.pages);
    return this.ensureQueryData(options);
  }
  resumePausedMutations() {
    if (onlineManager.isOnline()) {
      return __privateGet(this, _mutationCache2).resumePausedMutations();
    }
    return Promise.resolve();
  }
  getQueryCache() {
    return __privateGet(this, _queryCache);
  }
  getMutationCache() {
    return __privateGet(this, _mutationCache2);
  }
  getDefaultOptions() {
    return __privateGet(this, _defaultOptions2);
  }
  setDefaultOptions(options) {
    __privateSet(this, _defaultOptions2, options);
  }
  setQueryDefaults(queryKey, options) {
    __privateGet(this, _queryDefaults).set(hashKey(queryKey), {
      queryKey,
      defaultOptions: options
    });
  }
  getQueryDefaults(queryKey) {
    const defaults = [...__privateGet(this, _queryDefaults).values()];
    const result = {};
    defaults.forEach((queryDefault) => {
      if (partialMatchKey(queryKey, queryDefault.queryKey)) {
        Object.assign(result, queryDefault.defaultOptions);
      }
    });
    return result;
  }
  setMutationDefaults(mutationKey, options) {
    __privateGet(this, _mutationDefaults).set(hashKey(mutationKey), {
      mutationKey,
      defaultOptions: options
    });
  }
  getMutationDefaults(mutationKey) {
    const defaults = [...__privateGet(this, _mutationDefaults).values()];
    const result = {};
    defaults.forEach((queryDefault) => {
      if (partialMatchKey(mutationKey, queryDefault.mutationKey)) {
        Object.assign(result, queryDefault.defaultOptions);
      }
    });
    return result;
  }
  defaultQueryOptions(options) {
    if (options._defaulted) {
      return options;
    }
    const defaultedOptions = {
      ...__privateGet(this, _defaultOptions2).queries,
      ...this.getQueryDefaults(options.queryKey),
      ...options,
      _defaulted: true
    };
    if (!defaultedOptions.queryHash) {
      defaultedOptions.queryHash = hashQueryKeyByOptions(
        defaultedOptions.queryKey,
        defaultedOptions
      );
    }
    if (defaultedOptions.refetchOnReconnect === void 0) {
      defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
    }
    if (defaultedOptions.throwOnError === void 0) {
      defaultedOptions.throwOnError = !!defaultedOptions.suspense;
    }
    if (!defaultedOptions.networkMode && defaultedOptions.persister) {
      defaultedOptions.networkMode = "offlineFirst";
    }
    if (defaultedOptions.queryFn === skipToken) {
      defaultedOptions.enabled = false;
    }
    return defaultedOptions;
  }
  defaultMutationOptions(options) {
    if (options == null ? void 0 : options._defaulted) {
      return options;
    }
    return {
      ...__privateGet(this, _defaultOptions2).mutations,
      ...(options == null ? void 0 : options.mutationKey) && this.getMutationDefaults(options.mutationKey),
      ...options,
      _defaulted: true
    };
  }
  clear() {
    __privateGet(this, _queryCache).clear();
    __privateGet(this, _mutationCache2).clear();
  }
}, _queryCache = new WeakMap(), _mutationCache2 = new WeakMap(), _defaultOptions2 = new WeakMap(), _queryDefaults = new WeakMap(), _mutationDefaults = new WeakMap(), _mountCount = new WeakMap(), _unsubscribeFocus = new WeakMap(), _unsubscribeOnline = new WeakMap(), _i);
var react = { exports: {} };
var react_production = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var REACT_ELEMENT_TYPE$1 = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE$2 = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE$1 = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE$1 = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE$1 = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE$1 = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE$1 = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE$1 = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE$1 = Symbol.for("react.suspense"), REACT_MEMO_TYPE$1 = Symbol.for("react.memo"), REACT_LAZY_TYPE$1 = Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL$1 = Symbol.iterator;
function getIteratorFn$1(maybeIterable) {
  if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
  maybeIterable = MAYBE_ITERATOR_SYMBOL$1 && maybeIterable[MAYBE_ITERATOR_SYMBOL$1] || maybeIterable["@@iterator"];
  return "function" === typeof maybeIterable ? maybeIterable : null;
}
var ReactNoopUpdateQueue = {
  isMounted: function() {
    return false;
  },
  enqueueForceUpdate: function() {
  },
  enqueueReplaceState: function() {
  },
  enqueueSetState: function() {
  }
}, assign$1 = Object.assign, emptyObject = {};
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
Component.prototype.isReactComponent = {};
Component.prototype.setState = function(partialState, callback) {
  if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
    throw Error(
      "takes an object of state variables to update or a function which returns an object of state variables."
    );
  this.updater.enqueueSetState(this, partialState, callback, "setState");
};
Component.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
};
function ComponentDummy() {
}
ComponentDummy.prototype = Component.prototype;
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
assign$1(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;
var isArrayImpl$1 = Array.isArray, ReactSharedInternals$2 = { H: null, A: null, T: null, S: null, V: null }, hasOwnProperty$1 = Object.prototype.hasOwnProperty;
function ReactElement(type, key, self, source, owner, props) {
  self = props.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE$1,
    type,
    key,
    ref: void 0 !== self ? self : null,
    props
  };
}
function cloneAndReplaceKey(oldElement, newKey) {
  return ReactElement(
    oldElement.type,
    newKey,
    void 0,
    void 0,
    void 0,
    oldElement.props
  );
}
function isValidElement(object) {
  return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE$1;
}
function escape(key) {
  var escaperLookup = { "=": "=0", ":": "=2" };
  return "$" + key.replace(/[=:]/g, function(match) {
    return escaperLookup[match];
  });
}
var userProvidedKeyEscapeRegex = /\/+/g;
function getElementKey(element, index2) {
  return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index2.toString(36);
}
function noop$1$1() {
}
function resolveThenable(thenable) {
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenable.reason;
    default:
      switch ("string" === typeof thenable.status ? thenable.then(noop$1$1, noop$1$1) : (thenable.status = "pending", thenable.then(
        function(fulfilledValue) {
          "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
        },
        function(error) {
          "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
        }
      )), thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
      }
  }
  throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
  var type = typeof children;
  if ("undefined" === type || "boolean" === type) children = null;
  var invokeCallback = false;
  if (null === children) invokeCallback = true;
  else
    switch (type) {
      case "bigint":
      case "string":
      case "number":
        invokeCallback = true;
        break;
      case "object":
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE$1:
          case REACT_PORTAL_TYPE$2:
            invokeCallback = true;
            break;
          case REACT_LAZY_TYPE$1:
            return invokeCallback = children._init, mapIntoArray(
              invokeCallback(children._payload),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
        }
    }
  if (invokeCallback)
    return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl$1(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
      return c;
    })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
      callback,
      escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
        userProvidedKeyEscapeRegex,
        "$&/"
      ) + "/") + invokeCallback
    )), array.push(callback)), 1;
  invokeCallback = 0;
  var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
  if (isArrayImpl$1(children))
    for (var i = 0; i < children.length; i++)
      nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
        nameSoFar,
        array,
        escapedPrefix,
        type,
        callback
      );
  else if (i = getIteratorFn$1(children), "function" === typeof i)
    for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
      nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
        nameSoFar,
        array,
        escapedPrefix,
        type,
        callback
      );
  else if ("object" === type) {
    if ("function" === typeof children.then)
      return mapIntoArray(
        resolveThenable(children),
        array,
        escapedPrefix,
        nameSoFar,
        callback
      );
    array = String(children);
    throw Error(
      "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
    );
  }
  return invokeCallback;
}
function mapChildren(children, func, context) {
  if (null == children) return children;
  var result = [], count = 0;
  mapIntoArray(children, result, "", "", function(child) {
    return func.call(context, child, count++);
  });
  return result;
}
function lazyInitializer(payload) {
  if (-1 === payload._status) {
    var ctor = payload._result;
    ctor = ctor();
    ctor.then(
      function(moduleObject) {
        if (0 === payload._status || -1 === payload._status)
          payload._status = 1, payload._result = moduleObject;
      },
      function(error) {
        if (0 === payload._status || -1 === payload._status)
          payload._status = 2, payload._result = error;
      }
    );
    -1 === payload._status && (payload._status = 0, payload._result = ctor);
  }
  if (1 === payload._status) return payload._result.default;
  throw payload._result;
}
var reportGlobalError$1 = "function" === typeof reportError ? reportError : function(error) {
  if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
    var event = new window.ErrorEvent("error", {
      bubbles: true,
      cancelable: true,
      message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
      error
    });
    if (!window.dispatchEvent(event)) return;
  } else if ("object" === typeof process && "function" === typeof process.emit) {
    process.emit("uncaughtException", error);
    return;
  }
  console.error(error);
};
function noop$5() {
}
react_production.Children = {
  map: mapChildren,
  forEach: function(children, forEachFunc, forEachContext) {
    mapChildren(
      children,
      function() {
        forEachFunc.apply(this, arguments);
      },
      forEachContext
    );
  },
  count: function(children) {
    var n = 0;
    mapChildren(children, function() {
      n++;
    });
    return n;
  },
  toArray: function(children) {
    return mapChildren(children, function(child) {
      return child;
    }) || [];
  },
  only: function(children) {
    if (!isValidElement(children))
      throw Error(
        "React.Children.only expected to receive a single React element child."
      );
    return children;
  }
};
react_production.Component = Component;
react_production.Fragment = REACT_FRAGMENT_TYPE$1;
react_production.Profiler = REACT_PROFILER_TYPE$1;
react_production.PureComponent = PureComponent;
react_production.StrictMode = REACT_STRICT_MODE_TYPE$1;
react_production.Suspense = REACT_SUSPENSE_TYPE$1;
react_production.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals$2;
react_production.__COMPILER_RUNTIME = {
  __proto__: null,
  c: function(size) {
    return ReactSharedInternals$2.H.useMemoCache(size);
  }
};
react_production.cache = function(fn) {
  return function() {
    return fn.apply(null, arguments);
  };
};
react_production.cloneElement = function(element, config, children) {
  if (null === element || void 0 === element)
    throw Error(
      "The argument must be a React element, but you passed " + element + "."
    );
  var props = assign$1({}, element.props), key = element.key, owner = void 0;
  if (null != config)
    for (propName in void 0 !== config.ref && (owner = void 0), void 0 !== config.key && (key = "" + config.key), config)
      !hasOwnProperty$1.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
  var propName = arguments.length - 2;
  if (1 === propName) props.children = children;
  else if (1 < propName) {
    for (var childArray = Array(propName), i = 0; i < propName; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  return ReactElement(element.type, key, void 0, void 0, owner, props);
};
react_production.createContext = function(defaultValue) {
  defaultValue = {
    $$typeof: REACT_CONTEXT_TYPE$1,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: null,
    Consumer: null
  };
  defaultValue.Provider = defaultValue;
  defaultValue.Consumer = {
    $$typeof: REACT_CONSUMER_TYPE$1,
    _context: defaultValue
  };
  return defaultValue;
};
react_production.createElement = function(type, config, children) {
  var propName, props = {}, key = null;
  if (null != config)
    for (propName in void 0 !== config.key && (key = "" + config.key), config)
      hasOwnProperty$1.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
  var childrenLength = arguments.length - 2;
  if (1 === childrenLength) props.children = children;
  else if (1 < childrenLength) {
    for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  if (type && type.defaultProps)
    for (propName in childrenLength = type.defaultProps, childrenLength)
      void 0 === props[propName] && (props[propName] = childrenLength[propName]);
  return ReactElement(type, key, void 0, void 0, null, props);
};
react_production.createRef = function() {
  return { current: null };
};
react_production.forwardRef = function(render) {
  return { $$typeof: REACT_FORWARD_REF_TYPE$1, render };
};
react_production.isValidElement = isValidElement;
react_production.lazy = function(ctor) {
  return {
    $$typeof: REACT_LAZY_TYPE$1,
    _payload: { _status: -1, _result: ctor },
    _init: lazyInitializer
  };
};
react_production.memo = function(type, compare) {
  return {
    $$typeof: REACT_MEMO_TYPE$1,
    type,
    compare: void 0 === compare ? null : compare
  };
};
react_production.startTransition = function(scope) {
  var prevTransition = ReactSharedInternals$2.T, currentTransition = {};
  ReactSharedInternals$2.T = currentTransition;
  try {
    var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals$2.S;
    null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
    "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop$5, reportGlobalError$1);
  } catch (error) {
    reportGlobalError$1(error);
  } finally {
    ReactSharedInternals$2.T = prevTransition;
  }
};
react_production.unstable_useCacheRefresh = function() {
  return ReactSharedInternals$2.H.useCacheRefresh();
};
react_production.use = function(usable) {
  return ReactSharedInternals$2.H.use(usable);
};
react_production.useActionState = function(action, initialState2, permalink) {
  return ReactSharedInternals$2.H.useActionState(action, initialState2, permalink);
};
react_production.useCallback = function(callback, deps) {
  return ReactSharedInternals$2.H.useCallback(callback, deps);
};
react_production.useContext = function(Context) {
  return ReactSharedInternals$2.H.useContext(Context);
};
react_production.useDebugValue = function() {
};
react_production.useDeferredValue = function(value, initialValue) {
  return ReactSharedInternals$2.H.useDeferredValue(value, initialValue);
};
react_production.useEffect = function(create, createDeps, update) {
  var dispatcher = ReactSharedInternals$2.H;
  if ("function" === typeof update)
    throw Error(
      "useEffect CRUD overload is not enabled in this build of React."
    );
  return dispatcher.useEffect(create, createDeps);
};
react_production.useId = function() {
  return ReactSharedInternals$2.H.useId();
};
react_production.useImperativeHandle = function(ref, create, deps) {
  return ReactSharedInternals$2.H.useImperativeHandle(ref, create, deps);
};
react_production.useInsertionEffect = function(create, deps) {
  return ReactSharedInternals$2.H.useInsertionEffect(create, deps);
};
react_production.useLayoutEffect = function(create, deps) {
  return ReactSharedInternals$2.H.useLayoutEffect(create, deps);
};
react_production.useMemo = function(create, deps) {
  return ReactSharedInternals$2.H.useMemo(create, deps);
};
react_production.useOptimistic = function(passthrough, reducer) {
  return ReactSharedInternals$2.H.useOptimistic(passthrough, reducer);
};
react_production.useReducer = function(reducer, initialArg, init) {
  return ReactSharedInternals$2.H.useReducer(reducer, initialArg, init);
};
react_production.useRef = function(initialValue) {
  return ReactSharedInternals$2.H.useRef(initialValue);
};
react_production.useState = function(initialState2) {
  return ReactSharedInternals$2.H.useState(initialState2);
};
react_production.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
  return ReactSharedInternals$2.H.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
};
react_production.useTransition = function() {
  return ReactSharedInternals$2.H.useTransition();
};
react_production.version = "19.1.5";
{
  react.exports = react_production;
}
var reactExports = react.exports;
var QueryClientContext = reactExports.createContext(
  void 0
);
var QueryClientProvider = ({
  client: client2,
  children
}) => {
  reactExports.useEffect(() => {
    client2.mount();
    return () => {
      client2.unmount();
    };
  }, [client2]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientContext.Provider, { value: client2, children });
};
var client = { exports: {} };
var reactDomClient_production = {};
var scheduler = { exports: {} };
var scheduler_production = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(exports$1) {
  function push2(heap, node) {
    var index2 = heap.length;
    heap.push(node);
    a: for (; 0 < index2; ) {
      var parentIndex = index2 - 1 >>> 1, parent = heap[parentIndex];
      if (0 < compare(parent, node))
        heap[parentIndex] = node, heap[index2] = parent, index2 = parentIndex;
      else break a;
    }
  }
  function peek(heap) {
    return 0 === heap.length ? null : heap[0];
  }
  function pop2(heap) {
    if (0 === heap.length) return null;
    var first = heap[0], last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      a: for (var index2 = 0, length = heap.length, halfLength = length >>> 1; index2 < halfLength; ) {
        var leftIndex = 2 * (index2 + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
        if (0 > compare(left, last))
          rightIndex < length && 0 > compare(right, left) ? (heap[index2] = right, heap[rightIndex] = last, index2 = rightIndex) : (heap[index2] = left, heap[leftIndex] = last, index2 = leftIndex);
        else if (rightIndex < length && 0 > compare(right, last))
          heap[index2] = right, heap[rightIndex] = last, index2 = rightIndex;
        else break a;
      }
    }
    return first;
  }
  function compare(a, b) {
    var diff = a.sortIndex - b.sortIndex;
    return 0 !== diff ? diff : a.id - b.id;
  }
  exports$1.unstable_now = void 0;
  if ("object" === typeof performance && "function" === typeof performance.now) {
    var localPerformance = performance;
    exports$1.unstable_now = function() {
      return localPerformance.now();
    };
  } else {
    var localDate = Date, initialTime = localDate.now();
    exports$1.unstable_now = function() {
      return localDate.now() - initialTime;
    };
  }
  var taskQueue = [], timerQueue = [], taskIdCounter = 1, currentTask = null, currentPriorityLevel = 3, isPerformingWork = false, isHostCallbackScheduled = false, isHostTimeoutScheduled = false, needsPaint = false, localSetTimeout = "function" === typeof setTimeout ? setTimeout : null, localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null, localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
  function advanceTimers(currentTime) {
    for (var timer = peek(timerQueue); null !== timer; ) {
      if (null === timer.callback) pop2(timerQueue);
      else if (timer.startTime <= currentTime)
        pop2(timerQueue), timer.sortIndex = timer.expirationTime, push2(taskQueue, timer);
      else break;
      timer = peek(timerQueue);
    }
  }
  function handleTimeout(currentTime) {
    isHostTimeoutScheduled = false;
    advanceTimers(currentTime);
    if (!isHostCallbackScheduled)
      if (null !== peek(taskQueue))
        isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
      else {
        var firstTimer = peek(timerQueue);
        null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
  }
  var isMessageLoopRunning = false, taskTimeoutID = -1, frameInterval = 5, startTime = -1;
  function shouldYieldToHost() {
    return needsPaint ? true : exports$1.unstable_now() - startTime < frameInterval ? false : true;
  }
  function performWorkUntilDeadline() {
    needsPaint = false;
    if (isMessageLoopRunning) {
      var currentTime = exports$1.unstable_now();
      startTime = currentTime;
      var hasMoreWork = true;
      try {
        a: {
          isHostCallbackScheduled = false;
          isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
          isPerformingWork = true;
          var previousPriorityLevel = currentPriorityLevel;
          try {
            b: {
              advanceTimers(currentTime);
              for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
                var callback = currentTask.callback;
                if ("function" === typeof callback) {
                  currentTask.callback = null;
                  currentPriorityLevel = currentTask.priorityLevel;
                  var continuationCallback = callback(
                    currentTask.expirationTime <= currentTime
                  );
                  currentTime = exports$1.unstable_now();
                  if ("function" === typeof continuationCallback) {
                    currentTask.callback = continuationCallback;
                    advanceTimers(currentTime);
                    hasMoreWork = true;
                    break b;
                  }
                  currentTask === peek(taskQueue) && pop2(taskQueue);
                  advanceTimers(currentTime);
                } else pop2(taskQueue);
                currentTask = peek(taskQueue);
              }
              if (null !== currentTask) hasMoreWork = true;
              else {
                var firstTimer = peek(timerQueue);
                null !== firstTimer && requestHostTimeout(
                  handleTimeout,
                  firstTimer.startTime - currentTime
                );
                hasMoreWork = false;
              }
            }
            break a;
          } finally {
            currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
          }
          hasMoreWork = void 0;
        }
      } finally {
        hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
      }
    }
  }
  var schedulePerformWorkUntilDeadline;
  if ("function" === typeof localSetImmediate)
    schedulePerformWorkUntilDeadline = function() {
      localSetImmediate(performWorkUntilDeadline);
    };
  else if ("undefined" !== typeof MessageChannel) {
    var channel = new MessageChannel(), port = channel.port2;
    channel.port1.onmessage = performWorkUntilDeadline;
    schedulePerformWorkUntilDeadline = function() {
      port.postMessage(null);
    };
  } else
    schedulePerformWorkUntilDeadline = function() {
      localSetTimeout(performWorkUntilDeadline, 0);
    };
  function requestHostTimeout(callback, ms) {
    taskTimeoutID = localSetTimeout(function() {
      callback(exports$1.unstable_now());
    }, ms);
  }
  exports$1.unstable_IdlePriority = 5;
  exports$1.unstable_ImmediatePriority = 1;
  exports$1.unstable_LowPriority = 4;
  exports$1.unstable_NormalPriority = 3;
  exports$1.unstable_Profiling = null;
  exports$1.unstable_UserBlockingPriority = 2;
  exports$1.unstable_cancelCallback = function(task) {
    task.callback = null;
  };
  exports$1.unstable_forceFrameRate = function(fps) {
    0 > fps || 125 < fps ? console.error(
      "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
    ) : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
  };
  exports$1.unstable_getCurrentPriorityLevel = function() {
    return currentPriorityLevel;
  };
  exports$1.unstable_next = function(eventHandler) {
    switch (currentPriorityLevel) {
      case 1:
      case 2:
      case 3:
        var priorityLevel = 3;
        break;
      default:
        priorityLevel = currentPriorityLevel;
    }
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;
    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
  exports$1.unstable_requestPaint = function() {
    needsPaint = true;
  };
  exports$1.unstable_runWithPriority = function(priorityLevel, eventHandler) {
    switch (priorityLevel) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        priorityLevel = 3;
    }
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;
    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
  exports$1.unstable_scheduleCallback = function(priorityLevel, callback, options) {
    var currentTime = exports$1.unstable_now();
    "object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
    switch (priorityLevel) {
      case 1:
        var timeout = -1;
        break;
      case 2:
        timeout = 250;
        break;
      case 5:
        timeout = 1073741823;
        break;
      case 4:
        timeout = 1e4;
        break;
      default:
        timeout = 5e3;
    }
    timeout = options + timeout;
    priorityLevel = {
      id: taskIdCounter++,
      callback,
      priorityLevel,
      startTime: options,
      expirationTime: timeout,
      sortIndex: -1
    };
    options > currentTime ? (priorityLevel.sortIndex = options, push2(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push2(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline())));
    return priorityLevel;
  };
  exports$1.unstable_shouldYield = shouldYieldToHost;
  exports$1.unstable_wrapCallback = function(callback) {
    var parentPriorityLevel = currentPriorityLevel;
    return function() {
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = parentPriorityLevel;
      try {
        return callback.apply(this, arguments);
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
  };
})(scheduler_production);
{
  scheduler.exports = scheduler_production;
}
var schedulerExports = scheduler.exports;
var reactDom = { exports: {} };
var reactDom_production = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React$1 = reactExports;
function formatProdErrorMessage$1(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2; i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
function noop$4() {
}
var Internals = {
  d: {
    f: noop$4,
    r: function() {
      throw Error(formatProdErrorMessage$1(522));
    },
    D: noop$4,
    C: noop$4,
    L: noop$4,
    m: noop$4,
    X: noop$4,
    S: noop$4,
    M: noop$4
  },
  p: 0,
  findDOMNode: null
}, REACT_PORTAL_TYPE$1 = Symbol.for("react.portal");
function createPortal$1(children, containerInfo, implementation) {
  var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
  return {
    $$typeof: REACT_PORTAL_TYPE$1,
    key: null == key ? null : "" + key,
    children,
    containerInfo,
    implementation
  };
}
var ReactSharedInternals$1 = React$1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
function getCrossOriginStringAs(as, input) {
  if ("font" === as) return "";
  if ("string" === typeof input)
    return "use-credentials" === input ? input : "";
}
reactDom_production.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
reactDom_production.createPortal = function(children, container) {
  var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
  if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
    throw Error(formatProdErrorMessage$1(299));
  return createPortal$1(children, container, null, key);
};
reactDom_production.flushSync = function(fn) {
  var previousTransition = ReactSharedInternals$1.T, previousUpdatePriority = Internals.p;
  try {
    if (ReactSharedInternals$1.T = null, Internals.p = 2, fn) return fn();
  } finally {
    ReactSharedInternals$1.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
  }
};
reactDom_production.preconnect = function(href, options) {
  "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
};
reactDom_production.prefetchDNS = function(href) {
  "string" === typeof href && Internals.d.D(href);
};
reactDom_production.preinit = function(href, options) {
  if ("string" === typeof href && options && "string" === typeof options.as) {
    var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
    "style" === as ? Internals.d.S(
      href,
      "string" === typeof options.precedence ? options.precedence : void 0,
      {
        crossOrigin,
        integrity,
        fetchPriority
      }
    ) : "script" === as && Internals.d.X(href, {
      crossOrigin,
      integrity,
      fetchPriority,
      nonce: "string" === typeof options.nonce ? options.nonce : void 0
    });
  }
};
reactDom_production.preinitModule = function(href, options) {
  if ("string" === typeof href)
    if ("object" === typeof options && null !== options) {
      if (null == options.as || "script" === options.as) {
        var crossOrigin = getCrossOriginStringAs(
          options.as,
          options.crossOrigin
        );
        Internals.d.M(href, {
          crossOrigin,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
      }
    } else null == options && Internals.d.M(href);
};
reactDom_production.preload = function(href, options) {
  if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
    var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
    Internals.d.L(href, as, {
      crossOrigin,
      integrity: "string" === typeof options.integrity ? options.integrity : void 0,
      nonce: "string" === typeof options.nonce ? options.nonce : void 0,
      type: "string" === typeof options.type ? options.type : void 0,
      fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
      referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
      imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
      imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
      media: "string" === typeof options.media ? options.media : void 0
    });
  }
};
reactDom_production.preloadModule = function(href, options) {
  if ("string" === typeof href)
    if (options) {
      var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
      Internals.d.m(href, {
        as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
        crossOrigin,
        integrity: "string" === typeof options.integrity ? options.integrity : void 0
      });
    } else Internals.d.m(href);
};
reactDom_production.requestFormReset = function(form) {
  Internals.d.r(form);
};
reactDom_production.unstable_batchedUpdates = function(fn, a) {
  return fn(a);
};
reactDom_production.useFormState = function(action, initialState2, permalink) {
  return ReactSharedInternals$1.H.useFormState(action, initialState2, permalink);
};
reactDom_production.useFormStatus = function() {
  return ReactSharedInternals$1.H.useHostTransitionStatus();
};
reactDom_production.version = "19.1.5";
function checkDCE$1() {
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
    return;
  }
  try {
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE$1);
  } catch (err) {
    console.error(err);
  }
}
{
  checkDCE$1();
  reactDom.exports = reactDom_production;
}
var reactDomExports = reactDom.exports;
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Scheduler = schedulerExports, React = reactExports, ReactDOM$1 = reactDomExports;
function formatProdErrorMessage(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2; i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
function isValidContainer(node) {
  return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
}
function getNearestMountedFiber(fiber) {
  var node = fiber, nearestMounted = fiber;
  if (fiber.alternate) for (; node.return; ) node = node.return;
  else {
    fiber = node;
    do
      node = fiber, 0 !== (node.flags & 4098) && (nearestMounted = node.return), fiber = node.return;
    while (fiber);
  }
  return 3 === node.tag ? nearestMounted : null;
}
function getSuspenseInstanceFromFiber(fiber) {
  if (13 === fiber.tag) {
    var suspenseState = fiber.memoizedState;
    null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
    if (null !== suspenseState) return suspenseState.dehydrated;
  }
  return null;
}
function assertIsMounted(fiber) {
  if (getNearestMountedFiber(fiber) !== fiber)
    throw Error(formatProdErrorMessage(188));
}
function findCurrentFiberUsingSlowPath(fiber) {
  var alternate = fiber.alternate;
  if (!alternate) {
    alternate = getNearestMountedFiber(fiber);
    if (null === alternate) throw Error(formatProdErrorMessage(188));
    return alternate !== fiber ? null : fiber;
  }
  for (var a = fiber, b = alternate; ; ) {
    var parentA = a.return;
    if (null === parentA) break;
    var parentB = parentA.alternate;
    if (null === parentB) {
      b = parentA.return;
      if (null !== b) {
        a = b;
        continue;
      }
      break;
    }
    if (parentA.child === parentB.child) {
      for (parentB = parentA.child; parentB; ) {
        if (parentB === a) return assertIsMounted(parentA), fiber;
        if (parentB === b) return assertIsMounted(parentA), alternate;
        parentB = parentB.sibling;
      }
      throw Error(formatProdErrorMessage(188));
    }
    if (a.return !== b.return) a = parentA, b = parentB;
    else {
      for (var didFindChild = false, child$0 = parentA.child; child$0; ) {
        if (child$0 === a) {
          didFindChild = true;
          a = parentA;
          b = parentB;
          break;
        }
        if (child$0 === b) {
          didFindChild = true;
          b = parentA;
          a = parentB;
          break;
        }
        child$0 = child$0.sibling;
      }
      if (!didFindChild) {
        for (child$0 = parentB.child; child$0; ) {
          if (child$0 === a) {
            didFindChild = true;
            a = parentB;
            b = parentA;
            break;
          }
          if (child$0 === b) {
            didFindChild = true;
            b = parentB;
            a = parentA;
            break;
          }
          child$0 = child$0.sibling;
        }
        if (!didFindChild) throw Error(formatProdErrorMessage(189));
      }
    }
    if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
  }
  if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
  return a.stateNode.current === a ? fiber : alternate;
}
function findCurrentHostFiberImpl(node) {
  var tag = node.tag;
  if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
  for (node = node.child; null !== node; ) {
    tag = findCurrentHostFiberImpl(node);
    if (null !== tag) return tag;
    node = node.sibling;
  }
  return null;
}
var assign = Object.assign, REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_PROVIDER_TYPE = Symbol.for("react.provider"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy");
var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
  if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
  maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
  return "function" === typeof maybeIterable ? maybeIterable : null;
}
var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
function getComponentNameFromType(type) {
  if (null == type) return null;
  if ("function" === typeof type)
    return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
  if ("string" === typeof type) return type;
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return "Fragment";
    case REACT_PROFILER_TYPE:
      return "Profiler";
    case REACT_STRICT_MODE_TYPE:
      return "StrictMode";
    case REACT_SUSPENSE_TYPE:
      return "Suspense";
    case REACT_SUSPENSE_LIST_TYPE:
      return "SuspenseList";
    case REACT_ACTIVITY_TYPE:
      return "Activity";
  }
  if ("object" === typeof type)
    switch (type.$$typeof) {
      case REACT_PORTAL_TYPE:
        return "Portal";
      case REACT_CONTEXT_TYPE:
        return (type.displayName || "Context") + ".Provider";
      case REACT_CONSUMER_TYPE:
        return (type._context.displayName || "Context") + ".Consumer";
      case REACT_FORWARD_REF_TYPE:
        var innerType = type.render;
        type = type.displayName;
        type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
        return type;
      case REACT_MEMO_TYPE:
        return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
      case REACT_LAZY_TYPE:
        innerType = type._payload;
        type = type._init;
        try {
          return getComponentNameFromType(type(innerType));
        } catch (x) {
        }
    }
  return null;
}
var isArrayImpl = Array.isArray, ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactDOMSharedInternals = ReactDOM$1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, sharedNotPendingObject = {
  pending: false,
  data: null,
  method: null,
  action: null
}, valueStack = [], index = -1;
function createCursor(defaultValue) {
  return { current: defaultValue };
}
function pop(cursor) {
  0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
}
function push(cursor, value) {
  index++;
  valueStack[index] = cursor.current;
  cursor.current = value;
}
var contextStackCursor = createCursor(null), contextFiberStackCursor = createCursor(null), rootInstanceStackCursor = createCursor(null), hostTransitionProviderCursor = createCursor(null);
function pushHostContainer(fiber, nextRootInstance) {
  push(rootInstanceStackCursor, nextRootInstance);
  push(contextFiberStackCursor, fiber);
  push(contextStackCursor, null);
  switch (nextRootInstance.nodeType) {
    case 9:
    case 11:
      fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
      break;
    default:
      if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI)
        nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
      else
        switch (fiber) {
          case "svg":
            fiber = 1;
            break;
          case "math":
            fiber = 2;
            break;
          default:
            fiber = 0;
        }
  }
  pop(contextStackCursor);
  push(contextStackCursor, fiber);
}
function popHostContainer() {
  pop(contextStackCursor);
  pop(contextFiberStackCursor);
  pop(rootInstanceStackCursor);
}
function pushHostContext(fiber) {
  null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
  var context = contextStackCursor.current;
  var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
  context !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
}
function popHostContext(fiber) {
  contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
  hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
}
var hasOwnProperty = Object.prototype.hasOwnProperty, scheduleCallback$3 = Scheduler.unstable_scheduleCallback, cancelCallback$1 = Scheduler.unstable_cancelCallback, shouldYield = Scheduler.unstable_shouldYield, requestPaint = Scheduler.unstable_requestPaint, now = Scheduler.unstable_now, getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel, ImmediatePriority = Scheduler.unstable_ImmediatePriority, UserBlockingPriority = Scheduler.unstable_UserBlockingPriority, NormalPriority$1 = Scheduler.unstable_NormalPriority, LowPriority = Scheduler.unstable_LowPriority, IdlePriority = Scheduler.unstable_IdlePriority, log$1 = Scheduler.log, unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue, rendererID = null, injectedHook = null;
function setIsStrictModeForDevtools(newIsStrictMode) {
  "function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
  if (injectedHook && "function" === typeof injectedHook.setStrictMode)
    try {
      injectedHook.setStrictMode(rendererID, newIsStrictMode);
    } catch (err) {
    }
}
var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log = Math.log, LN2 = Math.LN2;
function clz32Fallback(x) {
  x >>>= 0;
  return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
}
var nextTransitionLane = 256, nextRetryLane = 4194304;
function getHighestPriorityLanes(lanes) {
  var pendingSyncLanes = lanes & 42;
  if (0 !== pendingSyncLanes) return pendingSyncLanes;
  switch (lanes & -lanes) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
      return 64;
    case 128:
      return 128;
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return lanes & 4194048;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return lanes & 62914560;
    case 67108864:
      return 67108864;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 0;
    default:
      return lanes;
  }
}
function getNextLanes(root2, wipLanes, rootHasPendingCommit) {
  var pendingLanes = root2.pendingLanes;
  if (0 === pendingLanes) return 0;
  var nextLanes = 0, suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes;
  root2 = root2.warmLanes;
  var nonIdlePendingLanes = pendingLanes & 134217727;
  0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
  return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
}
function checkIfRootIsPrerendering(root2, renderLanes2) {
  return 0 === (root2.pendingLanes & ~(root2.suspendedLanes & ~root2.pingedLanes) & renderLanes2);
}
function computeExpirationTime(lane, currentTime) {
  switch (lane) {
    case 1:
    case 2:
    case 4:
    case 8:
    case 64:
      return currentTime + 250;
    case 16:
    case 32:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return currentTime + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return -1;
    case 67108864:
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function claimNextTransitionLane() {
  var lane = nextTransitionLane;
  nextTransitionLane <<= 1;
  0 === (nextTransitionLane & 4194048) && (nextTransitionLane = 256);
  return lane;
}
function claimNextRetryLane() {
  var lane = nextRetryLane;
  nextRetryLane <<= 1;
  0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
  return lane;
}
function createLaneMap(initial) {
  for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
  return laneMap;
}
function markRootUpdated$1(root2, updateLane) {
  root2.pendingLanes |= updateLane;
  268435456 !== updateLane && (root2.suspendedLanes = 0, root2.pingedLanes = 0, root2.warmLanes = 0);
}
function markRootFinished(root2, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
  var previouslyPendingLanes = root2.pendingLanes;
  root2.pendingLanes = remainingLanes;
  root2.suspendedLanes = 0;
  root2.pingedLanes = 0;
  root2.warmLanes = 0;
  root2.expiredLanes &= remainingLanes;
  root2.entangledLanes &= remainingLanes;
  root2.errorRecoveryDisabledLanes &= remainingLanes;
  root2.shellSuspendCounter = 0;
  var entanglements = root2.entanglements, expirationTimes = root2.expirationTimes, hiddenUpdates = root2.hiddenUpdates;
  for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes; ) {
    var index$5 = 31 - clz32(remainingLanes), lane = 1 << index$5;
    entanglements[index$5] = 0;
    expirationTimes[index$5] = -1;
    var hiddenUpdatesForLane = hiddenUpdates[index$5];
    if (null !== hiddenUpdatesForLane)
      for (hiddenUpdates[index$5] = null, index$5 = 0; index$5 < hiddenUpdatesForLane.length; index$5++) {
        var update = hiddenUpdatesForLane[index$5];
        null !== update && (update.lane &= -536870913);
      }
    remainingLanes &= ~lane;
  }
  0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, 0);
  0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root2.tag && (root2.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
}
function markSpawnedDeferredLane(root2, spawnedLane, entangledLanes) {
  root2.pendingLanes |= spawnedLane;
  root2.suspendedLanes &= ~spawnedLane;
  var spawnedLaneIndex = 31 - clz32(spawnedLane);
  root2.entangledLanes |= spawnedLane;
  root2.entanglements[spawnedLaneIndex] = root2.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 4194090;
}
function markRootEntangled(root2, entangledLanes) {
  var rootEntangledLanes = root2.entangledLanes |= entangledLanes;
  for (root2 = root2.entanglements; rootEntangledLanes; ) {
    var index$6 = 31 - clz32(rootEntangledLanes), lane = 1 << index$6;
    lane & entangledLanes | root2[index$6] & entangledLanes && (root2[index$6] |= entangledLanes);
    rootEntangledLanes &= ~lane;
  }
}
function getBumpedLaneForHydrationByLane(lane) {
  switch (lane) {
    case 2:
      lane = 1;
      break;
    case 8:
      lane = 4;
      break;
    case 32:
      lane = 16;
      break;
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      lane = 128;
      break;
    case 268435456:
      lane = 134217728;
      break;
    default:
      lane = 0;
  }
  return lane;
}
function lanesToEventPriority(lanes) {
  lanes &= -lanes;
  return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
}
function resolveUpdatePriority() {
  var updatePriority = ReactDOMSharedInternals.p;
  if (0 !== updatePriority) return updatePriority;
  updatePriority = window.event;
  return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
}
function runWithPriority(priority, fn) {
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    return ReactDOMSharedInternals.p = priority, fn();
  } finally {
    ReactDOMSharedInternals.p = previousPriority;
  }
}
var randomKey = Math.random().toString(36).slice(2), internalInstanceKey = "__reactFiber$" + randomKey, internalPropsKey = "__reactProps$" + randomKey, internalContainerInstanceKey = "__reactContainer$" + randomKey, internalEventHandlersKey = "__reactEvents$" + randomKey, internalEventHandlerListenersKey = "__reactListeners$" + randomKey, internalEventHandlesSetKey = "__reactHandles$" + randomKey, internalRootNodeResourcesKey = "__reactResources$" + randomKey, internalHoistableMarker = "__reactMarker$" + randomKey;
function detachDeletedInstance(node) {
  delete node[internalInstanceKey];
  delete node[internalPropsKey];
  delete node[internalEventHandlersKey];
  delete node[internalEventHandlerListenersKey];
  delete node[internalEventHandlesSetKey];
}
function getClosestInstanceFromNode(targetNode) {
  var targetInst = targetNode[internalInstanceKey];
  if (targetInst) return targetInst;
  for (var parentNode = targetNode.parentNode; parentNode; ) {
    if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
      parentNode = targetInst.alternate;
      if (null !== targetInst.child || null !== parentNode && null !== parentNode.child)
        for (targetNode = getParentSuspenseInstance(targetNode); null !== targetNode; ) {
          if (parentNode = targetNode[internalInstanceKey]) return parentNode;
          targetNode = getParentSuspenseInstance(targetNode);
        }
      return targetInst;
    }
    targetNode = parentNode;
    parentNode = targetNode.parentNode;
  }
  return null;
}
function getInstanceFromNode(node) {
  if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
    var tag = node.tag;
    if (5 === tag || 6 === tag || 13 === tag || 26 === tag || 27 === tag || 3 === tag)
      return node;
  }
  return null;
}
function getNodeFromInstance(inst) {
  var tag = inst.tag;
  if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
  throw Error(formatProdErrorMessage(33));
}
function getResourcesFromRoot(root2) {
  var resources = root2[internalRootNodeResourcesKey];
  resources || (resources = root2[internalRootNodeResourcesKey] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() });
  return resources;
}
function markNodeAsHoistable(node) {
  node[internalHoistableMarker] = true;
}
var allNativeEvents = /* @__PURE__ */ new Set(), registrationNameDependencies = {};
function registerTwoPhaseEvent(registrationName, dependencies) {
  registerDirectEvent(registrationName, dependencies);
  registerDirectEvent(registrationName + "Capture", dependencies);
}
function registerDirectEvent(registrationName, dependencies) {
  registrationNameDependencies[registrationName] = dependencies;
  for (registrationName = 0; registrationName < dependencies.length; registrationName++)
    allNativeEvents.add(dependencies[registrationName]);
}
var VALID_ATTRIBUTE_NAME_REGEX = RegExp(
  "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
    return true;
  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return false;
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
    return validatedAttributeNameCache[attributeName] = true;
  illegalAttributeNameCache[attributeName] = true;
  return false;
}
function setValueForAttribute(node, name, value) {
  if (isAttributeNameSafe(name))
    if (null === value) node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
          node.removeAttribute(name);
          return;
        case "boolean":
          var prefix$8 = name.toLowerCase().slice(0, 5);
          if ("data-" !== prefix$8 && "aria-" !== prefix$8) {
            node.removeAttribute(name);
            return;
          }
      }
      node.setAttribute(name, "" + value);
    }
}
function setValueForKnownAttribute(node, name, value) {
  if (null === value) node.removeAttribute(name);
  else {
    switch (typeof value) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        node.removeAttribute(name);
        return;
    }
    node.setAttribute(name, "" + value);
  }
}
function setValueForNamespacedAttribute(node, namespace, name, value) {
  if (null === value) node.removeAttribute(name);
  else {
    switch (typeof value) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        node.removeAttribute(name);
        return;
    }
    node.setAttributeNS(namespace, name, "" + value);
  }
}
var prefix, suffix;
function describeBuiltInComponentFrame(name) {
  if (void 0 === prefix)
    try {
      throw Error();
    } catch (x) {
      var match = x.stack.trim().match(/\n( *(at )?)/);
      prefix = match && match[1] || "";
      suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
    }
  return "\n" + prefix + name + suffix;
}
var reentry = false;
function describeNativeComponentFrame(fn, construct) {
  if (!fn || reentry) return "";
  reentry = true;
  var previousPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    var RunInRootFrame = {
      DetermineComponentFrameRoot: function() {
        try {
          if (construct) {
            var Fake = function() {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, "props", {
              set: function() {
                throw Error();
              }
            });
            if ("object" === typeof Reflect && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                var control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x$9) {
                control = x$9;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x$10) {
              control = x$10;
            }
            (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {
            });
          }
        } catch (sample) {
          if (sample && control && "string" === typeof sample.stack)
            return [sample.stack, control.stack];
        }
        return [null, null];
      }
    };
    RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
    var namePropDescriptor = Object.getOwnPropertyDescriptor(
      RunInRootFrame.DetermineComponentFrameRoot,
      "name"
    );
    namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(
      RunInRootFrame.DetermineComponentFrameRoot,
      "name",
      { value: "DetermineComponentFrameRoot" }
    );
    var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
    if (sampleStack && controlStack) {
      var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
      for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
        RunInRootFrame++;
      for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes(
        "DetermineComponentFrameRoot"
      ); )
        namePropDescriptor++;
      if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
        for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
          namePropDescriptor--;
      for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
        if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
          if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
            do
              if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                return frame;
              }
            while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
          }
          break;
        }
    }
  } finally {
    reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
  }
  return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
}
function describeFiber(fiber) {
  switch (fiber.tag) {
    case 26:
    case 27:
    case 5:
      return describeBuiltInComponentFrame(fiber.type);
    case 16:
      return describeBuiltInComponentFrame("Lazy");
    case 13:
      return describeBuiltInComponentFrame("Suspense");
    case 19:
      return describeBuiltInComponentFrame("SuspenseList");
    case 0:
    case 15:
      return describeNativeComponentFrame(fiber.type, false);
    case 11:
      return describeNativeComponentFrame(fiber.type.render, false);
    case 1:
      return describeNativeComponentFrame(fiber.type, true);
    case 31:
      return describeBuiltInComponentFrame("Activity");
    default:
      return "";
  }
}
function getStackByFiberInDevAndProd(workInProgress2) {
  try {
    var info = "";
    do
      info += describeFiber(workInProgress2), workInProgress2 = workInProgress2.return;
    while (workInProgress2);
    return info;
  } catch (x) {
    return "\nError generating stack: " + x.message + "\n" + x.stack;
  }
}
function getToStringValue(value) {
  switch (typeof value) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return value;
    case "object":
      return value;
    default:
      return "";
  }
}
function isCheckable(elem) {
  var type = elem.type;
  return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
}
function trackValueOnNode(node) {
  var valueField = isCheckable(node) ? "checked" : "value", descriptor = Object.getOwnPropertyDescriptor(
    node.constructor.prototype,
    valueField
  ), currentValue = "" + node[valueField];
  if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
    var get = descriptor.get, set = descriptor.set;
    Object.defineProperty(node, valueField, {
      configurable: true,
      get: function() {
        return get.call(this);
      },
      set: function(value) {
        currentValue = "" + value;
        set.call(this, value);
      }
    });
    Object.defineProperty(node, valueField, {
      enumerable: descriptor.enumerable
    });
    return {
      getValue: function() {
        return currentValue;
      },
      setValue: function(value) {
        currentValue = "" + value;
      },
      stopTracking: function() {
        node._valueTracker = null;
        delete node[valueField];
      }
    };
  }
}
function track(node) {
  node._valueTracker || (node._valueTracker = trackValueOnNode(node));
}
function updateValueIfChanged(node) {
  if (!node) return false;
  var tracker = node._valueTracker;
  if (!tracker) return true;
  var lastValue = tracker.getValue();
  var value = "";
  node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
  node = value;
  return node !== lastValue ? (tracker.setValue(node), true) : false;
}
function getActiveElement(doc) {
  doc = doc || ("undefined" !== typeof document ? document : void 0);
  if ("undefined" === typeof doc) return null;
  try {
    return doc.activeElement || doc.body;
  } catch (e) {
    return doc.body;
  }
}
var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
  return value.replace(
    escapeSelectorAttributeValueInsideDoubleQuotesRegex,
    function(ch) {
      return "\\" + ch.charCodeAt(0).toString(16) + " ";
    }
  );
}
function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
  element.name = "";
  null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
  if (null != value)
    if ("number" === type) {
      if (0 === value && "" === element.value || element.value != value)
        element.value = "" + getToStringValue(value);
    } else
      element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
  else
    "submit" !== type && "reset" !== type || element.removeAttribute("value");
  null != value ? setDefaultValue(element, type, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, type, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
  null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
  null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
  null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
}
function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating2) {
  null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
  if (null != value || null != defaultValue) {
    if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value))
      return;
    defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
    value = null != value ? "" + getToStringValue(value) : defaultValue;
    isHydrating2 || value === element.value || (element.value = value);
    element.defaultValue = value;
  }
  checked = null != checked ? checked : defaultChecked;
  checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
  element.checked = isHydrating2 ? element.checked : !!checked;
  element.defaultChecked = !!checked;
  null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
}
function setDefaultValue(node, type, value) {
  "number" === type && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
}
function updateOptions(node, multiple, propValue, setDefaultSelected) {
  node = node.options;
  if (multiple) {
    multiple = {};
    for (var i = 0; i < propValue.length; i++)
      multiple["$" + propValue[i]] = true;
    for (propValue = 0; propValue < node.length; propValue++)
      i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = true);
  } else {
    propValue = "" + getToStringValue(propValue);
    multiple = null;
    for (i = 0; i < node.length; i++) {
      if (node[i].value === propValue) {
        node[i].selected = true;
        setDefaultSelected && (node[i].defaultSelected = true);
        return;
      }
      null !== multiple || node[i].disabled || (multiple = node[i]);
    }
    null !== multiple && (multiple.selected = true);
  }
}
function updateTextarea(element, value, defaultValue) {
  if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
    element.defaultValue !== value && (element.defaultValue = value);
    return;
  }
  element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
}
function initTextarea(element, value, defaultValue, children) {
  if (null == value) {
    if (null != children) {
      if (null != defaultValue) throw Error(formatProdErrorMessage(92));
      if (isArrayImpl(children)) {
        if (1 < children.length) throw Error(formatProdErrorMessage(93));
        children = children[0];
      }
      defaultValue = children;
    }
    null == defaultValue && (defaultValue = "");
    value = defaultValue;
  }
  defaultValue = getToStringValue(value);
  element.defaultValue = defaultValue;
  children = element.textContent;
  children === defaultValue && "" !== children && null !== children && (element.value = children);
}
function setTextContent(node, text2) {
  if (text2) {
    var firstChild = node.firstChild;
    if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
      firstChild.nodeValue = text2;
      return;
    }
  }
  node.textContent = text2;
}
var unitlessNumbers = new Set(
  "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
    " "
  )
);
function setValueForStyle(style2, styleName, value) {
  var isCustomProperty = 0 === styleName.indexOf("--");
  null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style2.setProperty(styleName, "") : "float" === styleName ? style2.cssFloat = "" : style2[styleName] = "" : isCustomProperty ? style2.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style2.cssFloat = value : style2[styleName] = ("" + value).trim() : style2[styleName] = value + "px";
}
function setValueForStyles(node, styles, prevStyles) {
  if (null != styles && "object" !== typeof styles)
    throw Error(formatProdErrorMessage(62));
  node = node.style;
  if (null != prevStyles) {
    for (var styleName in prevStyles)
      !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "");
    for (var styleName$16 in styles)
      styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
  } else
    for (var styleName$17 in styles)
      styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
}
function isCustomElement(tagName) {
  if (-1 === tagName.indexOf("-")) return false;
  switch (tagName) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return false;
    default:
      return true;
  }
}
var aliases = /* @__PURE__ */ new Map([
  ["acceptCharset", "accept-charset"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
  ["crossOrigin", "crossorigin"],
  ["accentHeight", "accent-height"],
  ["alignmentBaseline", "alignment-baseline"],
  ["arabicForm", "arabic-form"],
  ["baselineShift", "baseline-shift"],
  ["capHeight", "cap-height"],
  ["clipPath", "clip-path"],
  ["clipRule", "clip-rule"],
  ["colorInterpolation", "color-interpolation"],
  ["colorInterpolationFilters", "color-interpolation-filters"],
  ["colorProfile", "color-profile"],
  ["colorRendering", "color-rendering"],
  ["dominantBaseline", "dominant-baseline"],
  ["enableBackground", "enable-background"],
  ["fillOpacity", "fill-opacity"],
  ["fillRule", "fill-rule"],
  ["floodColor", "flood-color"],
  ["floodOpacity", "flood-opacity"],
  ["fontFamily", "font-family"],
  ["fontSize", "font-size"],
  ["fontSizeAdjust", "font-size-adjust"],
  ["fontStretch", "font-stretch"],
  ["fontStyle", "font-style"],
  ["fontVariant", "font-variant"],
  ["fontWeight", "font-weight"],
  ["glyphName", "glyph-name"],
  ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
  ["glyphOrientationVertical", "glyph-orientation-vertical"],
  ["horizAdvX", "horiz-adv-x"],
  ["horizOriginX", "horiz-origin-x"],
  ["imageRendering", "image-rendering"],
  ["letterSpacing", "letter-spacing"],
  ["lightingColor", "lighting-color"],
  ["markerEnd", "marker-end"],
  ["markerMid", "marker-mid"],
  ["markerStart", "marker-start"],
  ["overlinePosition", "overline-position"],
  ["overlineThickness", "overline-thickness"],
  ["paintOrder", "paint-order"],
  ["panose-1", "panose-1"],
  ["pointerEvents", "pointer-events"],
  ["renderingIntent", "rendering-intent"],
  ["shapeRendering", "shape-rendering"],
  ["stopColor", "stop-color"],
  ["stopOpacity", "stop-opacity"],
  ["strikethroughPosition", "strikethrough-position"],
  ["strikethroughThickness", "strikethrough-thickness"],
  ["strokeDasharray", "stroke-dasharray"],
  ["strokeDashoffset", "stroke-dashoffset"],
  ["strokeLinecap", "stroke-linecap"],
  ["strokeLinejoin", "stroke-linejoin"],
  ["strokeMiterlimit", "stroke-miterlimit"],
  ["strokeOpacity", "stroke-opacity"],
  ["strokeWidth", "stroke-width"],
  ["textAnchor", "text-anchor"],
  ["textDecoration", "text-decoration"],
  ["textRendering", "text-rendering"],
  ["transformOrigin", "transform-origin"],
  ["underlinePosition", "underline-position"],
  ["underlineThickness", "underline-thickness"],
  ["unicodeBidi", "unicode-bidi"],
  ["unicodeRange", "unicode-range"],
  ["unitsPerEm", "units-per-em"],
  ["vAlphabetic", "v-alphabetic"],
  ["vHanging", "v-hanging"],
  ["vIdeographic", "v-ideographic"],
  ["vMathematical", "v-mathematical"],
  ["vectorEffect", "vector-effect"],
  ["vertAdvY", "vert-adv-y"],
  ["vertOriginX", "vert-origin-x"],
  ["vertOriginY", "vert-origin-y"],
  ["wordSpacing", "word-spacing"],
  ["writingMode", "writing-mode"],
  ["xmlnsXlink", "xmlns:xlink"],
  ["xHeight", "x-height"]
]), isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
function sanitizeURL(url) {
  return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
}
var currentReplayingEvent = null;
function getEventTarget(nativeEvent) {
  nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
  nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
  return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
}
var restoreTarget = null, restoreQueue = null;
function restoreStateOfTarget(target) {
  var internalInstance = getInstanceFromNode(target);
  if (internalInstance && (target = internalInstance.stateNode)) {
    var props = target[internalPropsKey] || null;
    a: switch (target = internalInstance.stateNode, internalInstance.type) {
      case "input":
        updateInput(
          target,
          props.value,
          props.defaultValue,
          props.defaultValue,
          props.checked,
          props.defaultChecked,
          props.type,
          props.name
        );
        internalInstance = props.name;
        if ("radio" === props.type && null != internalInstance) {
          for (props = target; props.parentNode; ) props = props.parentNode;
          props = props.querySelectorAll(
            'input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes(
              "" + internalInstance
            ) + '"][type="radio"]'
          );
          for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
            var otherNode = props[internalInstance];
            if (otherNode !== target && otherNode.form === target.form) {
              var otherProps = otherNode[internalPropsKey] || null;
              if (!otherProps) throw Error(formatProdErrorMessage(90));
              updateInput(
                otherNode,
                otherProps.value,
                otherProps.defaultValue,
                otherProps.defaultValue,
                otherProps.checked,
                otherProps.defaultChecked,
                otherProps.type,
                otherProps.name
              );
            }
          }
          for (internalInstance = 0; internalInstance < props.length; internalInstance++)
            otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
        }
        break a;
      case "textarea":
        updateTextarea(target, props.value, props.defaultValue);
        break a;
      case "select":
        internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, false);
    }
  }
}
var isInsideEventHandler = false;
function batchedUpdates$1(fn, a, b) {
  if (isInsideEventHandler) return fn(a, b);
  isInsideEventHandler = true;
  try {
    var JSCompiler_inline_result = fn(a);
    return JSCompiler_inline_result;
  } finally {
    if (isInsideEventHandler = false, null !== restoreTarget || null !== restoreQueue) {
      if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn))
        for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
    }
  }
}
function getListener(inst, registrationName) {
  var stateNode = inst.stateNode;
  if (null === stateNode) return null;
  var props = stateNode[internalPropsKey] || null;
  if (null === props) return null;
  stateNode = props[registrationName];
  a: switch (registrationName) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
      inst = !props;
      break a;
    default:
      inst = false;
  }
  if (inst) return null;
  if (stateNode && "function" !== typeof stateNode)
    throw Error(
      formatProdErrorMessage(231, registrationName, typeof stateNode)
    );
  return stateNode;
}
var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), passiveBrowserEventsSupported = false;
if (canUseDOM)
  try {
    var options = {};
    Object.defineProperty(options, "passive", {
      get: function() {
        passiveBrowserEventsSupported = true;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (e) {
    passiveBrowserEventsSupported = false;
  }
var root = null, startText = null, fallbackText = null;
function getData() {
  if (fallbackText) return fallbackText;
  var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
  for (start = 0; start < startLength && startValue[start] === endValue[start]; start++) ;
  var minEnd = startLength - start;
  for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++) ;
  return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
}
function getEventCharCode(nativeEvent) {
  var keyCode = nativeEvent.keyCode;
  "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
  10 === nativeEvent && (nativeEvent = 13);
  return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
}
function functionThatReturnsTrue() {
  return true;
}
function functionThatReturnsFalse() {
  return false;
}
function createSyntheticEvent(Interface) {
  function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
    this._reactName = reactName;
    this._targetInst = targetInst;
    this.type = reactEventType;
    this.nativeEvent = nativeEvent;
    this.target = nativeEventTarget;
    this.currentTarget = null;
    for (var propName in Interface)
      Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
    this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : false === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
    this.isPropagationStopped = functionThatReturnsFalse;
    return this;
  }
  assign(SyntheticBaseEvent.prototype, {
    preventDefault: function() {
      this.defaultPrevented = true;
      var event = this.nativeEvent;
      event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
    },
    stopPropagation: function() {
      var event = this.nativeEvent;
      event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
    },
    persist: function() {
    },
    isPersistent: functionThatReturnsTrue
  });
  return SyntheticBaseEvent;
}
var EventInterface = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: function(event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: 0,
  isTrusted: 0
}, SyntheticEvent = createSyntheticEvent(EventInterface), UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 }), SyntheticUIEvent = createSyntheticEvent(UIEventInterface), lastMovementX, lastMovementY, lastMouseEvent, MouseEventInterface = assign({}, UIEventInterface, {
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  getModifierState: getEventModifierState,
  button: 0,
  buttons: 0,
  relatedTarget: function(event) {
    return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
  },
  movementX: function(event) {
    if ("movementX" in event) return event.movementX;
    event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
    return lastMovementX;
  },
  movementY: function(event) {
    return "movementY" in event ? event.movementY : lastMovementY;
  }
}), SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface), DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 }), SyntheticDragEvent = createSyntheticEvent(DragEventInterface), FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 }), SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface), AnimationEventInterface = assign({}, EventInterface, {
  animationName: 0,
  elapsedTime: 0,
  pseudoElement: 0
}), SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface), ClipboardEventInterface = assign({}, EventInterface, {
  clipboardData: function(event) {
    return "clipboardData" in event ? event.clipboardData : window.clipboardData;
  }
}), SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface), CompositionEventInterface = assign({}, EventInterface, { data: 0 }), SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface), normalizeKey = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, translateToKey = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, modifierKeyToProp = {
  Alt: "altKey",
  Control: "ctrlKey",
  Meta: "metaKey",
  Shift: "shiftKey"
};
function modifierStateGetter(keyArg) {
  var nativeEvent = this.nativeEvent;
  return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
}
function getEventModifierState() {
  return modifierStateGetter;
}
var KeyboardEventInterface = assign({}, UIEventInterface, {
  key: function(nativeEvent) {
    if (nativeEvent.key) {
      var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
      if ("Unidentified" !== key) return key;
    }
    return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
  },
  code: 0,
  location: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  repeat: 0,
  locale: 0,
  getModifierState: getEventModifierState,
  charCode: function(event) {
    return "keypress" === event.type ? getEventCharCode(event) : 0;
  },
  keyCode: function(event) {
    return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
  },
  which: function(event) {
    return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
  }
}), SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface), PointerEventInterface = assign({}, MouseEventInterface, {
  pointerId: 0,
  width: 0,
  height: 0,
  pressure: 0,
  tangentialPressure: 0,
  tiltX: 0,
  tiltY: 0,
  twist: 0,
  pointerType: 0,
  isPrimary: 0
}), SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface), TouchEventInterface = assign({}, UIEventInterface, {
  touches: 0,
  targetTouches: 0,
  changedTouches: 0,
  altKey: 0,
  metaKey: 0,
  ctrlKey: 0,
  shiftKey: 0,
  getModifierState: getEventModifierState
}), SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface), TransitionEventInterface = assign({}, EventInterface, {
  propertyName: 0,
  elapsedTime: 0,
  pseudoElement: 0
}), SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface), WheelEventInterface = assign({}, MouseEventInterface, {
  deltaX: function(event) {
    return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
  },
  deltaY: function(event) {
    return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface), ToggleEventInterface = assign({}, EventInterface, {
  newState: 0,
  oldState: 0
}), SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface), END_KEYCODES = [9, 13, 27, 32], canUseCompositionEvent = canUseDOM && "CompositionEvent" in window, documentMode = null;
canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode, useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode), SPACEBAR_CHAR = String.fromCharCode(32), hasSpaceKeypress = false;
function isFallbackCompositionEnd(domEventName, nativeEvent) {
  switch (domEventName) {
    case "keyup":
      return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
    case "keydown":
      return 229 !== nativeEvent.keyCode;
    case "keypress":
    case "mousedown":
    case "focusout":
      return true;
    default:
      return false;
  }
}
function getDataFromCustomEvent(nativeEvent) {
  nativeEvent = nativeEvent.detail;
  return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
}
var isComposing = false;
function getNativeBeforeInputChars(domEventName, nativeEvent) {
  switch (domEventName) {
    case "compositionend":
      return getDataFromCustomEvent(nativeEvent);
    case "keypress":
      if (32 !== nativeEvent.which) return null;
      hasSpaceKeypress = true;
      return SPACEBAR_CHAR;
    case "textInput":
      return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
    default:
      return null;
  }
}
function getFallbackBeforeInputChars(domEventName, nativeEvent) {
  if (isComposing)
    return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = false, domEventName) : null;
  switch (domEventName) {
    case "paste":
      return null;
    case "keypress":
      if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
        if (nativeEvent.char && 1 < nativeEvent.char.length)
          return nativeEvent.char;
        if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
      }
      return null;
    case "compositionend":
      return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
    default:
      return null;
  }
}
var supportedInputTypes = {
  color: true,
  date: true,
  datetime: true,
  "datetime-local": true,
  email: true,
  month: true,
  number: true,
  password: true,
  range: true,
  search: true,
  tel: true,
  text: true,
  time: true,
  url: true,
  week: true
};
function isTextInputElement(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? true : false;
}
function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
  restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
  inst = accumulateTwoPhaseListeners(inst, "onChange");
  0 < inst.length && (nativeEvent = new SyntheticEvent(
    "onChange",
    "change",
    null,
    nativeEvent,
    target
  ), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
}
var activeElement$1 = null, activeElementInst$1 = null;
function runEventInBatch(dispatchQueue) {
  processDispatchQueue(dispatchQueue, 0);
}
function getInstIfValueChanged(targetInst) {
  var targetNode = getNodeFromInstance(targetInst);
  if (updateValueIfChanged(targetNode)) return targetInst;
}
function getTargetInstForChangeEvent(domEventName, targetInst) {
  if ("change" === domEventName) return targetInst;
}
var isInputEventSupported = false;
if (canUseDOM) {
  var JSCompiler_inline_result$jscomp$282;
  if (canUseDOM) {
    var isSupported$jscomp$inline_417 = "oninput" in document;
    if (!isSupported$jscomp$inline_417) {
      var element$jscomp$inline_418 = document.createElement("div");
      element$jscomp$inline_418.setAttribute("oninput", "return;");
      isSupported$jscomp$inline_417 = "function" === typeof element$jscomp$inline_418.oninput;
    }
    JSCompiler_inline_result$jscomp$282 = isSupported$jscomp$inline_417;
  } else JSCompiler_inline_result$jscomp$282 = false;
  isInputEventSupported = JSCompiler_inline_result$jscomp$282 && (!document.documentMode || 9 < document.documentMode);
}
function stopWatchingForValueChange() {
  activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
}
function handlePropertyChange(nativeEvent) {
  if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
    var dispatchQueue = [];
    createAndAccumulateChangeEvent(
      dispatchQueue,
      activeElementInst$1,
      nativeEvent,
      getEventTarget(nativeEvent)
    );
    batchedUpdates$1(runEventInBatch, dispatchQueue);
  }
}
function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
  "focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
}
function getTargetInstForInputEventPolyfill(domEventName) {
  if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName)
    return getInstIfValueChanged(activeElementInst$1);
}
function getTargetInstForClickEvent(domEventName, targetInst) {
  if ("click" === domEventName) return getInstIfValueChanged(targetInst);
}
function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
  if ("input" === domEventName || "change" === domEventName)
    return getInstIfValueChanged(targetInst);
}
function is(x, y) {
  return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
}
var objectIs = "function" === typeof Object.is ? Object.is : is;
function shallowEqual(objA, objB) {
  if (objectIs(objA, objB)) return true;
  if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB)
    return false;
  var keysA = Object.keys(objA), keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (keysB = 0; keysB < keysA.length; keysB++) {
    var currentKey = keysA[keysB];
    if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
      return false;
  }
  return true;
}
function getLeafNode(node) {
  for (; node && node.firstChild; ) node = node.firstChild;
  return node;
}
function getNodeForCharacterOffset(root2, offset) {
  var node = getLeafNode(root2);
  root2 = 0;
  for (var nodeEnd; node; ) {
    if (3 === node.nodeType) {
      nodeEnd = root2 + node.textContent.length;
      if (root2 <= offset && nodeEnd >= offset)
        return { node, offset: offset - root2 };
      root2 = nodeEnd;
    }
    a: {
      for (; node; ) {
        if (node.nextSibling) {
          node = node.nextSibling;
          break a;
        }
        node = node.parentNode;
      }
      node = void 0;
    }
    node = getLeafNode(node);
  }
}
function containsNode(outerNode, innerNode) {
  return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && 3 === outerNode.nodeType ? false : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
}
function getActiveElementDeep(containerInfo) {
  containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
  for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement; ) {
    try {
      var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
    } catch (err) {
      JSCompiler_inline_result = false;
    }
    if (JSCompiler_inline_result) containerInfo = element.contentWindow;
    else break;
    element = getActiveElement(containerInfo.document);
  }
  return element;
}
function hasSelectionCapabilities(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
}
var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode, activeElement = null, activeElementInst = null, lastSelection = null, mouseDown = false;
function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
  var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
  mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
    anchorNode: doc.anchorNode,
    anchorOffset: doc.anchorOffset,
    focusNode: doc.focusNode,
    focusOffset: doc.focusOffset
  }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent(
    "onSelect",
    "select",
    null,
    nativeEvent,
    nativeEventTarget
  ), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
}
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes["Webkit" + styleProp] = "webkit" + eventName;
  prefixes["Moz" + styleProp] = "moz" + eventName;
  return prefixes;
}
var vendorPrefixes = {
  animationend: makePrefixMap("Animation", "AnimationEnd"),
  animationiteration: makePrefixMap("Animation", "AnimationIteration"),
  animationstart: makePrefixMap("Animation", "AnimationStart"),
  transitionrun: makePrefixMap("Transition", "TransitionRun"),
  transitionstart: makePrefixMap("Transition", "TransitionStart"),
  transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
  transitionend: makePrefixMap("Transition", "TransitionEnd")
}, prefixedEventNames = {}, style = {};
canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
  if (!vendorPrefixes[eventName]) return eventName;
  var prefixMap = vendorPrefixes[eventName], styleProp;
  for (styleProp in prefixMap)
    if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
      return prefixedEventNames[eventName] = prefixMap[styleProp];
  return eventName;
}
var ANIMATION_END = getVendorPrefixedEventName("animationend"), ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration"), ANIMATION_START = getVendorPrefixedEventName("animationstart"), TRANSITION_RUN = getVendorPrefixedEventName("transitionrun"), TRANSITION_START = getVendorPrefixedEventName("transitionstart"), TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel"), TRANSITION_END = getVendorPrefixedEventName("transitionend"), topLevelEventsToReactNames = /* @__PURE__ */ new Map(), simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
  " "
);
simpleEventPluginEvents.push("scrollEnd");
function registerSimpleEvent(domEventName, reactName) {
  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]);
}
var CapturedStacks = /* @__PURE__ */ new WeakMap();
function createCapturedValueAtFiber(value, source) {
  if ("object" === typeof value && null !== value) {
    var existing = CapturedStacks.get(value);
    if (void 0 !== existing) return existing;
    source = {
      value,
      source,
      stack: getStackByFiberInDevAndProd(source)
    };
    CapturedStacks.set(value, source);
    return source;
  }
  return {
    value,
    source,
    stack: getStackByFiberInDevAndProd(source)
  };
}
var concurrentQueues = [], concurrentQueuesIndex = 0, concurrentlyUpdatedLanes = 0;
function finishQueueingConcurrentUpdates() {
  for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex; ) {
    var fiber = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var queue = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var update = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var lane = concurrentQueues[i];
    concurrentQueues[i++] = null;
    if (null !== queue && null !== update) {
      var pending = queue.pending;
      null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
      queue.pending = update;
    }
    0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
  }
}
function enqueueUpdate$1(fiber, queue, update, lane) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;
  concurrentlyUpdatedLanes |= lane;
  fiber.lanes |= lane;
  fiber = fiber.alternate;
  null !== fiber && (fiber.lanes |= lane);
}
function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
  enqueueUpdate$1(fiber, queue, update, lane);
  return getRootForUpdatedFiber(fiber);
}
function enqueueConcurrentRenderForLane(fiber, lane) {
  enqueueUpdate$1(fiber, null, null, lane);
  return getRootForUpdatedFiber(fiber);
}
function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
  sourceFiber.lanes |= lane;
  var alternate = sourceFiber.alternate;
  null !== alternate && (alternate.lanes |= lane);
  for (var isHidden = false, parent = sourceFiber.return; null !== parent; )
    parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
  return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
}
function getRootForUpdatedFiber(sourceFiber) {
  if (50 < nestedUpdateCount)
    throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
  for (var parent = sourceFiber.return; null !== parent; )
    sourceFiber = parent, parent = sourceFiber.return;
  return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
}
var emptyContextObject = {};
function FiberNode(tag, pendingProps, key, mode) {
  this.tag = tag;
  this.key = key;
  this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
  this.index = 0;
  this.refCleanup = this.ref = null;
  this.pendingProps = pendingProps;
  this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
  this.mode = mode;
  this.subtreeFlags = this.flags = 0;
  this.deletions = null;
  this.childLanes = this.lanes = 0;
  this.alternate = null;
}
function createFiberImplClass(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
}
function shouldConstruct(Component2) {
  Component2 = Component2.prototype;
  return !(!Component2 || !Component2.isReactComponent);
}
function createWorkInProgress(current, pendingProps) {
  var workInProgress2 = current.alternate;
  null === workInProgress2 ? (workInProgress2 = createFiberImplClass(
    current.tag,
    pendingProps,
    current.key,
    current.mode
  ), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
  workInProgress2.flags = current.flags & 65011712;
  workInProgress2.childLanes = current.childLanes;
  workInProgress2.lanes = current.lanes;
  workInProgress2.child = current.child;
  workInProgress2.memoizedProps = current.memoizedProps;
  workInProgress2.memoizedState = current.memoizedState;
  workInProgress2.updateQueue = current.updateQueue;
  pendingProps = current.dependencies;
  workInProgress2.dependencies = null === pendingProps ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
  workInProgress2.sibling = current.sibling;
  workInProgress2.index = current.index;
  workInProgress2.ref = current.ref;
  workInProgress2.refCleanup = current.refCleanup;
  return workInProgress2;
}
function resetWorkInProgress(workInProgress2, renderLanes2) {
  workInProgress2.flags &= 65011714;
  var current = workInProgress2.alternate;
  null === current ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies = null === renderLanes2 ? null : {
    lanes: renderLanes2.lanes,
    firstContext: renderLanes2.firstContext
  });
  return workInProgress2;
}
function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
  var fiberTag = 0;
  owner = type;
  if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
  else if ("string" === typeof type)
    fiberTag = isHostHoistableType(
      type,
      pendingProps,
      contextStackCursor.current
    ) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
  else
    a: switch (type) {
      case REACT_ACTIVITY_TYPE:
        return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(pendingProps.children, mode, lanes, key);
      case REACT_STRICT_MODE_TYPE:
        fiberTag = 8;
        mode |= 24;
        break;
      case REACT_PROFILER_TYPE:
        return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
      case REACT_SUSPENSE_TYPE:
        return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
      case REACT_SUSPENSE_LIST_TYPE:
        return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
      default:
        if ("object" === typeof type && null !== type)
          switch (type.$$typeof) {
            case REACT_PROVIDER_TYPE:
            case REACT_CONTEXT_TYPE:
              fiberTag = 10;
              break a;
            case REACT_CONSUMER_TYPE:
              fiberTag = 9;
              break a;
            case REACT_FORWARD_REF_TYPE:
              fiberTag = 11;
              break a;
            case REACT_MEMO_TYPE:
              fiberTag = 14;
              break a;
            case REACT_LAZY_TYPE:
              fiberTag = 16;
              owner = null;
              break a;
          }
        fiberTag = 29;
        pendingProps = Error(
          formatProdErrorMessage(130, null === type ? "null" : typeof type, "")
        );
        owner = null;
    }
  key = createFiberImplClass(fiberTag, pendingProps, key, mode);
  key.elementType = type;
  key.type = owner;
  key.lanes = lanes;
  return key;
}
function createFiberFromFragment(elements, mode, lanes, key) {
  elements = createFiberImplClass(7, elements, key, mode);
  elements.lanes = lanes;
  return elements;
}
function createFiberFromText(content, mode, lanes) {
  content = createFiberImplClass(6, content, null, mode);
  content.lanes = lanes;
  return content;
}
function createFiberFromPortal(portal, mode, lanes) {
  mode = createFiberImplClass(
    4,
    null !== portal.children ? portal.children : [],
    portal.key,
    mode
  );
  mode.lanes = lanes;
  mode.stateNode = {
    containerInfo: portal.containerInfo,
    pendingChildren: null,
    implementation: portal.implementation
  };
  return mode;
}
var forkStack = [], forkStackIndex = 0, treeForkProvider = null, treeForkCount = 0, idStack = [], idStackIndex = 0, treeContextProvider = null, treeContextId = 1, treeContextOverflow = "";
function pushTreeFork(workInProgress2, totalChildren) {
  forkStack[forkStackIndex++] = treeForkCount;
  forkStack[forkStackIndex++] = treeForkProvider;
  treeForkProvider = workInProgress2;
  treeForkCount = totalChildren;
}
function pushTreeId(workInProgress2, totalChildren, index2) {
  idStack[idStackIndex++] = treeContextId;
  idStack[idStackIndex++] = treeContextOverflow;
  idStack[idStackIndex++] = treeContextProvider;
  treeContextProvider = workInProgress2;
  var baseIdWithLeadingBit = treeContextId;
  workInProgress2 = treeContextOverflow;
  var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
  baseIdWithLeadingBit &= ~(1 << baseLength);
  index2 += 1;
  var length = 32 - clz32(totalChildren) + baseLength;
  if (30 < length) {
    var numberOfOverflowBits = baseLength - baseLength % 5;
    length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
    baseIdWithLeadingBit >>= numberOfOverflowBits;
    baseLength -= numberOfOverflowBits;
    treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index2 << baseLength | baseIdWithLeadingBit;
    treeContextOverflow = length + workInProgress2;
  } else
    treeContextId = 1 << length | index2 << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
}
function pushMaterializedTreeId(workInProgress2) {
  null !== workInProgress2.return && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
}
function popTreeContext(workInProgress2) {
  for (; workInProgress2 === treeForkProvider; )
    treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
  for (; workInProgress2 === treeContextProvider; )
    treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
}
var hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = false, hydrationErrors = null, rootOrSingletonContext = false, HydrationMismatchException = Error(formatProdErrorMessage(519));
function throwOnHydrationMismatch(fiber) {
  var error = Error(formatProdErrorMessage(418, ""));
  queueHydrationError(createCapturedValueAtFiber(error, fiber));
  throw HydrationMismatchException;
}
function prepareToHydrateHostInstance(fiber) {
  var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
  instance[internalInstanceKey] = fiber;
  instance[internalPropsKey] = props;
  switch (type) {
    case "dialog":
      listenToNonDelegatedEvent("cancel", instance);
      listenToNonDelegatedEvent("close", instance);
      break;
    case "iframe":
    case "object":
    case "embed":
      listenToNonDelegatedEvent("load", instance);
      break;
    case "video":
    case "audio":
      for (type = 0; type < mediaEventTypes.length; type++)
        listenToNonDelegatedEvent(mediaEventTypes[type], instance);
      break;
    case "source":
      listenToNonDelegatedEvent("error", instance);
      break;
    case "img":
    case "image":
    case "link":
      listenToNonDelegatedEvent("error", instance);
      listenToNonDelegatedEvent("load", instance);
      break;
    case "details":
      listenToNonDelegatedEvent("toggle", instance);
      break;
    case "input":
      listenToNonDelegatedEvent("invalid", instance);
      initInput(
        instance,
        props.value,
        props.defaultValue,
        props.checked,
        props.defaultChecked,
        props.type,
        props.name,
        true
      );
      track(instance);
      break;
    case "select":
      listenToNonDelegatedEvent("invalid", instance);
      break;
    case "textarea":
      listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children), track(instance);
  }
  type = props.children;
  "string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || true === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = true) : instance = false;
  instance || throwOnHydrationMismatch(fiber);
}
function popToNextHostParent(fiber) {
  for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
    switch (hydrationParentFiber.tag) {
      case 5:
      case 13:
        rootOrSingletonContext = false;
        return;
      case 27:
      case 3:
        rootOrSingletonContext = true;
        return;
      default:
        hydrationParentFiber = hydrationParentFiber.return;
    }
}
function popHydrationState(fiber) {
  if (fiber !== hydrationParentFiber) return false;
  if (!isHydrating) return popToNextHostParent(fiber), isHydrating = true, false;
  var tag = fiber.tag, JSCompiler_temp;
  if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
    if (JSCompiler_temp = 5 === tag)
      JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
    JSCompiler_temp = !JSCompiler_temp;
  }
  JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
  popToNextHostParent(fiber);
  if (13 === tag) {
    fiber = fiber.memoizedState;
    fiber = null !== fiber ? fiber.dehydrated : null;
    if (!fiber) throw Error(formatProdErrorMessage(317));
    a: {
      fiber = fiber.nextSibling;
      for (tag = 0; fiber; ) {
        if (8 === fiber.nodeType)
          if (JSCompiler_temp = fiber.data, "/$" === JSCompiler_temp) {
            if (0 === tag) {
              nextHydratableInstance = getNextHydratable(fiber.nextSibling);
              break a;
            }
            tag--;
          } else
            "$" !== JSCompiler_temp && "$!" !== JSCompiler_temp && "$?" !== JSCompiler_temp || tag++;
        fiber = fiber.nextSibling;
      }
      nextHydratableInstance = null;
    }
  } else
    27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
  return true;
}
function resetHydrationState() {
  nextHydratableInstance = hydrationParentFiber = null;
  isHydrating = false;
}
function upgradeHydrationErrorsToRecoverable() {
  var queuedErrors = hydrationErrors;
  null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(
    workInProgressRootRecoverableErrors,
    queuedErrors
  ), hydrationErrors = null);
  return queuedErrors;
}
function queueHydrationError(error) {
  null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
}
var valueCursor = createCursor(null), currentlyRenderingFiber$1 = null, lastContextDependency = null;
function pushProvider(providerFiber, context, nextValue) {
  push(valueCursor, context._currentValue);
  context._currentValue = nextValue;
}
function popProvider(context) {
  context._currentValue = valueCursor.current;
  pop(valueCursor);
}
function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
  for (; null !== parent; ) {
    var alternate = parent.alternate;
    (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, null !== alternate && (alternate.childLanes |= renderLanes2)) : null !== alternate && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
    if (parent === propagationRoot) break;
    parent = parent.return;
  }
}
function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
  var fiber = workInProgress2.child;
  null !== fiber && (fiber.return = workInProgress2);
  for (; null !== fiber; ) {
    var list = fiber.dependencies;
    if (null !== list) {
      var nextFiber = fiber.child;
      list = list.firstContext;
      a: for (; null !== list; ) {
        var dependency = list;
        list = fiber;
        for (var i = 0; i < contexts.length; i++)
          if (dependency.context === contexts[i]) {
            list.lanes |= renderLanes2;
            dependency = list.alternate;
            null !== dependency && (dependency.lanes |= renderLanes2);
            scheduleContextWorkOnParentPath(
              list.return,
              renderLanes2,
              workInProgress2
            );
            forcePropagateEntireTree || (nextFiber = null);
            break a;
          }
        list = dependency.next;
      }
    } else if (18 === fiber.tag) {
      nextFiber = fiber.return;
      if (null === nextFiber) throw Error(formatProdErrorMessage(341));
      nextFiber.lanes |= renderLanes2;
      list = nextFiber.alternate;
      null !== list && (list.lanes |= renderLanes2);
      scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
      nextFiber = null;
    } else nextFiber = fiber.child;
    if (null !== nextFiber) nextFiber.return = fiber;
    else
      for (nextFiber = fiber; null !== nextFiber; ) {
        if (nextFiber === workInProgress2) {
          nextFiber = null;
          break;
        }
        fiber = nextFiber.sibling;
        if (null !== fiber) {
          fiber.return = nextFiber.return;
          nextFiber = fiber;
          break;
        }
        nextFiber = nextFiber.return;
      }
    fiber = nextFiber;
  }
}
function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
  current = null;
  for (var parent = workInProgress2, isInsidePropagationBailout = false; null !== parent; ) {
    if (!isInsidePropagationBailout) {
      if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = true;
      else if (0 !== (parent.flags & 262144)) break;
    }
    if (10 === parent.tag) {
      var currentParent = parent.alternate;
      if (null === currentParent) throw Error(formatProdErrorMessage(387));
      currentParent = currentParent.memoizedProps;
      if (null !== currentParent) {
        var context = parent.type;
        objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
      }
    } else if (parent === hostTransitionProviderCursor.current) {
      currentParent = parent.alternate;
      if (null === currentParent) throw Error(formatProdErrorMessage(387));
      currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
    }
    parent = parent.return;
  }
  null !== current && propagateContextChanges(
    workInProgress2,
    current,
    renderLanes2,
    forcePropagateEntireTree
  );
  workInProgress2.flags |= 262144;
}
function checkIfContextChanged(currentDependencies) {
  for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies; ) {
    if (!objectIs(
      currentDependencies.context._currentValue,
      currentDependencies.memoizedValue
    ))
      return true;
    currentDependencies = currentDependencies.next;
  }
  return false;
}
function prepareToReadContext(workInProgress2) {
  currentlyRenderingFiber$1 = workInProgress2;
  lastContextDependency = null;
  workInProgress2 = workInProgress2.dependencies;
  null !== workInProgress2 && (workInProgress2.firstContext = null);
}
function readContext(context) {
  return readContextForConsumer(currentlyRenderingFiber$1, context);
}
function readContextDuringReconciliation(consumer, context) {
  null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
  return readContextForConsumer(consumer, context);
}
function readContextForConsumer(consumer, context) {
  var value = context._currentValue;
  context = { context, memoizedValue: value, next: null };
  if (null === lastContextDependency) {
    if (null === consumer) throw Error(formatProdErrorMessage(308));
    lastContextDependency = context;
    consumer.dependencies = { lanes: 0, firstContext: context };
    consumer.flags |= 524288;
  } else lastContextDependency = lastContextDependency.next = context;
  return value;
}
var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
  var listeners = [], signal = this.signal = {
    aborted: false,
    addEventListener: function(type, listener) {
      listeners.push(listener);
    }
  };
  this.abort = function() {
    signal.aborted = true;
    listeners.forEach(function(listener) {
      return listener();
    });
  };
}, scheduleCallback$2 = Scheduler.unstable_scheduleCallback, NormalPriority = Scheduler.unstable_NormalPriority, CacheContext = {
  $$typeof: REACT_CONTEXT_TYPE,
  Consumer: null,
  Provider: null,
  _currentValue: null,
  _currentValue2: null,
  _threadCount: 0
};
function createCache() {
  return {
    controller: new AbortControllerLocal(),
    data: /* @__PURE__ */ new Map(),
    refCount: 0
  };
}
function releaseCache(cache) {
  cache.refCount--;
  0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
    cache.controller.abort();
  });
}
var currentEntangledListeners = null, currentEntangledPendingCount = 0, currentEntangledLane = 0, currentEntangledActionThenable = null;
function entangleAsyncAction(transition, thenable) {
  if (null === currentEntangledListeners) {
    var entangledListeners = currentEntangledListeners = [];
    currentEntangledPendingCount = 0;
    currentEntangledLane = requestTransitionLane();
    currentEntangledActionThenable = {
      status: "pending",
      value: void 0,
      then: function(resolve) {
        entangledListeners.push(resolve);
      }
    };
  }
  currentEntangledPendingCount++;
  thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
  return thenable;
}
function pingEngtangledActionScope() {
  if (0 === --currentEntangledPendingCount && null !== currentEntangledListeners) {
    null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
    var listeners = currentEntangledListeners;
    currentEntangledListeners = null;
    currentEntangledLane = 0;
    currentEntangledActionThenable = null;
    for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
  }
}
function chainThenableValue(thenable, result) {
  var listeners = [], thenableWithOverride = {
    status: "pending",
    value: null,
    reason: null,
    then: function(resolve) {
      listeners.push(resolve);
    }
  };
  thenable.then(
    function() {
      thenableWithOverride.status = "fulfilled";
      thenableWithOverride.value = result;
      for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
    },
    function(error) {
      thenableWithOverride.status = "rejected";
      thenableWithOverride.reason = error;
      for (error = 0; error < listeners.length; error++)
        (0, listeners[error])(void 0);
    }
  );
  return thenableWithOverride;
}
var prevOnStartTransitionFinish = ReactSharedInternals.S;
ReactSharedInternals.S = function(transition, returnValue) {
  "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
  null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
};
var resumedCache = createCursor(null);
function peekCacheFromPool() {
  var cacheResumedFromPreviousRender = resumedCache.current;
  return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
}
function pushTransition(offscreenWorkInProgress, prevCachePool) {
  null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
}
function getSuspendedCache() {
  var cacheFromPool = peekCacheFromPool();
  return null === cacheFromPool ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
}
var SuspenseException = Error(formatProdErrorMessage(460)), SuspenseyCommitException = Error(formatProdErrorMessage(474)), SuspenseActionException = Error(formatProdErrorMessage(542)), noopSuspenseyCommitThenable = { then: function() {
} };
function isThenableResolved(thenable) {
  thenable = thenable.status;
  return "fulfilled" === thenable || "rejected" === thenable;
}
function noop$3() {
}
function trackUsedThenable(thenableState2, thenable, index2) {
  index2 = thenableState2[index2];
  void 0 === index2 ? thenableState2.push(thenable) : index2 !== thenable && (thenable.then(noop$3, noop$3), thenable = index2);
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
    default:
      if ("string" === typeof thenable.status) thenable.then(noop$3, noop$3);
      else {
        thenableState2 = workInProgressRoot;
        if (null !== thenableState2 && 100 < thenableState2.shellSuspendCounter)
          throw Error(formatProdErrorMessage(482));
        thenableState2 = thenable;
        thenableState2.status = "pending";
        thenableState2.then(
          function(fulfilledValue) {
            if ("pending" === thenable.status) {
              var fulfilledThenable = thenable;
              fulfilledThenable.status = "fulfilled";
              fulfilledThenable.value = fulfilledValue;
            }
          },
          function(error) {
            if ("pending" === thenable.status) {
              var rejectedThenable = thenable;
              rejectedThenable.status = "rejected";
              rejectedThenable.reason = error;
            }
          }
        );
      }
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
      }
      suspendedThenable = thenable;
      throw SuspenseException;
  }
}
var suspendedThenable = null;
function getSuspendedThenable() {
  if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
  var thenable = suspendedThenable;
  suspendedThenable = null;
  return thenable;
}
function checkIfUseWrappedInAsyncCatch(rejectedReason) {
  if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
    throw Error(formatProdErrorMessage(483));
}
var hasForceUpdate = false;
function initializeUpdateQueue(fiber) {
  fiber.updateQueue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, lanes: 0, hiddenCallbacks: null },
    callbacks: null
  };
}
function cloneUpdateQueue(current, workInProgress2) {
  current = current.updateQueue;
  workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
    baseState: current.baseState,
    firstBaseUpdate: current.firstBaseUpdate,
    lastBaseUpdate: current.lastBaseUpdate,
    shared: current.shared,
    callbacks: null
  });
}
function createUpdate(lane) {
  return { lane, tag: 0, payload: null, callback: null, next: null };
}
function enqueueUpdate(fiber, update, lane) {
  var updateQueue = fiber.updateQueue;
  if (null === updateQueue) return null;
  updateQueue = updateQueue.shared;
  if (0 !== (executionContext & 2)) {
    var pending = updateQueue.pending;
    null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
    updateQueue.pending = update;
    update = getRootForUpdatedFiber(fiber);
    markUpdateLaneFromFiberToRoot(fiber, null, lane);
    return update;
  }
  enqueueUpdate$1(fiber, updateQueue, update, lane);
  return getRootForUpdatedFiber(fiber);
}
function entangleTransitions(root2, fiber, lane) {
  fiber = fiber.updateQueue;
  if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
    var queueLanes = fiber.lanes;
    queueLanes &= root2.pendingLanes;
    lane |= queueLanes;
    fiber.lanes = lane;
    markRootEntangled(root2, lane);
  }
}
function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
  var queue = workInProgress2.updateQueue, current = workInProgress2.alternate;
  if (null !== current && (current = current.updateQueue, queue === current)) {
    var newFirst = null, newLast = null;
    queue = queue.firstBaseUpdate;
    if (null !== queue) {
      do {
        var clone = {
          lane: queue.lane,
          tag: queue.tag,
          payload: queue.payload,
          callback: null,
          next: null
        };
        null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
        queue = queue.next;
      } while (null !== queue);
      null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
    } else newFirst = newLast = capturedUpdate;
    queue = {
      baseState: current.baseState,
      firstBaseUpdate: newFirst,
      lastBaseUpdate: newLast,
      shared: current.shared,
      callbacks: current.callbacks
    };
    workInProgress2.updateQueue = queue;
    return;
  }
  workInProgress2 = queue.lastBaseUpdate;
  null === workInProgress2 ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
  queue.lastBaseUpdate = capturedUpdate;
}
var didReadFromEntangledAsyncAction = false;
function suspendIfUpdateReadFromEntangledAsyncAction() {
  if (didReadFromEntangledAsyncAction) {
    var entangledActionThenable = currentEntangledActionThenable;
    if (null !== entangledActionThenable) throw entangledActionThenable;
  }
}
function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
  didReadFromEntangledAsyncAction = false;
  var queue = workInProgress$jscomp$0.updateQueue;
  hasForceUpdate = false;
  var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
  if (null !== pendingQueue) {
    queue.shared.pending = null;
    var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
    lastBaseUpdate = lastPendingUpdate;
    var current = workInProgress$jscomp$0.alternate;
    null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
  }
  if (null !== firstBaseUpdate) {
    var newState = queue.baseState;
    lastBaseUpdate = 0;
    current = firstPendingUpdate = lastPendingUpdate = null;
    pendingQueue = firstBaseUpdate;
    do {
      var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
      if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
        0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
        null !== current && (current = current.next = {
          lane: 0,
          tag: pendingQueue.tag,
          payload: pendingQueue.payload,
          callback: null,
          next: null
        });
        a: {
          var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
          updateLane = props;
          var instance = instance$jscomp$0;
          switch (update.tag) {
            case 1:
              workInProgress2 = update.payload;
              if ("function" === typeof workInProgress2) {
                newState = workInProgress2.call(instance, newState, updateLane);
                break a;
              }
              newState = workInProgress2;
              break a;
            case 3:
              workInProgress2.flags = workInProgress2.flags & -65537 | 128;
            case 0:
              workInProgress2 = update.payload;
              updateLane = "function" === typeof workInProgress2 ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
              if (null === updateLane || void 0 === updateLane) break a;
              newState = assign({}, newState, updateLane);
              break a;
            case 2:
              hasForceUpdate = true;
          }
        }
        updateLane = pendingQueue.callback;
        null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
      } else
        isHiddenUpdate = {
          lane: updateLane,
          tag: pendingQueue.tag,
          payload: pendingQueue.payload,
          callback: pendingQueue.callback,
          next: null
        }, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
      pendingQueue = pendingQueue.next;
      if (null === pendingQueue)
        if (pendingQueue = queue.shared.pending, null === pendingQueue)
          break;
        else
          isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
    } while (1);
    null === current && (lastPendingUpdate = newState);
    queue.baseState = lastPendingUpdate;
    queue.firstBaseUpdate = firstPendingUpdate;
    queue.lastBaseUpdate = current;
    null === firstBaseUpdate && (queue.shared.lanes = 0);
    workInProgressRootSkippedLanes |= lastBaseUpdate;
    workInProgress$jscomp$0.lanes = lastBaseUpdate;
    workInProgress$jscomp$0.memoizedState = newState;
  }
}
function callCallback(callback, context) {
  if ("function" !== typeof callback)
    throw Error(formatProdErrorMessage(191, callback));
  callback.call(context);
}
function commitCallbacks(updateQueue, context) {
  var callbacks = updateQueue.callbacks;
  if (null !== callbacks)
    for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++)
      callCallback(callbacks[updateQueue], context);
}
var currentTreeHiddenStackCursor = createCursor(null), prevEntangledRenderLanesCursor = createCursor(0);
function pushHiddenContext(fiber, context) {
  fiber = entangledRenderLanes;
  push(prevEntangledRenderLanesCursor, fiber);
  push(currentTreeHiddenStackCursor, context);
  entangledRenderLanes = fiber | context.baseLanes;
}
function reuseHiddenContextOnStack() {
  push(prevEntangledRenderLanesCursor, entangledRenderLanes);
  push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
}
function popHiddenContext() {
  entangledRenderLanes = prevEntangledRenderLanesCursor.current;
  pop(currentTreeHiddenStackCursor);
  pop(prevEntangledRenderLanesCursor);
}
var renderLanes = 0, currentlyRenderingFiber = null, currentHook = null, workInProgressHook = null, didScheduleRenderPhaseUpdate = false, didScheduleRenderPhaseUpdateDuringThisPass = false, shouldDoubleInvokeUserFnsInHooksDEV = false, localIdCounter = 0, thenableIndexCounter$1 = 0, thenableState$1 = null, globalClientIdCounter = 0;
function throwInvalidHookError() {
  throw Error(formatProdErrorMessage(321));
}
function areHookInputsEqual(nextDeps, prevDeps) {
  if (null === prevDeps) return false;
  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
    if (!objectIs(nextDeps[i], prevDeps[i])) return false;
  return true;
}
function renderWithHooks(current, workInProgress2, Component2, props, secondArg, nextRenderLanes) {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress2;
  workInProgress2.memoizedState = null;
  workInProgress2.updateQueue = null;
  workInProgress2.lanes = 0;
  ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
  shouldDoubleInvokeUserFnsInHooksDEV = false;
  nextRenderLanes = Component2(props, secondArg);
  shouldDoubleInvokeUserFnsInHooksDEV = false;
  didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(
    workInProgress2,
    Component2,
    props,
    secondArg
  ));
  finishRenderingHooks(current);
  return nextRenderLanes;
}
function finishRenderingHooks(current) {
  ReactSharedInternals.H = ContextOnlyDispatcher;
  var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
  renderLanes = 0;
  workInProgressHook = currentHook = currentlyRenderingFiber = null;
  didScheduleRenderPhaseUpdate = false;
  thenableIndexCounter$1 = 0;
  thenableState$1 = null;
  if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
  null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = true));
}
function renderWithHooksAgain(workInProgress2, Component2, props, secondArg) {
  currentlyRenderingFiber = workInProgress2;
  var numberOfReRenders = 0;
  do {
    didScheduleRenderPhaseUpdateDuringThisPass && (thenableState$1 = null);
    thenableIndexCounter$1 = 0;
    didScheduleRenderPhaseUpdateDuringThisPass = false;
    if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
    numberOfReRenders += 1;
    workInProgressHook = currentHook = null;
    if (null != workInProgress2.updateQueue) {
      var children = workInProgress2.updateQueue;
      children.lastEffect = null;
      children.events = null;
      children.stores = null;
      null != children.memoCache && (children.memoCache.index = 0);
    }
    ReactSharedInternals.H = HooksDispatcherOnRerender;
    children = Component2(props, secondArg);
  } while (didScheduleRenderPhaseUpdateDuringThisPass);
  return children;
}
function TransitionAwareHostComponent() {
  var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
  maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
  dispatcher = dispatcher.useState()[0];
  (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
  return maybeThenable;
}
function checkDidRenderIdHook() {
  var didRenderIdHook = 0 !== localIdCounter;
  localIdCounter = 0;
  return didRenderIdHook;
}
function bailoutHooks(current, workInProgress2, lanes) {
  workInProgress2.updateQueue = current.updateQueue;
  workInProgress2.flags &= -2053;
  current.lanes &= ~lanes;
}
function resetHooksOnUnwind(workInProgress2) {
  if (didScheduleRenderPhaseUpdate) {
    for (workInProgress2 = workInProgress2.memoizedState; null !== workInProgress2; ) {
      var queue = workInProgress2.queue;
      null !== queue && (queue.pending = null);
      workInProgress2 = workInProgress2.next;
    }
    didScheduleRenderPhaseUpdate = false;
  }
  renderLanes = 0;
  workInProgressHook = currentHook = currentlyRenderingFiber = null;
  didScheduleRenderPhaseUpdateDuringThisPass = false;
  thenableIndexCounter$1 = localIdCounter = 0;
  thenableState$1 = null;
}
function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
  return workInProgressHook;
}
function updateWorkInProgressHook() {
  if (null === currentHook) {
    var nextCurrentHook = currentlyRenderingFiber.alternate;
    nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
  } else nextCurrentHook = currentHook.next;
  var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
  if (null !== nextWorkInProgressHook)
    workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
  else {
    if (null === nextCurrentHook) {
      if (null === currentlyRenderingFiber.alternate)
        throw Error(formatProdErrorMessage(467));
      throw Error(formatProdErrorMessage(310));
    }
    currentHook = nextCurrentHook;
    nextCurrentHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null
    };
    null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
  }
  return workInProgressHook;
}
function createFunctionComponentUpdateQueue() {
  return { lastEffect: null, events: null, stores: null, memoCache: null };
}
function useThenable(thenable) {
  var index2 = thenableIndexCounter$1;
  thenableIndexCounter$1 += 1;
  null === thenableState$1 && (thenableState$1 = []);
  thenable = trackUsedThenable(thenableState$1, thenable, index2);
  index2 = currentlyRenderingFiber;
  null === (null === workInProgressHook ? index2.memoizedState : workInProgressHook.next) && (index2 = index2.alternate, ReactSharedInternals.H = null === index2 || null === index2.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
  return thenable;
}
function use(usable) {
  if (null !== usable && "object" === typeof usable) {
    if ("function" === typeof usable.then) return useThenable(usable);
    if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
  }
  throw Error(formatProdErrorMessage(438, String(usable)));
}
function useMemoCache(size) {
  var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
  null !== updateQueue && (memoCache = updateQueue.memoCache);
  if (null == memoCache) {
    var current = currentlyRenderingFiber.alternate;
    null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
      data: current.data.map(function(array) {
        return array.slice();
      }),
      index: 0
    })));
  }
  null == memoCache && (memoCache = { data: [], index: 0 });
  null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
  updateQueue.memoCache = memoCache;
  updateQueue = memoCache.data[memoCache.index];
  if (void 0 === updateQueue)
    for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++)
      updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
  memoCache.index++;
  return updateQueue;
}
function basicStateReducer(state, action) {
  return "function" === typeof action ? action(state) : action;
}
function updateReducer(reducer) {
  var hook = updateWorkInProgressHook();
  return updateReducerImpl(hook, currentHook, reducer);
}
function updateReducerImpl(hook, current, reducer) {
  var queue = hook.queue;
  if (null === queue) throw Error(formatProdErrorMessage(311));
  queue.lastRenderedReducer = reducer;
  var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
  if (null !== pendingQueue) {
    if (null !== baseQueue) {
      var baseFirst = baseQueue.next;
      baseQueue.next = pendingQueue.next;
      pendingQueue.next = baseFirst;
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }
  pendingQueue = hook.baseState;
  if (null === baseQueue) hook.memoizedState = pendingQueue;
  else {
    current = baseQueue.next;
    var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$32 = false;
    do {
      var updateLane = update.lane & -536870913;
      if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
        var revertLane = update.revertLane;
        if (0 === revertLane)
          null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
            lane: 0,
            revertLane: 0,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$32 = true);
        else if ((renderLanes & revertLane) === revertLane) {
          update = update.next;
          revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$32 = true);
          continue;
        } else
          updateLane = {
            lane: 0,
            revertLane: update.revertLane,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
        updateLane = update.action;
        shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
        pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
      } else
        revertLane = {
          lane: updateLane,
          revertLane: update.revertLane,
          action: update.action,
          hasEagerState: update.hasEagerState,
          eagerState: update.eagerState,
          next: null
        }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
      update = update.next;
    } while (null !== update && update !== current);
    null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
    if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$32 && (reducer = currentEntangledActionThenable, null !== reducer)))
      throw reducer;
    hook.memoizedState = pendingQueue;
    hook.baseState = baseFirst;
    hook.baseQueue = newBaseQueueLast;
    queue.lastRenderedState = pendingQueue;
  }
  null === baseQueue && (queue.lanes = 0);
  return [hook.memoizedState, queue.dispatch];
}
function rerenderReducer(reducer) {
  var hook = updateWorkInProgressHook(), queue = hook.queue;
  if (null === queue) throw Error(formatProdErrorMessage(311));
  queue.lastRenderedReducer = reducer;
  var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
  if (null !== lastRenderPhaseUpdate) {
    queue.pending = null;
    var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
    do
      newState = reducer(newState, update.action), update = update.next;
    while (update !== lastRenderPhaseUpdate);
    objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
    hook.memoizedState = newState;
    null === hook.baseQueue && (hook.baseState = newState);
    queue.lastRenderedState = newState;
  }
  return [newState, dispatch];
}
function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
  if (isHydrating$jscomp$0) {
    if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
    getServerSnapshot = getServerSnapshot();
  } else getServerSnapshot = getSnapshot();
  var snapshotChanged = !objectIs(
    (currentHook || hook).memoizedState,
    getServerSnapshot
  );
  snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
  hook = hook.queue;
  var create = subscribeToStore.bind(null, fiber, hook, subscribe);
  updateEffectImpl(2048, 8, create, [subscribe]);
  if (hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1) {
    fiber.flags |= 2048;
    pushSimpleEffect(
      9,
      createEffectInstance(),
      updateStoreInstance.bind(
        null,
        fiber,
        hook,
        getServerSnapshot,
        getSnapshot
      ),
      null
    );
    if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
    isHydrating$jscomp$0 || 0 !== (renderLanes & 124) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
  }
  return getServerSnapshot;
}
function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
  fiber.flags |= 16384;
  fiber = { getSnapshot, value: renderedSnapshot };
  getSnapshot = currentlyRenderingFiber.updateQueue;
  null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
}
function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
  inst.value = nextSnapshot;
  inst.getSnapshot = getSnapshot;
  checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
}
function subscribeToStore(fiber, inst, subscribe) {
  return subscribe(function() {
    checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
  });
}
function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs(inst, nextValue);
  } catch (error) {
    return true;
  }
}
function forceStoreRerender(fiber) {
  var root2 = enqueueConcurrentRenderForLane(fiber, 2);
  null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2);
}
function mountStateImpl(initialState2) {
  var hook = mountWorkInProgressHook();
  if ("function" === typeof initialState2) {
    var initialStateInitializer = initialState2;
    initialState2 = initialStateInitializer();
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(true);
      try {
        initialStateInitializer();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }
  }
  hook.memoizedState = hook.baseState = initialState2;
  hook.queue = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState2
  };
  return hook;
}
function updateOptimisticImpl(hook, current, passthrough, reducer) {
  hook.baseState = passthrough;
  return updateReducerImpl(
    hook,
    currentHook,
    "function" === typeof reducer ? reducer : basicStateReducer
  );
}
function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
  if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
  fiber = actionQueue.action;
  if (null !== fiber) {
    var actionNode = {
      payload,
      action: fiber,
      next: null,
      isTransition: true,
      status: "pending",
      value: null,
      reason: null,
      listeners: [],
      then: function(listener) {
        actionNode.listeners.push(listener);
      }
    };
    null !== ReactSharedInternals.T ? setPendingState(true) : actionNode.isTransition = false;
    setState(actionNode);
    setPendingState = actionQueue.pending;
    null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
  }
}
function runActionStateAction(actionQueue, node) {
  var action = node.action, payload = node.payload, prevState = actionQueue.state;
  if (node.isTransition) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      handleActionReturnValue(actionQueue, node, returnValue);
    } catch (error) {
      onActionError(actionQueue, node, error);
    } finally {
      ReactSharedInternals.T = prevTransition;
    }
  } else
    try {
      prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
    } catch (error$38) {
      onActionError(actionQueue, node, error$38);
    }
}
function handleActionReturnValue(actionQueue, node, returnValue) {
  null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(
    function(nextState) {
      onActionSuccess(actionQueue, node, nextState);
    },
    function(error) {
      return onActionError(actionQueue, node, error);
    }
  ) : onActionSuccess(actionQueue, node, returnValue);
}
function onActionSuccess(actionQueue, actionNode, nextState) {
  actionNode.status = "fulfilled";
  actionNode.value = nextState;
  notifyActionListeners(actionNode);
  actionQueue.state = nextState;
  actionNode = actionQueue.pending;
  null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
}
function onActionError(actionQueue, actionNode, error) {
  var last = actionQueue.pending;
  actionQueue.pending = null;
  if (null !== last) {
    last = last.next;
    do
      actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
    while (actionNode !== last);
  }
  actionQueue.action = null;
}
function notifyActionListeners(actionNode) {
  actionNode = actionNode.listeners;
  for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
}
function actionStateReducer(oldState, newState) {
  return newState;
}
function mountActionState(action, initialStateProp) {
  if (isHydrating) {
    var ssrFormState = workInProgressRoot.formState;
    if (null !== ssrFormState) {
      a: {
        var JSCompiler_inline_result = currentlyRenderingFiber;
        if (isHydrating) {
          if (nextHydratableInstance) {
            b: {
              var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
              for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType; ) {
                if (!inRootOrSingleton) {
                  JSCompiler_inline_result$jscomp$0 = null;
                  break b;
                }
                JSCompiler_inline_result$jscomp$0 = getNextHydratable(
                  JSCompiler_inline_result$jscomp$0.nextSibling
                );
                if (null === JSCompiler_inline_result$jscomp$0) {
                  JSCompiler_inline_result$jscomp$0 = null;
                  break b;
                }
              }
              inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
              JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
            }
            if (JSCompiler_inline_result$jscomp$0) {
              nextHydratableInstance = getNextHydratable(
                JSCompiler_inline_result$jscomp$0.nextSibling
              );
              JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
              break a;
            }
          }
          throwOnHydrationMismatch(JSCompiler_inline_result);
        }
        JSCompiler_inline_result = false;
      }
      JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
    }
  }
  ssrFormState = mountWorkInProgressHook();
  ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
  JSCompiler_inline_result = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: actionStateReducer,
    lastRenderedState: initialStateProp
  };
  ssrFormState.queue = JSCompiler_inline_result;
  ssrFormState = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    JSCompiler_inline_result
  );
  JSCompiler_inline_result.dispatch = ssrFormState;
  JSCompiler_inline_result = mountStateImpl(false);
  inRootOrSingleton = dispatchOptimisticSetState.bind(
    null,
    currentlyRenderingFiber,
    false,
    JSCompiler_inline_result.queue
  );
  JSCompiler_inline_result = mountWorkInProgressHook();
  JSCompiler_inline_result$jscomp$0 = {
    state: initialStateProp,
    dispatch: null,
    action,
    pending: null
  };
  JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
  ssrFormState = dispatchActionState.bind(
    null,
    currentlyRenderingFiber,
    JSCompiler_inline_result$jscomp$0,
    inRootOrSingleton,
    ssrFormState
  );
  JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
  JSCompiler_inline_result.memoizedState = action;
  return [initialStateProp, ssrFormState, false];
}
function updateActionState(action) {
  var stateHook = updateWorkInProgressHook();
  return updateActionStateImpl(stateHook, currentHook, action);
}
function updateActionStateImpl(stateHook, currentStateHook, action) {
  currentStateHook = updateReducerImpl(
    stateHook,
    currentStateHook,
    actionStateReducer
  )[0];
  stateHook = updateReducer(basicStateReducer)[0];
  if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then)
    try {
      var state = useThenable(currentStateHook);
    } catch (x) {
      if (x === SuspenseException) throw SuspenseActionException;
      throw x;
    }
  else state = currentStateHook;
  currentStateHook = updateWorkInProgressHook();
  var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
  action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(
    9,
    createEffectInstance(),
    actionStateActionEffect.bind(null, actionQueue, action),
    null
  ));
  return [state, dispatch, stateHook];
}
function actionStateActionEffect(actionQueue, action) {
  actionQueue.action = action;
}
function rerenderActionState(action) {
  var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
  if (null !== currentStateHook)
    return updateActionStateImpl(stateHook, currentStateHook, action);
  updateWorkInProgressHook();
  stateHook = stateHook.memoizedState;
  currentStateHook = updateWorkInProgressHook();
  var dispatch = currentStateHook.queue.dispatch;
  currentStateHook.memoizedState = action;
  return [stateHook, dispatch, false];
}
function pushSimpleEffect(tag, inst, create, createDeps) {
  tag = { tag, create, deps: createDeps, inst, next: null };
  inst = currentlyRenderingFiber.updateQueue;
  null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
  create = inst.lastEffect;
  null === create ? inst.lastEffect = tag.next = tag : (createDeps = create.next, create.next = tag, tag.next = createDeps, inst.lastEffect = tag);
  return tag;
}
function createEffectInstance() {
  return { destroy: void 0, resource: void 0 };
}
function updateRef() {
  return updateWorkInProgressHook().memoizedState;
}
function mountEffectImpl(fiberFlags, hookFlags, create, createDeps) {
  var hook = mountWorkInProgressHook();
  createDeps = void 0 === createDeps ? null : createDeps;
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushSimpleEffect(
    1 | hookFlags,
    createEffectInstance(),
    create,
    createDeps
  );
}
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  var hook = updateWorkInProgressHook();
  deps = void 0 === deps ? null : deps;
  var inst = hook.memoizedState.inst;
  null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(
    1 | hookFlags,
    inst,
    create,
    deps
  ));
}
function mountEffect(create, createDeps) {
  mountEffectImpl(8390656, 8, create, createDeps);
}
function updateEffect(create, createDeps) {
  updateEffectImpl(2048, 8, create, createDeps);
}
function updateInsertionEffect(create, deps) {
  return updateEffectImpl(4, 2, create, deps);
}
function updateLayoutEffect(create, deps) {
  return updateEffectImpl(4, 4, create, deps);
}
function imperativeHandleEffect(create, ref) {
  if ("function" === typeof ref) {
    create = create();
    var refCleanup = ref(create);
    return function() {
      "function" === typeof refCleanup ? refCleanup() : ref(null);
    };
  }
  if (null !== ref && void 0 !== ref)
    return create = create(), ref.current = create, function() {
      ref.current = null;
    };
}
function updateImperativeHandle(ref, create, deps) {
  deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
  updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
}
function mountDebugValue() {
}
function updateCallback(callback, deps) {
  var hook = updateWorkInProgressHook();
  deps = void 0 === deps ? null : deps;
  var prevState = hook.memoizedState;
  if (null !== deps && areHookInputsEqual(deps, prevState[1]))
    return prevState[0];
  hook.memoizedState = [callback, deps];
  return callback;
}
function updateMemo(nextCreate, deps) {
  var hook = updateWorkInProgressHook();
  deps = void 0 === deps ? null : deps;
  var prevState = hook.memoizedState;
  if (null !== deps && areHookInputsEqual(deps, prevState[1]))
    return prevState[0];
  prevState = nextCreate();
  if (shouldDoubleInvokeUserFnsInHooksDEV) {
    setIsStrictModeForDevtools(true);
    try {
      nextCreate();
    } finally {
      setIsStrictModeForDevtools(false);
    }
  }
  hook.memoizedState = [prevState, deps];
  return prevState;
}
function mountDeferredValueImpl(hook, value, initialValue) {
  if (void 0 === initialValue || 0 !== (renderLanes & 1073741824))
    return hook.memoizedState = value;
  hook.memoizedState = initialValue;
  hook = requestDeferredLane();
  currentlyRenderingFiber.lanes |= hook;
  workInProgressRootSkippedLanes |= hook;
  return initialValue;
}
function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
  if (objectIs(value, prevValue)) return value;
  if (null !== currentTreeHiddenStackCursor.current)
    return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
  if (0 === (renderLanes & 42))
    return didReceiveUpdate = true, hook.memoizedState = value;
  hook = requestDeferredLane();
  currentlyRenderingFiber.lanes |= hook;
  workInProgressRootSkippedLanes |= hook;
  return prevValue;
}
function startTransition(fiber, queue, pendingState, finishedState, callback) {
  var previousPriority = ReactDOMSharedInternals.p;
  ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
  var prevTransition = ReactSharedInternals.T, currentTransition = {};
  ReactSharedInternals.T = currentTransition;
  dispatchOptimisticSetState(fiber, false, queue, pendingState);
  try {
    var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
    null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
    if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) {
      var thenableForFinishedState = chainThenableValue(
        returnValue,
        finishedState
      );
      dispatchSetStateInternal(
        fiber,
        queue,
        thenableForFinishedState,
        requestUpdateLane(fiber)
      );
    } else
      dispatchSetStateInternal(
        fiber,
        queue,
        finishedState,
        requestUpdateLane(fiber)
      );
  } catch (error) {
    dispatchSetStateInternal(
      fiber,
      queue,
      { then: function() {
      }, status: "rejected", reason: error },
      requestUpdateLane()
    );
  } finally {
    ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
  }
}
function noop$2() {
}
function startHostTransition(formFiber, pendingState, action, formData) {
  if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
  var queue = ensureFormComponentIsStateful(formFiber).queue;
  startTransition(
    formFiber,
    queue,
    pendingState,
    sharedNotPendingObject,
    null === action ? noop$2 : function() {
      requestFormReset$1(formFiber);
      return action(formData);
    }
  );
}
function ensureFormComponentIsStateful(formFiber) {
  var existingStateHook = formFiber.memoizedState;
  if (null !== existingStateHook) return existingStateHook;
  existingStateHook = {
    memoizedState: sharedNotPendingObject,
    baseState: sharedNotPendingObject,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: sharedNotPendingObject
    },
    next: null
  };
  var initialResetState = {};
  existingStateHook.next = {
    memoizedState: initialResetState,
    baseState: initialResetState,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: initialResetState
    },
    next: null
  };
  formFiber.memoizedState = existingStateHook;
  formFiber = formFiber.alternate;
  null !== formFiber && (formFiber.memoizedState = existingStateHook);
  return existingStateHook;
}
function requestFormReset$1(formFiber) {
  var resetStateQueue = ensureFormComponentIsStateful(formFiber).next.queue;
  dispatchSetStateInternal(formFiber, resetStateQueue, {}, requestUpdateLane());
}
function useHostTransitionStatus() {
  return readContext(HostTransitionContext);
}
function updateId() {
  return updateWorkInProgressHook().memoizedState;
}
function updateRefresh() {
  return updateWorkInProgressHook().memoizedState;
}
function refreshCache(fiber) {
  for (var provider = fiber.return; null !== provider; ) {
    switch (provider.tag) {
      case 24:
      case 3:
        var lane = requestUpdateLane();
        fiber = createUpdate(lane);
        var root$41 = enqueueUpdate(provider, fiber, lane);
        null !== root$41 && (scheduleUpdateOnFiber(root$41, provider, lane), entangleTransitions(root$41, provider, lane));
        provider = { cache: createCache() };
        fiber.payload = provider;
        return;
    }
    provider = provider.return;
  }
}
function dispatchReducerAction(fiber, queue, action) {
  var lane = requestUpdateLane();
  action = {
    lane,
    revertLane: 0,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };
  isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
}
function dispatchSetState(fiber, queue, action) {
  var lane = requestUpdateLane();
  dispatchSetStateInternal(fiber, queue, action, lane);
}
function dispatchSetStateInternal(fiber, queue, action, lane) {
  var update = {
    lane,
    revertLane: 0,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };
  if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
  else {
    var alternate = fiber.alternate;
    if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate))
      try {
        var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
        update.hasEagerState = true;
        update.eagerState = eagerState;
        if (objectIs(eagerState, currentState))
          return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), false;
      } catch (error) {
      } finally {
      }
    action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
    if (null !== action)
      return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
  }
  return false;
}
function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
  action = {
    lane: 2,
    revertLane: requestTransitionLane(),
    action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };
  if (isRenderPhaseUpdate(fiber)) {
    if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
  } else
    throwIfDuringRender = enqueueConcurrentHookUpdate(
      fiber,
      queue,
      action,
      2
    ), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
}
function isRenderPhaseUpdate(fiber) {
  var alternate = fiber.alternate;
  return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
}
function enqueueRenderPhaseUpdate(queue, update) {
  didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
  var pending = queue.pending;
  null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
  queue.pending = update;
}
function entangleTransitionUpdate(root2, queue, lane) {
  if (0 !== (lane & 4194048)) {
    var queueLanes = queue.lanes;
    queueLanes &= root2.pendingLanes;
    lane |= queueLanes;
    queue.lanes = lane;
    markRootEntangled(root2, lane);
  }
}
var ContextOnlyDispatcher = {
  readContext,
  use,
  useCallback: throwInvalidHookError,
  useContext: throwInvalidHookError,
  useEffect: throwInvalidHookError,
  useImperativeHandle: throwInvalidHookError,
  useLayoutEffect: throwInvalidHookError,
  useInsertionEffect: throwInvalidHookError,
  useMemo: throwInvalidHookError,
  useReducer: throwInvalidHookError,
  useRef: throwInvalidHookError,
  useState: throwInvalidHookError,
  useDebugValue: throwInvalidHookError,
  useDeferredValue: throwInvalidHookError,
  useTransition: throwInvalidHookError,
  useSyncExternalStore: throwInvalidHookError,
  useId: throwInvalidHookError,
  useHostTransitionStatus: throwInvalidHookError,
  useFormState: throwInvalidHookError,
  useActionState: throwInvalidHookError,
  useOptimistic: throwInvalidHookError,
  useMemoCache: throwInvalidHookError,
  useCacheRefresh: throwInvalidHookError
}, HooksDispatcherOnMount = {
  readContext,
  use,
  useCallback: function(callback, deps) {
    mountWorkInProgressHook().memoizedState = [
      callback,
      void 0 === deps ? null : deps
    ];
    return callback;
  },
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: function(ref, create, deps) {
    deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
    mountEffectImpl(
      4194308,
      4,
      imperativeHandleEffect.bind(null, create, ref),
      deps
    );
  },
  useLayoutEffect: function(create, deps) {
    return mountEffectImpl(4194308, 4, create, deps);
  },
  useInsertionEffect: function(create, deps) {
    mountEffectImpl(4, 2, create, deps);
  },
  useMemo: function(nextCreate, deps) {
    var hook = mountWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var nextValue = nextCreate();
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(true);
      try {
        nextCreate();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }
    hook.memoizedState = [nextValue, deps];
    return nextValue;
  },
  useReducer: function(reducer, initialArg, init) {
    var hook = mountWorkInProgressHook();
    if (void 0 !== init) {
      var initialState2 = init(initialArg);
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          init(initialArg);
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
    } else initialState2 = initialArg;
    hook.memoizedState = hook.baseState = initialState2;
    reducer = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: reducer,
      lastRenderedState: initialState2
    };
    hook.queue = reducer;
    reducer = reducer.dispatch = dispatchReducerAction.bind(
      null,
      currentlyRenderingFiber,
      reducer
    );
    return [hook.memoizedState, reducer];
  },
  useRef: function(initialValue) {
    var hook = mountWorkInProgressHook();
    initialValue = { current: initialValue };
    return hook.memoizedState = initialValue;
  },
  useState: function(initialState2) {
    initialState2 = mountStateImpl(initialState2);
    var queue = initialState2.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
    queue.dispatch = dispatch;
    return [initialState2.memoizedState, dispatch];
  },
  useDebugValue: mountDebugValue,
  useDeferredValue: function(value, initialValue) {
    var hook = mountWorkInProgressHook();
    return mountDeferredValueImpl(hook, value, initialValue);
  },
  useTransition: function() {
    var stateHook = mountStateImpl(false);
    stateHook = startTransition.bind(
      null,
      currentlyRenderingFiber,
      stateHook.queue,
      true,
      false
    );
    mountWorkInProgressHook().memoizedState = stateHook;
    return [false, stateHook];
  },
  useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
    var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
    if (isHydrating) {
      if (void 0 === getServerSnapshot)
        throw Error(formatProdErrorMessage(407));
      getServerSnapshot = getServerSnapshot();
    } else {
      getServerSnapshot = getSnapshot();
      if (null === workInProgressRoot)
        throw Error(formatProdErrorMessage(349));
      0 !== (workInProgressRootRenderLanes & 124) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
    }
    hook.memoizedState = getServerSnapshot;
    var inst = { value: getServerSnapshot, getSnapshot };
    hook.queue = inst;
    mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
      subscribe
    ]);
    fiber.flags |= 2048;
    pushSimpleEffect(
      9,
      createEffectInstance(),
      updateStoreInstance.bind(
        null,
        fiber,
        inst,
        getServerSnapshot,
        getSnapshot
      ),
      null
    );
    return getServerSnapshot;
  },
  useId: function() {
    var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
    if (isHydrating) {
      var JSCompiler_inline_result = treeContextOverflow;
      var idWithLeadingBit = treeContextId;
      JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
      identifierPrefix = "«" + identifierPrefix + "R" + JSCompiler_inline_result;
      JSCompiler_inline_result = localIdCounter++;
      0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
      identifierPrefix += "»";
    } else
      JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "«" + identifierPrefix + "r" + JSCompiler_inline_result.toString(32) + "»";
    return hook.memoizedState = identifierPrefix;
  },
  useHostTransitionStatus,
  useFormState: mountActionState,
  useActionState: mountActionState,
  useOptimistic: function(passthrough) {
    var hook = mountWorkInProgressHook();
    hook.memoizedState = hook.baseState = passthrough;
    var queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: null,
      lastRenderedState: null
    };
    hook.queue = queue;
    hook = dispatchOptimisticSetState.bind(
      null,
      currentlyRenderingFiber,
      true,
      queue
    );
    queue.dispatch = hook;
    return [passthrough, hook];
  },
  useMemoCache,
  useCacheRefresh: function() {
    return mountWorkInProgressHook().memoizedState = refreshCache.bind(
      null,
      currentlyRenderingFiber
    );
  }
}, HooksDispatcherOnUpdate = {
  readContext,
  use,
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useInsertionEffect: updateInsertionEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: function() {
    return updateReducer(basicStateReducer);
  },
  useDebugValue: mountDebugValue,
  useDeferredValue: function(value, initialValue) {
    var hook = updateWorkInProgressHook();
    return updateDeferredValueImpl(
      hook,
      currentHook.memoizedState,
      value,
      initialValue
    );
  },
  useTransition: function() {
    var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
    return [
      "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
      start
    ];
  },
  useSyncExternalStore: updateSyncExternalStore,
  useId: updateId,
  useHostTransitionStatus,
  useFormState: updateActionState,
  useActionState: updateActionState,
  useOptimistic: function(passthrough, reducer) {
    var hook = updateWorkInProgressHook();
    return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
  },
  useMemoCache,
  useCacheRefresh: updateRefresh
}, HooksDispatcherOnRerender = {
  readContext,
  use,
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useInsertionEffect: updateInsertionEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: rerenderReducer,
  useRef: updateRef,
  useState: function() {
    return rerenderReducer(basicStateReducer);
  },
  useDebugValue: mountDebugValue,
  useDeferredValue: function(value, initialValue) {
    var hook = updateWorkInProgressHook();
    return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(
      hook,
      currentHook.memoizedState,
      value,
      initialValue
    );
  },
  useTransition: function() {
    var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
    return [
      "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
      start
    ];
  },
  useSyncExternalStore: updateSyncExternalStore,
  useId: updateId,
  useHostTransitionStatus,
  useFormState: rerenderActionState,
  useActionState: rerenderActionState,
  useOptimistic: function(passthrough, reducer) {
    var hook = updateWorkInProgressHook();
    if (null !== currentHook)
      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
    hook.baseState = passthrough;
    return [passthrough, hook.queue.dispatch];
  },
  useMemoCache,
  useCacheRefresh: updateRefresh
}, thenableState = null, thenableIndexCounter = 0;
function unwrapThenable(thenable) {
  var index2 = thenableIndexCounter;
  thenableIndexCounter += 1;
  null === thenableState && (thenableState = []);
  return trackUsedThenable(thenableState, thenable, index2);
}
function coerceRef(workInProgress2, element) {
  element = element.props.ref;
  workInProgress2.ref = void 0 !== element ? element : null;
}
function throwOnInvalidObjectType(returnFiber, newChild) {
  if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
    throw Error(formatProdErrorMessage(525));
  returnFiber = Object.prototype.toString.call(newChild);
  throw Error(
    formatProdErrorMessage(
      31,
      "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber
    )
  );
}
function resolveLazy(lazyType) {
  var init = lazyType._init;
  return init(lazyType._payload);
}
function createChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (shouldTrackSideEffects) {
      var deletions = returnFiber.deletions;
      null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
    }
  }
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) return null;
    for (; null !== currentFirstChild; )
      deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
    return null;
  }
  function mapRemainingChildren(currentFirstChild) {
    for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild; )
      null !== currentFirstChild.key ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
    return existingChildren;
  }
  function useFiber(fiber, pendingProps) {
    fiber = createWorkInProgress(fiber, pendingProps);
    fiber.index = 0;
    fiber.sibling = null;
    return fiber;
  }
  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects)
      return newFiber.flags |= 1048576, lastPlacedIndex;
    newIndex = newFiber.alternate;
    if (null !== newIndex)
      return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
    newFiber.flags |= 67108866;
    return lastPlacedIndex;
  }
  function placeSingleChild(newFiber) {
    shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 67108866);
    return newFiber;
  }
  function updateTextNode(returnFiber, current, textContent, lanes) {
    if (null === current || 6 !== current.tag)
      return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
    current = useFiber(current, textContent);
    current.return = returnFiber;
    return current;
  }
  function updateElement(returnFiber, current, element, lanes) {
    var elementType = element.type;
    if (elementType === REACT_FRAGMENT_TYPE)
      return updateFragment(
        returnFiber,
        current,
        element.props.children,
        lanes,
        element.key
      );
    if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
      return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
    current = createFiberFromTypeAndProps(
      element.type,
      element.key,
      element.props,
      null,
      returnFiber.mode,
      lanes
    );
    coerceRef(current, element);
    current.return = returnFiber;
    return current;
  }
  function updatePortal(returnFiber, current, portal, lanes) {
    if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
      return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
    current = useFiber(current, portal.children || []);
    current.return = returnFiber;
    return current;
  }
  function updateFragment(returnFiber, current, fragment, lanes, key) {
    if (null === current || 7 !== current.tag)
      return current = createFiberFromFragment(
        fragment,
        returnFiber.mode,
        lanes,
        key
      ), current.return = returnFiber, current;
    current = useFiber(current, fragment);
    current.return = returnFiber;
    return current;
  }
  function createChild(returnFiber, newChild, lanes) {
    if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
      return newChild = createFiberFromText(
        "" + newChild,
        returnFiber.mode,
        lanes
      ), newChild.return = returnFiber, newChild;
    if ("object" === typeof newChild && null !== newChild) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return lanes = createFiberFromTypeAndProps(
            newChild.type,
            newChild.key,
            newChild.props,
            null,
            returnFiber.mode,
            lanes
          ), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
        case REACT_PORTAL_TYPE:
          return newChild = createFiberFromPortal(
            newChild,
            returnFiber.mode,
            lanes
          ), newChild.return = returnFiber, newChild;
        case REACT_LAZY_TYPE:
          var init = newChild._init;
          newChild = init(newChild._payload);
          return createChild(returnFiber, newChild, lanes);
      }
      if (isArrayImpl(newChild) || getIteratorFn(newChild))
        return newChild = createFiberFromFragment(
          newChild,
          returnFiber.mode,
          lanes,
          null
        ), newChild.return = returnFiber, newChild;
      if ("function" === typeof newChild.then)
        return createChild(returnFiber, unwrapThenable(newChild), lanes);
      if (newChild.$$typeof === REACT_CONTEXT_TYPE)
        return createChild(
          returnFiber,
          readContextDuringReconciliation(returnFiber, newChild),
          lanes
        );
      throwOnInvalidObjectType(returnFiber, newChild);
    }
    return null;
  }
  function updateSlot(returnFiber, oldFiber, newChild, lanes) {
    var key = null !== oldFiber ? oldFiber.key : null;
    if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
      return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
    if ("object" === typeof newChild && null !== newChild) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
        case REACT_PORTAL_TYPE:
          return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
        case REACT_LAZY_TYPE:
          return key = newChild._init, newChild = key(newChild._payload), updateSlot(returnFiber, oldFiber, newChild, lanes);
      }
      if (isArrayImpl(newChild) || getIteratorFn(newChild))
        return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
      if ("function" === typeof newChild.then)
        return updateSlot(
          returnFiber,
          oldFiber,
          unwrapThenable(newChild),
          lanes
        );
      if (newChild.$$typeof === REACT_CONTEXT_TYPE)
        return updateSlot(
          returnFiber,
          oldFiber,
          readContextDuringReconciliation(returnFiber, newChild),
          lanes
        );
      throwOnInvalidObjectType(returnFiber, newChild);
    }
    return null;
  }
  function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
    if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
      return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
    if ("object" === typeof newChild && null !== newChild) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return existingChildren = existingChildren.get(
            null === newChild.key ? newIdx : newChild.key
          ) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
        case REACT_PORTAL_TYPE:
          return existingChildren = existingChildren.get(
            null === newChild.key ? newIdx : newChild.key
          ) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
        case REACT_LAZY_TYPE:
          var init = newChild._init;
          newChild = init(newChild._payload);
          return updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            newChild,
            lanes
          );
      }
      if (isArrayImpl(newChild) || getIteratorFn(newChild))
        return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
      if ("function" === typeof newChild.then)
        return updateFromMap(
          existingChildren,
          returnFiber,
          newIdx,
          unwrapThenable(newChild),
          lanes
        );
      if (newChild.$$typeof === REACT_CONTEXT_TYPE)
        return updateFromMap(
          existingChildren,
          returnFiber,
          newIdx,
          readContextDuringReconciliation(returnFiber, newChild),
          lanes
        );
      throwOnInvalidObjectType(returnFiber, newChild);
    }
    return null;
  }
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
    for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
      oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
      var newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        lanes
      );
      if (null === newFiber) {
        null === oldFiber && (oldFiber = nextOldFiber);
        break;
      }
      shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
      currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
      null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    if (newIdx === newChildren.length)
      return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
    if (null === oldFiber) {
      for (; newIdx < newChildren.length; newIdx++)
        oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(
          oldFiber,
          currentFirstChild,
          newIdx
        ), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++)
      nextOldFiber = updateFromMap(
        oldFiber,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        lanes
      ), null !== nextOldFiber && (shouldTrackSideEffects && null !== nextOldFiber.alternate && oldFiber.delete(
        null === nextOldFiber.key ? newIdx : nextOldFiber.key
      ), currentFirstChild = placeChild(
        nextOldFiber,
        currentFirstChild,
        newIdx
      ), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
    shouldTrackSideEffects && oldFiber.forEach(function(child) {
      return deleteChild(returnFiber, child);
    });
    isHydrating && pushTreeFork(returnFiber, newIdx);
    return resultingFirstChild;
  }
  function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
    if (null == newChildren) throw Error(formatProdErrorMessage(151));
    for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
      oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
      var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
      if (null === newFiber) {
        null === oldFiber && (oldFiber = nextOldFiber);
        break;
      }
      shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
      currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
      null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    if (step.done)
      return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
    if (null === oldFiber) {
      for (; !step.done; newIdx++, step = newChildren.next())
        step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next())
      step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && null !== step.alternate && oldFiber.delete(null === step.key ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
    shouldTrackSideEffects && oldFiber.forEach(function(child) {
      return deleteChild(returnFiber, child);
    });
    isHydrating && pushTreeFork(returnFiber, newIdx);
    return resultingFirstChild;
  }
  function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
    "object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && (newChild = newChild.props.children);
    if ("object" === typeof newChild && null !== newChild) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          a: {
            for (var key = newChild.key; null !== currentFirstChild; ) {
              if (currentFirstChild.key === key) {
                key = newChild.type;
                if (key === REACT_FRAGMENT_TYPE) {
                  if (7 === currentFirstChild.tag) {
                    deleteRemainingChildren(
                      returnFiber,
                      currentFirstChild.sibling
                    );
                    lanes = useFiber(
                      currentFirstChild,
                      newChild.props.children
                    );
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  }
                } else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
                  deleteRemainingChildren(
                    returnFiber,
                    currentFirstChild.sibling
                  );
                  lanes = useFiber(currentFirstChild, newChild.props);
                  coerceRef(lanes, newChild);
                  lanes.return = returnFiber;
                  returnFiber = lanes;
                  break a;
                }
                deleteRemainingChildren(returnFiber, currentFirstChild);
                break;
              } else deleteChild(returnFiber, currentFirstChild);
              currentFirstChild = currentFirstChild.sibling;
            }
            newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(
              newChild.props.children,
              returnFiber.mode,
              lanes,
              newChild.key
            ), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(
              newChild.type,
              newChild.key,
              newChild.props,
              null,
              returnFiber.mode,
              lanes
            ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
          }
          return placeSingleChild(returnFiber);
        case REACT_PORTAL_TYPE:
          a: {
            for (key = newChild.key; null !== currentFirstChild; ) {
              if (currentFirstChild.key === key)
                if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                  deleteRemainingChildren(
                    returnFiber,
                    currentFirstChild.sibling
                  );
                  lanes = useFiber(currentFirstChild, newChild.children || []);
                  lanes.return = returnFiber;
                  returnFiber = lanes;
                  break a;
                } else {
                  deleteRemainingChildren(returnFiber, currentFirstChild);
                  break;
                }
              else deleteChild(returnFiber, currentFirstChild);
              currentFirstChild = currentFirstChild.sibling;
            }
            lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
            lanes.return = returnFiber;
            returnFiber = lanes;
          }
          return placeSingleChild(returnFiber);
        case REACT_LAZY_TYPE:
          return key = newChild._init, newChild = key(newChild._payload), reconcileChildFibersImpl(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          );
      }
      if (isArrayImpl(newChild))
        return reconcileChildrenArray(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
      if (getIteratorFn(newChild)) {
        key = getIteratorFn(newChild);
        if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
        newChild = key.call(newChild);
        return reconcileChildrenIterator(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
      }
      if ("function" === typeof newChild.then)
        return reconcileChildFibersImpl(
          returnFiber,
          currentFirstChild,
          unwrapThenable(newChild),
          lanes
        );
      if (newChild.$$typeof === REACT_CONTEXT_TYPE)
        return reconcileChildFibersImpl(
          returnFiber,
          currentFirstChild,
          readContextDuringReconciliation(returnFiber, newChild),
          lanes
        );
      throwOnInvalidObjectType(returnFiber, newChild);
    }
    return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
  }
  return function(returnFiber, currentFirstChild, newChild, lanes) {
    try {
      thenableIndexCounter = 0;
      var firstChildFiber = reconcileChildFibersImpl(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes
      );
      thenableState = null;
      return firstChildFiber;
    } catch (x) {
      if (x === SuspenseException || x === SuspenseActionException) throw x;
      var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
      fiber.lanes = lanes;
      fiber.return = returnFiber;
      return fiber;
    } finally {
    }
  };
}
var reconcileChildFibers = createChildReconciler(true), mountChildFibers = createChildReconciler(false), suspenseHandlerStackCursor = createCursor(null), shellBoundary = null;
function pushPrimaryTreeSuspenseHandler(handler) {
  var current = handler.alternate;
  push(suspenseStackCursor, suspenseStackCursor.current & 1);
  push(suspenseHandlerStackCursor, handler);
  null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
}
function pushOffscreenSuspenseHandler(fiber) {
  if (22 === fiber.tag) {
    if (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary) {
      var current = fiber.alternate;
      null !== current && null !== current.memoizedState && (shellBoundary = fiber);
    }
  } else reuseSuspenseHandlerOnStack();
}
function reuseSuspenseHandlerOnStack() {
  push(suspenseStackCursor, suspenseStackCursor.current);
  push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
}
function popSuspenseHandler(fiber) {
  pop(suspenseHandlerStackCursor);
  shellBoundary === fiber && (shellBoundary = null);
  pop(suspenseStackCursor);
}
var suspenseStackCursor = createCursor(0);
function findFirstSuspended(row) {
  for (var node = row; null !== node; ) {
    if (13 === node.tag) {
      var state = node.memoizedState;
      if (null !== state && (state = state.dehydrated, null === state || "$?" === state.data || isSuspenseInstanceFallback(state)))
        return node;
    } else if (19 === node.tag && void 0 !== node.memoizedProps.revealOrder) {
      if (0 !== (node.flags & 128)) return node;
    } else if (null !== node.child) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === row) break;
    for (; null === node.sibling; ) {
      if (null === node.return || node.return === row) return null;
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
  return null;
}
function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
  ctor = workInProgress2.memoizedState;
  getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
  getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
  workInProgress2.memoizedState = getDerivedStateFromProps;
  0 === workInProgress2.lanes && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
}
var classComponentUpdater = {
  enqueueSetState: function(inst, payload, callback) {
    inst = inst._reactInternals;
    var lane = requestUpdateLane(), update = createUpdate(lane);
    update.payload = payload;
    void 0 !== callback && null !== callback && (update.callback = callback);
    payload = enqueueUpdate(inst, update, lane);
    null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
  },
  enqueueReplaceState: function(inst, payload, callback) {
    inst = inst._reactInternals;
    var lane = requestUpdateLane(), update = createUpdate(lane);
    update.tag = 1;
    update.payload = payload;
    void 0 !== callback && null !== callback && (update.callback = callback);
    payload = enqueueUpdate(inst, update, lane);
    null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
  },
  enqueueForceUpdate: function(inst, callback) {
    inst = inst._reactInternals;
    var lane = requestUpdateLane(), update = createUpdate(lane);
    update.tag = 2;
    void 0 !== callback && null !== callback && (update.callback = callback);
    callback = enqueueUpdate(inst, update, lane);
    null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
  }
};
function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
  workInProgress2 = workInProgress2.stateNode;
  return "function" === typeof workInProgress2.shouldComponentUpdate ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
}
function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
  workInProgress2 = instance.state;
  "function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
  "function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
  instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
}
function resolveClassComponentProps(Component2, baseProps) {
  var newProps = baseProps;
  if ("ref" in baseProps) {
    newProps = {};
    for (var propName in baseProps)
      "ref" !== propName && (newProps[propName] = baseProps[propName]);
  }
  if (Component2 = Component2.defaultProps) {
    newProps === baseProps && (newProps = assign({}, newProps));
    for (var propName$73 in Component2)
      void 0 === newProps[propName$73] && (newProps[propName$73] = Component2[propName$73]);
  }
  return newProps;
}
var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
  if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
    var event = new window.ErrorEvent("error", {
      bubbles: true,
      cancelable: true,
      message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
      error
    });
    if (!window.dispatchEvent(event)) return;
  } else if ("object" === typeof process && "function" === typeof process.emit) {
    process.emit("uncaughtException", error);
    return;
  }
  console.error(error);
};
function defaultOnUncaughtError(error) {
  reportGlobalError(error);
}
function defaultOnCaughtError(error) {
  console.error(error);
}
function defaultOnRecoverableError(error) {
  reportGlobalError(error);
}
function logUncaughtError(root2, errorInfo) {
  try {
    var onUncaughtError = root2.onUncaughtError;
    onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
  } catch (e$74) {
    setTimeout(function() {
      throw e$74;
    });
  }
}
function logCaughtError(root2, boundary, errorInfo) {
  try {
    var onCaughtError = root2.onCaughtError;
    onCaughtError(errorInfo.value, {
      componentStack: errorInfo.stack,
      errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
    });
  } catch (e$75) {
    setTimeout(function() {
      throw e$75;
    });
  }
}
function createRootErrorUpdate(root2, errorInfo, lane) {
  lane = createUpdate(lane);
  lane.tag = 3;
  lane.payload = { element: null };
  lane.callback = function() {
    logUncaughtError(root2, errorInfo);
  };
  return lane;
}
function createClassErrorUpdate(lane) {
  lane = createUpdate(lane);
  lane.tag = 3;
  return lane;
}
function initializeClassErrorUpdate(update, root2, fiber, errorInfo) {
  var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
  if ("function" === typeof getDerivedStateFromError) {
    var error = errorInfo.value;
    update.payload = function() {
      return getDerivedStateFromError(error);
    };
    update.callback = function() {
      logCaughtError(root2, fiber, errorInfo);
    };
  }
  var inst = fiber.stateNode;
  null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
    logCaughtError(root2, fiber, errorInfo);
    "function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
    var stack = errorInfo.stack;
    this.componentDidCatch(errorInfo.value, {
      componentStack: null !== stack ? stack : ""
    });
  });
}
function throwException(root2, returnFiber, sourceFiber, value, rootRenderLanes) {
  sourceFiber.flags |= 32768;
  if (null !== value && "object" === typeof value && "function" === typeof value.then) {
    returnFiber = sourceFiber.alternate;
    null !== returnFiber && propagateParentContextChanges(
      returnFiber,
      sourceFiber,
      rootRenderLanes,
      true
    );
    sourceFiber = suspenseHandlerStackCursor.current;
    if (null !== sourceFiber) {
      switch (sourceFiber.tag) {
        case 13:
          return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root2, value, rootRenderLanes)), false;
        case 22:
          return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
            transitions: null,
            markerInstances: null,
            retryQueue: /* @__PURE__ */ new Set([value])
          }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root2, value, rootRenderLanes)), false;
      }
      throw Error(formatProdErrorMessage(435, sourceFiber.tag));
    }
    attachPingListener(root2, value, rootRenderLanes);
    renderDidSuspendDelayIfPossible();
    return false;
  }
  if (isHydrating)
    return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root2 = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root2, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
      cause: value
    }), queueHydrationError(
      createCapturedValueAtFiber(returnFiber, sourceFiber)
    )), root2 = root2.current.alternate, root2.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root2.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(
      root2.stateNode,
      value,
      rootRenderLanes
    ), enqueueCapturedUpdate(root2, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), false;
  var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
  wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
  null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
  4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
  if (null === returnFiber) return true;
  value = createCapturedValueAtFiber(value, sourceFiber);
  sourceFiber = returnFiber;
  do {
    switch (sourceFiber.tag) {
      case 3:
        return sourceFiber.flags |= 65536, root2 = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root2, root2 = createRootErrorUpdate(sourceFiber.stateNode, value, root2), enqueueCapturedUpdate(sourceFiber, root2), false;
      case 1:
        if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, 0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
          return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(
            rootRenderLanes,
            root2,
            sourceFiber,
            value
          ), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
    }
    sourceFiber = sourceFiber.return;
  } while (null !== sourceFiber);
  return false;
}
var SelectiveHydrationException = Error(formatProdErrorMessage(461)), didReceiveUpdate = false;
function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
  workInProgress2.child = null === current ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(
    workInProgress2,
    current.child,
    nextChildren,
    renderLanes2
  );
}
function updateForwardRef(current, workInProgress2, Component2, nextProps, renderLanes2) {
  Component2 = Component2.render;
  var ref = workInProgress2.ref;
  if ("ref" in nextProps) {
    var propsWithoutRef = {};
    for (var key in nextProps)
      "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
  } else propsWithoutRef = nextProps;
  prepareToReadContext(workInProgress2);
  nextProps = renderWithHooks(
    current,
    workInProgress2,
    Component2,
    propsWithoutRef,
    ref,
    renderLanes2
  );
  key = checkDidRenderIdHook();
  if (null !== current && !didReceiveUpdate)
    return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  isHydrating && key && pushMaterializedTreeId(workInProgress2);
  workInProgress2.flags |= 1;
  reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
  return workInProgress2.child;
}
function updateMemoComponent(current, workInProgress2, Component2, nextProps, renderLanes2) {
  if (null === current) {
    var type = Component2.type;
    if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component2.compare)
      return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(
        current,
        workInProgress2,
        type,
        nextProps,
        renderLanes2
      );
    current = createFiberFromTypeAndProps(
      Component2.type,
      null,
      nextProps,
      workInProgress2,
      workInProgress2.mode,
      renderLanes2
    );
    current.ref = workInProgress2.ref;
    current.return = workInProgress2;
    return workInProgress2.child = current;
  }
  type = current.child;
  if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
    var prevProps = type.memoizedProps;
    Component2 = Component2.compare;
    Component2 = null !== Component2 ? Component2 : shallowEqual;
    if (Component2(prevProps, nextProps) && current.ref === workInProgress2.ref)
      return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  }
  workInProgress2.flags |= 1;
  current = createWorkInProgress(type, nextProps);
  current.ref = workInProgress2.ref;
  current.return = workInProgress2;
  return workInProgress2.child = current;
}
function updateSimpleMemoComponent(current, workInProgress2, Component2, nextProps, renderLanes2) {
  if (null !== current) {
    var prevProps = current.memoizedProps;
    if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
      if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
        0 !== (current.flags & 131072) && (didReceiveUpdate = true);
      else
        return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  }
  return updateFunctionComponent(
    current,
    workInProgress2,
    Component2,
    nextProps,
    renderLanes2
  );
}
function updateOffscreenComponent(current, workInProgress2, renderLanes2) {
  var nextProps = workInProgress2.pendingProps, nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
  if ("hidden" === nextProps.mode) {
    if (0 !== (workInProgress2.flags & 128)) {
      nextProps = null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2;
      if (null !== current) {
        nextChildren = workInProgress2.child = current.child;
        for (prevState = 0; null !== nextChildren; )
          prevState = prevState | nextChildren.lanes | nextChildren.childLanes, nextChildren = nextChildren.sibling;
        workInProgress2.childLanes = prevState & ~nextProps;
      } else workInProgress2.childLanes = 0, workInProgress2.child = null;
      return deferHiddenOffscreenComponent(
        current,
        workInProgress2,
        nextProps,
        renderLanes2
      );
    }
    if (0 !== (renderLanes2 & 536870912))
      workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, null !== current && pushTransition(
        workInProgress2,
        null !== prevState ? prevState.cachePool : null
      ), null !== prevState ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
    else
      return workInProgress2.lanes = workInProgress2.childLanes = 536870912, deferHiddenOffscreenComponent(
        current,
        workInProgress2,
        null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2,
        renderLanes2
      );
  } else
    null !== prevState ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(), workInProgress2.memoizedState = null) : (null !== current && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
  reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
  return workInProgress2.child;
}
function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2) {
  var JSCompiler_inline_result = peekCacheFromPool();
  JSCompiler_inline_result = null === JSCompiler_inline_result ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
  workInProgress2.memoizedState = {
    baseLanes: nextBaseLanes,
    cachePool: JSCompiler_inline_result
  };
  null !== current && pushTransition(workInProgress2, null);
  reuseHiddenContextOnStack();
  pushOffscreenSuspenseHandler(workInProgress2);
  null !== current && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
  return null;
}
function markRef(current, workInProgress2) {
  var ref = workInProgress2.ref;
  if (null === ref)
    null !== current && null !== current.ref && (workInProgress2.flags |= 4194816);
  else {
    if ("function" !== typeof ref && "object" !== typeof ref)
      throw Error(formatProdErrorMessage(284));
    if (null === current || current.ref !== ref)
      workInProgress2.flags |= 4194816;
  }
}
function updateFunctionComponent(current, workInProgress2, Component2, nextProps, renderLanes2) {
  prepareToReadContext(workInProgress2);
  Component2 = renderWithHooks(
    current,
    workInProgress2,
    Component2,
    nextProps,
    void 0,
    renderLanes2
  );
  nextProps = checkDidRenderIdHook();
  if (null !== current && !didReceiveUpdate)
    return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
  workInProgress2.flags |= 1;
  reconcileChildren(current, workInProgress2, Component2, renderLanes2);
  return workInProgress2.child;
}
function replayFunctionComponent(current, workInProgress2, nextProps, Component2, secondArg, renderLanes2) {
  prepareToReadContext(workInProgress2);
  workInProgress2.updateQueue = null;
  nextProps = renderWithHooksAgain(
    workInProgress2,
    Component2,
    nextProps,
    secondArg
  );
  finishRenderingHooks(current);
  Component2 = checkDidRenderIdHook();
  if (null !== current && !didReceiveUpdate)
    return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  isHydrating && Component2 && pushMaterializedTreeId(workInProgress2);
  workInProgress2.flags |= 1;
  reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
  return workInProgress2.child;
}
function updateClassComponent(current, workInProgress2, Component2, nextProps, renderLanes2) {
  prepareToReadContext(workInProgress2);
  if (null === workInProgress2.stateNode) {
    var context = emptyContextObject, contextType = Component2.contextType;
    "object" === typeof contextType && null !== contextType && (context = readContext(contextType));
    context = new Component2(nextProps, context);
    workInProgress2.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
    context.updater = classComponentUpdater;
    workInProgress2.stateNode = context;
    context._reactInternals = workInProgress2;
    context = workInProgress2.stateNode;
    context.props = nextProps;
    context.state = workInProgress2.memoizedState;
    context.refs = {};
    initializeUpdateQueue(workInProgress2);
    contextType = Component2.contextType;
    context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
    context.state = workInProgress2.memoizedState;
    contextType = Component2.getDerivedStateFromProps;
    "function" === typeof contextType && (applyDerivedStateFromProps(
      workInProgress2,
      Component2,
      contextType,
      nextProps
    ), context.state = workInProgress2.memoizedState);
    "function" === typeof Component2.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
    "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308);
    nextProps = true;
  } else if (null === current) {
    context = workInProgress2.stateNode;
    var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component2, unresolvedOldProps);
    context.props = oldProps;
    var oldContext = context.context, contextType$jscomp$0 = Component2.contextType;
    contextType = emptyContextObject;
    "object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
    var getDerivedStateFromProps = Component2.getDerivedStateFromProps;
    contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
    unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
    contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(
      workInProgress2,
      context,
      nextProps,
      contextType
    );
    hasForceUpdate = false;
    var oldState = workInProgress2.memoizedState;
    context.state = oldState;
    processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
    suspendIfUpdateReadFromEntangledAsyncAction();
    oldContext = workInProgress2.memoizedState;
    unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(
      workInProgress2,
      Component2,
      getDerivedStateFromProps,
      nextProps
    ), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(
      workInProgress2,
      Component2,
      oldProps,
      nextProps,
      oldState,
      oldContext,
      contextType
    )) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), nextProps = false);
  } else {
    context = workInProgress2.stateNode;
    cloneUpdateQueue(current, workInProgress2);
    contextType = workInProgress2.memoizedProps;
    contextType$jscomp$0 = resolveClassComponentProps(Component2, contextType);
    context.props = contextType$jscomp$0;
    getDerivedStateFromProps = workInProgress2.pendingProps;
    oldState = context.context;
    oldContext = Component2.contextType;
    oldProps = emptyContextObject;
    "object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
    unresolvedOldProps = Component2.getDerivedStateFromProps;
    (oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(
      workInProgress2,
      context,
      nextProps,
      oldProps
    );
    hasForceUpdate = false;
    oldState = workInProgress2.memoizedState;
    context.state = oldState;
    processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
    suspendIfUpdateReadFromEntangledAsyncAction();
    var newState = workInProgress2.memoizedState;
    contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(
      workInProgress2,
      Component2,
      unresolvedOldProps,
      nextProps
    ), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(
      workInProgress2,
      Component2,
      contextType$jscomp$0,
      nextProps,
      oldState,
      newState,
      oldProps
    ) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(
      nextProps,
      newState,
      oldProps
    )), "function" === typeof context.componentDidUpdate && (workInProgress2.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress2.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
  }
  context = nextProps;
  markRef(current, workInProgress2);
  nextProps = 0 !== (workInProgress2.flags & 128);
  context || nextProps ? (context = workInProgress2.stateNode, Component2 = nextProps && "function" !== typeof Component2.getDerivedStateFromError ? null : context.render(), workInProgress2.flags |= 1, null !== current && nextProps ? (workInProgress2.child = reconcileChildFibers(
    workInProgress2,
    current.child,
    null,
    renderLanes2
  ), workInProgress2.child = reconcileChildFibers(
    workInProgress2,
    null,
    Component2,
    renderLanes2
  )) : reconcileChildren(current, workInProgress2, Component2, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(
    current,
    workInProgress2,
    renderLanes2
  );
  return current;
}
function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
  resetHydrationState();
  workInProgress2.flags |= 256;
  reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
  return workInProgress2.child;
}
var SUSPENDED_MARKER = {
  dehydrated: null,
  treeContext: null,
  retryLane: 0,
  hydrationErrors: null
};
function mountSuspenseOffscreenState(renderLanes2) {
  return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
}
function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
  current = null !== current ? current.childLanes & ~renderLanes2 : 0;
  primaryTreeDidDefer && (current |= workInProgressDeferredLane);
  return current;
}
function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
  var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = 0 !== (workInProgress2.flags & 128), JSCompiler_temp;
  (JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? false : 0 !== (suspenseStackCursor.current & 2));
  JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
  JSCompiler_temp = 0 !== (workInProgress2.flags & 32);
  workInProgress2.flags &= -33;
  if (null === current) {
    if (isHydrating) {
      showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack();
      if (isHydrating) {
        var nextInstance = nextHydratableInstance, JSCompiler_temp$jscomp$0;
        if (JSCompiler_temp$jscomp$0 = nextInstance) {
          c: {
            JSCompiler_temp$jscomp$0 = nextInstance;
            for (nextInstance = rootOrSingletonContext; 8 !== JSCompiler_temp$jscomp$0.nodeType; ) {
              if (!nextInstance) {
                nextInstance = null;
                break c;
              }
              JSCompiler_temp$jscomp$0 = getNextHydratable(
                JSCompiler_temp$jscomp$0.nextSibling
              );
              if (null === JSCompiler_temp$jscomp$0) {
                nextInstance = null;
                break c;
              }
            }
            nextInstance = JSCompiler_temp$jscomp$0;
          }
          null !== nextInstance ? (workInProgress2.memoizedState = {
            dehydrated: nextInstance,
            treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
            retryLane: 536870912,
            hydrationErrors: null
          }, JSCompiler_temp$jscomp$0 = createFiberImplClass(
            18,
            null,
            null,
            0
          ), JSCompiler_temp$jscomp$0.stateNode = nextInstance, JSCompiler_temp$jscomp$0.return = workInProgress2, workInProgress2.child = JSCompiler_temp$jscomp$0, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, JSCompiler_temp$jscomp$0 = true) : JSCompiler_temp$jscomp$0 = false;
        }
        JSCompiler_temp$jscomp$0 || throwOnHydrationMismatch(workInProgress2);
      }
      nextInstance = workInProgress2.memoizedState;
      if (null !== nextInstance && (nextInstance = nextInstance.dehydrated, null !== nextInstance))
        return isSuspenseInstanceFallback(nextInstance) ? workInProgress2.lanes = 32 : workInProgress2.lanes = 536870912, null;
      popSuspenseHandler(workInProgress2);
    }
    nextInstance = nextProps.children;
    nextProps = nextProps.fallback;
    if (showFallback)
      return reuseSuspenseHandlerOnStack(), showFallback = workInProgress2.mode, nextInstance = mountWorkInProgressOffscreenFiber(
        { mode: "hidden", children: nextInstance },
        showFallback
      ), nextProps = createFiberFromFragment(
        nextProps,
        showFallback,
        renderLanes2,
        null
      ), nextInstance.return = workInProgress2, nextProps.return = workInProgress2, nextInstance.sibling = nextProps, workInProgress2.child = nextInstance, showFallback = workInProgress2.child, showFallback.memoizedState = mountSuspenseOffscreenState(renderLanes2), showFallback.childLanes = getRemainingWorkInPrimaryTree(
        current,
        JSCompiler_temp,
        renderLanes2
      ), workInProgress2.memoizedState = SUSPENDED_MARKER, nextProps;
    pushPrimaryTreeSuspenseHandler(workInProgress2);
    return mountSuspensePrimaryChildren(workInProgress2, nextInstance);
  }
  JSCompiler_temp$jscomp$0 = current.memoizedState;
  if (null !== JSCompiler_temp$jscomp$0 && (nextInstance = JSCompiler_temp$jscomp$0.dehydrated, null !== nextInstance)) {
    if (didSuspend)
      workInProgress2.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, workInProgress2 = retrySuspenseComponentWithoutHydrating(
        current,
        workInProgress2,
        renderLanes2
      )) : null !== workInProgress2.memoizedState ? (reuseSuspenseHandlerOnStack(), workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null) : (reuseSuspenseHandlerOnStack(), showFallback = nextProps.fallback, nextInstance = workInProgress2.mode, nextProps = mountWorkInProgressOffscreenFiber(
        { mode: "visible", children: nextProps.children },
        nextInstance
      ), showFallback = createFiberFromFragment(
        showFallback,
        nextInstance,
        renderLanes2,
        null
      ), showFallback.flags |= 2, nextProps.return = workInProgress2, showFallback.return = workInProgress2, nextProps.sibling = showFallback, workInProgress2.child = nextProps, reconcileChildFibers(
        workInProgress2,
        current.child,
        null,
        renderLanes2
      ), nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
        current,
        JSCompiler_temp,
        renderLanes2
      ), workInProgress2.memoizedState = SUSPENDED_MARKER, workInProgress2 = showFallback);
    else if (pushPrimaryTreeSuspenseHandler(workInProgress2), isSuspenseInstanceFallback(nextInstance)) {
      JSCompiler_temp = nextInstance.nextSibling && nextInstance.nextSibling.dataset;
      if (JSCompiler_temp) var digest = JSCompiler_temp.dgst;
      JSCompiler_temp = digest;
      nextProps = Error(formatProdErrorMessage(419));
      nextProps.stack = "";
      nextProps.digest = JSCompiler_temp;
      queueHydrationError({ value: nextProps, source: null, stack: null });
      workInProgress2 = retrySuspenseComponentWithoutHydrating(
        current,
        workInProgress2,
        renderLanes2
      );
    } else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), JSCompiler_temp = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || JSCompiler_temp) {
      JSCompiler_temp = workInProgressRoot;
      if (null !== JSCompiler_temp && (nextProps = renderLanes2 & -renderLanes2, nextProps = 0 !== (nextProps & 42) ? 1 : getBumpedLaneForHydrationByLane(nextProps), nextProps = 0 !== (nextProps & (JSCompiler_temp.suspendedLanes | renderLanes2)) ? 0 : nextProps, 0 !== nextProps && nextProps !== JSCompiler_temp$jscomp$0.retryLane))
        throw JSCompiler_temp$jscomp$0.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
      "$?" === nextInstance.data || renderDidSuspendDelayIfPossible();
      workInProgress2 = retrySuspenseComponentWithoutHydrating(
        current,
        workInProgress2,
        renderLanes2
      );
    } else
      "$?" === nextInstance.data ? (workInProgress2.flags |= 192, workInProgress2.child = current.child, workInProgress2 = null) : (current = JSCompiler_temp$jscomp$0.treeContext, nextHydratableInstance = getNextHydratable(
        nextInstance.nextSibling
      ), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && (idStack[idStackIndex++] = treeContextId, idStack[idStackIndex++] = treeContextOverflow, idStack[idStackIndex++] = treeContextProvider, treeContextId = current.id, treeContextOverflow = current.overflow, treeContextProvider = workInProgress2), workInProgress2 = mountSuspensePrimaryChildren(
        workInProgress2,
        nextProps.children
      ), workInProgress2.flags |= 4096);
    return workInProgress2;
  }
  if (showFallback)
    return reuseSuspenseHandlerOnStack(), showFallback = nextProps.fallback, nextInstance = workInProgress2.mode, JSCompiler_temp$jscomp$0 = current.child, digest = JSCompiler_temp$jscomp$0.sibling, nextProps = createWorkInProgress(JSCompiler_temp$jscomp$0, {
      mode: "hidden",
      children: nextProps.children
    }), nextProps.subtreeFlags = JSCompiler_temp$jscomp$0.subtreeFlags & 65011712, null !== digest ? showFallback = createWorkInProgress(digest, showFallback) : (showFallback = createFiberFromFragment(
      showFallback,
      nextInstance,
      renderLanes2,
      null
    ), showFallback.flags |= 2), showFallback.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = showFallback, workInProgress2.child = nextProps, nextProps = showFallback, showFallback = workInProgress2.child, nextInstance = current.child.memoizedState, null === nextInstance ? nextInstance = mountSuspenseOffscreenState(renderLanes2) : (JSCompiler_temp$jscomp$0 = nextInstance.cachePool, null !== JSCompiler_temp$jscomp$0 ? (digest = CacheContext._currentValue, JSCompiler_temp$jscomp$0 = JSCompiler_temp$jscomp$0.parent !== digest ? { parent: digest, pool: digest } : JSCompiler_temp$jscomp$0) : JSCompiler_temp$jscomp$0 = getSuspendedCache(), nextInstance = {
      baseLanes: nextInstance.baseLanes | renderLanes2,
      cachePool: JSCompiler_temp$jscomp$0
    }), showFallback.memoizedState = nextInstance, showFallback.childLanes = getRemainingWorkInPrimaryTree(
      current,
      JSCompiler_temp,
      renderLanes2
    ), workInProgress2.memoizedState = SUSPENDED_MARKER, nextProps;
  pushPrimaryTreeSuspenseHandler(workInProgress2);
  renderLanes2 = current.child;
  current = renderLanes2.sibling;
  renderLanes2 = createWorkInProgress(renderLanes2, {
    mode: "visible",
    children: nextProps.children
  });
  renderLanes2.return = workInProgress2;
  renderLanes2.sibling = null;
  null !== current && (JSCompiler_temp = workInProgress2.deletions, null === JSCompiler_temp ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
  workInProgress2.child = renderLanes2;
  workInProgress2.memoizedState = null;
  return renderLanes2;
}
function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
  primaryChildren = mountWorkInProgressOffscreenFiber(
    { mode: "visible", children: primaryChildren },
    workInProgress2.mode
  );
  primaryChildren.return = workInProgress2;
  return workInProgress2.child = primaryChildren;
}
function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
  offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
  offscreenProps.lanes = 0;
  offscreenProps.stateNode = {
    _visibility: 1,
    _pendingMarkers: null,
    _retryCache: null,
    _transitions: null
  };
  return offscreenProps;
}
function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
  reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
  current = mountSuspensePrimaryChildren(
    workInProgress2,
    workInProgress2.pendingProps.children
  );
  current.flags |= 2;
  workInProgress2.memoizedState = null;
  return current;
}
function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
  fiber.lanes |= renderLanes2;
  var alternate = fiber.alternate;
  null !== alternate && (alternate.lanes |= renderLanes2);
  scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
}
function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode) {
  var renderState = workInProgress2.memoizedState;
  null === renderState ? workInProgress2.memoizedState = {
    isBackwards,
    rendering: null,
    renderingStartTime: 0,
    last: lastContentRow,
    tail,
    tailMode
  } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode);
}
function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
  var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
  reconcileChildren(current, workInProgress2, nextProps.children, renderLanes2);
  nextProps = suspenseStackCursor.current;
  if (0 !== (nextProps & 2))
    nextProps = nextProps & 1 | 2, workInProgress2.flags |= 128;
  else {
    if (null !== current && 0 !== (current.flags & 128))
      a: for (current = workInProgress2.child; null !== current; ) {
        if (13 === current.tag)
          null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
        else if (19 === current.tag)
          scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
        else if (null !== current.child) {
          current.child.return = current;
          current = current.child;
          continue;
        }
        if (current === workInProgress2) break a;
        for (; null === current.sibling; ) {
          if (null === current.return || current.return === workInProgress2)
            break a;
          current = current.return;
        }
        current.sibling.return = current.return;
        current = current.sibling;
      }
    nextProps &= 1;
  }
  push(suspenseStackCursor, nextProps);
  switch (revealOrder) {
    case "forwards":
      renderLanes2 = workInProgress2.child;
      for (revealOrder = null; null !== renderLanes2; )
        current = renderLanes2.alternate, null !== current && null === findFirstSuspended(current) && (revealOrder = renderLanes2), renderLanes2 = renderLanes2.sibling;
      renderLanes2 = revealOrder;
      null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null);
      initSuspenseListRenderState(
        workInProgress2,
        false,
        revealOrder,
        renderLanes2,
        tailMode
      );
      break;
    case "backwards":
      renderLanes2 = null;
      revealOrder = workInProgress2.child;
      for (workInProgress2.child = null; null !== revealOrder; ) {
        current = revealOrder.alternate;
        if (null !== current && null === findFirstSuspended(current)) {
          workInProgress2.child = revealOrder;
          break;
        }
        current = revealOrder.sibling;
        revealOrder.sibling = renderLanes2;
        renderLanes2 = revealOrder;
        revealOrder = current;
      }
      initSuspenseListRenderState(
        workInProgress2,
        true,
        renderLanes2,
        null,
        tailMode
      );
      break;
    case "together":
      initSuspenseListRenderState(workInProgress2, false, null, null, void 0);
      break;
    default:
      workInProgress2.memoizedState = null;
  }
  return workInProgress2.child;
}
function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
  null !== current && (workInProgress2.dependencies = current.dependencies);
  workInProgressRootSkippedLanes |= workInProgress2.lanes;
  if (0 === (renderLanes2 & workInProgress2.childLanes))
    if (null !== current) {
      if (propagateParentContextChanges(
        current,
        workInProgress2,
        renderLanes2,
        false
      ), 0 === (renderLanes2 & workInProgress2.childLanes))
        return null;
    } else return null;
  if (null !== current && workInProgress2.child !== current.child)
    throw Error(formatProdErrorMessage(153));
  if (null !== workInProgress2.child) {
    current = workInProgress2.child;
    renderLanes2 = createWorkInProgress(current, current.pendingProps);
    workInProgress2.child = renderLanes2;
    for (renderLanes2.return = workInProgress2; null !== current.sibling; )
      current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
    renderLanes2.sibling = null;
  }
  return workInProgress2.child;
}
function checkScheduledUpdateOrContext(current, renderLanes2) {
  if (0 !== (current.lanes & renderLanes2)) return true;
  current = current.dependencies;
  return null !== current && checkIfContextChanged(current) ? true : false;
}
function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
  switch (workInProgress2.tag) {
    case 3:
      pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
      pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
      resetHydrationState();
      break;
    case 27:
    case 5:
      pushHostContext(workInProgress2);
      break;
    case 4:
      pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
      break;
    case 10:
      pushProvider(
        workInProgress2,
        workInProgress2.type,
        workInProgress2.memoizedProps.value
      );
      break;
    case 13:
      var state = workInProgress2.memoizedState;
      if (null !== state) {
        if (null !== state.dehydrated)
          return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
        if (0 !== (renderLanes2 & workInProgress2.child.childLanes))
          return updateSuspenseComponent(current, workInProgress2, renderLanes2);
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        current = bailoutOnAlreadyFinishedWork(
          current,
          workInProgress2,
          renderLanes2
        );
        return null !== current ? current.sibling : null;
      }
      pushPrimaryTreeSuspenseHandler(workInProgress2);
      break;
    case 19:
      var didSuspendBefore = 0 !== (current.flags & 128);
      state = 0 !== (renderLanes2 & workInProgress2.childLanes);
      state || (propagateParentContextChanges(
        current,
        workInProgress2,
        renderLanes2,
        false
      ), state = 0 !== (renderLanes2 & workInProgress2.childLanes));
      if (didSuspendBefore) {
        if (state)
          return updateSuspenseListComponent(
            current,
            workInProgress2,
            renderLanes2
          );
        workInProgress2.flags |= 128;
      }
      didSuspendBefore = workInProgress2.memoizedState;
      null !== didSuspendBefore && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
      push(suspenseStackCursor, suspenseStackCursor.current);
      if (state) break;
      else return null;
    case 22:
    case 23:
      return workInProgress2.lanes = 0, updateOffscreenComponent(current, workInProgress2, renderLanes2);
    case 24:
      pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
  }
  return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
}
function beginWork(current, workInProgress2, renderLanes2) {
  if (null !== current)
    if (current.memoizedProps !== workInProgress2.pendingProps)
      didReceiveUpdate = true;
    else {
      if (!checkScheduledUpdateOrContext(current, renderLanes2) && 0 === (workInProgress2.flags & 128))
        return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(
          current,
          workInProgress2,
          renderLanes2
        );
      didReceiveUpdate = 0 !== (current.flags & 131072) ? true : false;
    }
  else
    didReceiveUpdate = false, isHydrating && 0 !== (workInProgress2.flags & 1048576) && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
  workInProgress2.lanes = 0;
  switch (workInProgress2.tag) {
    case 16:
      a: {
        current = workInProgress2.pendingProps;
        var lazyComponent = workInProgress2.elementType, init = lazyComponent._init;
        lazyComponent = init(lazyComponent._payload);
        workInProgress2.type = lazyComponent;
        if ("function" === typeof lazyComponent)
          shouldConstruct(lazyComponent) ? (current = resolveClassComponentProps(lazyComponent, current), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(
            null,
            workInProgress2,
            lazyComponent,
            current,
            renderLanes2
          )) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(
            null,
            workInProgress2,
            lazyComponent,
            current,
            renderLanes2
          ));
        else {
          if (void 0 !== lazyComponent && null !== lazyComponent) {
            if (init = lazyComponent.$$typeof, init === REACT_FORWARD_REF_TYPE) {
              workInProgress2.tag = 11;
              workInProgress2 = updateForwardRef(
                null,
                workInProgress2,
                lazyComponent,
                current,
                renderLanes2
              );
              break a;
            } else if (init === REACT_MEMO_TYPE) {
              workInProgress2.tag = 14;
              workInProgress2 = updateMemoComponent(
                null,
                workInProgress2,
                lazyComponent,
                current,
                renderLanes2
              );
              break a;
            }
          }
          workInProgress2 = getComponentNameFromType(lazyComponent) || lazyComponent;
          throw Error(formatProdErrorMessage(306, workInProgress2, ""));
        }
      }
      return workInProgress2;
    case 0:
      return updateFunctionComponent(
        current,
        workInProgress2,
        workInProgress2.type,
        workInProgress2.pendingProps,
        renderLanes2
      );
    case 1:
      return lazyComponent = workInProgress2.type, init = resolveClassComponentProps(
        lazyComponent,
        workInProgress2.pendingProps
      ), updateClassComponent(
        current,
        workInProgress2,
        lazyComponent,
        init,
        renderLanes2
      );
    case 3:
      a: {
        pushHostContainer(
          workInProgress2,
          workInProgress2.stateNode.containerInfo
        );
        if (null === current) throw Error(formatProdErrorMessage(387));
        lazyComponent = workInProgress2.pendingProps;
        var prevState = workInProgress2.memoizedState;
        init = prevState.element;
        cloneUpdateQueue(current, workInProgress2);
        processUpdateQueue(workInProgress2, lazyComponent, null, renderLanes2);
        var nextState = workInProgress2.memoizedState;
        lazyComponent = nextState.cache;
        pushProvider(workInProgress2, CacheContext, lazyComponent);
        lazyComponent !== prevState.cache && propagateContextChanges(
          workInProgress2,
          [CacheContext],
          renderLanes2,
          true
        );
        suspendIfUpdateReadFromEntangledAsyncAction();
        lazyComponent = nextState.element;
        if (prevState.isDehydrated)
          if (prevState = {
            element: lazyComponent,
            isDehydrated: false,
            cache: nextState.cache
          }, workInProgress2.updateQueue.baseState = prevState, workInProgress2.memoizedState = prevState, workInProgress2.flags & 256) {
            workInProgress2 = mountHostRootWithoutHydrating(
              current,
              workInProgress2,
              lazyComponent,
              renderLanes2
            );
            break a;
          } else if (lazyComponent !== init) {
            init = createCapturedValueAtFiber(
              Error(formatProdErrorMessage(424)),
              workInProgress2
            );
            queueHydrationError(init);
            workInProgress2 = mountHostRootWithoutHydrating(
              current,
              workInProgress2,
              lazyComponent,
              renderLanes2
            );
            break a;
          } else {
            current = workInProgress2.stateNode.containerInfo;
            switch (current.nodeType) {
              case 9:
                current = current.body;
                break;
              default:
                current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
            }
            nextHydratableInstance = getNextHydratable(current.firstChild);
            hydrationParentFiber = workInProgress2;
            isHydrating = true;
            hydrationErrors = null;
            rootOrSingletonContext = true;
            renderLanes2 = mountChildFibers(
              workInProgress2,
              null,
              lazyComponent,
              renderLanes2
            );
            for (workInProgress2.child = renderLanes2; renderLanes2; )
              renderLanes2.flags = renderLanes2.flags & -3 | 4096, renderLanes2 = renderLanes2.sibling;
          }
        else {
          resetHydrationState();
          if (lazyComponent === init) {
            workInProgress2 = bailoutOnAlreadyFinishedWork(
              current,
              workInProgress2,
              renderLanes2
            );
            break a;
          }
          reconcileChildren(
            current,
            workInProgress2,
            lazyComponent,
            renderLanes2
          );
        }
        workInProgress2 = workInProgress2.child;
      }
      return workInProgress2;
    case 26:
      return markRef(current, workInProgress2), null === current ? (renderLanes2 = getResource(
        workInProgress2.type,
        null,
        workInProgress2.pendingProps,
        null
      )) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (renderLanes2 = workInProgress2.type, current = workInProgress2.pendingProps, lazyComponent = getOwnerDocumentFromRootContainer(
        rootInstanceStackCursor.current
      ).createElement(renderLanes2), lazyComponent[internalInstanceKey] = workInProgress2, lazyComponent[internalPropsKey] = current, setInitialProperties(lazyComponent, renderLanes2, current), markNodeAsHoistable(lazyComponent), workInProgress2.stateNode = lazyComponent) : workInProgress2.memoizedState = getResource(
        workInProgress2.type,
        current.memoizedProps,
        workInProgress2.pendingProps,
        current.memoizedState
      ), null;
    case 27:
      return pushHostContext(workInProgress2), null === current && isHydrating && (lazyComponent = workInProgress2.stateNode = resolveSingletonInstance(
        workInProgress2.type,
        workInProgress2.pendingProps,
        rootInstanceStackCursor.current
      ), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, init = nextHydratableInstance, isSingletonScope(workInProgress2.type) ? (previousHydratableOnEnteringScopedSingleton = init, nextHydratableInstance = getNextHydratable(
        lazyComponent.firstChild
      )) : nextHydratableInstance = init), reconcileChildren(
        current,
        workInProgress2,
        workInProgress2.pendingProps.children,
        renderLanes2
      ), markRef(current, workInProgress2), null === current && (workInProgress2.flags |= 4194304), workInProgress2.child;
    case 5:
      if (null === current && isHydrating) {
        if (init = lazyComponent = nextHydratableInstance)
          lazyComponent = canHydrateInstance(
            lazyComponent,
            workInProgress2.type,
            workInProgress2.pendingProps,
            rootOrSingletonContext
          ), null !== lazyComponent ? (workInProgress2.stateNode = lazyComponent, hydrationParentFiber = workInProgress2, nextHydratableInstance = getNextHydratable(
            lazyComponent.firstChild
          ), rootOrSingletonContext = false, init = true) : init = false;
        init || throwOnHydrationMismatch(workInProgress2);
      }
      pushHostContext(workInProgress2);
      init = workInProgress2.type;
      prevState = workInProgress2.pendingProps;
      nextState = null !== current ? current.memoizedProps : null;
      lazyComponent = prevState.children;
      shouldSetTextContent(init, prevState) ? lazyComponent = null : null !== nextState && shouldSetTextContent(init, nextState) && (workInProgress2.flags |= 32);
      null !== workInProgress2.memoizedState && (init = renderWithHooks(
        current,
        workInProgress2,
        TransitionAwareHostComponent,
        null,
        null,
        renderLanes2
      ), HostTransitionContext._currentValue = init);
      markRef(current, workInProgress2);
      reconcileChildren(current, workInProgress2, lazyComponent, renderLanes2);
      return workInProgress2.child;
    case 6:
      if (null === current && isHydrating) {
        if (current = renderLanes2 = nextHydratableInstance)
          renderLanes2 = canHydrateTextInstance(
            renderLanes2,
            workInProgress2.pendingProps,
            rootOrSingletonContext
          ), null !== renderLanes2 ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
        current || throwOnHydrationMismatch(workInProgress2);
      }
      return null;
    case 13:
      return updateSuspenseComponent(current, workInProgress2, renderLanes2);
    case 4:
      return pushHostContainer(
        workInProgress2,
        workInProgress2.stateNode.containerInfo
      ), lazyComponent = workInProgress2.pendingProps, null === current ? workInProgress2.child = reconcileChildFibers(
        workInProgress2,
        null,
        lazyComponent,
        renderLanes2
      ) : reconcileChildren(
        current,
        workInProgress2,
        lazyComponent,
        renderLanes2
      ), workInProgress2.child;
    case 11:
      return updateForwardRef(
        current,
        workInProgress2,
        workInProgress2.type,
        workInProgress2.pendingProps,
        renderLanes2
      );
    case 7:
      return reconcileChildren(
        current,
        workInProgress2,
        workInProgress2.pendingProps,
        renderLanes2
      ), workInProgress2.child;
    case 8:
      return reconcileChildren(
        current,
        workInProgress2,
        workInProgress2.pendingProps.children,
        renderLanes2
      ), workInProgress2.child;
    case 12:
      return reconcileChildren(
        current,
        workInProgress2,
        workInProgress2.pendingProps.children,
        renderLanes2
      ), workInProgress2.child;
    case 10:
      return lazyComponent = workInProgress2.pendingProps, pushProvider(workInProgress2, workInProgress2.type, lazyComponent.value), reconcileChildren(
        current,
        workInProgress2,
        lazyComponent.children,
        renderLanes2
      ), workInProgress2.child;
    case 9:
      return init = workInProgress2.type._context, lazyComponent = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), init = readContext(init), lazyComponent = lazyComponent(init), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, lazyComponent, renderLanes2), workInProgress2.child;
    case 14:
      return updateMemoComponent(
        current,
        workInProgress2,
        workInProgress2.type,
        workInProgress2.pendingProps,
        renderLanes2
      );
    case 15:
      return updateSimpleMemoComponent(
        current,
        workInProgress2,
        workInProgress2.type,
        workInProgress2.pendingProps,
        renderLanes2
      );
    case 19:
      return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
    case 31:
      return lazyComponent = workInProgress2.pendingProps, renderLanes2 = workInProgress2.mode, lazyComponent = {
        mode: lazyComponent.mode,
        children: lazyComponent.children
      }, null === current ? (renderLanes2 = mountWorkInProgressOffscreenFiber(
        lazyComponent,
        renderLanes2
      ), renderLanes2.ref = workInProgress2.ref, workInProgress2.child = renderLanes2, renderLanes2.return = workInProgress2, workInProgress2 = renderLanes2) : (renderLanes2 = createWorkInProgress(current.child, lazyComponent), renderLanes2.ref = workInProgress2.ref, workInProgress2.child = renderLanes2, renderLanes2.return = workInProgress2, workInProgress2 = renderLanes2), workInProgress2;
    case 22:
      return updateOffscreenComponent(current, workInProgress2, renderLanes2);
    case 24:
      return prepareToReadContext(workInProgress2), lazyComponent = readContext(CacheContext), null === current ? (init = peekCacheFromPool(), null === init && (init = workInProgressRoot, prevState = createCache(), init.pooledCache = prevState, prevState.refCount++, null !== prevState && (init.pooledCacheLanes |= renderLanes2), init = prevState), workInProgress2.memoizedState = {
        parent: lazyComponent,
        cache: init
      }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, init)) : (0 !== (current.lanes & renderLanes2) && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), init = current.memoizedState, prevState = workInProgress2.memoizedState, init.parent !== lazyComponent ? (init = { parent: lazyComponent, cache: lazyComponent }, workInProgress2.memoizedState = init, 0 === workInProgress2.lanes && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = init), pushProvider(workInProgress2, CacheContext, lazyComponent)) : (lazyComponent = prevState.cache, pushProvider(workInProgress2, CacheContext, lazyComponent), lazyComponent !== init.cache && propagateContextChanges(
        workInProgress2,
        [CacheContext],
        renderLanes2,
        true
      ))), reconcileChildren(
        current,
        workInProgress2,
        workInProgress2.pendingProps.children,
        renderLanes2
      ), workInProgress2.child;
    case 29:
      throw workInProgress2.pendingProps;
  }
  throw Error(formatProdErrorMessage(156, workInProgress2.tag));
}
function markUpdate(workInProgress2) {
  workInProgress2.flags |= 4;
}
function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
  if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4))
    workInProgress2.flags &= -16777217;
  else if (workInProgress2.flags |= 16777216, !preloadResource(resource)) {
    resource = suspenseHandlerStackCursor.current;
    if (null !== resource && ((workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null !== shellBoundary : (workInProgressRootRenderLanes & 62914560) !== workInProgressRootRenderLanes && 0 === (workInProgressRootRenderLanes & 536870912) || resource !== shellBoundary))
      throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
    workInProgress2.flags |= 8192;
  }
}
function scheduleRetryEffect(workInProgress2, retryQueue) {
  null !== retryQueue && (workInProgress2.flags |= 4);
  workInProgress2.flags & 16384 && (retryQueue = 22 !== workInProgress2.tag ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
}
function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
  if (!isHydrating)
    switch (renderState.tailMode) {
      case "hidden":
        hasRenderedATailFallback = renderState.tail;
        for (var lastTailNode = null; null !== hasRenderedATailFallback; )
          null !== hasRenderedATailFallback.alternate && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
        null === lastTailNode ? renderState.tail = null : lastTailNode.sibling = null;
        break;
      case "collapsed":
        lastTailNode = renderState.tail;
        for (var lastTailNode$113 = null; null !== lastTailNode; )
          null !== lastTailNode.alternate && (lastTailNode$113 = lastTailNode), lastTailNode = lastTailNode.sibling;
        null === lastTailNode$113 ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$113.sibling = null;
    }
}
function bubbleProperties(completedWork) {
  var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
  if (didBailout)
    for (var child$114 = completedWork.child; null !== child$114; )
      newChildLanes |= child$114.lanes | child$114.childLanes, subtreeFlags |= child$114.subtreeFlags & 65011712, subtreeFlags |= child$114.flags & 65011712, child$114.return = completedWork, child$114 = child$114.sibling;
  else
    for (child$114 = completedWork.child; null !== child$114; )
      newChildLanes |= child$114.lanes | child$114.childLanes, subtreeFlags |= child$114.subtreeFlags, subtreeFlags |= child$114.flags, child$114.return = completedWork, child$114 = child$114.sibling;
  completedWork.subtreeFlags |= subtreeFlags;
  completedWork.childLanes = newChildLanes;
  return didBailout;
}
function completeWork(current, workInProgress2, renderLanes2) {
  var newProps = workInProgress2.pendingProps;
  popTreeContext(workInProgress2);
  switch (workInProgress2.tag) {
    case 31:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return bubbleProperties(workInProgress2), null;
    case 1:
      return bubbleProperties(workInProgress2), null;
    case 3:
      renderLanes2 = workInProgress2.stateNode;
      newProps = null;
      null !== current && (newProps = current.memoizedState.cache);
      workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
      popProvider(CacheContext);
      popHostContainer();
      renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
      if (null === current || null === current.child)
        popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress2.flags & 256) || (workInProgress2.flags |= 1024, upgradeHydrationErrorsToRecoverable());
      bubbleProperties(workInProgress2);
      return null;
    case 26:
      return renderLanes2 = workInProgress2.memoizedState, null === current ? (markUpdate(workInProgress2), null !== renderLanes2 ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, renderLanes2)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217)) : renderLanes2 ? renderLanes2 !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, renderLanes2)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (current.memoizedProps !== newProps && markUpdate(workInProgress2), bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217), null;
    case 27:
      popHostContext(workInProgress2);
      renderLanes2 = rootInstanceStackCursor.current;
      var type = workInProgress2.type;
      if (null !== current && null != workInProgress2.stateNode)
        current.memoizedProps !== newProps && markUpdate(workInProgress2);
      else {
        if (!newProps) {
          if (null === workInProgress2.stateNode)
            throw Error(formatProdErrorMessage(166));
          bubbleProperties(workInProgress2);
          return null;
        }
        current = contextStackCursor.current;
        popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2) : (current = resolveSingletonInstance(type, newProps, renderLanes2), workInProgress2.stateNode = current, markUpdate(workInProgress2));
      }
      bubbleProperties(workInProgress2);
      return null;
    case 5:
      popHostContext(workInProgress2);
      renderLanes2 = workInProgress2.type;
      if (null !== current && null != workInProgress2.stateNode)
        current.memoizedProps !== newProps && markUpdate(workInProgress2);
      else {
        if (!newProps) {
          if (null === workInProgress2.stateNode)
            throw Error(formatProdErrorMessage(166));
          bubbleProperties(workInProgress2);
          return null;
        }
        current = contextStackCursor.current;
        if (popHydrationState(workInProgress2))
          prepareToHydrateHostInstance(workInProgress2);
        else {
          type = getOwnerDocumentFromRootContainer(
            rootInstanceStackCursor.current
          );
          switch (current) {
            case 1:
              current = type.createElementNS(
                "http://www.w3.org/2000/svg",
                renderLanes2
              );
              break;
            case 2:
              current = type.createElementNS(
                "http://www.w3.org/1998/Math/MathML",
                renderLanes2
              );
              break;
            default:
              switch (renderLanes2) {
                case "svg":
                  current = type.createElementNS(
                    "http://www.w3.org/2000/svg",
                    renderLanes2
                  );
                  break;
                case "math":
                  current = type.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    renderLanes2
                  );
                  break;
                case "script":
                  current = type.createElement("div");
                  current.innerHTML = "<script><\/script>";
                  current = current.removeChild(current.firstChild);
                  break;
                case "select":
                  current = "string" === typeof newProps.is ? type.createElement("select", { is: newProps.is }) : type.createElement("select");
                  newProps.multiple ? current.multiple = true : newProps.size && (current.size = newProps.size);
                  break;
                default:
                  current = "string" === typeof newProps.is ? type.createElement(renderLanes2, { is: newProps.is }) : type.createElement(renderLanes2);
              }
          }
          current[internalInstanceKey] = workInProgress2;
          current[internalPropsKey] = newProps;
          a: for (type = workInProgress2.child; null !== type; ) {
            if (5 === type.tag || 6 === type.tag)
              current.appendChild(type.stateNode);
            else if (4 !== type.tag && 27 !== type.tag && null !== type.child) {
              type.child.return = type;
              type = type.child;
              continue;
            }
            if (type === workInProgress2) break a;
            for (; null === type.sibling; ) {
              if (null === type.return || type.return === workInProgress2)
                break a;
              type = type.return;
            }
            type.sibling.return = type.return;
            type = type.sibling;
          }
          workInProgress2.stateNode = current;
          a: switch (setInitialProperties(current, renderLanes2, newProps), renderLanes2) {
            case "button":
            case "input":
            case "select":
            case "textarea":
              current = !!newProps.autoFocus;
              break a;
            case "img":
              current = true;
              break a;
            default:
              current = false;
          }
          current && markUpdate(workInProgress2);
        }
      }
      bubbleProperties(workInProgress2);
      workInProgress2.flags &= -16777217;
      return null;
    case 6:
      if (current && null != workInProgress2.stateNode)
        current.memoizedProps !== newProps && markUpdate(workInProgress2);
      else {
        if ("string" !== typeof newProps && null === workInProgress2.stateNode)
          throw Error(formatProdErrorMessage(166));
        current = rootInstanceStackCursor.current;
        if (popHydrationState(workInProgress2)) {
          current = workInProgress2.stateNode;
          renderLanes2 = workInProgress2.memoizedProps;
          newProps = null;
          type = hydrationParentFiber;
          if (null !== type)
            switch (type.tag) {
              case 27:
              case 5:
                newProps = type.memoizedProps;
            }
          current[internalInstanceKey] = workInProgress2;
          current = current.nodeValue === renderLanes2 || null !== newProps && true === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes2) ? true : false;
          current || throwOnHydrationMismatch(workInProgress2);
        } else
          current = getOwnerDocumentFromRootContainer(current).createTextNode(
            newProps
          ), current[internalInstanceKey] = workInProgress2, workInProgress2.stateNode = current;
      }
      bubbleProperties(workInProgress2);
      return null;
    case 13:
      newProps = workInProgress2.memoizedState;
      if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
        type = popHydrationState(workInProgress2);
        if (null !== newProps && null !== newProps.dehydrated) {
          if (null === current) {
            if (!type) throw Error(formatProdErrorMessage(318));
            type = workInProgress2.memoizedState;
            type = null !== type ? type.dehydrated : null;
            if (!type) throw Error(formatProdErrorMessage(317));
            type[internalInstanceKey] = workInProgress2;
          } else
            resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
          bubbleProperties(workInProgress2);
          type = false;
        } else
          type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = true;
        if (!type) {
          if (workInProgress2.flags & 256)
            return popSuspenseHandler(workInProgress2), workInProgress2;
          popSuspenseHandler(workInProgress2);
          return null;
        }
      }
      popSuspenseHandler(workInProgress2);
      if (0 !== (workInProgress2.flags & 128))
        return workInProgress2.lanes = renderLanes2, workInProgress2;
      renderLanes2 = null !== newProps;
      current = null !== current && null !== current.memoizedState;
      if (renderLanes2) {
        newProps = workInProgress2.child;
        type = null;
        null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool);
        var cache$127 = null;
        null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (cache$127 = newProps.memoizedState.cachePool.pool);
        cache$127 !== type && (newProps.flags |= 2048);
      }
      renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
      scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
      bubbleProperties(workInProgress2);
      return null;
    case 4:
      return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress2.stateNode.containerInfo), bubbleProperties(workInProgress2), null;
    case 10:
      return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
    case 19:
      pop(suspenseStackCursor);
      type = workInProgress2.memoizedState;
      if (null === type) return bubbleProperties(workInProgress2), null;
      newProps = 0 !== (workInProgress2.flags & 128);
      cache$127 = type.rendering;
      if (null === cache$127)
        if (newProps) cutOffTailIfNeeded(type, false);
        else {
          if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128))
            for (current = workInProgress2.child; null !== current; ) {
              cache$127 = findFirstSuspended(current);
              if (null !== cache$127) {
                workInProgress2.flags |= 128;
                cutOffTailIfNeeded(type, false);
                current = cache$127.updateQueue;
                workInProgress2.updateQueue = current;
                scheduleRetryEffect(workInProgress2, current);
                workInProgress2.subtreeFlags = 0;
                current = renderLanes2;
                for (renderLanes2 = workInProgress2.child; null !== renderLanes2; )
                  resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
                push(
                  suspenseStackCursor,
                  suspenseStackCursor.current & 1 | 2
                );
                return workInProgress2.child;
              }
              current = current.sibling;
            }
          null !== type.tail && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, newProps = true, cutOffTailIfNeeded(type, false), workInProgress2.lanes = 4194304);
        }
      else {
        if (!newProps)
          if (current = findFirstSuspended(cache$127), null !== current) {
            if (workInProgress2.flags |= 128, newProps = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(type, true), null === type.tail && "hidden" === type.tailMode && !cache$127.alternate && !isHydrating)
              return bubbleProperties(workInProgress2), null;
          } else
            2 * now() - type.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes2 && (workInProgress2.flags |= 128, newProps = true, cutOffTailIfNeeded(type, false), workInProgress2.lanes = 4194304);
        type.isBackwards ? (cache$127.sibling = workInProgress2.child, workInProgress2.child = cache$127) : (current = type.last, null !== current ? current.sibling = cache$127 : workInProgress2.child = cache$127, type.last = cache$127);
      }
      if (null !== type.tail)
        return workInProgress2 = type.tail, type.rendering = workInProgress2, type.tail = workInProgress2.sibling, type.renderingStartTime = now(), workInProgress2.sibling = null, current = suspenseStackCursor.current, push(suspenseStackCursor, newProps ? current & 1 | 2 : current & 1), workInProgress2;
      bubbleProperties(workInProgress2);
      return null;
    case 22:
    case 23:
      return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = null !== workInProgress2.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? 0 !== (renderLanes2 & 536870912) && 0 === (workInProgress2.flags & 128) && (bubbleProperties(workInProgress2), workInProgress2.subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, null !== renderLanes2 && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes2 = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress2.memoizedState && null !== workInProgress2.memoizedState.cachePool && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), null !== current && pop(resumedCache), null;
    case 24:
      return renderLanes2 = null, null !== current && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
    case 25:
      return null;
    case 30:
      return null;
  }
  throw Error(formatProdErrorMessage(156, workInProgress2.tag));
}
function unwindWork(current, workInProgress2) {
  popTreeContext(workInProgress2);
  switch (workInProgress2.tag) {
    case 1:
      return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
    case 3:
      return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
    case 26:
    case 27:
    case 5:
      return popHostContext(workInProgress2), null;
    case 13:
      popSuspenseHandler(workInProgress2);
      current = workInProgress2.memoizedState;
      if (null !== current && null !== current.dehydrated) {
        if (null === workInProgress2.alternate)
          throw Error(formatProdErrorMessage(340));
        resetHydrationState();
      }
      current = workInProgress2.flags;
      return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
    case 19:
      return pop(suspenseStackCursor), null;
    case 4:
      return popHostContainer(), null;
    case 10:
      return popProvider(workInProgress2.type), null;
    case 22:
    case 23:
      return popSuspenseHandler(workInProgress2), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
    case 24:
      return popProvider(CacheContext), null;
    case 25:
      return null;
    default:
      return null;
  }
}
function unwindInterruptedWork(current, interruptedWork) {
  popTreeContext(interruptedWork);
  switch (interruptedWork.tag) {
    case 3:
      popProvider(CacheContext);
      popHostContainer();
      break;
    case 26:
    case 27:
    case 5:
      popHostContext(interruptedWork);
      break;
    case 4:
      popHostContainer();
      break;
    case 13:
      popSuspenseHandler(interruptedWork);
      break;
    case 19:
      pop(suspenseStackCursor);
      break;
    case 10:
      popProvider(interruptedWork.type);
      break;
    case 22:
    case 23:
      popSuspenseHandler(interruptedWork);
      popHiddenContext();
      null !== current && pop(resumedCache);
      break;
    case 24:
      popProvider(CacheContext);
  }
}
function commitHookEffectListMount(flags, finishedWork) {
  try {
    var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
    if (null !== lastEffect) {
      var firstEffect = lastEffect.next;
      updateQueue = firstEffect;
      do {
        if ((updateQueue.tag & flags) === flags) {
          lastEffect = void 0;
          var create = updateQueue.create, inst = updateQueue.inst;
          lastEffect = create();
          inst.destroy = lastEffect;
        }
        updateQueue = updateQueue.next;
      } while (updateQueue !== firstEffect);
    }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
  try {
    var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
    if (null !== lastEffect) {
      var firstEffect = lastEffect.next;
      updateQueue = firstEffect;
      do {
        if ((updateQueue.tag & flags) === flags) {
          var inst = updateQueue.inst, destroy = inst.destroy;
          if (void 0 !== destroy) {
            inst.destroy = void 0;
            lastEffect = finishedWork;
            var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
            try {
              destroy_();
            } catch (error) {
              captureCommitPhaseError(
                lastEffect,
                nearestMountedAncestor,
                error
              );
            }
          }
        }
        updateQueue = updateQueue.next;
      } while (updateQueue !== firstEffect);
    }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitClassCallbacks(finishedWork) {
  var updateQueue = finishedWork.updateQueue;
  if (null !== updateQueue) {
    var instance = finishedWork.stateNode;
    try {
      commitCallbacks(updateQueue, instance);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
}
function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
  instance.props = resolveClassComponentProps(
    current.type,
    current.memoizedProps
  );
  instance.state = current.memoizedState;
  try {
    instance.componentWillUnmount();
  } catch (error) {
    captureCommitPhaseError(current, nearestMountedAncestor, error);
  }
}
function safelyAttachRef(current, nearestMountedAncestor) {
  try {
    var ref = current.ref;
    if (null !== ref) {
      switch (current.tag) {
        case 26:
        case 27:
        case 5:
          var instanceToUse = current.stateNode;
          break;
        case 30:
          instanceToUse = current.stateNode;
          break;
        default:
          instanceToUse = current.stateNode;
      }
      "function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
    }
  } catch (error) {
    captureCommitPhaseError(current, nearestMountedAncestor, error);
  }
}
function safelyDetachRef(current, nearestMountedAncestor) {
  var ref = current.ref, refCleanup = current.refCleanup;
  if (null !== ref)
    if ("function" === typeof refCleanup)
      try {
        refCleanup();
      } catch (error) {
        captureCommitPhaseError(current, nearestMountedAncestor, error);
      } finally {
        current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
      }
    else if ("function" === typeof ref)
      try {
        ref(null);
      } catch (error$143) {
        captureCommitPhaseError(current, nearestMountedAncestor, error$143);
      }
    else ref.current = null;
}
function commitHostMount(finishedWork) {
  var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
  try {
    a: switch (type) {
      case "button":
      case "input":
      case "select":
      case "textarea":
        props.autoFocus && instance.focus();
        break a;
      case "img":
        props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
    }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitHostUpdate(finishedWork, newProps, oldProps) {
  try {
    var domElement = finishedWork.stateNode;
    updateProperties(domElement, finishedWork.type, oldProps, newProps);
    domElement[internalPropsKey] = newProps;
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function isHostParent(fiber) {
  return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
}
function getHostSibling(fiber) {
  a: for (; ; ) {
    for (; null === fiber.sibling; ) {
      if (null === fiber.return || isHostParent(fiber.return)) return null;
      fiber = fiber.return;
    }
    fiber.sibling.return = fiber.return;
    for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag; ) {
      if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
      if (fiber.flags & 2) continue a;
      if (null === fiber.child || 4 === fiber.tag) continue a;
      else fiber.child.return = fiber, fiber = fiber.child;
    }
    if (!(fiber.flags & 2)) return fiber.stateNode;
  }
}
function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  var tag = node.tag;
  if (5 === tag || 6 === tag)
    node = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(node, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(node), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1));
  else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, null !== node))
    for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling; null !== node; )
      insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
}
function insertOrAppendPlacementNode(node, before, parent) {
  var tag = node.tag;
  if (5 === tag || 6 === tag)
    node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
  else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, null !== node))
    for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling; null !== node; )
      insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
}
function commitHostSingletonAcquisition(finishedWork) {
  var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
  try {
    for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length; )
      singleton.removeAttributeNode(attributes[0]);
    setInitialProperties(singleton, type, props);
    singleton[internalInstanceKey] = finishedWork;
    singleton[internalPropsKey] = props;
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
var offscreenSubtreeIsHidden = false, offscreenSubtreeWasHidden = false, needsFormReset = false, PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set, nextEffect = null;
function commitBeforeMutationEffects(root2, firstChild) {
  root2 = root2.containerInfo;
  eventsEnabled = _enabled;
  root2 = getActiveElementDeep(root2);
  if (hasSelectionCapabilities(root2)) {
    if ("selectionStart" in root2)
      var JSCompiler_temp = {
        start: root2.selectionStart,
        end: root2.selectionEnd
      };
    else
      a: {
        JSCompiler_temp = (JSCompiler_temp = root2.ownerDocument) && JSCompiler_temp.defaultView || window;
        var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
        if (selection && 0 !== selection.rangeCount) {
          JSCompiler_temp = selection.anchorNode;
          var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
          selection = selection.focusOffset;
          try {
            JSCompiler_temp.nodeType, focusNode.nodeType;
          } catch (e$20) {
            JSCompiler_temp = null;
            break a;
          }
          var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root2, parentNode = null;
          b: for (; ; ) {
            for (var next; ; ) {
              node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
              node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
              3 === node.nodeType && (length += node.nodeValue.length);
              if (null === (next = node.firstChild)) break;
              parentNode = node;
              node = next;
            }
            for (; ; ) {
              if (node === root2) break b;
              parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
              parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
              if (null !== (next = node.nextSibling)) break;
              node = parentNode;
              parentNode = node.parentNode;
            }
            node = next;
          }
          JSCompiler_temp = -1 === start || -1 === end ? null : { start, end };
        } else JSCompiler_temp = null;
      }
    JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
  } else JSCompiler_temp = null;
  selectionInformation = { focusedElem: root2, selectionRange: JSCompiler_temp };
  _enabled = false;
  for (nextEffect = firstChild; null !== nextEffect; )
    if (firstChild = nextEffect, root2 = firstChild.child, 0 !== (firstChild.subtreeFlags & 1024) && null !== root2)
      root2.return = firstChild, nextEffect = root2;
    else
      for (; null !== nextEffect; ) {
        firstChild = nextEffect;
        focusNode = firstChild.alternate;
        root2 = firstChild.flags;
        switch (firstChild.tag) {
          case 0:
            break;
          case 11:
          case 15:
            break;
          case 1:
            if (0 !== (root2 & 1024) && null !== focusNode) {
              root2 = void 0;
              JSCompiler_temp = firstChild;
              anchorOffset = focusNode.memoizedProps;
              focusNode = focusNode.memoizedState;
              selection = JSCompiler_temp.stateNode;
              try {
                var resolvedPrevProps = resolveClassComponentProps(
                  JSCompiler_temp.type,
                  anchorOffset,
                  JSCompiler_temp.elementType === JSCompiler_temp.type
                );
                root2 = selection.getSnapshotBeforeUpdate(
                  resolvedPrevProps,
                  focusNode
                );
                selection.__reactInternalSnapshotBeforeUpdate = root2;
              } catch (error) {
                captureCommitPhaseError(
                  JSCompiler_temp,
                  JSCompiler_temp.return,
                  error
                );
              }
            }
            break;
          case 3:
            if (0 !== (root2 & 1024)) {
              if (root2 = firstChild.stateNode.containerInfo, JSCompiler_temp = root2.nodeType, 9 === JSCompiler_temp)
                clearContainerSparingly(root2);
              else if (1 === JSCompiler_temp)
                switch (root2.nodeName) {
                  case "HEAD":
                  case "HTML":
                  case "BODY":
                    clearContainerSparingly(root2);
                    break;
                  default:
                    root2.textContent = "";
                }
            }
            break;
          case 5:
          case 26:
          case 27:
          case 6:
          case 4:
          case 17:
            break;
          default:
            if (0 !== (root2 & 1024)) throw Error(formatProdErrorMessage(163));
        }
        root2 = firstChild.sibling;
        if (null !== root2) {
          root2.return = firstChild.return;
          nextEffect = root2;
          break;
        }
        nextEffect = firstChild.return;
      }
}
function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
  var flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      flags & 4 && commitHookEffectListMount(5, finishedWork);
      break;
    case 1:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      if (flags & 4)
        if (finishedRoot = finishedWork.stateNode, null === current)
          try {
            finishedRoot.componentDidMount();
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        else {
          var prevProps = resolveClassComponentProps(
            finishedWork.type,
            current.memoizedProps
          );
          current = current.memoizedState;
          try {
            finishedRoot.componentDidUpdate(
              prevProps,
              current,
              finishedRoot.__reactInternalSnapshotBeforeUpdate
            );
          } catch (error$142) {
            captureCommitPhaseError(
              finishedWork,
              finishedWork.return,
              error$142
            );
          }
        }
      flags & 64 && commitClassCallbacks(finishedWork);
      flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
      break;
    case 3:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
        current = null;
        if (null !== finishedWork.child)
          switch (finishedWork.child.tag) {
            case 27:
            case 5:
              current = finishedWork.child.stateNode;
              break;
            case 1:
              current = finishedWork.child.stateNode;
          }
        try {
          commitCallbacks(finishedRoot, current);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      break;
    case 27:
      null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
    case 26:
    case 5:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      null === current && flags & 4 && commitHostMount(finishedWork);
      flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
      break;
    case 12:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      break;
    case 13:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
      flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(
        null,
        finishedWork
      ), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
      break;
    case 22:
      flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
      if (!flags) {
        current = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
        prevProps = offscreenSubtreeIsHidden;
        var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = flags;
        (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          0 !== (finishedWork.subtreeFlags & 8772)
        ) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        offscreenSubtreeIsHidden = prevProps;
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
      }
      break;
    case 30:
      break;
    default:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
  }
}
function detachFiberAfterEffects(fiber) {
  var alternate = fiber.alternate;
  null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
  fiber.child = null;
  fiber.deletions = null;
  fiber.sibling = null;
  5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
  fiber.stateNode = null;
  fiber.return = null;
  fiber.dependencies = null;
  fiber.memoizedProps = null;
  fiber.memoizedState = null;
  fiber.pendingProps = null;
  fiber.stateNode = null;
  fiber.updateQueue = null;
}
var hostParent = null, hostParentIsContainer = false;
function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
  for (parent = parent.child; null !== parent; )
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
}
function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
  if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
    try {
      injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
    } catch (err) {
    }
  switch (deletedFiber.tag) {
    case 26:
      offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
      break;
    case 27:
      offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
      var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
      isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      releaseSingletonInstance(deletedFiber.stateNode);
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      break;
    case 5:
      offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
    case 6:
      prevHostParent = hostParent;
      prevHostParentIsContainer = hostParentIsContainer;
      hostParent = null;
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      if (null !== hostParent)
        if (hostParentIsContainer)
          try {
            (9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode);
          } catch (error) {
            captureCommitPhaseError(
              deletedFiber,
              nearestMountedAncestor,
              error
            );
          }
        else
          try {
            hostParent.removeChild(deletedFiber.stateNode);
          } catch (error) {
            captureCommitPhaseError(
              deletedFiber,
              nearestMountedAncestor,
              error
            );
          }
      break;
    case 18:
      null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearSuspenseBoundary(
        9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot,
        deletedFiber.stateNode
      ), retryIfBlockedOn(finishedRoot)) : clearSuspenseBoundary(hostParent, deletedFiber.stateNode));
      break;
    case 4:
      prevHostParent = hostParent;
      prevHostParentIsContainer = hostParentIsContainer;
      hostParent = deletedFiber.stateNode.containerInfo;
      hostParentIsContainer = true;
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      offscreenSubtreeWasHidden || commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
      offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      break;
    case 1:
      offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(
        deletedFiber,
        nearestMountedAncestor,
        prevHostParent
      ));
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      break;
    case 21:
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      break;
    case 22:
      offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      offscreenSubtreeWasHidden = prevHostParent;
      break;
    default:
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
  }
}
function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
  if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot))))
    try {
      retryIfBlockedOn(finishedRoot);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
}
function getRetryCache(finishedWork) {
  switch (finishedWork.tag) {
    case 13:
    case 19:
      var retryCache = finishedWork.stateNode;
      null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
      return retryCache;
    case 22:
      return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
    default:
      throw Error(formatProdErrorMessage(435, finishedWork.tag));
  }
}
function attachSuspenseRetryListeners(finishedWork, wakeables) {
  var retryCache = getRetryCache(finishedWork);
  wakeables.forEach(function(wakeable) {
    var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
    retryCache.has(wakeable) || (retryCache.add(wakeable), wakeable.then(retry, retry));
  });
}
function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
  var deletions = parentFiber.deletions;
  if (null !== deletions)
    for (var i = 0; i < deletions.length; i++) {
      var childToDelete = deletions[i], root2 = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
      a: for (; null !== parent; ) {
        switch (parent.tag) {
          case 27:
            if (isSingletonScope(parent.type)) {
              hostParent = parent.stateNode;
              hostParentIsContainer = false;
              break a;
            }
            break;
          case 5:
            hostParent = parent.stateNode;
            hostParentIsContainer = false;
            break a;
          case 3:
          case 4:
            hostParent = parent.stateNode.containerInfo;
            hostParentIsContainer = true;
            break a;
        }
        parent = parent.return;
      }
      if (null === hostParent) throw Error(formatProdErrorMessage(160));
      commitDeletionEffectsOnFiber(root2, returnFiber, childToDelete);
      hostParent = null;
      hostParentIsContainer = false;
      root2 = childToDelete.alternate;
      null !== root2 && (root2.return = null);
      childToDelete.return = null;
    }
  if (parentFiber.subtreeFlags & 13878)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
}
var currentHoistableRoot = null;
function commitMutationEffectsOnFiber(finishedWork, root2) {
  var current = finishedWork.alternate, flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
      break;
    case 1:
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
      flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (flags = finishedWork.callbacks, null !== flags && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === current ? flags : current.concat(flags))));
      break;
    case 26:
      var hoistableRoot = currentHoistableRoot;
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
      if (flags & 4) {
        var currentResource = null !== current ? current.memoizedState : null;
        flags = finishedWork.memoizedState;
        if (null === current)
          if (null === flags)
            if (null === finishedWork.stateNode) {
              a: {
                flags = finishedWork.type;
                current = finishedWork.memoizedProps;
                hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
                b: switch (flags) {
                  case "title":
                    currentResource = hoistableRoot.getElementsByTagName("title")[0];
                    if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || "http://www.w3.org/2000/svg" === currentResource.namespaceURI || currentResource.hasAttribute("itemprop"))
                      currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(
                        currentResource,
                        hoistableRoot.querySelector("head > title")
                      );
                    setInitialProperties(currentResource, flags, current);
                    currentResource[internalInstanceKey] = finishedWork;
                    markNodeAsHoistable(currentResource);
                    flags = currentResource;
                    break a;
                  case "link":
                    var maybeNodes = getHydratableHoistableCache(
                      "link",
                      "href",
                      hoistableRoot
                    ).get(flags + (current.href || ""));
                    if (maybeNodes) {
                      for (var i = 0; i < maybeNodes.length; i++)
                        if (currentResource = maybeNodes[i], currentResource.getAttribute("href") === (null == current.href || "" === current.href ? null : current.href) && currentResource.getAttribute("rel") === (null == current.rel ? null : current.rel) && currentResource.getAttribute("title") === (null == current.title ? null : current.title) && currentResource.getAttribute("crossorigin") === (null == current.crossOrigin ? null : current.crossOrigin)) {
                          maybeNodes.splice(i, 1);
                          break b;
                        }
                    }
                    currentResource = hoistableRoot.createElement(flags);
                    setInitialProperties(currentResource, flags, current);
                    hoistableRoot.head.appendChild(currentResource);
                    break;
                  case "meta":
                    if (maybeNodes = getHydratableHoistableCache(
                      "meta",
                      "content",
                      hoistableRoot
                    ).get(flags + (current.content || ""))) {
                      for (i = 0; i < maybeNodes.length; i++)
                        if (currentResource = maybeNodes[i], currentResource.getAttribute("content") === (null == current.content ? null : "" + current.content) && currentResource.getAttribute("name") === (null == current.name ? null : current.name) && currentResource.getAttribute("property") === (null == current.property ? null : current.property) && currentResource.getAttribute("http-equiv") === (null == current.httpEquiv ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (null == current.charSet ? null : current.charSet)) {
                          maybeNodes.splice(i, 1);
                          break b;
                        }
                    }
                    currentResource = hoistableRoot.createElement(flags);
                    setInitialProperties(currentResource, flags, current);
                    hoistableRoot.head.appendChild(currentResource);
                    break;
                  default:
                    throw Error(formatProdErrorMessage(468, flags));
                }
                currentResource[internalInstanceKey] = finishedWork;
                markNodeAsHoistable(currentResource);
                flags = currentResource;
              }
              finishedWork.stateNode = flags;
            } else
              mountHoistable(
                hoistableRoot,
                finishedWork.type,
                finishedWork.stateNode
              );
          else
            finishedWork.stateNode = acquireResource(
              hoistableRoot,
              flags,
              finishedWork.memoizedProps
            );
        else
          currentResource !== flags ? (null === currentResource ? null !== current.stateNode && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, null === flags ? mountHoistable(
            hoistableRoot,
            finishedWork.type,
            finishedWork.stateNode
          ) : acquireResource(
            hoistableRoot,
            flags,
            finishedWork.memoizedProps
          )) : null === flags && null !== finishedWork.stateNode && commitHostUpdate(
            finishedWork,
            finishedWork.memoizedProps,
            current.memoizedProps
          );
      }
      break;
    case 27:
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
      null !== current && flags & 4 && commitHostUpdate(
        finishedWork,
        finishedWork.memoizedProps,
        current.memoizedProps
      );
      break;
    case 5:
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
      if (finishedWork.flags & 32) {
        hoistableRoot = finishedWork.stateNode;
        try {
          setTextContent(hoistableRoot, "");
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      flags & 4 && null != finishedWork.stateNode && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(
        finishedWork,
        hoistableRoot,
        null !== current ? current.memoizedProps : hoistableRoot
      ));
      flags & 1024 && (needsFormReset = true);
      break;
    case 6:
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      if (flags & 4) {
        if (null === finishedWork.stateNode)
          throw Error(formatProdErrorMessage(162));
        flags = finishedWork.memoizedProps;
        current = finishedWork.stateNode;
        try {
          current.nodeValue = flags;
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      break;
    case 3:
      tagCaches = null;
      hoistableRoot = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(root2.containerInfo);
      recursivelyTraverseMutationEffects(root2, finishedWork);
      currentHoistableRoot = hoistableRoot;
      commitReconciliationEffects(finishedWork);
      if (flags & 4 && null !== current && current.memoizedState.isDehydrated)
        try {
          retryIfBlockedOn(root2.containerInfo);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
      break;
    case 4:
      flags = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(
        finishedWork.stateNode.containerInfo
      );
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      currentHoistableRoot = flags;
      break;
    case 12:
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      break;
    case 13:
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
      flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
      break;
    case 22:
      hoistableRoot = null !== finishedWork.memoizedState;
      var wasHidden = null !== current && null !== current.memoizedState, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
      offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
      offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
      recursivelyTraverseMutationEffects(root2, finishedWork);
      offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
      offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
      commitReconciliationEffects(finishedWork);
      if (flags & 8192)
        a: for (root2 = finishedWork.stateNode, root2._visibility = hoistableRoot ? root2._visibility & -2 : root2._visibility | 1, hoistableRoot && (null === current || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), current = null, root2 = finishedWork; ; ) {
          if (5 === root2.tag || 26 === root2.tag) {
            if (null === current) {
              wasHidden = current = root2;
              try {
                if (currentResource = wasHidden.stateNode, hoistableRoot)
                  maybeNodes = currentResource.style, "function" === typeof maybeNodes.setProperty ? maybeNodes.setProperty("display", "none", "important") : maybeNodes.display = "none";
                else {
                  i = wasHidden.stateNode;
                  var styleProp = wasHidden.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
                  i.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
                }
              } catch (error) {
                captureCommitPhaseError(wasHidden, wasHidden.return, error);
              }
            }
          } else if (6 === root2.tag) {
            if (null === current) {
              wasHidden = root2;
              try {
                wasHidden.stateNode.nodeValue = hoistableRoot ? "" : wasHidden.memoizedProps;
              } catch (error) {
                captureCommitPhaseError(wasHidden, wasHidden.return, error);
              }
            }
          } else if ((22 !== root2.tag && 23 !== root2.tag || null === root2.memoizedState || root2 === finishedWork) && null !== root2.child) {
            root2.child.return = root2;
            root2 = root2.child;
            continue;
          }
          if (root2 === finishedWork) break a;
          for (; null === root2.sibling; ) {
            if (null === root2.return || root2.return === finishedWork) break a;
            current === root2 && (current = null);
            root2 = root2.return;
          }
          current === root2 && (current = null);
          root2.sibling.return = root2.return;
          root2 = root2.sibling;
        }
      flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (current = flags.retryQueue, null !== current && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
      break;
    case 19:
      recursivelyTraverseMutationEffects(root2, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
      break;
    case 30:
      break;
    case 21:
      break;
    default:
      recursivelyTraverseMutationEffects(root2, finishedWork), commitReconciliationEffects(finishedWork);
  }
}
function commitReconciliationEffects(finishedWork) {
  var flags = finishedWork.flags;
  if (flags & 2) {
    try {
      for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber; ) {
        if (isHostParent(parentFiber)) {
          hostParentFiber = parentFiber;
          break;
        }
        parentFiber = parentFiber.return;
      }
      if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
      switch (hostParentFiber.tag) {
        case 27:
          var parent = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
          insertOrAppendPlacementNode(finishedWork, before, parent);
          break;
        case 5:
          var parent$144 = hostParentFiber.stateNode;
          hostParentFiber.flags & 32 && (setTextContent(parent$144, ""), hostParentFiber.flags &= -33);
          var before$145 = getHostSibling(finishedWork);
          insertOrAppendPlacementNode(finishedWork, before$145, parent$144);
          break;
        case 3:
        case 4:
          var parent$146 = hostParentFiber.stateNode.containerInfo, before$147 = getHostSibling(finishedWork);
          insertOrAppendPlacementNodeIntoContainer(
            finishedWork,
            before$147,
            parent$146
          );
          break;
        default:
          throw Error(formatProdErrorMessage(161));
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
    finishedWork.flags &= -3;
  }
  flags & 4096 && (finishedWork.flags &= -4097);
}
function recursivelyResetForms(parentFiber) {
  if (parentFiber.subtreeFlags & 1024)
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var fiber = parentFiber;
      recursivelyResetForms(fiber);
      5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset();
      parentFiber = parentFiber.sibling;
    }
}
function recursivelyTraverseLayoutEffects(root2, parentFiber) {
  if (parentFiber.subtreeFlags & 8772)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      commitLayoutEffectOnFiber(root2, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
}
function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
  for (parentFiber = parentFiber.child; null !== parentFiber; ) {
    var finishedWork = parentFiber;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 1:
        safelyDetachRef(finishedWork, finishedWork.return);
        var instance = finishedWork.stateNode;
        "function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(
          finishedWork,
          finishedWork.return,
          instance
        );
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 27:
        releaseSingletonInstance(finishedWork.stateNode);
      case 26:
      case 5:
        safelyDetachRef(finishedWork, finishedWork.return);
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 22:
        null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 30:
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      default:
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
    }
    parentFiber = parentFiber.sibling;
  }
}
function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
  includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
  for (parentFiber = parentFiber.child; null !== parentFiber; ) {
    var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        commitHookEffectListMount(4, finishedWork);
        break;
      case 1:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        current = finishedWork;
        finishedRoot = current.stateNode;
        if ("function" === typeof finishedRoot.componentDidMount)
          try {
            finishedRoot.componentDidMount();
          } catch (error) {
            captureCommitPhaseError(current, current.return, error);
          }
        current = finishedWork;
        finishedRoot = current.updateQueue;
        if (null !== finishedRoot) {
          var instance = current.stateNode;
          try {
            var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
            if (null !== hiddenCallbacks)
              for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++)
                callCallback(hiddenCallbacks[finishedRoot], instance);
          } catch (error) {
            captureCommitPhaseError(current, current.return, error);
          }
        }
        includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 27:
        commitHostSingletonAcquisition(finishedWork);
      case 26:
      case 5:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 12:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        break;
      case 13:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
        break;
      case 22:
        null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 30:
        break;
      default:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
    }
    parentFiber = parentFiber.sibling;
  }
}
function commitOffscreenPassiveMountEffects(current, finishedWork) {
  var previousCache = null;
  null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
  current = null;
  null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
  current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
}
function commitCachePassiveMountEffect(current, finishedWork) {
  current = null;
  null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
  finishedWork = finishedWork.memoizedState.cache;
  finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
}
function recursivelyTraversePassiveMountEffects(root2, parentFiber, committedLanes, committedTransitions) {
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      commitPassiveMountOnFiber(
        root2,
        parentFiber,
        committedLanes,
        committedTransitions
      ), parentFiber = parentFiber.sibling;
}
function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
  var flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      flags & 2048 && commitHookEffectListMount(9, finishedWork);
      break;
    case 1:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      break;
    case 3:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      flags & 2048 && (finishedRoot = null, null !== finishedWork.alternate && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, null != finishedRoot && releaseCache(finishedRoot)));
      break;
    case 12:
      if (flags & 2048) {
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        finishedRoot = finishedWork.stateNode;
        try {
          var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
          "function" === typeof onPostCommit && onPostCommit(
            id,
            null === finishedWork.alternate ? "mount" : "update",
            finishedRoot.passiveEffectDuration,
            -0
          );
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      } else
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
      break;
    case 13:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      break;
    case 23:
      break;
    case 22:
      _finishedWork$memoize2 = finishedWork.stateNode;
      id = finishedWork.alternate;
      null !== finishedWork.memoizedState ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      ) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      ) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions,
        0 !== (finishedWork.subtreeFlags & 10256)
      ));
      flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
      break;
    case 24:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
      break;
    default:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
  }
}
function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
  includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 10256);
  for (parentFiber = parentFiber.child; null !== parentFiber; ) {
    var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          includeWorkInProgressEffects
        );
        commitHookEffectListMount(8, finishedWork);
        break;
      case 23:
        break;
      case 22:
        var instance = finishedWork.stateNode;
        null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          includeWorkInProgressEffects
        ) : recursivelyTraverseAtomicPassiveEffects(
          finishedRoot,
          finishedWork
        ) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          includeWorkInProgressEffects
        ));
        includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(
          finishedWork.alternate,
          finishedWork
        );
        break;
      case 24:
        recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          includeWorkInProgressEffects
        );
        includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
        break;
      default:
        recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          includeWorkInProgressEffects
        );
    }
    parentFiber = parentFiber.sibling;
  }
}
function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 22:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
          flags & 2048 && commitOffscreenPassiveMountEffects(
            finishedWork.alternate,
            finishedWork
          );
          break;
        case 24:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
          flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
          break;
        default:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
      }
      parentFiber = parentFiber.sibling;
    }
}
var suspenseyCommitFlag = 8192;
function recursivelyAccumulateSuspenseyCommit(parentFiber) {
  if (parentFiber.subtreeFlags & suspenseyCommitFlag)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      accumulateSuspenseyCommitOnFiber(parentFiber), parentFiber = parentFiber.sibling;
}
function accumulateSuspenseyCommitOnFiber(fiber) {
  switch (fiber.tag) {
    case 26:
      recursivelyAccumulateSuspenseyCommit(fiber);
      fiber.flags & suspenseyCommitFlag && null !== fiber.memoizedState && suspendResource(
        currentHoistableRoot,
        fiber.memoizedState,
        fiber.memoizedProps
      );
      break;
    case 5:
      recursivelyAccumulateSuspenseyCommit(fiber);
      break;
    case 3:
    case 4:
      var previousHoistableRoot = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
      recursivelyAccumulateSuspenseyCommit(fiber);
      currentHoistableRoot = previousHoistableRoot;
      break;
    case 22:
      null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber));
      break;
    default:
      recursivelyAccumulateSuspenseyCommit(fiber);
  }
}
function detachAlternateSiblings(parentFiber) {
  var previousFiber = parentFiber.alternate;
  if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
    previousFiber.child = null;
    do
      previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
    while (null !== parentFiber);
  }
}
function recursivelyTraversePassiveUnmountEffects(parentFiber) {
  var deletions = parentFiber.deletions;
  if (0 !== (parentFiber.flags & 16)) {
    if (null !== deletions)
      for (var i = 0; i < deletions.length; i++) {
        var childToDelete = deletions[i];
        nextEffect = childToDelete;
        commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
          childToDelete,
          parentFiber
        );
      }
    detachAlternateSiblings(parentFiber);
  }
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
}
function commitPassiveUnmountOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
      break;
    case 3:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    case 12:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    case 22:
      var instance = finishedWork.stateNode;
      null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    default:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
  }
}
function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
  var deletions = parentFiber.deletions;
  if (0 !== (parentFiber.flags & 16)) {
    if (null !== deletions)
      for (var i = 0; i < deletions.length; i++) {
        var childToDelete = deletions[i];
        nextEffect = childToDelete;
        commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
          childToDelete,
          parentFiber
        );
      }
    detachAlternateSiblings(parentFiber);
  }
  for (parentFiber = parentFiber.child; null !== parentFiber; ) {
    deletions = parentFiber;
    switch (deletions.tag) {
      case 0:
      case 11:
      case 15:
        commitHookEffectListUnmount(8, deletions, deletions.return);
        recursivelyTraverseDisconnectPassiveEffects(deletions);
        break;
      case 22:
        i = deletions.stateNode;
        i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
        break;
      default:
        recursivelyTraverseDisconnectPassiveEffects(deletions);
    }
    parentFiber = parentFiber.sibling;
  }
}
function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
  for (; null !== nextEffect; ) {
    var fiber = nextEffect;
    switch (fiber.tag) {
      case 0:
      case 11:
      case 15:
        commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
        break;
      case 23:
      case 22:
        if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
          var cache = fiber.memoizedState.cachePool.pool;
          null != cache && cache.refCount++;
        }
        break;
      case 24:
        releaseCache(fiber.memoizedState.cache);
    }
    cache = fiber.child;
    if (null !== cache) cache.return = fiber, nextEffect = cache;
    else
      a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
        cache = nextEffect;
        var sibling = cache.sibling, returnFiber = cache.return;
        detachFiberAfterEffects(cache);
        if (cache === fiber) {
          nextEffect = null;
          break a;
        }
        if (null !== sibling) {
          sibling.return = returnFiber;
          nextEffect = sibling;
          break a;
        }
        nextEffect = returnFiber;
      }
  }
}
var DefaultAsyncDispatcher = {
  getCacheForType: function(resourceType) {
    var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
    void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
    return cacheForType;
  }
}, PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, executionContext = 0, workInProgressRoot = null, workInProgress = null, workInProgressRootRenderLanes = 0, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, workInProgressRootDidSkipSuspendedSiblings = false, workInProgressRootIsPrerendering = false, workInProgressRootDidAttachPingListener = false, entangledRenderLanes = 0, workInProgressRootExitStatus = 0, workInProgressRootSkippedLanes = 0, workInProgressRootInterleavedUpdatedLanes = 0, workInProgressRootPingedLanes = 0, workInProgressDeferredLane = 0, workInProgressSuspendedRetryLanes = 0, workInProgressRootConcurrentErrors = null, workInProgressRootRecoverableErrors = null, workInProgressRootDidIncludeRecursiveRenderUpdate = false, globalMostRecentFallbackTime = 0, workInProgressRootRenderTargetTime = Infinity, workInProgressTransitions = null, legacyErrorBoundariesThatAlreadyFailed = null, pendingEffectsStatus = 0, pendingEffectsRoot = null, pendingFinishedWork = null, pendingEffectsLanes = 0, pendingEffectsRemainingLanes = 0, pendingPassiveTransitions = null, pendingRecoverableErrors = null, nestedUpdateCount = 0, rootWithNestedUpdates = null;
function requestUpdateLane() {
  if (0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes)
    return workInProgressRootRenderLanes & -workInProgressRootRenderLanes;
  if (null !== ReactSharedInternals.T) {
    var actionScopeLane = currentEntangledLane;
    return 0 !== actionScopeLane ? actionScopeLane : requestTransitionLane();
  }
  return resolveUpdatePriority();
}
function requestDeferredLane() {
  0 === workInProgressDeferredLane && (workInProgressDeferredLane = 0 === (workInProgressRootRenderLanes & 536870912) || isHydrating ? claimNextTransitionLane() : 536870912);
  var suspenseHandler = suspenseHandlerStackCursor.current;
  null !== suspenseHandler && (suspenseHandler.flags |= 32);
  return workInProgressDeferredLane;
}
function scheduleUpdateOnFiber(root2, fiber, lane) {
  if (root2 === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
    prepareFreshStack(root2, 0), markRootSuspended(
      root2,
      workInProgressRootRenderLanes,
      workInProgressDeferredLane,
      false
    );
  markRootUpdated$1(root2, lane);
  if (0 === (executionContext & 2) || root2 !== workInProgressRoot)
    root2 === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(
      root2,
      workInProgressRootRenderLanes,
      workInProgressDeferredLane,
      false
    )), ensureRootIsScheduled(root2);
}
function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
  if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
  var shouldTimeSlice = !forceSync && 0 === (lanes & 124) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
  do {
    if (0 === exitStatus) {
      workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
      break;
    } else {
      forceSync = root$jscomp$0.current.alternate;
      if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
        exitStatus = renderRootSync(root$jscomp$0, lanes, false);
        renderWasConcurrent = false;
        continue;
      }
      if (2 === exitStatus) {
        renderWasConcurrent = lanes;
        if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
          var JSCompiler_inline_result = 0;
        else
          JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
        if (0 !== JSCompiler_inline_result) {
          lanes = JSCompiler_inline_result;
          a: {
            var root2 = root$jscomp$0;
            exitStatus = workInProgressRootConcurrentErrors;
            var wasRootDehydrated = root2.current.memoizedState.isDehydrated;
            wasRootDehydrated && (prepareFreshStack(root2, JSCompiler_inline_result).flags |= 256);
            JSCompiler_inline_result = renderRootSync(
              root2,
              JSCompiler_inline_result,
              false
            );
            if (2 !== JSCompiler_inline_result) {
              if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                root2.errorRecoveryDisabledLanes |= renderWasConcurrent;
                workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                exitStatus = 4;
                break a;
              }
              renderWasConcurrent = workInProgressRootRecoverableErrors;
              workInProgressRootRecoverableErrors = exitStatus;
              null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(
                workInProgressRootRecoverableErrors,
                renderWasConcurrent
              ));
            }
            exitStatus = JSCompiler_inline_result;
          }
          renderWasConcurrent = false;
          if (2 !== exitStatus) continue;
        }
      }
      if (1 === exitStatus) {
        prepareFreshStack(root$jscomp$0, 0);
        markRootSuspended(root$jscomp$0, lanes, 0, true);
        break;
      }
      a: {
        shouldTimeSlice = root$jscomp$0;
        renderWasConcurrent = exitStatus;
        switch (renderWasConcurrent) {
          case 0:
          case 1:
            throw Error(formatProdErrorMessage(345));
          case 4:
            if ((lanes & 4194048) !== lanes) break;
          case 6:
            markRootSuspended(
              shouldTimeSlice,
              lanes,
              workInProgressDeferredLane,
              !workInProgressRootDidSkipSuspendedSiblings
            );
            break a;
          case 2:
            workInProgressRootRecoverableErrors = null;
            break;
          case 3:
          case 5:
            break;
          default:
            throw Error(formatProdErrorMessage(329));
        }
        if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
          markRootSuspended(
            shouldTimeSlice,
            lanes,
            workInProgressDeferredLane,
            !workInProgressRootDidSkipSuspendedSiblings
          );
          if (0 !== getNextLanes(shouldTimeSlice, 0, true)) break a;
          shouldTimeSlice.timeoutHandle = scheduleTimeout(
            commitRootWhenReady.bind(
              null,
              shouldTimeSlice,
              forceSync,
              workInProgressRootRecoverableErrors,
              workInProgressTransitions,
              workInProgressRootDidIncludeRecursiveRenderUpdate,
              lanes,
              workInProgressDeferredLane,
              workInProgressRootInterleavedUpdatedLanes,
              workInProgressSuspendedRetryLanes,
              workInProgressRootDidSkipSuspendedSiblings,
              renderWasConcurrent,
              2,
              -0,
              0
            ),
            exitStatus
          );
          break a;
        }
        commitRootWhenReady(
          shouldTimeSlice,
          forceSync,
          workInProgressRootRecoverableErrors,
          workInProgressTransitions,
          workInProgressRootDidIncludeRecursiveRenderUpdate,
          lanes,
          workInProgressDeferredLane,
          workInProgressRootInterleavedUpdatedLanes,
          workInProgressSuspendedRetryLanes,
          workInProgressRootDidSkipSuspendedSiblings,
          renderWasConcurrent,
          0,
          -0,
          0
        );
      }
    }
    break;
  } while (1);
  ensureRootIsScheduled(root$jscomp$0);
}
function commitRootWhenReady(root2, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
  root2.timeoutHandle = -1;
  suspendedCommitReason = finishedWork.subtreeFlags;
  if (suspendedCommitReason & 8192 || 16785408 === (suspendedCommitReason & 16785408)) {
    if (suspendedState = { stylesheets: null, count: 0, unsuspend: noop }, accumulateSuspenseyCommitOnFiber(finishedWork), suspendedCommitReason = waitForCommitToBeReady(), null !== suspendedCommitReason) {
      root2.cancelPendingCommit = suspendedCommitReason(
        commitRoot.bind(
          null,
          root2,
          finishedWork,
          lanes,
          recoverableErrors,
          transitions,
          didIncludeRenderPhaseUpdate,
          spawnedLane,
          updatedLanes,
          suspendedRetryLanes,
          exitStatus,
          1,
          completedRenderStartTime,
          completedRenderEndTime
        )
      );
      markRootSuspended(root2, lanes, spawnedLane, !didSkipSuspendedSiblings);
      return;
    }
  }
  commitRoot(
    root2,
    finishedWork,
    lanes,
    recoverableErrors,
    transitions,
    didIncludeRenderPhaseUpdate,
    spawnedLane,
    updatedLanes,
    suspendedRetryLanes
  );
}
function isRenderConsistentWithExternalStores(finishedWork) {
  for (var node = finishedWork; ; ) {
    var tag = node.tag;
    if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag)))
      for (var i = 0; i < tag.length; i++) {
        var check = tag[i], getSnapshot = check.getSnapshot;
        check = check.value;
        try {
          if (!objectIs(getSnapshot(), check)) return false;
        } catch (error) {
          return false;
        }
      }
    tag = node.child;
    if (node.subtreeFlags & 16384 && null !== tag)
      tag.return = node, node = tag;
    else {
      if (node === finishedWork) break;
      for (; null === node.sibling; ) {
        if (null === node.return || node.return === finishedWork) return true;
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
  }
  return true;
}
function markRootSuspended(root2, suspendedLanes, spawnedLane, didAttemptEntireTree) {
  suspendedLanes &= ~workInProgressRootPingedLanes;
  suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
  root2.suspendedLanes |= suspendedLanes;
  root2.pingedLanes &= ~suspendedLanes;
  didAttemptEntireTree && (root2.warmLanes |= suspendedLanes);
  didAttemptEntireTree = root2.expirationTimes;
  for (var lanes = suspendedLanes; 0 < lanes; ) {
    var index$4 = 31 - clz32(lanes), lane = 1 << index$4;
    didAttemptEntireTree[index$4] = -1;
    lanes &= ~lane;
  }
  0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, suspendedLanes);
}
function flushSyncWork$1() {
  return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0), false) : true;
}
function resetWorkInProgressStack() {
  if (null !== workInProgress) {
    if (0 === workInProgressSuspendedReason)
      var interruptedWork = workInProgress.return;
    else
      interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState = null, thenableIndexCounter = 0, interruptedWork = workInProgress;
    for (; null !== interruptedWork; )
      unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
    workInProgress = null;
  }
}
function prepareFreshStack(root2, lanes) {
  var timeoutHandle = root2.timeoutHandle;
  -1 !== timeoutHandle && (root2.timeoutHandle = -1, cancelTimeout(timeoutHandle));
  timeoutHandle = root2.cancelPendingCommit;
  null !== timeoutHandle && (root2.cancelPendingCommit = null, timeoutHandle());
  resetWorkInProgressStack();
  workInProgressRoot = root2;
  workInProgress = timeoutHandle = createWorkInProgress(root2.current, null);
  workInProgressRootRenderLanes = lanes;
  workInProgressSuspendedReason = 0;
  workInProgressThrownValue = null;
  workInProgressRootDidSkipSuspendedSiblings = false;
  workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root2, lanes);
  workInProgressRootDidAttachPingListener = false;
  workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
  workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
  workInProgressRootDidIncludeRecursiveRenderUpdate = false;
  0 !== (lanes & 8) && (lanes |= lanes & 32);
  var allEntangledLanes = root2.entangledLanes;
  if (0 !== allEntangledLanes)
    for (root2 = root2.entanglements, allEntangledLanes &= lanes; 0 < allEntangledLanes; ) {
      var index$2 = 31 - clz32(allEntangledLanes), lane = 1 << index$2;
      lanes |= root2[index$2];
      allEntangledLanes &= ~lane;
    }
  entangledRenderLanes = lanes;
  finishQueueingConcurrentUpdates();
  return timeoutHandle;
}
function handleThrow(root2, thrownValue) {
  currentlyRenderingFiber = null;
  ReactSharedInternals.H = ContextOnlyDispatcher;
  thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
  workInProgressThrownValue = thrownValue;
  null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(
    root2,
    createCapturedValueAtFiber(thrownValue, root2.current)
  ));
}
function pushDispatcher() {
  var prevDispatcher = ReactSharedInternals.H;
  ReactSharedInternals.H = ContextOnlyDispatcher;
  return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
}
function pushAsyncDispatcher() {
  var prevAsyncDispatcher = ReactSharedInternals.A;
  ReactSharedInternals.A = DefaultAsyncDispatcher;
  return prevAsyncDispatcher;
}
function renderDidSuspendDelayIfPossible() {
  workInProgressRootExitStatus = 4;
  workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = true);
  0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(
    workInProgressRoot,
    workInProgressRootRenderLanes,
    workInProgressDeferredLane,
    false
  );
}
function renderRootSync(root2, lanes, shouldYieldForPrerendering) {
  var prevExecutionContext = executionContext;
  executionContext |= 2;
  var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
  if (workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes)
    workInProgressTransitions = null, prepareFreshStack(root2, lanes);
  lanes = false;
  var exitStatus = workInProgressRootExitStatus;
  a: do
    try {
      if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
        var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
        switch (workInProgressSuspendedReason) {
          case 8:
            resetWorkInProgressStack();
            exitStatus = 6;
            break a;
          case 3:
          case 2:
          case 9:
          case 6:
            null === suspenseHandlerStackCursor.current && (lanes = true);
            var reason = workInProgressSuspendedReason;
            workInProgressSuspendedReason = 0;
            workInProgressThrownValue = null;
            throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
            if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
              exitStatus = 0;
              break a;
            }
            break;
          default:
            reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
        }
      }
      workLoopSync();
      exitStatus = workInProgressRootExitStatus;
      break;
    } catch (thrownValue$167) {
      handleThrow(root2, thrownValue$167);
    }
  while (1);
  lanes && root2.shellSuspendCounter++;
  lastContextDependency = currentlyRenderingFiber$1 = null;
  executionContext = prevExecutionContext;
  ReactSharedInternals.H = prevDispatcher;
  ReactSharedInternals.A = prevAsyncDispatcher;
  null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
  return exitStatus;
}
function workLoopSync() {
  for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
}
function renderRootConcurrent(root2, lanes) {
  var prevExecutionContext = executionContext;
  executionContext |= 2;
  var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
  workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root2, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
    root2,
    lanes
  );
  a: do
    try {
      if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
        lanes = workInProgress;
        var thrownValue = workInProgressThrownValue;
        b: switch (workInProgressSuspendedReason) {
          case 1:
            workInProgressSuspendedReason = 0;
            workInProgressThrownValue = null;
            throwAndUnwindWorkLoop(root2, lanes, thrownValue, 1);
            break;
          case 2:
          case 9:
            if (isThenableResolved(thrownValue)) {
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              replaySuspendedUnitOfWork(lanes);
              break;
            }
            lanes = function() {
              2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root2 || (workInProgressSuspendedReason = 7);
              ensureRootIsScheduled(root2);
            };
            thrownValue.then(lanes, lanes);
            break a;
          case 3:
            workInProgressSuspendedReason = 7;
            break a;
          case 4:
            workInProgressSuspendedReason = 5;
            break a;
          case 7:
            isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, lanes, thrownValue, 7));
            break;
          case 5:
            var resource = null;
            switch (workInProgress.tag) {
              case 26:
                resource = workInProgress.memoizedState;
              case 5:
              case 27:
                var hostFiber = workInProgress;
                if (resource ? preloadResource(resource) : 1) {
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  var sibling = hostFiber.sibling;
                  if (null !== sibling) workInProgress = sibling;
                  else {
                    var returnFiber = hostFiber.return;
                    null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                  }
                  break b;
                }
            }
            workInProgressSuspendedReason = 0;
            workInProgressThrownValue = null;
            throwAndUnwindWorkLoop(root2, lanes, thrownValue, 5);
            break;
          case 6:
            workInProgressSuspendedReason = 0;
            workInProgressThrownValue = null;
            throwAndUnwindWorkLoop(root2, lanes, thrownValue, 6);
            break;
          case 8:
            resetWorkInProgressStack();
            workInProgressRootExitStatus = 6;
            break a;
          default:
            throw Error(formatProdErrorMessage(462));
        }
      }
      workLoopConcurrentByScheduler();
      break;
    } catch (thrownValue$169) {
      handleThrow(root2, thrownValue$169);
    }
  while (1);
  lastContextDependency = currentlyRenderingFiber$1 = null;
  ReactSharedInternals.H = prevDispatcher;
  ReactSharedInternals.A = prevAsyncDispatcher;
  executionContext = prevExecutionContext;
  if (null !== workInProgress) return 0;
  workInProgressRoot = null;
  workInProgressRootRenderLanes = 0;
  finishQueueingConcurrentUpdates();
  return workInProgressRootExitStatus;
}
function workLoopConcurrentByScheduler() {
  for (; null !== workInProgress && !shouldYield(); )
    performUnitOfWork(workInProgress);
}
function performUnitOfWork(unitOfWork) {
  var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
}
function replaySuspendedUnitOfWork(unitOfWork) {
  var next = unitOfWork;
  var current = next.alternate;
  switch (next.tag) {
    case 15:
    case 0:
      next = replayFunctionComponent(
        current,
        next,
        next.pendingProps,
        next.type,
        void 0,
        workInProgressRootRenderLanes
      );
      break;
    case 11:
      next = replayFunctionComponent(
        current,
        next,
        next.pendingProps,
        next.type.render,
        next.ref,
        workInProgressRootRenderLanes
      );
      break;
    case 5:
      resetHooksOnUnwind(next);
    default:
      unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
  }
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
}
function throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, suspendedReason) {
  lastContextDependency = currentlyRenderingFiber$1 = null;
  resetHooksOnUnwind(unitOfWork);
  thenableState = null;
  thenableIndexCounter = 0;
  var returnFiber = unitOfWork.return;
  try {
    if (throwException(
      root2,
      returnFiber,
      unitOfWork,
      thrownValue,
      workInProgressRootRenderLanes
    )) {
      workInProgressRootExitStatus = 1;
      logUncaughtError(
        root2,
        createCapturedValueAtFiber(thrownValue, root2.current)
      );
      workInProgress = null;
      return;
    }
  } catch (error) {
    if (null !== returnFiber) throw workInProgress = returnFiber, error;
    workInProgressRootExitStatus = 1;
    logUncaughtError(
      root2,
      createCapturedValueAtFiber(thrownValue, root2.current)
    );
    workInProgress = null;
    return;
  }
  if (unitOfWork.flags & 32768) {
    if (isHydrating || 1 === suspendedReason) root2 = true;
    else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912))
      root2 = false;
    else if (workInProgressRootDidSkipSuspendedSiblings = root2 = true, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason)
      suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
    unwindUnitOfWork(unitOfWork, root2);
  } else completeUnitOfWork(unitOfWork);
}
function completeUnitOfWork(unitOfWork) {
  var completedWork = unitOfWork;
  do {
    if (0 !== (completedWork.flags & 32768)) {
      unwindUnitOfWork(
        completedWork,
        workInProgressRootDidSkipSuspendedSiblings
      );
      return;
    }
    unitOfWork = completedWork.return;
    var next = completeWork(
      completedWork.alternate,
      completedWork,
      entangledRenderLanes
    );
    if (null !== next) {
      workInProgress = next;
      return;
    }
    completedWork = completedWork.sibling;
    if (null !== completedWork) {
      workInProgress = completedWork;
      return;
    }
    workInProgress = completedWork = unitOfWork;
  } while (null !== completedWork);
  0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
}
function unwindUnitOfWork(unitOfWork, skipSiblings) {
  do {
    var next = unwindWork(unitOfWork.alternate, unitOfWork);
    if (null !== next) {
      next.flags &= 32767;
      workInProgress = next;
      return;
    }
    next = unitOfWork.return;
    null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
    if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
      workInProgress = unitOfWork;
      return;
    }
    workInProgress = unitOfWork = next;
  } while (null !== unitOfWork);
  workInProgressRootExitStatus = 6;
  workInProgress = null;
}
function commitRoot(root2, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
  root2.cancelPendingCommit = null;
  do
    flushPendingEffects();
  while (0 !== pendingEffectsStatus);
  if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
  if (null !== finishedWork) {
    if (finishedWork === root2.current) throw Error(formatProdErrorMessage(177));
    didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
    didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
    markRootFinished(
      root2,
      lanes,
      didIncludeRenderPhaseUpdate,
      spawnedLane,
      updatedLanes,
      suspendedRetryLanes
    );
    root2 === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
    pendingFinishedWork = finishedWork;
    pendingEffectsRoot = root2;
    pendingEffectsLanes = lanes;
    pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
    pendingPassiveTransitions = transitions;
    pendingRecoverableErrors = recoverableErrors;
    0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? (root2.callbackNode = null, root2.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
      flushPassiveEffects();
      return null;
    })) : (root2.callbackNode = null, root2.callbackPriority = 0);
    recoverableErrors = 0 !== (finishedWork.flags & 13878);
    if (0 !== (finishedWork.subtreeFlags & 13878) || recoverableErrors) {
      recoverableErrors = ReactSharedInternals.T;
      ReactSharedInternals.T = null;
      transitions = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      spawnedLane = executionContext;
      executionContext |= 4;
      try {
        commitBeforeMutationEffects(root2, finishedWork, lanes);
      } finally {
        executionContext = spawnedLane, ReactDOMSharedInternals.p = transitions, ReactSharedInternals.T = recoverableErrors;
      }
    }
    pendingEffectsStatus = 1;
    flushMutationEffects();
    flushLayoutEffects();
    flushSpawnedWork();
  }
}
function flushMutationEffects() {
  if (1 === pendingEffectsStatus) {
    pendingEffectsStatus = 0;
    var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
    if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
      rootMutationHasEffect = ReactSharedInternals.T;
      ReactSharedInternals.T = null;
      var previousPriority = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      try {
        commitMutationEffectsOnFiber(finishedWork, root2);
        var priorSelectionInformation = selectionInformation, curFocusedElem = getActiveElementDeep(root2.containerInfo), priorFocusedElem = priorSelectionInformation.focusedElem, priorSelectionRange = priorSelectionInformation.selectionRange;
        if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(
          priorFocusedElem.ownerDocument.documentElement,
          priorFocusedElem
        )) {
          if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
            var start = priorSelectionRange.start, end = priorSelectionRange.end;
            void 0 === end && (end = start);
            if ("selectionStart" in priorFocusedElem)
              priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(
                end,
                priorFocusedElem.value.length
              );
            else {
              var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
              if (win.getSelection) {
                var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
                !selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
                var startMarker = getNodeForCharacterOffset(
                  priorFocusedElem,
                  start$jscomp$0
                ), endMarker = getNodeForCharacterOffset(
                  priorFocusedElem,
                  end$jscomp$0
                );
                if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
                  var range = doc.createRange();
                  range.setStart(startMarker.node, startMarker.offset);
                  selection.removeAllRanges();
                  start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
                }
              }
            }
          }
          doc = [];
          for (selection = priorFocusedElem; selection = selection.parentNode; )
            1 === selection.nodeType && doc.push({
              element: selection,
              left: selection.scrollLeft,
              top: selection.scrollTop
            });
          "function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
          for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
            var info = doc[priorFocusedElem];
            info.element.scrollLeft = info.left;
            info.element.scrollTop = info.top;
          }
        }
        _enabled = !!eventsEnabled;
        selectionInformation = eventsEnabled = null;
      } finally {
        executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
      }
    }
    root2.current = finishedWork;
    pendingEffectsStatus = 2;
  }
}
function flushLayoutEffects() {
  if (2 === pendingEffectsStatus) {
    pendingEffectsStatus = 0;
    var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
    if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
      rootHasLayoutEffect = ReactSharedInternals.T;
      ReactSharedInternals.T = null;
      var previousPriority = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      try {
        commitLayoutEffectOnFiber(root2, finishedWork.alternate, finishedWork);
      } finally {
        executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
      }
    }
    pendingEffectsStatus = 3;
  }
}
function flushSpawnedWork() {
  if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
    pendingEffectsStatus = 0;
    requestPaint();
    var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
    0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root2, root2.pendingLanes));
    var remainingLanes = root2.pendingLanes;
    0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
    lanesToEventPriority(lanes);
    finishedWork = finishedWork.stateNode;
    if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
      try {
        injectedHook.onCommitFiberRoot(
          rendererID,
          finishedWork,
          void 0,
          128 === (finishedWork.current.flags & 128)
        );
      } catch (err) {
      }
    if (null !== recoverableErrors) {
      finishedWork = ReactSharedInternals.T;
      remainingLanes = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      ReactSharedInternals.T = null;
      try {
        for (var onRecoverableError = root2.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
          var recoverableError = recoverableErrors[i];
          onRecoverableError(recoverableError.value, {
            componentStack: recoverableError.stack
          });
        }
      } finally {
        ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = remainingLanes;
      }
    }
    0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
    ensureRootIsScheduled(root2);
    remainingLanes = root2.pendingLanes;
    0 !== (lanes & 4194090) && 0 !== (remainingLanes & 42) ? root2 === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root2) : nestedUpdateCount = 0;
    flushSyncWorkAcrossRoots_impl(0);
  }
}
function releaseRootPooledCache(root2, remainingLanes) {
  0 === (root2.pooledCacheLanes &= remainingLanes) && (remainingLanes = root2.pooledCache, null != remainingLanes && (root2.pooledCache = null, releaseCache(remainingLanes)));
}
function flushPendingEffects(wasDelayedCommit) {
  flushMutationEffects();
  flushLayoutEffects();
  flushSpawnedWork();
  return flushPassiveEffects();
}
function flushPassiveEffects() {
  if (5 !== pendingEffectsStatus) return false;
  var root2 = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
  pendingEffectsRemainingLanes = 0;
  var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
  try {
    ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
    ReactSharedInternals.T = null;
    renderPriority = pendingPassiveTransitions;
    pendingPassiveTransitions = null;
    var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
    pendingEffectsStatus = 0;
    pendingFinishedWork = pendingEffectsRoot = null;
    pendingEffectsLanes = 0;
    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
    var prevExecutionContext = executionContext;
    executionContext |= 4;
    commitPassiveUnmountOnFiber(root$jscomp$0.current);
    commitPassiveMountOnFiber(
      root$jscomp$0,
      root$jscomp$0.current,
      lanes,
      renderPriority
    );
    executionContext = prevExecutionContext;
    flushSyncWorkAcrossRoots_impl(0, false);
    if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot)
      try {
        injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
      } catch (err) {
      }
    return true;
  } finally {
    ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root2, remainingLanes);
  }
}
function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
  sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
  sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
  rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
  null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
}
function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
  if (3 === sourceFiber.tag)
    captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
  else
    for (; null !== nearestMountedAncestor; ) {
      if (3 === nearestMountedAncestor.tag) {
        captureCommitPhaseErrorOnRoot(
          nearestMountedAncestor,
          sourceFiber,
          error
        );
        break;
      } else if (1 === nearestMountedAncestor.tag) {
        var instance = nearestMountedAncestor.stateNode;
        if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
          sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
          error = createClassErrorUpdate(2);
          instance = enqueueUpdate(nearestMountedAncestor, error, 2);
          null !== instance && (initializeClassErrorUpdate(
            error,
            instance,
            nearestMountedAncestor,
            sourceFiber
          ), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
          break;
        }
      }
      nearestMountedAncestor = nearestMountedAncestor.return;
    }
}
function attachPingListener(root2, wakeable, lanes) {
  var pingCache = root2.pingCache;
  if (null === pingCache) {
    pingCache = root2.pingCache = new PossiblyWeakMap();
    var threadIDs = /* @__PURE__ */ new Set();
    pingCache.set(wakeable, threadIDs);
  } else
    threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
  threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root2 = pingSuspendedRoot.bind(null, root2, wakeable, lanes), wakeable.then(root2, root2));
}
function pingSuspendedRoot(root2, wakeable, pingedLanes) {
  var pingCache = root2.pingCache;
  null !== pingCache && pingCache.delete(wakeable);
  root2.pingedLanes |= root2.suspendedLanes & pingedLanes;
  root2.warmLanes &= ~pingedLanes;
  workInProgressRoot === root2 && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) && prepareFreshStack(root2, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
  ensureRootIsScheduled(root2);
}
function retryTimedOutBoundary(boundaryFiber, retryLane) {
  0 === retryLane && (retryLane = claimNextRetryLane());
  boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
  null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
}
function retryDehydratedSuspenseBoundary(boundaryFiber) {
  var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
  null !== suspenseState && (retryLane = suspenseState.retryLane);
  retryTimedOutBoundary(boundaryFiber, retryLane);
}
function resolveRetryWakeable(boundaryFiber, wakeable) {
  var retryLane = 0;
  switch (boundaryFiber.tag) {
    case 13:
      var retryCache = boundaryFiber.stateNode;
      var suspenseState = boundaryFiber.memoizedState;
      null !== suspenseState && (retryLane = suspenseState.retryLane);
      break;
    case 19:
      retryCache = boundaryFiber.stateNode;
      break;
    case 22:
      retryCache = boundaryFiber.stateNode._retryCache;
      break;
    default:
      throw Error(formatProdErrorMessage(314));
  }
  null !== retryCache && retryCache.delete(wakeable);
  retryTimedOutBoundary(boundaryFiber, retryLane);
}
function scheduleCallback$1(priorityLevel, callback) {
  return scheduleCallback$3(priorityLevel, callback);
}
var firstScheduledRoot = null, lastScheduledRoot = null, didScheduleMicrotask = false, mightHavePendingSyncWork = false, isFlushingWork = false, currentEventTransitionLane = 0;
function ensureRootIsScheduled(root2) {
  root2 !== lastScheduledRoot && null === root2.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root2 : lastScheduledRoot = lastScheduledRoot.next = root2);
  mightHavePendingSyncWork = true;
  didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
}
function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
  if (!isFlushingWork && mightHavePendingSyncWork) {
    isFlushingWork = true;
    do {
      var didPerformSomeWork = false;
      for (var root$174 = firstScheduledRoot; null !== root$174; ) {
        if (0 !== syncTransitionLanes) {
          var pendingLanes = root$174.pendingLanes;
          if (0 === pendingLanes) var JSCompiler_inline_result = 0;
          else {
            var suspendedLanes = root$174.suspendedLanes, pingedLanes = root$174.pingedLanes;
            JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
            JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
            JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
          }
          0 !== JSCompiler_inline_result && (didPerformSomeWork = true, performSyncWorkOnRoot(root$174, JSCompiler_inline_result));
        } else
          JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(
            root$174,
            root$174 === workInProgressRoot ? JSCompiler_inline_result : 0,
            null !== root$174.cancelPendingCommit || -1 !== root$174.timeoutHandle
          ), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$174, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$174, JSCompiler_inline_result));
        root$174 = root$174.next;
      }
    } while (didPerformSomeWork);
    isFlushingWork = false;
  }
}
function processRootScheduleInImmediateTask() {
  processRootScheduleInMicrotask();
}
function processRootScheduleInMicrotask() {
  mightHavePendingSyncWork = didScheduleMicrotask = false;
  var syncTransitionLanes = 0;
  0 !== currentEventTransitionLane && (shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane), currentEventTransitionLane = 0);
  for (var currentTime = now(), prev = null, root2 = firstScheduledRoot; null !== root2; ) {
    var next = root2.next, nextLanes = scheduleTaskForRootDuringMicrotask(root2, currentTime);
    if (0 === nextLanes)
      root2.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
    else if (prev = root2, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
      mightHavePendingSyncWork = true;
    root2 = next;
  }
  flushSyncWorkAcrossRoots_impl(syncTransitionLanes);
}
function scheduleTaskForRootDuringMicrotask(root2, currentTime) {
  for (var suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes, expirationTimes = root2.expirationTimes, lanes = root2.pendingLanes & -62914561; 0 < lanes; ) {
    var index$3 = 31 - clz32(lanes), lane = 1 << index$3, expirationTime = expirationTimes[index$3];
    if (-1 === expirationTime) {
      if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
        expirationTimes[index$3] = computeExpirationTime(lane, currentTime);
    } else expirationTime <= currentTime && (root2.expiredLanes |= lane);
    lanes &= ~lane;
  }
  currentTime = workInProgressRoot;
  suspendedLanes = workInProgressRootRenderLanes;
  suspendedLanes = getNextLanes(
    root2,
    root2 === currentTime ? suspendedLanes : 0,
    null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
  );
  pingedLanes = root2.callbackNode;
  if (0 === suspendedLanes || root2 === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
    return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root2.callbackNode = null, root2.callbackPriority = 0;
  if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root2, suspendedLanes)) {
    currentTime = suspendedLanes & -suspendedLanes;
    if (currentTime === root2.callbackPriority) return currentTime;
    null !== pingedLanes && cancelCallback$1(pingedLanes);
    switch (lanesToEventPriority(suspendedLanes)) {
      case 2:
      case 8:
        suspendedLanes = UserBlockingPriority;
        break;
      case 32:
        suspendedLanes = NormalPriority$1;
        break;
      case 268435456:
        suspendedLanes = IdlePriority;
        break;
      default:
        suspendedLanes = NormalPriority$1;
    }
    pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root2);
    suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
    root2.callbackPriority = currentTime;
    root2.callbackNode = suspendedLanes;
    return currentTime;
  }
  null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
  root2.callbackPriority = 2;
  root2.callbackNode = null;
  return 2;
}
function performWorkOnRootViaSchedulerTask(root2, didTimeout) {
  if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus)
    return root2.callbackNode = null, root2.callbackPriority = 0, null;
  var originalCallbackNode = root2.callbackNode;
  if (flushPendingEffects() && root2.callbackNode !== originalCallbackNode)
    return null;
  var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
  workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
    root2,
    root2 === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0,
    null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
  );
  if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
  performWorkOnRoot(root2, workInProgressRootRenderLanes$jscomp$0, didTimeout);
  scheduleTaskForRootDuringMicrotask(root2, now());
  return null != root2.callbackNode && root2.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root2) : null;
}
function performSyncWorkOnRoot(root2, lanes) {
  if (flushPendingEffects()) return null;
  performWorkOnRoot(root2, lanes, true);
}
function scheduleImmediateRootScheduleTask() {
  scheduleMicrotask(function() {
    0 !== (executionContext & 6) ? scheduleCallback$3(
      ImmediatePriority,
      processRootScheduleInImmediateTask
    ) : processRootScheduleInMicrotask();
  });
}
function requestTransitionLane() {
  0 === currentEventTransitionLane && (currentEventTransitionLane = claimNextTransitionLane());
  return currentEventTransitionLane;
}
function coerceFormActionProp(actionProp) {
  return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL("" + actionProp);
}
function createFormDataWithSubmitter(form, submitter) {
  var temp = submitter.ownerDocument.createElement("input");
  temp.name = submitter.name;
  temp.value = submitter.value;
  form.id && temp.setAttribute("form", form.id);
  submitter.parentNode.insertBefore(temp, submitter);
  form = new FormData(form);
  temp.parentNode.removeChild(temp);
  return form;
}
function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
  if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
    var action = coerceFormActionProp(
      (nativeEventTarget[internalPropsKey] || null).action
    ), submitter = nativeEvent.submitter;
    submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
    var event = new SyntheticEvent(
      "action",
      "action",
      null,
      nativeEvent,
      nativeEventTarget
    );
    dispatchQueue.push({
      event,
      listeners: [
        {
          instance: null,
          listener: function() {
            if (nativeEvent.defaultPrevented) {
              if (0 !== currentEventTransitionLane) {
                var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
                startHostTransition(
                  maybeTargetInst,
                  {
                    pending: true,
                    data: formData,
                    method: nativeEventTarget.method,
                    action
                  },
                  null,
                  formData
                );
              }
            } else
              "function" === typeof action && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(
                maybeTargetInst,
                {
                  pending: true,
                  data: formData,
                  method: nativeEventTarget.method,
                  action
                },
                action,
                formData
              ));
          },
          currentTarget: nativeEventTarget
        }
      ]
    });
  }
}
for (var i$jscomp$inline_1528 = 0; i$jscomp$inline_1528 < simpleEventPluginEvents.length; i$jscomp$inline_1528++) {
  var eventName$jscomp$inline_1529 = simpleEventPluginEvents[i$jscomp$inline_1528], domEventName$jscomp$inline_1530 = eventName$jscomp$inline_1529.toLowerCase(), capitalizedEvent$jscomp$inline_1531 = eventName$jscomp$inline_1529[0].toUpperCase() + eventName$jscomp$inline_1529.slice(1);
  registerSimpleEvent(
    domEventName$jscomp$inline_1530,
    "on" + capitalizedEvent$jscomp$inline_1531
  );
}
registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
registerSimpleEvent(ANIMATION_START, "onAnimationStart");
registerSimpleEvent("dblclick", "onDoubleClick");
registerSimpleEvent("focusin", "onFocus");
registerSimpleEvent("focusout", "onBlur");
registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
registerSimpleEvent(TRANSITION_START, "onTransitionStart");
registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
registerTwoPhaseEvent(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(" ")
);
registerTwoPhaseEvent(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " "
  )
);
registerTwoPhaseEvent("onBeforeInput", [
  "compositionend",
  "keypress",
  "textInput",
  "paste"
]);
registerTwoPhaseEvent(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" ")
);
registerTwoPhaseEvent(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" ")
);
registerTwoPhaseEvent(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
);
var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
  " "
), nonDelegatedEvents = new Set(
  "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes)
);
function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  eventSystemFlags = 0 !== (eventSystemFlags & 4);
  for (var i = 0; i < dispatchQueue.length; i++) {
    var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
    _dispatchQueue$i = _dispatchQueue$i.listeners;
    a: {
      var previousInstance = void 0;
      if (eventSystemFlags)
        for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
          var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
          _dispatchListeners$i = _dispatchListeners$i.listener;
          if (instance !== previousInstance && event.isPropagationStopped())
            break a;
          previousInstance = _dispatchListeners$i;
          event.currentTarget = currentTarget;
          try {
            previousInstance(event);
          } catch (error) {
            reportGlobalError(error);
          }
          event.currentTarget = null;
          previousInstance = instance;
        }
      else
        for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
          _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
          instance = _dispatchListeners$i.instance;
          currentTarget = _dispatchListeners$i.currentTarget;
          _dispatchListeners$i = _dispatchListeners$i.listener;
          if (instance !== previousInstance && event.isPropagationStopped())
            break a;
          previousInstance = _dispatchListeners$i;
          event.currentTarget = currentTarget;
          try {
            previousInstance(event);
          } catch (error) {
            reportGlobalError(error);
          }
          event.currentTarget = null;
          previousInstance = instance;
        }
    }
  }
}
function listenToNonDelegatedEvent(domEventName, targetElement) {
  var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
  void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
  var listenerSetKey = domEventName + "__bubble";
  JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
}
function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
  var eventSystemFlags = 0;
  isCapturePhaseListener && (eventSystemFlags |= 4);
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener
  );
}
var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
function listenToAllSupportedEvents(rootContainerElement) {
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true;
    allNativeEvents.forEach(function(domEventName) {
      "selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
    });
    var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
    null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
  }
}
function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
  switch (getEventPriority(domEventName)) {
    case 2:
      var listenerWrapper = dispatchDiscreteEvent;
      break;
    case 8:
      listenerWrapper = dispatchContinuousEvent;
      break;
    default:
      listenerWrapper = dispatchEvent;
  }
  eventSystemFlags = listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer
  );
  listenerWrapper = void 0;
  !passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = true);
  isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
    capture: true,
    passive: listenerWrapper
  }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
    passive: listenerWrapper
  }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
}
function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
  var ancestorInst = targetInst$jscomp$0;
  if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0)
    a: for (; ; ) {
      if (null === targetInst$jscomp$0) return;
      var nodeTag = targetInst$jscomp$0.tag;
      if (3 === nodeTag || 4 === nodeTag) {
        var container = targetInst$jscomp$0.stateNode.containerInfo;
        if (container === targetContainer) break;
        if (4 === nodeTag)
          for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag; ) {
            var grandTag = nodeTag.tag;
            if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer)
              return;
            nodeTag = nodeTag.return;
          }
        for (; null !== container; ) {
          nodeTag = getClosestInstanceFromNode(container);
          if (null === nodeTag) return;
          grandTag = nodeTag.tag;
          if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
            targetInst$jscomp$0 = ancestorInst = nodeTag;
            continue a;
          }
          container = container.parentNode;
        }
      }
      targetInst$jscomp$0 = targetInst$jscomp$0.return;
    }
  batchedUpdates$1(function() {
    var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
    a: {
      var reactName = topLevelEventsToReactNames.get(domEventName);
      if (void 0 !== reactName) {
        var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
        switch (domEventName) {
          case "keypress":
            if (0 === getEventCharCode(nativeEvent)) break a;
          case "keydown":
          case "keyup":
            SyntheticEventCtor = SyntheticKeyboardEvent;
            break;
          case "focusin":
            reactEventType = "focus";
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "focusout":
            reactEventType = "blur";
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "beforeblur":
          case "afterblur":
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "click":
            if (2 === nativeEvent.button) break a;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            SyntheticEventCtor = SyntheticMouseEvent;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            SyntheticEventCtor = SyntheticDragEvent;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            SyntheticEventCtor = SyntheticTouchEvent;
            break;
          case ANIMATION_END:
          case ANIMATION_ITERATION:
          case ANIMATION_START:
            SyntheticEventCtor = SyntheticAnimationEvent;
            break;
          case TRANSITION_END:
            SyntheticEventCtor = SyntheticTransitionEvent;
            break;
          case "scroll":
          case "scrollend":
            SyntheticEventCtor = SyntheticUIEvent;
            break;
          case "wheel":
            SyntheticEventCtor = SyntheticWheelEvent;
            break;
          case "copy":
          case "cut":
          case "paste":
            SyntheticEventCtor = SyntheticClipboardEvent;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            SyntheticEventCtor = SyntheticPointerEvent;
            break;
          case "toggle":
          case "beforetoggle":
            SyntheticEventCtor = SyntheticToggleEvent;
        }
        var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
        inCapturePhase = [];
        for (var instance = targetInst, lastHostComponent; null !== instance; ) {
          var _instance = instance;
          lastHostComponent = _instance.stateNode;
          _instance = _instance.tag;
          5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(
            createDispatchListener(instance, _instance, lastHostComponent)
          ));
          if (accumulateTargetOnly) break;
          instance = instance.return;
        }
        0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(
          reactName,
          reactEventType,
          null,
          nativeEvent,
          nativeEventTarget
        ), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
      }
    }
    if (0 === (eventSystemFlags & 7)) {
      a: {
        reactName = "mouseover" === domEventName || "pointerover" === domEventName;
        SyntheticEventCtor = "mouseout" === domEventName || "pointerout" === domEventName;
        if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
          break a;
        if (SyntheticEventCtor || reactName) {
          reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
          if (SyntheticEventCtor) {
            if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, null !== reactEventType && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase))
              reactEventType = null;
          } else SyntheticEventCtor = null, reactEventType = targetInst;
          if (SyntheticEventCtor !== reactEventType) {
            inCapturePhase = SyntheticMouseEvent;
            _instance = "onMouseLeave";
            reactEventName = "onMouseEnter";
            instance = "mouse";
            if ("pointerout" === domEventName || "pointerover" === domEventName)
              inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
            accumulateTargetOnly = null == SyntheticEventCtor ? reactName : getNodeFromInstance(SyntheticEventCtor);
            lastHostComponent = null == reactEventType ? reactName : getNodeFromInstance(reactEventType);
            reactName = new inCapturePhase(
              _instance,
              instance + "leave",
              SyntheticEventCtor,
              nativeEvent,
              nativeEventTarget
            );
            reactName.target = accumulateTargetOnly;
            reactName.relatedTarget = lastHostComponent;
            _instance = null;
            getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(
              reactEventName,
              instance + "enter",
              reactEventType,
              nativeEvent,
              nativeEventTarget
            ), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
            accumulateTargetOnly = _instance;
            if (SyntheticEventCtor && reactEventType)
              b: {
                inCapturePhase = SyntheticEventCtor;
                reactEventName = reactEventType;
                instance = 0;
                for (lastHostComponent = inCapturePhase; lastHostComponent; lastHostComponent = getParent(lastHostComponent))
                  instance++;
                lastHostComponent = 0;
                for (_instance = reactEventName; _instance; _instance = getParent(_instance))
                  lastHostComponent++;
                for (; 0 < instance - lastHostComponent; )
                  inCapturePhase = getParent(inCapturePhase), instance--;
                for (; 0 < lastHostComponent - instance; )
                  reactEventName = getParent(reactEventName), lastHostComponent--;
                for (; instance--; ) {
                  if (inCapturePhase === reactEventName || null !== reactEventName && inCapturePhase === reactEventName.alternate)
                    break b;
                  inCapturePhase = getParent(inCapturePhase);
                  reactEventName = getParent(reactEventName);
                }
                inCapturePhase = null;
              }
            else inCapturePhase = null;
            null !== SyntheticEventCtor && accumulateEnterLeaveListenersForEvent(
              dispatchQueue,
              reactName,
              SyntheticEventCtor,
              inCapturePhase,
              false
            );
            null !== reactEventType && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(
              dispatchQueue,
              accumulateTargetOnly,
              reactEventType,
              inCapturePhase,
              true
            );
          }
        }
      }
      a: {
        reactName = targetInst ? getNodeFromInstance(targetInst) : window;
        SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
        if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type)
          var getTargetInstFunc = getTargetInstForChangeEvent;
        else if (isTextInputElement(reactName))
          if (isInputEventSupported)
            getTargetInstFunc = getTargetInstForInputOrChangeEvent;
          else {
            getTargetInstFunc = getTargetInstForInputEventPolyfill;
            var handleEventFunc = handleEventsForInputEventPolyfill;
          }
        else
          SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
        if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
          createAndAccumulateChangeEvent(
            dispatchQueue,
            getTargetInstFunc,
            nativeEvent,
            nativeEventTarget
          );
          break a;
        }
        handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
        "focusout" === domEventName && targetInst && "number" === reactName.type && null != targetInst.memoizedProps.value && setDefaultValue(reactName, "number", reactName.value);
      }
      handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
      switch (domEventName) {
        case "focusin":
          if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable)
            activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
          break;
        case "focusout":
          lastSelection = activeElementInst = activeElement = null;
          break;
        case "mousedown":
          mouseDown = true;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          mouseDown = false;
          constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
          break;
        case "selectionchange":
          if (skipSelectionChangeEvent) break;
        case "keydown":
        case "keyup":
          constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
      }
      var fallbackData;
      if (canUseCompositionEvent)
        b: {
          switch (domEventName) {
            case "compositionstart":
              var eventType = "onCompositionStart";
              break b;
            case "compositionend":
              eventType = "onCompositionEnd";
              break b;
            case "compositionupdate":
              eventType = "onCompositionUpdate";
              break b;
          }
          eventType = void 0;
        }
      else
        isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
      eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(
        eventType,
        domEventName,
        null,
        nativeEvent,
        nativeEventTarget
      ), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
      if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
        eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent(
          "onBeforeInput",
          "beforeinput",
          null,
          nativeEvent,
          nativeEventTarget
        ), dispatchQueue.push({
          event: handleEventFunc,
          listeners: eventType
        }), handleEventFunc.data = fallbackData);
      extractEvents$1(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget
      );
    }
    processDispatchQueue(dispatchQueue, eventSystemFlags);
  });
}
function createDispatchListener(instance, listener, currentTarget) {
  return {
    instance,
    listener,
    currentTarget
  };
}
function accumulateTwoPhaseListeners(targetFiber, reactName) {
  for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber; ) {
    var _instance2 = targetFiber, stateNode = _instance2.stateNode;
    _instance2 = _instance2.tag;
    5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(
      createDispatchListener(targetFiber, _instance2, stateNode)
    ), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(
      createDispatchListener(targetFiber, _instance2, stateNode)
    ));
    if (3 === targetFiber.tag) return listeners;
    targetFiber = targetFiber.return;
  }
  return [];
}
function getParent(inst) {
  if (null === inst) return null;
  do
    inst = inst.return;
  while (inst && 5 !== inst.tag && 27 !== inst.tag);
  return inst ? inst : null;
}
function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
  for (var registrationName = event._reactName, listeners = []; null !== target && target !== common; ) {
    var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
    _instance3 = _instance3.tag;
    if (null !== alternate && alternate === common) break;
    5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(
      createDispatchListener(target, stateNode, alternate)
    )) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(
      createDispatchListener(target, stateNode, alternate)
    )));
    target = target.return;
  }
  0 !== listeners.length && dispatchQueue.push({ event, listeners });
}
var NORMALIZE_NEWLINES_REGEX = /\r\n?/g, NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
function normalizeMarkupForTextOrAttribute(markup) {
  return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
}
function checkForUnmatchedText(serverText, clientText) {
  clientText = normalizeMarkupForTextOrAttribute(clientText);
  return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
}
function noop$1() {
}
function setProp(domElement, tag, key, value, props, prevValue) {
  switch (key) {
    case "children":
      "string" === typeof value ? "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && "body" !== tag && setTextContent(domElement, "" + value);
      break;
    case "className":
      setValueForKnownAttribute(domElement, "class", value);
      break;
    case "tabIndex":
      setValueForKnownAttribute(domElement, "tabindex", value);
      break;
    case "dir":
    case "role":
    case "viewBox":
    case "width":
    case "height":
      setValueForKnownAttribute(domElement, key, value);
      break;
    case "style":
      setValueForStyles(domElement, value, prevValue);
      break;
    case "data":
      if ("object" !== tag) {
        setValueForKnownAttribute(domElement, "data", value);
        break;
      }
    case "src":
    case "href":
      if ("" === value && ("a" !== tag || "href" !== key)) {
        domElement.removeAttribute(key);
        break;
      }
      if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
        domElement.removeAttribute(key);
        break;
      }
      value = sanitizeURL("" + value);
      domElement.setAttribute(key, value);
      break;
    case "action":
    case "formAction":
      if ("function" === typeof value) {
        domElement.setAttribute(
          key,
          "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
        );
        break;
      } else
        "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(
          domElement,
          tag,
          "formEncType",
          props.formEncType,
          props,
          null
        ), setProp(
          domElement,
          tag,
          "formMethod",
          props.formMethod,
          props,
          null
        ), setProp(
          domElement,
          tag,
          "formTarget",
          props.formTarget,
          props,
          null
        )) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
      if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
        domElement.removeAttribute(key);
        break;
      }
      value = sanitizeURL("" + value);
      domElement.setAttribute(key, value);
      break;
    case "onClick":
      null != value && (domElement.onclick = noop$1);
      break;
    case "onScroll":
      null != value && listenToNonDelegatedEvent("scroll", domElement);
      break;
    case "onScrollEnd":
      null != value && listenToNonDelegatedEvent("scrollend", domElement);
      break;
    case "dangerouslySetInnerHTML":
      if (null != value) {
        if ("object" !== typeof value || !("__html" in value))
          throw Error(formatProdErrorMessage(61));
        key = value.__html;
        if (null != key) {
          if (null != props.children) throw Error(formatProdErrorMessage(60));
          domElement.innerHTML = key;
        }
      }
      break;
    case "multiple":
      domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
      break;
    case "muted":
      domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "defaultValue":
    case "defaultChecked":
    case "innerHTML":
    case "ref":
      break;
    case "autoFocus":
      break;
    case "xlinkHref":
      if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
        domElement.removeAttribute("xlink:href");
        break;
      }
      key = sanitizeURL("" + value);
      domElement.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        key
      );
      break;
    case "contentEditable":
    case "spellCheck":
    case "draggable":
    case "value":
    case "autoReverse":
    case "externalResourcesRequired":
    case "focusable":
    case "preserveAlpha":
      null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
      break;
    case "inert":
    case "allowFullScreen":
    case "async":
    case "autoPlay":
    case "controls":
    case "default":
    case "defer":
    case "disabled":
    case "disablePictureInPicture":
    case "disableRemotePlayback":
    case "formNoValidate":
    case "hidden":
    case "loop":
    case "noModule":
    case "noValidate":
    case "open":
    case "playsInline":
    case "readOnly":
    case "required":
    case "reversed":
    case "scoped":
    case "seamless":
    case "itemScope":
      value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
      break;
    case "capture":
    case "download":
      true === value ? domElement.setAttribute(key, "") : false !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
      break;
    case "cols":
    case "rows":
    case "size":
    case "span":
      null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
      break;
    case "rowSpan":
    case "start":
      null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
      break;
    case "popover":
      listenToNonDelegatedEvent("beforetoggle", domElement);
      listenToNonDelegatedEvent("toggle", domElement);
      setValueForAttribute(domElement, "popover", value);
      break;
    case "xlinkActuate":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:actuate",
        value
      );
      break;
    case "xlinkArcrole":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:arcrole",
        value
      );
      break;
    case "xlinkRole":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:role",
        value
      );
      break;
    case "xlinkShow":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:show",
        value
      );
      break;
    case "xlinkTitle":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:title",
        value
      );
      break;
    case "xlinkType":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:type",
        value
      );
      break;
    case "xmlBase":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/XML/1998/namespace",
        "xml:base",
        value
      );
      break;
    case "xmlLang":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/XML/1998/namespace",
        "xml:lang",
        value
      );
      break;
    case "xmlSpace":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/XML/1998/namespace",
        "xml:space",
        value
      );
      break;
    case "is":
      setValueForAttribute(domElement, "is", value);
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1])
        key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
  }
}
function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
  switch (key) {
    case "style":
      setValueForStyles(domElement, value, prevValue);
      break;
    case "dangerouslySetInnerHTML":
      if (null != value) {
        if ("object" !== typeof value || !("__html" in value))
          throw Error(formatProdErrorMessage(61));
        key = value.__html;
        if (null != key) {
          if (null != props.children) throw Error(formatProdErrorMessage(60));
          domElement.innerHTML = key;
        }
      }
      break;
    case "children":
      "string" === typeof value ? setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && setTextContent(domElement, "" + value);
      break;
    case "onScroll":
      null != value && listenToNonDelegatedEvent("scroll", domElement);
      break;
    case "onScrollEnd":
      null != value && listenToNonDelegatedEvent("scrollend", domElement);
      break;
    case "onClick":
      null != value && (domElement.onclick = noop$1);
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "innerHTML":
    case "ref":
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      if (!registrationNameDependencies.hasOwnProperty(key))
        a: {
          if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : void 0), prevValue = domElement[internalPropsKey] || null, prevValue = null != prevValue ? prevValue[key] : null, "function" === typeof prevValue && domElement.removeEventListener(tag, prevValue, props), "function" === typeof value)) {
            "function" !== typeof prevValue && null !== prevValue && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
            domElement.addEventListener(tag, value, props);
            break a;
          }
          key in domElement ? domElement[key] = value : true === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
        }
  }
}
function setInitialProperties(domElement, tag, props) {
  switch (tag) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "img":
      listenToNonDelegatedEvent("error", domElement);
      listenToNonDelegatedEvent("load", domElement);
      var hasSrc = false, hasSrcSet = false, propKey;
      for (propKey in props)
        if (props.hasOwnProperty(propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "src":
                hasSrc = true;
                break;
              case "srcSet":
                hasSrcSet = true;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(137, tag));
              default:
                setProp(domElement, tag, propKey, propValue, props, null);
            }
        }
      hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
      hasSrc && setProp(domElement, tag, "src", props.src, props, null);
      return;
    case "input":
      listenToNonDelegatedEvent("invalid", domElement);
      var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
      for (hasSrc in props)
        if (props.hasOwnProperty(hasSrc)) {
          var propValue$188 = props[hasSrc];
          if (null != propValue$188)
            switch (hasSrc) {
              case "name":
                hasSrcSet = propValue$188;
                break;
              case "type":
                propValue = propValue$188;
                break;
              case "checked":
                checked = propValue$188;
                break;
              case "defaultChecked":
                defaultChecked = propValue$188;
                break;
              case "value":
                propKey = propValue$188;
                break;
              case "defaultValue":
                defaultValue = propValue$188;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (null != propValue$188)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                setProp(domElement, tag, hasSrc, propValue$188, props, null);
            }
        }
      initInput(
        domElement,
        propKey,
        defaultValue,
        checked,
        defaultChecked,
        propValue,
        hasSrcSet,
        false
      );
      track(domElement);
      return;
    case "select":
      listenToNonDelegatedEvent("invalid", domElement);
      hasSrc = propValue = propKey = null;
      for (hasSrcSet in props)
        if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue))
          switch (hasSrcSet) {
            case "value":
              propKey = defaultValue;
              break;
            case "defaultValue":
              propValue = defaultValue;
              break;
            case "multiple":
              hasSrc = defaultValue;
            default:
              setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
          }
      tag = propKey;
      props = propValue;
      domElement.multiple = !!hasSrc;
      null != tag ? updateOptions(domElement, !!hasSrc, tag, false) : null != props && updateOptions(domElement, !!hasSrc, props, true);
      return;
    case "textarea":
      listenToNonDelegatedEvent("invalid", domElement);
      propKey = hasSrcSet = hasSrc = null;
      for (propValue in props)
        if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue))
          switch (propValue) {
            case "value":
              hasSrc = defaultValue;
              break;
            case "defaultValue":
              hasSrcSet = defaultValue;
              break;
            case "children":
              propKey = defaultValue;
              break;
            case "dangerouslySetInnerHTML":
              if (null != defaultValue) throw Error(formatProdErrorMessage(91));
              break;
            default:
              setProp(domElement, tag, propValue, defaultValue, props, null);
          }
      initTextarea(domElement, hasSrc, hasSrcSet, propKey);
      track(domElement);
      return;
    case "option":
      for (checked in props)
        if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc))
          switch (checked) {
            case "selected":
              domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
              break;
            default:
              setProp(domElement, tag, checked, hasSrc, props, null);
          }
      return;
    case "dialog":
      listenToNonDelegatedEvent("beforetoggle", domElement);
      listenToNonDelegatedEvent("toggle", domElement);
      listenToNonDelegatedEvent("cancel", domElement);
      listenToNonDelegatedEvent("close", domElement);
      break;
    case "iframe":
    case "object":
      listenToNonDelegatedEvent("load", domElement);
      break;
    case "video":
    case "audio":
      for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++)
        listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
      break;
    case "image":
      listenToNonDelegatedEvent("error", domElement);
      listenToNonDelegatedEvent("load", domElement);
      break;
    case "details":
      listenToNonDelegatedEvent("toggle", domElement);
      break;
    case "embed":
    case "source":
    case "link":
      listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
    case "area":
    case "base":
    case "br":
    case "col":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "track":
    case "wbr":
    case "menuitem":
      for (defaultChecked in props)
        if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc))
          switch (defaultChecked) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(formatProdErrorMessage(137, tag));
            default:
              setProp(domElement, tag, defaultChecked, hasSrc, props, null);
          }
      return;
    default:
      if (isCustomElement(tag)) {
        for (propValue$188 in props)
          props.hasOwnProperty(propValue$188) && (hasSrc = props[propValue$188], void 0 !== hasSrc && setPropOnCustomElement(
            domElement,
            tag,
            propValue$188,
            hasSrc,
            props,
            void 0
          ));
        return;
      }
  }
  for (defaultValue in props)
    props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
}
function updateProperties(domElement, tag, lastProps, nextProps) {
  switch (tag) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "input":
      var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
      for (propKey in lastProps) {
        var lastProp = lastProps[propKey];
        if (lastProps.hasOwnProperty(propKey) && null != lastProp)
          switch (propKey) {
            case "checked":
              break;
            case "value":
              break;
            case "defaultValue":
              lastDefaultValue = lastProp;
            default:
              nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
          }
      }
      for (var propKey$205 in nextProps) {
        var propKey = nextProps[propKey$205];
        lastProp = lastProps[propKey$205];
        if (nextProps.hasOwnProperty(propKey$205) && (null != propKey || null != lastProp))
          switch (propKey$205) {
            case "type":
              type = propKey;
              break;
            case "name":
              name = propKey;
              break;
            case "checked":
              checked = propKey;
              break;
            case "defaultChecked":
              defaultChecked = propKey;
              break;
            case "value":
              value = propKey;
              break;
            case "defaultValue":
              defaultValue = propKey;
              break;
            case "children":
            case "dangerouslySetInnerHTML":
              if (null != propKey)
                throw Error(formatProdErrorMessage(137, tag));
              break;
            default:
              propKey !== lastProp && setProp(
                domElement,
                tag,
                propKey$205,
                propKey,
                nextProps,
                lastProp
              );
          }
      }
      updateInput(
        domElement,
        value,
        defaultValue,
        lastDefaultValue,
        checked,
        defaultChecked,
        type,
        name
      );
      return;
    case "select":
      propKey = value = defaultValue = propKey$205 = null;
      for (type in lastProps)
        if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue)
          switch (type) {
            case "value":
              break;
            case "multiple":
              propKey = lastDefaultValue;
            default:
              nextProps.hasOwnProperty(type) || setProp(
                domElement,
                tag,
                type,
                null,
                nextProps,
                lastDefaultValue
              );
          }
      for (name in nextProps)
        if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue))
          switch (name) {
            case "value":
              propKey$205 = type;
              break;
            case "defaultValue":
              defaultValue = type;
              break;
            case "multiple":
              value = type;
            default:
              type !== lastDefaultValue && setProp(
                domElement,
                tag,
                name,
                type,
                nextProps,
                lastDefaultValue
              );
          }
      tag = defaultValue;
      lastProps = value;
      nextProps = propKey;
      null != propKey$205 ? updateOptions(domElement, !!lastProps, propKey$205, false) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
      return;
    case "textarea":
      propKey = propKey$205 = null;
      for (defaultValue in lastProps)
        if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue))
          switch (defaultValue) {
            case "value":
              break;
            case "children":
              break;
            default:
              setProp(domElement, tag, defaultValue, null, nextProps, name);
          }
      for (value in nextProps)
        if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type))
          switch (value) {
            case "value":
              propKey$205 = name;
              break;
            case "defaultValue":
              propKey = name;
              break;
            case "children":
              break;
            case "dangerouslySetInnerHTML":
              if (null != name) throw Error(formatProdErrorMessage(91));
              break;
            default:
              name !== type && setProp(domElement, tag, value, name, nextProps, type);
          }
      updateTextarea(domElement, propKey$205, propKey);
      return;
    case "option":
      for (var propKey$221 in lastProps)
        if (propKey$205 = lastProps[propKey$221], lastProps.hasOwnProperty(propKey$221) && null != propKey$205 && !nextProps.hasOwnProperty(propKey$221))
          switch (propKey$221) {
            case "selected":
              domElement.selected = false;
              break;
            default:
              setProp(
                domElement,
                tag,
                propKey$221,
                null,
                nextProps,
                propKey$205
              );
          }
      for (lastDefaultValue in nextProps)
        if (propKey$205 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$205 !== propKey && (null != propKey$205 || null != propKey))
          switch (lastDefaultValue) {
            case "selected":
              domElement.selected = propKey$205 && "function" !== typeof propKey$205 && "symbol" !== typeof propKey$205;
              break;
            default:
              setProp(
                domElement,
                tag,
                lastDefaultValue,
                propKey$205,
                nextProps,
                propKey
              );
          }
      return;
    case "img":
    case "link":
    case "area":
    case "base":
    case "br":
    case "col":
    case "embed":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "source":
    case "track":
    case "wbr":
    case "menuitem":
      for (var propKey$226 in lastProps)
        propKey$205 = lastProps[propKey$226], lastProps.hasOwnProperty(propKey$226) && null != propKey$205 && !nextProps.hasOwnProperty(propKey$226) && setProp(domElement, tag, propKey$226, null, nextProps, propKey$205);
      for (checked in nextProps)
        if (propKey$205 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$205 !== propKey && (null != propKey$205 || null != propKey))
          switch (checked) {
            case "children":
            case "dangerouslySetInnerHTML":
              if (null != propKey$205)
                throw Error(formatProdErrorMessage(137, tag));
              break;
            default:
              setProp(
                domElement,
                tag,
                checked,
                propKey$205,
                nextProps,
                propKey
              );
          }
      return;
    default:
      if (isCustomElement(tag)) {
        for (var propKey$231 in lastProps)
          propKey$205 = lastProps[propKey$231], lastProps.hasOwnProperty(propKey$231) && void 0 !== propKey$205 && !nextProps.hasOwnProperty(propKey$231) && setPropOnCustomElement(
            domElement,
            tag,
            propKey$231,
            void 0,
            nextProps,
            propKey$205
          );
        for (defaultChecked in nextProps)
          propKey$205 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$205 === propKey || void 0 === propKey$205 && void 0 === propKey || setPropOnCustomElement(
            domElement,
            tag,
            defaultChecked,
            propKey$205,
            nextProps,
            propKey
          );
        return;
      }
  }
  for (var propKey$236 in lastProps)
    propKey$205 = lastProps[propKey$236], lastProps.hasOwnProperty(propKey$236) && null != propKey$205 && !nextProps.hasOwnProperty(propKey$236) && setProp(domElement, tag, propKey$236, null, nextProps, propKey$205);
  for (lastProp in nextProps)
    propKey$205 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$205 === propKey || null == propKey$205 && null == propKey || setProp(domElement, tag, lastProp, propKey$205, nextProps, propKey);
}
var eventsEnabled = null, selectionInformation = null;
function getOwnerDocumentFromRootContainer(rootContainerElement) {
  return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
}
function getOwnHostContext(namespaceURI) {
  switch (namespaceURI) {
    case "http://www.w3.org/2000/svg":
      return 1;
    case "http://www.w3.org/1998/Math/MathML":
      return 2;
    default:
      return 0;
  }
}
function getChildHostContextProd(parentNamespace, type) {
  if (0 === parentNamespace)
    switch (type) {
      case "svg":
        return 1;
      case "math":
        return 2;
      default:
        return 0;
    }
  return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
}
function shouldSetTextContent(type, props) {
  return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
}
var currentPopstateTransitionEvent = null;
function shouldAttemptEagerTransition() {
  var event = window.event;
  if (event && "popstate" === event.type) {
    if (event === currentPopstateTransitionEvent) return false;
    currentPopstateTransitionEvent = event;
    return true;
  }
  currentPopstateTransitionEvent = null;
  return false;
}
var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0, cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0, localPromise = "function" === typeof Promise ? Promise : void 0, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
  return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
} : scheduleTimeout;
function handleErrorInNextTick(error) {
  setTimeout(function() {
    throw error;
  });
}
function isSingletonScope(type) {
  return "head" === type;
}
function clearSuspenseBoundary(parentInstance, suspenseInstance) {
  var node = suspenseInstance, possiblePreambleContribution = 0, depth = 0;
  do {
    var nextNode = node.nextSibling;
    parentInstance.removeChild(node);
    if (nextNode && 8 === nextNode.nodeType)
      if (node = nextNode.data, "/$" === node) {
        if (0 < possiblePreambleContribution && 8 > possiblePreambleContribution) {
          node = possiblePreambleContribution;
          var ownerDocument = parentInstance.ownerDocument;
          node & 1 && releaseSingletonInstance(ownerDocument.documentElement);
          node & 2 && releaseSingletonInstance(ownerDocument.body);
          if (node & 4)
            for (node = ownerDocument.head, releaseSingletonInstance(node), ownerDocument = node.firstChild; ownerDocument; ) {
              var nextNode$jscomp$0 = ownerDocument.nextSibling, nodeName = ownerDocument.nodeName;
              ownerDocument[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === ownerDocument.rel.toLowerCase() || node.removeChild(ownerDocument);
              ownerDocument = nextNode$jscomp$0;
            }
        }
        if (0 === depth) {
          parentInstance.removeChild(nextNode);
          retryIfBlockedOn(suspenseInstance);
          return;
        }
        depth--;
      } else
        "$" === node || "$?" === node || "$!" === node ? depth++ : possiblePreambleContribution = node.charCodeAt(0) - 48;
    else possiblePreambleContribution = 0;
    node = nextNode;
  } while (node);
  retryIfBlockedOn(suspenseInstance);
}
function clearContainerSparingly(container) {
  var nextNode = container.firstChild;
  nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
  for (; nextNode; ) {
    var node = nextNode;
    nextNode = nextNode.nextSibling;
    switch (node.nodeName) {
      case "HTML":
      case "HEAD":
      case "BODY":
        clearContainerSparingly(node);
        detachDeletedInstance(node);
        continue;
      case "SCRIPT":
      case "STYLE":
        continue;
      case "LINK":
        if ("stylesheet" === node.rel.toLowerCase()) continue;
    }
    container.removeChild(node);
  }
}
function canHydrateInstance(instance, type, props, inRootOrSingleton) {
  for (; 1 === instance.nodeType; ) {
    var anyProps = props;
    if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
      if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type))
        break;
    } else if (!inRootOrSingleton)
      if ("input" === type && "hidden" === instance.type) {
        var name = null == anyProps.name ? null : "" + anyProps.name;
        if ("hidden" === anyProps.type && instance.getAttribute("name") === name)
          return instance;
      } else return instance;
    else if (!instance[internalHoistableMarker])
      switch (type) {
        case "meta":
          if (!instance.hasAttribute("itemprop")) break;
          return instance;
        case "link":
          name = instance.getAttribute("rel");
          if ("stylesheet" === name && instance.hasAttribute("data-precedence"))
            break;
          else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title))
            break;
          return instance;
        case "style":
          if (instance.hasAttribute("data-precedence")) break;
          return instance;
        case "script":
          name = instance.getAttribute("src");
          if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
            break;
          return instance;
        default:
          return instance;
      }
    instance = getNextHydratable(instance.nextSibling);
    if (null === instance) break;
  }
  return null;
}
function canHydrateTextInstance(instance, text2, inRootOrSingleton) {
  if ("" === text2) return null;
  for (; 3 !== instance.nodeType; ) {
    if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
      return null;
    instance = getNextHydratable(instance.nextSibling);
    if (null === instance) return null;
  }
  return instance;
}
function isSuspenseInstanceFallback(instance) {
  return "$!" === instance.data || "$?" === instance.data && "complete" === instance.ownerDocument.readyState;
}
function registerSuspenseInstanceRetry(instance, callback) {
  var ownerDocument = instance.ownerDocument;
  if ("$?" !== instance.data || "complete" === ownerDocument.readyState)
    callback();
  else {
    var listener = function() {
      callback();
      ownerDocument.removeEventListener("DOMContentLoaded", listener);
    };
    ownerDocument.addEventListener("DOMContentLoaded", listener);
    instance._reactRetry = listener;
  }
}
function getNextHydratable(node) {
  for (; null != node; node = node.nextSibling) {
    var nodeType = node.nodeType;
    if (1 === nodeType || 3 === nodeType) break;
    if (8 === nodeType) {
      nodeType = node.data;
      if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "F!" === nodeType || "F" === nodeType)
        break;
      if ("/$" === nodeType) return null;
    }
  }
  return node;
}
var previousHydratableOnEnteringScopedSingleton = null;
function getParentSuspenseInstance(targetInstance) {
  targetInstance = targetInstance.previousSibling;
  for (var depth = 0; targetInstance; ) {
    if (8 === targetInstance.nodeType) {
      var data = targetInstance.data;
      if ("$" === data || "$!" === data || "$?" === data) {
        if (0 === depth) return targetInstance;
        depth--;
      } else "/$" === data && depth++;
    }
    targetInstance = targetInstance.previousSibling;
  }
  return null;
}
function resolveSingletonInstance(type, props, rootContainerInstance) {
  props = getOwnerDocumentFromRootContainer(rootContainerInstance);
  switch (type) {
    case "html":
      type = props.documentElement;
      if (!type) throw Error(formatProdErrorMessage(452));
      return type;
    case "head":
      type = props.head;
      if (!type) throw Error(formatProdErrorMessage(453));
      return type;
    case "body":
      type = props.body;
      if (!type) throw Error(formatProdErrorMessage(454));
      return type;
    default:
      throw Error(formatProdErrorMessage(451));
  }
}
function releaseSingletonInstance(instance) {
  for (var attributes = instance.attributes; attributes.length; )
    instance.removeAttributeNode(attributes[0]);
  detachDeletedInstance(instance);
}
var preloadPropsMap = /* @__PURE__ */ new Map(), preconnectsSet = /* @__PURE__ */ new Set();
function getHoistableRoot(container) {
  return "function" === typeof container.getRootNode ? container.getRootNode() : 9 === container.nodeType ? container : container.ownerDocument;
}
var previousDispatcher = ReactDOMSharedInternals.d;
ReactDOMSharedInternals.d = {
  f: flushSyncWork,
  r: requestFormReset,
  D: prefetchDNS,
  C: preconnect,
  L: preload,
  m: preloadModule,
  X: preinitScript,
  S: preinitStyle,
  M: preinitModuleScript
};
function flushSyncWork() {
  var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
  return previousWasRendering || wasRendering;
}
function requestFormReset(form) {
  var formInst = getInstanceFromNode(form);
  null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
}
var globalDocument = "undefined" === typeof document ? null : document;
function preconnectAs(rel, href, crossOrigin) {
  var ownerDocument = globalDocument;
  if (ownerDocument && "string" === typeof href && href) {
    var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
    limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
    "string" === typeof crossOrigin && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
    preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
  }
}
function prefetchDNS(href) {
  previousDispatcher.D(href);
  preconnectAs("dns-prefetch", href, null);
}
function preconnect(href, crossOrigin) {
  previousDispatcher.C(href, crossOrigin);
  preconnectAs("preconnect", href, crossOrigin);
}
function preload(href, as, options) {
  previousDispatcher.L(href, as, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href && as) {
    var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
    "image" === as ? options && options.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(
      options.imageSrcSet
    ) + '"]', "string" === typeof options.imageSizes && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(
      options.imageSizes
    ) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
    var key = preloadSelector;
    switch (as) {
      case "style":
        key = getStyleKey(href);
        break;
      case "script":
        key = getScriptKey(href);
    }
    preloadPropsMap.has(key) || (href = assign(
      {
        rel: "preload",
        href: "image" === as && options && options.imageSrcSet ? void 0 : href,
        as
      },
      options
    ), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
  }
}
function preloadModule(href, options) {
  previousDispatcher.m(href, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href) {
    var as = options && "string" === typeof options.as ? options.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
    switch (as) {
      case "audioworklet":
      case "paintworklet":
      case "serviceworker":
      case "sharedworker":
      case "worker":
      case "script":
        key = getScriptKey(href);
    }
    if (!preloadPropsMap.has(key) && (href = assign({ rel: "modulepreload", href }, options), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
      switch (as) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
            return;
      }
      as = ownerDocument.createElement("link");
      setInitialProperties(as, "link", href);
      markNodeAsHoistable(as);
      ownerDocument.head.appendChild(as);
    }
  }
}
function preinitStyle(href, precedence, options) {
  previousDispatcher.S(href, precedence, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href) {
    var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
    precedence = precedence || "default";
    var resource = styles.get(key);
    if (!resource) {
      var state = { loading: 0, preload: null };
      if (resource = ownerDocument.querySelector(
        getStylesheetSelectorFromKey(key)
      ))
        state.loading = 5;
      else {
        href = assign(
          { rel: "stylesheet", href, "data-precedence": precedence },
          options
        );
        (options = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options);
        var link = resource = ownerDocument.createElement("link");
        markNodeAsHoistable(link);
        setInitialProperties(link, "link", href);
        link._p = new Promise(function(resolve, reject) {
          link.onload = resolve;
          link.onerror = reject;
        });
        link.addEventListener("load", function() {
          state.loading |= 1;
        });
        link.addEventListener("error", function() {
          state.loading |= 2;
        });
        state.loading |= 4;
        insertStylesheet(resource, precedence, ownerDocument);
      }
      resource = {
        type: "stylesheet",
        instance: resource,
        count: 1,
        state
      };
      styles.set(key, resource);
    }
  }
}
function preinitScript(src, options) {
  previousDispatcher.X(src, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && src) {
    var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
    resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true }, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
      type: "script",
      instance: resource,
      count: 1,
      state: null
    }, scripts.set(key, resource));
  }
}
function preinitModuleScript(src, options) {
  previousDispatcher.M(src, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && src) {
    var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
    resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true, type: "module" }, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
      type: "script",
      instance: resource,
      count: 1,
      state: null
    }, scripts.set(key, resource));
  }
}
function getResource(type, currentProps, pendingProps, currentResource) {
  var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
  if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
  switch (type) {
    case "meta":
    case "title":
      return null;
    case "style":
      return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(
        JSCompiler_inline_result
      ).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
        type: "style",
        instance: null,
        count: 0,
        state: null
      }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
    case "link":
      if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
        type = getStyleKey(pendingProps.href);
        var styles$244 = getResourcesFromRoot(
          JSCompiler_inline_result
        ).hoistableStyles, resource$245 = styles$244.get(type);
        resource$245 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$245 = {
          type: "stylesheet",
          instance: null,
          count: 0,
          state: { loading: 0, preload: null }
        }, styles$244.set(type, resource$245), (styles$244 = JSCompiler_inline_result.querySelector(
          getStylesheetSelectorFromKey(type)
        )) && !styles$244._p && (resource$245.instance = styles$244, resource$245.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
          rel: "preload",
          as: "style",
          href: pendingProps.href,
          crossOrigin: pendingProps.crossOrigin,
          integrity: pendingProps.integrity,
          media: pendingProps.media,
          hrefLang: pendingProps.hrefLang,
          referrerPolicy: pendingProps.referrerPolicy
        }, preloadPropsMap.set(type, pendingProps), styles$244 || preloadStylesheet(
          JSCompiler_inline_result,
          type,
          pendingProps,
          resource$245.state
        )));
        if (currentProps && null === currentResource)
          throw Error(formatProdErrorMessage(528, ""));
        return resource$245;
      }
      if (currentProps && null !== currentResource)
        throw Error(formatProdErrorMessage(529, ""));
      return null;
    case "script":
      return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(
        JSCompiler_inline_result
      ).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
        type: "script",
        instance: null,
        count: 0,
        state: null
      }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
    default:
      throw Error(formatProdErrorMessage(444, type));
  }
}
function getStyleKey(href) {
  return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
}
function getStylesheetSelectorFromKey(key) {
  return 'link[rel="stylesheet"][' + key + "]";
}
function stylesheetPropsFromRawProps(rawProps) {
  return assign({}, rawProps, {
    "data-precedence": rawProps.precedence,
    precedence: null
  });
}
function preloadStylesheet(ownerDocument, key, preloadProps, state) {
  ownerDocument.querySelector('link[rel="preload"][as="style"][' + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
    return state.loading |= 1;
  }), key.addEventListener("error", function() {
    return state.loading |= 2;
  }), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
}
function getScriptKey(src) {
  return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
}
function getScriptSelectorFromKey(key) {
  return "script[async]" + key;
}
function acquireResource(hoistableRoot, resource, props) {
  resource.count++;
  if (null === resource.instance)
    switch (resource.type) {
      case "style":
        var instance = hoistableRoot.querySelector(
          'style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]'
        );
        if (instance)
          return resource.instance = instance, markNodeAsHoistable(instance), instance;
        var styleProps = assign({}, props, {
          "data-href": props.href,
          "data-precedence": props.precedence,
          href: null,
          precedence: null
        });
        instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement(
          "style"
        );
        markNodeAsHoistable(instance);
        setInitialProperties(instance, "style", styleProps);
        insertStylesheet(instance, props.precedence, hoistableRoot);
        return resource.instance = instance;
      case "stylesheet":
        styleProps = getStyleKey(props.href);
        var instance$250 = hoistableRoot.querySelector(
          getStylesheetSelectorFromKey(styleProps)
        );
        if (instance$250)
          return resource.state.loading |= 4, resource.instance = instance$250, markNodeAsHoistable(instance$250), instance$250;
        instance = stylesheetPropsFromRawProps(props);
        (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
        instance$250 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
        markNodeAsHoistable(instance$250);
        var linkInstance = instance$250;
        linkInstance._p = new Promise(function(resolve, reject) {
          linkInstance.onload = resolve;
          linkInstance.onerror = reject;
        });
        setInitialProperties(instance$250, "link", instance);
        resource.state.loading |= 4;
        insertStylesheet(instance$250, props.precedence, hoistableRoot);
        return resource.instance = instance$250;
      case "script":
        instance$250 = getScriptKey(props.src);
        if (styleProps = hoistableRoot.querySelector(
          getScriptSelectorFromKey(instance$250)
        ))
          return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
        instance = props;
        if (styleProps = preloadPropsMap.get(instance$250))
          instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
        hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
        styleProps = hoistableRoot.createElement("script");
        markNodeAsHoistable(styleProps);
        setInitialProperties(styleProps, "link", instance);
        hoistableRoot.head.appendChild(styleProps);
        return resource.instance = styleProps;
      case "void":
        return null;
      default:
        throw Error(formatProdErrorMessage(443, resource.type));
    }
  else
    "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
  return resource.instance;
}
function insertStylesheet(instance, precedence, root2) {
  for (var nodes = root2.querySelectorAll(
    'link[rel="stylesheet"][data-precedence],style[data-precedence]'
  ), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.dataset.precedence === precedence) prior = node;
    else if (prior !== last) break;
  }
  prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root2.nodeType ? root2.head : root2, precedence.insertBefore(instance, precedence.firstChild));
}
function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
  null == stylesheetProps.crossOrigin && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
  null == stylesheetProps.referrerPolicy && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
  null == stylesheetProps.title && (stylesheetProps.title = preloadProps.title);
}
function adoptPreloadPropsForScript(scriptProps, preloadProps) {
  null == scriptProps.crossOrigin && (scriptProps.crossOrigin = preloadProps.crossOrigin);
  null == scriptProps.referrerPolicy && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
  null == scriptProps.integrity && (scriptProps.integrity = preloadProps.integrity);
}
var tagCaches = null;
function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
  if (null === tagCaches) {
    var cache = /* @__PURE__ */ new Map();
    var caches = tagCaches = /* @__PURE__ */ new Map();
    caches.set(ownerDocument, cache);
  } else
    caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
  if (cache.has(type)) return cache;
  cache.set(type, null);
  ownerDocument = ownerDocument.getElementsByTagName(type);
  for (caches = 0; caches < ownerDocument.length; caches++) {
    var node = ownerDocument[caches];
    if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
      var nodeKey = node.getAttribute(keyAttribute) || "";
      nodeKey = type + nodeKey;
      var existing = cache.get(nodeKey);
      existing ? existing.push(node) : cache.set(nodeKey, [node]);
    }
  }
  return cache;
}
function mountHoistable(hoistableRoot, type, instance) {
  hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
  hoistableRoot.head.insertBefore(
    instance,
    "title" === type ? hoistableRoot.querySelector("head > title") : null
  );
}
function isHostHoistableType(type, props, hostContext) {
  if (1 === hostContext || null != props.itemProp) return false;
  switch (type) {
    case "meta":
    case "title":
      return true;
    case "style":
      if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href)
        break;
      return true;
    case "link":
      if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError)
        break;
      switch (props.rel) {
        case "stylesheet":
          return type = props.disabled, "string" === typeof props.precedence && null == type;
        default:
          return true;
      }
    case "script":
      if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src)
        return true;
  }
  return false;
}
function preloadResource(resource) {
  return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? false : true;
}
var suspendedState = null;
function noop() {
}
function suspendResource(hoistableRoot, resource, props) {
  if (null === suspendedState) throw Error(formatProdErrorMessage(475));
  var state = suspendedState;
  if ("stylesheet" === resource.type && ("string" !== typeof props.media || false !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
    if (null === resource.instance) {
      var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(
        getStylesheetSelectorFromKey(key)
      );
      if (instance) {
        hoistableRoot = instance._p;
        null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
        resource.state.loading |= 4;
        resource.instance = instance;
        markNodeAsHoistable(instance);
        return;
      }
      instance = hoistableRoot.ownerDocument || hoistableRoot;
      props = stylesheetPropsFromRawProps(props);
      (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
      instance = instance.createElement("link");
      markNodeAsHoistable(instance);
      var linkInstance = instance;
      linkInstance._p = new Promise(function(resolve, reject) {
        linkInstance.onload = resolve;
        linkInstance.onerror = reject;
      });
      setInitialProperties(instance, "link", props);
      resource.instance = instance;
    }
    null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
    state.stylesheets.set(resource, hoistableRoot);
    (hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
  }
}
function waitForCommitToBeReady() {
  if (null === suspendedState) throw Error(formatProdErrorMessage(475));
  var state = suspendedState;
  state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
  return 0 < state.count ? function(commit) {
    var stylesheetTimer = setTimeout(function() {
      state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
      if (state.unsuspend) {
        var unsuspend = state.unsuspend;
        state.unsuspend = null;
        unsuspend();
      }
    }, 6e4);
    state.unsuspend = commit;
    return function() {
      state.unsuspend = null;
      clearTimeout(stylesheetTimer);
    };
  } : null;
}
function onUnsuspend() {
  this.count--;
  if (0 === this.count) {
    if (this.stylesheets) insertSuspendedStylesheets(this, this.stylesheets);
    else if (this.unsuspend) {
      var unsuspend = this.unsuspend;
      this.unsuspend = null;
      unsuspend();
    }
  }
}
var precedencesByRoot = null;
function insertSuspendedStylesheets(state, resources) {
  state.stylesheets = null;
  null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
}
function insertStylesheetIntoRoot(root2, resource) {
  if (!(resource.state.loading & 4)) {
    var precedences = precedencesByRoot.get(root2);
    if (precedences) var last = precedences.get(null);
    else {
      precedences = /* @__PURE__ */ new Map();
      precedencesByRoot.set(root2, precedences);
      for (var nodes = root2.querySelectorAll(
        "link[data-precedence],style[data-precedence]"
      ), i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media"))
          precedences.set(node.dataset.precedence, node), last = node;
      }
      last && precedences.set(null, last);
    }
    nodes = resource.instance;
    node = nodes.getAttribute("data-precedence");
    i = precedences.get(node) || last;
    i === last && precedences.set(null, nodes);
    precedences.set(node, nodes);
    this.count++;
    last = onUnsuspend.bind(this);
    nodes.addEventListener("load", last);
    nodes.addEventListener("error", last);
    i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root2 = 9 === root2.nodeType ? root2.head : root2, root2.insertBefore(nodes, root2.firstChild));
    resource.state.loading |= 4;
  }
}
var HostTransitionContext = {
  $$typeof: REACT_CONTEXT_TYPE,
  Provider: null,
  Consumer: null,
  _currentValue: sharedNotPendingObject,
  _currentValue2: sharedNotPendingObject,
  _threadCount: 0
};
function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, formState) {
  this.tag = 1;
  this.containerInfo = containerInfo;
  this.pingCache = this.current = this.pendingChildren = null;
  this.timeoutHandle = -1;
  this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
  this.callbackPriority = 0;
  this.expirationTimes = createLaneMap(-1);
  this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
  this.entanglements = createLaneMap(0);
  this.hiddenUpdates = createLaneMap(null);
  this.identifierPrefix = identifierPrefix;
  this.onUncaughtError = onUncaughtError;
  this.onCaughtError = onCaughtError;
  this.onRecoverableError = onRecoverableError;
  this.pooledCache = null;
  this.pooledCacheLanes = 0;
  this.formState = formState;
  this.incompleteTransitions = /* @__PURE__ */ new Map();
}
function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, transitionCallbacks, formState) {
  containerInfo = new FiberRootNode(
    containerInfo,
    tag,
    hydrate,
    identifierPrefix,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    formState
  );
  tag = 1;
  true === isStrictMode && (tag |= 24);
  isStrictMode = createFiberImplClass(3, null, null, tag);
  containerInfo.current = isStrictMode;
  isStrictMode.stateNode = containerInfo;
  tag = createCache();
  tag.refCount++;
  containerInfo.pooledCache = tag;
  tag.refCount++;
  isStrictMode.memoizedState = {
    element: initialChildren,
    isDehydrated: hydrate,
    cache: tag
  };
  initializeUpdateQueue(isStrictMode);
  return containerInfo;
}
function getContextForSubtree(parentComponent) {
  if (!parentComponent) return emptyContextObject;
  parentComponent = emptyContextObject;
  return parentComponent;
}
function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
  parentComponent = getContextForSubtree(parentComponent);
  null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
  container = createUpdate(lane);
  container.payload = { element };
  callback = void 0 === callback ? null : callback;
  null !== callback && (container.callback = callback);
  element = enqueueUpdate(rootFiber, container, lane);
  null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
}
function markRetryLaneImpl(fiber, retryLane) {
  fiber = fiber.memoizedState;
  if (null !== fiber && null !== fiber.dehydrated) {
    var a = fiber.retryLane;
    fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
  }
}
function markRetryLaneIfNotHydrated(fiber, retryLane) {
  markRetryLaneImpl(fiber, retryLane);
  (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
}
function attemptContinuousHydration(fiber) {
  if (13 === fiber.tag) {
    var root2 = enqueueConcurrentRenderForLane(fiber, 67108864);
    null !== root2 && scheduleUpdateOnFiber(root2, fiber, 67108864);
    markRetryLaneIfNotHydrated(fiber, 67108864);
  }
}
var _enabled = true;
function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  var prevTransition = ReactSharedInternals.T;
  ReactSharedInternals.T = null;
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
  }
}
function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  var prevTransition = ReactSharedInternals.T;
  ReactSharedInternals.T = null;
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
  }
}
function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  if (_enabled) {
    var blockedOn = findInstanceBlockingEvent(nativeEvent);
    if (null === blockedOn)
      dispatchEventForPluginEventSystem(
        domEventName,
        eventSystemFlags,
        nativeEvent,
        return_targetInst,
        targetContainer
      ), clearIfContinuousEvent(domEventName, nativeEvent);
    else if (queueIfContinuousEvent(
      blockedOn,
      domEventName,
      eventSystemFlags,
      targetContainer,
      nativeEvent
    ))
      nativeEvent.stopPropagation();
    else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
      for (; null !== blockedOn; ) {
        var fiber = getInstanceFromNode(blockedOn);
        if (null !== fiber)
          switch (fiber.tag) {
            case 3:
              fiber = fiber.stateNode;
              if (fiber.current.memoizedState.isDehydrated) {
                var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                if (0 !== lanes) {
                  var root2 = fiber;
                  root2.pendingLanes |= 2;
                  for (root2.entangledLanes |= 2; lanes; ) {
                    var lane = 1 << 31 - clz32(lanes);
                    root2.entanglements[1] |= lane;
                    lanes &= ~lane;
                  }
                  ensureRootIsScheduled(fiber);
                  0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0));
                }
              }
              break;
            case 13:
              root2 = enqueueConcurrentRenderForLane(fiber, 2), null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
          }
        fiber = findInstanceBlockingEvent(nativeEvent);
        null === fiber && dispatchEventForPluginEventSystem(
          domEventName,
          eventSystemFlags,
          nativeEvent,
          return_targetInst,
          targetContainer
        );
        if (fiber === blockedOn) break;
        blockedOn = fiber;
      }
      null !== blockedOn && nativeEvent.stopPropagation();
    } else
      dispatchEventForPluginEventSystem(
        domEventName,
        eventSystemFlags,
        nativeEvent,
        null,
        targetContainer
      );
  }
}
function findInstanceBlockingEvent(nativeEvent) {
  nativeEvent = getEventTarget(nativeEvent);
  return findInstanceBlockingTarget(nativeEvent);
}
var return_targetInst = null;
function findInstanceBlockingTarget(targetNode) {
  return_targetInst = null;
  targetNode = getClosestInstanceFromNode(targetNode);
  if (null !== targetNode) {
    var nearestMounted = getNearestMountedFiber(targetNode);
    if (null === nearestMounted) targetNode = null;
    else {
      var tag = nearestMounted.tag;
      if (13 === tag) {
        targetNode = getSuspenseInstanceFromFiber(nearestMounted);
        if (null !== targetNode) return targetNode;
        targetNode = null;
      } else if (3 === tag) {
        if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
          return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
        targetNode = null;
      } else nearestMounted !== targetNode && (targetNode = null);
    }
  }
  return_targetInst = targetNode;
  return null;
}
function getEventPriority(domEventName) {
  switch (domEventName) {
    case "beforetoggle":
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "toggle":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 2;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 8;
    case "message":
      switch (getCurrentPriorityLevel()) {
        case ImmediatePriority:
          return 2;
        case UserBlockingPriority:
          return 8;
        case NormalPriority$1:
        case LowPriority:
          return 32;
        case IdlePriority:
          return 268435456;
        default:
          return 32;
      }
    default:
      return 32;
  }
}
var hasScheduledReplayAttempt = false, queuedFocus = null, queuedDrag = null, queuedMouse = null, queuedPointers = /* @__PURE__ */ new Map(), queuedPointerCaptures = /* @__PURE__ */ new Map(), queuedExplicitHydrationTargets = [], discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
  " "
);
function clearIfContinuousEvent(domEventName, nativeEvent) {
  switch (domEventName) {
    case "focusin":
    case "focusout":
      queuedFocus = null;
      break;
    case "dragenter":
    case "dragleave":
      queuedDrag = null;
      break;
    case "mouseover":
    case "mouseout":
      queuedMouse = null;
      break;
    case "pointerover":
    case "pointerout":
      queuedPointers.delete(nativeEvent.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      queuedPointerCaptures.delete(nativeEvent.pointerId);
  }
}
function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent)
    return existingQueuedEvent = {
      blockedOn,
      domEventName,
      eventSystemFlags,
      nativeEvent,
      targetContainers: [targetContainer]
    }, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
  existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
  blockedOn = existingQueuedEvent.targetContainers;
  null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
  return existingQueuedEvent;
}
function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  switch (domEventName) {
    case "focusin":
      return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(
        queuedFocus,
        blockedOn,
        domEventName,
        eventSystemFlags,
        targetContainer,
        nativeEvent
      ), true;
    case "dragenter":
      return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(
        queuedDrag,
        blockedOn,
        domEventName,
        eventSystemFlags,
        targetContainer,
        nativeEvent
      ), true;
    case "mouseover":
      return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(
        queuedMouse,
        blockedOn,
        domEventName,
        eventSystemFlags,
        targetContainer,
        nativeEvent
      ), true;
    case "pointerover":
      var pointerId = nativeEvent.pointerId;
      queuedPointers.set(
        pointerId,
        accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedPointers.get(pointerId) || null,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        )
      );
      return true;
    case "gotpointercapture":
      return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(
        pointerId,
        accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedPointerCaptures.get(pointerId) || null,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        )
      ), true;
  }
  return false;
}
function attemptExplicitHydrationTarget(queuedTarget) {
  var targetInst = getClosestInstanceFromNode(queuedTarget.target);
  if (null !== targetInst) {
    var nearestMounted = getNearestMountedFiber(targetInst);
    if (null !== nearestMounted) {
      if (targetInst = nearestMounted.tag, 13 === targetInst) {
        if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
          queuedTarget.blockedOn = targetInst;
          runWithPriority(queuedTarget.priority, function() {
            if (13 === nearestMounted.tag) {
              var lane = requestUpdateLane();
              lane = getBumpedLaneForHydrationByLane(lane);
              var root2 = enqueueConcurrentRenderForLane(nearestMounted, lane);
              null !== root2 && scheduleUpdateOnFiber(root2, nearestMounted, lane);
              markRetryLaneIfNotHydrated(nearestMounted, lane);
            }
          });
          return;
        }
      } else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
        queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
        return;
      }
    }
  }
  queuedTarget.blockedOn = null;
}
function attemptReplayContinuousQueuedEvent(queuedEvent) {
  if (null !== queuedEvent.blockedOn) return false;
  for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length; ) {
    var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
    if (null === nextBlockedOn) {
      nextBlockedOn = queuedEvent.nativeEvent;
      var nativeEventClone = new nextBlockedOn.constructor(
        nextBlockedOn.type,
        nextBlockedOn
      );
      currentReplayingEvent = nativeEventClone;
      nextBlockedOn.target.dispatchEvent(nativeEventClone);
      currentReplayingEvent = null;
    } else
      return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
    targetContainers.shift();
  }
  return true;
}
function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
  attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
}
function replayUnblockedEvents() {
  hasScheduledReplayAttempt = false;
  null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
  null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
  null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
  queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
  queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
}
function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
  queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(
    Scheduler.unstable_NormalPriority,
    replayUnblockedEvents
  )));
}
var lastScheduledReplayQueue = null;
function scheduleReplayQueueIfNeeded(formReplayingQueue) {
  lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(
    Scheduler.unstable_NormalPriority,
    function() {
      lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
      for (var i = 0; i < formReplayingQueue.length; i += 3) {
        var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
        if ("function" !== typeof submitterOrAction)
          if (null === findInstanceBlockingTarget(submitterOrAction || form))
            continue;
          else break;
        var formInst = getInstanceFromNode(form);
        null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(
          formInst,
          {
            pending: true,
            data: formData,
            method: form.method,
            action: submitterOrAction
          },
          submitterOrAction,
          formData
        ));
      }
    }
  ));
}
function retryIfBlockedOn(unblocked) {
  function unblock(queuedEvent) {
    return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
  }
  null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
  null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
  null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
  queuedPointers.forEach(unblock);
  queuedPointerCaptures.forEach(unblock);
  for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
    var queuedTarget = queuedExplicitHydrationTargets[i];
    queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
  }
  for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn); )
    attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
  i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
  if (null != i)
    for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
      var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
      if ("function" === typeof submitterOrAction)
        formProps || scheduleReplayQueueIfNeeded(i);
      else if (formProps) {
        var action = null;
        if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
          if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
            action = formProps.formAction;
          else {
            if (null !== findInstanceBlockingTarget(form)) continue;
          }
        else action = formProps.action;
        "function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
        scheduleReplayQueueIfNeeded(i);
      }
    }
}
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}
ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
  var root2 = this._internalRoot;
  if (null === root2) throw Error(formatProdErrorMessage(409));
  var current = root2.current, lane = requestUpdateLane();
  updateContainerImpl(current, lane, children, root2, null, null);
};
ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
  var root2 = this._internalRoot;
  if (null !== root2) {
    this._internalRoot = null;
    var container = root2.containerInfo;
    updateContainerImpl(root2.current, 2, null, root2, null, null);
    flushSyncWork$1();
    container[internalContainerInstanceKey] = null;
  }
};
function ReactDOMHydrationRoot(internalRoot) {
  this._internalRoot = internalRoot;
}
ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
  if (target) {
    var updatePriority = resolveUpdatePriority();
    target = { blockedOn: null, target, priority: updatePriority };
    for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++) ;
    queuedExplicitHydrationTargets.splice(i, 0, target);
    0 === i && attemptExplicitHydrationTarget(target);
  }
};
var isomorphicReactPackageVersion$jscomp$inline_1785 = React.version;
if ("19.1.5" !== isomorphicReactPackageVersion$jscomp$inline_1785)
  throw Error(
    formatProdErrorMessage(
      527,
      isomorphicReactPackageVersion$jscomp$inline_1785,
      "19.1.5"
    )
  );
ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
  var fiber = componentOrElement._reactInternals;
  if (void 0 === fiber) {
    if ("function" === typeof componentOrElement.render)
      throw Error(formatProdErrorMessage(188));
    componentOrElement = Object.keys(componentOrElement).join(",");
    throw Error(formatProdErrorMessage(268, componentOrElement));
  }
  componentOrElement = findCurrentFiberUsingSlowPath(fiber);
  componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
  componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
  return componentOrElement;
};
var internals$jscomp$inline_2256 = {
  bundleType: 0,
  version: "19.1.5",
  rendererPackageName: "react-dom",
  currentDispatcherRef: ReactSharedInternals,
  reconcilerVersion: "19.1.5"
};
if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
  var hook$jscomp$inline_2257 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook$jscomp$inline_2257.isDisabled && hook$jscomp$inline_2257.supportsFiber)
    try {
      rendererID = hook$jscomp$inline_2257.inject(
        internals$jscomp$inline_2256
      ), injectedHook = hook$jscomp$inline_2257;
    } catch (err) {
    }
}
reactDomClient_production.createRoot = function(container, options) {
  if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
  var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, transitionCallbacks = null;
  null !== options && void 0 !== options && (true === options.unstable_strictMode && (isStrictMode = true), void 0 !== options.identifierPrefix && (identifierPrefix = options.identifierPrefix), void 0 !== options.onUncaughtError && (onUncaughtError = options.onUncaughtError), void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError), void 0 !== options.onRecoverableError && (onRecoverableError = options.onRecoverableError), void 0 !== options.unstable_transitionCallbacks && (transitionCallbacks = options.unstable_transitionCallbacks));
  options = createFiberRoot(
    container,
    1,
    false,
    null,
    null,
    isStrictMode,
    identifierPrefix,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    transitionCallbacks,
    null
  );
  container[internalContainerInstanceKey] = options.current;
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(options);
};
reactDomClient_production.hydrateRoot = function(container, initialChildren, options) {
  if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
  var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, transitionCallbacks = null, formState = null;
  null !== options && void 0 !== options && (true === options.unstable_strictMode && (isStrictMode = true), void 0 !== options.identifierPrefix && (identifierPrefix = options.identifierPrefix), void 0 !== options.onUncaughtError && (onUncaughtError = options.onUncaughtError), void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError), void 0 !== options.onRecoverableError && (onRecoverableError = options.onRecoverableError), void 0 !== options.unstable_transitionCallbacks && (transitionCallbacks = options.unstable_transitionCallbacks), void 0 !== options.formState && (formState = options.formState));
  initialChildren = createFiberRoot(
    container,
    1,
    true,
    initialChildren,
    null != options ? options : null,
    isStrictMode,
    identifierPrefix,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    transitionCallbacks,
    formState
  );
  initialChildren.context = getContextForSubtree(null);
  options = initialChildren.current;
  isStrictMode = requestUpdateLane();
  isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
  identifierPrefix = createUpdate(isStrictMode);
  identifierPrefix.callback = null;
  enqueueUpdate(options, identifierPrefix, isStrictMode);
  options = isStrictMode;
  initialChildren.current.lanes = options;
  markRootUpdated$1(initialChildren, options);
  ensureRootIsScheduled(initialChildren);
  container[internalContainerInstanceKey] = initialChildren.current;
  listenToAllSupportedEvents(container);
  return new ReactDOMHydrationRoot(initialChildren);
};
reactDomClient_production.version = "19.1.5";
function checkDCE() {
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
    return;
  }
  try {
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
  } catch (err) {
    console.error(err);
  }
}
{
  checkDCE();
  client.exports = reactDomClient_production;
}
var clientExports = client.exports;
const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(clientExports);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index2, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index2;
}).join(" ").trim();
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Icon = reactExports.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => reactExports.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => reactExports.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const createLucideIcon = (iconName, iconNode) => {
  const Component2 = reactExports.forwardRef(
    ({ className, ...props }, ref) => reactExports.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component2.displayName = toPascalCase(iconName);
  return Component2;
};
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$d = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$d);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$c = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$c);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$b = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
];
const BookOpen = createLucideIcon("book-open", __iconNode$b);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$a = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$a);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$9 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const CircleHelp = createLucideIcon("circle-help", __iconNode$9);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$8 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$8);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$7 = [
  [
    "path",
    {
      d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
      key: "c3ymky"
    }
  ],
  [
    "path",
    {
      d: "M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66",
      key: "4oyue0"
    }
  ],
  ["path", { d: "m18 15-2-2", key: "60u0ii" }],
  ["path", { d: "m15 18-2-2", key: "6p76be" }]
];
const HeartHandshake = createLucideIcon("heart-handshake", __iconNode$7);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  [
    "path",
    {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      key: "1gvzjb"
    }
  ],
  ["path", { d: "M9 18h6", key: "x1upvd" }],
  ["path", { d: "M10 22h4", key: "ceow96" }]
];
const Lightbulb = createLucideIcon("lightbulb", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z", key: "131961" }],
  ["path", { d: "M19 10v2a7 7 0 0 1-14 0v-2", key: "1vc78b" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }]
];
const Mic = createLucideIcon("mic", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m18 14 4 4-4 4", key: "10pe0f" }],
  ["path", { d: "m18 2 4 4-4 4", key: "pucp1d" }],
  ["path", { d: "M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22", key: "1ailkh" }],
  ["path", { d: "M2 6h1.972a4 4 0 0 1 3.6 2.2", key: "km57vx" }],
  ["path", { d: "M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45", key: "os18l9" }]
];
const Shuffle = createLucideIcon("shuffle", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
];
const Sparkles = createLucideIcon("sparkles", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode);
const lessons = [
  {
    id: "first-thread",
    title: "Find your first thread",
    topic: "Practice 1 of 2",
    description: "Select four words that belong together, then check your group. Try looking for something you can eat.",
    groups: [
      {
        id: "fruit",
        category: "Fruits",
        words: ["APPLE", "PEAR", "GRAPE", "PEACH"],
        clue: "Look for a sweet snack that grows on a plant.",
        explanation: "Apple, pear, grape, and peach are all fruits. The shared idea is the thread connecting the words."
      },
      {
        id: "instruments",
        category: "Musical instruments",
        words: ["DRUM", "FLUTE", "HARP", "VIOLIN"],
        clue: "These help you make music.",
        explanation: "These are all musical instruments. A connection can be a simple category like this one."
      }
    ]
  },
  {
    id: "second-look",
    title: "Give a word a second look",
    topic: "Practice 2 of 2",
    description: "A word can suggest more than one connection. PALM might make you think of a hand, but look for four words that fit together across the whole board.",
    groups: [
      {
        id: "trees",
        category: "Types of trees",
        words: ["PALM", "OAK", "BIRCH", "ELM"],
        clue: "Think leaves, trunks, and branches.",
        explanation: "Palm is a tree as well as part of a hand. Oak, birch, and elm help you discover its intended meaning here."
      },
      {
        id: "hand",
        category: "Parts of a hand",
        words: ["THUMB", "PINKY", "KNUCKLE", "FINGERTIP"],
        clue: "You can find these by looking at your hand.",
        explanation: "These four describe parts of a hand. With PALM in the tree group, every word has a place. Looking at the whole board helps resolve an overlap."
      }
    ]
  }
];
const puzzles = [
  {
    id: "garden-path",
    title: "Along the garden path",
    topic: "Everyday nature",
    description: "A little fresh air and a few familiar discoveries. Find four groups of four.",
    groups: [
      {
        id: "trees",
        category: "Trees",
        words: ["MAPLE", "BIRCH", "WILLOW", "CEDAR"],
        clue: "Look for plants with woody trunks.",
        explanation: "Maple, birch, willow, and cedar are trees. Their leaves and growth habits differ, but they share this category."
      },
      {
        id: "birds",
        category: "Birds",
        words: ["ROBIN", "SPARROW", "FINCH", "WREN"],
        clue: "You might hear these singing outside.",
        explanation: "These are all birds you might encounter in gardens or other outdoor habitats."
      },
      {
        id: "flowers",
        category: "Flowers",
        words: ["DAISY", "TULIP", "IRIS", "LILY"],
        clue: "Think of a colorful bouquet.",
        explanation: "These names refer to flowering plants grown for their blooms. Iris can also mean part of an eye—a word can have several meanings."
      },
      {
        id: "herbs",
        category: "Culinary herbs",
        words: ["BASIL", "THYME", "SAGE", "MINT"],
        clue: "Their fragrant leaves can flavor food.",
        explanation: "These herbs are used in cooking. Sage can also describe a wise person, and mint can mean a place that makes coins."
      }
    ]
  },
  {
    id: "body-basics",
    title: "Under the surface",
    topic: "Biology basics",
    description: "Explore the human body. New vocabulary is welcome here—Relaxed mode gives you room to learn.",
    groups: [
      {
        id: "bones",
        category: "Bones",
        words: ["FEMUR", "TIBIA", "ULNA", "TALUS"],
        clue: "These help form your skeleton.",
        explanation: "The femur is in the thigh, the tibia in the lower leg, the ulna in the forearm, and the talus in the ankle."
      },
      {
        id: "senses",
        category: "Four of the senses",
        words: ["SIGHT", "HEARING", "TASTE", "SMELL"],
        clue: "Ways you perceive the world around you.",
        explanation: "These are four familiar senses. Touch is another; this group does not list every sense."
      },
      {
        id: "teeth",
        category: "Types of teeth",
        words: ["INCISOR", "CANINE", "PREMOLAR", "MOLAR"],
        clue: "Think about biting and chewing.",
        explanation: "These are types of human teeth. Incisors cut, canines help tear, and premolars and molars help crush and grind food."
      },
      {
        id: "blood",
        category: "Blood components",
        words: ["PLASMA", "PLATELETS", "RED CELLS", "WHITE CELLS"],
        clue: "These travel through blood vessels.",
        explanation: "Plasma is the liquid portion of blood. Red blood cells carry oxygen, white blood cells support immune defenses, and platelets help blood clot."
      }
    ]
  },
  {
    id: "kitchen-table",
    title: "Around the kitchen table",
    topic: "Food & everyday life",
    description: "A cupboard full of connections. Find the thread running through each set of four.",
    groups: [
      {
        id: "citrus",
        category: "Citrus fruits",
        words: ["LEMON", "LIME", "ORANGE", "GRAPEFRUIT"],
        clue: "Think zest, peel, and tangy juice.",
        explanation: "These fruits belong to the citrus group. Orange can also name a color, and lime can name a mineral material."
      },
      {
        id: "pasta",
        category: "Pasta shapes",
        words: ["PENNE", "FUSILLI", "FARFALLE", "RIGATONI"],
        clue: "You might serve these with a sauce.",
        explanation: "Penne and rigatoni are tubes, fusilli are spirals, and farfalle resemble bows or butterflies."
      },
      {
        id: "utensils",
        category: "Kitchen utensils",
        words: ["WHISK", "LADLE", "SPATULA", "TONGS"],
        clue: "Tools you hold while preparing or serving food.",
        explanation: "These utensils help you mix, serve, turn, or grip food."
      },
      {
        id: "units",
        category: "Cooking measurements",
        words: ["CUP", "TEASPOON", "TABLESPOON", "OUNCE"],
        clue: "A recipe uses these to tell you how much.",
        explanation: "These are measurements used in recipes. An ounce may measure weight, while a fluid ounce measures volume; the recipe should make the distinction clear."
      }
    ]
  }
];
function CopyField({ value, label }) {
  const id = reactExports.useId();
  const [status, setStatus] = reactExports.useState("");
  const [copiedValue, setCopiedValue] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-field", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: id, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id,
          value,
          readOnly: true,
          onFocus: (event) => event.currentTarget.select()
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "secondary-button",
          type: "button",
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopiedValue(value);
              setStatus("Copied. Ready to share.");
            } catch {
              setStatus(
                "Copy wasn't available. Select the text and copy it manually."
              );
            }
          },
          children: [
            copiedValue === value ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 15 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 15 }),
            " ",
            "Copy"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("output", { "aria-live": "polite", children: status })
  ] });
}
function CreatorOptions({
  brief,
  update
}) {
  var _a2, _b2;
  function name(which, value) {
    var _a3, _b3;
    update(which === "you" ? "creator" : "recipient", value);
    update("people", {
      you: which === "you" ? value : brief.creator || ((_a3 = brief.people) == null ? void 0 : _a3.you) || "",
      partner: which === "partner" ? value : brief.recipient || ((_b3 = brief.people) == null ? void 0 : _b3.partner) || ""
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "creator-options", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Puzzle options" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "editor-fields", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "challenge-choice", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: brief.mode === "challenge",
            onChange: (e) => update("mode", e.target.checked ? "challenge" : "relaxed")
          }
        ),
        " ",
        "Limit us to four mistakes, with no hints"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "story-followup", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "More puzzle settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
          "Puzzle type",
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: brief.purpose,
              onChange: (e) => update("purpose", e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fun", children: "Personal story" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "study", children: "Learning puzzle" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
          "Puzzle difficulty",
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: brief.difficulty,
              onChange: (e) => update(
                "difficulty",
                e.target.value
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "easy", children: "Gentle start" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "balanced", children: "A little twist" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "tricky", children: "Make us think" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "story-followup", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Names & sharing (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "editor-fields", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "field-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              "Your name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "(optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: brief.creator || ((_a2 = brief.people) == null ? void 0 : _a2.you) || "",
                  maxLength: 40,
                  onChange: (e) => name("you", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              "Playing with ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "(optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: brief.recipient || ((_b2 = brief.people) == null ? void 0 : _b2.partner) || "",
                  maxLength: 40,
                  onChange: (e) => name("partner", e.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "One pair of names for the puzzle and invitation. For personal puzzles, Claude uses these to understand who's who. You can leave them blank." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
            "Answer visibility",
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: brief.style,
                onChange: (e) => update("style", e.target.value),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "together", children: "Solve together · surprise us" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "gift", children: "Review answers before sharing" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
            "A personal note ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "(optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: brief.note,
                maxLength: 180,
                onChange: (e) => update("note", e.target.value)
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "story-followup", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: brief.purpose === "fun" ? "Themes & extra interests (optional)" : "Learning preferences" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "editor-fields", children: brief.purpose === "fun" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
            "Extra interests ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "(optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: brief.interests,
                maxLength: 2e3,
                rows: 2,
                onChange: (e) => update("interests", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
            "A theme to weave in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "(optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: brief.topic,
                maxLength: 500,
                onChange: (e) => update("topic", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
            "Personal connections",
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: brief.personalization || "memories-only",
                onChange: (e) => update(
                  "personalization",
                  e.target.value
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "memories-only", children: "All four groups from our story" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "mix", children: "Allow one related theme" })
                ]
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
          "Topic familiarity",
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: brief.familiarity,
              onChange: (e) => update(
                "familiarity",
                e.target.value
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "new", children: "New to it" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "familiar", children: "Know it already" })
              ]
            }
          )
        ] }) })
      ] })
    ] })
  ] });
}
function Dictation({
  value,
  onChange,
  maxLength,
  primary = false
}) {
  const [listening, setListening] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState("");
  const active = reactExports.useRef(null);
  const latest = reactExports.useRef({ value, onChange });
  latest.current = { value, onChange };
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  reactExports.useEffect(
    () => () => {
      if (active.current) {
        active.current.onresult = null;
        active.current.onerror = null;
        active.current.onend = null;
        active.current.abort();
      }
    },
    []
  );
  if (!Speech)
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "Microphone dictation isn't available in this browser. Try Chrome or Edge, or use your keyboard's dictation." });
  function start() {
    if (active.current) {
      active.current.stop();
      return;
    }
    const recognition = new Speech();
    active.current = recognition;
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let words = "";
      for (let i = event.resultIndex; i < event.results.length; i++)
        if (event.results[i].isFinal)
          words += ` ${event.results[i][0].transcript}`;
      if (!words.trim()) return;
      const next = `${latest.current.value.trimEnd()}${words}`.trimStart();
      latest.current.value = next.slice(0, maxLength);
      latest.current.onChange(next.slice(0, maxLength));
      if (next.length >= maxLength) {
        recognition.stop();
        setMessage(
          "This answer is full. You can continue in another question or shorten the transcript."
        );
      }
    };
    recognition.onerror = (event) => {
      setMessage(
        event.error === "not-allowed" ? "Microphone permission was denied. Allow it in your browser or type your answer." : "Dictation stopped. Check your microphone and connection, then try again."
      );
    };
    recognition.onend = () => {
      active.current = null;
      setListening(false);
    };
    try {
      recognition.start();
      setListening(true);
      setMessage("");
    } catch {
      active.current = null;
      setListening(false);
      setMessage("Couldn't start the microphone. Please try again.");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dictation-control", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: primary ? "primary-button" : "secondary-button",
        "aria-pressed": listening,
        onClick: start,
        children: [
          listening ? /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 16 }),
          listening ? "Stop dictation" : "Speak your answer"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("output", { className: "field-help", children: message || (listening ? "Listening… speak naturally. You can edit the transcript." : "Speak naturally. You can edit the words below.") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "field-help", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "About voice input" }),
      "Your browser handles speech recognition and may send audio to its speech service. Only the text goes to Claude when you generate."
    ] })
  ] });
}
function FreshnessQuestion({
  prompt,
  pending,
  error,
  returnFocus,
  onAnswer,
  onSave,
  onSkip
}) {
  const dialog = reactExports.useRef(null);
  const answer = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a2;
    const previous = document.activeElement;
    const element = dialog.current;
    element == null ? void 0 : element.showModal();
    (_a2 = answer.current) == null ? void 0 : _a2.focus({ preventScroll: true });
    return () => {
      var _a3;
      element == null ? void 0 : element.close();
      (_a3 = returnFocus.current || previous) == null ? void 0 : _a3.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "dialog",
    {
      ref: dialog,
      className: "memory-dialog",
      "aria-labelledby": "memory-title",
      "aria-describedby": "memory-help",
      onCancel: (event) => {
        event.preventDefault();
        if (!pending) onSkip();
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: "YOUR STORY KEEPS GROWING" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "memory-title", children: "One quick question" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "memory-help", className: "field-help", children: "A little more about you could open up new connections. A short answer or list is plenty." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "fresh-memory", children: prompt.question }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            ref: answer,
            id: "fresh-memory",
            rows: 3,
            maxLength: 3e3,
            value: prompt.answer,
            onChange: (event) => onAnswer(event.target.value),
            disabled: pending
          }
        ),
        !pending && /* @__PURE__ */ jsxRuntimeExports.jsx(Dictation, { value: prompt.answer, onChange: onAnswer, maxLength: 3e3 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "Your answer joins your saved story, ready for future puzzles too." }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "form-error", role: "alert", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "primary-button",
              disabled: pending || !prompt.answer.trim(),
              onClick: onSave,
              children: "Add to story & make puzzle"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "text-button",
              disabled: pending,
              onClick: onSkip,
              children: "Skip for now"
            }
          )
        ] })
      ]
    }
  );
}
function cleanStoryQuestion(value) {
  if (typeof value !== "string") return;
  const question = value.trim();
  if (!question || question.length > 180 || Array.from(question).some(
    (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127
  ) || (question.match(/\?/g) || []).length !== 1 || !question.endsWith("?") || /\b(?:four|4|at least|fresh personal groups|named things|fair groups)\b/i.test(
    question
  ))
    return;
  return question;
}
class StoryQuestionError extends Error {
  constructor(question) {
    super("One more memory could help make your puzzle.");
    this.question = question;
    this.name = "StoryQuestionError";
  }
}
const CLAUDE_SERVICE = "https://common-thread-claude-service.terrbrutus.chatgpt.site";
const CONNECTION_EVENT = "common-thread-connection";
let connection;
const notify = () => window.dispatchEvent(new Event(CONNECTION_EVENT));
function isStoryConnected() {
  return Boolean((connection == null ? void 0 : connection.ready) && !connection.popup.closed);
}
function disconnectStoryCloud() {
  const current = connection;
  if (!current) return;
  connection = void 0;
  window.removeEventListener("message", current.receive);
  clearInterval(current.closed);
  for (const pending of current.requests.values()) {
    clearTimeout(pending.timer);
    pending.reject(
      new Error(
        "The story connection closed. Your changes are saved on this device; reconnect to sync."
      )
    );
  }
  current.requests.clear();
  notify();
}
function connectStoryCloud() {
  var _a2, _b2;
  if (connection && !connection.popup.closed) {
    if (!connection.ready) (_b2 = (_a2 = connection.popup).focus) == null ? void 0 : _b2.call(_a2);
    return;
  }
  disconnectStoryCloud();
  const channel = crypto.randomUUID();
  const popup = window.open(
    `${CLAUDE_SERVICE}/bridge?channel=${encodeURIComponent(channel)}&origin=${encodeURIComponent(window.location.origin)}`,
    "common-thread-connection",
    "popup,width=480,height=480"
  );
  if (!popup)
    throw new Error(
      "Allow pop-ups for Common Thread to connect your saved story. Your answers are still saved on this device."
    );
  const requests = /* @__PURE__ */ new Map();
  const send = (requestId, pending) => {
    if (pending.sent || !(connection == null ? void 0 : connection.ready)) return;
    pending.sent = true;
    popup.postMessage(
      {
        type: "common-thread-brief",
        channel,
        requestId,
        brief: pending.brief,
        operation: pending.operation
      },
      CLAUDE_SERVICE
    );
  };
  const receive = (event) => {
    var _a3;
    if (event.origin !== CLAUDE_SERVICE || event.source !== popup || ((_a3 = event.data) == null ? void 0 : _a3.channel) !== channel || !connection || connection.popup !== popup)
      return;
    if (event.data.type === "common-thread-ready") {
      if (!connection.ready) {
        connection.ready = true;
        notify();
        window.focus();
      }
      for (const [id2, pending2] of requests) send(id2, pending2);
      return;
    }
    const id = event.data.requestId || (requests.size === 1 ? requests.keys().next().value : void 0);
    if (!id) return;
    const pending = requests.get(id);
    if (!pending) return;
    if (event.data.type === "common-thread-result" && (typeof event.data.text === "string" || event.data.value !== void 0)) {
      clearTimeout(pending.timer);
      requests.delete(id);
      pending.resolve(event.data.value ?? event.data.text);
      if (pending.operation === "generate") window.focus();
    } else if (event.data.type === "common-thread-error") {
      clearTimeout(pending.timer);
      requests.delete(id);
      pending.reject(
        event.data.code === "needs_story" && pending.operation === "generate" ? new StoryQuestionError(cleanStoryQuestion(event.data.question)) : new Error(String(event.data.error).slice(0, 1e3))
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
    }, 1e3)
  };
}
function hostedOperation(operation, brief, background = false) {
  try {
    if (background && !isStoryConnected())
      throw new Error(
        "Reconnect to sync this story. Your answers are saved on this device."
      );
    connectStoryCloud();
  } catch (error) {
    return Promise.reject(error);
  }
  const current = connection;
  const requestId = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const pending = {
      operation,
      brief,
      sent: false,
      resolve,
      reject,
      timer: setTimeout(() => {
        current.requests.delete(requestId);
        reject(
          new Error(
            "The story connection timed out. Your answers are saved on this device; reconnect and try again."
          )
        );
      }, 3e5)
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
          operation
        },
        CLAUDE_SERVICE
      );
    }
  });
}
async function hostedGeneration(brief) {
  const result = await hostedOperation("generate", brief);
  if (typeof result !== "string")
    throw new Error("The private service returned an invalid puzzle.");
  return result;
}
const normalize$1 = (text2) => text2.normalize("NFC").toLowerCase().replace(/&/g, " and ").replace(/['’]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function connectionRule(group) {
  return group.rule || (/backward|revers/i.test(`${group.category} ${group.clue}`) ? "reverse" : "literal");
}
function underlyingWords(connection2) {
  var _a2;
  if (((_a2 = connection2.sourceWords) == null ? void 0 : _a2.length) === 4)
    return connection2.sourceWords.map(normalize$1);
  return connection2.words.map(
    (word) => normalize$1(
      connection2.rule === "reverse" ? Array.from(word.normalize("NFC")).reverse().join("") : word
    )
  );
}
function familiarCount(puzzle, history2 = []) {
  return puzzle.groups.filter((group) => {
    const words = new Set(
      underlyingWords({
        words: group.words,
        rule: connectionRule(group),
        sourceWords: group.sourceWords
      })
    );
    return history2.some(
      (old) => underlyingWords(old).filter((word) => words.has(word)).length >= 3
    );
  }).length;
}
function rememberConnections(history2, groups, now2 = Date.now()) {
  const result = [...history2];
  for (const group of groups) {
    const words = group.words.map(
      (word) => word.normalize("NFC").toUpperCase()
    );
    const variant = underlyingWords({
      words,
      rule: connectionRule(group),
      sourceWords: group.sourceWords
    }).sort().join("|");
    if (result.some(
      (old) => connectionRule(group) === old.rule && underlyingWords(old).sort().join("|") === variant
    ))
      continue;
    result.push({
      category: group.category,
      words,
      rule: connectionRule(group),
      playedAt: now2,
      ...group.sourceWords ? { sourceWords: [...group.sourceWords] } : {}
    });
  }
  return result.slice(-80);
}
function parseHistory(value) {
  if (value === void 0) return [];
  if (!Array.isArray(value) || value.length > 80)
    throw new Error("This story's connection history is invalid.");
  return value.map((item) => {
    if (!item || typeof item.category !== "string" || item.category.length > 60 || !Array.isArray(item.words) || item.words.length !== 4 || item.words.some(
      (w) => typeof w !== "string" || !w.trim() || w.length > 24
    ) || new Set(item.words.map(normalize$1)).size !== 4 || !["literal", "reverse", "fill-blank", "first-word", "last-word"].includes(
      item.rule
    ) || item.sourceWords !== void 0 && (!Array.isArray(item.sourceWords) || item.sourceWords.length !== 4 || item.sourceWords.some(
      (w) => typeof w !== "string" || !w.trim() || w.length > 60
    )) || !Number.isFinite(item.playedAt))
      throw new Error("This story's connection history is invalid.");
    return {
      category: item.category,
      words: [...item.words],
      rule: item.rule,
      playedAt: item.playedAt,
      ...item.sourceWords ? { sourceWords: [...item.sourceWords] } : {}
    };
  });
}
function parseFreshnessPrompt(value) {
  if (value === void 0) return;
  const prompt = value;
  if (!prompt || typeof prompt.question !== "string" || !prompt.question.trim() || prompt.question.length > 180 || typeof prompt.forStory !== "string" || prompt.forStory.length > 32 || typeof prompt.dismissed !== "boolean" || typeof prompt.answer !== "string" || prompt.answer.length > 3e3)
    throw new Error("This story's optional question is invalid.");
  return {
    question: prompt.question,
    forStory: prompt.forStory,
    dismissed: prompt.dismissed,
    answer: prompt.answer
  };
}
function storyKey(brief) {
  const text2 = JSON.stringify([
    brief.purpose,
    brief.storyAnswers,
    brief.extraAnswers,
    brief.memories,
    brief.freeStory,
    brief.conversation,
    brief.notes,
    brief.topic,
    brief.interests
  ]);
  let hash = 2166136261;
  for (let i = 0; i < text2.length; i++)
    hash = Math.imul(hash ^ text2.charCodeAt(i), 16777619);
  return `${text2.length.toString(16)}-${(hash >>> 0).toString(16)}`;
}
function nextFreshQuestion(brief) {
  var _a2, _b2;
  const categories = (brief.playedConnections || []).map((item) => item.category).join(" ");
  const facts = [
    (_a2 = brief.storyAnswers) == null ? void 0 : _a2.join(" "),
    ...(brief.extraAnswers || []).map((item) => item.answer),
    brief.memories,
    brief.freeStory,
    brief.conversation
  ].filter(Boolean).join(" ");
  const asked = (brief.extraAnswers || []).map((item) => item.question).join(" ");
  const choices = [
    {
      from: /trip|vacation|travel|beach/i,
      asked: /favorite stops|remember from that trip/i,
      question: "You mentioned trips together. What are a few favorite stops or places you remember?"
    },
    {
      from: /show|game|tv/i,
      asked: /film|series/i,
      question: "What are a few films or series you've enjoyed together?"
    },
    {
      from: /place|home|trip|travel/i,
      asked: /favorite trip|visited on/i,
      question: "What are a few places you visited on a favorite trip?"
    },
    {
      from: /restaurant|food|eat/i,
      asked: /foods or drinks/i,
      question: "Which foods or drinks do you both have strong opinions about?"
    },
    {
      from: /parent|family|name/i,
      asked: /friends or pets/i,
      question: "Who are a few friends or pets who are part of your story?"
    },
    {
      from: /./,
      asked: /sayings or inside jokes/i,
      question: "What are a few sayings or inside jokes you both recognize?"
    }
  ];
  return ((_b2 = choices.find(
    (choice) => choice.from.test(`${facts} ${categories}`) && !choice.asked.test(asked)
  )) == null ? void 0 : _b2.question) || "What's one new memory you'd like to add since your last puzzle?";
}
function addFreshMemory(brief, question, answer) {
  const value = answer.trim();
  if (!value || value.length > 3e3)
    throw new Error("Add a short answer, up to 3,000 characters.");
  const extra = [...brief.extraAnswers || []];
  const index2 = extra.findIndex((item) => item.question === question);
  if (index2 >= 0 && extra[index2].answer.length + value.length + 1 <= 3e3)
    extra[index2] = { question, answer: `${extra[index2].answer}
${value}` };
  else if (index2 < 0 && extra.length < 8)
    extra.push({ question, answer: value });
  else {
    const freeStory = [brief.freeStory || "", `${question}
${value}`].filter(Boolean).join("\n\n");
    if (freeStory.length > 12e3)
      throw new Error(
        "This story's answer space is full. Download a backup and start another story; your existing answers stay saved."
      );
    return { ...brief, freeStory, freshnessPrompt: void 0 };
  }
  return { ...brief, extraAnswers: extra, freshnessPrompt: void 0 };
}
const defaultBrief = {
  creator: "",
  recipient: "",
  note: "",
  style: "together",
  personalization: "memories-only",
  purpose: "fun",
  interests: "",
  topic: "",
  notes: "",
  difficulty: "balanced",
  familiarity: "new",
  mode: "challenge"
};
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("This puzzle has an invalid format.");
  return value;
}
function text(value, field, max, optional = false) {
  if (typeof value !== "string")
    throw new Error(`Check ${field}: use plain text.`);
  const result = value.trim();
  if ([...result].some(
    (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127
  ))
    throw new Error(`Check ${field}: use plain text.`);
  if (!optional && result.length === 0 || result.length > max)
    throw new Error(
      `Check ${field}: ${optional ? "up to" : "1–"} ${max} characters allowed.`
    );
  return result;
}
function validatePuzzle(value) {
  const raw = record(value);
  if (typeof raw.error === "string") throw new Error(raw.error.slice(0, 250));
  if (!Array.isArray(raw.groups) || raw.groups.length !== 4)
    throw new Error("A shared puzzle needs four complete groups.");
  const words = /* @__PURE__ */ new Set();
  const groups = raw.groups.map((value2, index2) => {
    const group = record(value2);
    if (!Array.isArray(group.words) || group.words.length !== 4)
      throw new Error(`Group ${index2 + 1} needs exactly four words.`);
    const terms = group.words.map((word) => {
      const term = text(word, `group ${index2 + 1} word`, 24).normalize("NFC").toUpperCase();
      if (term.length > 24)
        throw new Error("Keep each word or phrase under 25 characters.");
      if (words.has(term))
        throw new Error(
          `“${term}” appears more than once. Each word needs its own place.`
        );
      words.add(term);
      return term;
    });
    return {
      id: `group-${index2 + 1}`,
      category: text(group.category, "category", 60),
      words: terms,
      clue: text(group.clue, "hint", 180),
      explanation: text(group.explanation, "explanation", 350),
      ...[
        "literal",
        "reverse",
        "fill-blank",
        "first-word",
        "last-word",
        "drop-first",
        "anagram"
      ].includes(String(group.rule)) ? { rule: group.rule } : {},
      ...group.sourceWords !== void 0 ? {
        sourceWords: (() => {
          if (!Array.isArray(group.sourceWords) || group.sourceWords.length !== 4)
            throw new Error(
              "A wordplay group needs four complete phrases."
            );
          return group.sourceWords.map(
            (value3) => text(value3, "wordplay phrase", 60)
          );
        })()
      } : {}
    };
  });
  return {
    id: "personal-puzzle",
    title: text(raw.title, "title", 80),
    topic: text(raw.topic, "topic", 80),
    description: text(raw.description, "description", 240),
    groups
  };
}
function parseGeneratedPuzzle(response) {
  if (response.length > 16e3)
    throw new Error("That response was too long. Try generating again.");
  const plain = response.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let data;
  try {
    data = JSON.parse(plain);
  } catch {
    throw new Error("AI didn't return a complete puzzle. Please try again.");
  }
  const puzzle = validatePuzzle(data);
  const followUpQuestion = cleanStoryQuestion(record(data).followUpQuestion);
  return { ...puzzle, ...followUpQuestion ? { followUpQuestion } : {} };
}
function validateChallenge(value) {
  const raw = record(value);
  if (raw.version !== 1)
    throw new Error(
      "This challenge format isn't supported. Ask for a new link."
    );
  if (raw.mode !== "relaxed" && raw.mode !== "challenge")
    throw new Error("This challenge has an invalid play mode.");
  if (raw.style !== "gift" && raw.style !== "together")
    throw new Error("This challenge has an invalid play style.");
  if (!["ai", "example", "edited"].includes(String(raw.source)))
    throw new Error("This challenge has an invalid source.");
  return {
    version: 1,
    puzzle: validatePuzzle(raw.puzzle),
    creator: text(raw.creator, "creator name", 40, true),
    recipient: text(raw.recipient, "friend's name", 40, true),
    note: text(raw.note, "personal note", 180, true),
    mode: raw.mode,
    style: raw.style,
    source: raw.source
  };
}
function makeChallenge(brief, puzzle, source) {
  var _a2, _b2;
  return validateChallenge({
    version: 1,
    puzzle,
    creator: brief.creator || ((_a2 = brief.people) == null ? void 0 : _a2.you) || "",
    recipient: brief.recipient || ((_b2 = brief.people) == null ? void 0 : _b2.partner) || "",
    note: brief.note,
    mode: brief.mode,
    style: brief.style,
    source
  });
}
const STORY_KEY = "common-thread-stories-v1";
function newProfile() {
  return {
    id: crypto.randomUUID(),
    name: "Our story",
    brief: { ...defaultBrief },
    updatedAt: Date.now()
  };
}
function parseProfile(value) {
  if (!value || typeof value !== "object")
    throw new Error("Choose a Common Thread story backup.");
  const raw = value;
  const input = raw.brief;
  if (!input || typeof input !== "object")
    throw new Error("This story backup is missing its answers.");
  const brief = { ...defaultBrief };
  if (input.playedConnections !== void 0)
    brief.playedConnections = parseHistory(input.playedConnections);
  brief.freshnessPrompt = parseFreshnessPrompt(input.freshnessPrompt);
  for (const [key, limit] of Object.entries({
    creator: 40,
    recipient: 40,
    note: 180,
    interests: 2e3,
    topic: 500,
    notes: 12e3,
    memories: 3e4,
    freeStory: 12e3,
    conversation: 12e3
  })) {
    if (input[key] !== void 0) {
      if (typeof input[key] !== "string" || input[key].length > limit)
        throw new Error("A story field is too long or invalid.");
      Object.assign(brief, { [key]: input[key] });
    }
  }
  for (const [key, choices] of Object.entries({
    style: ["gift", "together"],
    purpose: ["fun", "study"],
    personalization: ["mix", "memories-only"],
    difficulty: ["easy", "balanced", "tricky"],
    familiarity: ["new", "familiar"],
    mode: ["relaxed", "challenge"],
    inputMode: ["guided", "free"]
  })) {
    if (choices.includes(String(input[key])))
      Object.assign(brief, { [key]: input[key] });
  }
  if (input.people !== void 0) {
    const people = input.people;
    if (!people || typeof people.you !== "string" || people.you.length > 40 || typeof people.partner !== "string" || people.partner.length > 40)
      throw new Error("Check the conversation participants' names.");
    brief.people = { you: people.you, partner: people.partner };
  }
  if (input.storyAnswers !== void 0) {
    if (!Array.isArray(input.storyAnswers) || input.storyAnswers.length > 4 || input.storyAnswers.some((v) => typeof v !== "string" || v.length > 3e3))
      throw new Error("This story has invalid answers.");
    brief.storyAnswers = input.storyAnswers;
  }
  if (input.extraAnswers !== void 0) {
    if (!Array.isArray(input.extraAnswers) || input.extraAnswers.length > 8 || input.extraAnswers.some(
      (v) => !v || typeof v.question !== "string" || v.question.length > 180 || typeof v.answer !== "string" || v.answer.length > 3e3
    ))
      throw new Error("This story has invalid follow-up answers.");
    brief.extraAnswers = input.extraAnswers.map((v) => ({
      question: v.question,
      answer: v.answer
    }));
  }
  if (Array.isArray(input.usedTerms))
    brief.usedTerms = input.usedTerms.filter((v) => typeof v === "string" && v.length <= 24).slice(-320);
  return {
    id: typeof raw.id === "string" && raw.id.length <= 80 ? raw.id : crypto.randomUUID(),
    name: typeof raw.name === "string" ? raw.name.slice(0, 80) : "Our story",
    brief,
    updatedAt: typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : Date.now()
  };
}
function readLibrary() {
  try {
    const text2 = localStorage.getItem(STORY_KEY);
    if (text2 && text2.length < 3e6) {
      const raw = JSON.parse(text2);
      const profiles = raw.profiles.slice(0, 20).map(parseProfile);
      if (profiles.length)
        return {
          activeId: profiles.some((p) => p.id === raw.activeId) ? raw.activeId : profiles[0].id,
          profiles
        };
    }
  } catch {
  }
  const profile = newProfile();
  return { activeId: profile.id, profiles: [profile] };
}
function recordPlayedGroups(storyId, groups) {
  const library = readLibrary();
  const profile = library.profiles.find((item) => item.id === storyId);
  if (!profile) return false;
  const history2 = profile.brief.playedConnections || [];
  const next = rememberConnections(history2, groups);
  if (JSON.stringify(next) === JSON.stringify(history2)) return true;
  profile.brief.playedConnections = next;
  profile.updatedAt = Math.max(Date.now(), profile.updatedAt + 1);
  try {
    localStorage.setItem(STORY_KEY, JSON.stringify(library));
    return true;
  } catch {
    return false;
  }
}
function StoryLibraryControls({
  profiles,
  current,
  onSelect,
  onNew,
  onRename,
  onImport,
  status
}) {
  const [message, setMessage] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  async function cloud(action) {
    setBusy(true);
    setMessage("");
    try {
      const data = await hostedOperation(
        action,
        action === "save-story" ? current : { id: current.id }
      );
      if (action === "load-story") {
        const result = data;
        if (!Array.isArray(result.profiles) || !result.profiles.length)
          throw new Error(
            "No cloud story yet. Save this story to private cloud first."
          );
        const choices = result.profiles.map(parseProfile);
        for (const profile of choices.reverse()) onImport(profile);
        setMessage("Cloud stories loaded. Choose one above to continue.");
      } else {
        const saved = data.profile;
        if (saved) onImport(parseProfile(saved));
        setMessage("Saved across your computers.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Couldn't connect to story storage."
      );
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, ...current }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "common-thread-story.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "creator-panel story-library", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Saved stories & backups" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Saved stories", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Your living stories" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Keep your answers, add new memories, and make another puzzle without starting over." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
        "Saved story",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: current.id,
            onChange: (event) => onSelect(event.target.value),
            children: profiles.map((profile) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: profile.id, children: profile.name }, profile.id))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
        "Story name",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: current.name,
            maxLength: 80,
            onChange: (event) => onRename(event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("output", { className: "field-help", children: status }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "secondary-button",
            disabled: busy,
            onClick: () => void cloud("load-story"),
            children: "Load private cloud stories"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "secondary-button",
            disabled: busy,
            onClick: () => void cloud("save-story"),
            children: "Save to private cloud"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-button", onClick: onNew, children: "Start another story" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-button", onClick: download, children: "Download story backup" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
        "Import story backup",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "file",
            accept: "application/json,.json",
            onChange: async (event) => {
              var _a2;
              const file = (_a2 = event.target.files) == null ? void 0 : _a2[0];
              if (!file) return;
              try {
                if (file.size > 3e5)
                  throw new Error("That backup is too large.");
                onImport(parseProfile(JSON.parse(await file.text())));
                setMessage("Story imported. Your answers are ready.");
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Couldn't import that story."
                );
              }
              event.target.value = "";
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "Browser saving stays on this device and site address. Private cloud saving works across computers. Backups contain your personal answers; keep them private." }),
      message && /* @__PURE__ */ jsxRuntimeExports.jsx("output", { className: "field-help", children: message })
    ] })
  ] });
}
const storyQuestions = [
  "How did you meet, or what's an early memory you share?",
  "Which places mean something to you both?",
  "What do you both get excited about or do together?",
  "Any little details only you two would recognize?"
];
const storyHints = [
  "A first hangout, the month you met, or something funny that happened.",
  "Hometowns, a favorite trip, or somewhere you've lived. Tell us why each place matters.",
  "Games, meals, hobbies, shows, or a favorite weekend routine.",
  "An inside joke, a nickname's origin, the weather on a special day, or a small tradition."
];
function storyNotes(answers, extra = []) {
  return [
    ...storyQuestions.map((question, index2) => ({
      question,
      answer: answers[index2] || ""
    })),
    ...extra
  ].flatMap(({ question, answer: value }) => {
    const answer = value.trim();
    return answer ? [`${question}
${answer}`] : [];
  }).join("\n\n");
}
function StoryQuestions({
  answers,
  onChange,
  extraAnswers = [],
  onExtraChange
}) {
  const prompts = [
    ...storyQuestions,
    ...extraAnswers.map((item) => item.question)
  ];
  const values = [
    ...storyQuestions.map((_, index2) => answers[index2] || ""),
    ...extraAnswers.map((item) => item.answer)
  ];
  const [question, setQuestion] = reactExports.useState(
    () => answers.some((value) => value.trim()) ? prompts.length : 0
  );
  const [customQuestion, setCustomQuestion] = reactExports.useState("");
  const [quiet, setQuiet] = reactExports.useState(false);
  const transcript = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a2;
    if (quiet) (_a2 = transcript.current) == null ? void 0 : _a2.focus();
  }, [quiet]);
  const heading = reactExports.useRef(null);
  const moved = reactExports.useRef(false);
  reactExports.useEffect(() => {
    var _a2;
    if (moved.current) (_a2 = heading.current) == null ? void 0 : _a2.focus();
    moved.current = true;
  }, [question]);
  function answer(value) {
    if (question >= 4) {
      onExtraChange == null ? void 0 : onExtraChange(
        extraAnswers.map(
          (item, index2) => index2 === question - 4 ? { ...item, answer: value } : item
        )
      );
      return;
    }
    onChange(
      storyQuestions.map(
        (_, index2) => index2 === question ? value : answers[index2] || ""
      )
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "story-questions", "aria-label": "Your shared story", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { ref: heading, tabIndex: -1, children: question < prompts.length ? `A little about you two · ${question + 1} of ${prompts.length}` : "Your story so far" }),
    question < prompts.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "A few words or a short list is enough. Every question is optional." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "story-answer", children: prompts[question] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "story-answer-help", className: "field-help", children: storyHints[question] || "Add names or details you both recognize. You can skip this or return later." }),
      !quiet && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Dictation,
        {
          primary: true,
          value: values[question] || "",
          onChange: answer,
          maxLength: 3e3
        },
        question
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "text-button",
          onClick: () => setQuiet(!quiet),
          children: quiet ? "Use microphone instead" : "Type quietly instead"
        }
      ),
      quiet && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "Keeping it a surprise? Names and short lists work—no full sentences needed. Your answers save as you go." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          ref: transcript,
          id: "story-answer",
          "aria-describedby": "story-answer-help",
          value: values[question] || "",
          maxLength: 3e3,
          rows: 3,
          placeholder: quiet ? "Just the details you remember…" : "Your words appear here. You can also type or edit.",
          onChange: (event) => answer(event.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "field-help", children: [
        (values[question] || "").length,
        "/3,000 characters"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-actions", children: [
        question > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "text-button",
            onClick: () => setQuestion(question - 1),
            children: "Previous question"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "secondary-button",
            onClick: () => setQuestion(question + 1),
            children: question === prompts.length - 1 ? "Review my answers" : "Next question"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "text-button",
            onClick: () => {
              answer("");
              setQuestion(question + 1);
            },
            children: "Skip this question"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "story-review-details", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { children: [
          "Review saved answers (",
          values.filter((value) => value.trim()).length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "story-review", children: prompts.map((prompt, index2) => {
          var _a2;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: prompt }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: ((_a2 = values[index2]) == null ? void 0 : _a2.trim()) || "Skipped" })
          ] }, prompt);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "text-button",
          onClick: () => setQuestion(0),
          children: "Edit my story answers"
        }
      ),
      !answers.some((value) => value.trim()) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "No memories added. We'll use your shared interests for a themed puzzle." }),
      onExtraChange && extraAnswers.length < 8 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "story-followup", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Add a new memory" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Add a detail when you feel like it. Your earlier answers stay saved." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "secondary-button",
            onClick: () => {
              const options = [
                "Which restaurants or foods are part of your story? Name a few favorites.",
                "Who are the family members or friends you both know, and how are they connected?",
                "Which shows, films, or games have you enjoyed together?",
                "What places have you lived in or visited, and what happened there?",
                "What nicknames, sayings, or inside jokes do you share?",
                "What new memory would you like to add today?",
                "What traditions or celebrations do you share?",
                "What hobbies or plans are you looking forward to together?"
              ];
              const next = options.find(
                (prompt) => !prompts.includes(prompt)
              );
              if (next) {
                onExtraChange([
                  ...extraAnswers,
                  { question: next, answer: "" }
                ]);
                setQuestion(prompts.length);
              }
            },
            children: "Ask me another question"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
          "Or add your own question",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: customQuestion,
              maxLength: 180,
              onChange: (event) => setCustomQuestion(event.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "text-button",
            disabled: !customQuestion.trim() || prompts.includes(customQuestion.trim()),
            onClick: () => {
              onExtraChange([
                ...extraAnswers,
                { question: customQuestion.trim(), answer: "" }
              ]);
              setQuestion(prompts.length);
              setCustomQuestion("");
            },
            children: "Add my question"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "People, places, favorites—short lists work. You can add more later." })
  ] });
}
function generationErrorMessage(error) {
  if (!(error instanceof Error)) return "Please try again in a moment.";
  if (error.message.includes("A displayed term didn't match its source"))
    return "Claude's draft changed a word in a way we couldn't verify, so we didn't use that board. Your story is saved—you don't need to edit it. Press Make our puzzle to try a fresh board.";
  if (error.message.includes("CANISTER_ID_BACKEND"))
    return "This local preview isn't connected to the Caffeine backend. You can try the example below and test live generation after importing into Caffeine.";
  return error.message.length < 1e3 ? error.message : "Please try again in a moment.";
}
function generationRequest(brief) {
  var _a2, _b2, _c2, _d2;
  const people = {
    you: (brief.creator || ((_a2 = brief.people) == null ? void 0 : _a2.you) || "").trim(),
    partner: (brief.recipient || ((_b2 = brief.people) == null ? void 0 : _b2.partner) || "").trim()
  };
  return {
    purpose: brief.purpose,
    interests: brief.interests.trim(),
    topic: brief.topic.trim(),
    notes: brief.purpose === "study" ? brief.notes.trim() : brief.storyAnswers ? [
      storyNotes(brief.storyAnswers, brief.extraAnswers),
      brief.freeStory || "",
      brief.conversation ? `Reviewed conversation:
${brief.conversation}` : ""
    ].filter(Boolean).join("\n\n").trim() : [
      brief.memories || "",
      ((_c2 = brief.extraAnswers) == null ? void 0 : _c2.length) ? storyNotes([], brief.extraAnswers) : "",
      brief.freeStory || "",
      brief.conversation ? `Reviewed conversation:
${brief.conversation}` : ""
    ].filter(Boolean).join("\n\n").trim(),
    difficulty: brief.difficulty,
    familiarity: brief.familiarity,
    personalization: brief.personalization || "memories-only",
    usedTerms: brief.usedTerms || [],
    ...((_d2 = brief.playedConnections) == null ? void 0 : _d2.length) ? {
      playedConnections: brief.playedConnections.slice(-40).map((item) => ({
        category: item.category,
        words: underlyingWords(item),
        rule: item.rule
      }))
    } : {},
    ...brief.purpose === "fun" && (people.you || people.partner) ? { people } : {}
  };
}
async function generatePuzzle(brief, story) {
  return parseGeneratedPuzzle(
    await hostedGeneration({ ...generationRequest(brief), story })
  );
}
function encodeChallenge(challenge) {
  const clean = validateChallenge(challenge);
  const bytes = new TextEncoder().encode(JSON.stringify(clean));
  const code = btoa(
    Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")
  ).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  if (code.length > 2e4)
    throw new Error(
      "This challenge is too long to share. Shorten its explanations or note."
    );
  return code;
}
function decodeChallenge(input) {
  let code = input.trim();
  if (code.includes("#thread=")) code = code.split("#thread=")[1];
  else if (code.startsWith("thread=")) code = code.slice(7);
  if (!code || code.length > 2e4 || !/^[A-Za-z0-9_-]+$/.test(code))
    throw new Error(
      "That challenge code doesn't look complete. Ask your friend for a fresh copy."
    );
  try {
    const binary = atob(code.replaceAll("-", "+").replaceAll("_", "/"));
    const json = new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(binary, (char) => char.charCodeAt(0))
    );
    return validateChallenge(JSON.parse(json));
  } catch (error) {
    if (error instanceof Error && /group|word|category|characters|format|source|style|mode|hint|explanation|title|topic|note/i.test(
      error.message
    ))
      throw error;
    throw new Error(
      "That challenge couldn't be read. Ask your friend for a fresh copy."
    );
  }
}
function challengeLink(challenge, base = window.location.href) {
  const url = new URL(base);
  url.hash = `thread=${encodeChallenge(challenge)}`;
  return url.toString();
}
function mergeBriefs(primary, secondary) {
  const text2 = (a, b) => !a ? b || "" : !b || a.includes(b) ? a : b.includes(a) ? b : a;
  const result = { ...secondary, ...primary };
  for (const key of ["memories", "freeStory", "conversation", "notes"]) if (primary[key] !== void 0 || secondary[key] !== void 0) result[key] = text2(primary[key], secondary[key]);
  if (primary.storyAnswers || secondary.storyAnswers) result.storyAnswers = Array.from({ length: 4 }, (_, i) => {
    var _a2, _b2;
    return text2((_a2 = primary.storyAnswers) == null ? void 0 : _a2[i], (_b2 = secondary.storyAnswers) == null ? void 0 : _b2[i]);
  });
  if (primary.extraAnswers || secondary.extraAnswers) {
    const answers = /* @__PURE__ */ new Map();
    for (const item of [...primary.extraAnswers || [], ...secondary.extraAnswers || []]) {
      const key = item.question.trim().toLowerCase();
      const existing = answers.get(key);
      answers.set(key, existing ? { ...existing, answer: text2(existing.answer, item.answer) } : { ...item });
    }
    if (answers.size > 8) throw new Error("Both story copies are kept on your devices. Download a backup before combining more than eight extra answers.");
    result.extraAnswers = [...answers.values()];
  }
  const history2 = [...secondary.playedConnections || [], ...primary.playedConnections || []];
  if (history2.length) {
    const key = (item) => `${item.rule}|${(item.sourceWords || item.words).map((w) => w.normalize("NFC").toLowerCase()).sort().join("|")}`;
    result.playedConnections = [...new Map(history2.map((item) => [key(item), item])).values()].slice(-80);
  }
  if (primary.usedTerms || secondary.usedTerms) result.usedTerms = [.../* @__PURE__ */ new Set([...secondary.usedTerms || [], ...primary.usedTerms || []])].slice(-320);
  return result;
}
const storyContent = (profile) => JSON.stringify([profile.name, profile.brief]);
const hasStory = (profile) => {
  var _a2, _b2, _c2, _d2, _e2;
  return Boolean(
    ((_a2 = profile.brief.storyAnswers) == null ? void 0 : _a2.some((a) => a.trim())) || ((_b2 = profile.brief.extraAnswers) == null ? void 0 : _b2.some((a) => a.answer.trim())) || ((_c2 = profile.brief.freeStory) == null ? void 0 : _c2.trim()) || ((_d2 = profile.brief.memories) == null ? void 0 : _d2.trim()) || profile.brief.notes.trim() || ((_e2 = profile.brief.conversation) == null ? void 0 : _e2.trim())
  );
};
function mergeProfile(local, cloud) {
  const [primary, secondary] = local.updatedAt >= cloud.updatedAt ? [local, cloud] : [cloud, local];
  return {
    ...primary,
    brief: mergeBriefs(primary.brief, secondary.brief),
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt)
  };
}
function mergeCloudLibrary(local, remote) {
  const profiles = [...local.profiles];
  for (const cloud of remote) {
    const index2 = profiles.findIndex((p) => p.id === cloud.id);
    if (index2 < 0) profiles.push(cloud);
    else profiles[index2] = mergeProfile(profiles[index2], cloud);
  }
  if (profiles.length > 20)
    throw new Error(
      "Your copies are kept on each device. Download a backup before combining more than 20 stories."
    );
  const active = profiles.find((p) => p.id === local.activeId);
  const newest = remote.filter(hasStory).sort((a, b) => b.updatedAt - a.updatedAt)[0];
  return {
    profiles,
    activeId: active && hasStory(active) ? active.id : (newest == null ? void 0 : newest.id) || local.activeId
  };
}
function useStorySync(library, setLibrary, enabled = true) {
  const latest = reactExports.useRef(library);
  latest.current = library;
  const known = reactExports.useRef(/* @__PURE__ */ new Map());
  const hydrated = reactExports.useRef(false);
  const loading = reactExports.useRef(false);
  const saving = reactExports.useRef(false);
  const mounted = reactExports.useRef(true);
  const [saveTick, setSaveTick] = reactExports.useState(0);
  const [connected, setConnected] = reactExports.useState(isStoryConnected);
  const [message, setMessage] = reactExports.useState(
    "Saved on this device. Connect your story to use it on another computer."
  );
  async function load() {
    if (!enabled || !isStoryConnected() || loading.current || saving.current)
      return;
    loading.current = true;
    try {
      const data = await hostedOperation("load-story", {}, true);
      if (!Array.isArray(data.profiles))
        throw new Error(
          "Your cloud story couldn't be read. Your local answers are kept."
        );
      const profiles = data.profiles.map(parseProfile);
      for (const p of profiles) known.current.set(p.id, storyContent(p));
      if (!mounted.current) return;
      mergeCloudLibrary(latest.current, profiles);
      setLibrary((current) => {
        const next = mergeCloudLibrary(current, profiles);
        return JSON.stringify(current) === JSON.stringify(next) ? current : next;
      });
      hydrated.current = true;
      setSaveTick((value) => value + 1);
      setMessage(
        "Story connected. Changes sync automatically across your computers."
      );
    } catch (error) {
      if (mounted.current)
        setMessage(
          error instanceof Error ? error.message : "Couldn't sync. Your answers are saved on this device."
        );
    } finally {
      loading.current = false;
    }
  }
  async function save() {
    if (!enabled || !hydrated.current || !isStoryConnected() || loading.current || saving.current)
      return;
    saving.current = true;
    let completed = false;
    try {
      while (mounted.current && isStoryConnected()) {
        const changed = latest.current.profiles.filter(
          (p) => hasStory(p) && known.current.get(p.id) !== storyContent(p)
        );
        if (!changed.length) break;
        setMessage("Saving your story across computers…");
        for (const profile of changed) {
          const data = await hostedOperation("save-story", profile, true);
          const saved = data.profile ? parseProfile(data.profile) : profile;
          known.current.set(profile.id, storyContent(saved));
          if (!mounted.current) return;
          mergeCloudLibrary(latest.current, [saved]);
          setLibrary((current) => {
            const next = mergeCloudLibrary(current, [saved]);
            return JSON.stringify(current) === JSON.stringify(next) ? current : next;
          });
          if (storyContent(profile) === storyContent(saved))
            known.current.set(profile.id, storyContent(profile));
        }
        break;
      }
      completed = true;
      if (mounted.current) setMessage("Saved across your computers.");
    } catch (error) {
      if (mounted.current)
        setMessage(
          error instanceof Error ? error.message : "Couldn't sync. Your answers are saved on this device."
        );
    } finally {
      saving.current = false;
      if (completed && mounted.current && latest.current.profiles.some(
        (p) => hasStory(p) && known.current.get(p.id) !== storyContent(p)
      ))
        setSaveTick((value) => value + 1);
    }
  }
  reactExports.useEffect(() => {
    mounted.current = true;
    if (!enabled) return;
    const change = () => {
      const ready = isStoryConnected();
      setConnected(ready);
      if (ready) void load();
      else {
        hydrated.current = false;
        setMessage(
          "Saved on this device. Reconnect your story to sync across computers."
        );
      }
    };
    change();
    window.addEventListener(CONNECTION_EVENT, change);
    const poll = setInterval(() => void load(), 2e4);
    window.addEventListener("focus", load);
    return () => {
      mounted.current = false;
      clearInterval(poll);
      window.removeEventListener(CONNECTION_EVENT, change);
      window.removeEventListener("focus", load);
    };
  }, [enabled]);
  reactExports.useEffect(() => {
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
          error instanceof Error ? error.message : "Couldn't connect your story."
        );
      }
    }
  };
}
function Creator({ onHome, onPlay }) {
  var _a2, _b2, _c2, _d2, _e2, _f2;
  const [library, setLibrary] = reactExports.useState(readLibrary);
  const sync = useStorySync(library, setLibrary);
  const currentStory = library.profiles.find((profile) => profile.id === library.activeId) || library.profiles[0];
  const brief = currentStory.brief;
  const activeStory = reactExports.useRef(currentStory.id);
  activeStory.current = currentStory.id;
  const [saveStatus, setSaveStatus] = reactExports.useState("Saving on this device…");
  function setBrief(update2) {
    setLibrary((current) => ({
      ...current,
      profiles: current.profiles.map(
        (profile) => profile.id === current.activeId ? {
          ...profile,
          brief: typeof update2 === "function" ? update2(profile.brief) : update2,
          updatedAt: Math.max(Date.now(), profile.updatedAt + 1)
        } : profile
      )
    }));
  }
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(STORY_KEY, JSON.stringify(library));
      setSaveStatus("Saved automatically on this device.");
    } catch {
      setSaveStatus(
        "Browser saving is unavailable. Download a backup or save to private cloud to keep these answers."
      );
    }
  }, [library]);
  const [draft, setDraft] = reactExports.useState(null);
  const [source, setSource] = reactExports.useState("ai");
  const [pending, setPending] = reactExports.useState(false);
  const pendingRef = reactExports.useRef(false);
  const [error, setError] = reactExports.useState("");
  const [shared, setShared] = reactExports.useState(null);
  const heading = reactExports.useRef(null);
  const generateButton = reactExports.useRef(null);
  const hasDraft = draft !== null;
  const hasShared = shared !== null;
  reactExports.useEffect(() => {
    var _a3;
    (_a3 = heading.current) == null ? void 0 : _a3.focus();
  }, [hasDraft, hasShared]);
  function update(key, value) {
    setBrief((current) => ({ ...current, [key]: value }));
  }
  async function generateWith(requestBrief, story, offerQuestion = true) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError("");
    try {
      const puzzle = await generatePuzzle(requestBrief, {
        ...story,
        brief: requestBrief
      });
      const allFamiliar = requestBrief.purpose === "fun" && familiarCount(puzzle, requestBrief.playedConnections) === puzzle.groups.length;
      const forStory = storyKey(requestBrief);
      setLibrary((current) => ({
        ...current,
        profiles: current.profiles.map(
          (profile) => {
            var _a3, _b3;
            return profile.id !== story.id ? profile : {
              ...profile,
              updatedAt: Math.max(Date.now(), profile.updatedAt + 1),
              brief: {
                ...profile.brief,
                usedTerms: [
                  .../* @__PURE__ */ new Set([
                    ...profile.brief.usedTerms || [],
                    ...puzzle.groups.flatMap((group) => group.words)
                  ])
                ].slice(-320),
                freshnessPrompt: allFamiliar && offerQuestion ? ((_a3 = profile.brief.freshnessPrompt) == null ? void 0 : _a3.forStory) === forStory ? profile.brief.freshnessPrompt : {
                  question: puzzle.followUpQuestion || nextFreshQuestion(requestBrief),
                  forStory,
                  dismissed: false,
                  answer: ""
                } : ((_b3 = profile.brief.freshnessPrompt) == null ? void 0 : _b3.forStory) === forStory && profile.brief.freshnessPrompt.dismissed ? profile.brief.freshnessPrompt : void 0
              }
            };
          }
        )
      }));
      if (activeStory.current === story.id) {
        setDraft(puzzle);
        setSource("ai");
      }
    } catch (error2) {
      if (error2 instanceof StoryQuestionError && requestBrief.purpose === "fun") {
        const forStory = storyKey(requestBrief);
        const question = error2.question || nextFreshQuestion(requestBrief);
        setLibrary((current) => ({
          ...current,
          profiles: current.profiles.map(
            (profile) => {
              var _a3;
              return profile.id !== story.id ? profile : {
                ...profile,
                updatedAt: Math.max(Date.now(), profile.updatedAt + 1),
                brief: {
                  ...profile.brief,
                  freshnessPrompt: {
                    question,
                    forStory,
                    dismissed: false,
                    answer: ((_a3 = profile.brief.freshnessPrompt) == null ? void 0 : _a3.forStory) === forStory && profile.brief.freshnessPrompt.question === question ? profile.brief.freshnessPrompt.answer : ""
                  }
                }
              };
            }
          )
        }));
      } else if (activeStory.current === story.id)
        setError(generationErrorMessage(error2));
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }
  function generate() {
    return generateWith(brief, currentStory);
  }
  const freshnessPrompt = brief.purpose === "fun" && ((_a2 = brief.freshnessPrompt) == null ? void 0 : _a2.forStory) === storyKey(brief) && !brief.freshnessPrompt.dismissed ? brief.freshnessPrompt : void 0;
  function saveFreshMemory() {
    if (!freshnessPrompt || pendingRef.current) return;
    try {
      const next = addFreshMemory(
        brief,
        freshnessPrompt.question,
        freshnessPrompt.answer
      );
      setBrief(next);
      void generateWith(
        next,
        {
          ...currentStory,
          brief: next,
          updatedAt: Math.max(Date.now(), currentStory.updatedAt + 1)
        },
        false
      );
    } catch (error2) {
      setError(generationErrorMessage(error2));
    }
  }
  const freshQuestion = freshnessPrompt && /* @__PURE__ */ jsxRuntimeExports.jsx(
    FreshnessQuestion,
    {
      prompt: freshnessPrompt,
      pending,
      error,
      returnFocus: generateButton,
      onAnswer: (answer) => {
        setError("");
        update("freshnessPrompt", { ...freshnessPrompt, answer });
      },
      onSave: saveFreshMemory,
      onSkip: () => {
        setError("");
        update("freshnessPrompt", { ...freshnessPrompt, dismissed: true });
      }
    }
  );
  function useExample() {
    const original = puzzles[brief.purpose === "study" ? 1 : 0];
    setDraft(
      validatePuzzle({
        ...original,
        title: `Example: ${original.title}`,
        description: "An example puzzle to explore the creator. This board wasn't generated from your answers."
      })
    );
    setSource("example");
    setError("");
  }
  function editGroup(index2, next) {
    setDraft(
      (current) => current && {
        ...current,
        groups: current.groups.map(
          (group, i) => i === index2 ? group.words.join("|") !== next.words.join("|") ? { ...next, rule: "literal", sourceWords: void 0 } : next : group
        )
      }
    );
    setSource((current) => current === "example" ? "example" : "edited");
  }
  function finish() {
    setError("");
    try {
      if (draft) setShared(makeChallenge(brief, draft, source));
    } catch (error2) {
      setError(
        error2 instanceof Error ? error2.message : "Check this puzzle before sharing."
      );
    }
  }
  const hasStory2 = Boolean(
    ((_b2 = brief.storyAnswers) == null ? void 0 : _b2.some((answer) => answer.trim())) || ((_c2 = brief.extraAnswers) == null ? void 0 : _c2.some((item) => item.answer.trim())) || ((_d2 = brief.memories) == null ? void 0 : _d2.trim()) || ((_e2 = brief.freeStory) == null ? void 0 : _e2.trim()) || ((_f2 = brief.conversation) == null ? void 0 : _f2.trim())
  );
  const canGenerate = (brief.interests.trim().length > 0 || brief.topic.trim().length > 0 || hasStory2) && (brief.purpose !== "study" || brief.topic.trim().length > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "creator-page", "aria-labelledby": "creator-title", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-button", type: "button", onClick: onHome, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
      " Home"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-heading", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "eyebrow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14 }),
        " MADE PERSONAL"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { id: "creator-title", ref: heading, tabIndex: -1, children: shared ? "A little challenge, ready to send." : draft ? brief.style === "together" ? "Keep a little mystery." : "Your puzzle. Your finishing touch." : "Make it personal." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: shared ? "Send the link yourself, or copy a challenge code. No account needed to solve it." : draft ? brief.style === "together" ? "The connections are hidden so you can discover them together." : "AI does the heavy lifting. You get the final say." : "A little about you. Then a puzzle to play." })
    ] }),
    !draft && !shared && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "field-help", "aria-live": "polite", children: [
      sync.message || saveStatus,
      !sync.connected && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "text-button",
          type: "button",
          onClick: sync.connect,
          children: "Connect saved story"
        }
      )
    ] }),
    !draft && !shared && /* @__PURE__ */ jsxRuntimeExports.jsx(
      StoryLibraryControls,
      {
        profiles: library.profiles,
        current: currentStory,
        status: saveStatus,
        onSelect: (id) => {
          setLibrary((current) => ({ ...current, activeId: id }));
          setError("");
        },
        onNew: () => {
          const profile = newProfile();
          setLibrary((current) => ({
            activeId: profile.id,
            profiles: [...current.profiles, profile].slice(-20)
          }));
          setError("");
        },
        onRename: (name) => setLibrary((current) => ({
          ...current,
          profiles: current.profiles.map(
            (profile) => profile.id === current.activeId ? {
              ...profile,
              name,
              updatedAt: Math.max(Date.now(), profile.updatedAt + 1)
            } : profile
          )
        })),
        onImport: (profile) => {
          setLibrary((current) => {
            const local = current.profiles.find(
              (item) => item.id === profile.id
            );
            return {
              activeId: profile.id,
              profiles: [
                ...current.profiles.filter((item) => item.id !== profile.id),
                local ? mergeProfile(local, profile) : profile
              ].slice(-20)
            };
          });
          setError("");
        }
      }
    ),
    shared ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-panel share-panel", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { size: 28 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: shared.puzzle.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "For ",
        shared.recipient || "your friend",
        shared.creator ? `, from ${shared.creator}` : "",
        "."
      ] }),
      shared.source === "example" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "example-label", children: "Example puzzle · not AI-generated" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyField, { label: "Challenge link", value: challengeLink(shared) }),
      ["localhost", "127.0.0.1", "::1"].includes(
        window.location.hostname
      ) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "local-share-note", children: "This preview link opens on this computer. Once Common Thread is published, its links will work for friends too. You can use a challenge code in another copy of the app now." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Copy a challenge code instead" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CopyField, { label: "Challenge code", value: encodeChallenge(shared) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "primary-button",
            type: "button",
            onClick: () => onPlay(
              shared,
              brief.purpose === "fun" && shared.source !== "example" ? currentStory.id : void 0
            ),
            children: [
              shared.style === "together" ? "Start our puzzle" : "Test the puzzle",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16 })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "secondary-button",
            type: "button",
            onClick: () => setShared(null),
            children: "Back to preview"
          }
        )
      ] })
    ] }) : draft ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-panel", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `source-label ${source}`, children: source === "example" ? "EXAMPLE PUZZLE · NOT AI-GENERATED" : source === "edited" ? "AI DRAFT · EDITED BY YOU" : "AI-GENERATED DRAFT" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: brief.style === "together" ? "Your personal puzzle is ready." : draft.title }),
      brief.style === "gift" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: draft.description }),
      source !== "example" && familiarCount(draft, brief.playedConnections) >= 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "A familiar remix · some connections revisit your earlier games." }),
      brief.style === "gift" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "review-note", children: "You're the puzzle maker, so you'll see the answers. Check that each group makes sense, especially for study topics. Structural checks can't verify every fact or possible connection." }),
        draft.groups.map((group, index2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "details",
          {
            className: `group-editor group-color-${index2}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: group.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edit connection" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "preview-words", children: group.words.join(" · ") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "editor-fields", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                  "Category",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      value: group.category,
                      maxLength: 60,
                      onChange: (event) => editGroup(index2, {
                        ...group,
                        category: event.target.value
                      })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                  "Four words, separated by commas",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      value: group.words.join(", "),
                      maxLength: 110,
                      onChange: (event) => editGroup(index2, {
                        ...group,
                        words: event.target.value.split(",").map((word) => word.trim().toUpperCase())
                      })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                  "Hint",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      value: group.clue,
                      maxLength: 180,
                      onChange: (event) => editGroup(index2, {
                        ...group,
                        clue: event.target.value
                      })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                  "Why they connect",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: group.explanation,
                      maxLength: 350,
                      rows: 3,
                      onChange: (event) => editGroup(index2, {
                        ...group,
                        explanation: event.target.value
                      })
                    }
                  )
                ] })
              ] })
            ]
          },
          group.id
        ))
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surprise-panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 24 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Four connections. No spoilers." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Play side by side on one screen, or share the same board and compare notes. Each screen keeps its own progress." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Want to inspect or edit the answers first?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "text-button",
            type: "button",
            onClick: () => update("style", "gift"),
            children: "Switch to puzzle-maker preview"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "primary-button",
            type: "button",
            onClick: finish,
            disabled: pending,
            children: [
              "Use this puzzle",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16 })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "secondary-button",
            type: "button",
            onClick: generate,
            ref: generateButton,
            disabled: pending,
            children: pending ? "Making another…" : source === "example" ? "Generate from my answers" : "Try another puzzle"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "text-button",
            type: "button",
            disabled: pending,
            onClick: () => {
              setDraft(null);
              setError("");
            },
            children: "Change my answers"
          }
        )
      ] })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        className: "creator-panel",
        onSubmit: (event) => {
          event.preventDefault();
          if (canGenerate) void generate();
        },
        children: [
          brief.purpose === "fun" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            brief.inputMode === "free" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                "Tell your story",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    value: brief.freeStory || "",
                    maxLength: 12e3,
                    rows: 9,
                    onChange: (event) => update("freeStory", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "Paste everything you've already written or just talk. Up to 12,000 characters. Your guided answers stay saved and are used too." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Dictation,
                {
                  value: brief.freeStory || "",
                  maxLength: 12e3,
                  onChange: (value) => update("freeStory", value)
                }
              ),
              brief.conversation && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "creator-options", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Review imported conversation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                  "Saved conversation",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      rows: 8,
                      value: brief.conversation,
                      maxLength: 12e3,
                      onChange: (event) => update("conversation", event.target.value)
                    }
                  )
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              StoryQuestions,
              {
                answers: brief.storyAnswers || [],
                onChange: (answers) => update("storyAnswers", answers),
                extraAnswers: brief.extraAnswers || [],
                onExtraChange: (answers) => update("extraAnswers", answers)
              },
              currentStory.id
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "text-button",
                onClick: () => update(
                  "inputMode",
                  brief.inputMode === "free" ? "guided" : "free"
                ),
                children: brief.inputMode === "free" ? "Guide me with questions" : "Paste or speak freely"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              "What are they learning?",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: brief.topic,
                  maxLength: 500,
                  onChange: (event) => update("topic", event.target.value),
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              "Study notes ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "(optional, up to 12,000 characters)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  value: brief.notes,
                  maxLength: 12e3,
                  rows: 5,
                  onChange: (event) => update("notes", event.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Dictation,
              {
                value: brief.notes,
                onChange: (value) => update("notes", value),
                maxLength: 12e3
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorOptions, { brief, update }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "field-help", children: [
            brief.style === "together" ? "Answers stay hidden so you can play together." : "You'll review the answers before sharing.",
            " ",
            brief.mode === "challenge" ? "Four mistakes, no hints." : "Hints available, with no guess limit."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "primary-button",
              type: "submit",
              ref: generateButton,
              disabled: pending || !canGenerate,
              children: pending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 17, className: "loading-icon" }),
                " Finding your threads…"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 17 }),
                " Make our puzzle"
              ] })
            }
          ),
          !canGenerate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "Add a memory to start, or choose a theme in Puzzle options." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "Your puzzle will arrive here automatically." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "creator-example", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Try an example instead" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "text-button",
                type: "button",
                disabled: pending,
                onClick: useExample,
                children: "Explore the creator with an example puzzle"
              }
            )
          ] })
        ]
      }
    ),
    pending && /* @__PURE__ */ jsxRuntimeExports.jsx("output", { className: "creator-status", "aria-live": "polite", children: "Making your puzzle and checking its connections. You can stay here." }),
    error && !freshnessPrompt && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "form-error", role: "alert", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: error }) }),
    !shared && (!draft || source !== "example") && freshQuestion
  ] });
}
function FriendHub({
  onOpen
}) {
  const [code, setCode] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      className: "friend-hub compact-friends",
      "aria-label": "Open a friend’s puzzle",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "join-challenge", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Open a friend’s puzzle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: (event) => {
              event.preventDefault();
              setError("");
              try {
                onOpen(decodeChallenge(code));
              } catch (error2) {
                setError(
                  error2 instanceof Error ? error2.message : "That challenge couldn't be opened."
                );
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "friend-code", children: "Paste the puzzle link your friend sent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  id: "friend-code",
                  value: code,
                  maxLength: 22e3,
                  onChange: (event) => setCode(event.target.value),
                  rows: 3,
                  required: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "secondary-button", type: "submit", children: [
                "Open puzzle",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 15 })
              ] }),
              error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "form-error", role: "alert", children: error })
            ]
          }
        )
      ] })
    }
  );
}
function Invitation({
  challenge,
  onPlay,
  onHome
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: "creator-page invitation",
      "aria-labelledby": "invitation-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-button", type: "button", onClick: onHome, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
          " Home"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "invitation-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { size: 35 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: challenge.source === "example" ? "EXAMPLE FRIEND CHALLENGE" : "A PERSONAL PUZZLE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { id: "invitation-title", children: challenge.recipient ? `A thread for ${challenge.recipient}.` : "Someone thought of you." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "From ",
            challenge.creator || "a friend",
            ", with a little curiosity."
          ] }),
          challenge.note && /* @__PURE__ */ jsxRuntimeExports.jsx("blockquote", { children: challenge.note }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: challenge.puzzle.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: challenge.puzzle.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mode-label", children: challenge.mode === "relaxed" ? "Hints available · no guess limit" : "Four mistakes · no hints" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: "primary-button",
              type: "button",
              onClick: () => onPlay(challenge.mode),
              children: [
                challenge.style === "together" ? "Let's solve it together" : "Accept the challenge",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 17 })
              ]
            }
          ),
          challenge.mode === "challenge" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "text-button",
              type: "button",
              onClick: () => onPlay("relaxed"),
              children: "Play with hints instead"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "invitation-footnote", children: "A friendly puzzle, with no rankings. Solve side by side, or open the same puzzle on separate screens and compare notes. Progress isn't synced between screens." })
        ] })
      ]
    }
  );
}
const MISTAKE_LIMIT = 4;
function initialState() {
  return {
    selected: [],
    solved: [],
    guesses: [],
    mistakes: 0,
    hintLevel: 0,
    assisted: false,
    revealed: [],
    message: "Select four words to find a connection.",
    outcome: "playing"
  };
}
function remainingWords(puzzle, state) {
  return puzzle.groups.filter((group) => !state.solved.includes(group.id)).flatMap((group) => group.words);
}
function shuffleWords(words) {
  const result = [...words];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function hintFor(puzzle, state) {
  const group = puzzle.groups.find((entry) => !state.solved.includes(entry.id));
  if (!group || state.hintLevel === 0) return { text: "", anchors: [] };
  if (state.hintLevel === 1) return { text: group.clue, anchors: [] };
  if (state.hintLevel === 2)
    return {
      text: `Start with ${group.words[0]}. Find three words that share a connection with it.`,
      anchors: group.words.slice(0, 1)
    };
  return {
    text: `${group.words[0]} and ${group.words[1]} belong together. ${group.clue}`,
    anchors: group.words.slice(0, 2)
  };
}
function reduceGame(state, action, puzzle, mode) {
  if (state.outcome !== "playing") return state;
  switch (action.type) {
    case "toggle": {
      if (!remainingWords(puzzle, state).includes(action.word)) return state;
      if (state.selected.includes(action.word))
        return {
          ...state,
          selected: state.selected.filter((word) => word !== action.word)
        };
      if (state.selected.length === 4) return state;
      return { ...state, selected: [...state.selected, action.word] };
    }
    case "clear":
      return { ...state, selected: [] };
    case "hint":
      return mode === "challenge" ? state : {
        ...state,
        assisted: true,
        hintLevel: Math.min(3, state.hintLevel + 1)
      };
    case "reveal": {
      if (mode === "challenge") return state;
      const group = puzzle.groups.find(
        (entry) => !state.solved.includes(entry.id)
      );
      const solved = [...state.solved, group.id];
      return {
        ...state,
        selected: [],
        solved,
        assisted: true,
        revealed: [...state.revealed, group.id],
        hintLevel: 0,
        outcome: solved.length === puzzle.groups.length ? "won" : "playing",
        message: `${group.category} revealed. Read the explanation${solved.length === puzzle.groups.length ? "—all threads are now connected." : ", then try the next connection."}`
      };
    }
    case "submit": {
      if (state.selected.length !== 4) return state;
      const signature = [...state.selected].sort().join("|");
      if (state.guesses.includes(signature))
        return {
          ...state,
          message: "You already tried that group. Swap a word or clear your selection—no extra mistake counted."
        };
      const guesses = [...state.guesses, signature];
      const match = puzzle.groups.find(
        (group) => !state.solved.includes(group.id) && state.selected.every((word) => group.words.includes(word))
      );
      if (match) {
        const solved = [...state.solved, match.id];
        const won = solved.length === puzzle.groups.length;
        return {
          ...state,
          selected: [],
          solved,
          guesses,
          hintLevel: 0,
          outcome: won ? "won" : "playing",
          message: won ? "Every thread found. Nicely connected!" : `${match.category}—you found a thread! Read its explanation, then find another group.`
        };
      }
      const mistakes = state.mistakes + 1;
      const lost = mode === "challenge" && mistakes >= MISTAKE_LIMIT;
      const close = puzzle.groups.some(
        (group) => !state.solved.includes(group.id) && state.selected.filter((word) => group.words.includes(word)).length === 3
      );
      return {
        ...state,
        guesses,
        mistakes,
        outcome: lost ? "lost" : "playing",
        message: lost ? "This challenge is complete. Explore the connections below, then try another puzzle." : close && mode !== "challenge" ? "Almost—three of those words belong together. Try swapping one." : "That set doesn't share an intended connection. Try a different combination."
      };
    }
  }
}
function Game({
  puzzle,
  mode,
  onHome,
  onRestart,
  onNext,
  onRelaxed,
  personal = false,
  onConnectionsSeen,
  nextLabel,
  homeLabel = "Home"
}) {
  const [state, dispatch] = reactExports.useReducer(
    (current, action) => reduceGame(current, action, puzzle, mode),
    void 0,
    initialState
  );
  const [order, setOrder] = reactExports.useState(
    () => shuffleWords(puzzle.groups.flatMap((group) => group.words))
  );
  const [showRules, setShowRules] = reactExports.useState(false);
  const titleRef = reactExports.useRef(null);
  const resultRef = reactExports.useRef(null);
  const connectionRef = reactExports.useRef(null);
  const remaining = remainingWords(puzzle, state);
  const hint = hintFor(puzzle, state);
  const ended = state.outcome !== "playing";
  const tutorial = mode === "intro";
  const canHelp = mode !== "challenge";
  const reported = reactExports.useRef(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    if (!onConnectionsSeen) return;
    const visible = puzzle.groups.filter(
      (group) => (ended || state.solved.includes(group.id)) && !reported.current.has(group.id)
    );
    if (visible.length) {
      for (const group of visible) reported.current.add(group.id);
      onConnectionsSeen(visible);
    }
  }, [ended, state.solved, onConnectionsSeen, puzzle.groups]);
  reactExports.useEffect(() => {
    var _a2;
    (_a2 = titleRef.current) == null ? void 0 : _a2.focus();
  }, []);
  reactExports.useEffect(() => {
    var _a2;
    if (ended) (_a2 = resultRef.current) == null ? void 0 : _a2.focus();
  }, [ended]);
  reactExports.useEffect(() => {
    var _a2;
    if (state.solved.length > 0 && !ended) (_a2 = connectionRef.current) == null ? void 0 : _a2.focus();
  }, [state.solved.length, ended]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "game", "aria-labelledby": "game-title", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "game-nav", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-button", type: "button", onClick: onHome, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        " ",
        homeLabel
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mode-label ${mode}`, children: {
        intro: "Practice",
        relaxed: "With hints",
        challenge: "Four-mistake challenge"
      }[mode] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "text-button",
          type: "button",
          "aria-expanded": showRules,
          "aria-controls": "game-rules",
          onClick: () => setShowRules(!showRules),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleHelp, { size: 16 }),
            " Rules"
          ]
        }
      )
    ] }),
    showRules && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rules-panel", id: "game-rules", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Find groups of four related words." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Select four tiles, then choose “Check group.” Each word belongs to one intended group. Shuffle to get a fresh perspective.",
        " ",
        canHelp ? "Guesses are unlimited. Hints are optional and become more specific." : "Four incorrect groups end the challenge. Repeating a guess does not count again. There are no hints or timer.",
        " ",
        "Progress stays here while this round is open; leaving or refreshing starts a fresh round."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "game-heading", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: puzzle.topic }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { id: "game-title", ref: titleRef, tabIndex: -1, children: puzzle.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: puzzle.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "board-meta", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        state.solved.length,
        " of ",
        puzzle.groups.length,
        " threads connected"
      ] }),
      mode === "challenge" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: "mistakes",
          "aria-label": `${MISTAKE_LIMIT - state.mistakes} mistakes remaining`,
          children: [
            "Mistakes left",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: Array.from({ length: MISTAKE_LIMIT }, (_, index2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "i",
              {
                className: index2 < MISTAKE_LIMIT - state.mistakes ? "available" : "used"
              },
              `mistake-${index2 + 1}`
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: MISTAKE_LIMIT - state.mistakes })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tutorial ? "Practice freely" : "No rush. No guess limit." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "solved-groups", "aria-label": "Discovered connections", children: state.solved.map((id) => {
      const group = puzzle.groups.find((entry) => entry.id === id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "article",
        {
          ref: id === state.solved.at(-1) ? connectionRef : void 0,
          tabIndex: -1,
          "aria-labelledby": `connection-${id}`,
          className: `solved-group group-color-${puzzle.groups.indexOf(group)}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "solved-label", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }),
              state.revealed.includes(id) ? "GUIDED REVEAL" : "THREAD FOUND"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: `connection-${id}`, children: group.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "group-words", children: group.words.join(" · ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "explanation", children: group.explanation })
          ]
        },
        id
      );
    }) }),
    !ended && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("fieldset", { className: "word-board", "aria-label": "Words to connect", children: order.filter((word) => remaining.includes(word)).map((word) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: `word-tile ${state.selected.includes(word) ? "selected" : ""} ${hint.anchors.includes(word) ? "hint-anchor" : ""}`,
          "aria-pressed": state.selected.includes(word),
          "aria-describedby": hint.anchors.includes(word) ? "hint-message" : void 0,
          disabled: state.selected.length === 4 && !state.selected.includes(word),
          onClick: () => dispatch({ type: "toggle", word }),
          children: [
            word,
            hint.anchors.includes(word) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "anchor-dot", "aria-hidden": "true" })
          ]
        },
        word
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("output", { className: "selection-count", "aria-live": "polite", children: [
        state.selected.length,
        " of 4 selected"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("output", { className: "game-feedback", "aria-live": "polite", "aria-atomic": "true", children: state.message }),
    !ended && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "board-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "secondary-button",
            type: "button",
            onClick: () => setOrder(shuffleWords(order)),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { size: 16 }),
              " Shuffle"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "secondary-button",
            type: "button",
            disabled: state.selected.length === 0,
            onClick: () => dispatch({ type: "clear" }),
            children: [
              "Clear",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wide-label", children: " selection" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "primary-button check-button",
            type: "button",
            disabled: state.selected.length !== 4,
            onClick: () => dispatch({ type: "submit" }),
            children: [
              "Check group",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16 })
            ]
          }
        )
      ] }),
      canHelp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hint-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "text-button",
            type: "button",
            disabled: state.hintLevel >= 3,
            onClick: () => dispatch({ type: "hint" }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 17 }),
              state.hintLevel === 0 ? "I'd like a hint" : state.hintLevel < 3 ? "A little more help" : "All hints shown for this group"
            ]
          }
        ),
        state.hintLevel > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hint-message", id: "hint-message", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: ["", "A NUDGE", "AN ANCHOR", "A PAIR"][state.hintLevel] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("output", { className: "hint-text", "aria-live": "polite", children: hint.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "text-button",
              type: "button",
              onClick: () => dispatch({ type: "reveal" }),
              children: "Reveal and explain this group"
            }
          )
        ] })
      ] })
    ] }),
    ended && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `round-result ${state.outcome}`,
        ref: resultRef,
        tabIndex: -1,
        "aria-label": "Round result",
        children: [
          state.outcome === "won" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 26 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { size: 26 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: state.outcome === "lost" ? "There's a discovery in every try." : tutorial ? "You've got the idea." : "All connected." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: state.outcome === "lost" ? `You found ${state.solved.length} of ${puzzle.groups.length} threads. The remaining connections are below.` : tutorial ? puzzle.id === lessons[0].id ? "Now try a word that can point in more than one direction." : "Ready for a full puzzle? Hints are there when you need them." : `${puzzle.groups.length} threads connected. ${state.assisted ? "You explored with a little help." : state.mistakes ? `${state.mistakes} incorrect ${state.mistakes === 1 ? "guess" : "guesses"} along the way.` : "Without an incorrect guess!"} Take a discovery into your next puzzle.` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-actions", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "primary-button", type: "button", onClick: onNext, children: [
              tutorial ? puzzle.id === lessons[0].id ? "Try the next practice" : "Play with hints" : personal ? "Back to invitation" : nextLabel || "Next puzzle",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16 })
            ] }),
            !tutorial && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "secondary-button",
                type: "button",
                onClick: onRestart,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 16 }),
                  " Replay puzzle"
                ]
              }
            ),
            mode === "challenge" && state.outcome === "lost" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-button", type: "button", onClick: onRelaxed, children: "Play with hints" })
          ] }),
          personal && /* @__PURE__ */ jsxRuntimeExports.jsx(
            CopyField,
            {
              label: "Your result · copy and send it yourself",
              value: `Common Thread — ${puzzle.title}
${mode === "relaxed" ? "With hints" : "Four-mistake challenge"}: ${state.solved.length}/${puzzle.groups.length} threads connected.
${state.mistakes} incorrect guesses${state.assisted ? ", with hints or guided reveals" : ""}. ${state.outcome === "won" ? "All connected!" : "A discovery in every try."}`
            }
          )
        ]
      }
    ),
    state.outcome === "lost" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "answer-reveal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "The remaining threads" }),
      puzzle.groups.filter((group) => !state.solved.includes(group.id)).map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "article",
        {
          className: `solved-group group-color-${puzzle.groups.indexOf(group)}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "solved-label", children: "REVEALED CONNECTION" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: group.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "group-words", children: group.words.join(" · ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "explanation", children: group.explanation })
          ]
        },
        group.id
      ))
    ] }),
    tutorial && !ended && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "text-button skip-button",
        type: "button",
        onClick: onRelaxed,
        children: [
          "Skip practice and play",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 15 })
        ]
      }
    )
  ] });
}
const fact = (id, category, words, explanation, clue) => ({ id, category, words: words.split("|"), explanation, clue });
const blank = (id, category, words, fixedText, explanation, clue) => ({ ...fact(id, category, words, explanation, clue), rule: "fill-blank", fixedText });
const S = {
  presidents: { title: "Presidential biographies", url: "https://www.whitehousehistory.org/collections/president-biographies" },
  rushmore: { title: "Mount Rushmore: the four presidents", url: "https://www.nps.gov/moru/learn/historyculture/why-these-four-presidents.htm" },
  water: { title: "USGS Water Science School", url: "https://www.usgs.gov/water-science-school/science/water-science-glossary" },
  lakes: { title: "NOAA: the five Great Lakes", url: "https://oceanservice.noaa.gov/facts/great-lakes.html" },
  units: { title: "BIPM: SI base units", url: "https://www.bipm.org/en/measurement-units/si-base-units" },
  rights: { title: "National Archives: the Bill of Rights", url: "https://www.archives.gov/founding-docs/bill-of-rights-transcript" },
  planets: { title: "NASA: planets", url: "https://science.nasa.gov/solar-system/planets/" },
  geography: { title: "National Geographic: geography resources", url: "https://education.nationalgeographic.org/resource/geography/" },
  states: { title: "U.S. Census Bureau: states", url: "https://www.census.gov/library/reference/code-lists/ansi.html" }
};
const knowledgePacks = [
  { id: "world", name: "World Geography", summary: "Countries, capitals, oceans—and words hiding on the map.", sources: [S.geography], groups: [
    fact("capitals", "European capital cities", "PARIS|ROME|OSLO|VIENNA", "These are the capitals of France, Italy, Norway, and Austria, respectively.", "Think of seats of national government in Europe."),
    fact("islands", "Island countries in the Caribbean", "CUBA|JAMAICA|BARBADOS|GRENADA", "These are four independent island countries in the Caribbean; the region has many more.", "Look toward the Caribbean Sea."),
    fact("ranges", "Mountain ranges", "ANDES|ALPS|HIMALAYAS|PYRENEES", "The Andes are in South America, the Himalayas in Asia, and the Alps and Pyrenees in Europe.", "Think of chains of high peaks."),
    blank("land", "Country names ending in ___LAND", "ICE|IRE|FIN|THAI", "___LAND", "Add LAND to make ICELAND, IRELAND, FINLAND, and THAILAND. These tiles are only parts of the country names.", "A common ending turns these into countries."),
    blank("oceans", "___ Ocean", "PACIFIC|ATLANTIC|INDIAN|ARCTIC", "___ Ocean", "Complete Pacific Ocean, Atlantic Ocean, Indian Ocean, and Arctic Ocean. These are four of the five named oceans; the Southern Ocean is the fifth.", "Each completes the name of an ocean."),
    { ...fact("country-halves", "Map names beginning with New ___", "ZEALAND|CALEDONIA|GUINEA|BRITAIN", "Complete NEW ZEALAND, NEW CALEDONIA, NEW GUINEA, and NEW BRITAIN. These are a country, a French territory, and two islands, respectively. The shared missing word is NEW.", "One word begins all four geographical names."), rule: "last-word", sourceWords: ["NEW ZEALAND", "NEW CALEDONIA", "NEW GUINEA", "NEW BRITAIN"] },
    blank("south", "South ___ on the world map", "AFRICA|KOREA|SUDAN|AMERICA", "South ___", "South Africa, South Korea, and South Sudan are countries. South America is a continent. SOUTH completes all four names.", "One direction completes four familiar place names.")
  ] },
  { id: "usa", name: "U.S. Geography", summary: "States, lakes, capitals, and a few unexpected turns.", sources: [S.states, S.lakes], groups: [
    fact("lakes", "Four of the five Great Lakes", "SUPERIOR|MICHIGAN|HURON|ERIE", "These are four Great Lakes. Ontario is the fifth; this board does not list the complete set.", "Think of a connected freshwater system along the U.S.–Canada border."),
    fact("capitals", "U.S. state capitals", "BOISE|SALEM|ALBANY|AUSTIN", "Boise is Idaho’s capital, Salem is Oregon’s, Albany is New York’s, and Austin is Texas’s.", "These cities govern their states."),
    fact("parks", "U.S. national parks", "YOSEMITE|YELLOWSTONE|ACADIA|ZION", "These national parks are in California; Wyoming, Montana and Idaho; Maine; and Utah, respectively.", "Protected landscapes, from granite cliffs to desert canyons."),
    blank("new", "U.S. states: New ___", "YORK|JERSEY|MEXICO|HAMPSHIRE", "New ___", "Add NEW to get New York, New Jersey, New Mexico, and New Hampshire—the four U.S. states whose names begin with New.", "One three-letter word starts all four state names."),
    fact("codes", "U.S. postal abbreviations that are also words", "ME|IN|OR|HI", "ME means Maine, IN Indiana, OR Oregon, and HI Hawaii. Each of these four abbreviations is also an English word; many other state codes are not words.", "Read these as two-letter state codes."),
    fact("deserts", "Deserts extending into the United States", "MOJAVE|SONORAN|CHIHUAHUAN|GREAT BASIN", "These are the four major North American deserts extending into the U.S. The Sonoran and Chihuahuan also extend into Mexico.", "Think of dry regions of western North America.")
  ] },
  { id: "presidents", name: "Presidents & Civics", summary: "Historic presidents and the language of government.", sources: [S.presidents, S.rushmore, S.rights], groups: [
    fact("rushmore", "Presidents on Mount Rushmore", "WASHINGTON|JEFFERSON|LINCOLN|THEODORE ROOSEVELT", "Mount Rushmore depicts George Washington, Thomas Jefferson, Abraham Lincoln, and Theodore Roosevelt—not Franklin Roosevelt.", "Think of four faces carved into a mountain."),
    fact("offices", "Executive-branch Cabinet department heads", "ATTORNEY GENERAL|SECRETARY OF STATE|SECRETARY OF DEFENSE|TREASURY SECRETARY", "These four roles lead the Justice, State, Defense, and Treasury departments. There are other Cabinet departments too; the formal Treasury title is Secretary of the Treasury.", "These officials lead Cabinet departments."),
    fact("amendments", "Freedoms in the First Amendment", "SPEECH|RELIGION|PRESS|ASSEMBLY", "The First Amendment protects these freedoms, along with the right to petition. These four do not exhaust its protections.", "Think of the opening amendment to the Bill of Rights."),
    blank("white", "White ___", "HOUSE|PAPER|FLAG|BOARD", "White ___", "WHITE makes WHITE HOUSE, WHITE PAPER, WHITE FLAG, and WHITEBOARD. A white paper is an explanatory report; the other phrases name a residence, a signal, and a writing surface.", "One color completes every phrase; spacing may change."),
    blank("bill", "___ bill", "DOLLAR|SENATE|UTILITY|RESTAURANT", "___ bill", "A dollar bill is money; a Senate bill is proposed legislation; utility and restaurant bills request payment. BILL has more than one meaning.", "One word can mean money, legislation, or an amount owed."),
    { ...fact("civic-halves", "U.S. legal terms: ___ court", "SUPREME|FEDERAL|DISTRICT|APPEALS", "Complete SUPREME COURT, FEDERAL COURT, DISTRICT COURT, and APPEALS COURT. COURT is the same missing word in all four phrases.", "One shared word completes four legal phrases."), rule: "first-word", sourceWords: ["SUPREME COURT", "FEDERAL COURT", "DISTRICT COURT", "APPEALS COURT"] },
    fact("early", "The first four U.S. presidents", "GEORGE WASHINGTON|JOHN ADAMS|THOMAS JEFFERSON|JAMES MADISON", "In order: Washington, Adams, Jefferson, and Madison. Presidential surnames alone can be ambiguous, so these tiles use full names.", "Start at the beginning of the presidency.")
  ] },
  { id: "rivers", name: "Rivers & Waterways", summary: "Follow rivers across continents and learn how water moves.", sources: [S.water, S.geography], groups: [
    fact("africa", "Rivers in Africa", "NILE|CONGO|NIGER|ZAMBEZI", "These rivers flow in Africa. The Nile reaches the Mediterranean; the Congo and Niger reach the Atlantic; the Zambezi reaches the Indian Ocean.", "Follow these waterways across Africa."),
    fact("europe", "Rivers in Europe", "DANUBE|RHINE|SEINE|THAMES", "The Danube reaches the Black Sea; the Rhine the North Sea; the Seine the English Channel; and the Thames the North Sea.", "These waterways pass through or alongside European cities."),
    fact("features", "Parts of a river", "BANK|BED|MOUTH|SOURCE", "A river begins at its source, flows over its bed between banks, and ends at its mouth. Mouth and bed also have everyday meanings.", "These ordinary words also describe a river."),
    blank("water", "___water", "RAIN|FRESH|GROUND|SALT", "___water", "Complete RAINWATER, FRESHWATER, GROUNDWATER, and SALTWATER. The shared ending is WATER.", "A common ending makes four kinds or sources of water."),
    fact("cycle", "Water-cycle processes", "EVAPORATION|CONDENSATION|PRECIPITATION|INFILTRATION", "Water can evaporate, condense into droplets, fall as precipitation, and infiltrate soil. These are four processes in a larger cycle.", "Think of water moving through air and ground."),
    fact("boats", "Small watercraft", "CANOE|KAYAK|RAFT|GONDOLA", "These are types of watercraft. A gondola here is the boat associated with Venice, rather than a cable-car cabin.", "Think of ways to travel on water.")
  ] },
  { id: "science", name: "Space & Science", summary: "Planets, measurement, matter, and a little word science.", sources: [S.planets, S.units, S.water], groups: [
    fact("rocky", "The four rocky planets of our solar system", "MERCURY|VENUS|EARTH|MARS", "These are the four inner, terrestrial planets. Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants.", "Think of planets with solid, rocky surfaces."),
    fact("units", "SI base units", "METRE|SECOND|KILOGRAM|KELVIN", "These measure length, time, mass, and thermodynamic temperature, respectively. They are four of the seven SI base units.", "These are fundamental measurement units."),
    fact("matter", "Familiar states of matter", "SOLID|LIQUID|GAS|PLASMA", "These are four familiar states of matter. Plasma contains charged particles; the list is not exhaustive.", "Think of forms that matter can take."),
    blank("sphere", "Earth-system words ending in ___sphere", "ATMO|HYDRO|BIO|LITHO", "___sphere", "ATMOSPHERE, HYDROSPHERE, BIOSPHERE, and LITHOSPHERE refer to air, water, life, and the rigid outer Earth. The displayed pieces are word parts.", "These word parts share a scientific ending."),
    fact("gases", "Noble-gas elements", "HELIUM|NEON|ARGON|KRYPTON", "These elements are in group 18 of the periodic table. Helium fills balloons; neon is associated with illuminated signs.", "Look for elements in the same periodic-table family."),
    blank("micro", "Micro___", "SCOPE|WAVE|CHIP|PHONE", "Micro___", "MICROSCOPE, MICROWAVE, MICROCHIP, and MICROPHONE share MICRO. A microphone converts sound to an electrical signal.", "One prefix completes four technology words.")
  ] },
  { id: "general", name: "General Knowledge", summary: "A little of everything, with the widest mix of wordplay.", sources: [S.planets, S.geography], groups: [
    fact("instruments", "Orchestral string instruments", "VIOLIN|VIOLA|CELLO|DOUBLE BASS", "These are four bowed string instruments commonly found in an orchestra. A double bass can also be plucked.", "Think of the orchestral string section."),
    fact("chess", "Chess pieces other than pawns", "KING|QUEEN|ROOK|BISHOP", "These are four kinds of chess piece; the knight is another. Pawns are deliberately excluded from this category.", "Think of pieces on a chessboard."),
    fact("shapes", "Polygons with 3, 4, 5, and 6 sides", "TRIANGLE|QUADRILATERAL|PENTAGON|HEXAGON", "The side counts are three, four, five, and six, respectively. A square is one kind of quadrilateral.", "Count the sides, from three through six."),
    blank("house", "___house", "BRICK|GREEN|FARM|TREE", "___house", "BRICK HOUSE, GREENHOUSE, FARMHOUSE, and TREEHOUSE share HOUSE. The blank works across open and closed compounds.", "One familiar building word completes all four."),
    { ...fact("animals-drop", "Animals, minus their first letter", "EAR|OAR|INK|OX", "Restore the first letters: BEAR, BOAR, MINK, and FOX. Each displayed tile is a real word formed by removing the first letter of an animal name.", "Restore one letter at the beginning of each word."), rule: "drop-first", sourceWords: ["BEAR", "BOAR", "MINK", "FOX"] },
    { ...fact("animals-anagram", "Animals with their letters rearranged", "BARE|SALE|LOIN|FLOW", "Rearrange each tile to get BEAR, SEAL, LION, and WOLF. Every letter is used exactly once; no letters are added or removed.", "Rearrange the letters to find four animals."), rule: "anagram", sourceWords: ["BEAR", "SEAL", "LION", "WOLF"] },
    { ...fact("desserts", "Desserts: ___ pie", "APPLE|CHERRY|PECAN|PUMPKIN", "Complete APPLE PIE, CHERRY PIE, PECAN PIE, and PUMPKIN PIE. Each tile shares the same missing word, PIE.", "One shared word completes four familiar desserts."), rule: "first-word", sourceWords: ["APPLE PIE", "CHERRY PIE", "PECAN PIE", "PUMPKIN PIE"] }
  ] }
];
const starters = { world: ["capitals", "islands", "ranges", "land"], usa: ["lakes", "capitals", "parks", "new"], presidents: ["rushmore", "amendments", "white", "bill"], rivers: ["africa", "europe", "features", "water"], science: ["rocky", "units", "matter", "sphere"], general: ["instruments", "shapes", "house", "animals-drop"] };
const normalize = (value) => value.normalize("NFC").toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
function packById(id) {
  const pack = knowledgePacks.find((p) => p.id === id);
  if (!pack) throw new Error("Choose an available knowledge pack.");
  return pack;
}
function packVariants(id) {
  return packById(id).groups.map((g) => ({ ...g, rule: g.rule || "literal", sourceWords: g.sourceWords || (g.fixedText ? g.words.map((w) => g.fixedText.replace("___", w).toUpperCase()) : g.words) }));
}
function knowledgeBoard(id, choices = starters[id]) {
  const pack = packById(id), variants = packVariants(id);
  if (!Array.isArray(choices) || choices.length !== 4 || new Set(choices).size !== 4) throw new Error("A knowledge board needs four different connections.");
  if (id === "presidents" && choices.includes("early") && choices.includes("rushmore")) throw new Error("These two president groups refer to some of the same people.");
  const groups = choices.map((choice) => {
    const g = variants.find((v) => v.id === choice);
    if (!g) throw new Error("The AI selected an unreviewed connection.");
    const sources = g.sourceWords;
    if (["first-word", "last-word"].includes(g.rule) && new Set(sources.map((source) => normalize(source.split(" ")[g.rule === "first-word" ? 1 : 0] || ""))).size !== 1) throw new Error("Unrelated missing words are not a connection.");
    for (let i = 0; i < 4; i++) {
      const tile = normalize(g.words[i]), source = normalize(sources[i]);
      if (g.rule === "fill-blank" && (g.fixedText.split("___").length !== 2 || normalize(g.fixedText.replace("___", g.words[i])) !== source)) throw new Error("Invalid shared phrase.");
      if (g.rule === "drop-first" && source.slice(1) !== tile) throw new Error("Invalid letter removal.");
      if (g.rule === "anagram" && [...source].sort().join("") !== [...tile].sort().join("")) throw new Error("Invalid anagram.");
      if (g.rule === "last-word" && (sources[i].split(" ").length !== 2 || normalize(sources[i].split(" ")[1]) !== tile)) throw new Error("Invalid missing word.");
      if (g.rule === "first-word" && (sources[i].split(" ").length !== 2 || normalize(sources[i].split(" ")[0]) !== tile)) throw new Error("Invalid missing word.");
    }
    return { id: `${id}:${g.id}`, category: g.category, words: [...g.words], explanation: g.explanation, clue: g.clue, rule: g.rule, ...g.rule !== "literal" ? { sourceWords: [...sources] } : {} };
  });
  const tiles = groups.flatMap((g) => g.words.map(normalize));
  if (new Set(tiles).size !== 16 || groups.some((g) => g.words.length !== 4 || g.words.some((w) => w.length > 24))) throw new Error("This combination repeats a tile or exceeds the tile length.");
  for (const group of groups.filter((g) => g.rule === "literal")) {
    const inventory = new Set(variants.find((v) => `${id}:${v.id}` === group.id).sourceWords.map(normalize));
    if (groups.filter((g) => g.id !== group.id).some((g) => g.words.some((w) => inventory.has(normalize(w))))) throw new Error("This combination has competing answers.");
  }
  return { id: `pack-${id}-${choices.join("-")}`, title: `${pack.name}: find the thread`, topic: pack.name, description: "Four connections to discover. Some use facts; others play with the words themselves.", groups };
}
const emptyLearning = {
  kind: "topic",
  topic: "",
  material: ""
};
function loadLearningDraft() {
  try {
    const raw = JSON.parse(
      localStorage.getItem("common-thread-learning-draft") || "{}"
    );
    return {
      kind: raw.kind === "material" ? "material" : "topic",
      topic: typeof raw.topic === "string" ? raw.topic.slice(0, 500) : "",
      material: typeof raw.material === "string" ? raw.material : ""
    };
  } catch {
    return emptyLearning;
  }
}
function saveLearningDraft(input) {
  try {
    localStorage.setItem("common-thread-learning-draft", JSON.stringify(input));
  } catch {
  }
}
function historyKey(input) {
  let hash = 2166136261;
  for (const c of `${input.kind}|${input.topic.trim().toLowerCase()}|${input.kind === "material" ? input.material.trim() : ""}`)
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return `common-thread-learning-history-${hash >>> 0}`;
}
function history(input) {
  try {
    const items = JSON.parse(localStorage.getItem(historyKey(input)) || "[]");
    return Array.isArray(items) ? items.filter(
      (g) => typeof g.category === "string" && Array.isArray(g.words) && g.words.length === 4 && g.words.every((w) => typeof w === "string")
    ).slice(-40) : [];
  } catch {
    return [];
  }
}
function rememberLearning(input, groups) {
  const key = (g) => `${g.rule}|${g.words.slice().sort().join("|")}`;
  const next = new Map(history(input).map((g) => [key(g), g]));
  for (const g of groups) next.set(key(g), { ...g, playedAt: Date.now() });
  try {
    localStorage.setItem(
      historyKey(input),
      JSON.stringify([...next.values()].slice(-40))
    );
  } catch {
  }
}
async function generateLearning(input) {
  const brief = {
    purpose: "study",
    learningMode: input.kind,
    topic: input.topic.trim(),
    notes: input.kind === "material" ? input.material.trim() : "",
    playedConnections: history(input).map(
      ({ category, words, rule, sourceWords, playedAt }) => ({
        category,
        words,
        rule: rule || "literal",
        sourceWords,
        playedAt
      })
    )
  };
  if (new TextEncoder().encode(JSON.stringify(brief)).length > 185e3)
    throw new Error(
      "This text is too large for one puzzle. Use a shorter section; your full draft is kept."
    );
  let text2;
  text2 = await hostedGeneration(brief);
  return {
    ...parseGeneratedPuzzle(text2),
    id: `learning-${crypto.randomUUID()}`
  };
}
const emptyHistory = () => ({ groups: [], boards: [] });
function readPackHistory(id) {
  try {
    const data = JSON.parse(
      localStorage.getItem(`common-thread-pack-${id}`) || "{}"
    );
    const ids = new Set(packById(id).groups.map((g) => g.id));
    return {
      groups: Array.isArray(data.groups) ? data.groups.filter((v) => typeof v === "string" && ids.has(v)).slice(-40) : [],
      boards: Array.isArray(data.boards) ? data.boards.filter(
        (v) => Array.isArray(v) && v.length === 4 && v.every((item) => ids.has(item))
      ).slice(-40) : []
    };
  } catch {
    return emptyHistory();
  }
}
function KnowledgePacks({ onHome }) {
  const [input, setInput] = reactExports.useState(loadLearningDraft);
  const [mode, setMode] = reactExports.useState("relaxed");
  const [puzzle, setPuzzle] = reactExports.useState(null);
  const [readyId, setReadyId] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [session, setSession] = reactExports.useState(0);
  const [discovered, setDiscovered] = reactExports.useState(false);
  const active = reactExports.useRef(true);
  const inFlight = reactExports.useRef(false);
  const title = reactExports.useRef(null);
  reactExports.useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  reactExports.useEffect(() => {
    var _a2;
    if (!puzzle) (_a2 = title.current) == null ? void 0 : _a2.focus();
  }, [puzzle]);
  reactExports.useEffect(() => {
    saveLearningDraft(input);
  }, [input]);
  function play(next, id) {
    setReadyId(id);
    setPuzzle(next);
    setDiscovered(false);
    setSession((s) => s + 1);
    setError("");
  }
  function remember(groups) {
    setDiscovered(true);
    if (!readyId) {
      rememberLearning(input, groups);
      return;
    }
    const h = readPackHistory(readyId);
    h.groups = [
      .../* @__PURE__ */ new Set([...h.groups, ...groups.map((g) => g.id.split(":")[1])])
    ].slice(-40);
    const board = puzzle == null ? void 0 : puzzle.groups.map((g) => g.id.split(":")[1]).sort();
    if (board && !h.boards.some((b) => b.slice().sort().join("|") === board.join("|")))
      h.boards.push(board);
    try {
      localStorage.setItem(
        `common-thread-pack-${readyId}`,
        JSON.stringify({ ...h, boards: h.boards.slice(-40) })
      );
    } catch {
    }
  }
  async function makePuzzle(event) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await generateLearning(input);
      if (active.current) play(next, null);
    } catch (e) {
      if (active.current)
        setError(
          e instanceof Error ? e.message : "Could not make this puzzle. Your text is kept."
        );
    } finally {
      inFlight.current = false;
      if (active.current) setBusy(false);
    }
  }
  const displayName = (id, name) => id === "presidents" ? "Presidents & government" : name;
  if (puzzle)
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pack-round-note", children: readyId ? "Ready to play" : input.kind === "material" ? "Made from your material" : "Made for your topic" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Game,
        {
          puzzle,
          mode,
          onHome: () => setPuzzle(null),
          onRestart: () => setSession((s) => s + 1),
          onNext: () => setPuzzle(null),
          onRelaxed: () => {
            setMode("relaxed");
            setSession((s) => s + 1);
          },
          onConnectionsSeen: remember,
          nextLabel: "Choose another topic",
          homeLabel: "Change topic"
        },
        `${puzzle.id}-${session}`
      ),
      readyId && discovered && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "reading-links", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Read more about this subject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: packById(readyId).sources.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: s.url, target: "_blank", rel: "noreferrer", children: s.title }) }, s.url)) })
      ] })
    ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "learning-page", "aria-labelledby": "packs-title", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-button", type: "button", onClick: onHome, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
      " Home"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { id: "packs-title", ref: title, tabIndex: -1, children: "What do you want to learn?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Turn a subject, your notes, or a transcript into a puzzle." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "learning-form", onSubmit: makePuzzle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "learning-input-choice", disabled: busy, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { children: "Start with" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "learning-input",
              checked: input.kind === "topic",
              onChange: () => {
                setInput((v) => ({ ...v, kind: "topic" }));
                setError("");
              }
            }
          ),
          " ",
          "A subject"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "learning-input",
              checked: input.kind === "material",
              onChange: () => {
                setInput((v) => ({ ...v, kind: "material" }));
                setError("");
              }
            }
          ),
          " ",
          "My notes or a transcript"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "learning-topic", children: input.kind === "topic" ? "Your subject" : "Focus on a subject (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "learning-topic",
          value: input.topic,
          onChange: (e) => setInput((v) => ({ ...v, topic: e.target.value })),
          maxLength: 500,
          required: input.kind === "topic",
          disabled: busy,
          "aria-describedby": "topic-examples"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "topic-examples", className: "field-help", children: "For example: oceans, the New York Knicks, Shakespeare, or the 1970s." }),
      input.kind === "material" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "learning-material", children: "Paste your notes or transcript" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            id: "learning-material",
            rows: 9,
            value: input.material,
            onChange: (e) => setInput((v) => ({ ...v, material: e.target.value })),
            minLength: 80,
            required: true,
            disabled: busy,
            "aria-describedby": "material-help"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { id: "material-help", className: "field-help", children: [
          "The puzzle will use what you paste.",
          " ",
          input.material.length.toLocaleString(),
          " / 100,000 characters."
        ] }),
        input.material.length > 1e5 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "form-error", role: "alert", children: "This text is longer than one puzzle can use. Choose a section under 100,000 characters; your full draft is kept here." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "challenge-choice", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: mode === "challenge",
            onChange: (e) => setMode(e.target.checked ? "challenge" : "relaxed"),
            disabled: busy
          }
        ),
        " ",
        "Limit me to four mistakes, with no hints"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "field-help", children: "Leave this off to play with hints and no guess limit." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "primary-button",
          type: "submit",
          disabled: busy || (input.kind === "topic" ? !input.topic.trim() : input.material.trim().length < 80 || input.material.length > 1e5),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
            busy ? "Making your puzzle…" : "Make my puzzle"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("output", { className: "generation-status", children: busy ? input.kind === "material" ? "Reading your material and checking a puzzle. This may take a couple of minutes." : "Finding connections and checking the answers. This can take a minute." : "" }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "form-error", role: "alert", children: error })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "ready-puzzles", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Or play a ready-made puzzle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pack-grid", "aria-label": "Ready-made subjects", children: knowledgePacks.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "pack-card",
          type: "button",
          disabled: busy,
          onClick: () => play(knowledgeBoard(p.id), p.id),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: displayName(p.id, p.name) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.summary }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ready-cta", children: [
              "Play ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 15 })
            ] })
          ]
        },
        p.id
      )) })
    ] })
  ] });
}
function readInvitation() {
  if (!window.location.hash.startsWith("#thread="))
    return { challenge: null, error: "" };
  try {
    return { challenge: decodeChallenge(window.location.hash), error: "" };
  } catch {
    return {
      challenge: null,
      error: "That challenge link couldn't be opened. Ask your friend for a fresh copy, or paste a challenge code below."
    };
  }
}
function App() {
  const [entry] = reactExports.useState(readInvitation);
  const [personal, setPersonal] = reactExports.useState(
    entry.challenge
  );
  const [page, setPage] = reactExports.useState(
    entry.challenge ? "invitation" : "home"
  );
  const [linkError, setLinkError] = reactExports.useState(entry.error);
  const [mode, setMode] = reactExports.useState(null);
  const [puzzleIndex, setPuzzleIndex] = reactExports.useState(0);
  const [lessonIndex, setLessonIndex] = reactExports.useState(0);
  const [session, setSession] = reactExports.useState(0);
  const topic = 0;
  const [quickChallenge, setQuickChallenge] = reactExports.useState(false);
  const [returned, setReturned] = reactExports.useState(false);
  const [personalStoryId, setPersonalStoryId] = reactExports.useState(null);
  const rememberSeen = reactExports.useCallback(
    (groups) => {
      if (personalStoryId) recordPlayedGroups(personalStoryId, groups);
    },
    [personalStoryId]
  );
  const homeTitle = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a2;
    if (!mode && page === "home" && returned) (_a2 = homeTitle.current) == null ? void 0 : _a2.focus();
  }, [mode, returned, page]);
  reactExports.useEffect(() => {
    function openHash() {
      const incoming = readInvitation();
      setLinkError(incoming.error);
      if (incoming.challenge) {
        setPersonalStoryId(null);
        setPersonal(incoming.challenge);
        setMode(null);
        setPage("invitation");
      } else if (incoming.error) {
        setPersonal(null);
        setMode(null);
        setPage("home");
        setReturned(true);
      }
    }
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);
  function start(nextMode, index2 = topic) {
    setPersonalStoryId(null);
    setPersonal(null);
    setPage("home");
    setLessonIndex(0);
    setPuzzleIndex(index2);
    setSession((value) => value + 1);
    setMode(nextMode);
  }
  function goHome() {
    setPersonalStoryId(null);
    setMode(null);
    setPage("home");
    setPersonal(null);
    setLinkError("");
    if (window.location.hash.startsWith("#thread="))
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    setReturned(true);
  }
  function playPersonal(challenge, selectedMode = challenge.mode) {
    setPersonal(challenge);
    setMode(selectedMode);
    setPage("home");
    setSession((value) => value + 1);
  }
  function openChallenge(challenge) {
    setPersonalStoryId(null);
    setPersonal(challenge);
    setMode(null);
    setPage("invitation");
    setLinkError("");
  }
  const puzzle = personal && mode !== "intro" ? personal.puzzle : mode === "intro" ? lessons[lessonIndex] : puzzles[puzzleIndex];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "app-shell", "data-ocid": "page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "site-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "brand",
          type: "button",
          onClick: goHome,
          "aria-label": "Common Thread home",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "thread-mark", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", {})
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Common Thread" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "header-note", children: "A little curiosity goes a long way." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "text-button",
          type: "button",
          onClick: () => start("intro"),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleHelp, { size: 16 }),
            " How to play"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { children: page === "packs" ? /* @__PURE__ */ jsxRuntimeExports.jsx(KnowledgePacks, { onHome: goHome }) : page === "creator" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Creator,
      {
        onHome: goHome,
        onPlay: (challenge, storyId) => {
          setPersonalStoryId(storyId || null);
          playPersonal(challenge);
        }
      }
    ) : page === "invitation" && personal ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Invitation,
      {
        challenge: personal,
        onHome: goHome,
        onPlay: (selectedMode) => playPersonal(personal, selectedMode)
      }
    ) : mode === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "welcome home-intro", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { ref: homeTitle, tabIndex: -1, "data-ocid": "page.title", children: "What will you connect?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Find four groups of four. Follow the connections." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "home-choices", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "home-choice", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: "JUST PLAY" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "A puzzle, ready for you" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Find the hidden groups in sixteen words. Get hints as you play, or take the challenge below." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "challenge-choice", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: quickChallenge,
                onChange: (e) => setQuickChallenge(e.target.checked)
              }
            ),
            " ",
            "Four mistakes, no hints"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: "primary-button",
              type: "button",
              onClick: () => start(quickChallenge ? "challenge" : "relaxed"),
              children: [
                "Play now ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 17 })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "home-choice", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: "MAKE IT PERSONAL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Your memories. Your puzzle." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Use your shared stories and inside jokes to make a puzzle for someone you know." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: "secondary-button",
              type: "button",
              onClick: () => {
                setPersonal(null);
                setMode(null);
                setPage("creator");
              },
              children: [
                "Create a personal puzzle ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 17 })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "home-choice", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "eyebrow", children: "LEARN THROUGH PLAY" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Something you’re curious about" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Choose any subject, or use your notes or a transcript to make a learning puzzle." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: "secondary-button",
              type: "button",
              onClick: () => {
                setPersonalStoryId(null);
                setMode(null);
                setPage("packs");
              },
              children: [
                "Choose a topic ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 17 })
              ]
            }
          )
        ] })
      ] }),
      linkError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "form-error", role: "alert", children: linkError }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FriendHub, { onOpen: openChallenge })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "personal-round-note", children: personal && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Made",
        " ",
        personal.recipient ? `for ${personal.recipient}` : "for you",
        " ",
        "by ",
        personal.creator || "a friend",
        personal.source === "example" ? " · Example puzzle" : "",
        personal.note && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: personal.note })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Game,
        {
          puzzle,
          mode,
          onHome: goHome,
          onRestart: () => setSession((value) => value + 1),
          onNext: () => {
            if (personal) {
              setMode(null);
              setPage("invitation");
            } else if (mode === "intro" && lessonIndex === 0)
              setLessonIndex(1);
            else if (mode === "intro") {
              start("relaxed");
            } else setPuzzleIndex((value) => (value + 1) % puzzles.length);
          },
          onRelaxed: () => personal ? playPersonal(personal, "relaxed") : start("relaxed", puzzleIndex),
          personal: personal !== null,
          onConnectionsSeen: personalStoryId && (personal == null ? void 0 : personal.source) !== "example" ? rememberSeen : void 0
        },
        `${mode}-${puzzle.id}-${session}`
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "site-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Created by Terry Brutus" }) })
  ] });
}
BigInt.prototype.toJSON = function() {
  return this.toString();
};
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
