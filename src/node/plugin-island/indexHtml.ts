// 入口html插件
import { Plugin } from 'vite';
import { readFile } from 'fs/promises';

import { DEFAULT_TEMPLATE_PATH, CLIENT_ENTRN_PATH } from './../constants/index';

export function pluginIndexHtml(): Plugin {
  return {
    name: 'island:index-html',
    transformIndexHtml(html) {
      // 转换 index.html 的专用钩子。钩子接收当前的 HTML 字符串和转换上下文
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: `/@fs/${CLIENT_ENTRN_PATH}`
            },
            injectTo: 'body'
          }
        ]
      };
    },
    configureServer(server) {
      // 是用于配置开发服务器的钩子
      return () => {
        server.middlewares.use(async (req, res) => {
          // 1. 读取template.html的内容
          // 2. 响应, HTML , 浏览器
          let content = await readFile(DEFAULT_TEMPLATE_PATH, 'utf-8');
          // 热跟新
          content = await server.transformIndexHtml(
            // 载一个给定的 URL 作为 SSR 的实例化模块
            req.url,
            content,
            req.originalUrl
          );
          res.setHeader('Content-Type', 'text/html');
          res.end(content);
        });
      };
    }
  };
}
