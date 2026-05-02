import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ContactForm } from "@/components/marketing/ContactForm";

type Props = {
  params: Promise<{ locale: string }>;
};

function getContactCopy(locale: string) {
  const normalized = locale.toLowerCase().split("-")[0];

  if (normalized === "fr") {
    return {
      title: "Contactez BizSproutAI",
      subtitle:
        "Si vous avez une question, une demande de partenariat ou souhaitez parler de votre prochaine étape, utilisez l'une des options ci-dessous.",
      emailLabel: "Email",
      phoneLabel: "Téléphone",
      addressLabel: "Adresse postale",
      ctaPrimary: "Appeler maintenant",
      ctaSecondary: "Retour à l'accueil",
      writeTitle: "Vous préférez écrire ?",
      writeBody:
        "Envoyez-nous directement votre message ici. Il sera envoyé à notre équipe pour suivi.",
      nameLabel: "Nom",
      emailFieldLabel: "Votre email",
      subjectLabel: "Sujet",
      messageLabel: "Message",
      namePlaceholder: "Votre nom",
      emailPlaceholder: "vous@exemple.com",
      subjectPlaceholder: "Comment pouvons-nous vous aider ?",
      messagePlaceholder: "Écrivez votre message ici...",
      submitLabel: "Envoyer le message",
      submittingLabel: "Envoi en cours...",
      successTitle: "Message envoyé.",
      successBody:
        "Votre message a bien été envoyé à info@bizsproutai.com. Nous reviendrons vers vous rapidement.",
      retryLabel: "Envoyer un autre message",
      validation: {
        emailRequired: "Ajoutez votre email.",
        subjectRequired: "Ajoutez un sujet.",
        messageRequired: "Ajoutez votre message.",
      },
    };
  }

  if (normalized === "es") {
    return {
      title: "Contacta a BizSproutAI",
      subtitle:
        "Si tienes una pregunta, una idea de alianza o quieres hablar de tu siguiente paso, usa cualquiera de las opciones de abajo.",
      emailLabel: "Correo",
      phoneLabel: "Teléfono",
      addressLabel: "Dirección postal",
      ctaPrimary: "Llamar ahora",
      ctaSecondary: "Volver al inicio",
      writeTitle: "¿Prefieres escribirnos?",
      writeBody:
        "Envíanos tu mensaje directamente aquí. Nuestro equipo lo recibirá para dar seguimiento.",
      nameLabel: "Nombre",
      emailFieldLabel: "Tu correo",
      subjectLabel: "Asunto",
      messageLabel: "Mensaje",
      namePlaceholder: "Tu nombre",
      emailPlaceholder: "tu@correo.com",
      subjectPlaceholder: "¿Cómo podemos ayudarte?",
      messagePlaceholder: "Escribe tu mensaje aquí...",
      submitLabel: "Enviar mensaje",
      submittingLabel: "Enviando...",
      successTitle: "Mensaje enviado.",
      successBody:
        "Tu mensaje ya fue enviado a info@bizsproutai.com. Haremos seguimiento pronto.",
      retryLabel: "Enviar otro mensaje",
      validation: {
        emailRequired: "Agrega tu correo.",
        subjectRequired: "Agrega un asunto.",
        messageRequired: "Agrega tu mensaje.",
      },
    };
  }

  if (normalized === "ht") {
    return {
      title: "Kontakte BizSproutAI",
      subtitle:
        "Si ou gen kestyon, lide patenarya, oswa ou vle pale sou pwochen etap ou, sèvi ak youn nan opsyon ki anba yo.",
      emailLabel: "Imèl",
      phoneLabel: "Telefòn",
      addressLabel: "Adrès postal",
      ctaPrimary: "Rele kounye a",
      ctaSecondary: "Retounen lakay",
      writeTitle: "Ou pito ekri nou?",
      writeBody:
        "Voye mesaj ou dirèkteman isit la. Ekip nou an ap resevwa li pou fè swivi.",
      nameLabel: "Non",
      emailFieldLabel: "Imèl ou",
      subjectLabel: "Sijè",
      messageLabel: "Mesaj",
      namePlaceholder: "Non ou",
      emailPlaceholder: "ou@egzanp.com",
      subjectPlaceholder: "Kijan nou ka ede ou?",
      messagePlaceholder: "Ekri mesaj ou isit la...",
      submitLabel: "Voye mesaj la",
      submittingLabel: "Ap voye...",
      successTitle: "Mesaj la voye.",
      successBody:
        "Mesaj ou a rive nan info@bizsproutai.com. N ap suiv sa rapid.",
      retryLabel: "Voye yon lòt mesaj",
      validation: {
        emailRequired: "Ajoute imèl ou.",
        subjectRequired: "Ajoute yon sijè.",
        messageRequired: "Ajoute mesaj ou a.",
      },
    };
  }

  if (normalized === "pt") {
    return {
      title: "Fale com a BizSproutAI",
      subtitle:
        "Se você tiver uma pergunta, ideia de parceria ou quiser falar sobre seu próximo passo, use uma das opções abaixo.",
      emailLabel: "Email",
      phoneLabel: "Telefone",
      addressLabel: "Endereço postal",
      ctaPrimary: "Ligar agora",
      ctaSecondary: "Voltar para o início",
      writeTitle: "Prefere nos escrever?",
      writeBody:
        "Envie sua mensagem diretamente por aqui. Nossa equipe vai recebê-la para fazer follow-up.",
      nameLabel: "Nome",
      emailFieldLabel: "Seu email",
      subjectLabel: "Assunto",
      messageLabel: "Mensagem",
      namePlaceholder: "Seu nome",
      emailPlaceholder: "voce@exemplo.com",
      subjectPlaceholder: "Como podemos ajudar?",
      messagePlaceholder: "Escreva sua mensagem aqui...",
      submitLabel: "Enviar mensagem",
      submittingLabel: "Enviando...",
      successTitle: "Mensagem enviada.",
      successBody:
        "Sua mensagem foi enviada para info@bizsproutai.com. Faremos o follow-up em breve.",
      retryLabel: "Enviar outra mensagem",
      validation: {
        emailRequired: "Adicione seu email.",
        subjectRequired: "Adicione um assunto.",
        messageRequired: "Adicione sua mensagem.",
      },
    };
  }

  return {
    title: "Contact BizSproutAI",
    subtitle:
      "If you have a question, partnership idea, or want to talk through your next move, use any of the options below.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Mailing address",
    ctaPrimary: "Call now",
    ctaSecondary: "Back to home",
    writeTitle: "Prefer to write us?",
    writeBody:
      "Send your message directly here and it will go to our team for follow-up.",
    nameLabel: "Name",
    emailFieldLabel: "Your email",
    subjectLabel: "Subject",
    messageLabel: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    subjectPlaceholder: "How can we help?",
    messagePlaceholder: "Write your message here...",
    submitLabel: "Send message",
    submittingLabel: "Sending...",
    successTitle: "Message sent.",
    successBody:
      "Your message was sent to info@bizsproutai.com. We will follow up shortly.",
    retryLabel: "Send another message",
    validation: {
      emailRequired: "Add your email address.",
      subjectRequired: "Add a subject.",
      messageRequired: "Add your message.",
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = getContactCopy(locale);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="brand-panel rounded-[2rem] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4a8c5c]">
          BizSproutAI
        </p>
        <h1 className="mt-3 font-[family:var(--font-serif)] text-4xl leading-tight text-[#1a3a2a] sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#6b7c72]">
          {copy.subtitle}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <section className="rounded-[1.5rem] border border-[#dbe7df] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4a8c5c]">
              {copy.emailLabel}
            </p>
            <a
              href="mailto:info@bizsproutai.com"
              className="mt-3 block text-lg font-semibold text-[#1a3a2a] hover:text-[#2d5a3d]"
            >
              info@bizsproutai.com
            </a>
          </section>

          <section className="rounded-[1.5rem] border border-[#dbe7df] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4a8c5c]">
              {copy.phoneLabel}
            </p>
            <a
              href="tel:+18776007007"
              className="mt-3 block text-lg font-semibold text-[#1a3a2a] hover:text-[#2d5a3d]"
            >
              877-600-7007
            </a>
          </section>

          <section className="rounded-[1.5rem] border border-[#dbe7df] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4a8c5c]">
              {copy.addressLabel}
            </p>
            <p className="mt-3 text-base font-medium text-[#1a3a2a]">
              7901 4th St N #32253
              <br />
              St. Petersburg, FL 33702
              <br />
              USA
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="tel:+18776007007"
            className="landing-btn landing-btn-primary landing-btn-primary--large"
          >
            {copy.ctaPrimary} →
          </a>
          <Link
            href="/"
            className="landing-btn landing-btn-secondary landing-btn-secondary--large"
          >
            {copy.ctaSecondary}
          </Link>
        </div>

        <section className="mt-10 rounded-[1.75rem] border border-[#dbe7df] bg-[#f8f4ed] p-6 sm:p-8">
          <h2 className="font-[family:var(--font-serif)] text-2xl text-[#1a3a2a]">
            {copy.writeTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6b7c72]">
            {copy.writeBody}
          </p>
        </section>
        <ContactForm copy={copy} locale={locale} />
      </div>
    </main>
  );
}
