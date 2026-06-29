import type { Note, ChecklistItem } from "./types";
import { SEED_IDS } from "./auth";

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const cl = (items: [string, boolean][]): ChecklistItem[] =>
  items.map(([label, checked], i) => ({
    id: uid(),
    label,
    checked,
    order: i,
  }));

const now = Date.now();
const iso = (offsetMin: number) => new Date(now - offsetMin * 60000).toISOString();

export function buildSeedNotes(): Note[] {
  const base = {
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    reminderAt: null as string | null,
  };

  const notes: Omit<Note, "userId">[] = [
    {
      ...base,
      id: uid(),
      title: "Project Kickoff",
      content: "",
      status: "in_progress",
      color: "yellow",
      tag: "Travail",
      isPinned: true,
      isFavorite: true,
      checklist: cl([
        ["Préparer les slides pour la réunion", true],
        ["Inclure timeline, objectifs et plan", true],
        ["Revoir le budget et attribuer les actions", false],
      ]),
      createdAt: iso(600),
      updatedAt: iso(38),
    },
    {
      ...base,
      id: uid(),
      title: "Liste de courses",
      content: "",
      status: "todo",
      color: "pink",
      tag: "Courses",
      checklist: cl([
        ["Lait", false],
        ["Œufs", false],
        ["Pain", false],
        ["Avocats", false],
        ["Blanc de poulet", false],
      ]),
      createdAt: iso(480),
      updatedAt: iso(120),
    },
    {
      ...base,
      id: uid(),
      title: "Notes réunion équipe",
      content:
        "Roadmap Q2 discutée, stratégie marketing et retour client.\nProchaine réunion : 29 mai.",
      status: "in_progress",
      color: "blue",
      tag: "Travail",
      isFavorite: true,
      checklist: [],
      createdAt: iso(300),
      updatedAt: iso(60),
    },
    {
      ...base,
      id: uid(),
      title: "Idée d'app",
      content:
        "Un tracker d'habitudes intelligent qui s'intègre avec les calendriers et suggère des objectifs personnalisés.",
      status: "in_progress",
      color: "purple",
      tag: "Idées",
      checklist: [],
      createdAt: iso(1440),
      updatedAt: iso(200),
    },
    {
      ...base,
      id: uid(),
      title: "Deadline : Rapport",
      content:
        "Soumettre le rapport trimestriel à Marie d'ici le 31 mai.\nNe pas oublier de revoir les données financières.",
      status: "in_progress",
      color: "yellow",
      tag: "Travail",
      reminderAt: new Date(now + 3 * 86400000).toISOString(),
      checklist: [],
      createdAt: iso(800),
      updatedAt: iso(90),
    },
    {
      ...base,
      id: uid(),
      title: "Plan vacances",
      content: "",
      status: "todo",
      color: "mint",
      tag: "Personnel",
      checklist: cl([
        ["Voyage à Bali en août", true],
        ["Réserver vols, hôtel et explorer les expériences locales", false],
        ["Prévoir assurance voyage", false],
      ]),
      createdAt: iso(2000),
      updatedAt: iso(150),
    },
    {
      ...base,
      id: uid(),
      title: "Livre à lire",
      content: "",
      status: "todo",
      color: "blue",
      tag: "Personnel",
      checklist: cl([
        ["The Psychology of Money", false],
        ["Atomic Habits", false],
        ["Deep Work", false],
        ["The 5 AM Club", false],
      ]),
      createdAt: iso(2600),
      updatedAt: iso(320),
    },
    {
      ...base,
      id: uid(),
      title: "Feedback client",
      content:
        "Le client a adoré le nouveau design ! Demandé quelques ajustements dans le tableau de bord et la vue mobile.",
      status: "todo",
      color: "purple",
      tag: "Travail",
      checklist: [],
      createdAt: iso(700),
      updatedAt: iso(45),
    },
    {
      ...base,
      id: uid(),
      title: "Idées side hustle",
      content: "",
      status: "todo",
      color: "yellow",
      tag: "Idées",
      checklist: cl([
        ["Cours en ligne", false],
        ["Impression à la demande", false],
        ["Chaîne YouTube", false],
        ["Consulting freelance", false],
      ]),
      createdAt: iso(3000),
      updatedAt: iso(500),
    },
    {
      ...base,
      id: uid(),
      title: "Budget mensuel",
      content:
        "Suivre les dépenses de juin. Objectif d'épargne : 20% du revenu.",
      status: "done",
      color: "green",
      tag: "Finance",
      checklist: cl([
        ["Loyer & charges", true],
        ["Courses", true],
        ["Abonnements", true],
      ]),
      createdAt: iso(4000),
      updatedAt: iso(800),
    },
    {
      ...base,
      id: uid(),
      title: "Anniversaire Léa",
      content: "Acheter un cadeau et réserver le restaurant pour le 12 juillet.",
      status: "todo",
      color: "pink",
      tag: "Rappels",
      reminderAt: new Date(now + 10 * 86400000).toISOString(),
      checklist: [],
      createdAt: iso(900),
      updatedAt: iso(700),
    },
    {
      ...base,
      id: uid(),
      title: "Setup home office",
      content: "",
      status: "done",
      color: "mint",
      tag: "Personnel",
      isArchived: true,
      checklist: cl([
        ["Nouveau bureau", true],
        ["Chaise ergonomique", true],
        ["Éclairage", true],
      ]),
      createdAt: iso(6000),
      updatedAt: iso(2000),
    },
  ] as Omit<Note, "userId">[];

  // Assign owners: most demo notes go to "marie", a few to "lucas",
  // and the last couple to the admin account so each user has data.
  const owners = [
    SEED_IDS.marie,
    SEED_IDS.marie,
    SEED_IDS.marie,
    SEED_IDS.marie,
    SEED_IDS.marie,
    SEED_IDS.marie,
    SEED_IDS.lucas,
    SEED_IDS.lucas,
    SEED_IDS.lucas,
    SEED_IDS.lucas,
    SEED_IDS.admin,
    SEED_IDS.admin,
  ];

  return notes.map((n, i) => ({
    ...n,
    userId: owners[i % owners.length],
  }));
}
