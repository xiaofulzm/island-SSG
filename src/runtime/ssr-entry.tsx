// 服务端入口组件

// import React from 'react';
import { App } from './App';
import { renderToString } from 'react-dom/server';

import { StaticRouter } from "react-router-dom/server";

export function render() {
  return renderToString(
    <StaticRouter location={'guide'}>
      <App />
    </StaticRouter>
  );
}
