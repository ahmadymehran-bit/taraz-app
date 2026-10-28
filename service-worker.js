/* تاراز - Service Worker (نسخه ۲)
   استراتژی: شبکه اول (همیشه آخرین نسخه)، اگر آفلاین بود از کش استفاده می‌شود.
   /api/ و دامنه‌های خارجی کش نمی‌شوند. */
var CACHE_NAME = 'taraz-v24';
var PRECACHE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(event){
event.waitUntil(
caches.open(CACHE_NAME).then(function(cache){
return cache.addAll(PRECACHE).catch(function(e){ console.warn(e); });
})
);
self.skipWaiting();
});

self.addEventListener('activate', function(event){
event.waitUntil(
caches.keys().then(function(names){
return Promise.all(
names.filter(function(n){ return n !== CACHE_NAME; }).map(function(n){ return caches.delete(n); })
);
}).then(function(){ return self.clients.claim(); })
);
});

self.addEventListener('fetch', function(event){
var req = event.request;
if(req.method !== 'GET') return;

var url = new URL(req.url);
// فقط فایل‌های همین سایت؛ API و منابع خارجی دست نمی‌خورند
if(url.origin !== self.location.origin) return;
if(url.pathname.indexOf('/api/') === 0) return;

event.respondWith(
fetch(req).then(function(res){
if(res && res.status === 200 && res.type === 'basic'){
var copy = res.clone();
caches.open(CACHE_NAME).then(function(cache){ cache.put(req, copy); });
}
return res;
}).catch(function(){
return caches.match(req).then(function(cached){
if(cached) return cached;
if(req.mode === 'navigate') return caches.match('./index.html');
return new Response('', { status: 503, statusText: 'Offline' });
});
})
);
});

/* ============ PUSH NOTIFICATIONS ============ */
self.addEventListener('push', function(event){
var data = { title: 'تاراز', body: 'پیام جدید', icon: '/web-app-manifest-192x192.png' };

if(event.data){
try {
var parsed = event.data.json();
data.title = parsed.title || data.title;
data.body = parsed.body || data.body;
data.icon = parsed.icon || data.icon;
data.data = parsed.data || {};
} catch(e){
data.body = event.data.text();
}
}

var options = {
body: data.body,
icon: data.icon,
badge: '/web-app-manifest-192x192.png',
dir: 'rtl',
lang: 'fa',
vibrate: [200, 100, 200],
data: data.data
};

event.waitUntil(
self.registration.showNotification(data.title, options)
);
});

self.addEventListener('notificationclick', function(event){
event.notification.close();
event.waitUntil(
clients.matchAll({ type: 'window' }).then(function(clientList){
for(var i=0;i<clientList.length;i++){
var client = clientList[i];
if(client.url && 'focus' in client) return client.focus();
}
if(clients.openWindow) return clients.openWindow('/');
})
);
});
