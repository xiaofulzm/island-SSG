import type { PlaywrightTestConfig } from "@playwright/test";

// 1. 创建测试项目
// 2. 启动测试项目
// 3. 开启无头浏览器进行访问 

const config: PlaywrightTestConfig = {
  testDir: './e2e',  // 指定测试文件地址
  timeout: 60000, // 超时时间
  webServer: {
    url: 'http://127.0.0.1:5173',
    command: 'pnpm prepare:e2e'  // 一些前置的操作
  },
  use: {
    headless: true   // 无头浏览器
  }
};


export default config;