import { PACKAGE_ROOT } from 'node/constants';
import { join, relative } from 'path';
import { SiteConfig } from 'shared/types/index';
import { Plugin } from 'vite';
import { normalizePath } from 'vite'
import sirv from 'sirv';

// vite 插件
// 让前端能够访问到 config 配置的数据
// 虚拟模块

const SITE_DATA_ID = 'island:site-data'; // 虚拟模块id

export function plugConfig(config: SiteConfig, restartServe?: () => Promise<void>): Plugin {
  return {
    name: 'island:site-data',
    resolveId(id) {
      if (id === SITE_DATA_ID) {
        // \0:  vite 虚拟模块的约定
        return '\0' + SITE_DATA_ID
      }
    },
    load(id) {
      if (id === '\0' + SITE_DATA_ID) {
        return `export default ${JSON.stringify(config.siteData)}`;
      }
    },
    config() {
      return {
        root: PACKAGE_ROOT,
        resolve: {
          alias: {
            '@runtime': join(PACKAGE_ROOT, 'src', 'runtime', 'index.ts')
          }
        },
        css:{
          modules:{
            localsConvention:'camelCase'
          }
        }
      }
    },
    async handleHotUpdate(ctx) {
      // console.log('123')
      // 配置文件的热更新
      // console.log(normalizePath(config.configPath))
      const customWatchedFiles = [normalizePath(config.configPath)]; // 配置文件地址
      const include = (id: string) => customWatchedFiles.some((file) => id.includes(file));
      // console.log(config.configPath);
      if (include(ctx.file)) {
        console.log(
          `\n${relative(config.root, ctx.file)} changed, restarting server...`
        );
        // 重启 Dev Server
        // 方案讨论
        // 1. 插件内重启 vite的 devserver
        // X 没有作用 因为并没有进行island 框架配置的重新读取
        // 2. 手动调用 dev.ts 中的 createServer
        await restartServe();
      }
    },
    configureServer(server){
      const publicDir =  join(config.root,'public');
      server.middlewares.use(sirv(publicDir))
    }
  }
}