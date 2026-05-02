import { setRequestLocale } from "next-intl/server";
import { ActionPlanIntake } from "@/components/marketing/ActionPlanIntake";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
};

function getActionPlanCopy(locale: string) {
  const normalized = locale.toLowerCase().split("-")[0];

  if (normalized === "fr") {
    return {
      eyebrow: "Plan d'action",
      title: "Où avez-vous besoin d'aide ?",
      subtitle:
        "Choisissez le ou les services qui correspondent à votre situation et partagez un peu de contexte sur votre business. Nous utiliserons ces informations pour mieux comprendre votre besoin et assurer le suivi.",
      servicesTitle: "Choisissez vos priorités",
      servicesHint: "Sélectionnez une ou plusieurs options.",
      formTitle: "Parlez-nous de votre business",
      formBody:
        "Plus le contexte est précis, plus nous pouvons vous recontacter avec la bonne recommandation.",
      labels: {
        name: "Votre nom",
        businessName: "Nom du business",
        email: "Email",
        phone: "Téléphone",
        selectedServices: "Services sélectionnés",
        website: "Site web ou lien actuel",
        stage: "Où en êtes-vous ?",
        targetCustomer: "Qui servez-vous ?",
        challenge: "Quel est le principal blocage ?",
        goal: "Quel est votre objectif sur 30 jours ?",
        extra: "Informations complémentaires",
        consent: "Je veux recevoir un suivi par email ou téléphone au sujet de mon plan d'action.",
      },
      placeholders: {
        name: "Votre nom",
        businessName: "Nom du business ou de l'idée",
        email: "vous@exemple.com",
        phone: "Votre numéro",
        selectedServices: "Choisissez un ou plusieurs services ci-dessus.",
        website: "https://...",
        targetCustomer: "Décrivez votre client idéal ou votre audience.",
        challenge: "Expliquez ce qui vous bloque en ce moment.",
        goal: "Quel résultat voulez-vous obtenir dans les 30 prochains jours ?",
        extra: "Ajoutez tout contexte utile ici.",
      },
      stages: [
        { value: "exploring", label: "Je suis en exploration" },
        { value: "validating", label: "Je valide l'idée" },
        { value: "building", label: "Je suis en train de construire" },
        { value: "selling", label: "Je vends déjà" },
      ],
      submit: "Recevoir mon plan d'action",
      submitting: "Envoi en cours...",
      successTitle: "Merci. Votre demande est enregistrée.",
      successBody:
        "Nous avons reçu votre contexte business et vos coordonnées. Nous pourrons maintenant vous recontacter avec le bon suivi.",
      retry: "Envoyer une autre demande",
      validation: {
        serviceRequired: "Choisissez au moins un service.",
        contactRequired: "Ajoutez un email et un numéro de téléphone pour le suivi.",
        businessNameRequired: "Le nom du business est requis.",
      },
    };
  }

  if (normalized === "es") {
    return {
      eyebrow: "Plan de acción",
      title: "¿Dónde necesitas ayuda?",
      subtitle:
        "Elige el servicio o los servicios que mejor encajan con tu situación y comparte un poco de contexto sobre tu negocio. Usaremos esta información para entender mejor tu caso y hacer seguimiento.",
      servicesTitle: "Elige tus prioridades",
      servicesHint: "Selecciona una o varias opciones.",
      formTitle: "Cuéntanos sobre tu negocio",
      formBody:
        "Cuanto más específico sea el contexto, mejor podremos hacer seguimiento con la recomendación correcta.",
      labels: {
        name: "Tu nombre",
        businessName: "Nombre del negocio",
        email: "Correo",
        phone: "Teléfono",
        selectedServices: "Servicios seleccionados",
        website: "Sitio web o enlace actual",
        stage: "¿En qué etapa estás?",
        targetCustomer: "¿A quién sirves?",
        challenge: "¿Cuál es tu mayor reto ahora?",
        goal: "¿Cuál es tu objetivo para 30 días?",
        extra: "Información adicional",
        consent: "Quiero recibir seguimiento por correo o teléfono sobre mi plan de acción.",
      },
      placeholders: {
        name: "Tu nombre",
        businessName: "Nombre del negocio o idea",
        email: "tu@correo.com",
        phone: "Tu número",
        selectedServices: "Selecciona uno o varios servicios arriba.",
        website: "https://...",
        targetCustomer: "Describe a tu cliente ideal o audiencia.",
        challenge: "Explica qué te está frenando ahora mismo.",
        goal: "¿Qué resultado quieres lograr en los próximos 30 días?",
        extra: "Agrega cualquier contexto útil aquí.",
      },
      stages: [
        { value: "exploring", label: "Estoy explorando" },
        { value: "validating", label: "Estoy validando la idea" },
        { value: "building", label: "Estoy construyendo" },
        { value: "selling", label: "Ya estoy vendiendo" },
      ],
      submit: "Obtener mi plan de acción",
      submitting: "Enviando...",
      successTitle: "Gracias. Tu solicitud fue registrada.",
      successBody:
        "Ya tenemos tu contexto de negocio y tus datos de contacto. Ahora podremos dar seguimiento con la recomendación correcta.",
      retry: "Enviar otra solicitud",
      validation: {
        serviceRequired: "Selecciona al menos un servicio.",
        contactRequired: "Agrega un correo y un número de teléfono para seguimiento.",
        businessNameRequired: "El nombre del negocio es obligatorio.",
      },
    };
  }

  if (normalized === "ht") {
    return {
      eyebrow: "Plan aksyon",
      title: "Ki kote ou bezwen èd?",
      subtitle:
        "Chwazi sèvis ki pi byen matche ak sitiyasyon ou epi pataje kèk enfòmasyon sou biznis ou. N ap sèvi ak sa pou nou konprann bezwen ou pi byen epi fè swivi.",
      servicesTitle: "Chwazi priyorite ou yo",
      servicesHint: "Chwazi youn oswa plizyè opsyon.",
      formTitle: "Pale nou de biznis ou",
      formBody:
        "Plis kontèks la presi, plis nou ka fè bon swivi ak bon rekòmandasyon an.",
      labels: {
        name: "Non ou",
        businessName: "Non biznis la",
        email: "Imèl",
        phone: "Telefòn",
        selectedServices: "Sèvis ou chwazi yo",
        website: "Sit entènèt oswa lyen aktyèl la",
        stage: "Ki etap ou ye a?",
        targetCustomer: "Ki moun w ap sèvi?",
        challenge: "Ki pi gwo blokaj ou kounye a?",
        goal: "Ki objektif ou sou 30 jou?",
        extra: "Lòt enfòmasyon",
        consent: "Mwen vle resevwa swivi pa imèl oswa telefòn sou plan aksyon mwen an.",
      },
      placeholders: {
        name: "Non ou",
        businessName: "Non biznis la oswa lide a",
        email: "ou@egzanp.com",
        phone: "Nimewo ou",
        selectedServices: "Chwazi youn oswa plizyè sèvis anlè a.",
        website: "https://...",
        targetCustomer: "Dekri kliyan ideyal ou oswa odyans ou.",
        challenge: "Eksplike sa k ap bloke ou kounye a.",
        goal: "Ki rezilta ou vle nan pwochen 30 jou yo?",
        extra: "Ajoute nenpòt lòt kontèks itil isit la.",
      },
      stages: [
        { value: "exploring", label: "Mwen ap eksplore" },
        { value: "validating", label: "Mwen ap valide lide a" },
        { value: "building", label: "Mwen ap bati" },
        { value: "selling", label: "Mwen deja ap vann" },
      ],
      submit: "Resevwa plan aksyon mwen",
      submitting: "Ap voye...",
      successTitle: "Mèsi. Nou anrejistre demann ou an.",
      successBody:
        "Nou resevwa kontèks biznis ou ak enfòmasyon kontak ou yo. Kounye a nou ka fè swivi ak bon rekòmandasyon an.",
      retry: "Voye yon lòt demann",
      validation: {
        serviceRequired: "Chwazi omwen yon sèvis.",
        contactRequired: "Ajoute yon imèl ak nimewo telefòn pou swivi.",
        businessNameRequired: "Non biznis la obligatwa.",
      },
    };
  }

  if (normalized === "pt") {
    return {
      eyebrow: "Plano de ação",
      title: "Onde você precisa de ajuda?",
      subtitle:
        "Escolha o serviço ou os serviços que melhor combinam com sua situação e compartilhe um pouco de contexto sobre seu negócio. Vamos usar isso para entender melhor sua necessidade e fazer follow-up.",
      servicesTitle: "Escolha suas prioridades",
      servicesHint: "Selecione uma ou mais opções.",
      formTitle: "Conte para nós sobre seu negócio",
      formBody:
        "Quanto mais específico for o contexto, melhor poderemos responder com a recomendação certa.",
      labels: {
        name: "Seu nome",
        businessName: "Nome do negócio",
        email: "Email",
        phone: "Telefone",
        selectedServices: "Serviços selecionados",
        website: "Site ou link atual",
        stage: "Em que estágio você está?",
        targetCustomer: "Quem você atende?",
        challenge: "Qual é seu maior desafio agora?",
        goal: "Qual é sua meta para 30 dias?",
        extra: "Informações extras",
        consent: "Quero receber follow-up por email ou telefone sobre meu plano de ação.",
      },
      placeholders: {
        name: "Seu nome",
        businessName: "Nome do negócio ou ideia",
        email: "voce@exemplo.com",
        phone: "Seu número",
        selectedServices: "Selecione um ou mais serviços acima.",
        website: "https://...",
        targetCustomer: "Descreva seu cliente ideal ou audiência.",
        challenge: "Explique o que está travando você agora.",
        goal: "Que resultado você quer alcançar nos próximos 30 dias?",
        extra: "Adicione qualquer contexto útil aqui.",
      },
      stages: [
        { value: "exploring", label: "Estou explorando" },
        { value: "validating", label: "Estou validando a ideia" },
        { value: "building", label: "Estou construindo" },
        { value: "selling", label: "Já estou vendendo" },
      ],
      submit: "Receber meu plano de ação",
      submitting: "Enviando...",
      successTitle: "Obrigado. Sua solicitação foi registrada.",
      successBody:
        "Recebemos o contexto do seu negócio e seus contatos. Agora podemos fazer follow-up com a recomendação certa.",
      retry: "Enviar outra solicitação",
      validation: {
        serviceRequired: "Selecione pelo menos um serviço.",
        contactRequired: "Adicione um email e um telefone para follow-up.",
        businessNameRequired: "O nome do negócio é obrigatório.",
      },
    };
  }

  return {
    eyebrow: "Action Plan",
    title: "Where do you need help with?",
    subtitle:
      "Choose the service areas that match your situation and share a bit of context about your business. We will use this to understand your business better and follow up with the right next step.",
    servicesTitle: "Pick your service priorities",
    servicesHint: "Select one or more options.",
    formTitle: "Tell us about your business",
    formBody:
      "The more specific your answers are, the easier it is for us to understand your business and follow up with the right recommendation.",
    labels: {
      name: "Your name",
      businessName: "Business name",
      email: "Email",
      phone: "Phone number",
      selectedServices: "Selected services",
      website: "Current website or link",
      stage: "What stage are you in?",
      targetCustomer: "Who do you serve?",
      challenge: "What is the biggest challenge right now?",
      goal: "What is your 30-day goal?",
      extra: "Anything else we should know?",
      consent: "I want BizSproutAI to follow up with me by email or phone about my action plan.",
    },
    placeholders: {
      name: "Your name",
      businessName: "Business or idea name",
      email: "you@example.com",
      phone: "Your phone number",
      selectedServices: "Choose one or more services above.",
      website: "https://...",
      targetCustomer: "Describe your ideal customer or audience.",
      challenge: "Explain what is getting in the way right now.",
      goal: "What do you want to accomplish in the next 30 days?",
      extra: "Add any extra context that will help us understand your business.",
    },
    stages: [
      { value: "exploring", label: "I am exploring" },
      { value: "validating", label: "I am validating the idea" },
      { value: "building", label: "I am building" },
      { value: "selling", label: "I am already selling" },
    ],
    submit: "Get my action plan",
    submitting: "Submitting...",
    successTitle: "Thanks. Your request is in.",
    successBody:
      "We received your business context and contact details. That gives us what we need to follow up with the right next-step recommendation.",
    retry: "Submit another request",
    validation: {
      serviceRequired: "Select at least one service.",
      contactRequired: "Add both an email and phone number so we can follow up.",
      businessNameRequired: "Business name is required.",
    },
  };
}

export default async function ActionPlanPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { service } = await searchParams;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <ActionPlanIntake
        copy={getActionPlanCopy(locale)}
        locale={locale}
        initialService={typeof service === "string" ? service : undefined}
      />
    </main>
  );
}
