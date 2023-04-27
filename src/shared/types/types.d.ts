// 全局的类型声明

// 声明模块
declare module 'island:site-data' {
  import type { UserConfig } from "shared/types";
  const siteData: UserConfig;
  export default siteData;
}