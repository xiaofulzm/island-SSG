"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const ssrEntry = require("../ssr-entry.cjs");
require("react");
require("@loadable/component");
require("react/jsx-runtime");
require("react-dom/server");
const data = {
  islandProps: [],
  islandToPathMap: {}
};
const originJsx = ssrEntry.jsx;
const originJsxs = ssrEntry.jsxs;
const internalJsx = (jsx2, type, props, ...args) => {
  if (props && props.__island) {
    data.islandProps.push(props);
    const id = type.name;
    data[islandToPathMap][id] = props.__island;
    delete props.__island;
    return jsx2("div", {
      __island: `${id}:${data.islandProps.length - 1}`,
      children: jsx2(type, props, ...args)
    });
  }
  return jsx2(type, props, ...args);
};
const jsx = (...args) => internalJsx(originJsx, ...args);
const jsxs = (...args) => internalJsx(originJsxs, ...args);
const Fragment = ssrEntry.Fragment;
const clearIslandData = () => {
  data.islandProps = [];
  data.islandToPathMap = {};
};
exports.Fragment = Fragment;
exports.clearIslandData = clearIslandData;
exports.data = data;
exports.jsx = jsx;
exports.jsxs = jsxs;
