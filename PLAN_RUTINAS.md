# Plan de Feature: Rutinas de Entrenamiento (Profe & Alumno)

## Objetivo

Gestionar rutinas de entrenamiento jerárquicas (macrociclo > mesociclo > microciclo > día > ejercicios/series) para que el profesor (coach) pueda crearlas, editarlas y asignarlas a los alumnos, y que los alumnos puedan visualizarlas y registrar feedback.

---

## 1. Estructura de Datos

- **Macrociclo**
  - nombre, fecha inicio/fin, mesociclos[]
- **Mesociclo**
  - nombre, microciclos[]
- **Microciclo**
  - nombre, dias[]
- **Día**
  - número, fecha, ejercicios[]
- **Ejercicio**
  - nombre, musculo, tipo, rangoReps, tempo, series[]
- **Serie**
  - reps, carga, rirEsperado, rirReal, rpeReal, observacion

> **Nota:** Por defecto, todos los microciclos de un mesociclo comparten la misma estructura de días y ejercicios. Si el profe edita un día/ejercicio, puede elegir si el cambio afecta solo ese microciclo o los siguientes.

---

## 2. Roles y Funcionalidades

### Profesor (Coach)

- Crear/editar macrociclos, mesociclos, microciclos
- Definir estructura de días y ejercicios (con lógica de herencia entre microciclos)
- Modificar ejercicios/series de un día y propagar cambios
- Asignar rutina a uno o varios alumnos

### Alumno

- Visualizar rutina asignada (mobile friendly)
- Registrar feedback: RIR/RPE real, observaciones por serie/ejercicio

---

## 3. Pantallas/Componentes

- **Gestión de Rutinas (Profe):**
  - Formulario para crear/editar rutina completa
  - Editor visual de días y ejercicios (drag & drop, duplicar día, etc.)
  - Opción de "heredar" estructura entre microciclos
- **Visualización de Rutina (Alumno):**
  - Vista mobile con navegación jerárquica y tabla de ejercicios/series
  - Inputs para feedback

---

## 4. Lógica de Herencia y Edición

- Al crear un nuevo microciclo, se copia la estructura del anterior
- Si el profe edita un día/ejercicio, puede:
  - Aplicar solo al microciclo actual
  - Aplicar a este y todos los siguientes microciclos

---

## 1. Backend Entities & Relationships (English)

### Main Entities

- **Macrocycle**
  - id, name, startDate, endDate, mesocycles[]
- **Mesocycle**
  - id, name, macrocycleId, microcycles[]
- **Microcycle**
  - id, name, mesocycleId, days[]
- **Day**
  - id, number, date, microcycleId, exercises[]
- **Exercise**
  - id, name, muscle, type, repRange, tempo, dayId, sets[]
- **Set**
  - id, reps, load, expectedRir, actualRir, actualRpe, notes, exerciseId
- **User**
  - id, name, email, role (coach|student)
- **AssignedRoutine**
  - id, userId, macrocycleId, assignedAt

### Relationships

- A Macrocycle has many Mesocycles
- A Mesocycle belongs to a Macrocycle and has many Microcycles
- A Microcycle belongs to a Mesocycle and has many Days
- A Day belongs to a Microcycle and has many Exercises
- An Exercise belongs to a Day and has many Sets
- A Set belongs to an Exercise
- A User can be a coach or a student
- An AssignedRoutine links a User (student) to a Macrocycle (routine)

> All entities should have createdAt and updatedAt fields for auditing.

---

## 5. Siguientes pasos

1. Implementar CRUD visual para el profe (estructura y ejercicios)
2. Implementar lógica de herencia/propagación de cambios
3. Visualización mobile para el alumno
4. Inputs de feedback y registro de datos

---

## 6. Consideraciones futuras

- Permitir plantillas de rutinas
- Historial de cambios y versiones
- Notificaciones a alumnos ante cambios

---

> _Este documento sirve como guía para el desarrollo de la funcionalidad de rutinas y la interacción entre profesor y alumno._
> ¡Exacto! Lo más recomendable es comenzar por el backend: definir la estructura de datos, entidades y relaciones en la base, y exponer los endpoints necesarios para que luego el frontend pueda consumirlos.

El flujo sugerido sería:

Definir entidades: Macrociclo, Mesociclo, Microciclo, Día, Ejercicio, Serie, Usuario (rol profe/alumno), RutinaAsignada.
Crear migraciones/tablas y relaciones (ej: un macrociclo tiene muchos mesociclos, etc.).
Implementar los endpoints CRUD para que el profe pueda crear/editar rutinas y asignarlas.
(Opcional) Mockear algunos datos para testear el frontend mientras se avanza.
