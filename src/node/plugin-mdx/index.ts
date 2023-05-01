

import { pluginMdxRollup } from "./pluginMdxRollup"

// mdx 插件

export function createMdxPlugins() {
  return [
    pluginMdxRollup()
  ];
}
