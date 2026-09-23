importScripts(
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js"
);


firebase.initializeApp({
  apiKey: "AIzaSyAn-7j5ip1DjEzb1kzWqBTx2PeTrdrePmk",
  authDomain: "byzon-chat.firebaseapp.com",
  projectId: "byzon-chat",
  storageBucket: "byzon-chat.firebasestorage.app",
  messagingSenderId: "1023832586199",
  appId: "1:1023832586199:web:eaec8657b6f5dcd4e03d92"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log("Notificación recibida:", payload);
  
const titulo =
  payload.data?.title ||
  "Byzon Chat";
  
  const opciones = {
    body: payload.data?.body || "Tenés un nuevo mensaje",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: {
      url: "./",
      usuarioId: payload.data?.usuarioId || ""
    }
  };

  return self.registration.showNotification(
    titulo,
    opciones
  );

});


// ========================================
// TOCAR NOTIFICACIÓN
// ========================================

self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  const usuarioId =
    event.notification.data?.usuarioId || "";

  let url =
    event.notification.data?.url || "./";

  if (usuarioId) {
    url += "?chat=" + encodeURIComponent(usuarioId);
  }

  event.waitUntil(

    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(async (ventanas) => {

      // APP YA ABIERTA
      for (const ventana of ventanas) {

        ventana.postMessage({
          tipo: "ABRIR_CHAT",
          usuarioId: usuarioId
        });

        if ("focus" in ventana) {
          return ventana.focus();
        }

      }

      // APP CERRADA
      if (clients.openWindow) {
        return clients.openWindow(url);
      }

    })

  );

});

const CACHE_NAME = "byzon-chat-v1";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres
          .filter((nombre) => nombre.startsWith("byzon-chat-") && nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
