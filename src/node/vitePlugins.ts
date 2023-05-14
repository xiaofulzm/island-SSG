
import { pluginIndexHtml } from './plugin-island/indexHtml';
import pluginReact from '@vitejs/plugin-react';
import { plugConfig } from './plugin-island/config';
import { pluginRoutes } from './plugin-routes';
import { createMdxPlugins } from './plugin-mdx';
import pluginUnocss from 'unocss/vite'
import unocssOptions from './unocssOptions';

import { SiteConfig } from 'shared/types';
import { Plugin } from "vite";

export async function createVitePlugins(
  config: SiteConfig,
  restart?: () => Promise<void>,
  isSSR = false
) {
  return [
    pluginUnocss(unocssOptions),
    pluginIndexHtml(),
    pluginReact({
      jsxRuntime: 'automatic'
    }),
    plugConfig(config, restart),
    pluginRoutes({ 
      root: config.root,
      isSSR 
    }),
    await createMdxPlugins()
  ] as Plugin[]
}