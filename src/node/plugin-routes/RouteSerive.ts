
import fastGlob from 'fast-glob';
import path from 'path';
import { normalizePath } from 'vite';

// 约定式路由的核心逻辑

interface RouteMeta {
  routePath: string;
  absolutePath: string;
}

export class RouteService {
  #scanDir: string
  #routeData: RouteMeta[] = []
  constructor(scanDir: string) {
    this.#scanDir = scanDir;
  }
  async init() {
    const files = fastGlob
      .sync(['**/*.{js,jsx,ts,tsx,md,mdx}'], { // 需要查询的文件类型
        cwd: this.#scanDir, // 工作目录 
        absolute: true, // 返回文件的绝对路径
        ignore: ['**/build/**', '**/.island/**', 'config.ts']
      })
      .sort() // 排序

    files.forEach(file => {
      const fileRelativePath = normalizePath(path.relative(this.#scanDir, file));  // 获取相对路径
      // l路由路径
      const routePath = this.normalizeRoutePath(fileRelativePath);
      this.#routeData.push({
        routePath,
        absolutePath: normalizePath(file)
      })
    })
  }
  generateRoutesCode() {
    return `
      import React from 'react';
      import loadable from '@loadable/component';
      ${this.#routeData.map((route, index) => {
      return `const Route${index}  = loadable(()=> import('${route.absolutePath}'));`;
    }).join('\n')}
      export const routes = [
        ${this.#routeData.map((route, index) => {
      return `{ path:'${route.routePath}',element:React.createElement(Route${index})}`
    })}
      ]
    `
  }
  getRouteMeta(): RouteMeta[] {
    return this.#routeData;
  }
  normalizeRoutePath(raw: string) {
    // 去除文件的后缀名[ ., index]
    const routePath = raw.replace(/\.(.*)?$/, '').replace(/index$/, '');
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }
}