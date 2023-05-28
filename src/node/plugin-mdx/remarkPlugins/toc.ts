
// toc插件

import { Plugin } from "unified";
import { Root } from "mdast";
import { visit } from "unist-util-visit";
import Slugger from 'github-slugger';
import { parse } from 'acorn';
import type { Program } from 'mdast-util-mdxjs-esm';



interface TocItem {
  id: string;
  text: string;
  depth: number
}

interface ChildNode {
  type: 'link' | 'text' | 'inlineCode';
  value?: string;
  children?: ChildNode[];
}

export const remarkPluginToc: Plugin<[], Root> = () => {
  return (tree) => {
    const toc: TocItem[] = [];
    
    // 
    const slugger = new Slugger();

    visit(tree, 'heading', (node) => {
      if (!node.depth || !node.children?.length) {
        return
      }

      // h2 ~ h4
      if (node.depth > 1 && node.depth < 5) {
        const originalText = (node.children as ChildNode)
          .map(child => {
            switch (child.type) {
              case 'link':
                return child.children?.map(c => c.value).join('');
              default:
                return child.value;
            }

          }).join('');
        const id = slugger.slug(originalText);
        toc.push({
          id,
          text: originalText,
          depth: node.depth
        });
      }
    })

    // export  const toc= [];
    const insertedCode = `export const toc = ${JSON.stringify(toc,)}`;
    tree.children.push({
      type: 'mdxjsEsm',
      value: insertedCode,
      data: {
        estree: parse(insertedCode, {
          ecmaVersion: 2020,
          sourceType: 'module'
        }) as unknown as Program
      }
    })


  }
}