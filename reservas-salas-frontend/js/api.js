//PUENTE DE FRONT-BACK
//envio de peticiones HTTP recibe respuestas JSON 

const API_URL = 'http://localhost:8080/api';    //DIRECCION BASE DEL BACKEND

function getToken() {   
    return localStorage.getItem('token');   //LECTURA DEL TOKEN JWT
}

function getHeaders(){  //FUNCION QUE ARAM EL ENCABEZADO DE CADA PETICION
    return {
        'Content-Type': 'application/json',     
        'Authorization': `Bearer ${getToken()}`
    };
}

const api = {

    //AUTHENTICATOR

    //REGISTRO Y LOGIN SON PUBLICOS Y NO NECESITAN TOKEN
    async registro(nombre, correo, contrasena){
        const res = await fetch(`${API_URL}/auth/registro`,{    //FETCH ENVIA PETICION HTTP
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nombre, correo, contrasena})
        });
        return res.json();  //RECIBE FORMATO JSON
    },

    async login (correo, contrasena){
        const res = await fetch(`${API_URL}/auth/login`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({correo, contrasena})            
        });
        return res.json();
    },

    //SALAS

    //METODOS: LISTAR, CREAR, EDITAR, CAMBIAR. LLEVAN TOKEN JWT TODOS
    async getSalasPorFacultad(facultadId){
        const res = await fetch(`${API_URL}/salas/facultad/${facultadId}`,{
            headers: getHeaders()
        });
        return res.json();
    },

    async getSalasPorDisponible(facultadId){
        const res = await fetch(`${API_URL}/salas/facultad/${facultadId}/disponibles`,{
            headers: getHeaders()
        });
        return res.json();
    },

    async crearSala(data){
        const res = await fetch(`${API_URL}/salas`,{
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async editarSala(id, data){
        const res = await fetch(`${API_URL}/salas/${id}`,{
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async cambiarEstadoSala(id, habilitada){
        const res = await fetch(`${API_URL}/salas/${id}/estado`,{
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ habilitada })
        });
        return res.json();
    },

    // RESERVAS

    // METODOS: CREAR, CANCELAR. AJUSTAR RESERVAS, GENERAR REPORTES. TODOS LLEVAN TOKEN JWT
   async crearReserva(data){
        const res = await fetch(`${API_URL}/reservas`,{
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async cancelarReserva(id){
        const res = await fetch(`${API_URL}/reservas/${id}/cancelar`,{
            method: 'PATCH',
            headers: getHeaders()
        });
        return res.json();
    },

    async ajustarReserva(id, data){
        const res = await fetch(`${API_URL}/reservas/${id}/ajustar`,{
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async misReservas(data){
        const res = await fetch(`${API_URL}/reservas/mis-reservas`,{
            headers: getHeaders()
        });
        return res.json();
    },

    async reservasFacultad(facultadId){
        const res = await fetch(`${API_URL}/reservas/facultad/${facultadId}`,{
            headers: getHeaders()
        });
        return res.json();
    },

    async reporte(facultadId, desde, hasta){
        const res = await fetch(`${API_URL}/reservas/reporte?facultadId=${facultadId}&desde=${desde}&hasta=${hasta}`,{
            headers: getHeaders()
        });
        return res.json();
    },

    async reservasPorSalaYFecha(salaId, fecha){
        const res = await fetch(
            `${API_URL}/reservas/sala/${salaId}/fecha/${fecha}`,
            { headers: getHeaders() }
        );
        return res.json();
    },

};