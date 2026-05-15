const CACHE_NAME = 'darb-almuslim-v1';

// الملفات اللي تحفظها التطبيق للعمل بدون إنترنت
const urlsToCache = [
  './athkar.html',
  './manifest.json'
];

// عند تثبيت الـ Service Worker — احفظ الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('تم حفظ الملفات للاستخدام بدون إنترنت');
      return cache.addAll(urlsToCache);
    })
  );
});

// عند كل طلب — ابحث في الكاش أولاً
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // إذا الملف موجود في الكاش، أرجعه
      if (response) return response;
      // إذا لا، اطلبه من الإنترنت
      return fetch(event.request);
    })
  );
});

// عند التحديث — احذف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});
