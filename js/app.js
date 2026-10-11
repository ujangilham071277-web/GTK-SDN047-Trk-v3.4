/** Administrasi GTK SDN 047 Tarakan - Frontend v3.0 (GitHub Pages) -> REST API Google Apps Script */
const VID=(function(){var v=new URLSearchParams(location.search).get('v')||'';return /^[\w\/\-]+$/.test(v)?v:''})();
const ERRS=[];
function logErr(m){ERRS.push(m);let el=document.getElementById('errLog');if(!el){document.body.insertAdjacentHTML('beforeend','<details id="errLog" style="position:fixed;left:8px;bottom:8px;z-index:5000;max-width:min(560px,95vw);background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5;border-radius:8px;padding:6px 10px;font:12px monospace"><summary></summary><div></div></details>');el=document.getElementById('errLog')}el.firstChild.textContent='Log kesalahan ('+ERRS.length+')';el.lastChild.innerHTML=ERRS.map(x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;')).join('<br>')}
window.addEventListener('error',e=>{if(e.message)logErr(e.message+' @'+String(e.filename||'').split('/').pop()+':'+(e.lineno||'?'))});
window.addEventListener('unhandledrejection',e=>logErr('promise: '+(e.reason&&e.reason.message||e.reason)));
/** Administrasi GTK SDN 047 Tarakan \u2014 Frontend SPA (tanpa ?page=, tanpa window.location) */
const S={token:null,user:null,menu:[],cur:'',abs:{},absD:null,crud:null,editI:-1,charts:{},scan:null};
const $=id=>document.getElementById(id);
const waitLib=n=>new Promise(r=>{let i=0;const t=setInterval(()=>{if(window[n]||++i>100){clearInterval(t);r(!!window[n])}},100)});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IC={dashboard:'bi-grid-1x2-fill',absensi:'bi-calendar-check',scan:'bi-qr-code-scan',siswa:'bi-people',guru:'bi-person-badge',jurnal:'bi-journal-text',surat:'bi-envelope',buku:'bi-book',pinjam:'bi-arrow-left-right',hafalan:'bi-moon-stars',perkembangan:'bi-graph-up-arrow',users:'bi-shield-lock',kartu:'bi-person-vcard',pengaturan:'bi-gear',arsip:'bi-archive',laporan:'bi-bar-chart-line'};
const ST={Hadir:['#ECFDF5','#065F46','#10B981'],Izin:['#FEF3C7','#92400E','#F59E0B'],Sakit:['#E0E7FF','#3730A3','#6366F1'],Alpa:['#FEE2E2','#991B1B','#EF4444']};

// \u2500\u2500 Pemanggil backend: semua lewat google.script.run, token di memori \u2500\u2500
async function call(fn,...args){
  if(!GAS_URL||GAS_URL.indexOf('PASTE')>=0)throw new Error('GAS_URL belum diisi di js/config.js');
  let res;try{res=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:fn,args:args})})}
  catch(e){throw new Error('Tidak dapat terhubung ke server (periksa internet / GAS_URL).')}
  if(!res.ok)throw new Error('Server HTTP '+res.status);
  const r=await res.json();if(!r.success)throw new Error(r.message||'Kesalahan server');return r.data;
}
const CACHE={},INF={},RD={listRows:1,getDashboard:1,getAbsensi:1,listArsip:1,getSettings:1},WR={mulaiTahunBaru:1,importData:1,saveRow:1,deleteRow:1,importSiswa:1,saveAbsensi:1,scanAbsen:1,buatArsip:1,saveSettings:1,saveProfile:1};
async function net(fn,...a){
  if(TAFN[fn])a=a.concat([S.ta||'']);try{return await call(fn,S.token,...a)}
  catch(e){if(e.message==='SESI_HABIS'){toast('Sesi berakhir','Silakan login kembali.','warning');showLogin()}throw e}
}
function dirty(){return !!document.querySelector('.modal.show,.offcanvas.show')||/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')||['absensi','scan','kartu'].indexOf(S.cur)>=0}
function bg(fn,a,key){
  if(INF[key])return;INF[key]=1;
  net(fn,...a).then(r=>{const j=JSON.stringify(r),ch=CACHE[key]!==j;CACHE[key]=j;if(ch&&S.keys&&S.keys[key]&&!dirty()){S.quiet=true;try{navigateTo(S.cur)}finally{S.quiet=false}}}).catch(()=>{}).finally(()=>{INF[key]=0});
}
async function api(fn,...a){
  const key=RD[fn]?fn+'|'+JSON.stringify(a):null;
  if(key){S.keys=S.keys||{};S.keys[key]=1;if(CACHE[key]!==undefined){bg(fn,a,key);return JSON.parse(CACHE[key])}}
  const r=await net(fn,...a);
  if(key)CACHE[key]=JSON.stringify(r);
  else if(WR[fn]){Object.keys(CACHE).forEach(k=>delete CACHE[k]);setTimeout(prefetchAll,2500)}
  return r;
}
async function prefetchAll(){
  const m={dashboard:['getDashboard'],absensi:['getAbsensi','','',''],arsip:['listArsip'],kartu:['listRows','siswa'],pengaturan:['getSettings']};
  for(const x of S.menu||[]){
    if(!S.token)return;if(x.id==='scan'||x.id==='laporan')continue;
    const c=m[x.id]||['listRows',x.id],a=c.slice(1),key=c[0]+'|'+JSON.stringify(a);
    if(CACHE[key]!==undefined||INF[key])continue;
    INF[key]=1;try{CACHE[key]=JSON.stringify(await net(c[0],...a))}catch(e){}INF[key]=0;
  }
}
function toast(t,m,k){if(!window.bootstrap){console.log(t+': '+m);return}$('toast').className='toast border-0 text-bg-'+(k||'primary');$('toastBody').innerHTML='<b>'+esc(t)+'</b><br>'+esc(m);bootstrap.Toast.getOrCreateInstance($('toast'),{delay:4500}).show()}
const fail=e=>{toast('Gagal',e.message,'danger');logErr('fail: '+e.message);const c=$('app-container');if(c&&c.querySelector('.spinner-border'))c.innerHTML='<div class="card-x p-4"><b class="text-danger">Gagal memuat data.</b><div class="small mt-1">'+esc(e.message)+'</div><button class="btn btn-pri mt-3" onclick="navigateTo(S.cur)">Coba lagi</button></div>'};
const loading=()=>{if(S.quiet)return;$('app-container').innerHTML='<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-secondary">Memuat data\u2026</p></div>'};
function openModal(t,b,f,size){$('mdlTitle').textContent=t;$('mdlBody').innerHTML=b;$('mdlFoot').innerHTML=f||'<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button>';$('mdlDlg').className='modal-dialog modal-dialog-centered modal-dialog-scrollable '+(size||'');window.bootstrap?bootstrap.Modal.getOrCreateInstance($('mdl')).show():alert(t+'\n'+String(b).replace(/<[^>]+>/g,' ').slice(0,200))}
const closeModal=()=>bootstrap.Modal.getOrCreateInstance($('mdl')).hide();

// \u2500\u2500 Tema \u2500\u2500
function setTheme(t){const h=document.documentElement;h.setAttribute('data-theme',t);h.setAttribute('data-bs-theme',t);try{localStorage.setItem('theme',t)}catch(e){}
  if(window.Chart){Chart.defaults.color=t==='dark'?'#9FB0CC':'#475569';Object.values(S.charts).forEach(c=>c.update())}}
const toggleTheme=()=>setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
function startApp(){
  const b=$('boot');if(b)b.remove();const v=$('ver');if(v)v.textContent='Versi 3.4';
  let t='light';try{t=localStorage.getItem('theme')||'light'}catch(e){}
  try{setTheme(t)}catch(e){}
  VID?showPublic():restore();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startApp);else startApp();


// \u2500\u2500 Login / Logout / Navigasi SPA \u2500\u2500
function showLogin(){try{sessionStorage.removeItem('tk')}catch(e){}stopScan();Object.keys(CACHE).forEach(k=>delete CACHE[k]);Object.assign(S,{token:null,user:null,menu:[]});$('appView').classList.add('d-none');$('loginView').classList.remove('d-none');$('lp').value=''}
function enter(r){
  Object.assign(S,{token:r.token,user:r.user,menu:r.menu});try{sessionStorage.setItem('tk',r.token)}catch(e){}
    S.cfg=r.cfg||{};S.ta='';loadTA();
    if(r.user.Role==='Admin'&&!S.cfg.frontendUrl&&location.protocol==='https:'){const fu=location.origin+location.pathname.replace(/[^/]*$/,'');S.cfg.frontendUrl=fu;net('saveSettings',{frontendUrl:fu}).catch(()=>{})} // tautan QR sertifikat diisi otomatis
    $('nav').innerHTML=S.menu.map(m=>`<li><a href="javascript:void(0)" class="nl" data-id="${m.id}" onclick="navigateTo('${m.id}')"><i class="bi ${IC[m.id]||'bi-circle'}"></i><span>${esc(m.label)}</span></a></li>`).join('');
    $('uName').textContent=r.user.Nama;$('uRole').textContent=r.user.Role;
    $('loginView').classList.add('d-none');$('appView').classList.remove('d-none');applyBrand();navigateTo('dashboard');setTimeout(prefetchAll,600);
}
async function restore(){
  let t=null;try{t=sessionStorage.getItem('tk')}catch(e){}
  if(!t){showLogin();return}
  try{const r=await call('me',t);enter(r)}catch(e){try{sessionStorage.removeItem('tk')}catch(_){}showLogin()}
}
async function doLoginUI(ev){
  ev.preventDefault();const b=$('btnLogin');b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Memproses\u2026';
  try{
    const r=await call('doLogin',$('lu').value.trim(),$('lp').value);
    enter(r);
  }catch(e){fail(e)}finally{b.disabled=false;b.innerHTML='<i class="bi bi-box-arrow-in-right"></i> Masuk'}
}
function logout(){const t=S.token;call('doLogout',t).catch(()=>{}).finally(showLogin)}
const toggleSb=()=>{$('sidebar').classList.toggle('show');$('ov').classList.toggle('show')};
const closeSb=()=>{$('sidebar').classList.remove('show');$('ov').classList.remove('show')};
function navigateTo(id){
  stopScan();S.cur=id;S.keys={};
  document.querySelectorAll('.nl').forEach(a=>a.classList.toggle('active',a.dataset.id===id));
  const m=S.menu.find(x=>x.id===id);$('pageTitle').textContent=m?m.label:'';closeSb();loading();
  try{const fn={dashboard:'renderDash',absensi:'renderAbs',scan:'renderScan',kartu:'renderKartu',pengaturan:'renderSet',arsip:'renderArsip',laporan:'renderLap'}[id]||'renderCrud';if(typeof window[fn]!=='function')throw new Error('Fungsi '+fn+' belum termuat (ada kesalahan skrip - lihat Log kesalahan).');window[fn](fn==='renderCrud'?id:undefined)}catch(e){fail(e)}
}

// \u2500\u2500 Dashboard \u2500\u2500
async function renderDash(){
  try{
    const d=await api('getDashboard');await waitLib('Chart');Object.values(S.charts).forEach(c=>c.destroy());S.charts={};
    const k=(l,v,s,c,i)=>`<div class="col-6 col-lg-3"><div class="kpi" style="--c:${c}"><div class="kpi-i"><i class="bi ${i}"></i></div><div class="kpi-l">${l}</div><div class="kpi-v">${v}</div><div class="kpi-s">${s}</div></div></div>`;
    if(d.own){
      const t=d.total||1;
      $('app-container').innerHTML=`<div class="row g-3 mb-3">${Object.keys(ST).map(s=>k(s,d.c[s]||0,Math.round((d.c[s]||0)*100/t)+'% dari '+d.total+' hari',ST[s][2],'bi-calendar-check')).join('')}</div>
      <div class="card-x p-3"><h2 class="h6 mb-3">Riwayat kehadiran terakhir</h2><div class="table-responsive"><table class="table"><thead><tr><th>Tanggal</th><th>Status</th><th>Jam</th><th>Metode</th></tr></thead><tbody>${d.recent.map(r=>`<tr><td>${esc(r.Tanggal)}</td><td><span class="pill" style="background:${(ST[r.Status]||ST.Hadir)[0]};color:${(ST[r.Status]||ST.Hadir)[1]}">${esc(r.Status)}</span></td><td>${esc(r.Jam)}</td><td>${esc(r.Metode)}</td></tr>`).join('')||'<tr><td colspan="4" class="text-center text-secondary">Belum ada data.</td></tr>'}</tbody></table></div></div>`;
      return;
    }
    const p=d.siswa?Math.round(d.hadir*1000/d.siswa)/10:0;
    $('app-container').innerHTML=`<div class="row g-3 mb-3">${k('Total Siswa',d.siswa,'terdaftar','#7C3AED','bi-people')}${k('Hadir Hari Ini',p+'%',d.hadir+' dari '+d.siswa+' siswa','#10B981','bi-check-circle')}${k('Jurnal Hari Ini',d.jurnal,'terisi','#F59E0B','bi-journal-text')}${k('Total GTK',d.guru,'guru & tenaga','#06B6D4','bi-person-badge')}</div>
    <div class="row g-3"><div class="col-lg-8"><div class="card-x p-3"><h2 class="h6">Persentase kehadiran per kelas</h2><canvas id="ch" height="130" aria-label="Grafik kehadiran per kelas" role="img"></canvas></div></div>
    <div class="col-lg-4"><div class="insight"><h2 class="h6"><i class="bi bi-stars"></i> Analisis Otomatis</h2><ul class="ps-3 mb-0">${d.ins.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div></div></div>`;
    Chart.defaults.color=document.documentElement.getAttribute('data-theme')==='dark'?'#9FB0CC':'#475569';
    S.charts.k=new Chart($('ch'),{type:'bar',data:{labels:d.kelas,datasets:[{label:'% Hadir',data:d.pct,backgroundColor:'#7C3AED',borderRadius:8}]},options:{scales:{y:{min:0,max:100}},plugins:{legend:{display:false}}}});
  }catch(e){fail(e)}
}


// \u2500\u2500 Kehadiran manual \u2500\u2500
const SESI_ROLE={Admin:['Kelas','PAI','PJOK'],'Guru Kelas':['Kelas'],'Guru PAI':['PAI'],'Guru PJOK':['PJOK']};
const scanSesi=()=>{const l=SESI_ROLE[S.user.Role]||[];return l.indexOf(S.scanS)>=0?S.scanS:l[0]};
function sesiSelect(){const l=SESI_ROLE[S.user.Role]||[];return l.length>1?'<select class="form-select form-select-sm w-auto" aria-label="Sesi" onchange="S.scanS=this.value">'+l.map(x=>'<option value="'+x+'"'+(x===scanSesi()?' selected':'')+'>'+(x==='Kelas'?'Kelas (harian)':x+' (mandiri)')+'</option>').join('')+'</select>':'<span class="pill bg-body-secondary">'+(scanSesi()==='Kelas'?'Kelas (harian)':scanSesi()+' (mandiri)')+'</span>'}
async function renderAbs(kelas,tgl,sesi){
  try{
    const d=await api('getAbsensi',kelas||'',tgl||'',sesi||'');S.absD=d;S.abs={};d.siswa.forEach(s=>S.abs[s.NISN]=s.Status);
    $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="row g-2 align-items-end">
      <div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="aK">Kelas</label><select class="form-select" id="aK" onchange="renderAbs(this.value,$('aT').value,S.absD.sesi)">${d.kelasList.map(k=>`<option ${k===d.kelas?'selected':''}>${esc(k)}</option>`).join('')}</select></div>
      <div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="aT">Tanggal</label><input type="date" class="form-control" id="aT" value="${d.tgl}" onchange="renderAbs($('aK').value,this.value,S.absD.sesi)"></div>
      <div class="col-12 col-md-6 d-flex gap-2 justify-content-md-end">${d.canEdit?`<button class="btn btn-outline-success" onclick="allHadir()"><i class="bi bi-check2-all"></i> Semua Hadir</button><button class="btn btn-pri" id="bAbs" onclick="saveAbs()"><i class="bi bi-cloud-upload"></i> Simpan</button>`:''}</div></div><div id="rekap" class="mt-3"></div></div><div id="absList"></div>`;
    drawAbs();
  }catch(e){fail(e)}
}
function drawAbs(){
  if(!$('sesiTabs')){const d0=S.absD;$('app-container').insertAdjacentHTML('afterbegin','<div id="sesiTabs" class="mb-3 d-flex gap-2 flex-wrap">'+d0.sesiList.map(x=>`<button class="btn btn-sm ${x===d0.sesi?'btn-pri':'btn-outline-secondary'}" onclick="renderAbs($('aK').value,$('aT').value,'${x}')">${x==='Kelas'?'Absensi Kelas (harian)':'Absensi '+x+' (mandiri)'}</button>`).join('')+'</div>')}
  const d=S.absD,c={Hadir:0,Izin:0,Sakit:0,Alpa:0,Belum:0};d.siswa.forEach(s=>{const v=S.abs[s.NISN];v?c[v]++:c.Belum++});
  $('rekap').innerHTML='<div class="d-flex flex-wrap gap-2 align-items-center">'+Object.keys(ST).map(k=>`<span class="pill" style="background:${ST[k][0]};color:${ST[k][1]}">${k} ${c[k]}</span>`).join('')+`<span class="pill bg-body-secondary">Belum ${c.Belum}</span><strong class="ms-auto">${Math.round(c.Hadir*100/(d.siswa.length||1))}% hadir</strong></div>`;
  $('absList').innerHTML=d.siswa.length?d.siswa.map((s,i)=>`<div class="card-x p-3 mb-2 d-flex flex-wrap align-items-center gap-2"><div class="avatar">${esc(s.Nama.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div class="me-auto"><div class="fw-bold">${i+1}. ${esc(s.Nama)}</div><div class="small text-secondary">NISN ${esc(s.NISN)}${s.Metode?' \u00b7 '+esc(s.Metode)+' '+esc(s.Jam):''}</div></div>
    ${d.canEdit?'<div class="chips">'+Object.keys(ST).map(k=>`<button class="chip ${S.abs[s.NISN]===k?'on':''}" style="--bg:${ST[k][0]};--fg:${ST[k][1]};--on:${ST[k][2]}" onclick="setSt(${i},'${k}')">${k}</button>`).join('')+'</div>':`<span class="pill bg-body-secondary">${esc(S.abs[s.NISN]||'-')}</span>`}</div>`).join(''):'<div class="card-x p-4 text-center text-secondary">Belum ada siswa di kelas ini.</div>';
}
const setSt=(i,k)=>{S.abs[S.absD.siswa[i].NISN]=k;drawAbs()};
const allHadir=()=>{S.absD.siswa.forEach(s=>{if(!S.abs[s.NISN])S.abs[s.NISN]='Hadir'});drawAbs()};
async function saveAbs(){
  const d=S.absD,b=$('bAbs');b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Menyimpan\u2026';
  try{
    const r=await api('saveAbsensi',d.kelas,d.tgl,d.siswa.filter(s=>S.abs[s.NISN]).map(s=>({nisn:s.NISN,status:S.abs[s.NISN]})),d.sesi);
    toast('Tersimpan',r.tersimpan+' perubahan disimpan, '+r.email+' email orang tua terkirim.','success');renderAbs(d.kelas,d.tgl,d.sesi);
  }catch(e){fail(e);b.disabled=false;b.innerHTML='<i class="bi bi-cloud-upload"></i> Simpan'}
}

// \u2500\u2500 Presensi scan QR \u2500\u2500
function renderScan(){
  $('app-container').innerHTML=`<div class="row g-3"><div class="col-lg-6"><div class="card-x p-3"><div class="d-flex justify-content-between align-items-center mb-2"><h2 class="h6 m-0"><i class="bi bi-qr-code-scan"></i> Scan Kartu QR Siswa</h2>${sesiSelect()}<div class="d-flex gap-2"><label class="btn btn-sm btn-outline-secondary mb-0"><i class="bi bi-camera"></i> Foto QR<input type="file" accept="image/*" capture="environment" hidden onchange="scanPhoto(this)"></label><button class="btn btn-sm btn-pri" id="bScan" onclick="startScan()"><i class="bi bi-camera-video"></i> Nyalakan Kamera</button></div></div>
    <div id="reader" class="reader p-3 text-center">Tekan <b>Nyalakan Kamera</b> lalu arahkan ke QR pada kartu siswa. Cadangan: <b>Foto QR</b>, atau scanner barcode USB ke kolom di bawah.</div>
    <div class="input-group mt-3"><input class="form-control" id="manNisn" placeholder="Scanner USB/Bluetooth atau ketik NISN, lalu Enter" aria-label="NISN" autofocus onkeydown="if(event.key==='Enter')manual()"><button class="btn btn-outline-primary" onclick="manual()">Hadir</button></div></div></div>
    <div class="col-lg-6"><div id="scanRes" class="card-x p-3 mb-3 text-secondary">Menunggu pindaian\u2026</div><div class="card-x p-3"><h2 class="h6">Log sesi ini</h2><div id="scanLog" class="small"></div></div></div></div>`;
}
async function startScan(){
  if(S.scan)return;
  try{if(!navigator.mediaDevices||!window.isSecureContext)throw new Error('Kamera memerlukan koneksi HTTPS.');await waitLib('Html5Qrcode');S.scan=new Html5Qrcode('reader');await S.scan.start({facingMode:'environment'},{fps:10,qrbox:{width:240,height:240}},t=>onCode(t),()=>{});$('bScan').textContent='Kamera aktif'}
  catch(e){S.scan=null;const den=/NotAllowed|Permission|denied/i.test(String(e&&(e.name||e.message||e)));toast('Kamera tidak dapat dibuka',den?'Izin kamera ditolak. Klik ikon gembok di address bar, pilih Izinkan kamera, lalu muat ulang halaman. Cadangan: tombol Foto QR atau scanner barcode.':String(e&&e.message||e),'warning')}
}
function stopScan(){if(S.scan){S.scan.stop().catch(()=>{});S.scan=null}}
let lastC='',lastT=0;
async function onCode(t){
  const n=Date.now();if(t===lastC&&n-lastT<4000)return;lastC=t;lastT=n;const el=$('scanRes');
  try{
    const r=await api('scanAbsen',t,scanSesi()),w=new Date().toLocaleTimeString('id-ID',{hour12:false}).replace(/\./g,':');
    try{navigator.vibrate(r.unknown?[120,60,120]:80)}catch(e){}
    if(r.unknown){
      el.className='card-x p-3 mb-3 res-bad';
      el.innerHTML=`<div class="fw-bold text-danger small">VALIDASI GAGAL \u00b7 KODE TIDAK TERDAFTAR</div><div class="fs-5 fw-bold mb-2">QR Code Tidak Dikenali!</div>
      <p class="small">Data QR tidak cocok dengan basis data siswa. Kode mungkin rusak, salah cetak, atau belum diaktivasi.</p>
      <pre class="small p-2 rounded bg-dark text-warning" style="white-space:pre-wrap">${esc(r.payload)}</pre>
      <div class="small mb-3"><b>Penyebab umum:</b><ol class="mb-0 ps-3"><li>Siswa baru/mutasi: kartu belum dicetak \u2014 gunakan menu Kartu QR Massal.</li><li>Kartu rusak atau bukan kartu presensi sekolah.</li><li>Kamera menangkap objek lain (barcode botol, label tas).</li></ol></div>
      <label class="form-label small fw-semibold" for="cari">Cari siswa &amp; presensi cepat</label><div class="input-group"><input class="form-control" id="cari" placeholder="Nama atau NISN" onkeydown="if(event.key==='Enter')cari()"><button class="btn btn-pri" onclick="cari()">Cari</button></div><div id="cariRes" class="mt-2"></div>`;
      return;
    }
    if(r.dup){
      el.className='card-x p-3 mb-3 res-dup';
      el.innerHTML=`<div class="small fw-bold" style="color:#B45309">SISTEM INTEGRITAS SCAN \u00b7 ANTI-DUPLIKASI</div><div class="fs-5 fw-bold">Presensi Sudah Tercatat!</div>
      <p class="small mb-2">Data pencatatan pertama dipertahankan demi integritas kehadiran.</p>
      <div class="fw-bold">${esc(r.nama)} <span class="pill" style="background:#EDE9FE;color:#6D28D9">Kelas ${esc(r.kelas)}</span></div>
      <div class="small text-secondary mb-2">Status hari ini: <b>${esc(r.status)}</b> \u00b7 Petugas awal: ${esc(r.petugas)} (${esc(r.metode)})</div>
      <div class="p-2 rounded mb-1" style="background:#ECFDF5;color:#065F46"><b>Scan #1 (Tersimpan &amp; Sah)</b><br>${esc(r.jam)} WITA</div>
      <div class="p-2 rounded" style="background:#FEF3C7;color:#92400E"><b>Scan #2 (Ditolak Sistem)</b> \u2014 diabaikan<br>${w} WITA \u00b7 multi-tap dicegah</div>`;
      return;
    }
    el.className='card-x p-3 mb-3 res-ok';
    el.innerHTML=`<div class="small fw-bold text-success">PRESENSI BERHASIL DICATAT</div><div class="fs-5 fw-bold">${esc(r.nama)}</div>Kelas ${esc(r.kelas)} \u00b7 ${esc(r.jam)} WITA \u00b7 <span class="pill" style="background:#ECFDF5;color:#065F46">Hadir (${esc(r.catatan)})</span>`;
    $('scanLog').insertAdjacentHTML('afterbegin',`<div class="py-1 border-bottom">${esc(r.jam)} \u2014 ${esc(r.nama)} (${esc(r.catatan)})</div>`);
  }catch(e){el.className='card-x p-3 mb-3 res-bad';el.innerHTML='<b>'+esc(e.message)+'</b>'}
}
async function cari(){
  try{
    S.cr=await api('cariSiswa',$('cari').value);
    $('cariRes').innerHTML=S.cr.length?S.cr.map((s,i)=>`<div class="d-flex align-items-center gap-2 p-2 rounded mb-1 bg-body-secondary"><div class="avatar">${esc(s.Nama[0])}</div><div class="me-auto"><div class="fw-bold">${esc(s.Nama)}</div><div class="small text-secondary">NISN ${esc(s.NISN)} \u00b7 Kelas ${esc(s.Kelas)}</div></div><button class="btn btn-sm btn-success" onclick="hadirQR(${i})"><i class="bi bi-check-circle"></i> Catat Hadir</button></div>`).join(''):'<div class="small text-secondary">Siswa tidak ditemukan.</div>';
  }catch(e){fail(e)}
}
const hadirQR=i=>{lastC='';onCode(S.cr[i].QRKode)};
function manual(){const v=$('manNisn').value.trim();if(v){lastC='';onCode(v.startsWith('QR-')?v:'QR-SDN047-'+v);$('manNisn').value=''}$('manNisn').focus()}
async function scanPhoto(inp){
  const f=inp.files[0];inp.value='';if(!f)return;
  try{await waitLib('Html5Qrcode');const t=await new Html5Qrcode('reader').scanFile(f,false);lastC='';onCode(t)}
  catch(e){toast('QR tidak terbaca','Pastikan QR terlihat jelas, cukup terang, dan memenuhi foto. Coba foto ulang.','warning')}
}


// \u2500\u2500 CRUD generik (siswa, guru, jurnal, surat, buku, pinjam, hafalan, perkembangan, users) \u2500\u2500
async function renderCrud(mod){
  try{
    const r=await api('listRows',mod);S.crud=Object.assign({mod:mod},r);
    $('app-container').innerHTML=`<div class="card-x p-3"><div class="d-flex flex-wrap gap-2 mb-3"><input class="form-control w-auto flex-grow-1" id="q" placeholder="Cari\u2026" aria-label="Cari" oninput="drawTbl()">
      ${r.canWrite?'<button class="btn btn-pri" onclick="openForm(-1)"><i class="bi bi-plus-lg"></i> Tambah</button>':''}
      ${['siswa','guru','jurnal'].indexOf(mod)>=0&&r.canWrite?'<button class="btn btn-outline-primary" onclick="importUI()"><i class="bi bi-file-earmark-arrow-up"></i> Impor CSV</button>':''}
      ${mod==='tahunajaran'&&r.canWrite?'<button class="btn btn-success" onclick="tahunBaruUI()"><i class="bi bi-calendar-plus"></i> Mulai Tahun Ajaran Baru</button>':''}<div class="dropdown"><button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown"><i class="bi bi-download"></i> Unduh</button><ul class="dropdown-menu">
      <li><a class="dropdown-item" href="javascript:void(0)" onclick="exportTbl('xls')">Excel (.xlsx)</a></li><li><a class="dropdown-item" href="javascript:void(0)" onclick="exportTbl('doc')">Word (.docx)</a></li><li><a class="dropdown-item" href="javascript:void(0)" onclick="exportTbl('pdf')">PDF</a></li></ul></div></div>
      <div class="table-responsive" id="tbl"></div></div>`;
    drawTbl();
  }catch(e){fail(e)}
}
function drawTbl(){
  const c=S.crud,q=($('q').value||'').toLowerCase(),fs=c.f.filter(x=>x.t!=='password');
  const v=c.rows.map((r,i)=>[r,i]).filter(x=>!q||fs.some(f=>String(x[0][f.n]).toLowerCase().includes(q)));
  $('tbl').innerHTML=`<table class="table"><thead><tr>${fs.map(f=>`<th>${esc(f.l)}</th>`).join('')}<th></th></tr></thead><tbody>${v.map(x=>`<tr>${fs.map(f=>`<td>${f.t==='file'?(x[0][f.n]?`<button class="btn btn-sm btn-light" onclick="prev(${x[1]},'${f.n}')"><i class="bi bi-eye"></i> Lihat</button>`:''):esc(x[0][f.n])}</td>`).join('')}
    <td class="text-nowrap text-end">${c.mod==='siswa'?`<button class="btn btn-sm btn-light" title="Kartu QR" aria-label="Kartu QR" onclick="showQR(${x[1]})"><i class="bi bi-qr-code"></i></button> `:''}${c.canWrite?`<button class="btn btn-sm btn-light" aria-label="Ubah" onclick="openForm(${x[1]})"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-light text-danger" aria-label="Hapus" onclick="del(${x[1]})"><i class="bi bi-trash"></i></button>`:''}</td></tr>`).join('')||`<tr><td colspan="${fs.length+1}" class="text-center text-secondary py-4">Belum ada data.</td></tr>`}</tbody></table>`;
}
function openForm(i){
  const c=S.crud,r=i>=0?c.rows[i]:{};S.editI=i;
  const inp=f=>{
    const v=esc(r[f.n]||''),id='f_'+f.n,req=c.f.indexOf(f)<2?'required':'',lb=`<label class="form-label small fw-semibold" for="${id}">${esc(f.l)}</label>`;
    if(f.t==='select')return lb+`<select class="form-select" id="${id}" name="${f.n}">${f.o.map(o=>`<option ${r[f.n]===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
    if(f.t==='textarea')return lb+`<textarea class="form-control" id="${id}" name="${f.n}" rows="3">${v}</textarea>`;
    if(f.t==='file')return lb+`<input type="hidden" name="${f.n}" id="${id}" value="${v}"><input type="file" class="form-control" accept="image/*,.pdf" onchange="up(this,'${id}')"><div class="form-text" id="${id}_s">${v?'Berkas sudah terlampir.':'Maks 5 MB (JPG/PNG/PDF).'}</div>`;
    const pw=f.t==='password';
    return lb+`<input class="form-control" id="${id}" name="${f.n}" type="${f.t}" value="${pw?'':v}" ${pw&&i<0?'required':req} autocomplete="off">`;
  };
  openModal((i>=0?'Ubah ':'Tambah ')+c.title,`<form id="frm" onsubmit="saveForm(event)" class="row g-3">${c.f.map(f=>`<div class="col-md-${f.t==='textarea'||f.t==='file'?12:6}">${inp(f)}</div>`).join('')}</form>`,
    '<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-pri" id="bSave" form="frm" type="submit">Simpan</button>','modal-lg');
}
async function saveForm(ev){
  ev.preventDefault();const o=Object.fromEntries(new FormData($('frm'))),c=S.crud,b=$('bSave');
  if(S.editI>=0)o.ID=c.rows[S.editI].ID;b.disabled=true;
  try{await api('saveRow',c.mod,o);closeModal();toast('Berhasil','Data tersimpan.','success');renderCrud(c.mod)}catch(e){fail(e);b.disabled=false}
}
function up(inp,id){
  const f=inp.files[0];if(!f)return;
  if(f.size>5*1048576){toast('Terlalu besar','Maksimal 5 MB.','warning');inp.value='';return}
  const st=$(id+'_s'),rd=new FileReader();st.textContent='Mengunggah\u2026';
  rd.onload=async()=>{try{const r=await api('uploadFile',rd.result.split(',')[1],f.name,f.type||'application/octet-stream',S.cur);$(id).value=r.url;st.textContent='Terunggah \u2713'}catch(e){st.textContent='Gagal mengunggah';fail(e)}};
  rd.readAsDataURL(f);
}
function del(i){openModal('Konfirmasi Hapus','<p class="mb-0">Yakin ingin menghapus data ini? Tindakan tidak dapat dibatalkan.</p>',`<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-danger" onclick="doDel(${i})">Hapus</button>`)}
async function doDel(i){const c=S.crud;try{await api('deleteRow',c.mod,c.rows[i].ID);closeModal();toast('Berhasil','Data dihapus.','success');renderCrud(c.mod)}catch(e){fail(e)}}
function prev(i,fn){
  const u=S.crud.rows[i][fn];if(!/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/preview$/.test(u))return;
  const id=u.match(/\/d\/([\w-]+)/)[1];
  openModal('Pratinjau Berkas',`<iframe src="${u}" class="w-100 border-0" style="height:70vh" title="Pratinjau"></iframe>`,`<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button><a class="btn btn-pri" target="_blank" rel="noopener" href="https://drive.google.com/uc?export=download&id=${id}"><i class="bi bi-download"></i> Unduh</a>`,'modal-xl');
}


// \u2500\u2500 Kartu QR siswa \u2500\u2500
function showQR(i){
  const r=S.crud.rows[i];
  openModal('Kartu QR Presensi',`<div class="text-center"><div id="qrBox" class="d-inline-block p-3 bg-white rounded"></div><div class="fw-bold mt-2">${esc(r.Nama)}</div><div class="text-secondary">Kelas ${esc(r.Kelas)} \u00b7 NISN ${esc(r.NISN)}</div></div>`,
    '<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button><button class="btn btn-pri" onclick="printQR()"><i class="bi bi-printer"></i> Cetak</button>');
  waitLib('QRCode').then(()=>new QRCode($('qrBox'),{text:r.QRKode,width:200,height:200}));
}
function printQR(){$('printArea').innerHTML='<div style="text-align:center;border:1px dashed #000;padding:16px;width:260px">'+'<b>SDN 047 TARAKAN</b>'+$('mdlBody').innerHTML+'</div>';setTimeout(()=>window.print(),150)}

// \u2500\u2500 Impor CSV siswa \u2500\u2500
function importUI(){
  const f=S.crud.f.filter(x=>x.t!=='password'&&x.t!=='file');
  openModal('Impor '+S.crud.title+' (CSV)','<p>Kolom (baris pertama = judul): <code>'+esc(f.map(x=>x.n).join(','))+'</code>.</p><button class="btn btn-sm btn-outline-secondary mb-2" onclick="tplCsv()"><i class="bi bi-download"></i> Unduh template CSV</button><input type="file" class="form-control" accept=".csv,text/csv" onchange="doImport(this)"><div id="impRes" class="mt-3"></div>','<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button>');
}
function tplCsv(){const f=S.crud.f.filter(x=>x.t!=='password'&&x.t!=='file'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+f.map(x=>x.n).join(',')+'\r\n'],{type:'text/csv'}));a.download='template_'+S.crud.mod+'.csv';document.body.appendChild(a);a.click();a.remove()}

// \u2500\u2500 Ekspor: Excel / Word (HTML) & PDF \u2500\u2500
function exportTbl(fmt){
  const c=S.crud,fs=c.f.filter(x=>x.t!=='password');
  const t=`<h3>${esc(c.title)} \u2014 SDN 047 Tarakan</h3><table border="1" cellpadding="4" style="border-collapse:collapse"><tr>${fs.map(f=>`<th>${esc(f.l)}</th>`).join('')}</tr>${c.rows.map(r=>`<tr>${fs.map(f=>`<td>${esc(r[f.n])}</td>`).join('')}</tr>`).join('')}</table>`;
  if(fmt==='xls'&&window.XLSX){const ws=XLSX.utils.aoa_to_sheet([fs.map(f=>f.l)].concat(c.rows.map(r=>fs.map(f=>r[f.n]==null?'':r[f.n]))));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,c.title.replace(/[^\w ]/g,'').slice(0,30)||'Data');XLSX.writeFile(wb,c.mod+'_SDN047.xlsx');return}
  if(fmt==='doc'||fmt==='pdf'){exportServer(fmt==='doc'?'docx':'pdf');return}
  if(fmt==='pdf'){$('printArea').innerHTML=t;setTimeout(()=>window.print(),150);return}
  const b=new Blob(['\ufeff<html><meta charset="utf-8"><body>'+t+'</body></html>'],{type:fmt==='xls'?'application/vnd.ms-excel':'application/msword'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=c.mod+'_SDN047.'+fmt;document.body.appendChild(a);a.click();a.remove();
}

// \u2500\u2500 Merek (logo/foto) \u2500\u2500
const thumb=u=>{const m=String(u||'').match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/);return m?'https://drive.google.com/thumbnail?id='+(m[1]||m[2])+'&sz=w400':''};
function applyBrand(){
  const c=S.cfg||{},l=thumb(c.logoUrl),p=thumb(S.user&&S.user.Foto);
  document.querySelectorAll('.logo-img').forEach(e=>e.innerHTML=l?'<img alt="Logo sekolah" src="'+l+'">':'<i class="bi bi-journal-bookmark-fill"></i>');
  $('sbName').textContent=c.schoolName||'SDN 047 Tarakan';if(c.appName)document.title=c.appName;
  $('uPhoto').innerHTML=p?'<img alt="Foto profil" src="'+p+'">':esc(((S.user&&S.user.Nama)||'?')[0]);
}


// \u2500\u2500 Pengaturan: profil, password, identitas sekolah (Admin) \u2500\u2500
async function renderSet(){
  try{
    const r=await api('getSettings'),c=r.cfg||{};S.cfg=Object.assign(S.cfg||{},c);const p=thumb(S.user.Foto);
    $('app-container').innerHTML=`<div class="row g-3"><div class="col-lg-6"><div class="card-x p-3 mb-3"><h2 class="h6 mb-3"><i class="bi bi-person-circle"></i> Foto Profil Saya</h2>
      <div class="d-flex gap-3 align-items-center"><div class="avatar" style="width:72px;height:72px" id="pfPrev">${p?'<img alt="Foto profil" src="'+p+'">':esc(S.user.Nama[0])}</div>
      <div class="flex-grow-1"><input type="hidden" id="pfUrl" value="${esc(S.user.Foto||'')}"><input type="file" class="form-control" accept="image/*" onchange="up(this,'pfUrl')"><div class="form-text" id="pfUrl_s">JPG/PNG, maks 5 MB.</div></div></div>
      <button class="btn btn-pri mt-3" onclick="saveFoto()">Simpan Foto</button></div>
    <div class="card-x p-3"><h2 class="h6 mb-3"><i class="bi bi-key"></i> Ganti Password</h2><form onsubmit="chgPw(event)" class="row g-2">
      <div class="col-12"><label class="form-label small fw-semibold" for="pw0">Password lama</label><input type="password" class="form-control" id="pw0" autocomplete="current-password" required></div>
      <div class="col-md-6"><label class="form-label small fw-semibold" for="pw1">Password baru (min. 8)</label><input type="password" class="form-control" id="pw1" minlength="8" autocomplete="new-password" required></div>
      <div class="col-md-6"><label class="form-label small fw-semibold" for="pw2">Ulangi password baru</label><input type="password" class="form-control" id="pw2" autocomplete="new-password" required></div>
      <div class="col-12"><button class="btn btn-pri" type="submit">Ubah Password</button></div></form></div></div>
    ${r.isAdmin?`<div class="col-lg-6"><div class="card-x p-3"><h2 class="h6 mb-3"><i class="bi bi-building"></i> Identitas Sekolah</h2><form id="frmSet" onsubmit="saveSet(event)" class="row g-3">
      <div class="col-12"><label class="form-label small fw-semibold">Logo Sekolah</label><div class="d-flex gap-3 align-items-center"><div class="logo-img brand-ic" style="width:64px;height:64px"></div><div class="flex-grow-1"><input type="hidden" name="logoUrl" id="logoUrl" value="${esc(c.logoUrl||'')}"><input type="file" class="form-control" accept="image/*" onchange="up(this,'logoUrl')"><div class="form-text" id="logoUrl_s">${c.logoUrl?'Logo terpasang. Pilih berkas untuk mengganti.':'PNG/JPG persegi, maks 5 MB.'}</div></div></div></div>
      <div class="col-12"><label class="form-label small fw-semibold" for="sAn">Nama aplikasi</label><input class="form-control" id="sAn" name="appName" value="${esc(c.appName||'')}"></div>
      <div class="col-12"><label class="form-label small fw-semibold" for="sSn">Nama sekolah (di kartu & menu)</label><input class="form-control" id="sSn" name="schoolName" value="${esc(c.schoolName||'')}" placeholder="SDN 047 Tarakan"></div>
      <div class="col-12"><label class="form-label small fw-semibold" for="sAl">Alamat</label><input class="form-control" id="sAl" name="alamat" value="${esc(c.alamat||'')}"></div>
      <div class="col-12"><label class="form-label small fw-semibold" for="sFu">URL situs (GitHub Pages, dipakai pada QR sertifikat)</label><input class="form-control" id="sFu" name="frontendUrl" value="${esc(c.frontendUrl||'')}" placeholder="https://username.github.io/sdn047-tarakan/"></div>
      <div class="col-12"><label class="form-label small fw-semibold" for="sKs">Nama Kepala Sekolah (di kartu)</label><input class="form-control" id="sKs" name="kepsekNama" value="${esc(c.kepsekNama||'')}"></div>
      <div class="col-12"><button class="btn btn-pri" type="submit" id="bSet">Simpan Identitas</button></div></form></div></div>`:''}</div>`;
    applyBrand();
  }catch(e){fail(e)}
}
async function saveFoto(){try{const u=$('pfUrl').value;await api('saveProfile',u);S.user.Foto=u;applyBrand();$('pfPrev').innerHTML='<img alt="Foto profil" src="'+thumb(u)+'">';toast('Berhasil','Foto profil disimpan.','success')}catch(e){fail(e)}}
async function saveSet(ev){
  ev.preventDefault();const o=Object.fromEntries(new FormData($('frmSet'))),b=$('bSet');b.disabled=true;
  try{S.cfg=Object.assign(S.cfg||{},await api('saveSettings',o));applyBrand();toast('Berhasil','Identitas sekolah disimpan.','success')}catch(e){fail(e)}finally{b.disabled=false}
}
async function chgPw(ev){
  ev.preventDefault();if($('pw1').value!==$('pw2').value){toast('Tidak cocok','Konfirmasi password baru berbeda.','warning');return}
  try{await api('changePassword',$('pw0').value,$('pw1').value);ev.target.reset();toast('Berhasil','Password diubah.','success')}catch(e){fail(e)}
}


// \u2500\u2500 Kartu QR massal A4 (8 kartu/lembar, 85,6 x 54 mm) \u2500\u2500
async function renderKartu(){
  try{
    const r=await api('listRows','siswa');S.kt=r.rows;await waitLib('QRCode');const kl=[...new Set(r.rows.map(s=>s.Kelas))].sort();
    $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="row g-2 align-items-end">
      <div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="kK">Kelas</label><select class="form-select" id="kK" onchange="drawKartu()">${kl.map(k=>`<option>${esc(k)}</option>`).join('')}</select></div>
      <div class="col-6 col-md-3 pb-2"><div class="form-check"><input class="form-check-input" type="checkbox" id="kF" checked onchange="drawKartu()"><label class="form-check-label" for="kF">Sertakan foto siswa</label></div></div>
      <div class="col-12 col-md-6 d-flex gap-2 align-items-center justify-content-md-end"><span class="small text-secondary" id="kInfo"></span><button class="btn btn-pri" onclick="printKartu()"><i class="bi bi-printer"></i> Cetak A4</button></div></div>
      <div class="form-text mt-2">Cetak di kertas A4 dengan skala <b>100% / Actual Size</b> (bukan Fit to Page) agar ukuran kartu presisi 85,6 \u00d7 54 mm. Gunakan kertas 210\u2013260 gsm.</div></div>
      <div id="kPrev" style="zoom:.6;overflow:auto"></div>`;
    kl.length?drawKartu():$('kPrev').innerHTML='<div class="card-x p-4 text-center text-secondary">Belum ada data siswa.</div>';
  }catch(e){fail(e)}
}
function drawKartu(){
  const c=S.cfg||{},k=$('kK').value,fo=$('kF').checked,lg=thumb(c.logoUrl),sw=S.kt.filter(s=>s.Kelas===k),pages=[];
  for(let i=0;i<sw.length;i+=8)pages.push(sw.slice(i,i+8));
  const card=s=>{const t=thumb(s.FotoUrl);return `<div class="idc"><div class="idc-h">${lg?'<img alt="" src="'+lg+'">':''}<div><b>${esc((c.schoolName||'SD NEGERI 047 TARAKAN').toUpperCase())}</b><small>${esc(c.alamat||'Kota Tarakan')}</small></div><em>KARTU PRESENSI</em></div>
    <div class="idc-b">${fo?'<div class="idc-f">'+(t?'<img alt="" src="'+t+'">':'')+'</div>':''}<div class="idc-t"><b>${esc(s.Nama)}</b><span>NISN: ${esc(s.NISN)}</span><span>Kelas ${esc(s.Kelas)}</span></div><div class="idc-q" data-q="${esc(s.QRKode)}"></div></div>
    <div class="idc-ft">Kepala Sekolah${c.kepsekNama?': '+esc(c.kepsekNama):''}</div></div>`};
  $('kPrev').innerHTML=pages.map(p=>`<div class="sheet">${p.map(card).join('')}</div>`).join('');
  document.querySelectorAll('#kPrev [data-q]').forEach(e=>new QRCode(e,{text:e.dataset.q,width:90,height:90}));
  $('kInfo').textContent=sw.length+' siswa \u00b7 '+pages.length+' lembar';
}
function printKartu(){
  if(!$('kPrev').querySelector('.sheet')){toast('Kosong','Tidak ada kartu untuk dicetak.','warning');return}
  $('printArea').innerHTML=$('kPrev').innerHTML;setTimeout(()=>window.print(),400);
}

// \u2500\u2500 Arsip ZIP, drawer audit, sertifikat integritas \u2500\u2500
const fsz=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
function cp(t){const ok=()=>toast('Disalin','Tersalin ke clipboard.','success'),fb=()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){}a.remove()};try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}}
async function sha256File(f){const h=await crypto.subtle.digest('SHA-256',await f.arrayBuffer());return[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function cmp(v,exp,id){v=String(v).trim().toLowerCase();const el=$(id);if(!v){el.innerHTML='';return}const ok=v===exp;el.innerHTML=`<div class="p-2 rounded small fw-bold mt-2" style="background:${ok?'#D1FAE5':'#FEE2E2'};color:${ok?'#065F46':'#991B1B'}"><i class="bi bi-${ok?'check-circle':'x-circle'}"></i> ${ok?'VALID \u2014 identik dengan arsip resmi':'TIDAK COCOK \u2014 berkas berbeda atau telah dimodifikasi'}</div>`}
async function cmpFile(inp,exp,id){const f=inp.files[0];if(!f)return;$(id).textContent='Menghitung hash\u2026';try{cmp(await sha256File(f),exp,id)}catch(e){$(id).textContent='Perangkat ini tidak mendukung penghitungan hash.'}}
const hashTest=(exp,p)=>`<input class="form-control form-control-sm font-monospace mb-2" placeholder="Tempel hash SHA-256 Anda\u2026" aria-label="Hash" oninput="cmp(this.value,'${exp}','${p}_r')"><input type="file" class="form-control form-control-sm" aria-label="Pilih berkas ZIP" onchange="cmpFile(this,'${exp}','${p}_r')"><div class="form-text">Atau pilih berkas ZIP: hash dihitung di perangkat Anda.</div><div id="${p}_r"></div>`;
const timeline=a=>'<ul class="list-unstyled mb-0">'+a.map(x=>`<li class="d-flex gap-2 mb-2"><i class="bi bi-circle-fill text-primary" style="font-size:.5rem;margin-top:.45rem"></i><div><div class="small fw-bold">${esc(x.e)}</div><div class="small text-secondary">${esc(x.t)} WITA${x.d?' \u00b7 '+esc(x.d):''}</div></div></li>`).join('')+'</ul>';
async function renderArsip(){
  try{
    const r=await api('listArsip');S.ars=r.rows;S.kls=r.kelas;
    $('app-container').innerHTML=`<div class="row g-3 mb-3"><div class="col-6 col-lg-3"><div class="kpi" style="--c:#7C3AED"><div class="kpi-i"><i class="bi bi-archive"></i></div><div class="kpi-l">Total Arsip</div><div class="kpi-v">${r.rows.length}</div><div class="kpi-s">paket ZIP tersimpan</div></div></div><div class="col-6 col-lg-3"><div class="kpi" style="--c:#10B981"><div class="kpi-i"><i class="bi bi-shield-check"></i></div><div class="kpi-l">Integritas</div><div class="kpi-v">SHA-256</div><div class="kpi-s">dihitung saat dibuat</div></div></div></div>
    <div class="card-x p-3"><div class="d-flex flex-wrap gap-2 mb-3"><h2 class="h6 m-0 me-auto align-self-center">Riwayat Arsip & Sertifikat</h2>${r.canMake?'<button class="btn btn-pri" onclick="openBuat()"><i class="bi bi-plus-circle"></i> Ekspor Dokumen Baru</button>':''}</div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Berkas</th><th>Kelas</th><th>Ukuran</th><th>Dibuat</th><th></th></tr></thead><tbody>${r.rows.map((a,i)=>`<tr><td><div class="fw-bold font-monospace small">${esc(a.Nama)}</div><div class="small text-secondary">${esc(a.Nomor)} \u00b7 ${a.Jumlah} berkas</div></td><td>${esc(a.Kelas)}</td><td>${fsz(a.Ukuran)}</td><td>${esc(a.Waktu)}<div class="small text-secondary">${esc(a.Pembuat)}</div></td>
    <td class="text-nowrap text-end"><button class="btn btn-sm btn-light" onclick="showDrawer(${i})"><i class="bi bi-shield-check"></i> Detail</button> <button class="btn btn-sm btn-light" aria-label="Unduh" onclick="dl(${i})"><i class="bi bi-download"></i></button> <button class="btn btn-sm btn-light" aria-label="Sertifikat" onclick="showCert(${i})"><i class="bi bi-patch-check"></i></button></td></tr>`).join('')||'<tr><td colspan="5" class="text-center text-secondary py-4">Belum ada arsip. Klik \u201cEkspor Dokumen Baru\u201d.</td></tr>'}</tbody></table></div></div>`;
  }catch(e){fail(e)}
}
function openBuat(){
  openModal('Ekspor & Arsip Massal (ZIP)',`<p class="small text-secondary">Berisi rekap siswa &amp; presensi per kelas (CSV untuk Excel dan DOC untuk Word), dilengkapi checksum SHA-256 dan sertifikat integritas.</p><div class="fw-bold small mb-2">Pilih kelas</div><div class="row g-2">${S.kls.map(k=>`<div class="col-4"><label class="form-check"><input class="form-check-input kk" type="checkbox" value="${esc(k)}" checked> <span class="form-check-label">${esc(k)}</span></label></div>`).join('')||'<div class="text-secondary">Belum ada kelas.</div>'}</div>`,
    '<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-pri" id="bBuat" onclick="doBuat()">Buat Arsip ZIP</button>');
}
async function doBuat(){
  const k=[...document.querySelectorAll('.kk:checked')].map(x=>x.value),b=$('bBuat');if(!k.length){toast('Pilih kelas','Minimal satu kelas.','warning');return}
  b.disabled=true;b.innerHTML='<span class="spinner-border spinner-border-sm"></span> Mengompresi\u2026';
  try{const r=await api('buatArsip',k);closeModal();toast('Arsip dibuat',r.nomor,'success');renderArsip()}catch(e){fail(e);b.disabled=false;b.textContent='Buat Arsip ZIP'}
}
async function showDrawer(i){
  try{
    const d=await api('getArsip',S.ars[i].ID);S.di=i;S.dUrl=d.verifyUrl;$('drwSub').textContent=d.Nama;$('drwStat').innerHTML='';
    $('drwBody').innerHTML=`<div class="d-flex gap-2 mb-3 flex-wrap"><span class="pill" style="background:#D1FAE5;color:#065F46">${fsz(d.Ukuran)}</span><span class="pill bg-body-secondary">${d.Jumlah} berkas</span><span class="pill bg-body-secondary">${esc(d.Waktu)} WITA</span></div>
    <h3 class="h6">1. Checksum SHA-256</h3><div class="hashbox"><div class="small opacity-75 mb-1">FIPS 180-4 CANONICAL DIGEST <a href="javascript:void(0)" class="float-end" onclick="cp('${d.SHA256}')">Salin Hash</a></div><code>${d.SHA256}</code></div>
    <div class="card-x p-3 my-3"><div class="fw-bold small mb-2"><i class="bi bi-magic"></i> Uji verifikasi hash lokal / eksternal</div>${hashTest(d.SHA256,'dr')}</div>
    <details class="card-x p-3 mb-3"><summary class="small fw-bold">Hash kompatibilitas legacy (MD5 &amp; SHA-1)</summary><div class="small mt-2" style="word-break:break-all">SHA-1: <code>${d.SHA1}</code><br>MD5: <code>${d.MD5}</code></div></details>
    <h3 class="h6">2. Metadata</h3><table class="table table-sm small"><tr><th>Nomor</th><td>${esc(d.Nomor)}</td></tr><tr><th>Kelas</th><td>${esc(d.Kelas)}</td></tr><tr><th>Pembuat</th><td>${esc(d.Pembuat)}</td></tr><tr><th>Lokasi</th><td>Google Drive / Arsip</td></tr></table>
    <h3 class="h6">3. Jejak Audit</h3>${timeline(d.audit)}`;
    bootstrap.Offcanvas.getOrCreateInstance($('drw')).show();
  }catch(e){fail(e)}
}
async function reverify(){
  $('drwStat').innerHTML='<span class="spinner-border spinner-border-sm"></span> Menghitung ulang hash dari Drive\u2026';
  try{const r=await api('verifikasiArsip',S.ars[S.di].ID);$('drwStat').innerHTML=`<div class="p-2 rounded small fw-bold" style="background:${r.ok?'#D1FAE5':'#FEE2E2'};color:${r.ok?'#065F46':'#991B1B'}">${r.ok?'Valid & Terautentikasi \u2014 hash server identik 100%':'TIDAK COCOK \u2014 berkas di Drive berubah atau hilang'}</div>`;showDrawerKeep()}catch(e){$('drwStat').innerHTML='';fail(e)}
}
async function showDrawerKeep(){try{const d=await api('getArsip',S.ars[S.di].ID);const ul=$('drwBody').querySelector('ul');if(ul)ul.outerHTML=timeline(d.audit)}catch(e){}}
async function dl(i){
  try{
    const r=await api('unduhArsip',S.ars[i].ID),b=atob(r.b64),u=new Uint8Array(b.length);for(let j=0;j<b.length;j++)u[j]=b.charCodeAt(j);
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([u],{type:'application/zip'}));a.download=r.nama;document.body.appendChild(a);a.click();a.remove();toast('Diunduh',r.nama,'success');
  }catch(e){fail(e)}
}
async function showCert(i){
  try{
    const d=await api('getArsip',S.ars[i].ID);
    openModal('Sertifikat Integritas',`<div id="certBox" class="cert"><div class="kop"><div>PEMERINTAH KOTA TARAKAN</div><b>DINAS PENDIDIKAN</b><div><b>${esc((d.sekolah).toUpperCase())}</b></div><small>${esc(d.alamat)}</small></div>
    <h2>SERTIFIKAT INTEGRITAS &amp; KEABSAHAN DOKUMEN ELEKTRONIK</h2><div style="text-align:center;font-family:monospace;font-size:9pt;margin-bottom:8px">Nomor Registrasi: ${esc(d.Nomor)}</div>
    <p>Berdasarkan UU No. 11 Tahun 2008 jo. UU No. 19 Tahun 2016 tentang Informasi dan Transaksi Elektronik, dengan ini ${esc(d.sekolah)} menerbitkan sertifikat pembuktian integritas berkas digital (hash digest) atas arsip berikut.</p>
    <div class="bx"><b>Metadata Berkas Sumber</b><br>Nama berkas: <b>${esc(d.Nama)}</b><br>Ukuran: ${d.Ukuran.toLocaleString('id-ID')} byte (${fsz(d.Ukuran)}) \u00b7 ${d.Jumlah} dokumen \u00b7 Kelas: ${esc(d.Kelas)}<br>Pembuat: ${esc(d.Pembuat)} \u00b7 Dibuat: ${esc(d.Waktu)} WITA</div>
    <div class="bx" style="border-left:5px solid #7C3AED"><b>Kalkulasi Kriptografis FIPS 180-4</b><br>SHA-256:<br><code>${d.SHA256}</code><br><small>SHA-1: <code>${d.SHA1}</code><br>MD5: <code>${d.MD5}</code></small></div>
    <div class="bx">Cap waktu: waktu server Google Apps Script, ${esc(d.Waktu)} WITA. Seluruh jejak audit tersimpan pada basis data sekolah dan dapat diverifikasi daring.</div>
    <div class="ttd"><div style="display:flex;gap:8px;align-items:center"><div id="certQr"></div><small>VERIFIKASI ONLINE<br>Pindai QR untuk memeriksa<br>keaslian pada basis data sekolah.</small></div>
    <div style="text-align:center">Tarakan, ${esc(d.Waktu.slice(0,10))}<br>Kepala ${esc(d.sekolah)}<br><br><br><br><u><b>${esc(d.kepsek||'..............................')}</b></u></div></div></div>`,
      '<button class="btn btn-light" data-bs-dismiss="modal">Tutup</button><button class="btn btn-pri" onclick="printCert()"><i class="bi bi-printer"></i> Cetak / Simpan PDF</button>','modal-xl');
    waitLib('QRCode').then(()=>new QRCode($('certQr'),{text:d.verifyUrl,width:96,height:96}));
  }catch(e){fail(e)}
}
const printCert=()=>{$('printArea').innerHTML=$('certBox').outerHTML;setTimeout(()=>window.print(),300)};


// \u2500\u2500 Halaman verifikasi publik (tanpa login) \u2014 dibuka dari QR sertifikat \u2500\u2500
async function showPublic(){
  $('loginView').classList.add('d-none');const v=$('pubView');v.classList.remove('d-none');
  v.innerHTML='<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Memverifikasi dokumen\u2026</p></div>';
  try{
    const r=await call('verifyPublic',VID);
    if(!r.found){v.innerHTML='<div class="pubw"><div class="ban bad"><div class="small fw-bold">TIDAK DITEMUKAN</div><div class="fs-4 fw-bold">Dokumen Tidak Terdaftar</div><p class="mb-0 small">Nomor registrasi tidak ada pada basis data sekolah. Hubungi operator sekolah.</p></div></div>';return}
    v.innerHTML=`<div class="pubw"><div class="ban ${r.ok?'ok':'bad'} mb-3"><div class="small fw-bold">${r.ok?'VALID &amp; RESMI':'PERINGATAN'}</div><div class="fs-4 fw-bold">${r.ok?'Dokumen Asli &amp; Terverifikasi':'Hash Tidak Cocok'}</div><p class="small mb-2">${r.ok?'Diverifikasi secara realtime pada basis data '+esc(r.sekolah)+'.':'Berkas arsip di server berbeda dari hash yang tercatat. Jangan gunakan dokumen ini.'}</p><b>${esc(r.sekolah)}</b></div>
    <div class="card-x p-3 mb-3"><h2 class="h6">Ringkasan Sertifikat</h2><div class="small text-secondary">Nomor Registrasi</div><div class="fw-bold mb-2" style="word-break:break-all">${esc(r.Nomor)}</div><div class="font-monospace small">${esc(r.Nama)}</div><div class="small text-secondary mb-2">${fsz(r.Ukuran)} \u00b7 ${r.Jumlah} berkas \u00b7 Kelas ${esc(r.Kelas)}</div><div class="small">Dibuat: ${esc(r.Waktu)} WITA</div></div>
    <div class="hashbox mb-3"><div class="small opacity-75 mb-1">MASTER SHA-256 HASH <a href="javascript:void(0)" class="float-end" onclick="cp('${r.SHA256}')">Salin</a></div><code>${r.SHA256}</code></div>
    <div class="card-x p-3 mb-3"><div class="fw-bold small mb-2">Uji berkas ZIP milik Anda</div>${hashTest(r.SHA256,'pb')}</div>
    <details class="card-x p-3 mb-3"><summary class="fw-bold small">Riwayat Audit Trail (${r.audit.length} aktivitas)</summary><div class="mt-2">${timeline(r.audit)}</div></details>
    <div class="p-3 rounded small mb-3" style="background:#D1FAE5;color:#065F46"><b>Jaminan keutuhan data.</b> Perubahan sekecil 1 bita pada berkas ZIP akan menghasilkan hash berbeda dan sertifikat ini tidak akan cocok.${r.kepsek?'<br>Kepala Sekolah: '+esc(r.kepsek):''}</div></div>`;
  }catch(e){v.innerHTML='<div class="pubw"><div class="ban bad"><b>Gagal memverifikasi.</b><p class="mb-0 small">'+esc(e.message)+'</p></div></div>'}
}

async function exportServer(fmt){
  toast('Menyiapkan '+fmt.toUpperCase(),'Google sedang membuat dokumen, mohon tunggu beberapa detik...','primary');
  try{
    const r=await api('exportDokumen',S.crud.mod,fmt),b=atob(r.b64),u=new Uint8Array(b.length);for(let j=0;j<b.length;j++)u[j]=b.charCodeAt(j);
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([u],{type:fmt==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}));a.download=r.nama;document.body.appendChild(a);a.click();a.remove();toast('Berhasil',r.nama+' diunduh.','success');
  }catch(e){fail(e)}
}

// ── Laporan kehadiran (filter kelas/tanggal/siswa, rekap %, unduh Excel/Word/PDF) ──
async function renderLap(){
  try{
    const f=S.lapF||{},d=await api('laporanKehadiran',Object.assign({},f,{ta:S.ta||''}));S.lap=d;S.lapF=Object.assign({},f,{sesi:d.sesi});
    const op=(l,v)=>l.map(x=>'<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>').join(''),lb=(id,t)=>'<label class="form-label small fw-semibold" for="'+id+'">'+t+'</label>';
    const pc=p=>'<span class="pill" style="background:'+(p>=90?'#ECFDF5':p>=75?'#FEF3C7':'#FEE2E2')+';color:'+(p>=90?'#065F46':p>=75?'#92400E':'#991B1B')+'">'+p+'%</span>';
    $('app-container').innerHTML=`<div class="card-x p-3 mb-3"><div class="row g-2 align-items-end">
      <div class="col-6 col-md-2">${lb('lS','Sesi')}<select id="lS" class="form-select">${op(d.sesiList,d.sesi)}</select></div>
      <div class="col-6 col-md-2">${lb('lK','Kelas')}<select id="lK" class="form-select"><option value="">Semua</option>${op(d.kelasList,f.kelas)}</select></div>
      <div class="col-6 col-md-2">${lb('lD','Dari')}<input type="date" id="lD" class="form-control" value="${esc(f.dari||'')}"></div>
      <div class="col-6 col-md-2">${lb('lE','Sampai')}<input type="date" id="lE" class="form-control" value="${esc(f.sampai||'')}"></div>
      <div class="col-8 col-md-3">${lb('lQ','Siswa')}<input id="lQ" class="form-control" placeholder="Nama / NISN" value="${esc(f.q||'')}" onkeydown="if(event.key==='Enter')lapCari()"></div>
      <div class="col-4 col-md-1"><button class="btn btn-pri w-100" onclick="lapCari()">Cari</button></div></div></div>
    <div class="row g-3 mb-3"><div class="col-6 col-lg-3"><div class="kpi" style="--c:#10B981"><div class="kpi-l">Persentase Hadir</div><div class="kpi-v">${d.persen}%</div><div class="kpi-s">${d.total} catatan</div></div></div><div class="col-6 col-lg-3"><div class="kpi" style="--c:#7C3AED"><div class="kpi-l">Siswa Tercatat</div><div class="kpi-v">${d.rekap.length}</div><div class="kpi-s">sesi ${esc(d.sesi)}</div></div></div></div>
    <div class="card-x p-3 mb-3"><div class="d-flex flex-wrap gap-2 mb-2"><h2 class="h6 m-0 me-auto align-self-center">Rekap per Siswa</h2>
      <button class="btn btn-sm btn-outline-secondary" onclick="lapExport('xls')"><i class="bi bi-file-earmark-excel"></i> Excel</button><button class="btn btn-sm btn-outline-secondary" onclick="lapExport('docx')"><i class="bi bi-file-earmark-word"></i> Word</button><button class="btn btn-sm btn-outline-secondary" onclick="lapExport('pdf')"><i class="bi bi-file-earmark-pdf"></i> PDF</button></div>
      <div class="table-responsive"><table class="table"><thead><tr><th>NISN</th><th>Nama</th><th>Kelas</th><th>Hadir</th><th>Izin</th><th>Sakit</th><th>Alpa</th><th>% Hadir</th></tr></thead><tbody>${d.rekap.map(r=>`<tr><td>${esc(r.NISN)}</td><td>${esc(r.Nama)}</td><td>${esc(r.Kelas)}</td><td>${r.Hadir}</td><td>${r.Izin}</td><td>${r.Sakit}</td><td>${r.Alpa}</td><td>${pc(r.Persen)}</td></tr>`).join('')||'<tr><td colspan="8" class="text-center text-secondary py-4">Tidak ada data pada filter ini.</td></tr>'}</tbody></table></div></div>
    <div class="card-x p-3"><h2 class="h6">Catatan Harian (300 terakhir)</h2><div class="table-responsive"><table class="table"><thead><tr><th>Tanggal</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Jam</th><th>Metode</th></tr></thead><tbody>${d.rows.map(r=>`<tr><td>${esc(r.Tanggal)}</td><td>${esc(r.Nama)}</td><td>${esc(r.Kelas)}</td><td>${esc(r.Status)}</td><td>${esc(r.Jam)}</td><td>${esc(r.Metode)}</td></tr>`).join('')}</tbody></table></div></div>`;
  }catch(e){fail(e)}
}
function lapCari(){S.lapF={sesi:$('lS').value,kelas:$('lK').value,dari:$('lD').value,sampai:$('lE').value,q:$('lQ').value.trim()};renderLap()}
async function lapExport(fmt){
  const d=S.lap,f=S.lapF||{},H=['NISN','Nama','Kelas','Hadir','Izin','Sakit','Alpa','% Hadir'],R=d.rekap.map(r=>[r.NISN,r.Nama,r.Kelas,r.Hadir,r.Izin,r.Sakit,r.Alpa,r.Persen]);
  const judul='Laporan Kehadiran '+d.sesi+(f.kelas?' Kelas '+f.kelas:'')+(f.dari||f.sampai?' ('+(f.dari||'...')+' s/d '+(f.sampai||'...')+')':'');
  if(fmt==='xls'){if(!window.XLSX){toast('Belum siap','Pustaka Excel belum termuat, coba lagi sebentar.','warning');return}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([H].concat(R)),'Rekap');XLSX.writeFile(wb,'Laporan_Kehadiran_'+d.sesi+'.xlsx');return}
  toast('Menyiapkan '+fmt.toUpperCase(),'Google sedang membuat dokumen...','primary');
  try{const r=await api('exportData',judul,H,R,fmt),b=atob(r.b64),u=new Uint8Array(b.length);for(let j=0;j<b.length;j++)u[j]=b.charCodeAt(j);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([u]));a.download=r.nama;document.body.appendChild(a);a.click();a.remove();toast('Berhasil',r.nama+' diunduh.','success')}catch(e){fail(e)}
}

// ── Impor CSV bebas (data kembar/kosong tetap diimpor) ──
function parseCsv(t){
  t=t.replace(/^\ufeff/,'');const l1=t.split(/\r?\n/)[0],sp=l1.split(';').length>l1.split(',').length?';':',',R=[];let r=[],c='',q=false;
  for(let i=0;i<t.length;i++){const ch=t[i];
    if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}
    else if(ch==='"')q=true;else if(ch===sp){r.push(c);c=''}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;r.push(c);c='';R.push(r);r=[]}else c+=ch}
  if(c!==''||r.length){r.push(c);R.push(r)}return R;
}
function doImport(inp){
  const f=inp.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=async()=>{
    const R=parseCsv(rd.result);if(R.length<2){toast('Kosong','File tidak berisi data.','warning');return}
    const map={};S.crud.f.forEach(x=>{map[x.n.toLowerCase()]=x.n;map[x.l.toLowerCase()]=x.n});
    const h=R[0].map(x=>map[String(x).trim().toLowerCase()]||String(x).trim());
    const rows=R.slice(1).filter(r=>r.some(x=>String(x).trim()!=='')).map(r=>{const o={};h.forEach((k,j)=>o[k]=r[j]==null?'':r[j]);return o});
    if(!rows.length){toast('Kosong','Tidak ada baris data.','warning');return}
    let n=0;const el=$('impRes');
    try{
      for(let i=0;i<rows.length;i+=400){el.innerHTML='<span class="spinner-border spinner-border-sm"></span> Mengimpor '+Math.min(i+400,rows.length)+' / '+rows.length+'...';n+=(await api('importData',S.crud.mod,rows.slice(i,i+400))).berhasil}
      el.innerHTML='<div class="alert alert-success mb-0">'+n+' data berhasil diimpor.</div>';renderCrud(S.crud.mod);
    }catch(e){el.innerHTML=n?'<div class="alert alert-warning mb-0">'+n+' data sudah masuk sebelum terjadi kesalahan.</div>':'';fail(e)}
  };
  rd.readAsText(f);
}

// ── Tahun Ajaran: pilihan di header, filter data, dan mulai tahun ajaran baru ──
const TAFN={listRows:1,getDashboard:1,exportDokumen:1};
async function loadTA(){try{const r=await net('getTA');S.taList=r.list;S.taAktif=r.aktif;if(!S.ta)S.ta=r.aktif;drawTA()}catch(e){}}
function drawTA(){const el=$('taSel');if(!el||!S.taList)return;el.innerHTML=S.taList.map(x=>'<option value="'+esc(x)+'"'+(x===S.ta?' selected':'')+'>TA '+esc(x)+(x===S.taAktif?' (aktif)':'')+'</option>').join('');el.classList.remove('d-none')}
function gantiTA(v){S.ta=v;Object.keys(CACHE).forEach(k=>delete CACHE[k]);navigateTo(S.cur)}
function tahunBaruUI(){
  const y=+(S.taAktif||'').split('/')[0]||new Date().getFullYear(),lb=(i,t)=>'<label class="form-label small fw-semibold" for="'+i+'">'+t+'</label>';
  openModal('Mulai Tahun Ajaran Baru','<div class="row g-3"><div class="col-12">'+lb('tbN','Tahun ajaran')+'<input id="tbN" class="form-control" value="'+(y+1)+'/'+(y+2)+'"></div><div class="col-6">'+lb('tbM','Mulai')+'<input type="date" id="tbM" class="form-control" value="'+(y+1)+'-07-01"></div><div class="col-6">'+lb('tbS','Selesai')+'<input type="date" id="tbS" class="form-control" value="'+(y+2)+'-06-30"></div><div class="col-12"><label class="form-check"><input class="form-check-input" type="checkbox" id="tbK"> <span class="form-check-label">Naikkan kelas semua siswa (4-A menjadi 5-A, kelas 6 menjadi Lulus). Jalankan sekali per tahun ajaran, lalu perbarui kelas para Guru Kelas.</span></label></div></div><p class="small text-secondary mt-3 mb-0">Data tahun ajaran lama tetap tersimpan dan bisa dilihat lewat pilihan Tahun Ajaran di bagian atas.</p>','<button class="btn btn-light" data-bs-dismiss="modal">Batal</button><button class="btn btn-success" id="tbGo" onclick="doTahunBaru()">Mulai Tahun Ajaran Baru</button>');
}
async function doTahunBaru(){
  const b=$('tbGo');b.disabled=true;
  try{const r=await api('mulaiTahunBaru',{nama:$('tbN').value.trim(),mulai:$('tbM').value,selesai:$('tbS').value,naikKelas:$('tbK').checked});closeModal();
    toast('Berhasil','Tahun ajaran '+r.aktif+' aktif'+(r.naik||r.lulus?'. Naik kelas: '+r.naik+', lulus: '+r.lulus+'.':'.'),'success');S.ta=r.aktif;await loadTA();navigateTo(S.cur)}
  catch(e){fail(e);b.disabled=false}
}
