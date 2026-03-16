import { useState, useRef, useEffect, Fragment } from "react";

// ─────────────────────────────────────────────
//  SUPABASE CONFIG  ← paste your values here
// ─────────────────────────────────────────────
const SUPABASE_URL  = "https://oapcqfahkynkgxqkyeru.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGNxZmFoa3lua2d4cWt5ZXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTExMTMsImV4cCI6MjA4OTI2NzExM30.g11nlp1LoIh4WdACvqhx7VuT1CcTxI6Gud0s2c2VYTs";

// ─────────────────────────────────────────────
//  EMAILJS CONFIG   ← paste your values here
// ─────────────────────────────────────────────
const EMAILJS_SERVICE  = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE = "YOUR_TEMPLATE_ID";
const EMAILJS_KEY      = "YOUR_PUBLIC_KEY";

// ── Supabase client (loaded from CDN, no npm needed in artifact) ──
let sb = null;
async function getSupabase() {
  if (sb) return sb;
  if (!window.supabase) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return sb;
}

// ── Supabase helpers ──
async function dbUpsertUser({ email, name, age, weight, height, level, diet, goal, equip, plan }) {
  if (SUPABASE_URL === "YOUR_SUPABASE_URL") return null; // not configured yet
  const client = await getSupabase();
  const { data, error } = await client.from("users").upsert(
    { email, name, age, weight, height, level, diet, goal, equipment: equip.join(","), plan, updated_at: new Date().toISOString() },
    { onConflict: "email" }
  ).select().single();
  if (error) console.error("Supabase upsert error:", error);
  return data;
}

async function dbSavePlan({ email, workout_plan, meal_plan }) {
  if (SUPABASE_URL === "YOUR_SUPABASE_URL") return null;
  const client = await getSupabase();
  const { error } = await client.from("users")
    .update({ workout_plan, meal_plan, plan_generated_at: new Date().toISOString() })
    .eq("email", email);
  if (error) console.error("Supabase save plan error:", error);
}

async function dbLoadUser(email) {
  if (SUPABASE_URL === "YOUR_SUPABASE_URL") return null;
  const client = await getSupabase();
  const { data, error } = await client.from("users").select("*").eq("email", email).single();
  if (error) return null;
  return data;
}

// ── EmailJS ──
let ejsReady = false;
async function sendVerificationEmail(toEmail, code) {
  if (!ejsReady) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    window.emailjs.init({ publicKey: EMAILJS_KEY });
    ejsReady = true;
  }
  await window.emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_email: toEmail,
    code,
    app_name: "FitPlan Pro",
  });
}

// ── Claude API ──
async function askClaude(userMessage, systemPrompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: userMessage }], system: systemPrompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.content||[]).map(b=>b.text||"").join("");
}
async function askClaudeChat(messages, systemPrompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system: systemPrompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.content||[]).map(b=>b.text||"").join("");
}

function makeCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

// ── Styles ──
const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#080c10;--bg2:#131920;--bg3:#1a2230;
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.13);
  --text:#f0f4f8;--muted:#6b7a8d;--muted2:#9aabb8;
  --green:#00e5a0;--green2:#00b87a;--green-bg:rgba(0,229,160,0.08);--green-bg2:rgba(0,229,160,0.15);
  --gold:#f5c542;--red:#ff4d6d;
  --syne:'Syne',sans-serif;--inter:'Inter',sans-serif;
}
html,body,#root{height:100%;}
body{background:var(--bg);color:var(--text);font-family:var(--inter);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:var(--bg);}::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:4px;}
.app{height:100vh;display:flex;flex-direction:column;}
.app::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,229,160,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,0.025) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0;}
.topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px;border-bottom:1px solid var(--border);background:rgba(8,12,16,0.9);backdrop-filter:blur(12px);flex-shrink:0;}
.logo{font-family:var(--syne);font-size:20px;font-weight:800;background:linear-gradient(135deg,#fff 30%,var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.topbar-right{display:flex;align-items:center;gap:12px;}
.db-dot{width:8px;height:8px;border-radius:50%;background:var(--muted);flex-shrink:0;}
.db-dot.connected{background:var(--green);box-shadow:0 0 6px rgba(0,229,160,.6);}
.db-label{font-size:11px;color:var(--muted);font-weight:500;}
.progress-wrap{position:relative;z-index:10;padding:22px 40px 0;flex-shrink:0;}
.steps-row{display:flex;align-items:center;max-width:560px;margin:0 auto;}
.step-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--syne);font-size:11px;font-weight:700;border:1.5px solid var(--border2);background:var(--bg2);color:var(--muted);flex-shrink:0;transition:all .3s;}
.step-dot.done{background:var(--green);border-color:var(--green);color:#000;}
.step-dot.active{background:var(--bg3);border-color:var(--green);color:var(--green);box-shadow:0 0 14px rgba(0,229,160,.2);}
.step-line{flex:1;height:1.5px;background:var(--border2);transition:background .3s;}
.step-line.done{background:var(--green);}
.steps-labels{display:flex;justify-content:space-between;max-width:560px;margin:6px auto 0;}
.steps-labels span{font-size:9px;color:var(--muted);letter-spacing:.05em;text-transform:uppercase;font-weight:600;}
.steps-labels span.active{color:var(--green);}
.page-scroll{flex:1;overflow-y:auto;position:relative;z-index:5;}
.page-inner{max-width:600px;margin:0 auto;padding:36px 24px 44px;animation:fadeUp .35s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
.page-heading{font-family:var(--syne);font-size:30px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:8px;}
.page-heading em{font-style:normal;color:var(--green);}
.page-sub{font-size:14px;color:var(--muted2);line-height:1.6;margin-bottom:26px;}
.field{margin-bottom:15px;}
.field-label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:6px;}
.finput,.fselect{width:100%;padding:12px 14px;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;font-family:var(--inter);font-size:15px;color:var(--text);outline:none;transition:all .2s;}
.finput:focus,.fselect:focus{border-color:var(--green);background:var(--bg3);box-shadow:0 0 0 3px rgba(0,229,160,.1);}
.finput::placeholder{color:var(--muted);}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.fselect option{background:var(--bg2);}
.verify-box{background:var(--bg2);border:1px solid var(--border2);border-radius:16px;padding:30px;text-align:center;}
.verify-icon{font-size:42px;margin-bottom:14px;}
.verify-title{font-family:var(--syne);font-size:21px;font-weight:800;margin-bottom:7px;}
.verify-sub{font-size:13.5px;color:var(--muted2);line-height:1.6;margin-bottom:26px;}
.verify-email-shown{color:var(--green);font-weight:600;}
.code-row{display:flex;gap:10px;justify-content:center;margin-bottom:18px;}
.code-input{width:50px;height:58px;text-align:center;font-family:var(--syne);font-size:22px;font-weight:800;background:var(--bg3);border:1.5px solid var(--border2);border-radius:11px;color:var(--text);outline:none;transition:all .2s;}
.code-input:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(0,229,160,.1);}
.resend-btn{background:none;border:none;color:var(--muted2);font-size:13px;cursor:pointer;text-decoration:underline;font-family:var(--inter);padding:0;}
.resend-btn:hover{color:var(--green);}
.resend-btn:disabled{opacity:.4;cursor:not-allowed;text-decoration:none;}
.goal-grid{display:flex;flex-direction:column;gap:10px;margin-bottom:22px;}
.goal-chip{padding:14px 16px;border-radius:13px;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px;}
.goal-chip:hover{border-color:rgba(0,229,160,.3);background:var(--bg3);}
.goal-chip.sel{border-color:var(--green);background:var(--green-bg2);}
.gi{font-size:22px;flex-shrink:0;}
.gt{font-family:var(--syne);font-size:14px;font-weight:700;}
.gd{font-size:12px;color:var(--muted2);margin-top:1px;}
.goal-chip.sel .gt{color:var(--green);}
.grad{margin-left:auto;width:19px;height:19px;border-radius:50%;border:2px solid var(--border2);flex-shrink:0;transition:all .2s;}
.goal-chip.sel .grad{border-color:var(--green);background:var(--green);}
.eq-sec{margin-bottom:19px;}
.eq-title{font-family:var(--syne);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);padding-bottom:8px;margin-bottom:10px;}
.chip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:8px;}
.chip{padding:12px;border-radius:10px;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px;}
.chip:hover{border-color:rgba(0,229,160,.3);background:var(--bg3);}
.chip.sel{border-color:var(--green);background:var(--green-bg2);}
.cicon{font-size:17px;flex-shrink:0;}
.ctext{font-size:12px;font-weight:500;line-height:1.3;}
.chip.sel .ctext{color:var(--green);}
.pricing-wrap{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.pcard{padding:20px 16px;border-radius:14px;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
.pcard:hover{border-color:rgba(0,229,160,.25);}
.pcard.sel{border-color:var(--green);background:var(--green-bg);}
.pcard.featured{border-color:rgba(245,197,66,.35);}
.pcard.featured.sel{background:rgba(245,197,66,.05);border-color:var(--gold);}
.pbadge{position:absolute;top:0;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;font-family:var(--syne);font-size:9px;font-weight:800;padding:3px 10px;border-radius:0 0 8px 8px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;}
.pprice{font-family:var(--syne);font-size:24px;font-weight:800;margin-bottom:1px;}
.pprice span{font-size:12px;font-weight:400;color:var(--muted2);}
.pname{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;}
.pfeats{list-style:none;display:flex;flex-direction:column;gap:6px;}
.pfeats li{font-size:11px;color:var(--muted2);display:flex;align-items:flex-start;gap:6px;line-height:1.4;}
.pfeats li .ck{flex-shrink:0;color:var(--green);font-weight:700;}
.pfeats li.no{opacity:.4;}
.pfeats li.no .ck{color:var(--muted);}
.pcard.featured .pprice{color:var(--gold);}
.summary{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:14px;margin-bottom:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.slabel{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:600;margin-bottom:3px;}
.sval{font-family:var(--syne);font-size:13px;font-weight:700;}
.sticky-bar{position:sticky;bottom:0;left:0;right:0;background:rgba(8,12,16,0.97);backdrop-filter:blur(16px);border-top:1px solid var(--border);padding:13px 24px;margin:0 -24px -44px;z-index:50;}
.sticky-bar-inner{max-width:600px;margin:0 auto;display:flex;gap:10px;}
.btn-p{flex:1;padding:13px;border-radius:11px;background:linear-gradient(135deg,var(--green),var(--green2));color:#000;font-family:var(--syne);font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;}
.btn-p:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,229,160,.25);}
.btn-p:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-s{padding:12px 18px;border-radius:10px;border:1px solid var(--border2);background:transparent;color:var(--muted2);font-family:var(--inter);font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-s:hover{color:var(--text);background:var(--bg2);}
.btn-full{width:100%;}
.lbar-wrap{margin:16px 0;}
.lbar-lbl{font-size:13px;color:var(--muted2);margin-bottom:7px;display:flex;justify-content:space-between;}
.lbar{height:3px;background:var(--bg3);border-radius:4px;overflow:hidden;}
.lfill{height:100%;background:linear-gradient(90deg,var(--green2),var(--green));border-radius:4px;transition:width .5s ease;}
.rtabs{display:flex;gap:4px;margin-bottom:16px;background:var(--bg2);border-radius:10px;padding:4px;border:1px solid var(--border);}
.rtab{flex:1;padding:8px;border-radius:7px;border:none;background:transparent;font-family:var(--syne);font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .2s;}
.rtab.active{background:var(--bg3);color:var(--green);}
.rbody{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:22px;white-space:pre-wrap;font-size:13px;line-height:1.9;color:var(--muted2);}
.chat-msgs{overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding-bottom:8px;max-height:calc(100vh - 340px);min-height:140px;}
.mrow{display:flex;gap:9px;align-items:flex-end;}
.mrow.user{flex-direction:row-reverse;}
.mav{width:27px;height:27px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;}
.mav.bot{background:var(--green-bg2);}
.mav.user{background:var(--bg3);border:1px solid var(--border2);font-size:9px;font-weight:700;color:var(--green);}
.mbub{max-width:78%;padding:10px 13px;border-radius:13px;font-size:13px;line-height:1.65;}
.mbub.bot{background:var(--bg2);border:1px solid var(--border);border-bottom-left-radius:3px;}
.mbub.user{background:var(--bg3);border:1px solid var(--border2);border-bottom-right-radius:3px;color:var(--text);}
.cinrow{display:flex;gap:9px;padding-top:12px;border-top:1px solid var(--border);margin-top:13px;}
.cin{flex:1;padding:11px 13px;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;font-family:var(--inter);font-size:14px;color:var(--text);outline:none;transition:all .2s;}
.cin:focus{border-color:var(--green);}
.cin::placeholder{color:var(--muted);}
.csend{padding:11px 15px;background:var(--green);color:#000;border:none;border-radius:10px;font-family:var(--syne);font-size:13px;font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap;}
.csend:hover:not(:disabled){background:var(--green2);}
.csend:disabled{opacity:.4;cursor:not-allowed;}
.spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.1);border-top-color:var(--green);border-radius:50%;animation:rot .7s linear infinite;display:inline-block;vertical-align:middle;}
@keyframes rot{to{transform:rotate(360deg);}}
.msg-ok{background:rgba(0,229,160,.1);border:1px solid rgba(0,229,160,.25);color:var(--green);border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:13px;text-align:center;}
.msg-err{background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.3);color:var(--red);border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:13px;text-align:center;}
.dnav{position:relative;z-index:10;border-bottom:1px solid var(--border);background:rgba(8,12,16,.8);backdrop-filter:blur(12px);display:flex;padding:0 30px;flex-shrink:0;}
.dtab{padding:13px 16px;font-family:var(--syne);font-size:13px;font-weight:600;color:var(--muted);border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
.dtab:hover{color:var(--text);}
.dtab.active{color:var(--green);border-bottom-color:var(--green);}
.pro-badge{margin-left:8px;background:rgba(245,197,66,.15);color:var(--gold);padding:2px 8px;border-radius:100px;font-size:11px;font-weight:700;}
.profile-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);}
.profile-row:last-child{border-bottom:none;}
.saved-banner{background:rgba(0,229,160,.08);border:1px solid rgba(0,229,160,.2);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:13px;color:var(--muted2);}
.saved-banner strong{color:var(--green);}
@media(max-width:600px){
  .topbar,.progress-wrap{padding-left:16px;padding-right:16px;}
  .page-inner{padding:24px 14px 44px;}
  .page-heading{font-size:25px;}
  .pricing-wrap,.frow{grid-template-columns:1fr;}
  .summary{grid-template-columns:1fr 1fr;}
  .dnav{padding:0 8px;overflow-x:auto;}
  .code-input{width:43px;height:52px;font-size:20px;}
  .sticky-bar{margin:0 -14px -44px;padding:12px 14px;}
}
`;

const GOALS = [
  {id:"weight_loss",icon:"🔥",title:"Weight Loss",desc:"Burn fat, improve endurance, lean out"},
  {id:"muscle_gain",icon:"💪",title:"Muscle Gain",desc:"Build strength and muscle mass"},
  {id:"athletic",icon:"⚡",title:"Athletic Performance",desc:"Speed, power, sport-specific training"},
  {id:"general",icon:"🌿",title:"General Health",desc:"Balance, mobility, overall wellness"},
  {id:"recomp",icon:"⚖️",title:"Body Recomposition",desc:"Lose fat and gain muscle simultaneously"},
];
const EQUIPMENT = {
  "Free Weights":[{id:"dumbbells",icon:"🏋️",text:"Dumbbells"},{id:"barbells",icon:"🔩",text:"Barbells"},{id:"kettles",icon:"🫙",text:"Kettlebells"},{id:"ez_bar",icon:"〰️",text:"EZ / Curl Bar"},{id:"bands",icon:"🔁",text:"Resistance Bands"}],
  "Cardio Machines":[{id:"treadmill",icon:"🏃",text:"Treadmill"},{id:"bike",icon:"🚴",text:"Stationary Bike"},{id:"rower",icon:"🚣",text:"Rowing Machine"},{id:"elliptic",icon:"🌀",text:"Elliptical"},{id:"stairs",icon:"🪜",text:"Stairmaster"}],
  "Strength Machines":[{id:"cable",icon:"🔗",text:"Cable Machine"},{id:"legpress",icon:"🦵",text:"Leg Press"},{id:"latpull",icon:"⬇️",text:"Lat Pulldown"},{id:"chestmach",icon:"📐",text:"Chest Press"},{id:"smith",icon:"🏗️",text:"Smith Machine"}],
  "Bodyweight / Other":[{id:"pullupbar",icon:"🔲",text:"Pull-up Bar"},{id:"dipbars",icon:"🤸",text:"Dip Bars"},{id:"bench",icon:"🪑",text:"Weight Bench"},{id:"sqrack",icon:"🏗️",text:"Squat Rack"},{id:"mat",icon:"🟩",text:"Yoga Mat / Floor"},{id:"nobody",icon:"🏠",text:"No Equipment"}],
};
const DIETS=["No Restrictions","Vegetarian","Vegan","Keto","Paleo","Gluten-Free","High Protein","Intermittent Fasting"];
const LEVELS=["Beginner","Intermediate","Advanced"];
const STEPS=["Email","Profile","Goal","Equipment","Plan"];

export default function App() {
  const [screen,setScreen]=useState("onboard");
  const [step,setStep]=useState(0);
  const [dashTab,setDashTab]=useState("plan");
  const [resultTab,setResultTab]=useState("workout");
  const [dbConnected,setDbConnected]=useState(false);

  // email verify
  const [email,setEmail]=useState("");
  const [sentCode,setSentCode]=useState("");
  const [codeInputs,setCodeInputs]=useState(["","","","","",""]);
  const [codeSent,setCodeSent]=useState(false);
  const [sending,setSending]=useState(false);
  const [verifying,setVerifying]=useState(false);
  const [verified,setVerified]=useState(false);
  const [verifyError,setVerifyError]=useState("");
  const [resendTimer,setResendTimer]=useState(0);
  const codeRefs=[useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const timerRef=useRef(null);

  const [profile,setProfile]=useState({name:"",age:"",weight:"",height:"",level:"Beginner",diet:"No Restrictions"});
  const [goal,setGoal]=useState("");
  const [equip,setEquip]=useState([]);
  const [plan,setPlan]=useState("basic");

  const [mealPlan,setMealPlan]=useState("");
  const [workoutPlan,setWorkoutPlan]=useState("");
  const [generating,setGenerating]=useState(false);
  const [progress,setProgress]=useState(0);
  const [genError,setGenError]=useState("");
  const [statusMsg,setStatusMsg]=useState("");
  const [planSaved,setPlanSaved]=useState(false);

  const [msgs,setMsgs]=useState([{role:"bot",text:"Hey! I'm your AI coach. Ask me anything about your plan, nutrition, or training."}]);
  const [chatIn,setChatIn]=useState("");
  const [chatBusy,setChatBusy]=useState(false);
  const msgEnd=useRef(null);
  useEffect(()=>{msgEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  // check db connection on mount
  useEffect(()=>{
    if(SUPABASE_URL!=="YOUR_SUPABASE_URL"){
      getSupabase().then(()=>setDbConnected(true)).catch(()=>setDbConnected(false));
    }
  },[]);

  const startTimer=()=>{
    setResendTimer(60);
    timerRef.current=setInterval(()=>{
      setResendTimer(t=>{if(t<=1){clearInterval(timerRef.current);return 0;}return t-1;});
    },1000);
  };
  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  const setP=(k,v)=>setProfile(p=>({...p,[k]:v}));
  const toggleEquip=id=>setEquip(e=>e.includes(id)?e.filter(x=>x!==id):[...e,id]);
  const profileValid=profile.name.trim()&&profile.age&&profile.weight;

  const handleSendCode=async()=>{
    if(!email.trim()||!email.includes("@")) return;
    setSending(true);
    setVerifyError("");
    const code=makeCode();
    setSentCode(code);
    try{
      await sendVerificationEmail(email.trim(),code);
      setCodeSent(true);
      startTimer();
    }catch(e){
      setCodeSent(true);
      startTimer();
      setVerifyError("DEMO MODE — EmailJS not set up. Your code is: "+code);
    }finally{setSending(false);}
  };

  const handleCodeInput=(i,val)=>{
    if(!/^\d*$/.test(val)) return;
    const next=[...codeInputs];
    next[i]=val.slice(-1);
    setCodeInputs(next);
    setVerifyError("");
    if(val&&i<5) codeRefs[i+1].current?.focus();
    if(val&&i===5){
      const full=[...next.slice(0,5),val.slice(-1)].join("");
      if(full.length===6) verifyCode(full);
    }
  };
  const handleCodeKey=(i,e)=>{
    if(e.key==="Backspace"&&!codeInputs[i]&&i>0) codeRefs[i-1].current?.focus();
  };
  const verifyCode=(code)=>{
    setVerifying(true);
    setTimeout(()=>{
      if(code===sentCode){
        setVerified(true);
        setVerifyError("");
        // check if returning user
        dbLoadUser(email).then(existing=>{
          if(existing&&existing.workout_plan){
            // returning user — restore their data
            setProfile({name:existing.name||"",age:existing.age||"",weight:existing.weight||"",height:existing.height||"",level:existing.level||"Beginner",diet:existing.diet||"No Restrictions"});
            setGoal(existing.goal||"");
            setEquip(existing.equipment?existing.equipment.split(","):[]);
            setPlan(existing.plan||"basic");
            setWorkoutPlan(existing.workout_plan||"");
            setMealPlan(existing.meal_plan||"");
            setTimeout(()=>{setScreen("dashboard");setDashTab("plan");},600);
          } else {
            setTimeout(()=>setStep(1),500);
          }
        });
      }else{
        setVerifyError("Incorrect code. Please try again.");
        setCodeInputs(["","","","","",""]);
        codeRefs[0].current?.focus();
      }
      setVerifying(false);
    },600);
  };

  const generate=async()=>{
    setGenerating(true);
    setGenError("");
    setProgress(10);
    const goalLabel=GOALS.find(g=>g.id===goal)?.title||goal;
    const equipList=equip.length>0?equip.join(", "):"no equipment";
    const ctx="Name: "+profile.name+", Age: "+profile.age+", Weight: "+profile.weight+", Height: "+(profile.height||"not specified")+", Level: "+profile.level+", Diet: "+profile.diet+", Goal: "+goalLabel+", Equipment: "+equipList;
    try{
      // save user profile to DB first
      setStatusMsg("Saving your profile...");
      await dbUpsertUser({email,name:profile.name,age:profile.age,weight:profile.weight,height:profile.height,level:profile.level,diet:profile.diet,goal,equip,plan});
      setProgress(15);

      setStatusMsg("Building your workout plan...");
      setProgress(25);
      const workout=await askClaude(
        "Create a 7-day workout plan for: "+ctx+". Write Day 1 through Day 7. For each workout day list 4-6 exercises with sets and reps. Mark rest days as REST DAY. Be concise.",
        "You are a personal trainer. Write workout plans in plain text. No markdown. Label each day as Day 1: Day 2: etc."
      );
      setWorkoutPlan(workout);
      setProgress(60);

      setStatusMsg("Creating your meal plan...");
      const meal=await askClaude(
        "Create a 7-day meal plan for: "+ctx+". Write Day 1 through Day 7. For each day list Breakfast, Lunch, Dinner, and Snack with simple portions.",
        "You are a nutritionist. Write meal plans in plain text. No markdown. Label each day as Day 1: Day 2: etc."
      );
      setMealPlan(meal);
      setProgress(90);

      setStatusMsg("Saving your plan...");
      await dbSavePlan({email,workout_plan:workout,meal_plan:meal});
      setPlanSaved(true);
      setProgress(100);
      setStatusMsg("Done!");
      setScreen("dashboard");
      setDashTab("plan");
    }catch(err){
      setGenError("Error: "+err.message+". Please try again.");
    }finally{
      setGenerating(false);
    }
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatBusy) return;
    const text=chatIn.trim();
    setChatIn("");
    setMsgs(m=>[...m,{role:"user",text}]);
    setChatBusy(true);
    const goalLabel=GOALS.find(g=>g.id===goal)?.title||"";
    const history=msgs.map(m=>({role:m.role==="bot"?"assistant":"user",content:m.text}));
    history.push({role:"user",content:text});
    try{
      const reply=await askClaudeChat(history,"You are a friendly expert AI fitness coach. User: "+profile.name+", Goal: "+goalLabel+", Level: "+profile.level+". Keep replies under 150 words.");
      setMsgs(m=>[...m,{role:"bot",text:reply}]);
    }catch{
      setMsgs(m=>[...m,{role:"bot",text:"Sorry, couldn't connect. Please try again!"}]);
    }finally{setChatBusy(false);}
  };

  const StepsBar=()=>(
    <div className="progress-wrap">
      <div className="steps-row">
        {STEPS.map((s,i)=>(
          <Fragment key={s}>
            <div className={["step-dot",i<step?"done":i===step?"active":""].filter(Boolean).join(" ")}>{i<step?"✓":i+1}</div>
            {i<STEPS.length-1&&<div className={["step-line",i<step?"done":""].filter(Boolean).join(" ")}/>}
          </Fragment>
        ))}
      </div>
      <div className="steps-labels">
        {STEPS.map((s,i)=><span key={s} className={i===step?"active":""}>{s}</span>)}
      </div>
    </div>
  );

  // ── DASHBOARD ──
  if(screen==="dashboard") return(
    <>
      <style>{G}</style>
      <div className="app">
        <header className="topbar">
          <div className="logo">FitPlan Pro</div>
          <div className="topbar-right">
            <div className={["db-dot",dbConnected?"connected":""].filter(Boolean).join(" ")}/>
            <span className="db-label">{dbConnected?"DB Connected":"No DB"}</span>
            <span style={{fontSize:13,color:"var(--muted)"}}>Hey, <strong style={{color:"var(--text)"}}>{profile.name}</strong> 👋</span>
          </div>
        </header>
        <nav className="dnav">
          {[["plan","My Plan"],["chat","AI Coach"],["profile","Profile"]].map(([id,lbl])=>(
            <button key={id} className={["dtab",dashTab===id?"active":""].filter(Boolean).join(" ")} onClick={()=>setDashTab(id)}>{lbl}</button>
          ))}
        </nav>
        <div className="page-scroll">
          <div className="page-inner">

            {dashTab==="plan"&&<>
              <div className="page-heading" style={{marginBottom:4}}>Your <em>7-Day</em> Plan</div>
              <p className="page-sub" style={{marginBottom:16}}>
                Goal: <strong style={{color:"var(--green)"}}>{GOALS.find(g=>g.id===goal)?.title}</strong>
                {" · "}{profile.level}{" · "}{profile.diet}
                {plan==="pro"&&<span className="pro-badge">PRO</span>}
              </p>
              {planSaved&&dbConnected&&(
                <div className="saved-banner">
                  <span>💾</span>
                  <span><strong>Plan saved to database.</strong> You can log back in anytime with your email to access it.</span>
                </div>
              )}
              <div className="rtabs">
                {[["workout","Workout Plan"],["meal","Meal Plan"]].map(([id,lbl])=>(
                  <button key={id} className={["rtab",resultTab===id?"active":""].filter(Boolean).join(" ")} onClick={()=>setResultTab(id)}>{lbl}</button>
                ))}
              </div>
              <div className="rbody">{resultTab==="workout"?workoutPlan:mealPlan}</div>
              {plan==="pro"&&<div style={{marginTop:14,padding:"12px 15px",background:"rgba(245,197,66,0.07)",border:"1px solid rgba(245,197,66,0.2)",borderRadius:10}}>
                <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,color:"var(--gold)",marginBottom:3}}>PRO — Adaptive Plan Active</div>
                <div style={{fontSize:12,color:"var(--muted2)"}}>Your plan updates weekly based on progress. Log workouts with your AI Coach.</div>
              </div>}
            </>}

            {dashTab==="chat"&&<>
              <div className="page-heading" style={{marginBottom:4}}>AI <em>Coach</em></div>
              <p className="page-sub" style={{marginBottom:13}}>Ask anything — form tips, nutrition, plan tweaks.</p>
              <div className="chat-msgs">
                {msgs.map((m,i)=>(
                  <div key={i} className={["mrow",m.role].join(" ")}>
                    <div className={["mav",m.role].join(" ")}>{m.role==="bot"?"🤖":"YOU"}</div>
                    <div className={["mbub",m.role].join(" ")}>{m.text}</div>
                  </div>
                ))}
                {chatBusy&&<div className="mrow bot"><div className="mav bot">🤖</div><div className="mbub bot"><span className="spin"/></div></div>}
                <div ref={msgEnd}/>
              </div>
              <div className="cinrow">
                <input className="cin" placeholder="Ask about nutrition, workouts, recovery…" value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}/>
                <button className="csend" onClick={sendChat} disabled={chatBusy||!chatIn.trim()}>Send</button>
              </div>
            </>}

            {dashTab==="profile"&&<>
              <div className="page-heading" style={{marginBottom:4}}><em>Profile</em></div>
              <p className="page-sub" style={{marginBottom:20}}>Your account details and subscription.</p>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:18,marginBottom:14}}>
                {[["Email",email],["Name",profile.name],["Age",profile.age+" yrs"],["Weight",profile.weight],["Level",profile.level],["Diet",profile.diet],["Goal",GOALS.find(g=>g.id===goal)?.title||"-"],["Equipment",equip.length+" items"],["Subscription",plan==="pro"?"PRO — $5/mo":"Free"],["Database",dbConnected?"✓ Synced":"Not connected"]].map(([k,v],idx,arr)=>(
                  <div key={k} className="profile-row" style={{borderBottom:idx<arr.length-1?"1px solid var(--border)":"none"}}>
                    <span style={{fontSize:13,color:"var(--muted)",fontWeight:500}}>{k}</span>
                    <span style={{fontSize:13,fontWeight:600,color:k==="Subscription"&&plan==="pro"?"var(--gold)":k==="Database"&&dbConnected?"var(--green)":"var(--text)"}}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn-s btn-full" onClick={()=>{setScreen("onboard");setStep(0);setGoal("");setEquip([]);setCodeSent(false);setVerified(false);setCodeInputs(["","","","","",""]);setSentCode("");setPlanSaved(false);}}>
                Start Over / New Plan
              </button>
            </>}

          </div>
        </div>
      </div>
    </>
  );

  // ── ONBOARDING ──
  return(
    <>
      <style>{G}</style>
      <div className="app">
        <header className="topbar">
          <div className="logo">FitPlan Pro</div>
          <div className="topbar-right">
            <div className={["db-dot",dbConnected?"connected":""].filter(Boolean).join(" ")}/>
            <span className="db-label" style={{fontSize:11,fontFamily:"var(--syne)",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{dbConnected?"DB Connected":"AI-POWERED FITNESS"}</span>
          </div>
        </header>
        <StepsBar/>

        {/* STEP 0 — Email */}
        {step===0&&<div className="page-scroll"><div className="page-inner">
          {!codeSent?(
            <>
              <h1 className="page-heading">First, verify<br/><em>your email.</em></h1>
              <p className="page-sub">We'll send a 6-digit code. Returning users will have their plan restored automatically.</p>
              <div className="field">
                <label className="field-label">Email Address</label>
                <input className="finput" type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSendCode()}/>
              </div>
              {verifyError&&<div className="msg-err">{verifyError}</div>}
              <div className="sticky-bar"><div className="sticky-bar-inner">
                <button className="btn-p" disabled={!email.includes("@")||sending} onClick={handleSendCode}>
                  {sending?<><span className="spin"/> Sending…</>:"Send Verification Code →"}
                </button>
              </div></div>
            </>
          ):(
            <div className="verify-box">
              <div className="verify-icon">{verified?"✅":"📬"}</div>
              <div className="verify-title">{verified?"Email Verified!":"Check your inbox"}</div>
              <div className="verify-sub">
                {verified?"You're verified! Loading your data…":<>We sent a 6-digit code to <span className="verify-email-shown">{email}</span>. Enter it below.</>}
              </div>
              {!verified&&<>
                <div className="code-row">
                  {codeInputs.map((v,i)=>(
                    <input key={i} ref={codeRefs[i]} className="code-input" maxLength={1} value={v}
                      onChange={e=>handleCodeInput(i,e.target.value)}
                      onKeyDown={e=>handleCodeKey(i,e)}
                      onFocus={e=>e.target.select()}/>
                  ))}
                </div>
                {verifyError&&<div className="msg-err" style={{marginBottom:13}}>{verifyError}</div>}
                <button className="btn-p" style={{marginBottom:14,width:"100%"}}
                  disabled={codeInputs.join("").length<6||verifying}
                  onClick={()=>verifyCode(codeInputs.join(""))}>
                  {verifying?<><span className="spin"/> Verifying…</>:"Verify Code →"}
                </button>
                <div>
                  <button className="resend-btn" disabled={resendTimer>0}
                    onClick={()=>{setCodeInputs(["","","","","",""]);setVerifyError("");handleSendCode();}}>
                    {resendTimer>0?"Resend in "+resendTimer+"s":"Resend code"}
                  </button>
                  {" · "}
                  <button className="resend-btn" onClick={()=>{setCodeSent(false);setVerifyError("");setCodeInputs(["","","","","",""]);clearInterval(timerRef.current);}}>
                    Change email
                  </button>
                </div>
              </>}
            </div>
          )}
        </div></div>}

        {/* STEP 1 — Profile */}
        {step===1&&<div className="page-scroll"><div className="page-inner">
          <h1 className="page-heading">Tell us about<br/><em>yourself.</em></h1>
          <p className="page-sub">This shapes every part of your plan.</p>
          <div className="frow">
            <div className="field"><label className="field-label">First Name</label><input className="finput" placeholder="Alex" value={profile.name} onChange={e=>setP("name",e.target.value)}/></div>
            <div className="field"><label className="field-label">Age</label><input className="finput" placeholder="28" type="number" value={profile.age} onChange={e=>setP("age",e.target.value)}/></div>
          </div>
          <div className="frow">
            <div className="field"><label className="field-label">Current Weight</label><input className="finput" placeholder="165 lbs" value={profile.weight} onChange={e=>setP("weight",e.target.value)}/></div>
            <div className="field"><label className="field-label">Height (optional)</label><input className="finput" placeholder="5ft 10in" value={profile.height} onChange={e=>setP("height",e.target.value)}/></div>
          </div>
          <div className="frow">
            <div className="field"><label className="field-label">Fitness Level</label><select className="fselect" value={profile.level} onChange={e=>setP("level",e.target.value)}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
            <div className="field"><label className="field-label">Diet Preference</label><select className="fselect" value={profile.diet} onChange={e=>setP("diet",e.target.value)}>{DIETS.map(d=><option key={d}>{d}</option>)}</select></div>
          </div>
          <div className="sticky-bar"><div className="sticky-bar-inner">
            <button className="btn-s" onClick={()=>setStep(0)}>Back</button>
            <button className="btn-p" disabled={!profileValid} onClick={()=>setStep(2)}>Continue</button>
          </div></div>
        </div></div>}

        {/* STEP 2 — Goal */}
        {step===2&&<div className="page-scroll"><div className="page-inner">
          <h1 className="page-heading">What's your<br/><em>primary goal?</em></h1>
          <p className="page-sub">Pick the one that matters most right now.</p>
          <div className="goal-grid">
            {GOALS.map(g=>(
              <div key={g.id} className={["goal-chip",goal===g.id?"sel":""].filter(Boolean).join(" ")} onClick={()=>setGoal(g.id)}>
                <span className="gi">{g.icon}</span>
                <div><div className="gt">{g.title}</div><div className="gd">{g.desc}</div></div>
                <div className="grad"/>
              </div>
            ))}
          </div>
          <div className="sticky-bar"><div className="sticky-bar-inner">
            <button className="btn-s" onClick={()=>setStep(1)}>Back</button>
            <button className="btn-p" disabled={!goal} onClick={()=>setStep(3)}>Continue</button>
          </div></div>
        </div></div>}

        {/* STEP 3 — Equipment */}
        {step===3&&<div className="page-scroll"><div className="page-inner">
          <h1 className="page-heading">What equipment<br/>do you <em>have access to?</em></h1>
          <p className="page-sub">Select everything available — we'll build around what you have.</p>
          {Object.entries(EQUIPMENT).map(([sec,items])=>(
            <div className="eq-sec" key={sec}>
              <div className="eq-title">{sec}</div>
              <div className="chip-grid">
                {items.map(item=>(
                  <div key={item.id} className={["chip",equip.includes(item.id)?"sel":""].filter(Boolean).join(" ")} onClick={()=>toggleEquip(item.id)}>
                    <span className="cicon">{item.icon}</span><span className="ctext">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="sticky-bar"><div className="sticky-bar-inner">
            <button className="btn-s" onClick={()=>setStep(2)}>Back</button>
            <button className="btn-p" disabled={equip.length===0} onClick={()=>setStep(4)}>Continue</button>
          </div></div>
        </div></div>}

        {/* STEP 4 — Plan */}
        {step===4&&<div className="page-scroll"><div className="page-inner">
          {!generating?(
            <>
              <h1 className="page-heading">Choose your<br/><em>plan.</em></h1>
              <p className="page-sub">Both include a 7-day meal and workout plan. Upgrade for AI that adapts each week.</p>
              <div className="pricing-wrap">
                <div className={["pcard",plan==="basic"?"sel":""].filter(Boolean).join(" ")} onClick={()=>setPlan("basic")}>
                  <div className="pprice">$0 <span>/mo</span></div>
                  <div className="pname">Basic</div>
                  <ul className="pfeats">
                    <li><span className="ck">✓</span>7-day meal plan</li>
                    <li><span className="ck">✓</span>7-day workout plan</li>
                    <li><span className="ck">✓</span>AI Coach chatbot</li>
                    <li className="no"><span className="ck">✕</span>Adaptive updates</li>
                    <li className="no"><span className="ck">✕</span>Progress tracking</li>
                  </ul>
                </div>
                <div className={["pcard featured",plan==="pro"?"sel":""].filter(Boolean).join(" ")} onClick={()=>setPlan("pro")}>
                  <div className="pbadge">Most Popular</div>
                  <div className="pprice">$5 <span>/mo</span></div>
                  <div className="pname">Pro</div>
                  <ul className="pfeats">
                    <li><span className="ck">✓</span>7-day meal plan</li>
                    <li><span className="ck">✓</span>7-day workout plan</li>
                    <li><span className="ck">✓</span>AI Coach chatbot</li>
                    <li><span className="ck">✓</span>Adaptive updates</li>
                    <li><span className="ck">✓</span>Progress tracking</li>
                  </ul>
                </div>
              </div>
              <div className="summary">
                {[["Goal",GOALS.find(g=>g.id===goal)?.title||"-"],["Level",profile.level],["Equip.",equip.length+" items"]].map(([k,v])=>(
                  <div key={k}><div className="slabel">{k}</div><div className="sval">{v}</div></div>
                ))}
              </div>
              {genError&&<div className="msg-err">{genError}</div>}
              <div className="sticky-bar"><div className="sticky-bar-inner">
                <button className="btn-s" onClick={()=>setStep(3)}>Back</button>
                <button className="btn-p" onClick={generate}>{plan==="pro"?"Start Pro — $5/mo":"Generate Free Plan"}</button>
              </div></div>
            </>
          ):(
            <div style={{textAlign:"center",paddingTop:28}}>
              <div style={{fontSize:50,marginBottom:16}}>⚡</div>
              <h1 className="page-heading" style={{marginBottom:7}}>Building your<br/><em>personalized plan…</em></h1>
              <p className="page-sub" style={{marginBottom:28}}>About 20 seconds. Your plan will be saved automatically.</p>
              <div className="lbar-wrap">
                <div className="lbar-lbl"><span>{statusMsg||"Starting…"}</span><span style={{color:"var(--green)"}}>{progress}%</span></div>
                <div className="lbar"><div className="lfill" style={{width:progress+"%"}}/></div>
              </div>
              {dbConnected&&<div style={{marginTop:16,fontSize:12,color:"var(--muted)"}}>💾 Progress is being saved to your account</div>}
            </div>
          )}
        </div></div>}

      </div>
    </>
  );
}
