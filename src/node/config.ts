// 解析配置文件
import fs from "fs-extra";
import { resolve } from "path";
import { loadConfigFromFile } from 'vite';

import { UserConfig, SiteConfig } from '../shared/types/index';


type RawConfig = UserConfig | Promise<UserConfig> | (() => UserConfig | Promise<UserConfig>)


// 配置文件的读取
function getUserConfigPath(root: string) {
  try {
    const supportConfigFiles = ['config.js', 'config.ts']; // 支持两种格式的配置文件
    const configPath = supportConfigFiles.map(file => resolve(root, file)).find(fs.pathExistsSync);
    return configPath;
  } catch (e) {
    console.log(`Failed to load user config.`);
    throw e;
  }
}

export async function resolveUserConfig(
  root: string, // 项目的根目录
  command: 'serve' | 'build',
  mode: 'production' | 'development'
) {
  // 1. 获取配置文件路径, 支持js, ts 格式
  const configPath = getUserConfigPath(root);

  // 2. 解析配置文件
  const result = await loadConfigFromFile(
    {
      command,
      mode
    },
    configPath,
    root
  );
  if (result) {
    const { config: rawConfig = {} as RawConfig } = result;
    // 1. object
    // 2. promise
    // 3. function
    const userConfig = await (typeof rawConfig === 'function' ? rawConfig() : rawConfig);
    // 返回配置相关的一些信息
    return [configPath, userConfig] as const;
  } else {
    return [configPath, {} as UserConfig] as const;
  }
}


function resolveSiteData(userConfig: UserConfig): UserConfig {
  return {
    title: userConfig.title || 'Island.js',
    description: userConfig.description || 'SSG Framework',
    themeConfig: userConfig.themeConfig || {},
    vite: userConfig.vite || {}
  }
}

export async function resolveConfig(
  root: string, // 项目的根目录
  command: 'serve' | 'build',
  mode: 'production' | 'development'
) {
  const [configPath, userConfig] = await resolveUserConfig(root, command, mode);
  // console.log(configPath)
  const siteConfig: SiteConfig = {
    root,
    configPath,
    siteData: resolveSiteData(userConfig as UserConfig)
  }
  return siteConfig;
}


// 配置文件的类型提示
export function defineConfig(config: UserConfig): UserConfig {
  return config;
}