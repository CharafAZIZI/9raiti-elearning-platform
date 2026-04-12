export const environment = {
  production: false,

  // API .NET (authentification, profil, admin users) — port 5000
  // En développement, le proxy Angular (/proxy.conf.json) redirige /api → http://localhost:5000
  apiUrl: 'http://localhost:9000/api',
  // API Spring Boot (catégories, modules, cours) — port 8080
  // En développement, le proxy Angular redirige /spring-api → http://localhost:8080
  springApiUrl: 'http://localhost:9000/spring-api',
  googleClientId: '212429201182-nau1rp4g1f8kjcvibfv3e6cb8mhpobua.apps.googleusercontent.com'
};
