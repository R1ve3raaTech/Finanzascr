// Passthrough sin caché: no cambia cómo carga la app, pero un listener de
// "fetch" es parte de lo que algunos navegadores revisan para decidir si
// ofrecer el prompt de instalación (el resto del criterio — manifest válido,
// íconos, HTTPS — ya estaba).
self.addEventListener("fetch", () => {});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "finanzascr", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/dashboard"));
});
