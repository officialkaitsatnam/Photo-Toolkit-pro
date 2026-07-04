/* Smart Photo Toolkit Pro v42.5 - Document Studio UX Redesign */
'use strict';

const VERSION = 'v42.5-Document-Studio-UX-Redesign';
const DOCS = [
  {id:'aadhaar', title:'Aadhaar Card', img:'aadhaar.jpg', desc:'Official PDF crop + 85.6 × 54 mm printable'},
  {id:'pan', title:'PAN Card', img:'pan.jpg', desc:'PAN printable crop and A4 output'},
  {id:'voter', title:'Voter ID', img:'voter.jpg', desc:'Front/back and PDF crop printable'},
  {id:'dl', title:'Driving Licence', img:'dl.jpg', desc:'DL crop, rotate and print'},
  {id:'abha', title:'ABHA Card', img:'abha.jpg', desc:'ABHA card printable layout'},
  {id:'ayushman', title:'Ayushman Card', img:'ayushman.jpg', desc:'Ayushman card A4 print ready'}
];
const MM_TO_PX = 3.7795275591;
const A4 = {w:210, h:297};
const CARD = {w:85.6, h:54};
const LAMINATION = {w:171.2, h:54}; // official Aadhaar front+back fold strip
let app, currentView='dashboard';
let state = null;

window.addEventListener('load', () => {
  if(window.pdfjsLib){ pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; }
  app = document.getElementById('app');
  bindNav();
  showDashboard();
  setTimeout(()=>document.getElementById('loader')?.classList.add('hidden'),450);
});

document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
function bindNav(){ document.querySelectorAll('.nav').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.getElementById('sidebar')?.classList.remove('open'); const v=btn.dataset.view; if(v==='documents') showDocuments(); else if(v==='passport') showPassport(); else showSimple(v); })); }
function setActive(view){ document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active', b.dataset.view===view)); }
function showDashboard(){exitEditorMode();setActive('dashboard'); app.innerHTML=`<section class="hero"><h1>Smart Photo Toolkit Pro ${VERSION}</h1><p>Document Studio Pro: official PDF upload, professional crop, real A4 output, 2.2 mm lamination gap.</p></section><section class="grid">${DOCS.map(cardHtml).join('')}</section>`; bindDocCards();}
function showDocuments(){exitEditorMode();setActive('documents'); app.innerHTML=`<div class="crumb">Dashboard › Document Studio</div><section class="hero"><h1>Document Studio</h1><p>Select document type. Har document me same professional crop + A4 printable engine milega.</p></section><section class="grid">${DOCS.map(cardHtml).join('')}</section>`; bindDocCards();}
function cardHtml(d){return `<article class="doc-card" data-doc="${d.id}"><img src="${d.img}" alt="${d.title}"><h3>${d.title}</h3><p>${d.desc}</p></article>`}
function bindDocCards(){ document.querySelectorAll('.doc-card').forEach(c=>c.addEventListener('click',()=>openEditor(c.dataset.doc))); }
function showSimple(v){exitEditorMode();currentView=v; app.innerHTML=`<section class="hero"><h1>${titleCase(v)}</h1><p>This section is ready. Document Studio Pro is active in this build.</p></section>`;}
function showPassport(){ openEditor('passport'); }
function titleCase(s){return String(s).replace(/([A-Z])/g,' $1').replace(/^./,m=>m.toUpperCase())}


function enterEditorMode(){
  document.body.classList.add('editor-mode');
  document.body.classList.remove('editor-sidebar-open');
  document.getElementById('sidebar')?.classList.remove('open');
}
function exitEditorMode(){
  document.body.classList.remove('editor-mode','editor-sidebar-open');
}
function toggleEditorSidebar(){
  document.body.classList.toggle('editor-sidebar-open');
}

function openEditor(docId){
  enterEditorMode();
  currentView='editor';
  const doc = DOCS.find(d=>d.id===docId) || {id:'passport',title:'Passport Photo',img:'icon-192.png'};
  state = {
    doc, mode:'pdf', pdf:null, page:1, totalPages:1, zoom:1.15, rotation:0,
    frontImg:null, backImg:null, activeImage:'front', topGap:2.2, printLayout:'lamination',
    crop:{x:40,y:40,w:360,h:240}, drag:null, canvas:null, ctx:null, previewCanvas:null
  };
  app.innerHTML = editorHtml(doc);
  bindEditor();
  drawBlankStage();
  updatePreview();
}
function editorHtml(doc){return `
  <div class="editor-shell v425-shell">
    <div class="editor-top no-print">
      <button id="backDocsTop" class="tool-btn">← Documents</button>
      <button id="toggleSide" class="tool-btn">☰ Menu</button>
      <div class="editor-title"><b>${doc.title}</b><small> PDF editor left/center • preview/settings right panel</small></div>
      <span class="editor-status">v42.5 workspace layout</span>
    </div>
    <div class="editor-layout v425-layout">
      <section class="panel main-editor-panel">
        <div class="editor-work-head no-print">
          <div><h2>${doc.title} Editor</h2><small>Yahin PDF ko zoom, crop, rotate aur fit-width se edit karo.</small></div>
          <div class="quick-actions"><button class="primary" id="downloadPdf">⇩ Download</button><button class="success" id="printBtn">🖨 Print</button></div>
        </div>
        <div class="toolbar no-print editor-toolbar">
          <select id="pageSelect"><option value="1">Page 1</option></select>
          <button id="zoomOut">−</button><b id="zoomLabel">115%</b><button id="zoomIn">+</button>
          <button id="fitBtn">⛶ Fit Width</button><button id="rotL">↶ Rotate Left</button><button id="rotR">↷ Rotate Right</button><button id="resetCrop">Reset Crop</button><button id="autoCrop">Auto Crop</button>
        </div>
        <div class="stage-wrap" id="stageWrap"><div class="stage" id="stage"><canvas id="sourceCanvas"></canvas><div class="crop-box" id="cropBox"><span class="handle h-nw" data-h="nw"></span><span class="handle h-n" data-h="n"></span><span class="handle h-ne" data-h="ne"></span><span class="handle h-e" data-h="e"></span><span class="handle h-se" data-h="se"></span><span class="handle h-s" data-h="s"></span><span class="handle h-sw" data-h="sw"></span><span class="handle h-w" data-h="w"></span><div class="move-label">✥<br>DRAG<br>MOVE</div></div></div></div>
        <div class="tip compact-tip">Tip: PDF ko bada karke crop karo. Side “|” handles se width/height aur corner handles se dono direction adjust honge.</div>
      </section>
      <aside class="settings right-control-panel">
        <div class="panel upload-control"><h3>Upload Source</h3><div class="upload-row side-upload-row"><div class="upload-box"><label>Official Full PDF Upload</label><input type="file" id="pdfFile" accept="application/pdf"><small>PDF mode me selected area single printable output banega.</small></div><div class="upload-box"><label>Front / Back Image Upload</label><input type="file" id="frontFile" accept="image/*"><input type="file" id="backFile" accept="image/*" style="margin-top:8px"><small>Front+Back layout sirf image mode me.</small></div></div></div>
        <div class="panel preview-card sticky-preview"><h3>Live A4 Preview</h3><div class="a4-preview"><canvas id="previewCanvas" width="794" height="1123"></canvas></div><div class="preview-actions no-print"><button class="primary" id="downloadPdfSide">⇩ Download PDF</button><button class="success" id="printBtnSide">🖨 Print</button></div><div class="info-list"><b style="color:#e33">Red dotted:</b> Top gap 2.2 mm<br><b style="color:#1769ff">Blue area:</b> selected crop<br><b>PDF:</b> selected crop A4 output</div></div>
        <div class="panel"><h3>Print & Crop Settings</h3><label>Top Margin / Center Gap (mm)</label><input id="topGap" type="number" step="0.1" value="2.2"><label>Output Size</label><select id="outputSize"><option>A4 (210 × 297 mm)</option></select><label>Print Layout</label><select id="printLayout"><option value="lamination">Aadhaar Lamination Strip 171.2 × 54 mm</option><option value="single">Single Card 85.6 × 54 mm</option><option value="fit">Fit Selected Area to A4 Width</option></select><label>Mode</label><select id="modeSelect"><option value="pdf">Official PDF Single Area</option><option value="images">Front + Back Images</option></select><label>Crop Position</label><div class="nudge"><span></span><button data-move="up">↑</button><span></span><button data-move="left">←</button><button data-move="center">●</button><button data-move="right">→</button><span></span><button data-move="down">↓</button><span></span></div><div class="info-list" id="cropInfo"></div></div>
        <div class="panel"><h3>Lamination Guide</h3><div class="lamination"><span>▭</span>→<span>🪪</span>→<span>▭</span></div><p class="info-list">Print → Fold → Laminate. Top center me 2.2 mm gap fixed rahega.</p><button id="backDocs" class="tool-btn">← Back to Documents</button></div>
      </aside>
    </div>
  </div>`}

function bindEditor(){
  state.canvas = document.getElementById('sourceCanvas'); state.ctx=state.canvas.getContext('2d'); state.previewCanvas=document.getElementById('previewCanvas');
  document.getElementById('pdfFile').addEventListener('change', loadPdfFile);
  document.getElementById('frontFile').addEventListener('change', e=>loadImageFile(e,'front'));
  document.getElementById('backFile').addEventListener('change', e=>loadImageFile(e,'back'));
  document.getElementById('pageSelect').addEventListener('change',e=>{state.page=+e.target.value; renderPdfPage();});
  document.getElementById('zoomIn').onclick=()=>{state.zoom=Math.min(8,state.zoom+.25); renderCurrent();};
  document.getElementById('zoomOut').onclick=()=>{state.zoom=Math.max(.25,state.zoom-.25); renderCurrent();};
  document.getElementById('fitBtn').onclick=fitWidth;
  document.getElementById('rotL').onclick=()=>{state.rotation=(state.rotation+270)%360; renderCurrent();};
  document.getElementById('rotR').onclick=()=>{state.rotation=(state.rotation+90)%360; renderCurrent();};
  document.getElementById('resetCrop').onclick=resetCrop;
  document.getElementById('autoCrop').onclick=autoCrop;
  document.getElementById('downloadPdf').onclick=downloadPdf;
  document.getElementById('printBtn').onclick=printOutput;
  document.getElementById('downloadPdfSide').onclick=downloadPdf;
  document.getElementById('printBtnSide').onclick=printOutput;
  document.getElementById('backDocs').onclick=showDocuments;
  document.getElementById('backDocsTop').onclick=showDocuments;
  document.getElementById('toggleSide').onclick=toggleEditorSidebar;
  document.getElementById('topGap').addEventListener('input',e=>{state.topGap=parseFloat(e.target.value)||2.2; updatePreview();});
  document.getElementById('modeSelect').addEventListener('change',e=>{state.mode=e.target.value; renderCurrent();});
  document.getElementById('printLayout').addEventListener('change',e=>{state.printLayout=e.target.value; updatePreview();});
  document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>nudge(b.dataset.move));
  setupCropEvents();
}
async function loadPdfFile(e){ const file=e.target.files[0]; if(!file)return; state.mode='pdf'; document.getElementById('modeSelect').value='pdf'; const buf=await file.arrayBuffer(); state.pdf=await pdfjsLib.getDocument({data:buf}).promise; state.totalPages=state.pdf.numPages; const sel=document.getElementById('pageSelect'); sel.innerHTML=Array.from({length:state.totalPages},(_,i)=>`<option value="${i+1}">Page ${i+1} / ${state.totalPages}</option>`).join(''); state.page=1; await renderPdfPage(true); }
function loadImageFile(e,slot){ const file=e.target.files[0]; if(!file)return; const img=new Image(); img.onload=()=>{ if(slot==='front'){state.frontImg=img;state.activeImage='front'} else {state.backImg=img;state.activeImage='back'} state.mode='images'; document.getElementById('modeSelect').value='images'; renderImage(img,true);}; img.src=URL.createObjectURL(file); }
function renderCurrent(){ if(state.mode==='pdf' && state.pdf) renderPdfPage(); else if(state.mode==='images' && (state.frontImg||state.backImg)) renderImage(state.frontImg||state.backImg); else drawBlankStage(); }
async function renderPdfPage(reset=false){ if(!state.pdf){drawBlankStage();return;} const page=await state.pdf.getPage(state.page); const viewport=page.getViewport({scale:state.zoom, rotation:state.rotation}); state.canvas.width=Math.round(viewport.width); state.canvas.height=Math.round(viewport.height); await page.render({canvasContext:state.ctx, viewport}).promise; syncStageSize(); if(reset) resetCrop(); else applyCrop(); updateZoomLabel(); updatePreview(); }
function renderImage(img, reset=false){ const maxW=900; const sc=state.zoom*Math.min(1,maxW/img.width); state.canvas.width=Math.round(img.width*sc); state.canvas.height=Math.round(img.height*sc); state.ctx.fillStyle='#fff';state.ctx.fillRect(0,0,state.canvas.width,state.canvas.height); if(state.rotation){ state.ctx.save(); state.ctx.translate(state.canvas.width/2,state.canvas.height/2); state.ctx.rotate(state.rotation*Math.PI/180); state.ctx.drawImage(img,-state.canvas.width/2,-state.canvas.height/2,state.canvas.width,state.canvas.height); state.ctx.restore(); } else state.ctx.drawImage(img,0,0,state.canvas.width,state.canvas.height); syncStageSize(); if(reset) resetCrop(); else applyCrop(); updateZoomLabel(); updatePreview(); }
function drawBlankStage(){ state.canvas.width=980; state.canvas.height=680; state.ctx.fillStyle='#fff'; state.ctx.fillRect(0,0,980,680); state.ctx.fillStyle='#eaf1fb'; state.ctx.fillRect(80,80,820,500); state.ctx.fillStyle='#53647d'; state.ctx.font='bold 24px Arial'; state.ctx.textAlign='center'; state.ctx.fillText('Upload official PDF or front/back image',490,330); syncStageSize(); resetCrop(); }
function syncStageSize(){ const st=document.getElementById('stage'); st.style.width=state.canvas.width+'px'; st.style.height=state.canvas.height+'px'; }
function updateZoomLabel(){ document.getElementById('zoomLabel').textContent=Math.round(state.zoom*100)+'%'; }
function resetCrop(){ const w=state.canvas.width,h=state.canvas.height; state.crop={x:Math.round(w*.08),y:Math.round(h*.08),w:Math.round(w*.84),h:Math.round(h*.55)}; applyCrop(); updatePreview(); }
function autoCrop(){ const w=state.canvas.width,h=state.canvas.height; state.crop={x:Math.round(w*.1),y:Math.round(h*.18),w:Math.round(w*.8),h:Math.round(h*.48)}; applyCrop(); updatePreview(); }
function fitWidth(){ const wrap=document.getElementById('stageWrap'); const target=Math.max(520, wrap.clientWidth-24); const natural=state.canvas.width/state.zoom; if(natural>0){state.zoom=target/natural; renderCurrent();} }
function applyCrop(){ const c=clampCrop(state.crop); state.crop=c; const box=document.getElementById('cropBox'); box.style.left=c.x+'px';box.style.top=c.y+'px';box.style.width=c.w+'px';box.style.height=c.h+'px'; updateInfo(); }
function clampCrop(c){ const min=36,W=state.canvas.width,H=state.canvas.height; c.x=Math.max(0,Math.min(c.x,W-min)); c.y=Math.max(0,Math.min(c.y,H-min)); c.w=Math.max(min,Math.min(c.w,W-c.x)); c.h=Math.max(min,Math.min(c.h,H-c.y)); return c; }
function setupCropEvents(){ const box=document.getElementById('cropBox'); box.addEventListener('pointerdown', startDrag); box.querySelectorAll('.handle').forEach(h=>h.addEventListener('pointerdown', startDrag)); window.addEventListener('pointermove', moveDrag); window.addEventListener('pointerup', endDrag); }
function startDrag(e){ e.preventDefault(); e.stopPropagation(); const h=e.target.dataset.h || 'move'; state.drag={h,startX:e.clientX,startY:e.clientY,c:{...state.crop}}; try{e.target.setPointerCapture(e.pointerId)}catch{} }
function moveDrag(e){ if(!state.drag)return; const d=state.drag, dx=e.clientX-d.startX, dy=e.clientY-d.startY; let c={...d.c}; if(d.h==='move'){c.x+=dx;c.y+=dy} else { if(d.h.includes('w')){c.x+=dx;c.w-=dx} if(d.h.includes('e')){c.w+=dx} if(d.h.includes('n')){c.y+=dy;c.h-=dy} if(d.h.includes('s')){c.h+=dy} } state.crop=clampCrop(c); applyCrop(); updatePreview(); }
function endDrag(){ state.drag=null; }
function nudge(dir){ const step= dir==='center'?0:5; if(dir==='left')state.crop.x-=step; if(dir==='right')state.crop.x+=step; if(dir==='up')state.crop.y-=step; if(dir==='down')state.crop.y+=step; if(dir==='center'){state.crop.x=(state.canvas.width-state.crop.w)/2;state.crop.y=(state.canvas.height-state.crop.h)/2;} applyCrop(); updatePreview(); }
function getCroppedCanvas(){ const c=state.crop; const out=document.createElement('canvas'); out.width=Math.max(1,Math.round(c.w)); out.height=Math.max(1,Math.round(c.h)); out.getContext('2d').drawImage(state.canvas,c.x,c.y,c.w,c.h,0,0,out.width,out.height); return out; }
function updateInfo(){ const c=state.crop; const mmW=(c.w/MM_TO_PX/state.zoom).toFixed(1); const mmH=(c.h/MM_TO_PX/state.zoom).toFixed(1); const el=document.getElementById('cropInfo'); if(el) el.innerHTML=`<br><b>Crop Info</b><br>Width: ${mmW} mm<br>Height: ${mmH} mm<br>Canvas: ${state.canvas.width} × ${state.canvas.height}px<br>Mode: ${state.mode==='pdf'?'Official PDF':'Front/Back Images'}<br>Print Layout: ${state.printLayout}`; }
function getPdfPrintSizeMm(crop){
  // v42.4: mm-based print size. Preview, PDF and print use this same function.
  if(state.printLayout === 'single') return {w:CARD.w, h:CARD.h};
  if(state.printLayout === 'fit'){
    const aspect=Math.max(0.2, crop.width/crop.height);
    const w=190; return {w, h:Math.min(270, w/aspect)};
  }
  return {w:LAMINATION.w, h:LAMINATION.h};
}
function drawImageCover(ctx, img, x, y, w, h){
  // Fill the exact mm box without leaving extra white space. User crop controls the final area.
  const arImg = img.width / img.height;
  const arBox = w / h;
  let sw = img.width, sh = img.height, sx = 0, sy = 0;
  if (arImg > arBox) { sw = img.height * arBox; sx = (img.width - sw) / 2; }
  else { sh = img.width / arBox; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
function drawTopGuide(ctx, scale, top, pageW){
  ctx.save();
  ctx.setLineDash([8,5]); ctx.strokeStyle='#ff304b'; ctx.lineWidth=Math.max(1,scale*0.15);
  ctx.beginPath(); ctx.moveTo(0,top); ctx.lineTo(pageW,top); ctx.stroke();
  ctx.restore();
}
function drawPdfSelection(ctx,img,scale,top,pageW,label){
  const size=getPdfPrintSizeMm(img); const w=size.w*scale, h=size.h*scale, x=(pageW-w)/2;
  ctx.save();
  ctx.fillStyle='#fff'; ctx.fillRect(x,top,w,h);
  drawImageCover(ctx,img,x,top,w,h);
  ctx.strokeStyle='#111'; ctx.lineWidth=Math.max(1,scale*0.18); ctx.strokeRect(x,top,w,h);
  // Fold guide in the middle when front+back strip is used.
  if (Math.abs(size.w - LAMINATION.w) < 1) {
    ctx.setLineDash([Math.max(4,scale*1.2), Math.max(3,scale*.9)]);
    ctx.strokeStyle='#666';
    ctx.beginPath(); ctx.moveTo(x+w/2, top); ctx.lineTo(x+w/2, top+h); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle='#111'; ctx.font=`bold ${Math.max(7,scale*2.2)}px Arial`; ctx.textAlign='center'; ctx.fillText(label,x+w/2,top+h+Math.max(10,scale*3));
  ctx.font=`${Math.max(6,scale*1.6)}px Arial`; ctx.fillStyle='#555'; ctx.fillText(`${(w/scale).toFixed(1)} × ${(h/scale).toFixed(1)} mm`,x+w/2,top+h+Math.max(18,scale*5.2));
  ctx.restore();
}
function updatePreview(){
  if(!state?.previewCanvas)return; const p=state.previewCanvas, ctx=p.getContext('2d');
  ctx.clearRect(0,0,p.width,p.height); ctx.fillStyle='#fff'; ctx.fillRect(0,0,p.width,p.height);
  const scale=p.width/A4.w; const top=state.topGap*scale; ctx.strokeStyle='#111'; ctx.lineWidth=1; ctx.strokeRect(0,0,p.width,p.height); drawTopGuide(ctx,scale,top,p.width);
  const crop=getCroppedCanvas();
  if(state.mode==='images' && state.frontImg && state.backImg){
    drawCard(ctx,crop,20*scale,top,CARD.w*scale,CARD.h*scale,'FRONT'); drawCard(ctx,crop,(20+CARD.w+8)*scale,top,CARD.w*scale,CARD.h*scale,'BACK');
  } else {
    drawPdfSelection(ctx,crop,scale,top,p.width,'SELECTED PRINT AREA');
  }
}
function drawCard(ctx,img,x,y,w,h,label){ ctx.save(); ctx.strokeStyle='#111';ctx.lineWidth=1; ctx.strokeRect(x,y,w,h); ctx.drawImage(img,x,y,w,h); ctx.fillStyle='#111';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.fillText(label,x+w/2,y+h+14); ctx.restore(); }
function makeA4Canvas(){
  const out=document.createElement('canvas'); out.width=2480; out.height=3508; const ctx=out.getContext('2d');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,out.width,out.height); const s=out.width/A4.w, top=state.topGap*s; const crop=getCroppedCanvas();
  if(state.mode==='images' && state.frontImg && state.backImg){
    drawCard(ctx,crop,20*s,top,CARD.w*s,CARD.h*s,'FRONT'); drawCard(ctx,crop,(20+CARD.w+8)*s,top,CARD.w*s,CARD.h*s,'BACK');
    ctx.strokeStyle='#999'; ctx.setLineDash([12,12]); ctx.beginPath(); ctx.moveTo((20+CARD.w+4)*s, top-5*s); ctx.lineTo((20+CARD.w+4)*s, top+(CARD.h+5)*s); ctx.stroke();
  } else {
    drawPdfSelection(ctx,crop,s,top,out.width,'SELECTED PRINT AREA');
  }
  drawTopGuide(ctx,s,top,out.width); return out;
}
async function downloadPdf(){ const {jsPDF}=window.jspdf; const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'}); const a4=makeA4Canvas(); pdf.addImage(a4.toDataURL('image/jpeg',0.95),'JPEG',0,0,210,297); pdf.save(`SmartPhotoToolkit_${state.doc.id}_A4_Print_${VERSION}.pdf`); }
function printOutput(){ const a4=makeA4Canvas(); const data=a4.toDataURL('image/png'); const w=window.open('','_blank'); w.document.write(`<!doctype html><html><head><title>Print ${state.doc.title}</title><style>@page{size:A4 portrait;margin:0}html,body{margin:0;background:#fff}.page{width:210mm;height:297mm}img{width:210mm;height:297mm;display:block}</style></head><body><div class="page"><img src="${data}"></div><script>window.onload=()=>{setTimeout(()=>window.print(),350)}<\/script></body></html>`); w.document.close(); }
