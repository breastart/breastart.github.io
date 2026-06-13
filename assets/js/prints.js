const FORMSPREE_ENDPOINT="https://formspree.io/f/mdavpeae";
const ORDER_EMAIL="sisidiart@gmail.com";
const SIZES=[["13×18 см","350 грн"],["21×30 см (A4)","600 грн"],["30×40 см","900 грн"],["40×50 см","1 400 грн"],["50×70 см (під замовлення)","2 200 грн"]];
const order=document.getElementById("order"), ocard=document.getElementById("order-card");
const ob=document.getElementById("open-print-order"); if(ob) ob.addEventListener("click",openPrintOrder);
function openPrintOrder(){
  const opts=SIZES.map(([s,p])=>`<option value="${s} — ${p}">${s} — ${p}</option>`).join("");
  ocard.innerHTML=`<h3>Замовлення принта</h3>
   <div class="ol-work">Друк обраної роботи. Рамка не входить — надсилаємо лише віддрукований принт.</div>
   <div class="field"><label>Яка робота *</label><input id="o-work" placeholder="напр. Експресія 1"></div>
   <div class="field"><label>Формат *</label><select id="o-size">${opts}</select></div>
   <div class="field"><label>Імʼя *</label><input id="o-name"></div>
   <div class="field"><label>Телефон або Telegram *</label><input id="o-phone"></div>
   <div class="field"><label>Місто *</label><input id="o-city"></div>
   <div class="field"><label>Відділення Нової Пошти</label><input id="o-np"></div>
   <div class="field"><label>Коментар</label><textarea id="o-note"></textarea></div>
   <div class="pay-note">Ми звʼяжемося для підтвердження й надішлемо посилання на оплату. Доставка розраховується окремо.</div>
   <div class="order-actions"><button class="btn gold" id="o-send">Оформити замовлення</button>
     <button class="btn" id="o-cancel">Скасувати</button></div>`;
  document.getElementById("o-cancel").onclick=closeO;
  document.getElementById("o-send").onclick=send;
  order.classList.add("open");document.body.style.overflow="hidden";
}
function closeO(){order.classList.remove("open");document.body.style.overflow="";}
function v(id){return (document.getElementById(id)||{}).value?.trim()||"";}
function send(){
  const work=v("o-work"),size=v("o-size"),name=v("o-name"),phone=v("o-phone"),city=v("o-city"),np=v("o-np"),note=v("o-note");
  if(!work||!name||!phone||!city){alert("Заповніть роботу, імʼя, телефон і місто.");return;}
  const summary=`Замовлення принта\n— Робота: ${work}\n— Формат: ${size}\n— Імʼя: ${name}\n— Контакт: ${phone}\n— Місто: ${city}\n— Відділення НП: ${np||"—"}\n— Коментар: ${note||"—"}`;
  if(FORMSPREE_ENDPOINT){
    fetch(FORMSPREE_ENDPOINT,{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json"},
      body:JSON.stringify({type:"Принт",work,size,name,phone,city,nova_poshta:np,comment:note})})
      .then(r=>r.ok?thanks():Promise.reject()).catch(()=>mail(work,summary));
  } else { mail(work,summary); }
}
function mail(work,summary){
  window.location.href=`mailto:${ORDER_EMAIL}?subject=${encodeURIComponent("Замовлення принта: "+work)}&body=${encodeURIComponent(summary)}`;
  thanks();
}
function thanks(){
  ocard.innerHTML=`<div class="order-msg"><div class="ok">Дякуємо!</div>
   <p>Ваше замовлення надіслано. Ми звʼяжемося з вами найближчим часом, щоб підтвердити деталі та надіслати посилання на оплату.</p>
   <div class="order-actions" style="justify-content:center"><button class="btn gold" id="o-done">Закрити</button></div></div>`;
  document.getElementById("o-done").onclick=closeO;
}
order.addEventListener("click",e=>{if(e.target===order||e.target.classList.contains("order-close"))closeO();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeO();});
