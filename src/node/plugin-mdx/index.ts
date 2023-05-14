
import { Plugin } from "vite";
import { pluginMdxRollup } from "./pluginMdxRollup"
import { PluginMdxHMR } from "./pluginMdxHmr";
// mdx 插件
// 


export async function createMdxPlugins(): Promise<Plugin[]> {
  return [
    await pluginMdxRollup(),
    PluginMdxHMR()
  ];
}
