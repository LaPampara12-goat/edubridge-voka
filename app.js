/* Funciones compartidas de EduBridge en JavaScript puro. */
(() => {
  const config = window.EDUBRIDGE_CONFIG || {};
  let client = null;
  if (window.supabase && config.SUPABASE_URL && config.SUPABASE_PUBLISHABLE_KEY &&
      !config.SUPABASE_URL.includes("TU-PROYECTO") && !config.SUPABASE_PUBLISHABLE_KEY.includes("TU_CLAVE")) {
    client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY);
  }
  window.db = client;
  window.EduBridge = {
    statuses: [
      {value:"a_salvo",label:"A salvo",className:"safe"},
      {value:"requiere_asistencia",label:"Requiere asistencia",className:"assist"},
      {value:"herido",label:"Herido",className:"injured"},
      {value:"desaparecido",label:"Desaparecido",className:"missing"}
    ],
    label(value){return this.statuses.find(s=>s.value===value)?.label || value || "Sin estado"},
    statusClass(value){return this.statuses.find(s=>s.value===value)?.className || "safe"},
    escape(value){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));},
    notice(message,type="success"){const el=document.getElementById("notice");if(!el){alert(message);return;}el.textContent=message;el.className="notice "+type;el.classList.remove("hidden");},
    async requireSession(adminOnly=false){
      if(!db){this.notice("Configura config.js con los datos de Supabase para conectar la aplicación.","error");return null;}
      const {data:{session}}=await db.auth.getSession();
      if(!session){location.href="login.html";return null;}
      const {data:roles,error}=await db.from("user_roles").select("role").eq("user_id",session.user.id);
      const role=error?null:(roles||[]).some(x=>x.role==="admin")?"admin":(roles||[])[0]?.role||null;
      if(!role){document.body.innerHTML='<main class="login-page"><section class="login-card center"><h1>Cuenta pendiente de aprobación</h1><p class="muted">Un administrador debe asignarte un rol antes de acceder a los reportes.</p><button class="btn outline full" id="signout">Cerrar sesión</button></section></main>';document.getElementById("signout").onclick=()=>db.auth.signOut().then(()=>location.href="login.html");return null;}
      if(adminOnly && role!=="admin"){location.href="reportar.html";return null;}
      return {session,role};
    },
    async initShell(adminOnly=false){
      const auth=await this.requireSession(adminOnly);if(!auth)return null;
      const nav=[["reportar.html","＋","Reportar",true],["buscar.html","⌕","Buscar",true],["dashboard.html","▦","Panel",auth.role==="admin"],["usuarios.html","♙","Usuarios",auth.role==="admin"]];
      const current=location.pathname.split("/").pop()||"index.html";
      const links=nav.filter(n=>n[3]).map(n=>`<a class="${current===n[0]?"active":""}" href="${n[0]}"><span>${n[1]}</span>${n[2]}</a>`).join("");
      document.getElementById("app-header").innerHTML=`<header class="topbar"><a class="brand" href="reportar.html"><img src="assets/edubridge-logo.jpg" alt=""><span>EduBridge</span></a><nav class="nav">${links}</nav><div class="header-actions"><span class="small muted" id="connection"></span><button class="icon-btn" id="change-password" title="Cambiar contraseña" aria-label="Cambiar contraseña">⚿</button><button class="icon-btn" id="sign-out" title="Cerrar sesión" aria-label="Cerrar sesión">↪</button></div></header><nav class="mobile-nav">${links}</nav>`;
      document.getElementById("sign-out").onclick=async()=>{await db.auth.signOut();location.href="login.html";};
      document.getElementById("change-password").onclick=async()=>{const p=prompt("Nueva contraseña (mínimo 8 caracteres)");if(!p)return;if(p.length<8){this.notice("La contraseña debe tener al menos 8 caracteres.","error");return;}const {error}=await db.auth.updateUser({password:p});this.notice(error?"No se pudo cambiar la contraseña":"Contraseña actualizada",error?"error":"success");};
      const update=()=>{document.getElementById("connection").textContent=navigator.onLine?"":"Sin conexión";};
      addEventListener("online",update);addEventListener("offline",update);update();
      return auth;
    },
    async lookupStudent(documentId){if(!db||!navigator.onLine)return null;const {data}=await db.from("latest_status").select("student_name,grade").eq("student_document",documentId).maybeSingle();return data||null;},
    async zoneFromGPS(lat,lng){const fallback=`GPS ${lat.toFixed(4)}, ${lng.toFixed(4)}`;try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&accept-language=es&lat=${lat}&lon=${lng}`);const j=await r.json(),a=j.address||{};return [a.amenity||a.school||a.road,a.neighbourhood||a.suburb||a.quarter,a.city||a.town||a.village].filter(Boolean).join(", ")||fallback;}catch{return fallback;}}
  };
})();