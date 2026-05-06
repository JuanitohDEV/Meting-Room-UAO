const FACULTAD_ID = 1; // ID de la facultad a la que pertenece el docente

// INIT

document.addEventListener("DOMContentLoaded", async () => {
    verificarRol('DOCENTE');

    const { nombre } = getSesion();
    const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    document.getElementById('topbar-nombre').textContent = nombre;
    document.getElementById('avatar-iniciales').textContent = iniciales;
    document.getElementById('bienvenida').textContent = `Bienvenido, ${nombre.split(' ')[0]}`;
    

    // Eventos de navegacion
    document.getElementById('nav-inicio').addEventListener('click', () => mostrarPagina('inicio'));
    document.getElementById('nav-disponibilidad').addEventListener('click', () => mostrarPagina('disponibilidad'));
    document.getElementById('nav-reservas').addEventListener('click', () => mostrarPagina('reservas'));
    document.getElementById('nav-historial').addEventListener('click', () => mostrarPagina('historial'));

    // Eventos de botones

    document.getElementById('btn-salir').addEventListener('click', cerrarSesion);
    document.getElementById('btn-nueva-reserva').addEventListener('click', () => mostrarPagina('reservas'));
    document.getElementById('btn-reservar').addEventListener('click', crearReserva);

    cargarHoras();
    await Promise.all([cargarInicio(), cargarSalas()]);
    renderCalendario();
});

// NAVEGACION

function mostrarPagina(nombre) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + nombre).classList.add('active');
    document.getElementById('nav-' + nombre).classList.add('active');

    if (nombre === 'historial') cargarHistorial();
    if (nombre === 'reservas') cargarReservasActivas();
}

// CARGAR INICIO

async function cargarInicio() {
    const reservas = await api.misReservas();
    const activas = reservas.filter(r => r.estado === 'CONFIRMADA');

    document.getElementById('stat-activas').textContent = activas.length;
    document.getElementById('stat-total').textContent = reservas.length;

    const tbody = document.getElementById('tabla-proximas');
    const proximas = activas.slice(0,3);
    tbody.innerHTML = proximas.length
        ? proximas.map(r => `
            <tr>
                <td>${r.sala.nombre}</td>
                <td>${r.fecha}</td>
                <td>${r.horaInicio} – ${r.horaFin}</td>
                <td><span class="pill pill-green">Confirmada</span></td>
            </tr>`).join('')
        : `<tr><td colspan="4" style="color:var(--text-muted);
            text-align:center;padding:1rem;">
            Sin reservas activas</td></tr>`;
}

// CARGAR SALAS

async function cargarSalas() {
    const salas = await api.getSalasPorFacultad(FACULTAD_ID);
    document.getElementById('stat-salas').textContent = 
        salas.filter(s => s.habilitada).length;

    const select = document.getElementById('res-sala');
    select.innerHTML = salas.filter(s => s.habilitada).map(s => `<option value="${s.id}">${s.nombre} (Cap. ${s.capacidad})</option>`).join('');

    const lista = document.getElementById('lista-salas');
    lista.innerHTML = salas.map(s => `
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:10px 12px;background:var(--gray-bg);
                    border-radius:var(--radius);margin-bottom:8px;">
            <div>
                <div style="font-weight:500;">${s.nombre}</div>
                <div style="font-size:12px;color:var(--text-muted);">
                    Cap. ${s.capacidad} · ${s.ubicacion}
                </div>
            </div>
            <span class="pill ${s.habilitada ? 'pill-green' : 'pill-red'}">
                ${s.habilitada ? 'Habilitada' : 'Deshabilitada'}
            </span>
        </div>`).join('');
}


// CARGAR RESERVAS ACTIVAS

async function cargarReservasActivas() {
    const reservas = await api.misReservas();
    const activas = reservas.filter(r => r.estado === 'CONFIRMADA');
    const tbody = document.getElementById('tabla-activas');
    tbody.innerHTML = activas.length
        ? activas.map(r => `
            <tr>
                <td>${r.sala.nombre}</td>
                <td>${r.fecha}</td>
                <td>${r.horaInicio} – ${r.horaFin}</td>
                <td><span class="pill pill-green">Confirmada</span></td>
                <td>
                    <button class="btn-danger"
                            data-id="${r.id}" id="btn-cancelar-${r.id}">
                        Cancelar
                    </button>
                </td>
            </tr>`).join('')
        : `<tr><td colspan="5" style="color:var(--text-muted);
            text-align:center;padding:1rem;">
            Sin reservas activas</td></tr>`;


    document.querySelectorAll('.btn-danger[data-id]').forEach(btn => {
        btn.addEventListener('click', () => cancelarReserva(btn.dataset.id));
    });
}

// CARGAR HISTORIAL

async function cargarHistorial() {
    const reservas = await api.misReservas();
    const tbody = document.getElementById('tabla-historial');
    tbody.innerHTML = reservas.length
        ? reservas.map(r => `
            <tr>
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
            </tr>`).join('')
        : `<tr><td colspan="5" style="color:var(--text-muted);
            text-align:center;padding:1rem;">
            Sin reservas registradas</td></tr>`;
}

// CREAR RESERVA

async function crearReserva() {
    const salaId = document.getElementById('res-sala').value;
    const fecha = document.getElementById('res-fecha').value;
    const inicio = document.getElementById('res-inicio').value;
    const fin = document.getElementById('res-fin').value;
    const proposito = document.getElementById('res-proposito').value;
    const error = document.getElementById('res-error');
    const ok = document.getElementById('res-ok');
    const btn = document.getElementById('btn-reservar');

    error.style.display = 'none';
    ok.style.display = 'none';

    if (!fecha || !inicio || !fin) {
        error.textContent   = 'Completa todos los campos obligatorios.';
        error.style.display = 'block';
        return;
    }

    // Validar que la fecha no sea anterior a hoy
    const hoy = new Date().toISOString().split('T')[0];
    if (fecha < hoy) {
        error.textContent   = 'No puedes crear reservas en fechas anteriores a hoy.';
        error.style.display = 'block';
        return;
    }

    // Validar que hora inicio sea menor a hora fin
    if (inicio >= fin) {
        error.textContent   = 'La hora de inicio debe ser menor a la hora de fin.';
        error.style.display = 'block';
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Confirmando...';

    try {
        const data = await api.crearReserva({
            salaId, fecha,
            horaInicio: inicio,
            horaFin:    fin,
            proposito
        });
        if (data.error) {
            error.textContent   = data.error;
            error.style.display = 'block';
        } else {
            ok.textContent   = 'Reserva confirmada exitosamente.';
            ok.style.display = 'block';
            await cargarInicio();
            await cargarReservasActivas();
        }
    } catch {
        error.textContent   = 'Error de conexión con el servidor.';
        error.style.display = 'block';
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Confirmar reserva';
    }
}

// CANCELAR RESERVA

async function cancelarReserva(id) {
    if (!confirm('Seguro que deseas cancelar esta reserva?')) return;
    const data = await api.cancelarReserva(id);
    if (data.error) {
        alert(data.error);
    } else{
        await cargarInicio();
        await cargarReservasActivas();
    }
}

// HORAS

function cargarHoras() {
    const horas = [];
    for (let h=7; h<=21; h++) {
        horas.push(`${h.toString().padStart(2,'0')}:00`);
        if(h < 21) horas.push(`${String(h).padStart(2,'0')}:30`);
    }
    horas.push('21:30');

    const selInicio = document.getElementById('res-inicio');
    const selFin = document.getElementById('res-fin');
    horas.forEach(h => {
        selInicio.innerHTML += `<option value="${h}">${h}</option>`;
        selFin.innerHTML    += `<option value="${h}">${h}</option>`;
    });
    selFin.value = '08:00';

    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('res-fecha').min = hoy;
}

// CALENDARIO INTERACTIVO

let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();

async function renderCalendario() {
    const hoy = new Date();
    const dias = new Date(anioActual, mesActual + 1, 0).getDate();
    const inicio = new Date(anioActual, mesActual, 1).getDay();
    const offset = inicio === 0 ? 6 : inicio - 1;
    const semana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

    //TITULO DEL MES

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('cal-titulo').textContent = `${meses[mesActual]} ${anioActual}`;

    const cal = document.getElementById('calendario');
    cal.innerHTML = semana.map(d =>
        `<div class="cal-head">${d}</div>`).join('')
    
    for (let i = 0; i < offset; i++)
        cal.innerHTML += `<div class="cal-day empty"></div>`;

    for (let d = 1; d <= dias; d++){
        const esHoy = d === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();

        const fecha = `${anioActual}-${String(mesActual+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        cal.innerHTML += `
        <div class = "cal-day ${esHoy ? 'today' : ''}"
            data-fecha ="${fecha}"
            onclick="seleccionarDia(this)">
            ${d}
        </div>`;
    }
}

async function seleccionarDia(el) {
    //QUITAR SELECCION ANTERIOR
    document.querySelectorAll('.cal-day.selected').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');

    const fecha = el.dataset.fecha;
    document.getElementById('cal-fecha-sel').textContent = 
    `Disponibilidad para el ${fecha}`;

    const contenedor = document.getElementById('cal-detalle');
    contenedor.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Cargando...</div>';

    const salas = await api.getSalasPorFacultad(FACULTAD_ID);
    const habilitadas = salas.filter(s => s.habilitada);

        const resultados = await Promise.all(
        habilitadas.map(async sala => {
            const ressSala = await api.reservasPorSalaYFecha(sala.id, fecha);
            return { sala, ressSala };
        })
    );

    contenedor.innerHTML = resultados.map(({ sala, ressSala }) => {
        const franjas = ressSala.map(r => `
            <div style="display:flex;align-items:center;gap:8px;
                        padding:6px 10px;background:var(--red-bg);
                        border-radius:6px;margin-bottom:4px;font-size:12px;">
                <span style="color:var(--red-text);font-weight:500;">
                    🔴 ${r.horaInicio} – ${r.horaFin}
                </span>
                <span style="color:var(--text-muted);">
                    ${r.proposito || 'Sin propósito'}
                </span>
            </div>`).join('');

        const libre = ressSala.length === 0;
        return `
            <div style="border:1px solid var(--gray-border);border-radius:var(--radius);
                        padding:12px;margin-bottom:10px;">
                <div style="display:flex;align-items:center;
                            justify-content:space-between;margin-bottom:8px;">
                    <div>
                        <div style="font-weight:500;font-size:13px;">${sala.nombre}</div>
                        <div style="font-size:12px;color:var(--text-muted);">
                            Cap. ${sala.capacidad} · ${sala.ubicacion}
                        </div>
                    </div>
                    <span class="pill ${libre ? 'pill-green' : 'pill-amber'}">
                        ${libre ? 'Libre todo el día' : ressSala.length + ' reserva(s)'}
                    </span>
                </div>
                ${franjas}
            </div>`;
    }).join('');
}

function mesAnterior() {
    if (mesActual === 0) { mesActual = 11; anioActual--; }
    else mesActual--;
    renderCalendario();
    document.getElementById('cal-detalle').innerHTML = '';
    document.getElementById('cal-fecha-sel').textContent = 'Selecciona un dia para ver disponibilidad';
}


function mesSiguiente(){
    if(mesActual === 11) { mesActual = 0; anioActual++; }
    else mesActual++;
    renderCalendario();
    document.getElementById('cal-detalle').innerHTML= '';
    document.getElementById('cal-fecha-sel').textContent = 'Selecciona un dia para ver disponibilidad'
}
