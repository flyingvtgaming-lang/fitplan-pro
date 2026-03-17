import { useState, useRef, useEffect, Fragment } from "react";

const SUPABASE_URL  = "https://oapcqfahkynkgxqkyeru.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGNxZmFoa3lua2d4cWt5ZXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTExMTMsImV4cCI6MjA4OTI2NzExM30.g11nlp1LoIh4WdACvqhx7VuT1CcTxI6Gud0s2c2VYTs";
const EMAILJS_SERVICE  = "service_qekk769";
const EMAILJS_TEMPLATE = "template_h9fye4h";
const EMAILJS_KEY      = "PbhegEIBztlqMZhI9";

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

async function dbUpsertUser({ email, name, age, weight, height, level, diet, goal, equip, plan }) {
  const client = await getSupabase();
  const { data, error } = await client.from("users").upsert(
    { email, name, age, weight, height, level, diet, goal, equipment: equip.join(","), plan, updated_at: new Date().toISOString() },
    { onConflict: "email" }
  ).select().single();
  if (error) console.error("Supabase upsert error:", error);
  return data;
}

async function dbSavePlan({ email, workout_plan, meal_plan, grocery_list }) {
  const client = await getSupabase();
  const { error } = await client.from("users")
    .update({ workout_plan, meal_plan, grocery_list, plan_generated_at: new Date().toISOString() })
    .eq("email", email);
  if (error) console.error("Supabase save plan error:", error);
}

async function dbLoadUser(email) {
  const client = await getSupabase();
  const { data, error } = await client.from("users").select("*").eq("email", email).single();
  if (error) return null;
  return data;
}

async function dbSaveReview({ email, name, rating, review_text, goal }) {
  const client = await getSupabase();
  const { error } = await client.from("reviews").insert({
    email, name, rating, review_text, goal, created_at: new Date().toISOString()
  });
  if (error) console.error("Supabase review error:", error);
}

async function dbLoadReviews() {
  const client = await getSupabase();
  const { data, error } = await client.from("reviews").select("*").order("created_at", { ascending: false }).limit(20);
  if (error) return [];
  return data || [];
}

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
  await window.emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { to_email: toEmail, code, app_name: "FitPlan Pro" });
}

async function askClaude(userMessage, systemPrompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: userMessage }], system: systemPrompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.content || []).map(b => b.text || "").join("");
}

async function askClaudeChat(messages, systemPrompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system: systemPrompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.content || []).map(b => b.text || "").join("");
}

function makeCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

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
.page-inner{max-width:600px;margin:0 auto;padding:36px 24px 60px;animation:fadeUp .35s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
.page-heading{font-family:var(--syne);font-size:30px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:8px;}
.page-heading em{font-style:normal;color:var(--green);}
.page-sub{font-size:14px;color:var(--muted2);line-height:1.6;margin-bottom:26px;}
.field{margin-bottom:15px;}
.field-label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:6px;}
.finput,.fselect,.ftextarea{width:100%;padding:12px 14px;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;font-family:var(--inter);font-size:15px;color:var(--text);outline:none;transition:all .2s;}
.finput:focus,.fselect:focus,.ftextarea:focus{border-color:var(--green);background:var(--bg3);box-shadow:0 0 0 3px rgba(0,229,160,.1);}
.finput::placeholder,.ftextarea::placeholder{color:var(--muted);}
.ftextarea{resize:vertical;min-height:90px;}
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
.sticky-bar{position:sticky;bottom:0;left:0;right:0;background:rgba(8,12,16,0.97);backdrop-filter:blur(16px);border-top:1px solid var(--border);padding:13px 24px;margin:0 -24px -60px;z-index:50;}
.sticky-bar-inner{max-width:600px;margin:0 auto;display:flex;gap:10px;}
.btn-p{flex:1;padding:13px;border-radius:11px;background:linear-gradient(135deg,var(--green),var(--green2));color:#000;font-family:var(--syne);font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;}
.btn-p:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,229,160,.25);}
.btn-p:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-gold{flex:1;padding:13px;border-radius:11px;background:linear-gradient(135deg,var(--gold),#e6a817);color:#000;font-family:var(--syne);font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;}
.btn-gold:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 22px rgba(245,197,66,.3);}
.btn-gold:disabled{opacity:.3;cursor:not-allowed;transform:none;}
.btn-s{padding:12px 18px;border-radius:10px;border:1px solid var(--border2);background:transparent;color:var(--muted2);font-family:var(--inter);font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-s:hover{color:var(--text);background:var(--bg2);}
.btn-full{width:100%;}
.lbar-wrap{margin:16px 0;}
.lbar-lbl{font-size:13px;color:var(--muted2);margin-bottom:7px;display:flex;justify-content:space-between;}
.lbar{height:3px;background:var(--bg3);border-radius:4px;overflow:hidden;}
.lfill{height:100%;background:linear-gradient(90deg,var(--green2),var(--green));border-radius:4px;transition:width .5s ease;}
.rtabs{display:flex;gap:4px;margin-bottom:16px;background:var(--bg2);border-radius:10px;padding:4px;border:1px solid var(--border);overflow-x:auto;}
.rtab{flex-shrink:0;padding:8px 14px;border-radius:7px;border:none;background:transparent;font-family:var(--syne);font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap;}
.rtab.active{background:var(--bg3);color:var(--green);}
.rbody{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:22px;white-space:pre-wrap;font-size:13px;line-height:1.9;color:var(--muted2);}
.regen-btn{margin-top:12px;padding:10px 18px;border-radius:9px;border:1px solid var(--green);background:transparent;color:var(--green);font-family:var(--syne);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.regen-btn:hover{background:var(--green-bg2);}
.regen-btn:disabled{opacity:.4;cursor:not-allowed;}
.free-limit{background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.2);border-radius:10px;padding:12px 16px;font-size:13px;color:var(--muted2);margin-top:12px;text-align:center;}
.free-limit strong{color:var(--red);}
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
.coach-prompts{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;}
.coach-prompt{padding:7px 12px;border-radius:100px;border:1px solid var(--border2);background:var(--bg2);font-size:12px;color:var(--muted2);cursor:pointer;transition:all .2s;white-space:nowrap;}
.coach-prompt:hover{border-color:var(--green);color:var(--green);background:var(--green-bg);}
.spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.1);border-top-color:var(--green);border-radius:50%;animation:rot .7s linear infinite;display:inline-block;vertical-align:middle;}
@keyframes rot{to{transform:rotate(360deg);}}
.msg-ok{background:rgba(0,229,160,.1);border:1px solid rgba(0,229,160,.25);color:var(--green);border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:13px;text-align:center;}
.msg-err{background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.3);color:var(--red);border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:13px;text-align:center;}
.dnav{position:relative;z-index:10;border-bottom:1px solid var(--border);background:rgba(8,12,16,.8);backdrop-filter:blur(12px);display:flex;padding:0 20px;flex-shrink:0;overflow-x:auto;}
.dtab{padding:13px 14px;font-family:var(--syne);font-size:12px;font-weight:600;color:var(--muted);border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;}
.dtab:hover{color:var(--text);}
.dtab.active{color:var(--green);border-bottom-color:var(--green);}
.pro-badge{margin-left:6px;background:rgba(245,197,66,.15);color:var(--gold);padding:2px 7px;border-radius:100px;font-size:10px;font-weight:700;}
.free-badge{margin-left:6px;background:rgba(255,255,255,.08);color:var(--muted2);padding:2px 7px;border-radius:100px;font-size:10px;font-weight:700;}
.profile-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);}
.profile-row:last-child{border-bottom:none;}
.saved-banner{background:rgba(0,229,160,.08);border:1px solid rgba(0,229,160,.2);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:13px;color:var(--muted2);}
.saved-banner strong{color:var(--green);}
.stars-row{display:flex;gap:6px;margin-bottom:16px;justify-content:center;}
.star{font-size:32px;cursor:pointer;transition:transform .15s;filter:grayscale(1);opacity:.4;}
.star:hover,.star.lit{filter:none;opacity:1;transform:scale(1.15);}
.review-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;}
.review-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.review-name{font-family:var(--syne);font-size:13px;font-weight:700;}
.review-stars{font-size:13px;}
.review-goal{font-size:11px;color:var(--green);font-weight:600;margin-bottom:6px;}
.review-text{font-size:13px;color:var(--muted2);line-height:1.6;}
.review-date{font-size:11px;color:var(--muted);margin-top:6px;}
.avg-rating{text-align:center;padding:20px;background:var(--bg2);border:1px solid var(--border);border-radius:14px;margin-bottom:20px;}
.avg-number{font-family:var(--syne);font-size:48px;font-weight:800;color:var(--gold);}
.avg-stars{font-size:20px;margin-bottom:4px;}
.avg-count{font-size:13px;color:var(--muted2);}
.pro-upsell{background:linear-gradient(135deg,rgba(245,197,66,.1),rgba(245,197,66,.05));border:1px solid rgba(245,197,66,.25);border-radius:14px;padding:20px;margin-bottom:20px;text-align:center;}
.pro-upsell-title{font-family:var(--syne);font-size:18px;font-weight:800;color:var(--gold);margin-bottom:8px;}
.pro-upsell-sub{font-size:13px;color:var(--muted2);margin-bottom:16px;line-height:1.6;}
@media(max-width:600px){
  .topbar,.progress-wrap{padding-left:16px;padding-right:16px;}
  .page-inner{padding:24px 14px 60px;}
  .page-heading{font-size:25px;}
  .pricing-wrap,.frow{grid-template-columns:1fr;}
  .summary{grid-template-columns:1fr 1fr;}
  .code-input{width:43px;height:52px;font-size:20px;}
  .sticky-bar{margin:0 -14px -60px;padding:12px 14px;}
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
const COACH_PROMPTS=["How am I doing?","Modify today's workout","What should I eat for lunch?","I missed a workout, now what?","Give me a motivation boost","Log my progress","Explain an exercise","I have a sore muscle"];

export default function App() {
  const [screen,setScreen]=useState("onboard");
  const [step,setStep]=useState(0);
  const [dashTab,setDashTab]=useState("plan");
  const [resultTab,setResultTab]=useState("workout");

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
  const [groceryList,setGroceryList]=useState("");
  const [generating,setGenerating]=useState(false);
  const [regenerating,setRegenerating]=useState(false);
  const [progress,setProgress]=useState(0);
  const [genError,setGenError]=useState("");
  const [statusMsg,setStatusMsg]=useState("");
  const [planSaved,setPlanSaved]=useState(false);
  const [hasGenerated,setHasGenerated]=useState(false);

  const [msgs,setMsgs]=useState([{role:"bot",text:"Hey! I'm your AI coach. I know your full plan and I'm here to help you crush your goals. Ask me anything or pick a prompt below!"}]);
  const [chatIn,setChatIn]=useState("");
  const [chatBusy,setChatBusy]=useState(false);
  const msgEnd=useRef(null);
  useEffect(()=>{msgEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const [reviews,setReviews]=useState([]);
  const [showReviewForm,setShowReviewForm]=useState(false);
  const [reviewRating,setReviewRating]=useState(0);
  const [reviewText,setReviewText]=useState("");
  const [reviewSubmitted,setReviewSubmitted]=useState(false);
  const [hoverStar,setHoverStar]=useState(0);
  const [loadingReviews,setLoadingReviews]=useState(false);

  useEffect(()=>{
    if(dashTab==="reviews") loadReviews();
  },[dashTab]);

  const loadReviews=async()=>{
    setLoadingReviews(true);
    const r=await dbLoadReviews();
    setReviews(r);
    setLoadingReviews(false);
  };

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
      setVerifyError("DEMO MODE — EmailJS not set up. Your code is: "+code+" Error: "+e.message+" Status: "+JSON.stringify(e));
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
        dbLoadUser(email).then(existing=>{
          if(existing&&existing.workout_plan){
            setProfile({name:existing.name||"",age:existing.age||"",weight:existing.weight||"",height:existing.height||"",level:existing.level||"Beginner",diet:existing.diet||"No Restrictions"});
            setGoal(existing.goal||"");
            setEquip(existing.equipment?existing.equipment.split(","):[]);
            setPlan(existing.plan||"basic");
            setWorkoutPlan(existing.workout_plan||"");
            setMealPlan(existing.meal_plan||"");
            setGroceryList(existing.grocery_list||"");
            setHasGenerated(true);
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

  const daysCount = plan==="pro" ? 30 : 7;

  const generate=async(isRegen=false)=>{
    if(plan==="basic"&&hasGenerated&&!isRegen) return;
    isRegen ? setRegenerating(true) : setGenerating(true);
    setGenError("");
    setProgress(10);
    const goalLabel=GOALS.find(g=>g.id===goal)?.title||goal;
    const equipList=equip.length>0?equip.join(", "):"no equipment";
    const ctx="Name: "+profile.name+", Age: "+profile.age+", Weight: "+profile.weight+", Height: "+(profile.height||"not specified")+", Level: "+profile.level+", Diet: "+profile.diet+", Goal: "+goalLabel+", Equipment: "+equipList;
    try{
      setStatusMsg("Saving your profile...");
      await dbUpsertUser({email,name:profile.name,age:profile.age,weight:profile.weight,height:profile.height,level:profile.level,diet:profile.diet,goal,equip,plan});
      setProgress(15);
      setStatusMsg("Building your "+daysCount+"-day workout plan...");
      setProgress(20);
      const workout=await askClaude(
        "Create a "+daysCount+"-day workout plan for: "+ctx+". Write Day 1 through Day "+daysCount+". For each workout day list 4-6 exercises with sets and reps. Mark rest days as REST DAY. Be concise.",
        "You are a personal trainer. Write workout plans in plain text. No markdown. Label each day as Day 1: Day 2: etc."
      );
      setWorkoutPlan(workout);
      setProgress(50);
      setStatusMsg("Creating your "+daysCount+"-day meal plan...");
      const meal=await askClaude(
        "Create a "+daysCount+"-day meal plan for: "+ctx+". Write Day 1 through Day "+daysCount+". For each day list Breakfast, Lunch, Dinner, and Snack with simple portions.",
        "You are a nutritionist. Write meal plans in plain text. No markdown. Label each day as Day 1: Day 2: etc."
      );
      setMealPlan(meal);
      setProgress(75);
      let grocery="";
      if(plan==="pro"){
        setStatusMsg("Generating your grocery list...");
        grocery=await askClaude(
          "Based on this meal plan, create a simple weekly grocery list organized by category (Produce, Proteins, Dairy, Grains, Other): "+meal.slice(0,500),
          "You are a nutritionist. Write a concise grocery list in plain text. Group by category."
        );
        setGroceryList(grocery);
      }
      setProgress(90);
      setStatusMsg("Saving your plan...");
      await dbSavePlan({email,workout_plan:workout,meal_plan:meal,grocery_list:grocery});
      setPlanSaved(true);
      setHasGenerated(true);
      setProgress(100);
      setStatusMsg("Done!");
      setScreen("dashboard");
      setDashTab("plan");
      setTimeout(()=>setShowReviewForm(true),3000);
    }catch(err){
      setGenError("Error: "+err.message+". Please try again.");
    }finally{
      setGenerating(false);
      setRegenerating(false);
    }
  };

  const sendChat=async(text)=>{
    if(!text.trim()||chatBusy) return;
    setChatIn("");
    setMsgs(m=>[...m,{role:"user",text}]);
    setChatBusy(true);
    const goalLabel=GOALS.find(g=>g.id===goal)?.title||"";
    const history=msgs.map(m=>({role:m.role==="bot"?"assistant":"user",content:m.text}));
    history.push({role:"user",content:text});
    const sys="You are an expert AI personal trainer and nutritionist named Coach. You know this user intimately: Name: "+profile.name+", Age: "+profile.age+", Weight: "+profile.weight+", Goal: "+goalLabel+", Level: "+profile.level+", Diet: "+profile.diet+", Equipment: "+equip.join(", ")+". Their current workout plan summary: "+workoutPlan.slice(0,300)+"... Be encouraging, specific, and actionable. Keep replies under 150 words. Use their name occasionally.";
    try{
      const reply=await askClaudeChat(history,sys);
      setMsgs(m=>[...m,{role:"bot",text:reply}]);
    }catch(e){
      setMsgs(m=>[...m,{role:"bot",text:"Sorry, couldn't connect: "+e.message}]);
    }finally{setChatBusy(false);}
  };

  const submitReview=async()=>{
    if(reviewRating===0||!reviewText.trim()) return;
    const goalLabel=GOALS.find(g=>g.id===goal)?.title||"";
    await dbSaveReview({email,name:profile.name,rating:reviewRating,review_text:reviewText,goal:goalLabel});
    setReviewSubmitted(true);
    setShowReviewForm(false);
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

  const avgRating=reviews.length>0?(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1):null;

  if(screen==="dashboard") return(
    <>
      <style>{G}</style>
      <div className="app">
        <header className="topbar">
          <div className="logo">FitPlan Pro</div>
          <div className="topbar-right">
            <span style={{fontSize:13,color:"var(--muted)"}}>Hey, <strong style={{color:"var(--text)"}}>{profile.name}</strong> 👋</span>
            {plan==="pro"?<span className="pro-badge">PRO</span>:<span className="free-badge">FREE</span>}
          </div>
        </header>
        <nav className="dnav">
          {[["plan","My Plan"],["chat","AI Coach"],["grocery",plan==="pro"?"Grocery List":"🔒 Grocery"],["reviews","Reviews"],["profile","Profile"]].map(([id,lbl])=>(
            <button key={id} className={["dtab",dashTab===id?"active":""].filter(Boolean).join(" ")} onClick={()=>setDashTab(id)}>{lbl}</button>
          ))}
        </nav>

        {showReviewForm&&!reviewSubmitted&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:20,padding:32,maxWidth:440,width:"100%",textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12}}>⭐</div>
              <div style={{fontFamily:"var(--syne)",fontSize:20,fontWeight:800,marginBottom:8}}>How's your plan?</div>
              <div style={{fontSize:13,color:"var(--muted2)",marginBottom:20}}>Take 10 seconds to rate your experience — it helps others find FitPlan Pro!</div>
              <div className="stars-row">
                {[1,2,3,4,5].map(s=>(
                  <span key={s} className={["star",(hoverStar||reviewRating)>=s?"lit":""].filter(Boolean).join(" ")}
                    onMouseEnter={()=>setHoverStar(s)} onMouseLeave={()=>setHoverStar(0)}
                    onClick={()=>setReviewRating(s)}>⭐</span>
                ))}
              </div>
              <textarea className="ftextarea" placeholder="Tell us about your experience…" value={reviewText} onChange={e=>setReviewText(e.target.value)} style={{marginBottom:14}}/>
              <div style={{display:"flex",gap:10}}>
                <button className="btn-s" onClick={()=>setShowReviewForm(false)}>Skip</button>
                <button className="btn-p" disabled={reviewRating===0||!reviewText.trim()} onClick={submitReview}>Submit Review</button>
              </div>
            </div>
          </div>
        )}

        <div className="page-scroll">
          <div className="page-inner">

            {dashTab==="plan"&&<>
              <div className="page-heading" style={{marginBottom:4}}>Your <em>{daysCount}-Day</em> Plan</div>
              <p className="page-sub" style={{marginBottom:16}}>
                Goal: <strong style={{color:"var(--green)"}}>{GOALS.find(g=>g.id===goal)?.title}</strong>
                {" · "}{profile.level}{" · "}{profile.diet}
              </p>
              {planSaved&&<div className="saved-banner"><span>💾</span><span><strong>Plan saved.</strong> Log back in anytime with your email.</span></div>}
              <div className="rtabs">
                {[["workout","💪 Workout"],["meal","🥗 Meals"]].map(([id,lbl])=>(
                  <button key={id} className={["rtab",resultTab===id?"active":""].filter(Boolean).join(" ")} onClick={()=>setResultTab(id)}>{lbl}</button>
                ))}
              </div>
              <div className="rbody">{resultTab==="workout"?workoutPlan:mealPlan}</div>
              {plan==="pro"?(
                <button className="regen-btn" disabled={regenerating} onClick={()=>generate(true)}>
                  {regenerating?<><span className="spin"/> Regenerating…</>:"🔄 Regenerate Plan"}
                </button>
              ):(
                <div className="free-limit">
                  <strong>Free plan — 1 generation only.</strong> Upgrade to Pro for unlimited regenerations, 30-day plans, grocery lists and more.
                  <br/><button className="btn-gold" style={{marginTop:10,width:"100%"}} onClick={()=>{setDashTab("profile");}}>Upgrade to Pro →</button>
                </div>
              )}
              {plan==="pro"&&<div style={{marginTop:14,padding:"12px 15px",background:"rgba(245,197,66,0.07)",border:"1px solid rgba(245,197,66,0.2)",borderRadius:10}}>
                <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,color:"var(--gold)",marginBottom:3}}>PRO — 30-Day Adaptive Plan</div>
                <div style={{fontSize:12,color:"var(--muted2)"}}>Regenerate anytime to get a fresh updated plan based on your progress.</div>
              </div>}
            </>}

            {dashTab==="chat"&&<>
              <div className="page-heading" style={{marginBottom:4}}>AI <em>Coach</em></div>
              <p className="page-sub" style={{marginBottom:10}}>I know your full plan. Ask me anything or tap a prompt.</p>
              <div className="coach-prompts">
                {COACH_PROMPTS.map(p=>(
                  <button key={p} className="coach-prompt" onClick={()=>sendChat(p)}>{p}</button>
                ))}
              </div>
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
                <input className="cin" placeholder="Ask your coach anything…" value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat(chatIn)}/>
                <button className="csend" onClick={()=>sendChat(chatIn)} disabled={chatBusy||!chatIn.trim()}>Send</button>
              </div>
            </>}

            {dashTab==="grocery"&&<>
              <div className="page-heading" style={{marginBottom:4}}><em>Grocery</em> List</div>
              {plan==="pro"?(
                <>
                  <p className="page-sub" style={{marginBottom:16}}>Auto-generated from your meal plan. Shop smarter, eat better.</p>
                  {groceryList?(
                    <div className="rbody">{groceryList}</div>
                  ):(
                    <div style={{textAlign:"center",padding:"40px 20px",color:"var(--muted)"}}>
                      <div style={{fontSize:36,marginBottom:12}}>🛒</div>
                      <div>Generate your plan to get a grocery list</div>
                    </div>
                  )}
                </>
              ):(
                <div className="pro-upsell">
                  <div className="pro-upsell-title">🔒 Pro Feature</div>
                  <div className="pro-upsell-sub">Upgrade to Pro to get an auto-generated weekly grocery list based on your meal plan, plus 30-day plans, unlimited regenerations, and more.</div>
                  <button className="btn-gold" style={{width:"100%"}}>Upgrade to Pro — $5/mo</button>
                </div>
              )}
            </>}

            {dashTab==="reviews"&&<>
              <div className="page-heading" style={{marginBottom:4}}>What People <em>Say</em></div>
              <p className="page-sub" style={{marginBottom:16}}>Real reviews from FitPlan Pro users.</p>
              {avgRating&&(
                <div className="avg-rating">
                  <div className="avg-number">{avgRating}</div>
                  <div className="avg-stars">{"⭐".repeat(Math.round(parseFloat(avgRating)))}</div>
                  <div className="avg-count">{reviews.length} review{reviews.length!==1?"s":""}</div>
                </div>
              )}
              {!reviewSubmitted&&!showReviewForm&&(
                <button className="btn-p" style={{marginBottom:20}} onClick={()=>setShowReviewForm(true)}>Leave a Review</button>
              )}
              {reviewSubmitted&&<div className="msg-ok" style={{marginBottom:16}}>Thanks for your review! 🙏</div>}
              {loadingReviews?(
                <div style={{textAlign:"center",padding:20}}><span className="spin"/></div>
              ):reviews.length===0?(
                <div style={{textAlign:"center",padding:"40px 20px",color:"var(--muted)"}}>
                  <div style={{fontSize:36,marginBottom:12}}>⭐</div>
                  <div>No reviews yet — be the first!</div>
                </div>
              ):reviews.map((r,i)=>(
                <div key={i} className="review-card">
                  <div className="review-header">
                    <div className="review-name">{r.name}</div>
                    <div className="review-stars">{"⭐".repeat(r.rating)}</div>
                  </div>
                  <div className="review-goal">{r.goal}</div>
                  <div className="review-text">{r.review_text}</div>
                  <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </>}

            {dashTab==="profile"&&<>
              <div className="page-heading" style={{marginBottom:4}}><em>Profile</em></div>
              <p className="page-sub" style={{marginBottom:20}}>Your account details and subscription.</p>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:18,marginBottom:16}}>
                {[["Email",email],["Name",profile.name],["Age",profile.age+" yrs"],["Weight",profile.weight],["Level",profile.level],["Diet",profile.diet],["Goal",GOALS.find(g=>g.id===goal)?.title||"-"],["Equipment",equip.length+" items"],["Plan",plan==="pro"?"PRO — $5/mo":"Free"]].map(([k,v],idx,arr)=>(
                  <div key={k} className="profile-row" style={{borderBottom:idx<arr.length-1?"1px solid var(--border)":"none"}}>
                    <span style={{fontSize:13,color:"var(--muted)",fontWeight:500}}>{k}</span>
                    <span style={{fontSize:13,fontWeight:600,color:k==="Plan"&&plan==="pro"?"var(--gold)":"var(--text)"}}>{v}</span>
                  </div>
                ))}
              </div>
              {plan==="basic"&&(
                <div className="pro-upsell" style={{marginBottom:16}}>
                  <div className="pro-upsell-title">✦ Upgrade to Pro</div>
                  <div className="pro-upsell-sub">Get a 30-day plan, unlimited regenerations, grocery lists, and priority AI coaching for just $5/mo.</div>
                  <button className="btn-gold" style={{width:"100%"}}>Upgrade to Pro — $5/mo</button>
                </div>
              )}
              <button className="btn-s btn-full" onClick={()=>{setScreen("onboard");setStep(0);setGoal("");setEquip([]);setCodeSent(false);setVerified(false);setCodeInputs(["","","","","",""]);setSentCode("");setPlanSaved(false);setHasGenerated(false);setMsgs([{role:"bot",text:"Hey! I'm your AI coach. I know your full plan and I'm here to help you crush your goals. Ask me anything or pick a prompt below!"}]);}}>
                Start Over / New Plan
              </button>
            </>}

          </div>
        </div>
      </div>
    </>
  );

  return(
    <>
      <style>{G}</style>
      <div className="app">
        <header className="topbar">
          <div className="logo">FitPlan Pro</div>
          <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--syne)",fontWeight:700,letterSpacing:"0.08em"}}>AI-POWERED FITNESS</div>
        </header>
        <StepsBar/>

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
                  <button className="resend-btn" disabled={resendTimer>0} onClick={()=>{setCodeInputs(["","","","","",""]);setVerifyError("");handleSendCode();}}>
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

        {step===4&&<div className="page-scroll"><div className="page-inner">
          {!generating?(
            <>
              <h1 className="page-heading">Choose your<br/><em>plan.</em></h1>
              <p className="page-sub">Both include a full meal and workout plan. Upgrade for 30 days, grocery lists, and unlimited regenerations.</p>
              <div className="pricing-wrap">
                <div className={["pcard",plan==="basic"?"sel":""].filter(Boolean).join(" ")} onClick={()=>setPlan("basic")}>
                  <div className="pprice">$0 <span>/mo</span></div>
                  <div className="pname">Basic</div>
                  <ul className="pfeats">
                    <li><span className="ck">✓</span>7-day meal plan</li>
                    <li><span className="ck">✓</span>7-day workout plan</li>
                    <li><span className="ck">✓</span>AI Coach chatbot</li>
                    <li><span className="ck">✓</span>Quick prompts</li>
                    <li className="no"><span className="ck">✕</span>30-day plans</li>
                    <li className="no"><span className="ck">✕</span>Grocery list</li>
                    <li className="no"><span className="ck">✕</span>Unlimited regen</li>
                  </ul>
                </div>
                <div className={["pcard featured",plan==="pro"?"sel":""].filter(Boolean).join(" ")} onClick={()=>setPlan("pro")}>
                  <div className="pbadge">Most Popular</div>
                  <div className="pprice">$5 <span>/mo</span></div>
                  <div className="pname">Pro</div>
                  <ul className="pfeats">
                    <li><span className="ck">✓</span>30-day meal plan</li>
                    <li><span className="ck">✓</span>30-day workout plan</li>
                    <li><span className="ck">✓</span>AI Coach chatbot</li>
                    <li><span className="ck">✓</span>Quick prompts</li>
                    <li><span className="ck">✓</span>30-day plans</li>
                    <li><span className="ck">✓</span>Grocery list</li>
                    <li><span className="ck">✓</span>Unlimited regen</li>
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
                <button className="btn-p" onClick={()=>generate(false)}>{plan==="pro"?"Start Pro — $5/mo":"Generate Free Plan"}</button>
              </div></div>
            </>
          ):(
            <div style={{textAlign:"center",paddingTop:28}}>
              <div style={{fontSize:50,marginBottom:16}}>⚡</div>
              <h1 className="page-heading" style={{marginBottom:7}}>Building your<br/><em>{daysCount}-day plan…</em></h1>
              <p className="page-sub" style={{marginBottom:28}}>About 20-30 seconds. Your plan will be saved automatically.</p>
              <div className="lbar-wrap">
                <div className="lbar-lbl"><span>{statusMsg||"Starting…"}</span><span style={{color:"var(--green)"}}>{progress}%</span></div>
                <div className="lbar"><div className="lfill" style={{width:progress+"%"}}/></div>
              </div>
            </div>
          )}
        </div></div>}

      </div>
    </>
  );
}
