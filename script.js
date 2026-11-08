'use strict';
(function(){
  const menuButton=document.getElementById('menuToggle');
  const mobileNav=document.getElementById('mobileNav');
  if(menuButton&&mobileNav){
    function setMenu(open){
      mobileNav.hidden=!open;
      menuButton.setAttribute('aria-expanded',String(open));
      menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    }
    menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
    mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
    window.addEventListener('resize',()=>{if(window.innerWidth>900)setMenu(false)});
  }

  const filterButtons=[...document.querySelectorAll('[data-filter]')];
  const projects=[...document.querySelectorAll('[data-category]')];
  filterButtons.forEach(button=>{
    button.addEventListener('click',()=>{
      const choice=button.dataset.filter;
      filterButtons.forEach(b=>{
        const active=b===button;
        b.classList.toggle('active',active);
        b.setAttribute('aria-pressed',String(active));
      });
      projects.forEach(card=>{
        card.hidden=!(choice==='all'||card.dataset.category===choice);
      });
    });
  });

  const slider=document.getElementById('moduleSlider');
  const number=document.getElementById('moduleValue');
  const diagram=document.getElementById('systemDrawing');
  const ns='http://www.w3.org/2000/svg';
  const create=(tag,attributes,parent)=>{
    const el=document.createElementNS(ns,tag);
    Object.entries(attributes||{}).forEach(([k,v])=>el.setAttribute(k,String(v)));
    (parent||diagram).appendChild(el);
    return el;
  };
  const iso=(x,y,z)=>[326+(x-y)*1.08,366+(x+y)*.48-z*.79];
  const points=arr=>arr.map(p=>iso(...p).map(v=>v.toFixed(1)).join(',')).join(' ');
  const quad=(arr,fill,stroke='#425448',sw=1)=>{
    return create('polygon',{points:points(arr),fill,stroke,'stroke-width':sw,'stroke-linejoin':'round'});
  };
  function drawStructure(){
    if(!diagram||!slider)return;
    diagram.replaceChildren();
    const count=Number(slider.value);
    if(number)number.textContent=String(count).padStart(2,'0')+' / 12';
    create('path',{d:'M28 400 L329 547 L632 400 M329 547 L329 585',fill:'none',stroke:'#b9c8b8','stroke-width':1.1});
    const configs=[
      {x:-160,y:-145,w:132,d:119,n:count,fill:'#cbd7c9'},
      {x:10,y:-145,w:125,d:122,n:Math.max(2,count-2),fill:'#d6ddd0'},
      {x:-160,y:9,w:126,d:117,n:Math.max(2,count-3),fill:'#d5ddd2'},
      {x:10,y:9,w:119,d:120,n:Math.max(2,count-1),fill:'#bfceb9'}
    ];
    configs.forEach((b,index)=>{
      const h=b.n*19;
      const x=b.x,y=b.y,w=b.w,d=b.d;
      const side1=[[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]];
      const side2=[[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]];
      quad(side1,index===3?'#91a995':'#b4c4b4','#577260',1.15);
      quad(side2,index===0?'#a1b9a4':'#9eb49f','#577260',1.15);
      for(let i=1;i<=b.n;i++){
        const z=i*19;
        quad([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],i===b.n?b.fill:'#c9d4c9','#48624e',1);
        if(i<b.n){
          quad([[x+w,y,z-3],[x+w,y+d,z-3],[x+w,y+d,z],[x+w,y,z]],'#89a990','#54735b',.45);
          quad([[x,y+d,z-3],[x+w,y+d,z-3],[x+w,y+d,z],[x,y+d,z]],'#8daa8b','#54735b',.45);
        }
      }
      // Facade subdivision lines communicate an editable repetitive system.
      for(let j=1;j<4;j++){
        const xx=x+(w*j/4);
        const [ax,ay]=iso(xx,y+d,0),[bx,by]=iso(xx,y+d,h);
        create('line',{x1:ax,y1:ay,x2:bx,y2:by,stroke:'#739079','stroke-width':.7});
      }
      for(let j=1;j<4;j++){
        const yy=y+(d*j/4);
        const [ax,ay]=iso(x+w,yy,0),[bx,by]=iso(x+w,yy,h);
        create('line',{x1:ax,y1:ay,x2:bx,y2:by,stroke:'#739079','stroke-width':.7});
      }
      if(index===0||index===3){
        const [cx,cy]=iso(x+w/2,y+d/2,h+18);
        const lineEnd=cy-43;
        create('line',{x1:cx,y1:cy,x2:cx,y2:lineEnd,stroke:'#d46047','stroke-width':1.4,'stroke-dasharray':'4 4'});
        create('circle',{cx,cy:lineEnd,r:4,fill:'#d46047'});
        create('text',{x:cx+9,y:lineEnd+4,fill:'#4f6656','font-size':12,'font-family':'monospace'},diagram).textContent=index===0?'A / '+String(b.n).padStart(2,'0'):'D / '+String(b.n).padStart(2,'0');
      }
    });
    // Anchor and model metadata are informational only; no engineering analysis is implied.
    create('text',{x:36,y:565,fill:'#617463','font-size':12,'font-family':'monospace'}).textContent='RULE-BASED GEOMETRY';
    create('text',{x:36,y:586,fill:'#829183','font-size':10,'font-family':'monospace'}).textContent='DRAG TO MODIFY';
    create('circle',{cx:593,cy:545,r:17,fill:'none',stroke:'#8fa291','stroke-width':1});
    create('line',{x1:575,y1:545,x2:611,y2:545,stroke:'#8fa291'});
    create('line',{x1:593,y1:527,x2:593,y2:563,stroke:'#8fa291'});
  }
  if(slider&&diagram){
    drawStructure();
    slider.addEventListener('input',drawStructure);
  }
  const year=document.getElementById('copyrightYear');
  if(year)year.textContent=String(new Date().getFullYear());
})();
