// ============================================================
// ORIENTATION — Palier 3e
// 4 phases · 16 élèves · 5 types de pièges
// Outils débloqués progressivement comme dans Papers Please
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

// ─── COULEURS ────────────────────────────────────────────────
const C = {
  wall:"#C9B99A", wallDark:"#B0A080",
  desk:"#6B4423", deskTop:"#8B5E3C", deskLight:"#A0714F",
  felt:"#2D5016", paper:"#FDF6E3", paperDark:"#EDE0C4",
  ink:"#1A0F00", stamp:"#C0392B", gold:"#C8962E",
};

// ─── FILIÈRES 3e ─────────────────────────────────────────────
// Les trois orientations officielles après la 3e.
// Certains élèves peuvent avoir plusieurs orientations valides
// (ex: 2nde GT ET 2nde Pro pour l'informatique).
// La validation accepte toute orientation dans orientationsValides.
const FILIERES = [
  { id:"gt",  label:"2nde GT",  couleur:"#2E7D32", emoji:"📚", desc:"2nde Générale & Technologique" },
  { id:"pro", label:"2nde Pro", couleur:"#1565C0", emoji:"🔧", desc:"Lycée Pro · Bac Pro (ex: CIEl, ASSP…)" },
  { id:"cap", label:"CAP",      couleur:"#E65100", emoji:"⚙️", desc:"CAP (ex: Cuisine, Petite Enfance…)" },
];

// ─── DÉFINITION DES PHASES ───────────────────────────────────
// Chaque phase débloque un nouvel outil et annonce le changement
const PHASES_CONFIG = [
  {
    id: 1,
    titre: "Phase 1 — Premier contact",
    outils: ["dialogue","onisep","tampon"],
    annonce: null, // pas d'annonce au départ
  },
  {
    id: 2,
    titre: "Phase 2 — Le dossier scolaire",
    outils: ["dialogue","dossier","tampon"],
    annonce: {
      titre: "NOUVEAU DOCUMENT DISPONIBLE",
      texte: "À partir d'aujourd'hui, vous avez accès au dossier scolaire des élèves. Bulletin de notes et avis des professeurs. Utilisez-le pour recouper les informations.",
      emoji: "📁",
    },
  },
  {
    id: 3,
    titre: "Phase 3 — La famille",
    outils: ["dialogue","dossier","telephone","onisep","tampon"],
    annonce: {
      titre: "NOUVEL OUTIL : TÉLÉPHONE",
      texte: "Vous pouvez désormais contacter les représentants légaux. Attention : c'est leur souhait qui est officiellement examiné en conseil de classe. Vous avez également accès au livret ONISEP des formations professionnelles.",
      emoji: "📞",
    },
  },
  {
    id: 4,
    titre: "Phase 4 — Pronote",
    outils: ["dialogue","dossier","telephone","pronote","onisep","tampon"],
    annonce: {
      titre: "NOUVEL OUTIL : PRONOTE",
      texte: "Accès au logiciel de suivi scolaire. Absences, retards, historique. Certaines moyennes peuvent être trompeuses sans ces données.",
      emoji: "💻",
    },
  },
];

// ─── LES 16 ÉLÈVES DE 3e ─────────────────────────────────────
const ELEVES = [

  // ════════════════════════════════════════
  // PHASE 1 — Discours de l'élève uniquement
  // Le joueur n'a PAS le dossier → il doit
  // se fier uniquement à ce que dit l'élève.
  // ════════════════════════════════════════

  {
    id:1, phase:1, seed:1042,
    nom:"MARTIN", prenom:"Lucas", age:15,
    moyenne:15.5,
    // Ce que l'élève dit de lui-même
    resumeVisible: "15 ans · Semble sûr de lui · Parle bien",
    orientationsValides:["gt"],
    piegeType: null,
    raisonnement:"Lucas parle clairement d'un projet d'ingénieur, évoque les maths et la physique avec précision. Son discours est cohérent et ambitieux. Lycée général.",
    piegeDescription: null,
    repliques:[
      "Bonjour. Je sais exactement ce que je veux faire.",
      "Je veux être ingénieur ou chercheur en physique.",
      "J'adore les maths, la physique, l'informatique.",
      "Je suis prêt à étudier longtemps, vraiment.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Ingénieur ou chercheur. Je sais pas encore exactement, mais dans les sciences c'est sûr.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"Autant qu'il faut. 5, 6 ans, ça me pose pas de problème.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"Maths, physique, et un peu d'info. Je code à la maison pour m'amuser.", emoji:"📖" },
    ],
    // Dossier page 1 (visible phase 2+)
    dossier: {
      bulletinResume:"Maths 18/20 · Physique 17/20 · Français 14/20 · Histoire 13/20 · Anglais 15/20",
      avisProf:"Élève sérieux et autonome. Résultats excellents, aucune lacune notable. Investissement régulier depuis la 6e.",
      absencesIndice: null,
    },
    // Famille (visible phase 3+)
    famille: {
      reponse:"Son père : 'Lucas travaille beaucoup à la maison, il est passionné. On le soutient à fond dans ses projets scientifiques.'",
      concordance:"confirme", // confirme / contredit / embellit / absente
    },
    // Pronote (visible phase 4+)
    pronote: {
      absences:"2 demi-journées d'absence (maladie). Aucun retard.",
      retards: 0,
      absencesParMatiere:"Aucune absence notable par matière.",
      alertes: null,
    },
  },

  {
    id:2, phase:1, seed:2817,
    nom:"DUBOIS", prenom:"Emma", age:14,
    moyenne:8.0,
    resumeVisible: "14 ans · Très déterminée · Pressée",
    orientationsValides:["cap","pro"],
    piegeType: null,
    raisonnement:"Emma parle avec passion de la mode. Deux voies valides : CAP Métiers de la mode (flou ou tailleur, 2 ans) ou Bac Pro Métiers de la couture et de la confection (3 ans). Avec 8/20, le CAP est plus accessible mais le Bac Pro reste possible.",
    piegeDescription: null,
    repliques:[
      "Salut. Je sais déjà ce que je veux faire.",
      "La couture, le stylisme, c'est ma vie.",
      "Je veux pas passer 5 ans sur les bancs de l'école.",
      "J'ai déjà un book de créations.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Styliste ou créatrice de mode. J'ai déjà un book avec mes créations.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"2 ou 3 ans max. Je veux travailler vite, créer ma marque.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"Les arts appliqués et le dessin. Les maths je comprends rien et ça m'intéresse pas.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Arts 17/20 · EPS 16/20 · Français 10/20 · Maths 5/20 · Sciences 6/20",
      avisProf:"Talent artistique indéniable. Résultats très insuffisants dans les matières générales. Projet professionnel dans la mode très ancré. Peu de motivation pour les enseignements théoriques.",
      absencesIndice: null,
    },
    famille: {
      reponse:"Sa mère : 'Je voudrais qu'elle fasse le lycée général, avoir le bac général c'est important. Mais Emma est têtue...'",
      concordance:"contredit",
    },
    pronote: {
      absences:"6 demi-journées d'absence. 3 retards.",
      retards:3,
      absencesParMatiere:"Absences concentrées en maths et sciences.",
      alertes:"Absentéisme léger mais ciblé sur les matières difficiles.",
    },
  },

  {
    id:3, phase:1, seed:3391,
    nom:"BERNARD", prenom:"Noah", age:15,
    // PIÈGE : demande un CAP Programmation qui n'existe pas
    resumeVisible: "15 ans · Très sûr de lui · Projet précis",
    moyenne:12.0,
    orientationsValides:["gt","pro"],
    piegeType:"projet_irrealiste",
    raisonnement:"PIÈGE : Noah demande un 'CAP Programmation' qui n'existe pas. La bonne voie est 2nde GT (STI2D) ou 2nde Pro (Bac Pro CIEl — anciennement SN). Les deux sont valides.",
    piegeDescription:"⚠️ PIÈGE : Noah demande un 'CAP Programmation'… qui n'existe pas ! Les deux bonnes réponses sont : 2nde GT (menant à STI2D) ou 2nde Pro (Bac Pro CIEl, ex-SN). Le CAP n'existe pas en informatique.",
    repliques:[
      "Bonjour ! Je sais exactement ce que je veux.",
      "Je veux faire un CAP de programmation.",
      "J'ai déjà créé plusieurs jeux en Python.",
      "Je veux rentrer vite dans le métier.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Développeur de jeux vidéo. Je veux faire un CAP programmation pour aller vite !", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"3 ou 4 ans. Pas plus. Un CAP c'est rapide non ?", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"La techno et les maths. Je code des jeux en Python à la maison.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Techno 16/20 · Maths 13/20 · Physique 12/20 · Français 8/20 · Anglais 10/20",
      avisProf:"Très bon profil technique. A créé un jeu fonctionnel en Python. Projet professionnel affirmé dans le numérique. Vérifier la réalité de la formation demandée.",
      absencesIndice: null,
    },
    famille: {
      reponse:"Son père : 'Noah est passionné d'informatique depuis tout petit. Son grand frère a fait un BTS info, ça s'est bien passé.'",
      concordance:"confirme",
    },
    pronote: {
      absences:"1 demi-journée d'absence. Aucun retard.",
      retards:0,
      absencesParMatiere:"Aucune absence notable.",
      alertes:null,
    },
  },

  {
    id:4, phase:1, seed:8301,
    nom:"RENARD", prenom:"Luc", age:16,
    // PIÈGE : veut être pilote de ligne avec un niveau faible
    resumeVisible: "16 ans · Rêveur · Projet très ambitieux",
    moyenne:7.0,
    orientationsValides:["pro"],
    piegeType:"projet_irrealiste",
    raisonnement:"PIÈGE : Luc veut être pilote de ligne mais évoque lui-même qu'il 'décroche souvent'. L'ATPL exige un excellent niveau. La voie réaliste : Bac Pro Aéronautique → BTS → expérience.",
    piegeDescription:"⚠️ PIÈGE : Luc veut être pilote de ligne. À l'oral il admet décrocher souvent. L'ATPL est inaccessible avec ce profil. Bac Pro Aéronautique est la voie progressive réaliste.",
    repliques:[
      "Bonjour. Je sais ce que je veux faire depuis tout petit.",
      "Je veux être pilote de ligne.",
      "Mon oncle est mécanicien avion, il m'a donné le goût.",
      "Les cours… j'accroche pas trop, mais je suis motivé.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Pilote de ligne ! C'est mon rêve depuis que j'ai 6 ans.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"Euh… j'sais pas trop combien ça prend. 3-4 ans ?", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"L'EPS. Les cours en général… je décroche souvent, je vais pas mentir.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"EPS 15/20 · Techno 9/20 · Maths 6/20 · Physique 5/20 · Français 7/20",
      avisProf:"Élève en grande difficulté académique. Décrochage progressif depuis la 5e. Projet professionnel très ambitieux. L'environnement de l'aviation l'attire fortement — son oncle est mécanicien avion.",
      absencesIndice: null,
    },
    famille: {
      reponse:"Sa mère : 'Luc est très motivé pour l'aviation. Son oncle lui a proposé un apprentissage en mécanique avion si ça ne marche pas autrement.'",
      concordance:"confirme",
    },
    pronote: {
      absences:"14 demi-journées d'absence. 8 retards.",
      retards:8,
      absencesParMatiere:"Absences fréquentes en maths, physique et français.",
      alertes:"⚠️ Absentéisme préoccupant. Pattern de décrochage visible depuis la 5e.",
    },
  },

  // ════════════════════════════════════════
  // PHASE 2 — + Dossier scolaire page 1
  // Le joueur voit maintenant le bulletin
  // et l'avis des professeurs.
  // ════════════════════════════════════════

  {
    id:5, phase:2, seed:4056,
    nom:"THOMAS", prenom:"Léa", age:15,
    // PIÈGE : dit médecine, note du prof révèle sensibilité au sang
    resumeVisible: "15 ans · Empathique · Projet santé",
    moyenne:13.0,
    orientationsValides:["gt"],
    piegeType:"discours_vs_dossier",
    raisonnement:"Léa dit médecine mais l'avis du prof signale qu'elle ne supporte pas la vue du sang. Lycée Général est correct, mais l'orientation vers psychologie ou travail social serait plus adaptée que médecine.",
    piegeDescription:"⚠️ NUANCE : Léa dit 'médecine' mais l'avis du prof révèle une forte sensibilité au sang. Lycée Général est juste, mais noter l'incompatibilité avec médecine chirurgicale.",
    repliques:[
      "Bonjour. Je veux soigner les gens.",
      "Je pense à faire médecine.",
      "J'aime beaucoup les SVT et la chimie.",
      "En fait j'aime surtout écouter et aider les gens.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Médecine ! Soigner les gens c'est beau. Enfin… je crois.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"Je suis prête à étudier longtemps. Médecine c'est 9 ans non ?", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"SVT et chimie. Mais j'aime surtout parler aux gens, les écouter.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"SVT 15/20 · Chimie 14/20 · Maths 13/20 · Français 14/20 · Anglais 12/20",
      avisProf:"Excellent profil, élève sérieuse et empathique. À noter : très grande sensibilité émotionnelle, malaise lors d'une dissection en 4e. Profil très orienté vers l'écoute et le lien social.",
      absencesIndice: null,
    },
    famille: {
      reponse:"Sa mère, infirmière : 'Léa veut faire médecine mais elle est trop sensible. Moi j'ai mis des années à m'habituer au sang. Je pense qu'elle devrait réfléchir à psychologie.'",
      concordance:"contredit",
    },
    pronote: {
      absences:"3 demi-journées d'absence. 1 retard.",
      retards:1,
      absencesParMatiere:"Aucune absence notable par matière.",
      alertes:null,
    },
  },

  {
    id:6, phase:2, seed:5723,
    nom:"LEROY", prenom:"Hugo", age:16,
    // PIÈGE : dit vouloir général mais dossier montre 8/20
    resumeVisible: "16 ans · Déterminé · Parle bien",
    moyenne:9.0,
    orientationsValides:["cap","pro"],
    piegeType:"discours_vs_dossier",
    raisonnement:"Hugo parle bien et semble motivé, mais le dossier révèle 9/20 de moyenne avec un projet cuisine très concret. Bac Pro Cuisine est la bonne voie malgré le discours ambigu.",
    piegeDescription:"⚠️ ATTENTION : Hugo se présente bien à l'oral mais le dossier montre 9/20. Son vrai projet est la cuisine (option 18/20). Ne pas se laisser influencer par l'aisance orale.",
    repliques:[
      "Bonjour. Je suis motivé et je travaille dur.",
      "J'hésite entre le lycée général et autre chose.",
      "J'aide mon père au restaurant depuis mes 12 ans.",
      "Les cours classiques c'est pas trop mon truc.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Cuisinier. Enfin… j'hésite encore. Peut-être le général d'abord ?", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"Je sais pas trop. Je veux pas faire trop long mais bon.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"La cuisine surtout. Et l'EPS. Les autres matières… mouais.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Option Cuisine 18/20 · EPS 17/20 · Maths 7/20 · Français 9/20 · Sciences 8/20",
      avisProf:"Hugo présente bien et s'exprime avec aisance. Résultats académiques faibles malgré un discours convaincant. Excellent en pratique culinaire. Projet cuisine ancré depuis l'enfance.",
      absencesIndice:null,
    },
    famille: {
      reponse:"Son père, restaurateur : 'Hugo est né dans la cuisine. Il m'aide depuis ses 12 ans. Je compte sur lui pour reprendre le restaurant un jour.'",
      concordance:"confirme",
    },
    pronote: {
      absences:"4 demi-journées. 2 retards.",
      retards:2,
      absencesParMatiere:"Absences légères en maths et français.",
      alertes:null,
    },
  },

  {
    id:7, phase:2, seed:9015,
    nom:"PETIT", prenom:"Jade", age:15,
    // PIÈGE : sous-estimation de soi — hésitante à l'oral, dossier 16/20
    resumeVisible: "15 ans · Discrète · Peu sûre d'elle",
    moyenne:16.0,
    orientationsValides:["gt"],
    piegeType:"sous_estimation",
    raisonnement:"Jade se déprécie à l'oral et parle d'aller en lycée pro 'pour être sûre'. Mais le dossier est exceptionnel (16/20). Le lycée général s'impose clairement.",
    piegeDescription:"⚠️ PIÈGE : Jade se sous-estime fortement. Ne pas se laisser influencer par son manque de confiance. Le dossier parle clairement : 16/20, lycée général.",
    repliques:[
      "Bonjour… je sais pas trop ce que je veux.",
      "Je suis pas très bonne en fait.",
      "Peut-être le lycée pro pour être sûre ?",
      "J'ai du mal à me projeter dans les études longues.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Je sais pas… droit peut-être ? Ou prof ? Mais c'est long et j'suis pas sûre d'en être capable.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"Le moins possible je crois. J'ai peur de pas y arriver si c'est trop long.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"J'aime bien tout en fait. Surtout l'histoire et les langues. Mais je suis pas excellente.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Histoire 18/20 · Langues 17/20 · Français 16/20 · Maths 15/20 · Sciences 14/20",
      avisProf:"Jade est l'une des meilleures élèves du niveau mais se sous-estime énormément. Régulièrement dans le top 3 de sa classe depuis la 6e. Ne pas se fier à son discours peu confiant.",
      absencesIndice:null,
    },
    famille: {
      reponse:"Sa mère : 'Jade dit qu'elle est pas bonne mais c'est faux. On essaie de la motiver mais elle se compare toujours aux autres. Son père et moi on veut le lycée général pour elle.'",
      concordance:"confirme",
    },
    pronote: {
      absences:"0 absence. 0 retard.",
      retards:0,
      absencesParMatiere:"Aucune absence.",
      alertes:null,
    },
  },

  {
    id:8, phase:2, seed:7492,
    nom:"SIMON", prenom:"Karim", age:15,
    // PIÈGE : absentéisme sélectif — 14/20 mais prof signale des absences en sciences
    resumeVisible: "15 ans · Confiant · Projet précis",
    moyenne:14.0,
    orientationsValides:["gt"],
    piegeType:"absenteisme",
    raisonnement:"14/20 semble bon pour le lycée général, mais l'avis du prof signale que Karim sèche régulièrement les sciences qu'il n'aime pas. Son vrai profil est technologique (gestion/éco).",
    piegeDescription:"⚠️ PIÈGE : La moyenne de 14/20 masque un absentéisme sélectif en sciences. L'avis du prof est clair : ses bonnes notes viennent des matières qu'il choisit d'honorer. Lycée Techno STMG plus adapté.",
    repliques:[
      "Bonjour. J'ai une bonne moyenne donc ça devrait aller.",
      "Je veux faire quelque chose dans la gestion ou le commerce.",
      "Les maths et l'économie c'est vraiment mon truc.",
      "Les sciences… bof, c'est pas vraiment utile pour moi.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Gestion, management, peut-être commerce international. J'aime les chiffres et les gens.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"4-5 ans. École de commerce si possible.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"Maths, économie, anglais. Les sciences physiques et la bio… j'y vais moins souvent.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Économie 17/20 · Maths 16/20 · Anglais 15/20 · Physique 8/20* · SVT 7/20*",
      avisProf:"Karim est brillant dans les matières qui l'intéressent. Souvent absent en certaines matières (notes marquées *). Sa moyenne globale mérite un examen attentif matière par matière.",
      absencesIndice:"* Notes basées sur peu d'évaluations (absences fréquentes en sciences)",
    },
    famille: {
      reponse:"Son père : 'Karim a 14 de moyenne, il doit aller au lycée général. C'est ce qu'on veut pour lui.'",
      concordance:"contredit",
    },
    pronote: {
      absences:"11 demi-journées d'absence. 4 retards.",
      retards:4,
      absencesParMatiere:"⚠️ Physique : 7 absences · SVT : 6 absences · Maths : 0 absence · Économie : 0 absence",
      alertes:"⚠️ Absences concentrées sur un groupe de matières très homogène. Aucune absence dans les autres matières.",
    },
  },

  // ════════════════════════════════════════
  // PHASE 3 — + Téléphone famille
  // C'est le souhait des représentants légaux
  // qui est officiellement examiné en conseil.
  // ════════════════════════════════════════

  {
    id:9, phase:3, seed:1610,
    nom:"BLANC", prenom:"Théo", age:16,
    // PIÈGE : pression économique — élève veut général, famille veut boulangerie
    resumeVisible: "16 ans · Calme · Parle de projets d'avenir",
    moyenne:11.5,
    orientationsValides:["gt"],
    piegeType:"pression_economique",
    raisonnement:"Théo veut le lycée général mais la famille pousse pour qu'il reprenne la boulangerie. 11,5/20 avec un profil gestion : STMG (Lycée Techno) est le meilleur compromis entre ses souhaits et la réalité.",
    piegeDescription:"⚠️ DISCORDANCE : Théo veut le général mais a 11,5/20 et la famille veut la boulangerie. Le lycée techno STMG est le meilleur compromis : il ouvre des portes en gestion tout en valorisant un profil pratique.",
    repliques:[
      "Bonjour. Je veux continuer les études.",
      "J'aimerais faire le lycée général.",
      "Mon père a une boulangerie mais moi j'ai d'autres envies.",
      "Je veux pas forcément reprendre le commerce familial.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Je sais pas encore. Peut-être gestion ou comptabilité. Pas forcément la boulangerie.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"3-4 ans. Le lycée général d'abord, après on verra.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"L'économie et les maths. Pas trop les sciences pures.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Économie 14/20 · Maths 13/20 · Français 11/20 · Sciences 9/20 · Histoire 12/20",
      avisProf:"Élève sérieux, profil économie-gestion marqué. Résultats en sciences pures nettement plus faibles. Situation familiale à prendre en compte dans l'orientation.",
      absencesIndice:null,
    },
    famille: {
      reponse:"Son père : 'Je veux que Théo reprenne la boulangerie. Il a pas besoin du lycée général pour ça. Un lycée pro commerce ou même qu'il commence à travailler avec moi. C'est notre commerce familial.'",
      concordance:"contredit",
    },
    pronote: {
      absences:"5 demi-journées. 1 retard.",
      retards:1,
      absencesParMatiere:"Absences légères et dispersées.",
      alertes:null,
    },
  },

  {
    id:10, phase:3, seed:1184,
    nom:"GARCIA", prenom:"Inès", age:15,
    // PIÈGE : famille embellit la réalité
    resumeVisible: "15 ans · Travailleuse · Résultats moyens",
    moyenne:10.0,
    orientationsValides:["cap","pro"],
    piegeType:"famille_embellit",
    raisonnement:"Dossier moyen (10/20) avec un projet aide à la personne. La famille dit qu'elle 'travaille beaucoup mieux à la maison' — information non vérifiable. Se fier au dossier : Bac Pro ASSP.",
    piegeDescription:"⚠️ PIÈGE : La famille dit qu'Inès 'travaille bien mieux à la maison'. Ce type d'argument non vérifiable ne doit pas contrebalancer un dossier de 10/20. Bac Pro ASSP reste la bonne orientation.",
    repliques:[
      "Bonjour. Je veux travailler avec les personnes âgées.",
      "J'ai fait un stage en EHPAD, j'ai adoré.",
      "À l'école c'est pas terrible mais je suis motivée.",
      "J'aime aider les gens, c'est vraiment ma vocation.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Aide-soignante ou auxiliaire de vie. J'ai fait un stage en EHPAD et c'était vraiment bien.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"2-3 ans. Je veux travailler assez vite.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"Le français et les SVT. Les maths c'est dur pour moi.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Français 12/20 · SVT 11/20 · EPS 14/20 · Maths 7/20 · Physique 8/20",
      avisProf:"Élève appliquée, résultats contrastés. Profil aidant très marqué, stage en EHPAD exceptionnel selon le retour de l'établissement. Attention au discours familial sur son niveau réel.",
      absencesIndice:null,
    },
    famille: {
      reponse:"Sa mère : 'Inès travaille beaucoup mieux à la maison qu'à l'école. Elle est très sérieuse. On pense qu'elle pourrait faire le lycée général. Les notes ne reflètent pas sa vraie valeur.'",
      concordance:"embellit",
    },
    pronote: {
      absences:"7 demi-journées. 3 retards.",
      retards:3,
      absencesParMatiere:"Absences en maths et physique principalement.",
      alertes:"Absentéisme modéré ciblé sur les matières difficiles.",
    },
  },

  {
    id:11, phase:3, seed:1265,
    nom:"ROUX", prenom:"Axel", age:15,
    // PIÈGE : famille trop ambitieuse — pousse vers général avec 9/20
    resumeVisible: "15 ans · Réservé · Semble sous pression",
    moyenne:9.0,
    orientationsValides:["pro"],
    piegeType:"famille_ambitieuse",
    raisonnement:"Axel veut lui-même le lycée technologique mais sa famille pousse pour le général malgré 9/20. 9/20 avec un profil technique solide : STI2D est la bonne voie, pas le général.",
    piegeDescription:"⚠️ PIÈGE : La famille veut le lycée général malgré 9/20. C'est le souhait officiel examiné en conseil — mais l'intérêt de l'élève prime. STI2D (Lycée Techno) correspond à son profil et à ses résultats.",
    repliques:[
      "Bonjour… mes parents m'ont dit de demander le lycée général.",
      "Moi en fait j'aimerais bien la techno.",
      "Je suis bon en technologie et en physique appliquée.",
      "Mais mes parents veulent le général absolument.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Technicien en maintenance ou en électronique. Mais mes parents veulent que je fasse 'mieux' qu'eux.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"3-4 ans ça m'irait. Le général c'est mes parents qui veulent ça, pas moi.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"Techno et physique appliquée. Les maths théoriques c'est dur. Le français aussi.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Techno 15/20 · Physique app. 14/20 · Maths 9/20 · Français 8/20 · Histoire 7/20",
      avisProf:"Axel excelle en technologie et en physique appliquée. Résultats en maths et français nettement plus faibles. Décalage notable entre le souhait de l'élève et celui de la famille.",
      absencesIndice:null,
    },
    famille: {
      reponse:"Son père : 'On veut le lycée général pour Axel. On a fait des sacrifices pour qu'il réussisse mieux que nous. Il doit avoir le bac général, c'est non négociable.'",
      concordance:"contredit",
    },
    pronote: {
      absences:"3 demi-journées. 2 retards.",
      retards:2,
      absencesParMatiere:"Absences légères en français et histoire.",
      alertes:null,
    },
  },

  {
    id:12, phase:3, seed:1347,
    nom:"VINCENT", prenom:"Sofia", age:14,
    // PIÈGE : famille injoignable + dossier ambigu
    resumeVisible: "14 ans · Discrète · Situation floue",
    moyenne:11.5,
    orientationsValides:["gt"],
    piegeType:"famille_absente",
    raisonnement:"Sans réponse de la famille et avec un dossier ambigu (11,5/20 avec des points forts en langues), le lycée général reste la meilleure option : elle garde toutes les portes ouvertes.",
    piegeDescription:"⚠️ INFORMATION MANQUANTE : Famille injoignable. En l'absence du souhait officiel des représentants légaux, appliquer le principe de précaution : lycée général pour conserver toutes les options.",
    repliques:[
      "Bonjour… je sais pas trop ce que je veux.",
      "J'aime bien les langues et l'histoire.",
      "Ma situation à la maison c'est un peu compliqué.",
      "Je préfère pas trop en parler.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"J'ai pas vraiment de projet. Peut-être prof de langues un jour ? Ou traductrice ?", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"Je sais pas. Je vis un peu au jour le jour en ce moment.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"Les langues et l'histoire-géo. Les maths c'est moyen mais je m'accroche.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Langues 16/20 · Histoire 14/20 · Français 13/20 · Maths 10/20 · Sciences 9/20",
      avisProf:"Élève discrète mais avec un potentiel réel en langues et lettres. Situation familiale fragile signalée par l'assistante sociale. À accompagner avec bienveillance. Lycée général recommandé.",
      absencesIndice:null,
    },
    famille: {
      reponse:"📵 Appel sans réponse. Messagerie pleine. Aucun contact établi avec les représentants légaux.",
      concordance:"absente",
    },
    pronote: {
      absences:"12 demi-journées. 5 retards.",
      retards:5,
      absencesParMatiere:"Absences dispersées sur toutes les matières.",
      alertes:"⚠️ Absentéisme notable. Signalement assistante sociale en cours.",
    },
  },

  // ════════════════════════════════════════
  // PHASE 4 — + Pronote
  // Les absences révèlent ce que le dossier
  // et la famille ne montrent pas.
  // ════════════════════════════════════════

  {
    id:13, phase:4, seed:1428,
    nom:"FONTAINE", prenom:"Mathis", age:15,
    // PIÈGE : absentéisme confirmé par Pronote — 13/20 mais 22 absences en maths
    resumeVisible: "15 ans · Sûr de lui · Bonne impression",
    moyenne:13.0,
    orientationsValides:["gt"],
    piegeType:"absenteisme_pronote",
    raisonnement:"13/20 semble correct pour le général, mais Pronote révèle 22 absences en maths. Sans ces absences, la vraie moyenne en maths serait probablement insuffisante. Lycée Techno STMG plus sûr.",
    piegeDescription:"⚠️ PIÈGE PRONOTE : Mathis a 13/20 mais 22 absences en maths (notes manquantes). Sa vraie maîtrise des maths est inconnue. Le risque de mise en échec au lycée général est réel. STMG recommandé.",
    repliques:[
      "Bonjour. J'ai une bonne moyenne, le général ça devrait passer.",
      "Je veux faire quelque chose en économie ou en commerce.",
      "J'ai eu quelques absences mais c'était pour de bonnes raisons.",
      "Je suis capable de faire le lycée général j'en suis sûr.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Commerce ou management. Peut-être école de commerce plus tard.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"5 ans. Bac général puis école de commerce.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"L'économie et l'anglais. Les maths j'ai eu quelques soucis cette année mais c'est ponctuel.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Économie 16/20 · Anglais 15/20 · Français 13/20 · Maths 11/20* · Sciences 10/20",
      avisProf:"Bon profil en économie et langues. Les résultats en maths sont marqués d'un astérisque — nombre d'évaluations à vérifier. Discours familial optimiste sur la situation.",
      absencesIndice:"* Maths : note calculée sur peu d'évaluations",
    },
    famille: {
      reponse:"Sa mère : 'Mathis est intelligent et travailleur. Les absences c'était à cause d'une période difficile mais c'est réglé. On veut le lycée général pour lui.'",
      concordance:"embellit",
    },
    pronote: {
      absences:"22 demi-journées. 6 retards.",
      retards:6,
      absencesParMatiere:"⚠️ Maths : 22 absences (soit 11 cours manqués sur 30) · Économie : 0 absence · Anglais : 1 absence",
      alertes:"⚠️ 22 demi-journées d'absence en maths sur l'année. Note calculée sur un nombre réduit d'évaluations. Niveau réel dans cette matière difficile à estimer.",
    },
  },

  {
    id:14, phase:4, seed:1509,
    nom:"HENRY", prenom:"Camille", age:15,
    // PIÈGE : bonne moyenne générale mais absences ciblées en techno
    resumeVisible: "15 ans · Sociable · Projet social",
    moyenne:13.5,
    orientationsValides:["gt"],
    piegeType:"absenteisme_pronote",
    raisonnement:"Camille veut le lycée général filière lettres/SES. 13,5/20 avec des absences uniquement en techno (matière qu'elle n'aime pas). Ici l'absentéisme ne contredit pas l'orientation : il la confirme.",
    piegeDescription:"💡 FAUX PIÈGE : Les absences de Camille sont en techno, matière qu'elle n'aime pas et qui ne sera pas au lycée général. Son dossier confirme le lycée général filière SES.",
    repliques:[
      "Bonjour. Je veux faire quelque chose avec les gens.",
      "Les sciences humaines m'intéressent vraiment.",
      "J'adore l'histoire, la géo, les langues.",
      "La technologie c'est vraiment pas mon truc.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Travail social, ou peut-être journalisme. Quelque chose en contact avec les gens.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"4-5 ans. Bac général puis fac de sciences humaines ou IEP.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"Histoire-géo, français, langues. La techno je vais pas souvent, ça m'intéresse vraiment pas.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Histoire 16/20 · Français 15/20 · Langues 14/20 · Maths 13/20 · Techno 9/20*",
      avisProf:"Excellent profil lettres/SES. Résultats très solides dans toutes les matières sauf la techno. Les absences en techno méritent une lecture attentive.",
      absencesIndice:"* Techno : note sur peu d'évaluations (absences)",
    },
    famille: {
      reponse:"Sa mère : 'Camille adore les études. Elle lit beaucoup, elle est curieuse de tout. Le lycée général c'est une évidence pour nous.'",
      concordance:"confirme",
    },
    pronote: {
      absences:"9 demi-journées. 2 retards.",
      retards:2,
      absencesParMatiere:"Techno : 9 absences · Toutes les autres matières : 0 absence",
      alertes:"Absences concentrées uniquement en techno. Aucune absence dans les autres matières.",
    },
  },

  {
    id:15, phase:4, seed:2014,
    nom:"LAMBERT", prenom:"Tom", age:16,
    // CAS COMPLEXE : multi-discordance — tout se contredit
    resumeVisible: "16 ans · Charmeur · Discours très convaincant",
    moyenne:12.0,
    orientationsValides:["pro","cap"],
    piegeType:"multi_discordance",
    raisonnement:"Tom est convaincant à l'oral, la famille pousse pour le général, mais le dossier montre 12/20 irrégulier et Pronote révèle un absentéisme massif et sélectif. Bac Pro Vente/Commerce est la voie réaliste.",
    piegeDescription:"⚠️ CAS COMPLEXE : Tom dit général, famille dit général, dossier dit 'peut-être', Pronote dit non. L'absentéisme massif dans les matières clés du lycée général est rédhibitoire. Bac Pro Commerce.",
    repliques:[
      "Bonjour. Je pense pouvoir faire le lycée général.",
      "Je suis quelqu'un de très motivé quand ça m'intéresse.",
      "J'ai un peu décroché cette année mais c'est conjoncturel.",
      "Je suis commercial dans l'âme, les gens m'écoutent.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Commercial, chef de projet, manager. Je suis à l'aise avec les gens, je sais convaincre.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"Bac général puis école de commerce. 5 ans.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"Le français et l'anglais. Les maths et les sciences c'est variable selon l'année.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Français 14/20 · Anglais 13/20 · Maths 10/20* · Sciences 8/20* · Histoire 12/20",
      avisProf:"Tom est très à l'aise à l'oral et sait se vendre. Résultats très irréguliers — certaines notes reposent sur peu d'évaluations. Discours familial enthousiaste à recouper avec Pronote.",
      absencesIndice:"* Notes partielles (absences nombreuses)",
    },
    famille: {
      reponse:"Son père : 'Tom est brillant. Il a juste eu une mauvaise année. On veut absolument le lycée général. Il a le potentiel pour les grandes écoles.'",
      concordance:"embellit",
    },
    pronote: {
      absences:"31 demi-journées. 12 retards.",
      retards:12,
      absencesParMatiere:"⚠️ Maths : 18 absences · Sciences : 15 absences · Français : 2 absences · Anglais : 1 absence",
      alertes:"⚠️ Absentéisme sévère concentré sur les maths et sciences. Ces matières présentent un taux d'absence très élevé comparé au reste.",
    },
  },

  {
    id:16, phase:4, seed:2115,
    nom:"MOREL", prenom:"Manon", age:15,
    // PIÈGE : tout semble cohérent sauf Pronote révèle un redoublement caché
    resumeVisible: "15 ans · Sereine · Dossier apparemment solide",
    moyenne:14.5,
    orientationsValides:["gt"],
    piegeType:"redoublement_cache",
    raisonnement:"Tout pointe vers le lycée général. Mais Pronote révèle que Manon a redoublé la 5e — et la moyenne de 14,5/20 est celle d'une élève en 3e pour la deuxième fois. Lycée général reste correct, mais avec un suivi renforcé.",
    piegeDescription:"💡 NUANCE : Manon a 14,5/20 mais Pronote révèle un redoublement en 5e. Cette moyenne est donc celle d'une élève plus âgée que la moyenne. Lycée général reste la bonne orientation mais mérite un accompagnement.",
    repliques:[
      "Bonjour. Je travaille dur et j'aime l'école.",
      "J'ai eu une période difficile en 5e mais c'est derrière moi.",
      "Maintenant je suis vraiment investie.",
      "Je veux faire le lycée général, c'est mon objectif.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",       r:"Enseignante ou chercheuse. J'aime beaucoup les SVT et la chimie.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",      r:"Longtemps. Master ou doctorat si possible.", emoji:"📅" },
      { q:"Tes matières préférées ?",         r:"SVT, chimie, et aussi les maths. J'ai redoublé la 5e donc je suis peut-être un peu en avance sur mes camarades.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"SVT 17/20 · Chimie 16/20 · Maths 15/20 · Français 13/20 · Histoire 12/20",
      avisProf:"Excellente élève, très investie, progression remarquable. Dossier solide. Parcours scolaire à examiner dans son intégralité via Pronote.",
      absencesIndice:null,
    },
    famille: {
      reponse:"Sa mère : 'Manon a eu du mal en 5e mais elle s'est vraiment ressaisie. On est très fiers. Le lycée général c'est la suite logique pour elle.'",
      concordance:"confirme",
    },
    pronote: {
      absences:"2 demi-journées. 0 retard.",
      retards:0,
      absencesParMatiere:"Aucune absence notable.",
      alertes:"📋 HISTORIQUE : Redoublement en classe de 5e (2021-2022). Motif : résultats insuffisants. Progression remarquable depuis. Âge actuel : 15 ans (année de retard par rapport à la cohorte standard).",
    },
  },
,
  {
    id:17, phase:4, seed:4417,
    nom:"DUPUIS", prenom:"Rémi", age:15,
    resumeVisible: "15 ans · Passionné · Très sûr de son projet",
    moyenne:11.0,
    orientationsValides:["cap"],
    piegeType:"projet_irrealiste",
    raisonnement:"PIÈGE : Rémi veut un Bac Pro Pâtissier qui n'existe pas. Il n'existe qu'un CAP Pâtissier. La famille pousse pour le Bac Pro sans vérifier les formations disponibles.",
    piegeDescription:"⚠️ PIÈGE : Il n'existe pas de Bac Pro Pâtissier — uniquement un CAP Pâtissier (2 ans). Consulter l'ONISEP confirme l'absence de Bac Pro dans ce secteur.",
    repliques:[
      "Bonjour ! Je sais exactement ce que je veux faire.",
      "Je veux faire un Bac Pro pâtisserie.",
      "J'aide mon oncle en pâtisserie tous les week-ends.",
      "Ma famille veut que j'aie un bac, pas juste un CAP.",
    ],
    questions:[
      { q:"Ton projet professionnel ?",    r:"Pâtissier ! Je veux ouvrir ma propre boutique un jour.", emoji:"🎯" },
      { q:"Combien d'années d'études ?",   r:"Mon père dit que le Bac Pro c'est mieux que le CAP, donc 3 ans.", emoji:"📅" },
      { q:"Tes matières préférées ?",      r:"La pratique en cuisine et les arts appliqués. Les maths c'est moyen.", emoji:"📖" },
    ],
    dossier: {
      bulletinResume:"Option Cuisine 16/20 · Arts appliqués 14/20 · Français 11/20 · Maths 8/20 · Sciences 9/20",
      avisProf:"Bonne motivation en pratique culinaire. Résultats académiques corrects. Projet professionnel bien défini. Vérifier la réalité de la filière demandée.",
      absencesIndice:null,
    },
    famille: {
      reponse:"Son père : 'Rémi veut être pâtissier, on est d'accord. Mais on veut un Bac Pro pour lui, pas juste un CAP. Un bac c'est important pour l'avenir.'",
      concordance:"embellit",
    },
    pronote: {
      absences:"8 demi-journées d'absence. 3 retards.",
      retards:3,
      absencesParMatiere:"Absences en maths et sciences. Aucune absence en option cuisine.",
      alertes:"Absentéisme modéré dans les matières théoriques. Engagement fort en pratique.",
    },
  }];

// ─── PERSONNAGE SVG ANIMÉ ────────────────────────────────────
function Personnage({ eleve, parle, expression, onClick }) {
  const s = eleve.seed;
  const pick = (arr, o=0) => arr[Math.abs(((s+o*137)*2654435761)>>>0) % arr.length];
  const peaux   = ["#FDDBB4","#F1C27D","#E0AC69","#C68642","#8D5524","#FFCBA4"];
  const cheveux = ["#1A0A00","#8B4513","#D4A017","#CC3300","#333","#E0E0E0"];
  const habits  = ["#C0392B","#2980B9","#27AE60","#8E44AD","#E67E22","#16A085","#2C3E50"];
  const peau = pick(peaux,0), chev = pick(cheveux,1), habit = pick(habits,2);
  const coif = s%3, fem = s%2===0;
  const bds = {
    neutre:"M38 88 Q48 94 58 88", content:"M36 85 Q48 96 60 85",
    inquiet:"M38 91 Q48 86 58 91", parle:"M40 88 Q48 95 56 88",
  };
  const bd = bds[parle?"parle":(expression||"neutre")];
  return (
    <svg width="96" height="180" viewBox="0 0 96 180" onClick={onClick}
      style={{ cursor:"pointer", display:"block", filter:"drop-shadow(0 8px 16px rgba(0,0,0,0.4))" }}>
      <ellipse cx="48" cy="174" rx="28" ry="6" fill="rgba(0,0,0,0.2)"/>
      <rect x="22" y="112" width="52" height="62" rx="8" fill={habit}/>
      <rect x="8" y="114" width="16" height="36" rx="7" fill={habit}>
        <animateTransform attributeName="transform" type="rotate"
          values="0 16 114;4 16 114;0 16 114;-3 16 114;0 16 114" dur="3.2s" repeatCount="indefinite"/>
      </rect>
      <rect x="72" y="114" width="16" height="36" rx="7" fill={habit}>
        <animateTransform attributeName="transform" type="rotate"
          values="0 80 114;-4 80 114;0 80 114;3 80 114;0 80 114" dur="2.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="40" y="100" width="16" height="16" rx="4" fill={peau}/>
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0,0;0,-2;0,0;0,-1;0,0" dur="4s" repeatCount="indefinite"/>
        <ellipse cx="16" cy="68" rx="7" ry="9" fill={peau}/>
        <ellipse cx="80" cy="68" rx="7" ry="9" fill={peau}/>
        <ellipse cx="48" cy="62" rx="30" ry="34" fill={peau}/>
        {coif===0&&<><ellipse cx="48" cy="36" rx="30" ry="18" fill={chev}/><rect x="18" y="36" width="60" height="14" fill={chev}/></>}
        {coif===1&&<><ellipse cx="48" cy="34" rx="30" ry="20" fill={chev}/><rect x="18" y="36" width="11" height="40" rx="5" fill={chev}/><rect x="67" y="36" width="11" height="40" rx="5" fill={chev}/></>}
        {coif===2&&<><ellipse cx="48" cy="32" rx="34" ry="24" fill={chev}/><circle cx="22" cy="48" r="12" fill={chev}/><circle cx="74" cy="48" r="12" fill={chev}/></>}
        {/* Yeux fixes */}
        <ellipse cx="36" cy="64" rx="8" ry="7" fill="white"/>
        <ellipse cx="36" cy="65" rx="5" ry="4.5" fill="#1A0F00"/>
        <circle cx="37" cy="64.5" r="2.2" fill="#111"/>
        <circle cx="38" cy="63" r="1.2" fill="white"/>
        <ellipse cx="60" cy="64" rx="8" ry="7" fill="white"/>
        <ellipse cx="60" cy="65" rx="5" ry="4.5" fill="#1A0F00"/>
        <circle cx="61" cy="64.5" r="2.2" fill="#111"/>
        <circle cx="62" cy="63" r="1.2" fill="white"/>
        {/* Paupières — rect haut descend, rect bas monte, se rejoignent au milieu */}
        <rect x="28" y="57" width="16" height="0" fill={peau}>
          <animate attributeName="height" values="0;0;7;7;0;0"
            keyTimes="0;0.74;0.78;0.82;0.86;1" dur="7s" repeatCount="indefinite" calcMode="linear"/>
        </rect>
        <rect x="28" y="71" width="16" height="0" fill={peau}>
          <animate attributeName="height" values="0;0;7;7;0;0"
            keyTimes="0;0.74;0.78;0.82;0.86;1" dur="7s" repeatCount="indefinite" calcMode="linear"/>
          <animate attributeName="y" values="71;71;64;64;71;71"
            keyTimes="0;0.74;0.78;0.82;0.86;1" dur="7s" repeatCount="indefinite" calcMode="linear"/>
        </rect>
        <rect x="52" y="57" width="16" height="0" fill={peau}>
          <animate attributeName="height" values="0;0;7;7;0;0"
            keyTimes="0;0.74;0.78;0.82;0.86;1" dur="7s" repeatCount="indefinite" calcMode="linear"/>
        </rect>
        <rect x="52" y="71" width="16" height="0" fill={peau}>
          <animate attributeName="height" values="0;0;7;7;0;0"
            keyTimes="0;0.74;0.78;0.82;0.86;1" dur="7s" repeatCount="indefinite" calcMode="linear"/>
          <animate attributeName="y" values="71;71;64;64;71;71"
            keyTimes="0;0.74;0.78;0.82;0.86;1" dur="7s" repeatCount="indefinite" calcMode="linear"/>
        </rect>
        {/* Sourcils */}
        <path d={expression==="inquiet"?"M28 55 Q36 59 44 56":"M28 55 Q36 51 44 55"}
          stroke="#5D4037" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d={expression==="inquiet"?"M52 56 Q60 59 68 55":"M52 55 Q60 51 68 55"}
          stroke="#5D4037" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* Nez */}
        <ellipse cx="48" cy="74" rx="3.5" ry="2.5" fill="none"
          stroke={peau==="#FDDBB4"?"#E0A070":"#905030"} strokeWidth="1.6"/>
        {/* Bouche */}
        <path d={bd} stroke="#A0392B" strokeWidth="2.2"
          fill={parle?"#6B0000":"none"} strokeLinecap="round">
          {parle&&<animate attributeName="d"
            values={bd+";M40 86 Q48 91 56 86;"+bd}
            dur="0.35s" repeatCount="indefinite"/>}
        </path>
        {fem&&<><circle cx="16" cy="76" r="3" fill="#FFD700"/><circle cx="80" cy="76" r="3" fill="#FFD700"/></>}
      </g>
    </svg>
  );
}

// ─── BULLE MACHINE À ÉCRIRE ──────────────────────────────────
function Bulle({ texte, side="top" }) {
  const [aff, setAff] = useState(""); const [i, setI] = useState(0);
  useEffect(()=>{ setAff(""); setI(0); },[texte]);
  useEffect(()=>{
    if(i>=texte.length) return;
    const t=setTimeout(()=>{ setAff(p=>p+texte[i]); setI(j=>j+1); },22);
    return()=>clearTimeout(t);
  },[i,texte]);
  return (
    <div style={{
      position:"relative", background:"white", border:"2px solid #5C3D1E",
      borderRadius:"12px", padding:"10px 14px",
      fontFamily:"Courier New,monospace", fontSize:"12px",
      lineHeight:1.65, color:C.ink, boxShadow:"3px 3px 0 rgba(0,0,0,0.2)",
      whiteSpace:"pre-wrap", width:"220px", wordBreak:"break-word",
    }}>
      {aff}<span style={{opacity:i<texte.length?1:0}}>▌</span>
      {side==="top"&&<>
        <div style={{position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",
          width:0,height:0,borderLeft:"9px solid transparent",
          borderRight:"9px solid transparent",borderTop:"9px solid white"}}/>
        <div style={{position:"absolute",bottom:-13,left:"50%",transform:"translateX(-50%)",
          width:0,height:0,borderLeft:"10px solid transparent",
          borderRight:"10px solid transparent",borderTop:"10px solid #5C3D1E",zIndex:-1}}/>
      </>}
      {side==="right"&&<>
        <div style={{position:"absolute",right:-11,top:"50%",transform:"translateY(-50%)",
          width:0,height:0,borderTop:"9px solid transparent",
          borderBottom:"9px solid transparent",borderLeft:"10px solid white"}}/>
        <div style={{position:"absolute",right:-14,top:"50%",transform:"translateY(-50%)",
          width:0,height:0,borderTop:"10px solid transparent",
          borderBottom:"10px solid transparent",borderLeft:"11px solid #5C3D1E",zIndex:-1}}/>
      </>}
      {side==="left"&&<>
        <div style={{position:"absolute",left:-11,top:"50%",transform:"translateY(-50%)",
          width:0,height:0,borderTop:"9px solid transparent",
          borderBottom:"9px solid transparent",borderRight:"10px solid white"}}/>
        <div style={{position:"absolute",left:-14,top:"50%",transform:"translateY(-50%)",
          width:0,height:0,borderTop:"10px solid transparent",
          borderBottom:"10px solid transparent",borderRight:"11px solid #5C3D1E",zIndex:-1}}/>
      </>}
    </div>
  );
}

// ─── PANEL DIALOGUE ──────────────────────────────────────────
function PanelDialogue({ eleve, repVues, onQuestion, onFermer }) {
  return (
    <div style={{
      background:"rgba(26,15,0,0.92)", border:"2px solid #8B6040",
      borderRadius:"10px", padding:"12px", width:"200px",
      boxShadow:"4px 4px 12px rgba(0,0,0,0.5)", flexShrink:0,
    }}>
      <div style={{fontSize:"9px",color:"rgba(255,255,255,0.5)",
        letterSpacing:"2px",marginBottom:"7px",textAlign:"center"}}>
        INTERROGER L'ÉLÈVE
      </div>
      {eleve.questions.map((q,i)=>{
        const deja=repVues.has(i);
        return (
          <button key={i} onClick={()=>onQuestion(i)} style={{
            display:"flex",alignItems:"center",gap:"7px",width:"100%",
            background:deja?"rgba(76,175,80,0.2)":"rgba(255,255,255,0.07)",
            border:deja?"1px solid rgba(76,175,80,0.5)":"1px solid rgba(255,255,255,0.12)",
            borderRadius:"6px",padding:"7px 9px",marginBottom:"5px",
            color:deja?"#A5D6A7":"rgba(255,255,255,0.9)",
            fontFamily:"Courier New,monospace",fontSize:"10px",
            cursor:"pointer",textAlign:"left",transition:"background 0.15s",
          }}
            onMouseEnter={e=>{if(!deja)e.currentTarget.style.background="rgba(255,255,255,0.15)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=deja?"rgba(76,175,80,0.2)":"rgba(255,255,255,0.07)";}}
          >
            <span style={{fontSize:"13px"}}>{deja?"✓":q.emoji}</span>
            <span>{q.q}</span>
          </button>
        );
      })}
      <button onClick={onFermer} style={{
        width:"100%",background:"transparent",border:"1px solid rgba(255,255,255,0.12)",
        borderRadius:"6px",padding:"5px",color:"rgba(255,255,255,0.35)",
        fontFamily:"Courier New,monospace",fontSize:"9px",cursor:"pointer",letterSpacing:"1px",
      }}>✕ FERMER</button>
    </div>
  );
}

// ─── PANEL DOSSIER ───────────────────────────────────────────
function PanelDossier({ eleve, onFermer }) {
  return (
    <div style={{
      background:C.paper, borderRadius:"6px", border:"2px solid #A07830",
      width:"250px", boxShadow:"4px 8px 20px rgba(0,0,0,0.5)",
      flexShrink:0, display:"flex", flexDirection:"column",
      maxHeight:"calc(100vh - 160px)", overflow:"hidden",
    }}>
      <div style={{
        background:"#D4A843", padding:"8px 12px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        borderBottom:"2px solid #A07830",flexShrink:0,
      }}>
        <div style={{fontFamily:"Courier New,monospace"}}>
          <div style={{fontSize:"7px",color:"#6B4010",letterSpacing:"2px"}}>
            DOSSIER N°{String(eleve.id).padStart(4,"0")}
          </div>
          <div style={{fontSize:"11px",fontWeight:"900",color:"#3E1F00"}}>
            {eleve.prenom} {eleve.nom} · {eleve.age} ans
          </div>
        </div>
        <button onClick={onFermer} style={{
          background:"rgba(0,0,0,0.2)",border:"none",borderRadius:"4px",
          color:"#6B4010",cursor:"pointer",padding:"3px 8px",fontSize:"12px",fontWeight:"bold",
        }}>✕</button>
      </div>
      <div style={{padding:"12px",overflowY:"auto",flex:1,fontFamily:"Courier New,monospace"}}>
        {/* Moyenne */}
        <div style={{
          fontSize:"32px",fontWeight:"900",lineHeight:1,marginBottom:"10px",
          color:eleve.moyenne>=14?"#2E7D32":eleve.moyenne>=10?"#E65100":"#C62828",
        }}>
          {eleve.moyenne.toFixed(1)}<span style={{fontSize:"13px"}}>/20</span>
          <span style={{fontSize:"11px",fontWeight:"normal",color:"#888",marginLeft:"8px"}}>
            {eleve.moyenne>=14?"Bien":eleve.moyenne>=10?"Assez bien":eleve.moyenne>=8?"Passable":"Insuffisant"}
          </span>
        </div>
        {/* Bulletin */}
        <div style={{background:"#FFF8E1",border:"1px solid #FFD54F",borderRadius:"6px",padding:"9px",marginBottom:"9px"}}>
          <div style={{fontSize:"8px",fontWeight:"bold",color:"#F57F17",marginBottom:"5px",letterSpacing:"1px"}}>
            📊 BULLETIN DE NOTES
          </div>
          <div style={{fontSize:"10px",color:C.ink,lineHeight:2}}>
            {eleve.dossier.bulletinResume}
          </div>
          {eleve.dossier.absencesIndice && (
            <div style={{fontSize:"9px",color:"#E65100",marginTop:"5px",fontStyle:"italic"}}>
              {eleve.dossier.absencesIndice}
            </div>
          )}
        </div>
        {/* Avis professeur principal */}
        <div style={{background:"#E3F2FD",border:"1px dashed #90CAF9",borderRadius:"6px",padding:"9px"}}>
          <div style={{fontSize:"8px",fontWeight:"bold",color:"#1565C0",marginBottom:"5px",letterSpacing:"1px"}}>
            AVIS DU PROFESSEUR PRINCIPAL
          </div>
          <div style={{fontSize:"10px",color:C.ink,lineHeight:1.7,fontStyle:"italic"}}>
            "{eleve.dossier.avisProf}"
          </div>
        </div>
      </div>
      <button onClick={onFermer} style={{
        width:"100%",marginTop:"8px",background:"transparent",
        border:"1px solid rgba(255,255,255,0.12)",borderRadius:"6px",padding:"5px",
        color:"rgba(255,255,255,0.35)",fontFamily:"Courier New,monospace",
        fontSize:"9px",cursor:"pointer",letterSpacing:"1px",
      }}>✕ FERMER</button>
    </div>
  );
}

// ─── PANEL TÉLÉPHONE ─────────────────────────────────────────
function PanelTelephone({ eleve, onFermer }) {
  const [etat, setEtat] = useState("idle");
  return (
    <div style={{
      background:"rgba(26,15,0,0.92)", border:"2px solid #8B6040",
      borderRadius:"10px", padding:"14px", width:"220px",
      boxShadow:"4px 4px 12px rgba(0,0,0,0.5)", flexShrink:0,
      fontFamily:"Courier New,monospace",
    }}>
      <div style={{fontSize:"9px",color:"rgba(255,255,255,0.5)",
        letterSpacing:"2px",marginBottom:"10px",textAlign:"center"}}>
        FAMILLE / REPRÉSENTANTS LÉGAUX
      </div>
      {etat==="idle" && (
        <button onClick={()=>setEtat("appel")} style={{
          width:"100%",background:"#2E7D32",color:"white",border:"none",
          borderRadius:"8px",padding:"10px",fontFamily:"Courier New,monospace",
          fontWeight:"bold",fontSize:"11px",cursor:"pointer",letterSpacing:"1px",
        }}>
          📞 Appeler la famille
        </button>
      )}
      {etat==="appel" && (
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"20px",marginBottom:"6px"}}>📞</div>
          <div style={{fontSize:"10px",color:"rgba(255,255,255,0.6)",marginBottom:"8px"}}>
            Appel en cours…
          </div>
          <button onClick={()=>setEtat("repondu")} style={{
            background:"transparent",border:"1px solid rgba(255,255,255,0.3)",
            borderRadius:"6px",padding:"6px 12px",color:"rgba(255,255,255,0.7)",
            fontFamily:"Courier New,monospace",fontSize:"10px",cursor:"pointer",
          }}>
            Réponse →
          </button>
        </div>
      )}
      {etat==="repondu" && (
        <div style={{
          background:"#FDF6E3",border:"1px solid #A07030",borderRadius:"8px",
          padding:"9px",fontSize:"10px",color:"#1A0F00",lineHeight:1.7,fontStyle:"italic",
        }}>
          {eleve.famille.reponse}
        </div>
      )}
      <button onClick={onFermer} style={{
        width:"100%",marginTop:"8px",background:"transparent",
        border:"1px solid rgba(255,255,255,0.12)",borderRadius:"6px",padding:"5px",
        color:"rgba(255,255,255,0.35)",fontFamily:"Courier New,monospace",
        fontSize:"9px",cursor:"pointer",letterSpacing:"1px",
      }}>✕ FERMER</button>
    </div>
  );
}

// ─── PANEL PRONOTE ───────────────────────────────────────────
function PanelPronote({ eleve, onFermer }) {
  return (
    <div style={{
      background:"white",border:"2px solid #1565C0",borderRadius:"6px",
      width:"260px",boxShadow:"4px 8px 20px rgba(0,0,0,0.5)",
      flexShrink:0,display:"flex",flexDirection:"column",
      maxHeight:"calc(100vh - 160px)",overflow:"hidden",
    }}>
      {/* Barre Pronote */}
      <div style={{
        background:"#1565C0",padding:"8px 12px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        flexShrink:0,
      }}>
        <div style={{fontFamily:"Courier New,monospace"}}>
          <div style={{fontSize:"9px",color:"rgba(255,255,255,0.7)",letterSpacing:"1px"}}>
            PRONOTE — SUIVI SCOLAIRE
          </div>
          <div style={{fontSize:"11px",fontWeight:"900",color:"white"}}>
            {eleve.prenom} {eleve.nom}
          </div>
        </div>
        <button onClick={onFermer} style={{
          background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"4px",
          color:"white",cursor:"pointer",padding:"3px 8px",fontSize:"12px",fontWeight:"bold",
        }}>✕</button>
      </div>
      <div style={{padding:"12px",overflowY:"auto",flex:1,fontFamily:"Courier New,monospace"}}>
        {/* Absences globales */}
        <div style={{background:"#E3F2FD",border:"1px solid #90CAF9",borderRadius:"6px",padding:"9px",marginBottom:"9px"}}>
          <div style={{fontSize:"8px",fontWeight:"bold",color:"#1565C0",marginBottom:"5px",letterSpacing:"1px"}}>
            📅 ABSENCES {"&"} RETARDS
          </div>
          <div style={{fontSize:"10px",color:C.ink,lineHeight:1.8}}>
            {eleve.pronote.absences}
          </div>
        </div>
        {/* Absences par matière */}
        <div style={{background:"#FFF8E1",border:"1px solid #FFD54F",borderRadius:"6px",padding:"9px",marginBottom:"9px"}}>
          <div style={{fontSize:"8px",fontWeight:"bold",color:"#F57F17",marginBottom:"5px",letterSpacing:"1px"}}>
            📊 DÉTAIL PAR MATIÈRE
          </div>
          <div style={{fontSize:"10px",color:C.ink,lineHeight:1.8}}>
            {eleve.pronote.absencesParMatiere}
          </div>
        </div>
        {/* Alertes */}
        {eleve.pronote.alertes && (
          <div style={{
            background: eleve.pronote.alertes.startsWith("⚠️") ? "#FFEBEE" : "#F3E5F5",
            border: "1px solid " + (eleve.pronote.alertes.startsWith("⚠️") ? "#EF9A9A" : "#CE93D8") + "",
            borderRadius:"6px",padding:"9px",
          }}>
            <div style={{fontSize:"10px",color:C.ink,lineHeight:1.7}}>
              {eleve.pronote.alertes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── DONNÉES ONISEP ──────────────────────────────────────────
// Source : Académie de Paris — liste des formations professionnelles
const ONISEP_BAC_PRO = [
  { secteur:"Administration, comptabilité", formations:[
    "Assistance à la gestion des organisations et de leurs activités",
    "Métiers de l'accueil",
  ]},
  { secteur:"Agriculture, aménagement, forêt", formations:[
    "Aménagements paysagers",
    "Géomètre-topographe",
    "Procédés de la chimie, de l'eau et des papiers-cartons",
  ]},
  { secteur:"Alimentation, hôtellerie, restauration", formations:[
    "Commercialisation et services en restauration",
    "Cuisine",
    "Production en industries pharmaceutiques, alimentaires et cosmétiques",
  ]},
  { secteur:"Arts, artisanat, audiovisuel", formations:[
    "Artisanat et métiers d'art — communication visuelle plurimédia",
    "Artisanat et métiers d'art — marchandisage visuel",
    "Artisanat et métiers d'art — métiers de l'enseigne et de la signalétique",
    "Artisanat et métiers d'art — tapisserie d'ameublement",
    "Artisanat et métiers d'art — verrerie scientifique et technique",
    "Étude et réalisation d'agencement",
    "Métiers du cuir — option maroquinerie",
    "Photographie",
  ]},
  { secteur:"Automobile, engins", formations:[
    "Maintenance des véhicules — option A voitures particulières",
    "Maintenance des véhicules — option C motocycles",
  ]},
  { secteur:"Bâtiment, travaux publics", formations:[
    "Aménagement et finition du bâtiment",
    "Étude et réalisation d'agencement",
    "Géomètre-topographe",
    "Installateur en chauffage, climatisation et énergies renouvelables",
    "Interventions sur le patrimoine bâti — option maçonnerie",
    "Maintenance et efficacité énergétique",
    "Menuiserie aluminium-verre",
    "Métiers de l'électricité et de ses environnements connectés",
    "Ouvrages du bâtiment : métallerie",
    "Technicien d'études du bâtiment — études et économie",
    "Technicien d'études du bâtiment — assistant en architecture",
    "Technicien de fabrication bois et matériaux associés",
    "Technicien du bâtiment : organisation et réalisation du gros œuvre",
    "Technicien menuisier-agenceur",
  ]},
  { secteur:"Bois, ameublement", formations:[
    "Artisanat et métiers d'art — marchandisage visuel",
    "Artisanat et métiers d'art — tapisserie d'ameublement",
    "Étude et réalisation d'agencement",
    "Technicien de fabrication bois et matériaux associés",
    "Technicien menuisier-agenceur",
  ]},
  { secteur:"Commerce, vente", formations:[
    "Artisanat et métiers d'art — marchandisage visuel",
    "Boulanger-pâtissier",
    "Esthétique cosmétique parfumerie",
    "Métiers de l'accueil",
    "Métiers du commerce et de la vente — animation et gestion de l'espace commercial",
    "Métiers du commerce et de la vente — prospection clientèle et valorisation de l'offre",
  ]},
  { secteur:"Électricité, électronique, énergie", formations:[
    "Artisanat et métiers d'art — métiers de l'enseigne et de la signalétique",
    "Cybersécurité, informatique et réseaux, électronique",
    "Installateur en chauffage, climatisation et énergies renouvelables",
    "Maintenance et efficacité énergétique",
    "Métiers de l'électricité et de ses environnements connectés",
    "Métiers du froid et des énergies renouvelables",
    "Microtechniques",
    "Modélisation et prototypage 3D",
    "Pilote de ligne de production",
  ]},
  { secteur:"Hygiène, sécurité", formations:[
    "Cybersécurité, informatique et réseaux, électronique",
    "Hygiène, propreté, stérilisation",
    "Métiers de la sécurité",
  ]},
  { secteur:"Industries graphiques", formations:[
    "Artisanat et métiers d'art — communication visuelle plurimédia",
    "Façonnage de produits imprimés, routage",
    "Réalisation de produits imprimés et plurimédia — productions graphiques",
    "Réalisation de produits imprimés et plurimédia — productions imprimées",
  ]},
  { secteur:"Matériaux : métaux, plastiques, papier", formations:[
    "Artisanat et métiers d'art — métiers de l'enseigne et de la signalétique",
    "Artisanat et métiers d'art — verrerie scientifique et technique",
    "Étude et réalisation d'agencement",
    "Menuiserie aluminium-verre",
    "Ouvrages du bâtiment : métallerie",
    "Pilote de ligne de production",
    "Procédés de la chimie, de l'eau et des papiers-cartons",
    "Technicien en chaudronnerie industrielle",
    "Technicien en réalisation de produits mécaniques — outillages",
    "Technicien en réalisation de produits mécaniques — suivi de productions",
  ]},
  { secteur:"Productique, mécanique", formations:[
    "Artisanat et métiers d'art — métiers de l'enseigne et de la signalétique",
    "Étude et réalisation d'agencement",
    "Maintenance des systèmes de production connectés",
    "Maintenance des véhicules — option A voitures particulières",
    "Métiers de l'électricité et de ses environnements connectés",
    "Microtechniques",
    "Modélisation et prototypage 3D",
    "Pilote de ligne de production",
    "Procédés de la chimie, de l'eau et des papiers-cartons",
    "Production en industries pharmaceutiques, alimentaires et cosmétiques",
    "Technicien en réalisation de produits mécaniques — outillages",
    "Technicien en réalisation de produits mécaniques — suivi de productions",
  ]},
  { secteur:"Santé, social, soins", formations:[
    "Accompagnement, soins et services à la personne (ASSP)",
    "Animation — enfance et personnes âgées",
    "Esthétique cosmétique parfumerie",
    "Métiers de la coiffure",
    "Optique lunetterie",
    "Production en industries pharmaceutiques, alimentaires et cosmétiques",
    "Technicien en appareillage orthopédique",
    "Technicien en prothèse dentaire",
  ]},
  { secteur:"Textile, habillement", formations:[
    "Métiers de la couture et de la confection",
    "Métiers du cuir — option maroquinerie",
  ]},
  { secteur:"Transport, magasinage", formations:[
    "Métiers de la logistique",
    "Organisation de transport de marchandises",
  ]},
];

const ONISEP_CAP = [
  { secteur:"Agriculture, aménagement, forêt", formations:[
    "CAP Agent de la qualité de l'eau",
    "CAPA Jardinier paysagiste",
  ]},
  { secteur:"Alimentation, hôtellerie, restauration", formations:[
    "CAP Boulanger",
    "CAP Commercialisation et services en hôtel-café-restaurant",
    "CAP Cuisine",
    "CAP Pâtissier",
    "CAP Production et service en restaurations (rapide, collective, cafétéria)",
  ]},
  { secteur:"Arts, artisanat, audiovisuel", formations:[
    "CAP Accordeur de pianos",
    "CAP Art et techniques de la bijouterie-joaillerie",
    "CAP Arts de la broderie (main et machine)",
    "CAP Arts de la reliure",
    "CAP Arts et techniques du verre — décorateur sur verre",
    "CAP Arts et techniques du verre — vitrailliste",
    "CAP Bronzier — monteur en bronze",
    "CAP Carreleur mosaïste",
    "CAP Décoration en céramique",
    "CAP Ébéniste",
    "CAP Fleuriste de mode",
    "CAP Fourrure",
    "CAP Horlogerie",
    "CAP Maroquinerie",
    "CAP Métiers de la mode — chapelier-modiste",
    "CAP Métiers de la mode — vêtement flou",
    "CAP Plumasserie",
    "CAP Signalétique et décors graphiques",
    "CAP Souffleur de verre — enseigne lumineuse",
    "CAP Souffleur de verre — verrerie scientifique",
    "CAP Tailleur de pierre",
  ]},
  { secteur:"Automobile, engins", formations:[
    "CAP Maintenance des véhicules — option A voitures particulières",
  ]},
  { secteur:"Bâtiment, travaux publics", formations:[
    "CAP Carreleur mosaïste",
    "CAP Couvreur",
    "CAP Électricien",
    "CAP Interventions en maintenance technique des bâtiments",
    "CAP Menuisier aluminium-verre",
    "CAP Menuisier fabricant",
    "CAP Métallier",
    "CAP Monteur en installations sanitaires",
    "CAP Monteur en installations thermiques",
    "CAP Peintre applicateur de revêtements",
    "CAP Tailleur de pierre",
  ]},
  { secteur:"Bois, ameublement", formations:[
    "CAP Ébéniste",
    "CAP Menuisier fabricant",
  ]},
  { secteur:"Chimie, physique", formations:[
    "CAP Agent de la qualité de l'eau",
    "CAP Industries chimiques",
  ]},
  { secteur:"Commerce, vente", formations:[
    "CAP Boulanger",
    "CAP Équipier polyvalent du commerce",
    "CAP Esthétique cosmétique parfumerie",
    "CAP Pâtissier",
  ]},
  { secteur:"Électricité, électronique, énergie", formations:[
    "CAP Électricien",
    "CAP Métiers de l'enseigne et de la signalétique",
    "CAP Monteur en installations sanitaires",
    "CAP Monteur en installations thermiques",
  ]},
  { secteur:"Hygiène, sécurité", formations:[
    "CAP Agent de sécurité",
    "CAP Métiers de l'entretien des textiles — blanchisserie",
    "CAP Métiers de l'entretien des textiles — pressing",
    "CAP Propreté et prévention des biocontaminations",
  ]},
  { secteur:"Industries graphiques", formations:[
    "CAP Arts de la reliure",
    "CAP Sérigraphie industrielle",
  ]},
  { secteur:"Matériaux : métaux, plastiques, papier", formations:[
    "CAP Arts et techniques du verre — décorateur sur verre",
    "CAP Bronzier — monteur en bronze",
    "CAP Cordonnerie multiservice",
    "CAP Décoration en céramique",
    "CAP Menuisier aluminium-verre",
    "CAP Métallier",
    "CAP Métiers de l'enseigne et de la signalétique",
    "CAP Outillages en outils à découper et à emboutir",
    "CAP Réalisations industrielles en chaudronnerie ou soudage",
    "CAP Souffleur de verre — enseigne lumineuse",
    "CAP Souffleur de verre — verrerie scientifique",
    "CAP Tailleur de pierre",
  ]},
  { secteur:"Productique, mécanique", formations:[
    "CAP Conducteur d'installations de production",
    "CAP Horlogerie",
    "CAP Industries chimiques",
    "CAP Interventions en maintenance technique des bâtiments",
    "CAP Maintenance des véhicules — option A voitures particulières",
    "CAP Outillages en outils à découper et à emboutir",
  ]},
  { secteur:"Santé, social, soins", formations:[
    "CAP Accompagnant éducatif petite enfance",
    "CAP Agent accompagnant au grand âge",
    "CAP Esthétique cosmétique parfumerie",
    "CAP Métiers de la coiffure",
    "CAP Opérateur en appareillage orthopédique — orthoprothésiste",
    "CAP Opérateur en appareillage orthopédique — podo-orthésiste",
  ]},
  { secteur:"Textile, habillement", formations:[
    "CAP Arts de la broderie (main ou machine)",
    "CAP Cordonnerie multiservice",
    "CAP Fleuriste de mode",
    "CAP Fourrure",
    "CAP Maroquinerie",
    "CAP Métiers de l'entretien des textiles — blanchisserie",
    "CAP Métiers de l'entretien des textiles — pressing",
    "CAP Métiers de la mode — chapelier-modiste",
    "CAP Métiers de la mode — vêtement flou",
    "CAP Métiers de la mode — vêtement tailleur",
    "CAP Plumasserie",
    "CAP Vêtement de peau",
  ]},
  { secteur:"Transport, magasinage", formations:[
    "CAP Opérateur logistique",
  ]},
];

// ─── COMPOSANT PANEL ONISEP ──────────────────────────────────
function PanelOnisep({ onFermer }) {
  const [onglet, setOnglet] = useState("pro"); // "pro" | "cap"
  const [recherche, setRecherche] = useState("");
  const [secteurOuvert, setSecteurOuvert] = useState(null);

  const donnees = onglet === "pro" ? ONISEP_BAC_PRO : ONISEP_CAP;
  const filtre = recherche.toLowerCase().trim();

  // Filtre par recherche
  const secteursFiltres = donnees
    .map(s => ({
      ...s,
      formations: filtre
        ? s.formations.filter(f => f.toLowerCase().includes(filtre))
        : s.formations,
    }))
    .filter(s => s.formations.length > 0);

  return (
    <div style={{
      background:"white", border:"2px solid #1565C0",
      borderRadius:"6px", width:"280px",
      boxShadow:"4px 8px 20px rgba(0,0,0,0.5)", flexShrink:0,
      display:"flex", flexDirection:"column",
      maxHeight:"calc(100vh - 160px)", overflow:"hidden",
    }}>
      {/* En-tête */}
      <div style={{
        background:"#1565C0", padding:"8px 12px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexShrink:0,
      }}>
        <div style={{ fontFamily:"Courier New,monospace" }}>
          <div style={{ fontSize:"7px", color:"rgba(255,255,255,0.7)", letterSpacing:"2px" }}>
            ONISEP — ACADÉMIE DE PARIS
          </div>
          <div style={{ fontSize:"11px", fontWeight:"900", color:"white" }}>
            Formations professionnelles
          </div>
        </div>
        <button onClick={onFermer} style={{
          background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"4px",
          color:"white", cursor:"pointer", padding:"3px 8px", fontSize:"12px", fontWeight:"bold",
        }}>✕</button>
      </div>

      {/* Onglets Bac Pro / CAP */}
      <div style={{
        display:"flex", borderBottom:"2px solid #E0E0E0", flexShrink:0,
      }}>
        {[["pro","Bac Pro"],["cap","CAP"]].map(([id,label])=>(
          <button key={id} onClick={()=>{ setOnglet(id); setSecteurOuvert(null); setRecherche(""); }}
            style={{
              flex:1, padding:"7px", border:"none", cursor:"pointer",
              fontFamily:"Courier New,monospace", fontSize:"11px", fontWeight:"bold",
              background: onglet===id ? "#E3F2FD" : "white",
              color: onglet===id ? "#1565C0" : "#888",
              borderBottom: onglet===id ? "3px solid #1565C0" : "3px solid transparent",
              transition:"all 0.15s",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Barre de recherche */}
      <div style={{ padding:"8px 10px", borderBottom:"1px solid #E0E0E0", flexShrink:0 }}>
        <input
          value={recherche}
          onChange={e=>setRecherche(e.target.value)}
          placeholder="Rechercher une formation…"
          style={{
            width:"100%", padding:"5px 8px", border:"1px solid #DDD",
            borderRadius:"4px", fontFamily:"Courier New,monospace",
            fontSize:"10px", color:C.ink, boxSizing:"border-box",
            outline:"none",
          }}
        />
      </div>

      {/* Liste par secteur (accordéon) */}
      <div style={{ overflowY:"auto", flex:1, padding:"6px" }}>
        {secteursFiltres.length === 0 && (
          <div style={{ textAlign:"center", padding:"20px", fontSize:"11px",
            color:"#888", fontFamily:"Courier New,monospace" }}>
            Aucune formation trouvée
          </div>
        )}
        {secteursFiltres.map((s,i)=>(
          <div key={i} style={{ marginBottom:"4px" }}>
            {/* Titre secteur cliquable */}
            <button
              onClick={()=>setSecteurOuvert(secteurOuvert===i?null:i)}
              style={{
                width:"100%", display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"6px 8px",
                background: secteurOuvert===i ? "#E3F2FD" : "#F5F5F5",
                border:"1px solid #DDD", borderRadius:"4px",
                fontFamily:"Courier New,monospace", fontSize:"10px",
                fontWeight:"bold", color:C.ink, cursor:"pointer",
                textAlign:"left",
              }}>
              <span>{s.secteur}</span>
              <span style={{ fontSize:"10px", color:"#888" }}>
                {s.formations.length} · {secteurOuvert===i?"▲":"▼"}
              </span>
            </button>
            {/* Formations du secteur */}
            {(secteurOuvert===i || filtre) && (
              <div style={{ paddingLeft:"8px", paddingTop:"3px" }}>
                {s.formations.map((f,j)=>(
                  <div key={j} style={{
                    fontSize:"10px", color:C.ink, padding:"3px 6px",
                    borderLeft:"2px solid #90CAF9", marginBottom:"2px",
                    lineHeight:1.4, fontFamily:"Courier New,monospace",
                    background: filtre && f.toLowerCase().includes(filtre)
                      ? "#FFF8E1" : "transparent",
                  }}>
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pied */}
      <div style={{
        padding:"6px 10px", borderTop:"1px solid #E0E0E0",
        fontSize:"8px", color:"#888", fontFamily:"Courier New,monospace",
        flexShrink:0, textAlign:"center",
      }}>
        Source : Académie de Paris · Formations disponibles en Île-de-France
      </div>
    </div>
  );
}

// ─── MODALE TAMPON ───────────────────────────────────────────
function ModalTampon({ onDecision, onFermer }) {
  const [stampId, setStampId] = useState(null);
  const handleClick = (f) => {
    if(stampId) return;
    setStampId(f.id);
    setTimeout(()=>onDecision(f), 700);
  };
  return (
    <div style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:100,backdropFilter:"blur(3px)",
    }}>
      <div style={{
        background:C.paper,borderRadius:"8px",padding:"24px",
        maxWidth:"380px",width:"90%",
        boxShadow:"0 20px 60px rgba(0,0,0,0.6)",border:"3px solid #5C3D1E",
        fontFamily:"Courier New,monospace",
      }}>
        <div style={{textAlign:"center",marginBottom:"16px"}}>
          <div style={{fontSize:"9px",color:"#888",letterSpacing:"3px",marginBottom:"4px"}}>DÉCISION OFFICIELLE</div>
          <div style={{fontSize:"18px",fontWeight:"900",color:C.ink}}>ORIENTATION EN 2NDE</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {FILIERES.map(f=>{
            const isStamping = stampId===f.id;
            return (
              <div key={f.id} style={{position:"relative",overflow:"hidden",borderRadius:"10px"}}>
                <button onClick={()=>handleClick(f)} disabled={!!stampId} style={{
                  width:"100%",background:isStamping?(f.couleur+"15"):"white",
                  color:f.couleur,border:("3px solid "+f.couleur),borderRadius:"10px",
                  padding:"12px 16px",fontFamily:"Courier New,monospace",
                  fontWeight:"bold",fontSize:"13px",
                  cursor:stampId?"default":"pointer",transition:"all 0.15s",
                  display:"flex",alignItems:"center",gap:"12px",textAlign:"left",
                  boxShadow:isStamping?"none":("2px 2px 0 "+f.couleur+"40"),
                  opacity:stampId&&!isStamping?0.4:1,
                }}
                  onMouseEnter={e=>{if(!stampId){e.currentTarget.style.background=(f.couleur+"15");e.currentTarget.style.transform="scale(1.02)";}}}
                  onMouseLeave={e=>{if(!isStamping){e.currentTarget.style.background="white";e.currentTarget.style.transform="scale(1)";}}}
                >
                  <span style={{fontSize:"22px"}}>{f.emoji}</span>
                  <div>
                    <div>{f.label}</div>
                    <div style={{fontSize:"10px",opacity:0.7,fontWeight:"normal"}}>{f.desc}</div>
                  </div>
                </button>
                {isStamping&&(
                  <div style={{
                    position:"absolute",inset:0,display:"flex",
                    alignItems:"center",justifyContent:"center",pointerEvents:"none",
                    animation:"stamp-drop 0.6s ease-out forwards",
                  }}>
                    <div style={{
                      fontSize:"22px",fontWeight:"900",color:f.couleur,opacity:0.35,
                      transform:"rotate(-6deg)",fontFamily:"Courier New,monospace",
                      border:("3px solid "+f.couleur),padding:"2px 10px",borderRadius:"4px",
                      animation:"stamp-ink 0.6s ease-out forwards",
                    }}>
                      {f.label.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onFermer} disabled={!!stampId} style={{
          width:"100%",marginTop:"14px",background:"transparent",
          border:"2px solid #A1887F",borderRadius:"6px",padding:"8px",
          color:"#8D6E63",fontFamily:"Courier New,monospace",
          fontSize:"11px",cursor:stampId?"default":"pointer",
          opacity:stampId?0.4:1,letterSpacing:"1px",
        }}>
          Je réfléchis encore
        </button>
      </div>
      <style>{`
        @keyframes stamp-drop{0%{transform:translateY(-40px) scaleY(0.3);opacity:0}50%{transform:translateY(4px) scaleY(1.1);opacity:1}70%{transform:translateY(-2px) scaleY(0.95)}100%{transform:translateY(0) scaleY(1);opacity:1}}
        @keyframes stamp-ink{0%{opacity:0;transform:rotate(-6deg) scale(0.5)}60%{opacity:0.5;transform:rotate(-6deg) scale(1.1)}100%{opacity:0.35;transform:rotate(-6deg) scale(1)}}
        @keyframes pulse-text{from{opacity:0.5}to{opacity:1}}
      `}</style>
    </div>
  );
}

// ─── CARTE ANNONCE DE PHASE ──────────────────────────────────
function CarteAnnonce({ annonce, onContinuer }) {
  return (
    <div style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:200,fontFamily:"Courier New,monospace",
    }}>
      <div style={{
        background:C.paper,borderRadius:"4px",padding:"36px",
        maxWidth:"440px",width:"90%",textAlign:"center",
        boxShadow:"0 0 80px rgba(0,0,0,0.8)",border:"3px solid #5C3D1E",
        animation:"slide-up 0.4s ease-out",
      }}>
        <div style={{fontSize:"48px",marginBottom:"12px"}}>{annonce.emoji}</div>
        <div style={{fontSize:"9px",color:"#888",letterSpacing:"4px",marginBottom:"8px"}}>
          NOUVELLE DIRECTIVE
        </div>
        <div style={{fontSize:"18px",fontWeight:"900",color:C.ink,
          letterSpacing:"2px",marginBottom:"14px"}}>
          {annonce.titre}
        </div>
        <div style={{height:"2px",background:"linear-gradient(90deg,transparent,"+C.desk+",transparent)",margin:"14px 0"}}/>
        <p style={{fontSize:"12px",color:"#5C3D1E",lineHeight:1.9,marginBottom:"20px"}}>
          {annonce.texte}
        </p>
        <button onClick={onContinuer} style={{
          background:C.ink,color:C.paper,border:"none",borderRadius:"6px",
          padding:"13px 28px",fontSize:"13px",fontWeight:"bold",
          fontFamily:"Courier New,monospace",cursor:"pointer",letterSpacing:"2px",
          boxShadow:"4px 4px 0 #5C3D1E",
        }}>
          COMPRIS →
        </button>
      </div>
    </div>
  );
}

// ─── MODALE RÉSULTAT ─────────────────────────────────────────
function ModalResultat({ eleve, choix, correct, onSuivant }) {
  // Affiche la première bonne réponse (ou toutes si plusieurs)
  const bonnesLabels = eleve.orientationsValides
    .map(id => FILIERES.find(f=>f.id===id))
    .filter(Boolean)
    .map(f => f.emoji + ' ' + f.label)
    .join(' ou ');
  const bonne = FILIERES.find(f=>f.id===eleve.orientationsValides[0]);
  return (
    <div style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:110,backdropFilter:"blur(4px)",
    }}>
      <div style={{
        background:C.paper,borderRadius:"6px",padding:"28px",
        maxWidth:"420px",width:"90%",
        boxShadow:"0 20px 60px rgba(0,0,0,0.7)",border:"3px solid #5C3D1E",
        fontFamily:"Courier New,monospace",textAlign:"center",
      }}>
        <div style={{fontSize:"44px",marginBottom:"8px"}}>{correct?"✅":"❌"}</div>
        <div style={{fontSize:"18px",fontWeight:"900",
          color:correct?"#2E7D32":"#C62828",letterSpacing:"2px",marginBottom:"10px"}}>
          {correct?"BONNE ORIENTATION":"ERREUR D'ORIENTATION"}
        </div>
        {!correct&&(
          <div style={{background:"#FFEBEE",border:"2px solid #EF9A9A",
            borderRadius:"6px",padding:"9px",marginBottom:"10px",fontSize:"12px"}}>
            <strong>Bonne réponse :</strong> {bonnesLabels}
          </div>
        )}
        {eleve.piegeDescription&&(
          <div style={{background:"#FFF8E1",border:"2px solid #FFD54F",
            borderRadius:"6px",padding:"9px",marginBottom:"10px",
            fontSize:"11px",textAlign:"left",lineHeight:1.6}}>
            {eleve.piegeDescription}
          </div>
        )}
        <div style={{background:"#F5F5F5",borderRadius:"6px",padding:"9px",
          fontSize:"11px",textAlign:"left",lineHeight:1.7,marginBottom:"16px"}}>
          💡 {eleve.raisonnement}
        </div>
        <button onClick={onSuivant} style={{
          background:C.ink,color:C.paper,border:"none",borderRadius:"6px",
          padding:"12px 28px",fontFamily:"Courier New,monospace",
          fontWeight:"bold",fontSize:"13px",cursor:"pointer",letterSpacing:"2px",
        }}>
          ÉLÈVE SUIVANT →
        </button>
      </div>
    </div>
  );
}

// ─── ITEM DE BUREAU ──────────────────────────────────────────
function ItemBureau({ emoji, label, actif, survol, onSurvol, onQuit, onClick, pulse, badge }) {
  return (
    <div onMouseEnter={onSurvol} onMouseLeave={onQuit} onClick={actif?onClick:undefined}
      style={{
        position:"relative",
        background:survol?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.06)",
        border:("2px solid "+(survol?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.12)")),
        borderRadius:"10px",padding:"10px 8px",textAlign:"center",
        cursor:actif?"pointer":"default",transition:"all 0.2s",
        transform:survol?"translateY(-5px) scale(1.06)":"none",
        boxShadow:survol?"0 8px 20px rgba(0,0,0,0.3)":"0 2px 6px rgba(0,0,0,0.2)",
        minWidth:"68px",filter:actif?"none":"grayscale(0.8) opacity(0.4)",
        animation:pulse&&actif?"pulse-item 2s ease-in-out infinite":"none",
      }}>
      {badge&&(
        <div style={{
          position:"absolute",top:-8,right:-8,background:C.stamp,color:"white",
          fontSize:"7px",padding:"2px 5px",borderRadius:"8px",fontWeight:"bold",
          animation:"badge-pop 0.4s ease-out",letterSpacing:"0.5px",
        }}>{badge}</div>
      )}
      <div style={{fontSize:"26px",marginBottom:"3px"}}>{emoji}</div>
      <div style={{fontSize:"9px",fontWeight:"bold",
        color:survol?"white":"rgba(255,255,255,0.8)",letterSpacing:"0.5px"}}>
        {label}
      </div>
    </div>
  );
}

// ─── APP PRINCIPALE ──────────────────────────────────────────
export default function App() {
  const [ecran, setEcran]           = useState("accueil");
  const [eleveIdx, setEleveIdx]     = useState(0);
  const [phaseActuelle, setPhaseActuelle] = useState(1);
  const [annonce, setAnnonce]       = useState(null); // objet annonce à afficher
  const [score, setScore]           = useState(0);
  const [erreurs, setErreurs]       = useState(0);
  const [total, setTotal]           = useState(0);
  const [dernierCorrect, setDernierCorrect] = useState(null);

  // Panels ouverts
  const [panelDialogue, setPanelDialogue] = useState(false);
  const [panelDossier, setPanelDossier]   = useState(false);
  const [panelTel, setPanelTel]           = useState(false);
  const [panelPronote, setPanelPronote]   = useState(false);
  const [panelOnisep, setPanelOnisep]     = useState(false);
  const [modalTampon, setModalTampon]     = useState(false);
  const [modalResultat, setModalResultat] = useState(false);

  // Dialogue
  const [bulleTexte, setBulleTexte]   = useState("");
  const [bulleVisible, setBulleVisible] = useState(false);
  const [repVues, setRepVues]         = useState(new Set());
  const [parle, setParle]             = useState(false);
  const [expression, setExpression]   = useState("neutre");

  const timerRef = useRef(null);

  // Élèves ordonnés par phase puis dans l'ordre
  const elevesList = ELEVES; // déjà triés par phase dans les données
  const eleve = elevesList[eleveIdx];
  const phaseConfig = PHASES_CONFIG.find(p=>p.id===phaseActuelle);
  const outils = phaseConfig?.outils || [];

  const dire = useCallback((texte, expr="neutre")=>{
    clearTimeout(timerRef.current);
    setBulleTexte(texte); setBulleVisible(true);
    setParle(true); setExpression(expr);
    timerRef.current = setTimeout(()=>setParle(false), Math.min(3500,texte.length*28));
  },[]);

  const fermerTousLesPanels = () => {
    setPanelDialogue(false); setPanelDossier(false);
    setPanelTel(false); setPanelPronote(false); setPanelOnisep(false);
  };

  // Arrivée d'un nouvel élève
  useEffect(()=>{
    if(ecran==="jeu" && eleve){
      fermerTousLesPanels();
      setBulleVisible(false); setRepVues(new Set());
      const t = setTimeout(()=>dire(eleve.repliques[0]), 700);
      return()=>clearTimeout(t);
    }
  },[eleveIdx, ecran]);

  const handleClickPerso = ()=>{
    clearTimeout(timerRef.current); setParle(false); setBulleVisible(false);
    if(panelDialogue){ setPanelDialogue(false); }
    else { fermerTousLesPanels(); setPanelDialogue(true); }
  };

  const poserQuestion = (i)=>{
    setRepVues(prev=>new Set([...prev,i]));
    dire(eleve.questions[i].r, i===2?"inquiet":"content");
  };

  const handleStamp = (filiere)=>{
    setModalTampon(false);
    // Accepte toute orientation dans le tableau orientationsValides
    const correct = eleve.orientationsValides.includes(filiere.id);
    setDernierCorrect(correct);
    setTotal(t=>t+1);
    if(correct) setScore(s=>s+1);
    else setErreurs(e=>e+1);
    setTimeout(()=>setModalResultat(true),200);
  };

  const suivant = ()=>{
    const newErr = erreurs + (dernierCorrect?0:1);
    setModalResultat(false);
    const nextIdx = eleveIdx+1;

    // Fin de partie
    if(newErr>=3 || nextIdx>=elevesList.length){ setEcran("fin"); return; }

    const prochainEleve = elevesList[nextIdx];

    // Changement de phase ?
    if(prochainEleve.phase > phaseActuelle){
      const nouvConfig = PHASES_CONFIG.find(p=>p.id===prochainEleve.phase);
      setPhaseActuelle(nouvConfig.id);
      if(nouvConfig.annonce){
        setEleveIdx(nextIdx);
        setAnnonce(nouvConfig.annonce);
        return;
      }
    }
    setEleveIdx(nextIdx);
  };

  const demarrer = ()=>{
    setEleveIdx(0); setScore(0); setErreurs(0); setTotal(0);
    setPhaseActuelle(1); setAnnonce(null);
    setDernierCorrect(null);
    setEcran("jeu");
  };

  useEffect(()=>()=>clearTimeout(timerRef.current),[]);

  // ── ACCUEIL ─────────────────────────────
  if(ecran==="accueil") return (
    <div style={{minHeight:"100vh",background:"#1A0F00",display:"flex",
      alignItems:"center",justifyContent:"center",fontFamily:"Courier New,monospace"}}>
      <div style={{background:C.paper,borderRadius:"4px",padding:"36px",
        maxWidth:"440px",width:"90%",textAlign:"center",
        boxShadow:"0 0 80px rgba(0,0,0,0.8)",border:"3px solid #5C3D1E"}}>
        <div style={{fontSize:"10px",color:"#888",letterSpacing:"4px",marginBottom:"6px"}}>
          ACADÉMIE DE PARIS
        </div>
        <h1 style={{fontSize:"34px",fontWeight:"900",color:C.ink,letterSpacing:"5px",margin:"0 0 4px"}}>
          ORIENTATION
        </h1>
        <div style={{fontSize:"11px",color:"#8D6E63",letterSpacing:"3px",marginBottom:"14px"}}>
          PALIER 3e — 4 PHASES · 16 ÉLÈVES
        </div>
        <div style={{height:"2px",background:"linear-gradient(90deg,transparent,"+C.desk+",transparent)",margin:"14px 0"}}/>
        <p style={{fontSize:"12px",color:"#5C3D1E",lineHeight:1.9,marginBottom:"14px"}}>
          Vous débutez avec uniquement le dialogue.<br/>
          De nouveaux outils se débloquent au fil des phases.<br/>
          <strong>Méfiez-vous des discours convaincants.</strong><br/>
          <strong>3 erreurs = fin de carrière.</strong>
        </p>
        <div style={{background:"#FFF8E1",border:"1px solid #FFD54F",
          borderRadius:"6px",padding:"10px 14px",marginBottom:"20px",
          textAlign:"left",fontSize:"11px",color:C.ink}}>
          <strong>🎯 PHASES DU PALIER 3e</strong><br/>
          <span style={{color:"#666"}}>
            Phase 1 · Discours de l{"'"}élève<br/>
            Phase 2 · + 📁 Dossier scolaire<br/>
            Phase 3 · + 📞 Téléphone famille<br/>
            Phase 4 · + 💻 Pronote
          </span>
        </div>
        <button onClick={demarrer} style={{
          background:C.ink,color:C.paper,border:"none",borderRadius:"6px",
          padding:"14px 32px",fontSize:"14px",fontWeight:"bold",
          fontFamily:"Courier New,monospace",cursor:"pointer",
          letterSpacing:"3px",boxShadow:"4px 4px 0 #5C3D1E",
        }}>
          PRENDRE SON POSTE →
        </button>
      </div>
    </div>
  );

  // ── FIN ─────────────────────────────────
  if(ecran==="fin"){
    const pct=total>0?Math.round(score/total*100):0;
    return (
      <div style={{minHeight:"100vh",background:"#1A0F00",display:"flex",
        alignItems:"center",justifyContent:"center",fontFamily:"Courier New,monospace"}}>
        <div style={{background:C.paper,borderRadius:"4px",padding:"36px",
          maxWidth:"380px",width:"90%",textAlign:"center",
          boxShadow:"0 0 80px rgba(0,0,0,0.8)",border:"3px solid #5C3D1E"}}>
          <div style={{fontSize:"44px",marginBottom:"8px"}}>{pct>=80?"🏆":pct>=60?"📋":"😔"}</div>
          <h2 style={{fontSize:"24px",fontWeight:"900",color:C.ink,letterSpacing:"4px"}}>
            FIN DE JOURNÉE
          </h2>
          <div style={{height:"2px",background:"linear-gradient(90deg,transparent,"+C.desk+",transparent)",margin:"12px 0"}}/>
          <div style={{fontSize:"38px",fontWeight:"900",color:C.ink,margin:"8px 0"}}>
            {score}<span style={{fontSize:"16px"}}> / {total}</span>
          </div>
          <div style={{fontSize:"12px",color:"#5C3D1E",marginBottom:"18px"}}>
            {pct>=80?"Excellent conseiller. Les élèves sont entre de bonnes mains."
            :pct>=60?"Résultats corrects. Des progrès sont encore possibles."
            :"Trop d'erreurs d'orientation. Formation complémentaire requise."}
          </div>
          <button onClick={demarrer} style={{
            background:C.ink,color:C.paper,border:"none",borderRadius:"6px",
            padding:"12px 26px",fontSize:"13px",fontWeight:"bold",
            fontFamily:"Courier New,monospace",cursor:"pointer",letterSpacing:"2px",
          }}>RECOMMENCER</button>
        </div>
      </div>
    );
  }

  if(!eleve) return null;

  // ── JEU ─────────────────────────────────
  // Positionnement de la bulle selon le panel ouvert :
  //   Panels GAUCHE (dossier, tél, pronote, onisep) → bulle à DROITE du perso
  //     flèche pointe GAUCHE vers l'élève → side="left"
  //   Panel DIALOGUE (droite) → bulle à GAUCHE du perso
  //     flèche pointe DROITE vers l'élève → side="right"
  //   Aucun panel → bulle AU-DESSUS → side="top"
  const panelGauche = panelDossier || panelTel || panelPronote || panelOnisep;
  const panelDroite = panelDialogue;

  const bulleFleche = panelGauche ? "left" : panelDroite ? "right" : "top";

  const bullePos = panelGauche
    ? { left:"calc(100% + 14px)", top:"40%", transform:"translateY(-50%)" }
    : panelDroite
    ? { right:"calc(100% + 14px)", top:"40%", transform:"translateY(-50%)" }
    : { bottom:"calc(100% + 10px)", left:"50%", transform:"translateX(-50%)" };

  return (
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",
      display:"flex",flexDirection:"column",fontFamily:"Courier New,monospace"}}>

      <style>{`
        @keyframes slide-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-item{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes badge-pop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
      `}</style>

      {/* BARRE STATUT */}
      <div style={{
        background:"#2C1A0E",color:"#FFF8E1",padding:"7px 16px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        boxShadow:"0 2px 8px rgba(0,0,0,0.5)",flexShrink:0,zIndex:10,
      }}>
        <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
          <span style={{fontSize:"10px",letterSpacing:"2px"}}>
            {String(eleveIdx+1).padStart(2,"0")}/{elevesList.length}
          </span>
          <span style={{fontSize:"11px"}}>✅ {score}</span>
          <span>{[0,1,2].map(i=><span key={i} style={{fontSize:"12px"}}>{i<3-erreurs?"❤️":"🖤"}</span>)}</span>
        </div>
        <div style={{fontSize:"10px",color:"#FFF8E1AA",letterSpacing:"1px"}}>
          {eleve.prenom} {eleve.nom} · {eleve.age} ans
          {eleve.piegeType&&<span style={{marginLeft:"8px",background:C.stamp,
            padding:"1px 6px",borderRadius:"8px",fontSize:"9px"}}>
            {eleve.phase===4?"CAS COMPLEXE":"À SURVEILLER"}
          </span>}
        </div>
        <div style={{
          background:["","#4A4A4A","#2E7D32","#1565C0","#6A1B9A"][phaseActuelle],
          padding:"3px 10px",borderRadius:"12px",fontSize:"10px",fontWeight:"bold",color:"white",
        }}>
          PHASE {phaseActuelle}/4
        </div>
      </div>

      {/* SCÈNE */}
      <div style={{
        flex:1,position:"relative",overflow:"hidden",
        background:"linear-gradient(180deg,#D4C4A0 0%,"+C.wall+" 35%,"+C.wallDark+" 100%)",
        display:"flex",flexDirection:"column",
      }}>
        {/* Zone personnage + panels */}
        <div style={{
          flex:1,display:"flex",alignItems:"flex-end",justifyContent:"center",
          padding:"12px 16px 0",gap:"16px",overflow:"hidden",
        }}>
          {/* PANEL GAUCHE : dossier ou téléphone ou pronote */}
          <div style={{
            visibility:(panelDossier||panelTel||panelPronote||panelOnisep)?"visible":"hidden",
            opacity:(panelDossier||panelTel||panelPronote||panelOnisep)?1:0,
            transition:"opacity 0.2s",alignSelf:"flex-end",marginBottom:"8px",
          }}>
            {panelDossier  && <PanelDossier eleve={eleve} onFermer={()=>setPanelDossier(false)}/>}
            {panelTel      && <PanelTelephone eleve={eleve} onFermer={()=>setPanelTel(false)}/>}
            {panelPronote  && <PanelPronote eleve={eleve} onFermer={()=>setPanelPronote(false)}/>}
            {panelOnisep   && <PanelOnisep onFermer={()=>setPanelOnisep(false)}/>}
          </div>

          {/* PERSONNAGE */}
          <div style={{position:"relative",flexShrink:0,alignSelf:"flex-end"}}>
            {bulleVisible && (
              <div style={{
                position:"absolute", zIndex:20, animation:"slide-up 0.2s ease-out",
                ...bullePos,
              }}>
                <Bulle texte={bulleTexte} side={bulleFleche}/>
              </div>
            )}
            <Personnage eleve={eleve} parle={parle} expression={expression} onClick={handleClickPerso}/>
          </div>

          {/* PANEL DROITE : dialogue */}
          <div style={{
            visibility:panelDialogue?"visible":"hidden",
            opacity:panelDialogue?1:0,
            transition:"opacity 0.2s",alignSelf:"flex-end",marginBottom:"8px",
          }}>
            <PanelDialogue eleve={eleve} repVues={repVues}
              onQuestion={poserQuestion} onFermer={()=>setPanelDialogue(false)}/>
          </div>
        </div>

        {/* BUREAU */}
        <div style={{
          flexShrink:0,height:"120px",
          background:"linear-gradient(180deg,"+C.deskLight+" 0%,"+C.desk+" 60%,#4A2C10 100%)",
          borderTop:"4px solid "+C.deskLight,
          boxShadow:"inset 0 6px 20px rgba(0,0,0,0.4)",
          position:"relative",display:"flex",
          alignItems:"center",justifyContent:"center",gap:"16px",padding:"0 24px",
        }}>
          {/* Tapis vert */}
          <div style={{position:"absolute",top:8,left:"4%",right:"4%",bottom:8,
            background:C.felt,borderRadius:"6px",
            boxShadow:"inset 0 2px 8px rgba(0,0,0,0.35)",border:"2px solid #1A3008"}}/>

                    {outils.includes("dossier") && (
            <div
              onClick={()=>{ fermerTousLesPanels(); setPanelDossier(v=>!v); }}
              style={{ position:"relative", zIndex:5, cursor:"pointer", transition:"transform 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-8px) rotate(-2deg)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}
            >
              <div style={{position:"absolute",top:3,left:3,width:70,height:88,background:"#E8D8B0",borderRadius:"3px",transform:"rotate(2deg)"}}/>
              <div style={{position:"absolute",top:1,left:1,width:70,height:88,background:"#F0E0BC",borderRadius:"3px",transform:"rotate(-1deg)"}}/>
              <div style={{position:"relative",width:70,height:88,background:"#D4A843",
                borderRadius:"3px",border:"2px solid #A07830",
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px"}}>
                <div style={{fontSize:"8px",color:"#6B4010",letterSpacing:"1px",marginBottom:"3px"}}>DOSSIER</div>
                <div style={{fontSize:"9px",fontWeight:"900",color:"#3E1F00",textAlign:"center",
                  fontFamily:"Courier New,monospace",lineHeight:1.3}}>
                  {eleve.prenom}<br/>{eleve.nom}
                </div>
                <div style={{position:"absolute",top:0,right:0,width:8,height:"100%",
                  background:"#2E7D32",borderRadius:"0 1px 1px 0"}}/>
              </div>
              <div style={{textAlign:"center",marginTop:4,fontSize:"9px",
                color:"rgba(255,255,255,0.6)",fontFamily:"Courier New,monospace"}}>
                📁 Dossier
              </div>
            </div>
          )

          {/* TÉLÉPHONE — objet SVG sur le bureau, visible seulement si débloqué */}
          {outils.includes("telephone") && (
            <div
              onClick={()=>{ fermerTousLesPanels(); setPanelTel(v=>!v); }}
              style={{ position:"relative", zIndex:5, cursor:"pointer", transition:"transform 0.2s", flexShrink:0 }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-7px) rotate(2deg)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}
            >
              {phaseActuelle===3 && (
                <div style={{
                  position:"absolute", top:-10, right:-10, zIndex:10,
                  background:C.stamp, color:"white", fontSize:"7px",
                  padding:"2px 5px", borderRadius:"8px", fontWeight:"bold",
                  letterSpacing:"0.5px",
                }}>NOUVEAU</div>
              )}
              {/* Téléphone fixe années 90 dessiné en SVG */}
              <svg width="72" height="80" viewBox="0 0 72 80">
                {/* Socle */}
                <rect x="6" y="40" width="60" height="34" rx="5" fill="#2C2C2C"/>
                <rect x="10" y="44" width="52" height="26" rx="3" fill="#1A1A1A"/>
                {/* Touches */}
                <rect x="14" y="47" width="10" height="5" rx="1" fill="#3A3A3A"/>
                <rect x="28" y="47" width="10" height="5" rx="1" fill="#3A3A3A"/>
                <rect x="42" y="47" width="10" height="5" rx="1" fill="#3A3A3A"/>
                <rect x="14" y="54" width="10" height="5" rx="1" fill="#3A3A3A"/>
                <rect x="28" y="54" width="10" height="5" rx="1" fill="#3A3A3A"/>
                <rect x="42" y="54" width="10" height="5" rx="1" fill="#3A3A3A"/>
                <rect x="14" y="61" width="10" height="5" rx="1" fill="#3A3A3A"/>
                <rect x="28" y="61" width="10" height="5" rx="1" fill="#3A3A3A"/>
                <rect x="42" y="61" width="10" height="5" rx="1" fill="#3A3A3A"/>
                {/* Combiné */}
                <rect x="8" y="8" width="56" height="20" rx="10" fill="#222"/>
                <ellipse cx="18" cy="18" rx="8" ry="7" fill="#1A1A1A"/>
                <ellipse cx="54" cy="18" rx="8" ry="7" fill="#1A1A1A"/>
                <rect x="26" y="15" width="20" height="6" rx="2" fill="#2A2A2A"/>
                {/* Fil */}
                <path d="M36 28 Q30 36 36 40" stroke="#444" strokeWidth="2" fill="none"/>
                {/* Voyant */}
                <circle cx="36" cy="46" r="3" fill="#22AA44" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite"/>
                </circle>
              </svg>
              <div style={{textAlign:"center",marginTop:3,fontSize:"9px",
                color:"rgba(255,255,255,0.65)",fontFamily:"Courier New,monospace"}}>
                📞 Famille
              </div>
            </div>
          )}

          {/* LIVRET ONISEP — visible phases 3+ */}
          {outils.includes("onisep") && (
            <div
              onClick={()=>{ fermerTousLesPanels(); setPanelOnisep(v=>!v); }}
              style={{ position:"relative", zIndex:5, cursor:"pointer",
                transition:"transform 0.2s", flexShrink:0 }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-8px) rotate(1deg)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}
            >
              {/* Livret ONISEP dessiné en SVG */}
              <svg width="58" height="82" viewBox="0 0 58 82">
                {/* Pages intérieures */}
                <rect x="5" y="4" width="50" height="74" rx="3" fill="#FFF9C4"/>
                <rect x="3" y="2" width="50" height="74" rx="3" fill="#FFFDE7"/>
                {/* Couverture */}
                <rect x="1" y="0" width="50" height="74" rx="3" fill="#F57F17"/>
                <rect x="1" y="0" width="50" height="74" rx="3" fill="none"
                  stroke="#E65100" strokeWidth="1.5"/>
                {/* Logo ONISEP stylisé */}
                <rect x="6" y="5" width="38" height="8" rx="2" fill="#E65100"/>
                <text x="25" y="12" textAnchor="middle" fontSize="6" fill="white"
                  fontFamily="monospace" fontWeight="bold" letterSpacing="1">ONISEP</text>
                {/* Lignes de texte simulées */}
                <rect x="6" y="18" width="36" height="2" rx="1" fill="#FFF9C4" opacity="0.7"/>
                <rect x="6" y="22" width="28" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                <rect x="6" y="26" width="32" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                <rect x="6" y="30" width="20" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                {/* Séparateur */}
                <rect x="6" y="36" width="38" height="1" rx="0.5" fill="#E65100" opacity="0.5"/>
                {/* Plus de lignes */}
                <rect x="6" y="40" width="34" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                <rect x="6" y="44" width="26" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                <rect x="6" y="48" width="30" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                <rect x="6" y="52" width="22" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                <rect x="6" y="56" width="36" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                <rect x="6" y="60" width="24" height="2" rx="1" fill="#FFF9C4" opacity="0.5"/>
                {/* Titre couverture */}
                <text x="25" y="72" textAnchor="middle" fontSize="5" fill="#FFF9C4"
                  fontFamily="monospace" opacity="0.9">Formations pro</text>
                {/* Tranche */}
                <rect x="51" y="0" width="6" height="74" rx="0" fill="#E65100"/>
              </svg>
              <div style={{ textAlign:"center", marginTop:3, fontSize:"9px",
                color:"rgba(255,255,255,0.65)", fontFamily:"Courier New,monospace" }}>
                📋 ONISEP
              </div>
            </div>
          )}

          {/* ORDINATEUR PRONOTE — objet SVG, visible seulement si débloqué */}
          {outils.includes("pronote") && (
            <div
              onClick={()=>{ fermerTousLesPanels(); setPanelPronote(v=>!v); }}
              style={{ position:"relative", zIndex:5, cursor:"pointer", transition:"transform 0.2s", flexShrink:0 }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-7px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}
            >
              {phaseActuelle===4 && (
                <div style={{
                  position:"absolute", top:-10, right:-10, zIndex:10,
                  background:C.stamp, color:"white", fontSize:"7px",
                  padding:"2px 5px", borderRadius:"8px", fontWeight:"bold",
                  letterSpacing:"0.5px",
                }}>NOUVEAU</div>
              )}
              {/* Ordinateur portable dessiné en SVG */}
              <svg width="88" height="72" viewBox="0 0 88 72">
                {/* Écran (couvercle) */}
                <rect x="8" y="4" width="72" height="48" rx="4" fill="#1A2A3A"/>
                <rect x="12" y="8" width="64" height="40" rx="2" fill="#0D1B2A"/>
                {/* Contenu écran Pronote */}
                <rect x="14" y="10" width="60" height="6" rx="1" fill="#1565C0"/>
                <text x="44" y="15" textAnchor="middle" fontSize="4" fill="white"
                  fontFamily="monospace" fontWeight="bold">PRONOTE</text>
                <rect x="14" y="18" width="38" height="3" rx="1" fill="#1E3A5F"/>
                <rect x="14" y="23" width="28" height="2" rx="1" fill="#2A4A6F"/>
                <rect x="14" y="27" width="34" height="2" rx="1" fill="#2A4A6F"/>
                <rect x="14" y="31" width="22" height="2" rx="1" fill="#C62828" opacity="0.8"/>
                <rect x="14" y="35" width="30" height="2" rx="1" fill="#2A4A6F"/>
                <rect x="14" y="39" width="18" height="2" rx="1" fill="#C62828" opacity="0.8"/>
                {/* Charnière */}
                <rect x="8" y="50" width="72" height="3" rx="1" fill="#0D1B2A"/>
                {/* Clavier (base) */}
                <rect x="4" y="53" width="80" height="16" rx="3" fill="#2C3E50"/>
                <rect x="8" y="56" width="72" height="9" rx="2" fill="#243342"/>
                {/* Rangées de touches */}
                 <rect x="9"  y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="16" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="23" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="30" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="37" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="44" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="51" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="58" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="65" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="72" y="57" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="9"  y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="16" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="23" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="30" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="37" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="44" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="51" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="58" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="65" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="72" y="60" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="9"  y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="16" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="23" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="30" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="37" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="44" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="51" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="58" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="65" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                 <rect x="72" y="63" width="6" height="2" rx="0.5" fill="#2C3E50"/>
                {/* Pavé tactile */}
                <rect x="30" y="58" width="28" height="8" rx="2" fill="#1E2D3D"/>
              </svg>
              <div style={{textAlign:"center",marginTop:2,fontSize:"9px",
                color:"rgba(255,255,255,0.65)",fontFamily:"Courier New,monospace"}}>
                💻 Pronote
              </div>
            </div>
          )}

          {/* Tampon */}
          <div onClick={()=>setModalTampon(true)}
            style={{
              position:"relative",zIndex:5,cursor:"pointer",textAlign:"center",
              transition:"transform 0.15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-6px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <div style={{background:"#8B0000",borderRadius:"5px 5px 2px 2px",
              padding:"5px 16px 4px",border:"2px solid #600",
              boxShadow:"0 4px 0 #600, 0 6px 10px rgba(0,0,0,0.4)"}}>
              <div style={{background:"#600",borderRadius:"3px",
                height:"10px",width:"36px",margin:"-5px auto 4px",border:"1px solid #400"}}/>
              <div style={{fontSize:"9px",color:"white",letterSpacing:"1px",
                fontWeight:"bold",fontFamily:"Courier New,monospace"}}>ORIENTER</div>
            </div>
            <div style={{background:"#2C0000",height:"4px",borderRadius:"0 0 3px 3px",
              margin:"0 2px",boxShadow:"0 2px 4px rgba(0,0,0,0.4)"}}/>
            <div style={{marginTop:4,fontSize:"9px",
              color:"rgba(255,255,255,0.6)",fontFamily:"Courier New,monospace"}}>
              🗂️ Tampon
            </div>
          </div>

          {/* Indicateur phase suivante */}
          {(()=>{
            const prochaine = PHASES_CONFIG.find(p=>p.id===phaseActuelle+1);
            if(!prochaine) return null;
            const elevesDansPhase = ELEVES.filter(e=>e.phase===phaseActuelle);
            const idxDansPhase = eleveIdx - ELEVES.filter(e=>e.phase<phaseActuelle).length;
            const restants = elevesDansPhase.length - idxDansPhase - 1;
            if(restants > 1) return null;
            return (
              <div style={{position:"absolute",bottom:4,right:8,
                fontSize:"9px",color:"rgba(255,255,255,0.4)",
                fontFamily:"Courier New,monospace"}}>
                Prochain outil : {prochaine.annonce?.emoji} {restants===0?"après cet élève":("dans "+restants+" élève")}
              </div>
            );
          })()}
        </div>
      </div>

      {/* MODALES */}
      {annonce && <CarteAnnonce annonce={annonce} onContinuer={()=>setAnnonce(null)}/>}
      {modalTampon && <ModalTampon onDecision={handleStamp} onFermer={()=>setModalTampon(false)}/>}
      {modalResultat && <ModalResultat eleve={eleve} choix={null}
        correct={dernierCorrect} onSuivant={suivant}/>}
    </div>
  );
}