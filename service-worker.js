var CACHE_NAME = 'taraz-v1';
var urlsToCache = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(event){
event.waitUntil(caches.open(CACHE_NAME).then(function(cache){
return cache.addAll(urlsToCache).catch(function(e){ console.warn(e); });
}));
self.skipWaiting();
});

self.addEventListener('activate', function(event){
event.waitUntil(caches.keys().then(function(names){
return Promise.all(names.filter(function(n){ return n !== CACHE_NAME; }).map(function(n){ return caches.delete(n); }));
}));
self.clients.claim();
});

self.addEventListener('fetch', function(event){
if(event.request.method !== 'GET') return;
if(event.request.url.indexOf('/api/') >= 0) return;
if(event.request.url.indexOf('liara.run') >= 0) return;
if(event.request.url.indexOf('ibb.co') >= 0) return;

event.respondWith(caches.match(event.request).then(function(response){
if(response) return response;
return fetch(event.request).then(function(res){
if(!res || res.status !== 200 || res.type !== 'basic') return res;
var resClone = res.clone();
caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, resClone); });
return res;
}).catch(function(){ return caches.match('./index.html'); });
}));
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
