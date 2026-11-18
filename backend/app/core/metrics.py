from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

# Métricas HTTP estándar (Requeridas por rúbrica: Contador, Latencia y Gauge)
REQUESTS_TOTAL = Counter(
    'http_requests_total',
    'Total de peticiones HTTP procesadas por la API',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'Duracion y latencia de peticiones HTTP en segundos',
    ['endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Numero de peticiones concurrentes activas procesandose en la API'
)

# Métricas propias del motor de Inteligencia Artificial (Requerido por rúbrica)
AI_INFERENCES_TOTAL = Counter(
    'joanvector_ai_inferences_total',
    'Numero total de analisis e inferencias ejecutadas por el agente de IA'
)

AI_THREATS_IDENTIFIED = Counter(
    'joanvector_ai_threats_identified_total',
    'Numero total de amenazas maliciosas clasificadas y neutralizadas por la IA'
)

THREAT_RISK_GAUGE = Gauge(
    'joanvector_threat_risk_gauge',
    'Puntaje de riesgo (0 a 100) asignado al ultimo prompt analizado por la IA'
)
