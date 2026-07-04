/* Smart Photo Toolkit Pro v42.8 - Safe Isolation Restore */
'use strict';

const VERSION = 'v42.8-Real-Development-Foundation';
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
const AUTH_KEY='spt_user_v428';
let currentUser = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');

window.addEventListener('load', () => {
  if(window.pdfjsLib){ pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; }
  app = document.getElementById('app');
  bindNav();
  bindAuthUI();
  bindFooterLinks();
  updateAuthUI();
  showDashboard();
  setTimeout(()=>document.getElementById('loader')?.classList.add('hidden'),450);
});

document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
function bindNav(){ document.querySelectorAll('.nav').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.getElementById('sidebar')?.classList.remove('open'); const v=btn.dataset.view; if(v==='documents') showDocuments(); else if(v==='passport') showPassport(); else if(v==='pdfstudio') showPdfStudio(); else if(v==='compressor') showImageCompressor(); else if(v==='namedate') showNameDatePhoto(); else if(v==='workspace') showWorkspace(); else if(v==='downloads') showDownloads(); else showSimple(v); })); }
function setActive(view){ document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active', b.dataset.view===view)); }
function showDashboard(){exitEditorMode();setActive('dashboard'); app.innerHTML=`<section class="hero"><h1>Smart Photo Toolkit Pro ${VERSION}</h1><p>Document Studio Pro: official PDF upload, professional crop, real A4 output, 2.2 mm lamination gap.</p></section><section class="grid">${DOCS.map(cardHtml).join('')}</section>`; bindDocCards();}
function showDocuments(){exitEditorMode();setActive('documents'); app.innerHTML=`<div class="crumb">Dashboard › Document Studio</div><section class="hero"><h1>Document Studio</h1><p>Select document type. Har document me same professional crop + A4 printable engine milega.</p></section><section class="grid">${DOCS.map(cardHtml).join('')}</section>`; bindDocCards();}
function cardHtml(d){return `<article class="doc-card" data-doc="${d.id}"><img src="${d.img}" alt="${d.title}"><h3>${d.title}</h3><p>${d.desc}</p></article>`}
function bindDocCards(){ document.querySelectorAll('.doc-card').forEach(c=>c.addEventListener('click',()=>openEditor(c.dataset.doc))); }
function showSimple(v){exitEditorMode();currentView=v; app.innerHTML=`<section class="hero"><h1>${titleCase(v)}</h1><p>This section is ready. Document Studio Pro is active in this build.</p></section>`;}
function showPassport(){ exitEditorMode(); setActive('passport'); app.innerHTML=passportHtml(); bindPassportTool(); }
function showPdfStudio(){ exitEditorMode(); setActive('pdfstudio'); app.innerHTML=pdfStudioHtml(); bindPdfStudioTool(); }
function showImageCompressor(){ exitEditorMode(); setActive('compressor'); app.innerHTML=imageCompressorHtml(); bindImageCompressorTool(); }
function showNameDatePhoto(){ exitEditorMode(); setActive('namedate'); app.innerHTML=nameDateHtml(); bindNameDateTool(); }
function showWorkspace(){ exitEditorMode(); setActive('workspace'); app.innerHTML=workspaceHtml(); }
function showDownloads(){ exitEditorMode(); setActive('downloads'); app.innerHTML=downloadsHtml(); }
function titleCase(s){return String(s).replace(/([A-Z])/g,' $1').replace(/^./,m=>m.toUpperCase())}



/* v42.8 Safe Isolation Restore: auth/profile/footer + non-document tools */
function bindAuthUI(){
  document.getElementById('signinBtn')?.addEventListener('click',()=>showAuthModal('signin'));
  document.getElementById('signupBtn')?.addEventListener('click',()=>showAuthModal('signup'));
  document.getElementById('profileTrigger')?.addEventListener('click',(e)=>{e.stopPropagation();document.getElementById('profileMenu')?.classList.toggle('open')});
  document.addEventListener('click',()=>document.getElementById('profileMenu')?.classList.remove('open'));
  document.querySelectorAll('[data-profile]').forEach(b=>b.addEventListener('click',(e)=>{e.stopPropagation(); const a=b.dataset.profile; document.getElementById('profileMenu')?.classList.remove('open'); if(a==='logout') logoutUser(); else if(a==='edit') showProfileEdit(); else if(a==='workspace') showWorkspace(); else if(a==='downloads') showDownloads();}));
}
function updateAuthUI(){
  const signed=!!currentUser;
  document.getElementById('signinBtn')?.classList.toggle('hidden',signed);
  document.getElementById('signupBtn')?.classList.toggle('hidden',signed);
  document.getElementById('profileWrap')?.classList.toggle('hidden',!signed);
  const name=currentUser?.name || 'Satnam';
  const plan=currentUser?.plan || 'Premium User';
  const avatar=(name[0]||'S').toUpperCase();
  const n=document.getElementById('userNameTop'); if(n)n.textContent=name;
  const p=document.getElementById('userPlanTop'); if(p)p.textContent=plan;
  const a=document.getElementById('avatarText'); if(a)a.textContent=avatar;
}
function showAuthModal(type='signin'){
  const isSignup=type==='signup';
  const modal=document.createElement('div'); modal.className='modal-backdrop';
  modal.innerHTML=`<div class="auth-modal"><button class="modal-x">×</button><h2>${isSignup?'Create account':'Sign in'}</h2><p>${isSignup?'Signup karke profile/workspace use karo.':'Apne Smart Photo Toolkit account me login karo.'}</p>${isSignup?'<label>Name</label><input id="authName" placeholder="Your name">':''}<label>Email</label><input id="authEmail" type="email" placeholder="you@example.com"><label>Password</label><input id="authPass" type="password" placeholder="Password"><button class="primary wide" id="authSubmit">${isSignup?'Signup':'Sign in'}</button><button class="link-btn" id="switchAuth">${isSignup?'Already account? Sign in':'New user? Signup'}</button><small class="muted-note">Demo/local login enabled. Google Apps Script API connect karne par live auth use hoga.</small></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.modal-x').onclick=()=>modal.remove();
  modal.querySelector('#switchAuth').onclick=()=>{modal.remove(); showAuthModal(isSignup?'signin':'signup')};
  modal.querySelector('#authSubmit').onclick=()=>{ const email=modal.querySelector('#authEmail').value.trim(); const pass=modal.querySelector('#authPass').value.trim(); const name=isSignup?(modal.querySelector('#authName').value.trim()||'Satnam'):email.split('@')[0]||'Satnam'; if(!email||!pass){toast('Email aur password required');return;} currentUser={name,email,plan:'Free User'}; localStorage.setItem(AUTH_KEY,JSON.stringify(currentUser)); updateAuthUI(); modal.remove(); toast(isSignup?'Signup successful':'Sign in successful'); };
}
function logoutUser(){ currentUser=null; localStorage.removeItem(AUTH_KEY); updateAuthUI(); toast('Logout successful'); showDashboard(); }
function showProfileEdit(){ exitEditorMode(); app.innerHTML=`<section class="hero"><h1>Profile Edit</h1><p>Profile menu restore ho gaya hai. Yahan name, email aur plan update kar sakte ho.</p></section><section class="tool-panel"><label>Name</label><input id="profileName" value="${currentUser?.name||'Satnam'}"><label>Email</label><input id="profileEmail" value="${currentUser?.email||''}"><label>Plan</label><select id="profilePlan"><option>Free User</option><option>Premium User</option></select><button class="primary" id="saveProfile">Save Profile</button></section>`; const plan=document.getElementById('profilePlan'); if(plan)plan.value=currentUser?.plan||'Free User'; document.getElementById('saveProfile').onclick=()=>{currentUser={name:val('profileName')||'Satnam',email:val('profileEmail')||'',plan:val('profilePlan')||'Free User'}; localStorage.setItem(AUTH_KEY,JSON.stringify(currentUser)); updateAuthUI(); toast('Profile updated');}; }
function bindFooterLinks(){ document.querySelectorAll('[data-footer]').forEach(a=>a.addEventListener('click',(e)=>{e.preventDefault(); showFooterPage(a.dataset.footer)})); }
function showFooterPage(type){ exitEditorMode(); const map={about:['About','Smart Photo Toolkit Pro document, photo aur PDF tools ka all-in-one toolkit hai.'],privacy:['Privacy Policy','Files browser me process hote hain. Sensitive document ko server par upload na karein jab tak API configured na ho.'],terms:['Terms & Conditions','Tool output ko use karne se pehle print size aur document quality verify karein.'],disclaimer:['Disclaimer','Ye official government service nahi hai. Document print/crop utility ke roop me use karein.'],contact:['Contact / Support','Support ke liye owner contact details/site footer me add ki ja sakti hain.']}; const m=map[type]||map.about; app.innerHTML=`<section class="hero"><h1>${m[0]}</h1><p>${m[1]}</p></section><section class="tool-panel"><button class="primary" onclick="showDashboard()">Back to Dashboard</button></section>`; }
function val(id){return document.getElementById(id)?.value||''}
function toast(msg){ let t=document.getElementById('toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)} t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500); }
function toolShell(title,desc,body){ return `<section class="hero"><h1>${title}</h1><p>${desc}</p></section><section class="tool-panel">${body}</section>`; }
function passportHtml(){ return toolShell('Passport Photo','Passport/photo module restore. Document Studio updates is module ko affect nahi karenge.',`<div class="upload-box full"><label>Upload Photo</label><input type="file" id="passportInput" accept="image/*"><small>Photo upload karke preview dekhein.</small></div><div class="passport-preview"><canvas id="passportCanvas" width="420" height="520"></canvas></div><div class="toolbar"><button id="passportFit">Fit Photo</button><button id="passportDownload" class="primary">Download JPG</button></div>`); }
function bindPassportTool(){ const c=document.getElementById('passportCanvas'), ctx=c.getContext('2d'); ctx.fillStyle='#eef5ff';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#60718b';ctx.font='bold 22px Arial';ctx.textAlign='center';ctx.fillText('Passport Photo Preview',c.width/2,c.height/2); let img=null; document.getElementById('passportInput').onchange=e=>{const f=e.target.files[0]; if(!f)return; img=new Image(); img.onload=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height); const r=Math.min(c.width/img.width,c.height/img.height); const w=img.width*r,h=img.height*r;ctx.drawImage(img,(c.width-w)/2,(c.height-h)/2,w,h)}; img.src=URL.createObjectURL(f)}; document.getElementById('passportDownload').onclick=()=>downloadCanvas(c,'passport_photo.jpg','image/jpeg'); }
function pdfStudioHtml(){ return toolShell('PDF Studio','PDF Resizer/PDF Studio restore. Merge, split, compress placeholders safe mode me hain.',`<div class="upload-box full"><label>Upload PDF</label><input type="file" id="pdfStudioInput" accept="application/pdf"><small id="pdfStudioInfo">PDF select karein.</small></div><div class="toolbar"><button class="primary" id="pdfResizeBtn">Resize / Optimize</button><button id="pdfMergeBtn">Merge</button><button id="pdfSplitBtn">Split</button></div>`); }
function bindPdfStudioTool(){ const info=document.getElementById('pdfStudioInfo'); document.getElementById('pdfStudioInput').onchange=e=>{const f=e.target.files[0]; if(f)info.textContent=`Selected: ${f.name} (${Math.round(f.size/1024)} KB)`}; ['pdfResizeBtn','pdfMergeBtn','pdfSplitBtn'].forEach(id=>document.getElementById(id).onclick=()=>toast('PDF Studio tool restored. Advanced processing next build me connect hoga.')); }
function imageCompressorHtml(){ return toolShell('Image Compressor','Image compressor restore.',`<div class="upload-box full"><label>Upload Image</label><input type="file" id="compressInput" accept="image/*"></div><div class="toolbar"><button id="compressBtn" class="primary">Compress</button></div><div id="compressInfo" class="info-list"></div>`); }
function bindImageCompressorTool(){ let file=null; document.getElementById('compressInput').onchange=e=>{file=e.target.files[0]; document.getElementById('compressInfo').textContent=file?`Selected ${file.name} (${Math.round(file.size/1024)} KB)`:''}; document.getElementById('compressBtn').onclick=()=>toast(file?'Compressor restored. HD compression engine next build me improve hoga.':'Pehle image upload karo'); }
function nameDateHtml(){ return toolShell('Name / Date Photo','Name/date photo module restore.',`<div class="upload-box full"><label>Upload Photo</label><input type="file" id="ndInput" accept="image/*"></div><label>Name/Text</label><input id="ndText" placeholder="Name or date text"><canvas id="ndCanvas" width="640" height="420"></canvas><div class="toolbar"><button id="ndApply" class="primary">Apply Text</button><button id="ndDownload">Download</button></div>`); }
function bindNameDateTool(){ const c=document.getElementById('ndCanvas'),ctx=c.getContext('2d'); let img=null; ctx.fillStyle='#eef5ff';ctx.fillRect(0,0,c.width,c.height); document.getElementById('ndInput').onchange=e=>{const f=e.target.files[0]; if(!f)return; img=new Image(); img.onload=()=>drawND(); img.src=URL.createObjectURL(f)}; function drawND(){ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height); if(img){const r=Math.min(c.width/img.width,c.height/img.height); const w=img.width*r,h=img.height*r;ctx.drawImage(img,(c.width-w)/2,(c.height-h)/2,w,h)} ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,c.height-54,c.width,54);ctx.fillStyle='#fff';ctx.font='bold 26px Arial';ctx.textAlign='center';ctx.fillText(val('ndText')||'Name / Date',c.width/2,c.height-18)} document.getElementById('ndApply').onclick=drawND; document.getElementById('ndDownload').onclick=()=>downloadCanvas(c,'name_date_photo.png','image/png'); }
function workspaceHtml(){ return toolShell('My Workspace','Saved projects/workspace area restored.',`<div class="info-list">No saved projects yet. Future build me saved crops/prints yahan dikhaye jayenge.</div>`); }
function downloadsHtml(){ return toolShell('Downloads','Recent downloads area restored.',`<div class="info-list">Browser downloads folder me generated files save hoti hain.</div>`); }
function downloadCanvas(c,name,type){ const a=document.createElement('a'); a.href=c.toDataURL(type||'image/png',.95); a.download=name; a.click(); }
window.showTool=function(view){ if(view==='login')showAuthModal('signin'); else if(view==='signup')showAuthModal('signup'); else if(view==='dashboard')showDashboard(); else showSimple(view); };

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
    crop:{x:40,y:40,w:360,h:240}, drag:null, canvas:null, ctx:null, previewCanvas:null, hasSource:false
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
      <span class="editor-status">v42.8 real PDF/crop foundation</span>
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
async function loadPdfFile(e){ const file=e.target.files[0]; if(!file)return; state.mode='pdf'; document.getElementById('modeSelect').value='pdf'; const buf=await file.arrayBuffer(); state.pdf=await pdfjsLib.getDocument({data:buf}).promise; state.totalPages=state.pdf.numPages; const sel=document.getElementById('pageSelect'); sel.innerHTML=Array.from({length:state.totalPages},(_,i)=>`<option value="${i+1}">Page ${i+1} / ${state.totalPages}</option>`).join(''); state.page=1; await renderPdfPage(true); setTimeout(()=>{ try{fitWidth()}catch(e){} },80); }
function loadImageFile(e,slot){ const file=e.target.files[0]; if(!file)return; const img=new Image(); img.onload=()=>{ if(slot==='front'){state.frontImg=img;state.activeImage='front'} else {state.backImg=img;state.activeImage='back'} state.mode='images'; document.getElementById('modeSelect').value='images'; renderImage(img,true);}; img.src=URL.createObjectURL(file); }
function renderCurrent(){ if(state.mode==='pdf' && state.pdf) renderPdfPage(); else if(state.mode==='images' && (state.frontImg||state.backImg)) renderImage(state.frontImg||state.backImg); else drawBlankStage(); }
async function renderPdfPage(reset=false){ if(!state.pdf){drawBlankStage();return;} const page=await state.pdf.getPage(state.page); const viewport=page.getViewport({scale:state.zoom, rotation:state.rotation}); state.canvas.width=Math.round(viewport.width); state.canvas.height=Math.round(viewport.height); await page.render({canvasContext:state.ctx, viewport}).promise; markSourceReady(); syncStageSize(); if(reset) resetCrop(); else applyCrop(); updateZoomLabel(); updatePreview(); }
function renderImage(img, reset=false){ const maxW=1400; const sc=state.zoom*Math.min(1,maxW/img.width); state.canvas.width=Math.round(img.width*sc); state.canvas.height=Math.round(img.height*sc); state.ctx.fillStyle='#fff';state.ctx.fillRect(0,0,state.canvas.width,state.canvas.height); if(state.rotation){ state.ctx.save(); state.ctx.translate(state.canvas.width/2,state.canvas.height/2); state.ctx.rotate(state.rotation*Math.PI/180); state.ctx.drawImage(img,-state.canvas.width/2,-state.canvas.height/2,state.canvas.width,state.canvas.height); state.ctx.restore(); } else state.ctx.drawImage(img,0,0,state.canvas.width,state.canvas.height); markSourceReady(); syncStageSize(); if(reset) resetCrop(); else applyCrop(); updateZoomLabel(); updatePreview(); }
function drawBlankStage(){
  state.hasSource=false;
  state.canvas.width=1; state.canvas.height=1;
  const st=document.getElementById('stage');
  st.classList.add('empty-stage');
  const box=document.getElementById('cropBox'); if(box) box.classList.add('source-not-ready');
  syncStageSize(); updateZoomLabel(); updateInfo(); updatePreview();
}
function markSourceReady(){
  state.hasSource=true;
  document.getElementById('stage')?.classList.remove('empty-stage');
  document.getElementById('cropBox')?.classList.remove('source-not-ready');
}
function syncStageSize(){ const st=document.getElementById('stage'); st.style.width=state.hasSource?state.canvas.width+'px':'100%'; st.style.height=state.hasSource?state.canvas.height+'px':'auto'; }
function updateZoomLabel(){ document.getElementById('zoomLabel').textContent=Math.round(state.zoom*100)+'%'; }
function resetCrop(){ const w=state.canvas.width,h=state.canvas.height; state.crop={x:Math.round(w*.08),y:Math.round(h*.08),w:Math.round(w*.84),h:Math.round(h*.55)}; applyCrop(); updatePreview(); }
function autoCrop(){ const w=state.canvas.width,h=state.canvas.height; state.crop={x:Math.round(w*.1),y:Math.round(h*.18),w:Math.round(w*.8),h:Math.round(h*.48)}; applyCrop(); updatePreview(); }
function fitWidth(){ const wrap=document.getElementById('stageWrap'); const target=Math.max(300, wrap.clientWidth-24); const natural=state.canvas.width/state.zoom; if(natural>0){state.zoom=target/natural; renderCurrent();} }
function applyCrop(){ const c=clampCrop(state.crop); state.crop=c; const box=document.getElementById('cropBox'); box.style.left=c.x+'px';box.style.top=c.y+'px';box.style.width=c.w+'px';box.style.height=c.h+'px'; updateInfo(); }
function clampCrop(c){ const min=36,W=state.canvas.width,H=state.canvas.height; c.x=Math.max(0,Math.min(c.x,W-min)); c.y=Math.max(0,Math.min(c.y,H-min)); c.w=Math.max(min,Math.min(c.w,W-c.x)); c.h=Math.max(min,Math.min(c.h,H-c.y)); return c; }
function setupCropEvents(){ const box=document.getElementById('cropBox'); box.addEventListener('pointerdown', startDrag); box.querySelectorAll('.handle').forEach(h=>h.addEventListener('pointerdown', startDrag)); window.addEventListener('pointermove', moveDrag); window.addEventListener('pointerup', endDrag); }
function startDrag(e){ e.preventDefault(); e.stopPropagation(); const h=e.target.dataset.h || 'move'; state.drag={h,startX:e.clientX,startY:e.clientY,c:{...state.crop}}; try{e.target.setPointerCapture(e.pointerId)}catch{} }
function moveDrag(e){ if(!state.drag)return; const d=state.drag, dx=e.clientX-d.startX, dy=e.clientY-d.startY; let c={...d.c}; if(d.h==='move'){c.x+=dx;c.y+=dy} else { if(d.h.includes('w')){c.x+=dx;c.w-=dx} if(d.h.includes('e')){c.w+=dx} if(d.h.includes('n')){c.y+=dy;c.h-=dy} if(d.h.includes('s')){c.h+=dy} } state.crop=clampCrop(c); applyCrop(); updatePreview(); }
function endDrag(){ state.drag=null; }
function nudge(dir){ const step= dir==='center'?0:5; if(dir==='left')state.crop.x-=step; if(dir==='right')state.crop.x+=step; if(dir==='up')state.crop.y-=step; if(dir==='down')state.crop.y+=step; if(dir==='center'){state.crop.x=(state.canvas.width-state.crop.w)/2;state.crop.y=(state.canvas.height-state.crop.h)/2;} applyCrop(); updatePreview(); }
function getCroppedCanvas(scale=1){ const c=state.crop; const out=document.createElement('canvas'); out.width=Math.max(1,Math.round(c.w*scale)); out.height=Math.max(1,Math.round(c.h*scale)); out.getContext('2d').drawImage(state.canvas,c.x,c.y,c.w,c.h,0,0,out.width,out.height); return out; }
async function getExportCropCanvas(){
  // v42.8: Download/print crop original PDF se high resolution me render hota hai, screen preview se nahi.
  if(state.mode==='pdf' && state.pdf){
    try{
      const page=await state.pdf.getPage(state.page);
      const exportZoom=Math.max(state.zoom*4, 3.5);
      const viewport=page.getViewport({scale:exportZoom, rotation:state.rotation});
      const hi=document.createElement('canvas'); hi.width=Math.round(viewport.width); hi.height=Math.round(viewport.height);
      await page.render({canvasContext:hi.getContext('2d'), viewport}).promise;
      const ratio=exportZoom/state.zoom; const c=state.crop;
      const out=document.createElement('canvas'); out.width=Math.max(1,Math.round(c.w*ratio)); out.height=Math.max(1,Math.round(c.h*ratio));
      out.getContext('2d').drawImage(hi,c.x*ratio,c.y*ratio,c.w*ratio,c.h*ratio,0,0,out.width,out.height);
      return out;
    }catch(err){ console.warn('HD PDF export fallback',err); }
  }
  return getCroppedCanvas(4);
}
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
  if(!state.hasSource){ ctx.fillStyle='#60718b'; ctx.font='bold 28px Arial'; ctx.textAlign='center'; ctx.fillText('A4 preview will appear after upload', p.width/2, p.height*.35); return; }
  const crop=getCroppedCanvas();
  if(state.mode==='images' && state.frontImg && state.backImg){
    drawCard(ctx,crop,20*scale,top,CARD.w*scale,CARD.h*scale,'FRONT'); drawCard(ctx,crop,(20+CARD.w+8)*scale,top,CARD.w*scale,CARD.h*scale,'BACK');
  } else {
    drawPdfSelection(ctx,crop,scale,top,p.width,'SELECTED PRINT AREA');
  }
}
function drawCard(ctx,img,x,y,w,h,label){ ctx.save(); ctx.strokeStyle='#111';ctx.lineWidth=1; ctx.strokeRect(x,y,w,h); ctx.drawImage(img,x,y,w,h); ctx.fillStyle='#111';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.fillText(label,x+w/2,y+h+14); ctx.restore(); }
async function makeA4Canvas(){
  if(!state.hasSource){ alert('Pehle PDF ya image upload karo.'); throw new Error('No source uploaded'); }
  const out=document.createElement('canvas'); out.width=2480; out.height=3508; const ctx=out.getContext('2d');
  ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
  ctx.fillStyle='#fff';ctx.fillRect(0,0,out.width,out.height); const s=out.width/A4.w, top=state.topGap*s; const crop=await getExportCropCanvas();
  if(state.mode==='images' && state.frontImg && state.backImg){
    drawCard(ctx,crop,20*s,top,CARD.w*s,CARD.h*s,'FRONT'); drawCard(ctx,crop,(20+CARD.w+8)*s,top,CARD.w*s,CARD.h*s,'BACK');
    ctx.strokeStyle='#999'; ctx.setLineDash([12,12]); ctx.beginPath(); ctx.moveTo((20+CARD.w+4)*s, top-5*s); ctx.lineTo((20+CARD.w+4)*s, top+(CARD.h+5)*s); ctx.stroke();
  } else {
    drawPdfSelection(ctx,crop,s,top,out.width,'SELECTED PRINT AREA');
  }
  drawTopGuide(ctx,s,top,out.width); return out;
}
async function downloadPdf(){ if(!state.hasSource){ alert('Pehle PDF ya image upload karo.'); return; } const {jsPDF}=window.jspdf; const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:false}); const a4=await makeA4Canvas(); pdf.addImage(a4.toDataURL('image/png'),'PNG',0,0,210,297,undefined,'FAST'); pdf.save(`SmartPhotoToolkit_${state.doc.id}_A4_Print_${VERSION}.pdf`); }
async function printOutput(){ if(!state.hasSource){ alert('Pehle PDF ya image upload karo.'); return; } const a4=await makeA4Canvas(); const data=a4.toDataURL('image/png'); const w=window.open('','_blank'); w.document.write(`<!doctype html><html><head><title>Print ${state.doc.title}</title><style>@page{size:A4 portrait;margin:0}html,body{margin:0;background:#fff}.page{width:210mm;height:297mm}img{width:210mm;height:297mm;display:block}</style></head><body><div class="page"><img src="${data}"></div><script>window.onload=()=>{setTimeout(()=>window.print(),350)}<\/script></body></html>`); w.document.close(); }
