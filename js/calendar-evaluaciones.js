/**
 * Calendario de Evaluaciones con Filtro por Curso
 * Carga datos desde JSON con estructura completa de evaluaciones
 */

class EvaluacionesCalendar {
  constructor(containerId, dataFile) {
    this.container = document.getElementById(containerId);
    this.dataFile = dataFile;
    this.evaluaciones = [];
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.selectedCurso = null; // Iniciar sin curso seleccionado

    this.monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Empezar con lunes
    this.dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    this.estrategiaColors = {
      'Prueba': 'bg-danger text-white',
      'Prueba Escrita': 'bg-danger text-white',
      'Oral': 'bg-warning text-dark',
      'Examen Oral': 'bg-warning text-dark',
      'Laboratorio': 'bg-info text-white',
      'Trabajo de Laboratorio': 'bg-info text-white',
      'Ensayo': 'bg-primary text-white',
      'Trabajo Escrito': 'bg-primary text-white',
      'Práctica': 'bg-success text-white',
      'Evaluación Práctica': 'bg-success text-white',
      'Disertación': 'bg-secondary text-white',
      'Presentación': 'bg-secondary text-white',
      'Proyecto': 'bg-dark text-white',
      'Taller': 'bg-purple text-white'
    };

    this.init();
  }

  async init() {
    await this.loadEvaluaciones();
    this.extractCursos();

    // Auto-seleccionar el primer curso si existe
    if (this.cursos.length > 0) {
      this.selectedCurso = this.cursos[0];
    }

    this.render();
    this.attachEventListeners();
  }

  extractCursos() {
    // Extraer cursos únicos del JSON
    const cursosSet = new Set();
    this.evaluaciones.forEach(evaluacion => {
      if (evaluacion.curso && evaluacion.curso.trim() !== '') {
        cursosSet.add(evaluacion.curso.trim());
      }
    });
    this.cursos = Array.from(cursosSet).sort();
  }

  async loadEvaluaciones() {
    try {
      const response = await fetch(this.dataFile);

      // Detectar si es JSON o CSV por la extensión del archivo
      if (this.dataFile.endsWith('.json')) {
        const jsonData = await response.json();
        this.evaluaciones = jsonData;
      } else if (this.dataFile.endsWith('.csv')) {
        const csvText = await response.text();
        this.evaluaciones = this.parseCSV(csvText);
      } else {
        console.error('Formato de archivo no soportado');
        this.evaluaciones = [];
      }
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
      console.warn('Usando datos de respaldo (fallback) debido a error de carga.');

      // Fallback data
      this.evaluaciones = [
        { id: 1, fecha: "2025-11-04", asignatura: "Matemática", profesor: "Prof. María González", contenido: "Geometría", estrategia_evaluacion: "Prueba Escrita", curso: "1° Medio A" },
        { id: 2, fecha: "2025-11-11", asignatura: "Historia", profesor: "Prof. Pedro Valenzuela", contenido: "Educación Cívica", estrategia_evaluacion: "Debate", curso: "3° Medio A" },
        { id: 3, fecha: "2025-11-18", asignatura: "Física", profesor: "Prof. Fernando Muñoz", contenido: "Electricidad", estrategia_evaluacion: "Proyecto", curso: "4° Medio C" },
        { id: 4, fecha: "2025-12-02", asignatura: "Matemática", profesor: "Depto. Matemática", contenido: "Examen Final", estrategia_evaluacion: "Examen", curso: "Todos los Niveles" }
      ];
    }
  }

  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const evaluaciones = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length) {
        const evaluacion = {};
        headers.forEach((header, index) => {
          evaluacion[header.trim()] = values[index] ? values[index].trim() : '';
        });
        evaluaciones.push(evaluacion);
      }
    }

    return evaluaciones;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="calendar-widget">
        <div class="calendar-header">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 mb-0">${this.monthNames[this.currentMonth]} ${this.currentYear}</h2>
            <div class="btn-group">
              <button id="prevMonth" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button id="todayBtn" class="btn btn-outline-primary btn-sm">Hoy</button>
              <button id="nextMonth" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <div class="row g-3 mb-3">
            <div class="col-md-8">
              <label for="cursoFilter" class="form-label small">Seleccionar curso:</label>
              <select id="cursoFilter" class="form-select form-select-sm">
                <option value="">Seleccione un curso...</option>
                ${this.cursos.map(curso => `<option value="${curso}" ${this.selectedCurso === curso ? 'selected' : ''}>${curso}</option>`).join('')}
              </select>
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button id="printBtn" class="btn btn-primary btn-sm w-100" ${!this.selectedCurso ? 'disabled' : ''}>
                <i class="bi bi-printer me-2"></i>Imprimir PDF
              </button>
            </div>
          </div>
          
          ${!this.selectedCurso ? `
            <div class="alert alert-info alert-sm mb-0">
              <i class="bi bi-info-circle me-2"></i>
              Selecciona un curso para ver las evaluaciones
            </div>
          ` : ''}
        </div>
        
        ${this.selectedCurso ? `
          <div class="calendar-grid">
            ${this.renderDayHeaders()}
            ${this.renderCalendarGrid()}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderDayHeaders() {
    return this.dayNames.map(day =>
      `<div class="calendar-day-header">${day}</div>`
    ).join('');
  }

  renderCalendarGrid() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    // Ajustar para que la semana empiece el lunes
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - diff);

    let html = '';
    let currentDate = new Date(startDate);

    // Renderizar 6 semanas para cubrir todos los casos
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
        const isToday = this.isToday(currentDate);
        const evaluaciones = this.getEvaluacionesForDate(currentDate);
        const hasEvaluaciones = evaluaciones.length > 0;

        let classes = 'calendar-day';
        if (!isCurrentMonth) classes += ' other-month';
        if (isToday) classes += ' today';
        if (hasEvaluaciones) classes += ' has-event';

        const dateString = currentDate.toISOString().split('T')[0];

        html += `
          <div class="${classes}" data-date="${dateString}">
            <div class="day-number">${currentDate.getDate()}</div>
            ${hasEvaluaciones ? `
              <div class="event-indicators">
                ${evaluaciones.slice(0, 3).map(ev => {
          const colorClass = this.estrategiaColors[ev.estrategia_evaluacion] || 'bg-secondary text-white';
          return `<button class="badge ${colorClass} badge-sm eval-badge" data-eval-id="${ev.id}">${ev.asignatura}</button>`;
        }).join('')}
                ${evaluaciones.length > 3 ? `<small class="text-muted">+${evaluaciones.length - 3} más</small>` : ''}
              </div>
            ` : ''}
          </div>
        `;

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return html;
  }

  getEvaluacionesForDate(date) {
    if (!this.selectedCurso) return [];

    const dateString = date.toISOString().split('T')[0];
    return this.evaluaciones.filter(evaluacion => {
      const evaluacionDate = evaluacion.fecha;
      const matchesDate = evaluacionDate === dateString;
      const matchesCurso = evaluacion.curso === this.selectedCurso;
      return matchesDate && matchesCurso;
    });
  }

  getEvaluacionesForMonth() {
    if (!this.selectedCurso) return [];

    return this.evaluaciones.filter(evaluacion => {
      const evaluacionDate = new Date(evaluacion.fecha + 'T00:00:00');
      const matchesMonth = evaluacionDate.getMonth() === this.currentMonth &&
        evaluacionDate.getFullYear() === this.currentYear;
      const matchesCurso = evaluacion.curso === this.selectedCurso;
      return matchesMonth && matchesCurso;
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  showEvaluacionModal(evaluacionId) {
    const evaluacion = this.evaluaciones.find(e => e.id === evaluacionId);
    if (!evaluacion) return;

    const fecha = new Date(evaluacion.fecha + 'T00:00:00');
    const fechaStr = fecha.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const colorClass = this.estrategiaColors[evaluacion.estrategia_evaluacion] || 'bg-secondary text-white';

    // Crear modal si no existe
    let modal = document.getElementById('evaluacionModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'evaluacionModal';
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="evaluacionModalTitle"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body" id="evaluacionModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Actualizar contenido
    document.getElementById('evaluacionModalTitle').innerHTML = `
      <span class="badge ${colorClass} me-2">${evaluacion.estrategia_evaluacion}</span>
      ${evaluacion.asignatura}
    `;

    document.getElementById('evaluacionModalBody').innerHTML = `
      <div class="mb-3">
        <h6 class="text-muted mb-2"><i class="bi bi-calendar3 me-2"></i>Fecha</h6>
        <p class="mb-0">${fechaStr}</p>
      </div>
      
      <div class="mb-3">
        <h6 class="text-muted mb-2"><i class="bi bi-person me-2"></i>Profesor</h6>
        <p class="mb-0">${evaluacion.profesor}</p>
      </div>
      
      <div class="mb-3">
        <h6 class="text-muted mb-2"><i class="bi bi-mortarboard me-2"></i>Curso</h6>
        <p class="mb-0">${evaluacion.curso}</p>
      </div>
      
      <div class="mb-3">
        <h6 class="text-muted mb-2"><i class="bi bi-book me-2"></i>Contenido</h6>
        <p class="mb-0">${evaluacion.contenido}</p>
      </div>
      
      ${evaluacion.indicadores_evaluacion ? `
        <div class="mb-3">
          <h6 class="text-muted mb-2"><i class="bi bi-check2-square me-2"></i>Indicadores de Evaluación</h6>
          <p class="mb-0">${evaluacion.indicadores_evaluacion}</p>
        </div>
      ` : ''}
      
      ${evaluacion.retroalimentacion ? `
        <div class="mb-0">
          <h6 class="text-muted mb-2"><i class="bi bi-chat-left-text me-2"></i>Retroalimentación</h6>
          <p class="mb-0">${evaluacion.retroalimentacion}</p>
        </div>
      ` : ''}
    `;

    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }

  printToPDF() {
    if (!this.selectedCurso) return;

    const evaluaciones = this.getEvaluacionesForMonth();
    const monthName = this.monthNames[this.currentMonth];

    // Crear ventana de impresión
    const printWindow = window.open('', '', 'width=800,height=600');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Calendario de Evaluaciones - ${monthName} ${this.currentYear}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #1418c4;
            border-bottom: 3px solid #1418c4;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #666;
            font-size: 1.2em;
            margin-top: 10px;
            margin-bottom: 15px;
          }
          .eval-item {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .eval-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .eval-title {
            font-weight: bold;
            font-size: 1.1em;
            color: #1418c4;
          }
          .eval-date {
            color: #666;
            font-size: 0.9em;
          }
          .eval-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: bold;
            margin-right: 8px;
          }
          .eval-info {
            margin: 8px 0;
            font-size: 0.95em;
          }
          .eval-label {
            font-weight: bold;
            color: #666;
          }
          .no-evaluaciones {
            text-align: center;
            padding: 40px;
            color: #999;
          }
          @media print {
            body { margin: 0; }
            .eval-item { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>Calendario de Evaluaciones</h1>
        <h2>${this.selectedCurso} - ${monthName} ${this.currentYear}</h2>
        
        ${evaluaciones.length === 0 ? `
          <div class="no-evaluaciones">
            <p>No hay evaluaciones programadas para este mes</p>
          </div>
        ` : evaluaciones.map(ev => {
      const fecha = new Date(ev.fecha + 'T00:00:00');
      const fechaStr = fecha.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      return `
            <div class="eval-item">
              <div class="eval-header">
                <div>
                  <span class="eval-badge" style="background: #dc3545; color: white;">${ev.estrategia_evaluacion}</span>
                  <span class="eval-title">${ev.asignatura}</span>
                </div>
                <div class="eval-date">${fechaStr}</div>
              </div>
              
              <div class="eval-info">
                <span class="eval-label">Profesor:</span> ${ev.profesor}
              </div>
              
              <div class="eval-info">
                <span class="eval-label">Contenido:</span> ${ev.contenido}
              </div>
              
              ${ev.indicadores_evaluacion ? `
                <div class="eval-info">
                  <span class="eval-label">Indicadores:</span> ${ev.indicadores_evaluacion}
                </div>
              ` : ''}
              
              ${ev.retroalimentacion ? `
                <div class="eval-info">
                  <span class="eval-label">Retroalimentación:</span> ${ev.retroalimentacion}
                </div>
              ` : ''}
            </div>
          `;
    }).join('')}
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 100);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  attachEventListeners() {
    // Navegación de meses
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');
    const cursoFilter = document.getElementById('cursoFilter');
    const printBtn = document.getElementById('printBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentMonth--;
        if (this.currentMonth < 0) {
          this.currentMonth = 11;
          this.currentYear--;
        }
        this.render();
        this.attachEventListeners();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentMonth++;
        if (this.currentMonth > 11) {
          this.currentMonth = 0;
          this.currentYear++;
        }
        this.render();
        this.attachEventListeners();
      });
    }

    // Botón "Hoy"
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        const today = new Date();
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();
        this.render();
        this.attachEventListeners();
      });
    }

    // Filtro de cursos
    if (cursoFilter) {
      cursoFilter.addEventListener('change', (e) => {
        this.selectedCurso = e.target.value || null;
        this.render();
        this.attachEventListeners();
      });
    }

    // Botón imprimir
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printToPDF();
      });
    }

    // Event listeners para badges de evaluaciones
    document.querySelectorAll('.eval-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const evalId = parseInt(badge.getAttribute('data-eval-id'));
        this.showEvaluacionModal(evalId);
      });
    });
  }
}

// Inicializar calendario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (typeof EvaluacionesCalendar !== 'undefined') {
    new EvaluacionesCalendar('calendar', './data/evaluaciones.json');
  }
});

