

import { UserConfig as ViteConfiguration } from "vite";

// 导航栏类型
export type NavItemWithLink = {
  text: string;
  link: string;
}

// 侧边栏类型
export interface SidebarGroup {
  text: string;
  items: SidebarItem[];
}

export type SidebarItem = {
  text: string;
  link: string
}

export interface Sidebar {
  [path: string]: SidebarGroup[];

}

// 页脚类型
export interface Footer {
  message: string;
}


// 主题配置类型
export interface ThemeConfig {
  nav?: NavItemWithLink[]; // 导航栏
  sidebar?: Sidebar;   // 侧边栏
  footer?: Footer; // 页脚
}


// 配置文件的类型
export interface UserConfig {
  title?: string;
  description?: string;
  themeConfig?: ThemeConfig; // 主题配置
  vite?: ViteConfiguration;   // vite 原生的配置类型

}

// 整体的配置
export interface SiteConfig {
  root: string,
  configPath: string,
  siteData: UserConfig
}