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
  totalCaptures: 4
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
    
    // Create the layout preview
    const preview = ce('div','layout-preview');
  preview.style.position = 'relative';
  preview.style.aspectRatio = `${l.width} / ${l.height}`;
  preview.style.background = '#fbf9f2';
  preview.style.border = '1px solid #eadfca';
  preview.style.borderRadius = '10px';
  preview.style.overflow = 'hidden';
  preview.style.width = '160px';
  preview.style.height = 'auto';
  preview.style.margin = '0 auto 16px';
    
    // Add ornamental corners
  // Minimal theme: remove ornamental corners
    
    const bw = l.blueprintW || l.width; 
    const bh = l.blueprintH || l.height;
    const s = Math.min(l.width/bw, l.height/bh);
    const ox = (l.width - bw*s)/l.width/2;
    const oy = (l.height - bh*s)/l.height/2;
    const toPct = (val, total, scale, offsetFrac) => (offsetFrac + (val*scale)/total)*100;
    
    // Add photo slots with proper spacing
    l.slots.forEach((r, idx) => {
      const slot = ce('div','slot-thumb');
      slot.style.position = 'absolute';
      
      // Reduce horizontal spacing but keep vertical spacing good
      const spacingX = 0.01; // 1% horizontal spacing on each side  
      const spacingY = 0.015; // 1.5% vertical spacing (keep current)
      const slotX = toPct(r.x, l.width, s, ox) + (r.w*s/l.width*100) * spacingX;
      const slotY = toPct(r.y, l.height, s, oy) + (r.h*s/l.height*100) * spacingY;
      const slotW = (r.w*s/l.width*100) * (1 - spacingX * 2);
      const slotH = (r.h*s/l.height*100) * (1 - spacingY * 2);
      
      slot.style.left = slotX + '%';
      slot.style.top = slotY + '%';
      slot.style.width = slotW + '%';
      slot.style.height = slotH + '%';
  slot.style.background = '#f2efe7';
  slot.style.border = '1px solid #e2dccb';
  slot.style.borderRadius = '6px';
      slot.style.display = 'flex';
      slot.style.alignItems = 'center';
      slot.style.justifyContent = 'center';
      slot.style.fontSize = '12px';
      slot.style.fontWeight = '700';
      slot.style.color = '#8b4513';
      slot.style.fontFamily = '"Playfair Display", serif';
      slot.style.textShadow = '0 1px 2px rgba(255,255,255,0.8)';
      slot.style.boxShadow = 'inset 0 2px 4px rgba(199,148,31,0.3), 0 2px 4px rgba(0,0,0,0.2)';
      slot.textContent = idx + 1;
      preview.appendChild(slot);
    });
    
    // Add brand area
    if(l.brand){
      const brand = ce('div','brand-thumb');
      brand.style.position = 'absolute';
      brand.style.left = toPct(l.brand.x, l.width, s, ox) + '%';
      brand.style.top = toPct(l.brand.y, l.height, s, oy) + '%';
      brand.style.width = (l.brand.w*s/l.width*100) + '%';
      brand.style.height = (l.brand.h*s/l.height*100) + '%';
  brand.style.background = '#fbf7eb';
  brand.style.border = '1px solid #d4af37';
      brand.style.borderRadius = '6px';
      brand.style.display = 'flex';
      brand.style.alignItems = 'center';
      brand.style.justifyContent = 'center';
      brand.style.fontSize = '10px';
      brand.style.fontWeight = '700';
      brand.style.color = '#2c1810';
      brand.style.fontFamily = '"Playfair Display", serif';
      brand.style.textShadow = '0 1px 1px rgba(255,255,255,0.5)';
      brand.style.boxShadow = 'inset 0 2px 4px rgba(244,208,63,0.4), 0 2px 4px rgba(0,0,0,0.3)';
      brand.textContent = 'Peek';
      preview.appendChild(brand);
    }
    
    const title = ce('div','layout-title');
    title.textContent = l.name;
    title.style.fontSize = '14px';
    title.style.fontWeight = '600';
    title.style.textAlign = 'center';
  title.style.color = '#7b6a4e';
  title.style.marginTop = '12px';
  title.style.fontFamily = '"Playfair Display", serif';
  title.style.textShadow = 'none';
    title.style.letterSpacing = '0.5px';
    
    c.appendChild(preview);
    c.appendChild(title);
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
    
    // Create visual preview of template with layout
    const layoutId = PageState && PageState.getLayout();
    const l = layouts.find(x=>x.id===layoutId) || state.layout || layouts[0];
    
    const preview = ce('div','template-preview');
    preview.style.position = 'relative';
    preview.style.aspectRatio = `${l.width} / ${l.height}`;
    preview.style.background = t.background;
  preview.style.border = '1px solid #e8e1d0';
  preview.style.borderRadius = '8px';
    preview.style.overflow = 'hidden';
    preview.style.width = '120px';
    preview.style.margin = '0 auto 8px';
    
    // Add frame class if template has frameStyle
    if(t.frameStyle) preview.classList.add('frame-' + t.frameStyle);
    
    const bw = l.blueprintW || l.width; const bh = l.blueprintH || l.height;
    const S = Math.min(l.width/bw, l.height/bh);
    const dx = (l.width - bw*S)/2; const dy = (l.height - bh*S)/2;
    const pct = (px, total) => (px/total*100) + '%';
    const toCanvasPct = (v, total, offset, scale) => ((offset + v*scale)/total*100) + '%';
    
    // Show photo slots
    l.slots.forEach((r,i)=>{
      const slot = ce('div','slot-mini');
      slot.style.position='absolute';
      slot.style.left = toCanvasPct(r.x, l.width, dx, S);
      slot.style.top = toCanvasPct(r.y, l.height, dy, S);
      slot.style.width = pct(r.w*S, l.width);
      slot.style.height = pct(r.h*S, l.height);
  slot.style.background = '#f2efe7';
  slot.style.border = '1px solid #e2dccb';
      slot.style.display = 'flex';
      slot.style.alignItems = 'center';
      slot.style.justifyContent = 'center';
      slot.style.fontSize = '10px';
      slot.style.color = '#6b7785';
      slot.textContent = i + 1;
      preview.appendChild(slot);
    });
    
    // Show brand area
    if(l.brand){
      const brand = ce('div','brand-mini');
      brand.style.position='absolute';
      brand.style.left = toCanvasPct(l.brand.x, l.width, dx, S);
      brand.style.top = toCanvasPct(l.brand.y, l.height, dy, S);
      brand.style.width = pct(l.brand.w*S, l.width);
      brand.style.height = pct(l.brand.h*S, l.height);
  brand.style.background = '#fbf7eb';
  brand.style.border = '1px solid #d4af37';
      brand.style.display = 'flex';
      brand.style.alignItems = 'center';
      brand.style.justifyContent = 'center';
      brand.style.fontSize = '8px';
      brand.style.color = '#d4af37';
      brand.style.fontWeight = '600';
      brand.textContent = 'Peek';
      preview.appendChild(brand);
    }
    
    const label = ce('div','template-label');
    label.textContent = t.name;
    label.style.fontSize = '12px';
  label.style.fontWeight = '600';
    label.style.textAlign = 'center';
    
    c.appendChild(preview);
    c.appendChild(label);
    
    c.addEventListener('click',()=>{
      state.template = t; selectChoice('#templates', c);
      const btn = qs('#to-mode'); if(btn) btn.disabled = false;
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
      if(card && match){ state.template = match; card.classList.add('selected'); const btn = qs('#to-mode'); if(btn) btn.disabled = false; }
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
    // Use same simplified spacing as all other previews
    const el = ce('div','slot-abs');
    el.style.position='absolute';
    
    // Use simplified spacing like other previews
    const spacingX = 0.005; // 0.5% horizontal spacing  
    const spacingY = 0.01;  // 1% vertical spacing
    
    const originalLeft = parseFloat(toCanvasPct(r.x, l.width, dx, S));
    const originalTop = parseFloat(toCanvasPct(r.y, l.height, dy, S));
    const originalWidth = parseFloat(pct(r.w*S, l.width));
    const originalHeight = parseFloat(pct(r.h*S, l.height));
    
    el.style.left = (originalLeft + originalWidth * spacingX) + '%';
    el.style.top = (originalTop + originalHeight * spacingY) + '%';
    el.style.width = (originalWidth * (1 - spacingX * 2)) + '%';
    el.style.height = (originalHeight * (1 - spacingY * 2)) + '%';
  el.style.background = '#eadfca'; // subtle frame bg
  el.style.border = '1px solid #d4af37';
  el.style.padding = '2px';
    el.style.boxSizing = 'border-box';
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
  b.style.color='#6d5322'; b.style.fontFamily='"Playfair Display", serif'; b.style.fontWeight='700';
  b.style.fontSize = 'clamp(12px, 3.2vw, 40px)';
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
  
  // Debug: Check what template is loaded
  console.log('Template state:', state.template);
  console.log('Template ID from storage:', PageState.getTemplate());
  
  // Ensure template is loaded from storage
  const templateId = PageState && PageState.getTemplate();
  if(templateId && !state.template) {
    const templateObj = templates.find(t=>t.id===templateId);
    if(templateObj) {
      state.template = templateObj;
      console.log('Loaded template from storage:', state.template);
    }
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = l.width; canvas.height = l.height;
  const ctx = canvas.getContext('2d');
  
  // Apply template background exactly (prefer the template's own background)
  console.log('Applying background for template:', state.template);
  const tpl = state.template;
  if(tpl && typeof tpl.background === 'string'){
    if(/linear-gradient\(135deg,#1f1a11,#2b2416\)/i.test(tpl.background)){
      // Gold rich dark gradient approximation
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, '#1f1a11');
      g.addColorStop(1, '#2b2416');
      ctx.fillStyle = g;
    } else if(/radial-gradient\(circle/i.test(tpl.background)){
      // Ornate radial gradient approximation
      // Create a simple radial-like gradient using linear falloff
      const g2 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g2.addColorStop(0, '#3a3327');
      g2.addColorStop(1, '#18140f');
      ctx.fillStyle = g2;
    } else if(/linear-gradient\(135deg,#f9f9f9,#e5e6ea 60%,#f0f1f4\)/i.test(tpl.background)){
      // Marble
      const mg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      mg.addColorStop(0, '#f9f9f9');
      mg.addColorStop(0.6, '#e5e6ea');
      mg.addColorStop(1, '#f0f1f4');
      ctx.fillStyle = mg;
    } else if(/linear-gradient\(135deg,#f3e4c2,#e7d4ac,#f3e4c2\)/i.test(tpl.background)){
      // Parchment warm gradient
      const pg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      pg.addColorStop(0, '#f3e4c2');
      pg.addColorStop(0.5, '#e7d4ac');
      pg.addColorStop(1, '#f3e4c2');
      ctx.fillStyle = pg;
    } else if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(tpl.background)){
      // Simple hex color
      ctx.fillStyle = tpl.background;
    } else {
      // Fallback light background
      ctx.fillStyle = '#ffffff';
    }
  } else {
    ctx.fillStyle = '#ffffff';
  }
  console.log('Applied background color:', ctx.fillStyle);
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
      // Use same simplified spacing as previews
      const spacingX = 0.005; // 0.5% horizontal spacing (same as previews)
      const spacingY = 0.01;  // 1% vertical spacing (same as previews)
      const baseX = ox + r.x*S;
      const baseY = oy + r.y*S;
      const baseW = r.w*S;
      const baseH = r.h*S;
      
      const frameX = baseX + baseW * spacingX;
      const frameY = baseY + baseH * spacingY;
      const frameW = baseW * (1 - spacingX * 2);
      const frameH = baseH * (1 - spacingY * 2);
      
  // Draw frame background using selected template style (mirror preview border look)
      ctx.save();
      if(state.template && state.template.frameStyle) {
        // Apply frame style colors and effects to match preview
        switch(state.template.frameStyle) {
          case 'gold':
    ctx.fillStyle = '#faf6eb';
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(frameX, frameY, frameW, frameH);
            break;
            
          case 'parchment':
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.strokeStyle = '#e5d7b0';
    ctx.lineWidth = 2;
    ctx.strokeRect(frameX, frameY, frameW, frameH);
            break;
            
          case 'ornate':
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.strokeStyle = '#c9ac62';
    ctx.lineWidth = 2;
    ctx.strokeRect(frameX, frameY, frameW, frameH);
            break;
            
          case 'marble':
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.strokeStyle = '#e3e6eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(frameX, frameY, frameW, frameH);
            break;
            
          case 'classic-white':
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 2;
    ctx.strokeRect(frameX, frameY, frameW, frameH);
            break;
            
          default:
            ctx.fillStyle = '#eadfca'; // Default minimal frame
            ctx.fillRect(frameX, frameY, frameW, frameH);
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 1;
            ctx.strokeRect(frameX, frameY, frameW, frameH);
        }
      } else {
        ctx.fillStyle = '#eadfca'; // Default minimal frame
        ctx.fillRect(frameX, frameY, frameW, frameH);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.strokeRect(frameX, frameY, frameW, frameH);
      }
      ctx.restore();
      
      // Draw photo inside the frame area with padding
      const borderPadding = 2; // Simplified padding
      const photoX = frameX + borderPadding;
      const photoY = frameY + borderPadding;
      const photoW = frameW - (borderPadding * 2);
      const photoH = frameH - (borderPadding * 2);
      
      const im = imgs[i]; 
      if(im) {
        // Clip to photo area to ensure it doesn't overflow
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoW, photoH);
        ctx.clip();
        drawCover(im, photoX, photoY, photoW, photoH);
        ctx.restore();
      }
    });
    
    if(l.brand){
      const bx = ox + l.brand.x*S; const by = oy + l.brand.y*S; const bw2 = l.brand.w*S; const bh2 = l.brand.h*S;
      ctx.save();
      const frameStyle = state.template && state.template.frameStyle;
      ctx.fillStyle = (frameStyle==='gold' || frameStyle==='ornate') ? '#f7f3e8' : '#6d5322';
      const fontSize = Math.min(bh2*0.5, bw2*0.25);
      ctx.font = `${fontSize}px "Playfair Display", serif`;
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
  // Page enter animation
  const main = document.querySelector('.app-main');
  if(main) main.classList.add('animate-in');
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
    
    // Auto-select all photos if none are selected (since we now capture exactly 4)
    if(state.selectedIndices.size === 0 && state.captures.length === 4){
      state.selectedIndices = new Set([0, 1, 2, 3]);
      if(window.PageState) PageState.setSelected(Array.from(state.selectedIndices));
    }
    
    updateCapturedGrid();
    const toTemplates = qs('#to-templates');
    if(toTemplates) toTemplates.addEventListener('click', ()=>{ window.location.href = 'templates.html'; });
  }
  if(page === 'templates'){
    renderTemplates();
    const toMode = qs('#to-mode');
    if(toMode) toMode.addEventListener('click', ()=>{ window.location.href = 'mode.html'; });
    if(toMode) toMode.addEventListener('click', ()=>{ window.location.href = 'mode.html'; });
  buildTemplatePreview();
  }
  if(page === 'mode'){
    // Load persisted data for download functionality
    loadPersistedMedia();
    const layoutId = PageState.getLayout();
    const layoutObj = layouts.find(l=>l.id===layoutId);
    if(layoutObj) state.layout = layoutObj;
    const templateId = PageState.getTemplate();
    const templateObj = templates.find(t=>t.id===templateId);
    if(templateObj) state.template = templateObj;
    
    if(window.PageState){ state.mode = PageState.getMode(); const mi = document.querySelector(`input[name=mode][value=${state.mode}]`); if(mi) mi.checked = true; }
    document.querySelectorAll('input[name="mode"]').forEach(r=>{
      r.addEventListener('change', e=>{ state.mode = e.target.value; if(window.PageState) PageState.setMode(state.mode); buildTonePreview(); });
    });
    
    // Add download functionality to mode page
    const dl = qs('#download'); 
    if(dl) dl.addEventListener('click', downloadCollage);
    
  buildTonePreview();
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
  // Remove frame toggle and other final page specific code - no longer needed
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
  host.classList.remove('skeleton'); 
  host.classList.add('swap'); 
  setTimeout(()=>host.classList.remove('swap'),400); 
  host.innerHTML='';
  const layoutId = PageState && PageState.getLayout();
  const l = layouts.find(x=>x.id===layoutId) || state.layout || layouts[0];
  const urls = getSelectedCaptureURLs();
  host.style.position='relative';
  host.style.aspectRatio = `${l.width} / ${l.height}`;
  // Use the template's actual background (color or CSS gradient) for preview
  host.style.background = (state.template && state.template.background) ? state.template.background : '#ffffff';
  const bw = l.blueprintW || l.width; const bh = l.blueprintH || l.height;
  const S = Math.min(l.width/bw, l.height/bh);
  const dx = (l.width - bw*S)/2; const dy = (l.height - bh*S)/2;
  const pct = (px, total) => (px/total*100) + '%';
  const toCanvasPct = (v, total, offset, scale) => ((offset + v*scale)/total*100) + '%';
  
  l.slots.forEach((r,i)=>{
    // Simple approach - just use the original positions with smaller spacing
    const el = document.createElement('div');
    el.className='slot-abs'; 
    el.style.position='absolute';
    
    // Use original positioning but with less spacing
    const spacingX = 0.005; // Reduce horizontal spacing  
    const spacingY = 0.01;  // Reduce vertical spacing
    
    const originalLeft = parseFloat(toCanvasPct(r.x, l.width, dx, S));
    const originalTop = parseFloat(toCanvasPct(r.y, l.height, dy, S));
    const originalWidth = parseFloat(pct(r.w*S, l.width));
    const originalHeight = parseFloat(pct(r.h*S, l.height));
    
    el.style.left = (originalLeft + originalWidth * spacingX) + '%';
    el.style.top = (originalTop + originalHeight * spacingY) + '%';
    el.style.width = (originalWidth * (1 - spacingX * 2)) + '%';
    el.style.height = (originalHeight * (1 - spacingY * 2)) + '%';
    // Frame visuals per selected template style (match canvas intent)
    const fs = state.template && state.template.frameStyle;
    if(fs === 'gold'){
      el.style.background = '#faf6eb';
      el.style.border = '2px solid #d4af37';
    } else if(fs === 'parchment'){
      el.style.background = '#ffffff';
      el.style.border = '2px solid #e5d7b0';
    } else if(fs === 'ornate'){
      el.style.background = '#ffffff';
      el.style.border = '2px solid #c9ac62';
    } else if(fs === 'marble'){
      el.style.background = '#ffffff';
      el.style.border = '2px solid #e3e6eb';
    } else if(fs === 'classic-white'){
      el.style.background = '#ffffff';
      el.style.border = '2px solid #f5f5f5';
    } else {
      el.style.background = '#eadfca';
      el.style.border = '1px solid #d4af37';
    }
    el.style.padding = '2px';
    el.style.boxSizing = 'border-box';
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
  const fs = state.template && state.template.frameStyle;
  const brandColor = (fs==='gold' || fs==='ornate') ? '#f7f3e8' : '#6d5322';
  b.style.color = brandColor; b.style.fontFamily='"Playfair Display", serif'; b.style.fontWeight='700';
  b.style.fontSize = 'clamp(12px, 3.2vw, 40px)';
    b.textContent='Peek';
    host.appendChild(b);
  }
  applyPreviewFrame(host);
}

function applyPreviewFrame(host){
  [...host.classList].filter(c=>c.startsWith('frame-')).forEach(c=>host.classList.remove(c));
  if(state.template && state.template.frameStyle){ host.classList.add('frame-'+state.template.frameStyle); }
  // Background is set in builders to match canvas mapping; don't override here.
}

function buildTonePreview(){
  const host = qs('#tone-preview'); if(!host) return;
  host.classList.remove('skeleton'); 
  host.classList.add('swap'); 
  setTimeout(()=>host.classList.remove('swap'),400); 
  host.innerHTML='';
  const layoutId = PageState && PageState.getLayout();
  const l = layouts.find(x=>x.id===layoutId) || state.layout || layouts[0];
  const templateId = PageState && PageState.getTemplate();
  const templateObj = templates.find(t=>t.id===templateId);
  state.template = templateObj || state.template;
  const urls = getSelectedCaptureURLs();
  host.style.position='relative';
  host.style.aspectRatio = `${l.width} / ${l.height}`;
  // Use the template's actual background for tone preview as well
  host.style.background = (state.template && state.template.background) ? state.template.background : '#ffffff';
  const bw = l.blueprintW || l.width; const bh = l.blueprintH || l.height;
  const S = Math.min(l.width/bw, l.height/bh);
  const dx = (l.width - bw*S)/2; const dy = (l.height - bh*S)/2;
  const pct = (px, total) => (px/total*100) + '%';
  const toCanvasPct = (v, total, offset, scale) => ((offset + v*scale)/total*100) + '%';
  l.slots.forEach((r,i)=>{
    // Simple approach - same as buildTemplatePreview
    const el = document.createElement('div');
    el.className='slot-abs'; 
    el.style.position='absolute';
    
    // Use simplified spacing like template preview
    const spacingX = 0.005; // Reduce horizontal spacing  
    const spacingY = 0.01;  // Reduce vertical spacing
    
    const originalLeft = parseFloat(toCanvasPct(r.x, l.width, dx, S));
    const originalTop = parseFloat(toCanvasPct(r.y, l.height, dy, S));
    const originalWidth = parseFloat(pct(r.w*S, l.width));
    const originalHeight = parseFloat(pct(r.h*S, l.height));
    
    el.style.left = (originalLeft + originalWidth * spacingX) + '%';
    el.style.top = (originalTop + originalHeight * spacingY) + '%';
    el.style.width = (originalWidth * (1 - spacingX * 2)) + '%';
    el.style.height = (originalHeight * (1 - spacingY * 2)) + '%';
    // Frame visuals per selected template style
    const fs = state.template && state.template.frameStyle;
    if(fs === 'gold'){
      el.style.background = '#faf6eb';
      el.style.border = '2px solid #d4af37';
    } else if(fs === 'parchment'){
      el.style.background = '#ffffff';
      el.style.border = '2px solid #e5d7b0';
    } else if(fs === 'ornate'){
      el.style.background = '#ffffff';
      el.style.border = '2px solid #c9ac62';
    } else if(fs === 'marble'){
      el.style.background = '#ffffff';
      el.style.border = '2px solid #e3e6eb';
    } else if(fs === 'classic-white'){
      el.style.background = '#ffffff';
      el.style.border = '2px solid #f5f5f5';
    } else {
      el.style.background = '#eadfca';
      el.style.border = '1px solid #d4af37';
    }
    el.style.padding = '2px';
    el.style.boxSizing = 'border-box';
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
  const fs2 = state.template && state.template.frameStyle;
  const brandColor2 = (fs2==='gold' || fs2==='ornate') ? '#f7f3e8' : '#6d5322';
  b.style.color = brandColor2; b.style.fontFamily='"Playfair Display", serif'; b.style.fontWeight='700';
  b.style.fontSize = 'clamp(12px, 3.2vw, 40px)';
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
    s--;
    if(el){
      if(s>0){ 
        el.textContent = s; 
        el.classList.remove('pulse'); 
        void el.offsetWidth; // Force reflow
        el.classList.add('pulse'); 
      }
      else { el.textContent = ''; }
    }
    if(s<=0){ clearInterval(state.countdownTimer); cb(); }
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
  
  // Use data URL for consistent storage and display
  const dataURL = canvas.toDataURL('image/jpeg', 0.9);
  state.captures.push(dataURL);
  
  if(window.PageState){
    PageState.setCaptures([...state.captures]);
  }
  
  state.sessionIndex++;
  updateCapturedGrid();
}

function finishSession(){
  state.sessionRunning = false; updateSessionButton();
  if(state.cameraStream){ state.cameraStream.getTracks().forEach(t=>t.stop()); state.cameraStream = null; }
  setCamStatus('Session complete.'); setSessionStatus('Captured all photos!');
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
    
    // Use data URL for consistent storage
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    const old = state.captures[index]; 
    state.captures[index] = dataURL;
    if(window.PageState){ 
      const caps = PageState.getCaptures(); 
      caps[index] = dataURL; 
      PageState.setCaptures(caps); 
    }
    updateCapturedGrid();
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
