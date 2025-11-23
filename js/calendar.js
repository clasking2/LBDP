/**
 * Calendario Avanzado con Vista Mensual y Filtros
 * Carga datos desde CSV y permite navegación por meses
 */

class AdvancedCalendar {
  constructor(containerId, dataFile) {
    this.container = document.getElementById(containerId);
    this.dataFile = dataFile;
    this.activities = [];
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.selectedCategory = 'all';
    
    this.monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    this.dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    this.categoryColors = {
      'Ceremonia': 'bg-primary text-white',
      'Reunión': 'bg-info text-white', 
      'Académico': 'bg-success text-white',
      'Cultural': 'bg-warning text-dark',
      'Celebración': 'bg-danger text-white',
      'Deportivo': 'bg-secondary text-white',
      'Feriado': 'bg-dark text-white',
      'Vacaciones': 'bg-light text-dark'
    };
    
    this.init();
  }
  
  async init() {
    await this.loadActivities();
    this.render();
    this.attachEventListeners();
  }
  
  async loadActivities() {
    try {
      const response = await fetch(this.dataFile);
      
      // Detectar si es JSON o CSV por la extensión del archivo
      if (this.dataFile.endsWith('.json')) {
        const jsonData = await response.json();
        this.activities = jsonData;
      } else if (this.dataFile.endsWith('.csv')) {
        const csvText = await response.text();
        this.activities = this.parseCSV(csvText);
      } else {
        console.error('Formato de archivo no soportado');
        this.activities = [];
      }
    } catch (error) {
      console.error('Error cargando actividades:', error);
      this.activities = [];
    }
  }
  
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const activities = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length) {
        const activity = {};
        headers.forEach((header, index) => {
          activity[header.trim()] = values[index] ? values[index].trim() : '';
        });
        activities.push(activity);
      }
    }
    
    return activities;
  }
  
  render() {
    this.container.innerHTML = `
      <div class="calendar-container">
        <!-- Controles del Calendario -->
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline-primary btn-sm" id="prevMonth">
              <i class="bi bi-chevron-left"></i>
            </button>
            <h3 class="h5 mb-0" id="monthYear">
              ${this.monthNames[this.currentMonth]} ${this.currentYear}
            </h3>
            <button class="btn btn-outline-primary btn-sm" id="nextMonth">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <button class="btn btn-outline-secondary btn-sm" id="todayBtn">Hoy</button>
            <select class="form-select form-select-sm" id="categoryFilter" style="width: auto;">
              <option value="all">Todas las categorías</option>
              <option value="Ceremonia">Ceremonia</option>
              <option value="Reunión">Reunión</option>
              <option value="Académico">Académico</option>
              <option value="Cultural">Cultural</option>
              <option value="Celebración">Celebración</option>
              <option value="Deportivo">Deportivo</option>
              <option value="Feriado">Feriado</option>
              <option value="Vacaciones">Vacaciones</option>
            </select>
          </div>
        </div>
        
        <!-- Vista del Calendario -->
        <div class="calendar-grid" id="calendarGrid">
          ${this.renderCalendarGrid()}
        </div>
        
        <!-- Lista de Actividades del Día -->
        <div class="mt-4">
          <h4 class="h6 mb-3">Actividades del Mes</h4>
          <div class="activities-list" id="activitiesList">
            ${this.renderActivitiesList()}
          </div>
        </div>
      </div>
    `;
  }
  
  renderCalendarGrid() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    // Ajustar para que la semana inicie en lunes (0=domingo, 1=lunes, etc.)
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si es domingo (0), retroceder 6 días
    startDate.setDate(startDate.getDate() - diff);
    
    let html = `
      <div class="calendar-header">
        ${this.dayNames.map(day => `<div class="calendar-day-name">${day}</div>`).join('')}
      </div>
      <div class="calendar-body">
    `;
    
    const currentDate = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      html += '<div class="calendar-week">';
      
      for (let day = 0; day < 7; day++) {
        const dayActivities = this.getActivitiesForDate(currentDate);
        const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
        const isToday = this.isToday(currentDate);
        const hasActivities = dayActivities.length > 0;
        
        html += `
          <div class="calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${hasActivities ? 'has-activities' : ''}" 
               data-date="${currentDate.toISOString().split('T')[0]}">
            <div class="day-number">${currentDate.getDate()}</div>
            <div class="day-activities">
              ${dayActivities.slice(0, 2).map(activity => `
                <div class="activity-dot ${this.categoryColors[activity.categoria] || 'bg-secondary'}" 
                     title="${activity.titulo}">
                  <small>${activity.titulo.substring(0, 15)}${activity.titulo.length > 15 ? '...' : ''}</small>
                </div>
              `).join('')}
              ${dayActivities.length > 2 ? `<small class="text-muted">+${dayActivities.length - 2} más</small>` : ''}
            </div>
          </div>
        `;
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      html += '</div>';
      
      // Si ya pasamos del mes actual y no hay más actividades, terminamos
      if (currentDate.getMonth() !== this.currentMonth && week > 3) {
        break;
      }
    }
    
    html += '</div>';
    return html;
  }
  
  renderActivitiesList() {
    const monthActivities = this.getActivitiesForMonth();
    
    if (monthActivities.length === 0) {
      return '<p class="text-muted">No hay actividades programadas para este mes.</p>';
    }
    
    return monthActivities.map(activity => `
      <div class="activity-item card mb-2">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge ${this.categoryColors[activity.categoria] || 'bg-secondary'}">${activity.categoria}</span>
                <small class="text-muted">${new Date(activity.fecha).toLocaleDateString('es-CL')}</small>
                ${activity.hora ? `<small class="text-muted">${activity.hora}</small>` : ''}
              </div>
              <h6 class="mb-1">${activity.titulo}</h6>
              <p class="small text-muted mb-0">${activity.descripcion}</p>
              ${activity.lugar ? `<small class="text-primary"><i class="bi bi-geo-alt me-1"></i>${activity.lugar}</small>` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  getActivitiesForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    return this.activities.filter(activity => {
      const activityDate = activity.fecha;
      const matchesDate = activityDate === dateString;
      const matchesCategory = this.selectedCategory === 'all' || activity.categoria === this.selectedCategory;
      return matchesDate && matchesCategory;
    });
  }
  
  getActivitiesForMonth() {
    return this.activities.filter(activity => {
      const activityDate = new Date(activity.fecha);
      const matchesMonth = activityDate.getMonth() === this.currentMonth && activityDate.getFullYear() === this.currentYear;
      const matchesCategory = this.selectedCategory === 'all' || activity.categoria === this.selectedCategory;
      return matchesMonth && matchesCategory;
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }
  
  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  attachEventListeners() {
    // Navegación de meses
    document.getElementById('prevMonth').addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.render();
      this.attachEventListeners();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.render();
      this.attachEventListeners();
    });
    
    // Botón "Hoy"
    document.getElementById('todayBtn').addEventListener('click', () => {
      const today = new Date();
      this.currentMonth = today.getMonth();
      this.currentYear = today.getFullYear();
      this.render();
      this.attachEventListeners();
    });
    
    // Filtro de categorías
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
      this.selectedCategory = e.target.value;
      this.render();
      this.attachEventListeners();
    });
    
    // Click en días del calendario
    document.querySelectorAll('.calendar-day').forEach(dayEl => {
      dayEl.addEventListener('click', (e) => {
        const date = e.currentTarget.getAttribute('data-date');
        this.showDayDetails(date);
      });
    });
  }
  
  showDayDetails(dateString) {
    const activities = this.activities.filter(activity => activity.fecha === dateString);
    const date = new Date(dateString + 'T00:00:00');
    
    if (activities.length === 0) {
      return;
    }
    
    const fechaStr = date.toLocaleDateString('es-CL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
    
    // Crear modal si no existe
    let modal = document.getElementById('actividadModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'actividadModal';
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="actividadModalTitle"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body" id="actividadModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    // Actualizar contenido
    document.getElementById('actividadModalTitle').innerHTML = `
      <i class="bi bi-calendar-event me-2"></i>
      Actividades del día
    `;
    
    // Generar lista de actividades con detalles
    const actividadesHTML = activities.map(activity => {
      const colorClass = this.categoryColors[activity.categoria] || 'bg-secondary text-white';
      return `
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="mb-0">${activity.titulo}</h6>
              <span class="badge ${colorClass}">${activity.categoria || 'General'}</span>
            </div>
            ${activity.descripcion ? `
              <p class="text-muted mb-2">${activity.descripcion}</p>
            ` : ''}
            <div class="d-flex flex-wrap gap-3 small text-muted">
              ${activity.hora ? `
                <span><i class="bi bi-clock me-1"></i>${activity.hora}</span>
              ` : ''}
              ${activity.lugar ? `
                <span><i class="bi bi-geo-alt me-1"></i>${activity.lugar}</span>
              ` : ''}
              ${activity.responsable ? `
                <span><i class="bi bi-person me-1"></i>${activity.responsable}</span>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    document.getElementById('actividadModalBody').innerHTML = `
      <div class="mb-3">
        <h6 class="text-muted mb-2"><i class="bi bi-calendar3 me-2"></i>Fecha</h6>
        <p class="mb-0">${fechaStr}</p>
      </div>
      
      <div class="mb-3">
        <h6 class="text-muted mb-2"><i class="bi bi-list-ul me-2"></i>Actividades (${activities.length})</h6>
        ${actividadesHTML}
      </div>
    `;
    
    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }
}
