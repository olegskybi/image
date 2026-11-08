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
