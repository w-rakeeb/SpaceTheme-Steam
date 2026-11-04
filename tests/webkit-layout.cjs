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
        await page.evaluate(()=>{
            document.body.classList.add('v6','responsive_page','game_bg','application');
            for(const cls of ['leftcol','rightcol']) {const node=document.createElement('div');node.className=cls;document.body.append(node);}
            const footer=document.createElement('div');footer.id='footer';document.body.append(footer);
            const glow=document.createElement('div');glow.className='game_background_glow';document.body.append(glow);
            const highlights=document.createElement('div');highlights.id='game_highlights';glow.append(highlights);
            const media=document.createElement('div');media.className='leftcol';media.style.height='120px';highlights.append(media);
            const highlight=document.createElement('div');highlight.className='highlight_ctn';media.append(highlight);
            const details=document.createElement('div');details.className='rightcol';details.style.height='120px';highlights.append(details);
        });
        for(const width of [720,900,1010,1280]) {
            await page.setViewportSize({width,height:800});
            const sizes=await page.evaluate(()=>Object.fromEntries(['.leftcol','.rightcol','#footer'].map(s=>[s,document.querySelector(s).getBoundingClientRect().width])));
            assert.ok(sizes['#footer']<=width-32,'footer fits embedded page');
            if(width<=900) assert.ok(Math.abs(sizes['.leftcol']-sizes['.rightcol'])<1,'narrow Store columns stack at full width');
            else assert.ok(sizes['.leftcol']+sizes['.rightcol']+16<=width-31,'two-column Store fits embedded page');
            if(width<=900) assert.ok(await page.locator('#game_highlights').evaluate(el=>el.lastChild.getBoundingClientRect().top>=el.firstChild.getBoundingClientRect().bottom),'product grid stacks media and details on narrow pages');
        }
        console.log('PASS: current Store navbar width/colors/radius and Community panels/search fields.');
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
