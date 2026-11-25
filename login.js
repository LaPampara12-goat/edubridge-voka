(() => {
  const $=id=>document.getElementById(id);let mode="in";
  const refresh=()=>{$("name-wrap").classList.toggle("hidden",mode!=="up");$("name").required=mode==="up";$("submit-auth").textContent=mode==="in"?"Ingresar":"Crear cuenta";$("toggle-auth").textContent=mode==="in"?"¿No tienes cuenta? Regístrate":"¿Ya tienes cuenta? Ingresa";};
  $("toggle-auth").onclick=()=>{mode=mode==="in"?"up":"in";refresh();};
  $("auth-form").addEventListener("submit",async e=>{e.preventDefault();if(!db){EduBridge.notice("Primero configura config.js con la URL y clave publicable de Supabase.","error");return;}
    const email=$("email").value.trim(),password=$("password").value; $("submit-auth").disabled=true;
    try{let result;if(mode==="in")result=await db.auth.signInWithPassword({email,password});else result=await db.auth.signUp({email,password,options:{data:{full_name:$("name").value.trim()},emailRedirectTo:location.origin+location.pathname.replace(/[^/]*$/,"reportar.html")}});
      if(result.error)throw result.error;
      if(mode==="up"){EduBridge.notice("Cuenta creada. Revisa tu correo para confirmarla; luego un administrador debe aprobar el acceso.","success");}
      else location.href="reportar.html";
    }catch(err){EduBridge.notice(mode==="in"?"No se pudo ingresar. Verifica correo y contraseña.":err.message||"No se pudo crear la cuenta.","error");}
    finally{$("submit-auth").disabled=false;}
  });
  $("google-login").onclick=async()=>{if(!db){EduBridge.notice("Configura primero config.js con Supabase.","error");return;}const {error}=await db.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname.replace(/[^/]*$/,"reportar.html")}});if(error)EduBridge.notice("No se pudo ingresar con Google.","error");};
  if(db)db.auth.getSession().then(({data})=>{if(data.session)location.href="reportar.html";});
  refresh();
})();