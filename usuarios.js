(async()=>{
  const auth=await EduBridge.initShell(true);if(!auth)return;const list=document.getElementById("users-list");
  async function load(){if(!db){list.textContent="Configura Supabase para gestionar usuarios.";return;}
    const [{data:profiles,error:e1},{data:roles,error:e2}]=await Promise.all([db.from("profiles").select("id,email,full_name").order("created_at"),db.from("user_roles").select("user_id,role")]);
    if(e1||e2){list.textContent="No se pudieron cargar los usuarios. Revisa permisos de Supabase.";return;}
    const users=(profiles||[]).map(p=>({...p,role:(roles||[]).find(r=>r.user_id===p.id)?.role||""}));
    list.innerHTML=users.map(u=>`<div class="user-row"><div><strong>${EduBridge.escape(u.full_name||u.email||"Usuario")}</strong><p class="muted small">${EduBridge.escape(u.email)}</p></div><select data-user="${EduBridge.escape(u.id)}" ${u.id===auth.session.user.id?"disabled":""}><option value="" ${!u.role?"selected":""}>⏳ Pendiente de aprobar</option><option value="brigadista" ${u.role==="brigadista"?"selected":""}>Capturador / Brigadista</option><option value="docente" ${u.role==="docente"?"selected":""}>Docente / Profesor</option><option value="admin" ${u.role==="admin"?"selected":""}>Administrador / Directivo</option></select></div>`).join("")||"No hay usuarios.";
    list.querySelectorAll("select[data-user]").forEach(s=>s.onchange=async()=>{if(!s.value)return;const {error}=await db.rpc("set_user_role",{_user_id:s.dataset.user,_role:s.value});if(error)EduBridge.notice("No se pudo cambiar el rol. Verifica los permisos de administrador.","error");else{EduBridge.notice("Rol actualizado.");load();}});
  }load();
})();