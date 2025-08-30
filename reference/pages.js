// Lightweight multi-page glue. Uses sessionStorage to persist state across page navigations.
// Stores: layoutId, captures (array of data URLs), selected (array of indices), templateId, mode.

(function(){
  const ss = window.sessionStorage;
  const page = document.body.dataset.page;

  function save(key,val){ ss.setItem(key, JSON.stringify(val)); }
  function load(key,def){ try { return JSON.parse(ss.getItem(key)) ?? def; } catch(e){ return def; } }

  // Expose minimal API for app.js to hook into if loaded on multi-step pages
  window.PageState = {
    setLayout(id){ save('layoutId', id); },
    getLayout(){ return load('layoutId', null); },
    setCaptures(arr){ save('captures', arr); },
    getCaptures(){ return load('captures', []); },
    setSelected(arr){ save('selected', arr); },
    getSelected(){ return load('selected', []); },
    setTemplate(id){ save('templateId', id); },
    getTemplate(){ return load('templateId', null); },
    setMode(m){ save('mode', m); },
    getMode(){ return load('mode', 'color'); }
  };

  // Welcome page logic
  if(page === 'welcome'){
    document.getElementById('begin').addEventListener('click', ()=>{
      window.location.href = 'layout.html';
    });
  }

  // Progress Nav (shared)
  const steps = [
    { id:'layout', label:'Format', href:'layout.html' },
    { id:'capture', label:'Capture', href:'capture.html' },
    { id:'select', label:'Select', href:'select.html' },
    { id:'templates', label:'Frame', href:'templates.html' },
    { id:'mode', label:'Download', href:'mode.html' }
  ];
  const progressHost = document.getElementById('progress');
  if(progressHost){
    steps.forEach((s,i)=>{
      const a = document.createElement('a');
      a.className = 'step';
      a.textContent = (i+1)+'. '+s.label;
      a.href = s.href;
      if(s.id === page) a.classList.add('active');
      else {
        // mark as done if before current in order sequence
        const currentIndex = steps.findIndex(st=>st.id===page);
        if(i < currentIndex) a.classList.add('done');
      }
      progressHost.appendChild(a);
    });
  }
})();
