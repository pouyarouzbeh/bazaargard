import React,{useEffect,useMemo,useRef,useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Crosshair,LocateFixed,MapPin,Navigation,Plus,Check,Store,Wallet,Clock,ChevronLeft} from 'lucide-react';

const money=n=>n==null?'نامشخص':Number(n).toLocaleString('fa-IR');
const num=n=>Number(n).toLocaleString('fa-IR');
const price=o=>o.effective_price_toman??o.price_toman??0;
const RADII=[1,3,5,10];

/** Groups the visible offers by store so each store gets one pin and one card. */
function storesOf(offers){
 const by=new Map();
 offers.forEach(o=>{
  if(o.lat==null||o.lon==null)return;
  const s=by.get(o.shop_id)||{shop_id:o.shop_id,name:o.shop_name,address:o.address,area:o.location_label,lat:o.lat,lon:o.lon,opening:o.opening||{},credit:!!o.in_person_credit?.length,distance:o.distance_km,offers:[]};
  s.offers.push(o);by.set(o.shop_id,s);
 });
 return [...by.values()].map(s=>({...s,best:s.offers.reduce((a,b)=>price(b)<price(a)?b:a)}));
}

export default function MapPage({offers,profile,neighborhoods=[],planIds,onLocation,onNeighborhood,onRadius,onLocate,onShop,onAddPlan,pickInitially=false}){
 const box=useRef(null),map=useRef(null),markers=useRef(new Map()),cards=useRef(null),fitted=useRef(null);
 const [picking,setPicking]=useState(pickInitially),[active,setActive]=useState(null);
 const stores=useMemo(()=>storesOf(offers),[offers]);
 useEffect(()=>{
  const m=L.map(box.current,{zoomControl:false}).setView([35.70,51.41],12);
  L.control.zoom({position:'bottomleft'}).addTo(m);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap',maxZoom:19}).addTo(m);
  map.current=m;
  const resize=new ResizeObserver(()=>m.invalidateSize({pan:false}));resize.observe(box.current);
  return()=>{resize.disconnect();m.remove();map.current=null};
 },[]);
 useEffect(()=>{
  const m=map.current;if(!m)return;
  const layer=L.layerGroup().addTo(m),bounds=[];markers.current=new Map();
  stores.forEach((s,i)=>{
   bounds.push([s.lat,s.lon]);
   const icon=L.divIcon({className:'pin'+(planIds.has(s.best.offer_id)?' in-plan':''),html:'<span>'+num(i+1)+'</span>',iconSize:[34,40],iconAnchor:[17,40],popupAnchor:[0,-34]});
   const marker=L.marker([s.lat,s.lon],{icon,title:s.name}).addTo(layer);
   const pop=document.createElement('div');pop.className='map-pop';pop.dir='rtl';
   const h=document.createElement('b');h.textContent=s.name;
   const a=document.createElement('p');a.textContent=s.address;
   const meta=document.createElement('p');meta.className='map-pop-meta';meta.textContent=num(s.offers.length)+' پیشنهاد · از '+money(price(s.best))+' تومان'+(s.opening.label?' · '+s.opening.label:'');
   const row=document.createElement('div');row.className='map-pop-actions';
   const details=document.createElement('button');details.textContent='جزئیات فروشگاه';details.className='btn btn-primary btn-sm';details.onclick=()=>onShop(s.shop_id);
   const add=document.createElement('button');add.textContent=planIds.has(s.best.offer_id)?'در برنامه':'افزودن به برنامه';add.className='btn btn-ghost btn-sm';add.onclick=()=>{onAddPlan(s.best);m.closePopup()};
   const go=document.createElement('a');go.textContent='مسیریابی';go.className='btn btn-ghost btn-sm';go.target='_blank';go.rel='noreferrer';go.href='https://www.google.com/maps/dir/?api=1&destination='+s.lat+','+s.lon;
   row.append(details,add,go);pop.append(h,a,meta,row);
   marker.bindPopup(pop,{maxWidth:280});
   marker.on('click',()=>{setActive(s.shop_id);cards.current?.querySelector('[data-shop="'+s.shop_id+'"]')?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})});
   markers.current.set(s.shop_id,marker);
  });
  if(profile.lat!=null&&profile.lon!=null){
   L.circleMarker([profile.lat,profile.lon],{radius:9,color:'var(--media-surface)',weight:3,fillColor:'var(--map-marker)',fillOpacity:1}).addTo(layer).bindTooltip('نقطه شروع شما');
   bounds.push([profile.lat,profile.lon]);
   if(profile.radius_km)L.circle([profile.lat,profile.lon],{radius:profile.radius_km*1000,color:'var(--map-marker)',weight:1.5,fillOpacity:.06}).addTo(layer);
  }
  const view=stores.map(s=>s.shop_id).join()+'|'+profile.lat+'|'+profile.radius_km;
  if(bounds.length&&fitted.current!==view){m.fitBounds(bounds,{padding:[50,50],maxZoom:15,animate:false});fitted.current=view}
  return()=>layer.remove();
 },[stores,profile.lat,profile.lon,profile.radius_km,planIds]);
 useEffect(()=>{
  const m=map.current;if(!m||!picking)return;
  const pick=e=>{setPicking(false);onLocation({lat:e.latlng.lat,lon:e.latlng.lng})};
  m.on('click',pick);m.getContainer().classList.add('picking');
  return()=>{m.off('click',pick);m.getContainer().classList.remove('picking')};
 },[picking,onLocation]);
 function focus(s){setActive(s.shop_id);const mk=markers.current.get(s.shop_id);if(mk&&map.current){map.current.flyTo(mk.getLatLng(),Math.max(map.current.getZoom(),15),{duration:.5});setTimeout(()=>mk.openPopup(),520)}}
 return <div className="page map-page">
  <div className="map-toolbar">
   <label className="select-chip"><MapPin size={15}/><select aria-label="محدوده" value={profile.neighborhood||''} onChange={e=>onNeighborhood(e.target.value||null)}><option value="">همه تهران</option>{neighborhoods.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
   <div className="seg" role="group" aria-label="شعاع">{RADII.map(r=><button key={r} aria-pressed={profile.radius_km===r} onClick={()=>onRadius(profile.radius_km===r?null:r)} disabled={profile.lat==null} title={profile.lat==null?'ابتدا نقطه شروع را تعیین کنید':''}>{num(r)} کیلومتر</button>)}</div>
   <button className="chip" onClick={onLocate}><LocateFixed size={15}/>موقعیت من</button>
   <button className={'chip'+(picking?' chosen':'')} onClick={()=>setPicking(!picking)}><Crosshair size={15}/>{picking?'روی نقشه بزنید…':'انتخاب نقطه شروع'}</button>
  </div>
  <div className="map-stage">
   <div className="map-canvas" ref={box}/>
   {!stores.length?<div className="map-empty"><Store size={26}/><b>فروشگاهی برای نمایش نیست</b><p>یک محصول جست‌وجو کنید تا فروشگاه‌ها روی نقشه بیایند.</p></div>:null}
   <div className="map-cards" ref={cards}>{stores.map((s,i)=><article key={s.shop_id} data-shop={s.shop_id} className={'map-card'+(active===s.shop_id?' active':'')}>
    <button className="map-card-head" onClick={()=>focus(s)} aria-pressed={active===s.shop_id} aria-label={'انتخاب فروشگاه روی نقشه: '+s.name}><span className="pin-num">{num(i+1)}</span><b>{s.name}</b></button>
    <p className="map-card-addr">{s.area||s.address}{s.distance!=null?' · '+money(s.distance)+' کیلومتر':''}</p>
    <div className="map-card-meta"><span className={s.opening.state==='open'?'ok':''}><Clock size={12}/>{s.opening.label||'نامشخص'}</span>{s.credit?<span><Wallet size={12}/>اقساطی</span>:null}</div>
    <div className="map-card-price">{num(s.offers.length)} پیشنهاد · از <b>{money(price(s.best))}</b> تومان</div>
    <div className="map-card-actions" onClick={e=>e.stopPropagation()}>
     <button className="btn btn-ghost btn-sm" onClick={()=>onShop(s.shop_id)}>جزئیات<ChevronLeft size={14}/></button>
     <button className={'btn btn-sm '+(planIds.has(s.best.offer_id)?'btn-soft':'btn-primary')} onClick={()=>onAddPlan(s.best)}>{planIds.has(s.best.offer_id)?<><Check size={14}/>در برنامه</>:<><Plus size={14}/>برنامه</>}</button>
     <a className="btn btn-ghost btn-sm" href={'https://www.google.com/maps/dir/?api=1&destination='+s.lat+','+s.lon} target="_blank" rel="noreferrer" aria-label="مسیریابی"><Navigation size={14}/></a>
    </div>
   </article>)}</div>
  </div>
  <p className="map-note">فاصله‌ها به‌صورت مستقیم محاسبه شده‌اند.</p>
 </div>;
}
