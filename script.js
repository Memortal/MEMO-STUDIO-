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

  const year=document.getElementById('copyrightYear');
  if(year)year.textContent=String(new Date().getFullYear());
})();
