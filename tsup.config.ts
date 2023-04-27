import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/node/cli.ts',  // cli入口
    'src/node/index.ts', // api入口
    'src/node/dev.ts',  // dev入口  因为配置(config)文件热更新需要反复调用 所以单独打包
  ], // 入口文件
  bundle: true, // 开启bundle模式
  splitting: true, // 开启拆包
  outDir: 'dist', // 产物目录
  format: ['cjs', 'esm'], // 产物格式
  dts: true, // ts类型文件
  // 自动注入一些 API 的 polyfill 代码
  // 如 __dirname, __filename, import.meta 等等，保证这些 API 在 ESM 和 CJS 环境下的兼容性。
  shims: true,
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
  },
  clean: true  // 清除之前的构建产物
});
