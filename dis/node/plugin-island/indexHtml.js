"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginIndexHtml = void 0;
const promises_1 = require("fs/promises");
const index_1 = require("./../constants/index");
function pluginIndexHtml() {
    return {
        name: 'island:index-html',
        transformIndexHtml(html) {
            return {
                html,
                tags: [
                    {
                        tag: 'script',
                        attrs: {
                            type: "module",
                            src: `/@fs/${index_1.CLIENT_ENTRN_PATH}`
                        },
                        injectTo: "body"
                    }
                ]
            };
        },
        configureServer(server) {
            return () => {
                server.middlewares.use(async (req, res, next) => {
                    // 1. 读取template.html的内容
                    // 2. 响应, HTML , 浏览器
                    let content = await (0, promises_1.readFile)(index_1.DEFAULT_TEMPLATE_PATH, "utf-8");
                    // 热跟新
                    content = await server.transformIndexHtml(// 载一个给定的 URL 作为 SSR 的实例化模块
                    req.url, content, req.originalUrl);
                    res.setHeader('Content-Type', 'text/html');
                    res.end(content);
                });
            };
        }
    };
}
exports.pluginIndexHtml = pluginIndexHtml;
