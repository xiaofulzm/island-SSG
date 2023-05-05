
import pluginMdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import rehypePluginAutolinkHeadings from 'rehype-autolink-headings';
import rehypePluginSlug from 'rehype-slug';
import remarkPluginMDXFrontMatter from 'remark-mdx-frontmatter';
import remarkPluginFrontmatter from 'remark-frontmatter';
import { rehypePluginPreWrapper } from './rehypePlugins/preWrapper';
import { rehypePluginShiki } from './rehypePlugins/shiki';
import shiki from "shiki";


export async function pluginMdxRollup() {
  return pluginMdx({
    remarkPlugins: [
      remarkGfm,
      remarkPluginFrontmatter,  //  解析元信息
      [remarkPluginMDXFrontMatter, { name: 'frontmatter' }], //  解析元信息

    ],
    rehypePlugins: [
      rehypePluginSlug,  // 生成锚点, 增加锚点链接
      [rehypePluginAutolinkHeadings, {  // 生成锚点, 增加锚点链接
        properties: {
          class: 'header-anchor',
        },
        content: {
          type: 'text',
          value: '#'
        }
      }],
      rehypePluginPreWrapper,
      [
        rehypePluginShiki,
        {
          highlighter: await shiki.getHighlighter({ theme: 'nord' })
        }
      ]
    ]
  })
}