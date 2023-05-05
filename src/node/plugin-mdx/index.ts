
import { Plugin } from "vite";
import { pluginMdxRollup } from "./pluginMdxRollup"

// mdx 插件

export async function createMdxPlugins(): Promise<Plugin[]> {
  return [
    await pluginMdxRollup()
  ];
}
