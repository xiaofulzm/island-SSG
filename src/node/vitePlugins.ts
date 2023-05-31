import { PACKAGE_ROOT } from 'node/constants';
import path from 'path';

import { pluginIndexHtml } from './plugin-island/indexHtml';
import pluginReact from '@vitejs/plugin-react';
import { plugConfig } from './plugin-island/config';
import { pluginRoutes } from './plugin-routes';
import { createMdxPlugins } from './plugin-mdx';
import pluginUnocss from 'unocss/vite'
import unocssOptions from './unocssOptions';

import { SiteConfig } from 'shared/types';
import { Plugin } from "vite";
import babelPluginIsland from './babel-plugin-island';

export async function createVitePlugins(
  config: SiteConfig,
  restart?: () => Promise<void>,
  isSSR = false
) {
  return [
    pluginUnocss(unocssOptions),
    pluginIndexHtml(),
    pluginReact({
      jsxRuntime: 'automatic',
      jsxImportSource:isSSR?path.join(PACKAGE_ROOT,'src','runtime'):'react',
      babel:{
        plugins: [ babelPluginIsland ]
      }
    }),
    plugConfig(config, restart),
    pluginRoutes({ 
      root: config.root,
      isSSR 
    }),
    await createMdxPlugins()
  ] as Plugin[]
}