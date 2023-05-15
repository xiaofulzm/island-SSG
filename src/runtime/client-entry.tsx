// 服务端入口组件
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom';
import { initPageData } from './App';
import { DataContext } from './hooks';


 async function renderInBrowser() {
  const pageData = await initPageData(location.pathname);

  const containerEl = document.getElementById('root');
  if (!containerEl) {
    throw new Error('#root element not found');
  }
  
  createRoot(containerEl).render(
    <DataContext.Provider value={pageData}  >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DataContext.Provider>
  );
}

renderInBrowser();
