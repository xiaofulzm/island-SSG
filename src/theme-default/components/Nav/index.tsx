
import { usePageData } from "@runtime"
import { NavItemWithLink } from "shared/types";


import { SwitchAppearance } from "../SwitchAppearance";

import styles from "./index.module.scss";

function MenuItem (item:NavItemWithLink){
    return (
        <div className="text-sm font-medium mx-3 " >
            <a className={styles.link} href={item.link} >{item.text}</a>
        </div>
    )
}

export  function Nav() {

  const { siteData } = usePageData();
  const nav = siteData?.themeConfig?.nav || [];
  return (
    <header relative="~" w="full" >
        <div flex="~" items="center" justify="between"
            className="px-8 h-14 divider-bottom"
        >
            <div>
                <a href="/" className="w-full h-full text-lrem font-semibold flex items-center"
                    hover="opacity-60"
                >
                    Island.js
                </a>
            </div>
            <div  flex="~" >
                <div flex="~" >
                    {
                        nav.map(item=>(
                            <MenuItem {...item}  key={item.text} />
                        ))
                    }
                </div>
                <div flex="~" before='menu-item-before' >
                    <SwitchAppearance></SwitchAppearance>
                </div>
                <div className={styles.socialLinkIcon} before='menu-item-before' ml="2" > 
                    <a>
                        <div className="i-carbon-logo-github w-5 h-5 fill-current" ></div>
                    </a>
                </div>
            </div>
        </div>
    </header>
  )
}
