document.querySelector('.nav-toggle')?.addEventListener('click',function(){
  var n=document.querySelector('.site-nav');var o=n.classList.toggle('open');
  this.setAttribute('aria-expanded',o);
});