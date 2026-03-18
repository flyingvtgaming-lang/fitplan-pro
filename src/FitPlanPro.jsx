// FitPlan Pro v2.1 - multilingual
import { useState, useRef, useEffect, Fragment } from "react";

const SUPABASE_URL  = "https://oapcqfahkynkgxqkyeru.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGNxZmFoa3lua2d4cWt5ZXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTExMTMsImV4cCI6MjA4OTI2NzExM30.g11nlp1LoIh4WdACvqhx7VuT1CcTxI6Gud0s2c2VYTs";
const EMAILJS_SERVICE  = "service_qekk769";
const EMAILJS_TEMPLATE = "template_h9fye4h";
const EMAILJS_KEY      = "PbhegEIBztlqMZhI9";

// ── RANK SYSTEM ──
const RANKS = [
  { name:"Bronze",   icon:"🥉", min:0,     max:199,   color:"#cd7f32" },
  { name:"Silver",   icon:"🥈", min:200,   max:499,   color:"#c0c0c0" },
  { name:"Gold",     icon:"🥇", min:500,   max:999,   color:"#ffd700" },
  { name:"Platinum", icon:"💎", min:1000,  max:1999,  color:"#e5e4e2" },
  { name:"Emerald",  icon:"💚", min:2000,  max:3999,  color:"#50c878" },
  { name:"Diamond",  icon:"💠", min:4000,  max:7999,  color:"#b9f2ff" },
  { name:"Amethyst", icon:"💜", min:8000,  max:14999, color:"#9966cc" },
  { name:"Ruby",     icon:"❤️", min:15000, max:29999, color:"#e0115f" },
  { name:"Top 100",  icon:"👑", min:30000, max:Infinity, color:"#ffd700" },
];

const DAILY_POINT_CAP = 50;

function getRank(points) {
  for(let i = RANKS.length-1; i >= 0; i--) {
    if(points >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

function getStartingPoints(level) {
  if(level === "Advanced") return 300;
  if(level === "Intermediate") return 100;
  return 0;
}

function getPointsForLog(type, dailyPointsToday) {
  const remaining = Math.max(0, DAILY_POINT_CAP - (dailyPointsToday || 0));
  if(remaining <= 0) return 0;
  const base = type === "pr" ? 25 : type === "weight" ? 15 : 10;
  // diminishing returns: 2nd+ log same day gets half
  const earned = dailyPointsToday > 0 ? Math.ceil(base / 2) : base;
  return Math.min(earned, remaining);
}

function isPlanExpired(planGeneratedAt, plan) {
  if(plan === "pro") return false;
  if(!planGeneratedAt) return false;
  const generated = new Date(planGeneratedAt);
  const now = new Date();
  const daysDiff = (now - generated) / (1000 * 60 * 60 * 24);
  return daysDiff >= 7;
}

// ── TRANSLATIONS ──
const T = {
  en: {
    appTagline: "AI-POWERED FITNESS",
    steps: ["Email","Location","Reviews","Profile","Goal","Equipment","Plan"],
    verifyTitle: "First, verify your email.",
    verifySub: "We'll send a 6-digit code. Returning users will have their plan restored.",
    emailPlaceholder: "you@email.com",
    sendCode: "Send Verification Code →",
    sending: "Sending…",
    checkInbox: "Check your inbox",
    codeSentTo: "We sent a 6-digit code to",
    enterBelow: "Enter it below.",
    emailVerified: "Email Verified!",
    verifiedSub: "You're verified! Loading your data…",
    verifyBtn: "Verify Code →",
    verifying: "Verifying…",
    resendIn: "Resend in",
    resend: "Resend code",
    changeEmail: "Change email",
    locationTitle: "Where are you",
    locationEm: "located?",
    locationSub: "We'll set your units and language automatically.",
    country: "Country / Region",
    language: "Language",
    reviewsTitle: "What people",
    reviewsEm: "are saying.",
    reviewsSub: "Real reviews from FitPlan Pro users.",
    noReviews: "Be the first!",
    noReviewsSub: "No reviews yet — generate your plan and leave the first one.",
    profileTitle: "Tell us about",
    profileEm: "yourself.",
    profileSub: "This shapes every part of your plan.",
    firstName: "First Name",
    age: "Age",
    weight: "Weight",
    height: "Height",
    fitnessLevel: "Fitness Level",
    diet: "Diet Preference",
    goalTitle: "What's your",
    goalEm: "primary goal?",
    goalSub: "Pick the one that matters most right now.",
    equipTitle: "What equipment",
    equipEm: "do you have access to?",
    equipSub: "Select everything available — we'll build around what you have.",
    planTitle: "Choose your",
    planEm: "plan.",
    planSub: "Both include a full meal and workout plan. Upgrade for 30 days, grocery lists, and unlimited regenerations.",
    basic: "Basic", pro: "Pro",
    free: "Free",
    perMonth: "/mo",
    mostPopular: "Most Popular",
    generateFree: "Generate Free Plan",
    startPro: "Start Pro — $5/mo",
    back: "Back", continue: "Continue",
    myPlan: "My Plan", aiCoach: "AI Coach", grocery: "Grocery List", groceryLocked: "🔒 Grocery",
    reviews: "Reviews", profile: "Profile",
    yourPlan: "Your", dayPlan: "-Day Plan",
    goal: "Goal", level: "Level", equip: "Equip.",
    workoutPlan: "Workout Plan", mealPlan: "Meal Plan",
    regenerate: "🔄 Regenerate Plan", regenerating: "Regenerating…",
    freeLimit: "Free plan — 1 generation only.",
    upgradePro: "Upgrade to Pro for unlimited regenerations, 30-day plans, grocery lists and more.",
    upgradeBtn: "Upgrade to Pro →",
    proActive: "PRO — 30-Day Adaptive Plan",
    proActiveSub: "Regenerate anytime to get a fresh updated plan based on your progress.",
    coachTitle: "AI Coach",
    coachSub: "I know your full plan. Ask me anything or tap a prompt.",
    coachPlaceholder: "Ask your coach anything…",
    send: "Send",
    groceryTitle: "Grocery List",
    grocerySub: "Auto-generated from your meal plan. Shop smarter, eat better.",
    noGrocery: "Generate your plan to get a grocery list",
    proFeature: "🔒 Pro Feature",
    proUpsellSub: "Upgrade to Pro to get an auto-generated weekly grocery list, 30-day plans, unlimited regenerations, and more.",
    upgradeProFull: "Upgrade to Pro — $5/mo",
    reviewsTabTitle: "What People Say",
    reviewsTabSub: "Real reviews from FitPlan Pro users.",
    leaveReview: "Leave a Review",
    profileTab: "Profile",
    profileTabSub: "Your account details and subscription.",
    startOver: "Start Over / New Plan",
    subscription: "Subscription",
    building: "Building your", personalized: "-day plan…",
    aboutTime: "About 20-30 seconds. Your plan will be saved automatically.",
    savedBanner: "Plan saved. Log back in anytime with your email.",
    howDoing: "How am I doing?", modifyWorkout: "Modify today's workout",
    lunchEat: "What should I eat for lunch?", missedWorkout: "I missed a workout, now what?",
    motivation: "Give me a motivation boost", logProgress: "Log my progress",
    explainEx: "Explain an exercise", soreMuscle: "I have a sore muscle",
    rateExp: "How's your plan?", rateSub: "Take 10 seconds to rate your experience!",
    submitReview: "Submit Review", skip: "Skip",
    levels: ["Beginner","Intermediate","Advanced"],
    diets: ["No Restrictions","Vegetarian","Vegan","Keto","Paleo","Gluten-Free","High Protein","Intermittent Fasting"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"Weight Loss",desc:"Burn fat, improve endurance, lean out"},
      {id:"muscle_gain",icon:"💪",title:"Muscle Gain",desc:"Build strength and muscle mass"},
      {id:"athletic",icon:"⚡",title:"Athletic Performance",desc:"Speed, power, sport-specific training"},
      {id:"general",icon:"🌿",title:"General Health",desc:"Balance, mobility, overall wellness"},
      {id:"recomp",icon:"⚖️",title:"Body Recomposition",desc:"Lose fat and gain muscle simultaneously"},
    ],
    equipment: {
      "Free Weights":[{id:"dumbbells",icon:"🏋️",text:"Dumbbells"},{id:"barbells",icon:"🔩",text:"Barbells"},{id:"kettles",icon:"🫙",text:"Kettlebells"},{id:"ez_bar",icon:"〰️",text:"EZ / Curl Bar"},{id:"bands",icon:"🔁",text:"Resistance Bands"}],
      "Cardio Machines":[{id:"treadmill",icon:"🏃",text:"Treadmill"},{id:"bike",icon:"🚴",text:"Stationary Bike"},{id:"rower",icon:"🚣",text:"Rowing Machine"},{id:"elliptic",icon:"🌀",text:"Elliptical"},{id:"stairs",icon:"🪜",text:"Stairmaster"}],
      "Strength Machines":[{id:"cable",icon:"🔗",text:"Cable Machine"},{id:"legpress",icon:"🦵",text:"Leg Press"},{id:"latpull",icon:"⬇️",text:"Lat Pulldown"},{id:"chestmach",icon:"📐",text:"Chest Press"},{id:"smith",icon:"🏗️",text:"Smith Machine"}],
      "Bodyweight / Other":[{id:"pullupbar",icon:"🔲",text:"Pull-up Bar"},{id:"dipbars",icon:"🤸",text:"Dip Bars"},{id:"bench",icon:"🪑",text:"Weight Bench"},{id:"sqrack",icon:"🏗️",text:"Squat Rack"},{id:"mat",icon:"🟩",text:"Yoga Mat / Floor"},{id:"nobody",icon:"🏠",text:"No Equipment"}],
    },
    pfeats: {
      basic: ["7-day meal plan","7-day workout plan","AI Coach chatbot","Quick prompts"],
      basicNo: ["30-day plans","Grocery list","Unlimited regen"],
      pro: ["30-day meal plan","30-day workout plan","AI Coach chatbot","Quick prompts","30-day plans","Grocery list","Unlimited regen"],
    },
  },
  es: {
    appTagline: "FITNESS CON IA",
    steps: ["Email","Ubicación","Reseñas","Perfil","Objetivo","Equipo","Plan"],
    verifyTitle: "Primero, verifica tu email.",
    verifySub: "Te enviaremos un código de 6 dígitos.",
    emailPlaceholder: "tu@email.com",
    sendCode: "Enviar Código →",
    sending: "Enviando…",
    checkInbox: "Revisa tu bandeja de entrada",
    codeSentTo: "Enviamos un código de 6 dígitos a",
    enterBelow: "Ingrésalo abajo.",
    emailVerified: "¡Email Verificado!",
    verifiedSub: "¡Verificado! Cargando tus datos…",
    verifyBtn: "Verificar Código →",
    verifying: "Verificando…",
    resendIn: "Reenviar en",
    resend: "Reenviar código",
    changeEmail: "Cambiar email",
    locationTitle: "¿Dónde estás",
    locationEm: "ubicado?",
    locationSub: "Configuraremos tus unidades e idioma automáticamente.",
    country: "País / Región",
    language: "Idioma",
    reviewsTitle: "Lo que dicen",
    reviewsEm: "las personas.",
    reviewsSub: "Reseñas reales de usuarios de FitPlan Pro.",
    noReviews: "¡Sé el primero!",
    noReviewsSub: "Sin reseñas aún — genera tu plan y deja la primera.",
    profileTitle: "Cuéntanos sobre",
    profileEm: "ti.",
    profileSub: "Esto da forma a cada parte de tu plan.",
    firstName: "Nombre",
    age: "Edad",
    weight: "Peso",
    height: "Altura",
    fitnessLevel: "Nivel de Fitness",
    diet: "Preferencia Dietética",
    goalTitle: "¿Cuál es tu",
    goalEm: "objetivo principal?",
    goalSub: "Elige el que más importa ahora mismo.",
    equipTitle: "¿Qué equipo",
    equipEm: "tienes disponible?",
    equipSub: "Selecciona todo lo disponible.",
    planTitle: "Elige tu",
    planEm: "plan.",
    planSub: "Ambos incluyen plan de comidas y entrenamiento completo.",
    basic: "Básico", pro: "Pro", free: "Gratis", perMonth: "/mes",
    mostPopular: "Más Popular",
    generateFree: "Generar Plan Gratis",
    startPro: "Iniciar Pro — $5/mes",
    back: "Atrás", continue: "Continuar",
    myPlan: "Mi Plan", aiCoach: "Coach IA", grocery: "Lista Compras", groceryLocked: "🔒 Compras",
    reviews: "Reseñas", profile: "Perfil",
    yourPlan: "Tu Plan de", dayPlan: " Días",
    goal: "Objetivo", level: "Nivel", equip: "Equipo",
    workoutPlan: "Plan de Entrenamiento", mealPlan: "Plan de Comidas",
    regenerate: "🔄 Regenerar Plan", regenerating: "Regenerando…",
    freeLimit: "Plan gratuito — solo 1 generación.",
    upgradePro: "Actualiza a Pro para regeneraciones ilimitadas, planes de 30 días y más.",
    upgradeBtn: "Actualizar a Pro →",
    proActive: "PRO — Plan Adaptativo de 30 Días",
    proActiveSub: "Regenera en cualquier momento para obtener un plan actualizado.",
    coachTitle: "Coach IA",
    coachSub: "Conozco tu plan completo. Pregúntame cualquier cosa.",
    coachPlaceholder: "Pregunta a tu coach…",
    send: "Enviar",
    groceryTitle: "Lista de Compras",
    grocerySub: "Generada automáticamente de tu plan de comidas.",
    noGrocery: "Genera tu plan para obtener la lista",
    proFeature: "🔒 Función Pro",
    proUpsellSub: "Actualiza a Pro para obtener lista de compras automática, planes de 30 días y más.",
    upgradeProFull: "Actualizar a Pro — $5/mes",
    reviewsTabTitle: "Qué Dicen",
    reviewsTabSub: "Reseñas reales de usuarios.",
    leaveReview: "Dejar una Reseña",
    profileTab: "Perfil",
    profileTabSub: "Detalles de tu cuenta.",
    startOver: "Empezar de Nuevo",
    subscription: "Suscripción",
    building: "Construyendo tu plan de", personalized: " días…",
    aboutTime: "Unos 20-30 segundos. Tu plan se guardará automáticamente.",
    savedBanner: "Plan guardado. Inicia sesión en cualquier momento.",
    howDoing: "¿Cómo voy?", modifyWorkout: "Modificar entrenamiento de hoy",
    lunchEat: "¿Qué debo comer al almuerzo?", missedWorkout: "Me perdí un entrenamiento",
    motivation: "Dame motivación", logProgress: "Registrar progreso",
    explainEx: "Explicar un ejercicio", soreMuscle: "Tengo un músculo adolorido",
    rateExp: "¿Cómo está tu plan?", rateSub: "¡10 segundos para calificar tu experiencia!",
    submitReview: "Enviar Reseña", skip: "Omitir",
    levels: ["Principiante","Intermedio","Avanzado"],
    diets: ["Sin Restricciones","Vegetariano","Vegano","Keto","Paleo","Sin Gluten","Alto en Proteínas","Ayuno Intermitente"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"Perder Peso",desc:"Quemar grasa, mejorar resistencia"},
      {id:"muscle_gain",icon:"💪",title:"Ganar Músculo",desc:"Construir fuerza y masa muscular"},
      {id:"athletic",icon:"⚡",title:"Rendimiento Atlético",desc:"Velocidad, potencia, entrenamiento específico"},
      {id:"general",icon:"🌿",title:"Salud General",desc:"Equilibrio, movilidad, bienestar general"},
      {id:"recomp",icon:"⚖️",title:"Recomposición Corporal",desc:"Perder grasa y ganar músculo simultáneamente"},
    ],
    equipment: {
      "Pesas Libres":[{id:"dumbbells",icon:"🏋️",text:"Mancuernas"},{id:"barbells",icon:"🔩",text:"Barras"},{id:"kettles",icon:"🫙",text:"Kettlebells"},{id:"ez_bar",icon:"〰️",text:"Barra EZ"},{id:"bands",icon:"🔁",text:"Bandas Elásticas"}],
      "Máquinas Cardio":[{id:"treadmill",icon:"🏃",text:"Cinta"},{id:"bike",icon:"🚴",text:"Bicicleta Estática"},{id:"rower",icon:"🚣",text:"Remo"},{id:"elliptic",icon:"🌀",text:"Elíptica"},{id:"stairs",icon:"🪜",text:"Escaladora"}],
      "Máquinas de Fuerza":[{id:"cable",icon:"🔗",text:"Máquina de Cable"},{id:"legpress",icon:"🦵",text:"Prensa de Piernas"},{id:"latpull",icon:"⬇️",text:"Jalón al Pecho"},{id:"chestmach",icon:"📐",text:"Press de Pecho"},{id:"smith",icon:"🏗️",text:"Máquina Smith"}],
      "Peso Corporal / Otro":[{id:"pullupbar",icon:"🔲",text:"Barra de Dominadas"},{id:"dipbars",icon:"🤸",text:"Barras para Fondos"},{id:"bench",icon:"🪑",text:"Banco"},{id:"sqrack",icon:"🏗️",text:"Rack de Sentadillas"},{id:"mat",icon:"🟩",text:"Colchoneta"},{id:"nobody",icon:"🏠",text:"Sin Equipo"}],
    },
    pfeats: {
      basic: ["Plan de comidas 7 días","Plan de entrenamiento 7 días","Coach IA","Prompts rápidos"],
      basicNo: ["Planes de 30 días","Lista de compras","Regeneraciones ilimitadas"],
      pro: ["Plan de comidas 30 días","Plan de entrenamiento 30 días","Coach IA","Prompts rápidos","Planes de 30 días","Lista de compras","Regeneraciones ilimitadas"],
    },
  },
  de: {
    appTagline: "KI-GESTEUERTES FITNESS",
    steps: ["E-Mail","Standort","Bewertungen","Profil","Ziel","Ausrüstung","Plan"],
    verifyTitle: "Zuerst, bestätige deine E-Mail.",
    verifySub: "Wir senden dir einen 6-stelligen Code.",
    emailPlaceholder: "du@email.de",
    sendCode: "Bestätigungscode senden →",
    sending: "Wird gesendet…",
    checkInbox: "Prüfe deinen Posteingang",
    codeSentTo: "Wir haben einen 6-stelligen Code gesendet an",
    enterBelow: "Gib ihn unten ein.",
    emailVerified: "E-Mail bestätigt!",
    verifiedSub: "Bestätigt! Lade deine Daten…",
    verifyBtn: "Code bestätigen →",
    verifying: "Wird bestätigt…",
    resendIn: "Erneut senden in",
    resend: "Code erneut senden",
    changeEmail: "E-Mail ändern",
    locationTitle: "Wo befindest du",
    locationEm: "dich?",
    locationSub: "Wir stellen deine Einheiten und Sprache automatisch ein.",
    country: "Land / Region",
    language: "Sprache",
    reviewsTitle: "Was die Leute",
    reviewsEm: "sagen.",
    reviewsSub: "Echte Bewertungen von FitPlan Pro Nutzern.",
    noReviews: "Sei der Erste!",
    noReviewsSub: "Noch keine Bewertungen — erstelle deinen Plan und hinterlasse die erste.",
    profileTitle: "Erzähl uns von",
    profileEm: "dir.",
    profileSub: "Das gestaltet jeden Teil deines Plans.",
    firstName: "Vorname",
    age: "Alter",
    weight: "Gewicht",
    height: "Größe",
    fitnessLevel: "Fitnesslevel",
    diet: "Ernährungspräferenz",
    goalTitle: "Was ist dein",
    goalEm: "Hauptziel?",
    goalSub: "Wähle das, was dir jetzt am wichtigsten ist.",
    equipTitle: "Welche Ausrüstung",
    equipEm: "hast du?",
    equipSub: "Wähle alles Verfügbare aus.",
    planTitle: "Wähle deinen",
    planEm: "Plan.",
    planSub: "Beide beinhalten einen vollständigen Mahlzeiten- und Trainingsplan.",
    basic: "Basis", pro: "Pro", free: "Kostenlos", perMonth: "/Monat",
    mostPopular: "Beliebteste",
    generateFree: "Kostenlosen Plan erstellen",
    startPro: "Pro starten — 5$/Monat",
    back: "Zurück", continue: "Weiter",
    myPlan: "Mein Plan", aiCoach: "KI-Coach", grocery: "Einkaufsliste", groceryLocked: "🔒 Einkauf",
    reviews: "Bewertungen", profile: "Profil",
    yourPlan: "Dein", dayPlan: "-Tage-Plan",
    goal: "Ziel", level: "Level", equip: "Ausrüst.",
    workoutPlan: "Trainingsplan", mealPlan: "Ernährungsplan",
    regenerate: "🔄 Plan neu erstellen", regenerating: "Wird erstellt…",
    freeLimit: "Kostenloser Plan — nur 1 Generierung.",
    upgradePro: "Upgrade auf Pro für unbegrenzte Generierungen, 30-Tage-Pläne und mehr.",
    upgradeBtn: "Auf Pro upgraden →",
    proActive: "PRO — Adaptiver 30-Tage-Plan",
    proActiveSub: "Jederzeit neu erstellen für einen aktualisierten Plan.",
    coachTitle: "KI-Coach",
    coachSub: "Ich kenne deinen vollständigen Plan. Frag mich alles.",
    coachPlaceholder: "Frag deinen Coach…",
    send: "Senden",
    groceryTitle: "Einkaufsliste",
    grocerySub: "Automatisch aus deinem Ernährungsplan generiert.",
    noGrocery: "Erstelle deinen Plan für eine Einkaufsliste",
    proFeature: "🔒 Pro-Funktion",
    proUpsellSub: "Upgrade auf Pro für automatische Einkaufsliste, 30-Tage-Pläne und mehr.",
    upgradeProFull: "Auf Pro upgraden — 5$/Monat",
    reviewsTabTitle: "Was Leute Sagen",
    reviewsTabSub: "Echte Bewertungen von FitPlan Pro Nutzern.",
    leaveReview: "Bewertung hinterlassen",
    profileTab: "Profil",
    profileTabSub: "Deine Kontodaten und Abonnement.",
    startOver: "Neu starten / Neuer Plan",
    subscription: "Abonnement",
    building: "Erstelle deinen", personalized: "-Tage-Plan…",
    aboutTime: "Ca. 20-30 Sekunden. Dein Plan wird automatisch gespeichert.",
    savedBanner: "Plan gespeichert. Jederzeit mit deiner E-Mail einloggen.",
    howDoing: "Wie läuft es?", modifyWorkout: "Heutiges Training anpassen",
    lunchEat: "Was soll ich zum Mittagessen?", missedWorkout: "Training verpasst, was nun?",
    motivation: "Motiviere mich", logProgress: "Fortschritt erfassen",
    explainEx: "Übung erklären", soreMuscle: "Muskelkater",
    rateExp: "Wie ist dein Plan?", rateSub: "10 Sekunden für deine Bewertung!",
    submitReview: "Bewertung abschicken", skip: "Überspringen",
    levels: ["Anfänger","Fortgeschritten","Profi"],
    diets: ["Keine Einschränkungen","Vegetarisch","Vegan","Keto","Paleo","Glutenfrei","Eiweißreich","Intervallfasten"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"Gewicht verlieren",desc:"Fett verbrennen, Ausdauer verbessern"},
      {id:"muscle_gain",icon:"💪",title:"Muskeln aufbauen",desc:"Kraft und Muskelmasse aufbauen"},
      {id:"athletic",icon:"⚡",title:"Sportliche Leistung",desc:"Geschwindigkeit, Kraft, sportspezifisches Training"},
      {id:"general",icon:"🌿",title:"Allgemeine Gesundheit",desc:"Balance, Mobilität, allgemeines Wohlbefinden"},
      {id:"recomp",icon:"⚖️",title:"Körperkomposition",desc:"Gleichzeitig Fett verlieren und Muskeln aufbauen"},
    ],
    equipment: {
      "Freie Gewichte":[{id:"dumbbells",icon:"🏋️",text:"Kurzhanteln"},{id:"barbells",icon:"🔩",text:"Langhantel"},{id:"kettles",icon:"🫙",text:"Kettlebells"},{id:"ez_bar",icon:"〰️",text:"EZ-Stange"},{id:"bands",icon:"🔁",text:"Widerstandsbänder"}],
      "Kardiogeräte":[{id:"treadmill",icon:"🏃",text:"Laufband"},{id:"bike",icon:"🚴",text:"Heimtrainer"},{id:"rower",icon:"🚣",text:"Rudergerät"},{id:"elliptic",icon:"🌀",text:"Ellipsentrainer"},{id:"stairs",icon:"🪜",text:"Stufenstepper"}],
      "Kraftgeräte":[{id:"cable",icon:"🔗",text:"Kabelzug"},{id:"legpress",icon:"🦵",text:"Beinpresse"},{id:"latpull",icon:"⬇️",text:"Latziehen"},{id:"chestmach",icon:"📐",text:"Brustpresse"},{id:"smith",icon:"🏗️",text:"Smith-Maschine"}],
      "Körpergewicht / Sonstiges":[{id:"pullupbar",icon:"🔲",text:"Klimmzugstange"},{id:"dipbars",icon:"🤸",text:"Dip-Stangen"},{id:"bench",icon:"🪑",text:"Hantelbank"},{id:"sqrack",icon:"🏗️",text:"Kniebeugenständer"},{id:"mat",icon:"🟩",text:"Gymnastikmatte"},{id:"nobody",icon:"🏠",text:"Kein Equipment"}],
    },
    pfeats: {
      basic: ["7-Tage-Ernährungsplan","7-Tage-Trainingsplan","KI-Coach","Schnell-Prompts"],
      basicNo: ["30-Tage-Pläne","Einkaufsliste","Unbegrenzte Neuerstellung"],
      pro: ["30-Tage-Ernährungsplan","30-Tage-Trainingsplan","KI-Coach","Schnell-Prompts","30-Tage-Pläne","Einkaufsliste","Unbegrenzte Neuerstellung"],
    },
  },
  fr: {
    appTagline: "FITNESS ALIMENTÉ PAR IA",
    steps: ["Email","Localisation","Avis","Profil","Objectif","Équipement","Plan"],
    verifyTitle: "D'abord, vérifiez votre email.",
    verifySub: "Nous enverrons un code à 6 chiffres.",
    emailPlaceholder: "vous@email.fr",
    sendCode: "Envoyer le code →",
    sending: "Envoi en cours…",
    checkInbox: "Vérifiez votre boîte mail",
    codeSentTo: "Nous avons envoyé un code à 6 chiffres à",
    enterBelow: "Entrez-le ci-dessous.",
    emailVerified: "Email vérifié!",
    verifiedSub: "Vérifié! Chargement de vos données…",
    verifyBtn: "Vérifier le code →",
    verifying: "Vérification…",
    resendIn: "Renvoyer dans",
    resend: "Renvoyer le code",
    changeEmail: "Changer d'email",
    locationTitle: "Où êtes-vous",
    locationEm: "situé?",
    locationSub: "Nous configurerons vos unités et langue automatiquement.",
    country: "Pays / Région",
    language: "Langue",
    reviewsTitle: "Ce que disent",
    reviewsEm: "les gens.",
    reviewsSub: "Vrais avis d'utilisateurs FitPlan Pro.",
    noReviews: "Soyez le premier!",
    noReviewsSub: "Pas encore d'avis — générez votre plan et laissez le premier.",
    profileTitle: "Parlez-nous de",
    profileEm: "vous.",
    profileSub: "Cela façonne chaque partie de votre plan.",
    firstName: "Prénom",
    age: "Âge",
    weight: "Poids",
    height: "Taille",
    fitnessLevel: "Niveau de forme",
    diet: "Préférence alimentaire",
    goalTitle: "Quel est votre",
    goalEm: "objectif principal?",
    goalSub: "Choisissez celui qui compte le plus maintenant.",
    equipTitle: "Quel équipement",
    equipEm: "avez-vous?",
    equipSub: "Sélectionnez tout ce qui est disponible.",
    planTitle: "Choisissez votre",
    planEm: "plan.",
    planSub: "Les deux incluent un plan repas et entraînement complet.",
    basic: "Basique", pro: "Pro", free: "Gratuit", perMonth: "/mois",
    mostPopular: "Le Plus Populaire",
    generateFree: "Générer un plan gratuit",
    startPro: "Démarrer Pro — 5$/mois",
    back: "Retour", continue: "Continuer",
    myPlan: "Mon Plan", aiCoach: "Coach IA", grocery: "Liste courses", groceryLocked: "🔒 Courses",
    reviews: "Avis", profile: "Profil",
    yourPlan: "Votre Plan de", dayPlan: " Jours",
    goal: "Objectif", level: "Niveau", equip: "Équip.",
    workoutPlan: "Plan d'entraînement", mealPlan: "Plan repas",
    regenerate: "🔄 Régénérer le plan", regenerating: "Régénération…",
    freeLimit: "Plan gratuit — 1 génération seulement.",
    upgradePro: "Passez à Pro pour des régénérations illimitées, plans 30 jours et plus.",
    upgradeBtn: "Passer à Pro →",
    proActive: "PRO — Plan Adaptatif 30 Jours",
    proActiveSub: "Régénérez à tout moment pour un plan mis à jour.",
    coachTitle: "Coach IA",
    coachSub: "Je connais votre plan complet. Demandez-moi n'importe quoi.",
    coachPlaceholder: "Demandez à votre coach…",
    send: "Envoyer",
    groceryTitle: "Liste de Courses",
    grocerySub: "Générée automatiquement à partir de votre plan repas.",
    noGrocery: "Générez votre plan pour obtenir la liste",
    proFeature: "🔒 Fonctionnalité Pro",
    proUpsellSub: "Passez à Pro pour une liste de courses automatique, plans 30 jours et plus.",
    upgradeProFull: "Passer à Pro — 5$/mois",
    reviewsTabTitle: "Ce Que Disent Les Gens",
    reviewsTabSub: "Vrais avis d'utilisateurs.",
    leaveReview: "Laisser un avis",
    profileTab: "Profil",
    profileTabSub: "Détails de votre compte.",
    startOver: "Recommencer / Nouveau plan",
    subscription: "Abonnement",
    building: "Construction de votre plan de", personalized: " jours…",
    aboutTime: "Environ 20-30 secondes. Votre plan sera sauvegardé automatiquement.",
    savedBanner: "Plan sauvegardé. Reconnectez-vous à tout moment.",
    howDoing: "Comment ça se passe?", modifyWorkout: "Modifier l'entraînement d'aujourd'hui",
    lunchEat: "Que manger au déjeuner?", missedWorkout: "J'ai raté un entraînement",
    motivation: "Motivez-moi", logProgress: "Enregistrer les progrès",
    explainEx: "Expliquer un exercice", soreMuscle: "J'ai un muscle douloureux",
    rateExp: "Comment est votre plan?", rateSub: "10 secondes pour noter votre expérience!",
    submitReview: "Soumettre l'avis", skip: "Passer",
    levels: ["Débutant","Intermédiaire","Avancé"],
    diets: ["Sans restrictions","Végétarien","Végétalien","Keto","Paléo","Sans gluten","Riche en protéines","Jeûne intermittent"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"Perte de poids",desc:"Brûler les graisses, améliorer l'endurance"},
      {id:"muscle_gain",icon:"💪",title:"Gain musculaire",desc:"Construire force et masse musculaire"},
      {id:"athletic",icon:"⚡",title:"Performance sportive",desc:"Vitesse, puissance, entraînement spécifique"},
      {id:"general",icon:"🌿",title:"Santé générale",desc:"Équilibre, mobilité, bien-être général"},
      {id:"recomp",icon:"⚖️",title:"Recomposition corporelle",desc:"Perdre du gras et gagner du muscle simultanément"},
    ],
    equipment: {
      "Poids libres":[{id:"dumbbells",icon:"🏋️",text:"Haltères"},{id:"barbells",icon:"🔩",text:"Barres"},{id:"kettles",icon:"🫙",text:"Kettlebells"},{id:"ez_bar",icon:"〰️",text:"Barre EZ"},{id:"bands",icon:"🔁",text:"Bandes élastiques"}],
      "Machines cardio":[{id:"treadmill",icon:"🏃",text:"Tapis roulant"},{id:"bike",icon:"🚴",text:"Vélo stationnaire"},{id:"rower",icon:"🚣",text:"Rameur"},{id:"elliptic",icon:"🌀",text:"Elliptique"},{id:"stairs",icon:"🪜",text:"Stepper"}],
      "Machines de force":[{id:"cable",icon:"🔗",text:"Machine à câble"},{id:"legpress",icon:"🦵",text:"Presse à jambes"},{id:"latpull",icon:"⬇️",text:"Tirage vertical"},{id:"chestmach",icon:"📐",text:"Presse pectorale"},{id:"smith",icon:"🏗️",text:"Machine Smith"}],
      "Poids du corps / Autre":[{id:"pullupbar",icon:"🔲",text:"Barre de traction"},{id:"dipbars",icon:"🤸",text:"Barres à dips"},{id:"bench",icon:"🪑",text:"Banc de musculation"},{id:"sqrack",icon:"🏗️",text:"Rack à squats"},{id:"mat",icon:"🟩",text:"Tapis de yoga"},{id:"nobody",icon:"🏠",text:"Sans équipement"}],
    },
    pfeats: {
      basic: ["Plan repas 7 jours","Plan entraînement 7 jours","Coach IA","Prompts rapides"],
      basicNo: ["Plans 30 jours","Liste de courses","Régénérations illimitées"],
      pro: ["Plan repas 30 jours","Plan entraînement 30 jours","Coach IA","Prompts rapides","Plans 30 jours","Liste de courses","Régénérations illimitées"],
    },
  },
  pt: {
    appTagline: "FITNESS COM IA",
    steps: ["Email","Localização","Avaliações","Perfil","Objetivo","Equipamento","Plano"],
    verifyTitle: "Primeiro, verifique seu email.",
    verifySub: "Enviaremos um código de 6 dígitos.",
    emailPlaceholder: "voce@email.com.br",
    sendCode: "Enviar Código →",
    sending: "Enviando…",
    checkInbox: "Verifique sua caixa de entrada",
    codeSentTo: "Enviamos um código de 6 dígitos para",
    enterBelow: "Digite abaixo.",
    emailVerified: "Email Verificado!",
    verifiedSub: "Verificado! Carregando seus dados…",
    verifyBtn: "Verificar Código →",
    verifying: "Verificando…",
    resendIn: "Reenviar em",
    resend: "Reenviar código",
    changeEmail: "Alterar email",
    locationTitle: "Onde você",
    locationEm: "está?",
    locationSub: "Configuraremos suas unidades e idioma automaticamente.",
    country: "País / Região",
    language: "Idioma",
    reviewsTitle: "O que as pessoas",
    reviewsEm: "estão dizendo.",
    reviewsSub: "Avaliações reais de usuários do FitPlan Pro.",
    noReviews: "Seja o primeiro!",
    noReviewsSub: "Sem avaliações ainda — gere seu plano e deixe a primeira.",
    profileTitle: "Conte-nos sobre",
    profileEm: "você.",
    profileSub: "Isso molda cada parte do seu plano.",
    firstName: "Nome",
    age: "Idade",
    weight: "Peso",
    height: "Altura",
    fitnessLevel: "Nível de Fitness",
    diet: "Preferência Alimentar",
    goalTitle: "Qual é o seu",
    goalEm: "objetivo principal?",
    goalSub: "Escolha o que mais importa agora.",
    equipTitle: "Qual equipamento",
    equipEm: "você tem?",
    equipSub: "Selecione tudo disponível.",
    planTitle: "Escolha seu",
    planEm: "plano.",
    planSub: "Ambos incluem plano de refeições e treino completo.",
    basic: "Básico", pro: "Pro", free: "Grátis", perMonth: "/mês",
    mostPopular: "Mais Popular",
    generateFree: "Gerar Plano Grátis",
    startPro: "Iniciar Pro — $5/mês",
    back: "Voltar", continue: "Continuar",
    myPlan: "Meu Plano", aiCoach: "Coach IA", grocery: "Lista Compras", groceryLocked: "🔒 Compras",
    reviews: "Avaliações", profile: "Perfil",
    yourPlan: "Seu Plano de", dayPlan: " Dias",
    goal: "Objetivo", level: "Nível", equip: "Equip.",
    workoutPlan: "Plano de Treino", mealPlan: "Plano de Refeições",
    regenerate: "🔄 Regenerar Plano", regenerating: "Regenerando…",
    freeLimit: "Plano gratuito — apenas 1 geração.",
    upgradePro: "Atualize para Pro para regenerações ilimitadas, planos de 30 dias e mais.",
    upgradeBtn: "Atualizar para Pro →",
    proActive: "PRO — Plano Adaptativo de 30 Dias",
    proActiveSub: "Regenere a qualquer momento para um plano atualizado.",
    coachTitle: "Coach IA",
    coachSub: "Eu conheço seu plano completo. Pergunte-me qualquer coisa.",
    coachPlaceholder: "Pergunte ao seu coach…",
    send: "Enviar",
    groceryTitle: "Lista de Compras",
    grocerySub: "Gerada automaticamente do seu plano de refeições.",
    noGrocery: "Gere seu plano para obter a lista",
    proFeature: "🔒 Recurso Pro",
    proUpsellSub: "Atualize para Pro para lista de compras automática, planos de 30 dias e mais.",
    upgradeProFull: "Atualizar para Pro — $5/mês",
    reviewsTabTitle: "O Que Dizem",
    reviewsTabSub: "Avaliações reais de usuários.",
    leaveReview: "Deixar uma Avaliação",
    profileTab: "Perfil",
    profileTabSub: "Detalhes da sua conta.",
    startOver: "Recomeçar / Novo Plano",
    subscription: "Assinatura",
    building: "Construindo seu plano de", personalized: " dias…",
    aboutTime: "Cerca de 20-30 segundos. Seu plano será salvo automaticamente.",
    savedBanner: "Plano salvo. Entre a qualquer momento com seu email.",
    howDoing: "Como estou indo?", modifyWorkout: "Modificar treino de hoje",
    lunchEat: "O que comer no almoço?", missedWorkout: "Perdi um treino",
    motivation: "Me motive", logProgress: "Registrar progresso",
    explainEx: "Explicar um exercício", soreMuscle: "Tenho dor muscular",
    rateExp: "Como está seu plano?", rateSub: "10 segundos para avaliar!",
    submitReview: "Enviar Avaliação", skip: "Pular",
    levels: ["Iniciante","Intermediário","Avançado"],
    diets: ["Sem Restrições","Vegetariano","Vegano","Keto","Paleo","Sem Glúten","Rico em Proteínas","Jejum Intermitente"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"Perda de Peso",desc:"Queimar gordura, melhorar resistência"},
      {id:"muscle_gain",icon:"💪",title:"Ganho Muscular",desc:"Construir força e massa muscular"},
      {id:"athletic",icon:"⚡",title:"Desempenho Atlético",desc:"Velocidade, potência, treino específico"},
      {id:"general",icon:"🌿",title:"Saúde Geral",desc:"Equilíbrio, mobilidade, bem-estar"},
      {id:"recomp",icon:"⚖️",title:"Recomposição Corporal",desc:"Perder gordura e ganhar músculo simultaneamente"},
    ],
    equipment: {
      "Pesos Livres":[{id:"dumbbells",icon:"🏋️",text:"Halteres"},{id:"barbells",icon:"🔩",text:"Barras"},{id:"kettles",icon:"🫙",text:"Kettlebells"},{id:"ez_bar",icon:"〰️",text:"Barra EZ"},{id:"bands",icon:"🔁",text:"Faixas Elásticas"}],
      "Máquinas de Cardio":[{id:"treadmill",icon:"🏃",text:"Esteira"},{id:"bike",icon:"🚴",text:"Bicicleta Estacionária"},{id:"rower",icon:"🚣",text:"Remo"},{id:"elliptic",icon:"🌀",text:"Elíptico"},{id:"stairs",icon:"🪜",text:"Escada Ergométrica"}],
      "Máquinas de Força":[{id:"cable",icon:"🔗",text:"Máquina de Cabo"},{id:"legpress",icon:"🦵",text:"Leg Press"},{id:"latpull",icon:"⬇️",text:"Puxada Alta"},{id:"chestmach",icon:"📐",text:"Supino na Máquina"},{id:"smith",icon:"🏗️",text:"Máquina Smith"}],
      "Peso Corporal / Outro":[{id:"pullupbar",icon:"🔲",text:"Barra Fixa"},{id:"dipbars",icon:"🤸",text:"Barras para Dips"},{id:"bench",icon:"🪑",text:"Banco"},{id:"sqrack",icon:"🏗️",text:"Rack de Agachamento"},{id:"mat",icon:"🟩",text:"Tapete de Yoga"},{id:"nobody",icon:"🏠",text:"Sem Equipamento"}],
    },
    pfeats: {
      basic: ["Plano de refeições 7 dias","Plano de treino 7 dias","Coach IA","Prompts rápidos"],
      basicNo: ["Planos de 30 dias","Lista de compras","Regenerações ilimitadas"],
      pro: ["Plano de refeições 30 dias","Plano de treino 30 dias","Coach IA","Prompts rápidos","Planos de 30 dias","Lista de compras","Regenerações ilimitadas"],
    },
  },
  it: {
    appTagline: "FITNESS POTENZIATO DA IA",
    steps: ["Email","Posizione","Recensioni","Profilo","Obiettivo","Attrezzatura","Piano"],
    verifyTitle: "Prima, verifica la tua email.",
    verifySub: "Ti invieremo un codice a 6 cifre.",
    emailPlaceholder: "tu@email.it",
    sendCode: "Invia Codice →",
    sending: "Invio in corso…",
    checkInbox: "Controlla la tua casella",
    codeSentTo: "Abbiamo inviato un codice a 6 cifre a",
    enterBelow: "Inseriscilo qui sotto.",
    emailVerified: "Email Verificata!",
    verifiedSub: "Verificato! Caricamento dei tuoi dati…",
    verifyBtn: "Verifica Codice →",
    verifying: "Verifica in corso…",
    resendIn: "Reinvia tra",
    resend: "Reinvia codice",
    changeEmail: "Cambia email",
    locationTitle: "Dove sei",
    locationEm: "situato?",
    locationSub: "Configureremo le tue unità e lingua automaticamente.",
    country: "Paese / Regione",
    language: "Lingua",
    reviewsTitle: "Cosa dicono",
    reviewsEm: "le persone.",
    reviewsSub: "Recensioni reali di utenti FitPlan Pro.",
    noReviews: "Sii il primo!",
    noReviewsSub: "Nessuna recensione ancora — genera il tuo piano e lascia la prima.",
    profileTitle: "Parlaci di",
    profileEm: "te.",
    profileSub: "Questo modella ogni parte del tuo piano.",
    firstName: "Nome",
    age: "Età",
    weight: "Peso",
    height: "Altezza",
    fitnessLevel: "Livello di Fitness",
    diet: "Preferenza Alimentare",
    goalTitle: "Qual è il tuo",
    goalEm: "obiettivo principale?",
    goalSub: "Scegli quello più importante adesso.",
    equipTitle: "Quale attrezzatura",
    equipEm: "hai a disposizione?",
    equipSub: "Seleziona tutto il disponibile.",
    planTitle: "Scegli il tuo",
    planEm: "piano.",
    planSub: "Entrambi includono piano pasti e allenamento completo.",
    basic: "Base", pro: "Pro", free: "Gratuito", perMonth: "/mese",
    mostPopular: "Più Popolare",
    generateFree: "Genera Piano Gratuito",
    startPro: "Inizia Pro — 5$/mese",
    back: "Indietro", continue: "Continua",
    myPlan: "Il Mio Piano", aiCoach: "Coach IA", grocery: "Lista spesa", groceryLocked: "🔒 Spesa",
    reviews: "Recensioni", profile: "Profilo",
    yourPlan: "Il Tuo Piano di", dayPlan: " Giorni",
    goal: "Obiettivo", level: "Livello", equip: "Attrezzatura",
    workoutPlan: "Piano di Allenamento", mealPlan: "Piano Pasti",
    regenerate: "🔄 Rigenera Piano", regenerating: "Rigenerazione…",
    freeLimit: "Piano gratuito — solo 1 generazione.",
    upgradePro: "Passa a Pro per rigenerazioni illimitate, piani 30 giorni e altro.",
    upgradeBtn: "Passa a Pro →",
    proActive: "PRO — Piano Adattivo 30 Giorni",
    proActiveSub: "Rigenera in qualsiasi momento per un piano aggiornato.",
    coachTitle: "Coach IA",
    coachSub: "Conosco il tuo piano completo. Chiedimi qualsiasi cosa.",
    coachPlaceholder: "Chiedi al tuo coach…",
    send: "Invia",
    groceryTitle: "Lista della Spesa",
    grocerySub: "Generata automaticamente dal tuo piano pasti.",
    noGrocery: "Genera il tuo piano per ottenere la lista",
    proFeature: "🔒 Funzionalità Pro",
    proUpsellSub: "Passa a Pro per lista della spesa automatica, piani 30 giorni e altro.",
    upgradeProFull: "Passa a Pro — 5$/mese",
    reviewsTabTitle: "Cosa Dicono Le Persone",
    reviewsTabSub: "Recensioni reali di utenti.",
    leaveReview: "Lascia una Recensione",
    profileTab: "Profilo",
    profileTabSub: "Dettagli account e abbonamento.",
    startOver: "Ricomincia / Nuovo Piano",
    subscription: "Abbonamento",
    building: "Costruendo il tuo piano di", personalized: " giorni…",
    aboutTime: "Circa 20-30 secondi. Il tuo piano verrà salvato automaticamente.",
    savedBanner: "Piano salvato. Accedi di nuovo con la tua email.",
    howDoing: "Come sto andando?", modifyWorkout: "Modifica allenamento di oggi",
    lunchEat: "Cosa mangiare a pranzo?", missedWorkout: "Ho saltato un allenamento",
    motivation: "Motivami", logProgress: "Registra i progressi",
    explainEx: "Spiega un esercizio", soreMuscle: "Ho un muscolo dolorante",
    rateExp: "Com'è il tuo piano?", rateSub: "10 secondi per valutare!",
    submitReview: "Invia Recensione", skip: "Salta",
    levels: ["Principiante","Intermedio","Avanzato"],
    diets: ["Nessuna Restrizione","Vegetariano","Vegano","Keto","Paleo","Senza Glutine","Ricco di Proteine","Digiuno Intermittente"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"Perdita di Peso",desc:"Bruciare grassi, migliorare la resistenza"},
      {id:"muscle_gain",icon:"💪",title:"Guadagno Muscolare",desc:"Costruire forza e massa muscolare"},
      {id:"athletic",icon:"⚡",title:"Performance Atletica",desc:"Velocità, potenza, allenamento specifico"},
      {id:"general",icon:"🌿",title:"Salute Generale",desc:"Equilibrio, mobilità, benessere generale"},
      {id:"recomp",icon:"⚖️",title:"Ricomposizione Corporea",desc:"Perdere grasso e guadagnare muscolo simultaneamente"},
    ],
    equipment: {
      "Pesi Liberi":[{id:"dumbbells",icon:"🏋️",text:"Manubri"},{id:"barbells",icon:"🔩",text:"Bilancieri"},{id:"kettles",icon:"🫙",text:"Kettlebell"},{id:"ez_bar",icon:"〰️",text:"Barra EZ"},{id:"bands",icon:"🔁",text:"Elastici"}],
      "Macchine Cardio":[{id:"treadmill",icon:"🏃",text:"Tapis Roulant"},{id:"bike",icon:"🚴",text:"Cyclette"},{id:"rower",icon:"🚣",text:"Vogatore"},{id:"elliptic",icon:"🌀",text:"Ellittica"},{id:"stairs",icon:"🪜",text:"Stepper"}],
      "Macchine Forza":[{id:"cable",icon:"🔗",text:"Cavi"},{id:"legpress",icon:"🦵",text:"Leg Press"},{id:"latpull",icon:"⬇️",text:"Lat Machine"},{id:"chestmach",icon:"📐",text:"Chest Press"},{id:"smith",icon:"🏗️",text:"Smith Machine"}],
      "Peso Corporeo / Altro":[{id:"pullupbar",icon:"🔲",text:"Sbarra Trazioni"},{id:"dipbars",icon:"🤸",text:"Parallele"},{id:"bench",icon:"🪑",text:"Panca"},{id:"sqrack",icon:"🏗️",text:"Rack Squat"},{id:"mat",icon:"🟩",text:"Tappetino"},{id:"nobody",icon:"🏠",text:"Nessuna Attrezzatura"}],
    },
    pfeats: {
      basic: ["Piano pasti 7 giorni","Piano allenamento 7 giorni","Coach IA","Prompt rapidi"],
      basicNo: ["Piani 30 giorni","Lista della spesa","Rigenerazioni illimitate"],
      pro: ["Piano pasti 30 giorni","Piano allenamento 30 giorni","Coach IA","Prompt rapidi","Piani 30 giorni","Lista della spesa","Rigenerazioni illimitate"],
    },
  },
  ja: {
    appTagline: "AIフィットネス",
    steps: ["メール","場所","レビュー","プロフィール","目標","器具","プラン"],
    verifyTitle: "まず、メールを確認してください。",
    verifySub: "6桁のコードを送信します。",
    emailPlaceholder: "you@email.com",
    sendCode: "確認コードを送信 →",
    sending: "送信中…",
    checkInbox: "受信ボックスを確認",
    codeSentTo: "6桁のコードを送信しました",
    enterBelow: "以下に入力してください。",
    emailVerified: "メール確認済み！",
    verifiedSub: "確認完了！データを読み込んでいます…",
    verifyBtn: "コードを確認 →",
    verifying: "確認中…",
    resendIn: "再送信まで",
    resend: "コードを再送信",
    changeEmail: "メールを変更",
    locationTitle: "あなたは",
    locationEm: "どこにいますか？",
    locationSub: "単位と言語を自動的に設定します。",
    country: "国 / 地域",
    language: "言語",
    reviewsTitle: "みんなの",
    reviewsEm: "声。",
    reviewsSub: "FitPlan Proユーザーの実際のレビュー。",
    noReviews: "最初になろう！",
    noReviewsSub: "まだレビューがありません — プランを生成して最初のレビューを残しましょう。",
    profileTitle: "あなたについて",
    profileEm: "教えてください。",
    profileSub: "これがあなたのプランのすべてを形作ります。",
    firstName: "名前",
    age: "年齢",
    weight: "体重",
    height: "身長",
    fitnessLevel: "フィットネスレベル",
    diet: "食事の好み",
    goalTitle: "あなたの",
    goalEm: "主な目標は？",
    goalSub: "今最も重要なものを選んでください。",
    equipTitle: "どの器具が",
    equipEm: "使えますか？",
    equipSub: "利用可能なものをすべて選択してください。",
    planTitle: "プランを",
    planEm: "選んでください。",
    planSub: "どちらも完全な食事と運動プランが含まれています。",
    basic: "ベーシック", pro: "プロ", free: "無料", perMonth: "/月",
    mostPopular: "最人気",
    generateFree: "無料プランを生成",
    startPro: "プロを開始 — $5/月",
    back: "戻る", continue: "次へ",
    myPlan: "マイプラン", aiCoach: "AIコーチ", grocery: "買い物リスト", groceryLocked: "🔒 買い物",
    reviews: "レビュー", profile: "プロフィール",
    yourPlan: "あなたの", dayPlan: "日間プラン",
    goal: "目標", level: "レベル", equip: "器具",
    workoutPlan: "トレーニングプラン", mealPlan: "食事プラン",
    regenerate: "🔄 プランを再生成", regenerating: "再生成中…",
    freeLimit: "無料プラン — 生成1回のみ。",
    upgradePro: "無制限の再生成、30日プランなどのためにプロにアップグレード。",
    upgradeBtn: "プロにアップグレード →",
    proActive: "PRO — 30日適応型プラン",
    proActiveSub: "いつでも再生成して最新のプランを取得。",
    coachTitle: "AIコーチ",
    coachSub: "あなたのプランを完全に把握しています。何でも聞いてください。",
    coachPlaceholder: "コーチに質問する…",
    send: "送信",
    groceryTitle: "買い物リスト",
    grocerySub: "食事プランから自動生成。",
    noGrocery: "プランを生成して買い物リストを取得",
    proFeature: "🔒 プロ機能",
    proUpsellSub: "自動買い物リスト、30日プランなどのためにプロにアップグレード。",
    upgradeProFull: "プロにアップグレード — $5/月",
    reviewsTabTitle: "みんなの声",
    reviewsTabSub: "ユーザーの実際のレビュー。",
    leaveReview: "レビューを書く",
    profileTab: "プロフィール",
    profileTabSub: "アカウントの詳細とサブスクリプション。",
    startOver: "最初からやり直す / 新しいプラン",
    subscription: "サブスクリプション",
    building: "あなたの", personalized: "日間プランを作成中…",
    aboutTime: "約20〜30秒。プランは自動的に保存されます。",
    savedBanner: "プランが保存されました。いつでもメールでログインできます。",
    howDoing: "調子はどうですか？", modifyWorkout: "今日のトレーニングを変更",
    lunchEat: "昼食に何を食べる？", missedWorkout: "トレーニングを休んだ",
    motivation: "やる気をください", logProgress: "進捗を記録",
    explainEx: "エクササイズを説明", soreMuscle: "筋肉痛があります",
    rateExp: "プランはどうですか？", rateSub: "10秒で評価してください！",
    submitReview: "レビューを送信", skip: "スキップ",
    levels: ["初心者","中級者","上級者"],
    diets: ["制限なし","ベジタリアン","ビーガン","ケト","パレオ","グルテンフリー","高タンパク","間欠的断食"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"体重減少",desc:"脂肪燃焼、持久力向上"},
      {id:"muscle_gain",icon:"💪",title:"筋肉増量",desc:"筋力と筋肉量を構築"},
      {id:"athletic",icon:"⚡",title:"アスレチックパフォーマンス",desc:"スピード、パワー、競技特化トレーニング"},
      {id:"general",icon:"🌿",title:"一般的な健康",desc:"バランス、可動性、全体的な健康"},
      {id:"recomp",icon:"⚖️",title:"体組成改善",desc:"脂肪を減らしながら筋肉をつける"},
    ],
    equipment: {
      "フリーウェイト":[{id:"dumbbells",icon:"🏋️",text:"ダンベル"},{id:"barbells",icon:"🔩",text:"バーベル"},{id:"kettles",icon:"🫙",text:"ケトルベル"},{id:"ez_bar",icon:"〰️",text:"EZバー"},{id:"bands",icon:"🔁",text:"レジスタンスバンド"}],
      "有酸素マシン":[{id:"treadmill",icon:"🏃",text:"トレッドミル"},{id:"bike",icon:"🚴",text:"エアロバイク"},{id:"rower",icon:"🚣",text:"ローイングマシン"},{id:"elliptic",icon:"🌀",text:"エリプティカル"},{id:"stairs",icon:"🪜",text:"ステアマスター"}],
      "筋力マシン":[{id:"cable",icon:"🔗",text:"ケーブルマシン"},{id:"legpress",icon:"🦵",text:"レッグプレス"},{id:"latpull",icon:"⬇️",text:"ラットプルダウン"},{id:"chestmach",icon:"📐",text:"チェストプレス"},{id:"smith",icon:"🏗️",text:"スミスマシン"}],
      "自重 / その他":[{id:"pullupbar",icon:"🔲",text:"懸垂バー"},{id:"dipbars",icon:"🤸",text:"ディップバー"},{id:"bench",icon:"🪑",text:"ベンチ"},{id:"sqrack",icon:"🏗️",text:"スクワットラック"},{id:"mat",icon:"🟩",text:"ヨガマット"},{id:"nobody",icon:"🏠",text:"器具なし"}],
    },
    pfeats: {
      basic: ["7日間の食事プラン","7日間のトレーニングプラン","AIコーチ","クイックプロンプト"],
      basicNo: ["30日間プラン","買い物リスト","無制限再生成"],
    },
  },
      pro: ["30日間の食事プラン","30日間のトレーニングプラン","AIコーチ","クイックプロンプト","30日間プラン","買い物リスト","無制限再生成"],
  uk: {
    appTagline: "AI-ФІТНЕС",
    steps: ["Email","Місце","Відгуки","Профіль","Ціль","Обладнання","План"],
    verifyTitle: "Спочатку підтвердьте email.",
    verifySub: "Ми надішлемо 6-значний код. Користувачі, які повертаються, отримають свій план автоматично.",
    emailPlaceholder: "ви@email.com",
    sendCode: "Надіслати код підтвердження →",
    sending: "Надсилання…",
    checkInbox: "Перевірте вашу скриньку",
    codeSentTo: "Ми надіслали 6-значний код на",
    enterBelow: "Введіть його нижче.",
    emailVerified: "Email підтверджено!",
    verifiedSub: "Підтверджено! Завантаження ваших даних…",
    verifyBtn: "Підтвердити код →",
    verifying: "Перевірка…",
    resendIn: "Повторно надіслати через",
    resend: "Надіслати код ще раз",
    changeEmail: "Змінити email",
    locationTitle: "Де ви",
    locationEm: "знаходитесь?",
    locationSub: "Ми автоматично налаштуємо ваші одиниці та мову.",
    country: "Країна / Регіон",
    language: "Мова",
    reviewsTitle: "Що кажуть",
    reviewsEm: "люди.",
    reviewsSub: "Справжні відгуки користувачів FitPlan Pro.",
    noReviews: "Будьте першим!",
    noReviewsSub: "Ще немає відгуків — згенеруйте свій план і залиште перший.",
    profileTitle: "Розкажіть нам про",
    profileEm: "себе.",
    profileSub: "Це формує кожну частину вашого плану.",
    firstName: "Ім'я",
    age: "Вік",
    weight: "Вага",
    height: "Зріст",
    fitnessLevel: "Рівень фізичної підготовки",
    diet: "Дієтичні уподобання",
    goalTitle: "Яка ваша",
    goalEm: "головна ціль?",
    goalSub: "Виберіть те, що зараз найважливіше.",
    equipTitle: "Яке обладнання",
    equipEm: "у вас є?",
    equipSub: "Виберіть усе доступне — ми побудуємо план навколо того, що у вас є.",
    planTitle: "Виберіть свій",
    planEm: "план.",
    planSub: "Обидва включають повний план харчування та тренувань.",
    basic: "Базовий", pro: "Про", free: "Безкоштовно", perMonth: "/міс",
    mostPopular: "Найпопулярніший",
    generateFree: "Згенерувати безкоштовний план",
    startPro: "Розпочати Про — $5/міс",
    back: "Назад", continue: "Продовжити",
    myPlan: "Мій план", aiCoach: "ІІ Тренер", grocery: "Список покупок", groceryLocked: "🔒 Покупки",
    reviews: "Відгуки", profile: "Профіль",
    yourPlan: "Ваш", dayPlan: "-денний план",
    goal: "Ціль", level: "Рівень", equip: "Обладн.",
    workoutPlan: "План тренувань", mealPlan: "План харчування",
    regenerate: "🔄 Перегенерувати план", regenerating: "Перегенерація…",
    freeLimit: "Безкоштовний план — лише 1 генерація.",
    upgradePro: "Оновіться до Про для необмежених генерацій, 30-денних планів та більше.",
    upgradeBtn: "Оновитися до Про →",
    proActive: "ПРО — Адаптивний 30-денний план",
    proActiveSub: "Перегенеруйте будь-коли для отримання оновленого плану.",
    coachTitle: "ІІ Тренер",
    coachSub: "Я знаю ваш повний план. Запитайте мене про будь-що.",
    coachPlaceholder: "Запитайте свого тренера…",
    send: "Надіслати",
    groceryTitle: "Список покупок",
    grocerySub: "Автоматично згенерований з вашого плану харчування.",
    noGrocery: "Згенеруйте свій план для отримання списку покупок",
    proFeature: "🔒 Функція Про",
    proUpsellSub: "Оновіться до Про для автоматичного списку покупок, 30-денних планів та більше.",
    upgradeProFull: "Оновитися до Про — $5/міс",
    reviewsTabTitle: "Що кажуть люди",
    reviewsTabSub: "Справжні відгуки користувачів.",
    leaveReview: "Залишити відгук",
    profileTab: "Профіль",
    profileTabSub: "Деталі вашого акаунту та підписки.",
    startOver: "Почати спочатку / Новий план",
    subscription: "Підписка",
    building: "Будуємо ваш", personalized: "-денний план…",
    aboutTime: "Близько 20-30 секунд. Ваш план буде збережено автоматично.",
    savedBanner: "План збережено. Увійдіть будь-коли зі своїм email.",
    howDoing: "Як я просуваюсь?", modifyWorkout: "Змінити сьогоднішнє тренування",
    lunchEat: "Що з'їсти на обід?", missedWorkout: "Я пропустив тренування",
    motivation: "Надихни мене", logProgress: "Записати прогрес",
    explainEx: "Пояснити вправу", soreMuscle: "У мене болить м'яз",
    rateExp: "Як ваш план?", rateSub: "10 секунд, щоб оцінити свій досвід!",
    submitReview: "Надіслати відгук", skip: "Пропустити",
    levels: ["Початківець","Середній","Просунутий"],
    diets: ["Без обмежень","Вегетаріанець","Веган","Кето","Палео","Без глютену","Багато білка","Інтервальне голодування"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"Схуднення",desc:"Спалювання жиру, покращення витривалості"},
      {id:"muscle_gain",icon:"💪",title:"Набір м'язів",desc:"Побудова сили та м'язової маси"},
      {id:"athletic",icon:"⚡",title:"Спортивні результати",desc:"Швидкість, потужність, специфічні тренування"},
      {id:"general",icon:"🌿",title:"Загальне здоров'я",desc:"Баланс, мобільність, загальне благополуччя"},
      {id:"recomp",icon:"⚖️",title:"Рекомпозиція тіла",desc:"Одночасно втрачати жир і набирати м'язи"},
    ],
    equipment: {
      "Вільні ваги":[{id:"dumbbells",icon:"🏋️",text:"Гантелі"},{id:"barbells",icon:"🔩",text:"Штанга"},{id:"kettles",icon:"🫙",text:"Гирі"},{id:"ez_bar",icon:"〰️",text:"EZ-гриф"},{id:"bands",icon:"🔁",text:"Резинки"}],
      "Кардіо тренажери":[{id:"treadmill",icon:"🏃",text:"Бігова доріжка"},{id:"bike",icon:"🚴",text:"Велотренажер"},{id:"rower",icon:"🚣",text:"Гребний тренажер"},{id:"elliptic",icon:"🌀",text:"Еліпсоїд"},{id:"stairs",icon:"🪜",text:"Степер"}],
      "Силові тренажери":[{id:"cable",icon:"🔗",text:"Блоковий тренажер"},{id:"legpress",icon:"🦵",text:"Жим ногами"},{id:"latpull",icon:"⬇️",text:"Тяга зверху"},{id:"chestmach",icon:"📐",text:"Жим грудей"},{id:"smith",icon:"🏗️",text:"Машина Сміта"}],
      "Власна вага / Інше":[{id:"pullupbar",icon:"🔲",text:"Турнік"},{id:"dipbars",icon:"🤸",text:"Бруси"},{id:"bench",icon:"🪑",text:"Лава"},{id:"sqrack",icon:"🏗️",text:"Рама для присідань"},{id:"mat",icon:"🟩",text:"Килимок"},{id:"nobody",icon:"🏠",text:"Без обладнання"}],
    },
    pfeats: {
      basic: ["7-денний план харчування","7-денний план тренувань","ІІ Тренер","Швидкі підказки"],
      basicNo: ["30-денні плани","Список покупок","Необмежені генерації"],
      pro: ["30-денний план харчування","30-денний план тренувань","ІІ Тренер","Швидкі підказки","30-денні плани","Список покупок","Необмежені генерації"],
    },
  },
  ko: {
    appTagline: "AI 피트니스",
    steps: ["이메일","위치","리뷰","프로필","목표","장비","플랜"],
    verifyTitle: "먼저 이메일을 확인하세요.",
    verifySub: "6자리 코드를 보내드립니다. 기존 사용자는 플랜이 자동으로 복원됩니다.",
    emailPlaceholder: "you@email.com",
    sendCode: "인증 코드 보내기 →",
    sending: "전송 중…",
    checkInbox: "받은 편지함 확인",
    codeSentTo: "6자리 코드를 보냈습니다",
    enterBelow: "아래에 입력하세요.",
    emailVerified: "이메일 인증 완료!",
    verifiedSub: "인증됨! 데이터를 불러오는 중…",
    verifyBtn: "코드 인증 →",
    verifying: "인증 중…",
    resendIn: "재전송까지",
    resend: "코드 재전송",
    changeEmail: "이메일 변경",
    locationTitle: "어디에",
    locationEm: "계신가요?",
    locationSub: "단위와 언어를 자동으로 설정합니다.",
    country: "국가 / 지역",
    language: "언어",
    reviewsTitle: "사람들이",
    reviewsEm: "하는 말.",
    reviewsSub: "FitPlan Pro 사용자들의 실제 리뷰.",
    noReviews: "첫 번째가 되세요!",
    noReviewsSub: "아직 리뷰가 없습니다 — 플랜을 생성하고 첫 리뷰를 남겨보세요.",
    profileTitle: "본인에 대해",
    profileEm: "알려주세요.",
    profileSub: "이것이 플랜의 모든 부분을 형성합니다.",
    firstName: "이름",
    age: "나이",
    weight: "체중",
    height: "키",
    fitnessLevel: "피트니스 레벨",
    diet: "식단 선호도",
    goalTitle: "주요",
    goalEm: "목표는 무엇인가요?",
    goalSub: "지금 가장 중요한 것을 선택하세요.",
    equipTitle: "어떤 장비를",
    equipEm: "사용할 수 있나요?",
    equipSub: "가능한 모든 것을 선택하세요.",
    planTitle: "플랜을",
    planEm: "선택하세요.",
    planSub: "두 플랜 모두 완전한 식단 및 운동 플랜을 포함합니다.",
    basic: "기본", pro: "프로", free: "무료", perMonth: "/월",
    mostPopular: "가장 인기",
    generateFree: "무료 플랜 생성",
    startPro: "프로 시작 — $5/월",
    back: "뒤로", continue: "계속",
    myPlan: "내 플랜", aiCoach: "AI 코치", grocery: "장보기 목록", groceryLocked: "🔒 장보기",
    reviews: "리뷰", profile: "프로필",
    yourPlan: "나의", dayPlan: "일 플랜",
    goal: "목표", level: "레벨", equip: "장비",
    workoutPlan: "운동 플랜", mealPlan: "식단 플랜",
    regenerate: "🔄 플랜 재생성", regenerating: "재생성 중…",
    freeLimit: "무료 플랜 — 1회 생성만 가능.",
    upgradePro: "무제한 재생성, 30일 플랜 등을 위해 프로로 업그레이드하세요.",
    upgradeBtn: "프로로 업그레이드 →",
    proActive: "프로 — 30일 적응형 플랜",
    proActiveSub: "언제든지 재생성하여 업데이트된 플랜을 받으세요.",
    coachTitle: "AI 코치",
    coachSub: "나는 당신의 전체 플랜을 알고 있습니다. 무엇이든 물어보세요.",
    coachPlaceholder: "코치에게 질문하기…",
    send: "전송",
    groceryTitle: "장보기 목록",
    grocerySub: "식단 플랜에서 자동 생성됩니다.",
    noGrocery: "플랜을 생성하여 장보기 목록 받기",
    proFeature: "🔒 프로 기능",
    proUpsellSub: "자동 장보기 목록, 30일 플랜 등을 위해 프로로 업그레이드하세요.",
    upgradeProFull: "프로로 업그레이드 — $5/월",
    reviewsTabTitle: "사람들의 말",
    reviewsTabSub: "실제 사용자 리뷰.",
    leaveReview: "리뷰 남기기",
    profileTab: "프로필",
    profileTabSub: "계정 정보 및 구독.",
    startOver: "다시 시작 / 새 플랜",
    subscription: "구독",
    building: "당신의", personalized: "일 플랜 생성 중…",
    aboutTime: "약 20-30초. 플랜이 자동으로 저장됩니다.",
    savedBanner: "플랜이 저장되었습니다. 언제든지 이메일로 로그인하세요.",
    howDoing: "어떻게 진행되고 있나요?", modifyWorkout: "오늘 운동 수정",
    lunchEat: "점심에 뭘 먹을까요?", missedWorkout: "운동을 빠졌어요",
    motivation: "동기부여 해주세요", logProgress: "진행 상황 기록",
    explainEx: "운동 설명", soreMuscle: "근육이 아파요",
    rateExp: "플랜은 어떤가요?", rateSub: "10초 만에 경험을 평가해주세요!",
    submitReview: "리뷰 제출", skip: "건너뛰기",
    levels: ["초보자","중급자","고급자"],
    diets: ["제한 없음","채식주의","완전채식","키토","팔레오","글루텐 프리","고단백","간헐적 단식"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"체중 감량",desc:"지방 연소, 체력 향상"},
      {id:"muscle_gain",icon:"💪",title:"근육 증가",desc:"근력과 근육량 키우기"},
      {id:"athletic",icon:"⚡",title:"운동 능력 향상",desc:"속도, 파워, 종목별 훈련"},
      {id:"general",icon:"🌿",title:"일반 건강",desc:"균형, 유연성, 전반적인 건강"},
      {id:"recomp",icon:"⚖️",title:"체형 개선",desc:"지방을 줄이고 근육을 동시에 늘리기"},
    ],
    equipment: {
      "자유 중량":[{id:"dumbbells",icon:"🏋️",text:"덤벨"},{id:"barbells",icon:"🔩",text:"바벨"},{id:"kettles",icon:"🫙",text:"케틀벨"},{id:"ez_bar",icon:"〰️",text:"EZ바"},{id:"bands",icon:"🔁",text:"저항 밴드"}],
      "유산소 기구":[{id:"treadmill",icon:"🏃",text:"트레드밀"},{id:"bike",icon:"🚴",text:"실내 자전거"},{id:"rower",icon:"🚣",text:"로잉머신"},{id:"elliptic",icon:"🌀",text:"일립티컬"},{id:"stairs",icon:"🪜",text:"스텝퍼"}],
      "근력 기구":[{id:"cable",icon:"🔗",text:"케이블 머신"},{id:"legpress",icon:"🦵",text:"레그 프레스"},{id:"latpull",icon:"⬇️",text:"랫 풀다운"},{id:"chestmach",icon:"📐",text:"체스트 프레스"},{id:"smith",icon:"🏗️",text:"스미스 머신"}],
      "맨몸 / 기타":[{id:"pullupbar",icon:"🔲",text:"철봉"},{id:"dipbars",icon:"🤸",text:"딥바"},{id:"bench",icon:"🪑",text:"벤치"},{id:"sqrack",icon:"🏗️",text:"스쿼트 랙"},{id:"mat",icon:"🟩",text:"요가 매트"},{id:"nobody",icon:"🏠",text:"기구 없음"}],
    },
    pfeats: {
      basic: ["7일 식단 플랜","7일 운동 플랜","AI 코치","빠른 프롬프트"],
      basicNo: ["30일 플랜","장보기 목록","무제한 재생성"],
      pro: ["30일 식단 플랜","30일 운동 플랜","AI 코치","빠른 프롬프트","30일 플랜","장보기 목록","무제한 재생성"],
    },
  },
  zh: {
    appTagline: "AI健身",
    steps: ["邮箱","位置","评价","个人资料","目标","设备","计划"],
    verifyTitle: "首先，验证您的邮箱。",
    verifySub: "我们将发送一个6位验证码。老用户的计划将自动恢复。",
    emailPlaceholder: "您的邮箱@email.com",
    sendCode: "发送验证码 →",
    sending: "发送中…",
    checkInbox: "查看您的收件箱",
    codeSentTo: "我们已将6位验证码发送至",
    enterBelow: "请在下方输入。",
    emailVerified: "邮箱已验证！",
    verifiedSub: "已验证！正在加载您的数据…",
    verifyBtn: "验证码确认 →",
    verifying: "验证中…",
    resendIn: "重新发送倒计时",
    resend: "重新发送验证码",
    changeEmail: "更换邮箱",
    locationTitle: "您在",
    locationEm: "哪里？",
    locationSub: "我们将自动设置您的单位和语言。",
    country: "国家 / 地区",
    language: "语言",
    reviewsTitle: "用户",
    reviewsEm: "评价。",
    reviewsSub: "FitPlan Pro用户的真实评价。",
    noReviews: "成为第一个！",
    noReviewsSub: "还没有评价 — 生成您的计划并留下第一条评价。",
    profileTitle: "告诉我们关于",
    profileEm: "您自己。",
    profileSub: "这将塑造您计划的每个部分。",
    firstName: "名字",
    age: "年龄",
    weight: "体重",
    height: "身高",
    fitnessLevel: "健身水平",
    diet: "饮食偏好",
    goalTitle: "您的",
    goalEm: "主要目标是什么？",
    goalSub: "选择现在最重要的目标。",
    equipTitle: "您有哪些",
    equipEm: "设备？",
    equipSub: "选择所有可用设备 — 我们将根据您拥有的设备制定计划。",
    planTitle: "选择您的",
    planEm: "计划。",
    planSub: "两个计划都包含完整的饮食和锻炼计划。",
    basic: "基础版", pro: "专业版", free: "免费", perMonth: "/月",
    mostPopular: "最受欢迎",
    generateFree: "生成免费计划",
    startPro: "开始专业版 — $5/月",
    back: "返回", continue: "继续",
    myPlan: "我的计划", aiCoach: "AI教练", grocery: "购物清单", groceryLocked: "🔒 购物",
    reviews: "评价", profile: "个人资料",
    yourPlan: "您的", dayPlan: "天计划",
    goal: "目标", level: "水平", equip: "设备",
    workoutPlan: "锻炼计划", mealPlan: "饮食计划",
    regenerate: "🔄 重新生成计划", regenerating: "重新生成中…",
    freeLimit: "免费计划 — 仅限1次生成。",
    upgradePro: "升级到专业版，获得无限次生成、30天计划等更多功能。",
    upgradeBtn: "升级到专业版 →",
    proActive: "专业版 — 30天自适应计划",
    proActiveSub: "随时重新生成以获取更新的计划。",
    coachTitle: "AI教练",
    coachSub: "我了解您的完整计划。请随时提问。",
    coachPlaceholder: "向您的教练提问…",
    send: "发送",
    groceryTitle: "购物清单",
    grocerySub: "根据您的饮食计划自动生成。",
    noGrocery: "生成您的计划以获取购物清单",
    proFeature: "🔒 专业版功能",
    proUpsellSub: "升级到专业版，获得自动购物清单、30天计划等更多功能。",
    upgradeProFull: "升级到专业版 — $5/月",
    reviewsTabTitle: "用户评价",
    reviewsTabSub: "真实用户评价。",
    leaveReview: "留下评价",
    profileTab: "个人资料",
    profileTabSub: "您的账户详情和订阅。",
    startOver: "重新开始 / 新计划",
    subscription: "订阅",
    building: "正在构建您的", personalized: "天计划…",
    aboutTime: "大约20-30秒。您的计划将自动保存。",
    savedBanner: "计划已保存。随时使用邮箱登录。",
    howDoing: "我进展如何？", modifyWorkout: "修改今天的训练",
    lunchEat: "午餐吃什么？", missedWorkout: "我错过了一次训练",
    motivation: "给我动力", logProgress: "记录进度",
    explainEx: "解释一个动作", soreMuscle: "我的肌肉酸痛",
    rateExp: "您的计划怎么样？", rateSub: "花10秒评价您的体验！",
    submitReview: "提交评价", skip: "跳过",
    levels: ["初学者","中级","高级"],
    diets: ["无限制","素食","纯素","生酮","原始人","无麸质","高蛋白","间歇性禁食"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"减重",desc:"燃烧脂肪，提高耐力"},
      {id:"muscle_gain",icon:"💪",title:"增肌",desc:"增强力量和肌肉量"},
      {id:"athletic",icon:"⚡",title:"运动表现",desc:"速度、力量、专项训练"},
      {id:"general",icon:"🌿",title:"整体健康",desc:"平衡、灵活性、整体健康"},
      {id:"recomp",icon:"⚖️",title:"体型重塑",desc:"同时减脂增肌"},
    ],
    equipment: {
      "自由重量":[{id:"dumbbells",icon:"🏋️",text:"哑铃"},{id:"barbells",icon:"🔩",text:"杠铃"},{id:"kettles",icon:"🫙",text:"壶铃"},{id:"ez_bar",icon:"〰️",text:"EZ杠铃"},{id:"bands",icon:"🔁",text:"弹力带"}],
      "有氧器械":[{id:"treadmill",icon:"🏃",text:"跑步机"},{id:"bike",icon:"🚴",text:"健身车"},{id:"rower",icon:"🚣",text:"划船机"},{id:"elliptic",icon:"🌀",text:"椭圆机"},{id:"stairs",icon:"🪜",text:"踏步机"}],
      "力量器械":[{id:"cable",icon:"🔗",text:"绳索机"},{id:"legpress",icon:"🦵",text:"腿举机"},{id:"latpull",icon:"⬇️",text:"高位下拉"},{id:"chestmach",icon:"📐",text:"胸部推举机"},{id:"smith",icon:"🏗️",text:"史密斯机"}],
      "自重 / 其他":[{id:"pullupbar",icon:"🔲",text:"引体向上杆"},{id:"dipbars",icon:"🤸",text:"双杠"},{id:"bench",icon:"🪑",text:"训练凳"},{id:"sqrack",icon:"🏗️",text:"深蹲架"},{id:"mat",icon:"🟩",text:"瑜伽垫"},{id:"nobody",icon:"🏠",text:"无器械"}],
    },
    pfeats: {
      basic: ["7天饮食计划","7天锻炼计划","AI教练","快速提示"],
      basicNo: ["30天计划","购物清单","无限次重新生成"],
      pro: ["30天饮食计划","30天锻炼计划","AI教练","快速提示","30天计划","购物清单","无限次重新生成"],
    },
  },
  ru: {
    appTagline: "ИИ-ФИТНЕС",
    steps: ["Email","Место","Отзывы","Профиль","Цель","Оборудование","План"],
    verifyTitle: "Сначала подтвердите email.",
    verifySub: "Мы отправим 6-значный код. Пользователи, которые возвращаются, получат свой план автоматически.",
    emailPlaceholder: "вы@email.com",
    sendCode: "Отправить код подтверждения →",
    sending: "Отправка…",
    checkInbox: "Проверьте вашу почту",
    codeSentTo: "Мы отправили 6-значный код на",
    enterBelow: "Введите его ниже.",
    emailVerified: "Email подтверждён!",
    verifiedSub: "Подтверждено! Загрузка ваших данных…",
    verifyBtn: "Подтвердить код →",
    verifying: "Проверка…",
    resendIn: "Отправить повторно через",
    resend: "Отправить код повторно",
    changeEmail: "Изменить email",
    locationTitle: "Где вы",
    locationEm: "находитесь?",
    locationSub: "Мы автоматически настроим ваши единицы измерения и язык.",
    country: "Страна / Регион",
    language: "Язык",
    reviewsTitle: "Что говорят",
    reviewsEm: "люди.",
    reviewsSub: "Настоящие отзывы пользователей FitPlan Pro.",
    noReviews: "Будьте первым!",
    noReviewsSub: "Отзывов пока нет — создайте свой план и оставьте первый.",
    profileTitle: "Расскажите нам о",
    profileEm: "себе.",
    profileSub: "Это формирует каждую часть вашего плана.",
    firstName: "Имя",
    age: "Возраст",
    weight: "Вес",
    height: "Рост",
    fitnessLevel: "Уровень физической подготовки",
    diet: "Диетические предпочтения",
    goalTitle: "Какова ваша",
    goalEm: "основная цель?",
    goalSub: "Выберите то, что сейчас важнее всего.",
    equipTitle: "Какое оборудование",
    equipEm: "у вас есть?",
    equipSub: "Выберите всё доступное — мы построим план вокруг того, что у вас есть.",
    planTitle: "Выберите свой",
    planEm: "план.",
    planSub: "Оба включают полный план питания и тренировок.",
    basic: "Базовый", pro: "Про", free: "Бесплатно", perMonth: "/мес",
    mostPopular: "Самый популярный",
    generateFree: "Создать бесплатный план",
    startPro: "Начать Про — $5/мес",
    back: "Назад", continue: "Продолжить",
    myPlan: "Мой план", aiCoach: "ИИ Тренер", grocery: "Список покупок", groceryLocked: "🔒 Покупки",
    reviews: "Отзывы", profile: "Профиль",
    yourPlan: "Ваш", dayPlan: "-дневный план",
    goal: "Цель", level: "Уровень", equip: "Оборуд.",
    workoutPlan: "План тренировок", mealPlan: "План питания",
    regenerate: "🔄 Перегенерировать план", regenerating: "Перегенерация…",
    freeLimit: "Бесплатный план — только 1 генерация.",
    upgradePro: "Обновитесь до Про для неограниченных генераций, 30-дневных планов и многого другого.",
    upgradeBtn: "Обновиться до Про →",
    proActive: "ПРО — Адаптивный 30-дневный план",
    proActiveSub: "Перегенерируйте в любое время для получения обновлённого плана.",
    coachTitle: "ИИ Тренер",
    coachSub: "Я знаю ваш полный план. Спросите меня о чём угодно.",
    coachPlaceholder: "Спросите своего тренера…",
    send: "Отправить",
    groceryTitle: "Список покупок",
    grocerySub: "Автоматически создаётся на основе вашего плана питания.",
    noGrocery: "Создайте свой план для получения списка покупок",
    proFeature: "🔒 Функция Про",
    proUpsellSub: "Обновитесь до Про для автоматического списка покупок, 30-дневных планов и многого другого.",
    upgradeProFull: "Обновиться до Про — $5/мес",
    reviewsTabTitle: "Что говорят люди",
    reviewsTabSub: "Настоящие отзывы пользователей.",
    leaveReview: "Оставить отзыв",
    profileTab: "Профиль",
    profileTabSub: "Данные вашего аккаунта и подписка.",
    startOver: "Начать заново / Новый план",
    subscription: "Подписка",
    building: "Создаём ваш", personalized: "-дневный план…",
    aboutTime: "Около 20-30 секунд. Ваш план будет сохранён автоматически.",
    savedBanner: "План сохранён. Войдите в любое время с помощью email.",
    howDoing: "Как у меня дела?", modifyWorkout: "Изменить сегодняшнюю тренировку",
    lunchEat: "Что съесть на обед?", missedWorkout: "Я пропустил тренировку",
    motivation: "Вдохнови меня", logProgress: "Записать прогресс",
    explainEx: "Объяснить упражнение", soreMuscle: "У меня болит мышца",
    rateExp: "Как ваш план?", rateSub: "10 секунд, чтобы оценить свой опыт!",
    submitReview: "Отправить отзыв", skip: "Пропустить",
    levels: ["Начинающий","Средний","Продвинутый"],
    diets: ["Без ограничений","Вегетарианец","Веган","Кето","Палео","Без глютена","Высокобелковый","Интервальное голодание"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"Похудение",desc:"Сжигание жира, улучшение выносливости"},
      {id:"muscle_gain",icon:"💪",title:"Набор мышц",desc:"Наращивание силы и мышечной массы"},
      {id:"athletic",icon:"⚡",title:"Спортивные результаты",desc:"Скорость, мощь, специфические тренировки"},
      {id:"general",icon:"🌿",title:"Общее здоровье",desc:"Баланс, подвижность, общее благополучие"},
      {id:"recomp",icon:"⚖️",title:"Рекомпозиция тела",desc:"Одновременно терять жир и набирать мышцы"},
    ],
    equipment: {
      "Свободные веса":[{id:"dumbbells",icon:"🏋️",text:"Гантели"},{id:"barbells",icon:"🔩",text:"Штанга"},{id:"kettles",icon:"🫙",text:"Гири"},{id:"ez_bar",icon:"〰️",text:"EZ-гриф"},{id:"bands",icon:"🔁",text:"Резиновые ленты"}],
      "Кардиотренажёры":[{id:"treadmill",icon:"🏃",text:"Беговая дорожка"},{id:"bike",icon:"🚴",text:"Велотренажёр"},{id:"rower",icon:"🚣",text:"Гребной тренажёр"},{id:"elliptic",icon:"🌀",text:"Эллипсоид"},{id:"stairs",icon:"🪜",text:"Степпер"}],
      "Силовые тренажёры":[{id:"cable",icon:"🔗",text:"Блочный тренажёр"},{id:"legpress",icon:"🦵",text:"Жим ногами"},{id:"latpull",icon:"⬇️",text:"Тяга сверху"},{id:"chestmach",icon:"📐",text:"Жим на тренажёре"},{id:"smith",icon:"🏗️",text:"Машина Смита"}],
      "Собственный вес / Прочее":[{id:"pullupbar",icon:"🔲",text:"Турник"},{id:"dipbars",icon:"🤸",text:"Брусья"},{id:"bench",icon:"🪑",text:"Скамья"},{id:"sqrack",icon:"🏗️",text:"Стойка для приседаний"},{id:"mat",icon:"🟩",text:"Коврик"},{id:"nobody",icon:"🏠",text:"Без оборудования"}],
    },
    pfeats: {
      basic: ["7-дневный план питания","7-дневный план тренировок","ИИ Тренер","Быстрые подсказки"],
      basicNo: ["30-дневные планы","Список покупок","Неограниченные генерации"],
      pro: ["30-дневный план питания","30-дневный план тренировок","ИИ Тренер","Быстрые подсказки","30-дневные планы","Список покупок","Неограниченные генерации"],
    },
  },
  ar: {
    appTagline: "لياقة بدنية بالذكاء الاصطناعي",
    steps: ["البريد","الموقع","المراجعات","الملف","الهدف","المعدات","الخطة"],
    verifyTitle: "أولاً، تحقق من بريدك الإلكتروني.",
    verifySub: "سنرسل رمزاً مكوناً من 6 أرقام.",
    emailPlaceholder: "أنت@email.com",
    sendCode: "إرسال رمز التحقق →",
    sending: "جار الإرسال…",
    checkInbox: "تحقق من صندوق الوارد",
    codeSentTo: "أرسلنا رمزاً مكوناً من 6 أرقام إلى",
    enterBelow: "أدخله أدناه.",
    emailVerified: "تم التحقق من البريد الإلكتروني!",
    verifiedSub: "تم التحقق! جار تحميل بياناتك…",
    verifyBtn: "تحقق من الرمز →",
    verifying: "جار التحقق…",
    resendIn: "إعادة الإرسال خلال",
    resend: "إعادة إرسال الرمز",
    changeEmail: "تغيير البريد الإلكتروني",
    locationTitle: "أين",
    locationEm: "أنت؟",
    locationSub: "سنضبط وحداتك ولغتك تلقائياً.",
    country: "البلد / المنطقة",
    language: "اللغة",
    reviewsTitle: "ما يقوله",
    reviewsEm: "الناس.",
    reviewsSub: "مراجعات حقيقية من مستخدمي FitPlan Pro.",
    noReviews: "كن الأول!",
    noReviewsSub: "لا توجد مراجعات بعد — أنشئ خطتك واترك أول مراجعة.",
    profileTitle: "أخبرنا عن",
    profileEm: "نفسك.",
    profileSub: "هذا يشكل كل جزء من خطتك.",
    firstName: "الاسم الأول",
    age: "العمر",
    weight: "الوزن",
    height: "الطول",
    fitnessLevel: "مستوى اللياقة",
    diet: "تفضيلات النظام الغذائي",
    goalTitle: "ما هو",
    goalEm: "هدفك الرئيسي؟",
    goalSub: "اختر ما هو أهم الآن.",
    equipTitle: "ما هي المعدات",
    equipEm: "المتاحة لك؟",
    equipSub: "حدد كل ما هو متاح.",
    planTitle: "اختر",
    planEm: "خطتك.",
    planSub: "كلا الخطتين تتضمنان خطة وجبات وتمارين كاملة.",
    basic: "أساسي", pro: "احترافي", free: "مجاني", perMonth: "/شهر",
    mostPopular: "الأكثر شعبية",
    generateFree: "إنشاء خطة مجانية",
    startPro: "ابدأ الاحترافي — $5/شهر",
    back: "رجوع", continue: "متابعة",
    myPlan: "خطتي", aiCoach: "مدرب الذكاء الاصطناعي", grocery: "قائمة التسوق", groceryLocked: "🔒 تسوق",
    reviews: "مراجعات", profile: "الملف الشخصي",
    yourPlan: "خطتك لـ", dayPlan: " يوم",
    goal: "الهدف", level: "المستوى", equip: "المعدات",
    workoutPlan: "خطة التمرين", mealPlan: "خطة الوجبات",
    regenerate: "🔄 إعادة إنشاء الخطة", regenerating: "جار إعادة الإنشاء…",
    freeLimit: "الخطة المجانية — جيل واحد فقط.",
    upgradePro: "قم بالترقية إلى الاحترافي للأجيال غير المحدودة وخطط 30 يوماً والمزيد.",
    upgradeBtn: "الترقية إلى الاحترافي →",
    proActive: "احترافي — خطة تكيفية لمدة 30 يوماً",
    proActiveSub: "أعد الإنشاء في أي وقت للحصول على خطة محدثة.",
    coachTitle: "مدرب الذكاء الاصطناعي",
    coachSub: "أنا أعرف خطتك الكاملة. اسألني أي شيء.",
    coachPlaceholder: "اسأل مدربك…",
    send: "إرسال",
    groceryTitle: "قائمة التسوق",
    grocerySub: "يتم إنشاؤها تلقائياً من خطة وجباتك.",
    noGrocery: "أنشئ خطتك للحصول على قائمة التسوق",
    proFeature: "🔒 ميزة احترافية",
    proUpsellSub: "قم بالترقية إلى الاحترافي للحصول على قائمة تسوق تلقائية وخطط 30 يوماً والمزيد.",
    upgradeProFull: "الترقية إلى الاحترافي — $5/شهر",
    reviewsTabTitle: "ما يقوله الناس",
    reviewsTabSub: "مراجعات حقيقية من المستخدمين.",
    leaveReview: "اترك مراجعة",
    profileTab: "الملف الشخصي",
    profileTabSub: "تفاصيل حسابك والاشتراك.",
    startOver: "ابدأ من جديد / خطة جديدة",
    subscription: "الاشتراك",
    building: "بناء خطتك لـ", personalized: " يوماً…",
    aboutTime: "حوالي 20-30 ثانية. سيتم حفظ خطتك تلقائياً.",
    savedBanner: "تم حفظ الخطة. سجل الدخول في أي وقت ببريدك الإلكتروني.",
    howDoing: "كيف أسير؟", modifyWorkout: "تعديل تمرين اليوم",
    lunchEat: "ماذا آكل في الغداء؟", missedWorkout: "فاتني تمرين",
    motivation: "حفزني", logProgress: "تسجيل التقدم",
    explainEx: "شرح تمرين", soreMuscle: "عندي ألم في العضلة",
    rateExp: "كيف خطتك؟", rateSub: "10 ثوان لتقييم تجربتك!",
    submitReview: "إرسال المراجعة", skip: "تخطي",
    levels: ["مبتدئ","متوسط","متقدم"],
    diets: ["بلا قيود","نباتي","نباتي صرف","كيتو","باليو","خالٍ من الغلوتين","غني بالبروتين","الصيام المتقطع"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"إنقاص الوزن",desc:"حرق الدهون وتحسين التحمل"},
      {id:"muscle_gain",icon:"💪",title:"بناء العضلات",desc:"بناء القوة والكتلة العضلية"},
      {id:"athletic",icon:"⚡",title:"الأداء الرياضي",desc:"السرعة والقوة والتدريب الخاص"},
      {id:"general",icon:"🌿",title:"الصحة العامة",desc:"التوازن والحركة والصحة العامة"},
      {id:"recomp",icon:"⚖️",title:"إعادة تشكيل الجسم",desc:"فقدان الدهون وبناء العضلات في آن واحد"},
    ],
    equipment: {
      "أوزان حرة":[{id:"dumbbells",icon:"🏋️",text:"دمبل"},{id:"barbells",icon:"🔩",text:"بار"},{id:"kettles",icon:"🫙",text:"كيتل بيل"},{id:"ez_bar",icon:"〰️",text:"بار EZ"},{id:"bands",icon:"🔁",text:"أربطة مقاومة"}],
      "آلات كارديو":[{id:"treadmill",icon:"🏃",text:"جهاز المشي"},{id:"bike",icon:"🚴",text:"دراجة ثابتة"},{id:"rower",icon:"🚣",text:"جهاز التجديف"},{id:"elliptic",icon:"🌀",text:"جهاز الإليبتيكال"},{id:"stairs",icon:"🪜",text:"جهاز السلالم"}],
      "آلات القوة":[{id:"cable",icon:"🔗",text:"آلة الكابل"},{id:"legpress",icon:"🦵",text:"آلة ضغط الساق"},{id:"latpull",icon:"⬇️",text:"آلة سحب اللاتس"},{id:"chestmach",icon:"📐",text:"آلة ضغط الصدر"},{id:"smith",icon:"🏗️",text:"آلة سميث"}],
      "وزن الجسم / أخرى":[{id:"pullupbar",icon:"🔲",text:"بار العقلة"},{id:"dipbars",icon:"🤸",text:"أعواد الدفع"},{id:"bench",icon:"🪑",text:"مقعد التمرين"},{id:"sqrack",icon:"🏗️",text:"رف القرفصاء"},{id:"mat",icon:"🟩",text:"حصيرة يوغا"},{id:"nobody",icon:"🏠",text:"بدون معدات"}],
    },
    pfeats: {
      basic: ["خطة وجبات 7 أيام","خطة تمرين 7 أيام","مدرب الذكاء الاصطناعي","مطالبات سريعة"],
      basicNo: ["خطط 30 يوماً","قائمة التسوق","أجيال غير محدودة"],
      pro: ["خطة وجبات 30 يوماً","خطة تمرين 30 يوماً","مدرب الذكاء الاصطناعي","مطالبات سريعة","خطط 30 يوماً","قائمة التسوق","أجيال غير محدودة"],
    },
  },
  hi: {
    appTagline: "AI फिटनेस",
    steps: ["ईमेल","स्थान","समीक्षाएं","प्रोफाइल","लक्ष्य","उपकरण","योजना"],
    verifyTitle: "पहले, अपना ईमेल सत्यापित करें।",
    verifySub: "हम एक 6-अंकीय कोड भेजेंगे।",
    emailPlaceholder: "आप@email.com",
    sendCode: "सत्यापन कोड भेजें →",
    sending: "भेजा जा रहा है…",
    checkInbox: "अपना इनबॉक्स जांचें",
    codeSentTo: "हमने 6-अंकीय कोड भेजा",
    enterBelow: "नीचे दर्ज करें।",
    emailVerified: "ईमेल सत्यापित!",
    verifiedSub: "सत्यापित! आपका डेटा लोड हो रहा है…",
    verifyBtn: "कोड सत्यापित करें →",
    verifying: "सत्यापन हो रहा है…",
    resendIn: "पुनः भेजें",
    resend: "कोड पुनः भेजें",
    changeEmail: "ईमेल बदलें",
    locationTitle: "आप कहाँ",
    locationEm: "हैं?",
    locationSub: "हम स्वचालित रूप से आपकी इकाइयाँ और भाषा सेट करेंगे।",
    country: "देश / क्षेत्र",
    language: "भाषा",
    reviewsTitle: "लोग क्या",
    reviewsEm: "कहते हैं।",
    reviewsSub: "FitPlan Pro उपयोगकर्ताओं की वास्तविक समीक्षाएं।",
    noReviews: "पहले बनें!",
    noReviewsSub: "अभी तक कोई समीक्षा नहीं — अपनी योजना बनाएं और पहली समीक्षा छोड़ें।",
    profileTitle: "हमें अपने बारे में",
    profileEm: "बताएं।",
    profileSub: "यह आपकी योजना के हर हिस्से को आकार देता है।",
    firstName: "पहला नाम",
    age: "उम्र",
    weight: "वज़न",
    height: "ऊंचाई",
    fitnessLevel: "फिटनेस स्तर",
    diet: "आहार प्राथमिकता",
    goalTitle: "आपका मुख्य",
    goalEm: "लक्ष्य क्या है?",
    goalSub: "अभी जो सबसे महत्वपूर्ण है उसे चुनें।",
    equipTitle: "आपके पास कौन से",
    equipEm: "उपकरण हैं?",
    equipSub: "सब कुछ चुनें जो उपलब्ध है।",
    planTitle: "अपनी",
    planEm: "योजना चुनें।",
    planSub: "दोनों में पूर्ण भोजन और कसरत योजना शामिल है।",
    basic: "बेसिक", pro: "प्रो", free: "मुफ्त", perMonth: "/माह",
    mostPopular: "सबसे लोकप्रिय",
    generateFree: "मुफ्त योजना बनाएं",
    startPro: "प्रो शुरू करें — $5/माह",
    back: "वापस", continue: "जारी रखें",
    myPlan: "मेरी योजना", aiCoach: "AI कोच", grocery: "किराना सूची", groceryLocked: "🔒 किराना",
    reviews: "समीक्षाएं", profile: "प्रोफाइल",
    yourPlan: "आपकी", dayPlan: "-दिन की योजना",
    goal: "लक्ष्य", level: "स्तर", equip: "उपकरण",
    workoutPlan: "कसरत योजना", mealPlan: "भोजन योजना",
    regenerate: "🔄 योजना पुनः बनाएं", regenerating: "पुनः बना रहे हैं…",
    freeLimit: "मुफ्त योजना — केवल 1 बार।",
    upgradePro: "असीमित पुनर्जनन, 30-दिन की योजनाओं के लिए प्रो में अपग्रेड करें।",
    upgradeBtn: "प्रो में अपग्रेड करें →",
    proActive: "प्रो — 30-दिन अनुकूली योजना",
    proActiveSub: "अद्यतन योजना के लिए कभी भी पुनः बनाएं।",
    coachTitle: "AI कोच",
    coachSub: "मुझे आपकी पूरी योजना पता है। कुछ भी पूछें।",
    coachPlaceholder: "अपने कोच से पूछें…",
    send: "भेजें",
    groceryTitle: "किराना सूची",
    grocerySub: "आपकी भोजन योजना से स्वचालित रूप से तैयार।",
    noGrocery: "किराना सूची के लिए अपनी योजना बनाएं",
    proFeature: "🔒 प्रो सुविधा",
    proUpsellSub: "स्वचालित किराना सूची, 30-दिन की योजनाओं के लिए प्रो में अपग्रेड करें।",
    upgradeProFull: "प्रो में अपग्रेड करें — $5/माह",
    reviewsTabTitle: "लोग क्या कहते हैं",
    reviewsTabSub: "वास्तविक उपयोगकर्ता समीक्षाएं।",
    leaveReview: "समीक्षा छोड़ें",
    profileTab: "प्रोफाइल",
    profileTabSub: "आपके खाते का विवरण और सदस्यता।",
    startOver: "फिर से शुरू / नई योजना",
    subscription: "सदस्यता",
    building: "आपकी", personalized: "-दिन की योजना बना रहे हैं…",
    aboutTime: "लगभग 20-30 सेकंड। आपकी योजना स्वचालित रूप से सहेजी जाएगी।",
    savedBanner: "योजना सहेजी गई। कभी भी अपने ईमेल से लॉगिन करें।",
    howDoing: "मैं कैसा कर रहा हूं?", modifyWorkout: "आज का वर्कआउट बदलें",
    lunchEat: "दोपहर में क्या खाएं?", missedWorkout: "मैं वर्कआउट चूक गया",
    motivation: "मुझे प्रेरित करें", logProgress: "प्रगति दर्ज करें",
    explainEx: "व्यायाम समझाएं", soreMuscle: "मेरी मांसपेशी में दर्द है",
    rateExp: "आपकी योजना कैसी है?", rateSub: "अपना अनुभव रेट करने के लिए 10 सेकंड!",
    submitReview: "समीक्षा सबमिट करें", skip: "छोड़ें",
    levels: ["शुरुआती","मध्यवर्ती","उन्नत"],
    diets: ["कोई प्रतिबंध नहीं","शाकाहारी","वीगन","कीटो","पैलियो","ग्लूटेन-मुक्त","उच्च प्रोटीन","इंटरमिटेंट फास्टिंग"],
    goals: [
      {id:"weight_loss",icon:"🔥",title:"वजन घटाना",desc:"चर्बी जलाना, सहनशक्ति बढ़ाना"},
      {id:"muscle_gain",icon:"💪",title:"मांसपेशी बढ़ाना",desc:"ताकत और मांसपेशी द्रव्यमान बनाना"},
      {id:"athletic",icon:"⚡",title:"एथलेटिक प्रदर्शन",desc:"गति, शक्ति, खेल-विशिष्ट प्रशिक्षण"},
      {id:"general",icon:"🌿",title:"सामान्य स्वास्थ्य",desc:"संतुलन, गतिशीलता, समग्र स्वास्थ्य"},
      {id:"recomp",icon:"⚖️",title:"शरीर पुनर्संरचना",desc:"एक साथ चर्बी घटाना और मांसपेशी बढ़ाना"},
    ],
    equipment: {
      "मुक्त भार":[{id:"dumbbells",icon:"🏋️",text:"डंबल"},{id:"barbells",icon:"🔩",text:"बारबेल"},{id:"kettles",icon:"🫙",text:"केटलबेल"},{id:"ez_bar",icon:"〰️",text:"EZ बार"},{id:"bands",icon:"🔁",text:"रेजिस्टेंस बैंड"}],
      "कार्डियो मशीनें":[{id:"treadmill",icon:"🏃",text:"ट्रेडमिल"},{id:"bike",icon:"🚴",text:"स्टेशनरी बाइक"},{id:"rower",icon:"🚣",text:"रोइंग मशीन"},{id:"elliptic",icon:"🌀",text:"एलिप्टिकल"},{id:"stairs",icon:"🪜",text:"स्टेयरमास्टर"}],
      "शक्ति मशीनें":[{id:"cable",icon:"🔗",text:"केबल मशीन"},{id:"legpress",icon:"🦵",text:"लेग प्रेस"},{id:"latpull",icon:"⬇️",text:"लैट पुलडाउन"},{id:"chestmach",icon:"📐",text:"चेस्ट प्रेस"},{id:"smith",icon:"🏗️",text:"स्मिथ मशीन"}],
      "बॉडीवेट / अन्य":[{id:"pullupbar",icon:"🔲",text:"पुल-अप बार"},{id:"dipbars",icon:"🤸",text:"डिप बार"},{id:"bench",icon:"🪑",text:"बेंच"},{id:"sqrack",icon:"🏗️",text:"स्क्वाट रैक"},{id:"mat",icon:"🟩",text:"योगा मैट"},{id:"nobody",icon:"🏠",text:"कोई उपकरण नहीं"}],
    },
    pfeats: {
      basic: ["7-दिन भोजन योजना","7-दिन कसरत योजना","AI कोच","त्वरित प्रॉम्प्ट"],
      basicNo: ["30-दिन योजनाएं","किराना सूची","असीमित पुनर्जनन"],
      pro: ["30-दिन भोजन योजना","30-दिन कसरत योजना","AI कोच","त्वरित प्रॉम्प्ट","30-दिन योजनाएं","किराना सूची","असीमित पुनर्जनन"],
    },
  }
};

// Metric countries (use kg/cm)
const METRIC_COUNTRIES = ["Germany","France","Spain","Italy","Portugal","Netherlands","Belgium","Sweden","Norway","Denmark","Finland","Austria","Switzerland","Poland","Czech Republic","Hungary","Romania","Greece","Ukraine","Brazil","Mexico","Argentina","Colombia","Chile","Japan","South Korea","China","India","Australia","New Zealand","Russia","Turkey","South Africa","Egypt","Nigeria","Kenya","Morocco","Saudi Arabia","UAE","Israel","Singapore","Malaysia","Thailand","Vietnam","Indonesia","Philippines"];

const LANGUAGES = [
  {code:"en",name:"English",flag:"🇺🇸"},
  {code:"es",name:"Español",flag:"🇪🇸"},
  {code:"de",name:"Deutsch",flag:"🇩🇪"},
  {code:"fr",name:"Français",flag:"🇫🇷"},
  {code:"pt",name:"Português",flag:"🇧🇷"},
  {code:"it",name:"Italiano",flag:"🇮🇹"},
  {code:"ja",name:"日本語",flag:"🇯🇵"},
  {code:"ko",name:"한국어",flag:"🇰🇷"},
  {code:"zh",name:"中文",flag:"🇨🇳"},
  {code:"ar",name:"العربية",flag:"🇸🇦"},
  {code:"hi",name:"हिन्दी",flag:"🇮🇳"},
  {code:"ru",name:"Русский",flag:"🇷🇺"},
  {code:"uk",name:"Українська",flag:"🇺🇦"},
  {code:"pl",name:"Polski",flag:"🇵🇱"},
  {code:"nl",name:"Nederlands",flag:"🇳🇱"},
  {code:"sv",name:"Svenska",flag:"🇸🇪"},
  {code:"tr",name:"Türkçe",flag:"🇹🇷"},
  {code:"id",name:"Bahasa Indonesia",flag:"🇮🇩"},
  {code:"vi",name:"Tiếng Việt",flag:"🇻🇳"},
  {code:"th",name:"ภาษาไทย",flag:"🇹🇭"},
  {code:"ro",name:"Română",flag:"🇷🇴"},
  {code:"el",name:"Ελληνικά",flag:"🇬🇷"},
  {code:"he",name:"עברית",flag:"🇮🇱"},
  {code:"cs",name:"Čeština",flag:"🇨🇿"},
  {code:"hu",name:"Magyar",flag:"🇭🇺"},
  {code:"ms",name:"Bahasa Melayu",flag:"🇲🇾"},
  {code:"tl",name:"Filipino",flag:"🇵🇭"},
  {code:"sw",name:"Kiswahili",flag:"🇰🇪"},
];

const COUNTRIES = ["United States","United Kingdom","Canada","Australia","Germany","France","Spain","Italy","Portugal","Netherlands","Belgium","Sweden","Norway","Denmark","Finland","Austria","Switzerland","Poland","Czech Republic","Hungary","Romania","Greece","Ukraine","Brazil","Mexico","Argentina","Colombia","Chile","Japan","South Korea","China","India","New Zealand","Russia","Turkey","South Africa","Egypt","Nigeria","Kenya","Morocco","Saudi Arabia","UAE","Israel","Singapore","Malaysia","Thailand","Vietnam","Indonesia","Philippines","Other"];

// Smart height formatting
function formatHeight(val, isMetric) {
  const digits = val.replace(/\D/g,"");
  if(!digits) return "";
  if(isMetric) {
    if(digits.length>=3) return digits+"cm";
    return digits;
  } else {
    if(digits.length===3) return digits[0]+"ft "+digits.slice(1)+"in";
    if(digits.length===2) return digits[0]+"ft "+digits[1]+"in";
    return digits+"ft";
  }
}

// Smart weight formatting
function formatWeight(val, isMetric) {
  const digits = val.replace(/\D/g,"");
  if(!digits) return "";
  return digits + (isMetric ? "kg" : "lb");
}

let sb = null;
async function getSupabase() {
  if(sb) return sb;
  if(!window.supabase){
    await new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
      s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
  }
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  return sb;
}
async function dbUpsertUser({email,name,age,weight,height,level,diet,goal,equip,plan,country,language}){
  const client=await getSupabase();
  const {data,error}=await client.from("users").upsert(
    {email,name,age,weight,height,level,diet,goal,equipment:equip.join(","),plan,country,language,updated_at:new Date().toISOString()},
    {onConflict:"email"}
  ).select().single();
  if(error) console.error("Supabase upsert error:",error);
  return data;
}
async function dbSavePlan({email,workout_plan,meal_plan,grocery_list}){
  const client=await getSupabase();
  const {error}=await client.from("users").update({workout_plan,meal_plan,grocery_list,plan_generated_at:new Date().toISOString()}).eq("email",email);
  if(error) console.error("Supabase save plan error:",error);
}
async function dbLoadUser(email){
  const client=await getSupabase();
  const {data,error}=await client.from("users").select("*").eq("email",email).single();
  if(error) return null;
  return data;
}
async function dbSaveReview({email,name,rating,review_text,goal}){
  const client=await getSupabase();
  await client.from("reviews").insert({email,name,rating,review_text,goal,created_at:new Date().toISOString()});
}
async function dbLoadReviews(){
  const client=await getSupabase();
  const {data,error}=await client.from("reviews").select("*").order("created_at",{ascending:false}).limit(20);
  if(error) return [];
  return data||[];
}

async function dbUpdatePoints({email, points, rank, streak, last_log_date, daily_points_today, daily_points_date}){
  const client = await getSupabase();
  const {error} = await client.from("users").update({
    points, rank, streak, last_log_date, daily_points_today, daily_points_date
  }).eq("email", email);
  if(error) console.error("Points update error:", error);
}

async function dbMarkExpired(email){
  const client = await getSupabase();
  await client.from("users").update({
    plan_expired: true,
    expired_at: new Date().toISOString(),
    upgrade_prompted: true
  }).eq("email", email);
}

async function dbLoadLeaderboard(){
  const client = await getSupabase();
  const {data, error} = await client.from("users")
    .select("name, points, rank, streak, plan")
    .order("points", {ascending: false})
    .limit(200);
  if(error) return [];
  return data || [];
}

async function dbLogProgress({email, entry, type}){
  const client=await getSupabase();
  const {error}=await client.from("progress_logs").insert({
    email, entry, type, logged_at: new Date().toISOString()
  });
  if(error) console.error("Progress log error:",error);
}

async function dbLoadProgress(email){
  const client=await getSupabase();
  const {data,error}=await client.from("progress_logs").select("*").eq("email",email).order("logged_at",{ascending:false}).limit(50);
  if(error) return [];
  return data||[];
}

// ── SOCIAL DB FUNCTIONS ──
async function dbFollowUser(followerEmail, followingEmail){
  const client = await getSupabase();
  await client.from("follows").insert({follower_email: followerEmail, following_email: followingEmail});
}

async function dbUnfollowUser(followerEmail, followingEmail){
  const client = await getSupabase();
  await client.from("follows").delete().eq("follower_email", followerEmail).eq("following_email", followingEmail);
}

async function dbGetFollowing(email){
  const client = await getSupabase();
  const {data} = await client.from("follows").select("following_email").eq("follower_email", email);
  return (data||[]).map(r=>r.following_email);
}

async function dbGetFollowers(email){
  const client = await getSupabase();
  const {data} = await client.from("follows").select("follower_email").eq("following_email", email);
  return (data||[]).map(r=>r.follower_email);
}

async function dbSendMessage(senderEmail, receiverEmail, content){
  const client = await getSupabase();
  await client.from("messages").insert({sender_email: senderEmail, receiver_email: receiverEmail, content, read: false});
}

async function dbGetMessages(email){
  const client = await getSupabase();
  const {data} = await client.from("messages")
    .select("*")
    .or(`sender_email.eq.${email},receiver_email.eq.${email}`)
    .order("created_at", {ascending: true});
  return data||[];
}

async function dbMarkMessagesRead(senderEmail, receiverEmail){
  const client = await getSupabase();
  await client.from("messages").update({read: true})
    .eq("sender_email", senderEmail).eq("receiver_email", receiverEmail);
}

async function dbGetUnreadCount(email){
  const client = await getSupabase();
  const {count} = await client.from("messages").select("*", {count:"exact",head:true})
    .eq("receiver_email", email).eq("read", false);
  return count||0;
}

async function dbSearchUsers(query){
  const client = await getSupabase();
  const {data} = await client.from("users")
    .select("name, email, rank, streak, plan, points")
    .ilike("name", `%${query}%`)
    .limit(20);
  return data||[];
}

async function dbGetUsersByEmails(emails){
  if(!emails.length) return [];
  const client = await getSupabase();
  const {data} = await client.from("users")
    .select("name, email, rank, streak, plan, points")
    .in("email", emails);
  return data||[];
}

async function dbSaveFoodScan({email, foodDescription, calories, proteinG, carbsG, fatG, vitamins, scanResult, pointsAwarded, onPlan}){
  const client = await getSupabase();
  const {data, error} = await client.from("food_scans")
    .insert({email, food_description: foodDescription, calories, protein_g: proteinG, carbs_g: carbsG, fat_g: fatG, vitamins, scan_result: scanResult, points_awarded: pointsAwarded, on_plan: onPlan, created_at: new Date().toISOString()})
    .select().single();
  if(error) console.error("Food scan save error:", error);
  return data;
}

async function dbGetFoodScans(email){
  const client = await getSupabase();
  const {data} = await client.from("food_scans")
    .select("*").eq("email", email)
    .order("created_at", {ascending: false})
    .limit(50);
  return data||[];
}

async function dbSaveCoachMemory(email, memory){
  const client = await getSupabase();
  await client.from("users").update({coach_memory: memory, last_session_summary: new Date().toISOString()}).eq("email", email);
}

async function dbLoadCoachMemory(email){
  const client = await getSupabase();
  const {data} = await client.from("users").select("coach_memory").eq("email", email).single();
  return data?.coach_memory || "";
}

let ejsReady=false;
async function sendVerificationEmail(toEmail,code){
  if(!ejsReady){
    await new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
    window.emailjs.init({publicKey:EMAILJS_KEY});
    ejsReady=true;
  }
  await window.emailjs.send(EMAILJS_SERVICE,EMAILJS_TEMPLATE,{to_email:toEmail,code,app_name:"FitPlan Pro"});
}

async function askClaude(userMessage,systemPrompt,flags={}){
  const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:userMessage}],system:systemPrompt,...flags})});
  const data=await res.json();
  if(data.error) throw new Error(data.error.message);
  return (data.content||[]).map(b=>b.text||"").join("");
}
async function askClaudeChat(messages,systemPrompt,flags={}){
  const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages,system:systemPrompt,...flags})});
  const data=await res.json();
  if(data.error) throw new Error(data.error.message);
  return (data.content||[]).map(b=>b.text||"").join("");
}

function makeCode(){return String(Math.floor(100000+Math.random()*900000));}

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
.progress-wrap{position:relative;z-index:10;padding:20px 40px 0;flex-shrink:0;}
.steps-row{display:flex;align-items:center;max-width:600px;margin:0 auto;}
.step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--syne);font-size:10px;font-weight:700;border:1.5px solid var(--border2);background:var(--bg2);color:var(--muted);flex-shrink:0;transition:all .3s;}
.step-dot.done{background:var(--green);border-color:var(--green);color:#000;}
.step-dot.active{background:var(--bg3);border-color:var(--green);color:var(--green);box-shadow:0 0 12px rgba(0,229,160,.2);}
.step-line{flex:1;height:1.5px;background:var(--border2);transition:background .3s;min-width:4px;}
.step-line.done{background:var(--green);}
.steps-labels{display:flex;justify-content:space-between;max-width:600px;margin:6px auto 0;}
.steps-labels span{font-size:8px;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;font-weight:600;}
.steps-labels span.active{color:var(--green);}
.page-scroll{flex:1;overflow-y:auto;position:relative;z-index:5;}
.page-inner{max-width:600px;margin:0 auto;padding:32px 24px 60px;animation:fadeUp .35s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
.page-heading{font-family:var(--syne);font-size:28px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:8px;}
.page-heading em{font-style:normal;color:var(--green);}
.page-sub{font-size:14px;color:var(--muted2);line-height:1.6;margin-bottom:24px;}
.field{margin-bottom:14px;}
.field-label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:6px;}
.finput,.fselect,.ftextarea{width:100%;padding:12px 14px;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;font-family:var(--inter);font-size:15px;color:var(--text);outline:none;transition:all .2s;}
.finput:focus,.fselect:focus,.ftextarea:focus{border-color:var(--green);background:var(--bg3);box-shadow:0 0 0 3px rgba(0,229,160,.1);}
.finput::placeholder,.ftextarea::placeholder{color:var(--muted);}
.ftextarea{resize:vertical;min-height:90px;}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:14px;}

.finput-unit{position:relative;}
.finput-unit input{padding-right:52px;}
.unit-badge{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:700;color:var(--green);pointer-events:none;font-family:var(--syne);}
.smart-hint{font-size:11px;color:var(--muted);margin-top:4px;}




.lang-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-bottom:8px;}
.lang-option{padding:12px;border-radius:10px;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .2s;text-align:center;font-size:13px;font-weight:500;}
.lang-option:hover{border-color:rgba(0,229,160,.3);background:var(--bg3);}
.lang-option.sel{border-color:var(--green);background:var(--green-bg2);color:var(--green);}
.lang-flag{font-size:22px;display:block;margin-bottom:4px;}
.verify-box{background:var(--bg2);border:1px solid var(--border2);border-radius:16px;padding:28px;text-align:center;}
.verify-icon{font-size:40px;margin-bottom:12px;}
.verify-title{font-family:var(--syne);font-size:20px;font-weight:800;margin-bottom:7px;}
.verify-sub{font-size:13px;color:var(--muted2);line-height:1.6;margin-bottom:24px;}
.verify-email-shown{color:var(--green);font-weight:600;}
.code-row{display:flex;gap:9px;justify-content:center;margin-bottom:16px;}
.code-input{width:48px;height:56px;text-align:center;font-family:var(--syne);font-size:22px;font-weight:800;background:var(--bg3);border:1.5px solid var(--border2);border-radius:11px;color:var(--text);outline:none;transition:all .2s;}
.code-input:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(0,229,160,.1);}
.resend-btn{background:none;border:none;color:var(--muted2);font-size:13px;cursor:pointer;text-decoration:underline;font-family:var(--inter);padding:0;}
.resend-btn:hover{color:var(--green);}
.resend-btn:disabled{opacity:.4;cursor:not-allowed;text-decoration:none;}
.goal-grid{display:flex;flex-direction:column;gap:9px;margin-bottom:20px;}
.goal-chip{padding:13px 15px;border-radius:12px;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px;}
.goal-chip:hover{border-color:rgba(0,229,160,.3);background:var(--bg3);}
.goal-chip.sel{border-color:var(--green);background:var(--green-bg2);}
.gi{font-size:22px;flex-shrink:0;}
.gt{font-family:var(--syne);font-size:14px;font-weight:700;}
.gd{font-size:11.5px;color:var(--muted2);margin-top:1px;}
.goal-chip.sel .gt{color:var(--green);}
.grad{margin-left:auto;width:19px;height:19px;border-radius:50%;border:2px solid var(--border2);flex-shrink:0;transition:all .2s;}
.goal-chip.sel .grad{border-color:var(--green);background:var(--green);}
.eq-sec{margin-bottom:18px;}
.eq-title{font-family:var(--syne);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);padding-bottom:7px;margin-bottom:9px;}
.chip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;}
.chip{padding:11px;border-radius:9px;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px;}
.chip:hover{border-color:rgba(0,229,160,.3);background:var(--bg3);}
.chip.sel{border-color:var(--green);background:var(--green-bg2);}
.cicon{font-size:16px;flex-shrink:0;}
.ctext{font-size:12px;font-weight:500;line-height:1.3;}
.chip.sel .ctext{color:var(--green);}
.pricing-wrap{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;}
.pcard{padding:18px 15px;border-radius:13px;border:1.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
.pcard:hover{border-color:rgba(0,229,160,.25);}
.pcard.sel{border-color:var(--green);background:var(--green-bg);}
.pcard.featured{border-color:rgba(245,197,66,.35);}
.pcard.featured.sel{background:rgba(245,197,66,.05);border-color:var(--gold);}
.pbadge{position:absolute;top:0;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;font-family:var(--syne);font-size:9px;font-weight:800;padding:3px 10px;border-radius:0 0 8px 8px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;}
.pprice{font-family:var(--syne);font-size:22px;font-weight:800;margin-bottom:1px;}
.pprice span{font-size:11px;font-weight:400;color:var(--muted2);}
.pname{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:11px;}
.pfeats{list-style:none;display:flex;flex-direction:column;gap:5px;}
.pfeats li{font-size:11px;color:var(--muted2);display:flex;align-items:flex-start;gap:5px;line-height:1.4;}
.pfeats li .ck{flex-shrink:0;color:var(--green);font-weight:700;}
.pfeats li.no{opacity:.4;}
.pfeats li.no .ck{color:var(--muted);}
.pcard.featured .pprice{color:var(--gold);}
.summary{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:13px;margin-bottom:15px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.slabel{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:600;margin-bottom:3px;}
.sval{font-family:var(--syne);font-size:12px;font-weight:700;}
.sticky-bar{position:sticky;bottom:0;left:0;right:0;background:rgba(8,12,16,0.97);backdrop-filter:blur(16px);border-top:1px solid var(--border);padding:12px 24px;margin:0 -24px -60px;z-index:50;}
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
.lbar-wrap{margin:14px 0;}
.lbar-lbl{font-size:13px;color:var(--muted2);margin-bottom:7px;display:flex;justify-content:space-between;}
.lbar{height:3px;background:var(--bg3);border-radius:4px;overflow:hidden;}
.lfill{height:100%;background:linear-gradient(90deg,var(--green2),var(--green));border-radius:4px;transition:width .5s ease;}
.rtabs{display:flex;gap:4px;margin-bottom:14px;background:var(--bg2);border-radius:10px;padding:4px;border:1px solid var(--border);overflow-x:auto;}
.rtab{flex-shrink:0;padding:8px 13px;border-radius:7px;border:none;background:transparent;font-family:var(--syne);font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap;}
.rtab.active{background:var(--bg3);color:var(--green);}
.rbody{background:var(--bg2);border:1px solid var(--border);border-radius:13px;padding:20px;white-space:pre-wrap;font-size:13px;line-height:1.9;color:var(--muted2);}
.regen-btn{margin-top:11px;padding:9px 16px;border-radius:9px;border:1px solid var(--green);background:transparent;color:var(--green);font-family:var(--syne);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.regen-btn:hover{background:var(--green-bg2);}
.regen-btn:disabled{opacity:.4;cursor:not-allowed;}
.free-limit{background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.2);border-radius:10px;padding:11px 14px;font-size:13px;color:var(--muted2);margin-top:11px;text-align:center;}
.free-limit strong{color:var(--red);}
.chat-msgs{overflow-y:auto;display:flex;flex-direction:column;gap:11px;padding-bottom:8px;max-height:calc(100vh - 340px);min-height:140px;}
.mrow{display:flex;gap:9px;align-items:flex-end;}
.mrow.user{flex-direction:row-reverse;}
.mav{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;}
.mav.bot{background:var(--green-bg2);}
.mav.user{background:var(--bg3);border:1px solid var(--border2);font-size:9px;font-weight:700;color:var(--green);}
.mbub{max-width:78%;padding:10px 13px;border-radius:13px;font-size:13px;line-height:1.65;}
.mbub.bot{background:var(--bg2);border:1px solid var(--border);border-bottom-left-radius:3px;}
.mbub.user{background:var(--bg3);border:1px solid var(--border2);border-bottom-right-radius:3px;color:var(--text);}
.cinrow{display:flex;gap:9px;padding-top:11px;border-top:1px solid var(--border);margin-top:11px;}
.cin{flex:1;padding:10px 13px;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;font-family:var(--inter);font-size:14px;color:var(--text);outline:none;transition:all .2s;}
.cin:focus{border-color:var(--green);}
.cin::placeholder{color:var(--muted);}
.csend{padding:10px 14px;background:var(--green);color:#000;border:none;border-radius:10px;font-family:var(--syne);font-size:13px;font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap;}
.csend:hover:not(:disabled){background:var(--green2);}
.csend:disabled{opacity:.4;cursor:not-allowed;}
.coach-prompts{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:11px;}
.coach-prompt{padding:6px 11px;border-radius:100px;border:1px solid var(--border2);background:var(--bg2);font-size:11.5px;color:var(--muted2);cursor:pointer;transition:all .2s;white-space:nowrap;}
.coach-prompt:hover{border-color:var(--green);color:var(--green);background:var(--green-bg);}
.spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.1);border-top-color:var(--green);border-radius:50%;animation:rot .7s linear infinite;display:inline-block;vertical-align:middle;}
@keyframes rot{to{transform:rotate(360deg);}}
.msg-ok{background:rgba(0,229,160,.1);border:1px solid rgba(0,229,160,.25);color:var(--green);border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:12px;text-align:center;}
.msg-err{background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.3);color:var(--red);border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:12px;text-align:center;}
.dnav{position:relative;z-index:10;border-bottom:1px solid var(--border);background:rgba(8,12,16,.8);backdrop-filter:blur(12px);display:flex;padding:0 16px;flex-shrink:0;overflow-x:auto;}
.dtab{padding:12px 13px;font-family:var(--syne);font-size:12px;font-weight:600;color:var(--muted);border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;}
.dtab:hover{color:var(--text);}
.dtab.active{color:var(--green);border-bottom-color:var(--green);}
.pro-badge{margin-left:6px;background:rgba(245,197,66,.15);color:var(--gold);padding:2px 7px;border-radius:100px;font-size:10px;font-weight:700;}
.free-badge{margin-left:6px;background:rgba(255,255,255,.08);color:var(--muted2);padding:2px 7px;border-radius:100px;font-size:10px;font-weight:700;}
.profile-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);}
.profile-row:last-child{border-bottom:none;}
.saved-banner{background:rgba(0,229,160,.08);border:1px solid rgba(0,229,160,.2);border-radius:10px;padding:11px 14px;display:flex;align-items:center;gap:10px;margin-bottom:14px;font-size:13px;color:var(--muted2);}
.saved-banner strong{color:var(--green);}
.stars-row{display:flex;gap:6px;margin-bottom:14px;justify-content:center;}
.star{font-size:30px;cursor:pointer;transition:transform .15s;filter:grayscale(1);opacity:.4;}
.star:hover,.star.lit{filter:none;opacity:1;transform:scale(1.15);}
.review-card{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:14px;margin-bottom:11px;}
.review-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;}
.review-name{font-family:var(--syne);font-size:13px;font-weight:700;}
.review-stars{font-size:12px;}
.review-goal{font-size:11px;color:var(--green);font-weight:600;margin-bottom:5px;}
.review-text{font-size:13px;color:var(--muted2);line-height:1.6;}
.review-date{font-size:11px;color:var(--muted);margin-top:5px;}
.avg-rating{text-align:center;padding:18px;background:var(--bg2);border:1px solid var(--border);border-radius:13px;margin-bottom:18px;}
.avg-number{font-family:var(--syne);font-size:44px;font-weight:800;color:var(--gold);}
.avg-stars{font-size:18px;margin-bottom:4px;}
.avg-count{font-size:13px;color:var(--muted2);}
.pro-upsell{background:linear-gradient(135deg,rgba(245,197,66,.1),rgba(245,197,66,.05));border:1px solid rgba(245,197,66,.25);border-radius:13px;padding:18px;margin-bottom:18px;text-align:center;}
.pro-upsell-title{font-family:var(--syne);font-size:17px;font-weight:800;color:var(--gold);margin-bottom:7px;}
.pro-upsell-sub{font-size:13px;color:var(--muted2);margin-bottom:14px;line-height:1.6;}
.progress-log{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:13px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;}
.progress-log-icon{font-size:20px;flex-shrink:0;margin-top:1px;}
.progress-log-body{flex:1;}
.progress-log-entry{font-size:13px;color:var(--text);line-height:1.5;margin-bottom:4px;}
.progress-log-meta{font-size:11px;color:var(--muted);}
.progress-type{display:inline-block;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;margin-right:6px;}
.progress-type.workout{background:var(--green-bg2);color:var(--green);}
.progress-type.cardio{background:rgba(0,180,255,0.15);color:#00b4ff;}
.progress-type.weight{background:rgba(245,197,66,0.15);color:var(--gold);}
.saved-flash{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--green);color:#000;padding:10px 20px;border-radius:100px;font-family:var(--syne);font-size:13px;font-weight:700;z-index:100;animation:fadeUp .3s ease;}
.rank-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:100px;font-size:11px;font-weight:700;font-family:var(--syne);}
.streak-badge{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:700;color:#ff6b35;}
.pro-pill{background:rgba(245,197,66,.15);color:var(--gold);padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;font-family:var(--syne);}
.leader-row{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:11px;background:var(--bg2);border:1px solid var(--border);margin-bottom:8px;}
.leader-pos{font-family:var(--syne);font-size:13px;font-weight:800;color:var(--muted);width:28px;flex-shrink:0;}
.leader-pos.top3{color:var(--gold);}
.leader-name{font-family:var(--syne);font-size:13px;font-weight:700;flex:1;}
.leader-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.leader-pts{font-size:12px;color:var(--muted2);}
.rank-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}
.rank-tab{padding:6px 12px;border-radius:100px;border:1px solid var(--border2);background:var(--bg2);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:var(--syne);}
.rank-tab:hover{border-color:rgba(0,229,160,.3);}
.rank-tab.active{border-color:var(--green);background:var(--green-bg2);color:var(--green);}
.points-bar{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;}
.points-track{height:6px;background:var(--bg3);border-radius:4px;overflow:hidden;margin-top:8px;}
.points-fill{height:100%;border-radius:4px;transition:width .6s ease;}
.expired-overlay{position:fixed;inset:0;background:rgba(8,12,16,.97);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.expired-card{background:var(--bg2);border:1px solid rgba(245,197,66,.3);border-radius:20px;padding:36px;max-width:440px;width:100%;text-align:center;}
/* Food scan styles */
.macro-bar-wrap{margin:3px 0;}
.macro-label{font-size:10px;color:var(--muted);display:flex;justify-content:space-between;margin-bottom:2px;}
.macro-bar{height:4px;background:var(--bg3);border-radius:4px;overflow:hidden;}
.macro-fill{height:100%;border-radius:4px;}
.macro-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;background:var(--bg3);border-radius:10px;padding:10px;margin:6px 0;}
.macro-cell{text-align:center;}
.macro-cell-val{font-family:var(--syne);font-size:13px;font-weight:800;}
.macro-cell-label{font-size:9px;color:var(--muted);margin-top:1px;text-transform:uppercase;letter-spacing:.06em;}
.daily-totals{background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.2);border-radius:10px;padding:10px 12px;margin:8px 0;}
.scan-result-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-top:12px;}
.scan-food-item{display:inline-block;background:var(--bg3);border-radius:100px;padding:3px 10px;font-size:11px;margin:2px;color:#f0f4f8;}
.on-plan-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;}
.on-plan-badge.yes{background:rgba(0,229,160,0.15);color:var(--green);}
.on-plan-badge.no{background:rgba(255,77,109,0.12);color:var(--red);}
.scan-history-item{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:12px;margin-bottom:8px;}
.plan-content-wrap{position:relative;}
.macro-inline{font-size:11px;color:var(--muted2);background:var(--bg3);border-radius:6px;padding:3px 8px;margin-top:3px;display:inline-block;}
/* Food scan styles */
.macro-bar-wrap{margin:3px 0 8px;}
.macro-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;}
.macro-label{font-size:10px;font-weight:700;color:var(--muted);width:52px;flex-shrink:0;text-transform:uppercase;letter-spacing:.05em;}
.macro-track{flex:1;height:6px;background:var(--bg3);border-radius:4px;overflow:hidden;}
.macro-fill{height:100%;border-radius:4px;transition:width .5s ease;}
.macro-val{font-size:11px;font-weight:700;width:40px;text-align:right;flex-shrink:0;}
.macro-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:100px;font-size:11px;font-weight:700;margin:2px;}
.scan-result-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-top:14px;}
.scan-food-item{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--border);}
.scan-food-item:last-child{border-bottom:none;}
.scan-food-name{font-size:13px;font-weight:600;color:#f0f4f8;}
.scan-food-portion{font-size:11px;color:var(--muted2);margin-top:2px;}
.scan-total{background:var(--bg3);border-radius:10px;padding:12px;margin-top:12px;}
.on-plan-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;margin-bottom:10px;}
.scan-history-item{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:12px;margin-bottom:9px;}
.upload-zone{background:var(--bg3);border:2px dashed var(--border2);border-radius:12px;padding:28px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:12px;}
.upload-zone:hover{border-color:var(--green);background:var(--green-bg);}
.upload-zone.has-image{border-color:var(--green);background:var(--green-bg);}
/* Social styles */
.social-tabs{display:flex;gap:6px;margin-bottom:16px;background:var(--bg2);border-radius:10px;padding:4px;border:1px solid var(--border);}
.social-tab{flex:1;padding:8px;border-radius:7px;border:none;background:transparent;font-family:var(--syne);font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap;}
.social-tab.active{background:var(--bg3);color:var(--green);}
.user-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:13px;display:flex;align-items:center;gap:11px;margin-bottom:9px;}
.user-card-avatar{width:40px;height:40px;border-radius:50%;background:var(--bg3);border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.user-card-info{flex:1;}
.user-card-name{font-family:var(--syne);font-size:13px;font-weight:700;color:#f0f4f8;}
.user-card-meta{font-size:11px;color:var(--muted2);margin-top:2px;}
.follow-btn{padding:6px 14px;border-radius:100px;border:1.5px solid var(--green);background:transparent;color:var(--green);font-size:11px;font-weight:700;cursor:pointer;font-family:var(--syne);transition:all .2s;white-space:nowrap;}
.follow-btn:hover{background:var(--green-bg2);}
.follow-btn.following{background:var(--green-bg2);color:var(--green);}
.msg-btn{padding:6px 12px;border-radius:100px;border:1px solid var(--border2);background:transparent;color:var(--muted2);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--inter);transition:all .2s;white-space:nowrap;}
.msg-btn:hover{border-color:var(--green);color:var(--green);}
.convo-item{display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:11px;background:var(--bg2);border:1px solid var(--border);margin-bottom:8px;cursor:pointer;transition:all .2s;}
.convo-item:hover{border-color:rgba(0,229,160,.3);}
.convo-item.active{border-color:var(--green);background:var(--green-bg);}
.unread-dot{width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0;}
.msg-area{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px;}
.msg-mine{align-self:flex-end;background:var(--bg3);border:1px solid var(--border2);padding:8px 12px;border-radius:12px;border-bottom-right-radius:3px;font-size:13px;color:#f0f4f8;max-width:75%;}
.msg-theirs{align-self:flex-start;background:#131920;border:1px solid var(--border);padding:8px 12px;border-radius:12px;border-bottom-left-radius:3px;font-size:13px;color:#9aabb8;max-width:75%;}
.msg-time{font-size:10px;color:var(--muted);margin-top:2px;}
.photo-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;}
.photo-placeholder{background:var(--bg3);border:2px dashed var(--border2);border-radius:10px;height:120px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;margin-bottom:10px;color:var(--muted);}
.unread-badge{background:var(--green);color:#000;font-size:9px;font-weight:800;padding:1px 5px;border-radius:100px;margin-left:4px;font-family:var(--syne);}
.trust-bar{display:flex;gap:0;border-top:1px solid var(--border);padding:14px 0 0;margin-top:16px;flex-wrap:wrap;justify-content:center;gap:16px;}
.trust-item{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted2);}
.trust-item span{font-size:14px;}
@media(max-width:600px){
  .topbar,.progress-wrap{padding-left:16px;padding-right:16px;}
  .pricing-wrap,.frow,.frow3{grid-template-columns:1fr;}
}
`;

function SocialTab({email,profile,plan,following,followers,friendProfiles,searchQuery,setSearchQuery,searchResults,searching,searchUsers,toggleFollow,activeConvo,setActiveConvo,openConvo,allMessages,newMsg,setNewMsg,sendMessage,sendingMsg,getConvoMessages,getConvoPartners,userRank}){
  const [socialView,setSocialView]=useState("friends");
  const maxFollows = plan==="pro" ? 200 : 100;
  const convoPartners = getConvoPartners();

  return(<>
    <div className="page-heading" style={{marginBottom:4}}>👥 <em>Social</em></div>
    <p className="page-sub" style={{marginBottom:12}}>
      Following {following.length}/{maxFollows} · {followers.length} followers
      {plan!=="pro"&&<span style={{fontSize:11,color:"var(--gold)",marginLeft:8}}>Pro = 200 follows</span>}
    </p>
    <div className="social-tabs">
      {[["friends","Friends"],["search","Find People"],["messages","Messages"]].map(([v,l])=>(
        <button key={v} className={["social-tab",socialView===v?"active":""].filter(Boolean).join(" ")} onClick={()=>setSocialView(v)}>{l}</button>
      ))}
    </div>

    {socialView==="friends"&&<>
      {friendProfiles.length===0?(
        <div style={{textAlign:"center",padding:"30px 20px",color:"var(--muted)"}}>
          <div style={{fontSize:32,marginBottom:8}}>👥</div>
          <div style={{fontFamily:"var(--syne)",fontSize:14,fontWeight:700,marginBottom:6}}>No friends yet</div>
          <div style={{fontSize:13}}>Search for people to follow!</div>
        </div>
      ):friendProfiles.map((u,i)=>{
        const rank = RANKS.find(r=>r.name===u.rank)||RANKS[0];
        return(
          <div key={i} className="user-card">
            <div className="user-card-avatar">{rank.icon}</div>
            <div className="user-card-info">
              <div className="user-card-name">{u.name}</div>
              <div className="user-card-meta">
                {rank.name} · {u.points} pts {u.streak>0&&<span style={{color:"#ff6b35"}}>🔥{u.streak}</span>}
                {u.plan==="pro"&&<span style={{background:"rgba(245,197,66,.15)",color:"var(--gold)",padding:"1px 6px",borderRadius:100,fontSize:9,fontWeight:700,marginLeft:4}}>PRO</span>}
              </div>
            </div>
            <button className="msg-btn" onClick={()=>{openConvo(u.email);setSocialView("messages");}}>Message</button>
            <button className="follow-btn following" onClick={()=>toggleFollow(u.email)}>Following</button>
          </div>
        );
      })}
    </>}

    {socialView==="search"&&<>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input className="finput" placeholder="Search by name…" value={searchQuery}
          onChange={e=>{setSearchQuery(e.target.value);searchUsers(e.target.value);}}
          style={{flex:1}}/>
        {searching&&<span className="spin"/>}
      </div>
      {searchResults.length===0&&searchQuery&&!searching&&(
        <div style={{textAlign:"center",padding:20,color:"var(--muted)",fontSize:13}}>No users found</div>
      )}
      {searchResults.map((u,i)=>{
        const rank = RANKS.find(r=>r.name===u.rank)||RANKS[0];
        const isFollowing = following.includes(u.email);
        return(
          <div key={i} className="user-card">
            <div className="user-card-avatar">{rank.icon}</div>
            <div className="user-card-info">
              <div className="user-card-name">{u.name}</div>
              <div className="user-card-meta">
                {rank.name} · {u.points||0} pts
                {u.plan==="pro"&&<span style={{background:"rgba(245,197,66,.15)",color:"var(--gold)",padding:"1px 6px",borderRadius:100,fontSize:9,fontWeight:700,marginLeft:4}}>PRO</span>}
              </div>
            </div>
            <button className={["follow-btn",isFollowing?"following":""].filter(Boolean).join(" ")} onClick={()=>toggleFollow(u.email)}>
              {isFollowing?"Following":"Follow"}
            </button>
          </div>
        );
      })}
    </>}

    {socialView==="messages"&&<>
      {!activeConvo?(
        <>
          {convoPartners.length===0?(
            <div style={{textAlign:"center",padding:"30px 20px",color:"var(--muted)"}}>
              <div style={{fontSize:32,marginBottom:8}}>💬</div>
              <div style={{fontSize:13}}>No messages yet. Follow someone and message them!</div>
            </div>
          ):convoPartners.map((partnerEmail,i)=>{
            const msgs = getConvoMessages(partnerEmail);
            const lastMsg = msgs[msgs.length-1];
            const unread = msgs.filter(m=>m.receiver_email===email&&!m.read).length;
            const partner = friendProfiles.find(f=>f.email===partnerEmail);
            return(
              <div key={i} className={["convo-item",activeConvo===partnerEmail?"active":""].filter(Boolean).join(" ")} onClick={()=>openConvo(partnerEmail)}>
                <div style={{fontSize:20}}>{(RANKS.find(r=>r.name===partner?.rank)||RANKS[0]).icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,color:"#f0f4f8"}}>{partner?.name||partnerEmail}</div>
                  {lastMsg&&<div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{lastMsg.content.slice(0,40)}{lastMsg.content.length>40?"…":""}</div>}
                </div>
                {unread>0&&<span className="unread-badge">{unread}</span>}
              </div>
            );
          })}
        </>
      ):(
        <>
          <button className="btn-s" style={{marginBottom:12,fontSize:12}} onClick={()=>setActiveConvo(null)}>← Back</button>
          <div className="msg-area">
            {getConvoMessages(activeConvo).length===0&&(
              <div style={{textAlign:"center",padding:20,color:"var(--muted)",fontSize:13}}>No messages yet. Say hi!</div>
            )}
            {getConvoMessages(activeConvo).map((m,i)=>(
              <div key={i} className={m.sender_email===email?"msg-mine":"msg-theirs"}>
                {m.content}
                <div className="msg-time">{new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input className="cin" placeholder="Type a message…" value={newMsg}
              onChange={e=>setNewMsg(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
            <button className="csend" onClick={sendMessage} disabled={sendingMsg||!newMsg.trim()}>Send</button>
          </div>
        </>
      )}
    </>}
  </>);
}

function FoodScanTab({email,profile,plan,goal,foodScans,scanImage,scanImageBase64,scanning,scanResult,scanError,handleImageSelect,scanFood,userPoints,t,GOALS}){
  const goalLabel = GOALS.find(g=>g.id===goal)?.title||"";
  const totalCalToday = foodScans.filter(s=>new Date(s.created_at).toDateString()===new Date().toDateString()).reduce((a,s)=>a+(s.calories||0),0);
  const totalProtToday = foodScans.filter(s=>new Date(s.created_at).toDateString()===new Date().toDateString()).reduce((a,s)=>a+(parseFloat(s.protein_g)||0),0);

  return(<>
    <div className="page-heading" style={{marginBottom:4}}>📸 <em>Food Scanner</em></div>
    <p className="page-sub" style={{marginBottom:12}}>Take a photo of your meal and AI will instantly calculate calories, macros, and whether it matches your plan.</p>

    {/* Today's summary */}
    {foodScans.some(s=>new Date(s.created_at).toDateString()===new Date().toDateString())&&(
      <div className="daily-totals" style={{marginBottom:14}}>
        <div style={{fontFamily:"var(--syne)",fontSize:12,fontWeight:700,color:"var(--green)",marginBottom:8}}>TODAY'S TOTAL</div>
        <div className="macro-grid">
          <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ff9500"}}>{totalCalToday}</div><div className="macro-cell-label">Calories</div></div>
          <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ff6b6b"}}>{totalProtToday.toFixed(0)}g</div><div className="macro-cell-label">Protein</div></div>
          <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ffd700"}}>{foodScans.filter(s=>new Date(s.created_at).toDateString()===new Date().toDateString()).reduce((a,s)=>a+(parseFloat(s.carbs_g)||0),0).toFixed(0)}g</div><div className="macro-cell-label">Carbs</div></div>
          <div className="macro-cell"><div className="macro-cell-val" style={{color:"#4ecdc4"}}>{foodScans.filter(s=>new Date(s.created_at).toDateString()===new Date().toDateString()).reduce((a,s)=>a+(parseFloat(s.fat_g)||0),0).toFixed(0)}g</div><div className="macro-cell-label">Fat</div></div>
        </div>
      </div>
    )}

    {/* Upload area */}
    <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,marginBottom:10,color:"#f0f4f8"}}>📷 Scan Your Meal</div>
      <label style={{display:"block",background:"var(--bg3)",border:"2px dashed rgba(0,229,160,0.3)",borderRadius:12,padding:"24px 16px",textAlign:"center",cursor:"pointer",marginBottom:10,transition:"all .2s"}}>
        <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleImageSelect}/>
        {scanImage?(
          <div>
            <div style={{fontSize:32,marginBottom:6}}>✅</div>
            <div style={{fontSize:13,color:"var(--green)",fontWeight:600}}>{scanImage.name}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:3}}>Tap to change photo</div>
          </div>
        ):(
          <div>
            <div style={{fontSize:36,marginBottom:8}}>🍽️</div>
            <div style={{fontSize:13,color:"var(--muted2)",fontWeight:600}}>Tap to take or upload a food photo</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Works best with clear, well-lit photos</div>
          </div>
        )}
      </label>
      {scanError&&<div className="msg-err" style={{marginBottom:10}}>{scanError}</div>}
      <button className="btn-p" onClick={scanFood} disabled={!scanImage||scanning}>
        {scanning?<><span className="spin"/> Analyzing your meal…</>:"🔍 Scan Food & Get Macros"}
      </button>
    </div>

    {/* Scan result */}
    {scanResult&&(
      <div className="scan-result-card" style={{marginBottom:14,animation:"fadeUp .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontFamily:"var(--syne)",fontSize:15,fontWeight:800,color:"#f0f4f8"}}>Scan Results</div>
          <span className={["on-plan-badge",scanResult.on_plan?"yes":"no"].join(" ")}>
            {scanResult.on_plan?"✓ On Plan":"⚠ Off Plan"}
          </span>
        </div>

        {/* Foods identified */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Foods Identified</div>
          <div>{(scanResult.foods||[]).map((f,i)=><span key={i} className="scan-food-item">{f}</span>)}</div>
        </div>

        {/* Macro grid */}
        <div className="macro-grid" style={{marginBottom:12}}>
          <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ff9500"}}>{scanResult.total_calories}</div><div className="macro-cell-label">Calories</div></div>
          <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ff6b6b"}}>{scanResult.protein_g}g</div><div className="macro-cell-label">Protein</div></div>
          <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ffd700"}}>{scanResult.carbs_g}g</div><div className="macro-cell-label">Carbs</div></div>
          <div className="macro-cell"><div className="macro-cell-val" style={{color:"#4ecdc4"}}>{scanResult.fat_g}g</div><div className="macro-cell-label">Fat</div></div>
        </div>

        {/* Macro bars */}
        {[["Protein",scanResult.protein_g,150,"#ff6b6b"],["Carbs",scanResult.carbs_g,250,"#ffd700"],["Fat",scanResult.fat_g,65,"#4ecdc4"],["Fiber",scanResult.fiber_g,30,"#50c878"]].map(([name,val,max,color])=>(
          <div key={name} className="macro-bar-wrap">
            <div className="macro-label"><span>{name}</span><span style={{color}}>{val}g</span></div>
            <div className="macro-bar"><div className="macro-fill" style={{width:Math.min(100,(val/max)*100)+"%",background:color}}/></div>
          </div>
        ))}

        {/* Vitamins */}
        {scanResult.vitamins&&(
          <div style={{marginTop:10,padding:"8px 10px",background:"var(--bg3)",borderRadius:8}}>
            <div style={{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Key Vitamins & Minerals</div>
            <div style={{fontSize:12,color:"#9aabb8"}}>{scanResult.vitamins}</div>
          </div>
        )}

        {/* Advice */}
        {scanResult.advice&&(
          <div style={{marginTop:10,padding:"9px 11px",background:"rgba(0,229,160,0.07)",border:"1px solid rgba(0,229,160,0.2)",borderRadius:9}}>
            <div style={{fontSize:12,color:"var(--muted2)"}}><strong style={{color:"var(--green)"}}>Coach tip:</strong> {scanResult.advice}</div>
          </div>
        )}

        {/* Points awarded */}
        <div style={{marginTop:10,textAlign:"center",fontSize:13,color:"var(--green)",fontWeight:700}}>
          +{Math.min(scanResult.points||10,25)} points awarded! 🎯
        </div>
      </div>
    )}

    {/* Scan history */}
    {foodScans.length>0&&(
      <>
        <div style={{fontFamily:"var(--syne)",fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:10,letterSpacing:".06em"}}>SCAN HISTORY</div>
        {foodScans.slice(0,10).map((s,i)=>(
          <div key={i} className="scan-history-item">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"var(--syne)",fontSize:12,fontWeight:700,color:"#f0f4f8"}}>{s.food_description?.slice(0,40)||"Food scan"}</div>
              <span className={["on-plan-badge",s.on_plan?"yes":"no"].join(" ")} style={{fontSize:10}}>{s.on_plan?"✓":"⚠"}</span>
            </div>
            <div className="macro-grid" style={{padding:8}}>
              <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ff9500",fontSize:12}}>{s.calories}</div><div className="macro-cell-label">Cal</div></div>
              <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ff6b6b",fontSize:12}}>{parseFloat(s.protein_g||0).toFixed(0)}g</div><div className="macro-cell-label">Prot</div></div>
              <div className="macro-cell"><div className="macro-cell-val" style={{color:"#ffd700",fontSize:12}}>{parseFloat(s.carbs_g||0).toFixed(0)}g</div><div className="macro-cell-label">Carbs</div></div>
              <div className="macro-cell"><div className="macro-cell-val" style={{color:"#4ecdc4",fontSize:12}}>{parseFloat(s.fat_g||0).toFixed(0)}g</div><div className="macro-cell-label">Fat</div></div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)",marginTop:4}}>
              <span>+{s.points_awarded||0} pts</span>
              <span>{new Date(s.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </>
    )}
  </>);
}

function LeaderboardTab({leaderboard,loadingLeaderboard,userRank,userPoints,userStreak,profileName,plan}){
  const [lbFilter,setLbFilter]=useState("All");
  const filtered = lbFilter==="All" ? leaderboard : leaderboard.filter(u=>u.rank===lbFilter);
  const nextRankIdx = RANKS.findIndex(r=>r.name===userRank.name)+1;
  const nextRank = RANKS[nextRankIdx]||null;
  const pct = userRank.max < Infinity
    ? Math.min(100,((userPoints-userRank.min)/(userRank.max-userRank.min)*100))
    : 100;
  return(
    <>
      <div className="page-heading" style={{marginBottom:4}}>🏆 <em>Leaderboard</em></div>
      <p className="page-sub" style={{marginBottom:14}}>See where you rank globally. Top 100 are the elite.</p>
      <div className="points-bar" style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:24}}>{userRank.icon}</span>
            <div>
              <div style={{fontFamily:"var(--syne)",fontSize:15,fontWeight:800,color:userRank.color}}>{userRank.name}</div>
              <div style={{fontSize:11,color:"var(--muted)"}}>{userPoints} points</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            {userStreak>0&&<div className="streak-badge" style={{fontSize:14}}>🔥 {userStreak} day streak</div>}
            {nextRank&&<div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{userRank.max-userPoints} pts to {nextRank.icon} {nextRank.name}</div>}
            {!nextRank&&<div style={{fontSize:11,color:"var(--gold)",marginTop:2}}>Max rank reached! 👑</div>}
          </div>
        </div>
        <div className="points-track">
          <div className="points-fill" style={{width:pct+"%",background:userRank.color}}/>
        </div>
      </div>
      <div className="rank-tabs">
        {["All",...RANKS.map(r=>r.name)].map(r=>(
          <button key={r} className={["rank-tab",lbFilter===r?"active":""].filter(Boolean).join(" ")} onClick={()=>setLbFilter(r)}>
            {r==="All"?"All Ranks":((RANKS.find(rk=>rk.name===r)?.icon||"")+" "+r)}
          </button>
        ))}
      </div>
      {loadingLeaderboard?(
        <div style={{textAlign:"center",padding:30}}><span className="spin"/></div>
      ):filtered.length===0?(
        <div style={{textAlign:"center",padding:"30px 20px",color:"var(--muted)"}}>
          <div style={{fontSize:30,marginBottom:8}}>🏆</div>
          <div>No users in this rank yet — be the first!</div>
        </div>
      ):filtered.map((u,i)=>{
        const pos=leaderboard.findIndex(l=>l.name===u.name&&l.points===u.points)+1;
        const rank=RANKS.find(r=>r.name===u.rank)||RANKS[0];
        return(
          <div key={i} className="leader-row" style={{border:u.name===profileName?"1px solid var(--green)":"1px solid var(--border)"}}>
            <div className={["leader-pos",pos<=3?"top3":""].filter(Boolean).join(" ")}>
              {pos===1?"🥇":pos===2?"🥈":pos===3?"🥉":"#"+pos}
            </div>
            <span style={{fontSize:18}}>{rank.icon}</span>
            <div className="leader-name">
              {u.name}
              {u.name===profileName&&<span style={{fontSize:10,color:"var(--green)",marginLeft:6}}>(you)</span>}
            </div>
            <div className="leader-right">
              {u.streak>0&&<span className="streak-badge">🔥{u.streak}</span>}
              {u.plan==="pro"&&<span className="pro-pill">PRO</span>}
              <span className="leader-pts">{u.points} pts</span>
            </div>
          </div>
        );
      })}
      {filtered.length>0&&<div style={{textAlign:"center",fontSize:11,color:"var(--muted)",marginTop:8,paddingBottom:8}}>
        {filtered.length} users shown
      </div>}
    </>
  );
}

export default function App() {
  const [screen,setScreen]=useState("onboard");
  const [step,setStep]=useState(0);
  const [dashTab,setDashTab]=useState("plan");
  const [resultTab,setResultTab]=useState("workout");

  // location + language
  const [country,setCountry]=useState("");
  const [langCode,setLangCode]=useState("en");
  const isMetric = METRIC_COUNTRIES.includes(country);
  const [t, setT] = useState(T[langCode] || T.en);
const [translating, setTranslating] = useState(false);

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

  const [profile,setProfile]=useState({name:"",age:"",weight:"",height:"",level:"",diet:""});
  const [heightRaw,setHeightRaw]=useState("");
  const [weightRaw,setWeightRaw]=useState("");
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

  const [msgs,setMsgs]=useState([{role:"bot",text:"Hey! I'm your AI coach. I know your full plan and I'm here to help you crush your goals!"}]);
  const [chatIn,setChatIn]=useState("");
  const [chatBusy,setChatBusy]=useState(false);
  const msgEnd=useRef(null);
  useEffect(()=>{msgEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const [reviews,setReviews]=useState([]);
  const [onboardReviews,setOnboardReviews]=useState([]);
  const [onboardAvg,setOnboardAvg]=useState("0.0");
  const [onboardReviewsLoading,setOnboardReviewsLoading]=useState(false);
  const [showReviewForm,setShowReviewForm]=useState(false);
  const [reviewRating,setReviewRating]=useState(0);
  const [reviewText,setReviewText]=useState("");
  const [reviewSubmitted,setReviewSubmitted]=useState(false);
  const [hoverStar,setHoverStar]=useState(0);
  const [loadingReviews,setLoadingReviews]=useState(false);
  const [progressLogs,setProgressLogs]=useState([]);
  const [userPoints,setUserPoints]=useState(0);
  const [userRank,setUserRank]=useState(RANKS[0]);
  const [userStreak,setUserStreak]=useState(0);
  const [lastLogDate,setLastLogDate]=useState("");
  const [dailyPointsToday,setDailyPointsToday]=useState(0);
  const [dailyPointsDate,setDailyPointsDate]=useState("");
  const [leaderboard,setLeaderboard]=useState([]);
  const [following,setFollowing]=useState([]);
  const [followers,setFollowers]=useState([]);
  const [friendProfiles,setFriendProfiles]=useState([]);
  const [searchQuery,setSearchQuery]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [activeConvo,setActiveConvo]=useState(null);
  const [allMessages,setAllMessages]=useState([]);
  const [newMsg,setNewMsg]=useState("");
  const [sendingMsg,setSendingMsg]=useState(false);
  const [unreadCount,setUnreadCount]=useState(0);
  const [foodScans,setFoodScans]=useState([]);
  const [scanImage,setScanImage]=useState(null);
  const [scanImageBase64,setScanImageBase64]=useState("");
  const [scanning,setScanning]=useState(false);
  const [scanResult,setScanResult]=useState(null);
  const [scanError,setScanError]=useState("");
  const [coachMemory,setCoachMemory]=useState("");
  const MAX_FOLLOWS = plan==="pro" ? 200 : 100;
  const [loadingLeaderboard,setLoadingLeaderboard]=useState(false);
  const [showExpiredModal,setShowExpiredModal]=useState(false);
  const [loadingProgress,setLoadingProgress]=useState(false);
  const [progressSaved,setProgressSaved]=useState(false);

  useEffect(()=>{
    if(dashTab==="reviews") loadReviews();
    if(dashTab==="leaderboard"){
      setLoadingLeaderboard(true);
      dbLoadLeaderboard().then(data=>{
        setLeaderboard(data);
        setLoadingLeaderboard(false);
      });
    }
    if(dashTab==="social" && email){
      dbGetFollowing(email).then(async(followingList)=>{
        setFollowing(followingList);
        const profiles = await dbGetUsersByEmails(followingList);
        setFriendProfiles(profiles);
      });
      dbGetFollowers(email).then(f=>setFollowers(f));
      dbGetMessages(email).then(msgs=>setAllMessages(msgs));
    }
    if(dashTab==="photos" && email){
      dbGetFoodScans(email).then(scans=>setFoodScans(scans));
    }
    if(dashTab==="progress"){
      setLoadingProgress(true);
      dbLoadProgress(email).then(logs=>{
        setProgressLogs(logs);
        setLoadingProgress(false);
      });
    }
  },[dashTab, email]);
  const [planGeneratedAt,setPlanGeneratedAt]=useState("");

  // Check plan expiry on dashboard
  useEffect(()=>{
    if(screen==="dashboard"){
      const expired = isPlanExpired(planGeneratedAt||null, plan);
      if(expired && plan !== "pro"){
        setShowExpiredModal(true);
        dbMarkExpired(email);
      }
    }
  },[screen, planGeneratedAt]);

  useEffect(()=>{
    if(step===2){
      setOnboardReviewsLoading(true);
      dbLoadReviews().then(r=>{
        setOnboardReviews(r);
        if(r.length>0){
          const avg=(r.reduce((a,rv)=>a+rv.rating,0)/r.length).toFixed(1);
          setOnboardAvg(avg);
        }
        setOnboardReviewsLoading(false);
      });
    }
  },[step]);

  // auto-set language when country changes
  useEffect(()=>{
    if(!country) return;
    const map = {
      "de":["Germany","Austria","Switzerland"],
      "fr":["France","Belgium"],
      "es":["Spain","Mexico","Argentina","Colombia","Chile"],
      "pt":["Brazil","Portugal"],
      "it":["Italy"],
      "ja":["Japan"],
      "ko":["South Korea"],
      "zh":["China"],
      "ar":["Saudi Arabia","UAE","Egypt","Morocco"],
      "hi":["India"],
      "ru":["Russia"],
      "uk":["Ukraine"],
      "pl":["Poland"],
      "nl":["Netherlands"],
      "sv":["Sweden","Norway","Denmark","Finland"],
      "tr":["Turkey"],
      "id":["Indonesia"],
      "vi":["Vietnam"],
      "th":["Thailand"],
      "ro":["Romania"],
      "el":["Greece"],
      "he":["Israel"],
      "cs":["Czech Republic"],
      "hu":["Hungary"],
      "ms":["Malaysia","Singapore"],
      "tl":["Philippines"],
      "sw":["Kenya","Nigeria","South Africa"],
    };
    const found = Object.entries(map).find(([code,countries])=>countries.includes(country));
    const newCode = found ? found[0] : "en";
    setLangCode(newCode);
  },[country]);

  // dynamic translation using Claude for unsupported languages
  useEffect(()=>{
    if(!langCode) return;
    if(T[langCode]){
      setT(T[langCode]);
      return;
    }
    // language not hardcoded — ask Claude to translate
    const lang = LANGUAGES.find(l=>l.code===langCode)?.name || "English";
    setTranslating(true);
    const base = T.en;
    const stringsToTranslate = {
      appTagline: base.appTagline,
      verifyTitle: base.verifyTitle,
      verifySub: base.verifySub,
      sendCode: base.sendCode,
      sending: base.sending,
      checkInbox: base.checkInbox,
      codeSentTo: base.codeSentTo,
      enterBelow: base.enterBelow,
      emailVerified: base.emailVerified,
      verifiedSub: base.verifiedSub,
      verifyBtn: base.verifyBtn,
      verifying: base.verifying,
      resendIn: base.resendIn,
      resend: base.resend,
      changeEmail: base.changeEmail,
      locationTitle: base.locationTitle,
      locationEm: base.locationEm,
      locationSub: base.locationSub,
      country: base.country,
      language: base.language,
      reviewsTitle: base.reviewsTitle,
      reviewsEm: base.reviewsEm,
      reviewsSub: base.reviewsSub,
      noReviews: base.noReviews,
      noReviewsSub: base.noReviewsSub,
      profileTitle: base.profileTitle,
      profileEm: base.profileEm,
      profileSub: base.profileSub,
      firstName: base.firstName,
      age: base.age,
      weight: base.weight,
      height: base.height,
      fitnessLevel: base.fitnessLevel,
      diet: base.diet,
      goalTitle: base.goalTitle,
      goalEm: base.goalEm,
      goalSub: base.goalSub,
      equipTitle: base.equipTitle,
      equipEm: base.equipEm,
      equipSub: base.equipSub,
      planTitle: base.planTitle,
      planEm: base.planEm,
      planSub: base.planSub,
      basic: base.basic,
      pro: base.pro,
      free: base.free,
      perMonth: base.perMonth,
      mostPopular: base.mostPopular,
      generateFree: base.generateFree,
      startPro: base.startPro,
      back: base.back,
      continue: base.continue,
      myPlan: base.myPlan,
      aiCoach: base.aiCoach,
      grocery: base.grocery,
      groceryLocked: base.groceryLocked,
      reviews: base.reviews,
      profile: base.profile,
      yourPlan: base.yourPlan,
      dayPlan: base.dayPlan,
      goal: base.goal,
      level: base.level,
      equip: base.equip,
      workoutPlan: base.workoutPlan,
      mealPlan: base.mealPlan,
      regenerate: base.regenerate,
      regenerating: base.regenerating,
      freeLimit: base.freeLimit,
      upgradePro: base.upgradePro,
      upgradeBtn: base.upgradeBtn,
      proActive: base.proActive,
      proActiveSub: base.proActiveSub,
      coachTitle: base.coachTitle,
      coachSub: base.coachSub,
      coachPlaceholder: base.coachPlaceholder,
      send: base.send,
      groceryTitle: base.groceryTitle,
      grocerySub: base.grocerySub,
      noGrocery: base.noGrocery,
      proFeature: base.proFeature,
      proUpsellSub: base.proUpsellSub,
      upgradeProFull: base.upgradeProFull,
      reviewsTabTitle: base.reviewsTabTitle,
      reviewsTabSub: base.reviewsTabSub,
      leaveReview: base.leaveReview,
      profileTab: base.profileTab,
      profileTabSub: base.profileTabSub,
      startOver: base.startOver,
      subscription: base.subscription,
      building: base.building,
      personalized: base.personalized,
      aboutTime: base.aboutTime,
      savedBanner: base.savedBanner,
      howDoing: base.howDoing,
      modifyWorkout: base.modifyWorkout,
      lunchEat: base.lunchEat,
      missedWorkout: base.missedWorkout,
      motivation: base.motivation,
      logProgress: base.logProgress,
      explainEx: base.explainEx,
      soreMuscle: base.soreMuscle,
      rateExp: base.rateExp,
      rateSub: base.rateSub,
      submitReview: base.submitReview,
      skip: base.skip,
    };
    askClaude(
      "Translate these JSON strings into "+lang+". Return ONLY valid JSON, no markdown, no explanation. Keep emoji and special characters. Keep the exact same JSON keys. Here is the JSON: "+JSON.stringify(stringsToTranslate),
      "You are a professional translator. Return only valid JSON with the same keys as the input, with all string values translated into "+lang+". Do not translate keys. Do not add markdown. Do not add any text outside the JSON.",
      {isTranslation:true}
    ).then(result=>{
      try{
        const cleaned = result.replace(/^$/,"").trim();
        const translated = JSON.parse(cleaned);
        // merge with base to keep non-translated fields like arrays
        setT({
          ...base,
          ...translated,
          steps: base.steps, // keep steps in English for now
          levels: base.levels,
          diets: base.diets,
          goals: base.goals,
          equipment: base.equipment,
          pfeats: base.pfeats,
        });
      }catch(e){
        console.error("Translation parse error:",e);
        setT(base); // fallback to English
      }
      setTranslating(false);
    }).catch((err)=>{
      console.error('Translation failed:', err.message);
      setT(base); // fallback to English
      setTranslating(false);
    });
  },[langCode]);

  const startTimer=()=>{
    setResendTimer(60);
    timerRef.current=setInterval(()=>{
      setResendTimer(t=>{if(t<=1){clearInterval(timerRef.current);return 0;}return t-1;});
    },1000);
  };
  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  const setP=(k,v)=>setProfile(p=>({...p,[k]:v}));
  const toggleEquip=id=>setEquip(e=>e.includes(id)?e.filter(x=>x!==id):[...e,id]);

  const handleHeightBlur=()=>{
    const formatted=formatHeight(heightRaw,isMetric);
    setHeightRaw(formatted);
    setP("height",formatted);
  };
  const handleWeightBlur=()=>{
    const formatted=formatWeight(weightRaw,isMetric);
    setWeightRaw(formatted);
    setP("weight",formatted);
  };

  const profileValid=profile.name.trim()&&profile.age&&profile.weight;

  const loadReviews=async()=>{
    setLoadingReviews(true);
    const r=await dbLoadReviews();
    setReviews(r);
    setLoadingReviews(false);
  };

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
            setProfile({name:existing.name||"",age:existing.age||"",weight:existing.weight||"",height:existing.height||"",level:existing.level||t.levels[0],diet:existing.diet||t.diets[0]});
            setHeightRaw(existing.height||"");
            setWeightRaw(existing.weight||"");
            setGoal(existing.goal||"");
            setEquip(existing.equipment?existing.equipment.split(","):[]);
            setPlan(existing.plan||"basic");
            setWorkoutPlan(existing.workout_plan||"");
            setMealPlan(existing.meal_plan||"");
            setGroceryList(existing.grocery_list||"");
            setHasGenerated(true);
            if(existing.plan_generated_at) setPlanGeneratedAt(existing.plan_generated_at);
            // load rank/streak/points
            if(existing.points) setUserPoints(existing.points);
            if(existing.rank) setUserRank(RANKS.find(r=>r.name===existing.rank)||RANKS[0]);
            if(existing.streak) setUserStreak(existing.streak);
            if(existing.last_log_date) setLastLogDate(existing.last_log_date);
            if(existing.daily_points_today) setDailyPointsToday(existing.daily_points_today);
            if(existing.daily_points_date) setDailyPointsDate(existing.daily_points_date);
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

  const daysCount=plan==="pro"?30:7;

  const generate=async(isRegen=false)=>{
    if(plan==="basic"&&hasGenerated&&!isRegen) return;
    isRegen?setRegenerating(true):setGenerating(true);
    setGenError("");
    setProgress(10);
    const goalLabel=t.goals.find(g=>g.id===goal)?.title||goal;
    const equipList=equip.length>0?equip.join(", "):"no equipment";
    const unitSystem=isMetric?"metric (kg, cm)":"imperial (lbs, ft/in)";
    const ctx="Name: "+profile.name+", Age: "+profile.age+", Weight: "+profile.weight+", Height: "+(profile.height||"not specified")+", Level: "+profile.level+", Diet: "+profile.diet+", Goal: "+goalLabel+", Equipment: "+equipList+", Units: "+unitSystem+", Language: "+langCode+", Country: "+country;
    try{
      setStatusMsg(t.building+" "+daysCount+t.personalized);
      await dbUpsertUser({email,name:profile.name,age:profile.age,weight:profile.weight,height:profile.height,level:profile.level,diet:profile.diet,goal,equip,plan,country,language:langCode});
      setProgress(20);
      const workout=await askClaude(
        "Create a "+daysCount+"-day workout plan for: "+ctx+". Write Day 1 through Day "+daysCount+". For each workout day list 4-6 exercises with sets and reps. Mark rest days. Be concise. Respond in the same language as: "+langCode,
        "You are a personal trainer. Write workout plans in plain text. No markdown. Label each day.",
        {isPlanGeneration:true,isPro:plan==="pro"}
      );
      setWorkoutPlan(workout);
      setProgress(55);
      const caloricGoal = goal==="weight_loss" ? "caloric deficit 300-500 cal below maintenance" : goal==="muscle_gain" ? "caloric surplus 300-500 cal above maintenance" : "maintenance calories";
      const meal=await askClaude(
        "Create a "+daysCount+"-day meal plan for: "+ctx+". Caloric target: "+caloricGoal+". Diet: "+profile.diet+" strictly. Write Day 1 through Day "+daysCount+". For EACH meal (Breakfast, Lunch, Dinner, Snack) show food with portions, then on next line show: [Cal: X | P: Xg | C: Xg | F: Xg]. At end of each day add: [DAILY: Cal: X | P: Xg | C: Xg | F: Xg | Fiber: Xg]. Use "+unitSystem+". Language: "+langCode,
        "You are a certified nutritionist. Include accurate macros per meal and daily totals. Strictly follow: "+profile.diet+". Plain text only. Use exact macro format [Cal: X | P: Xg | C: Xg | F: Xg]."
      );
      setMealPlan(meal);
      setProgress(78);
      let grocery="";
      if(plan==="pro"){
        grocery=await askClaude(
          "Based on this meal plan, create a detailed grocery list AND simple recipes. The person follows a "+profile.diet+" diet — strictly respect this restriction. Use "+unitSystem+" measurements. Respond in language: "+langCode+". Format: First a GROCERY LIST organized by category (Proteins, Produce, Grains, Dairy/Alternatives, Other). Then RECIPES section with 3-4 simple meal prep recipes from the plan with ingredients and steps. Meal plan: "+meal.slice(0,600),
          "You are a nutritionist. Strictly follow the dietary restriction: "+profile.diet+". No ingredients that violate this diet. Write in plain text grouped by sections."
        );
        setGroceryList(grocery);
      }
      setProgress(92);
      await dbSavePlan({email,workout_plan:workout,meal_plan:meal,grocery_list:grocery});
      setPlanSaved(true);
      setHasGenerated(true);
      setProgress(100);
      setScreen("dashboard");
      setDashTab("plan");
      setTimeout(()=>setShowReviewForm(true),3000);
    }catch(err){
      if(err.message && (err.message.includes("PLAN_LIMIT_REACHED") || err.message.includes("Free plan limit"))){
        setGenError(err.message);
      } else {
        setGenError("Error: "+err.message);
      }
    }finally{
      setGenerating(false);
      setRegenerating(false);
    }
  };

  const searchUsers = async(q)=>{
    if(!q.trim()) return setSearchResults([]);
    setSearching(true);
    const results = await dbSearchUsers(q);
    setSearchResults(results.filter(u=>u.email!==email));
    setSearching(false);
  };

  const toggleFollow = async(targetEmail)=>{
    const maxFollows = plan==="pro" ? 200 : 100;
    if(!following.includes(targetEmail)){
      if(following.length >= maxFollows){
        alert(`You can follow up to ${maxFollows} people. ${plan!=="pro"?"Upgrade to Pro for 200 follows!":""}`);
        return;
      }
      await dbFollowUser(email, targetEmail);
      setFollowing(f=>[...f, targetEmail]);
    } else {
      await dbUnfollowUser(email, targetEmail);
      setFollowing(f=>f.filter(e=>e!==targetEmail));
    }
    const profiles = await dbGetUsersByEmails(following.includes(targetEmail) ? following.filter(e=>e!==targetEmail) : [...following, targetEmail]);
    setFriendProfiles(profiles);
  };

  const openConvo = async(otherEmail)=>{
    setActiveConvo(otherEmail);
    await dbMarkMessagesRead(otherEmail, email);
    setUnreadCount(c=>Math.max(0,c-1));
  };

  const sendMessage = async()=>{
    if(!newMsg.trim()||!activeConvo||sendingMsg) return;
    setSendingMsg(true);
    await dbSendMessage(email, activeConvo, newMsg.trim());
    setNewMsg("");
    const msgs = await dbGetMessages(email);
    setAllMessages(msgs);
    setSendingMsg(false);
  };

  const getConvoMessages = (otherEmail)=>{
    return allMessages.filter(m=>
      (m.sender_email===email&&m.receiver_email===otherEmail)||
      (m.sender_email===otherEmail&&m.receiver_email===email)
    );
  };

  const getConvoPartners = ()=>{
    const partners = new Set();
    allMessages.forEach(m=>{
      if(m.sender_email===email) partners.add(m.receiver_email);
      if(m.receiver_email===email) partners.add(m.sender_email);
    });
    return Array.from(partners);
  };

  const handleImageSelect = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    setScanImage(file);
    setScanResult(null);
    setScanError("");
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const base64 = ev.target.result.split(",")[1];
      setScanImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const uploadFoodPhoto = async(file)=>{
    try {
      const client = await getSupabase();
      const fileName = email.replace("@","_")+"/"+Date.now()+".jpg";
      const {data, error} = await client.storage.from("progress-photos").upload(fileName, file, {contentType: file.type||"image/jpeg"});
      if(error) console.error("Upload error:", error);
      return data?.path || null;
    } catch(e){ console.error("Upload failed:", e); return null; }
  };

  const scanFood = async()=>{
    if(!scanImageBase64 || scanning) return;
    setScanning(true);
    setScanError("");
    const goalLabel = t.goals.find(g=>g.id===goal)?.title||"";
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{
            role:"user",
            content:[
              {type:"image", source:{type:"base64", media_type:scanImage.type||"image/jpeg", data:scanImageBase64}},
              {type:"text", text:"Analyze this food photo. User diet: "+profile.diet+". Goal: "+goalLabel+". Return ONLY valid JSON with no markdown or explanation. Fields: foods array with name/portion/calories/protein_g/carbs_g/fat_g/fiber_g/vitamins per item, plus total_calories, total_protein_g, total_carbs_g, total_fat_g, total_fiber_g, on_plan boolean, plan_match_reason string, health_score number 1-10, notes string."}
            ]
          }],
          system:"You are a professional nutritionist and dietitian. Analyze food photos and return accurate nutritional information as JSON only. No markdown, no explanation, just the JSON object."
        })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error.message);
      const text = (data.content||[]).map(b=>b.text||"").join("");
      const cleaned = text.replace(/^```json?/,"").replace(/```$/,"").trim();
      const parsed = JSON.parse(cleaned);
      setScanResult(parsed);

      // Award points and save scan
      const pts = Math.min(parsed.points||10, 25);
      // Upload photo to storage
      const photoPath = await uploadFoodPhoto(scanImage);

      await dbSaveFoodScan({
        email,
        foodDescription: parsed.foods?.join(", ")||"Unknown food",
        calories: parsed.total_calories||0,
        proteinG: parsed.protein_g||0,
        carbsG: parsed.carbs_g||0,
        fatG: parsed.fat_g||0,
        vitamins: parsed.vitamins||"",
        scanResult: JSON.stringify(parsed),
        pointsAwarded: pts,
        onPlan: parsed.on_plan||false,
        photoPath
      });

      // Award points
      const today = new Date().toISOString().split("T")[0];
      const dpToday = dailyPointsDate === today ? dailyPointsToday : 0;
      const remaining = Math.max(0, DAILY_POINT_CAP - dpToday);
      const earned = Math.min(pts, remaining);
      if(earned > 0){
        const newPoints = userPoints + earned;
        const newRank = getRank(newPoints);
        setUserPoints(newPoints);
        setUserRank(newRank);
        setDailyPointsToday(dpToday + earned);
        setDailyPointsDate(today);
        await dbUpdatePoints({email, points:newPoints, rank:newRank.name, streak:userStreak, last_log_date:lastLogDate, daily_points_today:dpToday+earned, daily_points_date:today});
      }

      // Refresh scans list
      const scans = await dbGetFoodScans(email);
      setFoodScans(scans);

    } catch(e){
      setScanError("Could not analyze image: "+e.message+". Please try a clearer photo.");
    } finally {
      setScanning(false);
    }
  };

  // Save coach memory at end of session
  const saveCoachMemory = async(chatHistory)=>{
    if(!email || chatHistory.length < 4) return;
    try {
      const goalLabel = t.goals.find(g=>g.id===goal)?.title||"";
      const summary = await askClaude(
        "Summarize this coaching session in under 150 words. Focus on: what the user logged, any injuries or issues mentioned, progress made, advice given. User context: "+profile.name+", "+goalLabel+", "+profile.level+". Session: "+chatHistory.slice(-10).map(m=>m.role+": "+m.text).join(" | "),
        "You are a fitness coach summarizing a session. Be concise and factual. Write in third person."
      );
      const newMemory = "["+new Date().toLocaleDateString()+"] "+summary;
      const fullMemory = (coachMemory ? coachMemory+"

"+newMemory : newMemory).slice(-2000);
      setCoachMemory(fullMemory);
      await dbSaveCoachMemory(email, fullMemory);
    } catch(e){ console.error("Memory save error:", e); }
  };

  // Save session summary when leaving chat tab
  useEffect(()=>{
    return ()=>{ if(dashTab==="chat" && msgs.length>3) summarizeSession(); };
  },[dashTab]);

  const sendChat=async(text)=>{
    if(!text.trim()||chatBusy) return;
    setChatIn("");
    setMsgs(m=>[...m,{role:"user",text}]);
    setChatBusy(true);
    const goalLabel=t.goals.find(g=>g.id===goal)?.title||"";
    const history=msgs.map(m=>({role:m.role==="bot"?"assistant":"user",content:m.text}));
    history.push({role:"user",content:text});
    // Save memory every 10 messages
    if(msgs.length > 0 && msgs.length % 10 === 0){
      saveCoachMemory(msgs);
    }

    // detect progress logging keywords
    const progressKeywords=["sets","reps","lbs","kg","km","miles","minutes","completed","finished","did","ran","lifted","bench","squat","deadlift","log","logged","weigh","weight today","pb","pr","personal record","personal best"];
    const isProgressLog = progressKeywords.some(k=>text.toLowerCase().includes(k));

    const memoryContext = coachMemory ? "\n\nPrevious session notes: "+coachMemory.slice(-500) : "";
    const sys="You are an expert AI personal trainer and nutritionist named Coach. You know this user intimately: Name: "+profile.name+", Age: "+profile.age+", Weight: "+profile.weight+", Goal: "+goalLabel+", Level: "+profile.level+", Diet: "+profile.diet+", Country: "+country+", Rank: "+userRank.name+", Streak: "+userStreak+" days. Their current workout plan: "+workoutPlan.slice(0,300)+"..."+memoryContext+" Be encouraging, specific and personal. Use their name occasionally. Under 150 words per reply. Respond in language: "+langCode+(isProgressLog?". The user is logging progress — acknowledge enthusiastically, confirm what they logged, give a motivating tip.":"");

    try{
      const reply=await askClaudeChat(history,sys);
      setMsgs(m=>[...m,{role:"bot",text:reply}]);

      // award points and save log
      if(isProgressLog && email){
        const isPR = text.toLowerCase().includes("pr") || text.toLowerCase().includes("personal record") || text.toLowerCase().includes("personal best") || text.toLowerCase().includes("new record");
        const type = isPR ? "pr" : text.toLowerCase().includes("weight") || text.toLowerCase().includes("weigh") ? "weight" :
                     text.toLowerCase().includes("ran") || text.toLowerCase().includes("km") || text.toLowerCase().includes("miles") ? "cardio" : "workout";

        // streak logic
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now()-86400000).toISOString().split("T")[0];
        let newStreak = userStreak;
        if(lastLogDate === today) {
          // already logged today - streak stays same
        } else if(lastLogDate === yesterday) {
          newStreak = userStreak + 1; // consecutive day
        } else if(lastLogDate === "") {
          newStreak = 1; // first ever log
        } else {
          newStreak = 1; // streak broken - reset
        }

        // daily cap reset
        const todayStr = today;
        const dpToday = dailyPointsDate === todayStr ? dailyPointsToday : 0;

        // streak bonus
        let bonusPoints = 0;
        if(newStreak === 7) bonusPoints = 50;
        if(newStreak === 30) bonusPoints = 150;

        const earned = getPointsForLog(type, dpToday);
        const totalEarned = earned + bonusPoints;
        const newPoints = userPoints + totalEarned;
        const newDailyPoints = Math.min(dpToday + earned, DAILY_POINT_CAP);
        const newRank = getRank(newPoints);

        setUserPoints(newPoints);
        setUserRank(newRank);
        setUserStreak(newStreak);
        setLastLogDate(today);
        setDailyPointsToday(newDailyPoints);
        setDailyPointsDate(todayStr);

        await Promise.all([
          dbLogProgress({email, entry: text, type}),
          dbUpdatePoints({
            email, points: newPoints, rank: newRank.name,
            streak: newStreak, last_log_date: today,
            daily_points_today: newDailyPoints, daily_points_date: todayStr
          })
        ]);

        setProgressSaved(true);
        setTimeout(()=>setProgressSaved(false), 3000);

        // show rank up notification
        if(newRank.name !== userRank.name){
          setTimeout(()=>{
            setMsgs(m=>[...m,{role:"bot",text:"🎉 RANK UP! You just reached " + newRank.icon + " " + newRank.name + "! Keep going!"}]);
          }, 500);
        }
        if(bonusPoints > 0){
          setTimeout(()=>{
            setMsgs(m=>[...m,{role:"bot",text:"🔥 " + newStreak + "-day streak bonus! +" + bonusPoints + " points!"}]);
          }, 800);
        }
      }
    }catch(e){
      setMsgs(m=>[...m,{role:"bot",text:"Sorry, couldn't connect: "+e.message}]);
    }finally{setChatBusy(false);}
  };

  const submitReview=async()=>{
    if(reviewRating===0||!reviewText.trim()) return;
    const goalLabel=t.goals.find(g=>g.id===goal)?.title||"";
    await dbSaveReview({email,name:profile.name,rating:reviewRating,review_text:reviewText,goal:goalLabel});
    setReviewSubmitted(true);
    setShowReviewForm(false);
  };

  const avgRating=reviews.length>0?(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1):null;

  const StepsBar=()=>(
    <div className="progress-wrap">
      <div className="steps-row">
        {t.steps.map((s,i)=>(
          <Fragment key={s}>
            <div className={["step-dot",i<step?"done":i===step?"active":""].filter(Boolean).join(" ")}>{i<step?"✓":i+1}</div>
            {i<t.steps.length-1&&<div className={["step-line",i<step?"done":""].filter(Boolean).join(" ")}/>}
          </Fragment>
        ))}
      </div>
      <div className="steps-labels">
        {t.steps.map((s,i)=><span key={s} className={i===step?"active":""}>{s}</span>)}
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
          <div className="topbar-right" style={{gap:6}}>
            <span style={{fontSize:18}}>{userRank.icon}</span>
            {plan==="pro"&&<span className="pro-pill">PRO</span>}
            {userStreak>0&&<span className="streak-badge">🔥{userStreak}</span>}
            <span style={{fontSize:13,color:"var(--text)",fontWeight:600}}>{profile.name}</span>
          </div>
        </header>
        <nav className="dnav">
          {[[" plan",t.myPlan],["chat",t.aiCoach],["progress","📊 Progress"],["leaderboard","🏆 Ranks"],["social",unreadCount>0?"👥 Social ●":"👥 Social"],["photos","📸 Food Scan"],["grocery",plan==="pro"?t.grocery:t.groceryLocked],["reviews",t.reviews],["profile",t.profileTab]].map(([id,lbl])=>(
            <button key={id} className={["dtab",dashTab===id.trim()?"active":""].filter(Boolean).join(" ")} onClick={()=>setDashTab(id.trim())}>{lbl}</button>
          ))}
        </nav>

        {progressSaved&&<div className="saved-flash">💾 Progress logged!</div>}

        {/* PLAN EXPIRED MODAL */}
        {showExpiredModal&&plan!=="pro"&&(
          <div className="expired-overlay">
            <div className="expired-card">
              <div style={{fontSize:48,marginBottom:16}}>⏰</div>
              <div style={{fontFamily:"var(--syne)",fontSize:22,fontWeight:800,marginBottom:8}}>Your free plan has expired</div>
              <div style={{fontSize:14,color:"var(--muted2)",lineHeight:1.6,marginBottom:24}}>
                Your 7-day free plan ended. Upgrade to Pro to continue accessing your plan, unlock 30-day plans, grocery lists, unlimited regenerations, and more.
              </div>
              <div style={{background:"var(--bg3)",borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"left"}}>
                {[["✓","30-day meal + workout plan"],["✓","Unlimited regenerations"],["✓","Grocery list"],["✓","AI Coach with rank tracking"],["✓","Keep your rank & streak"]].map(([icon,text])=>(
                  <div key={text} style={{display:"flex",gap:10,fontSize:13,color:"var(--muted2)",marginBottom:6}}>
                    <span style={{color:"var(--green)",fontWeight:700}}>{icon}</span>{text}
                  </div>
                ))}
              </div>
              <button className="btn-gold" style={{width:"100%",marginBottom:12}} onClick={()=>{setShowExpiredModal(false);}}>
                Upgrade to Pro — $5/mo
              </button>
              <button className="btn-s" style={{width:"100%",fontSize:12}} onClick={()=>setShowExpiredModal(false)}>
                Maybe later (limited access)
              </button>
            </div>
          </div>
        )}

        {showReviewForm&&!reviewSubmitted&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:18,padding:28,maxWidth:420,width:"100%",textAlign:"center"}}>
              <div style={{fontSize:34,marginBottom:10}}>⭐</div>
              <div style={{fontFamily:"var(--syne)",fontSize:19,fontWeight:800,marginBottom:7}}>{t.rateExp}</div>
              <div style={{fontSize:13,color:"var(--muted2)",marginBottom:18}}>{t.rateSub}</div>
              <div className="stars-row">
                {[1,2,3,4,5].map(s=>(
                  <span key={s} className={["star",(hoverStar||reviewRating)>=s?"lit":""].filter(Boolean).join(" ")}
                    onMouseEnter={()=>setHoverStar(s)} onMouseLeave={()=>setHoverStar(0)}
                    onClick={()=>setReviewRating(s)}>⭐</span>
                ))}
              </div>
              <textarea className="ftextarea" placeholder="Tell us about your experience…" value={reviewText} onChange={e=>setReviewText(e.target.value)} style={{marginBottom:12}}/>
              <div style={{display:"flex",gap:10}}>
                <button className="btn-s" onClick={()=>setShowReviewForm(false)}>{t.skip}</button>
                <button className="btn-p" disabled={reviewRating===0||!reviewText.trim()} onClick={submitReview}>{t.submitReview}</button>
              </div>
            </div>
          </div>
        )}

        <div className="page-scroll">
          <div className="page-inner">
            {dashTab==="plan"&&<>
              <div className="page-heading" style={{marginBottom:4}}>{t.yourPlan}<em>{daysCount}</em>{t.dayPlan}</div>
              <p className="page-sub" style={{marginBottom:14}}>
                {t.goal}: <strong style={{color:"var(--green)"}}>{t.goals.find(g=>g.id===goal)?.title}</strong>
                {" · "}{profile.level}{" · "}{profile.diet}
                {plan==="pro"&&<span className="pro-badge">PRO</span>}
              </p>
              {planSaved&&<div className="saved-banner"><span>💾</span><span><strong>{t.savedBanner}</strong></span></div>}
              <div className="rtabs">
                {[[" workout",t.workoutPlan],["meal",t.mealPlan]].map(([id,lbl])=>(
                  <button key={id} className={["rtab",resultTab===id.trim()?"active":""].filter(Boolean).join(" ")} onClick={()=>setResultTab(id.trim())}>{lbl}</button>
                ))}
              </div>
              <div className="rbody" style={{whiteSpace:"pre-wrap"}}>
                {resultTab==="workout"?workoutPlan:(
                  mealPlan.split('
').map((line,i)=>{
                    if(line.startsWith('[Cal:') || line.startsWith('[DAILY:')){
                      return <div key={i} style={{background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.15)",borderRadius:6,padding:"4px 8px",margin:"4px 0",fontSize:11,color:"var(--green)",fontFamily:"var(--syne)",fontWeight:600}}>{line}</div>;
                    }
                    if(line.startsWith('Day ')){
                      return <div key={i} style={{fontWeight:700,color:"#f0f4f8",marginTop:14,marginBottom:2,fontSize:14}}>{line}</div>;
                    }
                    if(line.match(/^(Breakfast|Lunch|Dinner|Snack):/)){
                      return <div key={i} style={{color:"var(--green)",fontWeight:600,marginTop:8,fontSize:12}}>{line}</div>;
                    }
                    return <div key={i} style={{color:"#9aabb8",fontSize:12,lineHeight:1.7}}>{line}</div>;
                  })
                )}
              </div>
              {plan==="pro"?(
                <button className="regen-btn" disabled={regenerating} onClick={()=>generate(true)}>
                  {regenerating?<><span className="spin"/> {t.regenerating}</>:t.regenerate}
                </button>
              ):(
                <div className="free-limit">
                  <strong>{t.freeLimit}</strong> {t.upgradePro}
                  <br/><button className="btn-gold" style={{marginTop:9,width:"100%"}} onClick={()=>setDashTab("profile")}>{t.upgradeBtn}</button>
                </div>
              )}
              {plan==="pro"&&<div style={{marginTop:12,padding:"11px 14px",background:"rgba(245,197,66,0.07)",border:"1px solid rgba(245,197,66,0.2)",borderRadius:9}}>
                <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:700,color:"var(--gold)",marginBottom:3}}>{t.proActive}</div>
                <div style={{fontSize:12,color:"var(--muted2)"}}>{t.proActiveSub}</div>
              </div>}
            </>}

            {dashTab==="chat"&&<>
              <div className="page-heading" style={{marginBottom:4}}><em>{t.coachTitle}</em></div>
              <p className="page-sub" style={{marginBottom:9}}>{t.coachSub}</p>
              <div className="coach-prompts">
                {[t.howDoing,t.modifyWorkout,t.lunchEat,t.missedWorkout,t.motivation,t.logProgress,t.explainEx,t.soreMuscle].map(p=>(
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
                <input className="cin" placeholder={t.coachPlaceholder} value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat(chatIn)}/>
                <button className="csend" onClick={()=>sendChat(chatIn)} disabled={chatBusy||!chatIn.trim()}>{t.send}</button>
              </div>
            </>}

            {dashTab==="grocery"&&<>
              <div className="page-heading" style={{marginBottom:4}}><em>{t.groceryTitle}</em></div>
              {plan==="pro"?(
                <>
                  <p className="page-sub" style={{marginBottom:14}}>{t.grocerySub}</p>
                  {groceryList?(
                <>
                  <div className="rtabs" style={{marginBottom:14}}>
                    <button className="rtab active" id="grocery-tab" onClick={()=>{document.getElementById("grocery-content").style.display="block";document.getElementById("recipe-content").style.display="none";document.getElementById("grocery-tab").className="rtab active";document.getElementById("recipe-tab").className="rtab";}}>🛒 Grocery List</button>
                    <button className="rtab" id="recipe-tab" onClick={()=>{document.getElementById("grocery-content").style.display="none";document.getElementById("recipe-content").style.display="block";document.getElementById("recipe-tab").className="rtab active";document.getElementById("grocery-tab").className="rtab";}}>👨‍🍳 Recipes</button>
                  </div>
                  <div id="grocery-content">
                    <div style={{fontSize:11,color:"var(--green)",fontWeight:700,marginBottom:8,letterSpacing:".05em"}}>
                      ✓ DIET: {profile.diet.toUpperCase()} — all items verified
                    </div>
                    <div className="rbody">{groceryList.split("RECIPES")[0]}</div>
                  </div>
                  <div id="recipe-content" style={{display:"none"}}>
                    <div className="rbody">{groceryList.split("RECIPES")[1]||groceryList}</div>
                  </div>
                </>
              ):<div style={{textAlign:"center",padding:"40px 20px",color:"var(--muted)"}}><div style={{fontSize:34,marginBottom:10}}>🛒</div><div>{t.noGrocery}</div></div>}
                </>
              ):(
                <div className="pro-upsell">
                  <div className="pro-upsell-title">{t.proFeature}</div>
                  <div className="pro-upsell-sub">{t.proUpsellSub}</div>
                  <button className="btn-gold" style={{width:"100%"}}>{t.upgradeProFull}</button>
                </div>
              )}
            </>}

            {dashTab==="progress"&&<>
              <div className="page-heading" style={{marginBottom:4}}>Your <em>Progress</em></div>
              <p className="page-sub" style={{marginBottom:16}}>Logged automatically when you tell your AI Coach about workouts, weight, or cardio.</p>
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                <div style={{flex:1,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:3}}>{userRank.icon}</div>
                  <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:800,color:userRank.color}}>{userRank.name}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{userPoints} pts</div>
                </div>
                <div style={{flex:1,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:3}}>🔥</div>
                  <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:800}}>{userStreak}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>Day streak</div>
                </div>
                <div style={{flex:1,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:3}}>📅</div>
                  <div style={{fontFamily:"var(--syne)",fontSize:13,fontWeight:800}}>{progressLogs.length}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>Total logs</div>
                </div>
              </div>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 16px",marginBottom:14,fontSize:13,color:"var(--muted2)"}}>
                💡 <strong style={{color:"var(--text)"}}>How to log:</strong> Tell your AI Coach things like "I did 3 sets of bench at 185lbs" or "ran 5km today" or "new PR — squatted 225lbs" — points awarded automatically!
              </div>
              {loadingProgress?(
                <div style={{textAlign:"center",padding:30}}><span className="spin"/></div>
              ):progressLogs.length===0?(
                <div style={{textAlign:"center",padding:"40px 20px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:13}}>
                  <div style={{fontSize:34,marginBottom:10}}>📊</div>
                  <div style={{fontFamily:"var(--syne)",fontSize:15,fontWeight:700,marginBottom:6}}>No logs yet</div>
                  <div style={{fontSize:13,color:"var(--muted2)"}}>Go to AI Coach and tell it about your workouts to start tracking!</div>
                </div>
              ):(
                <>
                  <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
                    {[
                      ["💪","workout",progressLogs.filter(l=>l.type==="workout").length,"Workouts"],
                      ["🏃","cardio",progressLogs.filter(l=>l.type==="cardio").length,"Cardio"],
                      ["⚖️","weight",progressLogs.filter(l=>l.type==="weight").length,"Weight Logs"],
                    ].map(([icon,type,count,label])=>(
                      <div key={type} style={{flex:1,minWidth:80,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,padding:"12px",textAlign:"center"}}>
                        <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
                        <div style={{fontFamily:"var(--syne)",fontSize:20,fontWeight:800}}>{count}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {progressLogs.map((log,i)=>(
                    <div key={i} className="progress-log">
                      <div className="progress-log-icon">{log.type==="workout"?"💪":log.type==="cardio"?"🏃":"⚖️"}</div>
                      <div className="progress-log-body">
                        <div className="progress-log-entry">{log.entry}</div>
                        <div className="progress-log-meta">
                          <span className={"progress-type "+log.type}>{log.type}</span>
                          {new Date(log.logged_at).toLocaleDateString()} at {new Date(log.logged_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>}

            {dashTab==="leaderboard"&&<LeaderboardTab
              leaderboard={leaderboard}
              loadingLeaderboard={loadingLeaderboard}
              userRank={userRank}
              userPoints={userPoints}
              userStreak={userStreak}
              profileName={profile.name}
              plan={plan}
            />}

                <div className="page-heading" style={{marginBottom:4}}>🏆 <em>Leaderboard</em></div>
                <p className="page-sub" style={{marginBottom:14}}>See where you rank globally. Top 100 are the elite.</p>

                {/* Your rank card */}
                <div className="points-bar" style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:24}}>{userRank.icon}</span>
                      <div>
                        <div style={{fontFamily:"var(--syne)",fontSize:15,fontWeight:800}}>{userRank.name}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>{userPoints} points</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      {userStreak>0&&<div className="streak-badge" style={{fontSize:14}}>🔥 {userStreak} day streak</div>}
                      <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>
                        {userRank.max < Infinity ? (userRank.max - userPoints) + " pts to " + (RANKS[RANKS.findIndex(r=>r.name===userRank.name)+1]||RANKS[RANKS.length-1]).name : "Max rank!"}
                      </div>
                    </div>
                  </div>
                  <div className="points-track">
                    <div className="points-fill" style={{
                      width: userRank.max < Infinity ? Math.min(100,((userPoints-userRank.min)/(userRank.max-userRank.min)*100))+"%": "100%",
                      background: userRank.color
                    }}/>
                  </div>
                </div>

            {dashTab==="social"&&<SocialTab
              email={email}
              profile={profile}
              plan={plan}
              following={following}
              followers={followers}
              friendProfiles={friendProfiles}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              searching={searching}
              searchUsers={searchUsers}
              toggleFollow={toggleFollow}
              activeConvo={activeConvo}
              setActiveConvo={setActiveConvo}
              openConvo={openConvo}
              allMessages={allMessages}
              newMsg={newMsg}
              setNewMsg={setNewMsg}
              sendMessage={sendMessage}
              sendingMsg={sendingMsg}
              getConvoMessages={getConvoMessages}
              getConvoPartners={getConvoPartners}
              userRank={userRank}
            />}

            {dashTab==="photos"&&<FoodScanTab
              email={email}
              profile={profile}
              plan={plan}
              goal={goal}
              foodScans={foodScans}
              scanImage={scanImage}
              scanImageBase64={scanImageBase64}
              scanning={scanning}
              scanResult={scanResult}
              scanError={scanError}
              handleImageSelect={handleImageSelect}
              scanFood={scanFood}
              userPoints={userPoints}
              t={t}
              GOALS={t.goals}
            />}

            {dashTab==="reviews"&&<>
              <div className="page-heading" style={{marginBottom:4}}><em>{t.reviewsTabTitle}</em></div>
              <p className="page-sub" style={{marginBottom:14}}>{t.reviewsTabSub}</p>
              {avgRating&&<div className="avg-rating"><div className="avg-number">{avgRating}</div><div className="avg-stars">{"⭐".repeat(Math.round(parseFloat(avgRating)))}</div><div className="avg-count">{reviews.length} review{reviews.length!==1?"s":""}</div></div>}
              {!reviewSubmitted&&!showReviewForm&&<button className="btn-p" style={{marginBottom:18}} onClick={()=>setShowReviewForm(true)}>{t.leaveReview}</button>}
              {reviewSubmitted&&<div className="msg-ok" style={{marginBottom:14}}>Thanks! 🙏</div>}
              {loadingReviews?<div style={{textAlign:"center",padding:20}}><span className="spin"/></div>:reviews.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:"var(--muted)"}}><div style={{fontSize:34,marginBottom:10}}>⭐</div><div>{t.noReviews}</div></div>:reviews.map((r,i)=>(
                <div key={i} className="review-card">
                  <div className="review-header"><div className="review-name">{r.name}</div><div className="review-stars">{"⭐".repeat(r.rating)}</div></div>
                  <div className="review-goal">{r.goal}</div>
                  <div className="review-text">{r.review_text}</div>
                  <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </>}

            {dashTab==="profile"&&<>
              <div className="page-heading" style={{marginBottom:4}}><em>{t.profileTab}</em></div>
              <p className="page-sub" style={{marginBottom:18}}>{t.profileTabSub}</p>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:13,padding:16,marginBottom:14}}>
                {[["Email",email],[t.firstName,profile.name],[t.age,profile.age+" yrs"],[t.weight,profile.weight],[t.level,profile.level],[t.diet,profile.diet],[t.goal,t.goals.find(g=>g.id===goal)?.title||"-"],["Equipment",equip.length+" items"],[t.subscription,plan==="pro"?"PRO — $5/mo":t.free],["Language",LANGUAGES.find(l=>l.code===langCode)?.name||"English"],["Country",country||"-"]].map(([k,v],idx,arr)=>(
                  <div key={k} className="profile-row" style={{borderBottom:idx<arr.length-1?"1px solid var(--border)":"none"}}>
                    <span style={{fontSize:13,color:"#9aabb8",fontWeight:500}}>{k}</span>
                    <span style={{fontSize:13,fontWeight:600,color:k===t.subscription&&plan==="pro"?"var(--gold)":"#f0f4f8"}}>{v}</span>
                  </div>
                ))}
              </div>
              {plan==="basic"&&<div className="pro-upsell" style={{marginBottom:14}}>
                <div className="pro-upsell-title">✦ {t.upgradeProFull}</div>
                <div className="pro-upsell-sub">{t.upgradePro}</div>
                <button className="btn-gold" style={{width:"100%"}}>{t.upgradeProFull}</button>
              </div>}
              <button className="btn-s btn-full" onClick={()=>{setScreen("onboard");setStep(0);setGoal("");setEquip([]);setCodeSent(false);setVerified(false);setCodeInputs(["","","","","",""]);setSentCode("");setPlanSaved(false);setHasGenerated(false);setMsgs([{role:"bot",text:"Hey! I'm your AI coach. I know your full plan and I'm here to help you crush your goals!"}]);}}>{t.startOver}</button>
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
          <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--syne)",fontWeight:700,letterSpacing:"0.08em"}}>{t.appTagline}</div>
        </header>
        <StepsBar/>

        {/* STEP 0 — Email */}
        {step===0&&<div className="page-scroll"><div className="page-inner">
          {!codeSent?(
            <>
              <h1 className="page-heading">{t.verifyTitle.split(",")[0]},<br/><em>{t.verifyTitle.split(",")[1]?.trim()||"verify your email."}</em></h1>
              <p className="page-sub">{t.verifySub}</p>
              <div className="field">
                <label className="field-label">Email</label>
                <input className="finput" type="email" placeholder={t.emailPlaceholder} value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSendCode()}/>
              </div>
              {verifyError&&<div className="msg-err">{verifyError}</div>}
              <div className="trust-bar">
                <div className="trust-item"><span>🔒</span> Secure & private</div>
                <div className="trust-item"><span>✅</span> No credit card for free plan</div>
                <div className="trust-item"><span>💾</span> Plan saved forever</div>
                <div className="trust-item"><span>🔄</span> Cancel anytime</div>
              </div>
              <div className="sticky-bar"><div className="sticky-bar-inner">
                <button className="btn-p" disabled={!email.includes("@")||sending} onClick={handleSendCode}>
                  {sending?<><span className="spin"/> {t.sending}</>:t.sendCode}
                </button>
              </div></div>
            </>
          ):(
            <div className="verify-box">
              <div className="verify-icon">{verified?"✅":"📬"}</div>
              <div className="verify-title">{verified?t.emailVerified:t.checkInbox}</div>
              <div className="verify-sub">
                {verified?t.verifiedSub:<>{t.codeSentTo} <span className="verify-email-shown">{email}</span>. {t.enterBelow}</>}
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
                {verifyError&&<div className="msg-err" style={{marginBottom:12}}>{verifyError}</div>}
                <button className="btn-p" style={{marginBottom:12,width:"100%"}}
                  disabled={codeInputs.join("").length<6||verifying}
                  onClick={()=>verifyCode(codeInputs.join(""))}>
                  {verifying?<><span className="spin"/> {t.verifying}</>:t.verifyBtn}
                </button>
                <div>
                  <button className="resend-btn" disabled={resendTimer>0} onClick={()=>{setCodeInputs(["","","","","",""]);setVerifyError("");handleSendCode();}}>
                    {resendTimer>0?t.resendIn+" "+resendTimer+"s":t.resend}
                  </button>
                  {" · "}
                  <button className="resend-btn" onClick={()=>{setCodeSent(false);setVerifyError("");setCodeInputs(["","","","","",""]);clearInterval(timerRef.current);}}>
                    {t.changeEmail}
                  </button>
                </div>
              </>}
            </div>
          )}
        </div></div>}

        {/* STEP 1 — Location */}
        {step===1&&<div className="page-scroll"><div className="page-inner">
          {translating&&<div style={{position:"fixed",inset:0,background:"rgba(8,12,16,0.9)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
            <span className="spin" style={{width:32,height:32,borderWidth:3}}/>
            <div style={{fontFamily:"var(--syne)",fontSize:16,fontWeight:700,color:"var(--green)"}}>Translating UI…</div>
            <div style={{fontSize:13,color:"var(--muted2)"}}>Powered by Claude AI</div>
          </div>}
          <h1 className="page-heading">{t.locationTitle}<br/><em>{t.locationEm}</em></h1>
          <p className="page-sub">{t.locationSub}</p>
          <div className="field">
            <label className="field-label">{t.country}</label>
            <select className="fselect" value={country} onChange={e=>setCountry(e.target.value)}>
              <option value="">Select country…</option>
              {COUNTRIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          {country&&<div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--muted2)",marginBottom:16}}>
            📏 Units: <strong style={{color:"var(--text)"}}>{isMetric?"Metric (kg, cm)":"Imperial (lbs, ft/in)"}</strong>
          </div>}
          <div className="field">
            <label className="field-label">{t.language}</label>
            <div className="lang-grid">
              {LANGUAGES.map(l=>(
                <div key={l.code} className={["lang-option",langCode===l.code?"sel":""].filter(Boolean).join(" ")} onClick={()=>setLangCode(l.code)}>
                  <span className="lang-flag">{l.flag}</span>
                  {l.name}
                </div>
              ))}
            </div>
          </div>
          <div className="sticky-bar"><div className="sticky-bar-inner">
            <button className="btn-s" onClick={()=>setStep(0)}>{t.back}</button>
            <button className="btn-p" disabled={!country} onClick={()=>setStep(2)}>{t.continue}</button>
          </div></div>
        </div></div>}

        {/* STEP 2 — Reviews */}
        {step===2&&<div className="page-scroll"><div className="page-inner">
          <h1 className="page-heading">{t.reviewsTitle}<br/><em>{t.reviewsEm}</em></h1>
          <p className="page-sub">{t.reviewsSub}</p>
          {onboardReviewsLoading?<div style={{textAlign:"center",padding:40}}><span className="spin"/></div>:
          onboardReviews.length===0?(
            <div style={{textAlign:"center",padding:"36px 20px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:13}}>
              <div style={{fontSize:34,marginBottom:10}}>⭐</div>
              <div style={{fontFamily:"var(--syne)",fontSize:16,fontWeight:700,marginBottom:7}}>{t.noReviews}</div>
              <div style={{fontSize:13,color:"var(--muted2)"}}>{t.noReviewsSub}</div>
            </div>
          ):(
            <>
              <div className="avg-rating">
                <div className="avg-number">{onboardAvg}</div>
                <div className="avg-stars">{"⭐".repeat(Math.round(parseFloat(onboardAvg)))}</div>
                <div className="avg-count">{onboardReviews.length} review{onboardReviews.length!==1?"s":""}</div>
              </div>
              {onboardReviews.map((r,i)=>(
                <div key={i} className="review-card">
                  <div className="review-header"><div className="review-name">{r.name}</div><div className="review-stars">{"⭐".repeat(r.rating)}</div></div>
                  <div className="review-goal">{r.goal}</div>
                  <div className="review-text">{r.review_text}</div>
                  <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </>
          )}
          <div className="sticky-bar"><div className="sticky-bar-inner">
            <button className="btn-s" onClick={()=>setStep(1)}>{t.back}</button>
            <button className="btn-p" onClick={()=>setStep(3)}>{t.continue}</button>
          </div></div>
        </div></div>}

        {/* STEP 3 — Profile */}
        {step===3&&<div className="page-scroll"><div className="page-inner">
          <h1 className="page-heading">{t.profileTitle}<br/><em>{t.profileEm}</em></h1>
          <p className="page-sub">{t.profileSub}</p>
          <div className="frow">
            <div className="field">
              <label className="field-label">{t.firstName}</label>
              <input className="finput" placeholder="Alex" value={profile.name} onChange={e=>setP("name",e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">{t.age}</label>
              <input className="finput" placeholder="28" type="number" value={profile.age} onChange={e=>setP("age",e.target.value)}/>
            </div>
          </div>
          <div className="frow">
            <div className="field">
              <label className="field-label">{t.weight} ({isMetric?"kg":"lb"})</label>
              <div className="finput-unit">
                <input className="finput" placeholder={isMetric?"70":"150"} value={weightRaw}
                  onChange={e=>setWeightRaw(e.target.value.replace(/[^\d]/g,""))}
                  onBlur={handleWeightBlur}/>
                <span className="unit-badge">{isMetric?"kg":"lb"}</span>
              </div>
              <div className="smart-hint">{isMetric?"Type 70 → 70kg":"Type 165 → 165lb"}</div>
            </div>
            <div className="field">
              <label className="field-label">{t.height} ({isMetric?"cm":"ft/in"})</label>
              <div className="finput-unit">
                <input className="finput" placeholder={isMetric?"175":"511"} value={heightRaw}
                  onChange={e=>setHeightRaw(e.target.value.replace(/[^\d]/g,""))}
                  onBlur={handleHeightBlur}/>
                <span className="unit-badge">{isMetric?"cm":"ft"}</span>
              </div>
              <div className="smart-hint">{isMetric?"Type 175 → 175cm":"Type 511 → 5ft 11in"}</div>
            </div>
          </div>
          <div className="frow">
            <div className="field">
              <label className="field-label">{t.fitnessLevel}</label>
              <select className="fselect" value={profile.level} onChange={e=>setP("level",e.target.value)}>
                <option value="">Select…</option>
                {t.levels.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">{t.diet}</label>
              <select className="fselect" value={profile.diet} onChange={e=>setP("diet",e.target.value)}>
                <option value="">Select…</option>
                {t.diets.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="sticky-bar"><div className="sticky-bar-inner">
            <button className="btn-s" onClick={()=>setStep(2)}>{t.back}</button>
            <button className="btn-p" disabled={!profileValid} onClick={()=>setStep(4)}>{t.continue}</button>
          </div></div>
        </div></div>}

        {/* STEP 4 — Goal */}
        {step===4&&<div className="page-scroll"><div className="page-inner">
          <h1 className="page-heading">{t.goalTitle}<br/><em>{t.goalEm}</em></h1>
          <p className="page-sub">{t.goalSub}</p>
          <div className="goal-grid">
            {t.goals.map(g=>(
              <div key={g.id} className={["goal-chip",goal===g.id?"sel":""].filter(Boolean).join(" ")} onClick={()=>setGoal(g.id)}>
                <span className="gi">{g.icon}</span>
                <div><div className="gt">{g.title}</div><div className="gd">{g.desc}</div></div>
                <div className="grad"/>
              </div>
            ))}
          </div>
          <div className="sticky-bar"><div className="sticky-bar-inner">
            <button className="btn-s" onClick={()=>setStep(3)}>{t.back}</button>
            <button className="btn-p" disabled={!goal} onClick={()=>setStep(5)}>{t.continue}</button>
          </div></div>
        </div></div>}

        {/* STEP 5 — Equipment */}
        {step===5&&<div className="page-scroll"><div className="page-inner">
          <h1 className="page-heading">{t.equipTitle}<br/><em>{t.equipEm}</em></h1>
          <p className="page-sub">{t.equipSub}</p>
          {Object.entries(t.equipment).map(([sec,items])=>(
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
            <button className="btn-s" onClick={()=>setStep(4)}>{t.back}</button>
            <button className="btn-p" disabled={equip.length===0} onClick={()=>setStep(6)}>{t.continue}</button>
          </div></div>
        </div></div>}

        {/* STEP 6 — Plan */}
        {step===6&&<div className="page-scroll"><div className="page-inner">
          {!generating?(
            <>
              <h1 className="page-heading">{t.planTitle}<br/><em>{t.planEm}</em></h1>
              <p className="page-sub">{t.planSub}</p>
              <div className="pricing-wrap">
                <div className={["pcard",plan==="basic"?"sel":""].filter(Boolean).join(" ")} onClick={()=>setPlan("basic")}>
                  <div className="pprice">$0 <span>{t.perMonth}</span></div>
                  <div className="pname">{t.basic}</div>
                  <ul className="pfeats">
                    {t.pfeats.basic.map(f=><li key={f}><span className="ck">✓</span>{f}</li>)}
                    {t.pfeats.basicNo.map(f=><li key={f} className="no"><span className="ck">✕</span>{f}</li>)}
                  </ul>
                </div>
                <div className={["pcard featured",plan==="pro"?"sel":""].filter(Boolean).join(" ")} onClick={()=>setPlan("pro")}>
                  <div className="pbadge">{t.mostPopular}</div>
                  <div className="pprice">$5 <span>{t.perMonth}</span></div>
                  <div className="pname">{t.pro}</div>
                  <ul className="pfeats">
                    {t.pfeats.pro.map(f=><li key={f}><span className="ck">✓</span>{f}</li>)}
                  </ul>
                </div>
              </div>
              <div className="summary">
                {[[t.goal,t.goals.find(g=>g.id===goal)?.title||"-"],[t.level,profile.level],[t.equip,equip.length+" items"]].map(([k,v])=>(
                  <div key={k}><div className="slabel">{k}</div><div className="sval">{v}</div></div>
                ))}
              </div>
              {genError&&<div className="msg-err">{genError}</div>}
              <div className="sticky-bar"><div className="sticky-bar-inner">
                <button className="btn-s" onClick={()=>setStep(5)}>{t.back}</button>
                <button className="btn-p" onClick={()=>generate(false)}>{plan==="pro"?t.startPro:t.generateFree}</button>
              </div></div>
            </>
          ):(
            <div style={{textAlign:"center",paddingTop:24}}>
              <div style={{fontSize:48,marginBottom:14}}>⚡</div>
              <h1 className="page-heading" style={{marginBottom:6}}>{t.building}<br/><em>{daysCount}{t.personalized}</em></h1>
              <p className="page-sub" style={{marginBottom:26}}>{t.aboutTime}</p>
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
