"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const React = require("react");
const loadable = require("@loadable/component");
const jsxRuntime = require("react/jsx-runtime");
const server = require("react-dom/server");
const _interopDefaultLegacy = (e) => e && typeof e === "object" && "default" in e ? e : { default: e };
function _interopNamespace(e) {
  if (e && e.__esModule)
    return e;
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const React__namespace = /* @__PURE__ */ _interopNamespace(React);
const React__default = /* @__PURE__ */ _interopDefaultLegacy(React);
const loadable__default = /* @__PURE__ */ _interopDefaultLegacy(loadable);
const jsxRuntime__namespace = /* @__PURE__ */ _interopNamespace(jsxRuntime);
/**
 * @remix-run/router v1.6.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
var Action;
(function(Action2) {
  Action2["Pop"] = "POP";
  Action2["Push"] = "PUSH";
  Action2["Replace"] = "REPLACE";
})(Action || (Action = {}));
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined")
      console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createPath(_ref) {
  let {
    pathname = "/",
    search = "",
    hash = ""
  } = _ref;
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
var ResultType;
(function(ResultType2) {
  ResultType2["data"] = "data";
  ResultType2["deferred"] = "deferred";
  ResultType2["redirect"] = "redirect";
  ResultType2["error"] = "error";
})(ResultType || (ResultType = {}));
function matchRoutes(routes2, locationArg, basename) {
  if (basename === void 0) {
    basename = "/";
  }
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes2);
  rankRouteBranches(branches);
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    matches = matchRouteBranch(
      branches[i],
      safelyDecodeURI(pathname)
    );
  }
  return matches;
}
function flattenRoutes(routes2, branches, parentsMeta, parentPath) {
  if (branches === void 0) {
    branches = [];
  }
  if (parentsMeta === void 0) {
    parentsMeta = [];
  }
  if (parentPath === void 0) {
    parentPath = "";
  }
  let flattenRoute = (route, index, relativePath) => {
    let meta = {
      relativePath: relativePath === void 0 ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      invariant(meta.relativePath.startsWith(parentPath), 'Absolute route path "' + meta.relativePath + '" nested under path ' + ('"' + parentPath + '" is not valid. An absolute child route path ') + "must start with the combined path of all its parent routes.");
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    if (route.children && route.children.length > 0) {
      invariant(
        route.index !== true,
        "Index routes must not have child routes. Please remove " + ('all child routes from route path "' + path + '".')
      );
      flattenRoutes(route.children, branches, routesMeta, path);
    }
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes2.forEach((route, index) => {
    var _route$path;
    if (route.path === "" || !((_route$path = route.path) != null && _route$path.includes("?"))) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, exploded);
      }
    }
  });
  return branches;
}
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0)
    return [];
  let [first, ...rest] = segments;
  let isOptional = first.endsWith("?");
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  result.push(...restExploded.map((subpath) => subpath === "" ? required : [required, subpath].join("/")));
  if (isOptional) {
    result.push(...restExploded);
  }
  return result.map((exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded);
}
function rankRouteBranches(branches) {
  branches.sort((a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(a.routesMeta.map((meta) => meta.childrenIndex), b.routesMeta.map((meta) => meta.childrenIndex)));
}
const paramRe = /^:\w+$/;
const dynamicSegmentValue = 3;
const indexRouteValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = (s) => s === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter((s) => !isSplat(s)).reduce((score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue), initialScore);
}
function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? a[a.length - 1] - b[b.length - 1] : 0;
}
function matchRouteBranch(branch, pathname) {
  let {
    routesMeta
  } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath({
      path: meta.relativePath,
      caseSensitive: meta.caseSensitive,
      end
    }, remainingPathname);
    if (!match)
      return null;
    Object.assign(matchedParams, match.params);
    let route = meta.route;
    matches.push({
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = {
      path: pattern,
      caseSensitive: false,
      end: true
    };
  }
  let [matcher, paramNames] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
  let match = pathname.match(matcher);
  if (!match)
    return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = paramNames.reduce((memo, paramName, index) => {
    if (paramName === "*") {
      let splatValue = captureGroups[index] || "";
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
    }
    memo[paramName] = safelyDecodeURIComponent(captureGroups[index] || "", paramName);
    return memo;
  }, {});
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive, end) {
  if (caseSensitive === void 0) {
    caseSensitive = false;
  }
  if (end === void 0) {
    end = true;
  }
  warning(path === "*" || !path.endsWith("*") || path.endsWith("/*"), 'Route path "' + path + '" will be treated as if it were ' + ('"' + path.replace(/\*$/, "/*") + '" because the `*` character must ') + "always follow a `/` in the pattern. To get rid of this warning, " + ('please change the route path to "' + path.replace(/\*$/, "/*") + '".'));
  let paramNames = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^$?{}|()[\]]/g, "\\$&").replace(/\/:(\w+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return "/([^\\/]+)";
  });
  if (path.endsWith("*")) {
    paramNames.push("*");
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else
    ;
  let matcher = new RegExp(regexpSource, caseSensitive ? void 0 : "i");
  return [matcher, paramNames];
}
function safelyDecodeURI(value) {
  try {
    return decodeURI(value);
  } catch (error) {
    warning(false, 'The URL path "' + value + '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' + ("encoding (" + error + ")."));
    return value;
  }
}
function safelyDecodeURIComponent(value, paramName) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    warning(false, 'The value for the URL param "' + paramName + '" will not be decoded because' + (' the string "' + value + '" is a malformed URL segment. This is probably') + (" due to a bad percent encoding (" + error + ")."));
    return value;
  }
}
function stripBasename(pathname, basename) {
  if (basename === "/")
    return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
const joinPaths = (paths) => paths.join("/").replace(/\/\/+/g, "/");
const normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
const validMutationMethodsArr = ["post", "put", "patch", "delete"];
["get", ...validMutationMethodsArr];
const Fragment = jsxRuntime__namespace.Fragment;
const jsx = jsxRuntime__namespace.jsx;
const jsxs = jsxRuntime__namespace.jsxs;
/**
 * React Router v6.11.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
const DataRouterContext = /* @__PURE__ */ React__namespace.createContext(null);
if (process.env.NODE_ENV !== "production") {
  DataRouterContext.displayName = "DataRouter";
}
const DataRouterStateContext = /* @__PURE__ */ React__namespace.createContext(null);
if (process.env.NODE_ENV !== "production") {
  DataRouterStateContext.displayName = "DataRouterState";
}
const AwaitContext = /* @__PURE__ */ React__namespace.createContext(null);
if (process.env.NODE_ENV !== "production") {
  AwaitContext.displayName = "Await";
}
const NavigationContext = /* @__PURE__ */ React__namespace.createContext(null);
if (process.env.NODE_ENV !== "production") {
  NavigationContext.displayName = "Navigation";
}
const LocationContext = /* @__PURE__ */ React__namespace.createContext(null);
if (process.env.NODE_ENV !== "production") {
  LocationContext.displayName = "Location";
}
const RouteContext = /* @__PURE__ */ React__namespace.createContext({
  outlet: null,
  matches: []
});
if (process.env.NODE_ENV !== "production") {
  RouteContext.displayName = "Route";
}
const RouteErrorContext = /* @__PURE__ */ React__namespace.createContext(null);
if (process.env.NODE_ENV !== "production") {
  RouteErrorContext.displayName = "RouteError";
}
function useInRouterContext() {
  return React__namespace.useContext(LocationContext) != null;
}
function useLocation() {
  !useInRouterContext() ? process.env.NODE_ENV !== "production" ? invariant(
    false,
    "useLocation() may be used only in the context of a <Router> component."
  ) : invariant(false) : void 0;
  return React__namespace.useContext(LocationContext).location;
}
function useRoutes(routes2, locationArg) {
  return useRoutesImpl(routes2, locationArg);
}
function useRoutesImpl(routes2, locationArg, dataRouterState) {
  !useInRouterContext() ? process.env.NODE_ENV !== "production" ? invariant(
    false,
    "useRoutes() may be used only in the context of a <Router> component."
  ) : invariant(false) : void 0;
  let {
    navigator
  } = React__namespace.useContext(NavigationContext);
  let {
    matches: parentMatches
  } = React__namespace.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;
  if (process.env.NODE_ENV !== "production") {
    let parentPath = parentRoute && parentRoute.path || "";
    warningOnce(parentPathname, !parentRoute || parentPath.endsWith("*"), "You rendered descendant <Routes> (or called `useRoutes()`) at " + ('"' + parentPathname + '" (under <Route path="' + parentPath + '">) but the ') + `parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

` + ('Please change the parent <Route path="' + parentPath + '"> to <Route ') + ('path="' + (parentPath === "/" ? "*" : parentPath + "/*") + '">.'));
  }
  let locationFromContext = useLocation();
  let location;
  if (locationArg) {
    var _parsedLocationArg$pa;
    let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
    !(parentPathnameBase === "/" || ((_parsedLocationArg$pa = parsedLocationArg.pathname) == null ? void 0 : _parsedLocationArg$pa.startsWith(parentPathnameBase))) ? process.env.NODE_ENV !== "production" ? invariant(false, "When overriding the location using `<Routes location>` or `useRoutes(routes, location)`, the location pathname must begin with the portion of the URL pathname that was " + ('matched by all parent routes. The current pathname base is "' + parentPathnameBase + '" ') + ('but pathname "' + parsedLocationArg.pathname + '" was given in the `location` prop.')) : invariant(false) : void 0;
    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }
  let pathname = location.pathname || "/";
  let remainingPathname = parentPathnameBase === "/" ? pathname : pathname.slice(parentPathnameBase.length) || "/";
  let matches = matchRoutes(routes2, {
    pathname: remainingPathname
  });
  if (process.env.NODE_ENV !== "production") {
    process.env.NODE_ENV !== "production" ? warning(parentRoute || matches != null, 'No routes matched location "' + location.pathname + location.search + location.hash + '" ') : void 0;
    process.env.NODE_ENV !== "production" ? warning(matches == null || matches[matches.length - 1].route.element !== void 0 || matches[matches.length - 1].route.Component !== void 0, 'Matched leaf route at location "' + location.pathname + location.search + location.hash + '" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.') : void 0;
  }
  let renderedMatches = _renderMatches(matches && matches.map((match) => Object.assign({}, match, {
    params: Object.assign({}, parentParams, match.params),
    pathname: joinPaths([
      parentPathnameBase,
      navigator.encodeLocation ? navigator.encodeLocation(match.pathname).pathname : match.pathname
    ]),
    pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([
      parentPathnameBase,
      navigator.encodeLocation ? navigator.encodeLocation(match.pathnameBase).pathname : match.pathnameBase
    ])
  })), parentMatches, dataRouterState);
  if (locationArg && renderedMatches) {
    return /* @__PURE__ */ jsx(LocationContext.Provider, {
      value: {
        location: _extends({
          pathname: "/",
          search: "",
          hash: "",
          state: null,
          key: "default"
        }, location),
        navigationType: Action.Pop
      },
      children: renderedMatches
    });
  }
  return renderedMatches;
}
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error) ? error.status + " " + error.statusText : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = {
    padding: "0.5rem",
    backgroundColor: lightgrey
  };
  let codeStyles = {
    padding: "2px 4px",
    backgroundColor: lightgrey
  };
  let devInfo = null;
  if (process.env.NODE_ENV !== "production") {
    console.error("Error handled by React Router default ErrorBoundary:", error);
    devInfo = /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx("p", {
        children: "\u{1F4BF} Hey developer \u{1F44B}"
      }), /* @__PURE__ */ jsxs("p", {
        children: ["You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ jsx("code", {
          style: codeStyles,
          children: "ErrorBoundary"
        }), " or", " ", /* @__PURE__ */ jsx("code", {
          style: codeStyles,
          children: "errorElement"
        }), " prop on your route."]
      })]
    });
  }
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx("h2", {
      children: "Unexpected Application Error!"
    }), /* @__PURE__ */ jsx("h3", {
      style: {
        fontStyle: "italic"
      },
      children: message
    }), stack ? /* @__PURE__ */ jsx("pre", {
      style: preStyles,
      children: stack
    }) : null, devInfo]
  });
}
const defaultErrorElement = /* @__PURE__ */ jsx(DefaultErrorComponent, {});
class RenderErrorBoundary extends React__namespace.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation
      };
    }
    return {
      error: props.error || state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Router caught the following error during render", error, errorInfo);
  }
  render() {
    return this.state.error ? /* @__PURE__ */ jsx(RouteContext.Provider, {
      value: this.props.routeContext,
      children: /* @__PURE__ */ jsx(RouteErrorContext.Provider, {
        value: this.state.error,
        children: this.props.component
      })
    }) : this.props.children;
  }
}
function RenderedRoute(_ref) {
  let {
    routeContext,
    match,
    children
  } = _ref;
  let dataRouterContext = React__namespace.useContext(DataRouterContext);
  if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }
  return /* @__PURE__ */ jsx(RouteContext.Provider, {
    value: routeContext,
    children
  });
}
function _renderMatches(matches, parentMatches, dataRouterState) {
  var _dataRouterState2;
  if (parentMatches === void 0) {
    parentMatches = [];
  }
  if (dataRouterState === void 0) {
    dataRouterState = null;
  }
  if (matches == null) {
    var _dataRouterState;
    if ((_dataRouterState = dataRouterState) != null && _dataRouterState.errors) {
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }
  let renderedMatches = matches;
  let errors = (_dataRouterState2 = dataRouterState) == null ? void 0 : _dataRouterState2.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex((m) => m.route.id && (errors == null ? void 0 : errors[m.route.id]));
    !(errorIndex >= 0) ? process.env.NODE_ENV !== "production" ? invariant(false, "Could not find a matching route for errors on route IDs: " + Object.keys(errors).join(",")) : invariant(false) : void 0;
    renderedMatches = renderedMatches.slice(0, Math.min(renderedMatches.length, errorIndex + 1));
  }
  return renderedMatches.reduceRight((outlet, match, index) => {
    let error = match.route.id ? errors == null ? void 0 : errors[match.route.id] : null;
    let errorElement = null;
    if (dataRouterState) {
      errorElement = match.route.errorElement || defaultErrorElement;
    }
    let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
    let getChildren = () => {
      let children;
      if (error) {
        children = errorElement;
      } else if (match.route.element) {
        children = match.route.element;
      } else {
        children = outlet;
      }
      return /* @__PURE__ */ jsx(RenderedRoute, {
        match,
        routeContext: {
          outlet,
          matches: matches2
        },
        children
      });
    };
    return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ jsx(RenderErrorBoundary, {
      location: dataRouterState.location,
      revalidation: dataRouterState.revalidation,
      component: errorElement,
      error,
      children: getChildren(),
      routeContext: {
        outlet: null,
        matches: matches2
      }
    }) : getChildren();
  }, null);
}
var DataRouterHook;
(function(DataRouterHook2) {
  DataRouterHook2["UseBlocker"] = "useBlocker";
  DataRouterHook2["UseRevalidator"] = "useRevalidator";
  DataRouterHook2["UseNavigateStable"] = "useNavigate";
})(DataRouterHook || (DataRouterHook = {}));
var DataRouterStateHook;
(function(DataRouterStateHook2) {
  DataRouterStateHook2["UseBlocker"] = "useBlocker";
  DataRouterStateHook2["UseLoaderData"] = "useLoaderData";
  DataRouterStateHook2["UseActionData"] = "useActionData";
  DataRouterStateHook2["UseRouteError"] = "useRouteError";
  DataRouterStateHook2["UseNavigation"] = "useNavigation";
  DataRouterStateHook2["UseRouteLoaderData"] = "useRouteLoaderData";
  DataRouterStateHook2["UseMatches"] = "useMatches";
  DataRouterStateHook2["UseRevalidator"] = "useRevalidator";
  DataRouterStateHook2["UseNavigateStable"] = "useNavigate";
  DataRouterStateHook2["UseRouteId"] = "useRouteId";
})(DataRouterStateHook || (DataRouterStateHook = {}));
function getDataRouterConsoleError(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/routers/picking-a-router.";
}
function useDataRouterState(hookName) {
  let state = React__namespace.useContext(DataRouterStateContext);
  !state ? process.env.NODE_ENV !== "production" ? invariant(false, getDataRouterConsoleError(hookName)) : invariant(false) : void 0;
  return state;
}
function useRouteContext(hookName) {
  let route = React__namespace.useContext(RouteContext);
  !route ? process.env.NODE_ENV !== "production" ? invariant(false, getDataRouterConsoleError(hookName)) : invariant(false) : void 0;
  return route;
}
function useCurrentRouteId(hookName) {
  let route = useRouteContext(hookName);
  let thisRoute = route.matches[route.matches.length - 1];
  !thisRoute.route.id ? process.env.NODE_ENV !== "production" ? invariant(false, hookName + ' can only be used on routes that contain a unique "id"') : invariant(false) : void 0;
  return thisRoute.route.id;
}
function useRouteError() {
  var _state$errors;
  let error = React__namespace.useContext(RouteErrorContext);
  let state = useDataRouterState(DataRouterStateHook.UseRouteError);
  let routeId = useCurrentRouteId(DataRouterStateHook.UseRouteError);
  if (error) {
    return error;
  }
  return (_state$errors = state.errors) == null ? void 0 : _state$errors[routeId];
}
const alreadyWarned = {};
function warningOnce(key, cond, message) {
  if (!cond && !alreadyWarned[key]) {
    alreadyWarned[key] = true;
    process.env.NODE_ENV !== "production" ? warning(false, message) : void 0;
  }
}
function Router(_ref5) {
  let {
    basename: basenameProp = "/",
    children = null,
    location: locationProp,
    navigationType = Action.Pop,
    navigator,
    static: staticProp = false
  } = _ref5;
  !!useInRouterContext() ? process.env.NODE_ENV !== "production" ? invariant(false, "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.") : invariant(false) : void 0;
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = React__namespace.useMemo(() => ({
    basename,
    navigator,
    static: staticProp
  }), [basename, navigator, staticProp]);
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = React__namespace.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  process.env.NODE_ENV !== "production" ? warning(locationContext != null, '<Router basename="' + basename + '"> is not able to match the URL ' + ('"' + pathname + search + hash + '" because it does not start with the ') + "basename, so the <Router> won't render anything.") : void 0;
  if (locationContext == null) {
    return null;
  }
  return /* @__PURE__ */ jsx(NavigationContext.Provider, {
    value: navigationContext,
    children: /* @__PURE__ */ jsx(LocationContext.Provider, {
      children,
      value: locationContext
    })
  });
}
var AwaitRenderStatus;
(function(AwaitRenderStatus2) {
  AwaitRenderStatus2[AwaitRenderStatus2["pending"] = 0] = "pending";
  AwaitRenderStatus2[AwaitRenderStatus2["success"] = 1] = "success";
  AwaitRenderStatus2[AwaitRenderStatus2["error"] = 2] = "error";
})(AwaitRenderStatus || (AwaitRenderStatus = {}));
new Promise(() => {
});
const Route0 = loadable__default.default(() => Promise.resolve().then(() => require("./assets/b.614cf033.cjs")));
const Route1 = loadable__default.default(() => Promise.resolve().then(() => require("./assets/a.0005d07b.cjs")));
const Route2 = loadable__default.default(() => Promise.resolve().then(() => require("./assets/b.2a59a06f.cjs")));
const Route3 = loadable__default.default(() => Promise.resolve().then(() => require("./assets/c.a8edb9b4.cjs")));
const Route4 = loadable__default.default(() => Promise.resolve().then(() => require("./assets/index.50f6fb7f.cjs")));
const Route5 = loadable__default.default(() => Promise.resolve().then(() => require("./assets/index.c811a3f7.cjs")));
const routes = [
  {
    path: "/b",
    element: React__default.default.createElement(Route0),
    preload: () => Promise.resolve().then(() => require("./assets/b.614cf033.cjs"))
  },
  {
    path: "/guide/a",
    element: React__default.default.createElement(Route1),
    preload: () => Promise.resolve().then(() => require("./assets/a.0005d07b.cjs"))
  },
  {
    path: "/guide/b",
    element: React__default.default.createElement(Route2),
    preload: () => Promise.resolve().then(() => require("./assets/b.2a59a06f.cjs"))
  },
  {
    path: "/guide/c",
    element: React__default.default.createElement(Route3),
    preload: () => Promise.resolve().then(() => require("./assets/c.a8edb9b4.cjs"))
  },
  {
    path: "/guide/",
    element: React__default.default.createElement(Route4),
    preload: () => Promise.resolve().then(() => require("./assets/index.50f6fb7f.cjs"))
  },
  {
    path: "/",
    element: React__default.default.createElement(Route5),
    preload: () => Promise.resolve().then(() => require("./assets/index.c811a3f7.cjs"))
  }
];
const Content = () => {
  const rootElement = useRoutes(routes);
  return rootElement;
};
const DataContext = React.createContext({});
const usePageData = () => {
  return React.useContext(DataContext);
};
const APPEARANCE_KEY = "appearance";
const setClassList = (isDark = false) => {
  const classList = document.documentElement.classList;
  if (isDark) {
    classList.add("dark");
  } else {
    classList.remove("dark");
  }
};
const updateAppearance = () => {
  const userPreference = localStorage.getItem(APPEARANCE_KEY);
  setClassList(userPreference === "dark");
};
if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
  updateAppearance();
  window.addEventListener("storage", updateAppearance);
}
function toggle() {
  const classList = document.documentElement.classList;
  if (classList.contains("dark")) {
    setClassList(false);
    localStorage.setItem(APPEARANCE_KEY, "light");
  } else {
    setClassList(true);
    localStorage.setItem(APPEARANCE_KEY, "dark");
  }
}
const check = "_check_rbkha_17";
const icon = "_icon_rbkha_34";
const dark = "_dark_rbkha_29";
const sun = "_sun_rbkha_57";
const moon = "_moon_rbkha_61";
const styles$7 = {
  "switch": "_switch_rbkha_1",
  check,
  icon,
  dark,
  sun,
  moon
};
function Switch(props) {
  return /* @__PURE__ */ jsx("button", {
    className: `${styles$7.switch} ${props.className}`,
    type: "button",
    role: "switch",
    ...props.onClick ? {
      onClick: props.onClick
    } : {},
    children: /* @__PURE__ */ jsx("span", {
      className: styles$7.check,
      children: /* @__PURE__ */ jsx("span", {
        className: styles$7.icon,
        children: props.children
      })
    })
  });
}
function SwitchAppearance() {
  return /* @__PURE__ */ jsxs(Switch, {
    onClick: toggle,
    children: [/* @__PURE__ */ jsx("div", {
      className: styles$7.sun,
      children: /* @__PURE__ */ jsx("div", {
        className: "i-carbon-sun w-full h-full"
      })
    }), /* @__PURE__ */ jsx("div", {
      className: styles$7.moon,
      children: /* @__PURE__ */ jsx("div", {
        className: "i-carbon-moon w-full h-full"
      })
    })]
  });
}
const link$1 = "_link_158tj_1";
const socialLinkIcon = "_social-link-icon_158tj_12";
const nav = "_nav_158tj_22";
const styles$6 = {
  link: link$1,
  "social-link-icon": "_social-link-icon_158tj_12",
  socialLinkIcon,
  nav
};
function MenuItem(item) {
  return /* @__PURE__ */ jsx("div", {
    className: "text-sm font-medium mx-3 ",
    children: /* @__PURE__ */ jsx("a", {
      className: styles$6.link,
      href: item.link,
      children: item.text
    })
  });
}
function Nav() {
  var _a;
  const {
    siteData: siteData2
  } = usePageData();
  const nav2 = ((_a = siteData2 == null ? void 0 : siteData2.themeConfig) == null ? void 0 : _a.nav) || [];
  return /* @__PURE__ */ jsx("header", {
    fixed: "~",
    pos: "t-0 l-0",
    w: "full",
    z: "10",
    children: /* @__PURE__ */ jsxs("div", {
      flex: "~",
      items: "center",
      justify: "between",
      className: `h-14 divider-bottom ${styles$6.nav}`,
      children: [/* @__PURE__ */ jsx("div", {
        children: /* @__PURE__ */ jsx("a", {
          href: "/",
          className: "w-full h-full text-lrem font-semibold flex items-center",
          hover: "opacity-60",
          children: "Island.js"
        })
      }), /* @__PURE__ */ jsxs("div", {
        flex: "~",
        children: [/* @__PURE__ */ jsx("div", {
          flex: "~",
          children: nav2.map((item) => /* @__PURE__ */ React.createElement(MenuItem, {
            ...item,
            key: item.text
          }))
        }), /* @__PURE__ */ jsx("div", {
          flex: "~",
          before: "menu-item-before",
          children: /* @__PURE__ */ jsx(SwitchAppearance, {})
        }), /* @__PURE__ */ jsx("div", {
          className: styles$6.socialLinkIcon,
          before: "menu-item-before",
          ml: "2",
          children: /* @__PURE__ */ jsx("a", {
            children: /* @__PURE__ */ jsx("div", {
              className: "i-carbon-logo-github w-5 h-5 fill-current"
            })
          })
        })]
      })]
    })
  });
}
const link = "_link_r3fql_1";
const styles$5 = {
  link
};
const EXTERNAL_URL_RE = /^https?/;
function Link(props) {
  const {
    href = "/",
    children,
    className = ""
  } = props;
  const isExternal = EXTERNAL_URL_RE.test(href);
  const target = isExternal ? "_blank" : "";
  const rel = isExternal ? "noopener noreferrer" : void 0;
  return /* @__PURE__ */ jsx("a", {
    href,
    target,
    rel,
    className: `${styles$5.link} ${className}`,
    children
  });
}
const button = "_button_togsy_1";
const medium = "_medium_togsy_14";
const big = "_big_togsy_21";
const brand = "_brand_togsy_28";
const alt = "_alt_togsy_47";
const styles$4 = {
  button,
  medium,
  big,
  brand,
  alt
};
function Button(props) {
  const {
    theme = "brand",
    size = "big",
    href = "/",
    external = false,
    className = ""
  } = props;
  let type = null;
  if (props.type === "button") {
    type = "button";
  } else if (props.type === "a") {
    type = external ? "a" : Link;
  }
  return React__default.default.createElement(type != null ? type : "a", {
    className: `${styles$4.button} ${styles$4[theme]} ${styles$4[size]} ${className}`,
    href
  }, props.text);
}
const clip = "_clip_zensi_1";
const styles$3 = {
  clip
};
function HomeHero(props) {
  const {
    hero
  } = props;
  return /* @__PURE__ */ jsx("div", {
    m: "auto",
    p: "t-20 x-16 b-16",
    children: /* @__PURE__ */ jsxs("div", {
      flex: "~",
      className: "max-w-1152px",
      m: "auto",
      children: [/* @__PURE__ */ jsxs("div", {
        text: "left",
        flex: "~ col",
        className: "max-w-592px",
        children: [/* @__PURE__ */ jsx("h1", {
          font: "bold",
          text: "6xl",
          className: "max-w-576px",
          children: /* @__PURE__ */ jsx("span", {
            className: styles$3.clip,
            children: hero.name
          })
        }), /* @__PURE__ */ jsx("p", {
          text: "6xl",
          font: "bold",
          className: "max-w-576px",
          children: hero.text
        }), /* @__PURE__ */ jsx("p", {
          p: "t-3",
          text: "2xl text-2",
          font: "medium",
          className: "whitespace-pre-wrap max-w-576px",
          children: hero.tagline
        }), /* @__PURE__ */ jsx("div", {
          flex: "~ wrap",
          justify: "start",
          p: "t-8",
          children: hero.actions.map((action) => /* @__PURE__ */ jsx("div", {
            p: "1",
            children: /* @__PURE__ */ jsx(Button, {
              type: "a",
              text: action.text,
              href: action.link,
              theme: action.theme
            })
          }, action.link))
        })]
      }), hero.image && /* @__PURE__ */ jsx("div", {
        w: "max-96",
        h: "max-96",
        flex: "center",
        m: "auto",
        children: /* @__PURE__ */ jsx("img", {
          src: hero.image.src,
          alt: hero.image.alt
        })
      })]
    })
  });
}
function HomeFeature(props) {
  return /* @__PURE__ */ jsx("div", {
    className: "max-w-1152px",
    m: "auto",
    flex: "~ wrap ",
    justify: "between",
    children: props.features.map((feature, i) => {
      const {
        icon: icon2,
        title: title2,
        details
      } = feature;
      return /* @__PURE__ */ jsx("div", {
        border: "rounded-md",
        p: "r-4 b-4",
        w: "1/3",
        children: /* @__PURE__ */ jsxs("article", {
          bg: "bg-soft",
          border: "~ bg-soft solid rounded-xl",
          p: "6",
          h: "full",
          children: [/* @__PURE__ */ jsx("div", {
            bg: "gray-light-4 dark:bg-white",
            border: "rounded-md",
            className: "md-5 w-12 h-12 text-3xl flex-center",
            children: icon2
          }), /* @__PURE__ */ jsx("h2", {
            font: "bold",
            children: title2
          }), /* @__PURE__ */ jsx("div", {
            text: "sm text-2",
            font: "medium",
            className: "pt-2 leading-6",
            children: details
          })]
        })
      }, title2);
    })
  });
}
function HomeLayout() {
  const {
    frontmatter
  } = usePageData();
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx(HomeHero, {
      hero: frontmatter.hero
    }), /* @__PURE__ */ jsx(HomeFeature, {
      features: frontmatter.features
    })]
  });
}
const sidebar = "_sidebar_16h0y_1";
const styles$2 = {
  sidebar
};
function Sidebar(props) {
  const {
    sidebarData,
    pathname
  } = props;
  const renderGroupItem = (item) => {
    const active = item.link === pathname;
    return /* @__PURE__ */ jsx("div", {
      ml: "5",
      children: /* @__PURE__ */ jsx("div", {
        p: "1",
        block: "~",
        text: "sm",
        "font-medium": "~",
        className: `${active ? "text-bramd" : "text-text-2"}`,
        children: /* @__PURE__ */ jsx(Link, {
          href: item.link,
          children: item.text
        })
      })
    });
  };
  const renderGroup = (item) => {
    var _a;
    return /* @__PURE__ */ jsxs("section", {
      block: "~",
      "not-first": "divider-top mt-4",
      children: [/* @__PURE__ */ jsx("div", {
        flex: "~",
        justify: "between",
        items: "center",
        children: /* @__PURE__ */ jsx("h2", {
          m: "t-3 b-2",
          text: "1rem text-1",
          font: "bold",
          children: item.text
        })
      }), /* @__PURE__ */ jsx("div", {
        mb: "1",
        children: (_a = item.items) == null ? void 0 : _a.map((item2) => /* @__PURE__ */ jsxs("div", {
          children: [" ", renderGroupItem(item2)]
        }, item2.link))
      })]
    }, item.text);
  };
  return /* @__PURE__ */ jsx("aside", {
    className: styles$2.sidebar,
    children: /* @__PURE__ */ jsx("nav", {
      children: sidebarData.map(renderGroup)
    })
  });
}
function usePrevNextPage() {
  var _a;
  const {
    pathname
  } = useLocation();
  const {
    siteData: siteData2
  } = usePageData();
  const sidebar2 = ((_a = siteData2.themeConfig) == null ? void 0 : _a.sidebar) || [];
  const flattenTitles = [];
  Object.keys(sidebar2).forEach((key) => {
    const groups = sidebar2[key] || [];
    groups.forEach((group) => {
      group.items.forEach((item) => {
        flattenTitles.push(item);
      });
    });
  });
  const pageIndex = flattenTitles.findIndex((item) => item.link === pathname);
  const prevPage = flattenTitles[pageIndex - 1] || null;
  const nextPage = flattenTitles[pageIndex + 1] || null;
  return {
    prevPage,
    nextPage
  };
}
const prev = "_prev_6xv5j_1";
const next = "_next_6xv5j_2";
const pagerLink = "_pager-link_6xv5j_6";
const title = "_title_6xv5j_20";
const desc = "_desc_6xv5j_29";
const styles$1 = {
  prev,
  next,
  "pager-link": "_pager-link_6xv5j_6",
  pagerLink,
  title,
  desc
};
function DocFooter() {
  const {
    prevPage,
    nextPage
  } = usePrevNextPage();
  return /* @__PURE__ */ jsx("footer", {
    mt: "8",
    children: /* @__PURE__ */ jsxs("div", {
      flex: "~",
      gap: "2",
      "divider-top": "~",
      pt: "6",
      children: [/* @__PURE__ */ jsx("div", {
        flex: "~ col",
        className: "styles.prev",
        children: prevPage && /* @__PURE__ */ jsxs("a", {
          href: prevPage.link,
          className: styles$1.pagerLink,
          children: [/* @__PURE__ */ jsx("span", {
            className: styles$1.desc,
            children: "\u4E0A\u4E00\u9875"
          }), /* @__PURE__ */ jsx("span", {
            className: styles$1.title,
            children: prevPage.text
          })]
        })
      }), /* @__PURE__ */ jsx("div", {
        flex: "~ col",
        className: "styles.next",
        children: nextPage && /* @__PURE__ */ jsxs("a", {
          href: nextPage.link,
          className: `${styles$1.pagerLink} ${styles$1.next} `,
          children: [/* @__PURE__ */ jsx("span", {
            className: styles$1.desc,
            children: "\u4E0B\u4E00\u9875"
          }), /* @__PURE__ */ jsx("span", {
            className: styles$1.title,
            children: nextPage.text
          })]
        })
      })]
    })
  });
}
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
const freeGlobal$1 = freeGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal$1 || freeSelf || Function("return this")();
const root$1 = root;
var Symbol$1 = root$1.Symbol;
const Symbol$2 = Symbol$1;
var objectProto$1 = Object.prototype;
var hasOwnProperty = objectProto$1.hasOwnProperty;
var nativeObjectToString$1 = objectProto$1.toString;
var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var objectProto = Object.prototype;
var nativeObjectToString = objectProto.toString;
function objectToString(value) {
  return nativeObjectToString.call(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var symbolTag = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
}
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {
  }
  return index;
}
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var now = function() {
  return root$1.Date.now();
};
const now$1 = now;
var FUNC_ERROR_TEXT$1 = "Expected a function";
var nativeMax = Math.max, nativeMin = Math.min;
function debounce(func, wait, options) {
  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now$1();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(now$1());
  }
  function debounced() {
    var time = now$1(), isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
var FUNC_ERROR_TEXT = "Expected a function";
function throttle(func, wait, options) {
  var leading = true, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    "leading": leading,
    "maxWait": wait,
    "trailing": trailing
  });
}
let links = [];
const NAV_HEIGHT = 56;
function scrollToTarget(target, isSmooth) {
  const targetPadding = parseInt(window.getComputedStyle(target).paddingTop, 10);
  const targetTop = window.scrollY + target.getBoundingClientRect().top - targetPadding - NAV_HEIGHT;
  window.scrollTo({
    left: 0,
    top: targetTop,
    behavior: isSmooth ? "smooth" : "auto"
  });
}
function bindingAsideScroll() {
  const marker = document.getElementById("aside-marker");
  const aside = document.getElementById("aside-container");
  const headers = Array.from((aside == null ? void 0 : aside.getElementsByTagName("a")) || []).map((item) => decodeURIComponent(item.hash));
  if (!aside) {
    return;
  }
  const activate = (links2, index) => {
    if (links2[index]) {
      const id = links2[index].getAttribute("href");
      const tocIndex = headers.findIndex((item) => item === id);
      const currentIdnex = aside == null ? void 0 : aside.querySelector(`a[href="#${id.slice(1)}"]`);
      if (currentIdnex) {
        marker.style.top = `${33 + tocIndex * 28}px`;
        marker.style.opacity = "1";
      }
    }
  };
  const setActiveLink = () => {
    links = Array.from(document.querySelectorAll(".island-doc .header-anchor")).filter((item) => {
      var _a;
      return ((_a = item.parentElement) == null ? void 0 : _a.tagName) !== "H1";
    });
    const isBotom = document.documentElement.scrollTo + window.innerHeight >= document.documentElement.scrollHeight;
    if (isBotom) {
      activate(links, links.length - 1);
      return;
    }
    for (let i = 0; i < links.length; i++) {
      const currentAnchor = links[i];
      const nextAnchor = links[i + 1];
      const scrollTop = Math.ceil(window.scrollY);
      const currentAnchorTop = currentAnchor.parentElement.offsetTop - NAV_HEIGHT;
      if (!nextAnchor) {
        activate(links, i);
        break;
      }
      if (i === 0 && scrollTop < currentAnchorTop || scrollTop === 0) {
        activate(links, 0);
        break;
      }
      const nextAnchorTop = nextAnchor.parentElement.offsetTop - NAV_HEIGHT;
      if (scrollTop >= currentAnchorTop && scrollTop < nextAnchorTop) {
        activate(links, i);
        break;
      }
    }
  };
  const throttleSetActiveLink = throttle(setActiveLink, 100);
  window.addEventListener("scroll", throttleSetActiveLink);
  return () => {
    window.removeEventListener("scroll", throttleSetActiveLink);
  };
}
function useHeader(initHeaders) {
  const [headers, setHeaders] = React.useState(initHeaders);
  React.useEffect(() => {
  }, []);
  return headers;
}
function Aside(props) {
  const {
    headers: rawHeaders = []
  } = props;
  const headers = useHeader(rawHeaders);
  const hasOutline = headers.length > 0;
  const markerRef = React.useRef(null);
  React.useEffect(() => {
    const unbinding = bindingAsideScroll();
    return () => {
      unbinding();
    };
  }, []);
  const renderHeader = (header) => {
    return /* @__PURE__ */ jsx("li", {
      children: /* @__PURE__ */ jsx("a", {
        href: `#${header.id}`,
        className: "block leading-7 text-text-2 hover:text-text-1",
        transition: "color duration-300",
        style: {
          paddingLeft: (header.depth - 2) * 12
        },
        onClick: (e) => {
          e.preventDefault();
          const target = document.getElementById(header.id);
          target && scrollToTarget(target, false);
        },
        children: header.text
      })
    }, header.id);
  };
  return /* @__PURE__ */ jsx("div", {
    flex: "~ col 1",
    style: {
      width: "var(--island-aside-width)"
    },
    children: /* @__PURE__ */ jsx("div", {
      children: hasOutline && /* @__PURE__ */ jsxs("div", {
        id: "aside-container",
        className: "relative divider-left pl-4 text-13px font-medium",
        children: [/* @__PURE__ */ jsx("div", {
          ref: markerRef,
          id: "aside-marker",
          className: "absolute top-33px opacity-0 w-1px h-18px bg-brand",
          style: {
            left: "-1px",
            transition: "top 0.25s cubic-bezier(0, 1, 0.5, 1), background-color 0.5s, opacity 0.25s"
          }
        }), /* @__PURE__ */ jsx("div", {
          "leading-7": "~",
          text: "13px",
          font: "semibold",
          children: "ON THIS PAGE "
        }), /* @__PURE__ */ jsx("nav", {
          children: /* @__PURE__ */ jsx("ul", {
            relative: "~",
            children: headers.map(renderHeader)
          })
        })]
      })
    })
  });
}
const content = "_content_oqdcv_1";
const docContent = "_doc-content_oqdcv_7";
const asideContainer = "_aside-container_oqdcv_13";
const styles = {
  content,
  "doc-content": "_doc-content_oqdcv_7",
  docContent,
  "aside-container": "_aside-container_oqdcv_13",
  asideContainer
};
function DocLayout() {
  var _a;
  const {
    siteData: siteData2,
    toc
  } = usePageData();
  const sidebarData = ((_a = siteData2.themeConfig) == null ? void 0 : _a.sidebar) || {};
  const {
    pathname
  } = useLocation();
  const matchedSidebarKey = Object.keys(sidebarData).find((key) => {
    if (pathname.startsWith(key)) {
      return true;
    }
  });
  const matchedSidebar = sidebarData[matchedSidebarKey] || [];
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx(Sidebar, {
      sidebarData: matchedSidebar,
      pathname
    }), /* @__PURE__ */ jsxs("div", {
      className: styles.content,
      flex: "~",
      children: [/* @__PURE__ */ jsxs("div", {
        className: styles.docContent,
        children: [/* @__PURE__ */ jsx("div", {
          className: "island-doc",
          children: /* @__PURE__ */ jsx(Content, {})
        }), /* @__PURE__ */ jsx(DocFooter, {})]
      }), /* @__PURE__ */ jsx("div", {
        className: styles.asideContainer,
        children: /* @__PURE__ */ jsx(Aside, {
          headers: toc
        })
      })]
    })]
  });
}
const base = "";
const vars = "";
const doc = "";
const __uno = "";
function Layout() {
  const pageData = usePageData();
  const {
    pageType
  } = pageData;
  const getContent = () => {
    if (pageType === "home") {
      return /* @__PURE__ */ jsx(HomeLayout, {});
    } else if (pageType === "doc") {
      return /* @__PURE__ */ jsx(DocLayout, {});
    } else {
      return /* @__PURE__ */ jsx("div", {
        children: "404"
      });
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx(Nav, {}), /* @__PURE__ */ jsx("section", {
      style: {
        paddingTop: "var(--island-nav-heigth)"
      },
      children: getContent()
    })]
  });
}
const siteData = { "title": "123", "description": "SSG Framework", "themeConfig": { "nav": [{ "text": "\u4E3B\u9875", "link": "/" }, { "text": "\u6307\u5357", "link": "/" }], "sidebar": { "/guide/": [{ "text": "\u6559\u7A0B", "items": [{ "text": "\u5FEB\u901F\u4E0A\u624B", "link": "/guide/a" }, { "text": "\u5982\u4F55\u5B89\u88C5", "link": "/guide/b" }, { "text": "\u6CE8\u610F\u4E8B\u9879", "link": "/guide/c" }] }] } }, "vite": {} };
async function initPageData(routePath) {
  var _a, _b;
  const matched = matchRoutes(routes, routePath);
  if (matched) {
    const route = matched[0].route;
    const moduleInfo = await route.preload();
    return {
      pageType: (_b = (_a = moduleInfo.frontmatter) == null ? void 0 : _a.pageType) != null ? _b : "doc",
      siteData,
      frontmatter: moduleInfo.frontmatter,
      pagePath: routePath,
      toc: moduleInfo.toc
    };
  }
  return {
    pageType: "404",
    siteData,
    frontmatter: {},
    pagePath: routePath
  };
}
function App() {
  return /* @__PURE__ */ jsx(Layout, {});
}
function StaticRouter({
  basename,
  children,
  location: locationProp = "/"
}) {
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let action = Action.Pop;
  let location = {
    pathname: locationProp.pathname || "/",
    search: locationProp.search || "",
    hash: locationProp.hash || "",
    state: locationProp.state || null,
    key: locationProp.key || "default"
  };
  let staticNavigator = getStatelessNavigator();
  return /* @__PURE__ */ jsx(Router, {
    basename,
    children,
    location,
    navigationType: action,
    navigator: staticNavigator,
    static: true
  });
}
function getStatelessNavigator() {
  return {
    createHref,
    encodeLocation,
    push(to) {
      throw new Error(`You cannot use navigator.push() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)})\` somewhere in your app.`);
    },
    replace(to) {
      throw new Error(`You cannot use navigator.replace() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)}, { replace: true })\` somewhere in your app.`);
    },
    go(delta) {
      throw new Error(`You cannot use navigator.go() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${delta})\` somewhere in your app.`);
    },
    back() {
      throw new Error(`You cannot use navigator.back() on the server because it is a stateless environment.`);
    },
    forward() {
      throw new Error(`You cannot use navigator.forward() on the server because it is a stateless environment.`);
    }
  };
}
function createHref(to) {
  return typeof to === "string" ? to : createPath(to);
}
function encodeLocation(to) {
  let path = typeof to === "string" ? parsePath(to) : to;
  return {
    pathname: path.pathname || "",
    search: path.search || "",
    hash: path.hash || ""
  };
}
async function render(pagePath) {
  const pageData = await initPageData(pagePath);
  return server.renderToString(/* @__PURE__ */ jsx(DataContext.Provider, {
    value: pageData,
    children: /* @__PURE__ */ jsx(StaticRouter, {
      location: pagePath,
      children: /* @__PURE__ */ jsx(App, {})
    })
  }));
}
exports.Fragment = Fragment;
exports.jsx = jsx;
exports.jsxs = jsxs;
exports.render = render;
exports.routes = routes;
