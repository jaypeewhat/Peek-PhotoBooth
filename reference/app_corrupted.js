// Peek Photobooth — core logic
'use strict';

// Layout blueprints (pixels at 300dpi where 1in ≈ 300px)
// We use a blueprint (may be larger than final) and scale uniformly to the final width/height
const layouts = [
  // 2×6 inches — Vertical Strip (600×1800 final, blueprint 600×2100)
  {
    id: 'strip-vertical',
    name: '2×6 Vertical Strip',
    width: 600, height: 1800,
    blueprintW: 600, blueprintH: 2100,
    slots: [
      { x: 0, y: 0, w: 600, h: 450 },
      { x: 0, y: 450, w: 600, h: 450 },
      { x: 0, y: 900, w: 600, h: 450 },
      { x: 0, y: 1350, w: 600, h: 450 }
    ],
    brand: { x: 0, y: 1800, w: 600, h: 300 },
    required: 4
  },
  // 2×6 inches — Horizontal Strip (1800×600 final, blueprint 2100×600)
  {
    id: 'strip-horizontal',
    name: '2×6 Horizontal Strip',
    width: 1800, height: 600,
    blueprintW: 2100, blueprintH: 600,
    slots: [
      { x: 0, y: 0, w: 450, h: 600 },
      { x: 450, y: 0, w: 450, h: 600 },
      { x: 900, y: 0, w: 450, h: 600 },
      { x: 1350, y: 0, w: 450, h: 600 }
    ],
    brand: { x: 1800, y: 0, w: 300, h: 600 },
    required: 4
  },
  // 4×6 inches — 2×2 Grid (1200×1800 final, blueprint 1200×2100)
  {
    id: 'postcard-grid',
    name: '4×6 Postcard Grid',
    width: 1200, height: 1800,
    blueprintW: 1200, blueprintH: 2100,
    slots: [
      { x: 0, y: 300, w: 600, h: 900 },
      { x: 600, y: 300, w: 600, h: 900 },
      { x: 0, y: 1200, w: 600, h: 900 },
      { x: 600, y: 1200, w: 600, h: 900 }
    ],
    brand: { x: 0, y: 0, w: 1200, h: 300 },
    required: 4
  },
  // 4×6 inches — Vertical Collage (4 tall slots, brand at top)
  {
    id: 'postcard-vertical',
    name: '4×6 Vertical Collage',
    width: 1200, height: 1800,
    blueprintW: 1200, blueprintH: 2100,
    slots: [
      { x: 0, y: 300, w: 1200, h: 450 },
      { x: 0, y: 750, w: 1200, h: 450 },
      { x: 0, y: 1200, w: 1200, h: 450 },
      { x: 0, y: 1650, w: 1200, h: 450 }
    ],
    brand: { x: 0, y: 0, w: 1200, h: 300 },
    required: 4
  },
  // 4×6 inches — Horizontal Collage (brand at right)
  {
    id: 'postcard-horizontal',
    name: '4×6 Horizontal Collage',
    width: 1800, height: 1200,
    blueprintW: 2100, blueprintH: 1200,
    slots: [
      { x: 0, y: 150, w: 450, h: 900 },
      { x: 450, y: 150, w: 450, h: 900 },
      { x: 900, y: 150, w: 450, h: 900 },
      { x: 1350, y: 150, w: 450, h: 900 }
    ],
    brand: { x: 1800, y: 0, w: 300, h: 1200 },
    required: 4
  }
];

const templates = [
  { id:'template-basic', name:'Plain Canvas', description:'Unadorned simplicity.', background:'#ffffff' },
  { id:'template-parchment', name:'Parchment', description:'Warm aged paper tone.', background:'linear-gradient(135deg,#f3e4c2,#e7d4ac,#f3e4c2)', frameStyle:'parchment' },
  { id:'template-classic-white', name:'Classic Ivory', description:'Soft ivory borders.', background:'#ece9e2', frameStyle:'classic-white' },
  { id:'template-gold', name:'Gilded', description:'Lustrous golden accents.', background:'linear-gradient(135deg,#1f1a11,#2b2416)', frameStyle:'gold' },
  { id:'template-ornate', name:'Ornate Filigree', description:'Baroque inspired etching.', background:'radial-gradient(circle at 40% 35%,#3a3327,#18140f 70%)', frameStyle:'ornate' },
  { id:'template-marble', name:'Marble Hall', description:'Subtle veined marble.', background:'linear-gradient(135deg,#f9f9f9,#e5e6ea 60%,#f0f1f4)', frameStyle:'marble' }
];

const state = {
  layout: null,
  template: null,
  mode: 'color',
  cameraStream: null,
  captures: [],
  selectedIndices: new Set(),
  sessionRunning: false,
  sessionIndex: 0,
  countdownTimer: null,
  captureInterval: 8000,
  totalCaptures: 9
};

function qs(sel){return document.querySelector(sel);} 
function ce(tag,cls){const el=document.createElement(tag); if(cls) el.className=cls; return el;}

function renderLayouts(){
  const wrap = qs('#layouts');
  if(!wrap) return;
  wrap.innerHTML = '';
  layouts.forEach(l => {
    const c = ce('div','choice');
    c.dataset.id = l.id;
    const thumb = ce('div','thumb-abs');
    thumb.style.aspectRatio = `${l.width} / ${l.height}`;
    thumb.style.position = 'relative';
    thumb.style.background = '#fff';
    thumb.style.border = '1px solid #ddd';
    const bw = l.blueprintW || l.width; const bh = l.blueprintH || l.height;
    const s = Math.min(l.width/bw, l.height/bh);
    const ox = (l.width - bw*s)/l.width/2; // fraction
    const oy = (l.height - bh*s)/l.height/2; // fraction
    const toPct = (val, total, scale, offsetFrac) => (offsetFrac + (val*scale)/total)*100;
    // Slots
    l.slots.forEach(r=>{
      const d = ce('div','slot-thumb');
      d.style.position='absolute';
      d.style.left = toPct(r.x, l.width, s, ox) + '%';
      d.style.top = toPct(r.y, l.height, s, oy) + '%';
      d.style.width = (r.w*s/l.width*100) + '%';
      d.style.height = (r.h*s/l.height*100) + '%';
      d.style.background = '#e9eef5';
      d.style.outline = '1px dashed #9aa7b2';
      thumb.appendChild(d);
    });
    // Brand
    if(l.brand){
      const b = ce('div','brand-thumb');
      b.style.position='absolute';
      b.style.left = toPct(l.brand.x, l.width, s, ox) + '%';
      b.style.top = toPct(l.brand.y, l.height, s, oy) + '%';
      b.style.width = (l.brand.w*s/l.width*100) + '%';
      b.style.height = (l.brand.h*s/l.height*100) + '%';
      b.style.background = '#f7e9c0';
      b.style.outline = '1px solid #c7a34b';
      b.title = 'Brand area';
      thumb.appendChild(b);
    }
    const title = ce('strong');
    title.textContent = l.name;
    c.appendChild(title);
    c.appendChild(thumb);
    c.addEventListener('click',()=>{
      state.layout = l; selectChoice('#layouts', c); updateSessionButton();
      const proceed = qs('#to-capture'); if(proceed) proceed.disabled = false;
      if(window.PageState) PageState.setLayout(l.id);
    });
    wrap.appendChild(c);
  });
  // Preselect if stored
  if(window.PageState){
    const stored = PageState.getLayout();
    if(stored){
      const card = wrap.querySelector(`[data-id="${stored}"]`);
      const match = layouts.find(l=>l.id===stored);
      if(card && match){ state.layout = match; card.classList.add('selected'); updateSessionButton(); }
    }
  }
}

function renderTemplates(){
  const wrap = qs('#templates');
  if(!wrap) return;
  wrap.innerHTML = '';
  templates.forEach(t => {
    const c = ce('div','choice');
    c.dataset.id = t.id;
    c.textContent = t.name;
    c.addEventListener('click',()=>{
      state.template = t; selectChoice('#templates', c);
      const btn = qs('#to-final'); if(btn) btn.disabled = false;
      if(window.PageState) PageState.setTemplate(t.id);
      buildTemplatePreview();
    });
    wrap.appendChild(c);
  });
  if(window.PageState){
    const stored = PageState.getTemplate();
    if(stored){
      const card = wrap.querySelector(`[data-id="${stored}"]`);
      const match = templates.find(t=>t.id===stored);
      if(card && match){ state.template = match; card.classList.add('selected'); const btn = qs('#to-final'); if(btn) btn.disabled = false; }
    }
  }
}

function selectChoice(scope, el){
  document.querySelectorAll(scope + ' .choice').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
}

function updateSessionButton(){
  const btn = qs('#start-session');
  if(btn) btn.disabled = !state.layout || state.sessionRunning;
}

function buildCollage(){
  const coll = qs('#collage');
  if(!coll || !state.layout) return;
  coll.classList.remove('frame-mode');
  [...coll.classList].filter(c=>c.startsWith('frame-')).forEach(c=>coll.classList.remove(c));
  coll.innerHTML = '';
  coll.style.filter = 'none';
  coll.style.position = 'relative';
  const l = state.layout;
  coll.style.aspectRatio = `${l.width} / ${l.height}`;
  coll.style.background = state.template ? state.template.background : '#ffffff';

  const urls = getSelectedCaptureURLs();
  const bw = l.blueprintW || l.width; const bh = l.blueprintH || l.height;
  const S = Math.min(l.width/bw, l.height/bh);
  const dx = (l.width - bw*S)/2; const dy = (l.height - bh*S)/2;
  const pct = (px, total) => (px/total*100) + '%';
  const toCanvasPct = (v, total, offset, scale) => ((offset + v*scale)/total*100) + '%';

  // Photo slots
  l.slots.forEach((r, idx)=>{
    const el = ce('div','slot-abs');
    el.style.position='absolute';
    el.style.left = toCanvasPct(r.x, l.width, dx, S);
    el.style.top = toCanvasPct(r.y, l.height, dy, S);
    el.style.width = pct(r.w*S, l.width);
    el.style.height = pct(r.h*S, l.height);
    el.style.overflow='hidden';
    const img = ce('img');
    img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
    if(urls[idx]){ img.src = urls[idx]; img.style.display='block'; } else { img.style.display='none'; }
    if(state.mode==='bw') img.style.filter='grayscale(1)';
    el.appendChild(img);
    coll.appendChild(el);
  });

  // Brand area preview text
  if(l.brand){
    const b = ce('div','brand-abs');
    b.style.position='absolute';
    b.style.left = toCanvasPct(l.brand.x, l.width, dx, S);
    b.style.top = toCanvasPct(l.brand.y, l.height, dy, S);
    b.style.width = pct(l.brand.w*S, l.width);
    b.style.height = pct(l.brand.h*S, l.height);
    b.style.display='flex'; b.style.alignItems='center'; b.style.justifyContent='center';
    b.style.color='#d4af37'; b.style.fontFamily='"Playfair Display", serif'; b.style.fontWeight='600';
    b.textContent='Peek';
    coll.appendChild(b);
  }
  applyFrameStyle();
  applyModeAll();
}

function createSlot(interactive=true){
  const slot = ce('label','slot');
  const input = ce('input');
  input.type = 'file';
  input.accept = 'image/*';
  const hint = ce('div','add-hint');
  hint.textContent = interactive ? 'Click to add photo' : '';
  const img = ce('img');
  img.style.display='none';
  if(interactive){
    input.addEventListener('change', e => {
      const file = input.files[0];
      if(!file) return;
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      img.style.display='block';
      hint.style.display='none';
      applyMode(img);
      slot.classList.add('filled');
    });
  } else {
    input.style.display='none';
  }
  slot.appendChild(input);
  slot.appendChild(img);
  slot.appendChild(hint);
  return slot;
}

function applyMode(img){
  if(state.mode === 'bw') img.style.filter = 'grayscale(1)';
  else img.style.filter = 'none';
}

function applyModeAll(){
  document.querySelectorAll('#collage img').forEach(applyMode);
}

function downloadCollage(){
  const l = state.layout; if(!l) return;
  const urls = getSelectedCaptureURLs();
  if(urls.length !== l.slots.length){
    alert('Please select exactly '+l.slots.length+' photos.');
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = l.width; canvas.height = l.height;
  const ctx = canvas.getContext('2d');
  // Background: CSS gradients fallback to white
  if(state.template && /gradient\(/i.test(state.template.background||'')) ctx.fillStyle = '#ffffff';
  else ctx.fillStyle = (state.template && state.template.background) || '#ffffff';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const bw = l.blueprintW || l.width; const bh = l.blueprintH || l.height;
  const S = Math.min(l.width/bw, l.height/bh);
  const ox = (l.width - bw*S)/2; const oy = (l.height - bh*S)/2;

  function drawCover(img, x,y,w,h){
    const iw = img.naturalWidth || 1; const ih = img.naturalHeight || 1;
    const scale = Math.max(w/iw, h/ih);
    const dw = iw*scale, dh = ih*scale;
    const dx = x + (w - dw)/2; const dy = y + (h - dh)/2;
    if(state.mode==='bw') ctx.filter = 'grayscale(1)'; else ctx.filter = 'none';
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
  }

  const imgs = urls.map(u=>{ const im = new Image(); im.crossOrigin='anonymous'; im.src=u; return im; });
  let loaded=0; const all = new Promise(res=>imgs.forEach(im=>{ im.onload=()=>{if(++loaded===imgs.length) res();}; im.onerror=()=>{if(++loaded===imgs.length) res();}; }));
  all.then(()=>{
    l.slots.forEach((r,i)=>{
      const x = ox + r.x*S; const y = oy + r.y*S; const w = r.w*S; const h = r.h*S;
      const im = imgs[i]; if(im) drawCover(im, x,y,w,h);
    });
    if(l.brand){
      const bx = ox + l.brand.x*S; const by = oy + l.brand.y*S; const bw2 = l.brand.w*S; const bh2 = l.brand.h*S;
      ctx.save();
      ctx.fillStyle = '#d4af37';
      const fs = Math.min(bh2*0.5, bw2*0.25);
      ctx.font = `${fs}px "Playfair Display", serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('Peek', bx + bw2/2, by + bh2/2);
      ctx.restore();
    }
    const a = document.createElement('a');
    a.download = 'peek-collage.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });
}

function init(){
  const page = document.body.dataset.page;
  if(page === 'layout'){
    renderLayouts();
    const toCap = qs('#to-capture');
    if(toCap) toCap.addEventListener('click', ()=>{ window.location.href = 'capture.html'; });
  }
  if(page === 'capture'){
    const layoutId = window.PageState && PageState.getLayout();
    if(!layoutId){ window.location.replace('layout.html'); return; }
    const startBtn = qs('#start-session');
    if(startBtn){ startBtn.disabled = false; startBtn.addEventListener('click', startSession); }
    const skip = qs('#skip-to-select');
    if(skip) skip.addEventListener('click', ()=>{ window.location.href = 'select.html'; });
  }
  if(page === 'select'){
    loadPersistedMedia();
    updateCapturedGrid();
    const toTemplates = qs('#to-templates');
    if(toTemplates) toTemplates.addEventListener('click', ()=>{ window.location.href = 'templates.html'; });
  }
  if(page === 'templates'){
    renderTemplates();
    const toMode = qs('#to-final');
    if(toMode) toMode.addEventListener('click', ()=>{ window.location.href = 'mode.html'; });
    buildTemplatePreview();
  }
  if(page === 'mode'){
    if(window.PageState){ state.mode = PageState.getMode(); const mi = document.querySelector(`input[name=mode][value=${state.mode}]`); if(mi) mi.checked = true; }
    document.querySelectorAll('input[name="mode"]').forEach(r=>{
      r.addEventListener('change', e=>{ state.mode = e.target.value; if(window.PageState) PageState.setMode(state.mode); });
    });
    const toFinal = qs('#to-final');
    if(toFinal) toFinal.addEventListener('click', ()=>{ window.location.href = 'final.html'; });
    buildTonePreview();
    document.querySelectorAll('input[name="mode"]').forEach(r=>{ r.addEventListener('change', ()=>buildTonePreview()); });
  }
  if(page === 'final'){
    loadPersistedMedia();
    const layoutId = PageState.getLayout();
    const layoutObj = layouts.find(l=>l.id===layoutId);
    if(layoutObj) state.layout = layoutObj;
    const templateId = PageState.getTemplate();
    const templateObj = templates.find(t=>t.id===templateId);
    if(templateObj) state.template = templateObj;
    buildCollage();
    const dl = qs('#download'); if(dl) dl.addEventListener('click', downloadCollage);
  }

  if(page === 'final'){
    document.querySelectorAll('input[name="mode"]').forEach(r=>{
      r.addEventListener('change', e=>{state.mode = e.target.value; if(window.PageState) PageState.setMode(state.mode); applyModeAll();});
    });
    if(window.PageState){ state.mode = PageState.getMode(); const modeInput = document.querySelector(`input[name=mode][value=${state.mode}]`); if(modeInput) modeInput.checked = true; }
  }
  const frameToggle = qs('#toggle-slot-frames');
  if(frameToggle){
    frameToggle.addEventListener('change', e=>{
      const coll = qs('#collage');
      if(e.target.checked) coll.classList.add('show-slot-frames'); else coll.classList.remove('show-slot-frames');
    });
  }
}

function getSelectedCaptureURLs(){
  if(!state.captures.length && window.PageState){ state.captures = PageState.getCaptures(); }
  if(!state.selectedIndices.size && window.PageState){ state.selectedIndices = new Set(PageState.getSelected()); }
  return Array.from(state.selectedIndices).slice(0,4).map(i=>state.captures[i]).filter(Boolean);
}

function buildTemplatePreview(){
  const host = qs('#template-preview'); if(!host) return;
  host.classList.remove('skeleton'); host.innerHTML='';
  const layoutId = PageState && PageState.getLayout();
  const l = layouts.find(x=>x.id===layoutId) || state.layout || layouts[0];
  const urls = getSelectedCaptureURLs();
  host.style.position='relative';
  host.style.aspectRatio = `${l.width} / ${l.height}`;
  host.style.background = state.template ? state.template.background : '#ffffff';
  const bw = l.blueprintW || l.width; const bh = l.blueprintH || l.height;
  const S = Math.min(l.width/bw, l.height/bh);
  const dx = (l.width - bw*S)/2; const dy = (l.height - bh*S)/2;
  const pct = (px, total) => (px/total*100) + '%';
  const toCanvasPct = (v, total, offset, scale) => ((offset + v*scale)/total*100) + '%';
  l.slots.forEach((r,i)=>{
    const el = document.createElement('div');
    el.className='slot-abs'; el.style.position='absolute';
    el.style.left = toCanvasPct(r.x, l.width, dx, S);
    el.style.top = toCanvasPct(r.y, l.height, dy, S);
    el.style.width = pct(r.w*S, l.width);
    el.style.height = pct(r.h*S, l.height);
    el.style.overflow='hidden';
    const img = document.createElement('img');
    if(urls[i]) img.src = urls[i];
    img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
    if(state.mode==='bw') img.style.filter='grayscale(1)';
    el.appendChild(img);
    host.appendChild(el);
  });
  if(l.brand){
    const b = document.createElement('div');
    b.style.position='absolute';
    b.style.left = toCanvasPct(l.brand.x, l.width, dx, S);
    b.style.top = toCanvasPct(l.brand.y, l.height, dy, S);
    b.style.width = pct(l.brand.w*S, l.width);
    b.style.height = pct(l.brand.h*S, l.height);
    b.style.display='flex'; b.style.alignItems='center'; b.style.justifyContent='center';
    b.style.color='#d4af37'; b.style.fontFamily='"Playfair Display", serif'; b.style.fontWeight='600';
    b.textContent='Peek';
    host.appendChild(b);
  }
  applyPreviewFrame(host);
}

function applyPreviewFrame(host){
  [...host.classList].filter(c=>c.startsWith('frame-')).forEach(c=>host.classList.remove(c));
  if(state.template && state.template.frameStyle){ host.classList.add('frame-'+state.template.frameStyle); }
  host.style.background = state.template ? state.template.background : '#ffffff';
}

function buildTonePreview(){
  const host = qs('#tone-preview'); if(!host) return;
  host.classList.remove('skeleton'); host.innerHTML='';
  const layoutId = PageState && PageState.getLayout();
  const l = layouts.find(x=>x.id===layoutId) || state.layout || layouts[0];
  const templateId = PageState && PageState.getTemplate();
  const templateObj = templates.find(t=>t.id===templateId);
  state.template = templateObj || state.template;
  const urls = getSelectedCaptureURLs();
  host.style.position='relative';
  host.style.aspectRatio = `${l.width} / ${l.height}`;
  host.style.background = state.template ? state.template.background : '#ffffff';
  const bw = l.blueprintW || l.width; const bh = l.blueprintH || l.height;
  const S = Math.min(l.width/bw, l.height/bh);
  const dx = (l.width - bw*S)/2; const dy = (l.height - bh*S)/2;
  const pct = (px, total) => (px/total*100) + '%';
  const toCanvasPct = (v, total, offset, scale) => ((offset + v*scale)/total*100) + '%';
  l.slots.forEach((r,i)=>{
    const el = document.createElement('div');
    el.className='slot-abs'; el.style.position='absolute';
    el.style.left = toCanvasPct(r.x, l.width, dx, S);
    el.style.top = toCanvasPct(r.y, l.height, dy, S);
    el.style.width = pct(r.w*S, l.width);
    el.style.height = pct(r.h*S, l.height);
    el.style.overflow='hidden';
    const img = document.createElement('img');
    if(urls[i]) img.src = urls[i];
    img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
    if(state.mode==='bw') img.style.filter='grayscale(1)';
    el.appendChild(img);
    host.appendChild(el);
  });
  if(l.brand){
    const b = document.createElement('div');
    b.style.position='absolute';
    b.style.left = toCanvasPct(l.brand.x, l.width, dx, S);
    b.style.top = toCanvasPct(l.brand.y, l.height, dy, S);
    b.style.width = pct(l.brand.w*S, l.width);
    b.style.height = pct(l.brand.h*S, l.height);
    b.style.display='flex'; b.style.alignItems='center'; b.style.justifyContent='center';
    b.style.color='#d4af37'; b.style.fontFamily='"Playfair Display", serif'; b.style.fontWeight='600';
    b.textContent='Peek';
    host.appendChild(b);
  }
  applyPreviewFrame(host);
}

window.addEventListener('DOMContentLoaded', init);

// Session camera logic (auto capture 9 photos)
function setupSessionCamera(){ /* reserved */ }

async function startSession(){
  if(state.sessionRunning) return;
  state.captures = [];
  state.selectedIndices.clear();
  updateSelectedCount();
  state.sessionIndex = 0;
  state.sessionRunning = true;
  updateSessionButton();
  const panel = qs('#camera-panel'); if(panel) panel.hidden = false;
  setSessionStatus('Starting camera...');
  const video = qs('#camera');
  try {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ setCamStatus('Camera API not supported.'); return; }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width:{ideal:1280}, height:{ideal:720}, facingMode:'user' }, audio:false });
    state.cameraStream = stream; if(video) video.srcObject = stream; setCamStatus('Camera ready.');
    scheduleNextCapture();
  } catch(err){ setCamStatus('Camera error: '+err.message); state.sessionRunning = false; updateSessionButton(); }
}

function scheduleNextCapture(){
  if(state.sessionIndex >= state.totalCaptures){ finishSession(); return; }
  const remaining = state.totalCaptures - state.sessionIndex;
  setSessionStatus(`Capturing ${remaining} remaining...`);
  startCountdown(5, ()=>{ // last 5s visible countdown inside 8s cycle
    doAutoCapture();
    setTimeout(()=>scheduleNextCapture(), state.captureInterval - 5000);
  });
}

function startCountdown(seconds, cb){
  const el = qs('#countdown'); let s = seconds; if(el) el.textContent = s;
  clearInterval(state.countdownTimer);
  state.countdownTimer = setInterval(()=>{
    s--; if(s<=0){ clearInterval(state.countdownTimer); if(el) el.textContent = ''; cb(); } else { if(el) el.textContent = s; }
  },1000);
}

function doAutoCapture(){
  if(!state.cameraStream) return;
  const video = qs('#camera'); if(!video) return;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  canvas.toBlob(blob=>{
    if(!blob) return;
    const url = URL.createObjectURL(blob);
    state.captures.push(url);
    if(window.PageState){
      const reader = new FileReader();
      reader.onload = ()=>{ PageState.setCaptures([...PageState.getCaptures(), reader.result]); };
      reader.readAsDataURL(blob);
    }
    state.sessionIndex++;
    updateCapturedGrid();
  }, 'image/jpeg', 0.9);
}

function finishSession(){
  state.sessionRunning = false; updateSessionButton();
  if(state.cameraStream){ state.cameraStream.getTracks().forEach(t=>t.stop()); state.cameraStream = null; }
  setCamStatus('Session complete.'); setSessionStatus('Captured all photos!');
  if(window.PageState){ PageState.setCaptures(state.captures); }
  window.location.href = 'select.html';
}

function updateCapturedGrid(){
  const grid = qs('#captured-grid'); if(!grid) return;
  grid.innerHTML = '';
  state.captures.forEach((url, idx)=>{
    const div = ce('div','cap');
    if(state.selectedIndices.has(idx)) div.classList.add('selected');
    const img = ce('img'); img.src = url; div.appendChild(img);
    if(document.body.dataset.page === 'select'){
      const rb = ce('button','retake-btn'); rb.type = 'button'; rb.textContent = 'Retake';
      rb.addEventListener('click', e=>{ e.stopPropagation(); retakeCapture(idx, rb); });
      div.appendChild(rb);
    }
    div.addEventListener('click', ()=>toggleSelectCapture(idx));
    grid.appendChild(div);
  });
  const nextBtn = qs('#to-templates'); if(nextBtn) nextBtn.disabled = state.selectedIndices.size !== 4;
}

async function retakeCapture(index, button){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ alert('Camera unsupported for retake.'); return; }
  button.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width:{ideal:1280}, height:{ideal:720}, facingMode:'user' }, audio:false });
    const trackStop = () => stream.getTracks().forEach(t=>t.stop());
    const video = document.createElement('video'); video.muted = true; video.srcObject = stream; await video.play(); await new Promise(r=>requestAnimationFrame(r));
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
    canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height); trackStop();
    canvas.toBlob(blob => {
      if(!blob){ button.disabled = false; return; }
      const url = URL.createObjectURL(blob);
      const old = state.captures[index]; if(old && old.startsWith('blob:')) try{ URL.revokeObjectURL(old); }catch(e){}
      state.captures[index] = url;
      if(window.PageState){ const caps = PageState.getCaptures(); caps[index] = url; PageState.setCaptures(caps); }
      updateCapturedGrid();
    }, 'image/jpeg', 0.9);
  } catch(err){ alert('Retake failed: '+ err.message); } finally { button.disabled = false; }
}

function toggleSelectCapture(idx){
  if(state.selectedIndices.has(idx)) state.selectedIndices.delete(idx);
  else { if(state.selectedIndices.size >= 4) return; state.selectedIndices.add(idx); }
  updateCapturedGrid(); updateSelectedCount(); if(window.PageState) PageState.setSelected(Array.from(state.selectedIndices));
}

function updateSelectedCount(){ const el = qs('#selected-count'); if(el) el.textContent = state.selectedIndices.size; }

function showStep(id){ /* multi-page flow */ }

function loadPersistedMedia(){
  if(!window.PageState) return;
  const storedCaps = PageState.getCaptures(); if(storedCaps && storedCaps.length){ state.captures = storedCaps; }
  const sel = PageState.getSelected(); if(sel && sel.length){ state.selectedIndices = new Set(sel); }
  const layoutId = PageState.getLayout(); const layoutObj = layouts.find(l=>l.id===layoutId); if(layoutObj) state.layout = layoutObj;
  const templateId = PageState.getTemplate(); const templateObj = templates.find(t=>t.id===templateId); if(templateObj) state.template = templateObj;
}

function setCamStatus(msg){ const el = qs('#camera-status'); if(el) el.textContent = msg || ''; }
function setSessionStatus(msg){ const el = qs('#session-status'); if(el) el.textContent = msg || ''; }

function applyFrameStyle(){ const coll = qs('#collage'); if(!state.template || !state.template.frameStyle) return; coll.classList.add('frame-' + state.template.frameStyle); }

window.addEventListener('DOMContentLoaded', init);

function updateSessionButton(){
  const btn = qs('#start-session');
  if(btn) btn.disabled = !state.layout || state.sessionRunning;
}

function buildCollage(){
  const coll = qs('#collage');
  coll.classList.remove('frame-mode');
  [...coll.classList].filter(c=>c.startsWith('frame-')).forEach(c=>coll.classList.remove(c));
  coll.innerHTML = '';
  coll.style.filter = 'none';
  if(state.template) coll.style.background = state.template.background;

  // For final montage we always use selected 4 in chosen layout grid
  const selected = Array.from(state.selectedIndices).slice(0,4).map(i=>state.captures[i]);
  coll.style.gridTemplateColumns = `repeat(${state.layout.cols}, 1fr)`;
  coll.style.gridTemplateRows = `repeat(${state.layout.rows}, 1fr)`;
  selected.forEach(blobURL => {
    const slot = createSlot(false); // non-interactive
    const img = slot.querySelector('img');
    const hint = slot.querySelector('.add-hint');
    img.src = blobURL;
    img.style.display='block';
    hint.style.display='none';
    slot.classList.add('filled');
    coll.appendChild(slot);
  });
  applyFrameStyle();
  applyModeAll();
}

function createSlot(interactive=true){
  const slot = ce('label','slot');
  const input = ce('input');
  input.type = 'file';
  input.accept = 'image/*';
  const hint = ce('div','add-hint');
  hint.textContent = interactive ? 'Click to add photo' : '';
  const img = ce('img');
  img.style.display='none';
  if(interactive){
    input.addEventListener('change', e => {
      const file = input.files[0];
      if(!file) return;
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      img.style.display='block';
      hint.style.display='none';
      applyMode(img);
      slot.classList.add('filled');
    });
  } else {
    input.style.display='none';
  }
  slot.appendChild(input);
  slot.appendChild(img);
  slot.appendChild(hint);
  return slot;
}

function applyMode(img){
  if(state.mode === 'bw'){
    img.style.filter = 'grayscale(1)';
  } else {
    img.style.filter = 'none';
  }
}

function applyModeAll(){
  document.querySelectorAll('#collage img').forEach(applyMode);
}

function downloadCollage(){
  const coll = qs('#collage');
  const imgs = Array.from(coll.querySelectorAll('.slot img')).filter(i=>i.style.display!=='none');
  if(imgs.length !== state.layout.slots){
    alert('Collage not complete yet.');
    return;
  }
  const canvasW = state.layout.width;
  const canvasH = state.layout.height;
  const canvas = document.createElement('canvas');
  canvas.width = canvasW; canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = (state.template && state.template.background) || '#ffffff';
  ctx.fillRect(0,0,canvasW,canvasH);
  const cellW = canvasW / state.layout.cols;
  const cellH = canvasH / state.layout.rows;
  let index = 0;
  for(let r=0;r<state.layout.rows;r++){
    for(let c=0;c<state.layout.cols;c++){
      const img = imgs[index];
      const ratio = Math.min(img.naturalWidth / cellW, img.naturalHeight / cellH);
      const drawW = img.naturalWidth / ratio;
      const drawH = img.naturalHeight / ratio;
      const dx = c * cellW + (cellW - drawW)/2;
      const dy = r * cellH + (cellH - drawH)/2;
      ctx.filter = state.mode==='bw' ? 'grayscale(1)' : 'none';
      ctx.drawImage(img, dx, dy, drawW, drawH);
      index++;
    }
  }
  const a = document.createElement('a');
  a.download = 'collage.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function init(){
  const page = document.body.dataset.page;
  if(page === 'layout'){
    renderLayouts();
    const toCap = qs('#to-capture');
    if(toCap) toCap.addEventListener('click', ()=>{ window.location.href = 'capture.html'; });
  }
  if(page === 'capture'){
    // ensure layout chosen
    const layoutId = window.PageState && PageState.getLayout();
    if(!layoutId){ window.location.replace('layout.html'); return; }
    // start button
    const startBtn = qs('#start-session');
    if(startBtn){
      startBtn.disabled = false;
      startBtn.addEventListener('click', startSession);
    }
    const skip = qs('#skip-to-select');
    if(skip) skip.addEventListener('click', ()=>{ window.location.href = 'select.html'; });
  }
  if(page === 'select'){
    loadPersistedMedia();
    updateCapturedGrid();
    const toTemplates = qs('#to-templates');
    if(toTemplates) toTemplates.addEventListener('click', ()=>{ window.location.href = 'templates.html'; });
  }
  if(page === 'templates'){
    renderTemplates();
    const toMode = qs('#to-final');
    if(toMode) toMode.addEventListener('click', ()=>{ window.location.href = 'mode.html'; });
    buildTemplatePreview();
  }
  if(page === 'mode'){
    // restore mode if any
    if(window.PageState){ state.mode = PageState.getMode(); const mi = document.querySelector(`input[name=mode][value=${state.mode}]`); if(mi) mi.checked = true; }
    document.querySelectorAll('input[name="mode"]').forEach(r=>{
      r.addEventListener('change', e=>{ state.mode = e.target.value; if(window.PageState) PageState.setMode(state.mode); });
    });
    const toFinal = qs('#to-final');
    if(toFinal) toFinal.addEventListener('click', ()=>{ window.location.href = 'final.html'; });
    buildTonePreview();
    document.querySelectorAll('input[name="mode"]').forEach(r=>{
      r.addEventListener('change', ()=>buildTonePreview());
    });
  }
  if(page === 'final'){
    loadPersistedMedia();
    // Need layout & template to rebuild collage
    const layoutId = PageState.getLayout();
    const layoutObj = layouts.find(l=>l.id===layoutId);
    if(layoutObj) state.layout = layoutObj;
    const templateId = PageState.getTemplate();
    const templateObj = templates.find(t=>t.id===templateId);
    if(templateObj) state.template = templateObj;
    buildCollage();
    qs('#download').addEventListener('click', downloadCollage);
  }

  // Mode toggle present on final only
  if(page === 'final'){
    document.querySelectorAll('input[name="mode"]').forEach(r=>{
      r.addEventListener('change', e=>{state.mode = e.target.value; if(window.PageState) PageState.setMode(state.mode); applyModeAll();});
    });
    if(window.PageState){ state.mode = PageState.getMode(); const modeInput = document.querySelector(`input[name=mode][value=${state.mode}]`); if(modeInput) modeInput.checked = true; }
  }
  const frameToggle = qs('#toggle-slot-frames');
  if(frameToggle){
    frameToggle.addEventListener('change', e=>{
      const coll = qs('#collage');
      if(e.target.checked) coll.classList.add('show-slot-frames'); else coll.classList.remove('show-slot-frames');
    });
  }
}

function getSelectedCaptureURLs(){
  if(!state.captures.length && window.PageState){ state.captures = PageState.getCaptures(); }
  if(!state.selectedIndices.size && window.PageState){ state.selectedIndices = new Set(PageState.getSelected()); }
  return Array.from(state.selectedIndices).slice(0,4).map(i=>state.captures[i]).filter(Boolean);
}

function buildTemplatePreview(){
  const host = qs('#template-preview');
  if(!host) return;
  host.classList.remove('skeleton');
  host.innerHTML='';
  // Layout reference
  const layoutId = PageState && PageState.getLayout();
  const layoutObj = layouts.find(l=>l.id===layoutId) || state.layout || layouts[0];
  const urls = getSelectedCaptureURLs();
  host.style.display='grid';
  host.style.aspectRatio = '3/4';
  host.style.gridTemplateColumns = `repeat(${layoutObj.cols},1fr)`;
  host.style.gridTemplateRows = `repeat(${layoutObj.rows},1fr)`;
  urls.forEach(u=>{
    const slot = document.createElement('div');
    slot.className='slot';
    const img = document.createElement('img');
    img.src = u;
    if(state.mode==='bw') img.style.filter='grayscale(1)';
    slot.appendChild(img);
    host.appendChild(slot);
  });
  applyPreviewFrame(host);
}

function applyPreviewFrame(host){
  // Clear any prior frame-* classes
  [...host.classList].filter(c=>c.startsWith('frame-')).forEach(c=>host.classList.remove(c));
  if(state.template && state.template.frameStyle){
    host.classList.add('frame-'+state.template.frameStyle);
  }
  host.style.background = state.template ? state.template.background : '#ffffff';
}

function buildTonePreview(){
  const host = qs('#tone-preview');
  if(!host) return;
  host.classList.remove('skeleton');
  host.innerHTML='';
  const layoutId = PageState && PageState.getLayout();
  const layoutObj = layouts.find(l=>l.id===layoutId) || state.layout || layouts[0];
  const templateId = PageState && PageState.getTemplate();
  const templateObj = templates.find(t=>t.id===templateId);
  state.template = templateObj || state.template;
  const urls = getSelectedCaptureURLs();
  host.style.display='grid';
  host.style.aspectRatio = '3/4';
  host.style.gridTemplateColumns = `repeat(${layoutObj.cols},1fr)`;
  host.style.gridTemplateRows = `repeat(${layoutObj.rows},1fr)`;
  urls.forEach(u=>{
    const slot = document.createElement('div');
    slot.className='slot';
    const img = document.createElement('img');
    img.src = u;
    if(state.mode==='bw') img.style.filter='grayscale(1)';
    slot.appendChild(img);
    host.appendChild(slot);
  });
  applyPreviewFrame(host);
}

window.addEventListener('DOMContentLoaded', init);

// Session camera logic (auto capture 9 photos)
function setupSessionCamera(){
  // nothing needed yet beyond permissions when session starts
}

async function startSession(){
  if(state.sessionRunning) return;
  state.captures = [];
  state.selectedIndices.clear();
  updateSelectedCount();
  state.sessionIndex = 0;
  state.sessionRunning = true;
  updateSessionButton();
  // ensure layout page only
  const panel = qs('#camera-panel');
  panel.hidden = false;
  setSessionStatus('Starting camera...');
  const video = qs('#camera');
  try {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      setCamStatus('Camera API not supported.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width:{ideal:1280}, height:{ideal:720}, facingMode:'user' }, audio:false });
    state.cameraStream = stream;
    video.srcObject = stream;
    setCamStatus('Camera ready.');
  scheduleNextCapture();
  } catch(err){
    setCamStatus('Camera error: '+err.message);
    state.sessionRunning = false;
    updateSessionButton();
  }
}

function scheduleNextCapture(){
  if(state.sessionIndex >= state.totalCaptures){
    finishSession();
    return;
  }
  const remaining = state.totalCaptures - state.sessionIndex;
  setSessionStatus(`Capturing ${remaining} remaining...`);
  startCountdown(5, ()=>{ // last 5s visible countdown inside 8s cycle
    doAutoCapture();
    setTimeout(()=>scheduleNextCapture(), state.captureInterval - 5000); // rest of 8s after countdown
  });
}

function startCountdown(seconds, cb){
  const el = qs('#countdown');
  let s = seconds;
  el.textContent = s;
  clearInterval(state.countdownTimer);
  state.countdownTimer = setInterval(()=>{
    s--;
    if(s<=0){
      clearInterval(state.countdownTimer);
      el.textContent = '';
      cb();
    } else {
      el.textContent = s;
    }
  },1000);
}

function doAutoCapture(){
  if(!state.cameraStream) return;
  const video = qs('#camera');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  canvas.toBlob(blob=>{
    if(!blob) return;
    const url = URL.createObjectURL(blob);
    state.captures.push(url);
    if(window.PageState){
      // Convert to data URL for persistence (draw again)
      const reader = new FileReader();
      reader.onload = ()=>{ PageState.setCaptures([...PageState.getCaptures(), reader.result]); };
      reader.readAsDataURL(blob);
    }
    state.sessionIndex++;
    updateCapturedGrid();
  }, 'image/jpeg', 0.9);
}

function finishSession(){
  state.sessionRunning = false;
  updateSessionButton();
  // stop camera
  if(state.cameraStream){
    state.cameraStream.getTracks().forEach(t=>t.stop());
    state.cameraStream = null;
  }
  setCamStatus('Session complete.');
  setSessionStatus('Captured all photos!');
  if(window.PageState){
    PageState.setCaptures(state.captures); // just in case
  }
  window.location.href = 'select.html';
}

function updateCapturedGrid(){
  const grid = qs('#captured-grid');
  if(!grid) return;
  grid.innerHTML = '';
  state.captures.forEach((url, idx)=>{
    const div = ce('div','cap');
    if(state.selectedIndices.has(idx)) div.classList.add('selected');
    const img = ce('img');
    img.src = url;
    div.appendChild(img);
    // retake button (only on select page)
    if(document.body.dataset.page === 'select'){
      const rb = ce('button','retake-btn');
      rb.type = 'button';
      rb.textContent = 'Retake';
      rb.addEventListener('click', e=>{ e.stopPropagation(); retakeCapture(idx, rb); });
      div.appendChild(rb);
    }
    div.addEventListener('click', ()=>toggleSelectCapture(idx));
    grid.appendChild(div);
  });
  // enable next if 4 selected
  const nextBtn = qs('#to-templates');
  if(nextBtn) nextBtn.disabled = state.selectedIndices.size !== 4;
}

async function retakeCapture(index, button){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    alert('Camera unsupported for retake.');
    return;
  }
  button.disabled = true;
  try {
    // Short-lived stream for single snapshot
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width:{ideal:1280}, height:{ideal:720}, facingMode:'user' }, audio:false });
    const trackStop = () => stream.getTracks().forEach(t=>t.stop());
    const video = document.createElement('video');
    video.muted = true;
    video.srcObject = stream;
    await video.play();
    await new Promise(r=>requestAnimationFrame(r));
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
    trackStop();
    canvas.toBlob(blob => {
      if(!blob){ button.disabled = false; return; }
      const url = URL.createObjectURL(blob);
      // revoke old URL
      const old = state.captures[index];
      if(old && old.startsWith('blob:')) try{ URL.revokeObjectURL(old); }catch(e){}
      state.captures[index] = url;
      if(window.PageState){
        const caps = PageState.getCaptures();
        caps[index] = url; // storing blob URL (session will persist only locally)
        PageState.setCaptures(caps);
      }
      updateCapturedGrid();
    }, 'image/jpeg', 0.9);
  } catch(err){
    alert('Retake failed: '+ err.message);
  } finally {
    button.disabled = false;
  }
}

function toggleSelectCapture(idx){
  if(state.selectedIndices.has(idx)){
    state.selectedIndices.delete(idx);
  } else {
    if(state.selectedIndices.size >= 4) return; // max
    state.selectedIndices.add(idx);
  }
  updateCapturedGrid();
  updateSelectedCount();
  if(window.PageState) PageState.setSelected(Array.from(state.selectedIndices));
}

function updateSelectedCount(){
  const el = qs('#selected-count');
  if(el) el.textContent = state.selectedIndices.size;
}

function showStep(id){/* replaced by multi-page navigation */}

function loadPersistedMedia(){
  if(!window.PageState) return;
  // captures may be data URLs
  const storedCaps = PageState.getCaptures();
  if(storedCaps && storedCaps.length){
    state.captures = storedCaps;
  }
  const sel = PageState.getSelected();
  if(sel && sel.length){ state.selectedIndices = new Set(sel); }
  const layoutId = PageState.getLayout();
  const layoutObj = layouts.find(l=>l.id===layoutId);
  if(layoutObj) state.layout = layoutObj;
  const templateId = PageState.getTemplate();
  const templateObj = templates.find(t=>t.id===templateId);
  if(templateObj) state.template = templateObj;
}

// legacy captureToSlot removed in new flow

function setCamStatus(msg){
  const el = qs('#camera-status');
  if(el) el.textContent = msg || '';
}

function setSessionStatus(msg){
  const el = qs('#session-status');
  if(el) el.textContent = msg || '';
}

function applyFrameStyle(){
  const coll = qs('#collage');
  if(!state.template || !state.template.frameStyle) return;
  coll.classList.add('frame-' + state.template.frameStyle);
}
