import cac from "cac";
import { build } from "./build";
import { createDevServer } from "./dev";

const cli = cac('lsland').version('0.0.1').help();

// 1. bin 字段
// 2. npm link 
// 3. island dev


// 注册子命令
cli.command('dev [root]', 'start devserver').action(async (root:string)=>{
    const server = await createDevServer(root);
    await server.listen();
    server.printUrls();
    // console.log('dev',root);
})

cli.command('build [root]', 'build in production').action(async (root:string)=>{
    console.log('build',root);
    await build(root);
})

cli.parse(); // 全局解析 传入的参数