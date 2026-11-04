const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
function css(file, seen = new Set()) {
    file = path.resolve(root, file);
    if (seen.has(file)) return '';
    seen.add(file);
    return fs.readFileSync(file, 'utf8').replace(/@import\s+url\(["']([^"']+)["']\);/g,
        (_, ref) => css(path.resolve(path.dirname(file), ref), seen));
}
(async () => {
    const browser = await chromium.launch({headless:true, channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
    try {
        const page = await browser.newPage();
        await page.evaluate(() => {
            const add = (parent, cls, text) => {const el = document.createElement('div');el.className=cls;el.textContent=text || '';parent.append(el);return el;};
            const editor = add(document.body, 'MillenniumDesktopSidebar');
            editor.dataset.focusedItemType='THEME';
            add(editor, 'MillenniumDesktopSidebar_Title', 'SpaceTheme for Steam');
            add(editor, 'MillenniumDesktopSidebar_EditorHeader', 'General');
            const content = add(editor, 'MillenniumDesktopSidebar_EditorContent');
            const row = add(content, 'eKmEXJCm_lgme24Fp_HWt');row.id='setting-row';
            const label = add(row, '_2tALpM7z8naXJ35Pp5fNAG');label.id='setting-label';
            add(label, '_2VcTlXFC64Jtg9gvtT6cmY', 'Always show sidebar');
            add(label, '_1W1to_azoBRG95oNAFpf9Q', 'Show the sidebar on Library, Store and Community pages.');
            const control=add(row, 'PSZtxj2h3MlyYv-c9dgke', 'On');control.id='setting-control';
            const sliderRow=add(content,'eKmEXJCm_lgme24Fp_HWt');
            const sliderLabel=add(sliderRow,'_2tALpM7z8naXJ35Pp5fNAG');
            add(sliderLabel,'_2VcTlXFC64Jtg9gvtT6cmY','Sidebar width');
            const sliderControl=add(sliderRow,'PSZtxj2h3MlyYv-c9dgke');sliderControl.id='slider-control';
            add(sliderControl,'SliderControlPanelGroup','256px');
            for (let i=0;i<30;i++) add(content, 'DialogBody', 'Window Controls / Sidebar width / Userpanel position').style.height='60px';
        });
        await page.addStyleTag({content:css('src/css/root.css') + css('src/css/regular.css') + '\n.MillenniumDesktopSidebar{display:flex;flex-direction:column}'});
        for (const [width,height] of [[1010,640],[1280,720],[1920,1080],[2560,1440]]) {
            await page.setViewportSize({width,height});
            const state = await page.locator('.MillenniumDesktopSidebar').evaluate(el => {
                const style=getComputedStyle(el), box=el.getBoundingClientRect(), content=el.querySelector('.MillenniumDesktopSidebar_EditorContent');
                return {x:box.x,y:box.y,right:box.right,bottom:box.bottom,transform:style.transform,filter:style.filter,
                    scrollable:content.scrollHeight>content.clientHeight,overflow:getComputedStyle(content).overflowY};
            });
            assert.equal(state.transform,'none');assert.equal(state.filter,'none');
            assert.ok(state.x>=16 && state.y>=16 && state.right<=width-16 && state.bottom<=height-16);
            assert.equal(state.scrollable,true);assert.equal(state.overflow,'auto');
            const row=await page.locator('#setting-row').evaluate(el=>{
                const label=el.querySelector('#setting-label').getBoundingClientRect(),control=el.querySelector('#setting-control').getBoundingClientRect();
                return {labelWidth:label.width,labelRight:label.right,controlLeft:control.left,controlWidth:control.width};
            });
            assert.ok(row.labelWidth>400 && row.labelRight<row.controlLeft && row.controlWidth<100,JSON.stringify(row));
            assert.ok(await page.locator('#slider-control').evaluate(el=>el.getBoundingClientRect().width>500),'slider uses the full option width');
        }
        console.log('PASS: settings dialog remains unscaled, bounded and scrollable at four window sizes.');
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
