"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const ssrEntry = require("../ssr-entry.cjs");
require("react");
require("@loadable/component");
require("react/jsx-runtime");
require("react-dom/server");
function A() {
  return /* @__PURE__ */ ssrEntry.jsx("div", {
    children: "Hello  route A"
  });
}
exports.default = A;
