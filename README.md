# JoanVector: AI Cybersecurity Guardrail & Perimeter Threat Gateway

---

## Por que decidi construir este proyecto

Cuando me sente a pensar en este proyecto, parti de una realidad que veo todos los dias en la industria tecnologica y que me parece preocupante: vivimos en una epoca donde casi cualquier empresa quiere integrar asistentes virtuales e inteligencia artificial a sus plataformas. Sin embargo, muy pocos se detienen a analizar que implica realmente poner un modelo de lenguaje en produccion de cara a usuarios externos.

La mayoria de los desarrolladores caen en la trampa de querer ser simplemente programadores de paso: les asignan una tarea, conectan un endpoint de OpenAI o Anthropic, colocan un input en la interfaz, lo entregan rapido para cumplir con el sprint y pasan a lo siguiente. No estan viendo las enormes brechas de seguridad que dejan abiertas en el camino. No se preguntan: que pasa si un atacante aplica una inyeccion de prompt para extraer instrucciones del sistema? Que pasa si enganan al modelo para filtrar credenciales internas, datos de clientes o secretos empresariales?

Para mi, el desarrollo de software no se trata de sacar funcionalidades apresuradas sin criterio. La verdadera calidad de un producto de ingenieria radica en su robustez, en anticiparse a las amenazas y en brindar una capa solida de ciberseguridad a la empresa. 

JoanVector nacio bajo esa conviccion y mentalidad white-hat: construir un guardrail perimetral que funcione como un proxy inverso de seguridad entre el usuario final y el asistente virtual. Su mision es interceptar, analizar heuristicamente cada consulta en milisegundos, evaluar niveles de riesgo contra vectores de ataque reales (OWASP Top 10 for LLMs) y tomar decisiones de mitigacion antes de que el texto toque el contexto del modelo.

Ademas, para demostrar este principio en un escenario tangible y no quedarnos unicamente en un panel abstracto, cree **CompenHack**: una replica minimalista de un portal corporativo institucional (inspirado en la estetica de Compensar) que incorpora un asistente virtual flotante protegido directamente por JoanVector. Esto permite ver con total claridad la diferencia entre la experiencia limpia del usuario corporativo y la intervencion perimetral inmediata cuando se intenta vulnerar el sistema.

---

## Decisiones tecnicas y herramientas utilizadas

En el proceso de creacion de este proyecto seleccione herramientas especificas porque cada una responde a un proposito claro de arquitectura y rendimiento:

### 1. Backend: FastAPI (Python 3.11+)
Elegi FastAPI porque para un motor de inspeccion de seguridad la latencia es critica. Al situarse en medio de cada peticion, el guardrail no puede convertirse en un cuello de botella. Python me permitio estructurar un analizador heuristico agil basado en expresiones regulares, coincidencias difusas contra ofuscacion de texto y clasificacion de riesgo basada en pesos. Ademas, la tipificacion estricta con Pydantic y la generacion automatica de contratos OpenAPI facilitan la integracion en pipelines empresariales.

### 2. Base de datos: Persistencia Hibrida (PostgreSQL con Respaldo Automatico a SQLite)
Quise disenar una persistencia tolerante a fallos. En un entorno productivo corporativo, el sistema se conecta a PostgreSQL para manejar altos volumenes de eventos forenses y concurrencia. Sin embargo, si el servidor de Postgres no esta activo en una maquina local o estacion de trabajo, el motor detecta la indisponibilidad de forma transparente y activa una base de datos local SQLite (`guardrail_local.db`). Esto asegura que el sistema siempre este operativo desde el segundo cero, con sus tablas creadas y sus politicas precargadas.

### 3. Frontend: React, Vite y TypeScript (Arquitectura Modular por Features)
Estructure el frontend separando claramente dominios (`features/dashboard`, `features/security-rules`, `features/audit-logs`, `features/assistant-simulator`, `features/compenhack`). Para la interfaz busque crear una consola operativa seria, sobria y orientada a centros de operaciones de seguridad (SOC). Disene un layout con navegacion lateral tecnica, telemetria del gateway en tiempo real, paleta en tonos oscuros de alto contraste y tipografia monoespaciada para lectura forense, prescindiendo deliberadamente de iconografias decorativas o emojis para priorizar la densidad informativa y la concentracion del analista.

### 4. Codigo Limpio, Sin Valores Quemados y Cero Comentarios
Todo el proyecto fue refactorizado bajo una politica estricta de calidad:
- Cero comentarios en el codigo fuente: el codigo debe ser autoexplicativo a traves de nomenclatura descriptiva y tipado solido.
- Sin valores quemados: constantes criticas como direcciones IP por defecto, umbrales de riesgo, limites de paginacion y claves de almacenamiento local se encuentran centralizadas en archivos de configuracion (`config.py` en backend y `security.constants.ts` en frontend).
- Tolerancia a errores de red: interceptores de respuesta que gestionan excepciones de validacion 422 y bloqueos 403 sin desestabilizar el DOM ni interrumpir la sesion del analista.

---

## Arquitectura del Sistema

```
[ Usuario / Atacante en CompenHack o Sandbox ]
                     |
                     v (HTTP POST /api/v1/assistant/chat)
+--------------------------------------------------------------+
| JOANVECTOR PERIMETER GATEWAY                                 |
|                                                              |
| 1. Normalizacion de Payload (limpieza y normalizacion)       |
| 2. Motor Heuristico Multicapa:                               |
|    - Deteccion de Prompt Injections y Jailbreaks             |
|    - Extraccion de Prompt de Sistema (System Leaks)          |
|    - Exfiltracion de Credenciales y Secretos de Empresa      |
|    - Deteccion de Comandos SQL y Evasiones Heuristicas       |
| 3. Evaluacion de Umbrales y Scoring de Riesgo (0 a 100%)     |
| 4. Decision del Guardrail:                                   |
|    - Score >= 70%: HTTP 403 Forbidden (Bloqueo preventivo)  |
|    - Score >= 40%: HTTP 200 Flagged (Auditoria reforzada)    |
|    - Score < 40%:  HTTP 200 Pass (Trafico inocuo / seguro)   |
| 5. Registro Forense Inmutable en Base de Datos               |
+--------------------------------------------------------------+
                     |
                     +---> Si es aprobado: Inferencia al Asistente Virtual
                     +---> Si es bloqueado: Respuesta perimetral 403 mitigada
```

---

## Modulos de la Plataforma

### 1. Radar de Amenazas y Telemetria Forense
Panel centralizado que recopila el volumen de peticiones procesadas, porcentaje de mitigacion perimetral, severidad promedio y distribucion taxonomica de incidentes clasificados bajo los lineamientos del OWASP Top 10 para aplicaciones con modelos de lenguaje.

### 2. Sandbox de Evaluacion Heuristica (Simulador)
Entorno interactivo dividido en dos paneles: a la izquierda, la sesion de conversacion del asistente tal como la experimenta el cliente final; a la derecha, el inspector tecnico que expone la latencia del proxy, el desglose de reglas disparadas, las razones forenses de mitigacion y el payload JSON estructurado emitido por el backend.

### 3. Matriz de Politicas y Reglas de Ciberseguridad
Modulo administrativo con soporte CRUD completo para definir palabras clave, patrones regex o frases vigiladas. Permite asignar nivel de severidad (Baja, Media, Alta, Critica), puntaje de riesgo asignado y accion automatica (Bloquear o Alertar). Incluye un mecanismo para restablecer en cualquier momento el paquete estandar de reglas predefinidas.

### 4. Bitacora de Auditoria y Trazabilidad
Registro inmutable de cada interaccion con metadatos indispensables para analisis post-incidente: timestamp preciso, direccion IP de origen, texto integro del prompt, vectores identificados, veredicto final y respuesta generada.

### 5. Portal CompenHack (Simulacion de Web Real de Empresa)
Portal web institucional minimalista en colores corporativos (`#FF6600`) que recrea una caja de compensacion familiar con un mensaje de bienvenida directo. En la esquina inferior derecha incorpora un widget flotante de atencion al cliente conectado al gateway de JoanVector. Permite probar consultas legitimas de salud y recreacion, asi como ejecutar inyecciones de prompt para observar como el guardrail bloquea el ataque inmediatamente con estado 403 y registra el incidente en la bitacora SOC.

---

## Guia de Puesta en Marcha (Ejecucion Manual por Consola)

El proyecto esta disenado para ejecutarse de manera directa y limpia desde cualquier terminal moderna (PowerShell, Bash o CMD), sin depender exclusivamente de scripts batch.

### Requisitos Previos
- Python 3.11 o superior instalado y disponible en el PATH del sistema.
- Node.js 18 o superior y npm instalados.

---

### Paso 1: Levantar el Backend (FastAPI)

Abre una terminal en la raiz del repositorio y ejecuta:

En PowerShell (Windows):
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

En Bash (Linux / macOS / Git Bash):
```bash
cd backend
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

En Simbolo del Sistema (CMD):
```cmd
cd backend
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

El servidor quedara a la escucha en:
- API Base: `http://localhost:8000`
- Documentacion interactiva Swagger: `http://localhost:8000/docs`
- Chequeo de salud del gateway: `http://localhost:8000/health`

---

### Paso 2: Levantar la Consola Frontend (React + Vite)

En una segunda pestana o terminal:

En PowerShell / Bash / CMD:
```bash
cd frontend
npm run dev
```

La consola quedara disponible en:
- Aplicacion Web: `http://localhost:5173`

---

## Configuracion de Base de Datos (Opcional)

Por defecto, JoanVector utiliza de manera autonoma la base de datos local SQLite (`backend/guardrail_local.db`), la cual se inicializa y siembra automaticamente en el primer arranque.

Si deseas conectar una instancia de PostgreSQL:
1. Asegurate de tener una base de datos creada (por ejemplo, `ai_guardrail_db`).
2. Configura el archivo `backend/.env` tomando como referencia `backend/.env.example`:
```env
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_contraseña_aqui
POSTGRES_DB=ai_guardrail_db
POSTGRES_PORT=5432
DATABASE_URL=
DEFAULT_RISK_THRESHOLD=40
CRITICAL_RISK_THRESHOLD=70
BLOCK_ON_CRITICAL=True
```
3. El sistema priorizara PostgreSQL y mantendra SQLite unicamente como contingencia automatica si PostgreSQL no esta disponible.

---

## Reflexion Final

JoanVector representa el estandar que considero indispensable para cualquier desarrollo de software actual: la inteligencia artificial debe implementarse con responsabilidad, trazabilidad y defensas perimetrales reales. Desarrollar rapido no tiene valor si el sistema es vulnerable; la verdadera excelencia tecnica reside en entregar valor con calidad, arquitectura limpia y proteccion integral.
