// =============================================================================
//  🚀  SPACEX FLIGHT CONTROL CENTER
//  Centro de Control de Lanzamientos Espaciales
//
//  Proyecto de Desempeño · SENA Formación Complementaria 3406211
//  Módulo: JavaScript · Unidades 1 a 7
//
//  INSTRUCCIONES PARA EL APRENDIZ:
//  ─────────────────────────────────────────────────────────────────────────────
//  Este archivo está vacío. Tu tarea es implementar todas las funciones
//  necesarias para que la aplicación funcione de acuerdo al enunciado.
//
//  Pasos recomendados:
//    1. Lee el enunciado completo en ENUNCIADO.md
//    2. Abre spacex_control_vuelos.html en el navegador con F12 activo
//    3. Revisa el HTML para conocer los IDs disponibles
//    4. Revisa el CSS para conocer las clases que debes aplicar
//    5. Implementa las secciones de este archivo en orden
//
//  IMPORTANTE: No modifiques spacex_control_vuelos.html ni styles-vuelos.css
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 1 — ALMACÉN DE DATOS
//
//  Declara aquí las variables que guardarán el estado global de la aplicación:
//  la colección de lanzamientos registrados y cualquier variable de control
//  que necesites para el funcionamiento de la interfaz.
//
//  Piensa en qué tipo de estructura de datos es más apropiada para
//  mantener una lista de registros, cada uno con múltiples propiedades.
// ─────────────────────────────────────────────────────────────────────────────

const relojPrincipal = document.getElementById('reloj-principal');
const contadorLanzamientos = document.getElementById('contador-lanzamientos');
const formLanzamiento = document.getElementById('form-lanzamiento');
const inputNombreSerie = document.getElementById('input-nombre-serie');
const selectTipoCohete = document.getElementById('select-tipo-cohete');
const inputFechaLanzamiento = document.getElementById('input-fecha-lanzamiento');
const inputObjetivoMision = document.getElementById('input-objetivo-mision');
const inputIdEdicion = document.getElementById('input-id-edicion');
const btnRegistrar = document.getElementById('btn-registrar');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
const statPendientes = document.getElementById('stat-pendientes');
const statLanzados = document.getElementById('stat-lanzados');
const statCancelados = document.getElementById('stat-cancelados');
const statTotal = document.getElementById('stat-total');
const grupoFiltros = document.getElementById('grupo-filtros');
const contadorVisibles = document.getElementById('contador-visibles');
const gridLanzamientos = document.getElementById('grid-lanzamientos');
const estadoVacio = document.getElementById('estado-vacio');

let lanzamientos = []
let filtroActivo = 'todos';
let proximoId = 1;


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 2 — FUNCIONES UTILITARIAS
//
//  Funciones de propósito general que pueden reutilizarse en distintas
//  partes del código. Considera qué operaciones se repiten frecuentemente
//  y valdría la pena encapsular como función auxiliar.
//
//  Por ejemplo: generar un identificador único para cada registro,
//  o transformar una fecha al formato que se mostrará en las tarjetas.
// ─────────────────────────────────────────────────────────────────────────────

function generarId() {
    return proximoId++;
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function obtenerHoraUTC() {
    const fechaActual = new Date();
    const horaMilitar = new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    return horaMilitar.format(fechaActual) + 'Z';
}

function crearTarjeta(lanzamiento) {
    const article = document.createElement('article');
    article.className = `organism-launch-card organism-launch-card--${lanzamiento.estado}`;
    article.setAttribute('data-id', lanzamiento.id);
    article.setAttribute('data-tipo', lanzamiento.tipoCohete);
    article.setAttribute('data-estado', lanzamiento.estado);

    article.innerHTML = `
        <div class="molecule-card-header">
            <span class="molecule-card-header__id atom-mono">#${lanzamiento.id}</span>
            <span class="atom-badge atom-badge--${lanzamiento.estado}">${lanzamiento.estado.toUpperCase()}</span>
        </div>
        <div class="molecule-card-body">
            <div class="molecule-card-body__name">${lanzamiento.nombreSerie}</div>
            <div class="molecule-card-body__type">${lanzamiento.tipoCohete.toUpperCase()}</div>
            <div class="molecule-card-body__objective">${lanzamiento.objetivo}</div>
            <div class="molecule-card-body__date atom-mono">${formatearFecha(lanzamiento.fechaLanzamiento)}</div>
        </div>
        <div class="molecule-card-footer">
            <button class="atom-btn atom-btn--secondary atom-btn--sm" data-action="editar" data-id="${lanzamiento.id}">EDITAR</button>
            <button class="atom-btn atom-btn--danger atom-btn--sm" data-action="cancelar" data-id="${lanzamiento.id}">CANCELAR</button>
        </div>
    `;

    // Añadir eventos hover
    article.addEventListener('mouseover', () => {
        article.classList.add('is-hovered');
    });
    article.addEventListener('mouseout', () => {
        article.classList.remove('is-hovered');
    });

    return article;
}

function renderizarTarjetas() {
    gridLanzamientos.innerHTML = '';

    let lanzamientosFiltrados = lanzamientos;
    if (filtroActivo !== 'todos') {
        lanzamientosFiltrados = lanzamientos.filter(l => l.estado === filtroActivo);
    }

    if (lanzamientosFiltrados.length === 0) {
        gridLanzamientos.appendChild(estadoVacio);
        contadorVisibles.textContent = '0 REGISTROS';
        return;
    }

    estadoVacio.style.display = 'none';

    lanzamientosFiltrados.forEach(lanzamiento => {
        const tarjeta = crearTarjeta(lanzamiento);
        gridLanzamientos.appendChild(tarjeta);
    });

    contadorVisibles.textContent = `${lanzamientosFiltrados.length} REGISTROS`;
}

function actualizarEstadisticas() {
    const pendientes = lanzamientos.filter(l => l.estado === 'pendiente').length;
    const lanzados = lanzamientos.filter(l => l.estado === 'lanzado').length;
    const cancelados = lanzamientos.filter(l => l.estado === 'cancelado').length;
    const total = lanzamientos.length;

    statPendientes.textContent = pendientes;
    statLanzados.textContent = lanzados;
    statCancelados.textContent = cancelados;
    statTotal.textContent = total;
}

function actualizarContador() {
    contadorLanzamientos.textContent = lanzamientos.length;
}


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 3 — RENDERIZADO DE TARJETAS
//
//  Funciones que leen el almacén de datos y convierten cada lanzamiento
//  en un elemento HTML visible dentro del contenedor del grid.
//
//  La tarjeta debe construirse como un elemento del DOM con la estructura
//  documentada en el archivo HTML. Revisa los comentarios del grid para
//  conocer exactamente qué clases y atributos debe tener cada parte.
//
//  IDs relevantes del HTML:
//    · #grid-lanzamientos  → contenedor donde se insertan las tarjetas
//    · #estado-vacio       → se muestra cuando no hay tarjetas
//    · #contador-visibles  → muestra cuántas tarjetas son visibles
//    · #contador-lanzamientos → contador de vuelos en la topbar
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 4 — ANIMACIONES DE TARJETAS (HOVER)
//
//  Cada tarjeta creada debe escuchar eventos del cursor y responder
//  aplicando o removiendo la clase CSS que activa la animación.
//
//  La clase de activación está definida en el archivo de estilos.
//  El CSS ya tiene la transición configurada para entrada y salida.
//
//  Eventos que debes capturar en cada tarjeta:
//    · mouseover  → activar el estado de hover
//    · mouseout   → desactivar el estado de hover
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 5 — FORMULARIO: REGISTRO Y EDICIÓN
//
//  Función que responde al evento de envío del formulario.
//  Debe leer el valor de cada campo, verificar que no estén vacíos,
//  construir el objeto del lanzamiento y añadirlo al almacén.
//  Si el campo oculto de edición contiene un ID, debe actualizar el
//  registro existente en lugar de crear uno nuevo.
//
//  IDs relevantes del HTML:
//    · #form-lanzamiento        → el elemento <form>
//    · #input-nombre-serie      → campo texto nombre
//    · #select-tipo-cohete      → campo selección tipo
//    · #input-fecha-lanzamiento → campo fecha y hora
//    · #input-objetivo-mision   → campo texto objetivo
//    · #input-id-edicion        → campo oculto con el ID en modo edición
//    · #btn-registrar           → botón principal del formulario
//    · #btn-cancelar-edicion    → botón para salir del modo edición
// ─────────────────────────────────────────────────────────────────────────────

function manejarFormulario(evento) {
    evento.preventDefault();

    // Leer valores del formulario
    const nombreSerie = inputNombreSerie.value.trim();
    const tipoCohete = selectTipoCohete.value.trim();
    const fechaLanzamiento = inputFechaLanzamiento.value.trim();
    const objetivo = inputObjetivoMision.value.trim();
    const idEdicion = inputIdEdicion.value.trim();

    // Validar que ningún campo esté vacío
    if (!nombreSerie || !tipoCohete || !fechaLanzamiento || !objetivo) {
        alert('⚠️ Todos los campos son obligatorios. Por favor completa el formulario.');
        return;
    }

    // Si está en modo edición
    if (idEdicion) {
        const lanzamiento = lanzamientos.find(l => l.id === parseInt(idEdicion));
        if (lanzamiento) {
            lanzamiento.nombreSerie = nombreSerie;
            lanzamiento.tipoCohete = tipoCohete;
            lanzamiento.fechaLanzamiento = fechaLanzamiento;
            lanzamiento.objetivo = objetivo;
        }
        cancelarEdicion();
    } else {
        // Crear nuevo lanzamiento
        const nuevoLanzamiento = {
            id: generarId(),
            nombreSerie,
            tipoCohete,
            fechaLanzamiento,
            objetivo,
            estado: 'pendiente'
        };
        lanzamientos.push(nuevoLanzamiento);
        limpiarFormulario();
    }

    renderizarTarjetas();
    actualizarEstadisticas();
    actualizarContador();
}

function limpiarFormulario() {
    inputNombreSerie.value = '';
    selectTipoCohete.value = '';
    inputFechaLanzamiento.value = '';
    inputObjetivoMision.value = '';
    inputIdEdicion.value = '';
}

function cancelarEdicion() {
    limpiarFormulario();
    btnCancelarEdicion.style.display = 'none';
}



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 6 — CAMBIOS DE ESTADO
//
//  Funciones que modifican un lanzamiento existente:
//    · Modo edición: cargar los datos del registro en el formulario
//    · Cancelación: cambiar el estado del registro a "cancelado"
//
//  Las tarjetas tienen botones con los atributos data-id y data-action.
//  Puedes usar estos atributos para saber qué registro modificar y
//  qué acción ejecutar cuando el usuario hace clic.
// ─────────────────────────────────────────────────────────────────────────────

function editarLanzamiento(id) {
    const lanzamiento = lanzamientos.find(l => l.id === id);
    
    if (!lanzamiento) return;
    
    // Solo se pueden editar lanzamientos pendientes
    if (lanzamiento.estado !== 'pendiente') {
        alert('⚠️ Solo se pueden editar lanzamientos con estado PENDIENTE.');
        return;
    }

    // Cargar datos en el formulario
    inputNombreSerie.value = lanzamiento.nombreSerie;
    selectTipoCohete.value = lanzamiento.tipoCohete;
    inputFechaLanzamiento.value = lanzamiento.fechaLanzamiento;
    inputObjetivoMision.value = lanzamiento.objetivo;
    inputIdEdicion.value = lanzamiento.id;

    // Mostrar botón de cancelar edición
    btnCancelarEdicion.style.display = 'inline-block';

    // Scroll al formulario
    formLanzamiento.scrollIntoView({ behavior: 'smooth' });
}

function cancelarLanzamiento(id) {
    const lanzamiento = lanzamientos.find(l => l.id === id);
    
    if (!lanzamiento) return;
    
    // Solo se pueden cancelar lanzamientos pendientes
    if (lanzamiento.estado !== 'pendiente') {
        alert('⚠️ Solo se pueden cancelar lanzamientos con estado PENDIENTE.');
        return;
    }

    lanzamiento.estado = 'cancelado';
    renderizarTarjetas();
    actualizarEstadisticas();
}

function manejarClickEnTarjetas(evento) {
    const boton = evento.target;
    const accion = boton.getAttribute('data-action');
    const id = parseInt(boton.getAttribute('data-id'));

    if (accion === 'editar') {
        editarLanzamiento(id);
    } else if (accion === 'cancelar') {
        cancelarLanzamiento(id);
    }
}



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 7 — FILTRADO POR ESTADO
//
//  Funciones que muestran u ocultan tarjetas según el filtro activo.
//  Al aplicar un filtro, solo deben verse las tarjetas que coincidan
//  con el estado seleccionado. El botón activo debe marcarse visualmente.
//
//  IDs relevantes del HTML:
//    · #grupo-filtros  → contenedor de los botones de filtro
//
//  Atributo en los botones de filtro: data-filter
//  Valores posibles: "todos" · "pendiente" · "lanzado" · "cancelado"
//
//  Clase CSS del botón activo: atom-btn--filter-active
// ─────────────────────────────────────────────────────────────────────────────

function aplicarFiltro(nuevoFiltro) {
    filtroActivo = nuevoFiltro;

    // Actualizar botones activos
    const botonesFilter = grupoFiltros.querySelectorAll('[data-filter]');
    botonesFilter.forEach(boton => {
        if (boton.getAttribute('data-filter') === nuevoFiltro) {
            boton.classList.add('atom-btn--filter-active');
        } else {
            boton.classList.remove('atom-btn--filter-active');
        }
    });

    // Renderizar tarjetas filtradas
    renderizarTarjetas();
}

function configurarEventosFiltros() {
    const botonesFilter = grupoFiltros.querySelectorAll('[data-filter]');
    botonesFilter.forEach(boton => {
        boton.addEventListener('click', () => {
            const filtro = boton.getAttribute('data-filter');
            aplicarFiltro(filtro);
        });
    });
}



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 8 — RELOJ Y MONITOREO AUTOMÁTICO
//
//  Un intervalo de tiempo que se ejecuta cada segundo y realiza dos tareas:
//
//    Tarea A: Reloj en tiempo real
//      Obtener la hora actual en UTC y mostrarla en el elemento del reloj
//      usando el formato HH:MM:SSZ (horas, minutos, segundos + letra Z).
//
//    Tarea B: Detección automática de lanzamientos
//      Recorrer el almacén y buscar registros con estado "pendiente"
//      cuya fecha programada ya se haya alcanzado o superado.
//      Cuando se detecte uno, cambiar su estado a "lanzado" y
//      actualizar la vista para reflejar el cambio.
//
//  ID relevante del HTML:
//    · #reloj-principal → elemento donde se despliega la hora
// ─────────────────────────────────────────────────────────────────────────────

function iniciarRelojYMonitoreo() {
    setInterval(() => {
        relojPrincipal.textContent = obtenerHoraUTC();

        const ahora = new Date();
        let huboDeteccion = false;

        lanzamientos.forEach(lanzamiento => {
            if (lanzamiento.estado === 'pendiente') {
                const fechaProgramada = new Date(lanzamiento.fechaLanzamiento);
                if (ahora >= fechaProgramada) {
                    lanzamiento.estado = 'lanzado';
                    huboDeteccion = true;
                }
            }
        });

        if (huboDeteccion) {
            renderizarTarjetas();
            actualizarEstadisticas();
        }
    }, 1000);
}



// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 9 — ESTADÍSTICAS
//
//  Función que recorre el almacén, cuenta los registros por estado
//  y actualiza los elementos del panel de estadísticas con los totales.
//
//  IDs relevantes del HTML:
//    · #stat-pendientes  → contador de lanzamientos pendientes
//    · #stat-lanzados    → contador de lanzamientos ejecutados
//    · #stat-cancelados  → contador de lanzamientos cancelados
//    · #stat-total       → total de registros en el sistema
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 10 — INICIALIZACIÓN
//
//  Punto de arranque de la aplicación. Todo el código que necesita
//  interactuar con elementos del DOM debe ejecutarse aquí, dentro de
//  un mecanismo que garantice que la página ya terminó de cargar.
//
//  Desde aquí debes:
//    · Conectar los eventos del formulario y los botones
//    · Iniciar el intervalo del reloj y el monitor automático
//    · Hacer el primer renderizado y actualizar las estadísticas
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Conectar eventos del formulario
    formLanzamiento.addEventListener('submit', manejarFormulario);
    btnCancelarEdicion.addEventListener('click', cancelarEdicion);

    // Conectar eventos de los botones de filtro
    configurarEventosFiltros();

    // Conectar eventos de las tarjetas (delegación de eventos)
    gridLanzamientos.addEventListener('click', manejarClickEnTarjetas);

    // Iniciar reloj y monitoreo automático
    iniciarRelojYMonitoreo();

    // Primer renderizado y actualización de estadísticas
    renderizarTarjetas();
    actualizarEstadisticas();
    actualizarContador();

    // Ocultar botón de cancelar edición al inicio
    btnCancelarEdicion.style.display = 'none';
});
