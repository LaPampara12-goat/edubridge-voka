(async()=>{
  const auth=await EduBridge.initShell();if(!auth)return;
  let status="a_salvo",coords=null,lookupTimer;
  const $=id=>document.getElementById(id);
  document.querySelectorAll(".status-choice").forEach(b=>b.addEventListener("click",()=>{status=b.dataset.status;document.querySelectorAll(".status-choice").forEach(x=>x.classList.toggle("selected",x===b));}));
  $("doc").addEventListener("input",()=>{clearTimeout(lookupTimer);const d=$("doc").value.trim();$("known").classList.add("hidden");if(d.length<3)return;lookupTimer=setTimeout(async()=>{const r=await EduBridge.lookupStudent(d);if(r){$("student-name").value=r.student_name||"";$("grade").value=r.grade||"";$("known").classList.remove("hidden");}},450);});
  $("gps-btn").onclick=()=>{if(!navigator.geolocation){$("gps-help").textContent="Este navegador no permite usar GPS.";return;}$("gps-btn").disabled=true;$("gps-btn").textContent="Buscando señal GPS…";navigator.geolocation.getCurrentPosition(async p=>{coords={latitude:p.coords.latitude,longitude:p.coords.longitude};$("zone").value=await EduBridge.zoneFromGPS(coords.latitude,coords.longitude);$("gps-btn").textContent=`GPS detectado · ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;$("gps-btn").disabled=false;},()=>{$("gps-help").textContent="Permite el acceso a la ubicación o escribe la zona manualmente.";$("gps-btn").textContent="⌖ Intentar GPS de nuevo";$("gps-btn").disabled=false;},{enableHighAccuracy:true,timeout:15000});};
  $("report-form").addEventListener("submit",async e=>{e.preventDefault();if(!db){EduBridge.notice("Configura Supabase en config.js antes de guardar reportes.","error");return;}
    const button=e.submitter;button.disabled=true;button.textContent="Guardando…";
    const row={client_id:crypto.randomUUID(),student_document:$("doc").value.trim(),student_name:$("student-name").value.trim(),grade:$("grade").value.trim(),status,zone:$("zone").value.trim()||null,latitude:coords?.latitude??null,longitude:coords?.longitude??null,notes:$("notes").value.trim()||null,reported_at:new Date().toISOString(),reported_by:auth.session.user.id};
    try{const {error}=await db.from("reports").insert(row);if(error)throw error;EduBridge.notice("Reporte guardado correctamente.");$("report-form").reset();coords=null;status="a_salvo";document.querySelectorAll(".status-choice").forEach(b=>b.classList.toggle("selected",b.dataset.status===status));}
    catch(err){EduBridge.notice("No se pudo guardar el reporte: "+(err.message||"verifica tu conexión y permisos de Supabase."),"error");}
    finally{button.disabled=false;button.textContent="Guardar reporte";}
  });
  $("gps-btn").click();
})();