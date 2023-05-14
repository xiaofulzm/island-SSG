// 布局

import { Content } from '@runtime';
import 'uno.css'

export function Layout() {
  return (
    <div>
      <h1 p='2' m='2' className='text-red' > Common Content</h1>
      <Content />
    </div>
  );
}
