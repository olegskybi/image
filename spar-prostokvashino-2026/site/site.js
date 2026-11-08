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