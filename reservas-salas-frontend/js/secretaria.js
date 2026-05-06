const FACULTAD_ID = 1;

//INIT
document.addEventListener('DOMContentLoaded', async () => {
  
    verificarRol('SECRETARIA');

    const {nombre} = getSesion();
    const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    document.getElementById('topbar-nombre').textContent = nombre;
    document.getElementById('avatar-iniciales').textContent = iniciales;
    document.getElementById('bienvenida').textContent = `Bienvenida, ${nombre.split(' ')[0]}`;

    //Eventos navegacion

    document.getElementById('nav-inicio').addEventListener('click', () => mostrarPagina('inicio'));
    document.getElementById('nav-salas').addEventListener('click', () => mostrarPagina('salas'));
    document.getElementById('nav-reservas').addEventListener('click', () => mostrarPagina('reservas'));
    document.getElementById('nav-reportes').addEventListener('click', () => mostrarPagina('reportes'));

    //EVENTOS BOTONES

    document.getElementById('btn-salir').addEventListener('click', cerrarSesion);
    document.getElementById('btn-ver-todas').addEventListener('click', () => mostrarPagina('reservas'));
    document.getElementById('btn-crear-sala').addEventListener('click', crearSala);
    document.getElementById('btn-reporte').addEventListener('click', generarReporte);
    document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModal);
    document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModal);
    document.getElementById('btn-ajustar').addEventListener('click', guardarAjuste);
    document.getElementById('btn-cerrar-modal-sala').addEventListener('click', cerrarModalSala);
    document.getElementById('btn-cancelar-modal-sala').addEventListener('click', cerrarModalSala);
    document.getElementById('btn-guardar-sala').addEventListener('click', guardarEdicionSala);

    await Promise.all([cargarInicio(), cargarRecursos()]);
});

//NAVEGACION

function mostrarPagina(nombre) {

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => { n.classList.remove('active'); n.classList.remove('sec'); });
    document.getElementById('page-' + nombre).classList.add('active');
    const nav = document.getElementById('nav-' + nombre);
    nav.classList.add('active');
    nav.classList.add('sec');

    if (nombre === 'salas') cargarSalas();
    if (nombre === 'reservas') cargarReservas();

}


//CARGAR INICIO

async function cargarInicio() {
    const [salas, reservas] = await Promise.all([
        api.getSalasPorFacultad(FACULTAD_ID),
        api.reservasFacultad(FACULTAD_ID)
    ]);

    const salasActivas = salas.filter(s => s.habilitada).length;
    const confimadas = reservas.filter(r => r.estado === 'CONFIRMADA').length;
    const canceladas = reservas.filter(r => r.estado === 'CANCELADA').length;

    document.getElementById('stat-salas').textContent = salasActivas;
    document.getElementById('stat-reservas').textContent = reservas.length;
    document.getElementById('stat-confirmadas').textContent = confimadas;
    document.getElementById('stat-canceladas').textContent = canceladas;

    const recientes = reservas.slice(0, 5);
    const tbody = document.getElementById('tabla-recientes');
    tbody.innerHTML = recientes.length
            ? recientes.map(r => `
                <tr>
                    <td>${r.usuario.nombre}</td>
                    <td>${r.sala.nombre}</td>
                    <td>${r.fecha}</td>
                    <td>${r.horaInicio} – ${r.horaFin}</td>
                    <td>
                        <span class="pill ${r.estado === 'CONFIRMADA'
                            ? 'pill-green' : 'pill-red'}">
                            ${r.estado === 'CONFIRMADA' ? 'Confirmada' : 'Cancelada'}
                        </span>
                    </td>
                </tr>`).join('')
            : `<tr><td colspan="5" style="color:var(--text-muted);
                text-align:center;padding:1rem;">
                Sin reservas registradas</td></tr>`;

}


//CARGAR RECURSOS (checkboxs)

async function cargarRecursos() {

    try{
        const res = await fetch(`http://localhost:8080/api/recursos`,{
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${localStorage.getItem('token')}`
            }
        });
        const recursos = await res.json();
        const container = document.getElementById('checkboxes-recursos');
        container.innerHTML = recursos.map(r => `
            <label style="display:flex;align-items:center;gap:6px;
                          font-size:13px;cursor:pointer;">
                <input type="checkbox" value="${r.id}"
                       style="width:auto;height:auto;"/>
                ${r.nombre}
            </label>`).join('');
    } catch{
        document.getElementById('checkboxes-recursos').innerHTML =
            '<span style="font-size:12px;color:var(--text-muted);">No se pudieron cargar los recursos.</span>';
    }
    
}

//CARGAR SALAS

async function cargarSalas() {

    const salas = await api.getSalasPorFacultad(FACULTAD_ID);
    const tbody = document.getElementById('tabla-salas');
    tbody.innerHTML = salas.length
        ? salas.map(s => `
            <tr>
                <td>${s.nombre}</td>
                <td>${s.capacidad} personas</td>
                <td>${s.ubicacion}</td>
                <td>
                    <span class="pill ${s.habilitada ? 'pill-green' : 'pill-red'}">
                        ${s.habilitada ? 'Habilitada' : 'Deshabilitada'}
                    </span>
                </td>
                <td>
                    <button class="btn-secondary"
                            onclick="abrirModalSala(
                                ${s.id},
                                '${s.nombre}',
                                ${s.capacidad},
                                '${s.ubicacion}',
                                [${s.recursos ? s.recursos.map(r => r.id).join(',') : ''}]
                            )"
                            style="margin-right:6px;">
                        Editar
                    </button>
                    <button class="btn-secondary"
                            data-id="${s.id}"
                            data-habilitada="${s.habilitada}"
                            id="btn-estado-${s.id}">
                        ${s.habilitada ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                </td>
            </tr>`).join('')
        : `<tr><td colspan="5" style="color:var(--text-muted);
            text-align:center;padding:1rem;">
            Sin salas registradas</td></tr>`;

    document.querySelectorAll('[data-id][data-habilitada]').forEach(btn => {
        btn.addEventListener('click', () => {
            const habilitada = btn.dataset.habilitada === 'true';
            cambiarEstadoSala(btn.dataset.id, !habilitada);
        });
    });
}

//CREAR SALA

async function crearSala() {

    const nombre = document.getElementById('sala-nombre').value.trim();
    const capacidad = document.getElementById('sala-capacidad').value;
    const ubicacion = document.getElementById('sala-ubicacion').value.trim();
    const error = document.getElementById('sala-error');
    const ok = document.getElementById('sala-ok');
    const btn = document.getElementById('btn-crear-sala');

    error.style.display = 'none';
    ok.style.display = 'none';

    if (!nombre || !capacidad || !ubicacion) {
        error.textContent = 'Completa odos los campos obligatorios.';
        error.style.display = 'block';
        return;
    }

    const recursoIds = Array.from(
        document.querySelectorAll('#checkboxes-recursos input:checked')
    ).map(cb => parseInt(cb.value));

    btn.disabled = true;
    btn.textContent = 'Creando...';

    try {
        const data = await api.crearSala({
            nombre,
            capacidad: parseInt(capacidad),
            ubicacion,
            facultadId: FACULTAD_ID,
            recursoIds
        });

        if(data.error){
            error.textContent = data.error;
            error.style.display = 'block';
        } else{
            ok.textContent = `Sala "${data.nombre}" creada exitosamente.`;
            ok.style.display = 'block';
            document.getElementById('sala-nombre').value = '';
            document.getElementById('sala-capacidad').value = '';
            document.getElementById('sala-ubicacion').value = '';
            document.querySelectorAll('#checkboxes-recursos input').forEach(cb => cb.checked = false);
            await cargarSalas();
        }
    } catch {
        error.textContent = 'Error de conexion con el servidor.';
        error.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Crear sala';
    }

}

//CAMBIAR ESTADO SALA

async function cambiarEstadoSala(id, habilitada) {
    
    const accion = habilitada ? 'habilitada' : 'deshabilitar';
    if(!confirm(`Seguro que deseas ${accion} esta sala?`)) return;
    const data = await api.cambiarEstadoSala(id,habilitada);
    if(data.error){
        alert(data.error);
    } else {
        await cargarSalas();
        await cargarInicio();
    }
    
}

//CARGAR TODAS LAS RESERVAS
async function cargarReservas() {
   
    const reservas = await api.reservasFacultad(FACULTAD_ID);
    const tbody = document.getElementById('tabla-reservas');
    tbody.innerHTML = reservas.length
        ? reservas.map(r => `
            <tr>
                <td>${r.usuario.nombre}</td>
                <td>${r.sala.nombre}</td>
                <td>${r.fecha}</td>
                <td>${r.horaInicio} – ${r.horaFin}</td>
                <td>${r.proposito || '—'}</td>
                <td>
                    <span class="pill ${r.estado === 'CONFIRMADA'
                        ? 'pill-green' : 'pill-red'}">
                        ${r.estado === 'CONFIRMADA' ? 'Confirmada' : 'Cancelada'}
                    </span>
                </td>
                <td>
                ${r.estado === 'CONFIRMADA'
                    ? `<button class="btn-secondary"
                            onclick="abrirModalAjuste(
                                ${r.id},
                                '${r.fecha}',
                                '${r.horaInicio}',
                                '${r.horaFin}',
                                '${r.proposito || ''}'
                            )">
                        Ajustar
                    </button>
                    <button class="btn-danger"
                            data-id="${r.id}"
                            id="btn-cancelar-${r.id}"
                            style="margin-left:6px;">
                        Cancelar
                    </button>`
                    : '<span style="color:var(--text-muted);font-size:12px;">—</span>'}
                </td>
            </tr>`).join('')
        : `<tr><td colspan="7" style="color:var(--text-muted);
            text-align:center;padding:1rem;">
            Sin reservas registradas</td></tr>`;
    
    document.querySelectorAll('.btn-danger[data-id]').forEach(btn => {
        btn.addEventListener('click', () => cancelarReserva(btn.dataset.id));
    });
}

//CANCELAR RESERVA

async function cancelarReserva(id) {

    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    const data = await api.cancelarReserva(id);
    if (data.error) {
        alert(data.error);
    } else {
        await cargarReservas();
        await cargarInicio();
    }

}

//GENERAR REPORTE

async function generarReporte() {

    const desde = document.getElementById('rep-desde').value;
    const hasta = document.getElementById('rep-hasta').value;
    const error = document.getElementById('rep-error');
    const btn = document.getElementById('btn-reporte');

    error.style.display = 'none';

    if(!desde || !hasta){
        error.textContent = 'Selecciona el rango de fechas.';
        error.style.display = 'block';
        return;
    }

    if (desde > hasta) {
        error.textContent = 'La fecha de inicio no puede ser mayor a la fecha de fin.';
        error.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Generando...';

    try{
        const reservas = await api.reporte(FACULTAD_ID, desde, hasta);
        const card = document.getElementById('card-reporte');
        const tbody = document.getElementById('tabla-reporte');
        card.style.display = 'block';
        tbody.innerHTML = reservas.length
            ? reservas.map(r => `
                <tr>
                    <td>${r.usuario.nombre}</td>
                    <td>${r.sala.nombre}</td>
                    <td>${r.fecha}</td>
                    <td>${r.horaInicio}</td>
                    <td>${r.horaFin}</td>
                    <td>${r.proposito || '—'}</td>
                </tr>`).join('')
            : `<tr><td colspan="6" style="color:var(--text-muted);
                text-align:center;padding:1rem;">
                Sin reservas en ese rango de fechas</td></tr>`;        
    } catch {
        error.textContent = 'Error al generar el reporte.';
        error.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generar reporte'; 
    }

}

// AJUSTES DE MODAL

function cargarHorasAjuste(){
 
    const horas = [];
    for(let h= 7; h<=21; h++){
        horas.push(`${String(h).padStart(2,'0')}:00`);
        if(h<21)horas.push(`${String(h).padStart(2,'0')}:30`);
    }
    horas.push('21:30');
    const selInicio = document.getElementById('ajuste-inicio');
    const selfin = document.getElementById('ajuste-fin');
    if(selInicio.options.length === 0){
        horas.forEach(h => {
            selInicio.innerHTML += `<option value="${h}">${h}</option>`
            selfin.innerHTML += `<option value="${h}">${h}</option>`
        });
    }

}

function abrirModalAjuste(id, fecha, horaInicio, horaFin, proposito){
    cargarHorasAjuste();
    document.getElementById('ajuste-id').value = id;
    document.getElementById('ajuste-fecha').value = fecha;
    document.getElementById('ajuste-inicio').value = horaInicio.substring(0, 5);
    document.getElementById('ajuste-fin').value = horaFin.substring(0, 5);
    document.getElementById('ajuste-proposito').value = proposito || '';
    document.getElementById('ajuste-error').style.display = 'none';
    document.getElementById('ajuste-ok').style.display = 'none';
    document.getElementById('modal-ajuste').classList.add('active')
    const modal= document.getElementById('modal-ajuste');
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function cerrarModal(){
    const modal = document.getElementById('modal-ajuste');
    modal.classList.remove('active');
    modal.style.display='none';
}

async function guardarAjuste() {
    const id = document.getElementById('ajuste-id').value
    const fecha = document.getElementById('ajuste-fecha').value
    const inicio = document.getElementById('ajuste-inicio').value
    const fin = document.getElementById('ajuste-fin').value
    const proposito = document.getElementById('ajuste-proposito').value
    const error = document.getElementById('ajuste-error');
    const ok = document.getElementById('ajuste-ok');
    const btn = document.getElementById('btn-ajustar');

    error.style.display = 'none';
    ok.style.display = 'none';

    if(!fecha || !inicio || !fin){
        error.textContent = 'Completa todos los campos';
        error.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando...'

    try{
        const data = await api.ajustarReserva(id, {
            fecha,
            horaInicio: inicio,
            horaFin: fin,
            proposito
        });
        if(data.error) {
            error.textContent = data.error;
            error.style.display = 'block';
        } else {
            ok.textContent = 'Reserva ajustada exitosamente.';
            ok.style.display = 'block';
            setTimeout(async () => {
                cerrarModal();
                await cargarReservas();
                await cargarInicio();
            }, 1200);
        }
    } catch {
        error.textContent = 'Error de conexion con el servidor.';
        error.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar cambios'
    }
}

// MODAL EDITAR SALA

function cerrarModalSala() {
    const modal = document.getElementById('modal-sala');
    modal.classList.remove('active');
    modal.style.display = 'none';
}

async function abrirModalSala(id, nombre, capacidad, ubicacion, recursosActuales) {
    document.getElementById('edit-sala-id').value        = id;
    document.getElementById('edit-sala-nombre').value    = nombre;
    document.getElementById('edit-sala-capacidad').value = capacidad;
    document.getElementById('edit-sala-ubicacion').value = ubicacion;
    document.getElementById('edit-sala-error').style.display = 'none';
    document.getElementById('edit-sala-ok').style.display    = 'none';

    // Cargar checkboxes de recursos
    try {
        const res = await fetch(`http://localhost:8080/api/recursos`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const recursos = await res.json();
        const container = document.getElementById('edit-checkboxes-recursos');
        container.innerHTML = recursos.map(r => `
            <label style="display:flex;align-items:center;gap:6px;
                          font-size:13px;cursor:pointer;">
                <input type="checkbox" value="${r.id}"
                       style="width:auto;height:auto;"
                       ${recursosActuales.includes(r.id) ? 'checked' : ''}/>
                ${r.nombre}
            </label>`).join('');
    } catch {
        document.getElementById('edit-checkboxes-recursos').innerHTML =
            '<span style="font-size:12px;color:var(--text-muted);">No se pudieron cargar los recursos.</span>';
    }

    const modal = document.getElementById('modal-sala');
    modal.classList.add('active');
    modal.style.display = 'flex';
}

async function guardarEdicionSala() {
    const id        = document.getElementById('edit-sala-id').value;
    const nombre    = document.getElementById('edit-sala-nombre').value.trim();
    const capacidad = document.getElementById('edit-sala-capacidad').value;
    const ubicacion = document.getElementById('edit-sala-ubicacion').value.trim();
    const error     = document.getElementById('edit-sala-error');
    const ok        = document.getElementById('edit-sala-ok');
    const btn       = document.getElementById('btn-guardar-sala');

    error.style.display = 'none';
    ok.style.display    = 'none';

    if (!nombre || !capacidad || !ubicacion) {
        error.textContent   = 'Completa todos los campos obligatorios.';
        error.style.display = 'block';
        return;
    }

    const recursoIds = Array.from(
        document.querySelectorAll('#edit-checkboxes-recursos input:checked')
    ).map(cb => parseInt(cb.value));

    btn.disabled    = true;
    btn.textContent = 'Guardando...';

    try {
        const data = await api.editarSala(id, {
            nombre,
            capacidad: parseInt(capacidad),
            ubicacion,
            facultadId: FACULTAD_ID,
            recursoIds
        });

        if (data.error) {
            error.textContent   = data.error;
            error.style.display = 'block';
        } else {
            ok.textContent   = `Sala "${data.nombre}" actualizada exitosamente.`;
            ok.style.display = 'block';
            setTimeout(async () => {
                cerrarModalSala();
                await cargarSalas();
                await cargarInicio();
            }, 800);
        }
    } catch {
        error.textContent   = 'Error de conexión con el servidor.';
        error.style.display = 'block';
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Guardar cambios';
    }
}