// sw.js

const CACHE_NAME = 'busstop-cache-v2'; // Versão do cache atualizada
const urlsToCache = [
  '/',
  // HTML Pages
  '/pages/index/index.html',
  '/pages/esqueceuSenha/esqueceuSenha.html',
  '/pages/linhas/linhas.html',
  '/pages/loginCadastro/loginCadastro.html',
  '/pages/perfil/perfil.html',
  '/pages/recarga/recarga.html',
  '/pages/renovacao/renovacao.html',
  
  // CSS Files
  '/pages/index/index.css',
  '/pages/esqueceuSenha/esqueceuSenha.css',
  '/pages/linhas/linhas.css',
  '/pages/loginCadastro/loginCadastro.css',
  '/pages/perfil/perfil.css',
  '/pages/recarga/recarga.css',
  '/pages/renovacao/renovacao.css',

  // JS Files
  '/pages/loginCadastro/auth.js',
  '/pages/loginCadastro/loginCadastro.js',
  '/pages/perfil/perfil.js',
  '/pages/recarga/recarga.js',
  
  // External
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
  // Você também pode adicionar aqui imagens importantes do /assets/images/
];

// Evento de Instalação: Salva os arquivos essenciais em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Fetch: Intercepta as requisições (Cache First Strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna a resposta do cache
        if (response) {
          return response;
        }
        // Se não, faz a requisição à rede
        return fetch(event.request);
      }
    )
  );
});

// Evento de Ativação: Limpa caches antigos (opcional, mas boa prática)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

