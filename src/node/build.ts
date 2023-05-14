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
  PACKAGE_ROOT
} from './constants';
import type { RollupOutput } from 'rollup';
import { Route } from './plugin-routes/index';


// import AutoImport from 'unplugin-auto-import/vite';
// import ora from 'ora';


export async function bundle(root: string, config: SiteConfig) {
  // 打包函数
  // isServer true:服务端  fasle:客户端
  const resolveViteConfig = async (isServer: boolean): Promise<InlineConfig> => {
    return {
      mode: 'production',
      root,
      plugins: await createVitePlugins(config),
      ssr: {
        noExternal: ['react-router-dom']
      },
      build: {
        ssr: isServer,
        outDir: isServer ? '.temp' : join(root,'build'),
        rollupOptions: {
          input: isServer ? SERVER_ENTRN_PATH : CLIENT_ENTRN_PATH,
          output: {
            format: isServer ? 'cjs' : 'esm'
          }
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
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (e) {
    console.log(e);
  }
}

export async function renderPage(
  render: (pagePath:string) => string,
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
       const appHtml = render(routePath);
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
      const fileName = routePath.endsWith('/')?`${routePath}index.html`:`${routePath}.html`;
      await fs.ensureDir(join(root,'build',dirname(fileName)));
      await fs.writeFile(join(root,'build',fileName),html); // 写入文件
     })
  )
  await fs.remove(join(root, '.temp')); // 删除ssr 构建产物
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
