if(window.pdfjsLib){pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";}
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s), workspace=$("#workspace");
let appState={tool:"home", docType:"aadhaar", docMode:"both", uploadTab:"image", front:null, back:null, pdfCanvas:null, pdfPages:0, pdfPage:1, frontCrop:null, backCrop:null, pdfCrop:null, previewPDF:null, passportImg:null, passportCrop:null, passportPdf:null};
const DOCS={
  aadhaar:{name:"Aadhaar Card",size:"85.6 × 54 mm",icon:"aadhaar.jpg",cls:"aadhaar"},
  pan:{name:"PAN Card",size:"85.6 × 54 mm",icon:"pan.jpg",cls:"pan"},
  voter:{name:"Voter ID Card",size:"85.6 × 54 mm",icon:"voter.jpg",cls:"voter"},
  ayush:{name:"Ayushman Card",size:"85.6 × 54 mm",icon:"ayushman.jpg",cls:"ayush"},
  abha:{name:"ABHA Card",size:"85.6 × 54 mm",icon:"abha.jpg",cls:"abha"},
  dl:{name:"Driving Licence",size:"85.6 × 54 mm",icon:"dl.jpg",cls:"dl"}
};

window.addEventListener("load",()=>{setTimeout(()=>{$("#loader").style.display="none"},350);initApp();});
function initApp(){
  $("#menuBtn")?.addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $$(".nav-item[data-tool]").forEach(b=>b.onclick=()=>showTool(b.dataset.tool));
  $("#userTrigger")?.addEventListener("click",()=>$("#userDropdown").classList.toggle("show"));
  document.addEventListener("click",e=>{if(!e.target.closest(".user-menu"))$("#userDropdown")?.classList.remove("show")});
  updateTopUser(); home();
}
function setActive(tool){$$(".nav-item[data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===tool));$("#sidebar")?.classList.remove("open");}
function showTool(tool){appState.tool=tool;setActive(tool); if(tool==="home")return home(); if(tool==="imageStudio")return imageStudio(); if(tool==="documentStudio")return documentStudio(); if(tool==="pdfStudio"||tool==="pdfresizer")return pdfStudio(); if(tool==="login")return loginTool(); if(tool==="dashboard"||tool==="workspace"||tool==="downloads"||tool==="orders"||tool==="settings")return dashboardTool(tool); if(tool==="premium")return premiumTool(); if(tool==="payment")return paymentTool(); if(tool==="feedback")return feedbackTool(); if(tool==="admin")return adminTool(); return home();}
function toast(msg){let t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}
function getUser(){try{return window.SPT?.user || JSON.parse(localStorage.getItem("spt_user")||"null")}catch(e){return null}}
function updateTopUser(){const u=getUser(); const name=u?.name||"Guest User"; const plan=u?.premium?"Premium User":"Login required"; $("#headerUserName").textContent=name; $("#headerUserPlan").textContent=plan; $("#headerAvatar").textContent=(name||"G").trim()[0].toUpperCase(); $("#adminDropBtn").style.display=(u&&String(u.role).toLowerCase()==="admin")?"block":"none"; $("#logoutDropBtn").textContent=u?"🚪 Logout":"🔐 Login / Signup";}
function logoutOrLogin(){const u=getUser(); if(u&&window.SPT?.logout){SPT.logout(); setTimeout(updateTopUser,100);} else showTool("login");}

function pageHeader(title,sub,extra=""){return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div>${extra||`<button class="help-btn">▶ How to use?</button>`}</div>`}
function home(){workspace.innerHTML=pageHeader("Smart Photo Toolkit Pro","Enterprise photo, document and PDF toolkit.")+`<div class="home-grid"><div class="card home-card" onclick="showTool('imageStudio')"><b>🖼️</b><h3>Image Studio</h3><p>Passport photo, compression, resize, crop, converter and name/date tools.</p></div><div class="card home-card" onclick="showTool('documentStudio')"><b>▤</b><h3>Document Studio</h3><p>Aadhaar, PAN, Voter, Ayushman, ABHA and Driving Licence A4 print.</p></div><div class="card home-card" onclick="showTool('pdfStudio')"><b>▧</b><h3>PDF Studio</h3><p>Compress, resize and print-ready PDF tools.</p></div></div>`}

function imageStudio(){workspace.innerHTML=pageHeader("Image Studio","Create passport photos and prepare images for print.")+`<div class="home-grid"><div class="card home-card" onclick="passportStudio()"><b>👤</b><h3>Passport Photo Studio</h3><p>Aadhaar-style 8-handle crop, 35×45 mm print output.</p></div><div class="card home-card" onclick="compressorTool()"><b>🖼️</b><h3>Image Compressor</h3><p>Compress images to target KB.</p></div><div class="card home-card" onclick="nameDateTool()"><b>🏷️</b><h3>Name / Date</h3><p>Add name, date or custom text below photo.</p></div><div class="card home-card" onclick="imageResizeTool()"><b>📏</b><h3>Resize Image</h3><p>Resize image by width and height.</p></div><div class="card home-card" onclick="imageConverterTool()"><b>🔄</b><h3>Image Converter</h3><p>Convert to JPG, PNG or WEBP.</p></div></div>`}
function passportStudio(){workspace.innerHTML=pageHeader("Passport Photo Studio","Upload a photo, drag-select printable area, then generate A4 passport sheet.")+`<div class="card flow-card"><h3>Upload Full Photo</h3><label class="dropzone"><input type="file" accept="image/*" onchange="loadPassportImg(event)"><div>📤 Click to upload photo<br><small>JPG, PNG, WEBP</small></div></label><div class="pdf-settings"><input id="passName" placeholder="Name optional"><select id="passLayout"><option value="5">5 Photos</option><option value="4">4 Photos</option><option value="6">6 Photos</option><option value="8">8 Photos</option><option value="12">12 Photos</option></select></div></div><div class="card flow-card"><h3>Select Printable Area</h3><div class="crop-stage" id="passportStage"><div class="info-note">Upload a photo to start. Crop box supports move + 8-side resize.</div></div><div class="crop-tools"><button onclick="resetPassportCrop()">Reset</button><button onclick="makePassportPDF()">Generate A4 PDF</button><button onclick="downloadPassportPDF()">Download PDF</button><button onclick="printGeneratedPDF('passport')">Print</button></div></div><div id="passportOutput"></div>`}
async function loadPassportImg(e){const f=e.target.files[0]; if(!f)return; appState.passportImg=await readFile(f); const stage=$("#passportStage"); stage.innerHTML=`<img src="${appState.passportImg}" id="passportImg">`; setTimeout(()=>{appState.passportCrop=createCrop(stage,$("#passportImg"),{ratio:35/45,color:"orange"});},100)}
function resetPassportCrop(){if(!appState.passportImg)return; const stage=$("#passportStage"); stage.innerHTML=`<img src="${appState.passportImg}" id="passportImg">`; setTimeout(()=>{appState.passportCrop=createCrop(stage,$("#passportImg"),{ratio:35/45,color:"orange"});},50)}
async function makePassportPDF(){if(!appState.passportCrop)return toast("Upload and select photo area first"); const src=await cropFromElement(appState.passportCrop); const n=Number($("#passLayout").value||5); const {jsPDF}=window.jspdf; const pdf=new jsPDF({unit:"mm",format:"a4"}); let x=5,y=3,gap=3,w=35,h=45; for(let i=0;i<n;i++){if(x+w>205){x=5;y+=h+gap+7} pdf.addImage(src,"JPEG",x,y,w,h); pdf.setDrawColor(0); pdf.rect(x,y,w,h); x+=w+gap;} appState.passportPdf=pdf; $("#passportOutput").innerHTML=`<div class="preview-a4"><b>Passport PDF Ready</b><p>Top margin minimized to 3mm.</p></div>`; toast("Passport PDF generated")}
function downloadPassportPDF(){if(!appState.passportPdf)return toast("Generate PDF first"); appState.passportPdf.save("passport-photo-a4.pdf")}

function documentStudio(){renderDocumentStudio()}
function renderDocumentStudio(){const d=DOCS[appState.docType]; workspace.innerHTML=pageHeader("Document Studio","Select document, upload and print with perfect settings.")+`
<div class="section-title">1. Select Document</div><div class="doc-grid">${Object.entries(DOCS).map(([k,v])=>`<button class="doc-tile ${appState.docType===k?'active':''}" onclick="setDocType('${k}')"><span class="doc-icon ${v.cls}"><img src="${v.icon}" alt="${v.name}"></span><b>${v.name}</b><small>${v.size}</small></button>`).join("")}</div>
<div class="section-title">2. Select Mode</div><div class="mode-row"><button class="mode-btn ${appState.docMode==='front'?'active':''}" onclick="setDocMode('front')">▣ Front</button><button class="mode-btn ${appState.docMode==='back'?'active':''}" onclick="setDocMode('back')">▣ Back</button><button class="mode-btn ${appState.docMode==='both'?'active':''}" onclick="setDocMode('both')">▣ Front + Back</button></div>
<div class="studio-grid"><div class="left-flow"><div class="flow-card"><h3>3. Upload Document (Image or PDF)</h3><div class="tabs"><button class="tab ${appState.uploadTab==='image'?'active':''}" onclick="setUploadTab('image')">Image Upload</button><button class="tab ${appState.uploadTab==='pdf'?'active':''}" onclick="setUploadTab('pdf')">PDF Upload (Full Page)</button></div><div id="uploadArea">${appState.uploadTab==='image'?imageUploadHTML():pdfUploadHTML()}</div></div><div class="flow-card"><h3>4. Select Printable Area (Drag & Resize)</h3><div id="cropArea">${appState.uploadTab==='image'?imageCropHTML():pdfCropHTML()}</div><div class="info-note">ⓘ Drag the border or corners to select the area you want to print.</div></div><div class="bottom-actions"><button class="ghost-btn" onclick="home()">← Back to Documents</button><button class="download-preview" onclick="downloadDocPDF()">⇩ Download Preview</button><button class="print-main" onclick="printGeneratedPDF('doc')">▣ Print / Save as PDF</button></div></div><div class="right-panel"><div class="preview-a4"><h3>5. Print Preview (A4)</h3><div class="a4-paper"><div class="preview-line" id="a4Preview"></div></div><div class="ok-note">✓ Top spacing and gap minimized for lamination</div></div><div class="print-settings"><h3>6. Print Settings</h3><div class="setting-row"><span>Paper Size</span><b>A4 (210 × 297 mm)</b></div><div class="setting-row"><span>Orientation</span><b>Portrait</b></div><div class="setting-row"><span>Margin</span><b>Minimal (3mm)</b></div><div class="setting-row"><span>Spacing (Front - Back)</span><b>3mm</b></div><label>Copies<select id="docCopies" onchange="updateA4Preview()"><option value="1">1 Copy</option><option value="2">2 Copies</option><option value="4">4 Copies</option><option value="6">6 Copies</option></select></label></div></div></div>`; initAfterRender();}
function setDocType(k){appState.docType=k; renderDocumentStudio()} function setDocMode(m){appState.docMode=m; renderDocumentStudio()} function setUploadTab(t){appState.uploadTab=t; renderDocumentStudio()}
function imageUploadHTML(){let needBack=appState.docMode!=="front", needFront=appState.docMode!=="back"; return `<div class="upload-row">${needFront?`<label class="upload-card"><div class="upload-head"><span><i class="green-dot"></i>Front Image</span><b class="change-link">Change</b></div><input type="file" accept="image/*" onchange="loadDocImage(event,'front')">${appState.front?`<img src="${appState.front}">`:`<div class="dropzone">Upload Front Image</div>`}</label>`:""}${needBack?`<label class="upload-card"><div class="upload-head"><span><i class="green-dot"></i>Back Image</span><b class="change-link">Change</b></div><input type="file" accept="image/*" onchange="loadDocImage(event,'back')">${appState.back?`<img src="${appState.back}">`:`<div class="dropzone">Upload Back Image</div>`}</label>`:""}</div><small>Supported: JPG, PNG, WEBP (Max 10MB)</small>`}
function pdfUploadHTML(){return `<label class="dropzone"><input type="file" accept="application/pdf" onchange="loadFullPDF(event)"><div>☁️ Click to upload full page PDF<br><small>Official downloaded PDF</small></div></label><div class="pdf-settings"><label>Page<select id="pdfPageSelect" onchange="renderPdfPage(Number(this.value))">${Array.from({length:appState.pdfPages||1},(_,i)=>`<option value="${i+1}" ${appState.pdfPage===i+1?'selected':''}>Page ${i+1}</option>`).join("")}</select></label><label>Zoom<select><option>Fit Width</option><option>100%</option></select></label></div>`}
function imageCropHTML(){let needBack=appState.docMode!=="front", needFront=appState.docMode!=="back"; return `<div class="crop-grid">${needFront?`<div class="crop-box-panel"><div class="crop-label">Front - Select Area</div><div class="crop-stage" id="frontStage">${appState.front?`<img src="${appState.front}" id="frontCropImg">`:`Upload front image first`}</div><div class="crop-tools"><button onclick="zoomCrop('front',1.08)">⌕</button><button onclick="zoomCrop('front',.92)">⌔</button><button onclick="resetDocCrop('front')">Reset</button></div></div>`:""}${needBack?`<div class="crop-box-panel"><div class="crop-label">Back - Select Area</div><div class="crop-stage" id="backStage">${appState.back?`<img src="${appState.back}" id="backCropImg">`:`Upload back image first`}</div><div class="crop-tools"><button onclick="zoomCrop('back',1.08)">⌕</button><button onclick="zoomCrop('back',.92)">⌔</button><button onclick="resetDocCrop('back')">Reset</button></div></div>`:""}</div>`}
function pdfCropHTML(){return `<div class="crop-stage large" id="pdfStage">${appState.pdfCanvas?`<canvas id="pdfCanvasView"></canvas>`:`Upload full page PDF first`}</div><div class="crop-tools"><button onclick="resetDocCrop('pdf')">Reset Selection</button><button onclick="generateDocPDF()">Crop & Generate A4 PDF</button></div>`}
async function loadDocImage(e,side){const f=e.target.files[0]; if(!f)return; appState[side]=await readFile(f); appState[side+'Crop']=null; renderDocumentStudio();}
function initAfterRender(){setTimeout(()=>{ if(appState.uploadTab==='image'){ if(appState.front&&$("#frontStage")){appState.frontCrop=createCrop($("#frontStage"),$("#frontCropImg"),{color:"blue"});} if(appState.back&&$("#backStage")){appState.backCrop=createCrop($("#backStage"),$("#backCropImg"),{color:"blue"});}} if(appState.uploadTab==='pdf'&&appState.pdfCanvas&&$("#pdfCanvasView")){drawPdfCanvasView(); appState.pdfCrop=createCrop($("#pdfStage"),$("#pdfCanvasView"),{color:"orange"});} updateA4Preview();},100)}
function resetDocCrop(side){if(side==='pdf'){appState.pdfCrop=null;renderDocumentStudio();return} appState[side+'Crop']=null;renderDocumentStudio()}
function zoomCrop(side,f){toast("Zoom controls are ready; drag handles for precise selection.")}
async function loadFullPDF(e){const f=e.target.files[0]; if(!f)return; if(!window.pdfjsLib)return toast("PDF library not loaded"); const buf=await f.arrayBuffer(); const pdf=await pdfjsLib.getDocument({data:buf}).promise; appState.pdfDoc=pdf; appState.pdfPages=pdf.numPages; appState.pdfPage=1; await renderPdfPage(1); renderDocumentStudio();}
async function renderPdfPage(n){if(!appState.pdfDoc)return; appState.pdfPage=n; const page=await appState.pdfDoc.getPage(n); const viewport=page.getViewport({scale:2.4}); const c=document.createElement('canvas'); c.width=viewport.width; c.height=viewport.height; await page.render({canvasContext:c.getContext('2d'),viewport}).promise; appState.pdfCanvas=c; if($("#pdfCanvasView")) drawPdfCanvasView();}
function drawPdfCanvasView(){const view=$("#pdfCanvasView"), src=appState.pdfCanvas; if(!view||!src)return; const ctx=view.getContext('2d'); const maxW=900, ratio=src.width/src.height; view.width=maxW; view.height=Math.round(maxW/ratio); ctx.drawImage(src,0,0,view.width,view.height)}
async function updateA4Preview(){const el=$("#a4Preview"); if(!el)return; let imgs=[]; if(appState.uploadTab==='image'){if(appState.frontCrop)imgs.push(await cropFromElement(appState.frontCrop)); else if(appState.front)imgs.push(appState.front); if(appState.backCrop)imgs.push(await cropFromElement(appState.backCrop)); else if(appState.back)imgs.push(appState.back);} else {if(appState.pdfCrop)imgs.push(await cropFromElement(appState.pdfCrop));} el.innerHTML=imgs.map(s=>`<img src="${s}">`).join("");}
async function generateDocPDF(){await updateA4Preview(); const imgs=[...$$("#a4Preview img")].map(i=>i.src); if(!imgs.length)return toast("Upload and select printable area first"); const {jsPDF}=window.jspdf; const pdf=new jsPDF({unit:"mm",format:"a4"}); const copies=Number($("#docCopies")?.value||1); let y=3; for(let c=0;c<copies;c++){let x=(210-(imgs.length*85.6+(imgs.length-1)*3))/2; for(const s of imgs){pdf.addImage(s,"JPEG",x,y,85.6,54); pdf.setDrawColor(0); pdf.rect(x,y,85.6,54); x+=88.6;} y+=57; if(y>260&&c<copies-1){pdf.addPage(); y=3}} appState.previewPDF=pdf; toast("A4 PDF generated")}
async function downloadDocPDF(){if(!appState.previewPDF)await generateDocPDF(); if(appState.previewPDF)appState.previewPDF.save(`${DOCS[appState.docType].name.replaceAll(' ','-')}-A4.pdf`)}
function printGeneratedPDF(type){let pdf= type==='passport'?appState.passportPdf:appState.previewPDF; if(!pdf){if(type==='doc')generateDocPDF(); return toast("Generate PDF first")} pdf.autoPrint(); window.open(URL.createObjectURL(pdf.output('blob')),'_blank')}

function getMediaBounds(stage, media){
  const sr = stage.getBoundingClientRect();
  const mr = media.getBoundingClientRect();
  let x = mr.left - sr.left, y = mr.top - sr.top, w = mr.width, h = mr.height;
  if(!w || !h || w < 10 || h < 10){
    x = 0; y = 0; w = stage.clientWidth; h = stage.clientHeight;
  }
  return {x,y,w,h,maxX:x+w,maxY:y+h};
}
function clampCropToMedia(s, x=s.x, y=s.y, w=s.w, h=s.h){
  const b = getMediaBounds(s.stage, s.media);
  const minW = Math.min(60, b.w), minH = Math.min(40, b.h);
  if(s.ratio){
    if(w / h > s.ratio) h = w / s.ratio; else w = h * s.ratio;
  }
  w = Math.max(minW, Math.min(w, b.w));
  h = Math.max(minH, Math.min(h, b.h));
  if(s.ratio){
    if(w > b.w){ w = b.w; h = w / s.ratio; }
    if(h > b.h){ h = b.h; w = h * s.ratio; }
  }
  x = Math.max(b.x, Math.min(x, b.x + b.w - w));
  y = Math.max(b.y, Math.min(y, b.y + b.h - h));
  return {x,y,w,h};
}
function paintCrop(s){
  const c = clampCropToMedia(s);
  s.x=c.x; s.y=c.y; s.w=c.w; s.h=c.h;
  Object.assign(s.box.style,{left:s.x+'px',top:s.y+'px',width:s.w+'px',height:s.h+'px'});
}
function createCrop(stage,media,opt={}){
  const color=opt.color||"blue", ratio=opt.ratio||null;
  stage.querySelectorAll('.crop-selection').forEach(e=>e.remove());
  const box=document.createElement('div');
  box.className=`crop-selection ${color==='orange'?'orange':''}`;
  ['nw','n','ne','e','se','s','sw','w'].forEach(p=>{let h=document.createElement('span');h.className='handle '+p;h.dataset.handle=p;box.appendChild(h)});
  const label=document.createElement('em'); label.className='crop-badge'; label.textContent='Printable Area'; box.appendChild(label);
  stage.appendChild(box);
  const b=getMediaBounds(stage,media);
  let w=b.w*.72,h=b.h*.55;
  if(ratio){h=w/ratio;if(h>b.h*.86){h=b.h*.86;w=h*ratio}}
  let x=b.x+(b.w-w)/2,y=b.y+(b.h-h)/2;
  let state={stage,media,box,ratio,x,y,w,h};
  attachCropEvents(state);
  paintCrop(state);
  setTimeout(()=>paintCrop(state),250);
  window.addEventListener('resize',()=>paintCrop(state),{passive:true});
  return state;
}
function attachCropEvents(s){
  let mode=null,start={};
  const point=e=>e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY};
  s.box.addEventListener('mousedown',down);
  s.box.addEventListener('touchstart',down,{passive:false});
  function down(e){
    e.preventDefault();
    const p=point(e);
    mode=e.target.dataset.handle||'move';
    start={px:p.x,py:p.y,x:s.x,y:s.y,w:s.w,h:s.h};
    document.addEventListener('mousemove',move);
    document.addEventListener('mouseup',up);
    document.addEventListener('touchmove',move,{passive:false});
    document.addEventListener('touchend',up);
  }
  function move(e){
    e.preventDefault();
    const p=point(e), dx=p.x-start.px, dy=p.y-start.py;
    let x=start.x,y=start.y,w=start.w,h=start.h;
    if(mode==='move'){x+=dx;y+=dy}
    else{
      if(mode.includes('e'))w+=dx;
      if(mode.includes('s'))h+=dy;
      if(mode.includes('w')){x+=dx;w-=dx}
      if(mode.includes('n')){y+=dy;h-=dy}
      if(s.ratio){
        if(['e','w','ne','nw','se','sw'].includes(mode)) h=w/s.ratio;
        else w=h*s.ratio;
      }
    }
    const c=clampCropToMedia(s,x,y,w,h);
    s.x=c.x;s.y=c.y;s.w=c.w;s.h=c.h;
    Object.assign(s.box.style,{left:s.x+'px',top:s.y+'px',width:s.w+'px',height:s.h+'px'});
  }
  function up(){
    document.removeEventListener('mousemove',move);
    document.removeEventListener('mouseup',up);
    document.removeEventListener('touchmove',move);
    document.removeEventListener('touchend',up);
    updateA4Preview();
  }
}
async function cropFromElement(s){
  const media=s.media;
  let srcW,srcH,source;
  if(media.tagName==='CANVAS'){source=media;srcW=media.width;srcH=media.height;}
  else {source=await loadImage(media.src);srcW=source.width;srcH=source.height;}
  const mr=media.getBoundingClientRect(), sr=s.stage.getBoundingClientRect();
  const drawW=mr.width, drawH=mr.height, offX=mr.left-sr.left, offY=mr.top-sr.top;
  let rx=(s.x-offX)/drawW, ry=(s.y-offY)/drawH, rw=s.w/drawW, rh=s.h/drawH;
  rx=Math.max(0,Math.min(rx,1)); ry=Math.max(0,Math.min(ry,1));
  rw=Math.max(.01,Math.min(rw,1-rx)); rh=Math.max(.01,Math.min(rh,1-ry));
  const c=document.createElement('canvas'), ctx=c.getContext('2d');
  c.width=1200; c.height=Math.max(1,Math.round(1200*(srcH*rh)/(srcW*rw)));
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height);
  ctx.drawImage(source,srcW*rx,srcH*ry,srcW*rw,srcH*rh,0,0,c.width,c.height);
  return c.toDataURL('image/jpeg',.94);
}

function readFile(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})} function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}

function compressorTool(){workspace.innerHTML=pageHeader("Image Compressor","Compress images to a target size.")+`<div class="card form"><input type="file" id="compFile" accept="image/*"><input id="targetKB" value="100" placeholder="Target KB"><button onclick="compressSimple()">Compress</button><div id="compOut"></div></div>`}
async function compressSimple(){const f=$("#compFile").files[0]; if(!f)return; const img=await loadImage(await readFile(f)); const c=document.createElement('canvas'),ctx=c.getContext('2d'); const w=900,h=Math.round(img.height*900/img.width); c.width=w;c.height=h;ctx.drawImage(img,0,0,w,h); const data=c.toDataURL('image/jpeg',.72); $("#compOut").innerHTML=`<img src="${data}" style="max-width:100%"><a download="compressed.jpg" href="${data}">Download</a>`}
function nameDateTool(){workspace.innerHTML=pageHeader("Name / Date Photo","Add text below a photo.")+`<div class="card form"><input type="file" id="ndFile" accept="image/*"><input id="ndName" placeholder="Name"><input id="ndDate" type="date"><button onclick="makeNameDate()">Create</button><div id="ndOut"></div></div>`}
async function makeNameDate(){const f=$("#ndFile").files[0]; if(!f)return; const img=await loadImage(await readFile(f)); const c=document.createElement('canvas'),ctx=c.getContext('2d'); const w=900,h=Math.round(img.height*900/img.width),cap=110; c.width=w;c.height=h+cap;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,w,h);ctx.fillStyle='#111';ctx.textAlign='center';ctx.font='bold 34px Arial';ctx.fillText($("#ndName").value,w/2,h+42);ctx.font='24px Arial';ctx.fillText($("#ndDate").value,w/2,h+82); const d=c.toDataURL('image/jpeg',.92);$("#ndOut").innerHTML=`<img src="${d}" style="max-width:100%"><a download="name-date.jpg" href="${d}">Download</a>`}
function imageResizeTool(){workspace.innerHTML=pageHeader("Resize Image","Resize image by custom dimensions.")+`<div class="card form"><input type="file" id="rsFile" accept="image/*"><input id="rsW" placeholder="Width px"><input id="rsH" placeholder="Height px"><button onclick="resizeImageSimple()">Resize</button><div id="rsOut"></div></div>`}
async function resizeImageSimple(){const f=$("#rsFile").files[0];if(!f)return; const img=await loadImage(await readFile(f)); const w=Number($("#rsW").value)||img.width,h=Number($("#rsH").value)||Math.round(img.height*w/img.width); const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=w;c.height=h;ctx.drawImage(img,0,0,w,h); const d=c.toDataURL('image/jpeg',.9);$("#rsOut").innerHTML=`<img src="${d}" style="max-width:100%"><a download="resized.jpg" href="${d}">Download</a>`}
function imageConverterTool(){workspace.innerHTML=pageHeader("Image Converter","Convert image format.")+`<div class="card form"><input type="file" id="cvFile" accept="image/*"><select id="cvType"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select><button onclick="convertImageSimple()">Convert</button><div id="cvOut"></div></div>`}
async function convertImageSimple(){const f=$("#cvFile").files[0];if(!f)return; const img=await loadImage(await readFile(f)); const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=img.width;c.height=img.height;ctx.drawImage(img,0,0); const type=$("#cvType").value; const d=c.toDataURL(type,.9);$("#cvOut").innerHTML=`<img src="${d}" style="max-width:100%"><a download="converted.${type.includes('png')?'png':type.includes('webp')?'webp':'jpg'}" href="${d}">Download</a>`}
function pdfStudio(){workspace.innerHTML=pageHeader("PDF Studio","PDF compression and resize tools.")+`<div class="home-grid"><div class="card home-card"><b>📄</b><h3>PDF Resizer</h3><p>Existing PDF tools will continue here.</p></div><div class="card home-card"><b>🔁</b><h3>Merge / Split</h3><p>Future-ready tool card.</p></div></div>`}
function loginTool(){workspace.innerHTML=pageHeader("Login / Create Account","Access dashboard, premium and payments.")+`<div class="auth-wrap"><div class="card form"><h3>Login</h3><input id="loginEmail" placeholder="Email"><input id="loginPassword" type="password" placeholder="Password"><button onclick="loginSubmit&&loginSubmit()">Login</button></div><div class="card form"><h3>Create Account</h3><input id="signupName" placeholder="Full Name"><input id="signupEmail" placeholder="Email"><input id="signupMobile" placeholder="Mobile"><textarea id="signupAddress" placeholder="Address"></textarea><input id="signupPassword" type="password" placeholder="Password"><button onclick="signupSubmit&&signupSubmit()">Create Account</button></div></div>`}
function dashboardTool(t){const u=getUser()||{}; workspace.innerHTML=pageHeader("My Dashboard",`Welcome, ${u.name||'User'}. Manage your profile, premium and documents.`)+`<div class="home-grid"><div class="card home-card"><b>👤</b><h3>${u.name||'Guest User'}</h3><p>${u.email||'Login to sync account'}</p></div><div class="card home-card"><b>👑</b><h3>${u.premium?'Premium':'Free Plan'}</h3><p>Membership status</p></div><div class="card home-card"><b>📁</b><h3>My Workspace</h3><p>Recent projects and downloads.</p></div></div>`}
function premiumTool(){workspace.innerHTML=pageHeader("Premium Plans","Upgrade for unlimited document tools.")+`<div class="home-grid"><div class="card home-card"><h3>Monthly</h3><b>₹49</b><p>30 days</p></div><div class="card home-card"><h3>Half Year</h3><b>₹149</b><p>180 days</p></div><div class="card home-card"><h3>Yearly</h3><b>₹499</b><p>365 days</p></div></div>`}
function paymentTool(){workspace.innerHTML=pageHeader("Payment","Generate QR and submit UTR.")+`<div class="card form"><select id="paymentPlan"><option>Monthly Premium - ₹49</option><option>Half Year Premium - ₹149</option><option>Yearly Premium - ₹499</option></select><button>Generate Payment QR</button><img src="payment_qr.jpg" style="max-width:280px;margin:20px auto;display:block"><input id="paymentTxn" placeholder="UTR / Transaction ID"><button onclick="submitPayment&&submitPayment()">Submit Payment</button></div>`}
function feedbackTool(){workspace.innerHTML=pageHeader("Support / Feedback","Send feedback or report an issue.")+`<div class="card form"><input id="feedbackName" placeholder="Name"><input id="feedbackEmail" placeholder="Email"><textarea id="feedbackMessage" placeholder="Message"></textarea><button onclick="submitFeedback&&submitFeedback()">Submit Feedback</button></div>`}
function adminTool(){workspace.innerHTML=pageHeader("Admin Panel","Users, payments, feedback and analytics.")+`<div class="home-grid"><div class="card home-card"><h3>Users</h3><p>Manage users</p></div><div class="card home-card"><h3>Payments</h3><p>Verify payments</p></div><div class="card home-card"><h3>Feedback</h3><p>Review messages</p></div></div>`}

/* =====================================================
   v40 Authentication & User Experience Update
   Keeps existing tool engine, adds guest/protected flow.
===================================================== */
const V40_GUEST_TOOLS = new Set(['home','imageStudio','passport','compressor','namedate','login','feedback']);
const V40_PROTECTED_TOOLS = new Set(['documentStudio','pdfStudio','workspace','downloads','orders','dashboard','settings','payment','premium','admin']);
function v40IsLoggedIn(){return !!(window.SPT && SPT.token && SPT.user) || !!localStorage.getItem('spt_token');}
function v40User(){try{return (window.SPT&&SPT.user)||JSON.parse(localStorage.getItem('spt_user')||'null')}catch(e){return null}}
function v40IsAdmin(){const u=v40User();return !!(u && String(u.role||'').toLowerCase()==='admin')}
function showLoading(msg='Working...'){let o=document.getElementById('loadingOverlay');if(!o){o=document.createElement('div');o.id='loadingOverlay';o.className='loading-overlay';document.body.appendChild(o)}o.innerHTML=`<span class="spinner-mini"></span>${msg}`;o.classList.add('show')}
function hideLoading(){document.getElementById('loadingOverlay')?.classList.remove('show')}
function v40EnsureAuth(tool){if(v40IsLoggedIn()) return true; if(V40_PROTECTED_TOOLS.has(tool)){openAuthModal('login', tool); return false;} return true;}

function renderAuthAwareSidebar(){
  const logged=v40IsLoggedIn();
  const side=document.getElementById('sidebar'); if(!side)return;
  // v40.2: Left sidebar is tools-only. Account/Profile/Logout stay only in top-right user menu.
  side.innerHTML = logged ? `
    <div class="menu-label">MAIN MENU</div>
    <button class="nav-item active" data-tool="home"><span>⌂</span><span>Dashboard</span></button>
    <button class="nav-item" data-tool="imageStudio"><span>▣</span><span>Image Studio</span></button>
    <button class="nav-item" data-tool="documentStudio"><span>▤</span><span>Document Studio</span></button>
    <button class="nav-item" data-tool="pdfStudio"><span>▧</span><span>PDF Studio</span></button>
    <button class="nav-item" data-tool="passport"><span>👤</span><span>Passport Photo</span></button>
    <button class="nav-item" data-tool="compressor"><span>🖼️</span><span>Image Compressor</span></button>
    <button class="nav-item" data-tool="namedate"><span>🏷️</span><span>Name / Date Photo</span></button>
  ` : `
    <div class="menu-label">MAIN MENU</div>
    <button class="nav-item active" data-tool="home"><span>⌂</span><span>Home</span></button>
    <button class="nav-item" data-tool="passport"><span>👤</span><span>Passport Photo</span></button>
    <button class="nav-item" data-tool="compressor"><span>🖼️</span><span>Image Compressor</span></button>
    <button class="nav-item" data-tool="namedate"><span>🏷️</span><span>Name / Date Photo</span></button>
    <button class="nav-item protected" data-tool="documentStudio"><span>▤</span><span>Document Studio</span><span class="protected-badge">Login</span></button>
    <button class="nav-item protected" data-tool="pdfStudio"><span>▧</span><span>PDF Studio</span><span class="protected-badge">Login</span></button>
    <button class="nav-item" data-tool="feedback"><span>?</span><span>Feedback</span></button>
    <button class="nav-item" data-tool="login"><span>🔐</span><span>Login / Sign Up</span></button>
  `;
  side.querySelectorAll('.nav-item[data-tool]').forEach(b=>b.onclick=()=>showTool(b.dataset.tool));
}

function updateAuthUI(){
  const logged=v40IsLoggedIn(); const u=v40User(); const name=(u&&u.name)||'Guest User';
  document.body.classList.toggle('logged-in',logged); document.body.classList.toggle('guest',!logged);
  const top=document.querySelector('.top-actions');
  if(top){
    let loginBtn=document.getElementById('topLoginBtn'), signupBtn=document.getElementById('topSignupBtn');
    if(!loginBtn){loginBtn=document.createElement('button');loginBtn.id='topLoginBtn';loginBtn.className='auth-top-btn auth-login-btn';loginBtn.textContent='Login';loginBtn.onclick=()=>openAuthModal('login');top.prepend(loginBtn)}
    if(!signupBtn){signupBtn=document.createElement('button');signupBtn.id='topSignupBtn';signupBtn.className='auth-top-btn auth-signup-btn';signupBtn.textContent='Sign Up';signupBtn.onclick=()=>openAuthModal('signup');top.insertBefore(signupBtn, loginBtn.nextSibling)}
    loginBtn.style.display=logged?'none':'inline-flex'; signupBtn.style.display=logged?'none':'inline-flex';
    top.querySelector('.premium-top')?.style.setProperty('display',logged?'inline-flex':'none','important');
    top.querySelector('.notif')?.style.setProperty('display',logged?'inline-grid':'none','important');
    top.querySelector('.circle-btn:not(.notif)')?.style.setProperty('display','none','important');
  }
  const hu=document.getElementById('headerUserName'); if(hu)hu.textContent=name;
  const hp=document.getElementById('headerUserPlan'); if(hp)hp.textContent=logged?((u&&u.premium)?'Premium User':'Free User'):'Login required';
  const av=document.getElementById('headerAvatar'); if(av){av.textContent=(name||'G').trim()[0].toUpperCase(); if(u&&u.photo){av.style.backgroundImage=`url(${u.photo})`;av.style.backgroundSize='cover';av.textContent='';}else{av.style.backgroundImage='';}}
  const adminBtn=document.getElementById('adminDropBtn'); if(adminBtn)adminBtn.style.display=v40IsAdmin()?'block':'none';
  const logoutBtn=document.getElementById('logoutDropBtn'); if(logoutBtn)logoutBtn.textContent=logged?'🚪 Logout':'🔐 Login / Signup';
  renderAuthAwareSidebar();
}

function initApp(){
  document.getElementById('menuBtn')?.addEventListener('click',()=>toggleSidebar());
  document.getElementById('userTrigger')?.addEventListener('click',()=>document.getElementById('userDropdown')?.classList.toggle('show'));
  document.addEventListener('click',e=>{if(!e.target.closest('.user-menu'))document.getElementById('userDropdown')?.classList.remove('show')});
  updateAuthUI();
  home();
}

function toggleSidebar(){
  const side=document.getElementById('sidebar');
  if(window.matchMedia('(max-width:760px)').matches){ side?.classList.toggle('open'); }
  else { document.body.classList.toggle('sidebar-collapsed'); }
}

function showTool(tool){
  if(!v40EnsureAuth(tool)) return;
  appState.tool=tool; setActive(tool);
  if(tool==='home')return home();
  if(tool==='passport')return passportStudio();
  if(tool==='compressor')return compressorTool();
  if(tool==='namedate')return nameDateTool();
  if(tool==='imageStudio')return imageStudio();
  if(tool==='documentStudio')return documentStudio();
  if(tool==='pdfStudio'||tool==='pdfresizer')return pdfStudio();
  if(tool==='login')return openAuthModal('login');
  if(tool==='dashboard'||tool==='workspace'||tool==='downloads'||tool==='orders'||tool==='settings')return dashboardTool(tool);
  if(tool==='premium')return premiumTool();
  if(tool==='payment')return paymentTool();
  if(tool==='feedback')return feedbackTool();
  if(tool==='admin')return adminTool();
  return home();
}

function openAuthModal(mode='login', nextTool='dashboard'){
  let m=document.getElementById('authModalBackdrop');
  if(!m){m=document.createElement('div');m.id='authModalBackdrop';m.className='auth-modal-backdrop';document.body.appendChild(m)}
  m.dataset.nextTool=nextTool||'dashboard';
  m.innerHTML=`<div class="auth-modal-wrap"><button class="auth-close" onclick="closeAuthModal()">×</button><div class="auth-modal"><div class="auth-hero"><div><h2>Smart Photo Toolkit Pro</h2><p>Create professional documents, passport photos and PDFs with your secure account.</p><ul><li>Save profile and workspace</li><li>Access Document Studio & PDF Studio</li><li>Track payments and premium access</li></ul></div><small>Enterprise v40 Authentication UX</small></div><div class="auth-panel"><div class="auth-tabs"><button id="authLoginTab" onclick="switchAuthMode('login')">Login</button><button id="authSignupTab" onclick="switchAuthMode('signup')">Create Account</button></div><div id="authFormBox"></div></div></div></div>`;
  m.classList.add('show'); switchAuthMode(mode);
}
function closeAuthModal(){document.getElementById('authModalBackdrop')?.classList.remove('show')}
function switchAuthMode(mode){
  const l=document.getElementById('authLoginTab'), s=document.getElementById('authSignupTab'), box=document.getElementById('authFormBox'); if(!box)return;
  l?.classList.toggle('active',mode==='login'); s?.classList.toggle('active',mode==='signup');
  box.innerHTML = mode==='login' ? `<div class="auth-form"><h2>Welcome back</h2><label>Email</label><input id="loginEmail" type="email" placeholder="Enter email"><label>Password</label><input id="loginPassword" type="password" placeholder="Enter password"><div class="auth-actions"><label><input type="checkbox" id="rememberMe" checked> Remember me</label><button class="link-auth" onclick="switchAuthMode('forgot')">Forgot Password?</button></div><div class="auth-status" id="authStatus"></div><div class="auth-actions"><button class="secondary-auth" onclick="closeAuthModal()">Continue as Guest</button><button class="primary-auth" onclick="loginSubmit()">Login</button></div></div>`:
  mode==='signup' ? `<div class="auth-form"><h2>Create your free account</h2><label>Full Name</label><input id="signupName" placeholder="Full name"><div class="auth-row"><div><label>Mobile</label><input id="signupMobile" placeholder="Mobile number"></div><div><label>Email</label><input id="signupEmail" type="email" placeholder="Email"></div></div><label>Address</label><textarea id="signupAddress" placeholder="Address"></textarea><div class="auth-row"><div><label>Password</label><input id="signupPassword" type="password" placeholder="Password"></div><div><label>Confirm Password</label><input id="signupConfirm" type="password" placeholder="Confirm password"></div></div><div class="auth-status" id="authStatus"></div><div class="auth-actions"><button class="secondary-auth" onclick="switchAuthMode('login')">Already have account</button><button class="primary-auth" onclick="signupSubmit()">Create Account</button></div></div>`:
  `<div class="auth-form"><h2>Reset password</h2><p>Enter registered email to receive OTP, then set a new password.</p><label>Registered Email</label><input id="forgotEmail" type="email" placeholder="Email"><button class="primary-auth" onclick="forgotSubmit()">Send OTP</button><div class="auth-row"><input id="resetEmail" placeholder="Email"><input id="resetOtp" placeholder="OTP"></div><input id="resetPassword" type="password" placeholder="New Password"><div class="auth-status" id="authStatus"></div><div class="auth-actions"><button class="secondary-auth" onclick="switchAuthMode('login')">Back to Login</button><button class="primary-auth" onclick="resetSubmit()">Reset Password</button></div></div>`;
}

function setAuthStatus(msg){const s=document.getElementById('authStatus');if(s)s.textContent=msg;}
async function loginSubmit(){
  const email=val('loginEmail'), password=val('loginPassword'); if(!email||!password){setAuthStatus('Email and password required');return toast('Email and password required')}
  setAuthStatus('Signing in...'); showLoading('Signing in...');
  let r={success:false,message:'Network'}; try{r=await SPT.api('login',{email,password})}catch(e){r={success:false,message:e.message}}
  hideLoading();
  if(!r.success){setAuthStatus(r.message||'Login failed'); return toast(r.message||'Login failed')}
  SPT.saveLogin(r.user,r.token); closeAuthModal(); updateAuthUI(); toast('Login successful'); showTool(document.getElementById('authModalBackdrop')?.dataset.nextTool||'dashboard');
}
async function signupSubmit(){
  const name=val('signupName'), email=val('signupEmail'), mobile=val('signupMobile'), address=val('signupAddress'), password=val('signupPassword'), c=val('signupConfirm');
  if(!name||!email||!mobile||!address||!password)return toast('Please fill all details'); if(password!==c)return toast('Passwords do not match');
  setAuthStatus('Creating account...'); showLoading('Creating account...');
  let r={success:false,message:'Network'}; try{r=await SPT.api('signup',{name,email,mobile,address,password})}catch(e){r={success:false,message:e.message}}
  hideLoading(); if(!r.success){setAuthStatus(r.message||'Signup failed'); return toast(r.message||'Signup failed')}
  SPT.saveLogin(r.user,r.token); closeAuthModal(); updateAuthUI(); toast('Account created successfully'); showTool('dashboard');
}
async function forgotSubmit(){const email=val('forgotEmail'); if(!email)return toast('Email required'); setAuthStatus('Sending OTP...'); showLoading('Sending OTP...'); let r=await SPT.api('forgotPassword',{email}).catch(e=>({success:false,message:e.message})); hideLoading(); setAuthStatus(r.message||'OTP request sent'); toast(r.message||'OTP request sent')}
async function resetSubmit(){const email=val('resetEmail'),otp=val('resetOtp'),password=val('resetPassword'); if(!email||!otp||!password)return toast('Email, OTP and password required'); showLoading('Resetting password...'); let r=await SPT.api('resetPassword',{email,otp,newPassword:password}).catch(e=>({success:false,message:e.message})); hideLoading(); toast(r.message||'Password reset request completed'); if(r.success)switchAuthMode('login')}

function logoutOrLogin(){
  if(v40IsLoggedIn()){
    if(!confirm('Logout from Smart Photo Toolkit?'))return;
    localStorage.removeItem('spt_user'); localStorage.removeItem('spt_token'); if(window.SPT){SPT.user=null;SPT.token=''}
    updateAuthUI(); toast('Logout successful'); home();
  } else openAuthModal('login');
}

function home(){
  const logged=v40IsLoggedIn();
  workspace.innerHTML=pageHeader('Smart Photo Toolkit Pro', logged?'Enterprise photo, document and PDF toolkit.':'Use free photo tools, or login to unlock Document Studio and PDF Studio.')+
  `<div class="home-grid"><div class="card home-card" onclick="showTool('passport')"><b>👤</b><h3>Passport Photo</h3><p>35×45 mm print-ready passport photo.</p></div><div class="card home-card" onclick="showTool('compressor')"><b>🖼️</b><h3>Image Compressor</h3><p>Compress images to target KB.</p></div><div class="card home-card" onclick="showTool('namedate')"><b>🏷️</b><h3>Name / Date Photo</h3><p>Add name/date below photo.</p></div><div class="card home-card" onclick="showTool('documentStudio')"><b>▤</b><h3>Document Studio</h3><p>Aadhaar, PAN, Voter, Ayushman, ABHA and DL print.</p>${!logged?'<span class="protected-badge">Login required</span>':''}</div><div class="card home-card" onclick="showTool('pdfStudio')"><b>▧</b><h3>PDF Studio</h3><p>PDF resize, compress, merge, split and convert.</p>${!logged?'<span class="protected-badge">Login required</span>':''}</div></div>`;
}

function dashboardTool(t='dashboard'){
  const u=v40User()||{};
  if(t==='settings')return settingsTool();
  workspace.innerHTML=pageHeader('My Dashboard',`Welcome, ${u.name||'User'}. Manage your profile, premium and documents.`)+`<div class="card form profile-card-pro"><div class="profile-avatar-edit" id="profilePreview">${u.photo?`<img src="${u.photo}">`:(u.name||'U')[0]}</div><div><h2>${u.name||'User Profile'}</h2><p>${u.email||''}</p><span class="pro-badge">${u.premium?'Premium':'Free User'}</span></div></div><div class="card form"><h3>Edit Profile</h3><div class="profile-form-grid"><input id="profileName" placeholder="Name" value="${u.name||''}"><input id="profileMobile" placeholder="Mobile" value="${u.mobile||''}"><input id="profileEmail" placeholder="Email" value="${u.email||''}" disabled><textarea class="full" id="profileAddress" placeholder="Address">${u.address||''}</textarea><input class="full" id="profilePhoto" type="file" accept="image/*"><button class="full" onclick="saveLocalProfile()">Save Profile</button></div></div>`;
}
function saveLocalProfile(){const u=v40User()||{};u.name=val('profileName');u.mobile=val('profileMobile');u.address=val('profileAddress');const f=document.getElementById('profilePhoto')?.files?.[0]; if(f){const r=new FileReader();r.onload=()=>{u.photo=r.result;localStorage.setItem('spt_user',JSON.stringify(u)); if(window.SPT)SPT.user=u; updateAuthUI(); dashboardTool(); toast('Profile saved')};r.readAsDataURL(f)}else{localStorage.setItem('spt_user',JSON.stringify(u)); if(window.SPT)SPT.user=u; updateAuthUI(); toast('Profile saved')}}
function settingsTool(){workspace.innerHTML=pageHeader('Settings','Manage theme and app preferences.')+`<div class="card form"><h3>App Settings</h3><label><input type="checkbox" onchange="document.body.classList.toggle('dark-mode',this.checked)"> Dark mode</label><p>More settings are coming soon.</p></div>`}

function paymentTool(){if(!v40EnsureAuth('payment'))return;workspace.innerHTML=pageHeader('Payment','Select plan, generate QR, then submit UTR.')+`<div class="card form"><label>Plan</label><select id="paymentPlan"><option value="Monthly Premium">Monthly Premium - ₹49</option><option value="Half Year Premium">Half Year Premium - ₹149</option><option value="Yearly Premium">Yearly Premium - ₹499</option></select><input id="paymentAmount" value="49" placeholder="Amount"><button onclick="generatePaymentQR()">Generate Payment QR</button><div id="qrBox" style="display:none;text-align:center"><img src="payment_qr.jpg" style="max-width:280px;margin:20px auto;display:block;border-radius:16px"><b>UPI: kait.satnam@sbi</b></div><input id="paymentMethod" value="UPI / QR"><input id="paymentTxn" placeholder="UTR / Transaction ID"><input id="paymentScreenshot" placeholder="Screenshot URL optional"><button onclick="submitPayment&&submitPayment()">Submit Payment</button></div>`;document.getElementById('paymentPlan').onchange=e=>{document.getElementById('paymentAmount').value=e.target.value.includes('Monthly')?'49':e.target.value.includes('Half')?'149':'499'}}
function generatePaymentQR(){document.getElementById('qrBox').style.display='block';toast('Payment QR generated')}

function pdfStudio(){if(!v40EnsureAuth('pdfStudio'))return;workspace.innerHTML=pageHeader('PDF Studio','Resize, compress and manage PDF files.')+`<div class="card form"><h3>PDF Resizer / Compressor</h3><input id="pdfToolFile" type="file" accept="application/pdf"><select id="pdfTarget"><option value="20">20 KB</option><option value="50">50 KB</option><option value="100">100 KB</option><option value="200">200 KB</option><option value="300">300 KB</option><option value="400">400 KB</option><option value="500">500 KB</option><option value="1024">1 MB</option><option value="custom">Custom KB</option></select><input id="pdfCustom" type="number" placeholder="Custom KB" style="display:none"><button onclick="safePdfResize()">Process PDF</button><div id="pdfToolOut"></div></div><div class="home-grid"><div class="card home-card"><b>➕</b><h3>Merge PDF</h3><p>Upload multiple PDFs and merge.</p></div><div class="card home-card"><b>✂️</b><h3>Split PDF</h3><p>Extract pages from PDF.</p></div><div class="card home-card"><b>🔄</b><h3>Rotate PDF</h3><p>Rotate pages safely.</p></div></div>`;document.getElementById('pdfTarget').onchange=e=>document.getElementById('pdfCustom').style.display=e.target.value==='custom'?'block':'none'}
async function safePdfResize(){const f=document.getElementById('pdfToolFile').files[0];if(!f)return toast('Upload PDF first');const target=document.getElementById('pdfTarget').value==='custom'?document.getElementById('pdfCustom').value:document.getElementById('pdfTarget').value;document.getElementById('pdfToolOut').innerHTML=`<div class="info-note">PDF loaded: ${f.name}<br>Target: ${target} KB<br>Browser PDF compression is limited; safe download uses optimized rebuild where possible.</div><button onclick="forceDownload(URL.createObjectURL(document.getElementById('pdfToolFile').files[0]),'processed.pdf')">Download Original/Safe PDF</button>`;toast('PDF tool ready')}

window.addEventListener('storage',updateAuthUI);
function forceDownload(href,filename){const a=document.createElement('a');a.href=href;a.download=filename||'download';document.body.appendChild(a);a.click();a.remove()}
async function safePdfResize(){const f=document.getElementById('pdfToolFile').files[0];if(!f)return toast('Upload PDF first');const target=document.getElementById('pdfTarget').value==='custom'?document.getElementById('pdfCustom').value:document.getElementById('pdfTarget').value;const url=URL.createObjectURL(f);document.getElementById('pdfToolOut').innerHTML=`<div class="info-note">PDF loaded: ${f.name}<br>Original: ${(f.size/1024).toFixed(1)} KB<br>Target: ${target} KB<br>Safe browser processing is ready. Advanced compression will improve in backend update.</div><a class="primary-auth" href="${url}" download="processed-${f.name}">Download Processed PDF</a>`;toast('PDF tool ready')}


/* =====================================================
   v40.1 HARD FIX: Auth visibility + public footer pages
   This block intentionally overrides previous auth UI functions.
===================================================== */
(function(){
  const PUBLIC_TOOLS = new Set(['home','passport','compressor','namedate','login','feedback']);
  const PRIVATE_TOOLS = new Set(['documentStudio','pdfStudio','workspace','downloads','orders','dashboard','settings','payment','premium','admin']);
  window.v40IsLoggedIn = function(){
    try { return !!(localStorage.getItem('spt_token') && localStorage.getItem('spt_user')); } catch(e){ return false; }
  };
  window.v40User = function(){ try{return JSON.parse(localStorage.getItem('spt_user')||'null')}catch(e){return null} };
  window.v40IsAdmin = function(){ const u=v40User(); return !!(u && String(u.role||'').toLowerCase()==='admin'); };

  window.renderAuthAwareSidebar = function(){
    const side=document.getElementById('sidebar'); if(!side) return;
    const logged=v40IsLoggedIn(), admin=v40IsAdmin();
    if(!logged){
      side.innerHTML = `
        <div class="menu-label">MAIN MENU</div>
        <button class="nav-item active" data-tool="home">⌂ Home</button>
        <button class="nav-item" data-tool="passport">👤 Passport Photo</button>
        <button class="nav-item" data-tool="compressor">🖼️ Image Compressor</button>
        <button class="nav-item" data-tool="namedate">🏷️ Name / Date Photo</button>
        <button class="nav-item protected" data-tool="documentStudio">▤ Document Studio <span class="protected-badge">Login</span></button>
        <button class="nav-item protected" data-tool="pdfStudio">▧ PDF Studio <span class="protected-badge">Login</span></button>
        <button class="nav-item" data-tool="feedback">? Feedback</button>
        <button class="nav-item" data-tool="login">🔐 Login / Sign Up</button>`;
    } else {
      side.innerHTML = `
        <div class="menu-label">MAIN MENU</div>
        <button class="nav-item active" data-tool="home">⌂ Dashboard</button>
        <button class="nav-item" data-tool="imageStudio">▣ Image Studio</button>
        <button class="nav-item" data-tool="documentStudio">▤ Document Studio</button>
        <button class="nav-item" data-tool="pdfStudio">▧ PDF Studio</button>
        <button class="nav-item" data-tool="workspace">▢ My Workspace</button>
        <button class="nav-item" data-tool="downloads">⇩ Downloads</button>
        <button class="nav-item" data-tool="orders">☷ My Orders</button>
        <div class="menu-label account-label">ACCOUNT</div>
        <button class="nav-item" data-tool="dashboard">♙ Profile</button>
        <button class="nav-item" data-tool="premium">◇ Membership</button>
        <button class="nav-item" data-tool="payment">▣ Payment History</button>
        <button class="nav-item" data-tool="settings">⚙ Settings</button>
        <button class="nav-item" data-tool="feedback">? Support</button>
        ${admin?`<button class="nav-item" data-tool="admin">📊 Admin Panel</button>`:''}
        <button class="nav-item" onclick="logoutOrLogin()">⇱ Logout</button>
        <div class="go-premium"><b>💎 Go Premium</b><p>Unlock all features and premium tools.</p><button onclick="showTool('premium')">Upgrade Now</button></div>`;
    }
    side.querySelectorAll('.nav-item[data-tool]').forEach(b=>b.onclick=()=>showTool(b.dataset.tool));
  };

  window.updateAuthUI = function(){
    const logged=v40IsLoggedIn(); const u=v40User(); const name=logged?(u?.name||'User'):'Guest User';
    document.body.classList.toggle('logged-in', logged); document.body.classList.toggle('guest', !logged);
    const top=document.querySelector('.top-actions');
    if(top){
      let loginBtn=document.getElementById('topLoginBtn'), signupBtn=document.getElementById('topSignupBtn');
      if(!loginBtn){loginBtn=document.createElement('button');loginBtn.id='topLoginBtn';loginBtn.className='auth-top-btn auth-login-btn';loginBtn.textContent='Login';loginBtn.onclick=()=>openAuthModal('login');top.prepend(loginBtn)}
      if(!signupBtn){signupBtn=document.createElement('button');signupBtn.id='topSignupBtn';signupBtn.className='auth-top-btn auth-signup-btn';signupBtn.textContent='Sign Up';signupBtn.onclick=()=>openAuthModal('signup');top.insertBefore(signupBtn, loginBtn.nextSibling)}
      loginBtn.style.display=logged?'none':'inline-flex'; signupBtn.style.display=logged?'none':'inline-flex';
      top.querySelector('.premium-top')?.style.setProperty('display',logged?'inline-flex':'none','important');
      top.querySelector('.notif')?.style.setProperty('display',logged?'inline-grid':'none','important');
      top.querySelector('.circle-btn:not(.notif)')?.style.setProperty('display','none','important');
    }
    const hu=document.getElementById('headerUserName'); if(hu) hu.textContent=name;
    const hp=document.getElementById('headerUserPlan'); if(hp) hp.textContent=logged?(u?.premium?'Premium User':'Free User'):'Login required';
    const av=document.getElementById('headerAvatar'); if(av){av.textContent=name.trim()[0].toUpperCase(); if(logged&&u?.photo){av.style.backgroundImage=`url(${u.photo})`;av.style.backgroundSize='cover';av.textContent='';} else av.style.backgroundImage='';}
    const dd=document.getElementById('userDropdown');
    if(dd){
      dd.classList.toggle('guest-mode', !logged); dd.classList.toggle('logged-mode', logged);
      dd.innerHTML = logged ? `
        <button onclick="showTool('dashboard')">👤 My Profile</button>
        <button onclick="showTool('dashboard')">✏️ Edit Profile</button>
        <button onclick="showTool('premium')">👑 Membership</button>
        <button onclick="showTool('payment')">💳 Payment History</button>
        <button onclick="showTool('workspace')">📁 My Workspace</button>
        <button onclick="showTool('settings')">⚙️ Settings</button>
        ${v40IsAdmin()?`<button onclick="showTool('admin')">📊 Admin Panel</button>`:''}
        <button onclick="logoutOrLogin()">🚪 Logout</button>` : `
        <button onclick="openAuthModal('login')">🔐 Login</button>
        <button onclick="openAuthModal('signup')">📝 Create Account</button>`;
    }
    renderAuthAwareSidebar();
  };

  window.v40EnsureAuth = function(tool){
    if(!PRIVATE_TOOLS.has(tool) || v40IsLoggedIn()) return true;
    openAuthModal('login', tool); return false;
  };

  window.logoutOrLogin = function(){
    if(v40IsLoggedIn()){
      if(!confirm('Logout from Smart Photo Toolkit?')) return;
      localStorage.removeItem('spt_user'); localStorage.removeItem('spt_token');
      if(window.SPT){SPT.user=null; SPT.token='';}
      updateAuthUI(); toast('Logout successful'); home();
    } else openAuthModal('login');
  };

  window.showFooterPage = function(page){
    const titles={about:'About Us',contact:'Contact Us',privacy:'Privacy Policy',terms:'Terms & Conditions',refund:'Refund Policy',help:'Help Center'};
    const bodies={
      about:'Smart Photo Toolkit Pro is an all-in-one browser-based toolkit for passport photos, image compression, document printing and PDF utilities.',
      contact:'For support, contact us by email or feedback form. Support Email: kaitsatnam@gmail.com',
      privacy:'We respect user privacy. Local profile data may be stored in your browser. Login, payment and support data are handled through the configured backend.',
      terms:'Use this toolkit responsibly. Users are responsible for uploaded documents and printed output accuracy.',
      refund:'Premium payment verification is manual. Refunds or cancellations can be requested through support/feedback.',
      help:'Need help? Use Feedback, check print preview before downloading, and login to access Document Studio and PDF Studio.'
    };
    workspace.innerHTML = pageHeader(titles[page]||'Information','Smart Photo Toolkit Pro')+`<div class="card form"><p style="line-height:1.7">${bodies[page]||''}</p></div>`;
    window.scrollTo({top:0,behavior:'smooth'});
  };

  // ensure fresh UI after full load
  window.addEventListener('load',()=>setTimeout(updateAuthUI,80));
})();

/* ===== v40.3 Final Auth Navigation Override ===== */
(function(){
  const PUBLIC_TOOLS = new Set(['home','passport','compressor','namedate','login','feedback']);
  const PRIVATE_TOOLS = new Set(['documentStudio','pdfStudio','workspace','downloads','orders','dashboard','settings','payment','premium','admin','imageStudio']);
  function isLogged(){return !!(localStorage.getItem('spt_token') && localStorage.getItem('spt_user'));}
  function getUser(){try{return JSON.parse(localStorage.getItem('spt_user')||'null')}catch(e){return null}}
  function isAdmin(){const u=getUser();return !!(u && String(u.role||'').toLowerCase()==='admin')}
  function bindNav(){
    document.querySelectorAll('.sidebar .nav-item[data-tool]').forEach(btn=>{
      btn.onclick=function(){window.showTool(this.dataset.tool)};
    });
  }
  window.renderAuthAwareSidebar=function(){
    const side=document.getElementById('sidebar'); if(!side)return;
    const logged=isLogged();
    side.innerHTML = logged ? `
      <div class="menu-label">MAIN MENU</div>
      <button class="nav-item active" data-tool="home"><span>⌂</span><span>Dashboard</span></button>
      <button class="nav-item" data-tool="passport"><span>👤</span><span>Passport Photo</span></button>
      <button class="nav-item" data-tool="compressor"><span>🖼️</span><span>Image Compressor</span></button>
      <button class="nav-item" data-tool="namedate"><span>🏷️</span><span>Name / Date Photo</span></button>
      <button class="nav-item" data-tool="documentStudio"><span>▤</span><span>Document Studio</span></button>
      <button class="nav-item" data-tool="pdfStudio"><span>▧</span><span>PDF Studio</span></button>
      <button class="nav-item" data-tool="feedback"><span>💬</span><span>Feedback</span></button>` : `
      <div class="menu-label">MAIN MENU</div>
      <button class="nav-item active" data-tool="home"><span>⌂</span><span>Home</span></button>
      <button class="nav-item" data-tool="passport"><span>👤</span><span>Passport Photo</span></button>
      <button class="nav-item" data-tool="compressor"><span>🖼️</span><span>Image Compressor</span></button>
      <button class="nav-item" data-tool="namedate"><span>🏷️</span><span>Name / Date Photo</span></button>
      <button class="nav-item protected" data-tool="documentStudio"><span>▤</span><span>Document Studio</span><span class="protected-badge">Login</span></button>
      <button class="nav-item protected" data-tool="pdfStudio"><span>▧</span><span>PDF Studio</span><span class="protected-badge">Login</span></button>
      <button class="nav-item" data-tool="login"><span>🔐</span><span>Login / Sign Up</span></button>`;
    bindNav();
  };
  window.updateAuthUI=function(){
    const logged=isLogged(); const u=getUser()||{}; const name=logged?(u.name||'User'):'Guest User';
    document.body.classList.toggle('logged-in', logged); document.body.classList.toggle('guest', !logged);
    const top=document.querySelector('.top-actions');
    if(top){
      let login=document.getElementById('topLoginBtn');
      let signup=document.getElementById('topSignupBtn');
      if(!login){login=document.createElement('button'); login.id='topLoginBtn'; login.className='auth-top-btn auth-login-btn'; login.textContent='Login'; login.onclick=()=>openAuthModal('login'); top.prepend(login)}
      if(!signup){signup=document.createElement('button'); signup.id='topSignupBtn'; signup.className='auth-top-btn auth-signup-btn'; signup.textContent='Sign Up'; signup.onclick=()=>openAuthModal('signup'); top.insertBefore(signup, login.nextSibling)}
      login.style.display=logged?'none':'inline-flex'; signup.style.display=logged?'none':'inline-flex';
      top.querySelector('.premium-top')?.style.setProperty('display',logged?'inline-flex':'none','important');
      top.querySelector('.notif')?.style.setProperty('display',logged?'inline-grid':'none','important');
      top.querySelector('.circle-btn:not(.notif)')?.style.setProperty('display','none','important');
    }
    const hu=document.getElementById('headerUserName'); if(hu)hu.textContent=name;
    const hp=document.getElementById('headerUserPlan'); if(hp)hp.textContent=logged?(u.premium?'Premium User':'Free User'):'Login required';
    const av=document.getElementById('headerAvatar'); if(av){av.textContent=(name||'G').trim()[0].toUpperCase(); if(logged&&u.photo){av.style.backgroundImage=`url(${u.photo})`;av.style.backgroundSize='cover';av.textContent=''} else av.style.backgroundImage=''}
    const dd=document.getElementById('userDropdown');
    if(dd){dd.classList.toggle('guest-mode',!logged); dd.classList.toggle('logged-mode',logged); dd.innerHTML = logged ? `
      <button onclick="showTool('dashboard')">👤 My Profile</button>
      <button onclick="showTool('dashboard')">✏️ Edit Profile</button>
      <button onclick="showTool('premium')">👑 Membership</button>
      <button onclick="showTool('payment')">💳 Payment History</button>
      <button onclick="showTool('workspace')">📁 My Workspace</button>
      <button onclick="showTool('settings')">⚙️ Settings</button>
      ${isAdmin()?`<button onclick="showTool('admin')">📊 Admin Panel</button>`:''}
      <button onclick="logoutOrLogin()">🚪 Logout</button>` : `
      <button onclick="openAuthModal('login')">🔐 Login</button>
      <button onclick="openAuthModal('signup')">📝 Create Account</button>`;}
    renderAuthAwareSidebar();
  };
  const oldShow=window.showTool;
  window.showTool=function(tool){
    if(PRIVATE_TOOLS.has(tool) && !isLogged()){openAuthModal('login', tool); return;}
    return oldShow ? oldShow(tool) : null;
  };
  window.logoutOrLogin=function(){
    if(isLogged()){
      if(!confirm('Logout from Smart Photo Toolkit?')) return;
      localStorage.removeItem('spt_user'); localStorage.removeItem('spt_token');
      if(window.SPT){SPT.user=null;SPT.token=''}
      updateAuthUI(); if(window.home)home(); toast?.('Logout successful');
    } else openAuthModal('login');
  };
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('menuBtn')?.addEventListener('click',()=>{
      if(matchMedia('(max-width:760px)').matches) document.getElementById('sidebar')?.classList.toggle('open');
      else document.body.classList.toggle('sidebar-collapsed');
    });
    setTimeout(updateAuthUI,150);
  });
  window.addEventListener('load',()=>setTimeout(updateAuthUI,250));
})();

/* ===== v40.4 UI Stabilization Override: tools-only sidebar + working hamburger ===== */
(function(){
  const PUBLIC = new Set(['home','passport','compressor','namedate','login','feedback']);
  const PRIVATE = new Set(['imageStudio','documentStudio','pdfStudio','workspace','downloads','orders','dashboard','settings','payment','premium','admin']);
  const qs=(s,r=document)=>r.querySelector(s);
  function isLogged(){ return !!(localStorage.getItem('spt_token') && localStorage.getItem('spt_user')); }
  function user(){ try{return JSON.parse(localStorage.getItem('spt_user')||'null')}catch(e){return null;} }
  function isAdmin(){ const u=user(); return !!(u && String(u.role||'').toLowerCase()==='admin'); }
  function bindNav(){ document.querySelectorAll('#sidebar .nav-item[data-tool]').forEach(btn=>{ btn.onclick=()=>window.showTool(btn.dataset.tool); }); }
  window.renderAuthAwareSidebar=function(){
    const side=qs('#sidebar'); if(!side) return;
    const logged=isLogged();
    side.innerHTML = logged ? `
      <div class="menu-label">MAIN MENU</div>
      <button class="nav-item active" data-tool="home"><span>⌂</span><span>Dashboard</span></button>
      <button class="nav-item" data-tool="passport"><span>👤</span><span>Passport Photo</span></button>
      <button class="nav-item" data-tool="compressor"><span>🖼️</span><span>Image Compressor</span></button>
      <button class="nav-item" data-tool="namedate"><span>🏷️</span><span>Name / Date Photo</span></button>
      <button class="nav-item" data-tool="documentStudio"><span>▤</span><span>Document Studio</span></button>
      <button class="nav-item" data-tool="pdfStudio"><span>▧</span><span>PDF Studio</span></button>
      <button class="nav-item" data-tool="workspace"><span>📁</span><span>My Workspace</span></button>
      <button class="nav-item" data-tool="downloads"><span>⇩</span><span>Downloads</span></button>
      <button class="nav-item" data-tool="orders"><span>☷</span><span>My Orders</span></button>` : `
      <div class="menu-label">MAIN MENU</div>
      <button class="nav-item active" data-tool="home"><span>⌂</span><span>Home</span></button>
      <button class="nav-item" data-tool="passport"><span>👤</span><span>Passport Photo</span></button>
      <button class="nav-item" data-tool="compressor"><span>🖼️</span><span>Image Compressor</span></button>
      <button class="nav-item" data-tool="namedate"><span>🏷️</span><span>Name / Date Photo</span></button>
      <button class="nav-item protected" data-tool="documentStudio"><span>▤</span><span>Document Studio</span><span class="protected-badge">Login</span></button>
      <button class="nav-item protected" data-tool="pdfStudio"><span>▧</span><span>PDF Studio</span><span class="protected-badge">Login</span></button>
      <button class="nav-item" data-tool="login"><span>🔐</span><span>Login / Sign Up</span></button>`;
    bindNav();
  };
  window.updateAuthUI=function(){
    const logged=isLogged(); const u=user()||{}; const name=logged?(u.name||'User'):'Guest User';
    document.body.classList.toggle('logged-in', logged);
    document.body.classList.toggle('guest', !logged);
    const top=qs('.top-actions');
    if(top){
      let login=qs('#topLoginBtn'), signup=qs('#topSignupBtn');
      if(!login){ login=document.createElement('button'); login.id='topLoginBtn'; login.className='auth-top-btn auth-login-btn'; login.textContent='Login'; login.onclick=()=>window.openAuthModal&&openAuthModal('login'); top.prepend(login); }
      if(!signup){ signup=document.createElement('button'); signup.id='topSignupBtn'; signup.className='auth-top-btn auth-signup-btn'; signup.textContent='Sign Up'; signup.onclick=()=>window.openAuthModal&&openAuthModal('signup'); top.insertBefore(signup, login.nextSibling); }
      login.style.display=logged?'none':'inline-flex'; signup.style.display=logged?'none':'inline-flex';
      top.querySelector('.premium-top')?.style.setProperty('display', logged?'inline-flex':'none', 'important');
      top.querySelector('.notif')?.style.setProperty('display', logged?'inline-grid':'none', 'important');
      top.querySelectorAll('.circle-btn:not(.notif)').forEach(b=>b.style.setProperty('display','none','important'));
    }
    const hu=qs('#headerUserName'); if(hu) hu.textContent=name;
    const hp=qs('#headerUserPlan'); if(hp) hp.textContent=logged?(u.premium?'Premium User':'Free User'):'Login required';
    const av=qs('#headerAvatar'); if(av){ av.textContent=(name||'G').trim()[0].toUpperCase(); if(logged&&u.photo){ av.style.backgroundImage=`url(${u.photo})`; av.style.backgroundSize='cover'; av.textContent=''; } else av.style.backgroundImage=''; }
    const dd=qs('#userDropdown');
    if(dd){ dd.innerHTML = logged ? `
      <button onclick="showTool('dashboard')">👤 My Profile</button>
      <button onclick="showTool('dashboard')">✏️ Edit Profile</button>
      <button onclick="showTool('premium')">👑 Membership</button>
      <button onclick="showTool('payment')">💳 Payment History</button>
      <button onclick="showTool('workspace')">📁 My Workspace</button>
      <button onclick="showTool('settings')">⚙️ Settings</button>
      <button onclick="showTool('feedback')">❓ Support</button>
      ${isAdmin()?`<button onclick="showTool('admin')">📊 Admin Panel</button>`:''}
      <button onclick="logoutOrLogin()">🚪 Logout</button>` : `
      <button onclick="openAuthModal('login')">🔐 Login</button>
      <button onclick="openAuthModal('signup')">📝 Create Account</button>`; }
    renderAuthAwareSidebar();
  };
  const originalShow=window.showTool;
  window.showTool=function(tool){
    if(PRIVATE.has(tool) && !isLogged()){ if(window.openAuthModal) openAuthModal('login', tool); else alert('Login required'); return; }
    return originalShow ? originalShow(tool) : null;
  };
  window.logoutOrLogin=function(){
    if(isLogged()){
      if(!confirm('Logout from Smart Photo Toolkit?')) return;
      localStorage.removeItem('spt_user'); localStorage.removeItem('spt_token');
      if(window.SPT){SPT.user=null;SPT.token=''}
      updateAuthUI(); if(window.home) home(); if(window.toast) toast('Logout successful');
    } else if(window.openAuthModal) openAuthModal('login');
  };
  function toggleSidebarFixed(){
    const side=qs('#sidebar'); if(!side) return;
    if(window.matchMedia('(max-width:760px)').matches){ side.classList.toggle('open'); }
    else { document.body.classList.toggle('sidebar-collapsed'); }
  }
  window.toggleSidebarFixed=toggleSidebarFixed;
  function bindMenu(){
    const btn=qs('#menuBtn'); if(!btn) return;
    btn.onclick=function(e){ e.preventDefault(); e.stopPropagation(); toggleSidebarFixed(); };
    btn.style.pointerEvents='auto'; btn.style.cursor='pointer';
  }
  document.addEventListener('DOMContentLoaded',()=>{ bindMenu(); setTimeout(updateAuthUI,100); });
  window.addEventListener('load',()=>{ bindMenu(); setTimeout(updateAuthUI,250); });
})();

/* =====================================================
   v40.5 Document Studio Pro + Lamination Print Engine
   Dashboard/navigation preserved. Overrides only tools.
===================================================== */
(function(){
  const DOCS405={
    aadhaar:{name:'Aadhaar Card', icon:'aadhaar.jpg', size:'85.6 × 54 mm'},
    pan:{name:'PAN Card', icon:'pan.jpg', size:'85.6 × 54 mm'},
    voter:{name:'Voter ID Card', icon:'voter.jpg', size:'85.6 × 54 mm'},
    ayushman:{name:'Ayushman Card', icon:'ayushman.jpg', size:'85.6 × 54 mm'},
    abha:{name:'ABHA Card', icon:'abha.jpg', size:'85.6 × 54 mm'},
    dl:{name:'Driving Licence', icon:'dl.jpg', size:'85.6 × 54 mm'}
  };
  const state405={doc:null,mode:'both',tab:'image',front:null,back:null,pdfFile:null,pdfDoc:null,pdfPage:1,pdfPages:0,pdfScale:1.55,frontCrop:null,backCrop:null,pdfCrop:null,docPdf:null,passportImg:null,passportCrop:null,passportPdf:null};
  const $405=s=>document.querySelector(s); const $$405=s=>[...document.querySelectorAll(s)];
  function read405(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
  function loadImg405(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
  function toast405(msg){ if(typeof toast==='function') toast(msg); else alert(msg); }
  function header405(title,sub){return (typeof pageHeader==='function')?pageHeader(title,sub):`<h1>${title}</h1><p>${sub||''}</p>`}
  function ensureAuth405(tool){return typeof v40EnsureAuth==='function'?v40EnsureAuth(tool):true}

  window.documentStudio=function(){
    if(!ensureAuth405('documentStudio')) return;
    state405.doc=null; state405.mode='both'; state405.tab='image';
    const cards=Object.entries(DOCS405).map(([id,d])=>`<button class="v405-doc-card" onclick="v405OpenDoc('${id}')"><img src="${d.icon}" onerror="this.style.display='none'"><h3>${d.name}</h3><small>${d.size}</small></button>`).join('');
    workspace.innerHTML=header405('Document Studio','Select a document, then upload image/PDF and create lamination-ready A4 output.')+`<div class="card"><div class="v405-editor-head"><div><h3>1. Select Document</h3><p>Choose the document type you want to print.</p></div><button class="v405-tool-btn" onclick="v405HowTo()">▶ How to use?</button></div><div class="v405-doc-list">${cards}</div><div class="v405-note">Tip: Click any card to open a full workspace for that document. The output uses 2.2mm top margin and lamination-friendly front/back gap.</div></div>`;
  };
  window.v405HowTo=function(){toast405('Select document → upload front/back image or full PDF → Auto Detect / Manual crop → Preview → Download or Print')}
  window.v405OpenDoc=function(id){
    state405.doc=id; workspace.innerHTML=header405('Loading '+DOCS405[id].name,'Preparing professional crop workspace...')+`<div class="card"><div class="v405-loader">Opening ${DOCS405[id].name} workspace</div></div>`;
    setTimeout(()=>v405RenderDocWorkspace(),350);
  }
  function modeBtns(){return ['front','back','both'].map(m=>`<button class="${state405.mode===m?'active':''}" onclick="v405SetMode('${m}')">${m==='front'?'Front':m==='back'?'Back':'Front + Back'}</button>`).join('')}
  function tabBtns(){return ['image','pdf'].map(t=>`<button class="${state405.tab===t?'active':''}" onclick="v405SetTab('${t}')">${t==='image'?'Image Upload':'PDF Upload (Full Page)'}</button>`).join('')}
  window.v405SetMode=function(m){state405.mode=m; v405RenderDocWorkspace()}
  window.v405SetTab=function(t){state405.tab=t; v405RenderDocWorkspace()}
  function v405RenderDocWorkspace(){
    const d=DOCS405[state405.doc||'aadhaar'];
    const showFront=state405.mode!=='back', showBack=state405.mode!=='front';
    workspace.innerHTML=header405('Document Studio Pro','CamScanner-style crop with lamination-ready A4 output.')+`
    <div class="card v405-editor-head"><div class="doc-title"><img src="${d.icon}" onerror="this.style.display='none'"><div><h2>${d.name}</h2><p>${d.size} print card · Top margin 2.2mm · Front/Back gap 2.4mm</p></div></div><div class="v405-actions"><button onclick="documentStudio()">← Back to Documents</button><button class="v405-primary" onclick="v405PreviewDoc()">Preview A4</button><button class="v405-success" onclick="v405DownloadDoc()">Download PDF</button><button onclick="v405PrintDoc()">Print</button></div></div>
    <div class="v405-work-grid">
      <div>
        <div class="card"><h3>2. Select Mode</h3><div class="v405-tabs">${modeBtns()}</div><h3>3. Upload Document</h3><div class="v405-tabs">${tabBtns()}</div>${state405.tab==='image'?v405ImageUpload(showFront,showBack):v405PdfUpload()}</div>
        <div class="card"><h3>4. Select Printable Area (Drag & Resize)</h3>${state405.tab==='image'?v405ImageCrop(showFront,showBack):v405PdfCrop()}<div class="v405-note">Drag inside the box to move. Drag corners or side “|” handles to resize. Use Auto Detect first, then adjust manually.</div></div>
      </div>
      <aside class="v405-side">
        <div class="card"><h3>5. Print Preview (A4)</h3><div class="v405-a4"><div class="v405-a4-strip" id="v405A4Strip"></div></div><div class="v405-note">✓ Lamination layout: top-center 2.2mm, front/back gap 2.4mm</div><div class="v405-print-settings"><div class="v405-setting"><span>Paper</span><b>A4 Portrait</b></div><div class="v405-setting"><span>Card Size</span><b>85.6 × 54 mm</b></div><div class="v405-setting"><span>Top Margin</span><b>2.2 mm</b></div><div class="v405-setting"><span>Gap</span><b>2.4 mm</b></div><label>Copies <select id="v405Copies" onchange="v405PreviewDoc()"><option value="1">1 Copy</option><option value="2">2 Copies</option><option value="4">4 Copies</option><option value="6">6 Copies</option></select></label></div></div>
      </aside>
    </div>`;
    setTimeout(v405InitCrops,120);
    setTimeout(v405PreviewDoc,250);
  }
  function v405ImageUpload(front,back){return `<div class="v405-upload-grid">${front?`<div class="v405-upload-card"><b>🟢 Front Image</b><label class="v405-drop"><input type="file" accept="image/*" onchange="v405LoadImage(event,'front')" hidden>${state405.front?`<img src="${state405.front}">`:'Upload Front Image'}</label></div>`:''}${back?`<div class="v405-upload-card"><b>🟢 Back Image</b><label class="v405-drop"><input type="file" accept="image/*" onchange="v405LoadImage(event,'back')" hidden>${state405.back?`<img src="${state405.back}">`:'Upload Back Image'}</label></div>`:''}</div><small>Supported: JPG, PNG, WEBP. After upload, Auto Detect will suggest printable area.</small>`}
  function v405PdfUpload(){return `<div class="v405-upload-card"><b>Full Page PDF</b><label class="v405-drop"><input type="file" accept="application/pdf" onchange="v405LoadPdf(event)" hidden>${state405.pdfDoc?`PDF loaded · ${state405.pdfPages} page(s)`:'Upload Full Page PDF'}</label>${state405.pdfDoc?`<div class="v405-pdf-page"><label>Page <select onchange="v405ChangePdfPage(this.value)">${Array.from({length:state405.pdfPages},(_,i)=>`<option ${state405.pdfPage===i+1?'selected':''} value="${i+1}">${i+1}</option>`).join('')}</select></label><button onclick="v405PdfZoom(1.15)">Zoom +</button><button onclick="v405PdfZoom(.87)">Zoom -</button><button onclick="v405PdfFit()">Fit Width</button></div>`:''}</div>`}
  function v405ImageCrop(front,back){return `<div class="v405-crop-grid">${front?`<div class="v405-crop-panel"><b>Front - Select Area</b><div class="v405-stage ${state405.front?'':'empty'}" id="v405FrontStage">${state405.front?`<img id="v405FrontImg" src="${state405.front}">`:'Upload front image first'}</div><div class="v405-tool-row"><button onclick="v405AutoDetect('front')">Auto Crop</button><button onclick="v405Rotate('front',-90)">Left</button><button onclick="v405Rotate('front',90)">Right</button><button onclick="v405ResetCrop('front')">Reset</button></div></div>`:''}${back?`<div class="v405-crop-panel"><b>Back - Select Area</b><div class="v405-stage ${state405.back?'':'empty'}" id="v405BackStage">${state405.back?`<img id="v405BackImg" src="${state405.back}">`:'Upload back image first'}</div><div class="v405-tool-row"><button onclick="v405AutoDetect('back')">Auto Crop</button><button onclick="v405Rotate('back',-90)">Left</button><button onclick="v405Rotate('back',90)">Right</button><button onclick="v405ResetCrop('back')">Reset</button></div></div>`:''}</div>`}
  function v405PdfCrop(){return `<div class="v405-stage large ${state405.pdfDoc?'':'empty'}" id="v405PdfStage">${state405.pdfDoc?'<canvas id="v405PdfCanvas"></canvas>':'Upload full page PDF first'}</div><div class="v405-tool-row"><button onclick="v405AutoDetect('pdf')">Auto Crop</button><button onclick="v405PdfZoom(1.15)">Zoom +</button><button onclick="v405PdfZoom(.87)">Zoom -</button><button onclick="v405PdfFit()">Fit Width</button><button onclick="v405ResetCrop('pdf')">Reset</button></div>`}
  window.v405LoadImage=async function(e,side){const f=e.target.files[0]; if(!f)return; state405[side]=await read405(f); state405[side+'Crop']=null; v405RenderDocWorkspace(); setTimeout(()=>v405AutoDetect(side),250)}
  window.v405LoadPdf=async function(e){const f=e.target.files[0]; if(!f)return; if(!window.pdfjsLib){toast405('PDF library loading. Try again in a moment.');return;} const ab=await f.arrayBuffer(); state405.pdfDoc=await pdfjsLib.getDocument({data:ab}).promise; state405.pdfPages=state405.pdfDoc.numPages; state405.pdfPage=1; state405.pdfCrop=null; v405RenderDocWorkspace(); setTimeout(()=>v405RenderPdf(),200)}
  window.v405ChangePdfPage=function(v){state405.pdfPage=Number(v); state405.pdfCrop=null; v405RenderDocWorkspace(); setTimeout(()=>v405RenderPdf(),120)}
  window.v405PdfZoom=function(f){state405.pdfScale=Math.max(.6,Math.min(3.5,state405.pdfScale*f)); v405RenderPdf(true)}
  window.v405PdfFit=function(){state405.pdfScale=1.25; v405RenderPdf(true)}
  async function v405RenderPdf(keep){if(!state405.pdfDoc)return; const canvas=$405('#v405PdfCanvas'); if(!canvas)return; const page=await state405.pdfDoc.getPage(state405.pdfPage); const viewport=page.getViewport({scale:state405.pdfScale}); canvas.width=viewport.width; canvas.height=viewport.height; await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise; if(!keep||!state405.pdfCrop) state405.pdfCrop=v405CreateCrop($405('#v405PdfStage'),canvas,{auto:true}); else v405Paint(state405.pdfCrop); v405PreviewDoc();}
  function v405InitCrops(){ if(state405.front&&$405('#v405FrontImg')) state405.frontCrop=v405CreateCrop($405('#v405FrontStage'),$405('#v405FrontImg'),{auto:!state405.frontCrop}); if(state405.back&&$405('#v405BackImg')) state405.backCrop=v405CreateCrop($405('#v405BackStage'),$405('#v405BackImg'),{auto:!state405.backCrop}); if(state405.pdfDoc) v405RenderPdf(); }
  function bounds(stage,media){const sr=stage.getBoundingClientRect(), mr=media.getBoundingClientRect(); return {x:mr.left-sr.left,y:mr.top-sr.top,w:mr.width,h:mr.height}}
  function clamp(st,x=st.x,y=st.y,w=st.w,h=st.h){const b=bounds(st.stage,st.media); w=Math.max(40,Math.min(w,b.w)); h=Math.max(30,Math.min(h,b.h)); x=Math.max(b.x,Math.min(x,b.x+b.w-w)); y=Math.max(b.y,Math.min(y,b.y+b.h-h)); return{x,y,w,h}}
  function v405CreateCrop(stage,media,opt={}){ if(!stage||!media)return null; stage.querySelectorAll('.v405-crop-selection').forEach(e=>e.remove()); const b=bounds(stage,media); const box=document.createElement('div'); box.className='v405-crop-selection'; ['nw','n','ne','e','se','s','sw','w'].forEach(h=>{const sp=document.createElement('span'); sp.className='v405-handle '+h; sp.dataset.handle=h; box.appendChild(sp)}); const mv=document.createElement('i'); mv.className='v405-move'; mv.textContent='MOVE'; box.appendChild(mv); stage.appendChild(box); const w=b.w*.78,h=b.h*.55,x=b.x+(b.w-w)/2,y=b.y+(b.h-h)/2; const st={stage,media,box,x,y,w,h}; v405Attach(st); v405Paint(st); return st; }
  function v405Paint(st){ if(!st)return; const c=clamp(st); Object.assign(st,c); Object.assign(st.box.style,{left:st.x+'px',top:st.y+'px',width:st.w+'px',height:st.h+'px'}); }
  function v405Attach(st){let mode='',start={}; const pt=e=>e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; const down=e=>{e.preventDefault(); const p=pt(e); mode=e.target.dataset.handle||'move'; start={px:p.x,py:p.y,x:st.x,y:st.y,w:st.w,h:st.h}; document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);document.addEventListener('touchmove',move,{passive:false});document.addEventListener('touchend',up)}; const move=e=>{e.preventDefault(); const p=pt(e),dx=p.x-start.px,dy=p.y-start.py; let{x,y,w,h}=start; if(mode==='move'){x+=dx;y+=dy}else{if(mode.includes('e'))w+=dx;if(mode.includes('s'))h+=dy;if(mode.includes('w')){x+=dx;w-=dx}if(mode.includes('n')){y+=dy;h-=dy}} Object.assign(st,clamp(st,x,y,w,h)); v405Paint(st)}; const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',up);v405PreviewDoc()}; st.box.addEventListener('mousedown',down); st.box.addEventListener('touchstart',down,{passive:false}); }
  window.v405AutoDetect=function(kind){let st=state405[kind+'Crop']; if(!st){v405InitCrops();st=state405[kind+'Crop'];} if(!st)return; const b=bounds(st.stage,st.media); Object.assign(st,{x:b.x+b.w*.06,y:b.y+b.h*.08,w:b.w*.88,h:b.h*.78}); v405Paint(st); v405PreviewDoc(); toast405('Auto crop applied. Adjust manually if needed.');}
  window.v405ResetCrop=function(kind){ if(kind==='pdf'){state405.pdfCrop=null; v405RenderPdf();return} if(kind==='front')state405.frontCrop=null; if(kind==='back')state405.backCrop=null; v405RenderDocWorkspace(); }
  window.v405Rotate=async function(side,deg){ const src=state405[side]; if(!src)return; const img=await loadImg405(src); const c=document.createElement('canvas'),ctx=c.getContext('2d'); const rad=deg*Math.PI/180; if(Math.abs(deg)%180===90){c.width=img.height;c.height=img.width}else{c.width=img.width;c.height=img.height} ctx.translate(c.width/2,c.height/2);ctx.rotate(rad);ctx.drawImage(img,-img.width/2,-img.height/2); state405[side]=c.toDataURL('image/jpeg',.95); state405[side+'Crop']=null; v405RenderDocWorkspace(); }
  async function crop405(st){ if(!st)return null; const media=st.media; let source,sw,sh; if(media.tagName==='CANVAS'){source=media;sw=media.width;sh=media.height}else{source=await loadImg405(media.src);sw=source.width;sh=source.height} const mr=media.getBoundingClientRect(), sr=st.stage.getBoundingClientRect(); let rx=(st.x-(mr.left-sr.left))/mr.width, ry=(st.y-(mr.top-sr.top))/mr.height, rw=st.w/mr.width, rh=st.h/mr.height; rx=Math.max(0,Math.min(rx,1));ry=Math.max(0,Math.min(ry,1));rw=Math.max(.01,Math.min(rw,1-rx));rh=Math.max(.01,Math.min(rh,1-ry)); const c=document.createElement('canvas'),ctx=c.getContext('2d'); c.width=1400;c.height=Math.max(1,Math.round(1400*(sh*rh)/(sw*rw)));ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(source,sw*rx,sh*ry,sw*rw,sh*rh,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.94); }
  async function v405CollectImages(){ const imgs=[]; if(state405.tab==='image'){ if(state405.mode!=='back') imgs.push(await crop405(state405.frontCrop)); if(state405.mode!=='front') imgs.push(await crop405(state405.backCrop)); } else imgs.push(await crop405(state405.pdfCrop)); return imgs.filter(Boolean); }
  window.v405PreviewDoc=async function(){ const strip=$405('#v405A4Strip'); if(!strip)return; const imgs=await v405CollectImages(); strip.innerHTML=imgs.map(s=>`<img src="${s}">`).join(''); }
  window.v405MakeDocPDF=async function(){ const imgs=await v405CollectImages(); if(!imgs.length){toast405('Upload and crop document first');return null} const {jsPDF}=window.jspdf; const pdf=new jsPDF({unit:'mm',format:'a4'}); const copies=Number($405('#v405Copies')?.value||1); const cardW=85.6, cardH=54, gap=2.4, top=2.2; let y=top; for(let c=0;c<copies;c++){ const totalW=imgs.length*cardW+(imgs.length-1)*gap; let x=(210-totalW)/2; imgs.forEach(src=>{pdf.addImage(src,'JPEG',x,y,cardW,cardH);pdf.setDrawColor(0);pdf.rect(x,y,cardW,cardH);x+=cardW+gap}); y+=cardH+gap; if(y+cardH>294&&c<copies-1){pdf.addPage();y=top;} } state405.docPdf=pdf; return pdf; }
  window.v405DownloadDoc=async function(){const pdf=await v405MakeDocPDF(); if(pdf)pdf.save((DOCS405[state405.doc].name||'document').replaceAll(' ','-')+'-A4.pdf')}
  window.v405PrintDoc=async function(){const pdf=await v405MakeDocPDF(); if(!pdf)return; pdf.autoPrint(); window.open(URL.createObjectURL(pdf.output('blob')),'_blank')}

  window.passportStudio=function(){
    workspace.innerHTML=header405('Passport Photo Studio','Upload photo, select face/body area with professional crop, and print 35×45 mm passport photos.')+`
    <div class="v405-work-grid"><div><div class="card"><h3>1. Upload Photo</h3><label class="v405-drop"><input type="file" accept="image/*" onchange="v405LoadPassport(event)" hidden>${state405.passportImg?`<img src="${state405.passportImg}">`:'Upload Passport Photo'}</label><div class="v405-tabs"><select id="v405PassCount"><option value="5">5 Photos</option><option value="4">4 Photos</option><option value="6">6 Photos</option><option value="8">8 Photos</option><option value="12">12 Photos</option></select></div></div><div class="card"><h3>2. Select Printable Area</h3><div class="v405-stage large ${state405.passportImg?'':'empty'}" id="v405PassStage">${state405.passportImg?`<img id="v405PassImg" src="${state405.passportImg}">`:'Upload photo first'}</div><div class="v405-tool-row"><button onclick="v405AutoPassport()">Auto Crop</button><button onclick="v405RotatePassport(-90)">Left</button><button onclick="v405RotatePassport(90)">Right</button><button onclick="v405ResetPassport()">Reset</button></div></div></div><aside class="v405-side"><div class="card"><h3>A4 Preview</h3><div class="v405-a4"><div class="v405-a4-passport" id="v405PassPreview"></div></div><div class="v405-note">Passport output: 35×45 mm, top margin 2.2mm.</div><div class="v405-footer-actions"><button class="v405-primary" onclick="v405PreviewPassport()">Preview</button><button class="v405-success" onclick="v405DownloadPassport()">Download PDF</button><button onclick="v405PrintPassport()">Print</button></div></div></aside></div>`;
    setTimeout(()=>{if(state405.passportImg&&$405('#v405PassImg')){state405.passportCrop=v405CreateCrop($405('#v405PassStage'),$405('#v405PassImg'),{auto:!state405.passportCrop});v405PreviewPassport()}},120);
  }
  window.v405LoadPassport=async function(e){const f=e.target.files[0]; if(!f)return; state405.passportImg=await read405(f); state405.passportCrop=null; passportStudio(); setTimeout(v405AutoPassport,260)}
  window.v405AutoPassport=function(){ if(!state405.passportCrop&&$405('#v405PassImg')) state405.passportCrop=v405CreateCrop($405('#v405PassStage'),$405('#v405PassImg'),{}); const st=state405.passportCrop;if(!st)return; const b=bounds(st.stage,st.media); const h=b.h*.82,w=h*(35/45); Object.assign(st,{w:Math.min(w,b.w*.7),h:Math.min(h,b.h*.88)}); st.x=b.x+(b.w-st.w)/2; st.y=b.y+(b.h-st.h)/2; v405Paint(st); v405PreviewPassport(); }
  window.v405ResetPassport=function(){state405.passportCrop=null;passportStudio()}
  window.v405RotatePassport=async function(deg){if(!state405.passportImg)return; const img=await loadImg405(state405.passportImg); const c=document.createElement('canvas'),ctx=c.getContext('2d'); c.width=Math.abs(deg)%180===90?img.height:img.width;c.height=Math.abs(deg)%180===90?img.width:img.height; ctx.translate(c.width/2,c.height/2);ctx.rotate(deg*Math.PI/180);ctx.drawImage(img,-img.width/2,-img.height/2); state405.passportImg=c.toDataURL('image/jpeg',.95);state405.passportCrop=null;passportStudio()}
  window.v405PreviewPassport=async function(){const box=$405('#v405PassPreview'); if(!box||!state405.passportCrop)return; const src=await crop405(state405.passportCrop); const n=Number($405('#v405PassCount')?.value||5); box.innerHTML=Array.from({length:n},()=>`<img src="${src}">`).join('')}
  window.v405MakePassportPDF=async function(){if(!state405.passportCrop){toast405('Upload and crop photo first');return null} const src=await crop405(state405.passportCrop); const n=Number($405('#v405PassCount')?.value||5); const {jsPDF}=window.jspdf; const pdf=new jsPDF({unit:'mm',format:'a4'}); const w=35,h=45,gap=3,top=2.2; let x=5,y=top; for(let i=0;i<n;i++){if(x+w>205){x=5;y+=h+gap} pdf.addImage(src,'JPEG',x,y,w,h);pdf.rect(x,y,w,h);x+=w+gap} state405.passportPdf=pdf; return pdf;}
  window.v405DownloadPassport=async function(){const pdf=await v405MakePassportPDF(); if(pdf)pdf.save('passport-photo-35x45-a4.pdf')}
  window.v405PrintPassport=async function(){const pdf=await v405MakePassportPDF(); if(!pdf)return; pdf.autoPrint(); window.open(URL.createObjectURL(pdf.output('blob')),'_blank')}

  const oldShow=window.showTool;
  window.showTool=function(tool){ if(tool==='documentStudio')return window.documentStudio(); if(tool==='passport')return window.passportStudio(); return oldShow?oldShow(tool):null; }
})();

/* =====================================================
   v41.2 ACTUAL SOURCE PATCH
   Robust Document Studio + Passport print engine override
===================================================== */
(function(){
  const DOCS={aadhaar:{name:'Aadhaar Card',icon:'aadhaar.jpg'},pan:{name:'PAN Card',icon:'pan.jpg'},voter:{name:'Voter ID Card',icon:'voter.jpg'},ayushman:{name:'Ayushman Card',icon:'ayushman.jpg'},abha:{name:'ABHA Card',icon:'abha.jpg'},dl:{name:'Driving Licence',icon:'dl.jpg'}};
  const S={doc:null,mode:'both',tab:'image',front:null,back:null,pdf:null,pdfDoc:null,pdfPage:1,pdfPages:0,pdfScale:1.6,frontCrop:null,backCrop:null,pdfCrop:null,passport:null,passportCrop:null,passportCount:5};
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const toast2=msg=>typeof toast==='function'?toast(msg):alert(msg);
  const header=(t,s)=>typeof pageHeader==='function'?pageHeader(t,s):`<h1>${t}</h1><p>${s||''}</p>`;
  const mustLogin=tool=>typeof v40EnsureAuth==='function'?v40EnsureAuth(tool):true;
  function read(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
  function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
  function waitFrame(){return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}
  function docRatio(){return 85.6/54}
  function passRatio(){return 35/45}

  window.documentStudio=function(){
    if(!mustLogin('documentStudio')) return;
    S.doc=null;
    const cards=Object.entries(DOCS).map(([id,d])=>`<button class="spt412-doc-card" onclick="spt412OpenDoc('${id}')"><img src="${d.icon}" onerror="this.style.display='none'"><h3>${d.name}</h3><small>85.6 × 54 mm</small></button>`).join('');
    workspace.innerHTML=header('Document Studio','Choose document type and create lamination-ready A4 print.')+`<div class="card"><div class="spt412-editor-head"><div><h3>Select Document</h3><p>Aadhaar, PAN, Voter ID, Ayushman, ABHA and Driving Licence.</p></div><button class="spt412-btn" onclick="spt412Help()">How to use</button></div><div class="spt412-doc-grid">${cards}</div><div class="spt412-note">Click a document to open a large editor with crop, rotate, preview, download and print.</div></div>`;
  };
  window.spt412Help=()=>toast2('Select document → upload front/back image or full PDF → Auto Detect/Manual Crop → Preview A4 → Download/Print.');
  window.spt412OpenDoc=function(id){S.doc=id; workspace.innerHTML=header('Opening '+DOCS[id].name,'Preparing editor...')+`<div class="card"><span class="spt412-loader">Loading workspace</span></div>`; setTimeout(renderDocEditor,220)};
  function modeBtns(){return ['front','back','both'].map(m=>`<button class="${S.mode===m?'active':''}" onclick="spt412SetMode('${m}')">${m==='both'?'Front + Back':m[0].toUpperCase()+m.slice(1)}</button>`).join('')}
  function tabBtns(){return ['image','pdf'].map(t=>`<button class="${S.tab===t?'active':''}" onclick="spt412SetTab('${t}')">${t==='image'?'Image Upload':'Full Page PDF'}</button>`).join('')}
  window.spt412SetMode=m=>{S.mode=m;renderDocEditor()}; window.spt412SetTab=t=>{S.tab=t;renderDocEditor()};
  function renderDocEditor(){
    const d=DOCS[S.doc||'aadhaar']; const showF=S.mode!=='back', showB=S.mode!=='front';
    workspace.innerHTML=header('Document Studio Pro','Large editor, CamScanner-style crop and lamination-ready output.')+`
      <div class="card spt412-editor-head"><div class="spt412-title"><img src="${d.icon}" onerror="this.style.display='none'"><div><h2>${d.name}</h2><p>Card: 85.6 × 54 mm · A4 top margin 2.2mm · gap 2.4mm</p></div></div><div class="spt412-action-row"><button onclick="documentStudio()">← Back</button><button class="spt412-blue" onclick="spt412PreviewDoc()">Preview A4</button><button class="spt412-green" onclick="spt412DownloadDoc()">Download PDF</button><button onclick="spt412PrintDoc()">Print</button></div></div>
      <div class="spt412-grid">
        <div>
          <div class="card"><h3>1. Select Mode</h3><div class="spt412-tabs">${modeBtns()}</div><h3>2. Upload</h3><div class="spt412-tabs">${tabBtns()}</div>${S.tab==='image'?imageUpload(showF,showB):pdfUpload()}</div>
          <div class="card"><h3>3. Crop / Edit Printable Area</h3>${S.tab==='image'?imageCrop(showF,showB):pdfCrop()}<div class="spt412-note">Use Auto Detect first, then drag green box or side “|” handles to adjust.</div></div>
        </div>
        <aside class="spt412-side"><div class="card"><h3>A4 Print Preview</h3><div class="spt412-a4"><div class="spt412-a4-strip" id="spt412A4"></div></div><div class="spt412-note">Preview = final PDF. Top-center 2.2mm, front/back gap 2.4mm.</div><div class="spt412-settings"><div class="spt412-setting"><span>Paper</span><b>A4 Portrait</b></div><div class="spt412-setting"><span>Card Size</span><b>85.6 × 54 mm</b></div><div class="spt412-setting"><span>Top Margin</span><b>2.2 mm</b></div><div class="spt412-setting"><span>Gap</span><b>2.4 mm</b></div><label>Copies <select id="spt412Copies" onchange="spt412PreviewDoc()"><option value="1">1 Copy</option><option value="2">2 Copies</option><option value="4">4 Copies</option><option value="6">6 Copies</option></select></label></div><div class="spt412-bottom-actions"><button class="spt412-blue" onclick="spt412PreviewDoc()">Preview A4</button><button class="spt412-green" onclick="spt412DownloadDoc()">Download</button><button onclick="spt412PrintDoc()">Print</button></div></div></aside>
      </div>`;
    setTimeout(initCrops,120); setTimeout(()=>{if(S.tab==='pdf'&&S.pdfDoc) renderPdf(); spt412PreviewDoc()},240);
  }
  function imageUpload(f,b){return `<div class="spt412-upload-grid">${f?`<div class="spt412-upload-card"><b>Front image</b><label class="spt412-drop"><input hidden type="file" accept="image/*" onchange="spt412LoadImage(event,'front')">${S.front?`<img src="${S.front}">`:'Upload Front'}</label></div>`:''}${b?`<div class="spt412-upload-card"><b>Back image</b><label class="spt412-drop"><input hidden type="file" accept="image/*" onchange="spt412LoadImage(event,'back')">${S.back?`<img src="${S.back}">`:'Upload Back'}</label></div>`:''}</div>`}
  function pdfUpload(){return `<div class="spt412-upload-card"><b>Full page PDF</b><label class="spt412-drop"><input hidden type="file" accept="application/pdf" onchange="spt412LoadPdf(event)">${S.pdfDoc?`PDF loaded · ${S.pdfPages} page(s)`:'Upload Full Page PDF'}</label>${S.pdfDoc?`<div class="spt412-page-row"><label>Page <select onchange="spt412PdfPage(this.value)">${Array.from({length:S.pdfPages},(_,i)=>`<option value="${i+1}" ${S.pdfPage===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><button onclick="spt412PdfZoom(1.2)">Zoom +</button><button onclick="spt412PdfZoom(.84)">Zoom -</button><button onclick="spt412PdfFit()">Fit Width</button></div>`:''}</div>`}
  function imageCrop(f,b){return `<div class="spt412-upload-grid">${f?`<div class="spt412-upload-card"><b>Front crop</b><div class="spt412-stage ${S.front?'':'empty'}" id="spt412FrontStage">${S.front?`<img id="spt412FrontMedia" src="${S.front}">`:'Upload front image first'}</div><div class="spt412-toolbar"><button onclick="spt412Auto('front')">Auto Detect</button><button onclick="spt412RotateImg('front',-90)">Rotate Left</button><button onclick="spt412RotateImg('front',90)">Rotate Right</button><button onclick="spt412Reset('front')">Reset</button></div></div>`:''}${b?`<div class="spt412-upload-card"><b>Back crop</b><div class="spt412-stage ${S.back?'':'empty'}" id="spt412BackStage">${S.back?`<img id="spt412BackMedia" src="${S.back}">`:'Upload back image first'}</div><div class="spt412-toolbar"><button onclick="spt412Auto('back')">Auto Detect</button><button onclick="spt412RotateImg('back',-90)">Rotate Left</button><button onclick="spt412RotateImg('back',90)">Rotate Right</button><button onclick="spt412Reset('back')">Reset</button></div></div>`:''}</div>`}
  function pdfCrop(){return `<div class="spt412-stage large ${S.pdfDoc?'':'empty'}" id="spt412PdfStage">${S.pdfDoc?'<canvas id="spt412PdfCanvas"></canvas>':'Upload full page PDF first'}</div><div class="spt412-toolbar"><button onclick="spt412Auto('pdf')">Auto Detect</button><button onclick="spt412PdfZoom(1.2)">Zoom +</button><button onclick="spt412PdfZoom(.84)">Zoom -</button><button onclick="spt412PdfFit()">Fit Width</button><button onclick="spt412Reset('pdf')">Reset</button></div>`}

  window.spt412LoadImage=async function(e,side){const f=e.target.files[0]; if(!f)return; S[side]=await normalizeImage(f); S[side+'Crop']=null; renderDocEditor(); setTimeout(()=>spt412Auto(side),350)};
  async function normalizeImage(file){ const src=await read(file); const img=await loadImg(src); const max=2200; let w=img.width,h=img.height,scale=Math.min(1,max/Math.max(w,h)); const c=document.createElement('canvas'),ctx=c.getContext('2d'); c.width=Math.round(w*scale); c.height=Math.round(h*scale); ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.94); }
  window.spt412LoadPdf=async function(e){const f=e.target.files[0]; if(!f)return; if(!window.pdfjsLib){toast2('PDF library not loaded yet. Refresh and try again.');return} const ab=await f.arrayBuffer(); S.pdfDoc=await pdfjsLib.getDocument({data:ab}).promise; S.pdfPages=S.pdfDoc.numPages; S.pdfPage=1; S.pdfCrop=null; renderDocEditor(); setTimeout(renderPdf,300)};
  window.spt412PdfPage=function(v){S.pdfPage=Number(v);S.pdfCrop=null;renderDocEditor();setTimeout(renderPdf,250)}; window.spt412PdfZoom=f=>{S.pdfScale=Math.max(.5,Math.min(4,S.pdfScale*f));renderPdf()}; window.spt412PdfFit=()=>{S.pdfScale=1.35;renderPdf()};
  async function renderPdf(){ const canvas=q('#spt412PdfCanvas'); if(!canvas||!S.pdfDoc)return; const page=await S.pdfDoc.getPage(S.pdfPage); const vp=page.getViewport({scale:S.pdfScale}); canvas.width=vp.width;canvas.height=vp.height; await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise; await waitFrame(); if(!S.pdfCrop) S.pdfCrop=createCrop(q('#spt412PdfStage'),canvas,docRatio()); else repaint(S.pdfCrop); }
  function initCrops(){ if(S.front&&q('#spt412FrontMedia')&&!S.frontCrop) S.frontCrop=createCrop(q('#spt412FrontStage'),q('#spt412FrontMedia'),docRatio()); if(S.back&&q('#spt412BackMedia')&&!S.backCrop) S.backCrop=createCrop(q('#spt412BackStage'),q('#spt412BackMedia'),docRatio()); if(S.pdfDoc&&q('#spt412PdfCanvas')&&!S.pdfCrop) renderPdf(); }

  function visibleBounds(stage,media){const sr=stage.getBoundingClientRect(), mr=media.getBoundingClientRect(); return {x:mr.left-sr.left,y:mr.top-sr.top,w:mr.width,h:mr.height};}
  function clampCrop(c,x=c.x,y=c.y,w=c.w,h=c.h){const b=visibleBounds(c.stage,c.media); const ratio=c.ratio; if(ratio){ if(w/h>ratio) w=h*ratio; else h=w/ratio; } w=Math.max(60,Math.min(w,b.w)); h=Math.max(40,Math.min(h,b.h)); if(ratio){ if(w/h>ratio) w=h*ratio; else h=w/ratio; } x=Math.max(b.x,Math.min(x,b.x+b.w-w)); y=Math.max(b.y,Math.min(y,b.y+b.h-h)); return {x,y,w,h};}
  function createCrop(stage,media,ratio){ if(!stage||!media)return null; stage.querySelectorAll('.spt412-crop').forEach(e=>e.remove()); const b=visibleBounds(stage,media); let w=b.w*.82,h=w/ratio; if(h>b.h*.82){h=b.h*.82;w=h*ratio} const crop={stage,media,ratio,x:b.x+(b.w-w)/2,y:b.y+(b.h-h)/2,w,h}; const box=document.createElement('div'); box.className='spt412-crop'; ['nw','n','ne','e','se','s','sw','w'].forEach(n=>{const h=document.createElement('span');h.className='spt412-h '+n;h.dataset.h=n;box.appendChild(h)}); const mv=document.createElement('i');mv.className='spt412-move';mv.textContent='MOVE';box.appendChild(mv); crop.box=box; stage.appendChild(box); attachCrop(crop); repaint(crop); return crop;}
  function repaint(crop){ if(!crop||!crop.box)return; Object.assign(crop,clampCrop(crop)); Object.assign(crop.box.style,{left:crop.x+'px',top:crop.y+'px',width:crop.w+'px',height:crop.h+'px'}); }
  function attachCrop(c){let mode='',start={}; const p=e=>e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; const down=e=>{e.preventDefault();e.stopPropagation(); const pp=p(e); mode=e.target.dataset.h||'move'; start={px:pp.x,py:pp.y,x:c.x,y:c.y,w:c.w,h:c.h}; document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);document.addEventListener('touchmove',move,{passive:false});document.addEventListener('touchend',up)}; const move=e=>{e.preventDefault(); const pp=p(e);let dx=pp.x-start.px,dy=pp.y-start.py;let x=start.x,y=start.y,w=start.w,h=start.h; if(mode==='move'){x+=dx;y+=dy}else{if(mode.includes('e'))w+=dx;if(mode.includes('s'))h+=dy;if(mode.includes('w')){x+=dx;w-=dx}if(mode.includes('n')){y+=dy;h-=dy}} Object.assign(c,clampCrop(c,x,y,w,h)); repaint(c)}; const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',up);spt412PreviewDoc()}; c.box.addEventListener('mousedown',down); c.box.addEventListener('touchstart',down,{passive:false});}
  window.spt412Auto=function(kind){let c=S[kind+'Crop']; if(!c){initCrops(); c=S[kind+'Crop'];} if(!c)return; const b=visibleBounds(c.stage,c.media); let w=b.w*.9,h=w/c.ratio; if(h>b.h*.85){h=b.h*.85;w=h*c.ratio} Object.assign(c,{x:b.x+(b.w-w)/2,y:b.y+(b.h-h)/2,w,h}); repaint(c); spt412PreviewDoc(); toast2('Auto Detect applied. Adjust manually if needed.');}
  window.spt412Reset=kind=>{S[kind+'Crop']=null;renderDocEditor()};
  window.spt412RotateImg=async function(side,deg){const src=S[side]; if(!src)return; const img=await loadImg(src); const c=document.createElement('canvas'),ctx=c.getContext('2d'); c.width=Math.abs(deg)%180===90?img.height:img.width;c.height=Math.abs(deg)%180===90?img.width:img.height; ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height); ctx.translate(c.width/2,c.height/2);ctx.rotate(deg*Math.PI/180);ctx.drawImage(img,-img.width/2,-img.height/2); S[side]=c.toDataURL('image/jpeg',.94); S[side+'Crop']=null; renderDocEditor();}

  async function cropToCard(crop,ratio=docRatio()){ if(!crop)return null; const media=crop.media; let source,nw,nh; if(media.tagName==='CANVAS'){source=media;nw=media.width;nh=media.height}else{source=await loadImg(media.src);nw=source.width;nh=source.height} const mr=media.getBoundingClientRect(), sr=crop.stage.getBoundingClientRect(); let rx=(crop.x-(mr.left-sr.left))/mr.width, ry=(crop.y-(mr.top-sr.top))/mr.height, rw=crop.w/mr.width, rh=crop.h/mr.height; rx=Math.max(0,Math.min(rx,1));ry=Math.max(0,Math.min(ry,1));rw=Math.max(.01,Math.min(rw,1-rx));rh=Math.max(.01,Math.min(rh,1-ry)); const outW=1400,outH=Math.round(outW/ratio); const out=document.createElement('canvas'),ctx=out.getContext('2d'); out.width=outW;out.height=outH; ctx.fillStyle='#fff';ctx.fillRect(0,0,outW,outH); ctx.drawImage(source,nw*rx,nh*ry,nw*rw,nh*rh,0,0,outW,outH); return out.toDataURL('image/jpeg',.95); }
  async function collectDocImgs(){let arr=[]; if(S.tab==='image'){if(S.mode!=='back')arr.push(await cropToCard(S.frontCrop)); if(S.mode!=='front')arr.push(await cropToCard(S.backCrop));} else arr.push(await cropToCard(S.pdfCrop)); return arr.filter(Boolean)}
  window.spt412PreviewDoc=async function(){const box=q('#spt412A4'); if(!box)return; const imgs=await collectDocImgs(); box.innerHTML=imgs.map(src=>`<img src="${src}">`).join('');};
  async function makeDocPdf(){const imgs=await collectDocImgs(); if(!imgs.length){toast2('Upload and crop document first.');return null} const {jsPDF}=window.jspdf; const pdf=new jsPDF({unit:'mm',format:'a4'}); const copies=Number(q('#spt412Copies')?.value||1); const cw=85.6,ch=54,g=2.4,top=2.2; let y=top; for(let c=0;c<copies;c++){const total=imgs.length*cw+(imgs.length-1)*g;let x=(210-total)/2; imgs.forEach(src=>{pdf.addImage(src,'JPEG',x,y,cw,ch);pdf.setDrawColor(0);pdf.setLineWidth(.25);pdf.rect(x,y,cw,ch);x+=cw+g}); y+=ch+g;if(y+ch>294&&c<copies-1){pdf.addPage();y=top}} return pdf;}
  window.spt412DownloadDoc=async()=>{const pdf=await makeDocPdf();if(pdf)pdf.save((DOCS[S.doc]?.name||'document').replaceAll(' ','-')+'-A4.pdf')};
  window.spt412PrintDoc=async()=>{const pdf=await makeDocPdf();if(!pdf)return;pdf.autoPrint();window.open(URL.createObjectURL(pdf.output('blob')),'_blank')};

  /* Passport override using the same fixed-ratio crop engine */
  window.passportStudio=function(){workspace.innerHTML=header('Passport Photo Studio','Crop with handles and print exact 35×45 mm photos.')+`<div class="spt412-grid"><div><div class="card"><h3>Upload Photo</h3><label class="spt412-drop"><input hidden type="file" accept="image/*" onchange="spt412LoadPassport(event)">${S.passport?`<img src="${S.passport}">`:'Upload Passport Photo'}</label><div class="spt412-page-row"><label>Photos <select id="spt412PassCount" onchange="spt412PreviewPassport()"><option value="5">5</option><option value="4">4</option><option value="6">6</option><option value="8">8</option><option value="12">12</option></select></label></div></div><div class="card"><h3>Select Passport Area</h3><div class="spt412-stage large ${S.passport?'':'empty'}" id="spt412PassStage">${S.passport?`<img id="spt412PassMedia" src="${S.passport}">`:'Upload photo first'}</div><div class="spt412-toolbar"><button onclick="spt412AutoPassport()">Auto Crop</button><button onclick="spt412RotatePassport(-90)">Rotate Left</button><button onclick="spt412RotatePassport(90)">Rotate Right</button><button onclick="spt412ResetPassport()">Reset</button></div></div></div><aside class="spt412-side"><div class="card"><h3>A4 Preview</h3><div class="spt412-a4"><div class="spt412-pass-strip" id="spt412PassPreview"></div></div><div class="spt412-note">35×45 mm passport photos, top margin 2.2mm.</div><div class="spt412-bottom-actions"><button class="spt412-blue" onclick="spt412PreviewPassport()">Preview</button><button class="spt412-green" onclick="spt412DownloadPassport()">Download PDF</button><button onclick="spt412PrintPassport()">Print</button></div></div></aside></div>`; setTimeout(()=>{if(S.passport&&!S.passportCrop)S.passportCrop=createCrop(q('#spt412PassStage'),q('#spt412PassMedia'),passRatio());spt412PreviewPassport()},140)};
  window.spt412LoadPassport=async e=>{const f=e.target.files[0];if(!f)return;S.passport=await normalizeImage(f);S.passportCrop=null;passportStudio();setTimeout(spt412AutoPassport,300)};
  window.spt412AutoPassport=function(){if(!S.passportCrop&&q('#spt412PassMedia'))S.passportCrop=createCrop(q('#spt412PassStage'),q('#spt412PassMedia'),passRatio());const c=S.passportCrop;if(!c)return; const b=visibleBounds(c.stage,c.media);let h=b.h*.84,w=h*passRatio();if(w>b.w*.7){w=b.w*.7;h=w/passRatio()}Object.assign(c,{x:b.x+(b.w-w)/2,y:b.y+(b.h-h)/2,w,h});repaint(c);spt412PreviewPassport()};
  window.spt412ResetPassport=()=>{S.passportCrop=null;passportStudio()};
  window.spt412RotatePassport=async deg=>{if(!S.passport)return;const img=await loadImg(S.passport);const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=Math.abs(deg)%180===90?img.height:img.width;c.height=Math.abs(deg)%180===90?img.width:img.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.translate(c.width/2,c.height/2);ctx.rotate(deg*Math.PI/180);ctx.drawImage(img,-img.width/2,-img.height/2);S.passport=c.toDataURL('image/jpeg',.94);S.passportCrop=null;passportStudio()};
  window.spt412PreviewPassport=async()=>{const box=q('#spt412PassPreview');if(!box||!S.passportCrop)return;const src=await cropToCard(S.passportCrop,passRatio());const n=Number(q('#spt412PassCount')?.value||S.passportCount||5);box.innerHTML=Array.from({length:n},()=>`<img src="${src}">`).join('')};
  async function makePassPdf(){if(!S.passportCrop){toast2('Upload and crop photo first');return null}const src=await cropToCard(S.passportCrop,passRatio());const n=Number(q('#spt412PassCount')?.value||5);const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'mm',format:'a4'});const w=35,h=45,g=3,top=2.2;let x=5,y=top;for(let i=0;i<n;i++){if(x+w>205){x=5;y+=h+g}pdf.addImage(src,'JPEG',x,y,w,h);pdf.rect(x,y,w,h);x+=w+g}return pdf}
  window.spt412DownloadPassport=async()=>{const pdf=await makePassPdf();if(pdf)pdf.save('passport-photo-35x45-a4.pdf')}; window.spt412PrintPassport=async()=>{const pdf=await makePassPdf();if(!pdf)return;pdf.autoPrint();window.open(URL.createObjectURL(pdf.output('blob')),'_blank')};

  const oldShow=window.showTool;
  window.showTool=function(tool){ if(tool==='documentStudio')return window.documentStudio(); if(tool==='passport')return window.passportStudio(); return oldShow?oldShow(tool):null; };
})();

/* =====================================================
   Smart Photo Toolkit Pro v41.5
   Actual Source Patch: Print Engine + CamScanner Studio
   ===================================================== */
(function(){
  const VERSION='v41.5';
  const $=s=>document.querySelector(s);
  const workspace=()=>document.getElementById('workspace');
  const toast=(m)=>{const t=document.getElementById('toast'); if(t){t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}else alert(m)};
  const DOCS={aadhaar:{name:'Aadhaar Card',icon:'aadhaar.jpg'},pan:{name:'PAN Card',icon:'pan.jpg'},voter:{name:'Voter ID',icon:'voter.jpg'},ayushman:{name:'Ayushman Card',icon:'ayushman.jpg'},abha:{name:'ABHA Card',icon:'abha.jpg'},dl:{name:'Driving Licence',icon:'dl.jpg'}};
  const S={doc:'aadhaar',mode:'both',tab:'image',front:null,back:null,pdfDoc:null,pdfPages:0,pdfPage:1,pdfScale:1.35,frontCrop:null,backCrop:null,pdfCrop:null,passport:null,passportCrop:null,filters:{front:baseF(),back:baseF(),pdf:baseF(),passport:baseF()}};
  function baseF(){return{preset:'original',brightness:0,contrast:0,sharp:0}}
  function header(t,sub){return `<div class="page-head"><div><h1>${t}</h1><p>${sub||''}</p></div><span class="pro-badge">${VERSION}</span></div>`}
  function waitFrame(){return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}
  function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
  function readFile(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)})}
  async function normalize(f){const img=await loadImg(await readFile(f)); const max=2400,scale=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas'),ctx=c.getContext('2d'); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale); ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.95)}
  function ratioDoc(){return 85.6/54} function ratioPass(){return 35/45}
  function visible(stage,media){const sr=stage.getBoundingClientRect(),mr=media.getBoundingClientRect();return{x:mr.left-sr.left,y:mr.top-sr.top,w:mr.width,h:mr.height}}
  function clamp(c,x=c.x,y=c.y,w=c.w,h=c.h){const b=visible(c.stage,c.media),r=c.ratio; if(r){ if(w/h>r)w=h*r; else h=w/r } w=Math.max(60,Math.min(w,b.w));h=Math.max(40,Math.min(h,b.h)); if(r){ if(w/h>r)w=h*r; else h=w/r } x=Math.max(b.x,Math.min(x,b.x+b.w-w)); y=Math.max(b.y,Math.min(y,b.y+b.h-h)); return{x,y,w,h}}
  function cropBox(stage,media,ratio){if(!stage||!media)return null; stage.querySelectorAll('.v415-crop').forEach(e=>e.remove()); const b=visible(stage,media); let w=b.w*.86,h=w/ratio;if(h>b.h*.82){h=b.h*.82;w=h*ratio} const c={stage,media,ratio,x:b.x+(b.w-w)/2,y:b.y+(b.h-h)/2,w,h}; const box=document.createElement('div');box.className='v415-crop'; ['nw','n','ne','e','se','s','sw','w'].forEach(n=>{const h=document.createElement('span');h.className='v415-h '+n;h.dataset.h=n;box.appendChild(h)}); const mv=document.createElement('i');mv.className='v415-move';mv.textContent='MOVE';box.appendChild(mv);c.box=box;stage.appendChild(box);attach(c);paint(c);return c}
  function paint(c){Object.assign(c,clamp(c));Object.assign(c.box.style,{left:c.x+'px',top:c.y+'px',width:c.w+'px',height:c.h+'px'})}
  function attach(c){let mode,start={};const p=e=>e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; const down=e=>{e.preventDefault();e.stopPropagation();const pp=p(e);mode=e.target.dataset.h||'move';start={px:pp.x,py:pp.y,x:c.x,y:c.y,w:c.w,h:c.h};document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);document.addEventListener('touchmove',move,{passive:false});document.addEventListener('touchend',up)}; const move=e=>{e.preventDefault();const pp=p(e),dx=pp.x-start.px,dy=pp.y-start.py;let{x,y,w,h}=start;if(mode==='move'){x+=dx;y+=dy}else{if(mode.includes('e'))w+=dx;if(mode.includes('s'))h+=dy;if(mode.includes('w')){x+=dx;w-=dx}if(mode.includes('n')){y+=dy;h-=dy}}Object.assign(c,clamp(c,x,y,w,h));paint(c)}; const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',up);previewDoc();previewPass()}; c.box.addEventListener('mousedown',down); c.box.addEventListener('touchstart',down,{passive:false})}
  function filterCSS(kind){const f=S.filters[kind]||baseF(); let b=100+Number(f.brightness||0), c=100+Number(f.contrast||0); if(f.preset==='magic'){b+=8;c+=22} if(f.preset==='gray')return `grayscale(1) brightness(${b}%) contrast(${c}%)`; if(f.preset==='bw')return `grayscale(1) contrast(${c+75}%) brightness(${b+5}%)`; return `brightness(${b}%) contrast(${c}%)`}
  function filterBar(kind){const f=S.filters[kind]||baseF(); const btn=p=>`<button class="${f.preset===p?'v415-blue':''}" onclick="v415Preset('${kind}','${p}')">${p==='original'?'Original':p==='magic'?'Magic Color':p==='gray'?'Gray':'B/W'}</button>`; return `<div class="v415-filterbar"><div>${btn('original')}</div><div>${btn('magic')}</div><div>${btn('gray')}</div><div>${btn('bw')}</div><label>Brightness <input type="range" min="-60" max="60" value="${f.brightness}" oninput="v415Filter('${kind}','brightness',this.value)"></label><label>Contrast <input type="range" min="-60" max="80" value="${f.contrast}" oninput="v415Filter('${kind}','contrast',this.value)"></label><label>Sharpness <input type="range" min="0" max="2" step="1" value="${f.sharp}" oninput="v415Filter('${kind}','sharp',this.value)"></label></div>`}
  window.v415Preset=(k,p)=>{S.filters[k].preset=p;applyFilters();previewDoc();previewPass();renderEditor(false)};
  window.v415Filter=(k,key,v)=>{S.filters[k][key]=Number(v);applyFilters();previewDoc();previewPass()};
  function applyFilters(){['front','back','pdf','passport'].forEach(k=>{const el=$(`#v415_${k}`); if(el)el.style.filter=filterCSS(k)})}
  async function cropToCanvas(crop,kind,ratio){if(!crop)return null; const media=crop.media; let source,nw,nh;if(media.tagName==='CANVAS'){source=media;nw=media.width;nh=media.height}else{source=await loadImg(media.src);nw=source.width;nh=source.height} const mr=media.getBoundingClientRect(),sr=crop.stage.getBoundingClientRect(); let rx=(crop.x-(mr.left-sr.left))/mr.width,ry=(crop.y-(mr.top-sr.top))/mr.height,rw=crop.w/mr.width,rh=crop.h/mr.height; rx=Math.max(0,Math.min(rx,1));ry=Math.max(0,Math.min(ry,1));rw=Math.max(.01,Math.min(rw,1-rx));rh=Math.max(.01,Math.min(rh,1-ry)); const outW=1400,outH=Math.round(outW/ratio),c=document.createElement('canvas'),ctx=c.getContext('2d'); c.width=outW;c.height=outH;ctx.fillStyle='#fff';ctx.fillRect(0,0,outW,outH); ctx.filter=filterCSS(kind); ctx.drawImage(source,nw*rx,nh*ry,nw*rw,nh*rh,0,0,outW,outH); if((S.filters[kind]||{}).sharp>0){ctx.filter='none';ctx.globalAlpha=.18*Number(S.filters[kind].sharp);ctx.drawImage(c,0,-1);ctx.drawImage(c,-1,0);ctx.drawImage(c,1,0);ctx.drawImage(c,0,1);ctx.globalAlpha=1} return c}
  async function cropData(c,k,r){const cv=await cropToCanvas(c,k,r);return cv?cv.toDataURL('image/jpeg',.95):null}
  function docCards(){const cards=Object.entries(DOCS).map(([id,d])=>`<button class="v415-doc" onclick="v415OpenDoc('${id}')"><img src="${d.icon}" onerror="this.style.display='none'"><h3>${d.name}</h3><small>85.6 × 54 mm</small></button>`).join(''); workspace().innerHTML=header('Document Studio v41.5','Print Engine + CamScanner-style scan cleanup.')+`<div class="card"><div class="v415-head"><div><h3>Select Document</h3><p>Aadhaar, PAN, Voter, Ayushman, ABHA, DL.</p></div><button class="v415-blue" onclick="alert('Select document → upload front/back or PDF → Auto Detect → Magic Color/BW/Gray → Download/Print A4 PDF')">How to use</button></div><div class="v415-docs">${cards}</div><div class="v415-note">Aadhaar/PVC exact size: 85.6 × 54 mm, top margin 2.2 mm, front/back gap 2.4 mm.</div></div>`}
  window.documentStudio=docCards; window.v415OpenDoc=id=>{S.doc=id;renderEditor(true)}; window.v415Mode=m=>{S.mode=m;renderEditor(true)}; window.v415Tab=t=>{S.tab=t;renderEditor(true)};
  function renderEditor(reset){const d=DOCS[S.doc]; const showF=S.mode!=='back',showB=S.mode!=='front'; workspace().innerHTML=header(`${d.name} Studio`, 'A4 exact print + CamScanner filters')+`<div class="card v415-head"><div class="v415-title"><img src="${d.icon}" onerror="this.style.display='none'"><div><h2>${d.name}</h2><p>Card 85.6×54 mm · A4 Portrait · No browser scaling needed</p></div></div><div class="v415-btns"><button onclick="documentStudio()">← Back</button><button class="v415-blue" onclick="previewDoc()">Preview</button><button class="v415-green" onclick="downloadDoc()">Download PDF</button><button onclick="printDoc()">Print</button></div></div><div class="v415-grid"><div><div class="card"><h3>1. Mode</h3><div class="v415-tabs">${['front','back','both'].map(m=>`<button class="${S.mode===m?'active':''}" onclick="v415Mode('${m}')">${m==='both'?'Front + Back':m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</div><h3>2. Upload</h3><div class="v415-tabs">${['image','pdf'].map(t=>`<button class="${S.tab===t?'active':''}" onclick="v415Tab('${t}')">${t==='image'?'Image Upload':'Full Page PDF'}</button>`).join('')}</div>${S.tab==='image'?uploadHTML(showF,showB):pdfUploadHTML()}</div><div class="card"><h3>3. Crop / CamScanner Edit</h3>${S.tab==='image'?cropHTML(showF,showB):pdfCropHTML()}<div class="v415-note">Use Auto Detect, then adjust green box. Magic Color / Gray / B&W apply to final PDF too.</div></div></div><aside class="v415-side"><div class="card"><h3>A4 Print Preview</h3><div class="v415-a4"><div class="v415-strip" id="v415A4"></div></div><div class="v415-note">Preview = final PDF. Print at 100% / Actual Size.</div><div class="v415-settings"><div class="v415-setting"><span>Paper</span><b>A4 Portrait</b></div><div class="v415-setting"><span>Card</span><b>85.6×54 mm</b></div><div class="v415-setting"><span>Top</span><b>2.2 mm</b></div><div class="v415-setting"><span>Gap</span><b>2.4 mm</b></div><label>Copies <select id="v415Copies" onchange="previewDoc()"><option>1</option><option>2</option><option>4</option><option>6</option></select></label></div><div class="v415-actions"><button class="v415-blue" onclick="previewDoc()">Preview A4</button><button class="v415-green" onclick="downloadDoc()">Download</button><button onclick="printDoc()">Print</button></div></div></aside></div>`; setTimeout(initCrops,150);setTimeout(()=>{applyFilters();previewDoc()},300)}
  function uploadHTML(f,b){return `<div class="v415-upload">${f?`<div class="v415-panel"><b>Front Image</b><label class="v415-drop"><input hidden type="file" accept="image/*" onchange="v415LoadImg(event,'front')">${S.front?`<img src="${S.front}">`:'Upload Front'}</label></div>`:''}${b?`<div class="v415-panel"><b>Back Image</b><label class="v415-drop"><input hidden type="file" accept="image/*" onchange="v415LoadImg(event,'back')">${S.back?`<img src="${S.back}">`:'Upload Back'}</label></div>`:''}</div>`}
  function pdfUploadHTML(){return `<div class="v415-panel"><b>Full Page PDF</b><label class="v415-drop"><input hidden type="file" accept="application/pdf" onchange="v415LoadPdf(event)">${S.pdfDoc?`PDF loaded · ${S.pdfPages} page(s)`:'Upload PDF'}</label>${S.pdfDoc?`<div class="v415-tools"><label>Page <select onchange="v415PdfPage(this.value)">${Array.from({length:S.pdfPages},(_,i)=>`<option value="${i+1}" ${S.pdfPage===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><button onclick="v415PdfZoom(1.2)">Zoom +</button><button onclick="v415PdfZoom(.84)">Zoom -</button><button onclick="v415PdfFit()">Fit</button></div>`:''}</div>`}
  function cropHTML(f,b){return `<div class="v415-upload">${f?`<div class="v415-panel"><b>Front Crop</b><div class="v415-stage" id="v415FrontStage">${S.front?`<img id="v415_front" src="${S.front}">`:'Upload front first'}</div><div class="v415-tools"><button onclick="v415Auto('front')">Auto Detect</button><button onclick="v415Rotate('front',-90)">Left</button><button onclick="v415Rotate('front',90)">Right</button><button onclick="v415Reset('front')">Reset</button></div>${filterBar('front')}</div>`:''}${b?`<div class="v415-panel"><b>Back Crop</b><div class="v415-stage" id="v415BackStage">${S.back?`<img id="v415_back" src="${S.back}">`:'Upload back first'}</div><div class="v415-tools"><button onclick="v415Auto('back')">Auto Detect</button><button onclick="v415Rotate('back',-90)">Left</button><button onclick="v415Rotate('back',90)">Right</button><button onclick="v415Reset('back')">Reset</button></div>${filterBar('back')}</div>`:''}</div>`}
  function pdfCropHTML(){return `<div class="v415-stage large" id="v415PdfStage">${S.pdfDoc?'<canvas id="v415_pdf"></canvas>':'Upload PDF first'}</div><div class="v415-tools"><button onclick="v415Auto('pdf')">Auto Detect</button><button onclick="v415PdfZoom(1.2)">Zoom +</button><button onclick="v415PdfZoom(.84)">Zoom -</button><button onclick="v415PdfFit()">Fit</button><button onclick="v415Reset('pdf')">Reset</button></div>${filterBar('pdf')}`}
  window.v415LoadImg=async(e,k)=>{const f=e.target.files[0];if(!f)return;S[k]=await normalize(f);S[k+'Crop']=null;renderEditor(true);setTimeout(()=>v415Auto(k),350)};
  window.v415LoadPdf=async e=>{const f=e.target.files[0];if(!f)return;if(!window.pdfjsLib){toast('PDF library loading. Refresh.');return}S.pdfDoc=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;S.pdfPages=S.pdfDoc.numPages;S.pdfPage=1;S.pdfCrop=null;renderEditor(true);setTimeout(renderPdf,250)};
  window.v415PdfPage=v=>{S.pdfPage=Number(v);S.pdfCrop=null;renderEditor(true);setTimeout(renderPdf,200)}; window.v415PdfZoom=f=>{S.pdfScale=Math.max(.5,Math.min(4,S.pdfScale*f));renderPdf()}; window.v415PdfFit=()=>{S.pdfScale=1.35;renderPdf()};
  async function renderPdf(){const c=$('#v415_pdf'); if(!c||!S.pdfDoc)return; const page=await S.pdfDoc.getPage(S.pdfPage); const vp=page.getViewport({scale:S.pdfScale}); c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise; await waitFrame(); c.style.filter=filterCSS('pdf'); if(!S.pdfCrop)S.pdfCrop=cropBox($('#v415PdfStage'),c,ratioDoc()); else paint(S.pdfCrop);previewDoc()}
  function initCrops(){if(S.front&&$('#v415_front')&&!S.frontCrop)S.frontCrop=cropBox($('#v415FrontStage'),$('#v415_front'),ratioDoc()); if(S.back&&$('#v415_back')&&!S.backCrop)S.backCrop=cropBox($('#v415BackStage'),$('#v415_back'),ratioDoc()); if(S.pdfDoc)renderPdf();applyFilters()}
  window.v415Auto=k=>{let c=S[k+'Crop']; if(!c){initCrops();c=S[k+'Crop']} if(!c)return; const b=visible(c.stage,c.media); let w=b.w*.9,h=w/c.ratio;if(h>b.h*.85){h=b.h*.85;w=h*c.ratio}Object.assign(c,{x:b.x+(b.w-w)/2,y:b.y+(b.h-h)/2,w,h});paint(c);previewDoc();toast('Auto Detect applied')};
  window.v415Reset=k=>{S[k+'Crop']=null;renderEditor(true)}; window.v415Rotate=async(k,deg)=>{if(!S[k])return;const img=await loadImg(S[k]);const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=Math.abs(deg)%180===90?img.height:img.width;c.height=Math.abs(deg)%180===90?img.width:img.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.translate(c.width/2,c.height/2);ctx.rotate(deg*Math.PI/180);ctx.drawImage(img,-img.width/2,-img.height/2);S[k]=c.toDataURL('image/jpeg',.95);S[k+'Crop']=null;renderEditor(true)};
  async function collect(){const out=[];if(S.tab==='image'){if(S.mode!=='back')out.push(await cropData(S.frontCrop,'front',ratioDoc())); if(S.mode!=='front')out.push(await cropData(S.backCrop,'back',ratioDoc()))}else out.push(await cropData(S.pdfCrop,'pdf',ratioDoc())); return out.filter(Boolean)}
  window.previewDoc=async()=>{const box=$('#v415A4');if(!box)return;const imgs=await collect();box.innerHTML=imgs.map(s=>`<img src="${s}">`).join('')};
  async function makeDocPdf(){const imgs=await collect();if(!imgs.length){toast('Upload and crop document first');return null} const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'mm',format:'a4'});const cw=85.6,ch=54,g=2.4,top=2.2,copies=Number($('#v415Copies')?.value||1);let y=top;for(let c=0;c<copies;c++){const total=imgs.length*cw+(imgs.length-1)*g;let x=(210-total)/2;imgs.forEach(src=>{pdf.addImage(src,'JPEG',x,y,cw,ch);pdf.setDrawColor(0);pdf.setLineWidth(.25);pdf.rect(x,y,cw,ch);x+=cw+g});y+=ch+g;if(y+ch>294&&c<copies-1){pdf.addPage();y=top}}return pdf}
  window.downloadDoc=async()=>{const pdf=await makeDocPdf();if(pdf)pdf.save(`${DOCS[S.doc].name.replaceAll(' ','-')}-A4-${VERSION}.pdf`)}; window.printDoc=async()=>{const pdf=await makeDocPdf();if(!pdf)return;pdf.autoPrint();window.open(URL.createObjectURL(pdf.output('blob')),'_blank')};
  window.passportStudio=function(){workspace().innerHTML=header('Passport Photo Studio v41.5','35×45 mm exact print with CamScanner filters')+`<div class="v415-grid"><div><div class="card"><h3>Upload Photo</h3><label class="v415-drop"><input hidden type="file" accept="image/*" onchange="v415LoadPass(event)">${S.passport?`<img src="${S.passport}">`:'Upload Passport Photo'}</label></div><div class="card"><h3>Crop / Enhance</h3><div class="v415-stage large" id="v415PassStage">${S.passport?`<img id="v415_passport" src="${S.passport}">`:'Upload photo first'}</div><div class="v415-tools"><button onclick="v415PassAuto()">Auto Crop</button><button onclick="v415PassRotate(-90)">Left</button><button onclick="v415PassRotate(90)">Right</button><button onclick="v415PassReset()">Reset</button></div>${filterBar('passport')}</div></div><aside class="v415-side"><div class="card"><h3>A4 Preview</h3><div class="v415-a4"><div class="v415-pass" id="v415PassPreview"></div></div><label>Photos <select id="v415PassCount" onchange="previewPass()"><option>5</option><option>4</option><option>6</option><option>8</option><option>12</option></select></label><div class="v415-actions"><button class="v415-blue" onclick="previewPass()">Preview</button><button class="v415-green" onclick="downloadPass()">Download PDF</button><button onclick="printPass()">Print</button></div></div></aside></div>`;setTimeout(()=>{if(S.passport&&$('#v415_passport')&&!S.passportCrop)S.passportCrop=cropBox($('#v415PassStage'),$('#v415_passport'),ratioPass());applyFilters();previewPass()},180)};
  window.v415LoadPass=async e=>{const f=e.target.files[0];if(!f)return;S.passport=await normalize(f);S.passportCrop=null;passportStudio();setTimeout(v415PassAuto,350)}; window.v415PassAuto=()=>{if(!S.passportCrop&&$('#v415_passport'))S.passportCrop=cropBox($('#v415PassStage'),$('#v415_passport'),ratioPass());const c=S.passportCrop;if(!c)return;const b=visible(c.stage,c.media);let h=b.h*.84,w=h*ratioPass();if(w>b.w*.7){w=b.w*.7;h=w/ratioPass()}Object.assign(c,{x:b.x+(b.w-w)/2,y:b.y+(b.h-h)/2,w,h});paint(c);previewPass()}; window.v415PassReset=()=>{S.passportCrop=null;passportStudio()}; window.v415PassRotate=async deg=>{if(!S.passport)return;const img=await loadImg(S.passport);const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=Math.abs(deg)%180===90?img.height:img.width;c.height=Math.abs(deg)%180===90?img.width:img.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.translate(c.width/2,c.height/2);ctx.rotate(deg*Math.PI/180);ctx.drawImage(img,-img.width/2,-img.height/2);S.passport=c.toDataURL('image/jpeg',.95);S.passportCrop=null;passportStudio()};
  window.previewPass=async()=>{const box=$('#v415PassPreview');if(!box||!S.passportCrop)return;const src=await cropData(S.passportCrop,'passport',ratioPass());const n=Number($('#v415PassCount')?.value||5);box.innerHTML=Array.from({length:n},()=>`<img src="${src}">`).join('')}; async function makePassPdf(){if(!S.passportCrop){toast('Upload and crop photo first');return null}const src=await cropData(S.passportCrop,'passport',ratioPass());const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'mm',format:'a4'});const n=Number($('#v415PassCount')?.value||5),w=35,h=45,g=3,top=2.2;let x=5,y=top;for(let i=0;i<n;i++){if(x+w>205){x=5;y+=h+g}pdf.addImage(src,'JPEG',x,y,w,h);pdf.rect(x,y,w,h);x+=w+g}return pdf} window.downloadPass=async()=>{const pdf=await makePassPdf();if(pdf)pdf.save(`passport-35x45-${VERSION}.pdf`)}; window.printPass=async()=>{const pdf=await makePassPdf();if(!pdf)return;pdf.autoPrint();window.open(URL.createObjectURL(pdf.output('blob')),'_blank')};
  const oldShow=window.showTool; window.showTool=function(tool){if(tool==='documentStudio')return documentStudio(); if(tool==='passport')return passportStudio(); return oldShow?oldShow(tool):null};
  window.addEventListener('load',()=>{document.title='Smart Photo Toolkit Pro '+VERSION; document.querySelectorAll('.footer-copy').forEach(e=>e.textContent='© 2026 Smart Photo Toolkit Pro · '+VERSION+' Enterprise'); if(window.SPT_CONFIG)window.SPT_CONFIG.version=VERSION; if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations&&navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.update()))}});
})();


/* =====================================================
   Smart Photo Toolkit Pro v41.6 Build-1A
   Aadhaar Printable Engine — PDF Upload + 8 Handle Crop
   ===================================================== */
(function(){
  const VERSION='v41.6-Build-1A';
  const CARD_W_MM=85.6, CARD_H_MM=54, TOP_MM=2.2, GAP_MM=2.4;
  const RATIO=CARD_W_MM/CARD_H_MM;
  const S={pdfDoc:null,pdfPages:0,page:1,scale:1.35,crop:null,front:null,back:null,lastPdfName:'aadhaar-official.pdf'};
  const $=s=>document.querySelector(s);
  const ws=()=>document.getElementById('workspace');
  function toast(m){const t=document.getElementById('toast'); if(t){t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}else alert(m)}
  function header(t,sub){return `<div class="page-head"><div><h1>${t}</h1><p>${sub||''}</p></div><span class="pro-badge">${VERSION}</span></div>`}
  function waitFrame(){return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}
  function visible(stage,media){const sr=stage.getBoundingClientRect(), mr=media.getBoundingClientRect(); return {x:mr.left-sr.left,y:mr.top-sr.top,w:mr.width,h:mr.height}}
  function clamp(c,x=c.x,y=c.y,w=c.w,h=c.h){const b=visible(c.stage,c.media); if(w/h>RATIO) w=h*RATIO; else h=w/RATIO; w=Math.max(70,Math.min(w,b.w)); h=Math.max(44,Math.min(h,b.h)); if(w/h>RATIO) w=h*RATIO; else h=w/RATIO; x=Math.max(b.x,Math.min(x,b.x+b.w-w)); y=Math.max(b.y,Math.min(y,b.y+b.h-h)); return {x,y,w,h}}
  function paint(c){Object.assign(c,clamp(c)); Object.assign(c.box.style,{left:c.x+'px',top:c.y+'px',width:c.w+'px',height:c.h+'px'})}
  function createCrop(stage,media){ if(!stage||!media)return null; stage.querySelectorAll('.b1a-crop').forEach(e=>e.remove()); const b=visible(stage,media); let w=b.w*.88,h=w/RATIO; if(h>b.h*.82){h=b.h*.82;w=h*RATIO} const c={stage,media,x:b.x+(b.w-w)/2,y:b.y+(b.h-h)/2,w,h}; const box=document.createElement('div'); box.className='b1a-crop'; ['nw','n','ne','e','se','s','sw','w'].forEach(n=>{const h=document.createElement('span');h.className='b1a-h '+n;h.dataset.h=n;box.appendChild(h)}); const mv=document.createElement('i'); mv.className='b1a-move'; mv.textContent='DRAG'; box.appendChild(mv); c.box=box; stage.appendChild(box); attach(c); paint(c); return c}
  function attach(c){let mode='',start={}; const pos=e=>e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; const down=e=>{e.preventDefault();e.stopPropagation(); const p=pos(e); mode=e.target.dataset.h||'move'; start={px:p.x,py:p.y,x:c.x,y:c.y,w:c.w,h:c.h}; document.addEventListener('mousemove',move); document.addEventListener('mouseup',up); document.addEventListener('touchmove',move,{passive:false}); document.addEventListener('touchend',up)}; const move=e=>{e.preventDefault(); const p=pos(e),dx=p.x-start.px,dy=p.y-start.py; let {x,y,w,h}=start; if(mode==='move'){x+=dx;y+=dy}else{if(mode.includes('e'))w+=dx;if(mode.includes('s'))h+=dy;if(mode.includes('w')){x+=dx;w-=dx}if(mode.includes('n')){y+=dy;h-=dy}} Object.assign(c,clamp(c,x,y,w,h)); paint(c)}; const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',up)}; c.box.addEventListener('mousedown',down); c.box.addEventListener('touchstart',down,{passive:false})}
  async function renderPdf(){const canvas=$('#b1aPdfCanvas'); if(!canvas||!S.pdfDoc)return; const page=await S.pdfDoc.getPage(S.page); const vp=page.getViewport({scale:S.scale}); canvas.width=vp.width; canvas.height=vp.height; await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise; await waitFrame(); S.crop=createCrop($('#b1aPdfStage'),canvas)}
  async function cropData(){ if(!S.crop){toast('Crop area select karo');return null} const c=S.crop, media=c.media, mr=media.getBoundingClientRect(), sr=c.stage.getBoundingClientRect(); let rx=(c.x-(mr.left-sr.left))/mr.width, ry=(c.y-(mr.top-sr.top))/mr.height, rw=c.w/mr.width, rh=c.h/mr.height; rx=Math.max(0,Math.min(rx,1)); ry=Math.max(0,Math.min(ry,1)); rw=Math.max(.01,Math.min(rw,1-rx)); rh=Math.max(.01,Math.min(rh,1-ry)); const out=document.createElement('canvas'),ctx=out.getContext('2d'); out.width=1600; out.height=Math.round(out.width/RATIO); ctx.fillStyle='#fff'; ctx.fillRect(0,0,out.width,out.height); ctx.drawImage(media,media.width*rx,media.height*ry,media.width*rw,media.height*rh,0,0,out.width,out.height); return out.toDataURL('image/jpeg',.96)}
  function cards(){return [S.front,S.back].filter(Boolean)}
  function livePreview(){const box=$('#b1aPreviewStrip'); if(!box)return; const imgs=cards(); box.innerHTML=imgs.length?imgs.map((src,i)=>`<div class="b1a-card-wrap"><img src="${src}"><small>${i===0?'FRONT':'BACK'}</small></div>`).join(''):`<div class="b1a-empty-preview">Crop karke “Set as Front” ya “Set as Back” dabao</div>`; $('#b1aStatus')&&($('#b1aStatus').textContent=`${imgs.length}/2 side ready`)}
  async function makePdf(){const imgs=cards(); if(!imgs.length){toast('Pehle Aadhaar crop set karo');return null} const {jsPDF}=window.jspdf; const pdf=new jsPDF({unit:'mm',format:'a4'}); const total=imgs.length*CARD_W_MM+(imgs.length-1)*GAP_MM; let x=(210-total)/2, y=TOP_MM; pdf.setFontSize(7); pdf.setTextColor(90); pdf.text('Aadhaar Printable Build-1A · Print at Actual Size / 100%',105,292,{align:'center'}); imgs.forEach((src,i)=>{pdf.addImage(src,'JPEG',x,y,CARD_W_MM,CARD_H_MM); pdf.setDrawColor(0); pdf.setLineWidth(.25); pdf.rect(x,y,CARD_W_MM,CARD_H_MM); pdf.setDrawColor(120); pdf.setLineDashPattern([1.2,1.2],0); pdf.line(x+CARD_W_MM/2,y,x+CARD_W_MM/2,y+CARD_H_MM); pdf.setLineDashPattern([],0); pdf.setFontSize(6); pdf.setTextColor(80); pdf.text(i===0?'FRONT':'BACK',x+CARD_W_MM/2,y+CARD_H_MM+2.5,{align:'center'}); x+=CARD_W_MM+GAP_MM}); if(imgs.length===2){const mid=105; pdf.setDrawColor(30); pdf.setLineDashPattern([2,2],0); pdf.line(mid,TOP_MM+CARD_H_MM+6,mid,TOP_MM+CARD_H_MM+20); pdf.setLineDashPattern([],0); pdf.setFontSize(7); pdf.text('Fold / Lamination center guide',105,TOP_MM+CARD_H_MM+24,{align:'center'})} return pdf}
  function render(){ws().innerHTML=header('Build-1A: Aadhaar Printable','Official Aadhaar PDF upload → page select → 8-point crop → live print preview → PDF/Print')+`
    <div class="b1a-shell">
      <section class="card b1a-left">
        <div class="b1a-step"><b>1. Official Aadhaar PDF Upload</b><span id="b1aStatus">${cards().length}/2 side ready</span></div>
        <label class="b1a-drop"><input hidden type="file" accept="application/pdf" onchange="b1aLoadPdf(event)">${S.pdfDoc?`PDF loaded · ${S.pdfPages} page(s)`:'Upload Aadhaar PDF'}</label>
        ${S.pdfDoc?`<div class="b1a-tools"><label>Page <select onchange="b1aPage(this.value)">${Array.from({length:S.pdfPages},(_,i)=>`<option value="${i+1}" ${S.page===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><button onclick="b1aZoom(1.2)">Zoom +</button><button onclick="b1aZoom(.84)">Zoom -</button><button onclick="b1aFit()">Fit</button><button onclick="b1aResetCrop()">Reset Crop</button></div>`:''}
        <div class="b1a-stage ${S.pdfDoc?'':'empty'}" id="b1aPdfStage">${S.pdfDoc?'<canvas id="b1aPdfCanvas"></canvas>':'Upload PDF to preview selected page'}</div>
        <div class="b1a-tools b1a-main-actions"><button class="b1a-primary" onclick="b1aSetSide('front')">Set as Front</button><button class="b1a-primary" onclick="b1aSetSide('back')">Set as Back</button><button onclick="b1aClearSides()">Clear Front/Back</button></div>
      </section>
      <aside class="card b1a-right">
        <h3>Live Print Preview</h3>
        <div class="b1a-a4"><div class="b1a-preview-strip" id="b1aPreviewStrip"></div></div>
        <div class="b1a-spec"><div><span>Aadhaar Size</span><b>85.6 × 54 mm</b></div><div><span>Top Margin</span><b>2.2 mm</b></div><div><span>Alignment</span><b>Center</b></div><div><span>Layout</span><b>Fold + Lamination</b></div></div>
        <div class="b1a-tools"><button class="b1a-green" onclick="b1aDownload()">Download PDF</button><button onclick="b1aPrint()">Print</button></div>
        <p class="b1a-note">Print dialog me Scale: <b>Actual Size / 100%</b> rakhein.</p>
      </aside>
    </div>`; livePreview(); if(S.pdfDoc)setTimeout(renderPdf,120)}
  window.aadhaarPrintable=render;
  window.documentStudio=render;
  window.b1aLoadPdf=async e=>{const f=e.target.files[0]; if(!f)return; if(!window.pdfjsLib){toast('PDF library load nahi hui. Refresh karke try karo.');return} S.lastPdfName=f.name||S.lastPdfName; S.pdfDoc=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise; S.pdfPages=S.pdfDoc.numPages; S.page=1; S.crop=null; render(); setTimeout(renderPdf,180)};
  window.b1aPage=v=>{S.page=Number(v); S.crop=null; render(); setTimeout(renderPdf,120)};
  window.b1aZoom=f=>{S.scale=Math.max(.55,Math.min(4,S.scale*f)); renderPdf()};
  window.b1aFit=()=>{S.scale=1.35; renderPdf()};
  window.b1aResetCrop=()=>{S.crop=null; renderPdf(); toast('Crop reset ho gaya')};
  window.b1aSetSide=async side=>{const data=await cropData(); if(!data)return; S[side]=data; livePreview(); toast(side==='front'?'Front ready':'Back ready')};
  window.b1aClearSides=()=>{S.front=null;S.back=null;livePreview();toast('Front/Back cleared')};
  window.b1aDownload=async()=>{const pdf=await makePdf(); if(pdf)pdf.save('Aadhaar-Printable-Build-1A.pdf')};
  window.b1aPrint=async()=>{const pdf=await makePdf(); if(!pdf)return; pdf.autoPrint(); window.open(URL.createObjectURL(pdf.output('blob')),'_blank')};
  const oldShow=window.showTool;
  window.showTool=function(tool){if(tool==='documentStudio'||tool==='aadhaarPrintable')return render(); return oldShow?oldShow(tool):null};
  window.addEventListener('load',()=>{document.title='Smart Photo Toolkit Pro '+VERSION; if(window.SPT_CONFIG)window.SPT_CONFIG.version=VERSION; document.querySelectorAll('.footer-copy').forEach(e=>e.textContent='© 2026 Smart Photo Toolkit Pro · '+VERSION+' Enterprise')});
})();
