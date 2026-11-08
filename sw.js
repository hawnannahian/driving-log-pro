const CACHE="nahians-schedule-cache-v89";
const FILES=["./","./index.html","./styles.css","./app.js","./reports-dashboard.js","./islamic-content.js","./islamic.js","./full-time-students.js","./prayer-times.js","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png","./travel-dua.mp3","./ayatul-kursi.mp3","./three-quls.mp3","./surah-al-kahf-1-10-alafasy.mp3","./dua-leaving-home.mp3","./dua-long-journey.mp3","./dua-new-place.mp3","./quran-17-80-alafasy.mp3","./dhikr-return-journey.mp3","./istighfar-hadith.mp3","./durood-ibrahim.mp3"];

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

  // Audio players ask for byte ranges (Safari requires 206 answers). Serve those from the cached file so the
  // Travel Dua plays offline; fall back to the network when the file is not cached yet.
  if(request.headers.has("range")){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE),full=await cache.match(request.url,{ignoreSearch:true});
      if(!full)return fetch(request);
      const buf=await full.arrayBuffer(),size=buf.byteLength,m=/bytes=(\d*)-(\d*)/.exec(request.headers.get("range")||"");
      let start=0,end=size-1;
      if(m&&m[1]){start=Number(m[1]);if(m[2])end=Math.min(Number(m[2]),size-1);}else if(m&&m[2]){start=Math.max(0,size-Number(m[2]));}
      if(start>=size)return new Response(null,{status:416,headers:{"Content-Range":`bytes */${size}`}});
      return new Response(buf.slice(start,end+1),{status:206,headers:{"Content-Type":full.headers.get("Content-Type")||"audio/mpeg","Content-Range":`bytes ${start}-${end}/${size}`,"Content-Length":String(end-start+1),"Accept-Ranges":"bytes"}});
    })());
    return;
  }

  // Network-first for the app shell too (not just navigations), so a fixed app.js/styles.css
  // is picked up on the very next successful load instead of waiting for the old cached copy
  // to expire on its own. Falls back to the cache when offline.
  event.respondWith(
    fetch(request)
      .then(response=>{
        if(response.ok){
          const copy=response.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
        }
        return response;
      })
      .catch(async()=>{
        const cache=await caches.open(CACHE);
        const cached=await cache.match(request);
        if(cached)return cached;
        throw new Error("offline and not cached: "+request.url);
      })
  );
});

self.addEventListener("push",event=>{
  event.waitUntil((async()=>{
    let data={title:"Driving Log Pro",body:"Lesson reminder",url:"./"};
    try{if(event.data)data={...data,...event.data.json()};}catch{}
    await self.registration.showNotification(data.title||"Driving Log Pro",{
      body:data.body||"Lesson reminder",icon:"./icon-192.png",badge:"./icon-192.png",
      tag:data.tag||"driving-log-lesson",renotify:false,data:{url:data.url||"./"}
    });
  })());
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const url=new URL(event.notification.data?.url||"./",self.location.origin).href;
    const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of clients){if(new URL(client.url).origin===self.location.origin){await client.focus();return;}}
    await self.clients.openWindow(url);
  })());
});
