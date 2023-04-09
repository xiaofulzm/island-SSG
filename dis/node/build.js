"use strict";
// 生产环境  构建
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = exports.renderPage = exports.bundle = void 0;
const path_1 = require("path");
const fs = require("fs-extra");
const vite_1 = require("vite");
const constants_1 = require("./constants");
async function bundle(root) {
    // 打包函数
    // isServer true:服务端  fasle:客户端
    const resolveViteConfig = (isServer) => {
        return {
            mode: 'production',
            root,
            build: {
                ssr: isServer,
                outDir: isServer ? '.temp' : 'build',
                rollupOptions: {
                    input: isServer ? constants_1.SERVER_ENTRN_PATH : constants_1.CLIENT_ENTRN_PATH,
                    output: {
                        format: isServer ? 'cjs' : 'esm'
                    }
                }
            }
        };
    };
    try {
        // 客户端打包
        const clientBuild = async () => {
            return (0, vite_1.build)(resolveViteConfig(false));
        };
        // 服务端打包
        const serverBuild = async () => {
            return (0, vite_1.build)(resolveViteConfig(true));
        };
        console.log("Building client + server bundles...");
        // 并行执行
        const [clientBundle, serverBundle] = await Promise.all([
            clientBuild(),
            serverBuild()
        ]);
        return [clientBundle, serverBundle];
    }
    catch (e) {
        console.log(e);
    }
}
exports.bundle = bundle;
async function renderPage(render, root, clientBundle) {
    const appHtml = render();
    const clientChunk = clientBundle.output.find((chunk) => chunk.type === "chunk" && chunk.isEntry);
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <div id="root" >${appHtml}</div>
            <script src="/${clientChunk?.fileName}"  type="module"></script>
        </body>
        </html>
    `.trim();
    await fs.writeFile((0, path_1.join)(root, 'build', 'index.html'), html); // 写入文件
    await fs.remove((0, path_1.join)(root, '.temp')); // 删除ssr 构建产物
}
exports.renderPage = renderPage;
async function build(root) {
    // 1.  bundle - client端  + server端
    const [clientBundle] = await bundle(root);
    debugger;
    // 2. 引入server-entry 模块
    const serverEntryPath = (0, path_1.join)(constants_1.PACKAGE_ROOT, root, ".temp", "ssr-entry.js");
    // 3. 服务端渲染 产出HTML
    const { render } = require(serverEntryPath);
    await renderPage(render, root, clientBundle);
}
exports.build = build;
