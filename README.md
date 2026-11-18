# JoanVector v3.0 - Plataforma de Ciberseguridad Defensiva

Esta es la evolución del proyecto donde integré **monitoreo en tiempo real con Prometheus y Grafana**, despliegue orquestado en **Kubernetes**, autenticación segura mediante **JWT** y un módulo propio de **Inteligencia Artificial** enfocado en ciberseguridad.

---

## Qué contiene esta entrega

1. **Monitoreo y Observabilidad:**
   * Endpoint `/metrics` nativo en FastAPI usando `prometheus-client`.
   * Contadores de peticiones (`http_requests_total`), histogramas de latencia (`http_request_duration_seconds`) y medidores de conexiones y riesgo.
   * Contenedores de Prometheus (puerto 9090) y Grafana (puerto 3001).
   * Script automatizado de tráfico (`scripts/generate_traffic.py`) para generar curvas y gráficas en vivo durante la sustentación.

2. **Orquestación en Kubernetes (`/k8s`):**
   * Despliegue del backend con **2 réplicas**, sondas de vida y preparación (`livenessProbe` y `readinessProbe`) y límites estrictos de CPU y memoria.
   * `ConfigMap` para variables públicas y `Secret` para contraseñas y llaves de firma.
   * Autoescalado horizontal (`HorizontalPodAutoscaler` - HPA) que escala de 2 a 6 pods bajo carga alta.
   * Enrutamiento con `Ingress` y servicios `NodePort`.

3. **Autenticación en la API:**
   * Tokens **JWT Bearer** con contraseñas encriptadas en PBKDF2-SHA256.
   * Endpoints de modificación de reglas (`POST/PUT/DELETE /rules`) blindados con autenticación.
   * Consultas de lectura (`GET /rules`) públicas para cumplir con la rúbrica.
   * Usuario de prueba precargado: `analista` / `Password123!`.

4. **Inteligencia Artificial en Ciberseguridad:**
   * Agente SOC que analiza prompts sospechosos en lenguaje natural, identifica la técnica según **OWASP LLM Top 10** y **MITRE ATT&CK**, y sintetiza una regla de mitigación con un solo clic.
   * Documentación completa en [`docs/ia.md`](docs/ia.md).

---

## Cómo ejecutar el proyecto paso a paso

### Opción 1: Ejecución local rápida con un clic (Desarrollo y pruebas)
1. Haz doble clic en el archivo `start_all.bat` ubicado en la raíz.
2. Esto levantará automáticamente:
   * **Frontend:** [http://localhost:5173](http://localhost:5173)
   * **API Backend:** [http://localhost:8000](http://localhost:8000)
   * **Documentación interactiva Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
   * **Métricas crudas de Prometheus:** [http://localhost:8000/metrics](http://localhost:8000/metrics)

---

### Opción 2: Todo el stack en Docker Compose (Recomendado para demo con Grafana)
Para levantar PostgreSQL, Backend, Frontend, Prometheus y Grafana en simultáneo:

```bash
docker-compose up --build
```

**Accesos del ecosistema:**
* **Frontend Web:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:8000](http://localhost:8000)
* **Prometheus UI:** [http://localhost:9090](http://localhost:9090)
* **Grafana Dashboards:** [http://localhost:3001](http://localhost:3001) *(Usuario: `admin` / Contraseña: `admin`)*

---

### Opción 3: Despliegue en clúster de Kubernetes (Minikube / Docker Desktop / kind)

1. Verificar que el clúster local esté activo:
   ```bash
   kubectl cluster-info
   ```

2. Aplicar los manifiestos en orden:
   ```bash
   kubectl apply -f k8s/01-configmap.yaml
   kubectl apply -f k8s/02-secret.yaml
   kubectl apply -f k8s/03-postgres.yaml
   kubectl apply -f k8s/04-backend.yaml
   kubectl apply -f k8s/05-frontend.yaml
   kubectl apply -f k8s/06-hpa.yaml
   kubectl apply -f k8s/07-ingress.yaml
   ```

3. Comprobar que los pods y réplicas estén corriendo:
   ```bash
   kubectl get pods -l app=joanvector-backend
   kubectl get svc
   kubectl get hpa
   ```

---

## Cómo hacer la demostración en la sustentación oral

1. **Iniciar sesión:** En el frontend, haz clic en `[INICIAR SESIÓN / REGISTRO]`, pulsa el botón `Autocompletar` (`analista` / `Password123!`) y entra al gateway.
2. **Probar la Inteligencia Artificial:** Ve a la pestaña `[05] AI SOC`, selecciona un preset de ataque (ej. *Jailbreak*), presiona `[INICIAR EVALUACIÓN FORENSE CON IA]` y luego `[APLICAR REGLA EN EL GATEWAY]`.
3. **Generar tráfico en vivo para Grafana:**
   En una terminal separada corre:
   ```bash
   python scripts/generate_traffic.py
   ```
   Verás las peticiones fluyendo en consola y cómo las gráficas de Prometheus/Grafana suben en tiempo real.
