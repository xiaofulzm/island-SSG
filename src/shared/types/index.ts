
import { type } from "os";
import { ComponentType } from "react";
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


// 页面数据
export interface PageData {
  siteData:UserConfig;   // 站点信息
  pagePath:string;  // 当前路由
  frontmatter:Frontmatter;  // 页面的的源数据
  pageType?:PageType;
  toc?:Header[]
}

// 页面类型
export type PageType = 'home' | 'doc'|'custom'|'404';


export interface Feature{
  icon:string;
  title:string;
  details:string;
}

export interface Hero{
  name:string;
  text:string;
  tagline:string;
  image?:{
    src:string;
    alt:string;
  };
  actions:{
    text:string;
    link:string;
    theme:'brand' | 'alt';
  }[];
}

export interface Frontmatter{
  title?:string;
  description?:string;
  pageType?:PageType;  // 页面类型
  Sidebar?:boolean;  // 侧边栏是否展示
  outLine?:boolean;  // 大纲栏是否展示
  features?:Feature[];
  hero?:Hero;
}

export interface Header {
  id:string;
  text:string;
  depth:number
}

export interface PageModule{
  default: ComponentType;
  frontmatter?:Frontmatter;  // 页面的的源数据
  toc?:Header[];
  [key:string]: unknown;
}

export type PropsWithIsland = {
   __island?:boolean
}