
// unocss
import  { VitePluginConfig } from 'unocss/vite';
import { presetAttributify, presetIcons, presetWind }  from 'unocss';

const options:VitePluginConfig = {
    presets:[presetAttributify(),presetIcons(), presetWind()],
    rules:[
        // [   
        //     'border-bottom',
        //     {
        //         'border-bottom':'1px solid var(--island-c-divider-light)'
        //     }
        // ],
        [
            /^divider-(\w+)$/,
            ([,w])=>({
                [`border-${w}`]:'1px solid var(--island-c-divider-light)'
            })
        ],
        [
            'menu-item-before',
            {
                "margin-right": "12px",
                "margin-left": "12px",
                width: "1px",
                height: "24px",
                "background-color": "var(--island-c-divider-light)",
                content: '" "',
            }
        ]
    ]
}

export default options;