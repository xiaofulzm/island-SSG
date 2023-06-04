// 服务端入口组件
import { createRoot,hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom';
import { initPageData } from './App';
import { DataContext } from './hooks';
import { ComponentType } from 'react';

declare global {
  interface Window {
    ISLAND:  Record<string, ComponentType<unknown> >;
    ISLAND_PROPS: unknown[];
  }
}

 async function renderInBrowser() {
  const pageData = await initPageData(location.pathname);

  const containerEl = document.getElementById('root');
  if (!containerEl) {
    throw new Error('#root element not found');
  }
  
  if(import.meta.env.DEV){

    createRoot(containerEl).render(
      <DataContext.Provider value={pageData}  >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DataContext.Provider>
    );
  }else{
    // island组件的注水
    const islands = document.querySelectorAll('[__island]');
    if(islands.length === 0) return ;

    for(const island of islands) {
      //  Aside:0
      const [id, index] = island.getAttribute('__island').split(':');
      const Element = window.ISLAND[id] as ComponentType<unknown>;
      hydrateRoot(island,<Element {...window.ISLAND_PROPS[index]} />);
    }
  }

}

renderInBrowser();
