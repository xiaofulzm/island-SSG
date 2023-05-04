

// MDX编译工具链的测试用例

import { unified } from 'unified';
import remarkParse from 'remark-parse';  // 解析markdown
import remarkRehype from 'remark-rehype'; // 将markdownAST解析为HATMLAST
import rehypeStringify from 'rehype-stringify'; // 将HTMLAST转化为HTMl字符串 输出
import { rehypePluginPreWrapper } from '../plugin-mdx/rehypePlugins/preWrapper';

import { describe, expect, test } from "vitest";

describe("Markdown compile cases", async () => {
  const processor = unified();
  processor.use(remarkParse).use(remarkRehype).use(rehypeStringify).use(rehypePluginPreWrapper);

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
      "<div class=\\"language-js\\"><span class=\\"lang\\">js</span><pre><code class=\\"\\">console.log(2423);
      </code></pre></div>"
    `);
  })

})
