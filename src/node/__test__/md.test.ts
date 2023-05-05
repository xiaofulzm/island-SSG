

// MDX编译工具链的测试用例

import { unified } from 'unified';
import remarkParse from 'remark-parse';  // 解析markdown
import remarkRehype from 'remark-rehype'; // 将markdownAST解析为HATMLAST
import rehypeStringify from 'rehype-stringify'; // 将HTMLAST转化为HTMl字符串 输出
import { rehypePluginPreWrapper } from '../plugin-mdx/rehypePlugins/preWrapper';
import { rehypePluginShiki } from '../plugin-mdx/rehypePlugins/shiki';
import shiki from 'shiki';

import { describe, expect, test } from "vitest";

describe("Markdown compile cases", async () => {
  const processor = unified();
  processor
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePluginPreWrapper)
    .use(rehypePluginShiki, { highlighter: await shiki.getHighlighter({ theme: 'nord' }) })
    .use(rehypeStringify)


  test('Compile title', async () => {
    const mdContent = '# 123';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot('"<h1>123</h1>"');
  })

  test('Compile code', async () => {
    const mdContent = 'I am using `Island.js`';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot('"<p>I am using <code>Island.js</code></p>"');
  })

  test('Compile code block', async () => {
    const mdContent = '```js\nconsole.log(2423);\n```';
    const result = processor.processSync(mdContent);

    // 需要的结构
    // <div class="language-js">
    //   <span class="lang">js</span>
    //   <pre><code class="language-js">console.log(123)</code></pre>
    // </div>
    expect(result.value).toMatchInlineSnapshot(`
      "<div class=\\"language-js\\"><span class=\\"lang\\">js</span><pre class=\\"shiki nord\\" style=\\"background-color: #2e3440ff\\" tabindex=\\"0\\"><code><span class=\\"line\\"><span style=\\"color: #D8DEE9\\">console</span><span style=\\"color: #ECEFF4\\">.</span><span style=\\"color: #88C0D0\\">log</span><span style=\\"color: #D8DEE9FF\\">(</span><span style=\\"color: #B48EAD\\">2423</span><span style=\\"color: #D8DEE9FF\\">)</span><span style=\\"color: #81A1C1\\">;</span></span>
      <span class=\\"line\\"></span></code></pre></div>"
    `);
  })

})
