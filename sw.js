const CACHE="nahians-schedule-cache-v36";
const FILES=["./","./index.html","./styles.css","./app.js","./full-time-students.js","./prayer-times.js","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(FILES.map(file=>new Request(file,{cache:"reload"}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

// Always check the network first for page navigations so users receive the
// latest dashboard branding and app shell. Fall back to the cached page offline.
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==location.origin)return;

  if(request.mode==="navigate"){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            event.waitUntil(caches.open(CACHE).then(cache=>cache.put("./index.html",copy)));
          }
          return response;
        })
        .catch(async()=>{
          const cache=await caches.open(CACHE);
          return (await cache.match(request,{ignoreSearch:true}))||cache.match("./index.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async cache=>{
      const cached=await cache.match(request);
      if(cached)return cached;
      const response=await fetch(request);
      if(response.ok)await cache.put(request,response.clone());
      return response;
    })
  );
});
