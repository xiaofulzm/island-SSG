import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', //执行环境
    exclude: [
      // 排除文件
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**'
    ],
    threads: true // 开启多线程的模式
  }
});
