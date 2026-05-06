//LOGICA LOGIN Y REGISTER

document.addEventListener('DOMContentLoaded', () =>{

    //REDIRECCION SESION ACTIVA

    const{token, rol} = getSesion();
    if (token) {
        redirigirPorRol(rol);
        return;
    }


    //TABS login/register

    const tabLogin = document.getElementById('tab-login')
    const tabRegistro = document.getElementById('tab-registro')
    const formLogin = document.getElementById('form-login')
    const formRegistro = document.getElementById('form-registro')
    
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegistro.classList.remove('active');
        formLogin.classList.add('active');
        formRegistro.classList.remove('active');
    });
    
    tabRegistro.addEventListener('click', () => {
        tabLogin.classList.remove('active');
        tabRegistro.classList.add('active');
        formLogin.classList.remove('active');
        formRegistro.classList.add('active');
    });
    
    //LOGIN

    formLogin.addEventListener('submit', async (e) =>{

        e.preventDefault();
        const correo = document.getElementById('login-correo').value.trim();
        const contrasena = document.getElementById('login-pass').value;
        const btn = document.getElementById('btn-login');
        const error = document.getElementById('login-error');
          
        btn.disabled = true;
        btn.textContent = 'Ingresando...';
        error.style.display = 'none';

        try{
            const data = await api.login(correo, contrasena);
            if (data.error){
                error.textContent = data.error;
                error.style.display = 'block';
            } else{
                guardarSesion(data);
                redirigirPorRol(data.rol);
            }
        }   catch{
            error.textContent = 'Error de conexion con el servidor';
            error.style.display = 'block'
        }  finally {
            btn.disabled = false;
            btn.textContent = 'Iniciar sesion';
        }

    });


    //REGISTER

    formRegistro.addEventListener('submit', async(e) =>{
        
        e.preventDefault();
        const nombre = document.getElementById('reg-nombre').value.trim();
        const correo = document.getElementById('reg-correo').value.trim();
        const contrasena = document.getElementById('reg-pass').value;
        const confirm = document.getElementById('reg-pass2').value;
        const btn = document.getElementById('btn-registro');
        const error = document.getElementById('reg-error');
        const ok = document.getElementById('reg-ok');
        
        error.style.display= 'none';
        ok.style.display = 'none';

        if(contrasena !== confirm){
            error.textContent = 'Las contraseñas no coinciden.';
            error.style.display = 'block';
            return;
        }

        if(!correo.endsWith('@uao.edu.co')) {
            error.textContent = 'Solo se permiten correos @uao.edu.co'
            error.style.display = 'block';
            return;
        }
        
        btn.disabled= true;
        btn.textContent = 'Registrando...'

        try{
            const data = await api.registro(nombre, correo, contrasena);
            if(data.error){
                error.textContent = data.error;
                error.style.display = 'block';
            } else{
                guardarSesion(data);
                redirigirPorRol(data.rol);
            }
        } catch{
            error.textContent = 'Error de conexion con el servidor';
            error.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Crear cuenta'
        }

    });



});

function redirigirPorRol (rol) {
    if (rol === 'SECRETARIA'){
        window.location.href = 'pages/dashboard-secretaria.html';
    } else {
        window.location.href = 'pages/dashboard-docente.html';
    }
}