const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
 try {
  const page=await browser.newPage();
  const result=await page.evaluate(source=>{
   const move=new Function(source.replace('export function','function')+';return moveControl;')();
   const owner=document.createElement('div'),menu=document.createElement('div'),pinned=document.createElement('div');
   document.body.append(owner,menu,pinned);
   const original=document.createElement('button');owner.append(original);
   let clicks=0;original.onclick=()=>clicks++;
   move(original,menu);move(original,pinned);
   original.click();
   const inserted=document.createElement('button');owner.insertBefore(inserted,original);
   const replacement=document.createElement('button');owner.replaceChild(replacement,inserted);
   const forwarded=replacement.parentNode===pinned && pinned.firstChild===replacement;
   owner.removeChild(replacement);owner.removeChild(original);
   const regular=document.createElement('span');owner.append(regular);
   const normal=document.createElement('span');owner.insertBefore(normal,regular);owner.removeChild(regular);
   let rejectsUnknown=false;
   try {owner.insertBefore(document.createElement('div'),document.createElement('div'));} catch {rejectsUnknown=true;}
   return {clicks,forwarded,removed:!pinned.children.length,normal:owner.firstChild===normal,rejectsUnknown};
  },fs.readFileSync(path.resolve(__dirname,'../src/js/moveControl.js'),'utf8'));
  assert.deepEqual(result,{clicks:1,forwarded:true,removed:true,normal:true,rejectsUnknown:true});
  console.log('PASS: native reconciliation inserts/replaces/removes relocated controls, preserves handlers and rejects unrelated invalid operations.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
