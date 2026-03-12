const { useState, useEffect } = React;
const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } = Recharts;

const COURSES = {
  park: {
    name: "Parkbanan", fullName: "Hooks GK – Parkbanan", par: 72, emoji: "🌳",
    holes: [
      {n:1,par:4,hcp:9},{n:2,par:4,hcp:15},{n:3,par:3,hcp:1},{n:4,par:5,hcp:5},
      {n:5,par:4,hcp:13},{n:6,par:3,hcp:17},{n:7,par:3,hcp:7},{n:8,par:4,hcp:11},
      {n:9,par:4,hcp:3},{n:10,par:5,hcp:12},{n:11,par:4,hcp:8},{n:12,par:4,hcp:14},
      {n:13,par:3,hcp:4},{n:14,par:4,hcp:16},{n:15,par:5,hcp:6},{n:16,par:4,hcp:2},
      {n:17,par:5,hcp:18},{n:18,par:4,hcp:10},
    ],
  },
  skog: {
    name: "Skogsbanan", fullName: "Hooks GK – Skogsbanan", par: 72, emoji: "🌲",
    holes: [
      {n:1,par:5,hcp:15},{n:2,par:4,hcp:3},{n:3,par:4,hcp:5},{n:4,par:3,hcp:13},
      {n:5,par:5,hcp:7},{n:6,par:4,hcp:1},{n:7,par:3,hcp:17},{n:8,par:4,hcp:11},
      {n:9,par:4,hcp:9},{n:10,par:4,hcp:10},{n:11,par:4,hcp:4},{n:12,par:5,hcp:12},
      {n:13,par:3,hcp:14},{n:14,par:4,hcp:18},{n:15,par:4,hcp:8},{n:16,par:3,hcp:16},
      {n:17,par:4,hcp:2},{n:18,par:5,hcp:6},
    ],
  },
};

const KEY = "hooks_golf_v2";
const GIST_TOKEN_KEY = "hooks_golf_gist_token";
const GIST_ID_KEY   = "hooks_golf_gist_id";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||"[]"); } catch { return []; } };
const save = r => localStorage.setItem(KEY, JSON.stringify(r));
const avg = arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : "–";

async function gistPush(token, gistId, rounds) {
  const body = { files: { "golf-stats.json": { content: JSON.stringify(rounds, null, 2) } } };
  if (gistId) {
    const r = await fetch(`https://api.github.com/gists/${gistId}`, {
      method:"PATCH", headers:{"Authorization":`token ${token}`,"Content-Type":"application/json"},
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return gistId;
  } else {
    const r = await fetch("https://api.github.com/gists", {
      method:"POST", headers:{"Authorization":`token ${token}`,"Content-Type":"application/json"},
      body: JSON.stringify({...body, description:"Hooks Golf Stats", public:false}),
    });
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    localStorage.setItem(GIST_ID_KEY, data.id);
    return data.id;
  }
}

async function gistPull(token, gistId) {
  const r = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers:{"Authorization":`token ${token}`},
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  const content = data.files["golf-stats.json"]?.content;
  if (!content) throw new Error("Fil saknas i Gist");
  return JSON.parse(content);
}

const scoreInfo = (s, par) => {
  const d = s - par;
  if (s===1)   return {label:"HIO! 🏆",        color:"#FFD700"};
  if (d<=-2)   return {label:"Eagle 🦅",        color:"#FF8C00"};
  if (d===-1)  return {label:"Birdie 🐦",       color:"#e05050"};
  if (d===0)   return {label:"Par",             color:"#5fca5f"};
  if (d===1)   return {label:"Bogey",           color:"#b0b0b0"};
  if (d===2)   return {label:"Dubbelbogey",     color:"#808080"};
  return       {label:`+${d}`,                  color:"#505050"};
};

const C = {
  bg: "linear-gradient(160deg,#0a1f0f 0%,#0d2b14 40%,#0a1a0c 100%)",
  card: {background:"rgba(255,255,255,0.03)",border:"1px solid rgba(168,213,162,0.12)",borderRadius:14,padding:"14px 16px",marginBottom:12},
  cardHL: {background:"rgba(168,213,162,0.06)",border:"1px solid rgba(168,213,162,0.22)",borderRadius:14,padding:"14px 16px",marginBottom:12},
  btn: {width:"100%",padding:"14px",background:"#2d6e2d",border:"none",borderRadius:12,color:"#e8f0e8",fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"},
  btnO: {padding:"12px 18px",background:"transparent",border:"1px solid rgba(168,213,162,0.3)",borderRadius:12,color:"#ffffff",fontSize:14,cursor:"pointer",fontFamily:"inherit"},
  btnSm: {padding:"7px 13px",background:"rgba(45,110,45,0.35)",border:"1px solid rgba(168,213,162,0.18)",borderRadius:8,color:"#ffffff",fontSize:12,cursor:"pointer",fontFamily:"inherit"},
  btnDel: {padding:"7px 13px",background:"rgba(120,30,30,0.35)",border:"1px solid rgba(200,70,70,0.2)",borderRadius:8,color:"#e08080",fontSize:12,cursor:"pointer",fontFamily:"inherit"},
  inp: {width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(168,213,162,0.2)",borderRadius:10,padding:"11px 14px",color:"#e8f0e8",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"inherit"},
  lbl: {fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:1.2,textTransform:"uppercase",marginBottom:5,display:"block"},
};

function Pip({label,value}) {
  return <div style={{textAlign:"center"}}>
    <div style={{fontSize:22,fontWeight:"bold",color:"#ffffff"}}>{value}</div>
    <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:.5,marginTop:1}}>{label}</div>
  </div>;
}
function Mini({label,value}) {
  return <div>
    <div style={{fontSize:17,fontWeight:"bold",color:"#ffffff"}}>{value}</div>
    <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:.8}}>{label}</div>
  </div>;
}
function Block({title,children}) {
  return <div style={{...C.card,marginBottom:14}}>
    <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:1.2,textTransform:"uppercase",marginBottom:12}}>{title}</div>
    {children}
  </div>;
}

// ─── Green Zone Map ───────────────────────────────────────────────────────────
// 9 zones in a full 3x3 grid
const GREEN_ZONES = [
  {id:"BV",label:"BV"}, {id:"B",label:"B"},  {id:"BH",label:"BH"},
  {id:"V", label:"V"},  {id:"C",label:"C"},  {id:"H", label:"H"},
  {id:"FV",label:"FV"}, {id:"F",label:"F"},  {id:"FH",label:"FH"},
];
const ZONE_NAMES = {
  BV:"Bak-Vänster", B:"Bak",    BH:"Bak-Höger",
  V:"Vänster",      C:"Center", H:"Höger",
  FV:"Fram-Vänster",F:"Fram",   FH:"Fram-Höger",
};
function GreenMap({selected, onSelect}) {
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
        {GREEN_ZONES.map(z => {
          const active = selected === z.id;
          return (
            <button key={z.id} onClick={()=>onSelect(active ? null : z.id)} style={{
              padding:"11px 4px", borderRadius:10, cursor:"pointer",
              fontFamily:"inherit", fontSize:12, fontWeight:"bold",
              background: active ? "rgba(95,202,95,0.3)" : "rgba(255,255,255,0.05)",
              border: active ? "2px solid #5fca5f" : "1px solid rgba(168,213,162,0.15)",
              color: active ? "#5fca5f" : "rgba(255,255,255,0.6)",
            }}>{z.label}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Miss Zone Map ────────────────────────────────────────────────────────────
const MISS_ZONES = [
  {id:"BV",label:"LV"}, {id:"B",label:"L"},  {id:"BH",label:"LH"},
  {id:"V", label:"V"},  {id:"",  label:""},   {id:"H", label:"H"},
  {id:"FV",label:"KV"}, {id:"F",label:"K"},   {id:"FH",label:"KH"},
];

function MissMap({selected, onSelect}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
      {MISS_ZONES.map((z,i) => {
        if(!z.id) return <div key={i}/>;
        const active = selected === z.id;
        return (
          <button key={z.id} onClick={()=>onSelect(active ? null : z.id)} style={{
            padding:"11px 4px", borderRadius:10, cursor:"pointer",
            fontFamily:"inherit", fontSize:12, fontWeight:"bold",
            background: active ? "rgba(220,80,80,0.3)" : "rgba(255,255,255,0.05)",
            border: active ? "2px solid #e05050" : "1px solid rgba(168,213,162,0.15)",
            color: active ? "#e05050" : "rgba(255,255,255,0.6)",
          }}>{z.label}</button>
        );
      })}
    </div>
  );
}


function HoleEntry({courseKey, date, onDone, onCancel, rounds, initialData}) {
  const course = COURSES[courseKey];
  const [scores,   setScores]   = useState(() => initialData?.holes
    ? initialData.holes.map(h => h.strokes!=null ? String(h.strokes) : String(course.holes[h.hole-1].par))
    : course.holes.map(h => String(h.par)));
  const [putts,    setPutts]    = useState(() => initialData?.holes
    ? initialData.holes.map(h => h.putts!=null ? String(h.putts) : "2")
    : Array(18).fill("2"));
  const [fw,       setFw]       = useState(() => initialData?.holes
    ? initialData.holes.map(h => h.fairway??true)
    : Array(18).fill(true));
  const [gir,      setGir]      = useState(() => initialData?.holes
    ? initialData.holes.map(h => h.gir??true)
    : Array(18).fill(true));
  const [greenZ,   setGreenZ]   = useState(() => initialData?.holes
    ? initialData.holes.map(h => h.greenZone??"C")
    : Array(18).fill("C"));
  const [missZ,    setMissZ]    = useState(() => initialData?.holes
    ? initialData.holes.map(h => h.missZone??null)
    : Array(18).fill(null));
  const [inspelLen,setInspelLen]= useState(()=>{
    if(initialData?.holes) return initialData.holes.map(h => h.inspelLen??"100-125");
    // Pre-fill each hole with most common inspelLen from history, fallback to "100-125"
    const LENS = ["<75","75-100","100-125","125-150",">150"];
    return Array(18).fill(null).map((_,i)=>{
      const holeNum = i+1;
      const allHoles = (rounds||[]).flatMap(r=>r.holes||[]);
      const forHole = allHoles.filter(h=>h.hole===holeNum && h.inspelLen);
      if(!forHole.length) return "100-125";
      const counts = Object.fromEntries(LENS.map(l=>[l, forHole.filter(h=>h.inspelLen===l).length]));
      return LENS.reduce((a,b)=>counts[b]>counts[a]?b:a);
    });
  });
  const [teeClub, setTeeClub]  = useState(() => {
    if(initialData?.holes) return initialData.holes.map(h => h.teeClub??null);
    const CLUBS = ["Dr","FW","Hy","Ir"];
    return Array(18).fill(null).map((_,i)=>{
      const holeNum = i+1;
      const allHoles = (rounds||[]).flatMap(r=>r.holes||[]);
      const forHole = allHoles.filter(h=>h.hole===holeNum && h.teeClub);
      if(!forHole.length) return course.holes[i].par===3 ? "Ir" : "Dr";
      const counts = Object.fromEntries(CLUBS.map(c=>[c, forHole.filter(h=>h.teeClub===c).length]));
      return CLUBS.reduce((a,b)=>counts[b]>counts[a]?b:a);
    });
  });
  const [hole,     setHole]     = useState(0);
  const [showAllScores, setShowAllScores] = useState(false);

  const h = course.holes[hole];
  const total      = scores.reduce((a,b)=>a+(b===""?0:+b),0);
  const playedPar  = course.holes.reduce((a,x)=>a+x.par,0);
  const diff       = total - playedPar;
  const diffS      = diff===0?"E":diff>0?`+${diff}`:`${diff}`;
  const sl         = scores[hole]!=="" ? scoreInfo(+scores[hole], h.par) : null;

  const setS  = v => { const n=[...scores];  n[hole]=v; setScores(n); };
  const setP  = v => { const n=[...putts];   n[hole]=v; setPutts(n); };
  const togFw = v => { const n=[...fw];      n[hole]=v; setFw(n); };
  const togGir= v => { const n=[...gir];     n[hole]=v; setGir(n); };

  const goToHole = i => { setHole(i); setShowAllScores(false); };

  const handleGreenZone = v => { const nz=[...greenZ]; nz[hole]=v; setGreenZ(nz); };
  const handleMissZone  = v => { const nz=[...missZ];  nz[hole]=v; setMissZ(nz); };
  const setIL = v => { const n=[...inspelLen]; n[hole]=v; setInspelLen(n); };
  const setTC = v => { const n=[...teeClub];  n[hole]=v; setTeeClub(n); };

  function finish() {
    const totalPutts = putts.reduce((a,b)=>a+(b===""?0:+b),0);
    onDone({
      courseKey, courseName: course.fullName, date,
      score: total,
      putts: totalPutts||null,
      fairways: fw.filter(f=>f===true).length,
      gir: gir.filter(g=>g===true).length,
      holes: scores.map((s,i)=>({
        hole:i+1, par:course.holes[i].par,
        strokes:s===""?null:+s,
        putts:putts[i]===""?null:+putts[i],
        fairway:fw[i], gir:gir[i],
        greenZone:greenZ[i], missZone:missZ[i], inspelLen:inspelLen[i], teeClub:teeClub[i],
      })),
    });
  }

  const togBtn = (val, current, setter) => (
    <button onClick={()=>setter(current===val?null:val)} style={{
      flex:1, padding:"10px 4px", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:12,
      background: current===val ? "rgba(95,202,95,0.22)" : "rgba(255,255,255,0.05)",
      border: current===val ? "1px solid #5fca5f" : "1px solid rgba(168,213,162,0.14)",
      color: current===val ? "#5fca5f" : "rgba(255,255,255,0.55)",
    }}>{val}</button>
  );

  return (
    <div style={{padding:"16px 20px"}}>
      {/* top bar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:12,color:"rgba(168,213,162,0.5)",letterSpacing:1}}>{course.name.toUpperCase()}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{date}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:24,fontWeight:"bold",color:diff<0?"#5fca5f":diff>0?"#e09050":"#ffffff"}}>{diffS}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Hål {hole+1}/18</div>
        </div>
      </div>

      {/* hole card */}
      <div style={{background:"rgba(168,213,162,0.06)",border:"1px solid rgba(168,213,162,0.25)",borderRadius:18,padding:"16px 18px",marginBottom:12}}>
        {/* hole header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:32,fontWeight:"bold",color:"#ffffff",lineHeight:1}}>Hål {h.n}</div>
            <div style={{display:"flex",gap:8,marginTop:5}}>
              <span style={{background:"rgba(168,213,162,0.18)",borderRadius:20,padding:"3px 13px",fontSize:13,color:"#ffffff",fontWeight:"bold"}}>Par {h.par}</span>
              <span style={{background:"rgba(168,213,162,0.07)",borderRadius:20,padding:"3px 12px",fontSize:12,color:"rgba(168,213,162,0.5)"}}>HCP {h.hcp}</span>
            </div>
          </div>
          {sl && (
            <div style={{background:"rgba(0,0,0,0.35)",borderRadius:12,padding:"8px 14px",textAlign:"center",minWidth:68}}>
              <div style={{fontSize:24,fontWeight:"bold",color:sl.color,lineHeight:1}}>{scores[hole]}</div>
              <div style={{fontSize:10,color:sl.color,marginTop:3}}>{sl.label}</div>
            </div>
          )}
        </div>

        {/* Score */}
        <div style={{marginBottom:12}}>
          <span style={C.lbl}>Slag</span>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {(showAllScores ? [1,2,3,4,5,6,7,8,9,10] : [1,2,3,4,5,6,7].slice(0, h.par+(h.par===5?1:2))).map(n=>{
              const active=scores[hole]===String(n); const si2=scoreInfo(n,h.par);
              return <button key={n} onClick={()=>setS(String(n))} style={{
                width:36,height:36,borderRadius:9,
                background:active?si2.color:"rgba(255,255,255,0.05)",
                border:active?`2px solid ${si2.color}`:"1px solid rgba(168,213,162,0.14)",
                color:active?"#0a1f0f":"#e8f0e8",fontSize:14,fontWeight:active?"bold":"normal",
                cursor:"pointer",fontFamily:"inherit",flexShrink:0,
              }}>{n}</button>;
            })}
            {!showAllScores && (
              <button onClick={()=>setShowAllScores(true)} style={{
                width:36,height:36,borderRadius:9,
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(168,213,162,0.14)",
                color:"rgba(168,213,162,0.5)",fontSize:18,fontWeight:"bold",
                cursor:"pointer",fontFamily:"inherit",flexShrink:0,
              }}>+</button>
            )}
          </div>
        </div>

        {/* Putts */}
        <div style={{marginBottom:12}}>
          <span style={C.lbl}>Puttar</span>
          <div style={{display:"flex",gap:5}}>
            {[0,1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setP(String(n))} style={{
                width:40,height:40,borderRadius:9,
                background:putts[hole]===String(n)?"#2d6e2d":"rgba(255,255,255,0.05)",
                border:putts[hole]===String(n)?"2px solid #5fca5f":"1px solid rgba(168,213,162,0.14)",
                color:"#e8f0e8",fontSize:15,cursor:"pointer",fontFamily:"inherit",
              }}>{n}</button>
            ))}
          </div>
        </div>

        {/* Utslagsklubba */}
        <div style={{marginBottom:12}}>
          <span style={C.lbl}>Utslagsklubba</span>
          <div style={{display:"flex",gap:5}}>
            {["Dr","FW","Hy","Ir"].map(v=>{
              const active=teeClub[hole]===v;
              return <button key={v} onClick={()=>setTC(active?null:v)} style={{
                flex:1,padding:"9px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:"bold",
                background:active?"rgba(95,202,95,0.22)":"rgba(255,255,255,0.05)",
                border:active?"1px solid #5fca5f":"1px solid rgba(168,213,162,0.14)",
                color:active?"#5fca5f":"rgba(255,255,255,0.55)",
              }}>{v}</button>;
            })}
          </div>
        </div>

        {/* Fairway */}
        {h.par>=4 && (
          <div style={{marginBottom:12}}>
            <span style={C.lbl}>Fairway</span>
            <div style={{display:"flex",gap:8}}>
              {[["✓ Träffad",true],["✗ Missad",false]].map(([lbl,val])=>(
                <button key={lbl} onClick={()=>togFw(val)} style={{
                  flex:1,padding:"9px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,
                  background:fw[hole]===val?(val?"rgba(95,202,95,0.25)":"rgba(220,80,80,0.25)"):"rgba(255,255,255,0.05)",
                  border:fw[hole]===val?`1px solid ${val?"#5fca5f":"#e05050"}`:"1px solid rgba(168,213,162,0.14)",
                  color:fw[hole]===val?(val?"#5fca5f":"#e05050"):"rgba(255,255,255,0.55)",
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        )}

        {/* Inspelslängd */}
        <div style={{marginBottom:12}}>
          <span style={C.lbl}>Inspelslängd</span>
          <div style={{display:"flex",gap:5}}>
            {["<75","75-100","100-125","125-150",">150"].map(v=>{
              const active=inspelLen[hole]===v;
              return <button key={v} onClick={()=>setIL(active?null:v)} style={{
                flex:1,padding:"8px 2px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:11,
                background:active?"rgba(95,202,95,0.22)":"rgba(255,255,255,0.05)",
                border:active?"1px solid #5fca5f":"1px solid rgba(168,213,162,0.14)",
                color:active?"#5fca5f":"rgba(255,255,255,0.55)",
              }}>{v}</button>;
            })}
          </div>
        </div>

        {/* Greenträff vid Inspel */}
        <div style={{marginBottom:12}}>
          <span style={C.lbl}>Greenträff vid Inspel</span>
          <div style={{display:"flex",gap:8}}>
            {[["✓ Ja",true],["✗ Nej",false]].map(([lbl,val])=>(
              <button key={lbl} onClick={()=>togGir(val)} style={{
                flex:1,padding:"9px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,
                background:gir[hole]===val?(val?"rgba(95,202,95,0.25)":"rgba(220,80,80,0.25)"):"rgba(255,255,255,0.05)",
                border:gir[hole]===val?`1px solid ${val?"#5fca5f":"#e05050"}`:"1px solid rgba(168,213,162,0.14)",
                color:gir[hole]===val?(val?"#5fca5f":"#e05050"):"rgba(255,255,255,0.55)",
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* Green zone – only when GIR = Ja */}
        {gir[hole]===true && (
          <div style={{marginBottom:12}}>
            <span style={C.lbl}>Greenträff – var landade bollen?</span>
            <GreenMap selected={greenZ[hole]} onSelect={handleGreenZone}/>
          </div>
        )}

        {/* Miss zone – only when GIR = Nej */}
        {gir[hole]===false && (
          <div style={{marginBottom:12}}>
            <span style={C.lbl}>Greenmiss – var landade bollen?</span>
            <MissMap selected={missZ[hole]} onSelect={handleMissZone}/>
          </div>
        )}

      </div>

      {/* nav */}
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <button onClick={()=>goToHole(hole-1)} disabled={hole===0} style={{...C.btnO,flex:1,opacity:hole===0?.3:1}}>← Föregående</button>
        <button onClick={()=>goToHole(hole+1)} disabled={hole===17} style={{...C.btnO,flex:1,opacity:hole===17?.3:1}}>Nästa →</button>
      </div>

      {/* dot map */}
      <div style={{marginBottom:12}}>
        {[0,1].map(row=>{
          const startI = row*9;
          const rowHoles = course.holes.slice(startI, startI+9);
          const rowSum = rowHoles.reduce((a,hx,i)=>{
            const s=scores[startI+i];
            return a+(s===""?0:+s);
          },0);
          return (
            <div key={row} style={{display:"grid",gridTemplateColumns:"repeat(9,1fr) auto",gap:4,marginBottom:4}}>
              {rowHoles.map((hx,i)=>{
                const idx=startI+i;
                const s=scores[idx]; const filled=s!=="";
                const col=filled?scoreInfo(+s,hx.par).color:"rgba(168,213,162,0.13)";
                return (
                  <button key={idx} onClick={()=>goToHole(idx)} style={{
                    width:"100%",aspectRatio:"1",borderRadius:"50%",
                    border:`2px solid ${idx===hole?"#fff":col}`,
                    background:filled?col:"transparent",
                    color:filled?"#0a1f0f":"rgba(168,213,162,0.35)",
                    fontSize:9,fontWeight:"bold",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>{filled?s:idx+1}</button>
                );
              })}
              <div style={{
                display:"flex",alignItems:"center",justifyContent:"center",
                background:"rgba(168,213,162,0.08)",border:"1px solid rgba(168,213,162,0.2)",
                borderRadius:8,padding:"0 8px",fontSize:12,fontWeight:"bold",
                color:"#ffffff",minWidth:32,whiteSpace:"nowrap",
              }}>{rowSum||"–"}</div>
            </div>
          );
        })}
      </div>

      <div style={{display:"flex",gap:8}}>
        <button onClick={finish} style={{...C.btn,flex:2}}>{initialData?"Spara ändringar":"Spara runda"}</button>
        <button onClick={onCancel} style={C.btnO}>Avbryt</button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
window.GolfApp = function App() {
  const [rounds, setRounds] = useState(load);
  const [view, setView] = useState("home");
  const [selCourse, setSelCourse] = useState(null);
  const [playDate, setPlayDate] = useState(new Date().toISOString().split("T")[0]);
  const [detail, setDetail] = useState(null);
  const [delId, setDelId] = useState(null);
  const [importMsg, setImportMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [statLenFilter, setStatLenFilter] = useState(null);
  const [statTeeFilter, setStatTeeFilter] = useState(null);
  const [statParFilter, setStatParFilter] = useState(null);
  const [editRound, setEditRound] = useState(null);
  const [gistToken, setGistToken] = useState(()=>localStorage.getItem(GIST_TOKEN_KEY)||"");
  const [gistId,    setGistId]    = useState(()=>localStorage.getItem(GIST_ID_KEY)||"");
  const [gistStatus, setGistStatus] = useState("");

  useEffect(()=>{ save(rounds); },[rounds]);

  async function syncToGist(data, silent=false) {
    if (!gistToken) return;
    if (!silent) setGistStatus("⏳ Synkar...");
    try {
      const newId = await gistPush(gistToken, gistId, data);
      if (newId !== gistId) setGistId(newId);
      setGistStatus("✓ Synkat " + new Date().toLocaleTimeString("sv-SE",{hour:"2-digit",minute:"2-digit"}));
    } catch(e) {
      setGistStatus("✗ Sync misslyckades: " + e.message);
    }
  }

  async function loadFromGist() {
    if (!gistToken || !gistId) { setGistStatus("✗ Token och Gist ID krävs"); return; }
    setGistStatus("⏳ Hämtar från GitHub...");
    try {
      const imported = await gistPull(gistToken, gistId);
      const existingIds = new Set(rounds.map(r=>r.id));
      const newRounds = imported.filter(r=>!existingIds.has(r.id));
      setRounds(prev=>[...newRounds,...prev].sort((a,b)=>new Date(b.date)-new Date(a.date)));
      setGistStatus(`✓ ${newRounds.length} nya rundor hämtade`);
    } catch(e) {
      setGistStatus("✗ " + e.message);
    }
  }

  const sorted = [...rounds].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const last10 = sorted.slice(0,10).reverse();
  const chartData = last10.map(r=>({name:r.date.slice(5),Slag:r.score}));
  const scores = rounds.map(r=>r.score);
  const puttsArr = rounds.filter(r=>r.putts).map(r=>r.putts);
  const girArr = rounds.filter(r=>r.gir!=null).map(r=>r.gir);
  const fwArr  = rounds.filter(r=>r.fairways!=null).map(r=>r.fairways);
  const lat = sorted[0];
  const latDiff = lat ? lat.score-(COURSES[lat.courseKey]?.par??72) : null;

  function handleDone(round) {
    const newRounds = [{id:Date.now(),...round},...rounds];
    setRounds(newRounds);
    setView("history");
    syncToGist(newRounds, true);
  }

  function handleEditDone(round) {
    const newRounds = rounds.map(r => r.id===editRound.id ? {...round, id:editRound.id} : r);
    setRounds(newRounds);
    setEditRound(null);
    setView("history");
    syncToGist(newRounds, true);
  }

  const nav = (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,
      background:"rgba(10,26,12,0.97)",borderTop:"1px solid rgba(168,213,162,0.1)",
      display:"flex",justifyContent:"space-around",padding:"10px 0 16px",backdropFilter:"blur(10px)"}}>
      {[{id:"home",icon:"🏠",label:"Hem"},{id:"courseSelect",icon:"➕",label:"Ny runda"},
        {id:"history",icon:"📋",label:"Historik"},{id:"stats",icon:"📊",label:"Statistik"},
        {id:"settings",icon:"⚙️",label:"Inställn."}].map(t=>(
        <button key={t.id} onClick={()=>setView(t.id)} style={{
          background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",
          alignItems:"center",gap:3,color:view===t.id?"#ffffff":"rgba(168,213,162,0.28)",
        }}>
          <span style={{fontSize:20}}>{t.icon}</span>
          <span style={{fontSize:10,letterSpacing:.4}}>{t.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{fontFamily:"'Georgia','Times New Roman',serif",background:C.bg,minHeight:"100vh",
      color:"#ffffff",maxWidth:430,margin:"0 auto",paddingBottom:80}}>


      {/* HOME */}
      {view==="home" && (
        <div style={{padding:"18px 20px 0"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[
              {label:"Senaste",value:lat?(lat.score+(latDiff!==null?` (${latDiff>=0?"+":""}${latDiff})`:"")):"–"},
              {label:"Bästa runda",value:scores.length?Math.min(...scores):"–"},
              {label:"Snitt slag",value:avg(scores)},
              {label:"Snitt puttar",value:avg(puttsArr)},
            ].map(s=>(
              <div key={s.label} style={{...C.card,margin:0}}>
                <div style={{fontSize:22,fontWeight:"bold",color:"#ffffff"}}>{s.value}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {last10.length>=2 && (
            <div style={{...C.card,padding:"12px 6px 6px",marginBottom:14}}>
              <div style={{fontSize:10,color:"rgba(168,213,162,0.35)",paddingLeft:12,marginBottom:5,letterSpacing:1}}>SLAG – SENASTE RUNDOR</div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" tick={{fill:"rgba(168,213,162,0.35)",fontSize:9}} axisLine={false} tickLine={false}/>
                  <YAxis domain={["auto","auto"]} tick={{fill:"rgba(168,213,162,0.35)",fontSize:9}} axisLine={false} tickLine={false} width={26}/>
                  <Tooltip contentStyle={{background:"#0d2b14",border:"1px solid rgba(168,213,162,0.2)",borderRadius:8,fontSize:12}}/>
                  <Line type="monotone" dataKey="Slag" stroke="#ffffff" strokeWidth={2} dot={{fill:"#ffffff",r:3}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {lat && (
            <div style={{...C.cardHL,cursor:"pointer",marginBottom:14}} onClick={()=>{setDetail(lat);setView("detail");}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:1,marginBottom:5}}>SENASTE RUNDA</div>
              <div style={{fontSize:16,color:"#ffffff"}}>{lat.courseName}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:10}}>{lat.date}</div>
              <div style={{display:"flex",gap:18}}>
                <Mini label="Slag" value={lat.score}/>
                {lat.gir!=null&&<Mini label="GIR" value={lat.gir}/>}
                {lat.putts&&<Mini label="Puttar" value={lat.putts}/>}
                {lat.fairways!=null&&<Mini label="FW" value={lat.fairways}/>}
              </div>
            </div>
          )}

          <button onClick={()=>setView("courseSelect")} style={C.btn}>+ Ny runda</button>
        </div>
      )}

      {/* COURSE SELECT */}
      {view==="courseSelect" && (
        <div style={{padding:"20px"}}>
          <div style={{fontSize:17,color:"#ffffff",marginBottom:14,fontWeight:"bold"}}>Välj bana & datum</div>
          <div style={{marginBottom:16}}>
            <span style={C.lbl}>Datum</span>
            <input type="date" value={playDate} onChange={e=>setPlayDate(e.target.value)} style={C.inp}/>
          </div>
          {Object.entries(COURSES).map(([key,c])=>(
            <button key={key} onClick={()=>{setSelCourse(key);setView("playing");}} style={{
              width:"100%",marginBottom:12,padding:"18px 20px",textAlign:"left",cursor:"pointer",
              background:"rgba(168,213,162,0.04)",border:"1px solid rgba(168,213,162,0.18)",
              borderRadius:14,color:"#e8f0e8",fontFamily:"inherit",
            }}>
              <div style={{fontSize:24,marginBottom:4}}>{c.emoji}</div>
              <div style={{fontSize:17,color:"#ffffff",fontWeight:"bold"}}>{c.name}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>Par {c.par} · 18 hål · Hooks GK</div>
            </button>
          ))}
          <button onClick={()=>setView("home")} style={{...C.btnO,width:"100%"}}>Avbryt</button>
        </div>
      )}

      {/* PLAYING */}
      {view==="playing" && selCourse && (
        <HoleEntry courseKey={selCourse} date={playDate} onDone={handleDone} onCancel={()=>setView("home")} rounds={rounds}/>
      )}

      {/* EDITING */}
      {view==="editing" && editRound && (
        <HoleEntry
          courseKey={editRound.courseKey}
          date={editRound.date}
          onDone={handleEditDone}
          onCancel={()=>{setEditRound(null);setView("history");}}
          rounds={rounds}
          initialData={editRound}
        />
      )}

      {/* HISTORY */}
      {view==="history" && (
        <div style={{padding:"18px 20px"}}>
          <div style={{fontSize:17,color:"#ffffff",marginBottom:14,fontWeight:"bold"}}>Historik</div>
          {sorted.length===0 && <div style={{color:"rgba(168,213,162,0.35)",textAlign:"center",marginTop:60}}>Inga rundor ännu.</div>}
          {sorted.map(r=>{
            const cp = COURSES[r.courseKey]?.par??72;
            const d = r.score-cp;
            return (
              <div key={r.id} style={C.card}>
                <div style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}}
                  onClick={()=>{setDetail(r);setView("detail");}}>
                  <div>
                    <div style={{fontSize:15,color:"#ffffff"}}>{r.courseName}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{r.date}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:26,fontWeight:"bold",color:"#ffffff"}}>{r.score}</div>
                    <div style={{fontSize:12,color:d<0?"#5fca5f":d>0?"#e09050":"#ffffff"}}>{d>=0?`+${d}`:d}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:16,margin:"8px 0"}}>
                  {r.gir!=null&&<Mini label="GIR" value={r.gir}/>}
                  {r.putts&&<Mini label="Puttar" value={r.putts}/>}
                  {r.fairways!=null&&<Mini label="FW" value={r.fairways}/>}
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>{setDetail(r);setView("detail");}} style={C.btnSm}>Detaljer</button>
                  <button onClick={()=>{setEditRound(r);setView("editing");}} style={C.btnSm}>Editera</button>
                  <button onClick={()=>setDelId(r.id)} style={C.btnDel}>Ta bort</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL */}
      {view==="detail" && detail && (
        <div style={{padding:"18px 20px"}}>
          <button onClick={()=>setView("history")} style={{...C.btnO,marginBottom:14,padding:"8px 16px",fontSize:13}}>← Tillbaka</button>
          <div style={{fontSize:17,color:"#ffffff",fontWeight:"bold"}}>{detail.courseName}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:14}}>{detail.date}</div>
          <div style={{display:"flex",gap:16,marginBottom:16}}>
            <Pip label="Slag" value={detail.score}/>
            {detail.gir!=null&&<Pip label="GIR" value={detail.gir}/>}
            {detail.putts&&<Pip label="Puttar" value={detail.putts}/>}
            {detail.fairways!=null&&<Pip label="FW" value={detail.fairways}/>}
          </div>

          {detail.holes && (
            <div style={C.card}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:1,marginBottom:10}}>HÅL FÖR HÅL</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{color:"rgba(255,255,255,0.45)"}}>
                      {["Hål","Par","Slag","+/-","Putt","FW","GIR"].map(h=>(
                        <th key={h} style={{padding:"4px 5px",textAlign:"center",fontWeight:"normal"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.holes.map((hx,i)=>{
                      if(!hx.strokes) return null;
                      const d=hx.strokes-hx.par;
                      const si=scoreInfo(hx.strokes,hx.par);
                      return (
                        <tr key={i} style={{borderTop:"1px solid rgba(168,213,162,0.07)"}}>
                          <td style={{padding:"5px",textAlign:"center",color:"rgba(255,255,255,0.6)"}}>{hx.hole}</td>
                          <td style={{padding:"5px",textAlign:"center",color:"rgba(255,255,255,0.45)"}}>{hx.par}</td>
                          <td style={{padding:"5px",textAlign:"center",fontWeight:"bold",color:si.color}}>{hx.strokes}</td>
                          <td style={{padding:"5px",textAlign:"center",color:si.color}}>{d===0?"E":d>0?`+${d}`:d}</td>
                          <td style={{padding:"5px",textAlign:"center",color:"rgba(168,213,162,0.5)"}}>{hx.putts??"–"}</td>
                          <td style={{padding:"5px",textAlign:"center"}}>{hx.par>=4?(hx.fairway===true?"✓":hx.fairway===false?"✗":"–"):"–"}</td>
                          <td style={{padding:"5px",textAlign:"center"}}>{hx.gir===true?"✓":hx.gir===false?"✗":"–"}</td>
                        </tr>
                      );
                    })}
                    <tr style={{borderTop:"2px solid rgba(168,213,162,0.18)",fontWeight:"bold"}}>
                      <td colSpan={2} style={{padding:"6px 5px",color:"#ffffff"}}>Totalt</td>
                      <td style={{padding:"6px 5px",textAlign:"center",color:"#ffffff"}}>{detail.score}</td>
                      <td style={{padding:"6px 5px",textAlign:"center",color:(detail.score-(COURSES[detail.courseKey]?.par??72))<0?"#5fca5f":"#e09050"}}>
                        {(()=>{const d=detail.score-(COURSES[detail.courseKey]?.par??72);return d>=0?`+${d}`:d;})()}
                      </td>
                      <td style={{padding:"6px 5px",textAlign:"center",color:"#ffffff"}}>{detail.putts||"–"}</td>
                      <td style={{padding:"6px 5px",textAlign:"center",color:"#ffffff"}}>{detail.fairways??"-"}</td>
                      <td style={{padding:"6px 5px",textAlign:"center",color:"#ffffff"}}>{detail.gir??"-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATS */}
      {view==="stats" && (
        <div style={{padding:"18px 20px"}}>
          <div style={{fontSize:17,color:"#ffffff",marginBottom:14,fontWeight:"bold"}}>Statistik</div>
          {rounds.length<2
            ? <div style={{color:"rgba(168,213,162,0.35)",textAlign:"center",marginTop:60}}>Lägg till minst 2 rundor.</div>
            : <>
              <Block title="Slag per runda">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  <Pip label="Snitt" value={avg(scores)}/><Pip label="Bäst" value={Math.min(...scores)}/><Pip label="Sämst" value={Math.max(...scores)}/>
                </div>
              </Block>
              {girArr.length>0&&<Block title="Greenträff vid Inspel per runda">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  <Pip label="Snitt" value={`${girArr.length ? Math.round(girArr.reduce((a,b)=>a+b,0)/girArr.length/18*100) : 0}%`}/>
                  <Pip label="Bäst" value={Math.max(...girArr)}/>
                  <Pip label="Sämst" value={Math.min(...girArr)}/>
                </div>
              </Block>}
              {puttsArr.length>0&&<Block title="Puttar per runda">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  <Pip label="Snitt" value={avg(puttsArr)}/><Pip label="Bäst" value={Math.min(...puttsArr)}/><Pip label="Sämst" value={Math.max(...puttsArr)}/>
                </div>
              </Block>}
              {fwArr.length>0&&<Block title="Fairways träffade">
                {(()=>{
                  const totalFwHoles = rounds.reduce((a,r)=>{
                    const c = COURSES[r.courseKey];
                    return a + (c ? c.holes.filter(h=>h.par>=4).length : 14);
                  },0);
                  const totalFwHit = fwArr.reduce((a,b)=>a+b,0);
                  const pct = totalFwHoles ? Math.round(totalFwHit/totalFwHoles*100) : 0;
                  return (
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                      <Pip label="Snitt" value={`${pct}%`}/>
                      <Pip label="Bäst" value={Math.max(...fwArr)}/>
                      <Pip label="Sämst" value={Math.min(...fwArr)}/>
                    </div>
                  );
                })()}
              </Block>}
              {last10.length>=2&&<Block title="Slag – senaste 10 rundor">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={chartData} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,213,162,0.07)"/>
                    <XAxis dataKey="name" tick={{fill:"rgba(168,213,162,0.35)",fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis domain={["auto","auto"]} tick={{fill:"rgba(168,213,162,0.35)",fontSize:9}} axisLine={false} tickLine={false} width={26}/>
                    <Tooltip contentStyle={{background:"#0d2b14",border:"1px solid rgba(168,213,162,0.2)",borderRadius:8,fontSize:12}}/>
                    <Bar dataKey="Slag" fill="#4a9e4a" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </Block>}
              {["park","skog"].map(key=>{
                const cr=rounds.filter(r=>r.courseKey===key);
                if(!cr.length) return null;
                const cs=cr.map(r=>r.score);
                return <Block key={key} title={`${COURSES[key].emoji} ${COURSES[key].name} (${cr.length} rundor)`}>
                  <div style={{display:"flex",gap:20}}>
                    <Mini label="Snitt" value={avg(cs)}/><Mini label="Bäst" value={Math.min(...cs)}/><Mini label="Sämst" value={Math.max(...cs)}/>
                  </div>
                </Block>;
              })}

              {/* Score distribution */}
              {(()=>{
                const allHoles = rounds.flatMap(r=>r.holes||[]);
                let filtered = statLenFilter ? allHoles.filter(h=>h.inspelLen===statLenFilter) : allHoles;
                filtered = statTeeFilter ? filtered.filter(h=>h.teeClub===statTeeFilter) : filtered;
                filtered = statParFilter ? filtered.filter(h=>h.par===statParFilter) : filtered;
                const scored = filtered.filter(h=>h.strokes!=null && h.par!=null);
                if(!scored.length) return null;
                const total = scored.length;
                const count = (fn) => scored.filter(fn).length;
                const pct = (n) => total ? Math.round(n/total*100) : 0;
                const hio     = count(h=>h.strokes===1);
                const eagles  = count(h=>h.strokes-h.par<=-2 && h.strokes!==1);
                const birdies = count(h=>h.strokes-h.par===-1);
                const pars    = count(h=>h.strokes-h.par===0);
                const bogeys  = count(h=>h.strokes-h.par===1);
                const doubles = count(h=>h.strokes-h.par===2);
                const worse   = count(h=>h.strokes-h.par>=3);
                const rows = [
                  {label:"HIO 🏆",      n:hio,     color:"#FFD700"},
                  {label:"Eagle 🦅",    n:eagles,  color:"#FF8C00"},
                  {label:"Birdie 🐦",   n:birdies, color:"#e05050"},
                  {label:"Par",         n:pars,    color:"#5fca5f"},
                  {label:"Bogey",       n:bogeys,  color:"#b0b0b0"},
                  {label:"Dubbel",      n:doubles, color:"#808080"},
                  {label:"+3 el. mer",  n:worse,   color:"#505050"},
                ];
                return (
                  <Block title={`Slagfördelning (${total} hål)`}>
                    <div style={{display:"flex",gap:4,marginBottom:8}}>
                      {[null,"<75","75-100","100-125","125-150",">150"].map(v=>{
                        const active=statLenFilter===v;
                        return <button key={v??'all'} onClick={()=>setStatLenFilter(v)} style={{
                          flex:1,padding:"6px 2px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:10,
                          background:active?"rgba(95,202,95,0.22)":"rgba(255,255,255,0.05)",
                          border:active?"1px solid #5fca5f":"1px solid rgba(168,213,162,0.14)",
                          color:active?"#5fca5f":"rgba(255,255,255,0.55)",
                        }}>{v??'Alla'}</button>;
                      })}
                    </div>
                    <div style={{display:"flex",gap:4,marginBottom:12}}>
                      {[null,"Dr","FW","Hy","Ir"].map(v=>{
                        const active=statTeeFilter===v;
                        return <button key={v??'all'} onClick={()=>setStatTeeFilter(v)} style={{
                          flex:1,padding:"6px 2px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:"bold",
                          background:active?"rgba(95,202,95,0.22)":"rgba(255,255,255,0.05)",
                          border:active?"1px solid #5fca5f":"1px solid rgba(168,213,162,0.14)",
                          color:active?"#5fca5f":"rgba(255,255,255,0.55)",
                        }}>{v??'Alla'}</button>;
                      })}
                    </div>
                    <div style={{display:"flex",gap:4,marginBottom:12}}>
                      {[null,3,4,5].map(v=>{
                        const active=statParFilter===v;
                        return <button key={v??'all'} onClick={()=>setStatParFilter(v)} style={{
                          flex:1,padding:"6px 2px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:"bold",
                          background:active?"rgba(95,202,95,0.22)":"rgba(255,255,255,0.05)",
                          border:active?"1px solid #5fca5f":"1px solid rgba(168,213,162,0.14)",
                          color:active?"#5fca5f":"rgba(255,255,255,0.55)",
                        }}>{v?`Par ${v}`:'Alla'}</button>;
                      })}
                    </div>
                    {rows.map(({label,n,color})=>{
                      const p=pct(n);
                      return (
                        <div key={label} style={{marginBottom:7}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                            <span style={{fontSize:12,color:"rgba(168,213,162,0.7)"}}>{label}</span>
                            <span style={{fontSize:12,color,fontWeight:"bold"}}>{p}% <span style={{color:"rgba(255,255,255,0.4)",fontWeight:"normal"}}>({n})</span></span>
                          </div>
                          <div style={{height:6,background:"rgba(168,213,162,0.08)",borderRadius:3}}>
                            <div style={{height:6,background:color,borderRadius:3,width:p+"%",opacity:0.7}}/>
                          </div>
                        </div>
                      );
                    })}
                  </Block>
                );
              })()}

              {/* Green zone + Miss zone statistik */}
              {(()=>{
                const allHoles = rounds.flatMap(r=>r.holes||[]);
                const filtered = statLenFilter ? allHoles.filter(h=>h.inspelLen===statLenFilter) : allHoles;
                const withGZ = filtered.filter(h=>h.greenZone);
                const withMZ = filtered.filter(h=>h.missZone);
                if(!withGZ.length && !withMZ.length) return null;

                const greenZones = ["BV","B","BH","V","C","H","FV","F","FH"];
                const missZones  = ["BV","B","BH","V",null,"H","FV","F","FH"];

                const heatColor = (pct, max) => {
                  if(pct===0) return {bg:"rgba(255,255,255,0.03)", border:"rgba(168,213,162,0.1)", text:"rgba(168,213,162,0.25)"};
                  const t = max>0?pct/max:0;
                  const r = Math.round(80  + t*148);
                  const g = Math.round(140 + t*73);
                  const b = Math.round(50  - t*30);
                  return {
                    bg:`rgba(${r},${g},${b},${0.15+t*0.35})`,
                    border:`rgba(${r},${g},${b},${0.3+t*0.4})`,
                    text:`rgb(${r},${g},${b})`,
                  };
                };
                const heatGreen = heatColor;
                const heatRed   = heatColor;

                const LenFilter = () => (
                  <div style={{display:"flex",gap:4,marginBottom:12}}>
                    {[null,"<75","75-100","100-125","125-150",">150"].map(v=>{
                      const active=statLenFilter===v;
                      return <button key={v??'all'} onClick={()=>setStatLenFilter(v)} style={{
                        flex:1,padding:"6px 2px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:10,
                        background:active?"rgba(95,202,95,0.22)":"rgba(255,255,255,0.05)",
                        border:active?"1px solid #5fca5f":"1px solid rgba(168,213,162,0.14)",
                        color:active?"#5fca5f":"rgba(255,255,255,0.55)",
                      }}>{v??'Alla'}</button>;
                    })}
                  </div>
                );

                return <>
                  {withGZ.length>0 && (()=>{
                    const counts = Object.fromEntries(greenZones.map(z=>[z, withGZ.filter(h=>h.greenZone===z).length]));
                    const maxPct = Math.max(...greenZones.map(z=>withGZ.length?counts[z]/withGZ.length*100:0));
                    return (
                      <Block title={`Greenträff – zoner (${withGZ.length})`}>
                        <LenFilter/>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                          {greenZones.map((zid,i)=>{
                            const n=counts[zid]||0;
                            const pct=withGZ.length?Math.round(n/withGZ.length*100):0;
                            const hc=heatGreen(pct,maxPct);
                            return (
                              <div key={i} style={{padding:"8px 4px",borderRadius:10,textAlign:"center",background:hc.bg,border:`1px solid ${hc.border}`}}>
                                <div style={{fontSize:11,color:"rgba(168,213,162,0.5)",marginBottom:2}}>{zid}</div>
                                <div style={{fontSize:16,fontWeight:"bold",color:hc.text}}>{pct>0?pct+"%":"–"}</div>
                                <div style={{fontSize:9,color:"rgba(168,213,162,0.35)"}}>{n>0?n:""}</div>
                              </div>
                            );
                          })}
                        </div>
                      </Block>
                    );
                  })()}
                  {withMZ.length>0 && (()=>{
                    const counts = Object.fromEntries(missZones.filter(Boolean).map(z=>[z, withMZ.filter(h=>h.missZone===z).length]));
                    const maxPct = Math.max(...missZones.filter(Boolean).map(z=>withMZ.length?counts[z]/withMZ.length*100:0));
                    const missLabel = {BV:"LV",B:"L",BH:"LH",V:"V",H:"H",FV:"KV",F:"K",FH:"KH"};
                    return (
                      <Block title={`Greenmiss – zoner (${withMZ.length})`}>
                        <LenFilter/>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                          {missZones.map((zid,i)=>{
                            if(!zid) return <div key={i}/>;
                            const n=counts[zid]||0;
                            const pct=withMZ.length?Math.round(n/withMZ.length*100):0;
                            const hc=heatRed(pct,maxPct);
                            return (
                              <div key={i} style={{padding:"8px 4px",borderRadius:10,textAlign:"center",background:hc.bg,border:`1px solid ${hc.border}`}}>
                                <div style={{fontSize:11,color:"rgba(168,213,162,0.5)",marginBottom:2}}>{missLabel[zid]}</div>
                                <div style={{fontSize:16,fontWeight:"bold",color:hc.text}}>{pct>0?pct+"%":"–"}</div>
                                <div style={{fontSize:9,color:"rgba(168,213,162,0.35)"}}>{n>0?n:""}</div>
                              </div>
                            );
                          })}
                        </div>
                      </Block>
                    );
                  })()}
                </>;
              })()}
            </>
          }
        </div>
      )}

      {/* INSTÄLLNINGAR */}
      {view==="settings" && (
        <div style={{padding:"18px 20px"}}>
          <div style={{fontSize:17,color:"#ffffff",marginBottom:6,fontWeight:"bold"}}>Inställningar</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:20}}>Hantera din data och GitHub-synkning.</div>

          {/* GitHub Gist */}
          <div style={{...C.card,marginBottom:14}}>
            <div style={{fontSize:13,color:"#ffffff",fontWeight:"bold",marginBottom:4}}>🐙 GitHub Gist – synkning</div>
            <div style={{fontSize:12,color:"rgba(168,213,162,0.5)",marginBottom:12}}>
              Datan sparas som en privat Gist på ditt GitHub-konto och synkas automatiskt efter varje runda.{" "}
              <span style={{color:"rgba(255,255,255,0.6)"}}>Token kräver bara <code>gist</code>-behörighet.</span>
            </div>
            <span style={C.lbl}>Personal Access Token</span>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={gistToken}
              onChange={e=>{
                setGistToken(e.target.value);
                localStorage.setItem(GIST_TOKEN_KEY, e.target.value);
                setGistStatus("");
              }}
              style={{...C.inp, marginBottom:10, fontFamily:"monospace", fontSize:13}}
            />
            <span style={C.lbl}>Gist ID <span style={{color:"rgba(255,255,255,0.3)",textTransform:"none",letterSpacing:0}}>(lämna tomt för att skapa nytt)</span></span>
            <input
              type="text"
              placeholder="abc123def456..."
              value={gistId}
              onChange={e=>{
                setGistId(e.target.value);
                localStorage.setItem(GIST_ID_KEY, e.target.value);
                setGistStatus("");
              }}
              style={{...C.inp, marginBottom:10, fontFamily:"monospace", fontSize:13}}
            />
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <button onClick={()=>syncToGist(rounds)} style={{...C.btn,flex:1,background:"#24292e",fontSize:13}}>
                ↑ Ladda upp till GitHub
              </button>
              <button onClick={loadFromGist} style={{...C.btn,flex:1,background:"#24292e",fontSize:13}}>
                ↓ Hämta från GitHub
              </button>
            </div>
            {gistStatus && (
              <div style={{
                padding:"9px 12px", borderRadius:9, fontSize:12,
                background: gistStatus.startsWith("✓")?"rgba(95,202,95,0.1)":gistStatus.startsWith("⏳")?"rgba(168,213,162,0.06)":"rgba(220,80,80,0.1)",
                border:`1px solid ${gistStatus.startsWith("✓")?"rgba(95,202,95,0.3)":gistStatus.startsWith("⏳")?"rgba(168,213,162,0.15)":"rgba(220,80,80,0.3)"}`,
                color: gistStatus.startsWith("✓")?"#5fca5f":gistStatus.startsWith("⏳")?"rgba(255,255,255,0.6)":"#e05050",
              }}>{gistStatus}</div>
            )}
          </div>

          {/* Exportera */}
          <div style={{...C.card,marginBottom:14}}>
            <div style={{fontSize:13,color:"#ffffff",fontWeight:"bold",marginBottom:4}}>📤 Exportera data</div>
            <div style={{fontSize:12,color:"rgba(168,213,162,0.5)",marginBottom:14}}>
              Kopiera texten och klistra in i en ny fil, t.ex. <span style={{color:"#ffffff"}}>golf-stats.json</span>. Spara den i iCloud Drive eller Filer-appen.
            </div>
            <button onClick={()=>{
              navigator.clipboard.writeText(JSON.stringify(rounds, null, 2))
                .then(()=>setImportMsg("✓ Kopierat! Klistra in i en .json-fil och spara."))
                .catch(()=>setImportMsg("✗ Kunde inte kopiera automatiskt – markera texten nedan manuellt."));
            }} style={{...C.btn, background:"#2d5a8a", marginBottom:10}}>
              📋 Kopiera data ({rounds.length} {rounds.length===1?"runda":"rundor"})
            </button>
            <textarea readOnly value={JSON.stringify(rounds, null, 2)} style={{
              ...C.inp, fontSize:10, height:90, resize:"none", fontFamily:"monospace",
              color:"rgba(168,213,162,0.5)",
            }}/>
          </div>

          {/* Importera */}
          <div style={{...C.card,marginBottom:14}}>
            <div style={{fontSize:13,color:"#ffffff",fontWeight:"bold",marginBottom:4}}>📥 Importera data</div>
            <div style={{fontSize:12,color:"rgba(168,213,162,0.5)",marginBottom:14}}>
              Läs in en tidigare exporterad JSON-fil. Befintliga rundor behålls – dubbletter ignoreras.
            </div>
            <label style={{
              display:"block", width:"100%", padding:"14px", background:"rgba(45,90,138,0.3)",
              border:"1px solid rgba(100,160,220,0.3)", borderRadius:12, color:"#ffffff",
              fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:"bold",
              textAlign:"center", boxSizing:"border-box",
            }}>
              Välj fil att importera
              <input type="file" accept=".json" style={{display:"none"}} onChange={e=>{
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  try {
                    const imported = JSON.parse(ev.target.result);
                    if (!Array.isArray(imported)) throw new Error();
                    const existingIds = new Set(rounds.map(r=>r.id));
                    const newRounds = imported.filter(r=>!existingIds.has(r.id));
                    setRounds(prev => [...newRounds, ...prev].sort((a,b)=>new Date(b.date)-new Date(a.date)));
                    setImportMsg(`✓ ${newRounds.length} nya rundor importerade${imported.length-newRounds.length>0?`, ${imported.length-newRounds.length} dubbletter ignorerades`:""}.`);
                  } catch {
                    setImportMsg("✗ Kunde inte läsa filen. Kontrollera att det är en giltig golf-stats-fil.");
                  }
                };
                reader.readAsText(file);
                e.target.value = "";
              }}/>
            </label>
            {importMsg && (
              <div style={{
                marginTop:10, padding:"10px 14px", borderRadius:10, fontSize:12,
                background: importMsg.startsWith("✓") ? "rgba(95,202,95,0.1)" : "rgba(220,80,80,0.1)",
                border: `1px solid ${importMsg.startsWith("✓") ? "rgba(95,202,95,0.3)" : "rgba(220,80,80,0.3)"}`,
                color: importMsg.startsWith("✓") ? "#5fca5f" : "#e05050",
              }}>{importMsg}</div>
            )}
          </div>

          {/* Rensa all data */}
          <div style={C.card}>
            <div style={{fontSize:13,color:"#e08080",fontWeight:"bold",marginBottom:4}}>🗑 Rensa all data</div>
            <div style={{fontSize:12,color:"rgba(168,213,162,0.5)",marginBottom:14}}>
              Tar bort alla rundor permanent. Exportera först om du vill spara datan.
            </div>
            <button onClick={()=>setConfirmClear(true)} style={{...C.btn,background:"#7a2020"}}>
              Rensa all data
            </button>
          </div>
        </div>
      )}

      {/* Confirm clear modal */}
      {confirmClear && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
          <div style={{background:"#0d2b14",border:"1px solid rgba(168,213,162,0.2)",borderRadius:16,padding:24,maxWidth:300,width:"90%"}}>
            <div style={{fontSize:16,color:"#e08080",marginBottom:8}}>Rensa all data?</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:20}}>Alla {rounds.length} rundor raderas permanent.</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setRounds([]);setConfirmClear(false);}} style={{...C.btn,background:"#7a2020",flex:1}}>Rensa</button>
              <button onClick={()=>setConfirmClear(false)} style={{...C.btnO,flex:1}}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {delId && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
          <div style={{background:"#0d2b14",border:"1px solid rgba(168,213,162,0.2)",borderRadius:16,padding:24,maxWidth:300,width:"90%"}}>
            <div style={{fontSize:16,color:"#ffffff",marginBottom:8}}>Ta bort runda?</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:20}}>Kan inte ångras.</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setRounds(rounds.filter(r=>r.id!==delId));setDelId(null);}}
                style={{...C.btn,background:"#7a2020",flex:1}}>Ta bort</button>
              <button onClick={()=>setDelId(null)} style={{...C.btnO,flex:1}}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {!["courseSelect","playing","editing"].includes(view) && nav}
    </div>
  );
}
