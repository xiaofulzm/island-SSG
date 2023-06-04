// 常量 存储路径

import * as path from 'path';

export const PACKAGE_ROOT = path.join(__dirname, '..'); // 根路径

export const CLIENT_ENTRN_PATH = path.join(
  // 客户端入口组件地址
  PACKAGE_ROOT,
  'src',
  'runtime',
  'client-entry.tsx'
);

export const SERVER_ENTRN_PATH = path.join(
  // 服务端入口组件地址
  PACKAGE_ROOT,
  'src',
  'runtime',
  'ssr-entry.tsx'
);

export const DEFAULT_TEMPLATE_PATH = path.join(PACKAGE_ROOT, 'template.html'); // html模板路劲

export const MASK_SPLITTER = '!!ISLAND!!';

export const EXTERNALS = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime'
]