import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/node/cli.ts'], // 入口文件
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
  }
});
