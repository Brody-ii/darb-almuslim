const CACHE_NAME = 'darb-almuslim-v3'; // تم تغيير الإصدار لضمان تحديث الكاش

// الملفات الأساسية التي يجب حفظها فور تثبيت التطبيق
const urlsToCache = [
  './', // الصفحة الرئيسية
  './index.html', // اسم ملفك (تأكد أن هذا هو اسم الملف الفعلي عندك)
  './manifest.json',
  'https://cdn.tailwindcss.com', // مكتبة التصميم
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&family=Amiri&display=swap' // الخطوط
];

// عند تثبيت الـ Service Worker — احفظ الملفات الأساسية
self.addEventListener('install', event => {
  self.skipWaiting(); // تفعيل النسخة الجديدة فوراً
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('تم حفظ الملفات الأساسية للاستخدام بدون إنترنت');
      return cache.addAll(urlsToCache);
    })
  );
});

// عند كل طلب — استراتيجية (Cache First ثم Network ثم Dynamic Caching)
self.addEventListener('fetch', event => {
  // نتجاهل أي طلبات ليست GET (مثل POST أو PUT)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      // 1. إذا الملف أو البيانات (مثل السورة) موجودة في الكاش، أرجعها فوراً
      if (response) {
        return response;
      }

      // 2. إذا لم تكن موجودة، اطلبها من الإنترنت
      return fetch(event.request).then(networkResponse => {
        // التحقق من أن الاستجابة صحيحة
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        // 3. أخذ نسخة من البيانات الجديدة (مثل سورة جديدة فتحها المستخدم) وحفظها في الكاش للمرات القادمة
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // في حال انقطاع الإنترنت والملف غير موجود في الكاش
        console.log('لا يوجد اتصال بالإنترنت والملف غير مخزن.');
      });
    })
  );
});

// عند التحديث — احذف الكاش القديم لتوفير مساحة وتحديث التطبيق
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});
