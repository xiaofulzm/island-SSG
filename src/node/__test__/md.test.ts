

// MDX编译工具链的测试用例

import { unified } from 'unified';
import remarkParse from 'remark-parse';  // 解析markdown
import remarkRehype from 'remark-rehype'; // 将markdownAST解析为HATMLAST
import rehypeStringify from 'rehype-stringify'; // 将HTMLAST转化为HTMl字符串 输出

import { describe, expect, test } from "vitest";

describe("Markdown compile cases", async () => {
  const processor = unified();
  processor.use(remarkParse).use(remarkRehype).use(rehypeStringify);

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

})
