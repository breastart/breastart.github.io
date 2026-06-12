// ============ НАЛАШТУВАННЯ ============
// Formspree: зареєструйте безкоштовну форму на formspree.io і вставте сюди ендпоінт,
// напр. "https://formspree.io/f/abcdwxyz". Поки порожньо — замовлення копіюється
// в буфер і відкривається Instagram Direct.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mdavpeae";  // лист на ORDER_EMAIL автоматично
const ORDER_EMAIL = "sisidiart@gmail.com";  // замовлення надсилаються сюди
// =====================================

const fmt = n => n==null ? "" : n.toLocaleString("uk-UA").replace(/,/g," ");

let DATA=[], current="all";
const grid=document.getElementById("grid");
const filters=document.getElementById("filters");
const countEl=document.getElementById("count");

fetch("data/catalog.json").then(r=>r.json()).then(d=>{DATA=d;buildFilters();render();})
  .catch(()=>{grid.innerHTML='<p>Не вдалося завантажити каталог. Відкрийте сайт через GitHub Pages (не локальний файл).</p>';});

function buildFilters(){
  const series=[...new Set(DATA.map(x=>x.series))];
  const mk=(label,val)=>{const b=document.createElement("button");b.className="chip";
    b.textContent=label;b.setAttribute("aria-pressed",val===current);
    b.onclick=()=>{current=val;[...filters.children].forEach(c=>c.setAttribute("aria-pressed","false"));
      b.setAttribute("aria-pressed","true");render();};return b;};
  filters.appendChild(mk("Усі серії","all"));
  series.forEach(s=>filters.appendChild(mk(s,s)));
}

function render(){
  const list = current==="all"?DATA:DATA.filter(x=>x.series===current);
  grid.innerHTML="";
  list.forEach(w=>{
    const c=document.createElement("article");
    c.className="card"+(w.status==="sold"?" sold":"");
    const price = w.status==="sold" ? "Продано" : (w.price?fmt(w.price)+" грн":"За запитом");
    c.innerHTML=`<div class="ph">${w.status==="sold"?'<span class="badge">Продано</span>':''}
      <img loading="lazy" src="${w.image}" alt="${w.title}"></div>
      <div class="body"><div class="t">${w.title}</div>
      <div class="s">${w.series}</div>
      <div class="row"><span class="price">${price}</span><span class="dim">${w.size} см</span></div></div>`;
    c.onclick=()=>openLB(w);
    grid.appendChild(c);
  });
  countEl.textContent=list.length+" робіт";
}

/* ---------- lightbox ---------- */
const lb=document.getElementById("lb");
function openLB(w){
  const avail=w.status!=="sold";
  const price = avail ? (w.price?fmt(w.price)+" грн":"Ціна за запитом") : "";
  lb.querySelector(".lb-img").innerHTML=`<img src="${w.image}" alt="${w.title}">`;
  lb.querySelector(".lb-info").innerHTML=`
    <div class="eyebrow">${w.series}</div>
    <h3>${w.title}</h3>
    <dl><dt>Рік</dt><dd>${w.year}</dd>
    <dt>Розмір</dt><dd>${w.size} см</dd>
    <dt>Техніка</dt><dd>${w.medium}</dd></dl>
    ${avail?`<div class="price-big">${price}</div>
      <div class="actions"><button class="btn gold" id="lb-order">Замовити</button></div>`
    :`<div class="sold-note">Цю роботу продано та передано у приватну колекцію.</div>
      <div class="actions"><a class="btn" href="paintings.html">Інші роботи</a></div>`}`;
  const ob=document.getElementById("lb-order");
  if(ob) ob.onclick=()=>{closeLB();openOrder(w);};
  lb.classList.add("open");document.body.style.overflow="hidden";
}
function closeLB(){lb.classList.remove("open");document.body.style.overflow="";}
lb.addEventListener("click",e=>{if(e.target===lb||e.target.classList.contains("lb-close"))closeLB();});

/* ---------- order form ---------- */
const order=document.getElementById("order");
const ocard=document.getElementById("order-card");
function openOrder(w){
  const price = w.price?fmt(w.price)+" грн":"ціна за запитом";
  ocard.innerHTML=`
    <h3>Замовлення</h3>
    <div class="ol-work"><b>${w.title}</b> · ${w.series} · ${w.size} см · ${price}</div>
    <div class="field"><label>Імʼя *</label><input id="o-name" autocomplete="name"></div>
    <div class="field"><label>Телефон або Telegram *</label><input id="o-phone" autocomplete="tel"></div>
    <div class="field"><label>Місто *</label><input id="o-city"></div>
    <div class="field"><label>Відділення Нової Пошти</label><input id="o-np"></div>
    <div class="field"><label>Коментар</label><textarea id="o-note"></textarea></div>
    <div class="pay-note">Ми звʼяжемося з вами для підтвердження наявності й термінів, після чого надішлемо посилання на оплату.</div>
    <div class="order-actions"><button class="btn gold" id="o-send">Оформити замовлення</button>
      <button class="btn" id="o-cancel">Скасувати</button></div>`;
  document.getElementById("o-cancel").onclick=closeOrder;
  document.getElementById("o-send").onclick=()=>sendOrder(w);
  order.classList.add("open");document.body.style.overflow="hidden";
}
function closeOrder(){order.classList.remove("open");document.body.style.overflow="";}
order.addEventListener("click",e=>{if(e.target===order||e.target.classList.contains("order-close"))closeOrder();});

function val(id){return (document.getElementById(id)||{}).value?.trim()||"";}
function sendOrder(w){
  const name=val("o-name"),phone=val("o-phone"),city=val("o-city"),np=val("o-np"),note=val("o-note");
  if(!name||!phone||!city){alert("Будь ласка, заповніть імʼя, телефон і місто.");return;}
  const price=w.price?fmt(w.price)+" грн":"ціна за запитом";
  const summary=`Замовлення картини\n— Робота: ${w.title} (${w.series}), ${w.size} см\n— Ціна: ${price}\n— Імʼя: ${name}\n— Контакт: ${phone}\n— Місто: ${city}\n— Відділення НП: ${np||"—"}\n— Коментар: ${note||"—"}`;
  if(FORMSPREE_ENDPOINT){
    fetch(FORMSPREE_ENDPOINT,{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json"},
      body:JSON.stringify({work:w.title,series:w.series,size:w.size,price,name,phone,city,nova_poshta:np,comment:note})})
      .then(r=>r.ok?thanks():Promise.reject()).catch(()=>mailtoFallback(w,summary));
  } else { mailtoFallback(w,summary); }
}
function mailtoFallback(w,summary){
  const subj=encodeURIComponent("Замовлення картини: "+w.title);
  window.location.href=`mailto:${ORDER_EMAIL}?subject=${subj}&body=${encodeURIComponent(summary)}`;
  thanks();
}
function thanks(){
  ocard.innerHTML=`<div class="order-msg"><div class="ok">Дякуємо!</div>
    <p>Ваше замовлення надіслано. Ми звʼяжемося з вами найближчим часом, щоб підтвердити наявність і терміни та надіслати посилання на оплату.</p>
    <div class="order-actions" style="justify-content:center">
      <button class="btn gold" id="o-done">Закрити</button></div></div>`;
  document.getElementById("o-done").onclick=closeOrder;
}

document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeLB();closeOrder();}});
