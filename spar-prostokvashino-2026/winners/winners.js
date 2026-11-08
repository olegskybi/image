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