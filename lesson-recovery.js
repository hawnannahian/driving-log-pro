/* Recoverable lesson deletion and append-only lesson activity events.
   This module is deliberately separate from the Full-Time historical register. */
(()=>{"use strict";
const DAY=86400000,RETENTION_DAYS=30;
const clone=x=>JSON.parse(JSON.stringify(x));
const iso=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?null:d.toISOString();};
const eventId=()=>globalThis.crypto?.randomUUID?.()||"audit-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
function ensure(data){data.lessonRecovery=Array.isArray(data.lessonRecovery)?data.lessonRecovery:[];data.lessonAudit=Array.isArray(data.lessonAudit)?data.lessonAudit:[];return data;}
function addAudit(data,lesson,action,at,actor){
 const when=iso(at)||new Date().toISOString();
 data.lessonAudit.push({id:eventId(),lessonId:String(lesson.id),action,at:when,actor:actor||"Owner",student:String(lesson.student||""),date:String(lesson.date||""),start:String(lesson.start||""),end:String(lesson.end||"")});
}
function recordDelete(data,lesson,at,actor){
 ensure(data);if(!lesson||lesson.type!=="Lesson"||!lesson.id)return false;
 const when=iso(at)||new Date().toISOString(),old=data.lessonRecovery.find(x=>x.id===lesson.id);
 if(old&&old.status==="deleted")return false;
 const row={id:String(lesson.id),lesson:clone(lesson),status:"deleted",deletedAt:when,restoredAt:null,purgedAt:null,updatedAt:when,deletedBy:actor||"Owner"};
 if(old)data.lessonRecovery[data.lessonRecovery.indexOf(old)]=row;else data.lessonRecovery.push(row);
 addAudit(data,lesson,"deleted",when,actor);return true;
}
function restore(data,id,at,actor){
 ensure(data);const row=data.lessonRecovery.find(x=>x.id===id);
 if(!row||row.status!=="deleted"||!row.lesson)return{ok:false,reason:"unavailable"};
 const when=iso(at)||new Date().toISOString();
 if(!data.entries.some(x=>x.id===id))data.entries.push(clone(row.lesson));
 row.status="restored";row.restoredAt=when;row.updatedAt=when;row.restoredBy=actor||"Owner";
 addAudit(data,row.lesson,"restored",when,actor);return{ok:true,lesson:clone(row.lesson)};
}
function cleanup(data,now){
 ensure(data);const when=iso(now)||new Date().toISOString(),t=Date.parse(when);let count=0;
 for(const row of data.lessonRecovery){
  if(row.status!=="deleted"||!row.lesson||!row.deletedAt)continue;
  const deleted=Date.parse(row.deletedAt);if(!Number.isFinite(deleted)||t-deleted<RETENTION_DAYS*DAY)continue;
  const lesson=row.lesson;row.lesson=null;row.purgedAt=when;row.updatedAt=when;
  addAudit(data,lesson,"expired",when,"System");count++;
 }
 return count;
}
// Explicit restore of a whole backup: lessons that the backup holds as active but this device has soft-deleted
// are marked restored (newer than the delete), so the backup restore sticks and a later cloud sync cannot undo it.
function adopt(data,entries,at,actor){
 ensure(data);const when=iso(at)||new Date().toISOString();let count=0;
 for(const e of entries||[]){
  if(!e||e.type!=="Lesson"||!e.id)continue;
  const row=data.lessonRecovery.find(x=>x.id===e.id);
  if(!row||row.status!=="deleted")continue;
  row.lesson=row.lesson||clone(e);row.status="restored";row.restoredAt=when;row.updatedAt=when;row.restoredBy=actor||"Backup restore";
  addAudit(data,e,"restored",when,actor||"Backup restore");count++;
 }
 return count;
}
function merge(base,local,remote,mergeList){
 const b=base||{},l=local||{},r=remote||{};
 const recoveryById=new Map();
 for(const row of [...(b.lessonRecovery||[]),...(l.lessonRecovery||[]),...(r.lessonRecovery||[])]){
  const old=recoveryById.get(row.id),stamp=Date.parse(row.updatedAt)||0,oldStamp=old?(Date.parse(old.updatedAt)||0):-1;
  if(!old||stamp>oldStamp||(stamp===oldStamp&&row.status==="deleted"&&old.status!=="deleted"))recoveryById.set(row.id,row);
 }
 const recovery=[...recoveryById.values()];
 const auditById=new Map();for(const event of [...(b.lessonAudit||[]),...(l.lessonAudit||[]),...(r.lessonAudit||[])]){const old=auditById.get(event.id);if(!old||(Date.parse(event.at)||0)>(Date.parse(old.at)||0))auditById.set(event.id,event);}const audit=[...auditById.values()];
 const entries=mergeList(b.entries||[],l.entries||[],r.entries||[]);
 const byId=new Map(recovery.map(x=>[x.id,x]));
 for(const row of recovery){
  if(row.status==="deleted")continue;
  if(row.status==="restored"&&row.lesson&&!entries.some(x=>x.id===row.id))entries.push(clone(row.lesson));
 }
 const active=entries.filter(x=>{const row=byId.get(x.id);return !row||row.status!=="deleted";});
 return{entries:active,lessonRecovery:recovery,lessonAudit:audit};
}
function deleted(data,now){
 ensure(data);const t=Date.parse(iso(now)||new Date().toISOString());
 return data.lessonRecovery.filter(x=>x.status==="deleted"&&x.lesson&&x.deletedAt&&t-Date.parse(x.deletedAt)<RETENTION_DAYS*DAY)
  .sort((a,b)=>b.deletedAt.localeCompare(a.deletedAt));
}
function validateRecovery(list){
 return list==null||Array.isArray(list)&&list.every(x=>x&&typeof x.id==="string"&&x.id&&["deleted","restored"].includes(x.status)&&typeof x.updatedAt==="string"&&(x.lesson==null||x.lesson&&x.lesson.id===x.id&&x.lesson.type==="Lesson"));
}
function validateAudit(list){
 return list==null||Array.isArray(list)&&list.every(x=>x&&typeof x.id==="string"&&x.id&&typeof x.lessonId==="string"&&["deleted","restored","expired"].includes(x.action)&&typeof x.at==="string");
}
window.DrivingLogRecovery=Object.freeze({RETENTION_DAYS,ensure,recordDelete,restore,cleanup,adopt,merge,deleted,validateRecovery,validateAudit});
})();