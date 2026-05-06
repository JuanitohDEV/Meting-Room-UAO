//MANEJO DE SESION


function guardarSesion(data){
    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('nombre', data.nombre);
    
}

function cerrarSesion(){
    localStorage.clear();
    window.location.href = '../index.html';
}

function getSesion (){
    return{
        token: localStorage.getItem('token'),
        rol: localStorage.getItem('rol'),
        nombre: localStorage.getItem('nombre')
    };
}

function verificarSesion(){
    const{token,rol} = getSesion();

    if(!token){
        window.location.href = '../index.html';
        return;
    }
    return rol;
}

function verificarRol(rolEsperado){
    const rol = verificarSesion();
    if(rol !== rolEsperado){
        window.location.href = '../index.html';
    }
}