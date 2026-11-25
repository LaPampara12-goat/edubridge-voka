(async()=>{
  const auth=await EduBridge.initShell(true);if(!auth)return;let allRows=[];
  const $=id=>document.getElementById(id);
  $("refresh").onclick=load;$("export-csv").onclick=exportCsv;
  ["grade-filter","from-date","to-date"].forEach(id=>$(id).addEventListener("change",render));
  async function load(){if(!db){EduBridge.notice("Configura Supabase en config.js para consultar el censo.","error");return;}
    $("report-rows").innerHTML='<tr><td colspan="7">Cargando…</td></tr>';
    const {data,error}=await db.from("latest_status").select("id,student_document,student_name,grade,status,zone,latitude,longitude,reported_at").order("reported_at",{ascending:false}).limit(5000);
    if(error){EduBridge.notice("No se pudo cargar el panel. Revisa la conexión y los permisos.","error");return;}allRows=data||[];
    const grades=[...new Set(allRows.map(r=>r.grade).filter(Boolean))].sort();$("grade-filter").innerHTML='<option value="">Todos los grados</option>'+grades.map(g=>`<option>${EduBridge.escape(g)}</option>`).join("");render();
  }
  function filtered(){return allRows.filter(r=>(!$("grade-filter").value||r.grade===$("grade-filter").value)&&(!$("from-date").value||r.reported_at?.slice(0,10)>=$("from-date").value)&&(!$("to-date").value||r.reported_at?.slice(0,10)<=$("to-date").value));}
  function render(){const rows=filtered(),counts={a_salvo:0,requiere_asistencia:0,herido:0,desaparecido:0};rows.forEach(r=>{if(counts[r.status]!==undefined)counts[r.status]++;});
    $("total-count").textContent=rows.length;$("safe-count").textContent=counts.a_salvo;$("assist-count").textContent=counts.requiere_asistencia;$("injured-count").textContent=counts.herido;$("missing-count").textContent=counts.desaparecido;
    const zones={};rows.forEach(r=>{const z=r.zone||"Sin zona / GPS";zones[z]??={total:0,affected:0};zones[z].total++;if(r.status!=="a_salvo")zones[z].affected++;});
    $("zones-list").innerHTML=Object.entries(zones).sort((a,b)=>b[1].affected-a[1].affected).map(([z,v])=>`<div class="zone-row"><span>${EduBridge.escape(z)}</span><span><b>${v.affected}</b> afectados / ${v.total} reportes</span></div>`).join("")||'<p class="muted">No hay datos.</p>';
    $("report-rows").innerHTML=rows.slice(0,150).map(r=>`<tr><td>${EduBridge.escape(r.student_document)}</td><td>${EduBridge.escape(r.student_name)}</td><td>${EduBridge.escape(r.grade)}</td><td><span class="status-badge ${EduBridge.statusClass(r.status)}">${EduBridge.escape(EduBridge.label(r.status))}</span></td><td>${EduBridge.escape(r.zone||"—")}</td><td>${r.reported_at?new Date(r.reported_at).toLocaleString("es-CO"):"—"}</td><td><button data-delete="${EduBridge.escape(r.id)}" title="Borrar reporte">🗑</button></td></tr>`).join("")||'<tr><td colspan="7">No hay reportes.</td></tr>';
    document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>remove(b.dataset.delete));
  }
  async function remove(id){const row=allRows.find(r=>r.id===id);if(!row||!confirm(`¿Borrar el último reporte de ${row.student_name}?`))return;const {error}=await db.from("reports").delete().eq("id",id);if(error)EduBridge.notice("No se pudo borrar el reporte.","error");else{EduBridge.notice("Reporte borrado.");await load();}}
  function exportCsv(){const rows=filtered(),head=["Documento","Nombre","Grado","Estado","Zona","Latitud","Longitud","Fecha"];const esc=v=>`"${String(v??"").replace(/"/g,'""')}"`;const csv=[head,...rows.map(r=>[r.student_document,r.student_name,r.grade,EduBridge.label(r.status),r.zone,r.latitude,r.longitude,r.reported_at])].map(row=>row.map(esc).join(",")).join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download=`censo-edubridge-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);}
  load();if(db)db.channel("reports-live-static").on("postgres_changes",{event:"INSERT",schema:"public",table:"reports"},load).subscribe();
})();