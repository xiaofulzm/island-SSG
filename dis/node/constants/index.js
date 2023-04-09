"use strict";
// 常量 存储路径
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TEMPLATE_PATH = exports.SERVER_ENTRN_PATH = exports.CLIENT_ENTRN_PATH = exports.PACKAGE_ROOT = void 0;
const path = require("path");
exports.PACKAGE_ROOT = path.join(__dirname, "..", "..", ".."); // 根路径
exports.CLIENT_ENTRN_PATH = path.join(// 客户端入口组件地址
exports.PACKAGE_ROOT, "src", "runtime", "client-entry.tsx");
exports.SERVER_ENTRN_PATH = path.join(// 服务端入口组件地址
exports.PACKAGE_ROOT, "src", "runtime", "ssr-entry.tsx");
exports.DEFAULT_TEMPLATE_PATH = path.join(exports.PACKAGE_ROOT, "template.html"); // html模板路劲
