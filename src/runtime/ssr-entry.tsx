// 服务端入口组件

import React from 'react';
import { App } from './App';
import { renderToString } from 'react-dom/server';

export function render() {
  return renderToString(<App />);
}
