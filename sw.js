// 씨줄 모바일 — 앱 껍데기만 기억한다. 원고(구글드라이브)는 늘 새로 읽는다.
const CACHE = "seejul-m-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const page = e.request.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith(".html");
  if (page) {
    // 화면은 새것 먼저 — 못 받으면 기억해 둔 것
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const c = r.clone();
          caches.open(CACHE).then((x) => x.put(e.request, c));
          return r;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match("./"))),
    );
    return;
  }
  // 파일 이름에 해시가 붙은 것들 — 기억해 둔 것 먼저
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((r) => {
          if (r.ok) {
            const c = r.clone();
            caches.open(CACHE).then((x) => x.put(e.request, c));
          }
          return r;
        }),
    ),
  );
});
