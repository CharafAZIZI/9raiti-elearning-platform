export const environment = {
  production: false,

  apiUrl: 'http://localhost:9000/api',

  // URL directe vers le notification-service (bypass Ocelot pour les SSE)
  notificationUrl: 'http://localhost:8083/api',
  // API Spring Boot (catégories, modules, cours) — port 8080
  // En développement, le proxy Angular redirige /spring-api → http://localhost:8080
  // springApiUrl: 'http://localhost:9000/api',
  googleClientId: '212429201182-nau1rp4g1f8kjcvibfv3e6cb8mhpobua.apps.googleusercontent.com'
};