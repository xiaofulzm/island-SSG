
// 处理大纲栏交互逻辑

import { throttle } from "lodash-es";

let links: HTMLAnchorElement[] = [];
const NAV_HEIGHT = 56;


export function scrollToTarget(target:HTMLElement,isSmooth:boolean){
     const targetPadding = parseInt(window.getComputedStyle(target).paddingTop,10);
     const targetTop = window.scrollY + target.getBoundingClientRect().top - targetPadding - NAV_HEIGHT;
        window.scrollTo({
            left:0,
            top:targetTop,
            behavior:isSmooth?'smooth':'auto'
        })
    }

export function bindingAsideScroll(){
    const marker = document.getElementById('aside-marker'); // 当前选中
    const aside = document.getElementById('aside-container'); // 大纲栏内容元素
    const headers = Array.from(aside?.getElementsByTagName('a') || []).  // 获取所有的a标签
    map(item => decodeURIComponent(item.hash));

    if(!aside){
        return ;
    }

    //  判断页面位置,设置定位
    const activate = (links:HTMLAnchorElement[],index:number) =>{
        
        if(links[index]){
            const id = links[index].getAttribute('href');
            const tocIndex = headers.findIndex((item)=>item === id);
            const currentIdnex = aside?.querySelector(`a[href="#${id.slice(1)}"]`);
            if(currentIdnex){
                marker.style.top = `${33 + tocIndex *28 }px`;
                marker.style.opacity = '1';
            }
        }
    }

    // 设置锚点定位
    const setActiveLink = ()=>{
        
        links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.island-doc .header-anchor'))
                .filter(item=>item.parentElement?.tagName !== 'H1' ); // 获取所有锚点
        const isBotom = document.documentElement.scrollTo + window.innerHeight >= 
        document.documentElement.scrollHeight; // 检测页面是否滑到底部
        
        if(isBotom){
            activate(links,links.length-1);
            return;
        }

        // 2. 遍历 links，寻找对应锚点
        for(let i=0; i<links.length;i++){
            
            const currentAnchor = links[i]; // 当前锚点
            const nextAnchor = links[i+1];  // 下一个锚点
            const scrollTop = Math.ceil(window.scrollY) ; // 当前页面已经滑动的距离
            const currentAnchorTop = currentAnchor.parentElement.offsetTop - NAV_HEIGHT; // 当前锚点距离页面顶部的距离

            if(!nextAnchor){
                activate(links,i);
                break;
            }
            if(i===0 && scrollTop < currentAnchorTop || scrollTop ===0 ){
                activate(links,0);
                break;
            }
            const nextAnchorTop = nextAnchor.parentElement.offsetTop - NAV_HEIGHT;
            if(scrollTop >= currentAnchorTop && scrollTop < nextAnchorTop ){
                activate(links,i);
                break;
            }
        }
    }

    const throttleSetActiveLink = throttle(setActiveLink,100)

    window.addEventListener('scroll',throttleSetActiveLink);

    // 回调事件, 解绑
    return ()=>{
        window.removeEventListener('scroll',throttleSetActiveLink);
    }
}