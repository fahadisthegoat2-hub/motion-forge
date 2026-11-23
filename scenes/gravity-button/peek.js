// peek.js scene.html outdir t1 t2 ... — internal low-res frames for my own checks
const R='/home/user/motion-forge';const {launchBrowser,startStaticServer,routeAssets}=require(R+'/scripts/lib/deps');const path=require('path'),fs=require('fs');
(async()=>{const [html,out,...ts]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
 const b=await launchBrowser(),page=await b.newPage();page.setDefaultTimeout(0);page.on('pageerror',e=>console.error('pageerror',e.message));await routeAssets(page);const s=await startStaticServer();
 await page.goto(s.origin+path.resolve(html)+'?fast=1');await page.waitForFunction(()=>window.__mf&&window.__mf.render&&window.__mfReady!==false,null,{timeout:600000,polling:500});
 await page.setViewportSize({width:360,height:640});await page.evaluate(()=>{document.getElementById('mf-panel')?.remove();window.dispatchEvent(new Event('resize'));window.__mf.setSize?.(360,640);window.__mfManual=true;});
 for(const t of ts){await page.evaluate(t=>__mf.render(t),+t);await page.screenshot({path:`${out}/t${(+t).toFixed(2)}.png`});}
 await b.close();s.close();console.log('ok');})();
