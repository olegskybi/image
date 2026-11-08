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