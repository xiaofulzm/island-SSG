// 生产环境  构建

import {join} from "path";
import * as fs from  "fs-extra";

import { build as viteBuild, InlineConfig } from "vite";
import { SERVER_ENTRN_PATH,CLIENT_ENTRN_PATH, PACKAGE_ROOT } from "./constants";
import type { RollupOutput } from "rollup";

export async function bundle(root: string){

         // 打包函数
        // isServer true:服务端  fasle:客户端
        const resolveViteConfig = (isServer: boolean): InlineConfig => {
            return {
                mode:'production',
                root,
                build:{
                    ssr:isServer,
                    outDir:isServer?'.temp':'build',
                    rollupOptions:{
                        input:isServer?SERVER_ENTRN_PATH:CLIENT_ENTRN_PATH,
                        output:{
                            format:isServer?'cjs':'esm'
                        }
                    }
                }
            }
        }

    try{
   
        // 客户端打包
        const clientBuild = async ()=>{
            return  viteBuild(resolveViteConfig(false));
        };
        // 服务端打包
        const serverBuild = async ()=>{
            return  viteBuild(resolveViteConfig(true));
        };
        console.log("Building client + server bundles..." );
        // 并行执行
        const [clientBundle,serverBundle] =  await Promise.all([
            clientBuild(),
            serverBuild()
        ]);
        return [clientBundle,serverBundle] as [RollupOutput, RollupOutput];
    } catch(e){
        console.log(e);
    }
}

export async function renderPage(
    render: ()=>string,
    root: string,
    clientBundle:RollupOutput
){
    const appHtml = render();
    const clientChunk = clientBundle.output.find((chunk)=>chunk.type=== "chunk"&&chunk.isEntry);
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
    await fs.writeFile(join(root,'build','index.html'),html); // 写入文件
    await fs.remove(join(root,'.temp')); // 删除ssr 构建产物

}

export async function build(root: string){
    // 1.  bundle - client端  + server端
    const  [clientBundle] = await bundle(root);

    debugger;
    // 2. 引入server-entry 模块
    const serverEntryPath = join(PACKAGE_ROOT,root,".temp","ssr-entry.js");
    // 3. 服务端渲染 产出HTML
    const { render }  = require(serverEntryPath);
    
    await renderPage(render,root,clientBundle);
}