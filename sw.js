const CACHE="nahians-schedule-cache-v161";
// The app shell (pages, scripts, styles, icons) is versioned: bump CACHE on every release.
const FILES=["./", "./index.html", "./push-config.js", "./styles.css", "./app.js", "./reports-dashboard.js", "./islamic-content.js", "./islamic.js", "./full-time-students.js", "./lesson-recovery.js", "./prayer-times.js", "./mawaqit-times.js", "./manifest.webmanifest", "./icon.svg", "./brand-car.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
// The Islamic audio files never change between releases, so they live in their own cache that survives version bumps
// (they are not downloaded again on every release).
const AUDIO_CACHE="nahians-audio-cache-v1";
const AUDIO=["./travel-dua.mp3", "./ayatul-kursi.mp3", "./three-quls.mp3", "./surah-al-kahf-1-10-alafasy.mp3", "./dua-leaving-home.mp3", "./dua-long-journey.mp3", "./dua-new-place.mp3", "./quran-17-80-alafasy.mp3", "./dhikr-return-journey.mp3", "./istighfar-hadith.mp3", "./durood-ibrahim.mp3"];

// Fill the audio cache with whatever is missing: first copy from an older shell cache (no network), then download the rest.
async function ensureAudio(){
  const audio=await caches.open(AUDIO_CACHE);
  for(const url of AUDIO){
    if(await audio.match(url))continue;
    try{
      const old=await caches.match(url);
      if(old){await audio.put(url,old.clone());continue;}
      const res=await fetch(new Request(url,{cache:"reload"}));
      if(res.ok)await audio.put(url,res);
    }catch{}
  }
}
let audioChecked=false;

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(FILES.map(file=>new Request(file,{cache:"reload"}))))
      // Reuse audio already stored by an older version; downloading the rest never blocks the update.
      .then(()=>caches.open(AUDIO_CACHE).then(async audio=>{for(const url of AUDIO){if(await audio.match(url))continue;try{const old=await caches.match(url);if(old)await audio.put(url,old.clone());}catch{}}}))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key!==AUDIO_CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
      .then(()=>{audioChecked=true;return ensureAudio();})
  );
});

// The app opens from the cached shell at once (no waiting for the network). A new release arrives through
// the service worker itself: sw.js changes, the new shell is downloaded in the background and the app shows
// its "new version ready" banner. Anything not in the shell is fetched from the network (cache used offline).
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==location.origin)return;

  if(request.mode==="navigate"){
    event.respondWith((async()=>{
      if(!audioChecked){audioChecked=true;event.waitUntil(ensureAudio());}
      const cache=await caches.open(CACHE);
      const cached=(await cache.match(request,{ignoreSearch:true}))||(await cache.match("./index.html"));
      if(cached)return cached;
      return fetch(request);
    })());
    return;
  }

  // Audio players ask for byte ranges (Safari requires 206 answers). Serve those from the cached file so the
  // Travel Dua plays offline; fall back to the network when the file is not cached yet.
  if(request.headers.has("range")){
    event.respondWith((async()=>{
      const full=await caches.match(request.url,{ignoreSearch:true});
      if(!full)return fetch(request);
      const buf=await full.arrayBuffer(),size=buf.byteLength,m=/bytes=(\d*)-(\d*)/.exec(request.headers.get("range")||"");
      let start=0,end=size-1;
      if(m&&m[1]){start=Number(m[1]);if(m[2])end=Math.min(Number(m[2]),size-1);}else if(m&&m[2]){start=Math.max(0,size-Number(m[2]));}
      if(start>=size)return new Response(null,{status:416,headers:{"Content-Range":`bytes */${size}`}});
      return new Response(buf.slice(start,end+1),{status:206,headers:{"Content-Type":full.headers.get("Content-Type")||"audio/mpeg","Content-Range":`bytes ${start}-${end}/${size}`,"Content-Length":String(end-start+1),"Accept-Ranges":"bytes"}});
    })());
    return;
  }

  // Shell and audio files: cache first (any cache). Other same-origin files: network, falling back to the cache offline.
  event.respondWith((async()=>{
    const hit=await caches.match(request,{ignoreSearch:true});
    if(hit)return hit;
    try{
      const response=await fetch(request);
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}
      return response;
    }catch{
      throw new Error("offline and not cached: "+request.url);
    }
  })());
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
