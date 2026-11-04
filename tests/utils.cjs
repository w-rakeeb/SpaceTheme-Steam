const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
    const browser = await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
    try {
        const page = await browser.newPage();
        const source = fs.readFileSync(path.resolve(__dirname,'../src/js/utils.js'),'utf8');
        const result = await page.evaluate(async source => {
            const OriginalObserver = MutationObserver;
            let count = 0;
            window.MutationObserver = class extends OriginalObserver {constructor(cb) {super(cb);count++;}};
            const helper = new Function(source.replace(/export const /g,'const ')+'; return waitForElement;')();
            const ready = document.createElement('div'); ready.id = 'ready'; document.body.append(ready);
            const immediate = await helper('#ready');
            const immediateObservers = count;
            const detached = document.createElement('div');
            const waiting = helper('.delayed', detached);
            const delayed = document.createElement('div'); delayed.className = 'delayed'; detached.append(delayed);
            const resolved = await Promise.race([waiting, new Promise(resolve => setTimeout(()=>resolve(null),200))]);
            return {immediate:immediate === ready,immediateObservers,scoped:resolved === delayed};
        },source);
        assert.deepEqual(result,{immediate:true,immediateObservers:0,scoped:true});
        const main = fs.readFileSync(path.resolve(__dirname,'../src/js/libraryroot.custom.js'),'utf8');
        const hover = main.match(/function wrapSidebarCollections\([\s\S]*?\n}\s*setupGamesHovers\(\);/)[0];
        await page.evaluate(({source,hover}) => {
            const container=document.createElement('div'); container.className='_1ijTaXJJA5YWl_fW2IxcaT';
            const grid=document.createElement('div'); grid.className='ReactVirtualized__Grid__innerScrollContainer';
            const row=document.createElement('div'); row.className='_2-O4ZG0KrnSrzISHBKctFQ';
            const text=document.createElement('span'); text.id='recycled-game'; text.textContent='First game';
            row.append(text);grid.append(row);container.append(grid);document.body.append(container);
            new Function(source.replace(/export const /g,'const ')+'\n'+hover)();
        },{source,hover});
        await page.waitForFunction(()=>document.querySelector('#recycled-game').dataset.stHoverText==='First game');
        await page.locator('#recycled-game').evaluate(el=>{el.textContent='Second game';});
        await page.waitForFunction(()=>document.querySelector('#recycled-game').dataset.stHoverText==='Second game',{},{timeout:1500});
        console.log('PASS: observer lifecycle, parent-scoped waiting, and recycled Library row labels.');
    } finally {await browser.close();}
})().catch(error => {console.error(error);process.exit(1);});
