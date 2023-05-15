// 布局

import {usePageData  } from '@runtime';
import 'uno.css'

export function Layout() {

  const pageData = usePageData();
  const { pageType } = pageData;

  const  getContent = () =>{
    if(pageType === 'home'){
      return <div>主页内容</div>
    }else if (pageType === 'doc'){
      return <div>正文内容</div>
    }else{
      return <div>404</div>
    }
  }

  

  return (
    <div>
      <div>nav</div>
      {getContent()}
    </div>
  );
}
