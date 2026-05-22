const VERSION = "digital-links-v2";
const STATIC_CACHE = `${VERSION}-static`;
const IMAGE_CACHE = `${VERSION}-images`;
const SHELL_CACHE = `${VERSION}-shell`;

const shellAssets = ["/", "/index.html", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(shellAssets)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const isFrameAsset = (url) =>
  url.pathname.includes("/frames/") || url.pathname.includes("/Apple_Frame/") || url.pathname.includes("/apple_frames/");

const isStaticAsset = (url) =>
  url.pathname.endsWith(".js") ||
  url.pathname.endsWith(".css") ||
  url.pathname.endsWith(".mp4") ||
  url.pathname.endsWith(".webm") ||
  url.pathname.endsWith(".woff") ||
  url.pathname.endsWith(".woff2") ||
  isFrameAsset(url);

const isImage = (request, url) =>
  request.destination === "image" ||
  url.pathname.includes("/uploads/") ||
  url.pathname.endsWith(".jpg") ||
  url.pathname.endsWith(".jpeg") ||
  url.pathname.endsWith(".png") ||
  url.pathname.endsWith(".webp") ||
  url.hostname.includes("images.unsplash.com");

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fresh = fetch(request)
    .then((response) => {
      if (response.ok || response.type === "opaque") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (request.headers.has("range")) return;

  const url = new URL(request.url);
  const isAllowedOrigin = url.origin === self.location.origin || url.hostname.includes("images.unsplash.com");
  if (!isAllowedOrigin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isImage(request, url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  }
});
