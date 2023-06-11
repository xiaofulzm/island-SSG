// 生产环境  构建

import { dirname, join } from 'path';
import fs from 'fs-extra';
import { pathToFileURL } from 'url';
import { SiteConfig } from 'shared/types';

import { build as viteBuild, InlineConfig } from 'vite';

import { createVitePlugins } from './vitePlugins';

import {
  SERVER_ENTRN_PATH,
  CLIENT_ENTRN_PATH,
  PACKAGE_ROOT,
  MASK_SPLITTER, 
  EXTERNALS
} from './constants';
import type { RollupOutput } from 'rollup';
import { Route } from './plugin-routes/index';
import { RenderResult } from 'runtime/ssr-entry';
import { PRE_BUNDLE_DIR } from '../../scripts/prebundle';


// import AutoImport from 'unplugin-auto-import/vite';
// import ora from 'ora';
const CLIENT_OUTPUT = 'build';

export async function bundle(root: string, config: SiteConfig) {
  // 打包函数
  // isServer true:服务端  fasle:客户端
  const resolveViteConfig = async (isServer: boolean): Promise<InlineConfig> => {
    return {
      mode: 'production',
      root,
      plugins: await createVitePlugins(config),
      ssr: {
        noExternal: ['react-router-dom','lodash-es']
      },
      build: {
        ssr: isServer,
        outDir: isServer ? join(root, '.temp') : join(root,CLIENT_OUTPUT),
        rollupOptions: {
          input: isServer ? SERVER_ENTRN_PATH : CLIENT_ENTRN_PATH,
          output: {
            format: isServer ? 'cjs' : 'esm'
          },
          external:EXTERNALS
        }
      }
    };
  };
  // const spinner = ora();
  // spinner.start('Building client + server bundles...');
  try {
    // 客户端打包
    const clientBuild = async () => {
      return viteBuild(await resolveViteConfig(false));
    };
    // 服务端打包
    const serverBuild = async () => {
      return viteBuild(await resolveViteConfig(true));
    };
    // 并行执行
    const [clientBundle, serverBundle] = await Promise.all([
      clientBuild(),
      serverBuild()
    ]);

    const publicDir = join(root,'public');  //赋值图片文件夹
    if(fs.pathExistsSync(publicDir)){
      await fs.copy(publicDir,join(root,CLIENT_OUTPUT))
    }

    // 移动 importMap产物
    await fs.copy(join(PACKAGE_ROOT,PRE_BUNDLE_DIR),join(root,CLIENT_OUTPUT));

    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (e) {
    console.log(e);
  }
}

async function buildIsland(root: string, islandPathToMap: Record<string,string>) {
    // { Aside: 'xxx' }
    // 内容
    // import { Aside } from 'xxx'
    // window.ISLAND = { Aside }
    // window.ISLAND_PROPS = JSON.parse( document.getElementByIdd('island-props').textContent ) 
    const islandsInjectCode = `
        ${Object.entries(islandPathToMap).map(
          ([islandName,islandPath])=>
          `import { ${islandName} from '${islandPath}' }`
        ).join('')}
        window.ISLAND = { ${Object.keys(islandPathToMap).join(', ')} };
        window.ISLAND_PROPS = JSON.parse( document.getElementById('island-props').textContent )   
    `
    const injectId = 'island:inject';
    return viteBuild({
      mode:'production',
      esbuild:{
        jsx:'automatic'
      },
      build:{
        outDir: join(root,'.temp'),
        rollupOptions:{
            input:injectId,
            external:EXTERNALS
        }
      },
      plugins:[
        {
          name:'island:inject',
          enforce:'post',
          resolveId(id){
            if(id.includes(MASK_SPLITTER)){
              const [originId, imported] = id.split(MASK_SPLITTER);
              return this.resolve(originId, imported,{skipSelf:true}); //  skipSelf:true 让其他插件忽略
            }
            if(id === injectId){
              return id
            }
          },
          load(id){
            if(id === injectId){
              return islandsInjectCode;
            }
          },
          generateBundle(_,bundle){  // 删除静态资源路径
             for(const name in bundle){
               if(bundle[name].type === 'asset' ){
                 delete bundle[name];
               }
             }
          }
        }
      ]
    })
}

export async function renderPage(
  render: (url:string) => RenderResult,
  root: string,
  clientBundle: RollupOutput,
  routes:Route[]
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  );

  // 多路由打包
  await  Promise.all(
     routes.map(async (route)=>{
       const routePath = route.path;
       const {appHtml,islandToPathMap,islandProps = []} = await render(routePath);
       const styleAssets = clientBundle.output.filter(
         (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
       )
       const islandBundle =  await buildIsland(root,islandToPathMap); // 获取island打包产物
       const islandsCode = (islandBundle as RollupOutput).output[0].code;

       const normalizeVendorFilename = (fileName: string) =>fileName.replace(/\//g, '_') + '.js'; // 路径规范化
       const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Document</title>
              ${styleAssets.map((item) => `<link rel="stylesheet" href="/${item.fileName}">`).join('\n')}
              <script type="importmap" >
                {
                  "imports:{
                    ${EXTERNALS.map((name)=>`"${name}" : "/${normalizeVendorFilename(name)}"`).join(',')}
                  }
                }
              </script>
          </head>
          <body>
              <div id="root" >${appHtml}</div>
              <script type="module" >${islandsCode}</script>
              <script src="/${clientChunk?.fileName}"  type="module"></script>
              <script id="island-props" >${JSON.stringify(islandProps)}</script>
          </body>
          </html>
      `.trim();
      const fileName = routePath.endsWith('/')?`${routePath}index.html`:`${routePath}.html`;
      await fs.ensureDir(join(root,'build',dirname(fileName)));
      await fs.writeFile(join(root,'build',fileName),html); // 写入文件
     })
  )
  // await fs.remove(join(root, '.temp')); // 删除ssr 构建产物
}

export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1.  bundle - client端  + server端
  const [clientBundle] = await bundle(root, config);
  // 2. 引入server-entry 模块
  const serverEntryPath = join(PACKAGE_ROOT, root, '.temp', 'ssr-entry.cjs');
  // 3. 服务端渲染 产出HTML
  const { render,routes } = await import(pathToFileURL(serverEntryPath).toString());
  // const { render } = await import(serverEntryPath);

  await renderPage(render, root, clientBundle,routes);
}
