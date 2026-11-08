/* MEMO Studio / Massing Lab
   A deterministic, schematic architecture rule engine.
   Geometry is occupancy-based: subtracted cells are actual voids,
   while varying floor heights, facade styles and roof elements
   change the drawn solids. Not construction documentation. */
'use strict';
(function () {
  const svg = document.getElementById('systemDrawing');
  const slider = document.getElementById('moduleSlider');
  if (!svg || !slider) return;
  const NS = 'http://www.w3.org/2000/svg';
  const PITCH = 21;
  const GRID = 12;
  const PRESETS = [
    {name:'Cross Court',family:'Four courtyard arms',cut:'Central void + passage',facade:'bands',roof:'garden',floors:[16,12,11,11,10,12],seed:11},
    {name:'Offset Donut',family:'Asymmetric perimeter',cut:'Offset court + corner cut',facade:'punched',roof:'skylight',floors:[18,13,11,11,11,10,13],seed:23},
    {name:'Stepped Cluster',family:'Four offset towers',cut:'Stepped upper setbacks',facade:'fins',roof:'terrace',floors:[17,12,12,10,10,11,12,13],seed:37},
    {name:'L-Block Interlock',family:'Two interlocking Ls',cut:'Deep interlock notches',facade:'balconies',roof:'pavilion',floors:[16,13,11,9,12,11,13],seed:43},
    {name:'Carved Court',family:'Corner-cut perimeter',cut:'Diagonal corners + court',facade:'framed',roof:'green',floors:[15,12,10,12,10,12,11],seed:53},
    {name:'Twin Slabs + Bridge',family:'Paired slab buildings',cut:'Open ground + sky bridge',facade:'horizontal',roof:'solar',floors:[17,12,12,13,11,10,12],seed:61},
    {name:'Split Podium',family:'Continuous base + towers',cut:'Four tower separations',facade:'mixed',roof:'terrace',floors:[20,17,11,11,10,10,13,12],seed:73},
    {name:'Stepped Ring',family:'Terraced perimeter',cut:'Setbacks + inner court',facade:'screen',roof:'skylight',floors:[16,12,11,11,11,10,13,12],seed:89},
    {name:'Pinwheel',family:'Four radial wings',cut:'Rotated wing notches',facade:'fins',roof:'pavilion',floors:[17,12,10,11,10,12,11],seed:97},
    {name:'Carved Monolith',family:'Continuous carved block',cut:'Vertical slots + roof cuts',facade:'framed',roof:'green',floors:[18,13,11,11,11,10,12,13],seed:101},
    {name:'Cascading Court',family:'Four terraced wings',cut:'Step-down courts + bridge',facade:'balconies',roof:'garden',floors:[16,11,12,10,11,12,10,13],seed:113},
    {name:'Frame + Infill',family:'Perimeter frame + volumes',cut:'Open plinth + inset voids',facade:'screen',roof:'mechanical',floors:[20,12,11,11,10,12,13],seed:127}
  ];
  const state = {index:5,shuffle:0,cut:55,facade:72,roof:65,lockFootprint:false,lockFloors:false,lockFacade:false,locks:null,pinned:null};
  const get = id => document.getElementById(id);
  const presetName = get('proposalName');
  const caption = get('moduleValue');
  const summary = get('proposalSummary');
  const dataLabels = {family:get('detailFamily'),cuts:get('detailCuts'),facade:get('detailFacade'),roof:get('detailRoof'),floors:get('detailFloors'),gfa:get('detailGfa'),height:get('detailHeight')};
  const roofLabels = {garden:'Roof terraces + planters',skylight:'Skylight bands',terrace:'Accessible terraces',pavilion:'Roof pavilions',green:'Planted roofs',solar:'Solar canopy',mechanical:'Screened roof equipment'};
  const facadeLabels = {bands:'Horizontal slab bands',horizontal:'Strip windows',punched:'Punched openings',fins:'Vertical fins',balconies:'Recessed balconies',framed:'Deep perimeter frames',mixed:'Mixed podium + upper',screen:'Perforated screens'};
  const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:0});
  const rect=(x,y,a,b)=>x>=a&&x<=b&&y>=a&&y<=b;
  const hash=(a,b,c,seed)=>{let n=(a*73856093)^(b*19349663)^(c*83492791)^(seed*2654435761);n=Math.imul(n^(n>>>16),2246822507);return ((n^(n>>>13))>>>0)/4294967295;};
  function boxFn(i,x,y,k) {
    const ring=rect(x,y,1,10,1,10)&&!rect(x,y,4,7,4,7);
    switch(i) {
      case 0: return ((rect(x,y,1,10,1,3)||rect(x,y,1,10,8,10)||rect(x,y,1,3,3,9)||rect(x,y,8,10,3,9))&&!rect(x,y,4,7,4,7)) && !(k===0&&rect(x,y,5,6,8,10)) && !(k>3&&rect(x,y,1,2,1,3));
      case 1: return (rect(x,y,1,10,1,10)&&!rect(x,y,4,8,4,7)&&!rect(x,y,8,10,1,3))&&!(k>4&&rect(x,y,1,3,8,10));
      case 2: return ((rect(x,y,1,4,1,4)&&k<5)||(rect(x,y,7,10,1,4)&&k<8)||(rect(x,y,1,4,7,10)&&k<7)||(rect(x,y,7,10,7,10)&&k<4))&&!(k>2&&rect(x,y,1,2,1,2));
      case 3: return (rect(x,y,1,8,1,3)||rect(x,y,1,3,1,9)||rect(x,y,4,10,8,10)||rect(x,y,8,10,4,10))&&!(k>4&&rect(x,y,1,3,7,9))&&!(k>5&&rect(x,y,8,10,4,6));
      case 4: return ring && !((x+y<6)||(x+y>17)||(x-y>7)||(y-x>7))&&!(k>4&&x<3&&y>7);
      case 5: return ((rect(x,y,1,3,1,10)||rect(x,y,8,10,1,10))||(k>=3&&k<=5&&rect(x,y,4,7,4,6)))&&!(k===0&&y===5);
      case 6: return (k<=1?rect(x,y,1,10,1,10)&&!rect(x,y,5,6,1,5):(rect(x,y,1,4,1,4)||rect(x,y,7,10,1,4)||rect(x,y,1,4,7,10)||rect(x,y,7,10,7,10)))&&!(k>5&&rect(x,y,1,3,1,3));
      case 7: {const s=Math.floor(k/2);return rect(x,y,1+s,10-s,1+s,10-s)&&!rect(x,y,4,7,4,7)&&!(k>4&&y<3+s);}
      case 8: return (rect(x,y,2,8,1,3)||rect(x,y,8,10,2,8)||rect(x,y,3,9,8,10)||rect(x,y,1,3,3,9))&&!rect(x,y,4,7,4,7)&&!(k>4&&x<3&&y<5)&&!(k>5&&x>8&&y>6);
      case 9: return rect(x,y,1,10,1,10)&&!rect(x,y,4,5,1,5)&&!(k>=2&&rect(x,y,7,8,6,10))&&!(k>4&&rect(x,y,3,7,3,7))&&!(k>6&&rect(x,y,1,3,8,10));
      case 10: return ring&&!(k>2&&rect(x,y,1,3,1,3))&&!(k>3&&rect(x,y,8,10,1,3))&&!(k>5&&rect(x,y,1,3,8,10))&&!(k>6&&rect(x,y,8,10,8,10))&&(k>=3&&k<=4?true:!rect(x,y,5,6,1,3));
      case 11: return ((k===0?false:ring)||rect(x,y,4,7,4,7)&&k<4)&&!(k>3&&rect(x,y,4,7,8,10))&&!(k>4&&rect(x,y,1,3,4,7))&&!(k>5&&rect(x,y,8,10,4,7));
      default: return false;
    }
  }
  function genome(index=state.index,shuffle=state.shuffle){
    const p=PRESETS[index];
    const seed=p.seed+shuffle*31;
    let heights=p.floors.map((n,k)=>Math.max(9,n+((shuffle===0)?0:Math.round((hash(index,k,shuffle,seed)-.5)*3))));
    let facade=p.facade;
    if(state.locks?.floors&&state.lockFloors)heights=state.locks.floors.slice();
    if(state.locks?.facade&&state.lockFacade)facade=state.locks.facade;
    return {index,seed,heights,facade,roof:p.roof,cut:state.cut/100,roofIntensity:state.roof/100,facadeDensity:state.facade/100,footprint:(state.lockFootprint&&state.locks?.footprint)?state.locks.footprint:null};
  }
  function occupied(g,x,y,k) {
    if(x<0||x>=GRID||y<0||y>=GRID||k<0||k>=g.heights.length)return false;
    if(k===0&&g.footprint)return !!g.footprint[y*GRID+x];
    let on=boxFn(g.index,x,y,k);
    if(!on)return false;
    // Secondary carved recesses are deterministic and preserve each family's signature.
    const c=g.cut;
    const offset=g.seed%4;
    const band=(g.seed>>>3)%3;
    if(k>=2 && c>0.15) {
      const depth=c>.72?2:1;
      if(offset===0&&rect(x,y,1,1+depth,4+band,6+band)&&k>2)return false;
      if(offset===1&&rect(x,y,9-depth,10,4+band,6+band)&&k>3)return false;
      if(offset===2&&rect(x,y,4+band,6+band,1,1+depth)&&k>2)return false;
      if(offset===3&&rect(x,y,4+band,6+band,9-depth,10)&&k>3)return false;
    }
    // Alternating per-level rooftop carve-outs; not an image-only outline.
    if(k>=4&&c>.36) {
      const side=g.seed%3,cutWidth=c>.74?2:1;
      if(side===0&&x>=10-cutWidth&&y<=2&&k>=6)return false;
      if(side===1&&x<=1+cutWidth&&y>=9&&k>=5)return false;
      if(side===2&&y<=1+cutWidth&&x>=7&&k>=6)return false;
    }
    return true;
  }
  function modelFor(g){
    const floors=g.heights;
    const base=[0];floors.forEach(h=>base.push(base.at(-1)+h));
    const cube=[];
    let modules=0,ground=0,peak=0,roofCells=0;
    for(let k=0;k<floors.length;k++){
      for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
        if(!occupied(g,x,y,k))continue;
        modules++;if(k===0)ground++;peak=Math.max(peak,base[k+1]);
        const top=!occupied(g,x,y,k+1);
        const sx=!occupied(g,x+1,y,k),sy=!occupied(g,x,y+1,k);
        if(top)roofCells++;
        cube.push({x,y,k,z:base[k],h:floors[k],top,sx,sy});
      }
    }
    return {cube,base,floors,modules,ground,peak,roofCells,approxArea:modules*22*22};
  }
  // Four distinct studio palettes keep drawings recognizable while the facade treatment changes.
  const palettes=[
    {top:'#cddacb',south:'#a4bba5',east:'#b7cbb5',line:'#65816a',glass:'#52776c',accent:'#d66b51'},
    {top:'#dde1d5',south:'#b8c4b5',east:'#c9d0c3',line:'#718373',glass:'#5e7d72',accent:'#cd7358'},
    {top:'#c4d6d4',south:'#99b9b6',east:'#b8cfca',line:'#648584',glass:'#587b7a',accent:'#e06d53'},
    {top:'#e0dacc',south:'#c4bfae',east:'#d3ccbd',line:'#847e6e',glass:'#6e7972',accent:'#d46e57'}
  ];
  const make=(tag,attrs,parent)=>{
    const n=document.createElementNS(NS,tag);
    for(const [k,v] of Object.entries(attrs||{}))n.setAttribute(k,String(v));
    if(parent)parent.appendChild(n);return n;
  };
  const point=(x,y,z)=>[348+(x-y)*1.23,265+(x+y)*.52-z*.87];
  const xy=(x,y,z)=>point((x-6)*PITCH,(y-6)*PITCH,z);
  const coords=arr=>arr.map(p=>xy(...p).map(q=>q.toFixed(2)).join(',')).join(' ');
  function polygon(parent,verts,fill,stroke,width=.7){
    return make('polygon',{points:coords(verts),fill,stroke,'stroke-width':width,'stroke-linejoin':'round'},parent);
  }
  function line(parent,a,b,color,width=.75){
    const A=xy(...a),B=xy(...b);
    make('line',{x1:A[0],y1:A[1],x2:B[0],y2:B[1],stroke:color,'stroke-width':width},parent);
  }
  function quadOnFace(a,b,z0,z1,u0,u1,v0,v1) {
    const lerp=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
    const A=lerp(a,b,u0),B=lerp(a,b,u1);
    return [[A[0],A[1],z0+(z1-z0)*v0],[B[0],B[1],z0+(z1-z0)*v0],[B[0],B[1],z0+(z1-z0)*v1],[A[0],A[1],z0+(z1-z0)*v1]];
  }
  function face(parent,a,b,z0,z1,orientation,g,colors,cell){
    const fill=orientation==='south'?colors.south:colors.east;
    polygon(parent,[[...a,z0],[...b,z0],[...b,z1],[...a,z1]],fill,colors.line,.44);
    const display=g.facade==='mixed'?(cell.k<2?'framed':(cell.k%2?'bands':'punched')):g.facade;
    const active=hash(cell.x,cell.y,cell.k,g.seed+orientation.length) < Math.max(.14,g.facadeDensity);
    if(!active)return;
    const panel=(u0,u1,v0,v1,color=colors.glass)=>{
      const vertices=quadOnFace(a,b,z0,z1,u0,u1,v0,v1);
      polygon(parent,vertices,color,colors.line,.45);
      return vertices;
    };
    if(display==='bands'||display==='horizontal'){
      panel(.035,.965,.46,.72,'#6f9587');line(parent,[...a,z0+(z1-z0)*.81],[...b,z0+(z1-z0)*.81],colors.line,1.1);
    }else if(display==='fins'){
      panel(.09,.92,.20,.81,'#76998c');
      for(let s of [.13,.4,.67,.9]){
        const X=[a[0]+(b[0]-a[0])*s,a[1]+(b[1]-a[1])*s];
        line(parent,[...X,z0+(z1-z0)*.14],[...X,z0+(z1-z0)*.91],colors.accent,.85);
      }
    }else if(display==='punched'){
      panel(.21,.78,.24,.76,'#74988c');
      line(parent,[a[0]+(b[0]-a[0])*.5,a[1]+(b[1]-a[1])*.5,z0+(z1-z0)*.24],[a[0]+(b[0]-a[0])*.5,a[1]+(b[1]-a[1])*.5,z0+(z1-z0)*.76],'#c0d9ce',.8);
    }else if(display==='balconies'){
      panel(.10,.9,.20,.71,'#789b8c');
      if(cell.k%2===0) {
        const start=[...a,z0+(z1-z0)*.12],end=[...b,z0+(z1-z0)*.12];
        line(parent,start,end,colors.accent,2.2);
        line(parent,[...a,z0+(z1-z0)*.35],[...b,z0+(z1-z0)*.35],colors.line,.9);
      }
    }else if(display==='framed'){
      panel(.10,.91,.14,.84,'#7b9a8d');
      const verts=quadOnFace(a,b,z0,z1,.065,.945,.1,.88);
      make('polygon',{points:coords(verts),fill:'none',stroke:colors.accent,'stroke-width':1.75},parent);
    }else if(display==='screen'){
      panel(.04,.96,.17,.85,'#8da99a');
      for(let s of [.14,.3,.46,.62,.78,.94]){
        const X=[a[0]+(b[0]-a[0])*s,a[1]+(b[1]-a[1])*s];
        line(parent,[...X,z0+(z1-z0)*.13],[...X,z0+(z1-z0)*.90],colors.line,.9);
      }
    }else panel(.15,.86,.23,.76);
  }
  function roofElement(parent,cell,g,colors) {
    if(g.roofIntensity<.1)return;
    const {x,y,z,h}=cell,H=z+h;
    const chance=hash(x,y,cell.k,g.seed+93);
    if(chance>g.roofIntensity*.47)return;
    const center=[x+.5,y+.5,H];
    if(g.roof==='garden'||g.roof==='green'||g.roof==='terrace'){
      polygon(parent,[[x+.12,y+.12,H+.45],[x+.87,y+.12,H+.45],[x+.87,y+.87,H+.45],[x+.12,y+.87,H+.45]],g.roof==='terrace'?'#e1ddd0':'#86aa83',colors.line,.65);
      if(chance<.16){
        const pos=xy(...center);make('circle',{cx:pos[0],cy:pos[1]-3,r:4.4,fill:'#507e56',stroke:'#f2f4e9','stroke-width':.6},parent);
      }
    }else if(g.roof==='skylight'){
      polygon(parent,[[x+.17,y+.23,H+.9],[x+.82,y+.23,H+.9],[x+.82,y+.77,H+.9],[x+.17,y+.77,H+.9]],'#7aaca9','#537d79',1.1);
    }else if(g.roof==='solar'){
      polygon(parent,[[x+.08,y+.17,H+2.8],[x+.88,y+.17,H+2.8],[x+.88,y+.83,H+2.8],[x+.08,y+.83,H+2.8]],'#587a78',colors.line,.8);
      line(parent,[x+.1,y+.50,H+2.8],[x+.88,y+.5,H+2.8],'#c3d3bf',.7);
    }else if(g.roof==='pavilion'||g.roof==='mechanical') {
      if(chance>.12)return;
      const a=x+.22,b=x+.76,c=y+.20,d=y+.75,t=H+(g.roof==='pavilion'?7:4);
      polygon(parent,[[a,c,H],[b,c,H],[b,c,t],[a,c,t]],colors.east,colors.line,.8);
      polygon(parent,[[a,c,t],[b,c,t],[b,d,t],[a,d,t]],colors.top,colors.accent,.9);
      line(parent,[b,c,H],[b,c,t],colors.line,.8);
    }
  }
  function draw(target,g){
    const m=modelFor(g);
    target.replaceChildren();
    target.setAttribute('viewBox','0 0 700 470');
    target.setAttribute('preserveAspectRatio','xMidYMid meet');
    const palette=palettes[g.index%palettes.length];
    const fragment=document.createDocumentFragment();
    const grid=make('g',{'aria-hidden':'true'},fragment);
    for(let x=0;x<=GRID;x+=2){
      line(grid,[x,0,-2],[x,GRID,-2],'#c3cec2',.75);
      line(grid,[0,x,-2],[GRID,x,-2],'#c3cec2',.75);
    }
    const site=make('g',{'aria-hidden':'true'},fragment);
    polygon(site,[[0,0,-3],[12,0,-3],[12,12,-3],[0,12,-3]],'rgba(234,241,231,.36)','#9baa9b',1.1);
    const solids=make('g',{},fragment);
    // Painter sorting uses iso depth (x+y) and z to keep exposed exterior faces legible.
    const sorted=m.cube.slice().sort((a,b)=>{
      const ad=a.x+a.y,bd=b.x+b.y;
      return ad-bd||a.k-b.k||a.y-b.y||a.x-b.x;
    });
    for(const cell of sorted){
      const {x,y,z,h,k,sx,sy,top}=cell;
      if(sx)face(solids,[x+1,y],[x+1,y+1],z,z+h,'east',g,palette,cell);
      if(sy)face(solids,[x,y+1],[x+1,y+1],z,z+h,'south',g,palette,cell);
      if(top){
        const color=(k===0)?palette.top:(k%4===0?palette.top:'#d6dfd2');
        polygon(solids,[[x,y,z+h],[x+1,y,z+h],[x+1,y+1,z+h],[x,y+1,z+h]],color,palette.line,.52);
        roofElement(solids,cell,g,palette);
      }
    }
    const labels=make('g',{},fragment);
    make('text',{x:24,y:444,fill:'#6a806d','font-family':'monospace','font-size':11,'letter-spacing':'1'},labels).textContent='ACTUAL VOLUME SUBTRACTIONS / SCHEMATIC';
    make('text',{x:675,y:444,'text-anchor':'end',fill:'#7f9081','font-family':'monospace','font-size':11},labels).textContent=PRESETS[g.index].name.toUpperCase();
    target.append(fragment);
    return m;
  }
  function metadata(g,m){
    const p=PRESETS[g.index];
    if(caption)caption.textContent=String(g.index+1).padStart(2,'0')+' / 12';
    if(presetName)presetName.textContent=p.name;
    if(summary)summary.textContent=p.family+' · '+p.cut;
    if(dataLabels.family)dataLabels.family.textContent=p.family;
    if(dataLabels.cuts)dataLabels.cuts.textContent=p.cut;
    if(dataLabels.facade)dataLabels.facade.textContent=facadeLabels[g.facade]||g.facade;
    if(dataLabels.roof)dataLabels.roof.textContent=roofLabels[g.roof]||g.roof;
    if(dataLabels.floors)dataLabels.floors.textContent=g.heights.join(' / ')+' ft';
    if(dataLabels.gfa)dataLabels.gfa.textContent=fmt(m.approxArea)+' sf*';
    if(dataLabels.height)dataLabels.height.textContent=fmt(m.peak)+' ft';
    const note=get('renderNotice');
    if(note)note.textContent='12 massing grammars · '+m.modules+' occupied modules · '+m.roofCells+' roof cells';
  }
  const clone=g=>({index:g.index,seed:g.seed,heights:g.heights.slice(),facade:g.facade,roof:g.roof,cut:g.cut,roofIntensity:g.roofIntensity,facadeDensity:g.facadeDensity,footprint:g.footprint?.slice()??null});
  const comparePanel=get('comparePanel');
  function drawComparison(active) {
    if(!comparePanel)return;
    const has=!!state.pinned;
    comparePanel.hidden=!has;
    const left=get('compareBaseline'),right=get('compareCurrent');
    if(!has||!left||!right)return;
    const baseModel=draw(left,state.pinned);
    const currentModel=draw(right,active);
    const leftName=get('compareBaselineName'),rightName=get('compareCurrentName');
    if(leftName)leftName.textContent=PRESETS[state.pinned.index].name+' · '+fmt(baseModel.approxArea)+' sf';
    if(rightName)rightName.textContent=PRESETS[active.index].name+' · '+fmt(currentModel.approxArea)+' sf';
  }
  function refresh(){
    const g=genome();
    const m=draw(svg,g);
    metadata(g,m);
    drawComparison(g);
  }
  const apply=(name,fn)=>{const n=get(name);if(n)n.addEventListener('click',fn)};
  function captureLocks(){
    const g=genome();
    const cells=[];
    for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++)cells.push(occupied(g,x,y,0));
    state.locks={floors:g.heights.slice(),facade:g.facade,footprint:cells};
  }
  function advance(val){
    const next=Math.max(0,Math.min(11,Number(val)-1));
    if(next===state.index){refresh();return;}
    if(state.lockFootprint||state.lockFloors||state.lockFacade)captureLocks();
    else state.locks=null;
    state.index=next;state.shuffle=0;
    slider.value=String(next+1);
    refresh();
  }
  slider.min='1';slider.max='12';slider.step='1';slider.value=String(state.index+1);
  slider.addEventListener('input',e=>advance(e.target.value));
  apply('prevProposal',()=>advance(state.index===0?12:state.index));
  apply('nextProposal',()=>advance(state.index===11?1:state.index+2));
  apply('shuffleProposal',()=>{state.shuffle++;if(state.lockFootprint||state.lockFloors||state.lockFacade)captureLocks();refresh()});
  for(const [id,field] of [['cutDepth','cut'],['facadeDensity','facade'],['roofComplexity','roof']]){
    const control=get(id),out=get(id+'Value');
    if(!control)continue;
    control.value=state[field];
    const update=()=>{
      state[field]=Number(control.value);
      if(out)out.textContent=String(state[field])+'%';
      refresh();
    };
    control.addEventListener('input',update);if(out)out.textContent=String(state[field])+'%';
  }
  for(const [id,field] of [['lockFootprint','lockFootprint'],['lockFloors','lockFloors'],['lockFacade','lockFacade']]){
    const n=get(id);if(!n)continue;
    n.checked=false;
    n.addEventListener('change',()=>{
      if(n.checked)captureLocks();
      state[field]=n.checked;
      if(!state.lockFootprint&&!state.lockFloors&&!state.lockFacade)state.locks=null;
      refresh();
    });
  }
  apply('pinCompare',()=>{
    state.pinned=clone(genome());
    const pin=get('pinCompare');
    if(pin)pin.textContent='Update comparison';
    refresh();
  });
  apply('clearCompare',()=>{
    state.pinned=null;
    const pin=get('pinCompare');if(pin)pin.textContent='Pin to compare';
    refresh();
  });
  refresh();
})();