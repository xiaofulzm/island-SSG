import { CLIENT_ENTRN_PATH } from './constants/index';
// babel 插件
// 转换前
// <Aside __island />
// 转换后
//<Aside __island="../comp/id.ts!!ISLAND!!/User/import.ts" />

import { declare } from '@babel/helper-plugin-utils';
import type {Visitor } from '@babel/traverse';
import type { PluginPass } from '@babel/core';
import { types as t } from '@babel/core';
import { normalizePath } from 'vite';


import { MASK_SPLITTER } from './constants';

export default declare(api=>{
    api.assertVersion(7);

    const visitor: Visitor<PluginPass> ={
        // <A __island>
        // <A.B __island>
        JSXOpeningElement(path,state){
            const pathName = path.node.name;
            let bindingName = '';
            if(pathName.type === 'JSXIdentifier') {
                bindingName = pathName.name;
            }else if(pathName.type === 'JSXMemberExpression' ){
                let object = pathName.object;
                // A.B.C
                while (t.isJSXMemberExpression(object)){
                    object = object.object;
                }
                bindingName  = object.name;
            } else {
                return ;
            }

            const binding = path.scope.getBinding(bindingName);
            if(binding?.path.parent.type === 'ImportDeclaration' ){
                const source = binding.path.parent.source;
                const attributes = (path.container as t.JSXElement).openingElement.attributes;

                for (let i = 0; i < attributes.length; i++ ){
                    const name = (attributes[i] as t.JSXAttribute ).name;
                    if(name?.name === '__island') {
                        (attributes[i] as t.JSXAttribute ).value = t.stringLiteral(
                            `${source.value}${MASK_SPLITTER}${normalizePath(state.filename || '')}`
                        ); 
                    }
                }
            }
            
        }
    }

    return {
        name:'transform-jsx-island',
        visitor
    }
})