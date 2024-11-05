# Reto 4 Cineboot: Sistema de Reserva de Cine

Desarrollar una aplicación web fullstack para la gestión de películas y reserva
de asientos de cine. El sistema tendrá dos vistas principales: un panel de
administración para gestionar películas y una interfaz de usuario para reservar
asientos.

## Requisitos Técnicos

Backend: Deno + Hono Base de datos: PostgreSQL Frontend: HTML renderizado desde
hono, CSS, JavaScript (vanilla)

## Funcionalidades Principales

#### Panel de Administración

- CRUD completo de películas
- Gestión de salas (cantidad de salas/numero de asientos de cada sala)

#### Sistema de Reservas

- Listado de películas disponibles
- Vista detallada de película:
- Selección de horario
- Indicador de precio total
- Disponibilidad de asientos (numero)

#### Proceso de reserva:

- Formulario de datos del cliente
- Confirmación de reserva
- Generación de código de reserva

## Objetivos de Aprendizaje

1. Backend con Deno:

- Configuración del entorno
- Uso de Hono como framework web
- Manejo de rutas y middleware
- Conexión con PostgreSQL

2. Base de Datos:

- Diseño de esquema relacional
- Manejo de transacciones
- Optimización de consultas

3. Frontend:

- Manipulación del DOM
- Gestión del estado de la aplicación
- Comunicación asíncrona con el backend
- Validación de formularios

## Bonus

1. Seleccion interactiva del asiento (incluye mostrar como ocupado los asientos
   tomados)
2. Definicion individual de las salas como una grilla de asientos
3. Generación de tickets en PDF
4. Docker Compose para el entorno de desarrollo
