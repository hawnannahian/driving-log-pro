"""Source-preserving CSS clean-up for styles.css. Two provably safe removals:
1. DEAD RULES: a selector needs a class/id that appears nowhere in index.html or any *.js (whole word) and cannot be built by a template.
2. OVERRIDDEN DECLARATIONS: declaration A (in a single-selector rule) is removed when a LATER rule with the identical selector,
   in the same @media context or unconditioned, sets the same property with equal-or-higher importance and a plain value
   (no dvh/env()/min()/clamp()/vendor value that an older browser could reject, which would make A the fallback).
   For every element A applies to, that later declaration applies too and wins, so A can never be the used value.
Usage: python3 tools/css-clean.py <repo> [--write] [--protect=sel1|sel2]"""
import re,sys,os,glob
repo=sys.argv[1];write="--write" in sys.argv
protect=set();
for a in sys.argv:
    if a.startswith("--protect="):protect=set(x for x in a[10:].split("|") if x)
css=open(os.path.join(repo,"styles.css"),encoding="utf8").read()
src=open(os.path.join(repo,"index.html"),encoding="utf8").read()
js="".join(open(f,encoding="utf8").read() for f in sorted(glob.glob(os.path.join(repo,"*.js"))))
words=set(re.findall(r"[A-Za-z0-9_-]+",src+"\n"+js))
def nocomment(s):return re.sub(r"/\*.*?\*/","",s,flags=re.S)
def dynamic(tok):
    for i in range(1,len(tok)):
        pre,suf=tok[:i],tok[i:]
        if re.search(r"(?<![A-Za-z0-9_-])"+re.escape(pre)+r"(\$\{|\"\s*\+|'\s*\+)",js):return True
        if len(suf)>=2 and re.search(r"\}"+re.escape(suf)+r"(?![A-Za-z0-9_-])",js):return True
    return False
_live={}
def live(tok):
    if tok not in _live:_live[tok]=(tok in words) or dynamic(tok)
    return _live[tok]
def strip_fn(sel):
    out="";i=0
    while i<len(sel):
        m=re.match(r":(not|is|where|has)\(",sel[i:])
        if m:
            d=0;j=i+m.end()-1
            while j<len(sel):
                if sel[j]=="(":d+=1
                elif sel[j]==")":
                    d-=1
                    if d==0:break
                j+=1
            i=j+1;continue
        out+=sel[i];i+=1
    return out
def sel_dead(sel):
    s=strip_fn(re.sub(r"\[[^\]]*\]","",sel));s=re.sub(r"::?[a-zA-Z-]+(\([^)]*\))?","",s)
    for kind,tok in re.findall(r"([.#])(-?[A-Za-z_][A-Za-z0-9_-]*)",s):
        if not live(tok):return tok
    return None
def split_top(s,ch):
    parts=[];d=0;cur="";q=None
    for c in s:
        if q:
            cur+=c
            if c==q:q=None
            continue
        if c in "\"'":q=c;cur+=c;continue
        if c in "([":d+=1
        elif c in ")]":d-=1
        if c==ch and d==0:parts.append(cur);cur=""
        else:cur+=c
    parts.append(cur);return parts
def norm(sel):
    s=re.sub(r"\s+"," ",sel.strip());return re.sub(r"\s*([>+~])\s*",r"\1",s)
RISKY=re.compile(r"dvh|svh|lvh|dvw|svw|lvw|env\(|min\(|max\(|clamp\(|color-mix|-webkit-|-moz-|fit-content|image-set|oklch|oklab|var\(")
def match_brace(text,j):
    d=0;k=j;n=len(text)
    while k<n:
        if text.startswith("/*",k):
            q=text.find("*/",k);k=n if q<0 else q+2;continue
        if text[k]=="{":d+=1
        elif text[k]=="}":
            d-=1
            if d==0:return k
        k+=1
    return n-1
def walk(text,ctx,cb):
    out=[];i=0;n=len(text)
    while i<n:
        m=re.match(r"\s+",text[i:])
        if m:out.append(m.group(0));i+=m.end();continue
        if text.startswith("/*",i):
            j=text.find("*/",i);j=n if j<0 else j+2;out.append(text[i:j]);i=j;continue
        j=i
        while j<n and text[j] not in "{}":
            if text.startswith("/*",j):
                q=text.find("*/",j);j=n if q<0 else q+2;continue
            j+=1
        if j>=n:out.append(text[i:]);break
        if text[j]=="}":out.append(text[i:j+1]);i=j+1;continue
        prelude=text[i:j];k=match_brace(text,j);body=text[j+1:k];p=nocomment(prelude).strip()
        if p.startswith("@media") or p.startswith("@supports"):
            inner=walk(body,ctx+(re.sub(r"\s+","",p),),cb)
            if nocomment(inner).strip()=="" and nocomment(body).strip()!="":cb("emptyblock",p,None,None)
            else:out.append(prelude+"{"+inner+"}")
        elif p.startswith("@"):out.append(text[i:k+1])
        else:
            r=cb("rule",prelude,body,ctx)
            if r is not None:out.append(r)
        i=k+1
    return "".join(out)
# ---- pass 1: collect
rules=[]
def collect(kind,prelude,body,ctx):
    if kind!="rule":return None
    sels=[norm(s) for s in split_top(nocomment(prelude),",")]
    decls=[]
    if "/*" not in body:
        for seg in split_top(body,";"):
            if ":" not in seg:decls.append(None);continue
            pr,v=seg.split(":",1);v=v.strip();decls.append((pr.strip().lower(),v,v.replace(" ","").endswith("!important")))
    rules.append({"ctx":ctx,"sels":sels,"decls":decls,"haveComment":"/*" in body});return prelude+"{"+body+"}"
walk(css,(),collect)
# ---- decide
later={}  # (sel,prop) -> list of (ctx,imp,val) from LATER rules
dead_decl={};stats={"dead_rules":0,"partial_selectors":0,"overridden_decls":0,"emptied_rules":0,"empty_blocks":0}
for idx in range(len(rules)-1,-1,-1):
    r=rules[idx];kill=set()
    if len(r["sels"])==1 and not r["haveComment"] and r["sels"][0] not in protect:
        s=r["sels"][0]
        for di,d in enumerate(r["decls"]):
            if not d or d[0].startswith("--"):continue
            p,v,imp=d
            for (c,i2,v2) in later.get((s,p),()):
                if (c==() or c==r["ctx"]) and (i2 or not imp) and not RISKY.search(v2):kill.add(di);break
    dead_decl[idx]=kill
    for s in r["sels"]:
        for d in r["decls"]:
            if d:later.setdefault((s,d[0]),[]).append((r["ctx"],d[2],d[1]))
# ---- pass 2: rewrite
counter=[0];dead_tokens={}
def rewrite(kind,prelude,body,ctx):
    if kind=="emptyblock":stats["empty_blocks"]+=1;return None
    idx=counter[0];counter[0]+=1
    raw=split_top(nocomment(prelude),",");keep=[]
    for s in raw:
        t=sel_dead(s)
        if t and norm(s) not in protect:dead_tokens[t]=dead_tokens.get(t,0)+1
        else:keep.append(s)
    if not keep:stats["dead_rules"]+=1;return None
    newprelude=prelude
    if len(keep)<len(raw):
        stats["partial_selectors"]+=1;lead=re.match(r"\s*",prelude).group(0);newprelude=lead+",".join(k.strip() for k in keep)
    kill=dead_decl.get(idx,set())
    if kill and len(keep)==len(raw):
        segs=split_top(body,";");kept=[seg for di,seg in enumerate(segs) if di not in kill]
        stats["overridden_decls"]+=len(kill)
        if not any(":" in x for x in kept):stats["emptied_rules"]+=1;return None
        body=";".join(kept)
    return newprelude+"{"+body+"}"
new=walk(css,(),rewrite)
new=re.sub(r"\n[ \t]*\n([ \t]*\n)+","\n\n",new)
print("bytes",len(css.encode()),"->",len(new.encode()),"saved",len(css.encode())-len(new.encode()),stats,"dead tokens",len(dead_tokens))
if write:open(os.path.join(repo,"styles.css"),"w",encoding="utf8").write(new)
