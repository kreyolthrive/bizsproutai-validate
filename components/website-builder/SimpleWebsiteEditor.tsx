"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  loadMicroAppConfigs,
  saveMicroAppConfigs,
} from "@/src/microapps/storage";
import type { MicroAppConfig, MicroAppType } from "@/src/microapps/types";

type Direction = "left" | "right" | "up" | "down";

type NavLink = {
  id: string;
  label: string;
  href: string;
};

type Hero = {
  kicker: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  mediaZoom: number;
  mediaPosition: "left" | "center" | "right";
  removeBackground: boolean;
};

type SectionBlock = {
  id: string;
  type: "features" | "testimonials" | "gallery" | "lead" | "custom";
  title: string;
  text: string;
  imageUrl: string;
  videoUrl: string;
  ctaLabel: string;
  ctaLink: string;
  imageZoom: number;
  imagePosition: "left" | "center" | "right";
  removeBackground: boolean;
  sectionHeight: "tight" | "normal" | "loose";
  backgroundMode: "solid" | "gradient" | "image";
  backgroundColor: string;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  backgroundImageUrl: string;
};

type PageModel = {
  id: string;
  title: string;
  slug: string;
  showInNav: boolean;
  hero: Hero;
  sections: SectionBlock[];
};

type WebsiteModel = {
  brandName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  navLinks: NavLink[];
  navbarCtaLabel: string;
  navbarCtaLink: string;
  pages: PageModel[];
  homePageId: string;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  leadMagnet: {
    enabled: boolean;
    title: string;
    text: string;
    buttonLabel: string;
    buttonLink: string;
    direction: Direction;
  };
  footer: {
    enabled: boolean;
    text: string;
    links: NavLink[];
  };
  pageOpenDirection: Direction;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const STORAGE_KEY = "bizspr.website-editor.v1";
const KNOWN_LOCALES = ["en", "fr", "ht", "es", "pt"];
const BRAND_COLOR_SWATCHES = [
  "#0f172a", "#1e293b", "#334155", "#2563eb", "#1d4ed8", "#0ea5e9",
  "#0891b2", "#059669", "#16a34a", "#ca8a04", "#ea580c", "#dc2626",
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function defaultPage(title: string): PageModel {
  const safeTitle = titleCase(title) || "New Page";
  return {
    id: uid("page"),
    title: safeTitle,
    slug: slugify(safeTitle) || "new-page",
    showInNav: true,
    hero: {
      kicker: "NEW PAGE",
      title: safeTitle,
      subtitle: "Describe this page in one clear sentence.",
      primaryCtaLabel: "Get Started",
      primaryCtaLink: "#",
      secondaryCtaLabel: "Learn More",
      secondaryCtaLink: "#",
      mediaType: "image",
      mediaUrl:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
      mediaZoom: 100,
      mediaPosition: "center",
      removeBackground: false,
    },
    sections: [
      {
        id: uid("section"),
        type: "features",
        title: "Core features",
        text: "Add the strongest outcomes your users get.",
        imageUrl: "",
        videoUrl: "",
        ctaLabel: "Try now",
        ctaLink: "#",
        imageZoom: 100,
        imagePosition: "center",
        removeBackground: false,
        sectionHeight: "normal",
        backgroundMode: "solid",
        backgroundColor: "#f8fafc",
        backgroundGradientFrom: "#f8fafc",
        backgroundGradientTo: "#e2e8f0",
        backgroundImageUrl: "",
      },
    ],
  };
}

const DEFAULT_MODEL: WebsiteModel = {
  brandName: "Your Brand",
  tagline: "A clear promise your audience understands in 3 seconds.",
  primaryColor: "#2563eb",
  accentColor: "#0f172a",
  backgroundColor: "#f8fafc",
  textColor: "#0f172a",
  navLinks: [
    { id: uid("nav"), label: "Home", href: "/home" },
    { id: uid("nav"), label: "About", href: "/about" },
    { id: uid("nav"), label: "Contact", href: "/contact" },
  ],
  navbarCtaLabel: "Book Call",
  navbarCtaLink: "#",
  homePageId: "",
  themeColors: {
    primary: "#2563eb",
    secondary: "#0f172a",
    accent: "#0ea5e9",
    neutral: "#f8fafc",
  },
  pages: [
    {
      id: uid("page"),
      title: "Home",
      slug: "home",
      showInNav: true,
      hero: {
        kicker: "BUILT FOR GROWTH",
        title: "Launch a real business website in minutes",
        subtitle:
          "Edit text, images, pages, and sections from one place. No coding needed.",
        primaryCtaLabel: "Start Free",
        primaryCtaLink: "#",
        secondaryCtaLabel: "See Demo",
        secondaryCtaLink: "#",
        mediaType: "video",
        mediaUrl:
          "https://www.w3schools.com/html/mov_bbb.mp4",
        mediaZoom: 100,
        mediaPosition: "center",
        removeBackground: false,
      },
      sections: [
        {
          id: uid("section"),
          type: "features",
          title: "Everything is editable",
          text: "Navbar, hero, sections, footer, lead capture, pages, and media are all editable live.",
          imageUrl:
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80",
          videoUrl: "",
          ctaLabel: "Customize now",
          ctaLink: "#",
          imageZoom: 100,
          imagePosition: "center",
          removeBackground: false,
          sectionHeight: "normal",
          backgroundMode: "solid",
          backgroundColor: "#f8fafc",
          backgroundGradientFrom: "#f8fafc",
          backgroundGradientTo: "#e2e8f0",
          backgroundImageUrl: "",
        },
        {
          id: uid("section"),
          type: "gallery",
          title: "Portfolio and media",
          text: "Add product shots, client work, and promo videos.",
          imageUrl:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
          videoUrl: "",
          ctaLabel: "Upload media",
          ctaLink: "#",
          imageZoom: 100,
          imagePosition: "center",
          removeBackground: false,
          sectionHeight: "normal",
          backgroundMode: "solid",
          backgroundColor: "#f8fafc",
          backgroundGradientFrom: "#f8fafc",
          backgroundGradientTo: "#e2e8f0",
          backgroundImageUrl: "",
        },
      ],
    },
  ],
  leadMagnet: {
    enabled: true,
    title: "Free Growth Checklist",
    text: "Get the launch checklist and first-week playbook.",
    buttonLabel: "Download",
    buttonLink: "#",
    direction: "right",
  },
  footer: {
    enabled: true,
    text: "© 2026 Your Brand. All rights reserved.",
    links: [
      { id: uid("footer"), label: "Privacy", href: "#" },
      { id: uid("footer"), label: "Terms", href: "#" },
      { id: uid("footer"), label: "WhatsApp", href: "#" },
    ],
  },
  pageOpenDirection: "right",
};
DEFAULT_MODEL.homePageId = DEFAULT_MODEL.pages[0].id;

function directionClass(direction: Direction) {
  if (direction === "left") return "animate-[slideInLeft_260ms_ease-out]";
  if (direction === "right") return "animate-[slideInRight_260ms_ease-out]";
  if (direction === "up") return "animate-[slideInUp_260ms_ease-out]";
  return "animate-[slideInDown_260ms_ease-out]";
}

function extractUrl(text: string) {
  const match = text.match(/(https?:\/\/\S+|\/\S+)/i);
  return match?.[1] ?? "";
}

const DEFAULT_HERO_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80";

const EDITOR_COPY = {
  en: {
    top: { exitPreview: "Exit Preview", preview: "Preview", undo: "Undo", redo: "Redo", save: "Save", publish: "Publish", editingOn: "Editing On", editingOff: "Editing Off", unsaved: "Unsaved changes", saved: "Saved" },
    toolbar: { bold: "Bold", italic: "Italic", underline: "Underline", link: "Link", enterLink: "Enter link URL", size: "Size", left: "Left", center: "Center", right: "Right" },
    panel: { title: "Kid-Simple Website Editor", downloadHtml: "Download HTML", subtitle: "Edit everything from this panel or tell the floating assistant what to change." },
    sections: { brand: "Brand", pages: "Pages", microApps: "Micro-Apps", navbar: "Navbar + CTA", hero: "Hero", buttonEditor: "Button Editor", section: "Sections", library: "Library", leadFooterMotion: "Lead Magnet + Footer + Motion" },
    actions: { open: "Open", delete: "Delete", up: "Up", down: "Down", addPage: "Add Page", addNavLink: "Add Nav Link", addFooterLink: "Add Footer Link", addToNavbar: "Add to navbar + CTA", openForm: "Open form", viewSubmissions: "View submissions", apply: "Apply", uploadImage: "Upload image/screenshot", hideAi: "Hide AI Editor", showAi: "Edit with AI", replace: "Replace", remove: "Remove", duplicate: "Duplicate" },
    placeholders: { brandName: "Brand name", tagline: "Tagline", navCtaLabel: "Navbar CTA label", navCtaLink: "Navbar CTA link", kicker: "Kicker", heroTitle: "Hero title", heroSubtitle: "Hero subtitle", primaryCtaLabel: "Primary CTA label", primaryCtaLink: "Primary CTA link", mediaUrl: "Image or video URL", buttonText: "Button text", buttonLink: "Button link", sectionTitle: "Section title", sectionText: "Section text", sectionImageUrl: "Section image URL", sectionVideoUrl: "Section video URL", ctaLabel: "CTA label", ctaLink: "CTA link", leadTitle: "Lead magnet title", leadLink: "Lead magnet link", footerText: "Footer text", footerLinkText: "Footer link text", footerLinkUrl: "Footer link URL", bgImageUrl: "Background image URL", microAppName: "What should we call it?", microAppOffer: "Main service/offer", microAppDescription: "Description shown above the form", microAppServiceOptions: "Service options (comma separated)", microAppButtonText: "Button text", microAppContactMethods: "Contact methods: email, whatsapp, phone", chat: "Example: add page Services" },
    labels: { primary: "Primary", secondary: "Secondary", accent: "Accent", neutral: "Neutral", loadingMicroApps: "Loading micro-app settings...", removeBg: "Remove BG", contactForm: "Contact Form", faq: "FAQ", pricing: "Pricing", features: "Features", testimonials: "Testimonials", gallery: "Gallery", image: "Image", video: "Video", booking: "Booking", request: "Request", waitlist: "Waitlist", liveAt: "Live at", floatingAssistant: "Floating Website Assistant", plainEnglish: "Type plain English commands to edit instantly.", section: "Section", microAppHelp: "Add a direct booking/request/waitlist flow and map every submission to CRM contacts.", buttonTargetHeroPrimary: "Hero Primary", buttonTargetHeroSecondary: "Hero Secondary", buttonTargetSectionCta: "Section CTA" },
    motion: { right: "Open from right", left: "Open from left", up: "Open from up", down: "Open from down" },
    spacing: { tight: "Padding Tight", normal: "Padding Normal", loose: "Padding Loose" },
    background: { solid: "Solid BG", gradient: "Gradient BG", image: "Image BG" },
  },
  fr: {
    top: { exitPreview: "Quitter l’aperçu", preview: "Aperçu", undo: "Annuler", redo: "Rétablir", save: "Enregistrer", publish: "Publier", editingOn: "Édition active", editingOff: "Édition inactive", unsaved: "Modifications non enregistrées", saved: "Enregistré" },
    sections: { brand: "Marque", pages: "Pages", microApps: "Micro-apps", navbar: "Navigation + CTA", hero: "Héros", buttonEditor: "Éditeur de bouton", section: "Sections", library: "Bibliothèque", leadFooterMotion: "Lead magnet + pied + animation" },
    actions: { open: "Ouvrir", delete: "Supprimer", up: "Monter", down: "Descendre", addPage: "Ajouter une page", addNavLink: "Ajouter lien nav", addFooterLink: "Ajouter lien pied", addToNavbar: "Ajouter à la nav + CTA", openForm: "Ouvrir le formulaire", viewSubmissions: "Voir soumissions", apply: "Appliquer", uploadImage: "Téléverser image/capture", hideAi: "Masquer IA", showAi: "Éditer avec IA", replace: "Remplacer", remove: "Retirer", duplicate: "Dupliquer" },
    labels: { primary: "Principal", secondary: "Secondaire", accent: "Accent", neutral: "Neutre", loadingMicroApps: "Chargement des micro-apps...", removeBg: "Retirer fond", contactForm: "Formulaire de contact", faq: "FAQ", pricing: "Tarifs", features: "Fonctionnalités", testimonials: "Témoignages", gallery: "Galerie", image: "Image", video: "Vidéo", booking: "Réservation", request: "Demande", waitlist: "Attente", liveAt: "En ligne sur", floatingAssistant: "Assistant Web flottant", plainEnglish: "Tapez une commande simple pour éditer instantanément.", section: "Section" },
    motion: { right: "Ouvrir depuis la droite", left: "Ouvrir depuis la gauche", up: "Ouvrir depuis le haut", down: "Ouvrir depuis le bas" },
    spacing: { tight: "Padding serré", normal: "Padding normal", loose: "Padding large" },
    background: { solid: "Fond uni", gradient: "Fond dégradé", image: "Fond image" },
  },
  es: {
    top: { exitPreview: "Salir de vista previa", preview: "Vista previa", undo: "Deshacer", redo: "Rehacer", save: "Guardar", publish: "Publicar", editingOn: "Edición activa", editingOff: "Edición inactiva", unsaved: "Cambios sin guardar", saved: "Guardado" },
    sections: { brand: "Marca", pages: "Páginas", microApps: "Micro-apps", navbar: "Navbar + CTA", hero: "Hero", buttonEditor: "Editor de botón", section: "Secciones", library: "Biblioteca", leadFooterMotion: "Lead magnet + footer + animación" },
    actions: { open: "Abrir", delete: "Eliminar", up: "Arriba", down: "Abajo", addPage: "Agregar página", addNavLink: "Agregar enlace nav", addFooterLink: "Agregar enlace footer", addToNavbar: "Agregar a navbar + CTA", openForm: "Abrir formulario", viewSubmissions: "Ver envíos", apply: "Aplicar", uploadImage: "Subir imagen/captura", hideAi: "Ocultar IA", showAi: "Editar con IA", replace: "Reemplazar", remove: "Quitar", duplicate: "Duplicar" },
    labels: { primary: "Primario", secondary: "Secundario", accent: "Acento", neutral: "Neutro", loadingMicroApps: "Cargando micro-apps...", removeBg: "Quitar fondo", contactForm: "Formulario de contacto", faq: "FAQ", pricing: "Precios", features: "Funciones", testimonials: "Testimonios", gallery: "Galería", image: "Imagen", video: "Video", booking: "Reservas", request: "Solicitud", waitlist: "Lista", liveAt: "Activo en", floatingAssistant: "Asistente web flotante", plainEnglish: "Escribe comandos simples para editar al instante.", section: "Sección" },
    motion: { right: "Abrir desde la derecha", left: "Abrir desde la izquierda", up: "Abrir desde arriba", down: "Abrir desde abajo" },
    spacing: { tight: "Espaciado compacto", normal: "Espaciado normal", loose: "Espaciado amplio" },
    background: { solid: "Fondo sólido", gradient: "Fondo degradado", image: "Fondo imagen" },
  },
  ht: {
    top: { exitPreview: "Soti nan preview", preview: "Preview", undo: "Anile", redo: "Refè", save: "Sove", publish: "Pibliye", editingOn: "Edisyon limen", editingOff: "Edisyon etenn", unsaved: "Chanjman pa sove", saved: "Sove" },
    sections: { brand: "Mak", pages: "Paj", microApps: "Mikwo-apps", navbar: "Navbar + CTA", hero: "Ewo", buttonEditor: "Editè bouton", section: "Seksyon", library: "Bibliyotèk", leadFooterMotion: "Lead magnet + footer + mouvman" },
    actions: { open: "Louvri", delete: "Efase", up: "Monte", down: "Desann", addPage: "Ajoute paj", addNavLink: "Ajoute lyen nav", addFooterLink: "Ajoute lyen footer", addToNavbar: "Ajoute nan navbar + CTA", openForm: "Louvri fòm", viewSubmissions: "Gade soumisyon", apply: "Aplike", uploadImage: "Telechaje imaj/capture", hideAi: "Kache IA", showAi: "Edit ak IA", replace: "Ranplase", remove: "Retire", duplicate: "Kopye" },
    labels: { primary: "Prensipal", secondary: "Segondè", accent: "Aksan", neutral: "Net", loadingMicroApps: "Ap chaje mikwo-apps...", removeBg: "Retire background", contactForm: "Fòm kontak", faq: "FAQ", pricing: "Pri", features: "Fonksyon", testimonials: "Temwayaj", gallery: "Galri", image: "Imaj", video: "Videyo", booking: "Rezèvasyon", request: "Demann", waitlist: "Lis atant", liveAt: "An liy sou", floatingAssistant: "Asistan sit flotan", plainEnglish: "Ekri kòmandman senp pou modifye touswit.", section: "Seksyon" },
    motion: { right: "Louvri depi adwat", left: "Louvri depi agoch", up: "Louvri depi anlè", down: "Louvri depi anba" },
    spacing: { tight: "Padding etwat", normal: "Padding nòmal", loose: "Padding laj" },
    background: { solid: "Fon solid", gradient: "Fon degrade", image: "Fon imaj" },
  },
  pt: {
    top: { exitPreview: "Sair da prévia", preview: "Prévia", undo: "Desfazer", redo: "Refazer", save: "Salvar", publish: "Publicar", editingOn: "Edição ativa", editingOff: "Edição inativa", unsaved: "Alterações não salvas", saved: "Salvo" },
    sections: { brand: "Marca", pages: "Páginas", microApps: "Micro-apps", navbar: "Navbar + CTA", hero: "Hero", buttonEditor: "Editor de botão", section: "Seções", library: "Biblioteca", leadFooterMotion: "Lead magnet + rodapé + animação" },
    actions: { open: "Abrir", delete: "Excluir", up: "Subir", down: "Descer", addPage: "Adicionar página", addNavLink: "Adicionar link nav", addFooterLink: "Adicionar link rodapé", addToNavbar: "Adicionar ao navbar + CTA", openForm: "Abrir formulário", viewSubmissions: "Ver envios", apply: "Aplicar", uploadImage: "Enviar imagem/captura", hideAi: "Ocultar IA", showAi: "Editar com IA", replace: "Substituir", remove: "Remover", duplicate: "Duplicar" },
    labels: { primary: "Primária", secondary: "Secundária", accent: "Destaque", neutral: "Neutra", loadingMicroApps: "Carregando micro-apps...", removeBg: "Remover fundo", contactForm: "Formulário de contato", faq: "FAQ", pricing: "Preços", features: "Recursos", testimonials: "Depoimentos", gallery: "Galeria", image: "Imagem", video: "Vídeo", booking: "Agendamento", request: "Solicitação", waitlist: "Lista de espera", liveAt: "No ar em", floatingAssistant: "Assistente flutuante", plainEnglish: "Digite comandos simples para editar instantaneamente.", section: "Seção" },
    motion: { right: "Abrir pela direita", left: "Abrir pela esquerda", up: "Abrir por cima", down: "Abrir por baixo" },
    spacing: { tight: "Espaço compacto", normal: "Espaço normal", loose: "Espaço amplo" },
    background: { solid: "Fundo sólido", gradient: "Fundo gradiente", image: "Fundo imagem" },
  },
} as const;

function getEditorCopy(locale: string) {
  const base = EDITOR_COPY.en;
  const selected = EDITOR_COPY[locale as keyof typeof EDITOR_COPY] || base;
  return {
    ...base,
    ...selected,
    top: { ...base.top, ...(selected as typeof base).top },
    toolbar: { ...base.toolbar, ...(selected as typeof base).toolbar },
    panel: { ...base.panel, ...(selected as typeof base).panel },
    sections: { ...base.sections, ...(selected as typeof base).sections },
    actions: { ...base.actions, ...(selected as typeof base).actions },
    placeholders: { ...base.placeholders, ...(selected as typeof base).placeholders },
    labels: { ...base.labels, ...(selected as typeof base).labels },
    motion: { ...base.motion, ...(selected as typeof base).motion },
    spacing: { ...base.spacing, ...(selected as typeof base).spacing },
    background: { ...base.background, ...(selected as typeof base).background },
  };
}

export default function SimpleWebsiteEditor() {
  const [model, setModel] = useState<WebsiteModel>(DEFAULT_MODEL);
  const [activePageId, setActivePageId] = useState(DEFAULT_MODEL.pages[0].id);
  const [editMode, setEditMode] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedImageTarget, setSelectedImageTarget] = useState<
    | { kind: "hero" }
    | { kind: "section"; sectionId: string }
    | null
  >(null);
  const [selectedButtonTarget, setSelectedButtonTarget] = useState<
    | { kind: "hero-primary" }
    | { kind: "hero-secondary" }
    | { kind: "section"; sectionId: string }
    | null
  >(null);
  const [microApps, setMicroApps] = useState<MicroAppConfig[]>([]);
  const [selectedMicroAppType, setSelectedMicroAppType] =
    useState<MicroAppType>("consultation_booking");
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid("msg"),
      role: "assistant",
      text:
        "I can edit your website instantly. Try: 'change hero title to ...', 'add section testimonials', 'add micro app booking', or 'set CTA link https://...'.",
    },
  ]);
  const [chatUploadDataUrl, setChatUploadDataUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const elementImageInputRef = useRef<HTMLInputElement | null>(null);
  const historyRef = useRef<WebsiteModel[]>([]);
  const futureRef = useRef<WebsiteModel[]>([]);
  const pathname = usePathname();
  const localeCode = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean)[0];
    return KNOWN_LOCALES.includes(segment) ? segment : "en";
  }, [pathname]);
  const copy = useMemo(() => getEditorCopy(localeCode), [localeCode]);

  function sanitizeModel(input: WebsiteModel): WebsiteModel {
    const baseTheme = input.themeColors || DEFAULT_MODEL.themeColors;
    const pages = (input.pages || DEFAULT_MODEL.pages).map((page) => ({
      ...page,
      hero: {
        ...DEFAULT_MODEL.pages[0].hero,
        ...page.hero,
      },
      sections: (page.sections || []).map((section) => ({
        ...DEFAULT_MODEL.pages[0].sections[0],
        ...section,
      })),
    }));
    const homePageId = input.homePageId && pages.some((page) => page.id === input.homePageId)
      ? input.homePageId
      : pages[0]?.id || "";
    return {
      ...DEFAULT_MODEL,
      ...input,
      pages,
      homePageId,
      themeColors: {
        primary: baseTheme.primary || input.primaryColor || DEFAULT_MODEL.themeColors.primary,
        secondary: baseTheme.secondary || input.accentColor || DEFAULT_MODEL.themeColors.secondary,
        accent: baseTheme.accent || DEFAULT_MODEL.themeColors.accent,
        neutral: baseTheme.neutral || input.backgroundColor || DEFAULT_MODEL.themeColors.neutral,
      },
    };
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = sanitizeModel(JSON.parse(raw) as WebsiteModel);
      if (parsed?.pages?.length) {
        setModel(parsed);
        setActivePageId(parsed.homePageId || parsed.pages[0].id);
      }
    } catch {
      // Ignore bad local state and continue with defaults.
    }
  }, []);

  useEffect(() => {
    setMicroApps(loadMicroAppConfigs());
  }, []);

  const previousModelRef = useRef<WebsiteModel | null>(null);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
    if (previousModelRef.current) {
      historyRef.current.push(previousModelRef.current);
      if (historyRef.current.length > 100) historyRef.current.shift();
      futureRef.current = [];
      setHasUnsavedChanges(true);
    }
    previousModelRef.current = model;
  }, [model]);

  useEffect(() => {
    if (!microApps.length) return;
    saveMicroAppConfigs(microApps);
  }, [microApps]);

  const localePrefix = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean)[0];
    if (!segment) return "";
    return KNOWN_LOCALES.includes(segment) ? `/${segment}` : "";
  }, [pathname]);

  const activePage = useMemo(
    () => model.pages.find((p) => p.id === activePageId) ?? model.pages[0],
    [model.pages, activePageId],
  );
  const selectedMicroApp =
    microApps.find((app) => app.type === selectedMicroAppType) ?? microApps[0];

  function updateMicroApp(
    type: MicroAppType,
    updater: (app: MicroAppConfig) => MicroAppConfig,
  ) {
    setMicroApps((prev) => prev.map((app) => (app.type === type ? updater(app) : app)));
  }

  function ensureNavLink(label: string, href: string) {
    setModel((prev) => {
      const exists = prev.navLinks.some((link) => link.href === href);
      if (exists) return prev;
      return {
        ...prev,
        navLinks: [...prev.navLinks, { id: uid("nav"), label, href }],
      };
    });
  }

  function updateActivePage(updater: (page: PageModel) => PageModel) {
    setModel((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === activePage.id ? updater(page) : page,
      ),
    }));
  }

  function undoChange() {
    const previous = historyRef.current.pop();
    if (!previous) return;
    futureRef.current.push(model);
    setModel(previous);
  }

  function redoChange() {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push(model);
    setModel(next);
  }

  function saveChanges() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
    setHasUnsavedChanges(false);
  }

  function publishSite() {
    saveChanges();
    window.open(`${localePrefix}/website-builder/publish`, "_blank");
  }

  function applyTextCommand(command: string, value?: string) {
    if (typeof document === "undefined") return;
    document.execCommand(command, false, value);
  }

  function moveSection(sectionId: string, direction: "up" | "down") {
    updateActivePage((page) => {
      const index = page.sections.findIndex((section) => section.id === sectionId);
      if (index < 0) return page;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= page.sections.length) return page;
      const nextSections = [...page.sections];
      const [picked] = nextSections.splice(index, 1);
      nextSections.splice(target, 0, picked);
      return { ...page, sections: nextSections };
    });
  }

  function duplicateSection(sectionId: string) {
    updateActivePage((page) => {
      const index = page.sections.findIndex((section) => section.id === sectionId);
      if (index < 0) return page;
      const section = page.sections[index];
      const clone: SectionBlock = { ...section, id: uid("section"), title: `${section.title} Copy` };
      const nextSections = [...page.sections];
      nextSections.splice(index + 1, 0, clone);
      return { ...page, sections: nextSections };
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redoChange();
        } else {
          undoChange();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [model]);

  function pushMessage(role: "user" | "assistant", text: string) {
    setMessages((prev) => [...prev, { id: uid("msg"), role, text }]);
  }

  function addSection(type: SectionBlock["type"]) {
    updateActivePage((page) => ({
      ...page,
      sections: [
        ...page.sections,
        {
          id: uid("section"),
          type,
          title: `${titleCase(type)} Section`,
          text: "Write a short, specific value statement here.",
          imageUrl: "",
          videoUrl: "",
          ctaLabel: "Learn more",
          ctaLink: "#",
          imageZoom: 100,
          imagePosition: "center",
          removeBackground: false,
          sectionHeight: "normal",
          backgroundMode: "solid",
          backgroundColor: "#f8fafc",
          backgroundGradientFrom: "#f8fafc",
          backgroundGradientTo: "#e2e8f0",
          backgroundImageUrl: "",
        },
      ],
    }));
  }

  function applyChatCommand(rawText: string) {
    const text = rawText.trim();
    const lower = text.toLowerCase();

    if (!text) return "Type a command first.";

    const clean = lower
      .replace(/\s+/g, " ")
      .replace(/place holder/g, "placeholder")
      .trim();

    if (lower.startsWith("add page")) {
      const name = text.replace(/add page/i, "").trim() || "New Page";
      const page = defaultPage(name);
      setModel((prev) => ({ ...prev, pages: [...prev.pages, page] }));
      setActivePageId(page.id);
      return `Added page '${page.title}'.`;
    }

    if (clean.includes("add micro app") || clean.includes("enable micro app")) {
      const targetType: MicroAppType = clean.includes("waitlist")
        ? "waitlist"
        : clean.includes("service")
          ? "service_request"
          : "consultation_booking";
      updateMicroApp(targetType, (app) => ({ ...app, enabled: true }));
      setSelectedMicroAppType(targetType);
      const target = microApps.find((app) => app.type === targetType);
      if (target) {
        const href = `${localePrefix}${target.urlPath}`;
        ensureNavLink(target.buttonLabel, href);
      }
      return "Micro-app enabled and added to navigation if missing.";
    }

    if (clean.includes("disable micro app")) {
      const targetType: MicroAppType = clean.includes("waitlist")
        ? "waitlist"
        : clean.includes("service")
          ? "service_request"
          : "consultation_booking";
      updateMicroApp(targetType, (app) => ({ ...app, enabled: false }));
      return "Micro-app disabled.";
    }

    if (lower.startsWith("switch page")) {
      const name = text.replace(/switch page/i, "").trim().toLowerCase();
      const found = model.pages.find((p) => p.title.toLowerCase().includes(name));
      if (!found) return "I could not find that page.";
      setActivePageId(found.id);
      return `Switched to '${found.title}'.`;
    }

    if (
      clean.includes("hero title") ||
      clean.includes("hero headline") ||
      clean.startsWith("headline") ||
      clean.startsWith("title")
    ) {
      const value = text
        .replace(/^(change|set|update)\s+/i, "")
        .split(/(hero title|hero headline|headline|title)\s*(to)?/i)
        .pop()
        ?.trim();
      if (!value) return "Tell me the new hero title.";
      updateActivePage((page) => ({ ...page, hero: { ...page.hero, title: value } }));
      return "Updated hero title.";
    }

    if (
      clean.includes("subtitle") ||
      clean.includes("subheadline") ||
      clean.includes("hero text")
    ) {
      const value = text
        .replace(/.*(subtitle|subheadline|hero text)\s*(to)?/i, "")
        .trim();
      if (!value) return "Tell me the new subtitle.";
      updateActivePage((page) => ({ ...page, hero: { ...page.hero, subtitle: value } }));
      return "Updated subtitle.";
    }

    if (lower.includes("brand name")) {
      const value = text.replace(/.*brand name\s*(to)?/i, "").trim();
      if (!value) return "Tell me the brand name.";
      setModel((prev) => ({ ...prev, brandName: value }));
      return "Updated brand name.";
    }

    if (lower.includes("tagline")) {
      const value = text.replace(/.*tagline\s*(to)?/i, "").trim();
      if (!value) return "Tell me the tagline.";
      setModel((prev) => ({ ...prev, tagline: value }));
      return "Updated tagline.";
    }

    if (lower.includes("add section")) {
      const type: SectionBlock["type"] =
        lower.includes("testimonial")
          ? "testimonials"
          : lower.includes("gallery")
            ? "gallery"
            : lower.includes("lead")
              ? "lead"
              : lower.includes("feature")
                ? "features"
                : "custom";
      addSection(type);
      return `Added ${type} section.`;
    }

    if (lower.startsWith("remove section")) {
      const n = Number(text.replace(/remove section/i, "").trim());
      if (!Number.isFinite(n) || n < 1 || n > activePage.sections.length) {
        return `Use: remove section 1..${activePage.sections.length}`;
      }
      updateActivePage((page) => ({
        ...page,
        sections: page.sections.filter((_, i) => i !== n - 1),
      }));
      return `Removed section ${n}.`;
    }

    if (lower.includes("cta link") || lower.includes("set cta")) {
      const url = extractUrl(text);
      if (!url) return "Include a URL, for example: set CTA link https://example.com/book";
      updateActivePage((page) => ({
        ...page,
        hero: { ...page.hero, primaryCtaLink: url },
      }));
      return "Updated primary CTA link.";
    }

    if (lower.includes("navbar cta")) {
      const url = extractUrl(text);
      if (!url) return "Include a URL for navbar CTA.";
      setModel((prev) => ({ ...prev, navbarCtaLink: url }));
      return "Updated navbar CTA link.";
    }

    if (lower.includes("brand color")) {
      const hex = text.match(/#(?:[0-9a-f]{3}|[0-9a-f]{6})/i)?.[0];
      if (!hex) return "Include a color hex, for example: set brand color #1d4ed8";
      setModel((prev) => ({ ...prev, primaryColor: hex }));
      return "Updated brand color.";
    }

    if (lower.includes("animation") || lower.includes("open to")) {
      const direction: Direction = lower.includes("left")
        ? "left"
        : lower.includes("up")
          ? "up"
          : lower.includes("down")
            ? "down"
            : "right";
      setModel((prev) => ({ ...prev, pageOpenDirection: direction, leadMagnet: { ...prev.leadMagnet, direction } }));
      return `Set opening direction to ${direction}.`;
    }

    if (lower.includes("lead magnet")) {
      if (lower.includes("hide") || lower.includes("remove")) {
        setModel((prev) => ({ ...prev, leadMagnet: { ...prev.leadMagnet, enabled: false } }));
        return "Lead magnet hidden.";
      }
      setModel((prev) => ({ ...prev, leadMagnet: { ...prev.leadMagnet, enabled: true } }));
      return "Lead magnet enabled.";
    }

    if (lower.includes("footer")) {
      if (lower.includes("hide") || lower.includes("remove")) {
        setModel((prev) => ({ ...prev, footer: { ...prev.footer, enabled: false } }));
        return "Footer hidden.";
      }
      setModel((prev) => ({ ...prev, footer: { ...prev.footer, enabled: true } }));
      return "Footer enabled.";
    }

    if (
      clean.includes("hero image") ||
      clean.includes("add image") ||
      clean.includes("placeholder image") ||
      clean.includes("image placeholder")
    ) {
      const wantsPlaceholder =
        clean.includes("placeholder") ||
        clean.includes("sample image") ||
        clean.includes("demo image");
      const url =
        extractUrl(text) ||
        chatUploadDataUrl ||
        (wantsPlaceholder ? DEFAULT_HERO_PLACEHOLDER_IMAGE : "");
      if (!url) {
        return "I need an image URL. You can also say 'add image placeholder to hero'.";
      }
      updateActivePage((page) => ({
        ...page,
        hero: { ...page.hero, mediaType: "image", mediaUrl: url },
      }));
      if (wantsPlaceholder && !extractUrl(text) && !chatUploadDataUrl) {
        return "Added a placeholder image to the hero.";
      }
      return "Updated hero image.";
    }

    if (clean.includes("book link") || clean.includes("cta to booking")) {
      const href = `${localePrefix}/book`;
      updateActivePage((page) => ({
        ...page,
        hero: {
          ...page.hero,
          primaryCtaLabel: "Book Consultation",
          primaryCtaLink: href,
        },
      }));
      return "Primary CTA now points to your booking micro-app.";
    }

    if (lower.includes("hero video") || lower.includes("add video")) {
      const url = extractUrl(text);
      if (!url) return "Add a video URL first.";
      updateActivePage((page) => ({
        ...page,
        hero: { ...page.hero, mediaType: "video", mediaUrl: url },
      }));
      return "Updated hero video.";
    }

    if (clean.includes("love you") || clean.includes("thank you") || clean.includes("thanks")) {
      return "Love you too. Tell me what to edit next and I’ll do it instantly.";
    }

    return "I couldn’t apply that yet. Try: 'add image placeholder to hero', 'change hero title to ...', 'add page services', 'add micro app booking', or 'set CTA link https://...'.";
  }

  function runChatCommand() {
    pushMessage("user", chatInput || "(empty)");
    const response = applyChatCommand(chatInput);
    pushMessage("assistant", response);
    setChatInput("");
  }

  function onUploadFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setChatUploadDataUrl(dataUrl);
      pushMessage("assistant", "Image uploaded. Say 'add image' to place it in the hero.");
    };
    reader.readAsDataURL(file);
  }

  function onUploadElementImage(file: File | undefined) {
    if (!file || !selectedImageTarget) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl) return;
      if (selectedImageTarget.kind === "hero") {
        updateActivePage((page) => ({
          ...page,
          hero: { ...page.hero, mediaType: "image", mediaUrl: dataUrl },
        }));
      } else {
        updateActivePage((page) => ({
          ...page,
          sections: page.sections.map((section) =>
            section.id === selectedImageTarget.sectionId
              ? { ...section, imageUrl: dataUrl }
              : section,
          ),
        }));
      }
    };
    reader.readAsDataURL(file);
  }

  function exportCurrentPageAsHtml() {
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${activePage.title}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: ${model.backgroundColor}; color: ${model.textColor}; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .nav { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .menu { display: flex; gap: 10px; }
    .btn { display: inline-block; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 700; }
    .btn-primary { background: ${model.primaryColor}; color: white; }
    .hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px; margin-top: 24px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-top: 16px; }
    img, video { width: 100%; border-radius: 12px; }
    footer { margin-top: 32px; background: #020617; color: #e2e8f0; padding: 20px; border-radius: 12px; }
    @media (max-width: 860px) { .hero { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="nav">
      <strong>${model.brandName}</strong>
      <div class="menu">${model.navLinks
        .map((l) => `<a href="${l.href}">${l.label}</a>`)
        .join("")}</div>
      <a class="btn btn-primary" href="${model.navbarCtaLink}">${model.navbarCtaLabel}</a>
    </div>
    <section class="hero">
      <div>
        <p>${activePage.hero.kicker}</p>
        <h1>${activePage.hero.title}</h1>
        <p>${activePage.hero.subtitle}</p>
        <a class="btn btn-primary" href="${activePage.hero.primaryCtaLink}">${activePage.hero.primaryCtaLabel}</a>
      </div>
      <div>${activePage.hero.mediaType === "video"
        ? `<video controls src="${activePage.hero.mediaUrl}"></video>`
        : `<img src="${activePage.hero.mediaUrl}" alt="Hero media" />`}</div>
    </section>
    ${activePage.sections
      .map(
        (s) => `<section class="card">
      <h2>${s.title}</h2><p>${s.text}</p>
      ${s.imageUrl ? `<img src="${s.imageUrl}" alt="${s.title}" />` : ""}
      ${s.videoUrl ? `<video controls src="${s.videoUrl}"></video>` : ""}
      <p><a class="btn btn-primary" href="${s.ctaLink}">${s.ctaLabel}</a></p>
    </section>`,
      )
      .join("")}
    ${
      model.footer.enabled
        ? `<footer><p>${model.footer.text}</p>${model.footer.links
            .map((l) => `<a style="color:#93c5fd;margin-right:10px;" href="${l.href}">${l.label}</a>`)
            .join("")}</footer>`
        : ""
    }
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePage.slug || "page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <style>{`
      @keyframes slideInLeft { from { transform: translateX(-28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideInRight { from { transform: translateX(28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideInUp { from { transform: translateY(-28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes slideInDown { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode((prev) => !prev)}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {previewMode ? copy.top.exitPreview : copy.top.preview}
            </button>
            <button
              type="button"
              onClick={undoChange}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {copy.top.undo}
            </button>
            <button
              type="button"
              onClick={redoChange}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {copy.top.redo}
            </button>
            <button
              type="button"
              onClick={saveChanges}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {copy.top.save}
            </button>
            <button
              type="button"
              onClick={publishSite}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
            >
              {copy.top.publish}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {editMode ? copy.top.editingOn : copy.top.editingOff}
            </button>
            {hasUnsavedChanges ? (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                {copy.top.unsaved}
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                {copy.top.saved}
              </span>
            )}
          </div>
        </div>
        {editMode && !previewMode ? (
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 pb-3">
            <button type="button" onClick={() => applyTextCommand("bold")} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.toolbar.bold}</button>
            <button type="button" onClick={() => applyTextCommand("italic")} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.toolbar.italic}</button>
            <button type="button" onClick={() => applyTextCommand("underline")} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.toolbar.underline}</button>
            <button
              type="button"
              onClick={() => {
                const href = window.prompt(copy.toolbar.enterLink);
                if (href) applyTextCommand("createLink", href);
              }}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              {copy.toolbar.link}
            </button>
            <select
              className="rounded border border-slate-300 px-2 py-1 text-xs"
              onChange={(e) => applyTextCommand("fontSize", e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>{copy.toolbar.size}</option>
              <option value="2">S</option>
              <option value="3">M</option>
              <option value="5">L</option>
              <option value="6">XL</option>
            </select>
            <button type="button" onClick={() => applyTextCommand("justifyLeft")} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.toolbar.left}</button>
            <button type="button" onClick={() => applyTextCommand("justifyCenter")} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.toolbar.center}</button>
            <button type="button" onClick={() => applyTextCommand("justifyRight")} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.toolbar.right}</button>
            <div className="ml-2 flex flex-wrap gap-1">
              {BRAND_COLOR_SWATCHES.map((color) => (
                <button
                  key={`text-${color}`}
                  type="button"
                  title={`Text ${color}`}
                  onClick={() => applyTextCommand("foreColor", color)}
                  className="h-5 w-5 rounded border border-slate-300"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className={`mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 ${previewMode ? "" : "lg:grid-cols-[420px_1fr]"}`}>
        <aside className={`space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${previewMode ? "hidden" : ""}`}>
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-slate-900">{copy.panel.title}</h1>
            <button
              type="button"
              onClick={exportCurrentPageAsHtml}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
            >
              {copy.panel.downloadHtml}
            </button>
          </div>
          <p className="text-sm text-slate-600">
            {copy.panel.subtitle}
          </p>

          <div className="rounded-xl border border-slate-200 p-3">
            <h2 className="text-sm font-semibold text-slate-900">{copy.sections.brand}</h2>
            <div className="mt-2 space-y-2">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={model.brandName}
                onChange={(e) => setModel((prev) => ({ ...prev, brandName: e.target.value }))}
                placeholder={copy.placeholders.brandName}
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={model.tagline}
                onChange={(e) => setModel((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder={copy.placeholders.tagline}
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-600">
                  {copy.labels.primary}
                  <input
                    type="color"
                    className="mt-1 h-10 w-full rounded-md"
                    value={model.themeColors.primary}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        primaryColor: e.target.value,
                        themeColors: { ...prev.themeColors, primary: e.target.value },
                      }))
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  {copy.labels.secondary}
                  <input
                    type="color"
                    className="mt-1 h-10 w-full rounded-md"
                    value={model.themeColors.secondary}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        accentColor: e.target.value,
                        themeColors: { ...prev.themeColors, secondary: e.target.value },
                      }))
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  {copy.labels.accent}
                  <input
                    type="color"
                    className="mt-1 h-10 w-full rounded-md"
                    value={model.themeColors.accent}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        themeColors: { ...prev.themeColors, accent: e.target.value },
                      }))
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  {copy.labels.neutral}
                  <input
                    type="color"
                    className="mt-1 h-10 w-full rounded-md"
                    value={model.themeColors.neutral}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                        themeColors: { ...prev.themeColors, neutral: e.target.value },
                      }))
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {BRAND_COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() =>
                      setModel((prev) => ({
                        ...prev,
                        primaryColor: color,
                        themeColors: { ...prev.themeColors, primary: color },
                      }))
                    }
                    className="h-6 w-full rounded border border-slate-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h2 className="text-sm font-semibold text-slate-900">{copy.sections.pages}</h2>
            <div className="mt-2 space-y-2">
              {model.pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`rounded-md border px-2 py-2 ${
                    activePage.id === page.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => setActivePageId(page.id)}
                      className="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
                    >
                      {copy.actions.open}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setModel((prev) => ({
                            ...prev,
                            homePageId: page.id,
                          }))
                        }
                        className={`rounded px-2 py-1 text-xs ${model.homePageId === page.id ? "bg-amber-100 text-amber-700" : "bg-white text-slate-600"}`}
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setModel((prev) => {
                            if (prev.pages.length <= 1) return prev;
                            const nextPages = prev.pages.filter((item) => item.id !== page.id);
                            return {
                              ...prev,
                              pages: nextPages,
                              homePageId: prev.homePageId === page.id ? nextPages[0]?.id || "" : prev.homePageId,
                            };
                          })
                        }
                        className="rounded bg-red-100 px-2 py-1 text-xs text-red-700"
                      >
                        {copy.actions.delete}
                      </button>
                    </div>
                  </div>
                  <input
                    value={page.title}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        pages: prev.pages.map((item) =>
                          item.id === page.id ? { ...item, title: e.target.value, slug: slugify(e.target.value) } : item,
                        ),
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setModel((prev) => {
                          if (index === 0) return prev;
                          const nextPages = [...prev.pages];
                          const [picked] = nextPages.splice(index, 1);
                          nextPages.splice(index - 1, 0, picked);
                          return { ...prev, pages: nextPages };
                        })
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      {copy.actions.up}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setModel((prev) => {
                          if (index === prev.pages.length - 1) return prev;
                          const nextPages = [...prev.pages];
                          const [picked] = nextPages.splice(index, 1);
                          nextPages.splice(index + 1, 0, picked);
                          return { ...prev, pages: nextPages };
                        })
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      {copy.actions.down}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const page = defaultPage(`Page ${model.pages.length + 1}`);
                  setModel((prev) => ({
                    ...prev,
                    pages: [...prev.pages, page],
                    homePageId: prev.homePageId || page.id,
                  }));
                  setActivePageId(page.id);
                }}
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                {copy.actions.addPage}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h2 className="text-sm font-semibold text-slate-900">{copy.sections.microApps}</h2>
            <p className="mt-1 text-xs text-slate-600">
              {copy.labels.microAppHelp}
            </p>
            {selectedMicroApp ? (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  {microApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedMicroAppType(app.type)}
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        selectedMicroAppType === app.type
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {app.type === "consultation_booking"
                        ? copy.labels.booking
                        : app.type === "service_request"
                          ? copy.labels.request
                          : copy.labels.waitlist}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedMicroApp.enabled}
                    onChange={(e) =>
                      updateMicroApp(selectedMicroApp.type, (app) => ({ ...app, enabled: e.target.checked }))
                    }
                  />
                  {copy.labels.liveAt} {localePrefix || "/"}{selectedMicroApp.urlPath.replace("/", "")}
                </label>

                <input
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={selectedMicroApp.title}
                  onChange={(e) =>
                    updateMicroApp(selectedMicroApp.type, (app) => ({ ...app, title: e.target.value }))
                  }
                  placeholder={copy.placeholders.microAppName}
                />
                <input
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={selectedMicroApp.mainOffer}
                  onChange={(e) =>
                    updateMicroApp(selectedMicroApp.type, (app) => ({ ...app, mainOffer: e.target.value }))
                  }
                  placeholder={copy.placeholders.microAppOffer}
                />
                <textarea
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={selectedMicroApp.description}
                  onChange={(e) =>
                    updateMicroApp(selectedMicroApp.type, (app) => ({ ...app, description: e.target.value }))
                  }
                  placeholder={copy.placeholders.microAppDescription}
                />
                {selectedMicroApp.type === "service_request" ? (
                  <input
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                    value={selectedMicroApp.serviceOptions.join(", ")}
                    onChange={(e) =>
                      updateMicroApp(selectedMicroApp.type, (app) => ({
                        ...app,
                        serviceOptions: e.target.value
                          .split(",")
                          .map((option) => option.trim())
                          .filter(Boolean),
                      }))
                    }
                    placeholder={copy.placeholders.microAppServiceOptions}
                  />
                ) : null}
                <input
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={selectedMicroApp.buttonLabel}
                  onChange={(e) =>
                    updateMicroApp(selectedMicroApp.type, (app) => ({ ...app, buttonLabel: e.target.value }))
                  }
                  placeholder={copy.placeholders.microAppButtonText}
                />
                <input
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={selectedMicroApp.contactMethods.join(", ")}
                  onChange={(e) =>
                    updateMicroApp(selectedMicroApp.type, (app) => ({
                      ...app,
                      contactMethods: e.target.value
                        .toLowerCase()
                        .split(",")
                        .map((method) => method.trim())
                        .filter((method): method is "email" | "whatsapp" | "phone" =>
                          ["email", "whatsapp", "phone"].includes(method),
                        ),
                    }))
                  }
                  placeholder={copy.placeholders.microAppContactMethods}
                />
                <button
                  type="button"
                  onClick={() => {
                    const href = `${localePrefix}${selectedMicroApp.urlPath}`;
                    ensureNavLink(selectedMicroApp.buttonLabel, href);
                    setModel((prev) => ({ ...prev, navbarCtaLabel: selectedMicroApp.buttonLabel, navbarCtaLink: href }));
                  }}
                  className="w-full rounded-md bg-slate-900 px-2 py-2 text-xs font-semibold text-white"
                >
                  {copy.actions.addToNavbar}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`${localePrefix}${selectedMicroApp.urlPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-700"
                  >
                    {copy.actions.openForm}
                  </a>
                  <Link
                    href={`${localePrefix}/micro-apps`}
                    className="rounded-md border border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-700"
                  >
                    {copy.actions.viewSubmissions}
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">{copy.labels.loadingMicroApps}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h2 className="text-sm font-semibold text-slate-900">{copy.sections.navbar}</h2>
            <div className="mt-2 space-y-2">
              {model.navLinks.map((link) => (
                <div key={link.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    value={link.label}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        navLinks: prev.navLinks.map((l) =>
                          l.id === link.id ? { ...l, label: e.target.value } : l,
                        ),
                      }))
                    }
                  />
                  <input
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    value={link.href}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        navLinks: prev.navLinks.map((l) =>
                          l.id === link.id ? { ...l, href: e.target.value } : l,
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setModel((prev) => ({
                        ...prev,
                        navLinks: prev.navLinks.filter((l) => l.id !== link.id),
                      }))
                    }
                    className="rounded-md bg-red-100 px-2 text-xs text-red-700"
                  >
                    x
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setModel((prev) => ({
                    ...prev,
                    navLinks: [...prev.navLinks, { id: uid("nav"), label: "New", href: "/new" }],
                  }))
                }
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              >
                {copy.actions.addNavLink}
              </button>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={model.navbarCtaLabel}
                onChange={(e) => setModel((prev) => ({ ...prev, navbarCtaLabel: e.target.value }))}
                placeholder={copy.placeholders.navCtaLabel}
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={model.navbarCtaLink}
                onChange={(e) => setModel((prev) => ({ ...prev, navbarCtaLink: e.target.value }))}
                placeholder={copy.placeholders.navCtaLink}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h2 className="text-sm font-semibold text-slate-900">{copy.sections.hero}</h2>
            <div className="mt-2 space-y-2">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={activePage.hero.kicker}
                onChange={(e) => updateActivePage((page) => ({ ...page, hero: { ...page.hero, kicker: e.target.value } }))}
                placeholder={copy.placeholders.kicker}
              />
              <textarea
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={activePage.hero.title}
                onChange={(e) => updateActivePage((page) => ({ ...page, hero: { ...page.hero, title: e.target.value } }))}
                placeholder={copy.placeholders.heroTitle}
              />
              <textarea
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={activePage.hero.subtitle}
                onChange={(e) => updateActivePage((page) => ({ ...page, hero: { ...page.hero, subtitle: e.target.value } }))}
                placeholder={copy.placeholders.heroSubtitle}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={activePage.hero.primaryCtaLabel}
                  onChange={(e) => updateActivePage((page) => ({ ...page, hero: { ...page.hero, primaryCtaLabel: e.target.value } }))}
                  placeholder={copy.placeholders.primaryCtaLabel}
                />
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={activePage.hero.primaryCtaLink}
                  onChange={(e) => updateActivePage((page) => ({ ...page, hero: { ...page.hero, primaryCtaLink: e.target.value } }))}
                  placeholder={copy.placeholders.primaryCtaLink}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={activePage.hero.mediaType}
                  onChange={(e) =>
                    updateActivePage((page) => ({
                      ...page,
                      hero: { ...page.hero, mediaType: e.target.value as Hero["mediaType"] },
                    }))
                  }
                >
                  <option value="image">{copy.labels.image}</option>
                  <option value="video">{copy.labels.video}</option>
                </select>
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={activePage.hero.mediaUrl}
                  onChange={(e) => updateActivePage((page) => ({ ...page, hero: { ...page.hero, mediaUrl: e.target.value } }))}
                  placeholder={copy.placeholders.mediaUrl}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h2 className="text-sm font-semibold text-slate-900">{copy.sections.buttonEditor}</h2>
            {selectedButtonTarget ? (
              <div className="mt-2 space-y-2 text-xs">
                <p className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                  Selected:{" "}
                  {selectedButtonTarget.kind === "hero-primary"
                    ? copy.labels.buttonTargetHeroPrimary
                    : selectedButtonTarget.kind === "hero-secondary"
                      ? copy.labels.buttonTargetHeroSecondary
                      : copy.labels.buttonTargetSectionCta}
                </p>
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1"
                  value={
                    selectedButtonTarget.kind === "hero-primary"
                      ? activePage.hero.primaryCtaLabel
                      : selectedButtonTarget.kind === "hero-secondary"
                        ? activePage.hero.secondaryCtaLabel
                        : activePage.sections.find((s) => s.id === selectedButtonTarget.sectionId)?.ctaLabel || ""
                  }
                  onChange={(e) => {
                    if (selectedButtonTarget.kind === "hero-primary") {
                      updateActivePage((page) => ({
                        ...page,
                        hero: { ...page.hero, primaryCtaLabel: e.target.value },
                      }));
                    } else if (selectedButtonTarget.kind === "hero-secondary") {
                      updateActivePage((page) => ({
                        ...page,
                        hero: { ...page.hero, secondaryCtaLabel: e.target.value },
                      }));
                    } else {
                      updateActivePage((page) => ({
                        ...page,
                        sections: page.sections.map((section) =>
                          section.id === selectedButtonTarget.sectionId
                            ? { ...section, ctaLabel: e.target.value }
                            : section,
                        ),
                      }));
                    }
                  }}
                  placeholder={copy.placeholders.buttonText}
                />
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1"
                  value={
                    selectedButtonTarget.kind === "hero-primary"
                      ? activePage.hero.primaryCtaLink
                      : selectedButtonTarget.kind === "hero-secondary"
                        ? activePage.hero.secondaryCtaLink
                        : activePage.sections.find((s) => s.id === selectedButtonTarget.sectionId)?.ctaLink || ""
                  }
                  onChange={(e) => {
                    if (selectedButtonTarget.kind === "hero-primary") {
                      updateActivePage((page) => ({
                        ...page,
                        hero: { ...page.hero, primaryCtaLink: e.target.value },
                      }));
                    } else if (selectedButtonTarget.kind === "hero-secondary") {
                      updateActivePage((page) => ({
                        ...page,
                        hero: { ...page.hero, secondaryCtaLink: e.target.value },
                      }));
                    } else {
                      updateActivePage((page) => ({
                        ...page,
                        sections: page.sections.map((section) =>
                          section.id === selectedButtonTarget.sectionId
                            ? { ...section, ctaLink: e.target.value }
                            : section,
                        ),
                      }));
                    }
                  }}
                  placeholder={copy.placeholders.buttonLink}
                />
                <button
                  type="button"
                  onClick={() => setSelectedButtonTarget(null)}
                  className="rounded border border-slate-300 px-2 py-1"
                >
                  Clear selection
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Click a button on the canvas to edit text and link.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">{copy.sections.section}</h2>
              <span className="text-[10px] uppercase tracking-wide text-slate-500">{copy.sections.library}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <button type="button" onClick={() => addSection("features")} className="rounded-md border border-slate-300 px-2 py-1 text-xs">{copy.labels.features}</button>
              <button type="button" onClick={() => addSection("testimonials")} className="rounded-md border border-slate-300 px-2 py-1 text-xs">{copy.labels.testimonials}</button>
              <button type="button" onClick={() => addSection("gallery")} className="rounded-md border border-slate-300 px-2 py-1 text-xs">{copy.labels.gallery}</button>
              <button type="button" onClick={() => addSection("lead")} className="rounded-md border border-slate-300 px-2 py-1 text-xs">{copy.labels.contactForm}</button>
              <button type="button" onClick={() => addSection("custom")} className="rounded-md border border-slate-300 px-2 py-1 text-xs">{copy.labels.faq}</button>
              <button type="button" onClick={() => addSection("custom")} className="rounded-md border border-slate-300 px-2 py-1 text-xs">{copy.labels.pricing}</button>
            </div>
            <div className="mt-2 space-y-2">
              {activePage.sections.map((section, idx) => (
                <div key={section.id} className="rounded-md border border-slate-200 p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Section {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.filter((s) => s.id !== section.id),
                        }))
                      }
                      className="text-xs text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    className="mb-1 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                    value={section.title}
                    onChange={(e) =>
                      updateActivePage((page) => ({
                        ...page,
                        sections: page.sections.map((s) =>
                          s.id === section.id ? { ...s, title: e.target.value } : s,
                        ),
                      }))
                    }
                    placeholder={copy.placeholders.sectionTitle}
                  />
                  <textarea
                    className="mb-1 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                    value={section.text}
                    onChange={(e) =>
                      updateActivePage((page) => ({
                        ...page,
                        sections: page.sections.map((s) =>
                          s.id === section.id ? { ...s, text: e.target.value } : s,
                        ),
                      }))
                    }
                    placeholder={copy.placeholders.sectionText}
                  />
                  <input
                    className="mb-1 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                    value={section.imageUrl}
                    onChange={(e) =>
                      updateActivePage((page) => ({
                        ...page,
                        sections: page.sections.map((s) =>
                          s.id === section.id ? { ...s, imageUrl: e.target.value } : s,
                        ),
                      }))
                    }
                    placeholder={copy.placeholders.sectionImageUrl}
                  />
                  <input
                    className="mb-1 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                    value={section.videoUrl}
                    onChange={(e) =>
                      updateActivePage((page) => ({
                        ...page,
                        sections: page.sections.map((s) =>
                          s.id === section.id ? { ...s, videoUrl: e.target.value } : s,
                        ),
                      }))
                    }
                    placeholder={copy.placeholders.sectionVideoUrl}
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                      value={section.ctaLabel}
                      onChange={(e) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((s) =>
                            s.id === section.id ? { ...s, ctaLabel: e.target.value } : s,
                          ),
                        }))
                      }
                      placeholder={copy.placeholders.ctaLabel}
                    />
                    <input
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                      value={section.ctaLink}
                      onChange={(e) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((s) =>
                            s.id === section.id ? { ...s, ctaLink: e.target.value } : s,
                          ),
                        }))
                      }
                      placeholder={copy.placeholders.ctaLink}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h2 className="text-sm font-semibold text-slate-900">{copy.sections.leadFooterMotion}</h2>
            <div className="mt-2 space-y-2 text-sm">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={model.leadMagnet.enabled}
                  onChange={(e) =>
                    setModel((prev) => ({
                      ...prev,
                      leadMagnet: { ...prev.leadMagnet, enabled: e.target.checked },
                    }))
                  }
                />
                Floating lead magnet
              </label>
              <input
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={model.leadMagnet.title}
                onChange={(e) =>
                  setModel((prev) => ({
                    ...prev,
                    leadMagnet: { ...prev.leadMagnet, title: e.target.value },
                  }))
                }
                placeholder={copy.placeholders.leadTitle}
              />
              <input
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={model.leadMagnet.buttonLink}
                onChange={(e) =>
                  setModel((prev) => ({
                    ...prev,
                    leadMagnet: { ...prev.leadMagnet, buttonLink: e.target.value },
                  }))
                }
                placeholder={copy.placeholders.leadLink}
              />
              <select
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={model.pageOpenDirection}
                onChange={(e) =>
                  setModel((prev) => ({
                    ...prev,
                    pageOpenDirection: e.target.value as Direction,
                    leadMagnet: { ...prev.leadMagnet, direction: e.target.value as Direction },
                  }))
                }
              >
                <option value="right">{copy.motion.right}</option>
                <option value="left">{copy.motion.left}</option>
                <option value="up">{copy.motion.up}</option>
                <option value="down">{copy.motion.down}</option>
              </select>

              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={model.footer.enabled}
                  onChange={(e) =>
                    setModel((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, enabled: e.target.checked },
                    }))
                  }
                />
                Show footer
              </label>
              <textarea
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={model.footer.text}
                onChange={(e) =>
                  setModel((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, text: e.target.value },
                  }))
                }
                placeholder={copy.placeholders.footerText}
              />
              {model.footer.links.map((link) => (
                <div key={link.id} className="grid grid-cols-[1fr_1fr_auto] gap-1">
                  <input
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    value={link.label}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          links: prev.footer.links.map((l) =>
                            l.id === link.id ? { ...l, label: e.target.value } : l,
                          ),
                        },
                      }))
                    }
                    placeholder={copy.placeholders.footerLinkText}
                  />
                  <input
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    value={link.href}
                    onChange={(e) =>
                      setModel((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          links: prev.footer.links.map((l) =>
                            l.id === link.id ? { ...l, href: e.target.value } : l,
                          ),
                        },
                      }))
                    }
                    placeholder={copy.placeholders.footerLinkUrl}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setModel((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          links: prev.footer.links.filter((l) => l.id !== link.id),
                        },
                      }))
                    }
                    className="rounded bg-red-100 px-2 text-xs text-red-700"
                  >
                    x
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setModel((prev) => ({
                    ...prev,
                    footer: {
                      ...prev.footer,
                      links: [...prev.footer.links, { id: uid("footer"), label: "New link", href: "#" }],
                    },
                  }))
                }
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              >
                {copy.actions.addFooterLink}
              </button>
            </div>
          </div>
        </aside>

        <section className={`overflow-hidden rounded-2xl border border-slate-300 bg-white shadow ${directionClass(model.pageOpenDirection)}`}>
          <div className="border-b border-slate-200 px-6 py-4" style={{ color: model.textColor }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-xl font-bold">{model.brandName}</div>
              <nav className="flex flex-wrap items-center gap-3 text-sm">
                {model.navLinks.map((link) => (
                  <a key={link.id} href={link.href} className="rounded px-2 py-1 hover:bg-slate-100">
                    {link.label}
                  </a>
                ))}
                <a
                  href={model.navbarCtaLink || "#"}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: model.primaryColor }}
                >
                  {model.navbarCtaLabel}
                </a>
              </nav>
            </div>
          </div>

          <div className="px-6 py-12" style={{ backgroundColor: model.backgroundColor, color: model.textColor }}>
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <p
                  className="text-xs font-semibold tracking-[0.2em]"
                  style={{ color: model.primaryColor }}
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateActivePage((page) => ({
                      ...page,
                      hero: { ...page.hero, kicker: e.currentTarget.innerText },
                    }))
                  }
                >
                  {activePage.hero.kicker}
                </p>
                <h2
                  className="mt-3 text-4xl font-black leading-tight sm:text-5xl"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateActivePage((page) => ({
                      ...page,
                      hero: { ...page.hero, title: e.currentTarget.innerText },
                    }))
                  }
                >
                  {activePage.hero.title}
                </h2>
                <p
                  className="mt-4 max-w-xl text-lg text-slate-600"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateActivePage((page) => ({
                      ...page,
                      hero: { ...page.hero, subtitle: e.currentTarget.innerText },
                    }))
                  }
                >
                  {activePage.hero.subtitle}
                </p>
                <p
                  className="mt-4 text-sm font-medium"
                  style={{ color: model.accentColor }}
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) => setModel((prev) => ({ ...prev, tagline: e.currentTarget.innerText }))}
                >
                  {model.tagline}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={activePage.hero.primaryCtaLink || "#"}
                    className="rounded-lg px-5 py-3 text-sm font-semibold text-white"
                    style={{ backgroundColor: model.primaryColor }}
                    onClick={(e) => {
                      if (editMode) {
                        e.preventDefault();
                        setSelectedButtonTarget({ kind: "hero-primary" });
                      }
                    }}
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      updateActivePage((page) => ({
                        ...page,
                        hero: { ...page.hero, primaryCtaLabel: e.currentTarget.innerText },
                      }))
                    }
                  >
                    {activePage.hero.primaryCtaLabel}
                  </a>
                  <a
                    href={activePage.hero.secondaryCtaLink || "#"}
                    className="rounded-lg border border-slate-400 px-5 py-3 text-sm font-semibold text-slate-800"
                    onClick={(e) => {
                      if (editMode) {
                        e.preventDefault();
                        setSelectedButtonTarget({ kind: "hero-secondary" });
                      }
                    }}
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      updateActivePage((page) => ({
                        ...page,
                        hero: { ...page.hero, secondaryCtaLabel: e.currentTarget.innerText },
                      }))
                    }
                  >
                    {activePage.hero.secondaryCtaLabel}
                  </a>
                </div>
              </div>
              <div
                className="relative min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900"
                onClick={() => setSelectedImageTarget({ kind: "hero" })}
              >
                {activePage.hero.mediaType === "video" ? (
                  <video className="h-full min-h-[320px] w-full object-cover" controls src={activePage.hero.mediaUrl} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePage.hero.mediaUrl}
                    alt="Hero media"
                    className={`h-full min-h-[320px] w-full object-cover ${activePage.hero.removeBackground ? "bg-white p-4" : ""}`}
                    style={{
                      objectPosition: `${activePage.hero.mediaPosition} center`,
                      transform: `scale(${activePage.hero.mediaZoom / 100})`,
                    }}
                  />
                )}
                {editMode && selectedImageTarget?.kind === "hero" ? (
                  <div className="absolute right-3 top-3 rounded-xl bg-white/95 p-2 text-xs shadow">
                    <div className="mb-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => elementImageInputRef.current?.click()}
                        className="rounded bg-slate-900 px-2 py-1 text-white"
                      >
                        {copy.actions.replace}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateActivePage((page) => ({
                            ...page,
                            hero: { ...page.hero, mediaUrl: "", mediaType: "image" },
                          }))
                        }
                        className="rounded bg-red-100 px-2 py-1 text-red-700"
                      >
                        {copy.actions.remove}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={activePage.hero.mediaZoom}
                      onChange={(e) =>
                        updateActivePage((page) => ({
                          ...page,
                          hero: { ...page.hero, mediaZoom: Number(e.target.value) },
                        }))
                      }
                    />
                    <div className="mt-1 grid grid-cols-3 gap-1">
                      {(["left", "center", "right"] as const).map((position) => (
                        <button
                          key={position}
                          type="button"
                          onClick={() =>
                            updateActivePage((page) => ({
                              ...page,
                              hero: { ...page.hero, mediaPosition: position },
                            }))
                          }
                          className="rounded border border-slate-300 px-1 py-0.5"
                        >
                          {position}
                        </button>
                      ))}
                    </div>
                    <label className="mt-1 flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={activePage.hero.removeBackground}
                        onChange={(e) =>
                          updateActivePage((page) => ({
                            ...page,
                            hero: { ...page.hero, removeBackground: e.target.checked },
                          }))
                        }
                      />
                      {copy.labels.removeBg}
                    </label>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white px-6 py-10">
            {activePage.sections.map((section, index) => (
              <article
                key={section.id}
                className="group relative rounded-2xl border border-slate-200 p-6"
                style={{
                  background:
                    section.backgroundMode === "gradient"
                      ? `linear-gradient(135deg, ${section.backgroundGradientFrom}, ${section.backgroundGradientTo})`
                      : section.backgroundMode === "image" && section.backgroundImageUrl
                        ? `url(${section.backgroundImageUrl}) center / cover no-repeat`
                        : section.backgroundColor,
                  minHeight:
                    section.sectionHeight === "tight"
                      ? "180px"
                      : section.sectionHeight === "loose"
                        ? "360px"
                        : "260px",
                }}
                onClick={() => setSelectedSectionId(section.id)}
              >
                {editMode ? (
                  <div className="absolute right-3 top-3 z-10 hidden gap-1 rounded-lg bg-white/95 p-1 shadow group-hover:flex">
                    <button type="button" onClick={() => moveSection(section.id, "up")} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.actions.up}</button>
                    <button type="button" onClick={() => moveSection(section.id, "down")} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.actions.down}</button>
                    <button type="button" onClick={() => duplicateSection(section.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">{copy.actions.duplicate}</button>
                    <button
                      type="button"
                      onClick={() =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.filter((item) => item.id !== section.id),
                        }))
                      }
                      className="rounded bg-red-100 px-2 py-1 text-xs text-red-700"
                    >
                      {copy.actions.delete}
                    </button>
                  </div>
                ) : null}
                <h3
                  className="text-2xl font-bold text-slate-900"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateActivePage((page) => ({
                      ...page,
                      sections: page.sections.map((item) =>
                        item.id === section.id ? { ...item, title: e.currentTarget.innerText } : item,
                      ),
                    }))
                  }
                >
                  {section.title}
                </h3>
                <p
                  className="mt-2 max-w-3xl text-slate-600"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateActivePage((page) => ({
                      ...page,
                      sections: page.sections.map((item) =>
                        item.id === section.id ? { ...item, text: e.currentTarget.innerText } : item,
                      ),
                    }))
                  }
                >
                  {section.text}
                </p>
                {section.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={section.imageUrl}
                    alt={section.title}
                    className={`mt-4 h-52 w-full rounded-xl object-cover ${section.removeBackground ? "bg-white p-3" : ""}`}
                    style={{
                      objectPosition: `${section.imagePosition} center`,
                      transform: `scale(${section.imageZoom / 100})`,
                    }}
                    onClick={(e) => {
                      if (editMode) {
                        e.preventDefault();
                        setSelectedImageTarget({ kind: "section", sectionId: section.id });
                      }
                    }}
                  />
                ) : null}
                {section.videoUrl ? (
                  <video className="mt-4 h-52 w-full rounded-xl object-cover" controls src={section.videoUrl} />
                ) : null}
                <a
                  href={section.ctaLink || "#"}
                  className="mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: model.primaryColor }}
                  onClick={(e) => {
                    if (editMode) {
                      e.preventDefault();
                      setSelectedButtonTarget({ kind: "section", sectionId: section.id });
                    }
                  }}
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateActivePage((page) => ({
                      ...page,
                      sections: page.sections.map((item) =>
                        item.id === section.id ? { ...item, ctaLabel: e.currentTarget.innerText } : item,
                      ),
                    }))
                  }
                >
                  {section.ctaLabel}
                </a>
                {editMode && selectedImageTarget?.kind === "section" && selectedImageTarget.sectionId === section.id ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2 text-xs">
                    <div className="mb-2 flex gap-1">
                      <button type="button" onClick={() => elementImageInputRef.current?.click()} className="rounded bg-slate-900 px-2 py-1 text-white">{copy.actions.replace}</button>
                      <button
                        type="button"
                        onClick={() =>
                          updateActivePage((page) => ({
                            ...page,
                            sections: page.sections.map((item) =>
                              item.id === section.id ? { ...item, imageUrl: "" } : item,
                            ),
                          }))
                        }
                        className="rounded bg-red-100 px-2 py-1 text-red-700"
                      >
                        {copy.actions.remove}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={section.imageZoom}
                      onChange={(e) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((item) =>
                            item.id === section.id ? { ...item, imageZoom: Number(e.target.value) } : item,
                          ),
                        }))
                      }
                    />
                  </div>
                ) : null}
                {editMode && selectedSectionId === section.id ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2 text-xs">
                    <select
                      className="rounded border border-slate-300 px-2 py-1"
                      value={section.sectionHeight}
                      onChange={(e) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((item) =>
                            item.id === section.id
                              ? { ...item, sectionHeight: e.target.value as SectionBlock["sectionHeight"] }
                              : item,
                          ),
                        }))
                      }
                    >
                      <option value="tight">{copy.spacing.tight}</option>
                      <option value="normal">{copy.spacing.normal}</option>
                      <option value="loose">{copy.spacing.loose}</option>
                    </select>
                    <select
                      className="rounded border border-slate-300 px-2 py-1"
                      value={section.backgroundMode}
                      onChange={(e) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((item) =>
                            item.id === section.id
                              ? { ...item, backgroundMode: e.target.value as SectionBlock["backgroundMode"] }
                              : item,
                          ),
                        }))
                      }
                    >
                      <option value="solid">{copy.background.solid}</option>
                      <option value="gradient">{copy.background.gradient}</option>
                      <option value="image">{copy.background.image}</option>
                    </select>
                    <input
                      type="color"
                      value={section.backgroundColor}
                      onChange={(e) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((item) =>
                            item.id === section.id ? { ...item, backgroundColor: e.target.value } : item,
                          ),
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="rounded border border-slate-300 px-2 py-1"
                      value={section.backgroundImageUrl}
                      onChange={(e) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((item) =>
                            item.id === section.id ? { ...item, backgroundImageUrl: e.target.value } : item,
                          ),
                        }))
                      }
                      placeholder={copy.placeholders.bgImageUrl}
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          {model.footer.enabled ? (
            <footer className="border-t border-slate-200 bg-slate-950 px-6 py-10 text-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p>{model.footer.text}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {model.footer.links.map((link) => (
                    <a key={link.id} href={link.href} className="rounded px-2 py-1 hover:bg-slate-800">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </footer>
          ) : null}
        </section>
      </div>

      {model.leadMagnet.enabled ? (
        <div
          className={`fixed bottom-5 z-40 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ${directionClass(model.leadMagnet.direction)} ${
            model.leadMagnet.direction === "left"
              ? "left-5"
              : model.leadMagnet.direction === "right"
                ? "right-5"
                : "right-5"
          }`}
        >
          <p className="text-sm font-bold text-slate-900">{model.leadMagnet.title}</p>
          <p className="mt-1 max-w-xs text-xs text-slate-600">{model.leadMagnet.text}</p>
          <a
            href={model.leadMagnet.buttonLink || "#"}
            className="mt-3 inline-flex rounded-md px-3 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: model.primaryColor }}
          >
            {model.leadMagnet.buttonLabel}
          </a>
        </div>
      ) : null}

      <input
        ref={elementImageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => onUploadElementImage(e.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg"
      >
        {chatOpen ? copy.actions.hideAi : copy.actions.showAi}
      </button>

      {chatOpen ? (
        <div className="fixed bottom-20 right-5 z-50 w-[360px] max-w-[92vw] rounded-2xl border border-slate-300 bg-white shadow-2xl">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{copy.labels.floatingAssistant}</p>
            <p className="text-xs text-slate-500">{copy.labels.plainEnglish}</p>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto p-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg px-3 py-2 text-xs ${
                  message.role === "assistant"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-blue-600 text-white"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-200 p-3">
            <textarea
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={copy.placeholders.chat}
              className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runChatCommand}
                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
              >
                {copy.actions.apply}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                {copy.actions.uploadImage}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => onUploadFile(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
