(() => {
 const track=document.querySelector('#spar-participation .spar-steps__list');
 if(!track || track.dataset.initialized)return;
 track.dataset.initialized='true';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const step=()=>track.children[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
 const scrollToCard=index=>track.scrollTo({left:index*step(),behavior:reduced.matches?'instant':'smooth'});
 let drag=null;
 track.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0||track.scrollWidth<=track.clientWidth)return;
  drag={id:event.pointerId,x:event.clientX,left:track.scrollLeft};
  track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');event.preventDefault();
 });
 track.addEventListener('pointermove',event=>{if(drag && event.pointerId===drag.id)track.scrollLeft=drag.left+drag.x-event.clientX;});
 const finish=event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const id=drag.id;drag=null;track.classList.remove('is-dragging');
  if(track.hasPointerCapture(id))track.releasePointerCapture(id);
  scrollToCard(Math.round(track.scrollLeft/step()));
 };
 track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);track.addEventListener('lostpointercapture',finish);
 track.addEventListener('dragstart',event=>event.preventDefault());
 track.querySelectorAll('img').forEach(image=>{image.draggable=false;});
 track.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const current=Math.round(track.scrollLeft/step());
  scrollToCard(event.key==='Home'?0:event.key==='End'?track.children.length-1:current+(event.key==='ArrowRight'?1:-1));
 });
})();

(() => {
  const root = document.getElementById('spar-products');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  const track = root.querySelector('.spar-products__track');
  const prev = root.querySelector('.spar-products__prev');
  const next = root.querySelector('.spar-products__next');
  const status = root.querySelector('.spar-products__status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const edgeTolerance = 2;
  const cards = Array.from(track.children);
  const dots = document.createElement('div');
  dots.className = 'spar-products__dots';
  dots.setAttribute('role','group');
  dots.setAttribute('aria-label','Переключение товаров');
  next.after(dots);
  const dotButtons = cards.map((card,index) => {
    const button = document.createElement('button');
    button.type='button';button.className='spar-products__dot';
    button.setAttribute('aria-label',`Показать товар ${index + 1} из ${cards.length}`);
    button.setAttribute('aria-controls',track.id);
    button.addEventListener('click',()=>track.scrollTo({left:index * stride(),behavior:reducedMotion.matches?'instant':'smooth'}));
    dots.append(button);return button;
  });
  const stride = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  const update = () => {
    const maximum = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= edgeTolerance;
    next.disabled = track.scrollLeft >= maximum - edgeTolerance;
    const first = Math.round(track.scrollLeft / stride()) + 1;
    const visible = Math.max(1, Math.round((track.clientWidth + parseFloat(getComputedStyle(track).columnGap)) / stride()));
    dots.hidden = maximum <= edgeTolerance;
    dotButtons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index >= first - 1 && index < first - 1 + visible)));
    status.textContent = `Товары ${first}–${Math.min(cards.length, first + visible - 1)} из ${cards.length}`;
  };
  const move = direction => track.scrollBy({left: direction * stride(), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); track.scrollTo({left:event.key === 'Home' ? 0 : track.scrollWidth,behavior:reducedMotion.matches ? 'instant' : 'smooth'});
    }
  });
  track.addEventListener('scroll', update, {passive:true});
  new ResizeObserver(update).observe(track);
  update();
})();
(() => {
 const form=document.getElementById('spar-entry-form');
 if(!form || form.dataset.initialized) return;
 form.dataset.initialized='true';
 const status=form.querySelector('.spar-entry__status');
 const controls=Array.from(form.querySelectorAll('input,select'));
 function validate(field){
   let error='';
   if(field.type==='checkbox') error=field.checked?'':'Подтвердите согласие для проверки формы.';
   else if(!field.value.trim()) error=field.name==='purchase'?'Выберите способ покупки.':'Заполните это поле.';
   else if(field.name==='name' && field.value.trim().split(/\s+/).length<2) error='Укажите фамилию и имя.';
   else if(field.name==='phone' && !/^[78]\d{10}$/.test(field.value.replace(/[^\d]/g,''))) error='Укажите российский номер: 11 цифр, начиная с 7 или 8.';
   else if(field.name==='email' && field.validity.typeMismatch) error='Укажите корректный e-mail.';
   field.setAttribute('aria-invalid',String(Boolean(error)));
   document.getElementById(field.id+'-error').textContent=error;
   return !error;
 }
 for(const field of controls){
   field.addEventListener('input',()=>{status.textContent='';if(field.getAttribute('aria-invalid')==='true')validate(field);});
   field.addEventListener('change',()=>{status.textContent='';if(field.getAttribute('aria-invalid')==='true')validate(field);});
 }
 form.addEventListener('submit',event=>{
   event.preventDefault();
   const invalid=controls.filter(field=>!validate(field));
   if(invalid.length){status.textContent='Проверьте отмеченные поля.';invalid[0].focus();return;}
   status.textContent='Поля заполнены корректно. Заявка не отправлена: приём заявок пока не открыт.';
 });
})();
(() => {
 const root=document.getElementById('spar-winners');
 if(!root || root.dataset.initialized) return;
 const configNode=document.getElementById('spar-winners-data');
 let config;
 try {config=JSON.parse(configNode.textContent);} catch {return;}
 if(!Array.isArray(config.draws) || !config.draws.length)return;
 root.dataset.initialized='true';
 const search=root.querySelector('.spar-winners__search');
 const dates=root.querySelector('.spar-winners__dates');
 const table=root.querySelector('table');
 const body=table.querySelector('tbody');
 const status=root.querySelector('.spar-winners__status');
 let active=config.draws[0].id;
 const normalize=value=>String(value??'').trim().toLocaleLowerCase('ru-RU').replace(/\s/g,'');
 function render(){
   const draw=config.draws.find(item=>item.id===active);
   const query=normalize(search.value);
   const winners=Array.isArray(draw.winners)?draw.winners:[];
   const matches=winners.filter(winner=>normalize(winner.participantId).includes(query));
   body.replaceChildren();
   table.setAttribute('aria-label',`Победители розыгрыша за ${draw.label}`);
   dates.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.draw===active)));
   if(!matches.length){
     const row=document.createElement('tr');const cell=document.createElement('td');
     cell.colSpan=3;cell.className='spar-winners__empty';
     cell.textContent=winners.length?'По этому номеру участника ничего не найдено':'Победителей пока нет';
     row.append(cell);body.append(row);status.textContent=`${draw.label}. ${cell.textContent}`;
   }else{
     for(const winner of matches){const row=document.createElement('tr');for(const key of ['participantId','name','prize']){const cell=document.createElement('td');cell.textContent=String(winner[key]??'');row.append(cell);}body.append(row);}
     status.textContent=`${draw.label}. Найдено победителей: ${matches.length}`;
   }
 }
 dates.replaceChildren();
 for(const draw of config.draws){const button=document.createElement('button');button.type='button';button.className='spar-winners__date';button.dataset.draw=draw.id;button.textContent=draw.label;button.setAttribute('aria-controls','spar-winners-table');button.addEventListener('click',()=>{active=draw.id;render();});dates.append(button);}
 let timer;
 search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(render,150);});
 render();
})();
(()=>{const root=document.getElementById("spar-hero");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-hero__copy,.spar-layer-5,.spar-layer-22,.spar-layer-30,.spar-layer-40,.spar-layer-56,.spar-layer-71,.spar-layer-74").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();
(()=>{const root=document.getElementById("spar-participation");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-steps__title,.spar-steps__list").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();
(()=>{const root=document.getElementById("spar-prizes");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-prizes__header,.spar-prizes__panel,.spar-prizes__footer").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();
(()=>{const root=document.getElementById("spar-products");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-products__title,.spar-products__slider,.spar-products__order").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();
(()=>{const root=document.getElementById("spar-entry");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-entry__title,.spar-entry__form,.spar-entry__cat,.spar-entry__bird").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();
(()=>{const root=document.getElementById("spar-winners");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-winners__title,.spar-winners__inner").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();
(()=>{const root=document.getElementById("spar-faq");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-faq__title,.spar-faq__item").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();
(()=>{const root=document.getElementById("spar-question");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-question__copy,.spar-question__image").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();
(()=>{const root=document.getElementById("spar-footer");if(!root||root.dataset.scrollMotion||!("IntersectionObserver" in window))return;root.dataset.scrollMotion="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target.classList.toggle("is-in-view",entry.isIntersecting||entry.target.contains(document.activeElement));}},{rootMargin:"-24px 0px -24px 0px",threshold:0});root.querySelectorAll(".spar-footer__conditions").forEach(element=>{element.classList.add("spar-scroll-motion");observer.observe(element);});})();