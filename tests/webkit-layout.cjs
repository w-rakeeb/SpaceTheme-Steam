const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
function loadCSS(file, seen = new Set()) {
    file = path.resolve(file);
    if (seen.has(file)) return '';
    seen.add(file);
    return fs.readFileSync(file,'utf8').replace(/@import\s+url\(["']([^"']+)["']\);/g,
        (_,ref) => loadCSS(path.resolve(path.dirname(file),ref),seen));
}
(async () => {
    const browser = await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
    try {
        const page = await browser.newPage({viewport:{width:1400,height:900}});
        await page.evaluate(() => {
            const add=(parent, cls) => {const node=document.createElement('div');node.className=cls;parent.append(node);return node;};
            const store=add(document.body,'_-6WU-qJBwUo-');
            add(store,'XLbP8xOkCYw-');
            const community=add(document.body,'community_home_header');
            const panel=add(community,'community_home_search_ctn');
            const box=add(panel,'community_home_search_box');
            const content=add(box,'community_home_search_content');
            const input=document.createElement('input');input.type='text';input.className='community_home_search_app_input';content.append(input);
        });
        await page.addStyleTag({content:loadCSS(path.join(root,'src/css/root.css'))+'\n'+loadCSS(path.join(root,'src/css/webkit.css'))+'\n:root{--st-border-radius:8px;--st-store-max-width:1200px}'});
        const state=await page.evaluate(() => {
            const style=selector=>getComputedStyle(document.querySelector(selector));
            const nav=style('.XLbP8xOkCYw-');
            return {navBackground:nav.backgroundColor,navRadius:nav.borderRadius,navWidth:document.querySelector('.XLbP8xOkCYw-').getBoundingClientRect().width,
                communityPanel:style('.community_home_search_ctn').backgroundColor,communitySearch:style('.community_home_search_box').backgroundColor,
                inputText:style('input').color,inputBackground:style('input').backgroundColor};
        });
        assert.deepEqual(state,{navBackground:'rgb(30, 30, 30)',navRadius:'8px',navWidth:1200,
            communityPanel:'rgb(30, 30, 30)',communitySearch:'rgb(17, 17, 17)',inputText:'rgb(220, 222, 223)',inputBackground:'rgb(17, 17, 17)'});
        console.log('PASS: current Store navbar width/colors/radius and Community panels/search fields.');
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
