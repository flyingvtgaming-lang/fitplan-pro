import { useState, useRef, useEffect } from "react";

const SUPABASE_URL = "https://oapcqfahkynkgxqkyeru.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGNxZmFoa3lua2d4cWt5ZXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTExMTMsImV4cCI6MjA4OTI2NzExM30.g11nlp1LoIh4WdACvqhx7VuT1CcTxI6Gud0s2c2VYTs";
const EMAILJS_SVC = "service_qekk769";
const EMAILJS_TPL = "template_h9fye4h";
const EMAILJS_KEY = "PbhegEIBztlqMZhI9";

const RANKS = [
  {name:"Bronze",  icon:"🥉",min:0,    max:199,   color:"#cd7f32"},
  {name:"Silver",  icon:"🥈",min:200,  max:499,   color:"#c0c0c0"},
  {name:"Gold",    icon:"🥇",min:500,  max:999,   color:"#ffd700"},
  {name:"Platinum",icon:"💎",min:1000, max:1999,  color:"#e5e4e2"},
  {name:"Emerald", icon:"💚",min:2000, max:3999,  color:"#50c878"},
  {name:"Diamond", icon:"💠",min:4000, max:7999,  color:"#b9f2ff"},
  {name:"Amethyst",icon:"💜",min:8000, max:14999, color:"#9966cc"},
  {name:"Ruby",    icon:"❤️",min:15000,max:29999, color:"#e0115f"},
  {name:"Top 100", icon:"👑",min:30000,max:Infinity,color:"#ffd700"},
];
const DAILY_CAP = 50;
function getRank(pts){for(let i=RANKS.length-1;i>=0;i--)if(pts>=RANKS[i].min)return RANKS[i];return RANKS[0];}
function startPts(level){return level==="Advanced"?300:level==="Intermediate"?100:0;}
function isExpired(at,plan){if(plan==="pro"||!at)return false;return(new Date()-new Date(at))/(864e5)>=7;}
function todayStr(){return new Date().toISOString().split("T")[0];}
function yestStr(){return new Date(Date.now()-864e5).toISOString().split("T")[0];}

const GOALS=[
  {id:"weight_loss",icon:"🔥",title:"Weight Loss",desc:"Burn fat, improve endurance"},
  {id:"muscle_gain",icon:"💪",title:"Muscle Gain",desc:"Build strength and muscle"},
  {id:"athletic",   icon:"⚡",title:"Athletic Performance",desc:"Speed, power, sport training"},
  {id:"general",    icon:"🌿",title:"General Health",desc:"Balance, mobility, wellness"},
  {id:"recomp",     icon:"⚖️",title:"Body Recomposition",desc:"Lose fat and gain muscle"},
];
const DIETS=["No Restrictions","Vegetarian","Vegan","Keto","Paleo","Gluten-Free","High Protein","Intermittent Fasting"];
const LEVELS=["Beginner","Intermediate","Advanced"];
const EQUIPMENT={
  "Free Weights":[{id:"dumbbells",icon:"🏋️",text:"Dumbbells"},{id:"barbells",icon:"🔩",text:"Barbells"},{id:"kettles",icon:"🫙",text:"Kettlebells"},{id:"ez_bar",icon:"〰️",text:"EZ Bar"},{id:"bands",icon:"🔁",text:"Resistance Bands"}],
  "Cardio":[{id:"treadmill",icon:"🏃",text:"Treadmill"},{id:"bike",icon:"🚴",text:"Stationary Bike"},{id:"rower",icon:"🚣",text:"Rowing Machine"},{id:"elliptic",icon:"🌀",text:"Elliptical"},{id:"stairs",icon:"🪜",text:"Stairmaster"}],
  "Machines":[{id:"cable",icon:"🔗",text:"Cable Machine"},{id:"legpress",icon:"🦵",text:"Leg Press"},{id:"latpull",icon:"⬇️",text:"Lat Pulldown"},{id:"chestmach",icon:"📐",text:"Chest Press"},{id:"smith",icon:"🏗️",text:"Smith Machine"}],
  "Bodyweight":[{id:"pullupbar",icon:"🔲",text:"Pull-up Bar"},{id:"dipbars",icon:"🤸",text:"Dip Bars"},{id:"bench",icon:"🪑",text:"Bench"},{id:"sqrack",icon:"🏗️",text:"Squat Rack"},{id:"mat",icon:"🟩",text:"Yoga Mat"},{id:"none",icon:"🏠",text:"No Equipment"}],
};
const COUNTRIES=["United States","United Kingdom","Canada","Australia","Germany","France","Spain","Italy","Portugal","Netherlands","Belgium","Sweden","Norway","Denmark","Finland","Austria","Switzerland","Poland","Czech Republic","Hungary","Romania","Greece","Ukraine","Brazil","Mexico","Argentina","Colombia","Chile","Japan","South Korea","China","India","New Zealand","Russia","Turkey","South Africa","Egypt","Nigeria","Kenya","Morocco","Saudi Arabia","UAE","Israel","Singapore","Malaysia","Thailand","Vietnam","Indonesia","Philippines","Other"];
const METRIC_C=["Germany","France","Spain","Italy","Portugal","Netherlands","Belgium","Sweden","Norway","Denmark","Finland","Austria","Switzerland","Poland","Czech Republic","Hungary","Romania","Greece","Ukraine","Brazil","Mexico","Argentina","Colombia","Chile","Japan","South Korea","China","India","Australia","New Zealand","Russia","Turkey","South Africa","Egypt","Nigeria","Kenya","Morocco","Saudi Arabia","UAE","Israel","Singapore","Malaysia","Thailand","Vietnam","Indonesia","Philippines"];
const COUNTRY_LANG={"Germany":"de","Austria":"de","Switzerland":"de","France":"fr","Belgium":"fr","Spain":"es","Mexico":"es","Argentina":"es","Colombia":"es","Chile":"es","Brazil":"pt","Portugal":"pt","Italy":"it","Japan":"ja","South Korea":"ko","China":"zh","Saudi Arabia":"ar","UAE":"ar","Egypt":"ar","Morocco":"ar","India":"hi","Russia":"ru","Ukraine":"uk","Poland":"pl","Netherlands":"nl","Sweden":"sv","Norway":"sv","Denmark":"sv","Finland":"sv","Turkey":"tr","Indonesia":"id","Vietnam":"vi","Thailand":"th"};
const ALL_LANGS=[
  {code:"en",name:"English",flag:"🇺🇸"},{code:"es",name:"Español",flag:"🇪🇸"},
  {code:"de",name:"Deutsch",flag:"🇩🇪"},{code:"fr",name:"Français",flag:"🇫🇷"},
  {code:"pt",name:"Português",flag:"🇧🇷"},{code:"it",name:"Italiano",flag:"🇮🇹"},
  {code:"ja",name:"日本語",flag:"🇯🇵"},{code:"ko",name:"한국어",flag:"🇰🇷"},
  {code:"zh",name:"中文",flag:"🇨🇳"},{code:"ar",name:"العربية",flag:"🇸🇦"},
  {code:"hi",name:"हिन्दी",flag:"🇮🇳"},{code:"ru",name:"Русский",flag:"🇷🇺"},
  {code:"uk",name:"Українська",flag:"🇺🇦"},{code:"pl",name:"Polski",flag:"🇵🇱"},
  {code:"nl",name:"Nederlands",flag:"🇳🇱"},{code:"sv",name:"Svenska",flag:"🇸🇪"},
  {code:"tr",name:"Türkçe",flag:"🇹🇷"},{code:"id",name:"Bahasa Indonesia",flag:"🇮🇩"},
  {code:"vi",name:"Tiếng Việt",flag:"🇻🇳"},{code:"th",name:"ภาษาไทย",flag:"🇹🇭"},
];
const STEPS=["Email","Location","Reviews","Profile","Goal","Equipment","Plan"];

let _sb=null;
async function getDB(){
  if(_sb)return _sb;
  if(!window.supabase){await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
  _sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  return _sb;
}
const DB={
  async get(email){const c=await getDB();const{data}=await c.from("users").select("*").eq("email",email).single();return data;},
  async upsert(data){const c=await getDB();await c.from("users").upsert(data,{onConflict:"email"});},
  async update(email,data){const c=await getDB();await c.from("users").update(data).eq("email",email);},
  async savePlan(email,wp,mp,gl){await DB.update(email,{workout_plan:wp,meal_plan:mp,grocery_list:gl,plan_generated_at:new Date().toISOString()});},
  async updatePoints(email,d){await DB.update(email,d);},
  async markExpired(email){await DB.update(email,{plan_expired:true,expired_at:new Date().toISOString(),upgrade_prompted:true});},
  async saveMemory(email,mem){await DB.update(email,{coach_memory:mem});},
  async leaderboard(){const c=await getDB();const{data}=await c.from("users").select("name,points,rank,streak,plan").order("points",{ascending:false}).limit(200);return data||[];},
  async getReviews(){const c=await getDB();const{data}=await c.from("reviews").select("*").order("created_at",{ascending:false}).limit(30);return data||[];},
  async saveReview(d){const c=await getDB();await c.from("reviews").insert({...d,created_at:new Date().toISOString()});},
  async getLogs(email){const c=await getDB();const{data}=await c.from("progress_logs").select("*").eq("email",email).order("logged_at",{ascending:false}).limit(50);return data||[];},
  async saveLog(email,entry,type){const c=await getDB();await c.from("progress_logs").insert({email,entry,type,logged_at:new Date().toISOString()});},
  async getScans(email){const c=await getDB();const{data}=await c.from("food_scans").select("*").eq("email",email).order("created_at",{ascending:false}).limit(50);return data||[];},
  async saveScan(d){const c=await getDB();await c.from("food_scans").insert({...d,created_at:new Date().toISOString()});},
  async follow(a,b){const c=await getDB();await c.from("follows").insert({follower_email:a,following_email:b});},
  async unfollow(a,b){const c=await getDB();await c.from("follows").delete().eq("follower_email",a).eq("following_email",b);},
  async getFollowing(email){const c=await getDB();const{data}=await c.from("follows").select("following_email").eq("follower_email",email);return(data||[]).map(r=>r.following_email);},
  async getMessages(email){const c=await getDB();const{data}=await c.from("messages").select("*").or(`sender_email.eq.${email},receiver_email.eq.${email}`).order("created_at",{ascending:true});return data||[];},
  async sendMsg(from,to,content){const c=await getDB();await c.from("messages").insert({sender_email:from,receiver_email:to,content,read:false});},
  async markRead(from,to){const c=await getDB();await c.from("messages").update({read:true}).eq("sender_email",from).eq("receiver_email",to);},
  async getUnread(email){const c=await getDB();const{count}=await c.from("messages").select("*",{count:"exact",head:true}).eq("receiver_email",email).eq("read",false);return count||0;},
  async searchUsers(q){const c=await getDB();const{data}=await c.from("users").select("name,email,rank,streak,plan,points").ilike("name",`%${q}%`).limit(20);return data||[];},
  async getUsersByEmails(emails){if(!emails.length)return[];const c=await getDB();const{data}=await c.from("users").select("name,email,rank,streak,plan,points").in("email",emails);return data||[];},
};

let _ejsReady=false;
async function sendCode(to,code){
  if(!_ejsReady){await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});window.emailjs.init({publicKey:EMAILJS_KEY});_ejsReady=true;}
  await window.emailjs.send(EMAILJS_SVC,EMAILJS_TPL,{to_email:to,code,app_name:"FitPlan Pro"});
}

async function ai(msg,sys="",flags={}){
  const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:msg}],system:sys,...flags})});
  const d=await r.json();if(d.error)throw new Error(d.error.message);
  return(d.content||[]).map(b=>b.text||"").join("");
}
async function aiChat(msgs,sys="",flags={}){
  const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:msgs,system:sys,...flags})});
  const d=await r.json();if(d.error)throw new Error(d.error.message);
  return(d.content||[]).map(b=>b.text||"").join("");
}

const G=`
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--bg:#080c10;--bg2:#131920;--bg3:#1a2230;--b:rgba(255,255,255,0.07);--b2:rgba(255,255,255,0.13);--tx:#f0f4f8;--mu:#6b7a8d;--mu2:#9aabb8;--gr:#00e5a0;--gr2:#00b87a;--gbg:rgba(0,229,160,0.08);--gbg2:rgba(0,229,160,0.15);--gold:#f5c542;--red:#ff4d6d;--syne:'Syne',sans-serif;--inter:'Inter',sans-serif;}
html,body,#root{height:100%;}
body{background:var(--bg);color:var(--tx);font-family:var(--inter);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:4px;}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,229,160,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,.025) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0;}
.app{height:100vh;display:flex;flex-direction:column;position:relative;z-index:1;}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:56px;border-bottom:1px solid var(--b);background:rgba(8,12,16,.95);backdrop-filter:blur(12px);flex-shrink:0;z-index:10;position:relative;}
.logo{font-family:var(--syne);font-size:18px;font-weight:800;background:linear-gradient(135deg,#fff 30%,var(--gr));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.topbar-right{display:flex;align-items:center;gap:6px;}
.prog-wrap{padding:16px 20px 0;flex-shrink:0;position:relative;z-index:5;}
.prog-steps{display:flex;align-items:center;max-width:560px;margin:0 auto;}
.pdot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--syne);font-size:10px;font-weight:700;border:1.5px solid var(--b2);background:var(--bg2);color:var(--mu);flex-shrink:0;transition:all .3s;}
.pdot.done{background:var(--gr);border-color:var(--gr);color:#000;}
.pdot.act{background:var(--bg3);border-color:var(--gr);color:var(--gr);}
.pline{flex:1;height:1.5px;background:var(--b2);min-width:4px;transition:background .3s;}
.pline.done{background:var(--gr);}
.prog-labels{display:flex;justify-content:space-between;max-width:560px;margin:4px auto 0;}
.prog-labels span{font-size:8px;color:var(--mu);letter-spacing:.04em;text-transform:uppercase;font-weight:600;}
.prog-labels span.act{color:var(--gr);}
.pscroll{flex:1;overflow-y:auto;position:relative;z-index:5;}
.pinner{max-width:600px;margin:0 auto;padding:26px 20px 56px;animation:fadeUp .3s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.ph{font-family:var(--syne);font-size:25px;font-weight:800;letter-spacing:-.03em;line-height:1.15;margin-bottom:6px;}
.ph em{font-style:normal;color:var(--gr);}
.ps{font-size:13px;color:var(--mu2);line-height:1.6;margin-bottom:20px;}
.field{margin-bottom:13px;}
.flabel{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mu);display:block;margin-bottom:5px;}
.finput,.fsel{width:100%;padding:11px 13px;background:var(--bg2);border:1px solid var(--b2);border-radius:9px;font-family:var(--inter);font-size:14px;color:var(--tx);outline:none;transition:border-color .2s,background .2s;}
.finput:focus,.fsel:focus{border-color:var(--gr);background:var(--bg3);}
.finput::placeholder{color:var(--mu);}
.fsel option{background:var(--bg2);}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.sbar{position:sticky;bottom:0;background:rgba(8,12,16,.97);backdrop-filter:blur(16px);border-top:1px solid var(--b);padding:11px 20px;margin:0 -20px -56px;z-index:50;}
.sbar-inner{max-width:600px;margin:0 auto;display:flex;gap:9px;}
.btn-p{flex:1;padding:12px;border-radius:10px;background:linear-gradient(135deg,var(--gr),var(--gr2));color:#000;font-family:var(--syne);font-size:13px;font-weight:700;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s;display:flex;align-items:center;justify-content:center;gap:7px;}
.btn-p:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,229,160,.25);}
.btn-p:disabled{opacity:.35;cursor:not-allowed;}
.btn-gold{flex:1;padding:12px;border-radius:10px;background:linear-gradient(135deg,var(--gold),#e6a817);color:#000;font-family:var(--syne);font-size:13px;font-weight:700;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s;display:flex;align-items:center;justify-content:center;gap:7px;}
.btn-gold:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(245,197,66,.3);}
.btn-gold:disabled{opacity:.35;cursor:not-allowed;}
.btn-s{padding:11px 16px;border-radius:9px;border:1px solid var(--b2);background:transparent;color:var(--mu2);font-family:var(--inter);font-size:13px;font-weight:500;cursor:pointer;transition:color .2s,background .2s;}
.btn-s:hover{color:var(--tx);background:var(--bg2);}
.btn-full{width:100%;}
.spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.1);border-top-color:var(--gr);border-radius:50%;animation:rot .7s linear infinite;display:inline-block;vertical-align:middle;}
.spin-lg{width:28px;height:28px;border-width:3px;}
@keyframes rot{to{transform:rotate(360deg);}}
.vbox{background:var(--bg2);border:1px solid var(--b2);border-radius:14px;padding:24px;text-align:center;}
.vicon{font-size:36px;margin-bottom:10px;}
.vtitle{font-family:var(--syne);font-size:18px;font-weight:800;margin-bottom:6px;}
.vsub{font-size:13px;color:var(--mu2);line-height:1.6;margin-bottom:20px;}
.code-row{display:flex;gap:8px;justify-content:center;margin-bottom:14px;}
.code-inp{width:44px;height:52px;text-align:center;font-family:var(--syne);font-size:20px;font-weight:800;background:var(--bg3);border:1.5px solid var(--b2);border-radius:10px;color:var(--tx);outline:none;transition:border-color .2s;}
.code-inp:focus{border-color:var(--gr);}
.resend-btn{background:none;border:none;color:var(--mu2);font-size:12px;cursor:pointer;text-decoration:underline;padding:0;}
.resend-btn:disabled{opacity:.4;cursor:not-allowed;text-decoration:none;}
.lang-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:7px;margin-bottom:10px;}
.lang-opt{padding:9px;border-radius:9px;border:1.5px solid var(--b2);background:var(--bg2);cursor:pointer;text-align:center;font-size:11px;font-weight:500;transition:all .2s;}
.lang-opt:hover{border-color:rgba(0,229,160,.3);}
.lang-opt.sel{border-color:var(--gr);background:var(--gbg2);color:var(--gr);}
.lang-flag{font-size:18px;display:block;margin-bottom:2px;}
.goal-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
.goal-item{padding:12px 14px;border-radius:12px;border:1.5px solid var(--b2);background:var(--bg2);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px;}
.goal-item:hover{border-color:rgba(0,229,160,.3);}
.goal-item.sel{border-color:var(--gr);background:var(--gbg2);}
.goal-icon{font-size:20px;flex-shrink:0;}
.goal-title{font-family:var(--syne);font-size:13px;font-weight:700;}
.goal-item.sel .goal-title{color:var(--gr);}
.goal-desc{font-size:11px;color:var(--mu2);margin-top:1px;}
.grad{margin-left:auto;width:17px;height:17px;border-radius:50%;border:2px solid var(--b2);flex-shrink:0;transition:all .2s;}
.goal-item.sel .grad{border-color:var(--gr);background:var(--gr);}
.eq-sec{margin-bottom:16px;}
.eq-head{font-family:var(--syne);font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--mu);border-bottom:1px solid var(--b);padding-bottom:6px;margin-bottom:8px;}
.chip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;}
.chip{padding:10px;border-radius:9px;border:1.5px solid var(--b2);background:var(--bg2);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:7px;}
.chip:hover{border-color:rgba(0,229,160,.3);}
.chip.sel{border-color:var(--gr);background:var(--gbg2);}
.chip-icon{font-size:15px;flex-shrink:0;}
.chip-text{font-size:11px;font-weight:500;}
.chip.sel .chip-text{color:var(--gr);}
.price-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.pcard{padding:16px 13px;border-radius:13px;border:1.5px solid var(--b2);background:var(--bg2);cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
.pcard:hover{border-color:rgba(0,229,160,.25);}
.pcard.sel{border-color:var(--gr);background:var(--gbg);}
.pcard.feat{border-color:rgba(245,197,66,.35);}
.pcard.feat.sel{background:rgba(245,197,66,.05);border-color:var(--gold);}
.pbadge{position:absolute;top:0;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;font-family:var(--syne);font-size:9px;font-weight:800;padding:3px 10px;border-radius:0 0 8px 8px;white-space:nowrap;}
.pprice{font-family:var(--syne);font-size:20px;font-weight:800;margin-bottom:1px;}
.pprice span{font-size:11px;font-weight:400;color:var(--mu2);}
.pname{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--mu);margin-bottom:10px;}
.pcard.feat .pprice{color:var(--gold);}
.pfeat-list{list-style:none;display:flex;flex-direction:column;gap:5px;}
.pfeat-list li{font-size:11px;color:var(--mu2);display:flex;align-items:flex-start;gap:5px;}
.pfeat-list li .ck{flex-shrink:0;color:var(--gr);font-weight:700;}
.pfeat-list li.no{opacity:.4;}
.pfeat-list li.no .ck{color:var(--mu);}
.sumbox{background:var(--bg2);border:1px solid var(--b);border-radius:10px;padding:11px;margin-bottom:13px;display:grid;grid-template-columns:repeat(3,1fr);gap:9px;}
.slabel{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--mu);font-weight:600;margin-bottom:2px;}
.sval{font-family:var(--syne);font-size:11px;font-weight:700;}
.ok{background:rgba(0,229,160,.1);border:1px solid rgba(0,229,160,.25);color:var(--gr);border-radius:9px;padding:9px 13px;font-size:12px;margin-bottom:11px;text-align:center;}
.err{background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.3);color:var(--red);border-radius:9px;padding:9px 13px;font-size:12px;margin-bottom:11px;}
.trust-bar{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;border-top:1px solid var(--b);padding-top:13px;margin-top:13px;}
.trust-item{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--mu2);}
.lbar-wrap{margin:13px 0;}
.lbar-lbl{font-size:12px;color:var(--mu2);margin-bottom:5px;display:flex;justify-content:space-between;}
.lbar{height:3px;background:var(--bg3);border-radius:4px;overflow:hidden;}
.lfill{height:100%;background:linear-gradient(90deg,var(--gr2),var(--gr));border-radius:4px;transition:width .5s ease;}
.dnav{border-bottom:1px solid var(--b);background:rgba(8,12,16,.8);display:flex;padding:0 10px;flex-shrink:0;overflow-x:auto;position:relative;z-index:10;}
.dtab{padding:11px 12px;font-family:var(--syne);font-size:11px;font-weight:700;color:var(--mu);border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;}
.dtab:hover{color:var(--tx);}
.dtab.act{color:var(--gr);border-bottom-color:var(--gr);}
.unread-dot{background:var(--gr);color:#000;font-size:9px;font-weight:800;padding:1px 4px;border-radius:100px;margin-left:3px;font-family:var(--syne);}
.rtabs{display:flex;gap:3px;margin-bottom:13px;background:var(--bg2);border-radius:9px;padding:3px;border:1px solid var(--b);}
.rtab{flex:1;padding:7px;border-radius:6px;border:none;background:transparent;font-family:var(--syne);font-size:11px;font-weight:700;color:var(--mu);cursor:pointer;transition:all .2s;white-space:nowrap;}
.rtab.act{background:var(--bg3);color:var(--gr);}
.rbody{background:var(--bg2);border:1px solid var(--b);border-radius:12px;padding:16px;font-size:12.5px;line-height:1.9;color:var(--mu2);}
.pro-pill{background:rgba(245,197,66,.15);color:var(--gold);padding:2px 7px;border-radius:100px;font-size:10px;font-weight:700;font-family:var(--syne);}
.free-pill{background:rgba(255,255,255,.08);color:var(--mu2);padding:2px 7px;border-radius:100px;font-size:10px;font-weight:700;font-family:var(--syne);}
.chat-msgs{overflow-y:auto;display:flex;flex-direction:column;gap:10px;max-height:calc(100vh - 320px);min-height:150px;}
.mrow{display:flex;gap:7px;align-items:flex-end;}
.mrow.user{flex-direction:row-reverse;}
.mav{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;}
.mav.bot{background:var(--gbg2);}
.mav.usr{background:var(--bg3);border:1px solid var(--b2);font-size:9px;font-weight:700;color:var(--gr);}
.mbub{max-width:78%;padding:8px 11px;border-radius:11px;font-size:12.5px;line-height:1.65;}
.mbub.bot{background:var(--bg2);border:1px solid var(--b);border-bottom-left-radius:3px;color:var(--mu2);}
.mbub.usr{background:var(--bg3);border:1px solid var(--b2);border-bottom-right-radius:3px;color:var(--tx);}
.cin-row{display:flex;gap:7px;padding-top:10px;border-top:1px solid var(--b);margin-top:10px;}
.cin{flex:1;padding:10px 12px;background:var(--bg2);border:1px solid var(--b2);border-radius:9px;font-family:var(--inter);font-size:13px;color:var(--tx);outline:none;transition:border-color .2s;}
.cin:focus{border-color:var(--gr);}
.cin::placeholder{color:var(--mu);}
.csend{padding:10px 14px;background:var(--gr);color:#000;border:none;border-radius:9px;font-family:var(--syne);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;}
.csend:disabled{opacity:.4;cursor:not-allowed;}
.prompt-chips{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
.prompt-chip{padding:5px 9px;border-radius:100px;border:1px solid var(--b2);background:var(--bg2);font-size:11px;color:var(--mu2);cursor:pointer;white-space:nowrap;}
.prompt-chip:hover{border-color:var(--gr);color:var(--gr);}
.stat-row{display:flex;gap:8px;margin-bottom:12px;}
.stat-box{flex:1;background:var(--bg2);border:1px solid var(--b);border-radius:10px;padding:11px;text-align:center;}
.stat-val{font-family:var(--syne);font-size:17px;font-weight:800;margin-bottom:2px;}
.stat-lbl{font-size:10px;color:var(--mu);}
.log-item{background:var(--bg2);border:1px solid var(--b);border-radius:10px;padding:11px;display:flex;gap:9px;margin-bottom:8px;}
.log-entry{font-size:12px;color:var(--tx);margin-bottom:3px;}
.log-meta{font-size:10px;color:var(--mu);}
.type-pill{display:inline;padding:1px 6px;border-radius:100px;font-size:9px;font-weight:700;margin-right:4px;}
.lb-prog{background:var(--bg2);border:1px solid var(--b);border-radius:11px;padding:12px;margin-bottom:12px;}
.lb-track{height:5px;background:var(--bg3);border-radius:4px;overflow:hidden;margin-top:6px;}
.lb-fill{height:100%;border-radius:4px;transition:width .5s ease;}
.rank-filters{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
.rf{padding:5px 9px;border-radius:100px;border:1px solid var(--b2);background:transparent;color:var(--mu);font-size:10px;font-weight:600;cursor:pointer;font-family:var(--syne);}
.rf:hover{border-color:var(--gr);color:var(--gr);}
.rf.act{border-color:var(--gr);background:var(--gbg2);color:var(--gr);}
.lb-row{display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:10px;background:var(--bg2);border:1px solid var(--b);margin-bottom:7px;}
.lb-pos{font-family:var(--syne);font-size:12px;font-weight:800;color:var(--mu);width:22px;flex-shrink:0;}
.lb-pos.top3{color:var(--gold);}
.lb-name{font-family:var(--syne);font-size:12px;font-weight:700;flex:1;color:var(--tx);}
.lb-right{display:flex;align-items:center;gap:6px;flex-shrink:0;}
.lb-pts{font-size:11px;color:var(--mu2);}
.streak-badge{color:#ff6b35;font-size:11px;font-weight:700;}
.social-tabs{display:flex;gap:3px;margin-bottom:13px;background:var(--bg2);border-radius:9px;padding:3px;border:1px solid var(--b);}
.social-tab{flex:1;padding:7px;border-radius:6px;border:none;background:transparent;font-family:var(--syne);font-size:11px;font-weight:700;color:var(--mu);cursor:pointer;transition:all .2s;}
.social-tab.act{background:var(--bg3);color:var(--gr);}
.ucard{background:var(--bg2);border:1px solid var(--b);border-radius:11px;padding:12px;display:flex;align-items:center;gap:9px;margin-bottom:8px;}
.ucard-av{width:36px;height:36px;border-radius:50%;background:var(--bg3);border:1.5px solid var(--b2);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.ucard-name{font-family:var(--syne);font-size:12px;font-weight:700;color:var(--tx);}
.ucard-meta{font-size:11px;color:var(--mu2);margin-top:1px;}
.follow-btn{padding:5px 11px;border-radius:100px;border:1.5px solid var(--gr);background:transparent;color:var(--gr);font-size:10px;font-weight:700;cursor:pointer;font-family:var(--syne);white-space:nowrap;}
.follow-btn:hover{background:var(--gbg2);}
.follow-btn.ing{background:var(--gbg2);}
.msg-btn{padding:5px 10px;border-radius:100px;border:1px solid var(--b2);background:transparent;color:var(--mu2);font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;}
.msg-btn:hover{border-color:var(--gr);color:var(--gr);}
.convo-item{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:var(--bg2);border:1px solid var(--b);margin-bottom:7px;cursor:pointer;}
.convo-item:hover{border-color:rgba(0,229,160,.3);}
.msg-area{background:var(--bg2);border:1px solid var(--b);border-radius:11px;padding:12px;max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:7px;margin-bottom:9px;}
.msg-mine{align-self:flex-end;background:var(--bg3);border:1px solid var(--b2);padding:7px 11px;border-radius:11px;border-bottom-right-radius:3px;font-size:12px;color:var(--tx);max-width:75%;}
.msg-theirs{align-self:flex-start;background:#0d1117;border:1px solid var(--b);padding:7px 11px;border-radius:11px;border-bottom-left-radius:3px;font-size:12px;color:var(--mu2);max-width:75%;}
.msg-time{font-size:10px;color:var(--mu);margin-top:2px;}
.upload-zone{background:var(--bg3);border:2px dashed var(--b2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:10px;}
.upload-zone:hover,.upload-zone.has{border-color:var(--gr);background:var(--gbg);}
.scan-card{background:var(--bg2);border:1px solid var(--b);border-radius:13px;padding:14px;margin-top:12px;}
.macro-row{display:flex;align-items:center;gap:7px;margin-bottom:4px;}
.macro-lbl{font-size:10px;font-weight:700;color:var(--mu);width:50px;flex-shrink:0;text-transform:uppercase;letter-spacing:.04em;}
.macro-track{flex:1;height:5px;background:var(--bg3);border-radius:4px;overflow:hidden;}
.macro-fill{height:100%;border-radius:4px;transition:width .5s ease;}
.macro-val{font-size:11px;font-weight:700;width:38px;text-align:right;flex-shrink:0;}
.mpill{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:100px;font-size:10px;font-weight:700;margin:2px;}
.on-plan-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;margin-bottom:9px;}
.scan-hist{background:var(--bg2);border:1px solid var(--b);border-radius:10px;padding:11px;margin-bottom:8px;}
.prof-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--b);}
.prof-row:last-child{border-bottom:none;}
.rev-card{background:var(--bg2);border:1px solid var(--b);border-radius:11px;padding:13px;margin-bottom:9px;}
.avg-box{text-align:center;padding:15px;background:var(--bg2);border:1px solid var(--b);border-radius:12px;margin-bottom:13px;}
.avg-num{font-family:var(--syne);font-size:38px;font-weight:800;color:var(--gold);}
.exp-overlay{position:fixed;inset:0;background:rgba(8,12,16,.97);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.exp-card{background:var(--bg2);border:1px solid rgba(245,197,66,.3);border-radius:18px;padding:28px;max-width:420px;width:100%;text-align:center;}
.upsell{background:linear-gradient(135deg,rgba(245,197,66,.1),rgba(245,197,66,.05));border:1px solid rgba(245,197,66,.25);border-radius:12px;padding:15px;margin-bottom:15px;text-align:center;}
.upsell-title{font-family:var(--syne);font-size:15px;font-weight:800;color:var(--gold);margin-bottom:5px;}
.upsell-sub{font-size:12px;color:var(--mu2);margin-bottom:12px;line-height:1.6;}
.saved-flash{position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:var(--gr);color:#000;padding:8px 18px;border-radius:100px;font-family:var(--syne);font-size:12px;font-weight:700;z-index:100;animation:fadeUp .3s ease;white-space:nowrap;}
.trans-overlay{position:fixed;inset:0;background:rgba(8,12,16,.92);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;}
.meal-macro-pill{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:100px;font-size:10px;font-weight:700;margin:2px;}
@media(max-width:600px){.frow,.price-grid{grid-template-columns:1fr;}.sumbox{grid-template-columns:1fr 1fr;}.pinner{padding:20px 14px 56px;}.ph{font-size:22px;}.sbar{margin:0 -14px -56px;padding:11px 14px;}.topbar,.prog-wrap{padding-left:14px;padding-right:14px;}}
`;

// ─── LEADERBOARD COMPONENT ───────────────────────────────────────────────────
function LeaderboardTab({lb,loading,myRank,myPts,myStreak,myName,plan}){
  const [filter,setFilter]=useState("All");
  const list=filter==="All"?lb:lb.filter(u=>u.rank===filter);
  const nIdx=RANKS.findIndex(r=>r.name===myRank.name)+1;
  const nRank=RANKS[nIdx]||null;
  const pct=myRank.max<Infinity?Math.min(100,((myPts-myRank.min)/(myRank.max-myRank.min))*100):100;
  return(<>
    <div className="ph" style={{marginBottom:4}}>🏆 <em>Leaderboard</em></div>
    <p className="ps">Global rankings. Top 100 are the elite.</p>
    <div className="lb-prog">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22}}>{myRank.icon}</span>
          <div>
            <div style={{fontFamily:"var(--syne)",fontSize:14,fontWeight:800,color:myRank.color}}>{myRank.name}</div>
            <div style={{fontSize:11,color:"var(--mu)"}}>{myPts} pts</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          {myStreak>0&&<div className="streak-badge">🔥 {myStreak} day streak</div>}
          {nRank?<div style={{fontSize:11,color:"var(--mu)",marginTop:2}}>{myRank.max-myPts} pts to {nRank.icon} {nRank.name}</div>:<div style={{fontSize:11,color:"var(--gold)"}}>Max rank! 👑</div>}
        </div>
      </div>
      <div className="lb-track"><div className="lb-fill" style={{width:pct+"%",background:myRank.color}}/></div>
    </div>
    <div className="rank-filters">
      {["All",...RANKS.map(r=>r.name)].map(f=>(
        <button key={f} className={["rf",filter===f?"act":""].join(" ")} onClick={()=>setFilter(f)}>
          {f==="All"?"All":((RANKS.find(r=>r.name===f)?.icon||"")+" "+f)}
        </button>
      ))}
    </div>
    {loading?<div style={{textAlign:"center",padding:30}}><span className="spin-lg spin"/></div>
    :list.length===0?<div style={{textAlign:"center",padding:30,color:"var(--mu)"}}>No users in this rank yet</div>
    :list.map((u,i)=>{
      const pos=lb.findIndex(l=>l.name===u.name&&l.points===u.points)+1;
      const r=RANKS.find(rk=>rk.name===u.rank)||RANKS[0];
      return(<div key={i} className="lb-row" style={{border:u.name===myName?"1.5px solid var(--gr)":undefined}}>
        <div className={["lb-pos",pos<=3?"top3":""].join(" ")}>{pos===1?"🥇":pos===2?"🥈":pos===3?"🥉":"#"+pos}</div>
        <span style={{fontSize:17}}>{r.icon}</span>
        <div className="lb-name">{u.name}{u.name===myName&&<span style={{fontSize:10,color:"var(--gr)",marginLeft:5}}>(you)</span>}</div>
        <div className="lb-right">
          {(u.streak||0)>0&&<span className="streak-badge">🔥{u.streak}</span>}
          {u.plan==="pro"&&<span className="pro-pill">PRO</span>}
          <span className="lb-pts">{u.points||0} pts</span>
        </div>
      </div>);
    })}
  </>);
}

// ─── SOCIAL COMPONENT ────────────────────────────────────────────────────────
function SocialTab({email,profile,plan,following,setFollowing,friendProfiles,setFriendProfiles,allMessages,setAllMessages,activeConvo,setActiveConvo,unreadCount,setUnreadCount}){
  const [view,setView]=useState("friends");
  const [query,setQuery]=useState("");
  const [results,setResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [newMsg,setNewMsg]=useState("");
  const [sending,setSending]=useState(false);
  const maxF=plan==="pro"?200:100;

  const doSearch=async(q)=>{
    setQuery(q);
    if(!q.trim()){setResults([]);return;}
    setSearching(true);
    const r=await DB.searchUsers(q);
    setResults(r.filter(u=>u.email!==email));
    setSearching(false);
  };
  const toggleFollow=async(target)=>{
    if(following.includes(target)){
      await DB.unfollow(email,target);
      const nf=following.filter(e=>e!==target);
      setFollowing(nf);
      setFriendProfiles(friendProfiles.filter(p=>p.email!==target));
    }else{
      if(following.length>=maxF){alert(`Max ${maxF} follows. ${plan!=="pro"?"Upgrade to Pro for 200!":""}`);return;}
      await DB.follow(email,target);
      const nf=[...following,target];
      setFollowing(nf);
      const profiles=await DB.getUsersByEmails(nf);
      setFriendProfiles(profiles);
    }
  };
  const openConvo=async(other)=>{
    setActiveConvo(other);
    await DB.markRead(other,email);
    setUnreadCount(c=>Math.max(0,c-1));
  };
  const sendMsg=async()=>{
    if(!newMsg.trim()||!activeConvo||sending)return;
    setSending(true);
    await DB.sendMsg(email,activeConvo,newMsg.trim());
    setNewMsg("");
    const msgs=await DB.getMessages(email);
    setAllMessages(msgs);
    setSending(false);
  };
  const convoMsgs=(other)=>allMessages.filter(m=>(m.sender_email===email&&m.receiver_email===other)||(m.sender_email===other&&m.receiver_email===email));
  const partners=[...new Set(allMessages.map(m=>m.sender_email===email?m.receiver_email:m.sender_email))];

  return(<>
    <div className="ph" style={{marginBottom:4}}>👥 <em>Social</em></div>
    <p className="ps" style={{marginBottom:12}}>Following {following.length}/{maxF} · {plan!=="pro"&&<span style={{color:"var(--gold)",fontSize:12}}>Pro = 200 follows</span>}</p>
    <div className="social-tabs">
      {[["friends","Friends"],["search","Find People"],["messages","Messages"]].map(([v,l])=>(
        <button key={v} className={["social-tab",view===v?"act":""].join(" ")} onClick={()=>setView(v)}>{l}{v==="messages"&&unreadCount>0&&<span className="unread-dot">{unreadCount}</span>}</button>
      ))}
    </div>

    {view==="friends"&&(friendProfiles.length===0?
      <div style={{textAlign:"center",padding:"30px 20px",color:"var(--mu)"}}>
        <div style={{fontSize:30,marginBottom:8}}>👥</div>
        <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700}}>No friends yet</div>
        <div style={{fontSize:12,marginTop:4}}>Search for people to follow!</div>
      </div>:
      friendProfiles.map((u,i)=>{
        const r=RANKS.find(rk=>rk.name===u.rank)||RANKS[0];
        return(<div key={i} className="ucard">
          <div className="ucard-av">{r.icon}</div>
          <div style={{flex:1}}>
            <div className="ucard-name">{u.name}</div>
            <div className="ucard-meta">{r.name} · {u.points||0} pts {(u.streak||0)>0&&<span style={{color:"#ff6b35"}}>🔥{u.streak}</span>} {u.plan==="pro"&&<span className="pro-pill">PRO</span>}</div>
          </div>
          <button className="msg-btn" onClick={()=>{openConvo(u.email);setView("messages");}}>Message</button>
          <button className="follow-btn ing" onClick={()=>toggleFollow(u.email)}>Following</button>
        </div>);
      })
    )}

    {view==="search"&&<>
      <div style={{display:"flex",gap:8,marginBottom:13}}>
        <input className="finput" placeholder="Search by name…" value={query} onChange={e=>doSearch(e.target.value)} style={{flex:1}}/>
        {searching&&<span className="spin"/>}
      </div>
      {results.length===0&&query&&!searching&&<div style={{textAlign:"center",padding:20,color:"var(--mu)",fontSize:13}}>No users found</div>}
      {results.map((u,i)=>{
        const r=RANKS.find(rk=>rk.name===u.rank)||RANKS[0];
        const isF=following.includes(u.email);
        return(<div key={i} className="ucard">
          <div className="ucard-av">{r.icon}</div>
          <div style={{flex:1}}>
            <div className="ucard-name">{u.name}</div>
            <div className="ucard-meta">{r.name} · {u.points||0} pts {u.plan==="pro"&&<span className="pro-pill">PRO</span>}</div>
          </div>
          <button className={["follow-btn",isF?"ing":""].join(" ")} onClick={()=>toggleFollow(u.email)}>{isF?"Following":"Follow"}</button>
        </div>);
      })}
    </>}

    {view==="messages"&&(activeConvo?
      <>
        <button className="btn-s" style={{marginBottom:11,fontSize:12}} onClick={()=>setActiveConvo(null)}>← Back</button>
        <div className="msg-area">
          {convoMsgs(activeConvo).length===0&&<div style={{textAlign:"center",padding:20,color:"var(--mu)",fontSize:12}}>No messages yet. Say hi!</div>}
          {convoMsgs(activeConvo).map((m,i)=>(
            <div key={i} className={m.sender_email===email?"msg-mine":"msg-theirs"}>
              {m.content}
              <div className="msg-time">{new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:7}}>
          <input className="cin" placeholder="Type a message…" value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}/>
          <button className="csend" onClick={sendMsg} disabled={sending||!newMsg.trim()}>Send</button>
        </div>
      </>:
      <>
        {partners.length===0?<div style={{textAlign:"center",padding:"30px 20px",color:"var(--mu)"}}>
          <div style={{fontSize:30,marginBottom:8}}>💬</div>
          <div style={{fontSize:12}}>No messages yet. Follow someone and message them!</div>
        </div>:partners.map((pe,i)=>{
          const msgs=convoMsgs(pe);
          const last=msgs[msgs.length-1];
          const unread=msgs.filter(m=>m.receiver_email===email&&!m.read).length;
          const p=friendProfiles.find(f=>f.email===pe);
          const r=RANKS.find(rk=>rk.name===p?.rank)||RANKS[0];
          return(<div key={i} className="convo-item" onClick={()=>openConvo(pe)}>
            <span style={{fontSize:16}}>{r.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"var(--syne)",fontSize:12,fontWeight:700,color:"var(--tx)"}}>{p?.name||pe}</div>
              {last&&<div style={{fontSize:11,color:"var(--mu)",marginTop:1}}>{last.content.slice(0,40)}{last.content.length>40?"…":""}</div>}
            </div>
            {unread>0&&<span className="unread-dot">{unread}</span>}
          </div>);
        })}
      </>
    )}
  </>);
}

// ─── FOOD SCAN COMPONENT ─────────────────────────────────────────────────────
function FoodScanTab({email,profile,plan,goal,foodScans,setFoodScans,userRank,userPts,setUserPts,setUserRank,userStreak,lastLogDate,dailyPtsToday,setDailyPtsToday,dailyPtsDate,setDailyPtsDate}){
  const [img,setImg]=useState(null);
  const [b64,setB64]=useState("");
  const [scanning,setScanning]=useState(false);
  const [result,setResult]=useState(null);
  const [scanErr,setScanErr]=useState("");
  const fileRef=useRef(null);
  const goalLabel=GOALS.find(g=>g.id===goal)?.title||goal;

  const todayScans=foodScans.filter(s=>s.created_at?.startsWith(todayStr()));
  const todayCals=todayScans.reduce((a,s)=>a+(s.calories||0),0);
  const todayProt=todayScans.reduce((a,s)=>a+(parseFloat(s.protein_g)||0),0);

  const onFile=e=>{
    const f=e.target.files[0];
    if(!f)return;
    setImg(f);setResult(null);setScanErr("");
    const reader=new FileReader();
    reader.onload=ev=>setB64(ev.target.result.split(",")[1]);
    reader.readAsDataURL(f);
  };

  const doScan=async()=>{
    if(!b64||scanning)return;
    setScanning(true);setScanErr("");
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        messages:[{role:"user",content:[
          {type:"image",source:{type:"base64",media_type:img.type||"image/jpeg",data:b64}},
          {type:"text",text:"Analyze this food photo. User diet: "+profile.diet+". Goal: "+goalLabel+". Return ONLY valid JSON. Fields: foods array (each has name,portion,calories,protein_g,carbs_g,fat_g,fiber_g,vitamins), total_calories, total_protein_g, total_carbs_g, total_fat_g, total_fiber_g, on_plan boolean, plan_match_reason string, health_score number 1-10, notes string."}
        ]}],system:"You are a professional nutritionist. Analyze food photos and return accurate JSON only. No markdown."
      })});
      const d=await r.json();
      if(d.error)throw new Error(d.error.message);
      const txt=(d.content||[]).map(b=>b.text||"").join("").replace(/```json?/g,"").replace(/```/g,"").trim();
      const parsed=JSON.parse(txt);
      setResult(parsed);
      const pts=parsed.on_plan?15:5;
      const np=userPts+pts;
      const nr=getRank(np);
      setUserPts(np);
      setUserRank(nr);
      const t=todayStr();
      const dpToday=dailyPtsDate===t?dailyPtsToday:0;
      const ndp=Math.min(dpToday+pts,DAILY_CAP);
      setDailyPtsToday(ndp);
      setDailyPtsDate(t);
      await DB.updatePoints(email,{points:np,rank:nr.name,streak:userStreak,last_log_date:lastLogDate,daily_points_today:ndp,daily_points_date:t});
      await DB.saveScan({email,food_description:(parsed.foods||[]).map(f=>f.name).join(", "),calories:parsed.total_calories,protein_g:parsed.total_protein_g,carbs_g:parsed.total_carbs_g,fat_g:parsed.total_fat_g,vitamins:(parsed.foods||[]).map(f=>f.vitamins).join("; "),scan_result:JSON.stringify(parsed),points_awarded:pts,on_plan:parsed.on_plan});
      const updated=await DB.getScans(email);
      setFoodScans(updated);
    }catch(e){setScanErr("Could not analyze: "+e.message);}
    finally{setScanning(false);}
  };

  return(<>
    <div className="ph" style={{marginBottom:4}}>📸 <em>Food Scanner</em></div>
    <p className="ps">Take a photo of your food. AI scans calories, macros, and checks your meal plan.</p>
    {todayScans.length>0&&<div className="stat-row" style={{marginBottom:13}}>
      <div className="stat-box"><div className="stat-val" style={{color:"#ff9500"}}>{todayCals}</div><div className="stat-lbl">kcal today</div></div>
      <div className="stat-box"><div className="stat-val" style={{color:"#00b4ff"}}>{todayProt.toFixed(0)}g</div><div className="stat-lbl">protein today</div></div>
      <div className="stat-box"><div className="stat-val" style={{color:"var(--gold)"}}>{todayScans.length}</div><div className="stat-lbl">meals scanned</div></div>
    </div>}
    <div className={["upload-zone",img?"has":""].join(" ")} onClick={()=>fileRef.current?.click()}>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={onFile}/>
      {img?<><div style={{fontSize:28,marginBottom:6}}>✅</div><div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,color:"var(--gr)",marginBottom:3}}>{img.name}</div><div style={{fontSize:11,color:"var(--mu2)"}}>Tap to change</div></>
      :<><div style={{fontSize:36,marginBottom:8}}>📷</div><div style={{fontFamily:"var(--syne)",fontSize:14,fontWeight:700,marginBottom:4}}>Take or Upload Food Photo</div><div style={{fontSize:12,color:"var(--mu2)"}}>AI analyzes calories, protein, carbs, fats and vitamins</div></>}
    </div>
    {img&&!result&&<button className="btn-p btn-full" onClick={doScan} disabled={scanning} style={{marginBottom:11}}>
      {scanning?<><span className="spin"/> Analyzing your food…</>:"🔍 Scan Food"}
    </button>}
    {scanErr&&<div className="err">{scanErr}</div>}
    {result&&<div className="scan-card">
      <div className="on-plan-badge" style={{background:result.on_plan?"rgba(0,229,160,.12)":"rgba(255,77,109,.1)",color:result.on_plan?"var(--gr)":"var(--red)"}}>
        {result.on_plan?"✓ On your meal plan":"⚠ Not on your meal plan"}
      </div>
      {result.plan_match_reason&&<div style={{fontSize:12,color:"var(--mu2)",marginBottom:12,lineHeight:1.5}}>{result.plan_match_reason}</div>}
      <div style={{fontFamily:"var(--syne)",fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--mu)",marginBottom:8}}>Foods Detected</div>
      {(result.foods||[]).map((food,i)=>(
        <div key={i} style={{padding:"9px 0",borderBottom:"1px solid var(--b)"}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--tx)",marginBottom:2}}>{food.name}</div>
          <div style={{fontSize:11,color:"var(--mu2)",marginBottom:5}}>{food.portion}</div>
          <div>
            <span className="mpill" style={{background:"rgba(255,107,53,.12)",color:"#ff6b35"}}>{food.calories} kcal</span>
            <span className="mpill" style={{background:"rgba(0,180,255,.1)",color:"#00b4ff"}}>{food.protein_g}g protein</span>
            <span className="mpill" style={{background:"rgba(255,215,0,.1)",color:"var(--gold)"}}>{food.carbs_g}g carbs</span>
            <span className="mpill" style={{background:"rgba(80,200,120,.1)",color:"#50c878"}}>{food.fat_g}g fat</span>
          </div>
          {food.vitamins&&<div style={{fontSize:11,color:"var(--mu2)",marginTop:3}}>Vitamins: {food.vitamins}</div>}
        </div>
      ))}
      <div style={{background:"var(--bg3)",borderRadius:9,padding:11,marginTop:12}}>
        <div style={{fontFamily:"var(--syne)",fontSize:11,fontWeight:700,marginBottom:9}}>Total Macros</div>
        {[["Calories",result.total_calories,"kcal","#ff6b35",Math.min(100,(result.total_calories/800)*100)],
          ["Protein",result.total_protein_g,"g","#00b4ff",Math.min(100,(result.total_protein_g/50)*100)],
          ["Carbs",result.total_carbs_g,"g","var(--gold)",Math.min(100,(result.total_carbs_g/80)*100)],
          ["Fat",result.total_fat_g,"g","#50c878",Math.min(100,(result.total_fat_g/30)*100)],
          ["Fiber",result.total_fiber_g,"g","#9966cc",Math.min(100,(result.total_fiber_g/15)*100)],
        ].map(([lbl,val,unit,color,pct])=>(
          <div key={lbl} className="macro-row">
            <div className="macro-lbl">{lbl}</div>
            <div className="macro-track"><div className="macro-fill" style={{width:pct+"%",background:color}}/></div>
            <div className="macro-val" style={{color}}>{val}{unit}</div>
          </div>
        ))}
      </div>
      {result.notes&&<div style={{fontSize:12,color:"var(--mu2)",marginTop:10,padding:"9px 12px",background:"var(--bg3)",borderRadius:8,lineHeight:1.6}}>{result.notes}</div>}
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:11,padding:"9px 12px",background:"rgba(0,229,160,.06)",borderRadius:8}}>
        <span style={{fontSize:16}}>{userRank.icon}</span>
        <div style={{fontSize:12,color:"var(--mu2)"}}><strong style={{color:result.on_plan?"var(--gr)":"var(--mu2)"}}>+{result.on_plan?15:5} points</strong> awarded</div>
      </div>
      <button className="btn-s btn-full" style={{marginTop:10}} onClick={()=>{setImg(null);setResult(null);}}>Scan Another Food</button>
    </div>}
    {foodScans.length>0&&<>
      <div style={{fontFamily:"var(--syne)",fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--mu)",margin:"15px 0 9px"}}>Scan History</div>
      {foodScans.map((s,i)=>(
        <div key={i} className="scan-hist">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <div style={{fontFamily:"var(--syne)",fontSize:12,fontWeight:700,color:"var(--tx)"}}>{s.food_description||"Food scan"}</div>
            <div style={{fontSize:10,color:"var(--mu)"}}>{new Date(s.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{marginBottom:5}}>
            {s.calories&&<span className="mpill" style={{background:"rgba(255,107,53,.12)",color:"#ff6b35"}}>{s.calories} kcal</span>}
            {s.protein_g&&<span className="mpill" style={{background:"rgba(0,180,255,.1)",color:"#00b4ff"}}>{s.protein_g}g protein</span>}
            {s.carbs_g&&<span className="mpill" style={{background:"rgba(255,215,0,.1)",color:"var(--gold)"}}>{s.carbs_g}g carbs</span>}
            {s.fat_g&&<span className="mpill" style={{background:"rgba(80,200,120,.1)",color:"#50c878"}}>{s.fat_g}g fat</span>}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:11,fontWeight:700,color:s.on_plan?"var(--gr)":"var(--mu)"}}>{s.on_plan?"✓ On plan":"Not on plan"}</span>
            <span style={{fontSize:11,color:"var(--gold)",fontWeight:700}}>+{s.points_awarded||0} pts</span>
          </div>
        </div>
      ))}
    </>}
  </>);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  // ── screen / step ──
  const [screen,setScreen]=useState("onboard");
  const [step,setStep]=useState(0);
  const [dashTab,setDashTab]=useState("plan");

  // ── auth ──
  const [email,setEmail]=useState("");
  const [emailInput,setEmailInput]=useState("");
  const [codeInputs,setCodeInputs]=useState(["","","","","",""]);
  const codeRefs=[useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const [sentCode,setSentCode]=useState("");
  const [resendTimer,setResendTimer]=useState(0);
  const [sending,setSending]=useState(false);
  const [verifying,setVerifying]=useState(false);
  const [verifyErr,setVerifyErr]=useState("");
  const [emailErr,setEmailErr]=useState("");

  // ── profile ──
  const [name,setName]=useState("");
  const [age,setAge]=useState("");
  const [weight,setWeight]=useState("");
  const [height,setHeight]=useState("");
  const [levelVal,setLevelVal]=useState("Beginner");
  const [diet,setDiet]=useState("No Restrictions");
  const [country,setCountry]=useState("");
  const [langCode,setLangCode]=useState("en");
  const [goal,setGoal]=useState("");
  const [equip,setEquip]=useState([]);
  const [plan,setPlan]=useState("basic");
  const [isMetric,setIsMetric]=useState(false);

  // ── plan data ──
  const [workoutPlan,setWorkoutPlan]=useState("");
  const [mealPlan,setMealPlan]=useState("");
  const [groceryList,setGroceryList]=useState("");
  const [planGenAt,setPlanGenAt]=useState("");
  const [hasGenerated,setHasGenerated]=useState(false);
  const [generating,setGenerating]=useState(false);
  const [regenerating,setRegenerating]=useState(false);
  const [genProgress,setGenProgress]=useState(0);
  const [genMsg,setGenMsg]=useState("");
  const [genErr,setGenErr]=useState("");
  const [planSaved,setPlanSaved]=useState(false);
  const [showExpired,setShowExpired]=useState(false);

  // ── rank / points ──
  const [userPts,setUserPts]=useState(0);
  const [userRank,setUserRank]=useState(RANKS[0]);
  const [userStreak,setUserStreak]=useState(0);
  const [lastLogDate,setLastLogDate]=useState("");
  const [dailyPtsToday,setDailyPtsToday]=useState(0);
  const [dailyPtsDate,setDailyPtsDate]=useState("");

  // ── dashboard data ──
  const [reviews,setReviews]=useState([]);
  const [loadingReviews,setLoadingReviews]=useState(false);
  const [reviewRating,setReviewRating]=useState(5);
  const [reviewText,setReviewText]=useState("");
  const [reviewSubmitted,setReviewSubmitted]=useState(false);
  const [showReviewForm,setShowReviewForm]=useState(false);
  const [progressLogs,setProgressLogs]=useState([]);
  const [leaderboard,setLeaderboard]=useState([]);
  const [loadingLb,setLoadingLb]=useState(false);
  const [foodScans,setFoodScans]=useState([]);

  // ── social ──
  const [following,setFollowing]=useState([]);
  const [friendProfiles,setFriendProfiles]=useState([]);
  const [allMessages,setAllMessages]=useState([]);
  const [activeConvo,setActiveConvo]=useState(null);
  const [unreadCount,setUnreadCount]=useState(0);

  // ── chat ──
  const [msgs,setMsgs]=useState([{role:"bot",text:"Hey! I'm your AI Coach. I know your full plan. Ask me anything! 💪"}]);
  const [chatIn,setChatIn]=useState("");
  const [chatBusy,setChatBusy]=useState(false);
  const [coachMemory,setCoachMemory]=useState("");
  const msgEndRef=useRef(null);

  // ── plan display ──
  const [planTab,setPlanTab]=useState("workout");
  const [grocTab,setGrocTab]=useState("list");

  // ── lang ──
    const [savedFlash,setSavedFlash]=useState(false);

  const isMetricCountry=METRIC_C.includes(country);
  const unit=isMetric?"metric":"imperial";

  // ─── EFFECTS ────────────────────────────────────────────────────────────────

  useEffect(()=>{msgEndRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  useEffect(()=>{
    if(screen!=="dashboard"||!email)return;
    const iv=setInterval(()=>{DB.getUnread(email).then(n=>setUnreadCount(n));},30000);
    DB.getUnread(email).then(n=>setUnreadCount(n));
    return()=>clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[screen]);

  useEffect(()=>{
    if(screen==="dashboard"&&planGenAt&&plan!=="pro"&&isExpired(planGenAt,plan)){
      setShowExpired(true);
      DB.markExpired(email);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[screen,planGenAt]);

  useEffect(()=>{
    if(!country)return;
    const lc=COUNTRY_LANG[country]||"en";
    setLangCode(lc);
    setIsMetric(METRIC_C.includes(country));
  },[country]);

  useEffect(()=>{
    if(dashTab==="reviews"){setLoadingReviews(true);DB.getReviews().then(r=>{setReviews(r);setLoadingReviews(false);});}
    if(dashTab==="progress"){DB.getLogs(email).then(l=>setProgressLogs(l));}
    if(dashTab==="leaderboard"){setLoadingLb(true);DB.leaderboard().then(l=>{setLeaderboard(l);setLoadingLb(false);});}
    if(dashTab==="social"){
      DB.getFollowing(email).then(async f=>{setFollowing(f);const p=await DB.getUsersByEmails(f);setFriendProfiles(p);});
      DB.getMessages(email).then(m=>setAllMessages(m));
    }
    if(dashTab==="photos"){DB.getScans(email).then(s=>setFoodScans(s));}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[dashTab]);

  // ─── RESEND TIMER ──────────────────────────────────────────────────────────
  useEffect(()=>{
    if(resendTimer<=0)return;
    const iv=setInterval(()=>setResendTimer(t=>t-1),1000);
    return()=>clearInterval(iv);
  },[resendTimer]);

  // ─── REVIEW TAB PRE-LOAD ───────────────────────────────────────────────────
  useEffect(()=>{
    if(step===2){setLoadingReviews(true);DB.getReviews().then(r=>{setReviews(r);setLoadingReviews(false);});}
  },[step]);

  // ─── EMAIL VERIFY ──────────────────────────────────────────────────────────
  const sendVerify=async()=>{
    if(!emailInput.trim()||!/\S+@\S+\.\S+/.test(emailInput)){setEmailErr("Please enter a valid email.");return;}
    setEmailErr("");setSending(true);
    const code=String(Math.floor(100000+Math.random()*900000));
    setSentCode(code);
    try{
      await sendCode(emailInput.trim().toLowerCase(),code);
      setEmail(emailInput.trim().toLowerCase());
      setStep(0.5);
      setResendTimer(60);
    }catch(e){setEmailErr("Failed to send code: "+e.message);}
    setSending(false);
  };

  const verifyEmailCode=async()=>{
    const entered=codeInputs.join("");
    if(entered.length<6)return;
    setVerifying(true);setVerifyErr("");
    setTimeout(async()=>{
      if(entered===sentCode){
        const existing=await DB.get(email);
        if(existing?.workout_plan){
          setWorkoutPlan(existing.workout_plan);
          setMealPlan(existing.meal_plan||"");
          setGroceryList(existing.grocery_list||"");
          setPlanGenAt(existing.plan_generated_at||"");
          setName(existing.name||"");
          setAge(existing.age||"");
          setWeight(existing.weight||"");
          setHeight(existing.height||"");
          setLevelVal(existing.level||"Beginner");
          setDiet(existing.diet||"No Restrictions");
          setGoal(existing.goal||"");
          setEquip(existing.equipment?JSON.parse(existing.equipment):[]);
          setPlan(existing.plan||"basic");
          setCountry(existing.country||"");
          setLangCode(existing.language||"en");
          setUserPts(existing.points||0);
          setUserRank(getRank(existing.points||0));
          setUserStreak(existing.streak||0);
          setLastLogDate(existing.last_log_date||"");
          setDailyPtsToday(existing.daily_points_today||0);
          setDailyPtsDate(existing.daily_points_date||"");
          setCoachMemory(existing.coach_memory||"");
          setHasGenerated(true);
          setScreen("dashboard");
        }else{
          if(existing){
            setName(existing.name||"");setAge(existing.age||"");setWeight(existing.weight||"");setHeight(existing.height||"");
            setLevelVal(existing.level||"Beginner");setDiet(existing.diet||"No Restrictions");
            setGoal(existing.goal||"");setPlan(existing.plan||"basic");
            setCountry(existing.country||"");setLangCode(existing.language||"en");
          }
          setStep(1);
        }
      }else{
        setVerifyErr("Incorrect code. Try again.");
        setCodeInputs(["","","","","",""]);
        codeRefs[0].current?.focus();
      }
      setVerifying(false);
    },600);
  };

  const handleCodeInput=(idx,val)=>{
    if(!/^\d*$/.test(val))return;
    const next=[...codeInputs];
    next[idx]=val.slice(-1);
    setCodeInputs(next);
    if(val&&idx<5)codeRefs[idx+1].current?.focus();
    if(next.join("").length===6){
      setCodeInputs(next);
      setTimeout(()=>verifyEmailCode(),100);
    }
  };

  // ─── GENERATE PLAN ─────────────────────────────────────────────────────────
  const generate=async(isRegen=false)=>{
    if(plan==="basic"&&hasGenerated&&!isRegen)return;
    isRegen?setRegenerating(true):setGenerating(true);
    setGenErr("");setGenProgress(0);

    const days=plan==="pro"?30:7;
    const goalLabel=GOALS.find(g=>g.id===goal)?.title||goal;
    const equipList=equip.join(", ")||"bodyweight only";
    const ctx=`Name:${name}, Age:${age}, Weight:${weight}, Height:${height}, Level:${levelVal}, Diet:${diet}, Goal:${goalLabel}, Equipment:${equipList}, Units:${unit}`;
    const caloricGoal=goal==="weight_loss"?"caloric deficit (300-500 below maintenance)":goal==="muscle_gain"?"caloric surplus (300-500 above maintenance)":"maintenance calories";
    const sys="You are an expert fitness coach and nutritionist.";

    try{
      setGenMsg("Building your workout plan…");setGenProgress(20);
      const workout=await ai(
        `Create a ${days}-day workout plan for: ${ctx}. Write Day 1 through Day ${days}. For each day list 4-6 exercises with sets and reps. Mark rest days. Be concise.`,
        sys,{isPlanGeneration:true,isPro:plan==="pro"}
      );
      setGenProgress(50);setGenMsg("Building your meal plan with macros…");
      const meal=await ai(
        `Create a ${days}-day meal plan for: ${ctx}. The person needs a ${caloricGoal}. Strictly follow ${diet} diet. For EACH meal (Breakfast, Lunch, Dinner, Snack) write the meal name, ingredients, and macros in this exact format: [Calories: Xkcal | Protein: Xg | Carbs: Xg | Fat: Xg]. At end of each day add: [DAILY TOTAL - Calories: Xkcal | Protein: Xg | Carbs: Xg | Fat: Xg]`,
        sys
      );
      setGenProgress(80);setGenMsg("Creating grocery list and recipes…");
      const grocery=await ai(
        `Based on this ${days}-day meal plan, create: 1) A GROCERY LIST organized by category (Proteins, Produce, Grains, Dairy/Alternatives, Other) 2) A RECIPES section with 3 simple meal prep recipes. Strictly follow ${diet} diet. Use ${unit} measurements. Meal plan: ${meal.slice(0,600)}`,
        sys
      );
      setWorkoutPlan(workout);setMealPlan(meal);setGroceryList(grocery);
      const genAt=new Date().toISOString();
      setPlanGenAt(genAt);
      const sp=startPts(levelVal);
      const nr=getRank(sp);
      setUserPts(sp);setUserRank(nr);
      setGenProgress(100);setGenMsg("Done!");
      await DB.upsert({email,name,age,weight,height,level:levelVal,diet,goal,equipment:JSON.stringify(equip),plan,country,language:langCode,workout_plan:workout,meal_plan:meal,grocery_list:grocery,plan_generated_at:genAt,points:sp,rank:nr.name,streak:0,last_log_date:"",daily_points_today:0,daily_points_date:todayStr()});
      setHasGenerated(true);
      setPlanSaved(true);
      setScreen("dashboard");
    }catch(e){
      const msg=e.message||"";
      if(msg.includes("PLAN_LIMIT_REACHED")||msg.includes("Free plan limit")){setGenErr(msg);}
      else{setGenErr("Error generating plan: "+msg);}
    }finally{setGenerating(false);setRegenerating(false);}
  };

  // ─── CHAT ──────────────────────────────────────────────────────────────────
  const summarizeSession=async()=>{
    if(msgs.length<4||!email)return;
    try{
      const goalLabel=GOALS.find(g=>g.id===goal)?.title||"";
      const history=msgs.slice(-20).map(m=>(m.role==="bot"?"Coach":"User")+": "+m.text).join("\n");
      const summary=await ai(
        "Summarize this fitness coaching session in 100 words max. Focus on: what was logged, advice given, next steps. User: "+name+", Goal: "+goalLabel+".\n\n"+history,
        "You are summarizing a fitness coaching session. Be concise. Third person."
      );
      const newMem=(coachMemory?coachMemory+"\n\n":"")+("["+new Date().toLocaleDateString()+"] "+summary);
      const trimmed=newMem.slice(-3000);
      setCoachMemory(trimmed);
      await DB.saveMemory(email,trimmed);
    }catch(e){console.error("Memory error:",e);}
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>()=>{if(dashTab==="chat"&&msgs.length>4)summarizeSession();},[dashTab]);

  const sendChat=async(text)=>{
    if(!text.trim()||chatBusy)return;
    setChatIn("");
    setMsgs(m=>[...m,{role:"user",text}]);
    setChatBusy(true);
    const goalLabel=GOALS.find(g=>g.id===goal)?.title||"";
    const history=msgs.map(m=>({role:m.role==="bot"?"assistant":"user",content:m.text}));
    history.push({role:"user",content:text});
    const KW=["sets","reps","lbs","kg","km","miles","minutes","completed","finished","did","ran","lifted","bench","squat","deadlift","log","weigh","weight","pb","pr","personal record","personal best"];
    const isLog=KW.some(k=>text.toLowerCase().includes(k));
    const memCtx=coachMemory?"\n\nPrevious sessions:\n"+coachMemory.slice(-600):"";
    const sys=`You are an expert AI personal trainer named Coach. User: Name:${name}, Age:${age}, Weight:${weight}, Goal:${goalLabel}, Level:${levelVal}, Diet:${diet}, Rank:${userRank.name}, Streak:${userStreak} days.${memCtx} Be encouraging and specific. Under 150 words.${isLog?" The user is logging progress — acknowledge enthusiastically and give a motivating tip.":""}`;
    try{
      const reply=await aiChat(history,sys);
      setMsgs(m=>[...m,{role:"bot",text:reply}]);
      if(isLog&&email){
        const type=text.toLowerCase().includes("pr")||text.toLowerCase().includes("personal record")?"pr":text.toLowerCase().includes("weight")||text.toLowerCase().includes("weigh")?"weight":text.toLowerCase().includes("ran")||text.toLowerCase().includes("km")||text.toLowerCase().includes("miles")?"cardio":"workout";
        const t=todayStr();
        const y=yestStr();
        const ns=lastLogDate===t?userStreak:lastLogDate===y?userStreak+1:1;
        const dpToday=dailyPtsDate===t?dailyPtsToday:0;
        const base=type==="pr"?25:type==="weight"?15:10;
        const earned=Math.min(dpToday>0?Math.ceil(base/2):base,Math.max(0,DAILY_CAP-dpToday));
        let bonus=0;
        if(ns===7)bonus=50;
        if(ns===30)bonus=150;
        const np=userPts+earned+bonus;
        const nr=getRank(np);
        const ndp=Math.min(dpToday+earned,DAILY_CAP);
        setUserPts(np);setUserRank(nr);setUserStreak(ns);setLastLogDate(t);setDailyPtsToday(ndp);setDailyPtsDate(t);
        await DB.saveLog(email,text,type);
        await DB.updatePoints(email,{points:np,rank:nr.name,streak:ns,last_log_date:t,daily_points_today:ndp,daily_points_date:t});
        setSavedFlash(true);setTimeout(()=>setSavedFlash(false),3000);
        if(nr.name!==userRank.name)setTimeout(()=>setMsgs(m=>[...m,{role:"bot",text:"🎉 RANK UP! You just reached "+nr.icon+" "+nr.name+"! Keep going!"}]),600);
        if(bonus>0)setTimeout(()=>setMsgs(m=>[...m,{role:"bot",text:"🔥 "+ns+"-day streak bonus! +"+bonus+" points!"}]),900);
      }
    }catch(e){setMsgs(m=>[...m,{role:"bot",text:"Sorry, couldn't connect: "+e.message}]);}
    finally{setChatBusy(false);}
  };

  // ─── REVIEWS ───────────────────────────────────────────────────────────────
  const submitReview=async()=>{
    if(!reviewText.trim())return;
    const goalLabel=GOALS.find(g=>g.id===goal)?.title||"";
    await DB.saveReview({email,name,rating:reviewRating,review_text:reviewText,goal:goalLabel});
    setReviewSubmitted(true);
    const r=await DB.getReviews();setReviews(r);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return(<>
    <style>{G}</style>
    <div className="app">

      {/* STEP 0 — EMAIL */}
      {screen==="onboard"&&step===0&&<>
        <div className="topbar"><div className="logo">FitPlan Pro</div></div>
        <div className="pscroll"><div className="pinner">
          <div className="ph">Your AI fitness plan,<br/><em>built for you.</em></div>
          <p className="ps">Enter your email to get started. Returning users will have their plan restored automatically.</p>
          <div className="field">
            <label className="flabel">Email Address</label>
            <input className="finput" type="email" placeholder="you@email.com" value={emailInput} onChange={e=>{setEmailInput(e.target.value);setEmailErr("");}} onKeyDown={e=>e.key==="Enter"&&sendVerify()}/>
            {emailErr&&<div className="err" style={{marginTop:6,marginBottom:0}}>{emailErr}</div>}
          </div>
          <div className="trust-bar">
            <div className="trust-item">🔒 Secure</div>
            <div className="trust-item">⚡ AI-Powered</div>
            <div className="trust-item">🌍 28 Languages</div>
            <div className="trust-item">🏆 Rank System</div>
          </div>
          <div className="sbar"><div className="sbar-inner">
            <button className="btn-p" onClick={sendVerify} disabled={sending||!emailInput.trim()}>
              {sending?<><span className="spin"/> Sending…</>:"Continue →"}
            </button>
          </div></div>
        </div></div>
      </>}

      {/* STEP 0.5 — VERIFY CODE */}
      {screen==="onboard"&&step===0.5&&<>
        <div className="topbar"><div className="logo">FitPlan Pro</div></div>
        <div className="pscroll"><div className="pinner">
          <div className="vbox">
            <div className="vicon">📧</div>
            <div className="vtitle">Check your inbox</div>
            <div className="vsub">We sent a 6-digit code to <span className="vemail" style={{color:"var(--gr)"}}>{email}</span>. Enter it below.</div>
            <div className="code-row">
              {codeInputs.map((v,i)=>(
                <input key={i} ref={codeRefs[i]} className="code-inp" maxLength={1} value={v}
                  onChange={e=>handleCodeInput(i,e.target.value)}
                  onKeyDown={e=>{if(e.key==="Backspace"&&!v&&i>0)codeRefs[i-1].current?.focus();}}
                  onFocus={e=>e.target.select()}/>
              ))}
            </div>
            {verifyErr&&<div className="err" style={{marginBottom:11}}>{verifyErr}</div>}
            {verifying&&<div style={{textAlign:"center",marginBottom:10}}><span className="spin"/></div>}
            <button className="resend-btn" disabled={resendTimer>0} onClick={()=>{setSentCode(String(Math.floor(100000+Math.random()*900000)));setResendTimer(60);sendCode(email,sentCode);}}>
              {resendTimer>0?"Resend in "+resendTimer+"s":"Resend code"}
            </button>
          </div>
          <div style={{marginTop:14,textAlign:"center"}}>
            <button className="resend-btn" onClick={()=>{setStep(0);setCodeInputs(["","","","","",""]);setSentCode("");}}>← Change email</button>
          </div>
        </div></div>
      </>}

      {/* STEPS 1-6 PROGRESS BAR */}
      {screen==="onboard"&&step>=1&&step<=6&&<>
        <div className="topbar"><div className="logo">FitPlan Pro</div></div>
        <div className="prog-wrap">
          <div className="prog-steps">
            {STEPS.slice(1).map((s,i)=>{
              const n=i+1;
              return(<>
                {i>0&&<div key={"l"+i} className={["pline",step>n?"done":""].join(" ")}/>}
                <div key={"d"+i} className={["pdot",step>n?"done":step===n?"act":""].join(" ")}>{step>n?"✓":n}</div>
              </>);
            })}
          </div>
          <div className="prog-labels">
            {STEPS.slice(1).map((s,i)=>(
              <span key={i} className={step===i+1?"act":""}>{s}</span>
            ))}
          </div>
        </div>
      </>}

      {/* STEP 1 — LOCATION */}
      {screen==="onboard"&&step===1&&<>
        <div className="pscroll"><div className="pinner">
          
          <div className="ph">Where are<br/><em>you located?</em></div>
          <p className="ps">We'll set your units and language automatically.</p>
          <div className="field">
            <label className="flabel">Country / Region</label>
            <select className="fsel" value={country} onChange={e=>setCountry(e.target.value)}>
              <option value="">Select your country…</option>
              {COUNTRIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="flabel">Language</label>
            <div className="lang-grid">
              {ALL_LANGS.map(l=>(
                <div key={l.code} className={["lang-opt",langCode===l.code?"sel":""].join(" ")} onClick={()=>setLangCode(l.code)}>
                  <span className="lang-flag">{l.flag}</span>{l.name}
                </div>
              ))}
            </div>
          </div>
          <div className="sbar"><div className="sbar-inner">
            <button className="btn-s" onClick={()=>setStep(0)}>Back</button>
            <button className="btn-p" onClick={()=>setStep(2)} disabled={!country}>Continue →</button>
          </div></div>
        </div></div>
      </>}

      {/* STEP 2 — REVIEWS */}
      {screen==="onboard"&&step===2&&<>
        <div className="pscroll"><div className="pinner">
          <div className="ph">What people<br/><em>say.</em></div>
          <p className="ps">Real reviews from FitPlan Pro users.</p>
          {loadingReviews&&<div style={{textAlign:"center",padding:30}}><span className="spin"/></div>}
          {!loadingReviews&&reviews.length===0&&<div style={{textAlign:"center",padding:"30px 20px",background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12}}>
            <div style={{fontSize:30,marginBottom:8}}>⭐</div>
            <div style={{fontFamily:"var(--syne)",fontWeight:700}}>Be the first to review!</div>
          </div>}
          {reviews.slice(0,5).map((r,i)=>(
            <div key={i} className="rev-card">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,color:"var(--tx)"}}>{r.name}</div>
                <div style={{fontSize:13}}>{"⭐".repeat(r.rating)}</div>
              </div>
              {r.goal&&<div style={{fontSize:11,color:"var(--gr)",fontWeight:600,marginBottom:4}}>{r.goal}</div>}
              <div style={{fontSize:12,color:"var(--mu2)",lineHeight:1.6}}>{r.review_text}</div>
            </div>
          ))}
          <div className="sbar"><div className="sbar-inner">
            <button className="btn-s" onClick={()=>setStep(1)}>Back</button>
            <button className="btn-p" onClick={()=>setStep(3)}>Continue →</button>
          </div></div>
        </div></div>
      </>}

      {/* STEP 3 — PROFILE */}
      {screen==="onboard"&&step===3&&<>
        <div className="pscroll"><div className="pinner">
          <div className="ph">Tell us about<br/><em>yourself.</em></div>
          <p className="ps">This shapes every part of your plan.</p>
          <div className="field">
            <label className="flabel">First Name</label>
            <input className="finput" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
          </div>
          <div className="frow">
            <div className="field">
              <label className="flabel">Age</label>
              <input className="finput" type="number" placeholder="25" value={age} onChange={e=>setAge(e.target.value)}/>
            </div>
            <div className="field">
              <label className="flabel">Weight ({isMetricCountry?"kg":"lb"})</label>
              <input className="finput" placeholder={isMetricCountry?"75":"165"} value={weight} onChange={e=>setWeight(e.target.value)}/>
            </div>
          </div>
          <div className="frow">
            <div className="field">
              <label className="flabel">Height ({isMetricCountry?"cm":"ft/in"})</label>
              <input className="finput" placeholder={isMetricCountry?"178":"511"} value={height} onChange={e=>setHeight(e.target.value)}/>
              {!isMetricCountry&&height&&<div className="hint">e.g. 511 = 5ft 11in</div>}
            </div>
            <div className="field">
              <label className="flabel">Fitness Level</label>
              <select className="fsel" value={levelVal} onChange={e=>setLevelVal(e.target.value)}>
                {LEVELS.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="flabel">Dietary Preferences</label>
            <select className="fsel" value={diet} onChange={e=>setDiet(e.target.value)}>
              {DIETS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="sbar"><div className="sbar-inner">
            <button className="btn-s" onClick={()=>setStep(2)}>Back</button>
            <button className="btn-p" onClick={()=>setStep(4)} disabled={!name.trim()||!age||!weight||!height}>Continue →</button>
          </div></div>
        </div></div>
      </>}

      {/* STEP 4 — GOAL */}
      {screen==="onboard"&&step===4&&<>
        <div className="pscroll"><div className="pinner">
          <div className="ph">What's your<br/><em>main goal?</em></div>
          <p className="ps">Choose what matters most right now.</p>
          <div className="goal-list">
            {GOALS.map(g=>(
              <div key={g.id} className={["goal-item",goal===g.id?"sel":""].join(" ")} onClick={()=>setGoal(g.id)}>
                <span className="goal-icon">{g.icon}</span>
                <div><div className="goal-title">{g.title}</div><div className="goal-desc">{g.desc}</div></div>
                <div className="grad"/>
              </div>
            ))}
          </div>
          <div className="sbar"><div className="sbar-inner">
            <button className="btn-s" onClick={()=>setStep(3)}>Back</button>
            <button className="btn-p" onClick={()=>setStep(5)} disabled={!goal}>Continue →</button>
          </div></div>
        </div></div>
      </>}

      {/* STEP 5 — EQUIPMENT */}
      {screen==="onboard"&&step===5&&<>
        <div className="pscroll"><div className="pinner">
          <div className="ph">What equipment<br/><em>do you have?</em></div>
          <p className="ps">Select everything available — we'll build around what you have.</p>
          {Object.entries(EQUIPMENT).map(([cat,items])=>(
            <div key={cat} className="eq-sec">
              <div className="eq-head">{cat}</div>
              <div className="chip-grid">
                {items.map(item=>(
                  <div key={item.id} className={["chip",equip.includes(item.id)?"sel":""].join(" ")} onClick={()=>setEquip(e=>e.includes(item.id)?e.filter(x=>x!==item.id):[...e,item.id])}>
                    <span className="chip-icon">{item.icon}</span>
                    <span className="chip-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="sbar"><div className="sbar-inner">
            <button className="btn-s" onClick={()=>setStep(4)}>Back</button>
            <button className="btn-p" onClick={()=>setStep(6)}>Continue →</button>
          </div></div>
        </div></div>
      </>}

      {/* STEP 6 — PLAN */}
      {screen==="onboard"&&step===6&&<>
        <div className="pscroll"><div className="pinner">
          <div className="ph">Choose your<br/><em>plan.</em></div>
          <p className="ps">Both include a full meal and workout plan tailored to you.</p>
          <div className="sumbox">
            <div><div className="slabel">Goal</div><div className="sval">{GOALS.find(g=>g.id===goal)?.title||"—"}</div></div>
            <div><div className="slabel">Level</div><div className="sval">{levelVal}</div></div>
            <div><div className="slabel">Diet</div><div className="sval">{diet}</div></div>
          </div>
          <div className="price-grid">
            <div className={["pcard",plan==="basic"?"sel":""].join(" ")} onClick={()=>setPlan("basic")}>
              <div className="pname">Basic</div>
              <div className="pprice">$0<span>/mo</span></div>
              <ul className="pfeat-list" style={{marginTop:10}}>
                {["7-day workout plan","7-day meal plan","AI Coach","Quick prompts"].map(f=><li key={f}><span className="ck">✓</span>{f}</li>)}
                {["30-day plans","Grocery list","Unlimited regen"].map(f=><li key={f} className="no"><span className="ck">✗</span>{f}</li>)}
              </ul>
            </div>
            <div className={["pcard feat",plan==="pro"?"sel":""].join(" ")} onClick={()=>setPlan("pro")}>
              <div className="pbadge">MOST POPULAR</div>
              <div className="pname" style={{marginTop:16}}>Pro</div>
              <div className="pprice" style={{color:"var(--gold)"}}>$5<span>/mo</span></div>
              <ul className="pfeat-list" style={{marginTop:10}}>
                {["30-day workout plan","30-day meal plan","AI Coach","Quick prompts","Grocery list","Unlimited regen","200 follows"].map(f=><li key={f}><span className="ck">✓</span>{f}</li>)}
              </ul>
            </div>
          </div>
          {genErr&&<div className="err">{genErr}</div>}
          {generating&&<div className="lbar-wrap">
            <div className="lbar-lbl"><span>{genMsg}</span><span>{genProgress}%</span></div>
            <div className="lbar"><div className="lfill" style={{width:genProgress+"%"}}/></div>
          </div>}
          <div className="sbar"><div className="sbar-inner">
            <button className="btn-s" onClick={()=>setStep(5)} disabled={generating}>Back</button>
            {plan==="basic"?
              <button className="btn-p" onClick={()=>generate(false)} disabled={generating}>
                {generating?<><span className="spin"/> Building…</>:"Generate Free Plan →"}
              </button>:
              <button className="btn-gold" onClick={()=>generate(false)} disabled={generating}>
                {generating?<><span className="spin"/> Building…</>:"Start Pro — $5/mo →"}
              </button>
            }
          </div></div>
        </div></div>
      </>}

      {/* DASHBOARD */}
      {screen==="dashboard"&&<>
        {/* expired modal */}
        {showExpired&&plan!=="pro"&&<div className="exp-overlay">
          <div className="exp-card">
            <div style={{fontSize:44,marginBottom:14}}>⏰</div>
            <div style={{fontFamily:"var(--syne)",fontSize:20,fontWeight:800,marginBottom:8}}>Your free plan has expired</div>
            <div style={{fontSize:13,color:"var(--mu2)",lineHeight:1.6,marginBottom:20}}>Your 7-day free plan ended. Upgrade to Pro for 30-day plans, grocery lists, unlimited regenerations, and more.</div>
            <button className="btn-gold btn-full" style={{marginBottom:10}} onClick={()=>setShowExpired(false)}>Upgrade to Pro — $5/mo</button>
            <button className="btn-s btn-full" onClick={()=>setShowExpired(false)}>Maybe later</button>
          </div>
        </div>}

        {savedFlash&&<div className="saved-flash">💾 Progress logged!</div>}

        <div className="topbar">
          <div className="logo">FitPlan Pro</div>
          <div className="topbar-right">
            <span style={{fontSize:17}}>{userRank.icon}</span>
            {plan==="pro"&&<span className="pro-pill">PRO</span>}
            {userStreak>0&&<span className="streak-badge">🔥{userStreak}</span>}
            <span style={{fontSize:12,color:"var(--tx)",fontWeight:600}}>{name}</span>
          </div>
        </div>

        <div className="dnav">
          {[["plan","My Plan"],["chat","AI Coach"],["progress","📊 Progress"],["leaderboard","🏆 Ranks"],["social","👥 Social"+(unreadCount>0?" ●":"")],["photos","📸 Food Scan"],["grocery",plan==="pro"?"Grocery":"🔒 Grocery"],["reviews","Reviews"],["profile","Profile"]].map(([id,lbl])=>(
            <button key={id} className={["dtab",dashTab===id?"act":""].join(" ")} onClick={()=>setDashTab(id)}>{lbl}</button>
          ))}
        </div>

        <div className="pscroll"><div className="pinner">

          {/* MY PLAN */}
          {dashTab==="plan"&&<>
            <div className="ph" style={{marginBottom:4}}>Your <em>{plan==="pro"?"30":"7"}-Day</em> Plan</div>
            <p className="ps" style={{marginBottom:10}}>Goal: <strong style={{color:"var(--gr)"}}>{GOALS.find(g=>g.id===goal)?.title}</strong> · {levelVal} · {diet}</p>
            {planSaved&&<div className="ok">💾 Plan saved. Log in anytime with your email.</div>}
            <div className="rtabs">
              <button className={["rtab",planTab==="workout"?"act":""].join(" ")} onClick={()=>setPlanTab("workout")}>💪 Workout Plan</button>
              <button className={["rtab",planTab==="meal"?"act":""].join(" ")} onClick={()=>setPlanTab("meal")}>🥗 Meal Plan</button>
            </div>
            {planTab==="workout"&&<div className="rbody" style={{whiteSpace:"pre-wrap"}}>{workoutPlan}</div>}
            {planTab==="meal"&&<div className="rbody" style={{whiteSpace:"pre-wrap"}}>
              {mealPlan.split("\n").map((line,i)=>{
                if(line.includes("[Calories:")||line.includes("[DAILY TOTAL")){
                  return <div key={i} style={{background:"var(--bg3)",borderRadius:7,padding:"5px 9px",margin:"3px 0 7px",display:"flex",flexWrap:"wrap",gap:5}}>
                    {line.split("[").join("").split("]").join("").split("|").map((p,j)=>{
                      const colors=["#ff9500","#00b4ff","var(--gold)","#50c878"];
                      return <span key={j} className="meal-macro-pill" style={{background:"rgba(255,255,255,.05)",color:colors[j]||"var(--mu2)"}}>{p.trim()}</span>;
                    })}
                  </div>;
                }
                if(line.match(/^Day \d+/)) return <div key={i} style={{fontFamily:"var(--syne)",fontWeight:700,color:"var(--tx)",marginTop:16,marginBottom:4,fontSize:14}}>{line}</div>;
                if(line.match(/Breakfast:|Lunch:|Dinner:|Snack:/)) return <div key={i} style={{color:"var(--gr)",fontWeight:600,fontSize:12,marginTop:8}}>{line}</div>;
                return <div key={i} style={{fontSize:12,color:"var(--mu2)",lineHeight:1.7}}>{line}</div>;
              })}
            </div>}
            {plan==="basic"?<div style={{marginTop:11}}>
              <div className="upsell">
                <div className="upsell-title">✦ Upgrade to Pro</div>
                <div className="upsell-sub">Get 30-day plans, grocery lists, unlimited regenerations and more.</div>
                <button className="btn-gold btn-full">Upgrade to Pro — $5/mo</button>
              </div>
            </div>:<div style={{marginTop:11,display:"flex",flexDirection:"column",gap:8}}>
              <div style={{padding:"10px 13px",background:"rgba(245,197,66,.07)",border:"1px solid rgba(245,197,66,.2)",borderRadius:9}}>
                <div style={{fontFamily:"var(--syne)",fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:2}}>PRO — 30-Day Adaptive Plan</div>
                <div style={{fontSize:11,color:"var(--mu2)"}}>Regenerate anytime for a fresh updated plan.</div>
              </div>
              <button className="btn-s btn-full" onClick={()=>generate(true)} disabled={regenerating}>
                {regenerating?<><span className="spin"/> Regenerating…</>:"🔄 Regenerate Plan"}
              </button>
            </div>}
          </>}

          {/* AI COACH */}
          {dashTab==="chat"&&<>
            <div className="ph" style={{marginBottom:3}}><em>AI Coach</em></div>
            <p className="ps" style={{marginBottom:10}}>I know your full plan. Ask me anything.</p>
            {coachMemory&&<div style={{background:"var(--gbg)",border:"1px solid rgba(0,229,160,.15)",borderRadius:8,padding:"7px 11px",fontSize:11,color:"var(--mu2)",marginBottom:10}}>🧠 I remember your previous sessions</div>}
            <div className="prompt-chips">
              {["How am I doing?","Modify today's workout","What to eat for lunch?","I missed a workout","Motivate me","Log my progress","Explain an exercise","I have a sore muscle"].map(p=>(
                <div key={p} className="prompt-chip" onClick={()=>sendChat(p)}>{p}</div>
              ))}
            </div>
            <div className="chat-msgs">
              {msgs.map((m,i)=>(
                <div key={i} className={["mrow",m.role==="user"?"user":""].join(" ")}>
                  <div className={["mav",m.role==="bot"?"bot":"usr"].join(" ")}>{m.role==="bot"?"🤖":"YOU"}</div>
                  <div className={["mbub",m.role==="bot"?"bot":"usr"].join(" ")}>{m.text}</div>
                </div>
              ))}
              {chatBusy&&<div className="mrow"><div className="mav bot">🤖</div><div className="mbub bot"><span className="spin"/></div></div>}
              <div ref={msgEndRef}/>
            </div>
            <div className="cin-row">
              <input className="cin" placeholder="Ask your coach anything…" value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat(chatIn)}/>
              <button className="csend" onClick={()=>sendChat(chatIn)} disabled={chatBusy||!chatIn.trim()}>Send</button>
            </div>
          </>}

          {/* PROGRESS */}
          {dashTab==="progress"&&<>
            <div className="ph" style={{marginBottom:4}}>Your <em>Progress</em></div>
            <p className="ps">Logged automatically when you tell your AI Coach about workouts.</p>
            <div className="stat-row">
              <div className="stat-box"><div className="stat-val" style={{color:userRank.color}}>{userRank.icon}</div><div className="stat-lbl">{userRank.name}</div><div style={{fontSize:10,color:"var(--mu)"}}>{userPts} pts</div></div>
              <div className="stat-box"><div className="stat-val">🔥</div><div className="stat-lbl">{userStreak} day streak</div></div>
              <div className="stat-box"><div className="stat-val">{progressLogs.length}</div><div className="stat-lbl">Total logs</div></div>
            </div>
            <div className="ok" style={{marginBottom:13}}>💡 Tell your AI Coach "I did bench press 185lbs" or "ran 5km" to earn points!</div>
            {progressLogs.length===0?<div style={{textAlign:"center",padding:"30px 20px",background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12}}>
              <div style={{fontSize:32,marginBottom:8}}>📊</div>
              <div style={{fontFamily:"var(--syne)",fontSize:14,fontWeight:700,marginBottom:5}}>No logs yet</div>
              <div style={{fontSize:13,color:"var(--mu2)"}}>Start chatting with your AI Coach!</div>
            </div>:progressLogs.map((l,i)=>(
              <div key={i} className="log-item">
                <span style={{fontSize:18}}>{l.type==="workout"?"💪":l.type==="cardio"?"🏃":l.type==="pr"?"🏅":"⚖️"}</span>
                <div style={{flex:1}}>
                  <div className="log-entry">{l.entry}</div>
                  <div className="log-meta">
                    <span className="type-pill" style={{background:l.type==="workout"?"rgba(0,229,160,.15)":l.type==="cardio"?"rgba(0,180,255,.12)":l.type==="pr"?"rgba(245,197,66,.12)":"rgba(80,200,120,.12)",color:l.type==="workout"?"var(--gr)":l.type==="cardio"?"#00b4ff":l.type==="pr"?"var(--gold)":"#50c878"}}>{l.type}</span>
                    {new Date(l.logged_at).toLocaleDateString()} {new Date(l.logged_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
              </div>
            ))}
          </>}

          {/* LEADERBOARD */}
          {dashTab==="leaderboard"&&<LeaderboardTab lb={leaderboard} loading={loadingLb} myRank={userRank} myPts={userPts} myStreak={userStreak} myName={name} plan={plan}/>}

          {/* SOCIAL */}
          {dashTab==="social"&&<SocialTab email={email} profile={{name,diet}} plan={plan} following={following} setFollowing={setFollowing} friendProfiles={friendProfiles} setFriendProfiles={setFriendProfiles} allMessages={allMessages} setAllMessages={setAllMessages} activeConvo={activeConvo} setActiveConvo={setActiveConvo} unreadCount={unreadCount} setUnreadCount={setUnreadCount}/>}

          {/* FOOD SCAN */}
          {dashTab==="photos"&&<FoodScanTab email={email} profile={{diet}} plan={plan} goal={goal} foodScans={foodScans} setFoodScans={setFoodScans} userRank={userRank} userPts={userPts} setUserPts={setUserPts} setUserRank={setUserRank} userStreak={userStreak} lastLogDate={lastLogDate} dailyPtsToday={dailyPtsToday} setDailyPtsToday={setDailyPtsToday} dailyPtsDate={dailyPtsDate} setDailyPtsDate={setDailyPtsDate}/>}

          {/* GROCERY */}
          {dashTab==="grocery"&&<>
            <div className="ph" style={{marginBottom:4}}><em>Grocery</em> & Recipes</div>
            <p className="ps">Auto-generated from your meal plan.</p>
            {plan!=="pro"?<div className="upsell">
              <div className="upsell-title">🔒 Pro Feature</div>
              <div className="upsell-sub">Upgrade to Pro for an automatic grocery list and recipe guide tailored to your diet.</div>
              <button className="btn-gold btn-full">Upgrade to Pro — $5/mo</button>
            </div>:<>
              {groceryList?<>
                <div className="ok" style={{marginBottom:12}}>✓ DIET: {diet.toUpperCase()} — all items verified</div>
                <div className="rtabs">
                  <button className={["rtab",grocTab==="list"?"act":""].join(" ")} onClick={()=>setGrocTab("list")}>🛒 Grocery List</button>
                  <button className={["rtab",grocTab==="recipes"?"act":""].join(" ")} onClick={()=>setGrocTab("recipes")}>👨‍🍳 Recipes</button>
                </div>
                {grocTab==="list"&&<div className="rbody" style={{whiteSpace:"pre-wrap"}}>{groceryList.split("RECIPES")[0]||groceryList.split("Recipes")[0]||groceryList}</div>}
                {grocTab==="recipes"&&<div className="rbody" style={{whiteSpace:"pre-wrap"}}>{groceryList.split("RECIPES")[1]||groceryList.split("Recipes")[1]||"Generate your plan to see recipes."}</div>}
              </>:<div style={{textAlign:"center",padding:"30px 20px",background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,color:"var(--mu)"}}>
                <div style={{fontSize:30,marginBottom:8}}>🛒</div>Generate your plan to get your grocery list.
              </div>}
            </>}
          </>}

          {/* REVIEWS */}
          {dashTab==="reviews"&&<>
            <div className="ph" style={{marginBottom:4}}>What People <em>Say</em></div>
            {reviews.length>0&&<div className="avg-box">
              <div className="avg-num">{(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1)}</div>
              <div style={{fontSize:18,marginBottom:3}}>{"⭐".repeat(Math.round(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length))}</div>
              <div style={{fontSize:12,color:"var(--mu)"}}>{reviews.length} reviews</div>
            </div>}
            {!showReviewForm&&!reviewSubmitted&&<button className="btn-s btn-full" style={{marginBottom:13}} onClick={()=>setShowReviewForm(true)}>Leave a Review</button>}
            {showReviewForm&&!reviewSubmitted&&<div className="rev-card" style={{marginBottom:13}}>
              <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,marginBottom:11}}>Rate your experience</div>
              <div style={{display:"flex",gap:8,marginBottom:13}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} style={{background:"none",border:"none",cursor:"pointer",fontSize:24,opacity:reviewRating>=n?1:.3}} onClick={()=>setReviewRating(n)}>⭐</button>
                ))}
              </div>
              <textarea className="finput" rows={3} placeholder="Share your experience…" value={reviewText} onChange={e=>setReviewText(e.target.value)} style={{resize:"vertical",marginBottom:9}}/>
              <div style={{display:"flex",gap:8}}>
                <button className="btn-s" onClick={()=>setShowReviewForm(false)}>Cancel</button>
                <button className="btn-p" onClick={submitReview} disabled={!reviewText.trim()}>Submit Review</button>
              </div>
            </div>}
            {reviewSubmitted&&<div className="ok" style={{marginBottom:13}}>🎉 Thank you for your review!</div>}
            {loadingReviews?<div style={{textAlign:"center",padding:30}}><span className="spin"/></div>:reviews.map((r,i)=>(
              <div key={i} className="rev-card">
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,color:"var(--tx)"}}>{r.name}</div>
                  <div style={{fontSize:13}}>{"⭐".repeat(r.rating)}</div>
                </div>
                {r.goal&&<div style={{fontSize:11,color:"var(--gr)",fontWeight:600,marginBottom:4}}>{r.goal}</div>}
                <div style={{fontSize:12,color:"var(--mu2)",lineHeight:1.6}}>{r.review_text}</div>
                <div style={{fontSize:10,color:"var(--mu)",marginTop:5}}>{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </>}

          {/* PROFILE */}
          {dashTab==="profile"&&<>
            <div className="ph" style={{marginBottom:4,color:"var(--gr)"}}>Profile</div>
            <p className="ps">Your account details and subscription.</p>
            <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:"4px 14px",marginBottom:13}}>
              {[["Email",email],["Name",name],["Age",age+" yrs"],["Weight",weight],["Height",height],["Level",levelVal],["Diet",diet],["Goal",GOALS.find(g=>g.id===goal)?.title||"—"],["Rank",userRank.icon+" "+userRank.name+" · "+userPts+" pts"],["Streak",userStreak>0?"🔥 "+userStreak+" days":"None"],["Following",following.length+(plan==="pro"?" / 200":" / 100")],["Country",country],["Subscription",plan==="pro"?"PRO — $5/mo":"Free"]].map(([k,v],i,arr)=>(
                <div key={k} className="prof-row" style={{borderBottom:i<arr.length-1?"1px solid var(--b)":"none"}}>
                  <span style={{fontSize:12,color:"#9aabb8",fontWeight:500}}>{k}</span>
                  <span style={{fontSize:12,fontWeight:600,color:k==="Subscription"&&plan==="pro"?"var(--gold)":k==="Rank"?userRank.color:"#f0f4f8"}}>{v}</span>
                </div>
              ))}
            </div>
            {plan!=="pro"&&<div className="upsell">
              <div className="upsell-title">✦ Upgrade to Pro</div>
              <div className="upsell-sub">Unlock 30-day plans, grocery lists, unlimited regenerations, 200 follows and more.</div>
              <button className="btn-gold btn-full">Upgrade to Pro — $5/mo</button>
            </div>}
            <button className="btn-s btn-full" style={{marginTop:8}} onClick={()=>{setScreen("onboard");setStep(0);setHasGenerated(false);setPlanSaved(false);setWorkoutPlan("");setMealPlan("");setGroceryList("");setMsgs([{role:"bot",text:"Hey! I'm your AI Coach. I know your full plan. Ask me anything! 💪"}]);}}>Start Over / New Plan</button>
          </>}

        </div></div>
      </>}

    </div>
  </>);
}
