# Estructura de Datos - Calendario de Evaluaciones

## Descripción General

Este documento describe la estructura de datos JSON para el calendario de evaluaciones del Liceo Bicentenario Delegación Presidencial.

## Archivo JSON

**Ubicación:** `data/evaluaciones.json`

## Estructura JSON Esperada

El archivo debe contener un array de objetos, donde cada objeto representa una evaluación:

```json
[
  {
    "id": 1,
    "fecha": "2025-03-10",
    "asignatura": "Matemática",
    "profesor": "Prof. María González",
    "contenido": "Álgebra: Ecuaciones de segundo grado, factorización y sistemas de ecuaciones lineales",
    "estrategia_evaluacion": "Prueba Escrita",
    "indicadores_evaluacion": "Resuelve ecuaciones cuadráticas mediante diferentes métodos. Identifica y aplica propiedades algebraicas.",
    "retroalimentacion": "Se entregará corrección detallada en clase. Refuerzo disponible en horario de consulta",
    "curso": "1° Medio A"
  }
]
```

## Campos Requeridos

### 1. `id` (número)
- **Descripción:** Identificador único de la evaluación
- **Tipo:** Número entero
- **Ejemplo:** `1`, `2`, `3`
- **Obligatorio:** Sí

### 2. `fecha` (string)
- **Descripción:** Fecha de la evaluación en formato ISO 8601
- **Formato:** `YYYY-MM-DD`
- **Ejemplo:** `"2025-03-10"`
- **Obligatorio:** Sí

### 3. `asignatura` (string)
- **Descripción:** Nombre de la asignatura o materia
- **Ejemplos:** 
  - `"Matemática"`
  - `"Lenguaje y Comunicación"`
  - `"Ciencias Naturales"`
  - `"Historia y Geografía"`
  - `"Inglés"`
- **Obligatorio:** Sí

### 4. `profesor` (string)
- **Descripción:** Nombre completo del profesor a cargo
- **Formato:** `"Prof. [Nombre] [Apellido]"`
- **Ejemplos:**
  - `"Prof. María González"`
  - `"Prof. Carlos Rojas"`
- **Obligatorio:** Sí

### 5. `contenido` (string)
- **Descripción:** Descripción detallada del contenido que será evaluado
- **Ejemplo:** `"Álgebra: Ecuaciones de segundo grado, factorización y sistemas de ecuaciones lineales"`
- **Recomendación:** Ser específico y claro sobre los temas a evaluar
- **Obligatorio:** Sí

### 6. `estrategia_evaluacion` (string)
- **Descripción:** Tipo o estrategia de evaluación utilizada
- **Valores recomendados:**
  - `"Prueba Escrita"`
  - `"Prueba"`
  - `"Oral"`
  - `"Examen Oral"`
  - `"Laboratorio"`
  - `"Trabajo de Laboratorio"`
  - `"Ensayo"`
  - `"Trabajo Escrito"`
  - `"Práctica"`
  - `"Evaluación Práctica"`
  - `"Disertación"`
  - `"Presentación"`
  - `"Proyecto"`
  - `"Taller"`
- **Obligatorio:** Sí
- **Nota:** Define el color del badge en el calendario

### 7. `indicadores_evaluacion` (string)
- **Descripción:** Criterios o indicadores que se evaluarán
- **Ejemplo:** `"Resuelve ecuaciones cuadráticas mediante diferentes métodos. Identifica y aplica propiedades algebraicas. Interpreta resultados en contextos reales."`
- **Recomendación:** Usar puntos o separadores para múltiples indicadores
- **Obligatorio:** No (pero muy recomendado)

### 8. `retroalimentacion` (string)
- **Descripción:** Información sobre cómo y cuándo se entregará la retroalimentación
- **Ejemplo:** `"Se entregará corrección detallada en clase. Refuerzo disponible en horario de consulta (martes 15:00-16:00)"`
- **Obligatorio:** No (pero recomendado)

### 9. `curso` (string)
- **Descripción:** Curso al que pertenece la evaluación
- **Formato:** `"[Nivel]° [Ciclo] [Paralelo]"`
- **Ejemplos:**
  - `"1° Medio A"`
  - `"2° Medio B"`
  - `"3° Medio C"`
  - `"4° Medio A"`
  - `"7° Básico A"`
  - `"8° Básico B"`
- **Obligatorio:** Sí
- **Nota:** Usado para el filtro por curso en el calendario

## Colores de Estrategias de Evaluación

El sistema asigna automáticamente colores según la estrategia:

| Estrategia | Color | Clase CSS |
|------------|-------|-----------|
| Prueba / Prueba Escrita | Rojo | `bg-danger text-white` |
| Oral / Examen Oral | Amarillo | `bg-warning text-dark` |
| Laboratorio / Trabajo de Laboratorio | Azul claro | `bg-info text-white` |
| Ensayo / Trabajo Escrito | Azul | `bg-primary text-white` |
| Práctica / Evaluación Práctica | Verde | `bg-success text-white` |
| Disertación / Presentación | Gris | `bg-secondary text-white` |
| Proyecto | Negro | `bg-dark text-white` |
| Taller | Morado | `bg-purple text-white` |

## Características del Calendario

### Visualización
- **Vista mensual:** Muestra todas las evaluaciones del mes
- **Vista de calendario:** Grid con días del mes (inicia en lunes)
- **Lista detallada:** Muestra información completa de cada evaluación

### Filtros
- **Por curso:** Permite filtrar evaluaciones por curso específico
- **Todos los cursos:** Opción para ver todas las evaluaciones

### Navegación
- **Mes anterior/siguiente:** Botones de navegación
- **Botón "Hoy":** Regresa al mes actual

### Información Mostrada

**En el calendario:**
- Fecha
- Asignatura (badge con color según estrategia)
- Número de evaluaciones por día

**En la lista detallada:**
- Fecha formateada (día de la semana, día, mes)
- Estrategia de evaluación (badge con color)
- Asignatura
- Profesor
- Curso
- Contenido
- Indicadores de evaluación (si está disponible)
- Retroalimentación (si está disponible)

## Ejemplo Completo

```json
[
  {
    "id": 1,
    "fecha": "2025-03-10",
    "asignatura": "Matemática",
    "profesor": "Prof. María González",
    "contenido": "Álgebra: Ecuaciones de segundo grado, factorización y sistemas de ecuaciones lineales",
    "estrategia_evaluacion": "Prueba Escrita",
    "indicadores_evaluacion": "Resuelve ecuaciones cuadráticas mediante diferentes métodos (factorización, fórmula general). Identifica y aplica propiedades algebraicas. Interpreta resultados en contextos reales.",
    "retroalimentacion": "Se entregará corrección detallada en clase. Refuerzo disponible en horario de consulta (martes 15:00-16:00)",
    "curso": "1° Medio A"
  },
  {
    "id": 2,
    "fecha": "2025-03-15",
    "asignatura": "Ciencias Naturales",
    "profesor": "Prof. Ana Martínez",
    "contenido": "Biología: La célula, estructura celular y funciones de organelos",
    "estrategia_evaluacion": "Laboratorio",
    "indicadores_evaluacion": "Reconoce estructuras celulares al microscopio. Diferencia células procariotas y eucariotas. Relaciona estructura con función de organelos.",
    "retroalimentacion": "Informe de laboratorio con observaciones. Retroalimentación práctica durante la sesión.",
    "curso": "1° Medio B"
  }
]
```

## Actualización de Datos

Para actualizar las evaluaciones:

1. Editar el archivo `data/evaluaciones.json`
2. Seguir la estructura especificada en este documento
3. Validar que el JSON sea válido (usar herramienta como JSONLint)
4. Guardar el archivo
5. El calendario cargará automáticamente los nuevos datos

## Validación JSON

Antes de guardar, verificar que:
- ✅ El archivo es un array válido `[ ... ]`
- ✅ Todos los objetos tienen los campos obligatorios
- ✅ Las fechas están en formato `YYYY-MM-DD`
- ✅ No hay comas sobrantes al final de arrays u objetos
- ✅ Las comillas están correctamente cerradas

## Manejo de Errores

Si el archivo JSON tiene errores:
- El calendario mostrará "No hay evaluaciones programadas"
- Se registrará un error en la consola del navegador
- Revisar la consola para identificar el problema específico

## Retrocompatibilidad

El sistema también soporta archivos CSV con la siguiente estructura:
```
fecha,asignatura,profesor,contenido,estrategia_evaluacion,indicadores_evaluacion,retroalimentacion,curso
2025-03-10,Matemática,Prof. María González,Álgebra...,Prueba Escrita,Resuelve ecuaciones...,Se entregará corrección...,1° Medio A
```

Para usar CSV, cambiar la extensión del archivo a `.csv` y actualizar la referencia en `calendar-evaluaciones.js`.

