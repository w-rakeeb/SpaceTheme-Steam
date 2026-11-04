const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..') + '/';
(async () => {
 const browser = await chromium.launch({headless:true, channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
 const page = await browser.newPage();
 await page.evaluate(() => {
  const add = (parent, cls, text) => {
   const el = document.createElement('div'); el.className = cls;
   if (text) el.textContent = text;
   parent.append(el); return el;
  };
  document.body.style.margin = '0';
  document.body.className = 'QsvsRVwbsApgKt1MhM0fz';
  const frame = add(document.body, '_3Z7VQ1IMk4E3HsHvrkLNgo');
  const header = add(frame, '_39oUCO1OuizVPwcnnv88no');
  add(header, '_1Ky59qmywxOUtNcI1cgmkX', 'SpaceTheme');
  const nav = add(header, '_3Z3ohQ8-1NKnCZkbS6fvy');
  add(nav, '_2D64jIEK7wpUR_NlObDW76', 'STORE   LIBRARY   COMMUNITY   PROFILE');
  const panel = add(header, '_3cykd-VfN_xBxf3Qxriccm');
  panel.style.width = '256px';
  const account = add(panel, '_2Lu3d-5qLmW4i19ysTt2jT');
  const profile = add(account, '_3yD46y5pd3zOGR7CzKs0mC online', 'Profile name');
  const avatar = add(profile, 'avatarHolder');
  const innerAvatar=add(avatar,'avatar');
  const img = document.createElement('img'); innerAvatar.append(img);
  const buttons = add(panel, 'userpanel-buttoncontainer');
  for(let i=0;i<7;i++) {
   const wrapper=add(buttons, 'tool-tip-source');
   const classes=['_5wILZhsLODVwGfcJ0hKmJ','_3mGEzzp18imtSzGPkduedi','_1TdaAqMFadi0UTqilrkelR'];
   add(wrapper, '_2Szzh5sKyGgnLUR870zbDE '+(classes[i]??''), String(i+1));
  }
  const body=add(frame, 'RGNMWtyj73_-WdhflrmuY');
  const library=add(body, '_3x1HklzyDs4TEjACrRO2tB');
  add(library, '_1ijTaXJJA5YWl_fW2IxcaT');
  add(frame, '_1_yS5UP7el0aN4vntx3dx');
 });
 await page.addStyleTag({content: ':root {--st-border-radius:8px;--st-color-2:30,30,30;--st-color-3:20,20,20} body {font:13px Arial;color:white;background:#0a0a0a} ._39oUCO1OuizVPwcnnv88no, ._3cykd-VfN_xBxf3Qxriccm, ._3yD46y5pd3zOGR7CzKs0mC {display:flex;align-items:center} ._2D64jIEK7wpUR_NlObDW76 {display:flex;width:470px} ._3cykd-VfN_xBxf3Qxriccm {display:flex}'});
 for (const f of ['src/css/steam/titlebar.css','src/css/steam/sidebar.css','options/general/sidebarOnRight.css','options/general/showSidebarOnHover.css','options/general/userpanel/topRight.css'])
  await page.addStyleTag({content:fs.readFileSync(root+f,'utf8')});
 await page.evaluate(({source,movement})=>{
  window.reloadCalls=0;
  window.storageURLs=[];
  window.SteamClient={Browser:{RestartJSContext(){window.reloadCalls++}},URL:{ExecuteSteamURL(url){window.storageURLs.push(url)}}};
  const setup=new Function(movement.replace('export function','function')+'\n'+source.replace(/import .*?;\s*/,'').replace('export function setupHeaderControls','function setupHeaderControls')+';return setupHeaderControls;')();
  setup(document.querySelector('._3cykd-VfN_xBxf3Qxriccm'),document.querySelector('.userpanel-buttoncontainer'));
 },{source:fs.readFileSync(root+'src/js/headerControls.js','utf8'),movement:fs.readFileSync(root+'src/js/moveControl.js','utf8')});
 await page.addStyleTag({content:'* {transition: none !important;}'});
 const results=[];
 for(const width of [1010,1188,1280,1400,1441,1560,1682,1920,2560]) {
  await page.setViewportSize({width,height:1035});
  const r=await page.evaluate(() => {
   const q=s=>document.querySelector(s), box=s=>q(s).getBoundingClientRect().toJSON();
   const panel=q('._3cykd-VfN_xBxf3Qxriccm');
   return {width:innerWidth,panel:box('._3cykd-VfN_xBxf3Qxriccm'),nav:box('._3Z3ohQ8-1NKnCZkbS6fvy'),opacity:getComputedStyle(panel).opacity,visibility:getComputedStyle(panel).visibility,margin:getComputedStyle(q('._1ijTaXJJA5YWl_fW2IxcaT')).marginBottom,bottom:getComputedStyle(q('._1_yS5UP7el0aN4vntx3dx')).bottom,buttons:[...q('.userpanel-buttoncontainer').children].map(x=>x.getBoundingClientRect().toJSON())};
  });
  assert.equal(r.panel.y,7); assert.equal(r.panel.right,width-152);
  assert.equal(r.opacity,'1'); assert.equal(r.visibility,'visible');
  assert.equal(await page.locator('._3cykd-VfN_xBxf3Qxriccm').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
  assert.equal(await page.locator('._3yD46y5pd3zOGR7CzKs0mC').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(103, 112, 123, 0.2)');
  assert.equal(r.margin,'16px'); assert.equal(r.bottom,'16px');
  const overlap = r.nav.x < r.panel.right && r.nav.right > r.panel.x && r.nav.y < r.panel.bottom && r.nav.bottom > r.panel.y;
  assert.equal(overlap,false,`navigation overlap at ${width}`);
  assert.equal(await page.locator('.st-header-more').isVisible(),true);
  assert.equal(await page.locator('#st-header-utilities').isVisible(),false);
  assert.ok(Math.abs(r.nav.x+r.nav.width/2-width/2)<1);
  results.push({width,panelWidth:r.panel.width,navigationRow:width<=1560?'second':'first',passed:true});
 }
 await page.setViewportSize({width:1280,height:1035});
 await page.locator('.st-header-reload').click();
 assert.equal(await page.evaluate(()=>window.reloadCalls),1);
 const toggle=page.locator('.st-header-more');
 const menu=page.locator('#st-header-utilities');
 assert.equal(await page.locator('.st-header-pinned > div').count(),3);
 assert.equal(await page.locator('.st-header-pinned').isVisible(),true);
 assert.equal(await menu.isVisible(),false);
 assert.equal(await page.locator('.avatarHolder .avatar').evaluate(e=>getComputedStyle(e).height),'26px');
 assert.equal(await page.locator('._3yD46y5pd3zOGR7CzKs0mC').evaluate(e=>getComputedStyle(e).fontSize),'14px');
 assert.equal(await page.locator('._3yD46y5pd3zOGR7CzKs0mC').evaluate(e=>getComputedStyle(e).overflow),'visible');
 await toggle.focus();await toggle.press('Enter');
 assert.equal(await toggle.getAttribute('aria-expanded'),'true');
 assert.equal(await menu.isVisible(),true);
 const menuBox=await menu.boundingBox(), toggleBox=await toggle.boundingBox();
 assert.ok(Math.abs(menuBox.x+menuBox.width-toggleBox.x-toggleBox.width)<1,'dropdown opens left of arrow');
 await page.evaluate(()=>{
  window.utilityClicks=0;
  document.querySelector('#st-header-utilities ._2Szzh5sKyGgnLUR870zbDE').addEventListener('click',()=>window.utilityClicks++);
 });
 await menu.locator('._2Szzh5sKyGgnLUR870zbDE').first().click();
 assert.equal(await page.evaluate(()=>window.utilityClicks),1,'non-focusable Steam utility must receive its click');
 await toggle.focus();
 await toggle.press('Escape');
 assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 await toggle.click();await page.mouse.click(10,150);
 assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 await toggle.click();await page.locator('.st-header-storage').click();
 assert.deepEqual(await page.evaluate(()=>window.storageURLs),['steam://open/settings/storage']);
 assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 await toggle.click();
 await page.setViewportSize({width:1920,height:1035});
 await page.waitForFunction(()=>document.querySelector('.st-header-more').getAttribute('aria-expanded')==='false');
 assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 assert.equal(await menu.isVisible(),false);
 await toggle.click();
 assert.equal(await menu.isVisible(),true,'maximized dropdown remains usable');
 await toggle.click();
 // Wallet text gets its own readable line while the larger account name stays clear.
 await page.locator('._3yD46y5pd3zOGR7CzKs0mC').evaluate(profile=>{
  profile.firstChild.textContent='Wrakeeb';
  const wallet=document.createElement('span');wallet.className='_2jphjrSifC6orDT4g_7Wd';wallet.textContent='$1,234.56';profile.append(wallet);
 });
 const walletState=await page.locator('._3yD46y5pd3zOGR7CzKs0mC').evaluate(profile=>{
  const range=document.createRange();range.selectNode(profile.firstChild);
  const name=range.getBoundingClientRect(),wallet=profile.querySelector('._2jphjrSifC6orDT4g_7Wd');
  return {nameBottom:name.bottom,walletTop:wallet.getBoundingClientRect().top,walletFont:getComputedStyle(wallet).fontSize};
 });
 assert.ok(walletState.walletTop>=walletState.nameBottom-1,'wallet must not overlap the account name');
 assert.equal(walletState.walletFont,'11px');
 await page.addStyleTag({content:fs.readFileSync(root+'options/general/walletBalance.css','utf8')});
 assert.equal(await page.locator('._2jphjrSifC6orDT4g_7Wd').isVisible(),false,'official hide-wallet option still works');
 // The profile must remain visible when a hover-only store sidebar is collapsed.
 await page.evaluate(()=>document.querySelector('.RGNMWtyj73_-WdhflrmuY').style.display='none');
 assert.equal(await page.locator('._3cykd-VfN_xBxf3Qxriccm').evaluate(e=>getComputedStyle(e).opacity),'1');
 // Test alerts and the optional permanently visible download bar together.
 await page.evaluate(()=>{const a=document.createElement('div');a.className='_3E5iVG630BkOHTaJJaMEMw';a.textContent='Account warning';document.querySelector('._3cykd-VfN_xBxf3Qxriccm').prepend(a)});
 await page.addStyleTag({content:fs.readFileSync(root+'options/general/alwaysShowDownloadbar.css','utf8')});
 assert.equal(await page.locator('._1ijTaXJJA5YWl_fW2IxcaT').evaluate(e=>getComputedStyle(e).marginBottom),'71px');
 // Turning the option off must restore the upstream sidebar space and width.
 await page.evaluate(()=>{
  for(const style of document.querySelectorAll('style'))
   if(style.textContent.includes('--st-userpanel-space: 0px')) style.remove();
 });
 assert.equal(await page.locator('._1ijTaXJJA5YWl_fW2IxcaT').evaluate(e=>getComputedStyle(e).marginBottom),'211px');
 assert.equal(await page.locator('._3cykd-VfN_xBxf3Qxriccm').evaluate(e=>getComputedStyle(e).width),'256px');
 console.log(JSON.stringify(results));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
