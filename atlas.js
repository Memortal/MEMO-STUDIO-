'use strict';
(function(){
  const sources={
    lovable:{url:'./data/lovable.json',name:'Lovable research',subtitle:'Selected professional experiments; published does not mean independently tested.'},
    gpt:{url:'./data/gpt-research.json',name:'ChatGPT design research',subtitle:'Documented systems and proposals, identified by research maturity.'},
    wix:{url:'./data/wix.json',name:'Wix portfolio archive',subtitle:'Previously approved historic work and public image archive, with project credits.'},
    services:{url:'./data/services.json',name:'Service capabilities',subtitle:'Client problems, proposed deliverables and levels of evidence.'}
  };
  const tabs=[...document.querySelectorAll('[data-source]')];
  const result=document.getElementById('archiveResults');
  const search=document.getElementById('archiveSearch');
  const category=document.getElementById('categoryFilter');
  const count=document.getElementById('resultCount');
  const sourceDesc=document.getElementById('sourceDescription');
  const clear=document.getElementById('clearFilters');
  const paging=document.getElementById('atlasPagination');
  const loadMore=document.getElementById('loadMore');
  if(!result||!search||!category||!count||!sourceDesc)return;
  let datasets={},active='lovable',visible=12,filtered=[];

  function el(tag,className,textValue){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(textValue!=null)node.textContent=String(textValue);
    return node;
  }
  function property(parent,label,value){
    if(!value)return;
    const block=el('div','atlas-detail');
    block.append(el('div','atlas-detail-label',label));
    block.append(el('p',null,value));
    parent.append(block);
  }
  function safeHref(url){
    try{const u=new URL(url,location.href);return u.protocol==='https:'?u.href:null}catch{return null}
  }
  function link(text,url){
    const href=safeHref(url);if(!href)return null;
    const a=el('a','atlas-card-link',text+' ↗');a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
  }
  function inquiry(title){
    const href='mailto:alireza.memaryan@gmail.com?subject='+encodeURIComponent('MEMO Studio — '+title);
    const a=el('a','atlas-card-link','Discuss this capability ↗');a.href=href;return a;
  }
  function detailsNode(){
    const details=el('details','atlas-card-more');details.append(el('summary',null,'View details'));return details;
  }
  function renderCard(item){
    const card=el('article','atlas-card'+(active==='wix'?' atlas-card--wix':''));
    if(active==='wix'&&item.images?.length){
      const img=el('img','atlas-card-image');img.loading='lazy';img.decoding='async';img.src=item.images[0].url;img.alt=item.images[0].alt||item.title;
      img.addEventListener('error',()=>img.style.display='none',{once:true});card.append(img);
    }
    const body=el('div','atlas-card-head');
    const meta=el('div','atlas-card-meta');
    const type=active==='services'?item.category:active==='wix'?item.discipline:item.category;
    meta.append(el('span',null,type||'Design research'));
    meta.append(el('span',null,active==='lovable'?item.status:active==='gpt'?item.status:active==='services'?item.status:item.year||'Archive'));
    body.append(meta);
    body.append(el('h3','atlas-card-title',item.title));
    const summary=active==='services'?item.problem:item.summary;
    body.append(el('p','atlas-card-summary',summary||'Research project documented in the MEMO Studio archive.'));
    const details=detailsNode();const more=el('div','atlas-details');
    if(active==='lovable'){
      property(more,'Status',item.status);
      property(more,'Evidence',item.evidence);
      property(more,'Disclaimer','The source listing alone does not verify that a particular interface, export or backend integration is working.');
      const a=link('Explore source or demonstration',item.public_url);if(a)more.append(a);else more.append(inquiry(item.title));
    }else if(active==='gpt'){
      property(more,'Outputs and methods',item.outputs);
      property(more,'Maturity',item.status);
      property(more,'Scope note',item.note);
      const a=link('Explore related work',item.link);if(a)more.append(a);else more.append(inquiry(item.title));
    }else if(active==='services'){
      property(more,'Example deliverables',item.deliverable);
      property(more,'Relevant evidence',item.evidence);
      property(more,'Evidence level',item.status+' — P: professional precedent; D: demonstrated prototype; R: research direction.');
      more.append(inquiry(item.title));
    }else if(active==='wix'){
      property(more,'Archive credit',item.credit);
      property(more,'Attribution notes',item.caveat);
      if(item.images?.length){
        more.append(el('div','atlas-detail-label','Selected public image archive · '+item.images.length+' files'));
        const gallery=el('div','gallery-thumbs');
        for(const asset of item.images){
          const href=safeHref(asset.url);if(!href)continue;
          const a=el('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';
          const img=el('img');img.src=href;img.loading='lazy';img.decoding='async';img.alt=asset.alt||item.title;
          a.append(img);gallery.append(a);
        }
        more.append(gallery);
      }
      more.append(link('View full public portfolio','https://memortal.github.io/Portfolio-/'));
    }
    details.append(more);body.append(details);card.append(body);return card;
  }
  function listForSource(){
    const d=datasets[active];if(!d)return[];
    if(active==='services')return d.services||[];
    return d.projects||[];
  }
  function fields(item){
    return [item.title,item.summary,item.problem,item.deliverable,item.evidence,item.outputs,item.credit,item.discipline,item.category,item.status].filter(Boolean).join(' ').normalize('NFKD').toLowerCase();
  }
  function buildCategoryFilter(){
    const prev=category.value;
    category.replaceChildren(new Option('All disciplines','all'));
    const items=listForSource();const key=active==='services'?'category':active==='wix'?'discipline':'category';
    const categories=[...new Set(items.map(item=>item[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    categories.forEach(c=>category.add(new Option(c,c)));
    category.value=categories.includes(prev)?prev:'all';
  }
  function update(){
    const needle=search.value.trim().normalize('NFKD').toLowerCase();
    const filter=category.value;
    const key=active==='services'?'category':active==='wix'?'discipline':'category';
    filtered=listForSource().filter(item=>(filter==='all'||item[key]===filter)&&(!needle||fields(item).includes(needle)));
    result.replaceChildren();
    if(filtered.length===0){
      const box=el('div','empty-state');box.append(el('h3',null,'Nothing matches this search.'));box.append(el('p',null,'Try a different term or clear the filters.'));result.append(box);
    } else {
      const frag=document.createDocumentFragment();
      filtered.slice(0,visible).forEach(item=>frag.append(renderCard(item)));
      result.append(frag);
    }
    count.textContent=filtered.length+' entries found';
    sourceDesc.textContent=sources[active].subtitle;
    paging.hidden=filtered.length<=visible;
    if(loadMore)loadMore.textContent='Show more ('+Math.min(12,Math.max(0,filtered.length-visible))+' next) ↓';
  }
  function change(source){
    if(!sources[source]||!datasets[source])return;
    active=source;visible=12;search.value='';category.value='all';
    tabs.forEach(tab=>{const selected=tab.dataset.source===source;tab.classList.toggle('active',selected);tab.setAttribute('aria-selected',String(selected));if(selected)result.setAttribute('aria-labelledby',tab.id)});
    buildCategoryFilter();update();
    if(history.replaceState)history.replaceState(null,'','#'+source);
  }
  tabs.forEach(tab=>tab.addEventListener('click',()=>change(tab.dataset.source)));
  tabs.forEach((tab,i)=>tab.addEventListener('keydown',event=>{
    const offset=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
    if(!offset)return;
    event.preventDefault();const next=tabs[(i+tabs.length+offset)%tabs.length];
    next.focus();change(next.dataset.source);
  }));
  search.addEventListener('input',()=>{visible=12;update()});
  category.addEventListener('change',()=>{visible=12;update()});
  if(loadMore)loadMore.addEventListener('click',()=>{visible+=12;update()});
  if(clear)clear.addEventListener('click',()=>{search.value='';category.value='all';visible=12;update();search.focus()});
  async function load(){
    try{
      const entries=await Promise.all(Object.entries(sources).map(async([name,entry])=>{
        const response=await fetch(entry.url,{cache:'no-cache'});
        if(!response.ok)throw new Error(entry.url+' returned '+response.status);
        return[name,await response.json()];
      }));
      datasets=Object.fromEntries(entries);
      const hash=location.hash.slice(1).toLowerCase();
      change(sources[hash]?hash:'lovable');
    }catch(error){
      result.replaceChildren(el('p','loading-message','The research archive could not load. Check GitHub Pages deployment or view the repository files directly.'));
      count.textContent='Archive unavailable';
      sourceDesc.textContent='Data files are stored in this repository.';
    }
  }
  load();
})();
