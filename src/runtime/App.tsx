import React from 'react';
import { matchRoutes} from 'react-router-dom';
import { Layout } from '../theme-default';

import siteData from 'island:site-data';
import { routes } from 'island:routes';

import { PageData} from 'shared/types';
import { Route } from 'node/plugin-routes';

export async function initPageData(routePath:string): Promise<PageData>{

  // 匹配路由组件
  const matched = matchRoutes(routes,routePath);
  if(matched){
    const route = matched[0].route as Route ;
    // 获取路由组件编译后的模块内容
    const moduleInfo = await route.preload();
    return {
      pageType: moduleInfo.frontmatter?.pageType ?? 'doc',
      siteData,
      frontmatter:moduleInfo.frontmatter,
      pagePath: routePath,
      toc:moduleInfo.toc
    }
  }
  return {
    pageType:'404',
    siteData,
    frontmatter:{},
    pagePath: routePath
  }
}


export function App() {
  return <Layout />;
}
