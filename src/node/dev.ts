import { PACKAGE_ROOT } from './constants/index';
import { createServer } from 'vite';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import pluginReact from '@vitejs/plugin-react';
import { resolveConfig } from './config';
import { plugConfig } from './plugin-island/config';

export async function createDevServer(root: string, restart: () => Promise<void>) {
  const config = await resolveConfig(root, 'serve', 'development');
  console.log(config);
  return createServer({
    root,
    plugins: [
      pluginIndexHtml(),
      pluginReact(),
      plugConfig(config, restart)
    ],
    server: {   // 配置合法路径
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
