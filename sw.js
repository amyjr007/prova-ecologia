/* Service worker da 1ª Avaliação de Ciências (Ecologia Básica) — E.E. Feliz Lusitânia.
   Ao publicar uma versão nova da prova, troque o número em CACHE: é ele que
   descarta o pacote antigo e obriga os Chromebooks a baixar o conteúdo novo. */
const CACHE = "prova-fl-ecologia-v1";
/* Cada prova tem o seu prefixo: a limpeza abaixo só apaga versões antigas desta
   prova e não derruba o pacote offline das outras avaliações do mesmo site. */
const PREFIXO = "prova-fl-ecologia-";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // cada item vai sozinho: um arquivo ausente não derruba a instalação inteira
      .then(c => Promise.allSettled(ARQUIVOS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(
        nomes.filter(n => n.startsWith(PREFIXO) && n !== CACHE).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if(req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Página: rede primeiro, para a turma receber a prova corrigida assim que
  // houver internet; sem rede, cai no pacote guardado e a prova abre offline.
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req)
        .then(res => {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copia));
          return res;
        })
        .catch(() => caches.match("./index.html", {ignoreSearch:true})
                       .then(r => r || caches.match("./")))
    );
    return;
  }

  // Ícones e manifest: cache primeiro, que não mudam entre provas.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if(res && res.ok){
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return res;
    }))
  );
});
