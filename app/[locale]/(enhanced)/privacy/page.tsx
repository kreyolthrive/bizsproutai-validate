import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

/* ------------------------------------------------------------------ */
/*  Locale-aware copy                                                  */
/* ------------------------------------------------------------------ */

function getPrivacyCopy(locale: string) {
  const l = locale.toLowerCase().split("-")[0];

  if (l === "fr") {
    return {
      title: "Politique de confidentialit\u00e9 (BizSproutAI)",
      effectiveDate: "Date d\u2019entr\u00e9e en vigueur\u00a0: janvier 2026",
      s1Title: "1) Qui sommes-nous",
      s1Body:
        "BizSproutAI est exploit\u00e9 sous le nom commercial (DBA) de Kreyol Thrive Biz. La pr\u00e9sente politique de confidentialit\u00e9 explique comment nous collectons, utilisons, partageons et prot\u00e9geons les informations lorsque vous utilisez nos sites web et nos services.",
      s2Title: "2) Informations que nous collectons",
      s2aLabel: "A) Informations que vous fournissez",
      s2aItems: [
        "Nom, adresse e-mail et coordonn\u00e9es.",
        "Id\u00e9es commerciales, r\u00e9ponses aux sondages et messages que vous soumettez.",
        "Tout contenu que vous t\u00e9l\u00e9chargez ou saisissez dans le Service.",
      ],
      s2bLabel: "B) Informations collect\u00e9es automatiquement",
      s2bItems: [
        "Informations sur l\u2019appareil et le navigateur.",
        "Adresse IP (souvent utilis\u00e9e \u00e0 des fins de s\u00e9curit\u00e9 et de pr\u00e9vention des abus).",
        "Analyses d\u2019utilisation (pages visit\u00e9es, clics, utilisation des fonctionnalit\u00e9s).",
        "Cookies ou technologies similaires (voir \u00ab\u00a0Cookies\u00a0\u00bb).",
      ],
      s2cLabel: "C) Donn\u00e9es de compte et d\u2019authentification",
      s2cBody:
        "Si vous vous connectez via Supabase Auth ou un service similaire, nous traitons les identifiants n\u00e9cessaires pour vous authentifier et prot\u00e9ger votre compte.",
      s3Title: "3) Comment nous utilisons vos informations",
      s3Intro: "Nous utilisons vos informations pour\u00a0:",
      s3Items: [
        "Fournir et exploiter le Service (g\u00e9n\u00e9rer des rapports, envoyer des e-mails, effectuer des validations).",
        "Am\u00e9liorer les fonctionnalit\u00e9s et l\u2019exp\u00e9rience utilisateur.",
        "Communiquer avec vous (assistance, rapports demand\u00e9s, mises \u00e0 jour produit).",
        "S\u00e9curiser la plateforme et pr\u00e9venir les abus et la fraude.",
        "Respecter les obligations l\u00e9gales.",
      ],
      s4Title: "4) Ce que nous ne faisons PAS",
      s4Items: [
        "Nous ne vendons pas vos informations personnelles.",
        "Nous ne publions pas vos id\u00e9es commerciales.",
        "Nous ne partageons pas vos donn\u00e9es priv\u00e9es avec d\u2019autres utilisateurs.",
      ],
      s5Title: "5) Partage de vos informations",
      s5Intro: "Nous pouvons partager des informations avec\u00a0:",
      s5Items: [
        "Des prestataires de services (h\u00e9bergement, analyses, envoi d\u2019e-mails, bases de donn\u00e9es) strictement pour exploiter le Service.",
        "Les autorit\u00e9s l\u00e9gales si la loi l\u2019exige ou pour prot\u00e9ger des droits, la s\u00e9curit\u00e9 et la s\u00fbret\u00e9.",
        "En cas de transfert d\u2019entreprise si Kreyol Thrive Biz fait l\u2019objet d\u2019une fusion, acquisition ou vente d\u2019actifs (nous en informerons les utilisateurs lorsque la loi l\u2019exige).",
      ],
      s6Title: "6) Conservation des donn\u00e9es",
      s6Body:
        "Nous conservons les informations uniquement le temps n\u00e9cessaire pour fournir le Service, satisfaire aux exigences l\u00e9gales, r\u00e9soudre les litiges et faire respecter les accords. Vous pouvez demander la suppression (voir \u00ab\u00a0Vos droits\u00a0\u00bb).",
      s7Title: "7) S\u00e9curit\u00e9",
      s7Body:
        "Nous mettons en \u0153uvre des mesures de protection administratives, techniques et organisationnelles pour prot\u00e9ger vos donn\u00e9es. Aucun syst\u00e8me n\u2019est s\u00e9curis\u00e9 \u00e0 100\u00a0%; vous utilisez le Service \u00e0 vos propres risques.",
      s8Title: "8) Cookies et analyses",
      s8Body:
        "Nous pouvons utiliser des cookies et des outils d\u2019analyse pour comprendre le trafic et am\u00e9liorer le Service. Vous pouvez ajuster les param\u00e8tres de cookies dans votre navigateur. Certaines fonctionnalit\u00e9s peuvent ne pas fonctionner sans cookies.",
      s9Title: "9) Vos choix et vos droits",
      s9Intro: "Selon votre lieu de r\u00e9sidence, vous pouvez avoir le droit de\u00a0:",
      s9Items: [
        "Acc\u00e9der \u00e0 vos informations personnelles, les corriger ou les supprimer.",
        "Vous opposer \u00e0 certains traitements ou les restreindre.",
        "Demander une copie de vos donn\u00e9es.",
      ],
      s9Contact: "Pour soumettre une demande, contactez",
      s10Title: "10) Confidentialit\u00e9 des enfants",
      s10Body:
        "Le Service n\u2019est pas destin\u00e9 aux enfants de moins de 13 ans. Si vous pensez qu\u2019un enfant a fourni des donn\u00e9es personnelles, contactez-nous pour en demander la suppression.",
      s11Title: "11) Utilisateurs internationaux",
      s11Body:
        "Si vous acc\u00e9dez au Service depuis un pays autre que les \u00c9tats-Unis, vous comprenez que vos informations peuvent \u00eatre trait\u00e9es aux \u00c9tats-Unis ou dans d\u2019autres pays o\u00f9 nos prestataires op\u00e8rent.",
      s12Title: "12) Modifications de cette politique",
      s12Body:
        "Nous pouvons mettre \u00e0 jour cette politique. L\u2019utilisation continu\u00e9e du Service apr\u00e8s les modifications signifie que vous acceptez la politique mise \u00e0 jour.",
      s13Title: "13) Contact",
      s13Email: "E-mail\u00a0:",
      s13Operator: "Exploitant\u00a0: Kreyol Thrive Biz (DBA BizSproutAI)",
    };
  }

  if (l === "es") {
    return {
      title: "Pol\u00edtica de privacidad (BizSproutAI)",
      effectiveDate: "Fecha de vigencia: enero de 2026",
      s1Title: "1) Qui\u00e9nes somos",
      s1Body:
        "BizSproutAI opera bajo el nombre comercial (DBA) de Kreyol Thrive Biz. Esta Pol\u00edtica de privacidad explica c\u00f3mo recopilamos, usamos, compartimos y protegemos la informaci\u00f3n cuando usted utiliza nuestros sitios web y servicios.",
      s2Title: "2) Informaci\u00f3n que recopilamos",
      s2aLabel: "A) Informaci\u00f3n que usted proporciona",
      s2aItems: [
        "Nombre, correo electr\u00f3nico y datos de contacto.",
        "Ideas de negocio, respuestas a encuestas y mensajes que env\u00ede.",
        "Cualquier contenido que cargue o ingrese en el Servicio.",
      ],
      s2bLabel: "B) Informaci\u00f3n recopilada autom\u00e1ticamente",
      s2bItems: [
        "Informaci\u00f3n del dispositivo y del navegador.",
        "Direcci\u00f3n IP (utilizada con frecuencia para seguridad y prevenci\u00f3n de abusos).",
        "An\u00e1lisis de uso (p\u00e1ginas visitadas, clics, uso de funciones).",
        "Cookies o tecnolog\u00edas similares (ver \u00abCookies\u00bb).",
      ],
      s2cLabel: "C) Datos de cuenta y autenticaci\u00f3n",
      s2cBody:
        "Si inicia sesi\u00f3n a trav\u00e9s de Supabase Auth o un servicio similar, procesamos los identificadores necesarios para autenticarlo y proteger su cuenta.",
      s3Title: "3) C\u00f3mo usamos su informaci\u00f3n",
      s3Intro: "Usamos su informaci\u00f3n para:",
      s3Items: [
        "Proporcionar y operar el Servicio (generar informes, enviar correos electr\u00f3nicos, ejecutar validaciones).",
        "Mejorar las funciones y la experiencia del usuario.",
        "Comunicarnos con usted (soporte, informes solicitados, actualizaciones de producto).",
        "Proteger la plataforma y prevenir abusos y fraudes.",
        "Cumplir con obligaciones legales.",
      ],
      s4Title: "4) Lo que NO hacemos",
      s4Items: [
        "No vendemos su informaci\u00f3n personal.",
        "No publicamos sus ideas de negocio.",
        "No compartimos sus datos privados con otros usuarios.",
      ],
      s5Title: "5) Compartir su informaci\u00f3n",
      s5Intro: "Podemos compartir informaci\u00f3n con:",
      s5Items: [
        "Proveedores de servicios (alojamiento, an\u00e1lisis, env\u00edo de correos electr\u00f3nicos, bases de datos) estrictamente para operar el Servicio.",
        "Autoridades legales si lo exige la ley o para proteger derechos, seguridad y protecci\u00f3n.",
        "Transferencias comerciales si Kreyol Thrive Biz se somete a una fusi\u00f3n, adquisici\u00f3n o venta de activos (proporcionaremos aviso cuando la ley lo requiera).",
      ],
      s6Title: "6) Retenci\u00f3n de datos",
      s6Body:
        "Conservamos la informaci\u00f3n solo el tiempo necesario para proporcionar el Servicio, cumplir con requisitos legales, resolver disputas y hacer cumplir acuerdos. Puede solicitar la eliminaci\u00f3n (ver \u00abSus derechos\u00bb).",
      s7Title: "7) Seguridad",
      s7Body:
        "Empleamos medidas de protecci\u00f3n administrativas, t\u00e9cnicas y organizativas para proteger sus datos. Ning\u00fan sistema es 100\u00a0% seguro; usted utiliza el Servicio bajo su propio riesgo.",
      s8Title: "8) Cookies y an\u00e1lisis",
      s8Body:
        "Podemos utilizar cookies y herramientas de an\u00e1lisis para comprender el tr\u00e1fico y mejorar el Servicio. Puede ajustar la configuraci\u00f3n de cookies en su navegador. Algunas funciones pueden no estar disponibles sin cookies.",
      s9Title: "9) Sus opciones y derechos",
      s9Intro: "Dependiendo de su ubicaci\u00f3n, puede tener derecho a:",
      s9Items: [
        "Acceder, corregir o eliminar informaci\u00f3n personal.",
        "Oponerse a ciertos procesamientos o restringirlos.",
        "Solicitar una copia de sus datos.",
      ],
      s9Contact: "Para realizar una solicitud, contacte a",
      s10Title: "10) Privacidad de los menores",
      s10Body:
        "El Servicio no est\u00e1 destinado a menores de 13 a\u00f1os. Si cree que un menor ha proporcionado datos personales, cont\u00e1ctenos para solicitar su eliminaci\u00f3n.",
      s11Title: "11) Usuarios internacionales",
      s11Body:
        "Si accede al Servicio desde fuera de los Estados Unidos, usted comprende que su informaci\u00f3n puede ser procesada en EE.\u00a0UU. u otras ubicaciones donde operan nuestros proveedores.",
      s12Title: "12) Cambios en esta pol\u00edtica",
      s12Body:
        "Podemos actualizar esta pol\u00edtica. El uso continuado del Servicio despu\u00e9s de los cambios significa que usted acepta la pol\u00edtica actualizada.",
      s13Title: "13) Contacto",
      s13Email: "Correo electr\u00f3nico:",
      s13Operator: "Operador: Kreyol Thrive Biz (DBA BizSproutAI)",
    };
  }

  if (l === "ht") {
    return {
      title: "Politik sou vi prive (BizSproutAI)",
      effectiveDate: "Dat antre an vig\u00e8: janvye 2026",
      s1Title: "1) Kiy\u00e8s nou ye",
      s1Body:
        "BizSproutAI opere anba non komersyal (DBA) Kreyol Thrive Biz. Politik sou vi prive sa a eksplike kijan nou kolekte, itilize, pataje, ak pwoteje enf\u00f2masyon l\u00e8 ou itilize sit entenet nou yo ak s\u00e8vis nou yo.",
      s2Title: "2) Enf\u00f2masyon nou kolekte",
      s2aLabel: "A) Enf\u00f2masyon ou bay",
      s2aItems: [
        "Non, adr\u00e8s im\u00e8l, ak enf\u00f2masyon kontak.",
        "Ide biznis, rep\u00f2ns sondaj, ak mesaj ou soum\u00e8t.",
        "Nenp\u00f2t konteni ou telechaje oswa antre nan S\u00e8vis la.",
      ],
      s2bLabel: "B) Enf\u00f2masyon kolekte otomatikman",
      s2bItems: [
        "Enf\u00f2masyon sou ap\u00e8y ak navigat\u00e8.",
        "Adr\u00e8s IP (souvan itilize pou sekirite ak prevansyon abi).",
        "Analiz itilizasyon (paj w\u00e8, klik, itilizasyon fonksyon).",
        "Cookies oswa tekn\u00f2loji similaire (gade \u00abCookies\u00bb).",
      ],
      s2cLabel: "C) Done k\u00f2nt ak otantifikasyon",
      s2cBody:
        "Si ou konekte atraver Supabase Auth oswa yon s\u00e8vis menm jan an, nou trete idantifyan ki neses\u00e8 pou otantifye ou epi pwoteje k\u00f2nt ou a.",
      s3Title: "3) Kijan nou itilize enf\u00f2masyon ou",
      s3Intro: "Nou itilize enf\u00f2masyon ou pou:",
      s3Items: [
        "Ofri epi opere S\u00e8vis la (jenere rap\u00f2, voye im\u00e8l, f\u00e8 validasyon).",
        "Am\u00e9lyore fonksyonalit\u00e9 ak ekperyans itilizat\u00e8.",
        "Kominike av\u00e8k ou (sip\u00f2, rap\u00f2 ou mande, mizajou pwod\u00eci).",
        "Sek\u00efriz\u00e9 platf\u00f2m lan epi anpech\u00e9 abi ak f\u00f2d.",
        "Respekte obligasyon legal.",
      ],
      s4Title: "4) Sa nou pa f\u00e8",
      s4Items: [
        "Nou pa vann enf\u00f2masyon p\u00e8son\u00e8l ou.",
        "Nou pa pibliye ide biznis ou.",
        "Nou pa pataje done prive ou ak l\u00f2t itilizat\u00e8.",
      ],
      s5Title: "5) Pataje enf\u00f2masyon ou",
      s5Intro: "Nou ka pataje enf\u00f2masyon ak:",
      s5Items: [
        "Foun\u00e8s\u00e8 s\u00e8vis (eb\u00e8jman, analiz, livrezon im\u00e8l, baz done) strik pou opere S\u00e8vis la.",
        "Otorite legal si lwa a mande sa oswa pou pwoteje dwa, sekirite, ak s\u00e8te.",
        "Transf\u00e8 biznis si Kreyol Thrive Biz sibi yon fizyon, akizisyon, oswa vant ak\u00f2 (nou pral avize itilizat\u00e8 l\u00e8 lwa a egzije sa).",
      ],
      s6Title: "6) Konsevasyòn done",
      s6Body:
        "Nou kenbe enf\u00f2masyon s\u00e8lman pandan tan ki neses\u00e8 pou bay S\u00e8vis la, satisf\u00e8 egzijans legal, rezoud litij, ak aplike ak\u00f2. Ou ka mande sipresyon (gade \u00abDwa ou yo\u00bb).",
      s7Title: "7) Sekirite",
      s7Body:
        "Nou itilize mezi pwoteksyon administratif, teknik, ak \u00f2ganizasyon\u00e8l pou pwoteje done ou. Pa gen okenn sist\u00e8m ki 100% an sekirite; ou itilize S\u00e8vis la sou pwop risk ou.",
      s8Title: "8) Cookies ak analiz",
      s8Body:
        "Nou ka itilize cookies ak zouti analiz pou konprann trafik la epi amelyore S\u00e8vis la. Ou ka ajiste param\u00e8t cookies nan navigat\u00e8 ou a. K\u00e8k fonksyonalit\u00e9 ka pa mache san cookies.",
      s9Title: "9) Chwa ou yo ak dwa ou yo",
      s9Intro: "Selon kote ou ye, ou ka gen dwa pou:",
      s9Items: [
        "Aks\u00e8de, korije, oswa efase enf\u00f2masyon p\u00e8son\u00e8l.",
        "Opoze oswa restrenn s\u00e8ten tretman.",
        "Mande yon kopi done ou.",
      ],
      s9Contact: "Pou f\u00e8 yon demand, kontakte",
      s10Title: "10) Vi prive timoun",
      s10Body:
        "S\u00e8vis la pa f\u00e8t pou timoun ki gen mwens pase 13 an. Si ou kw\u00e8 yon timoun te bay done p\u00e8son\u00e8l, kontakte nou pou retire li.",
      s11Title: "11) Itilizat\u00e8 entenas\u00e8yonal",
      s11Body:
        "Si ou aks\u00e8de S\u00e8vis la dey\u00f2 Etazini, ou konprann ke enf\u00f2masyon ou ka trete nan Etazini oswa nan l\u00f2t kote kote foun\u00e8s\u00e8 nou yo opere.",
      s12Title: "12) Chanjman nan politik sa a",
      s12Body:
        "Nou ka mete politik sa a aj\u00f2. Si ou kontinye itilize S\u00e8vis la apr\u00e8 chanjman yo, sa vle di ou aksepte politik ki mete aj\u00f2 a.",
      s13Title: "13) Kontak",
      s13Email: "Im\u00e8l:",
      s13Operator: "Operat\u00e8: Kreyol Thrive Biz (DBA BizSproutAI)",
    };
  }

  if (l === "pt") {
    return {
      title: "Pol\u00edtica de Privacidade (BizSproutAI)",
      effectiveDate: "Data de vig\u00eancia: janeiro de 2026",
      s1Title: "1) Quem somos",
      s1Body:
        "BizSproutAI opera sob o nome comercial (DBA) da Kreyol Thrive Biz. Esta Pol\u00edtica de Privacidade explica como coletamos, usamos, compartilhamos e protegemos informa\u00e7\u00f5es quando voc\u00ea utiliza nossos sites e servi\u00e7os.",
      s2Title: "2) Informa\u00e7\u00f5es que coletamos",
      s2aLabel: "A) Informa\u00e7\u00f5es que voc\u00ea fornece",
      s2aItems: [
        "Nome, e-mail e dados de contato.",
        "Ideias de neg\u00f3cios, respostas a pesquisas e mensagens enviadas.",
        "Qualquer conte\u00fado que voc\u00ea envie ou insira no Servi\u00e7o.",
      ],
      s2bLabel: "B) Informa\u00e7\u00f5es coletadas automaticamente",
      s2bItems: [
        "Informa\u00e7\u00f5es do dispositivo e do navegador.",
        "Endere\u00e7o IP (frequentemente usado para seguran\u00e7a e preven\u00e7\u00e3o de abusos).",
        "An\u00e1lises de uso (p\u00e1ginas visitadas, cliques, uso de recursos).",
        "Cookies ou tecnologias semelhantes (ver \u201cCookies\u201d).",
      ],
      s2cLabel: "C) Dados de conta e autentica\u00e7\u00e3o",
      s2cBody:
        "Se voc\u00ea fizer login via Supabase Auth ou servi\u00e7o semelhante, processamos os identificadores necess\u00e1rios para autentic\u00e1-lo e proteger sua conta.",
      s3Title: "3) Como usamos suas informa\u00e7\u00f5es",
      s3Intro: "Usamos suas informa\u00e7\u00f5es para:",
      s3Items: [
        "Fornecer e operar o Servi\u00e7o (gerar relat\u00f3rios, enviar e-mails, executar valida\u00e7\u00f5es).",
        "Melhorar recursos e experi\u00eancia do usu\u00e1rio.",
        "Nos comunicar com voc\u00ea (suporte, relat\u00f3rios solicitados, atualiza\u00e7\u00f5es de produto).",
        "Proteger a plataforma e prevenir abusos e fraudes.",
        "Cumprir obriga\u00e7\u00f5es legais.",
      ],
      s4Title: "4) O que N\u00c3O fazemos",
      s4Items: [
        "N\u00e3o vendemos suas informa\u00e7\u00f5es pessoais.",
        "N\u00e3o publicamos suas ideias de neg\u00f3cios.",
        "N\u00e3o compartilhamos seus dados privados com outros usu\u00e1rios.",
      ],
      s5Title: "5) Compartilhamento de suas informa\u00e7\u00f5es",
      s5Intro: "Podemos compartilhar informa\u00e7\u00f5es com:",
      s5Items: [
        "Prestadores de servi\u00e7os (hospedagem, an\u00e1lises, envio de e-mails, bancos de dados) estritamente para operar o Servi\u00e7o.",
        "Autoridades legais se exigido por lei ou para proteger direitos, seguran\u00e7a e prote\u00e7\u00e3o.",
        "Transfer\u00eancias comerciais caso a Kreyol Thrive Biz passe por fus\u00e3o, aquisi\u00e7\u00e3o ou venda de ativos (forneceremos aviso quando legalmente exigido).",
      ],
      s6Title: "6) Reten\u00e7\u00e3o de dados",
      s6Body:
        "Mantemos as informa\u00e7\u00f5es apenas pelo tempo necess\u00e1rio para fornecer o Servi\u00e7o, cumprir requisitos legais, resolver disputas e fazer cumprir acordos. Voc\u00ea pode solicitar a exclus\u00e3o (ver \u201cSeus direitos\u201d).",
      s7Title: "7) Seguran\u00e7a",
      s7Body:
        "Empregamos salvaguardas administrativas, t\u00e9cnicas e organizacionais para proteger seus dados. Nenhum sistema \u00e9 100% seguro; voc\u00ea utiliza o Servi\u00e7o por sua pr\u00f3pria conta e risco.",
      s8Title: "8) Cookies e an\u00e1lises",
      s8Body:
        "Podemos usar cookies e ferramentas de an\u00e1lise para entender o tr\u00e1fego e melhorar o Servi\u00e7o. Voc\u00ea pode ajustar as configura\u00e7\u00f5es de cookies no seu navegador. Algumas funcionalidades podem n\u00e3o funcionar sem cookies.",
      s9Title: "9) Suas escolhas e direitos",
      s9Intro: "Dependendo da sua localiza\u00e7\u00e3o, voc\u00ea pode ter direito a:",
      s9Items: [
        "Acessar, corrigir ou excluir informa\u00e7\u00f5es pessoais.",
        "Opor-se a determinados tratamentos ou restringi-los.",
        "Solicitar uma c\u00f3pia dos seus dados.",
      ],
      s9Contact: "Para fazer uma solicita\u00e7\u00e3o, entre em contato com",
      s10Title: "10) Privacidade de crian\u00e7as",
      s10Body:
        "O Servi\u00e7o n\u00e3o se destina a crian\u00e7as menores de 13 anos. Se voc\u00ea acredita que uma crian\u00e7a forneceu dados pessoais, entre em contato conosco para solicitar a remo\u00e7\u00e3o.",
      s11Title: "11) Usu\u00e1rios internacionais",
      s11Body:
        "Se voc\u00ea acessar o Servi\u00e7o de fora dos Estados Unidos, voc\u00ea entende que suas informa\u00e7\u00f5es podem ser processadas nos EUA ou em outros locais onde nossos prestadores operam.",
      s12Title: "12) Altera\u00e7\u00f5es nesta pol\u00edtica",
      s12Body:
        "Podemos atualizar esta pol\u00edtica. O uso continuado do Servi\u00e7o ap\u00f3s as altera\u00e7\u00f5es significa que voc\u00ea aceita a pol\u00edtica atualizada.",
      s13Title: "13) Contato",
      s13Email: "E-mail:",
      s13Operator: "Operador: Kreyol Thrive Biz (DBA BizSproutAI)",
    };
  }

  // Default: English
  return {
    title: "Privacy Policy (BizSproutAI)",
    effectiveDate: "Effective Date: January 2026",
    s1Title: "1) Who We Are",
    s1Body:
      "BizSproutAI is operated as a DBA of Kreyol Thrive Biz. This Privacy Policy explains how we collect, use, share, and protect information when you use our websites and services.",
    s2Title: "2) Information We Collect",
    s2aLabel: "A) Information you provide",
    s2aItems: [
      "Name, email, and contact details.",
      "Business ideas, survey responses, and messages you submit.",
      "Any content you upload or input into the Service.",
    ],
    s2bLabel: "B) Automatically collected information",
    s2bItems: [
      "Device and browser info.",
      "IP address (often used for security and abuse prevention).",
      "Usage analytics (pages viewed, clicks, feature usage).",
      "Cookies or similar technologies (see \u201cCookies\u201d).",
    ],
    s2cLabel: "C) Account and authentication data",
    s2cBody:
      "If you sign in via Supabase Auth or similar, we process identifiers needed to authenticate you and protect your account.",
    s3Title: "3) How We Use Your Information",
    s3Intro: "We use your information to:",
    s3Items: [
      "Provide and operate the Service (generate reports, send emails, run validations).",
      "Improve features and user experience.",
      "Communicate with you (support, reports you request, product updates).",
      "Secure the platform and prevent abuse/fraud.",
      "Comply with legal obligations.",
    ],
    s4Title: "4) What We Do NOT Do",
    s4Items: [
      "We do not sell your personal information.",
      "We do not publish your business ideas.",
      "We do not share your private inputs with other users.",
    ],
    s5Title: "5) Sharing Your Information",
    s5Intro: "We may share information with:",
    s5Items: [
      "Service providers (e.g., hosting, analytics, email delivery, databases) strictly to operate the Service.",
      "Legal/Compliance if required by law or to protect rights, safety, and security.",
      "Business transfers if Kreyol Thrive Biz undergoes a merger, acquisition, or asset sale (we will provide notice where legally required).",
    ],
    s6Title: "6) Data Retention",
    s6Body:
      "We keep information only as long as necessary to provide the Service, meet legal requirements, resolve disputes, and enforce agreements. You may request deletion (see \u201cYour Rights\u201d).",
    s7Title: "7) Security",
    s7Body:
      "We use administrative, technical, and organizational safeguards to protect your data. No system is 100% secure; you use the Service at your own risk.",
    s8Title: "8) Cookies and Analytics",
    s8Body:
      "We may use cookies and analytics tools to understand traffic and improve the Service. You can adjust cookie settings in your browser. Some functionality may not work without cookies.",
    s9Title: "9) Your Choices and Rights",
    s9Intro: "Depending on your location, you may have rights to:",
    s9Items: [
      "Access, correct, or delete personal information.",
      "Object to or restrict certain processing.",
      "Request a copy of your data.",
    ],
    s9Contact: "To make a request, contact",
    s10Title: "10) Children\u2019s Privacy",
    s10Body:
      "The Service is not intended for children under 13. If you believe a child has provided personal data, contact us for removal.",
    s11Title: "11) International Users",
    s11Body:
      "If you access the Service from outside the United States, you understand that your information may be processed in the U.S. or other locations where our providers operate.",
    s12Title: "12) Changes to This Policy",
    s12Body:
      "We may update this policy. Continued use after changes means you accept the updated policy.",
    s13Title: "13) Contact",
    s13Email: "Email:",
    s13Operator: "Operator: Kreyol Thrive Biz (DBA BizSproutAI)",
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getPrivacyCopy(locale);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-[family:var(--font-display)] text-3xl font-semibold text-slate-900">
        {t.title}
      </h1>
      <p className="mt-2 text-sm text-slate-600">{t.effectiveDate}</p>

      <div className="mt-8 space-y-7 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s1Title}</h2>
          <p className="mt-2">{t.s1Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s2Title}</h2>
          <p className="mt-2 font-medium text-slate-900">{t.s2aLabel}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {t.s2aItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 font-medium text-slate-900">{t.s2bLabel}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {t.s2bItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 font-medium text-slate-900">{t.s2cLabel}</p>
          <p className="mt-2">{t.s2cBody}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s3Title}</h2>
          <p className="mt-2">{t.s3Intro}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {t.s3Items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s4Title}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {t.s4Items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s5Title}</h2>
          <p className="mt-2">{t.s5Intro}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {t.s5Items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s6Title}</h2>
          <p className="mt-2">{t.s6Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s7Title}</h2>
          <p className="mt-2">{t.s7Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s8Title}</h2>
          <p className="mt-2">{t.s8Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s9Title}</h2>
          <p className="mt-2">{t.s9Intro}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {t.s9Items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mt-2">
            {t.s9Contact} <a className="text-emerald-700 hover:text-emerald-800" href="mailto:info@bizsproutai.com">info@bizsproutai.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s10Title}</h2>
          <p className="mt-2">{t.s10Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s11Title}</h2>
          <p className="mt-2">{t.s11Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s12Title}</h2>
          <p className="mt-2">{t.s12Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s13Title}</h2>
          <p className="mt-2">
            {t.s13Email} <a className="text-emerald-700 hover:text-emerald-800" href="mailto:info@bizsproutai.com">info@bizsproutai.com</a>
          </p>
          <p className="mt-1">{t.s13Operator}</p>
        </section>
      </div>
    </main>
  );
}
