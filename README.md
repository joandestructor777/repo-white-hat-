# SentryGuard AI • AI Security Gateway & Reverse Proxy Firewall

¡Hola! Este repositorio contiene el desarrollo completo de mi proyecto de ciberseguridad enfocado en la protección y auditoría de asistentes virtuales en aplicaciones web. 

---

## 💡 ¿Por qué decidí hacer esto y por qué es un proyecto interesante?

La verdad es que **es un proyecto interesante** porque hoy en día casi cualquier página web le está metiendo un chatbot con inteligencia artificial para atender a los usuarios, pero casi nadie se está preocupando por la seguridad detrás de eso. 

En lo que estuvimos investigando, **nos pareció en el procedimiento que hicimos** que la gran mayoría de empresas cometen el error de conectar su página web directamente con el modelo de IA. Un usuario con malas intenciones puede aprovecharse de esto para sacarle información confidencial al asistente: desde las instrucciones internas con las que fue programado (*system prompt*), hasta contraseñas de bases de datos, claves de API (`api_key`) o incluso intentar inyecciones SQL simuladas.

**Me parece que** confiar ciegamente en que el modelo de IA "se va a portar bien" o "va a respetar las reglas que le dimos en texto" es un error grave en ciberseguridad. Por eso **lo veo útil** y necesario crear una capa intermedia: un *Security Gateway* o *Reverse Proxy* que se pare justo en la mitad entre la página web y el asistente. De esta forma, cada mensaje que el usuario escribe es inspeccionado en milisegundos, evaluado contra una base de datos de reglas y palabras clave peligrosas en **PostgreSQL**, y si detecta algo raro, lo frena de golpe antes de que comprometa la aplicación.

---

## 🛠️ ¿Cómo lo construí? (Estructura y Tecnologías)

Quise hacer las cosas bien desde el inicio, separando claramente el backend del frontend y organizando el código de forma limpia y mantenible:

### 🐍 Backend (FastAPI + PostgreSQL en Python)
* **Motor de Inspección (`app/core/security_engine.py`):** **Nos pareció en el procedimiento que hicimos** que los atacantes nunca escriben las palabras prohibidas de forma normal; suelen meter espacios entre letras (como `s y s t e m`), cambiar acentos o usar mayúsculas raras para intentar engañar a los validadores típicos. Por eso creé un motor heurístico que normaliza el texto, desofusca los caracteres y evalúa expresiones regulares para calcular un puntaje de riesgo de 0 a 100%.
* **CRUD de Reglas y Políticas en PostgreSQL (`app/models/rule.py`):** **Me parece interesante** que las reglas no estén fijas en el código. Las guardé en una base de datos relacional para que cualquier administrador pueda entrar, crear una nueva palabra clave sospechosa, cambiarle la severidad (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) o desactivarla con un clic sin tener que reiniciar los servidores.
* **Auditoría Forense (`app/models/audit_log.py`):** Cada petición que entra se guarda de forma inmutable con su fecha, la IP del cliente, el prompt evaluado, las palabras detectadas y el dictamen técnico. Esto **lo veo útil** especialmente para auditorías de seguridad reales tipo ISO 27001 o SOC 2.

### ⚛️ Frontend (React 19 + TypeScript + Vite + Tailwind CSS)
* **Arquitectura basada en Features:** Organicé las carpetas por funcionalidades desacopladas (`features/dashboard`, `features/assistant-simulator`, `features/security-rules`, `features/audit-logs`, además de `constants/`, `components/` y `shared/`). **Me parece que** esta es la forma más profesional de escalar un proyecto frontend.
* **Diseño e Identidad:** Quería que tuviera una estética moderna y seria, en tonos negros profundos y blancos de alto contraste, estilo herramientas de desarrollo reales (*como Linear o Datadog*), alejándome de diseños genéricos. Además, le integré mi propio **icono de hacker** oficial en el header y habilité la opción para subir la foto real de usuario desde el computador para personalizar los mensajes del chat.

---

## 📋 ¿Qué vas a encontrar en la aplicación?

1. **Métricas & SOC (Dashboard):** Muestra el resumen de telemetría en tiempo real: cuántas peticiones se han analizado, la tasa de amenazas bloqueadas, el riesgo promedio y la distribución de ataques según la taxonomía oficial de **OWASP LLM Top 10**.
2. **Playground & Inspector (La prueba en vivo):**
   * A la izquierda tienes la consola del asistente virtual para interactuar o probar ataques.
   * A la derecha tienes el **Inspector de Telemetría** en tiempo real: te muestra el veredicto (`HTTP 200 OK` vs `HTTP 403 FORBIDDEN`), el medidor de riesgo, las reglas que hicieron match y una pestaña con el **JSON crudo** devuelto por la API con botón para copiarlo.
   * En la parte superior incluí una barra con escenarios preconfigurados basados en **OWASP-LLM01, OWASP-LLM06 y CWE-89** para poder probar ataques con 1 solo clic frente a evaluadores.
3. **Políticas de Seguridad (CRUD):** Tabla completa donde puedes crear, buscar, editar y borrar palabras clave prohibidas, además de un botón para restaurar las 15 políticas base de OWASP.
4. **Logs de Auditoría:** Historial forense de todas las peticiones con modal de análisis detallado.

---

## 🚀 Cómo correr el proyecto en tu máquina

Dejé todo listo para que levantarlo sea lo más fácil posible:

### Opción 1: En 1 solo clic (El más cómodo)
Doble clic en el archivo raíz:
```bat
start_all.bat
```
Este script abre dos ventanas automáticamente:
* **Frontend Web:** [http://localhost:5173](http://localhost:5173)
* **Documentación Interactiva Swagger (FastAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)

### Opción 2: Manual por consolas

#### 1. Levantar el Backend:
```bash
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Levantar el Frontend:
```bash
cd frontend
npm run dev
```

---

## 💭 Reflexión final del desarrollo

Al final, **me parece que** este proyecto demuestra cómo la seguridad en inteligencia artificial tiene que abordarse desde la ingeniería de software y la ciberseguridad aplicada. **Nos pareció en el procedimiento que hicimos** que no basta con pedirle "amablemente" a un chatbot que guarde secretos; tener una pasarela perimetral con reglas en PostgreSQL y análisis en tiempo real es lo que de verdad protege a una aplicación corporativa en producción.
