var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
var _client, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _currentThenable, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _QueryObserver_instances, executeFetch_fn, updateStaleTimeout_fn, computeRefetchInterval_fn, updateRefetchInterval_fn, updateTimers_fn, clearStaleTimeout_fn, clearRefetchInterval_fn, updateQuery_fn, notify_fn, _a, _inner, _attributes, _signer, _options, _channel, _establishingChannel, _scheduledChannelClosure, _pendingRequestCount, _Signer_instances, rpc_fn, applyTransforms_fn, _options2, _status, _HeartbeatClient_instances, establish_fn, maintain_fn, receiveStatusResponse_fn, sendStatusRequest_fn, _options3, _closeListeners, _options4, _closed, _pendingQueue, _flow, _closeListeners2, _responseListeners, _closed2, _options5, _results, _index, _navigated, _createdAt, _url, _asyncSlots, _requestKeys, _buffer, _inFlight, _flushTimer, _UrlFlow_instances, scheduleFlush_fn, flush_fn, navigate_fn, persist_fn, _flow2, _options6, _dbPromise, _IdbCredentialStorage_instances, db_get, _source, _storage, _slot, _onSessionGone, _sessionExpiresAtMs, _account, _held, _inFlight2, _currentWasUsed, _scheduled, _reportedGone, _unsupported, _SessionIdentity_instances, refreshIfDue_fn, lockName_get, isForThisSession_fn, msLeft_fn, readStored_fn, usable_fn, mint_fn, mintOnce_fn, adopt_fn, schedule_fn, reportGone_fn, _service, _SessionMinter_instances, mintOnce_fn2, _subscribers, _LocalStateStorage_instances, fire_fn, raw_fn, localStorage_fn, _identity, _credentialStorage, _slots, _canisterId, _unwatchForeground, _unwatchState, _unwatchActivity, _refreshingInForeground, _disposed, _restoreQueued, _status2, _listeners, _restoring, _stateStorage, _signer2, _urlTransport, _options7, _initPromise, _interactions, _channelLock, _AuthClient_instances, readStatus_fn, installIdentity_fn, beginInteraction_fn, openSignerChannel_fn, endInteraction_fn, assertCurrent_fn, runSignIn_fn, ensureSessionKeyForWindowFlow_fn, ensureSessionKeyForRedirectFlow_fn, runRequestAttributes_fn, resolveNonce_fn, refreshInForeground_fn, refreshIfDue_fn2, revoke_fn, promoteAppCredential_fn, minterFor_fn, openSession_fn, endOrDrop_fn, expireSession_fn, restoreAgain_fn, init_fn, restore_fn, hydrate_fn, persistSession_fn, restoreSession_fn, endSession_fn, dropSession_fn, clearCredentials_fn;
import { H as HttpAgent, S as StorageClient, E as ExternalBlob, a as SignIdentity, u as uint8FromBufLike, P as Principal, r as requestIdOf, I as IC_REQUEST_DOMAIN_SEPARATOR, b as IC_REQUEST_AUTH_DELEGATION_DOMAIN_SEPARATOR, h as hexToBytes, c as bytesToHex, d as Endpoint, A as Actor, e as AnonymousIdentity } from "./StorageClient-CC6IK5sY.js";
import { S as Subscribable, p as pendingThenable, r as resolveEnabled, s as shallowEqualObjects, a as resolveStaleTime, n as noop, e as environmentManager, i as isValidTimeout, t as timeUntilStale, b as timeoutManager, f as focusManager, c as fetchState, d as replaceData, g as notifyManager, h as reactExports, j as shouldThrowError, u as useQueryClient } from "./index-BuESbGBf.js";
var QueryObserver = (_a = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _QueryObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _currentQuery);
    __privateAdd(this, _currentQueryInitialState);
    __privateAdd(this, _currentResult);
    __privateAdd(this, _currentResultState);
    __privateAdd(this, _currentResultOptions);
    __privateAdd(this, _currentThenable);
    __privateAdd(this, _selectError);
    __privateAdd(this, _selectFn);
    __privateAdd(this, _selectResult);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    __privateAdd(this, _lastQueryWithDefinedData);
    __privateAdd(this, _staleTimeoutId);
    __privateAdd(this, _refetchIntervalId);
    __privateAdd(this, _currentRefetchInterval);
    __privateAdd(this, _trackedProps, /* @__PURE__ */ new Set());
    this.options = options;
    __privateSet(this, _client, client);
    __privateSet(this, _selectError, null);
    __privateSet(this, _currentThenable, pendingThenable());
    this.bindMethods();
    this.setOptions(options);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      __privateGet(this, _currentQuery).addObserver(this);
      if (shouldFetchOnMount(__privateGet(this, _currentQuery), this.options)) {
        __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
      } else {
        this.updateResult();
      }
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
    __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
    __privateGet(this, _currentQuery).removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = __privateGet(this, _currentQuery);
    this.options = __privateGet(this, _client).defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
    __privateGet(this, _currentQuery).setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: __privateGet(this, _currentQuery),
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      __privateGet(this, _currentQuery),
      prevQuery,
      this.options,
      prevOptions
    )) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
    this.updateResult();
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || resolveStaleTime(this.options.staleTime, __privateGet(this, _currentQuery)) !== resolveStaleTime(prevOptions.staleTime, __privateGet(this, _currentQuery)))) {
      __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
    }
    const nextRefetchInterval = __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this);
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || nextRefetchInterval !== __privateGet(this, _currentRefetchInterval))) {
      __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      __privateSet(this, _currentResult, result);
      __privateSet(this, _currentResultOptions, this.options);
      __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    }
    return result;
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked == null ? void 0 : onPropTracked(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && __privateGet(this, _currentThenable).status === "pending") {
            __privateGet(this, _currentThenable).reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    __privateGet(this, _trackedProps).add(key);
  }
  getCurrentQuery() {
    return __privateGet(this, _currentQuery);
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = __privateGet(this, _client).defaultQueryOptions(options);
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this, {
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return __privateGet(this, _currentResult);
    });
  }
  createResult(query, options) {
    var _a2;
    const prevQuery = __privateGet(this, _currentQuery);
    const prevOptions = this.options;
    const prevResult = __privateGet(this, _currentResult);
    const prevResultState = __privateGet(this, _currentResultState);
    const prevResultOptions = __privateGet(this, _currentResultOptions);
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : __privateGet(this, _currentQueryInitialState);
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          (_a2 = __privateGet(this, _lastQueryWithDefinedData)) == null ? void 0 : _a2.state.data,
          __privateGet(this, _lastQueryWithDefinedData)
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult == null ? void 0 : prevResult.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === __privateGet(this, _selectFn)) {
        data = __privateGet(this, _selectResult);
      } else {
        try {
          __privateSet(this, _selectFn, options.select);
          data = options.select(data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          __privateSet(this, _selectResult, data);
          __privateSet(this, _selectError, null);
        } catch (selectError) {
          __privateSet(this, _selectError, selectError);
        }
      }
    }
    if (__privateGet(this, _selectError)) {
      error = __privateGet(this, _selectError);
      data = __privateGet(this, _selectResult);
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: __privateGet(this, _currentThenable),
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = __privateSet(this, _currentThenable, nextResult.promise = pendingThenable());
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = __privateGet(this, _currentThenable);
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = __privateGet(this, _currentResult);
    const nextResult = this.createResult(__privateGet(this, _currentQuery), this.options);
    __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    __privateSet(this, _currentResultOptions, this.options);
    if (__privateGet(this, _currentResultState).data !== void 0) {
      __privateSet(this, _lastQueryWithDefinedData, __privateGet(this, _currentQuery));
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    __privateSet(this, _currentResult, nextResult);
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !__privateGet(this, _trackedProps).size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? __privateGet(this, _trackedProps)
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(__privateGet(this, _currentResult)).some((key) => {
        const typedKey = key;
        const changed = __privateGet(this, _currentResult)[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    __privateMethod(this, _QueryObserver_instances, notify_fn).call(this, { listeners: shouldNotifyListeners() });
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
}, _client = new WeakMap(), _currentQuery = new WeakMap(), _currentQueryInitialState = new WeakMap(), _currentResult = new WeakMap(), _currentResultState = new WeakMap(), _currentResultOptions = new WeakMap(), _currentThenable = new WeakMap(), _selectError = new WeakMap(), _selectFn = new WeakMap(), _selectResult = new WeakMap(), _lastQueryWithDefinedData = new WeakMap(), _staleTimeoutId = new WeakMap(), _refetchIntervalId = new WeakMap(), _currentRefetchInterval = new WeakMap(), _trackedProps = new WeakMap(), _QueryObserver_instances = new WeakSet(), executeFetch_fn = function(fetchOptions) {
  __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
  let promise = __privateGet(this, _currentQuery).fetch(
    this.options,
    fetchOptions
  );
  if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
    promise = promise.catch(noop);
  }
  return promise;
}, updateStaleTimeout_fn = function() {
  __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
  const staleTime = resolveStaleTime(
    this.options.staleTime,
    __privateGet(this, _currentQuery)
  );
  if (environmentManager.isServer() || __privateGet(this, _currentResult).isStale || !isValidTimeout(staleTime)) {
    return;
  }
  const time = timeUntilStale(__privateGet(this, _currentResult).dataUpdatedAt, staleTime);
  const timeout = time + 1;
  __privateSet(this, _staleTimeoutId, timeoutManager.setTimeout(() => {
    if (!__privateGet(this, _currentResult).isStale) {
      this.updateResult();
    }
  }, timeout));
}, computeRefetchInterval_fn = function() {
  return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(__privateGet(this, _currentQuery)) : this.options.refetchInterval) ?? false;
}, updateRefetchInterval_fn = function(nextInterval) {
  __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
  __privateSet(this, _currentRefetchInterval, nextInterval);
  if (environmentManager.isServer() || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) === false || !isValidTimeout(__privateGet(this, _currentRefetchInterval)) || __privateGet(this, _currentRefetchInterval) === 0) {
    return;
  }
  __privateSet(this, _refetchIntervalId, timeoutManager.setInterval(() => {
    if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
  }, __privateGet(this, _currentRefetchInterval)));
}, updateTimers_fn = function() {
  __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
  __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this));
}, clearStaleTimeout_fn = function() {
  if (__privateGet(this, _staleTimeoutId)) {
    timeoutManager.clearTimeout(__privateGet(this, _staleTimeoutId));
    __privateSet(this, _staleTimeoutId, void 0);
  }
}, clearRefetchInterval_fn = function() {
  if (__privateGet(this, _refetchIntervalId)) {
    timeoutManager.clearInterval(__privateGet(this, _refetchIntervalId));
    __privateSet(this, _refetchIntervalId, void 0);
  }
}, updateQuery_fn = function() {
  const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), this.options);
  if (query === __privateGet(this, _currentQuery)) {
    return;
  }
  const prevQuery = __privateGet(this, _currentQuery);
  __privateSet(this, _currentQuery, query);
  __privateSet(this, _currentQueryInitialState, query.state);
  if (this.hasListeners()) {
    prevQuery == null ? void 0 : prevQuery.removeObserver(this);
    query.addObserver(this);
  }
}, notify_fn = function(notifyOptions) {
  notifyManager.batch(() => {
    if (notifyOptions.listeners) {
      this.listeners.forEach((listener) => {
        listener(__privateGet(this, _currentResult));
      });
    }
    __privateGet(this, _client).getQueryCache().notify({
      query: __privateGet(this, _currentQuery),
      type: "observerResultsUpdated"
    });
  });
}, _a);
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = (query == null ? void 0 : query.state.error) && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  var _a2, _b, _c, _d;
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  (_b = (_a2 = client.getDefaultOptions().queries) == null ? void 0 : _a2._experimental_beforeQuery) == null ? void 0 : _b.call(
    _a2,
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  (_d = (_c = client.getDefaultOptions().queries) == null ? void 0 : _c._experimental_afterQuery) == null ? void 0 : _d.call(
    _c,
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query == null ? void 0 : query.promise
    );
    promise == null ? void 0 : promise.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
var define_process_env_default = {};
const DEFAULT_BUCKET_NAME = "default-bucket";
const DEFAULT_PROJECT_ID = "0000000-0000-0000-0000-00000000000";
let configCache = null;
function getCachedConfig() {
  return configCache;
}
async function loadConfig() {
  if (configCache) {
    return configCache;
  }
  const backendCanisterId = define_process_env_default.CANISTER_ID_BACKEND;
  const envBaseUrl = define_process_env_default.BASE_URL || "/";
  const baseUrl = envBaseUrl.endsWith("/") ? envBaseUrl : `${envBaseUrl}/`;
  try {
    const response = await fetch(`${baseUrl}env.json`);
    const config = await response.json();
    if (!backendCanisterId && config.backend_canister_id === "undefined") {
      console.error("CANISTER_ID_BACKEND is not set");
      throw new Error("CANISTER_ID_BACKEND is not set");
    }
    const runtimeStorageGatewayUrl = config.storage_gateway_url && config.storage_gateway_url !== "undefined" ? config.storage_gateway_url : void 0;
    const fullConfig = {
      backend_host: config.backend_host === "undefined" ? void 0 : config.backend_host,
      backend_canister_id: config.backend_canister_id === "undefined" ? backendCanisterId : config.backend_canister_id,
      storage_gateway_url: runtimeStorageGatewayUrl ?? "nogateway",
      bucket_name: DEFAULT_BUCKET_NAME,
      project_id: config.project_id !== "undefined" ? config.project_id : DEFAULT_PROJECT_ID,
      ii_derivation_origin: config.ii_derivation_origin === "undefined" ? void 0 : config.ii_derivation_origin
    };
    configCache = fullConfig;
    return fullConfig;
  } catch {
    if (!backendCanisterId) {
      console.error("CANISTER_ID_BACKEND is not set");
      throw new Error("CANISTER_ID_BACKEND is not set");
    }
    const fallbackConfig = {
      backend_host: void 0,
      backend_canister_id: backendCanisterId,
      storage_gateway_url: "nogateway",
      bucket_name: DEFAULT_BUCKET_NAME,
      project_id: DEFAULT_PROJECT_ID,
      ii_derivation_origin: void 0
    };
    return fallbackConfig;
  }
}
function extractAgentErrorMessage(error) {
  const errorString = String(error);
  const match = errorString.match(/with message:\s*'([^']+)'/s);
  return match ? match[1] : errorString;
}
function processError(e) {
  if (e && typeof e === "object" && "message" in e) {
    throw new Error(extractAgentErrorMessage(`${e.message}`));
  }
  throw e;
}
async function loadMockBackendFromModules(mockModules) {
  {
    return null;
  }
}
async function createActorWithConfig(createActor, options) {
  var _a2;
  const { mockModules, ...resolvedOptions } = options ?? {};
  if (mockModules) {
    const mock = await loadMockBackendFromModules();
    if (mock) {
      return mock;
    }
  }
  const config = await loadConfig();
  const agent = new HttpAgent({
    ...resolvedOptions.agentOptions,
    host: config.backend_host
  });
  if ((_a2 = config.backend_host) == null ? void 0 : _a2.includes("localhost")) {
    await agent.fetchRootKey().catch((err) => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }
  const actorOptions = {
    ...resolvedOptions,
    agent,
    processError
  };
  const storageClient = new StorageClient(config.bucket_name, config.storage_gateway_url, config.backend_canister_id, config.project_id, agent);
  const MOTOKO_DEDUPLICATION_SENTINEL = "!caf!";
  const uploadFile = async (file) => {
    const { hash } = await storageClient.putFile(await file.getBytes(), file.onProgress, file.contentType, file.filename);
    return new TextEncoder().encode(MOTOKO_DEDUPLICATION_SENTINEL + hash);
  };
  const downloadFile = async (bytes) => {
    const hashWithPrefix = new TextDecoder().decode(new Uint8Array(bytes));
    const hash = hashWithPrefix.substring(MOTOKO_DEDUPLICATION_SENTINEL.length);
    const url = await storageClient.getDirectURL(hash);
    return ExternalBlob.fromURL(url);
  };
  return createActor(config.backend_canister_id, uploadFile, downloadFile, actorOptions);
}
class SessionGoneError extends Error {
  constructor(message = "The session behind this identity no longer exists") {
    super(message);
    this.name = "SessionGoneError";
  }
}
class SessionUnsupportedError extends Error {
  constructor(message) {
    super(message);
    this.name = "SessionUnsupportedError";
  }
}
class AccountMismatchError extends Error {
  constructor() {
    super("The minted delegation is not for the account this origin acts as");
    this.name = "AccountMismatchError";
  }
}
const sameKey = (a, b) => a.length === b.length && a.every((byte, i) => byte === b[i]);
const delegatesTo = (chain) => {
  var _a2;
  return (_a2 = chain.delegations[chain.delegations.length - 1]) == null ? void 0 : _a2.delegation.pubkey;
};
const chainAuthorisesKey = (chain, keyDer) => {
  const leaf = delegatesTo(chain);
  return leaf !== void 0 && sameKey(new Uint8Array(leaf), new Uint8Array(keyDer));
};
class CryptoError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    Object.setPrototypeOf(this, CryptoError.prototype);
  }
}
function _getEffectiveCrypto(subtleCrypto) {
  if (typeof global !== "undefined" && global["crypto"] && global["crypto"]["subtle"]) {
    return global["crypto"]["subtle"];
  }
  if (subtleCrypto) {
    return subtleCrypto;
  }
  if (typeof crypto !== "undefined" && crypto["subtle"]) {
    return crypto.subtle;
  }
  throw new CryptoError("Global crypto was not available and none was provided. Please inlcude a SubtleCrypto implementation. See https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto");
}
class ECDSAKeyIdentity extends SignIdentity {
  /**
   * Generates a randomly generated identity for use in calls to the Internet Computer.
   * @param {CryptoKeyOptions} options optional settings
   * @param {CryptoKeyOptions['extractable']} options.extractable - whether the key should allow itself to be used. Set to false for maximum security.
   * @param {CryptoKeyOptions['keyUsages']} options.keyUsages - a list of key usages that the key can be used for
   * @param {CryptoKeyOptions['subtleCrypto']} options.subtleCrypto interface
   * @returns a {@link ECDSAKeyIdentity}
   */
  static async generate(options) {
    const { extractable = false, keyUsages = ["sign", "verify"], subtleCrypto } = options ?? {};
    const effectiveCrypto = _getEffectiveCrypto(subtleCrypto);
    const keyPair = await effectiveCrypto.generateKey({
      name: "ECDSA",
      namedCurve: "P-256"
    }, extractable, keyUsages);
    const derKey = uint8FromBufLike(await effectiveCrypto.exportKey("spki", keyPair.publicKey));
    Object.assign(derKey, {
      __derEncodedPublicKey__: void 0
    });
    return new this(keyPair, derKey, effectiveCrypto);
  }
  /**
   * generates an identity from a public and private key. Please ensure that you are generating these keys securely and protect the user's private key
   * @param keyPair a CryptoKeyPair
   * @param subtleCrypto - a SubtleCrypto interface in case one is not available globally
   * @returns an {@link ECDSAKeyIdentity}
   */
  static async fromKeyPair(keyPair, subtleCrypto) {
    const effectiveCrypto = _getEffectiveCrypto(subtleCrypto);
    const derKey = uint8FromBufLike(await effectiveCrypto.exportKey("spki", keyPair.publicKey));
    Object.assign(derKey, {
      __derEncodedPublicKey__: void 0
    });
    return new ECDSAKeyIdentity(keyPair, derKey, effectiveCrypto);
  }
  // `fromKeyPair` and `generate` should be used for instantiation, not this constructor.
  constructor(keyPair, derKey, subtleCrypto) {
    super();
    this._keyPair = keyPair;
    this._derKey = derKey;
    this._subtleCrypto = subtleCrypto;
  }
  /**
   * Return the internally-used key pair.
   * @returns a CryptoKeyPair
   */
  getKeyPair() {
    return this._keyPair;
  }
  /**
   * Return the public key.
   * @returns an {@link PublicKey & DerCryptoKey}
   */
  getPublicKey() {
    const derKey = this._derKey;
    const key = Object.create(this._keyPair.publicKey);
    key.toDer = function() {
      return derKey;
    };
    return key;
  }
  /**
   * Signs a blob of data, with this identity's private key.
   * @param {Uint8Array} challenge - challenge to sign with this identity's secretKey, producing a signature
   * @returns {Promise<Signature>} signature
   */
  async sign(challenge) {
    const params = {
      name: "ECDSA",
      hash: { name: "SHA-256" }
    };
    const signature = uint8FromBufLike(await this._subtleCrypto.sign(params, this._keyPair.privateKey, challenge));
    Object.assign(signature, {
      __signature__: void 0
    });
    return signature;
  }
}
function safeBytesToHex(data) {
  if (data instanceof Uint8Array) {
    return bytesToHex(data);
  }
  return bytesToHex(new Uint8Array(data));
}
function _parseBlob(value) {
  if (typeof value !== "string" || value.length < 64) {
    throw new Error("Invalid public key.");
  }
  return hexToBytes(value);
}
class Delegation {
  constructor(pubkey, expiration, targets) {
    this.pubkey = pubkey;
    this.expiration = expiration;
    this.targets = targets;
  }
  toCborValue() {
    return {
      pubkey: this.pubkey,
      expiration: this.expiration,
      ...this.targets && {
        targets: this.targets
      }
    };
  }
  toJSON() {
    return {
      expiration: this.expiration.toString(16),
      pubkey: safeBytesToHex(this.pubkey),
      ...this.targets && { targets: this.targets.map((p) => p.toHex()) }
    };
  }
}
async function _createSingleDelegation(from, to, expiration, targets) {
  const delegation = new Delegation(
    to.toDer(),
    BigInt(+expiration) * BigInt(1e6),
    // In nanoseconds.
    targets
  );
  const challenge = new Uint8Array([
    ...IC_REQUEST_AUTH_DELEGATION_DOMAIN_SEPARATOR,
    ...new Uint8Array(requestIdOf({ ...delegation }))
  ]);
  const signature = await from.sign(challenge);
  return {
    delegation,
    signature
  };
}
class DelegationChain {
  /**
   * Create a delegation chain between two (or more) keys. By default, the expiration time
   * will be very short (15 minutes).
   *
   * To build a chain of more than 2 identities, this function needs to be called multiple times,
   * passing the previous delegation chain into the options argument. For example:
   * @example
   * const rootKey = createKey();
   * const middleKey = createKey();
   * const bottomeKey = createKey();
   *
   * const rootToMiddle = await DelegationChain.create(
   *   root, middle.getPublicKey(), Date.parse('2100-01-01'),
   * );
   * const middleToBottom = await DelegationChain.create(
   *   middle, bottom.getPublicKey(), Date.parse('2100-01-01'), { previous: rootToMiddle },
   * );
   *
   * // We can now use a delegation identity that uses the delegation above:
   * const identity = DelegationIdentity.fromDelegation(bottomKey, middleToBottom);
   * @param from The identity that will delegate.
   * @param to The identity that gets delegated. It can now sign messages as if it was the
   *           identity above.
   * @param expiration The length the delegation is valid. By default, 15 minutes from calling
   *                   this function.
   * @param options A set of options for this delegation. expiration and previous
   * @param options.previous - Another DelegationChain that this chain should start with.
   * @param options.targets - targets that scope the delegation (e.g. Canister Principals)
   */
  static async create(from, to, expiration = new Date(Date.now() + 15 * 60 * 1e3), options = {}) {
    var _a2, _b;
    const delegation = await _createSingleDelegation(from, to, expiration, options.targets);
    return new DelegationChain([...((_a2 = options.previous) == null ? void 0 : _a2.delegations) || [], delegation], ((_b = options.previous) == null ? void 0 : _b.publicKey) || from.getPublicKey().toDer());
  }
  /**
   * Creates a DelegationChain object from a JSON string.
   * @param json The JSON string to parse.
   */
  static fromJSON(json) {
    const { publicKey, delegations } = typeof json === "string" ? JSON.parse(json) : json;
    if (!Array.isArray(delegations)) {
      throw new Error("Invalid delegations.");
    }
    const parsedDelegations = delegations.map((signedDelegation) => {
      const { delegation, signature } = signedDelegation;
      const { pubkey, expiration, targets } = delegation;
      if (targets !== void 0 && !Array.isArray(targets)) {
        throw new Error("Invalid targets.");
      }
      return {
        delegation: new Delegation(
          _parseBlob(pubkey),
          BigInt(`0x${expiration}`),
          // expiration in JSON is an hexa string (See toJSON() below).
          targets && targets.map((t) => {
            if (typeof t !== "string") {
              throw new Error("Invalid target.");
            }
            return Principal.fromHex(t);
          })
        ),
        signature: _parseBlob(signature)
      };
    });
    return new this(parsedDelegations, _parseBlob(publicKey));
  }
  /**
   * Creates a DelegationChain object from a list of delegations and a DER-encoded public key.
   * @param delegations The list of delegations.
   * @param publicKey The DER-encoded public key of the key-pair signing the first delegation.
   */
  static fromDelegations(delegations, publicKey) {
    return new this(delegations, publicKey);
  }
  constructor(delegations, publicKey) {
    this.delegations = delegations;
    this.publicKey = publicKey;
  }
  toJSON() {
    return {
      delegations: this.delegations.map((signedDelegation) => {
        const { delegation, signature } = signedDelegation;
        const { targets } = delegation;
        return {
          delegation: {
            expiration: delegation.expiration.toString(16),
            pubkey: safeBytesToHex(delegation.pubkey),
            ...targets && {
              targets: targets.map((t) => t.toHex())
            }
          },
          signature: safeBytesToHex(signature)
        };
      }),
      publicKey: safeBytesToHex(this.publicKey)
    };
  }
}
class DelegationIdentity extends SignIdentity {
  /**
   * Create a delegation without having access to delegateKey.
   * @param key The key used to sign the requests.
   * @param delegation A delegation object created using `createDelegation`.
   */
  static fromDelegation(key, delegation) {
    return new this(key, delegation);
  }
  constructor(_inner2, _delegation) {
    super();
    this._inner = _inner2;
    this._delegation = _delegation;
  }
  getDelegation() {
    return this._delegation;
  }
  getPublicKey() {
    return {
      derKey: this._delegation.publicKey,
      toDer: () => this._delegation.publicKey
    };
  }
  sign(blob) {
    return this._inner.sign(blob);
  }
  async transformRequest(request) {
    const { body, ...fields } = request;
    const requestId = await requestIdOf(body);
    return {
      ...fields,
      body: {
        content: body,
        sender_sig: await this.sign(new Uint8Array([...IC_REQUEST_DOMAIN_SEPARATOR, ...new Uint8Array(requestId)])),
        sender_delegation: this._delegation.delegations,
        sender_pubkey: this._delegation.publicKey
      }
    };
  }
}
function isDelegationValid(chain, checks) {
  for (const { delegation } of chain.delegations) {
    if (+new Date(Number(delegation.expiration / BigInt(1e6))) <= +Date.now()) {
      return false;
    }
  }
  const scopes = [];
  for (const s of scopes) {
    const scope = s.toText();
    for (const { delegation } of chain.delegations) {
      if (delegation.targets === void 0) {
        continue;
      }
      let none = true;
      for (const target of delegation.targets) {
        if (target.toText() === scope) {
          none = false;
          break;
        }
      }
      if (none) {
        return false;
      }
    }
  }
  return true;
}
class AttributesIdentity {
  /**
   * @param options - Configuration for the identity.
   * @param options.inner - The inner identity to delegate signing to.
   * @param options.attributes - The signed attributes to include in the request.
   * @param options.signer - The canister that signed the attributes.
   */
  constructor(options) {
    __privateAdd(this, _inner);
    __privateAdd(this, _attributes);
    __privateAdd(this, _signer);
    __privateSet(this, _inner, options.inner);
    __privateSet(this, _attributes, options.attributes);
    __privateSet(this, _signer, options.signer);
  }
  getPrincipal() {
    return __privateGet(this, _inner).getPrincipal();
  }
  transformRequest(request) {
    if (request.endpoint === Endpoint.ReadState) {
      return __privateGet(this, _inner).transformRequest(request);
    }
    return __privateGet(this, _inner).transformRequest({
      ...request,
      body: {
        ...request.body,
        sender_info: {
          signer: __privateGet(this, _signer).canisterId.toUint8Array(),
          info: __privateGet(this, _attributes).data,
          sig: __privateGet(this, _attributes).signature
        }
      }
    });
  }
}
_inner = new WeakMap();
_attributes = new WeakMap();
_signer = new WeakMap();
const GENERIC_ERROR = 1e3;
const NETWORK_ERROR = 4e3;
const toBase64$1 = (bytes) => {
  if ("toBase64" in bytes && typeof bytes.toBase64 === "function") {
    return bytes.toBase64();
  }
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis.btoa(binary);
};
const fromBase64$1 = (str) => {
  if ("fromBase64" in Uint8Array && typeof Uint8Array.fromBase64 === "function") {
    return Uint8Array.fromBase64(str);
  }
  const binary = globalThis.atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};
const asRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
const asString = (value) => typeof value === "string" ? value : void 0;
const asArray = (value) => Array.isArray(value) ? value : void 0;
const bytesEqual = (a, b) => a.length === b.length && a.every((byte, index) => byte === b[index]);
const toExpiration = (value) => {
  if (typeof value !== "string" || !/^[0-9]{1,20}$/.test(value)) {
    throw new Error("Invalid delegation expiration");
  }
  const expiration = BigInt(value);
  if (expiration >= 2n ** 64n) {
    throw new Error("Invalid delegation expiration");
  }
  return expiration;
};
const assertLeafKey = (delegations, publicKey) => {
  var _a2;
  const leaf = (_a2 = delegations[delegations.length - 1]) == null ? void 0 : _a2.delegation.pubkey;
  if (leaf !== void 0 && bytesEqual(new Uint8Array(leaf), new Uint8Array(publicKey.toDer()))) {
    return;
  }
  throw new Error("Returned delegation chain does not terminate at the requested public key");
};
const assertTargetScope = (delegations, targets) => {
  if (targets === void 0) {
    return;
  }
  const requested = new Set(targets.map((target) => target.toText()));
  const scopedHops = delegations.map(({ delegation }) => delegation.targets).filter((hopTargets) => hopTargets !== void 0);
  if (scopedHops.length === 0) {
    throw new Error("Returned delegation is unscoped but scoped targets were requested");
  }
  let effective;
  for (const hop of scopedHops) {
    const hopSet = new Set(hop.map((target) => target.toText()));
    effective = effective === void 0 ? hopSet : new Set([...effective].filter((target) => hopSet.has(target)));
  }
  for (const target of effective ?? []) {
    if (!requested.has(target)) {
      throw new Error("Returned delegation targets are broader than requested");
    }
  }
};
const assertLifetime = (delegations, maxTimeToLive) => {
  const first = delegations[0];
  if (maxTimeToLive === void 0 || first === void 0) {
    return;
  }
  const delegationChainExpiration = delegations.reduce((earliestExpiration, { delegation }) => delegation.expiration < earliestExpiration ? delegation.expiration : earliestExpiration, first.delegation.expiration);
  const skewNs = 5n * 60n * 1000000000n;
  const maxExpiration = BigInt(Date.now()) * 1000000n + maxTimeToLive + skewNs;
  if (delegationChainExpiration > maxExpiration) {
    throw new Error("Returned delegation expires later than the requested maxTimeToLive");
  }
};
const validateDelegationChain = (chain, params) => {
  assertLeafKey(chain.delegations, params.publicKey);
  assertTargetScope(chain.delegations, params.targets);
  assertLifetime(chain.delegations, params.maxTimeToLive);
};
const jsonCleanTransform = (request) => JSON.parse(JSON.stringify(request));
const icrc95DerivationOriginTransform = (derivationOrigin) => {
  return (request) => ({
    ...request,
    params: {
      ...request.params,
      icrc95DerivationOrigin: derivationOrigin
    }
  });
};
class SignerError extends Error {
  constructor(error, options) {
    super(error.message, options);
    /** The JSON-RPC error code. */
    __publicField(this, "code");
    /** Optional additional error data from the signer. */
    __publicField(this, "data");
    this.code = error.code;
    this.data = error.data;
  }
}
class Signer {
  constructor(options) {
    __privateAdd(this, _Signer_instances);
    __privateAdd(this, _options);
    __privateAdd(this, _channel);
    __privateAdd(this, _establishingChannel);
    __privateAdd(this, _scheduledChannelClosure);
    __privateAdd(this, _pendingRequestCount, 0);
    const transforms = [...options.transforms ?? []];
    if (options.derivationOrigin) {
      transforms.push(icrc95DerivationOriginTransform(options.derivationOrigin));
    }
    transforms.push(jsonCleanTransform);
    __privateSet(this, _options, {
      autoCloseTransportChannel: true,
      closeTransportChannelAfter: 200,
      crypto: globalThis.crypto,
      ...options,
      transforms
    });
  }
  /** The transport used to communicate with the signer. */
  get transport() {
    return __privateGet(this, _options).transport;
  }
  /**
   * Whether the transport channel auto-closes after a response is received.
   * Can be toggled at runtime, which is useful for multi-step flows that
   * need to await async work between requests without losing the channel.
   * Setting this to `false` also cancels any auto-close already scheduled
   * by a prior response.
   */
  get autoCloseTransportChannel() {
    return __privateGet(this, _options).autoCloseTransportChannel;
  }
  set autoCloseTransportChannel(value) {
    __privateGet(this, _options).autoCloseTransportChannel = value;
    if (!value) {
      clearTimeout(__privateGet(this, _scheduledChannelClosure));
    }
  }
  /**
   * Opens a communication channel with the signer.
   * Reuses an existing open channel if available.
   */
  async openChannel() {
    clearTimeout(__privateGet(this, _scheduledChannelClosure));
    if (__privateGet(this, _establishingChannel)) {
      await __privateGet(this, _establishingChannel);
    }
    if (__privateGet(this, _channel) && !__privateGet(this, _channel).closed) {
      return __privateGet(this, _channel);
    }
    const channel = __privateGet(this, _options).transport.establishChannel();
    __privateSet(this, _establishingChannel, channel.then(() => {
    }).catch(() => {
    }));
    __privateSet(this, _channel, void 0);
    __privateSet(this, _channel, await channel.catch((error) => {
      throw new SignerError({
        code: NETWORK_ERROR,
        message: error instanceof Error ? error.message : "Network error"
      }, { cause: error });
    }));
    __privateSet(this, _establishingChannel, void 0);
    return __privateGet(this, _channel);
  }
  /** Closes the current communication channel, if open. */
  async closeChannel() {
    var _a2;
    await ((_a2 = __privateGet(this, _channel)) == null ? void 0 : _a2.close());
  }
  /**
   * Sends a JSON-RPC request over the transport channel.
   * @param request - The JSON-RPC request to send.
   */
  async sendRequest(request) {
    const channel = await this.openChannel();
    const { promise, resolve, reject } = Promise.withResolvers();
    const expectsResponse = request.id !== void 0 && request.id !== null;
    if (expectsResponse) {
      __privateWrapper(this, _pendingRequestCount)._++;
    }
    let settled = false;
    const settle = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (expectsResponse) {
        __privateWrapper(this, _pendingRequestCount)._--;
      }
    };
    const removeResponseListener = channel.addEventListener("response", (response) => {
      if (response.id !== request.id) {
        return;
      }
      removeResponseListener();
      removeCloseListener();
      settle();
      if ("error" in response && (typeof response.error !== "object" || response.error === null || typeof response.error.code !== "number" || typeof response.error.message !== "string")) {
        resolve({
          jsonrpc: "2.0",
          id: response.id,
          error: { code: GENERIC_ERROR, message: "Invalid error response from signer" }
        });
      } else {
        resolve(response);
      }
      if (__privateGet(this, _options).autoCloseTransportChannel && __privateGet(this, _pendingRequestCount) === 0) {
        __privateSet(this, _scheduledChannelClosure, setTimeout(() => {
          if (!channel.closed) {
            channel.close();
          }
        }, __privateGet(this, _options).closeTransportChannelAfter));
      }
    });
    const removeCloseListener = channel.addEventListener("close", () => {
      removeResponseListener();
      removeCloseListener();
      settle();
      reject(new SignerError({
        code: NETWORK_ERROR,
        message: "Channel was closed before a response was received"
      }));
    });
    let transformedRequest;
    try {
      transformedRequest = __privateMethod(this, _Signer_instances, applyTransforms_fn).call(this, request);
    } catch (cause) {
      removeResponseListener();
      removeCloseListener();
      settle();
      reject(new SignerError({
        code: GENERIC_ERROR,
        message: `Transform failed: ${cause instanceof Error ? cause.message : cause}`
      }, { cause }));
      return promise;
    }
    try {
      await channel.send(transformedRequest);
    } catch (error) {
      removeResponseListener();
      removeCloseListener();
      settle();
      reject(new SignerError({
        code: NETWORK_ERROR,
        message: error instanceof Error ? error.message : "Network error"
      }, { cause: error }));
    }
    return promise;
  }
  /**
   * Queries which ICRC standards the signer supports.
   * Use this to determine signer capabilities before calling other methods.
   * @see https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md
   */
  getSupportedStandards() {
    return __privateMethod(this, _Signer_instances, rpc_fn).call(this, {
      method: "icrc25_supported_standards",
      decode: (result) => {
        const r = asRecord(result);
        const standards = asArray(r == null ? void 0 : r.supportedStandards);
        if (!standards) {
          throw new Error("Expected supportedStandards array");
        }
        return standards.map((item) => {
          const obj = asRecord(item);
          const name = asString(obj == null ? void 0 : obj.name);
          const url = asString(obj == null ? void 0 : obj.url);
          if (name === void 0 || url === void 0) {
            throw new Error("Expected { name, url }");
          }
          return { name, url };
        });
      }
    });
  }
  /**
   * Requests the signer to grant permission for the given scopes.
   * The signer may prompt the user for approval.
   * @param scopes - The permission scopes to request.
   * @returns The current state of each requested scope after the user's decision.
   */
  requestPermissions(scopes) {
    return __privateMethod(this, _Signer_instances, rpc_fn).call(this, {
      method: "icrc25_request_permissions",
      params: scopes,
      encode: (scopes2) => ({ scopes: scopes2 }),
      decode: (result) => {
        const r = asRecord(result);
        const scopes2 = asArray(r == null ? void 0 : r.scopes);
        if (!scopes2) {
          throw new Error("Expected scopes array");
        }
        return scopes2.map((item) => {
          const obj = asRecord(item);
          const scope = asRecord(obj == null ? void 0 : obj.scope);
          const state = asString(obj == null ? void 0 : obj.state);
          if (!scope || typeof scope.method !== "string" || !state) {
            throw new Error("Expected { scope: { method }, state }");
          }
          return { scope, state };
        });
      }
    });
  }
  /**
   * Queries the current state of all permission scopes.
   * @returns The current permission state for each scope the signer supports.
   */
  getPermissions() {
    return __privateMethod(this, _Signer_instances, rpc_fn).call(this, {
      method: "icrc25_permissions",
      decode: (result) => {
        const r = asRecord(result);
        const scopes = asArray(r == null ? void 0 : r.scopes);
        if (!scopes) {
          throw new Error("Expected scopes array");
        }
        return scopes.map((item) => {
          const obj = asRecord(item);
          const scope = asRecord(obj == null ? void 0 : obj.scope);
          const state = asString(obj == null ? void 0 : obj.state);
          if (!scope || typeof scope.method !== "string" || !state) {
            throw new Error("Expected { scope: { method }, state }");
          }
          return { scope, state };
        });
      }
    });
  }
  /**
   * Requests the accounts managed by the signer.
   * Each account has an owner {@link Principal} and an optional 32-byte subaccount.
   *
   * Requires the `icrc27_accounts` permission scope.
   * @see https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_27_accounts.md
   */
  getAccounts() {
    return __privateMethod(this, _Signer_instances, rpc_fn).call(this, {
      method: "icrc27_accounts",
      decode: (result) => {
        const r = asRecord(result);
        const accounts = asArray(r == null ? void 0 : r.accounts);
        if (!accounts) {
          throw new Error("Expected accounts array");
        }
        return accounts.map((item) => {
          const obj = asRecord(item);
          const owner = asString(obj == null ? void 0 : obj.owner);
          const subaccount = asString(obj == null ? void 0 : obj.subaccount);
          if (!owner) {
            throw new Error("Expected account.owner string");
          }
          return {
            owner: Principal.fromText(owner),
            subaccount: subaccount !== void 0 ? fromBase64$1(subaccount) : void 0
          };
        });
      }
    });
  }
  /**
   * Requests a delegation chain from the signer for session-based authentication.
   * This allows the relying party to sign canister calls without requiring
   * user approval for each individual call.
   * @param params - The delegation request parameters.
   * @param params.publicKey - The session's public key to delegate to.
   * @param params.targets - Optional canister IDs to restrict the delegation to.
   *   When provided, the signer creates an account delegation; otherwise a
   *   relying party delegation.
   * @param params.maxTimeToLive - Optional maximum delegation lifetime in nanoseconds.
   * @returns A {@link DelegationChain} that can be used with `DelegationIdentity`.
   * @see https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_34_delegation.md
   */
  requestDelegation(params) {
    return __privateMethod(this, _Signer_instances, rpc_fn).call(this, {
      method: "icrc34_delegation",
      params,
      encode: (v) => {
        var _a2;
        return {
          publicKey: toBase64$1(new Uint8Array(v.publicKey.toDer())),
          targets: (_a2 = v.targets) == null ? void 0 : _a2.map((t) => t.toText()),
          maxTimeToLive: v.maxTimeToLive !== void 0 ? String(v.maxTimeToLive) : void 0
        };
      },
      decode: (result) => {
        const r = asRecord(result);
        const publicKey = asString(r == null ? void 0 : r.publicKey);
        const signerDelegation = asArray(r == null ? void 0 : r.signerDelegation);
        if (!publicKey || !signerDelegation) {
          throw new Error("Expected { publicKey, signerDelegation }");
        }
        const chain = DelegationChain.fromDelegations(signerDelegation.map((item) => {
          const obj = asRecord(item);
          const del = asRecord(obj == null ? void 0 : obj.delegation);
          const pubkey = asString(del == null ? void 0 : del.pubkey);
          const expiration = del == null ? void 0 : del.expiration;
          const signature = asString(obj == null ? void 0 : obj.signature);
          if (!pubkey || expiration === void 0 || !signature) {
            throw new Error("Expected delegation { pubkey, expiration, signature }");
          }
          const targets = asArray(del == null ? void 0 : del.targets);
          return {
            delegation: new Delegation(fromBase64$1(pubkey), toExpiration(expiration), targets == null ? void 0 : targets.map((t) => Principal.fromText(t))),
            signature: fromBase64$1(signature)
          };
        }), fromBase64$1(publicKey));
        validateDelegationChain(chain, params);
        return chain;
      }
    });
  }
  /**
   * Requests the signer to execute a canister call on behalf of the user.
   * The signer will prompt the user for approval before signing and
   * submitting the call to the Internet Computer.
   * @param params - The canister call parameters.
   * @param params.canisterId - The target canister.
   * @param params.sender - The principal executing the call.
   * @param params.method - The canister method to invoke.
   * @param params.arg - The Candid-encoded call arguments.
   * @param params.nonce - Optional nonce (max 32 bytes) for replay protection.
   * @returns The CBOR-encoded content map and certificate from the IC,
   *   which can be used to verify the call's execution.
   * @see https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_49_call_canister.md
   */
  callCanister(params) {
    return __privateMethod(this, _Signer_instances, rpc_fn).call(this, {
      method: "icrc49_call_canister",
      params,
      encode: (v) => ({
        canisterId: v.canisterId.toText(),
        sender: v.sender.toText(),
        method: v.method,
        arg: toBase64$1(v.arg),
        nonce: v.nonce !== void 0 ? toBase64$1(v.nonce) : void 0
      }),
      decode: (result) => {
        const r = asRecord(result);
        const contentMap = asString(r == null ? void 0 : r.contentMap);
        const certificate = asString(r == null ? void 0 : r.certificate);
        if (!contentMap || !certificate) {
          throw new Error("Expected { contentMap, certificate }");
        }
        return { contentMap: fromBase64$1(contentMap), certificate: fromBase64$1(certificate) };
      }
    });
  }
}
_options = new WeakMap();
_channel = new WeakMap();
_establishingChannel = new WeakMap();
_scheduledChannelClosure = new WeakMap();
_pendingRequestCount = new WeakMap();
_Signer_instances = new WeakSet();
rpc_fn = async function(args) {
  let params;
  if (args.encode) {
    try {
      params = args.encode(args.params);
    } catch (cause) {
      throw new SignerError({
        code: GENERIC_ERROR,
        message: `Failed to encode params: ${cause instanceof Error ? cause.message : cause}`
      }, { cause });
    }
  }
  const response = await this.sendRequest({
    id: __privateGet(this, _options).crypto.randomUUID(),
    jsonrpc: "2.0",
    method: args.method,
    params
  });
  if ("error" in response) {
    throw new SignerError(response.error);
  }
  if ("result" in response) {
    try {
      return args.decode(response.result);
    } catch (cause) {
      throw new SignerError({
        code: GENERIC_ERROR,
        message: `Invalid result from signer: ${cause instanceof Error ? cause.message : cause}`
      }, { cause });
    }
  }
  throw new SignerError({
    code: GENERIC_ERROR,
    message: "Response contains neither result nor error"
  });
};
/**
 * Applies all configured transforms to a JSON-RPC request.
 * @param request - The JSON-RPC request to transform.
 */
applyTransforms_fn = function(request) {
  return __privateGet(this, _options).transforms.reduce((req, transform) => transform(req), request);
};
const isJsonRpcResponse = (message) => typeof message === "object" && message !== null && message.jsonrpc === "2.0" && "id" in message && (typeof message.id === "string" || typeof message.id === "number");
class HeartbeatClient {
  constructor(options) {
    __privateAdd(this, _HeartbeatClient_instances);
    __privateAdd(this, _options2);
    __privateAdd(this, _status);
    __privateSet(this, _options2, {
      establishTimeout: 1e4,
      pendingTimeout: 3e5,
      disconnectTimeout: 5e3,
      statusPollingRate: 300,
      window: globalThis.window,
      crypto: globalThis.crypto,
      ...options
    });
    __privateMethod(this, _HeartbeatClient_instances, establish_fn).call(this);
  }
}
_options2 = new WeakMap();
_status = new WeakMap();
_HeartbeatClient_instances = new WeakSet();
establish_fn = function() {
  let pending = [];
  const create = () => {
    const id = __privateGet(this, _options2).crypto.randomUUID();
    pending.push(id);
    return id;
  };
  const listener = __privateMethod(this, _HeartbeatClient_instances, receiveStatusResponse_fn).call(this, (response) => {
    if ("result" in response.data && response.data.id !== null && pending.includes(response.data.id)) {
      pending = [];
      listener();
      clearInterval(interval);
      clearTimeout(timeout);
      __privateSet(this, _status, response.data.result);
      __privateGet(this, _options2).onEstablish(response.origin, response.data.result);
      __privateMethod(this, _HeartbeatClient_instances, maintain_fn).call(this, response.origin, response.data.result);
    }
  });
  const timeout = setTimeout(() => {
    listener();
    clearInterval(interval);
    __privateGet(this, _options2).onEstablishTimeout();
  }, __privateGet(this, _options2).establishTimeout);
  const interval = setInterval(() => __privateMethod(this, _HeartbeatClient_instances, sendStatusRequest_fn).call(this, create()), __privateGet(this, _options2).statusPollingRate);
};
maintain_fn = function(origin, status) {
  let timeout;
  let pending = [];
  const consume = (id) => {
    const index = pending.findIndex((entry) => entry.id === id);
    if (index > -1) {
      pending.splice(index, 1);
    }
    return index > -1;
  };
  const create = () => {
    const id = __privateGet(this, _options2).crypto.randomUUID();
    const time = Date.now();
    pending = pending.filter((entry) => time - __privateGet(this, _options2).disconnectTimeout > entry.time);
    pending.push({ id, time });
    return id;
  };
  const resetTimeout = (status2) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      listener();
      __privateGet(this, _options2).onDisconnect();
    }, status2 === "pending" ? __privateGet(this, _options2).pendingTimeout : __privateGet(this, _options2).disconnectTimeout);
  };
  const listener = __privateMethod(this, _HeartbeatClient_instances, receiveStatusResponse_fn).call(this, (response) => {
    if ("result" in response.data && response.data.id !== null && response.origin === origin && consume(response.data.id)) {
      resetTimeout(response.data.result);
      if (__privateGet(this, _status) !== response.data.result) {
        __privateSet(this, _status, response.data.result);
        __privateGet(this, _options2).onStatusChange(response.data.result);
      }
    }
    setTimeout(() => __privateMethod(this, _HeartbeatClient_instances, sendStatusRequest_fn).call(this, create()), __privateGet(this, _options2).statusPollingRate);
  });
  resetTimeout(status);
  __privateMethod(this, _HeartbeatClient_instances, sendStatusRequest_fn).call(this, create());
};
receiveStatusResponse_fn = function(handler) {
  const listener = (event) => {
    if (event.source === __privateGet(this, _options2).signerWindow && isJsonRpcResponse(event.data) && "result" in event.data && (event.data.result === "pending" || event.data.result === "ready")) {
      handler(event);
    }
  };
  __privateGet(this, _options2).window.addEventListener("message", listener);
  return () => __privateGet(this, _options2).window.removeEventListener("message", listener);
};
sendStatusRequest_fn = function(id) {
  __privateGet(this, _options2).signerWindow.postMessage({ jsonrpc: "2.0", id, method: "icrc29_status" }, "*");
};
const NON_CLICK_ESTABLISHMENT_LINK = "https://github.com/slide-computer/signer-js/blob/main/packages/signer-web/README.md#channels-must-be-established-in-a-click-handler";
class PostMessageTransportError extends Error {
}
let withinClick = false;
if (globalThis.window) {
  globalThis.window.addEventListener("click", () => withinClick = true, true);
  globalThis.window.addEventListener("click", () => withinClick = false);
}
class PostMessageTransport {
  constructor(options) {
    __privateAdd(this, _options3);
    const isSecureContext = (() => {
      try {
        const url = new URL(options.url);
        return url.protocol === "https:" || url.hostname === "127.0.0.1" || url.hostname.split(".").slice(-1)[0] === "localhost";
      } catch {
        return false;
      }
    })();
    if (!isSecureContext) {
      throw new PostMessageTransportError("Invalid signer RPC url");
    }
    __privateSet(this, _options3, {
      windowOpenerFeatures: "",
      window: globalThis.window,
      establishTimeout: 12e4,
      pendingTimeout: 3e5,
      disconnectTimeout: 2e3,
      statusPollingRate: 300,
      crypto: globalThis.crypto,
      manageFocus: true,
      closeOnEstablishTimeout: true,
      closeOnPendingTimeout: true,
      detectNonClickEstablishment: true,
      ...options
    });
  }
  /**
   * Opens the signer window and establishes a communication channel
   * via the ICRC-29 heartbeat handshake.
   * @throws {PostMessageTransportError} If called outside a click handler
   *   (when `detectNonClickEstablishment` is enabled), if the window
   *   cannot be opened, or if the handshake times out.
   */
  establishChannel() {
    if (__privateGet(this, _options3).detectNonClickEstablishment && !withinClick) {
      return Promise.reject(new PostMessageTransportError(`Signer window should not be opened outside of click handler, see: ${NON_CLICK_ESTABLISHMENT_LINK}`));
    }
    let signerWindow;
    try {
      const result = __privateGet(this, _options3).window.open(__privateGet(this, _options3).url, `${new URL(__privateGet(this, _options3).url).origin}-signer-window`, __privateGet(this, _options3).windowOpenerFeatures);
      if (!result) {
        return Promise.reject(new PostMessageTransportError("Signer window could not be opened"));
      }
      signerWindow = result;
    } catch (error) {
      return Promise.reject(new PostMessageTransportError(error instanceof Error ? error.message : "Signer window could not be opened"));
    }
    return new Promise((resolve, reject) => {
      let channel;
      new HeartbeatClient({
        ...__privateGet(this, _options3),
        signerWindow,
        onEstablish: (origin, status) => {
          channel = new PostMessageChannel({
            ...__privateGet(this, _options3),
            signerOrigin: origin,
            signerWindow,
            signerStatus: status
          });
          resolve(channel);
        },
        onEstablishTimeout: () => {
          if (__privateGet(this, _options3).closeOnEstablishTimeout) {
            signerWindow.close();
          }
          reject(new PostMessageTransportError("Communication channel could not be established within a reasonable time"));
        },
        onPendingTimeout: () => {
          if (__privateGet(this, _options3).closeOnPendingTimeout) {
            signerWindow.close();
          }
          reject(new PostMessageTransportError("Communication channel was pending for too long"));
        },
        onDisconnect: () => channel.close(),
        onStatusChange: (status) => channel.changeStatus(status)
      });
    });
  }
}
_options3 = new WeakMap();
class PostMessageChannel {
  constructor(options) {
    __privateAdd(this, _closeListeners, /* @__PURE__ */ new Set());
    __privateAdd(this, _options4);
    __privateAdd(this, _closed, false);
    __privateAdd(this, _pendingQueue, []);
    __privateSet(this, _options4, {
      signerStatus: "ready",
      window: globalThis.window,
      manageFocus: true,
      ...options
    });
  }
  /** Whether this channel has been closed. */
  get closed() {
    return __privateGet(this, _closed) || __privateGet(this, _options4).signerWindow.closed;
  }
  addEventListener(...[event, listener]) {
    switch (event) {
      case "close":
        __privateGet(this, _closeListeners).add(listener);
        return () => {
          __privateGet(this, _closeListeners).delete(listener);
        };
      case "response": {
        const messageListener = (event2) => {
          if (event2.source !== __privateGet(this, _options4).signerWindow || event2.origin !== __privateGet(this, _options4).signerOrigin || !isJsonRpcResponse(event2.data)) {
            return;
          }
          listener(event2.data);
        };
        __privateGet(this, _options4).window.addEventListener("message", messageListener);
        return () => {
          __privateGet(this, _options4).window.removeEventListener("message", messageListener);
        };
      }
    }
  }
  /**
   * Sends a JSON-RPC request to the signer. If the signer status is
   * `"pending"`, the request is queued until {@link changeStatus} is
   * called with `"ready"`.
   * @param request - The JSON-RPC request to send.
   */
  send(request) {
    if (this.closed) {
      return Promise.reject(new PostMessageTransportError("Communication channel is closed"));
    }
    if (__privateGet(this, _options4).signerStatus === "pending") {
      __privateGet(this, _pendingQueue).push(request);
      return Promise.resolve();
    }
    try {
      __privateGet(this, _options4).signerWindow.postMessage(request, __privateGet(this, _options4).signerOrigin);
      if (__privateGet(this, _options4).manageFocus) {
        __privateGet(this, _options4).signerWindow.focus();
      }
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.resolve();
  }
  /** Closes the signer window and notifies all close listeners. */
  close() {
    if (__privateGet(this, _closed)) {
      return Promise.resolve();
    }
    __privateSet(this, _closed, true);
    __privateGet(this, _options4).signerWindow.close();
    if (__privateGet(this, _options4).manageFocus) {
      __privateGet(this, _options4).window.focus();
    }
    for (const listener of __privateGet(this, _closeListeners)) {
      listener();
    }
    return Promise.resolve();
  }
  /**
   * Updates the signer status. When transitioning to `"ready"`,
   * all queued messages are flushed to the signer window.
   * @param status - The new signer status.
   */
  changeStatus(status) {
    __privateGet(this, _options4).signerStatus = status;
    if (status === "ready") {
      const requests = __privateGet(this, _pendingQueue);
      __privateSet(this, _pendingQueue, []);
      requests.forEach((request) => {
        __privateGet(this, _options4).signerWindow.postMessage(request, __privateGet(this, _options4).signerOrigin);
      });
    }
  }
}
_closeListeners = new WeakMap();
_options4 = new WeakMap();
_closed = new WeakMap();
_pendingQueue = new WeakMap();
const requestKey = (request) => JSON.stringify({ method: request.method, params: request.params ?? null });
class UrlChannel {
  constructor(flow) {
    __privateAdd(this, _flow);
    __privateAdd(this, _closeListeners2, /* @__PURE__ */ new Set());
    __privateAdd(this, _responseListeners, /* @__PURE__ */ new Set());
    __privateAdd(this, _closed2, false);
    __privateSet(this, _flow, flow);
  }
  /** Whether this channel has been closed. */
  get closed() {
    return __privateGet(this, _closed2);
  }
  addEventListener(...[event, listener]) {
    switch (event) {
      case "close":
        __privateGet(this, _closeListeners2).add(listener);
        return () => {
          __privateGet(this, _closeListeners2).delete(listener);
        };
      case "response":
        __privateGet(this, _responseListeners).add(listener);
        return () => {
          __privateGet(this, _responseListeners).delete(listener);
        };
    }
  }
  /**
   * Resolves the request from the journal if the flow has already reached this
   * call, otherwise buffers it for the next redirect.
   * @param request - The JSON-RPC request to send.
   */
  send(request) {
    if (__privateGet(this, _closed2)) {
      return Promise.reject(new Error("Communication channel is closed"));
    }
    if (request.id === void 0 || request.id === null) {
      return Promise.reject(new Error("The URL transport requires a request id; notifications are not supported"));
    }
    const index = __privateGet(this, _flow).next();
    const key = requestKey(request);
    const cached = __privateGet(this, _flow).get(index);
    if (cached !== void 0) {
      if (__privateGet(this, _flow).recordedRequestKey(index) !== key) {
        return Promise.reject(new Error("URL transport replay diverged: the request at this step differs from the one sent before the redirect. Issue the same requests in the same order on every load."));
      }
      const response = { ...cached, id: request.id ?? null };
      queueMicrotask(() => {
        for (const listener of __privateGet(this, _responseListeners)) {
          listener(response);
        }
      });
      return Promise.resolve();
    }
    __privateGet(this, _flow).request(index, request, key);
    return Promise.resolve();
  }
  /** Marks the channel closed and notifies all close listeners. */
  close() {
    if (__privateGet(this, _closed2)) {
      return Promise.resolve();
    }
    __privateSet(this, _closed2, true);
    for (const listener of __privateGet(this, _closeListeners2)) {
      listener();
    }
    return Promise.resolve();
  }
}
_flow = new WeakMap();
_closeListeners2 = new WeakMap();
_responseListeners = new WeakMap();
_closed2 = new WeakMap();
const isLoopbackHost$1 = (hostname) => hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "[::1]" || /^127(?:\.\d{1,3}){3}$/.test(hostname);
const isSecureContextUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" && isLoopbackHost$1(url.hostname);
  } catch {
    return false;
  }
};
const readStored = (storage, key) => {
  const raw = storage.getItem(key);
  if (raw === null) {
    return { results: {} };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      createdAt: parsed.createdAt,
      url: parsed.url,
      results: parsed.results ?? {},
      asyncSlots: parsed.asyncSlots,
      requestKeys: parsed.requestKeys,
      pending: parsed.pending
    };
  } catch {
    return { results: {} };
  }
};
const parseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return void 0;
  }
};
class UrlFlow {
  constructor(options) {
    __privateAdd(this, _UrlFlow_instances);
    __privateAdd(this, _options5);
    __privateAdd(this, _results);
    __privateAdd(this, _index, 0);
    __privateAdd(this, _navigated, false);
    __privateAdd(this, _createdAt);
    // The redirect target used for navigation. Seeded from the constructor url,
    // but on a signer return replaced by the target persisted on the first load,
    // so a second hop reaches the same signer even when the return-load url is a
    // bare default (see StoredFlow.url).
    __privateAdd(this, _url);
    // Call-order slots whose producer was async, so a replay returns a promise
    // (see StoredFlow.asyncSlots).
    __privateAdd(this, _asyncSlots);
    // Content fingerprint per request slot, for the replay divergence guard
    // (see StoredFlow.requestKeys).
    __privateAdd(this, _requestKeys, {});
    __privateAdd(this, _buffer, []);
    __privateAdd(this, _inFlight, 0);
    __privateAdd(this, _flushTimer);
    __privateSet(this, _options5, options);
    __privateSet(this, _url, options.url);
    __privateSet(this, _asyncSlots, /* @__PURE__ */ new Set());
    const stored = readStored(options.storage, options.storageKey);
    const expired = stored.createdAt !== void 0 && options.now() - stored.createdAt > options.flowTimeout;
    if (expired) {
      options.storage.removeItem(options.storageKey);
    }
    const params = new URLSearchParams(options.location.hash.slice(1));
    const message = params.get("message");
    const state = params.get("state");
    if (message !== null) {
      options.history.replaceState(null, "", options.location.pathname + options.location.search);
    }
    if (!expired && message !== null && stored.pending !== void 0 && state === stored.pending.state) {
      __privateSet(this, _createdAt, stored.createdAt);
      __privateSet(this, _url, stored.url ?? options.url);
      __privateSet(this, _results, { ...stored.results });
      __privateSet(this, _asyncSlots, new Set(stored.asyncSlots));
      __privateSet(this, _requestKeys, { ...stored.requestKeys });
      const parsed = parseJson(message);
      const responses = Array.isArray(parsed) ? parsed : [parsed];
      for (const { index, id } of stored.pending.requests) {
        const match = responses.find((response) => isJsonRpcResponse(response) && response.id === id);
        if (match !== void 0) {
          __privateGet(this, _results)[index] = match;
        }
      }
      __privateMethod(this, _UrlFlow_instances, persist_fn).call(this);
    } else {
      __privateSet(this, _results, {});
    }
  }
  /** Reserves the next call-order slot. */
  next() {
    return __privateWrapper(this, _index)._++;
  }
  /**
   * The stored result for a slot, or `undefined` if it has not completed.
   * @param index - The call-order slot to read.
   */
  get(index) {
    return __privateGet(this, _results)[index];
  }
  /**
   * The content fingerprint recorded for a request slot, or `undefined` if no
   * request was journaled there. Used by the channel's replay divergence guard.
   * @param index - The call-order slot to read.
   */
  recordedRequestKey(index) {
    return __privateGet(this, _requestKeys)[index];
  }
  /**
   * Buffers an uncached request for the next redirect.
   * @param index - The call-order slot reserved for the request.
   * @param request - The JSON-RPC request to send on the next redirect.
   * @param key - Content fingerprint recorded for the divergence guard.
   */
  request(index, request, key) {
    __privateGet(this, _buffer).push({ index, request });
    __privateGet(this, _requestKeys)[index] = key;
    __privateMethod(this, _UrlFlow_instances, scheduleFlush_fn).call(this);
  }
  memoize(produce) {
    const index = this.next();
    const cached = this.get(index);
    if (cached !== void 0) {
      if (__privateGet(this, _requestKeys)[index] !== void 0) {
        throw new Error("URL transport replay diverged: a memoize step is at a slot that held a request before the redirect. Issue the same requests and memoize steps in the same order on every load.");
      }
      return __privateGet(this, _asyncSlots).has(index) ? Promise.resolve(cached) : cached;
    }
    const record = (value, isAsync) => {
      __privateGet(this, _results)[index] = value;
      if (isAsync) {
        __privateGet(this, _asyncSlots).add(index);
      }
      __privateMethod(this, _UrlFlow_instances, persist_fn).call(this);
      return value;
    };
    const release = () => {
      __privateWrapper(this, _inFlight)._--;
      __privateMethod(this, _UrlFlow_instances, scheduleFlush_fn).call(this);
    };
    __privateWrapper(this, _inFlight)._++;
    let produced;
    try {
      produced = produce();
    } catch (error) {
      release();
      throw error;
    }
    if (produced instanceof Promise) {
      return produced.then((value) => record(value, true)).finally(release);
    }
    try {
      return record(produced, false);
    } finally {
      release();
    }
  }
}
_options5 = new WeakMap();
_results = new WeakMap();
_index = new WeakMap();
_navigated = new WeakMap();
_createdAt = new WeakMap();
_url = new WeakMap();
_asyncSlots = new WeakMap();
_requestKeys = new WeakMap();
_buffer = new WeakMap();
_inFlight = new WeakMap();
_flushTimer = new WeakMap();
_UrlFlow_instances = new WeakSet();
scheduleFlush_fn = function() {
  if (__privateGet(this, _flushTimer) !== void 0) {
    clearTimeout(__privateGet(this, _flushTimer));
  }
  __privateSet(this, _flushTimer, setTimeout(() => __privateMethod(this, _UrlFlow_instances, flush_fn).call(this), 0));
};
flush_fn = function() {
  __privateSet(this, _flushTimer, void 0);
  if (__privateGet(this, _inFlight) > 0 || __privateGet(this, _buffer).length === 0) {
    return;
  }
  __privateMethod(this, _UrlFlow_instances, navigate_fn).call(this);
};
navigate_fn = function() {
  if (__privateGet(this, _navigated)) {
    return;
  }
  __privateSet(this, _navigated, true);
  const batch = __privateGet(this, _buffer);
  __privateSet(this, _buffer, []);
  const state = __privateGet(this, _options5).crypto.randomUUID();
  __privateMethod(this, _UrlFlow_instances, persist_fn).call(this, {
    state,
    requests: batch.map(({ index, request }) => ({ index, id: request.id ?? null }))
  });
  const requests = batch.map(({ request }) => request);
  const message = JSON.stringify(requests.length === 1 ? requests[0] : requests);
  const fragment = new URLSearchParams({
    message,
    callback: __privateGet(this, _options5).callbackUrl,
    state
  });
  if (!isSecureContextUrl(__privateGet(this, _url))) {
    throw new Error("Refusing to navigate to a non-secure-context signer URL");
  }
  __privateGet(this, _options5).location.assign(`${__privateGet(this, _url)}#${fragment.toString()}`);
};
persist_fn = function(pending) {
  __privateGet(this, _createdAt) ?? __privateSet(this, _createdAt, __privateGet(this, _options5).now());
  __privateGet(this, _options5).storage.setItem(__privateGet(this, _options5).storageKey, JSON.stringify({
    createdAt: __privateGet(this, _createdAt),
    url: __privateGet(this, _url),
    results: __privateGet(this, _results),
    asyncSlots: [...__privateGet(this, _asyncSlots)],
    requestKeys: __privateGet(this, _requestKeys),
    pending
  }));
};
class UrlTransportError extends Error {
}
class UrlTransport {
  constructor(options) {
    __privateAdd(this, _flow2);
    if (!isSecureContextUrl(options.url)) {
      throw new UrlTransportError("Invalid signer RPC url");
    }
    let callback;
    try {
      callback = new URL(options.callbackUrl);
    } catch {
      throw new UrlTransportError("Invalid callback url");
    }
    if (callback.hash !== "") {
      throw new UrlTransportError("Callback url must not contain a fragment");
    }
    __privateSet(this, _flow2, new UrlFlow({
      url: options.url,
      callbackUrl: options.callbackUrl,
      storage: options.storage ?? globalThis.sessionStorage,
      storageKey: options.storageKey ?? `icrc167:flow:${options.callbackUrl}`,
      flowTimeout: options.flowTimeout ?? 6e5,
      location: options.location ?? globalThis.location,
      history: options.history ?? globalThis.history,
      crypto: options.crypto ?? globalThis.crypto,
      now: options.now ?? (() => Date.now())
    }));
  }
  /** Establishes a channel that drives this transport's shared flow journal. */
  establishChannel() {
    return Promise.resolve(new UrlChannel(__privateGet(this, _flow2)));
  }
  memoize(produce) {
    return __privateGet(this, _flow2).memoize(produce);
  }
}
_flow2 = new WeakMap();
function withMintLock(name, mint) {
  var _a2;
  const locks = (_a2 = globalThis.navigator) == null ? void 0 : _a2.locks;
  if (name === null || locks === void 0) {
    return mint(new AbortController().signal);
  }
  const stolen = new AbortController();
  const held = locks.request(name, () => mint(stolen.signal));
  held.catch(() => stolen.abort());
  return held;
}
async function stealMintLock(name) {
  var _a2;
  const locks = (_a2 = globalThis.navigator) == null ? void 0 : _a2.locks;
  if (name === null || locks === void 0)
    return;
  await locks.request(name, { steal: true }, () => void 0).catch(() => void 0);
}
function stealLock(name) {
  var _a2;
  const stolen = new AbortController();
  const locks = (_a2 = globalThis.navigator) == null ? void 0 : _a2.locks;
  if (name === null || locks === void 0) {
    return { stolen: stolen.signal, release: () => {
    } };
  }
  let release = () => {
  };
  const held = new Promise((resolve) => {
    release = resolve;
  });
  void locks.request(name, { steal: true }, () => held).catch((error) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      stolen.abort();
    }
  });
  return { stolen: stolen.signal, release: () => release() };
}
function toBase64(bytes) {
  if ("toBase64" in bytes && typeof bytes.toBase64 === "function") {
    return bytes.toBase64();
  }
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis.btoa(binary);
}
function fromBase64(str) {
  if ("fromBase64" in Uint8Array && typeof Uint8Array.fromBase64 === "function") {
    return Uint8Array.fromBase64(str);
  }
  const binary = globalThis.atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function watchForeground(onForeground) {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function" || typeof document.removeEventListener !== "function" || typeof globalThis.addEventListener !== "function" || typeof globalThis.removeEventListener !== "function") {
    return void 0;
  }
  const onVisible = () => {
    if (document.visibilityState === "visible")
      onForeground();
  };
  document.addEventListener("visibilitychange", onVisible);
  globalThis.addEventListener("focus", onForeground);
  globalThis.addEventListener("pageshow", onForeground);
  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    globalThis.removeEventListener("focus", onForeground);
    globalThis.removeEventListener("pageshow", onForeground);
  };
}
const ACTIVITY_EVENTS = ["pointerdown", "mousedown", "mousemove", "keydown", "touchstart", "wheel"];
function watchActivity(onActivity) {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function" || typeof document.removeEventListener !== "function") {
    return void 0;
  }
  for (const event of ACTIVITY_EVENTS) {
    document.addEventListener(event, onActivity, { passive: true });
  }
  return () => {
    for (const event of ACTIVITY_EVENTS) {
      document.removeEventListener(event, onActivity);
    }
  };
}
const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
let idbProxyableTypes;
let cursorAdvanceMethods;
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const cursorRequestMap = /* @__PURE__ */ new WeakMap();
const transactionDoneMap = /* @__PURE__ */ new WeakMap();
const transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
const transformCache = /* @__PURE__ */ new WeakMap();
const reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request) {
  const promise = new Promise((resolve, reject) => {
    const unlisten = () => {
      request.removeEventListener("success", success);
      request.removeEventListener("error", error);
    };
    const success = () => {
      resolve(wrap(request.result));
      unlisten();
    };
    const error = () => {
      reject(request.error);
      unlisten();
    };
    request.addEventListener("success", success);
    request.addEventListener("error", error);
  });
  promise.then((value) => {
    if (value instanceof IDBCursor) {
      cursorRequestMap.set(value, request);
    }
  }).catch(() => {
  });
  reverseTransformCache.set(promise, request);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  if (transactionDoneMap.has(tx))
    return;
  const done = new Promise((resolve, reject) => {
    const unlisten = () => {
      tx.removeEventListener("complete", complete);
      tx.removeEventListener("error", error);
      tx.removeEventListener("abort", error);
    };
    const complete = () => {
      resolve();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException("AbortError", "AbortError"));
      unlisten();
    };
    tx.addEventListener("complete", complete);
    tx.addEventListener("error", error);
    tx.addEventListener("abort", error);
  });
  transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      if (prop === "done")
        return transactionDoneMap.get(target);
      if (prop === "objectStoreNames") {
        return target.objectStoreNames || transactionStoreNamesMap.get(target);
      }
      if (prop === "store") {
        return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    return wrap(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) {
    return function(storeNames, ...args) {
      const tx = func.call(unwrap(this), storeNames, ...args);
      transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
      return wrap(tx);
    };
  }
  if (getCursorAdvanceMethods().includes(func)) {
    return function(...args) {
      func.apply(unwrap(this), args);
      return wrap(cursorRequestMap.get(this));
    };
  }
  return function(...args) {
    return wrap(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === "function")
    return wrapFunction(value);
  if (value instanceof IDBTransaction)
    cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes()))
    return new Proxy(value, idbProxyTraps);
  return value;
}
function wrap(value) {
  if (value instanceof IDBRequest)
    return promisifyRequest(value);
  if (transformCache.has(value))
    return transformCache.get(value);
  const newValue = transformCachableValue(value);
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
  const request = indexedDB.open(name, version);
  const openPromise = wrap(request);
  if (upgrade) {
    request.addEventListener("upgradeneeded", (event) => {
      upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
    });
  }
  if (blocked) {
    request.addEventListener("blocked", (event) => blocked(
      // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
      event.oldVersion,
      event.newVersion,
      event
    ));
  }
  openPromise.then((db) => {
    if (terminated)
      db.addEventListener("close", () => terminated());
    if (blocking) {
      db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
    }
  }).catch(() => {
  });
  return openPromise;
}
const readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
const writeMethods = ["put", "add", "delete", "clear"];
const cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
    return;
  }
  if (cachedMethods.get(prop))
    return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, "");
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
  ) {
    return;
  }
  const method = async function(storeName, ...args) {
    const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
    let target2 = tx.store;
    if (useIndex)
      target2 = target2.index(args.shift());
    return (await Promise.all([
      target2[targetFuncName](...args),
      isWrite && tx.done
    ]))[0];
  };
  cachedMethods.set(prop, method);
  return method;
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));
const DB_VERSION = 1;
const AUTH_DB_NAME = "auth-client-db";
const OBJECT_STORE_NAME = "ic-keyval";
const _openDbStore = async (dbName = AUTH_DB_NAME, storeName = OBJECT_STORE_NAME, version, onTerminated) => {
  return await openDB(dbName, version, {
    upgrade: (database) => {
      if (database.objectStoreNames.contains(storeName)) {
        database.clear(storeName);
      }
      database.createObjectStore(storeName);
    },
    terminated: onTerminated
  });
};
async function _getValue(db, storeName, key) {
  return await db.get(storeName, key);
}
async function _setValue(db, storeName, key, value) {
  return await db.put(storeName, value, key);
}
async function _removeValue(db, storeName, key) {
  return await db.delete(storeName, key);
}
class IdbKeyVal {
  // Do not use - instead prefer create
  constructor(_dbName, _storeName, _version) {
    __publicField(this, "_dbName");
    __publicField(this, "_storeName");
    __publicField(this, "_version");
    __publicField(this, "_dbPromise", null);
    this._dbName = _dbName;
    this._storeName = _storeName;
    this._version = _version;
  }
  /**
   * @param {DBCreateOptions} options - DBCreateOptions
   * @param {DBCreateOptions['dbName']} options.dbName name for the indexeddb database
   * @default
   * @param {DBCreateOptions['storeName']} options.storeName name for the indexeddb Data Store
   * @default
   * @param {DBCreateOptions['version']} options.version version of the database. Increment to safely upgrade
   */
  static async create(options) {
    const { dbName = AUTH_DB_NAME, storeName = OBJECT_STORE_NAME, version = DB_VERSION } = options ?? {};
    const keyVal = new IdbKeyVal(dbName, storeName, version);
    await keyVal._openDb();
    return keyVal;
  }
  // The browser can force-close the connection at any time; the `terminated`
  // hook drops it so the next operation opens a fresh one.
  _openDb() {
    if (this._dbPromise === null) {
      const promise = _openDbStore(this._dbName, this._storeName, this._version, () => {
        if (this._dbPromise === promise) {
          this._dbPromise = null;
        }
      }).catch((error) => {
        if (this._dbPromise === promise) {
          this._dbPromise = null;
        }
        throw error;
      });
      this._dbPromise = promise;
    }
    return this._dbPromise;
  }
  // Chrome can force-close a connection without firing `terminated`; the next
  // transaction then throws an InvalidStateError. Drop the dead connection and
  // retry once on a fresh one.
  async _withDb(action) {
    const promise = this._openDb();
    const db = await promise;
    try {
      return await action(db);
    } catch (error) {
      const name = error !== null && typeof error === "object" && "name" in error && error.name;
      if (name !== "InvalidStateError") {
        throw error;
      }
      if (this._dbPromise === promise) {
        this._dbPromise = null;
      }
      return await action(await this._openDb());
    }
  }
  /**
   * Basic setter
   * @param {IDBValidKey} key string | number | Date | BufferSource | IDBValidKey[]
   * @param value value to set
   * @returns void
   */
  async set(key, value) {
    return await this._withDb((db) => _setValue(db, this._storeName, key, value));
  }
  /**
   * Basic getter
   * Pass in a type T for type safety if you know the type the value will have if it is found
   * @param {IDBValidKey} key string | number | Date | BufferSource | IDBValidKey[]
   * @returns `Promise<T | null>`
   * @example
   * await get<string>('exampleKey') -> 'exampleValue'
   */
  async get(key) {
    return await this._withDb(async (db) => await _getValue(db, this._storeName, key) ?? null);
  }
  /**
   * Remove a key
   * @param key {@link IDBValidKey}
   * @returns void
   */
  async remove(key) {
    return await this._withDb((db) => _removeValue(db, this._storeName, key));
  }
}
class IdbCredentialStorage {
  /**
   * @param options - Database name, store name and version.
   */
  constructor(options) {
    __privateAdd(this, _IdbCredentialStorage_instances);
    __publicField(this, "shared", true);
    __publicField(this, "durable", true);
    __privateAdd(this, _options6);
    // Opened on first use, and forgotten again if opening failed, so a later call
    // retries rather than reusing a rejected promise.
    __privateAdd(this, _dbPromise, null);
    __privateSet(this, _options6, options ?? {});
  }
  create() {
    return ECDSAKeyIdentity.generate({ extractable: false });
  }
  async get(slot) {
    const db = await __privateGet(this, _IdbCredentialStorage_instances, db_get);
    const stored = await db.get(slot);
    if (!stored)
      return null;
    try {
      const identity = await ECDSAKeyIdentity.fromKeyPair(stored.keyPair);
      const chain = stored.chain === void 0 ? void 0 : DelegationChain.fromJSON(stored.chain);
      return { identity, chain };
    } catch {
      return null;
    }
  }
  async set(slot, credential) {
    const db = await __privateGet(this, _IdbCredentialStorage_instances, db_get);
    await db.set(slot, {
      keyPair: credential.identity.getKeyPair(),
      chain: credential.chain && JSON.stringify(credential.chain.toJSON())
    });
  }
  async remove(slot) {
    const db = await __privateGet(this, _IdbCredentialStorage_instances, db_get);
    await db.remove(slot);
  }
}
_options6 = new WeakMap();
_dbPromise = new WeakMap();
_IdbCredentialStorage_instances = new WeakSet();
db_get = function() {
  if (__privateGet(this, _dbPromise) === null) {
    const promise = IdbKeyVal.create(__privateGet(this, _options6)).catch((error) => {
      if (__privateGet(this, _dbPromise) === promise) {
        __privateSet(this, _dbPromise, null);
      }
      throw error;
    });
    __privateSet(this, _dbPromise, promise);
  }
  return __privateGet(this, _dbPromise);
};
const SESSION_DELEGATION_METHOD = "ii_session_delegation";
const INTERACTION_REQUIRED_CODE = 3002;
class InteractionRequiredError extends Error {
  constructor(message, reason) {
    super(message);
    /**
     * Why, where Internet Identity said: `login_required` where it holds no
     * session, `account_selection_required` where it holds more than one and the
     * request named none.
     *
     * A caller may word its prompt from this and does not have to branch on it, so
     * it is deliberately a string rather than a union — a value this library does
     * not know is not a reason to fail.
     */
    __publicField(this, "reason");
    this.name = "InteractionRequiredError";
    this.reason = reason;
  }
}
const looksLikeResult = (value) => {
  const result = value;
  return typeof (result == null ? void 0 : result.publicKey) === "string" && Array.isArray(result == null ? void 0 : result.signerDelegation) && // An empty list builds a chain whose earliest expiry is 0, so it reads as a
  // session that expired at the epoch rather than as a bad response.
  result.signerDelegation.length > 0;
};
async function requestSessionDelegation(signer, params) {
  const response = await signer.sendRequest({
    jsonrpc: "2.0",
    id: globalThis.crypto.randomUUID(),
    method: SESSION_DELEGATION_METHOD,
    params: {
      sessionPublicKey: toBase64(params.sessionPublicKey),
      ...params.maxTimeToLive === void 0 ? {} : { maxTimeToLive: params.maxTimeToLive.toString() },
      ...params.maxTimeToIdle === void 0 ? {} : { maxTimeToIdle: params.maxTimeToIdle.toString() },
      ...params.derivationOrigin === void 0 ? {} : { icrc95DerivationOrigin: params.derivationOrigin }
    }
  });
  if ("error" in response) {
    if (response.error.code === INTERACTION_REQUIRED_CODE) {
      const data = response.error.data;
      const reason = typeof data === "object" && data !== null && "reason" in data ? String(data.reason) : void 0;
      throw new InteractionRequiredError(response.error.message, reason);
    }
    throw new Error(response.error.message);
  }
  const result = response.result;
  if (!looksLikeResult(result)) {
    throw new Error("Invalid session response: missing publicKey, or missing or empty signerDelegation");
  }
  return DelegationChain.fromDelegations(result.signerDelegation.map(({ delegation, signature }) => {
    var _a2;
    return {
      delegation: new Delegation(fromBase64(delegation.pubkey), BigInt(delegation.expiration), (_a2 = delegation.targets) == null ? void 0 : _a2.map((target) => Principal.fromText(target))),
      signature: fromBase64(signature)
    };
  }), fromBase64(result.publicKey));
}
const BLOCK_MARGIN_MS = 1e4;
const PRE_MINT_THRESHOLD_MS = 15e3;
const expiresAtMs = (chain) => {
  var _a2;
  return Number(chain.delegations.reduce((soonest, { delegation }) => delegation.expiration < soonest ? delegation.expiration : soonest, ((_a2 = chain.delegations[0]) == null ? void 0 : _a2.delegation.expiration) ?? 0n) / 1000000n);
};
const msLeftOf = (chain) => expiresAtMs(chain) - Date.now();
const accountOf = (chain) => Principal.selfAuthenticating(new Uint8Array(chain.publicKey));
const isForAccount = (held, expected) => {
  if (!chainAuthorisesKey(held.chain, held.identity.getPublicKey().toDer()))
    return false;
  return expected === void 0 || accountOf(held.chain).compareTo(expected) === "eq";
};
async function readSlot({ storage, slot, evictSpent, verify }) {
  const stored = await storage.get(slot).catch(() => null);
  if (!(stored == null ? void 0 : stored.chain))
    return void 0;
  if (msLeftOf(stored.chain) <= 0) {
    if (evictSpent) {
      await storage.remove(slot).catch(() => void 0);
    }
    return void 0;
  }
  const credential = { identity: stored.identity, chain: stored.chain };
  if (verify !== void 0 && !verify(credential))
    return void 0;
  return credential;
}
async function acquireCredential({ storage, slot, source, lockName, verify, adopt, onGone }) {
  return withMintLock(lockName, async (stolen) => {
    const stored = await readSlot({ storage, slot, evictSpent: true, verify });
    if (adopt && stored && msLeftOf(stored.chain) > PRE_MINT_THRESHOLD_MS)
      return stored;
    const identity = await storage.create();
    let chain;
    try {
      chain = await source.mint(identity.getPublicKey().toDer());
    } catch (error) {
      if (error instanceof SessionGoneError)
        onGone == null ? void 0 : onGone();
      throw error;
    }
    const credential = { identity, chain };
    if (verify !== void 0 && !verify(credential)) {
      throw new AccountMismatchError();
    }
    if (stolen.aborted) {
      onGone == null ? void 0 : onGone();
      throw new SessionGoneError("The session ended while this mint was in flight");
    }
    await storage.set(slot, credential).catch(() => void 0);
    return credential;
  });
}
const sessionHasLifeLeft = (sessionExpiresAtMs) => sessionExpiresAtMs - Date.now() > BLOCK_MARGIN_MS;
const lockNameFor = (storage, slot) => (
  // A store no other tab can read has nothing another tab could adopt, so
  // serialising would spread the mints without preventing any of them.
  storage.shared ? slot : null
);
const _SessionIdentity = class _SessionIdentity extends DelegationIdentity {
  constructor(options) {
    const held = {};
    super({
      sign: (blob) => {
        var _a2;
        const key = (_a2 = held.current) == null ? void 0 : _a2.identity;
        if (!key)
          throw new Error("This identity holds no delegation yet");
        return key.sign(blob);
      }
    }, DelegationChain.fromDelegations([], options.accountKey));
    __privateAdd(this, _SessionIdentity_instances);
    __privateAdd(this, _source);
    __privateAdd(this, _storage);
    __privateAdd(this, _slot);
    __privateAdd(this, _onSessionGone);
    __privateAdd(this, _sessionExpiresAtMs);
    /** The account every credential must be rooted at, derived once. */
    __privateAdd(this, _account);
    /** Reached by the base class's `sign`, so rotating does not change the object. */
    __privateAdd(this, _held);
    __privateAdd(this, _inFlight2);
    __privateAdd(this, _currentWasUsed, false);
    __privateAdd(this, _scheduled);
    __privateAdd(this, _reportedGone, false);
    __privateAdd(this, _unsupported);
    __privateSet(this, _held, held);
    __privateSet(this, _source, options.source);
    __privateSet(this, _storage, options.storage);
    __privateSet(this, _slot, options.slot);
    __privateSet(this, _onSessionGone, options.onSessionGone);
    __privateSet(this, _sessionExpiresAtMs, options.sessionExpiresAtMs);
    __privateSet(this, _account, Principal.selfAuthenticating(new Uint8Array(options.accountKey)));
  }
  /**
   * Builds an identity for a session, resolving the account key it needs.
   *
   * The account key cannot be worked out from the session — the session chain is
   * rooted at the session's own key, and the state carries the account's
   * principal, which is a hash of the account key rather than the key. So the
   * only two places one can come from are a credential the store already holds
   * and a mint, and a caller with neither has to wait for the mint before an
   * identity exists at all.
   *
   * That resolution goes through the same locked read-or-mint every rotation
   * uses, which is what keeps the app slot to one writer: doing it here, outside
   * the lock, is how a page load could overwrite a credential a peer tab had just
   * minted, and it would skip the read that lets this tab adopt that credential
   * instead of paying for its own.
   *
   * The identity comes back already holding what was resolved, so a caller does
   * not have to refresh it before use.
   * @param options - As the constructor takes them, less the account key.
   */
  static async create(options) {
    var _a2;
    if (!sessionHasLifeLeft(options.sessionExpiresAtMs)) {
      options.onSessionGone();
      throw new SessionGoneError("The session has expired");
    }
    const credential = await acquireCredential({
      storage: options.storage,
      slot: options.slot,
      source: options.source,
      lockName: lockNameFor(options.storage, options.slot),
      verify: (candidate) => isForAccount(candidate, options.expectedAccount),
      // A caller that cannot name the account has nothing to check the slot
      // against, so it mints rather than trusting what is there: a mint reports
      // the account, and is the only thing that can establish one.
      adopt: options.expectedAccount !== void 0,
      onGone: options.onSessionGone
    });
    const identity = new _SessionIdentity({
      ...options,
      accountKey: credential.chain.publicKey
    });
    __privateMethod(_a2 = identity, _SessionIdentity_instances, adopt_fn).call(_a2, credential);
    return identity;
  }
  getDelegation() {
    var _a2;
    return ((_a2 = __privateGet(this, _held).current) == null ? void 0 : _a2.chain) ?? super.getDelegation();
  }
  async transformRequest(request) {
    const credential = await __privateMethod(this, _SessionIdentity_instances, usable_fn).call(this);
    __privateSet(this, _currentWasUsed, true);
    return DelegationIdentity.fromDelegation(credential.identity, credential.chain).transformRequest(request);
  }
  /**
   * Says somebody is here, and mints now if one is due.
   *
   * For a caller that knows the moment is a good one, such as a page load, a tab
   * coming back to the foreground, or a pointer moving. The caller says when;
   * this still decides whether, so a credential with plenty of life left costs
   * no call.
   *
   * It is never a no-op, though: being here counts as use, exactly as signing a
   * request does, so the credential held afterwards has earned the next
   * rotation. Without that a session bounded by how long it goes unminted would
   * end under a user who is reading rather than clicking — the delegation would
   * only ever be replaced in the last {@link PRE_MINT_THRESHOLD_MS} of its life,
   * and only if a pointer happened to move inside that window.
   */
  async refresh() {
    await __privateMethod(this, _SessionIdentity_instances, refreshIfDue_fn).call(this);
    __privateSet(this, _currentWasUsed, true);
  }
  /** Drops the scheduled refresh. */
  dispose() {
    clearTimeout(__privateGet(this, _scheduled));
    __privateSet(this, _scheduled, void 0);
  }
};
_source = new WeakMap();
_storage = new WeakMap();
_slot = new WeakMap();
_onSessionGone = new WeakMap();
_sessionExpiresAtMs = new WeakMap();
_account = new WeakMap();
_held = new WeakMap();
_inFlight2 = new WeakMap();
_currentWasUsed = new WeakMap();
_scheduled = new WeakMap();
_reportedGone = new WeakMap();
_unsupported = new WeakMap();
_SessionIdentity_instances = new WeakSet();
refreshIfDue_fn = async function() {
  const current = __privateGet(this, _held).current;
  if (current && __privateMethod(this, _SessionIdentity_instances, msLeft_fn).call(this, current.chain) > PRE_MINT_THRESHOLD_MS)
    return;
  if (current === void 0) {
    const stored = await __privateMethod(this, _SessionIdentity_instances, readStored_fn).call(this);
    if (stored && __privateMethod(this, _SessionIdentity_instances, msLeft_fn).call(this, stored.chain) > PRE_MINT_THRESHOLD_MS) {
      __privateMethod(this, _SessionIdentity_instances, adopt_fn).call(this, stored);
      return;
    }
  }
  await __privateMethod(this, _SessionIdentity_instances, mint_fn).call(this).catch(() => void 0);
};
lockName_get = function() {
  return lockNameFor(__privateGet(this, _storage), __privateGet(this, _slot));
};
isForThisSession_fn = function(held) {
  return isForAccount(held, __privateGet(this, _account));
};
msLeft_fn = function(chain) {
  return expiresAtMs(chain) - Date.now();
};
/**
 * The stored credential, where there is one this session may use.
 *
 * Whatever another tab minted arrives this way: sharing is a read of the store
 * rather than a conversation, which works whether the other tabs are running,
 * frozen, or gone.
 *
 * Takes no lock, so it declines a spent record rather than evicting it. The
 * mint that follows evicts under the lock, per {@link readSlot}.
 */
readStored_fn = function() {
  return readSlot({
    storage: __privateGet(this, _storage),
    slot: __privateGet(this, _slot),
    evictSpent: false,
    verify: (candidate) => __privateMethod(this, _SessionIdentity_instances, isForThisSession_fn).call(this, candidate)
  });
};
usable_fn = async function() {
  const current = __privateGet(this, _held).current;
  if (current) {
    const left = __privateMethod(this, _SessionIdentity_instances, msLeft_fn).call(this, current.chain);
    if (left > PRE_MINT_THRESHOLD_MS)
      return current;
    if (left > BLOCK_MARGIN_MS) {
      void __privateMethod(this, _SessionIdentity_instances, mint_fn).call(this).catch(() => void 0);
      return current;
    }
  }
  return __privateMethod(this, _SessionIdentity_instances, mint_fn).call(this);
};
mint_fn = function() {
  __privateGet(this, _inFlight2) ?? __privateSet(this, _inFlight2, __privateMethod(this, _SessionIdentity_instances, mintOnce_fn).call(this).finally(() => {
    __privateSet(this, _inFlight2, void 0);
  }));
  return __privateGet(this, _inFlight2);
};
mintOnce_fn = async function() {
  if (__privateGet(this, _unsupported))
    throw __privateGet(this, _unsupported);
  if (!sessionHasLifeLeft(__privateGet(this, _sessionExpiresAtMs))) {
    __privateMethod(this, _SessionIdentity_instances, reportGone_fn).call(this);
    throw new SessionGoneError("The session has expired");
  }
  let credential;
  try {
    credential = await acquireCredential({
      storage: __privateGet(this, _storage),
      slot: __privateGet(this, _slot),
      source: __privateGet(this, _source),
      lockName: __privateGet(this, _SessionIdentity_instances, lockName_get),
      // Every mint after the first must be rooted at the account already
      // established: one that is not is a failed mint, never a new principal.
      verify: (candidate) => __privateMethod(this, _SessionIdentity_instances, isForThisSession_fn).call(this, candidate),
      adopt: true,
      onGone: () => __privateMethod(this, _SessionIdentity_instances, reportGone_fn).call(this)
    });
  } catch (error) {
    if (error instanceof SessionUnsupportedError) {
      __privateSet(this, _unsupported, error);
      this.dispose();
    }
    throw error;
  }
  __privateMethod(this, _SessionIdentity_instances, adopt_fn).call(this, credential);
  return credential;
};
adopt_fn = function(credential) {
  __privateGet(this, _held).current = credential;
  __privateSet(this, _currentWasUsed, false);
  __privateMethod(this, _SessionIdentity_instances, schedule_fn).call(this, credential.chain);
};
schedule_fn = function(chain) {
  var _a2, _b;
  clearTimeout(__privateGet(this, _scheduled));
  const delay = __privateMethod(this, _SessionIdentity_instances, msLeft_fn).call(this, chain) - PRE_MINT_THRESHOLD_MS;
  if (delay <= 0)
    return;
  __privateSet(this, _scheduled, setTimeout(() => {
    if (__privateGet(this, _currentWasUsed))
      void __privateMethod(this, _SessionIdentity_instances, mint_fn).call(this).catch(() => void 0);
  }, delay));
  (_b = (_a2 = __privateGet(this, _scheduled)).unref) == null ? void 0 : _b.call(_a2);
};
reportGone_fn = function() {
  if (__privateGet(this, _reportedGone))
    return;
  __privateSet(this, _reportedGone, true);
  this.dispose();
  __privateGet(this, _onSessionGone).call(this);
};
let SessionIdentity = _SessionIdentity;
const idlFactory = ({ IDL }) => {
  const SessionKey = IDL.Vec(IDL.Nat8);
  const Timestamp = IDL.Nat64;
  const AppSessionError = IDL.Variant({
    NoSuchSession: IDL.Null,
    NoSuchDelegation: IDL.Null,
    InternalCanisterError: IDL.Text
  });
  const CandidDelegation = IDL.Record({
    pubkey: SessionKey,
    expiration: Timestamp,
    targets: IDL.Opt(IDL.Vec(IDL.Principal)),
    permissions: IDL.Opt(IDL.Text)
  });
  return IDL.Service({
    app_prepare_delegation: IDL.Func([IDL.Record({ session_key: SessionKey })], [
      IDL.Variant({
        Ok: IDL.Record({ user_key: SessionKey, expiration: Timestamp }),
        Err: AppSessionError
      })
    ], []),
    app_get_delegation: IDL.Func([IDL.Record({ session_key: SessionKey, expiration: Timestamp })], [
      IDL.Variant({
        Ok: IDL.Record({ delegation: CandidDelegation, signature: SessionKey }),
        Err: AppSessionError
      })
    ], ["query"]),
    app_revoke_session: IDL.Func([], [IDL.Variant({ Ok: IDL.Null, Err: AppSessionError })], [])
  });
};
const isGone = (error) => "NoSuchSession" in error;
class NoSuchDelegationError extends Error {
  constructor() {
    super("Internet Identity signed no delegation for this key and expiration");
    this.name = "NoSuchDelegationError";
  }
}
const unwrapSessionResult = (result) => {
  if ("Ok" in result)
    return result.Ok;
  if (isGone(result.Err))
    throw new SessionGoneError();
  if ("NoSuchDelegation" in result.Err)
    throw new NoSuchDelegationError();
  const detail = "InternalCanisterError" in result.Err ? result.Err.InternalCanisterError : "";
  throw new Error(`Internet Identity could not mint a delegation${detail === "" ? "" : `: ${detail}`}`);
};
const _SessionMinter = class _SessionMinter {
  constructor(service) {
    __privateAdd(this, _SessionMinter_instances);
    __privateAdd(this, _service);
    __privateSet(this, _service, service);
  }
  static async create(options) {
    const { canisterId } = options;
    assertChainReaches(options.sessionChain, canisterId);
    const agent = await HttpAgent.create({
      ...options.agentOptions,
      // Last, so no agent option can replace the session these calls are made as.
      identity: DelegationIdentity.fromDelegation(options.sessionKey, options.sessionChain)
    });
    return new _SessionMinter(Actor.createActor(idlFactory, { agent, canisterId }));
  }
  /**
   * Prepares and fetches an app delegation, once more if the fetch finds nothing
   * signed for what the prepare handed out.
   *
   * The pair is two calls, and only the first of them is an update: an expiration
   * the canister will not sign for is one this session no longer holds, and the
   * answer is to prepare again rather than to sign in again. Attempted a second
   * time and no further — a third would be pursuing something other than the race
   * this covers.
   */
  async mint(appPublicKey) {
    try {
      return await __privateMethod(this, _SessionMinter_instances, mintOnce_fn2).call(this, appPublicKey);
    } catch (error) {
      if (!(error instanceof NoSuchDelegationError))
        throw error;
      return await __privateMethod(this, _SessionMinter_instances, mintOnce_fn2).call(this, appPublicKey);
    }
  }
  /**
   * Ends the session at the canister.
   *
   * Idempotent at the canister: a session that is already gone is `Ok`, because
   * the caller wanted it gone and it is gone. What comes back as an error is the
   * canister failing to write, and it is raised rather than dropped — an
   * application that told a user it signed them out of their apps should be able
   * to find out that it did not. The call can also fail the way any update call
   * can, and that rejection is the caller's to decide about too.
   */
  async revoke() {
    unwrapSessionResult(await __privateGet(this, _service).app_revoke_session());
  }
};
_service = new WeakMap();
_SessionMinter_instances = new WeakSet();
mintOnce_fn2 = async function(appPublicKey) {
  const prepared = unwrapSessionResult(await __privateGet(this, _service).app_prepare_delegation({ session_key: appPublicKey }));
  const signed = unwrapSessionResult(await __privateGet(this, _service).app_get_delegation({
    session_key: appPublicKey,
    // Exactly what was prepared. A different value is a different signature.
    expiration: prepared.expiration
  }));
  return appDelegationChain(prepared.user_key, signed);
};
let SessionMinter = _SessionMinter;
function appDelegationChain(userKey, signed) {
  if (signed.delegation.permissions.length > 0) {
    throw new Error("This session is read-only, which @icp-sdk/auth cannot act for yet: its delegations carry permissions that a delegation chain has no room for");
  }
  return DelegationChain.fromDelegations([
    {
      delegation: new Delegation(signed.delegation.pubkey, signed.delegation.expiration, signed.delegation.targets[0]),
      signature: signed.signature
    }
  ], userKey);
}
function assertChainReaches(chain, canisterId) {
  const hops = chain.delegations.map(({ delegation }) => delegation.targets);
  const restricting = hops.filter((hopTargets) => hopTargets !== void 0);
  if (restricting.length === 0) {
    throw new Error(`A session chain must be restricted to ${canisterId.toText()}, but no hop of this one names any canister`);
  }
  const namingNothing = restricting.some((hopTargets) => hopTargets.length === 0);
  if (namingNothing) {
    throw new Error(`A session chain must be restricted to ${canisterId.toText()}, but a hop of this one names nothing`);
  }
  const elsewhere = restricting.flat().filter((target) => target.compareTo(canisterId) !== "eq").map((target) => target.toText());
  if (elsewhere.length > 0) {
    throw new Error(`A session chain must be restricted to ${canisterId.toText()}, but this one also names ${[...new Set(elsewhere)].join(", ")}`);
  }
}
const SLOT_NAMES = {
  /** The session's key and the chain issued to it. */
  session: "session",
  /**
   * Where a sign-in ceremony keeps its key until it returns.
   *
   * Its own name rather than {@link SLOT_NAMES.session}, so a ceremony that is
   * cancelled or never comes back cannot take a working session with it.
   */
  sessionPending: "session-pending",
  /** The key an application signs with, and its delegation. */
  app: "app",
  /**
   * Where a ceremony keeps the credential it minted until its session is stored.
   *
   * The store reaches every tab of the origin, so writing to the app name during
   * a ceremony — or clearing it first — would change what those tabs act with
   * before the sign-in has succeeded. This is promoted instead, once there is a
   * session behind it.
   */
  appPending: "app-pending",
  /**
   * The record of who is signed in here and until when.
   *
   * Not a credential slot, and named here anyway: a namespace that moved the
   * credentials and left this fixed would give two clients their own keys and one
   * shared answer to who is signed in.
   */
  state: "ic-session-state"
};
const NAMESPACE_SEPARATOR = ":";
function slotsFor(namespace) {
  const prefix = namespace === void 0 ? "" : `${namespace}${NAMESPACE_SEPARATOR}`;
  return Object.fromEntries(Object.entries(SLOT_NAMES).map(([key, name]) => [key, `${prefix}${name}`]));
}
const MAX_AUTHORITY_LENGTH = 255;
function isLoopbackHost(host) {
  let url;
  try {
    url = new URL(`http://${host}`);
  } catch {
    return false;
  }
  if (url.pathname !== "/" || url.search !== "" || url.hash !== "") {
    return false;
  }
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}
function normalizeSsoDomain(domain) {
  const trimmed = domain.trim();
  if (trimmed.length === 0) {
    throw new Error("ssoDomain cannot be empty");
  }
  let url;
  try {
    url = new URL(`https://${trimmed}`);
  } catch {
    throw new Error(`ssoDomain is not a domain: ${trimmed}`);
  }
  const authority = url.host;
  if (new URL(`https://${authority}`).href !== url.href) {
    throw new Error(`ssoDomain must be a domain and optional port, nothing else: ${trimmed}`);
  }
  if (authority.length > MAX_AUTHORITY_LENGTH) {
    throw new Error(`ssoDomain exceeds ${MAX_AUTHORITY_LENGTH} characters`);
  }
  if (!authority.includes(".") && !isLoopbackHost(authority)) {
    throw new Error(`ssoDomain is not a domain name: ${trimmed}`);
  }
  return authority;
}
class LocalStateStorage {
  constructor() {
    __privateAdd(this, _LocalStateStorage_instances);
    // Fired on a same-tab write: `storage` reaches the other tabs of an origin and
    // deliberately not the one that wrote. Per key, because one store answers for
    // whatever key it is handed.
    __privateAdd(this, _subscribers, /* @__PURE__ */ new Map());
  }
  get(key) {
    const raw = __privateMethod(this, _LocalStateStorage_instances, localStorage_fn).call(this).getItem(key);
    if (raw === null)
      return null;
    const [principalText, expiration] = raw.split("|");
    if (principalText === void 0 || expiration === void 0)
      return null;
    try {
      return {
        principal: Principal.fromText(principalText),
        expiration: BigInt(expiration),
        // This record is written by this origin and read by no other, so having
        // one and holding a credential for it are the same thing.
        held: true
      };
    } catch {
      return null;
    }
  }
  set(key, state) {
    __privateMethod(this, _LocalStateStorage_instances, localStorage_fn).call(this).setItem(key, `${state.principal.toText()}|${state.expiration.toString()}`);
    __privateMethod(this, _LocalStateStorage_instances, fire_fn).call(this, key);
  }
  remove(key) {
    __privateMethod(this, _LocalStateStorage_instances, localStorage_fn).call(this).removeItem(key);
    __privateMethod(this, _LocalStateStorage_instances, fire_fn).call(this, key);
  }
  /** The same as {@link remove}: this store publishes nothing beyond the origin. */
  discard(key) {
    this.remove(key);
  }
  /**
   * Fires when the state changes, here or in another tab of this origin.
   *
   * `localStorage` raises `storage` in every tab except the one that wrote, so
   * that event carries a change between tabs and a same-tab write is announced
   * directly. Either way the record is readable before it is announced, so a
   * listener asking who is signed in sees what it was told about.
   */
  subscribe(key, listener) {
    let last = __privateMethod(this, _LocalStateStorage_instances, raw_fn).call(this, key);
    const check = () => {
      const now = __privateMethod(this, _LocalStateStorage_instances, raw_fn).call(this, key);
      if (now !== last) {
        last = now;
        listener();
      }
    };
    const listeners = __privateGet(this, _subscribers).get(key) ?? /* @__PURE__ */ new Set();
    listeners.add(check);
    __privateGet(this, _subscribers).set(key, listeners);
    const onStorage = (event) => {
      if (event.key === key || event.key === null)
        check();
    };
    globalThis.addEventListener("storage", onStorage);
    const onVisible = () => {
      if (document.visibilityState === "visible")
        check();
    };
    const hooked = typeof document !== "undefined";
    if (hooked) {
      document.addEventListener("visibilitychange", onVisible);
      globalThis.addEventListener("pageshow", check);
      globalThis.addEventListener("focus", check);
    }
    return () => {
      listeners.delete(check);
      globalThis.removeEventListener("storage", onStorage);
      if (hooked) {
        document.removeEventListener("visibilitychange", onVisible);
        globalThis.removeEventListener("pageshow", check);
        globalThis.removeEventListener("focus", check);
      }
    };
  }
}
_subscribers = new WeakMap();
_LocalStateStorage_instances = new WeakSet();
fire_fn = function(key) {
  for (const check of [...__privateGet(this, _subscribers).get(key) ?? []])
    check();
};
raw_fn = function(key) {
  return __privateMethod(this, _LocalStateStorage_instances, localStorage_fn).call(this).getItem(key);
};
localStorage_fn = function() {
  const ls = globalThis.localStorage;
  if (!ls) {
    throw new Error("Could not find local storage.");
  }
  return ls;
};
const CHANNEL_LOCK = "ic-auth-signer-channel";
const signInLockFor = (stateSlot) => `${stateSlot}:sign-in`;
const IDENTITY_PROVIDER_DEFAULT = "https://id.ai/authorize";
const IDENTITY_CANISTER_DEFAULT = "rdmx6-jaaaa-aaaaa-aaadq-cai";
const OPENID_PROVIDER_URLS = {
  google: "https://accounts.google.com",
  apple: "https://appleid.apple.com",
  microsoft: "https://login.microsoftonline.com/{tid}/v2.0"
};
const DEFAULT_OPENID_SCOPE_KEYS = ["name", "email", "verified_email"];
const DEFAULT_SSO_SCOPE_KEYS = ["name", "email"];
class SessionNotHeldError extends Error {
  constructor(message = "A sign-in exists for this domain, but this origin holds no credential for it") {
    super(message);
    this.name = "SessionNotHeldError";
  }
}
class SupersededError extends Error {
  constructor(message = "A later sign-in or sign-out took over from this one") {
    super(message);
    this.name = "SupersededError";
  }
}
class AuthClient {
  constructor(options = {}) {
    __privateAdd(this, _AuthClient_instances);
    __privateAdd(this, _identity, new AnonymousIdentity());
    __privateAdd(this, _credentialStorage);
    __privateAdd(this, _slots);
    __privateAdd(this, _canisterId);
    __privateAdd(this, _unwatchForeground);
    __privateAdd(this, _unwatchState);
    __privateAdd(this, _unwatchActivity);
    // `mousemove` fires by the dozen per second, and each call awaits a restore
    // before it can decide there is nothing to do. One at a time is enough: the
    // next event finds a fresher answer than the one already in flight anyway.
    __privateAdd(this, _refreshingInForeground, false);
    __privateAdd(this, _disposed, false);
    // Set while a further restore is pending, so a burst of changes is one pass.
    __privateAdd(this, _restoreQueued, false);
    // What `getStatus` answers with, replaced only when the record changes.
    __privateAdd(this, _status2);
    __privateAdd(this, _listeners, /* @__PURE__ */ new Set());
    // Set while a restore is running, so its own writes are not news.
    __privateAdd(this, _restoring, false);
    __privateAdd(this, _stateStorage);
    __privateAdd(this, _signer2);
    // Set only in redirect mode, so the redirect-specific paths (nonce/key
    // journaling) can reach `memoize`. Undefined in the default 'window' mode.
    __privateAdd(this, _urlTransport);
    __privateAdd(this, _options7);
    __privateAdd(this, _initPromise, null);
    // Signer interactions this client has in flight. One lock covers all of them:
    // `signIn` and `requestAttributes` overlapped share a channel on purpose, and
    // the channel closes when the last request settles, so they are one
    // interaction rather than two.
    __privateAdd(this, _interactions, 0);
    __privateAdd(this, _channelLock);
    __privateSet(this, _options7, options);
    __privateSet(this, _credentialStorage, options.credentialStorage ?? new IdbCredentialStorage());
    __privateSet(this, _slots, slotsFor(options.namespace));
    __privateSet(this, _stateStorage, options.stateStorage ?? new LocalStateStorage());
    if (typeof options.identityProvider === "string" || options.identityProvider instanceof URL) {
      throw new TypeError("identityProvider is now an object: pass { authorizeUrl, canisterId } — the URL a ceremony is rendered at, and the canister that mints");
    }
    const provider = options.identityProvider ?? {
      authorizeUrl: IDENTITY_PROVIDER_DEFAULT,
      canisterId: IDENTITY_CANISTER_DEFAULT
    };
    if (provider.authorizeUrl === void 0 || provider.canisterId === void 0) {
      throw new TypeError("identityProvider names authorizeUrl and canisterId together, or neither: nothing about the canister is derived from the URL");
    }
    __privateSet(this, _canisterId, Principal.from(provider.canisterId));
    const identityProviderUrl = new URL(provider.authorizeUrl.toString());
    if (!options.disableBrowserActivity) {
      const refresh = () => {
        void __privateMethod(this, _AuthClient_instances, refreshInForeground_fn).call(this);
      };
      __privateSet(this, _unwatchForeground, watchForeground(refresh));
      __privateSet(this, _unwatchActivity, watchActivity(refresh));
    }
    __privateSet(this, _status2, __privateMethod(this, _AuthClient_instances, readStatus_fn).call(this));
    __privateSet(this, _unwatchState, __privateGet(this, _stateStorage).subscribe(__privateGet(this, _slots).state, () => {
      __privateSet(this, _status2, __privateMethod(this, _AuthClient_instances, readStatus_fn).call(this));
      for (const listener of [...__privateGet(this, _listeners)])
        listener();
      if (__privateGet(this, _interactions) > 0 || __privateGet(this, _restoring) || __privateGet(this, _disposed))
        return;
      __privateMethod(this, _AuthClient_instances, restoreAgain_fn).call(this);
    }));
    if (options.openIdProvider !== void 0 && options.ssoDomain !== void 0) {
      throw new Error("openIdProvider and ssoDomain are mutually exclusive");
    }
    if (options.openIdProvider) {
      identityProviderUrl.searchParams.set("openid", OPENID_PROVIDER_URLS[options.openIdProvider]);
    }
    if (options.ssoDomain !== void 0) {
      identityProviderUrl.searchParams.set("sso", normalizeSsoDomain(options.ssoDomain));
      if (options.derivationOrigin !== void 0) {
        identityProviderUrl.searchParams.set("derivationOrigin", options.derivationOrigin.toString());
      }
    }
    if (options.prompt) {
      identityProviderUrl.searchParams.set("prompt", options.prompt);
    }
    if (options.hint) {
      identityProviderUrl.searchParams.set("hint", options.hint.toText());
    }
    if (options.resumable ?? __privateGet(this, _stateStorage).resumable ?? false) {
      identityProviderUrl.searchParams.set("resumable", "true");
    }
    const transport = options.transport === "redirect" ? new UrlTransport({
      url: identityProviderUrl.toString(),
      // The callback is this page: a fresh visit starts the flow and the
      // provider's return lands back here to replay it. Drop any query
      // and fragment so it stays stable across the redirect.
      callbackUrl: `${globalThis.location.origin}${globalThis.location.pathname}`
    }) : new PostMessageTransport({
      url: identityProviderUrl.toString(),
      windowOpenerFeatures: options.windowOpenerFeatures
    });
    __privateSet(this, _urlTransport, transport instanceof UrlTransport ? transport : void 0);
    __privateSet(this, _signer2, new Signer({
      transport,
      // Journal the derivation origin so it survives the top-level redirect: the
      // return load reconstructs this client from a query-less callback URL, so
      // `options.derivationOrigin` (like the identity provider) is no longer
      // available — the memoized value replays from the journal instead.
      // `memoize` returns synchronously for a synchronous producer, so the value
      // is usable directly here; in the window flow it is a passthrough that runs
      // the producer without persisting anything.
      derivationOrigin: this.memoize(() => {
        var _a2;
        return (_a2 = options.derivationOrigin) == null ? void 0 : _a2.toString();
      })
    }));
    __privateMethod(this, _AuthClient_instances, init_fn).call(this);
  }
  /**
   * Returns the current identity, restoring a previous session if available.
   */
  async getIdentity() {
    await __privateMethod(this, _AuthClient_instances, init_fn).call(this);
    const live = __privateMethod(this, _AuthClient_instances, readStatus_fn).call(this).state;
    if ((live === "signed-in" || live === "signed-in-elsewhere") && !__privateGet(this, _disposed) && __privateGet(this, _identity) instanceof AnonymousIdentity) {
      throw new SessionNotHeldError();
    }
    return __privateGet(this, _identity);
  }
  /**
   * Checks whether the user has an active, non-expired session.
   */
  isAuthenticated() {
    return this.getStatus().state === "signed-in";
  }
  /**
   * Who this origin can act as, or `undefined` where it cannot act.
   *
   * The same question {@link isAuthenticated} answers, returning who rather than
   * whether — so the two never disagree. Synchronous, and read from the state
   * rather than from whatever material happens to be held, so a page renders on
   * it without opening a store and without waiting for a mint. That is the
   * difference from `(await getIdentity()).getPrincipal()`, which is asynchronous
   * and, on a load with no delegation worth adopting, waits for one to be minted.
   *
   * A principal here means calls made as it will be accepted, so an expired
   * record answers `undefined` even though it still names an account, and so does
   * a record naming an account this origin holds nothing for. Returning one
   * anyway would have an application acting on a session that has ended: the
   * check most reach for is `if (getPrincipal())`, and it has to mean what it
   * looks like it means.
   *
   * {@link getStatus} is where those cases are readable, and it carries the
   * account principal in each of them — so nothing is lost by this being narrow,
   * and an application wanting to say whose session ended asks there.
   */
  getPrincipal() {
    const status = this.getStatus();
    return status.state === "signed-in" ? status.principal : void 0;
  }
  /**
   * Who is signed in for this origin right now.
   *
   * Synchronous, so a page can render on it without opening a store.
   */
  getStatus() {
    if (__privateGet(this, _status2).state !== "signed-out" && Date.now() >= __privateGet(this, _status2).expiresAtMs) {
      if (__privateGet(this, _status2).state !== "expired") {
        const { principal, expiresAtMs: expiresAtMs2 } = __privateGet(this, _status2);
        __privateSet(this, _status2, { state: "expired", principal, expiresAtMs: expiresAtMs2 });
      }
    }
    return __privateGet(this, _status2);
  }
  /**
   * Watches who is signed in here, and returns a function that stops watching.
   *
   * `getStatus()` and the predicates beside it are snapshots, so an application
   * rendering on them needs to be told when to read again. The record changes
   * for reasons that are nothing to do with this client — another tab signing
   * out, a sibling subdomain publishing a sign-in, a peer client on this page
   * re-issuing silently — and this is how those arrive.
   *
   * Fired once the record is readable, so a listener asking who is signed in
   * sees what it was told about. It says that something changed and not what: a
   * listener reads the answer it wants, which for most is `getStatus()`.
   *
   * What it does not cover is the identity being replaced under an application
   * that holds one — an app delegation rotating is deliberately invisible, and
   * nothing about who is signed in has changed when it does.
   * @param listener - Called after the record changes.
   * @returns A function that unregisters it.
   */
  subscribe(listener) {
    __privateGet(this, _listeners).add(listener);
    return () => {
      __privateGet(this, _listeners).delete(listener);
    };
  }
  /**
   * Releases what this client hooked: the browser listeners, the state
   * subscription, and the refresh the identity has scheduled. Call it when
   * discarding a client, so nothing it registered outlives it.
   */
  dispose() {
    var _a2, _b, _c, _d;
    __privateSet(this, _disposed, true);
    if (__privateGet(this, _identity) instanceof SessionIdentity)
      __privateGet(this, _identity).dispose();
    if (__privateGet(this, _interactions) > 0) {
      void __privateGet(this, _signer2).closeChannel().catch(() => void 0);
    }
    (_a2 = __privateGet(this, _channelLock)) == null ? void 0 : _a2.release();
    __privateSet(this, _channelLock, void 0);
    (_b = __privateGet(this, _unwatchForeground)) == null ? void 0 : _b.call(this);
    __privateSet(this, _unwatchForeground, void 0);
    (_c = __privateGet(this, _unwatchActivity)) == null ? void 0 : _c.call(this);
    __privateSet(this, _unwatchActivity, void 0);
    (_d = __privateGet(this, _unwatchState)) == null ? void 0 : _d.call(this);
    __privateSet(this, _unwatchState, void 0);
  }
  async signIn(options) {
    __privateMethod(this, _AuthClient_instances, beginInteraction_fn).call(this);
    try {
      return await __privateMethod(this, _AuthClient_instances, runSignIn_fn).call(this, options);
    } finally {
      __privateMethod(this, _AuthClient_instances, endInteraction_fn).call(this);
    }
  }
  /**
   * Requests signed identity attributes from the identity provider.
   *
   * The `nonce` is a callback that produces the 32-byte nonce (typically
   * fetched from the RP canister), returning a promise resolving to it. It is a
   * callback rather than a value so the redirect flow can journal the nonce and
   * reuse the exact same bytes when the flow replays on the return load,
   * instead of fetching a fresh single-use nonce that the signer never signed
   * against.
   *
   * In 'window' mode the callback lets the identity provider window open while the
   * nonce is still resolving, avoiding a perceived delay before the user sees
   * the prompt; auto-close of the signer transport channel is temporarily
   * disabled while awaiting so the window cannot be closed out from under the
   * pending flow.
   *
   * @param params - Request parameters.
   * @param params.keys - Attribute keys to request (e.g. `['email', 'name']`).
   * @param params.nonce - Produces the 32-byte nonce issued by the RP canister,
   *   as a promise resolving to it.
   * @returns Signed attribute data and signature.
   * @throws When the identity provider returns an error or an invalid response.
   */
  async requestAttributes(params) {
    __privateMethod(this, _AuthClient_instances, beginInteraction_fn).call(this);
    try {
      return await __privateMethod(this, _AuthClient_instances, runRequestAttributes_fn).call(this, params);
    } finally {
      __privateMethod(this, _AuthClient_instances, endInteraction_fn).call(this);
    }
  }
  memoize(produce) {
    if (__privateGet(this, _urlTransport)) {
      return __privateGet(this, _urlTransport).memoize(produce);
    }
    return produce();
  }
  /**
   * Clears the stored session and resets the client to an anonymous state.
   *
   * @param options - Sign-out options.
   * @param options.returnTo - URL to navigate to after sign-out.
   */
  async signOut(options = {}) {
    await __privateMethod(this, _AuthClient_instances, init_fn).call(this);
    const signOutLock = stealLock(signInLockFor(__privateGet(this, _slots).state));
    const session = await __privateGet(this, _credentialStorage).get(__privateGet(this, _slots).session).catch(() => null);
    await stealMintLock(__privateGet(this, _credentialStorage).shared ? __privateGet(this, _slots).app : null);
    const revoked = (session == null ? void 0 : session.chain) === void 0 || !("sign" in session.identity) ? Promise.resolve(void 0) : __privateMethod(this, _AuthClient_instances, revoke_fn).call(this, session.identity, session.chain).then(() => void 0, (error) => error);
    const cleared = __privateMethod(this, _AuthClient_instances, endSession_fn).call(this);
    __privateMethod(this, _AuthClient_instances, installIdentity_fn).call(this, new AnonymousIdentity());
    const [revokeFailure] = await Promise.all([revoked, cleared]);
    signOutLock.release();
    if (revokeFailure !== void 0)
      throw revokeFailure;
    if (options.returnTo !== void 0) {
      const target = sameOriginTarget(options.returnTo);
      if (target !== void 0) {
        window.location.assign(target.href);
      }
    }
  }
}
_identity = new WeakMap();
_credentialStorage = new WeakMap();
_slots = new WeakMap();
_canisterId = new WeakMap();
_unwatchForeground = new WeakMap();
_unwatchState = new WeakMap();
_unwatchActivity = new WeakMap();
_refreshingInForeground = new WeakMap();
_disposed = new WeakMap();
_restoreQueued = new WeakMap();
_status2 = new WeakMap();
_listeners = new WeakMap();
_restoring = new WeakMap();
_stateStorage = new WeakMap();
_signer2 = new WeakMap();
_urlTransport = new WeakMap();
_options7 = new WeakMap();
_initPromise = new WeakMap();
_interactions = new WeakMap();
_channelLock = new WeakMap();
_AuthClient_instances = new WeakSet();
/** Reads the record and builds the answer `getStatus` hands out. */
readStatus_fn = function() {
  const record = __privateGet(this, _stateStorage).get(__privateGet(this, _slots).state);
  if (record === null)
    return { state: "signed-out" };
  const { principal } = record;
  const expiresAtMs2 = Number(record.expiration / 1000000n);
  if (Date.now() >= expiresAtMs2) {
    return { state: "expired", principal, expiresAtMs: expiresAtMs2 };
  }
  return record.held ? { state: "signed-in", principal, expiresAtMs: expiresAtMs2 } : { state: "signed-in-elsewhere", principal, expiresAtMs: expiresAtMs2 };
};
/**
 * Opens the identity provider, requests a delegation, and returns the authenticated identity.
 *
 * @param options - Sign-in options.
 * @param options.maxTimeToLive - Maximum lifetime of the delegation in nanoseconds.
 * @param options.targets - Restrict the delegation to specific canisters.
 * @returns The authenticated identity.
 * @throws When authentication fails.
 *
 * @example
 * try {
 *   const identity = await authClient.signIn();
 * } catch (error) {
 *   console.error('Sign-in failed:', error);
 * }
 */
/**
 * Records that an interaction is under way, without asking the browser for
 * anything.
 *
 * Separate from taking the lock because of when each may happen: the count has
 * to be up before the first await, and a lock may only be asked for once the
 * signer window is open.
 */
/**
 * Installs the identity this client acts with, releasing the one it replaces.
 *
 * A {@link SessionIdentity} holds a scheduled refresh, so dropping the
 * reference without disposing leaves a timer that can still mint — into a slot
 * this client may no longer be the writer of, for a session it may no longer
 * hold. Every assignment goes through here so that no path can forget, which
 * matters most for the paths that give up rather than the ones that succeed:
 * those are the paths written to stop acting.
 */
installIdentity_fn = function(next) {
  const previous = __privateGet(this, _identity);
  if (previous !== next && previous instanceof SessionIdentity)
    previous.dispose();
  __privateSet(this, _identity, next);
};
beginInteraction_fn = function() {
  __privateSet(this, _interactions, __privateGet(this, _interactions) + 1);
};
openSignerChannel_fn = async function() {
  await __privateGet(this, _signer2).openChannel();
  if (__privateGet(this, _channelLock) === void 0) {
    const lock = stealLock(CHANNEL_LOCK);
    lock.stolen.addEventListener("abort", () => {
      void __privateGet(this, _signer2).closeChannel().catch(() => void 0);
    }, { once: true });
    __privateSet(this, _channelLock, lock);
  }
};
endInteraction_fn = function() {
  var _a2;
  __privateSet(this, _interactions, __privateGet(this, _interactions) - 1);
  if (__privateGet(this, _interactions) === 0) {
    (_a2 = __privateGet(this, _channelLock)) == null ? void 0 : _a2.release();
    __privateSet(this, _channelLock, void 0);
  }
};
/**
 * Refuses to go on where this operation is no longer the current one.
 *
 * Asked after the calls have returned and before anything shared is written,
 * which is where `acquireCredential` asks it for a mint and for the same
 * reason: a call already sent cannot be recalled, so the only thing left to
 * decide is whether to keep its result.
 */
assertCurrent_fn = function(signInLock) {
  var _a2;
  if (__privateGet(this, _disposed)) {
    throw new SupersededError("This client was disposed while signing in");
  }
  if (((_a2 = __privateGet(this, _channelLock)) == null ? void 0 : _a2.stolen.aborted) === true) {
    throw new SupersededError("Another signer interaction took the channel");
  }
  if (signInLock.stolen.aborted) {
    throw new SupersededError();
  }
};
runSignIn_fn = async function(options) {
  var _a2;
  const raw = options == null ? void 0 : options.returnTo;
  const returnTo = raw === void 0 ? void 0 : this.memoize(() => {
    var _a3;
    return ((_a3 = sameOriginTarget(raw)) == null ? void 0 : _a3.href) ?? null;
  });
  const sessionKeyPromise = __privateGet(this, _urlTransport) ? __privateMethod(this, _AuthClient_instances, ensureSessionKeyForRedirectFlow_fn).call(this, __privateGet(this, _urlTransport)) : __privateMethod(this, _AuthClient_instances, ensureSessionKeyForWindowFlow_fn).call(this).then((key) => ({ key }));
  void sessionKeyPromise.catch(() => void 0);
  await __privateMethod(this, _AuthClient_instances, openSignerChannel_fn).call(this);
  const signInLock = stealLock(signInLockFor(__privateGet(this, _slots).state));
  const guarded = async (write) => {
    __privateMethod(this, _AuthClient_instances, assertCurrent_fn).call(this, signInLock);
    await write();
  };
  try {
    await __privateMethod(this, _AuthClient_instances, init_fn).call(this);
    const { key, pending } = await sessionKeyPromise;
    if (!("sign" in key)) {
      throw new Error("A session needs a key that can sign");
    }
    const sessionChain = await requestSessionDelegation(__privateGet(this, _signer2), {
      sessionPublicKey: key.getPublicKey().toDer(),
      // Both bounds are sent only where the caller asked, so the provider's
      // own defaults apply otherwise rather than numbers this library
      // invented. How long a sign-in lasts is the provider's policy, narrowed
      // by what the user chooses at consent and by an organization's cap.
      maxTimeToLive: options == null ? void 0 : options.maxTimeToLive,
      maxTimeToIdle: options == null ? void 0 : options.maxTimeToIdle,
      derivationOrigin: (_a2 = __privateGet(this, _options7).derivationOrigin) == null ? void 0 : _a2.toString()
    });
    if (!chainAuthorisesKey(sessionChain, key.getPublicKey().toDer())) {
      throw new Error("The session chain does not delegate to the key it was requested for");
    }
    const minter = await __privateMethod(this, _AuthClient_instances, minterFor_fn).call(this, key, sessionChain);
    const appKey = await __privateGet(this, _credentialStorage).create();
    const appChain = await minter.mint(appKey.getPublicKey().toDer());
    await guarded(() => __privateGet(this, _credentialStorage).set(__privateGet(this, _slots).appPending, { identity: appKey, chain: appChain }));
    await guarded(() => __privateMethod(this, _AuthClient_instances, persistSession_fn).call(this, key, sessionChain, appChain.publicKey));
    await guarded(() => __privateMethod(this, _AuthClient_instances, promoteAppCredential_fn).call(this, appKey, appChain));
    await guarded(async () => {
      __privateMethod(this, _AuthClient_instances, installIdentity_fn).call(this, await __privateMethod(this, _AuthClient_instances, openSession_fn).call(this, key, sessionChain, minter));
    });
    if (pending) {
      try {
        await __privateGet(this, _credentialStorage).remove(__privateGet(this, _slots).sessionPending);
      } catch {
      }
    }
    const target = await returnTo;
    if (typeof target === "string")
      location.replace(target);
    return __privateGet(this, _identity);
  } finally {
    signInLock.release();
  }
};
// Window flow: sign-in completes in a single load, so a fresh session key per
// sign-in is enough, with nothing to persist for a later load.
ensureSessionKeyForWindowFlow_fn = function() {
  return __privateGet(this, _credentialStorage).create();
};
ensureSessionKeyForRedirectFlow_fn = async function(transport) {
  var _a2;
  if (!__privateGet(this, _credentialStorage).durable) {
    throw new Error("A redirect sign-in needs a credential store that survives the navigation, and this one does not. Use a durable store or the window transport.");
  }
  let acquired = null;
  const startedWith = await transport.memoize(async () => {
    const stored = await __privateGet(this, _credentialStorage).get(__privateGet(this, _slots).sessionPending);
    if (stored !== null) {
      acquired = stored.identity;
    } else {
      acquired = await __privateGet(this, _credentialStorage).create();
      await __privateGet(this, _credentialStorage).set(__privateGet(this, _slots).sessionPending, { identity: acquired });
    }
    return publicKeyOf(acquired);
  });
  const key = acquired ?? ((_a2 = await __privateGet(this, _credentialStorage).get(__privateGet(this, _slots).sessionPending)) == null ? void 0 : _a2.identity) ?? null;
  if (key === null || publicKeyOf(key) !== startedWith) {
    throw new Error("This sign-in was superseded by another one in this browser");
  }
  return { key, pending: true };
};
runRequestAttributes_fn = async function(params) {
  const nonceBytes = __privateGet(this, _urlTransport) ? fromBase64(await __privateGet(this, _urlTransport).memoize(async () => toBase64(await params.nonce()))) : await __privateMethod(this, _AuthClient_instances, resolveNonce_fn).call(this, params.nonce);
  const response = await __privateGet(this, _signer2).sendRequest({
    jsonrpc: "2.0",
    id: globalThis.crypto.randomUUID(),
    method: "ii-icrc3-attributes",
    params: { keys: params.keys, nonce: toBase64(nonceBytes) }
  });
  if ("error" in response) {
    throw new Error(response.error.message);
  }
  const result = response.result;
  if (typeof (result == null ? void 0 : result.data) !== "string" || typeof (result == null ? void 0 : result.signature) !== "string") {
    throw new Error("Invalid response: missing data or signature");
  }
  try {
    return {
      data: fromBase64(result.data),
      signature: fromBase64(result.signature)
    };
  } catch (cause) {
    throw new Error("Invalid response: data or signature is not valid base64", { cause });
  }
};
resolveNonce_fn = async function(nonce) {
  const value = nonce();
  await __privateMethod(this, _AuthClient_instances, openSignerChannel_fn).call(this);
  const previousAutoClose = __privateGet(this, _signer2).autoCloseTransportChannel;
  __privateGet(this, _signer2).autoCloseTransportChannel = false;
  try {
    return await value;
  } finally {
    __privateGet(this, _signer2).autoCloseTransportChannel = previousAutoClose;
  }
};
refreshInForeground_fn = async function() {
  if (__privateGet(this, _interactions) > 0 || __privateGet(this, _refreshingInForeground))
    return;
  __privateSet(this, _refreshingInForeground, true);
  try {
    await __privateMethod(this, _AuthClient_instances, refreshIfDue_fn2).call(this);
  } finally {
    __privateSet(this, _refreshingInForeground, false);
  }
};
refreshIfDue_fn2 = async function() {
  const restored = await __privateMethod(this, _AuthClient_instances, init_fn).call(this).then(() => true, () => false);
  if (!restored)
    return;
  if (__privateGet(this, _interactions) > 0)
    return;
  const identity = __privateGet(this, _identity);
  if (identity instanceof SessionIdentity)
    await identity.refresh().catch(() => void 0);
};
revoke_fn = async function(key, sessionChain) {
  const minter = await SessionMinter.create({
    sessionKey: key,
    sessionChain,
    canisterId: __privateGet(this, _canisterId),
    agentOptions: __privateGet(this, _options7).agentOptions
  });
  await minter.revoke();
};
promoteAppCredential_fn = async function(identity, chain) {
  await __privateGet(this, _credentialStorage).set(__privateGet(this, _slots).app, { identity, chain });
  await __privateGet(this, _credentialStorage).remove(__privateGet(this, _slots).appPending).catch(() => void 0);
};
minterFor_fn = function(key, sessionChain) {
  return SessionMinter.create({
    sessionKey: key,
    sessionChain,
    canisterId: __privateGet(this, _canisterId),
    agentOptions: __privateGet(this, _options7).agentOptions
  });
};
openSession_fn = async function(key, sessionChain, source) {
  const minter = source ?? await __privateMethod(this, _AuthClient_instances, minterFor_fn).call(this, key, sessionChain);
  const held = __privateGet(this, _stateStorage).get(__privateGet(this, _slots).state);
  let opening = source !== void 0;
  const identity = await SessionIdentity.create({
    sessionExpiresAtMs: earliestExpiryMs(sessionChain),
    source: minter,
    storage: __privateGet(this, _credentialStorage),
    slot: __privateGet(this, _slots).app,
    expectedAccount: held == null ? void 0 : held.principal,
    onSessionGone: () => {
      void __privateMethod(this, _AuthClient_instances, endOrDrop_fn).call(this, held, !opening).catch(() => void 0);
      __privateMethod(this, _AuthClient_instances, installIdentity_fn).call(this, new AnonymousIdentity());
    }
  });
  opening = false;
  return identity;
};
endOrDrop_fn = async function(held, ended) {
  const now = __privateGet(this, _stateStorage).get(__privateGet(this, _slots).state);
  const unchanged = held !== null && now !== null && now.principal.compareTo(held.principal) === "eq" && now.expiration === held.expiration;
  if (!unchanged) {
    await __privateMethod(this, _AuthClient_instances, dropSession_fn).call(this);
    return;
  }
  await (ended ? __privateMethod(this, _AuthClient_instances, expireSession_fn).call(this, now.principal) : __privateMethod(this, _AuthClient_instances, endSession_fn).call(this));
};
expireSession_fn = async function(principal) {
  __privateGet(this, _stateStorage).set(__privateGet(this, _slots).state, {
    principal,
    expiration: BigInt(Date.now()) * 1000000n
  });
  await __privateMethod(this, _AuthClient_instances, clearCredentials_fn).call(this);
};
/**
 * Restores again, because the record changed under this client.
 *
 * Queued behind whatever restore is in flight rather than replacing it: two
 * restores reading one store would both install an identity, and the order
 * they finished in would decide which. A failure is forgotten the same way
 * {@link AuthClient.#init} forgets one, so the next call tries again.
 */
restoreAgain_fn = function() {
  if (__privateGet(this, _restoreQueued))
    return;
  __privateSet(this, _restoreQueued, true);
  const promise = (__privateGet(this, _initPromise) ?? Promise.resolve()).catch(() => void 0).then(() => {
    __privateSet(this, _restoreQueued, false);
    return __privateMethod(this, _AuthClient_instances, restore_fn).call(this);
  }).catch((error) => {
    __privateSet(this, _restoreQueued, false);
    if (__privateGet(this, _initPromise) === promise) {
      __privateSet(this, _initPromise, null);
    }
    throw error;
  });
  __privateSet(this, _initPromise, promise);
  promise.catch(() => void 0);
};
// Memoized — only runs #hydrate once, returns the same promise on repeat calls.
//
// Forgotten again if it rejected, so a later call restores rather than
// replaying the failure: a restore reaches the network, and one unreachable
// boundary node at load would otherwise leave every `getIdentity()` for the
// life of the page rejecting with an error nothing can retry past.
init_fn = function() {
  if (!__privateGet(this, _initPromise)) {
    const promise = __privateMethod(this, _AuthClient_instances, restore_fn).call(this).catch((error) => {
      if (__privateGet(this, _initPromise) === promise) {
        __privateSet(this, _initPromise, null);
      }
      throw error;
    });
    __privateSet(this, _initPromise, promise);
  }
  return __privateGet(this, _initPromise);
};
restore_fn = async function() {
  __privateSet(this, _restoring, true);
  try {
    await __privateMethod(this, _AuthClient_instances, hydrate_fn).call(this);
  } finally {
    __privateSet(this, _restoring, false);
  }
};
hydrate_fn = async function() {
  const restored = await __privateMethod(this, _AuthClient_instances, restoreSession_fn).call(this);
  const key = restored == null ? void 0 : restored.identity;
  const chain = restored == null ? void 0 : restored.chain;
  if (!key || !chain) {
    if (__privateMethod(this, _AuthClient_instances, readStatus_fn).call(this).state === "signed-in")
      await __privateMethod(this, _AuthClient_instances, dropSession_fn).call(this);
    __privateMethod(this, _AuthClient_instances, installIdentity_fn).call(this, new AnonymousIdentity());
    return;
  }
  if (__privateGet(this, _stateStorage).get(__privateGet(this, _slots).state) === null) {
    await __privateMethod(this, _AuthClient_instances, endSession_fn).call(this);
    return;
  }
  if (!("sign" in key)) {
    __privateMethod(this, _AuthClient_instances, installIdentity_fn).call(this, new AnonymousIdentity());
    return;
  }
  let identity;
  try {
    identity = await __privateMethod(this, _AuthClient_instances, openSession_fn).call(this, key, chain);
  } catch (error) {
    if (!(error instanceof AccountMismatchError))
      throw error;
    await __privateMethod(this, _AuthClient_instances, dropSession_fn).call(this);
    __privateMethod(this, _AuthClient_instances, installIdentity_fn).call(this, new AnonymousIdentity());
    return;
  }
  if (__privateGet(this, _disposed)) {
    identity.dispose();
    return;
  }
  const state = __privateGet(this, _stateStorage).get(__privateGet(this, _slots).state);
  if (state === null || state.principal.toText() !== identity.getPrincipal().toText()) {
    identity.dispose();
    __privateMethod(this, _AuthClient_instances, installIdentity_fn).call(this, new AnonymousIdentity());
    await __privateMethod(this, _AuthClient_instances, dropSession_fn).call(this);
    return;
  }
  __privateMethod(this, _AuthClient_instances, installIdentity_fn).call(this, identity);
};
persistSession_fn = async function(identity, chain, accountKey) {
  await __privateGet(this, _credentialStorage).set(__privateGet(this, _slots).session, { identity, chain });
  let earliest = null;
  for (const { delegation } of chain.delegations) {
    if (earliest === null || delegation.expiration < earliest) {
      earliest = delegation.expiration;
    }
  }
  if (earliest !== null) {
    __privateGet(this, _stateStorage).set(__privateGet(this, _slots).state, {
      principal: Principal.selfAuthenticating(new Uint8Array(accountKey)),
      expiration: earliest
    });
  }
};
restoreSession_fn = async function() {
  const credential = await __privateGet(this, _credentialStorage).get(__privateGet(this, _slots).session);
  if (credential === null)
    return null;
  if (credential.chain === void 0 || !isDelegationValid(credential.chain)) {
    await __privateMethod(this, _AuthClient_instances, clearCredentials_fn).call(this);
    return null;
  }
  return credential;
};
endSession_fn = async function() {
  __privateGet(this, _stateStorage).remove(__privateGet(this, _slots).state);
  await __privateMethod(this, _AuthClient_instances, clearCredentials_fn).call(this);
};
dropSession_fn = async function() {
  __privateGet(this, _stateStorage).discard(__privateGet(this, _slots).state);
  await __privateMethod(this, _AuthClient_instances, clearCredentials_fn).call(this);
};
clearCredentials_fn = async function() {
  const outcomes = await Promise.allSettled([
    __privateGet(this, _credentialStorage).remove(__privateGet(this, _slots).session),
    __privateGet(this, _credentialStorage).remove(__privateGet(this, _slots).app)
  ]);
  const failed = outcomes.find((outcome) => outcome.status === "rejected");
  if (failed !== void 0)
    throw failed.reason;
};
function earliestExpiryMs(chain) {
  let earliest = null;
  for (const { delegation } of chain.delegations) {
    if (earliest === null || delegation.expiration < earliest) {
      earliest = delegation.expiration;
    }
  }
  return earliest === null ? 0 : Number(earliest / 1000000n);
}
function publicKeyOf(key) {
  return toBase64(new Uint8Array(key.getPublicKey().toDer()));
}
function sameOriginTarget(returnTo) {
  let target;
  try {
    target = new URL(returnTo, window.location.href);
  } catch {
    return void 0;
  }
  if ((target.protocol === "https:" || target.protocol === "http:") && target.origin === window.location.origin) {
    return target;
  }
  return void 0;
}
function scopedKeys(params) {
  if (params.openIdProvider !== void 0 && params.ssoDomain !== void 0) {
    throw new Error("openIdProvider and ssoDomain are mutually exclusive");
  }
  if (params.ssoDomain !== void 0) {
    const domain = normalizeSsoDomain(params.ssoDomain);
    const keys2 = params.keys ?? DEFAULT_SSO_SCOPE_KEYS;
    return keys2.map((key) => `sso:${domain}:${key}`);
  }
  if (params.openIdProvider === void 0) {
    throw new Error("scopedKeys requires either openIdProvider or ssoDomain");
  }
  const provider = OPENID_PROVIDER_URLS[params.openIdProvider];
  const keys = params.keys ?? DEFAULT_OPENID_SCOPE_KEYS;
  return keys.map((key) => `openid:${provider}:${key}`);
}
const II_MAINNET_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai";
const DEFAULT_ATTRIBUTE_KEYS = ["verified_email"];
function normalizeAuthorizeUrl(value) {
  const url = new URL(value.toString());
  url.pathname = "/authorize";
  return url.toString();
}
function resolveIdentityProvider(options) {
  if (!(options == null ? void 0 : options.envUrl)) {
    return void 0;
  }
  return {
    authorizeUrl: normalizeAuthorizeUrl(options.envUrl),
    canisterId: options.envCanisterId ?? II_MAINNET_CANISTER_ID
  };
}
function resolveAgentOptions(agentOptions, envUrl) {
  return {
    ...agentOptions,
    host: (agentOptions == null ? void 0 : agentOptions.host) ?? new URL(envUrl).origin
  };
}
function resolveAttributeKeys(attrs, loginOptions) {
  var _a2;
  if (attrs.keys) {
    return attrs.keys;
  }
  const ssoDomain = (_a2 = loginOptions == null ? void 0 : loginOptions.ssoDomain) == null ? void 0 : _a2.trim();
  if (ssoDomain) {
    return [...scopedKeys({ ssoDomain })];
  }
  if (loginOptions == null ? void 0 : loginOptions.provider) {
    return [...scopedKeys({ openIdProvider: loginOptions.provider })];
  }
  return DEFAULT_ATTRIBUTE_KEYS;
}
function nextLoginStatus(sessionState, previous) {
  if (sessionState === "signed-in") {
    if (previous === "logging-in" || previous === "success") {
      return "success";
    }
    return "idle";
  }
  if (sessionState === "expired") {
    if (previous === "logging-in" || previous === "loginError") {
      return previous;
    }
    return "expired";
  }
  if (previous === "logging-in" || previous === "loginError") {
    return previous;
  }
  return "idle";
}
const iiAttributesIDL = ({ IDL: I }) => I.Service({
  _internet_identity_sign_in_start: I.Func([], [I.Vec(I.Nat8)], []),
  _internet_identity_sign_in_finish: I.Func([], [I.Variant({ ok: I.Null, err: I.Record({}) })], []),
  _initialize_access_control: I.Func([], [], [])
});
const II_SIGNER_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai";
const InternetIdentityReactContext = reactExports.createContext(void 0);
function buildAuthClient(config, loginOptions, createOptions) {
  var _a2;
  const { identityProvider: _callerIdentityProvider, openIdProvider: _openIdProvider, ssoDomain: _ssoDomain, ...rest } = {
    derivationOrigin: config == null ? void 0 : config.ii_derivation_origin,
    ...createOptions
  };
  const identityProvider = resolveIdentityProvider({
    envUrl: "https://id.ai/authorize",
    envCanisterId: "rdmx6-jaaaa-aaaaa-aaadq-cai"
  });
  const managed = {
    ...rest,
    agentOptions: resolveAgentOptions(rest.agentOptions, "https://id.ai/authorize"),
    ...identityProvider ? { identityProvider } : {}
  };
  const ssoDomain = (_a2 = loginOptions == null ? void 0 : loginOptions.ssoDomain) == null ? void 0 : _a2.trim();
  if (ssoDomain) {
    return new AuthClient({ ...managed, ssoDomain });
  }
  if (loginOptions == null ? void 0 : loginOptions.provider) {
    return new AuthClient({
      ...managed,
      openIdProvider: loginOptions.provider
    });
  }
  return new AuthClient(managed);
}
async function createIIAttributesActor(identity) {
  var _a2;
  const config = await loadConfig();
  const agent = new HttpAgent({
    host: config.backend_host,
    identity
  });
  if ((_a2 = config.backend_host) == null ? void 0 : _a2.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {
    });
  }
  return Actor.createActor(iiAttributesIDL, {
    agent,
    canisterId: config.backend_canister_id
  });
}
function assertProviderPresent(context) {
  if (!context) {
    throw new Error("InternetIdentityProvider is not present. Wrap your component tree with it.");
  }
}
const useInternetIdentity = () => {
  const context = reactExports.useContext(InternetIdentityReactContext);
  assertProviderPresent(context);
  return context;
};
function InternetIdentityProvider({ children, createOptions, withAttributes = {} }) {
  const [authClient, setAuthClient] = reactExports.useState(void 0);
  const [identity, setIdentity] = reactExports.useState(void 0);
  const [loginStatus, setStatus] = reactExports.useState("initializing");
  const [loginError, setError] = reactExports.useState(void 0);
  const withAttributesRef = reactExports.useRef(withAttributes);
  withAttributesRef.current = withAttributes;
  const createOptionsRef = reactExports.useRef(createOptions);
  createOptionsRef.current = createOptions;
  const setErrorMessage = reactExports.useCallback((message) => {
    setStatus("loginError");
    setError(new Error(message));
  }, []);
  const handleLoginSuccess = reactExports.useCallback(async (client) => {
    const latestIdentity = await client.getIdentity();
    if (!latestIdentity) {
      setErrorMessage("Identity not found after successful login");
      return;
    }
    setIdentity(latestIdentity);
    setStatus("success");
    setError(void 0);
  }, [setErrorMessage]);
  const handleLoginError = reactExports.useCallback((maybeError) => {
    setErrorMessage(maybeError ?? "Login failed");
  }, [setErrorMessage]);
  const login = reactExports.useCallback((loginOptions) => {
    var _a2;
    if (!authClient) {
      setErrorMessage("AuthClient is not initialized yet, make sure to call `login` on user interaction e.g. click.");
      return;
    }
    if (authClient.isAuthenticated()) {
      setErrorMessage("User is already authenticated");
      return;
    }
    if ((loginOptions == null ? void 0 : loginOptions.ssoDomain) !== void 0 && !loginOptions.ssoDomain.trim()) {
      setErrorMessage('ssoDomain must be a non-empty domain such as "acme.com"');
      return;
    }
    setStatus("logging-in");
    const attrs = withAttributesRef.current;
    let variantClient;
    const disposeVariant = () => {
      variantClient == null ? void 0 : variantClient.dispose();
      variantClient = void 0;
    };
    const startSignIn = (client) => {
      if (attrs !== false) {
        const signInPromise = client.signIn();
        const attributesPromise = client.requestAttributes({
          keys: resolveAttributeKeys(attrs, loginOptions),
          nonce: () => createIIAttributesActor().then((actor) => actor._internet_identity_sign_in_start())
        });
        void Promise.all([signInPromise, attributesPromise]).then(async ([plainIdentity, { data, signature }]) => {
          const actor = await createIIAttributesActor(plainIdentity);
          if (!data || data.length === 0) {
            await handleLoginSuccess(client);
            await actor._initialize_access_control();
            return;
          }
          const signerCanisterId = Principal.fromText(II_SIGNER_CANISTER_ID);
          const attributedIdentity = new AttributesIdentity({
            inner: plainIdentity,
            attributes: { data, signature },
            signer: { canisterId: signerCanisterId }
          });
          const finishActor = await createIIAttributesActor(attributedIdentity);
          try {
            await finishActor._internet_identity_sign_in_finish();
          } catch (error) {
            console.error(error);
          }
          await handleLoginSuccess(client);
        }).catch((unknownError) => {
          handleLoginError(unknownError instanceof Error ? unknownError.message : void 0);
        }).finally(disposeVariant);
      } else {
        void client.signIn().then(async (plainIdentity) => {
          const actor = await createIIAttributesActor(plainIdentity);
          await actor._initialize_access_control();
          await handleLoginSuccess(client);
        }).catch((unknownError) => {
          handleLoginError(unknownError instanceof Error ? unknownError.message : void 0);
        }).finally(disposeVariant);
      }
    };
    const needsVariantClient = Boolean(((_a2 = loginOptions == null ? void 0 : loginOptions.ssoDomain) == null ? void 0 : _a2.trim()) || (loginOptions == null ? void 0 : loginOptions.provider));
    if (needsVariantClient) {
      try {
        variantClient = buildAuthClient(getCachedConfig(), loginOptions ?? {}, createOptionsRef.current);
        startSignIn(variantClient);
      } catch (unknownError) {
        disposeVariant();
        handleLoginError(unknownError instanceof Error ? unknownError.message : void 0);
      }
    } else {
      startSignIn(authClient);
    }
  }, [authClient, handleLoginError, handleLoginSuccess, setErrorMessage]);
  const clear = reactExports.useCallback(() => {
    if (!authClient) {
      setErrorMessage("Auth client not initialized");
      return;
    }
    void authClient.signOut().then(() => {
      setIdentity(void 0);
      setStatus("idle");
      setError(void 0);
    }).catch((unknownError) => {
      setStatus("loginError");
      setError(unknownError instanceof Error ? unknownError : new Error("Logout failed"));
    });
  }, [authClient, setErrorMessage]);
  reactExports.useEffect(() => {
    let cancelled = false;
    let client;
    let unsubscribe;
    void (async () => {
      try {
        setStatus("initializing");
        const config = await loadConfig();
        if (cancelled)
          return;
        client = buildAuthClient(config, void 0, createOptions);
        setAuthClient(client);
        const applyStatus = async () => {
          if (!client || cancelled)
            return;
          const session = client.getStatus();
          if (session.state === "signed-in") {
            try {
              const loadedIdentity = await client.getIdentity();
              if (cancelled)
                return;
              setIdentity(loadedIdentity);
              setStatus((previous) => nextLoginStatus(session.state, previous));
              setError(void 0);
            } catch (unknownError) {
              if (cancelled)
                return;
              setIdentity(void 0);
              setStatus("loginError");
              setError(unknownError instanceof Error ? unknownError : new Error("Failed to load identity"));
            }
            return;
          }
          setIdentity(void 0);
          setStatus((previous) => nextLoginStatus(session.state, previous));
        };
        unsubscribe = client.subscribe(() => {
          void applyStatus();
        });
        await applyStatus();
      } catch (unknownError) {
        if (cancelled)
          return;
        setIdentity(void 0);
        setStatus("loginError");
        setError(unknownError instanceof Error ? unknownError : new Error("Initialization failed"));
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe == null ? void 0 : unsubscribe();
      client == null ? void 0 : client.dispose();
      setAuthClient(void 0);
    };
  }, [createOptions]);
  const value = reactExports.useMemo(() => ({
    identity,
    login,
    clear,
    loginStatus,
    isInitializing: loginStatus === "initializing",
    isLoginIdle: loginStatus === "idle",
    isLoggingIn: loginStatus === "logging-in",
    isLoginSuccess: loginStatus === "success",
    isLoginError: loginStatus === "loginError",
    isSessionExpired: loginStatus === "expired",
    isAuthenticated: !!identity && !identity.getPrincipal().isAnonymous(),
    loginError
  }), [identity, login, clear, loginStatus, loginError]);
  return reactExports.createElement(InternetIdentityReactContext.Provider, {
    value,
    children
  });
}
const ACTOR_QUERY_KEY = "actor";
function useActor(createActor, options) {
  const { identity, isAuthenticated } = useInternetIdentity();
  const queryClient = useQueryClient();
  const mockModules = options == null ? void 0 : options.mockModules;
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      if (!isAuthenticated) {
        return await createActorWithConfig(createActor, { mockModules });
      }
      const actor = await createActorWithConfig(createActor, {
        agentOptions: { identity },
        mockModules
      });
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
export {
  InternetIdentityProvider,
  createActorWithConfig,
  loadConfig,
  loadMockBackendFromModules,
  useActor,
  useInternetIdentity
};
