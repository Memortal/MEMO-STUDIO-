'use strict';
(function(){
  const dataUrl='./data/work.json';
  const tabButtons=[...document.querySelectorAll('[data-service]')];
  const shortcuts=[...document.querySelectorAll('[data-service-link]')];
  const modeButtons=[...document.querySelectorAll('[data-mode]')];
  const intro=document.getElementById('serviceIntro');
  const offer=document.getElementById('serviceOfferGrid');
  const panel=document.getElementById('servicePanel');
  const results=document.getElementById('workResults');
  const total=document.getElementById('workCount');
  const context=document.getElementById('workContext');
  const search=document.getElementById('workSearch');
  const clear=document.getElementById('clearWorkSearch');
  const more=document.getElementById('moreWork');
  const ctaBottom=document.getElementById('serviceBottomCta');
  if(!intro||!offer||!panel||!results||!search||!total||!more)return;

  let database=null,serviceId='bim',mode='all',limit=9;
  const siteEmail='alireza.memaryan@gmail.com';
  const text=(tag,cls,value)=>{
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(value!=null)node.textContent=String(value);
    return node;
  };
  function externalLink(href,label){
    if(!href)return null;
    try{
      const u=new URL(href,window.location.href);
      if(u.protocol!=='https:')return null;
      const a=text('a','project-link',label+' ↗');
      a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';return a;
    }catch{return null}
  }
  function emailLink(subject,label,extraClass){
    const a=text('a',extraClass||'project-link',label);
    a.href='mailto:'+siteEmail+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent('Hello,\n\nMy project or problem:\n\nTools or files involved:\n\nWhat a successful result looks like:\n\n');
    return a;
  }
  const categoryLabel={built:'Built / documented work',prototype:'Interactive prototype',proposal:'Design proposal',research:'Exploration'};
  function svgTile(item){
    const tile=text('div','study-art study-art--'+item.service);
    tile.setAttribute('aria-hidden','true');
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 400 210');
    const add=(tag,attrs)=>{
      const node=document.createElementNS(ns,tag);
      for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
      svg.append(node);
    };
    const seed=[...item.title].reduce((n,c)=>n+c.charCodeAt(0),0);
    const dx=(seed%8)*4;
    for(let x=0;x<=400;x+=29)add('line',{x1:x,y1:0,x2:x,y2:210,stroke:'#a9baa9','stroke-opacity':'.23','stroke-width':'.8'});
    for(let y=0;y<=210;y+=29)add('line',{x1:0,y1:y,x2:400,y2:y,stroke:'#a9baa9','stroke-opacity':'.23','stroke-width':'.8'});
    if(item.service==='bim'||item.service==='generative'){
      for(let i=0;i<5;i++){
        const x=68+i*47+dx;const h=42+(seed+i*27)%92;const y=163-h;
        add('path',{d:'M'+x+' '+y+' l30 -14 l25 11 l-30 14 z M'+x+' '+y+' v'+h+' l25 11 v-'+h+' M'+(x+25)+' '+(y+11)+' l30 -14 v'+h+' l-30 14',fill:'none',stroke:i%2?'#52725a':'#e06d50','stroke-width':1.4});
      }
    }else if(item.service==='software'){
      for(let i=0;i<4;i++){
        const x=57+i*76,y=46+(i%2)*28;
        add('rect',{x,y,width:92,height:102,rx:2,fill:'#e7ede5',stroke:'#5b755f','stroke-width':1.3});
        add('line',{x1:x+7,y1:y+17,x2:x+85,y2:y+17,stroke:'#9eafa0'});
        add('circle',{cx:x+11,cy:y+8,r:2.1,fill:'#e06d50'});
        add('path',{d:'M'+(x+16)+' '+(y+69)+' l22 -28 l24 24 l13 -17',fill:'none',stroke:'#698a72','stroke-width':1.5});
      }
    }else if(item.service==='fabrication'){
      for(let i=0;i<7;i++){
        const x=48+i*48;
        add('path',{d:'M'+x+' 170 L'+(x+25)+' '+(27+(i%3)*13)+' L'+(x+48)+' 165 Z',fill:i%2?'#c4d5c5':'#e4e9df',stroke:i%3?'#5d7962':'#e06d50','stroke-width':1.5});
        add('path',{d:'M'+x+' 170 L'+(x+25)+' '+(27+(i%3)*13),stroke:'#5d7962','stroke-width':1.3});
      }
    }else if(item.service==='spatial'){
      for(let i=0;i<7;i++){
        const x=52+(i*49),y=42+((i*31+seed)%88);
        add('path',{d:'M'+x+' '+y+' l31 -11 l23 26 l-31 12 z',fill:'none',stroke:'#68896e','stroke-width':1.4});
        add('circle',{cx:x+15,cy:y+7,r:4,fill:'#e06d50'});
      }
    }else{
      const coords=[[200,109],[82,52],[318,58],[75,162],[325,166],[188,24],[207,185]];
      coords.slice(1).forEach((xy,i)=>{
        add('line',{x1:200,y1:109,x2:xy[0],y2:xy[1],stroke:'#819b84','stroke-width':1.5});
        add('circle',{cx:xy[0],cy:xy[1],r:9+(i%2)*4,fill:'#d0dccd',stroke:'#7a947d','stroke-width':1});
      });
      add('circle',{cx:200,cy:109,r:32,fill:'#e06d50'});
      add('circle',{cx:200,cy:109,r:7,fill:'#f8faf5'});
    }
    tile.append(svg);return tile;
  }
  function liItems(parent,items){
    const list=text('ul',null);
    for(const item of items)list.append(text('li',null,item));
    parent.append(list);
  }
  function serviceHeader(group){
    intro.replaceChildren();
    const left=text('div','service-intro-main');
    left.append(text('p','eyebrow','SPECIALTY / '+group.ordinal));
    left.append(text('h3',null,group.name));
    left.append(text('p','service-description',group.promise));
    left.append(text('p','service-tools','TOOLS & METHODS · '+group.tools.join(' · ')));
    const right=text('div','service-intro-aside');
    right.append(text('span',null,'A PRACTICAL FIRST ENGAGEMENT'));
    right.append(text('p',null,group.exampleScope));
    right.append(emailLink('MEMO Studio — '+group.name,group.cta+' ↗','service-ask'));
    intro.append(left,right);
    offer.replaceChildren();
    const col1=text('div','offer-panel');col1.append(text('h4',null,'Problems I can help solve'));liItems(col1,group.needs);
    const col2=text('div','offer-panel');col2.append(text('h4',null,'Possible deliverables'));liItems(col2,group.deliverables);
    const col3=text('div','offer-panel');col3.append(text('h4',null,'Who this is for'));col3.append(text('p',null,group.fit));col3.append(text('strong','offer-count',group.offeringsCount+' detailed capabilities'));
    offer.append(col1,col2,col3);
    if(ctaBottom){
      const link=ctaBottom.querySelector('a.btn');
      if(link){
        const a=emailLink('MEMO Studio — '+group.name,'Discuss a '+group.short.toLowerCase()+' project ↗','btn btn-dark');
        link.replaceWith(a);
      }
    }
  }
  function projectCard(item){
    const card=text('article','work-card');
    const media=text('div','work-media');
    if(item.images?.length){
      const first=item.images[0];
      const image=text('img',null);image.src=first.url;image.loading='lazy';image.decoding='async';image.alt=first.alt||item.title;
      image.addEventListener('error',()=>media.replaceChildren(svgTile(item)),{once:true});
      media.append(image);
    }else media.append(svgTile(item));
    media.append(text('span','media-tag',categoryLabel[item.level]||'Research'));
    card.append(media);
    const body=text('div','work-card-body');
    const marker=text('p','card-eyebrow',item.level==='built'?'DOCUMENTED WORK':item.level==='prototype'?'INTERACTIVE EXPLORATION':item.level==='proposal'?'DESIGN PROPOSAL':'DESIGN RESEARCH');
    body.append(marker,text('h4',null,item.title),text('p','card-summary',item.summary));
    if(item.credit){const c=text('p','card-credit',item.credit);body.append(c)}
    const links=text('div','card-links');
    const href=externalLink(item.link,item.level==='built'?'See portfolio':'Explore project');
    if(href)links.append(href);
    const summary=text('details','card-details');
    summary.append(text('summary',null,'What was explored'));
    const details=text('div','card-detail-content');
    details.append(text('p',null,item.detail||item.summary));
    if(item.images?.length>1){
      const gallery=text('div','card-thumbnails');
      for(const image of item.images.slice(1,5)){
        const l=externalLink(image.url,'');
        if(!l)continue;
        l.className='thumbnail-link';l.textContent='';
        const img=text('img',null);img.src=image.url;img.alt=image.alt||'Additional project photo';img.loading='lazy';img.decoding='async';
        l.append(img);gallery.append(l);
      }
      details.append(gallery);
    }
    summary.append(details);
    body.append(links,summary);
    card.append(body);return card;
  }
  function capabilityCard(item){
    const card=text('article','work-card capability-card');
    const body=text('div','work-card-body');
    const level=item.status||'R';
    const badge=level.includes('P')?'Professional precedent':level.includes('D')?'Demonstrated prototype':'Research capability';
    body.append(text('p','card-eyebrow',badge),text('h4',null,item.title));
    body.append(text('p','card-summary',item.problem));
    body.append(text('p','card-section-label','TYPICAL DELIVERABLE'));
    body.append(text('p','card-deliverable',item.deliverable));
    const details=text('details','card-details');
    details.append(text('summary',null,'Relevant experience'));
    const detail=text('div','card-detail-content');detail.append(text('p',null,item.evidence||'Scope and deliverables are defined with the client.'));details.append(detail);
    body.append(details);
    const links=text('div','card-links');
    links.append(emailLink('MEMO Studio — '+item.title,'Discuss this task ↗','project-link'));
    body.append(links);card.append(body);return card;
  }
  function filteredItems(){
    const group=database.groups.find(x=>x.id===serviceId);
    const term=search.value.trim().toLowerCase();
    const raw=(mode==='capabilities'?database.offerings:database.studies).filter(x=>x.service===serviceId && (mode==='capabilities'||mode==='all'||(mode==='research'?(x.level==='research'||x.level==='proposal'):x.level===mode)));
    const found=term?raw.filter(x=>([x.title,x.summary,x.problem,x.deliverable,x.detail,x.evidence,x.credit].filter(Boolean).join(' ').toLowerCase().includes(term))):raw;
    if(mode==='all'){
      found.sort((a,b)=>(a.rank??999)-(b.rank??999)||((a.level==='built'?0:a.level==='prototype'?1:2)-(b.level==='built'?0:b.level==='prototype'?1:2))||a.title.localeCompare(b.title));
    }else if(mode!=='capabilities')found.sort((a,b)=>(a.rank??999)-(b.rank??999)||a.title.localeCompare(b.title));
    else found.sort((a,b)=>a.title.localeCompare(b.title));
    return {group,items:found};
  }
  function render(){
    if(!database)return;
    const {group,items}=filteredItems();
    results.replaceChildren();
    const first=items.slice(0,limit);
    if(!first.length){
      const empty=text('div','work-empty');
      empty.append(text('h4',null,search.value?'No results match that search.':'No examples in this section yet.'));
      empty.append(text('p',null,'Try another view, or ask about work related to this specialty.'));
      empty.append(emailLink('MEMO Studio — '+group.name,'Ask about this specialty ↗','project-link'));
      results.append(empty);
    }else {
      const frag=document.createDocumentFragment();
      for(const item of first)frag.append(mode==='capabilities'?capabilityCard(item):projectCard(item));
      results.append(frag);
    }
    total.textContent=items.length+' '+(mode==='capabilities'?'capabilities':'examples');
    context.textContent=mode==='capabilities'?'Specific problems, proposed outputs and relevant experience.':mode==='built'?'Physical and documented professional work.':mode==='prototype'?'Interactive systems and working-stage application studies.':mode==='research'?'Proposals, ideas and studies that continue to evolve.':'A curated path through related projects, prototypes and explorations.';
    more.hidden=items.length<=limit;
    more.textContent='Show more ('+Math.min(9,items.length-limit)+' next) ↓';
  }
  function updateModes(){
    for(const button of modeButtons){
      const m=button.dataset.mode;
      const n=(m==='capabilities'?database.offerings:database.studies).filter(x=>x.service===serviceId&&(m==='capabilities'||m==='all'||(m==='research'?['research','proposal'].includes(x.level):x.level===m))).length;
      button.disabled=n===0;button.title=n===0?'No examples in this category yet':'View '+n+' entries';
    }
  }
  function selectMode(next){
    mode=next;limit=9;
    modeButtons.forEach(b=>{const active=b.dataset.mode===next;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});
    render();
  }
  function selectService(next,updateUrl=true){
    if(!database?.groups.some(g=>g.id===next))return;
    serviceId=next;mode='all';limit=9;search.value='';
    tabButtons.forEach(b=>{const active=b.dataset.service===next;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});
    panel.setAttribute('aria-labelledby','service-tab-'+next);
    const group=database.groups.find(x=>x.id===next);
    serviceHeader(group);updateModes();selectMode('all');
    if(updateUrl)history.replaceState(null,'','#'+next);
  }
  tabButtons.forEach((b,i)=>{
    b.addEventListener('click',()=>selectService(b.dataset.service));
    b.addEventListener('keydown',e=>{
      let j=null;
      if(e.key==='ArrowRight')j=(i+1)%tabButtons.length;
      if(e.key==='ArrowLeft')j=(i+tabButtons.length-1)%tabButtons.length;
      if(e.key==='Home')j=0;if(e.key==='End')j=tabButtons.length-1;
      if(j!==null){e.preventDefault();tabButtons[j].focus();selectService(tabButtons[j].dataset.service)}
    });
  });
  shortcuts.forEach(a=>a.addEventListener('click',()=>{
    const key=a.dataset.serviceLink;selectService(key);document.getElementById('serviceTabs')?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  modeButtons.forEach((b,i)=>{
    b.addEventListener('click',()=>selectMode(b.dataset.mode));
    b.addEventListener('keydown',e=>{
      let step=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!step)return;
      e.preventDefault();let j=i;do{j=(j+step+modeButtons.length)%modeButtons.length}while(modeButtons[j].disabled&&j!==i);
      modeButtons[j].focus();selectMode(modeButtons[j].dataset.mode);
    });
  });
  search.addEventListener('input',()=>{limit=9;render()});
  clear?.addEventListener('click',()=>{search.value='';limit=9;render();search.focus()});
  more.addEventListener('click',()=>{limit+=9;render()});
  window.addEventListener('hashchange',()=>{
    const id=location.hash.slice(1);
    if(database?.groups.some(g=>g.id===id))selectService(id,false);
  });
  async function init(){
    try{
      const res=await fetch(dataUrl,{cache:'no-cache'});
      if(!res.ok)throw Error('Could not load content');
      database=await res.json();
      selectService(database.groups.some(g=>g.id===location.hash.slice(1))?location.hash.slice(1):'bim',false);
    }catch(e){
      results.replaceChildren(text('p','loading-message','Projects could not be loaded. You can still discuss a project by email.'));
      total.textContent='Content unavailable';
    }
  }
  init();
})();
