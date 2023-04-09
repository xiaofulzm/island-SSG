"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cac_1 = require("cac");
const build_1 = require("./build");
const dev_1 = require("./dev");
const cli = (0, cac_1.default)('lsland').version('0.0.1').help();
// 1. bin 字段
// 2. npm link 
// 3. island dev
// 注册子命令
cli.command('dev [root]', 'start devserver').action(async (root) => {
    const server = await (0, dev_1.createDevServer)(root);
    await server.listen();
    server.printUrls();
    // console.log('dev',root);
});
cli.command('build [root]', 'build in production').action(async (root) => {
    console.log('build', root);
    await (0, build_1.build)(root);
});
cli.parse(); // 全局解析 传入的参数
