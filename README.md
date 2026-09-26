# JoanVector: AI Cybersecurity Guardrail & Perimeter Threat Gateway

---

## Por qué decidí construir este proyecto

Cuando me senté a pensar en este proyecto, partí de una realidad que veo todos los días en la industria tecnológica y que me parece preocupante: vivimos en una época donde casi cualquier empresa quiere integrar asistentes virtuales e inteligencia artificial a sus plataformas. Sin embargo, muy pocos se detienen a analizar qué implica realmente poner un modelo de lenguaje en producción de cara a usuarios externos.

La mayoría de los desarrolladores caen en la trampa de querer ser simplemente programadores de paso: les asignan una tarea, conectan un endpoint de OpenAI o Anthropic, colocan un input en la interfaz, lo entregan rápido para cumplir con el sprint y pasan a lo siguiente. No están viendo las enormes brechas de seguridad que dejan abiertas en el camino. No se preguntan: ¿qué pasa si un atacante aplica una inyección de prompt para extraer instrucciones del sistema? ¿Qué pasa si engañan al modelo para filtrar credenciales internas, datos de clientes o secretos empresariales?

Para mí, el desarrollo de software no se trata de sacar funcionalidades apresuradas sin criterio. La verdadera calidad de un producto de ingeniería radica en su robustez, en anticiparse a las amenazas y en brindar una capa sólida de ciberseguridad a la empresa. 

JoanVector nació bajo esa convicción y mentalidad white-hat: construir un guardrail perimetral que funcione como un proxy inverso de seguridad entre el usuario final y el asistente virtual. Su misión es interceptar, analizar heurísticamente cada consulta en milisegundos, evaluar niveles de riesgo contra vectores de ataque reales (OWASP Top 10 for LLMs) y tomar decisiones de mitigación antes de que el texto toque el contexto del modelo.

---

## Decisiones técnicas y herramientas utilizadas

En el proceso de creación de este proyecto seleccioné herramientas específicas porque cada una responde a un propósito claro de arquitectura y rendimiento:

### 1. Backend: FastAPI (Python 3.11+)
Elegí FastAPI porque para un motor de inspección de seguridad la latencia es crítica. Al situarse en medio de cada petición, el guardrail no puede convertirse en un cuello de botella. Python me permitió estructurar un analizador heurístico ágil basado en expresiones regulares, coincidencias difusas contra ofuscación de texto y clasificación de riesgo basada en pesos. Además, la tipificación estricta con Pydantic y la generación automática de contratos OpenAPI facilitan la integración en pipelines empresariales.

### 2. Base de datos: Persistencia Híbrida (PostgreSQL con Respaldo Automático a SQLite)
Quise diseñar una persistencia tolerante a fallos. En un entorno productivo corporativo, el sistema se conecta a PostgreSQL para manejar altos volúmenes de eventos forenses y concurrencia. Sin embargo, si el servidor de Postgres no está activo en una máquina local o estación de trabajo, el motor detecta la indisponibilidad de forma transparente y activa una base de datos local SQLite (`guardrail_local.db`). Esto asegura que el sistema siempre esté operativo desde el segundo cero, con sus tablas creadas y sus políticas precargadas.

### 3. Frontend: React, Vite y TypeScript (Consola SOC)
Para la interfaz no quería el típico prototipo genérico o recargado. Busqué crear una consola operativa seria, sobria y orientada a centros de operaciones de seguridad (SOC). Diseñé un layout con navegación lateral técnica, telemetría del gateway en tiempo real, paleta en tonos oscuros de alto contraste y tipografía monoespaciada para lectura forense, prescindiendo deliberadamente de iconografías decorativas innecesarias para priorizar la densidad informativa y la concentración del analista.

---

## Arquitectura del Sistema

```
[ Usuario / Atacante ]
         |
         v (HTTP POST /api/v1/assistant/chat)
+--------------------------------------------------------------+
| JOANVECTOR PERIMETER GATEWAY                                 |
|                                                              |
| 1. Normalización de Payload (limpieza de saltos y espacios)  |
| 2. Motor Heurístico Multicapa:                               |
|    - Detección de Prompt Injections y Jailbreaks             |
|    - Extracción de Prompt de Sistema (System Leaks)          |
|    - Exfiltración de Credenciales y Secretos de Empresa      |
|    - Manipulación de Roles y Evasión Heurística              |
| 3. Evaluación de Umbrales y Scoring de Riesgo (0 a 100%)     |
| 4. Decisión del Guardrail:                                   |
|    - Score >= 70%: HTTP 403 Forbidden (Bloqueo preventivo)  |
|    - Score >= 40%: HTTP 200 Flagged (Auditoría reforzada)    |
|    - Score < 40%:  HTTP 200 Pass (Tráfico inocuo / seguro)   |
| 5. Registro Forense Inmutable en Base de Datos               |
+--------------------------------------------------------------+
         |
         +---> Si es aprobado: Inferencia al Asistente Virtual
         +---> Si es bloqueado: Respuesta mitigada de denegación
```

---

## Módulos de la Plataforma

### 1. Radar de Amenazas y Telemetría Forense
Panel centralizado que recopila el volumen de peticiones procesadas, porcentaje de mitigación perimetral, severidad promedio y distribución taxonómica de incidentes clasificados bajo los lineamientos del OWASP Top 10 para aplicaciones con modelos de lenguaje.

### 2. Sandbox de Evaluación Heurística (Simulador)
Entorno interactivo dividido en dos paneles: a la izquierda, la sesión de conversación del asistente tal como la experimenta el cliente final; a la derecha, el inspector técnico que expone la latencia del proxy, el desglose de reglas disparadas, las razones forenses de mitigación y el payload JSON estructurado emitido por el backend.

### 3. Matriz de Políticas y Reglas de Ciberseguridad
Módulo administrativo con soporte CRUD completo para definir palabras clave, patrones regex o frases vigiladas. Permite asignar nivel de severidad (Baja, Media, Alta, Crítica), puntaje de riesgo asignado y acción automática (Bloquear o Alertar). Incluye un mecanismo para restablecer en cualquier momento el paquete estándar de reglas predefinidas.

### 4. Bitácora de Auditoría y Trazabilidad
Registro inmutable de cada interacción con metadatos indispensables para análisis post-incidente: timestamp preciso, dirección IP de origen, texto íntegro del prompt, vectores identificados, veredicto final y respuesta generada.

---

## Guía de Puesta en Marcha (Sin Scripts Batch)

El proyecto está diseñado para ejecutarse de manera directa y limpia desde cualquier consola moderna (Bash, PowerShell o Símbolo del Sistema), sin depender de archivos de lote (`.bat`).

### Requisitos Previos
- Python 3.11 o superior instalado y disponible en el PATH del sistema.
- Node.js 18 o superior y npm instalados.

---

### Paso 1: Levantar el Backend (FastAPI)

Abre tu terminal en la raíz del repositorio y accede a la carpeta del backend:

En entornos Bash (Git Bash, macOS, Linux):
```bash
cd backend
./venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

En entornos PowerShell (Windows):
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

En Símbolo del Sistema (CMD):
```cmd
cd backend
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

El servidor quedará a la escucha en:
- API Base: `http://localhost:8000`
- Documentación interactiva Swagger: `http://localhost:8000/docs`
- Chequeo de estado: `http://localhost:8000/health`

---

### Paso 2: Levantar la Consola Frontend (React + Vite)

En una segunda pestaña o ventana de tu terminal:

En Bash / PowerShell / CMD:
```bash
cd frontend
npm run dev
```

La consola se desplegará en:
- Aplicación Web: `http://localhost:5173`

---

## Configuración de Base de Datos (Opcional)

Por defecto, JoanVector utiliza de manera autónoma la base de datos local SQLite (`backend/guardrail_local.db`), la cual se inicializa y siembra automáticamente en el primer arranque.

Si deseas utilizar una instancia productiva de PostgreSQL:
1. Asegúrate de tener una base de datos creada (por ejemplo, `ai_guardrail_db`).
2. Crea un archivo `.env` dentro de la carpeta `backend/` tomando como referencia `.env.example`:
```env
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_contraseña_aqui
POSTGRES_DB=ai_guardrail_db
POSTGRES_PORT=5432
```
3. El sistema priorizará la conexión a PostgreSQL y mantendrá SQLite únicamente como contingencia.

---

## Reflexión Final

JoanVector representa el estándar que considero indispensable para cualquier desarrollo de software actual: la inteligencia artificial debe implementarse con responsabilidad, trazabilidad y defensas perimetrales reales. Desarrollar rápido no tiene valor si el sistema es vulnerable; la verdadera excelencia técnica reside en entregar valor con calidad y protección integral.
