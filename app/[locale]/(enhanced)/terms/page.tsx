import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

function getTermsCopy(locale: string) {
  const normalized = locale.toLowerCase().split("-")[0];

  if (normalized === "fr") {
    return {
      title: "Conditions d\u2019utilisation (BizSproutAI)",
      effectiveDate: "Date d\u2019entr\u00e9e en vigueur\u00a0: janvier 2026",
      s1Title: "1) Qui sommes-nous",
      s1Body:
        "BizSproutAI (\u00abBizSproutAI\u00bb, \u00abnous\u00bb, \u00abnotre\u00bb) est une marque exploit\u00e9e sous le nom commercial (DBA) de Kreyol Thrive Biz (\u00abla Soci\u00e9t\u00e9\u00bb). Les pr\u00e9sentes Conditions r\u00e9gissent votre acc\u00e8s et votre utilisation de nos sites web, applications et services associ\u00e9s (le \u00abService\u00bb).",
      s2Title: "2) Acceptation des conditions",
      s2Body:
        "En acc\u00e9dant au Service ou en l\u2019utilisant, vous acceptez les pr\u00e9sentes Conditions. Si vous n\u2019\u00eates pas d\u2019accord, veuillez ne pas utiliser le Service.",
      s3Title: "3) Description du Service",
      s3Body:
        "BizSproutAI fournit des outils pour aider les utilisateurs \u00e0 valider des id\u00e9es commerciales et \u00e0 g\u00e9n\u00e9rer des supports tels que des rapports, des recommandations et du contenu commercial (\u00ables R\u00e9sultats\u00bb). Les R\u00e9sultats sont g\u00e9n\u00e9r\u00e9s par des algorithmes et peuvent inclure des services tiers.",
      s4Title: "4) Aucun conseil professionnel",
      s4Body:
        "BizSproutAI ne fournit pas de conseils juridiques, fiscaux, financiers, d\u2019investissement, m\u00e9dicaux ou autres conseils professionnels. Les R\u00e9sultats sont fournis \u00e0 titre informatif et doivent \u00eatre v\u00e9rifi\u00e9s de mani\u00e8re ind\u00e9pendante. Vous \u00eates seul responsable des d\u00e9cisions que vous prenez sur la base du Service.",
      s5Title: "5) Admissibilit\u00e9",
      s5Body:
        "Vous devez avoir au moins 13 ans pour utiliser le Service. Si vous n\u2019avez pas atteint l\u2019\u00e2ge de la majorit\u00e9 dans votre lieu de r\u00e9sidence, vous devez obtenir l\u2019autorisation d\u2019un parent ou tuteur.",
      s6Title: "6) Comptes et s\u00e9curit\u00e9",
      s6Body:
        "Si vous cr\u00e9ez un compte, vous \u00eates responsable de la s\u00e9curit\u00e9 de vos identifiants de connexion et de toute activit\u00e9 li\u00e9e \u00e0 votre compte.",
      s7Title: "7) Contenu utilisateur et propri\u00e9t\u00e9",
      s7Body:
        "Vous pouvez soumettre du texte et d\u2019autres informations (\u00abContenu utilisateur\u00bb), tels que des id\u00e9es commerciales et des r\u00e9ponses \u00e0 des enqu\u00eates.",
      s7Li1: "Vous restez propri\u00e9taire de votre Contenu utilisateur.",
      s7Li2:
        "Vous nous accordez une licence limit\u00e9e pour utiliser le Contenu utilisateur uniquement aux fins d\u2019exploitation, de maintenance et d\u2019am\u00e9lioration du Service (y compris la g\u00e9n\u00e9ration de R\u00e9sultats et le d\u00e9pannage).",
      s8Title: "8) R\u00e9sultats et propri\u00e9t\u00e9 intellectuelle",
      s8Li1: "Vous pouvez utiliser les R\u00e9sultats \u00e0 des fins personnelles ou commerciales.",
      s8Li2: "Nous ne garantissons pas que les R\u00e9sultats sont exacts, uniques ou non contrefaisants.",
      s8Li3: "Il vous incombe de v\u00e9rifier les R\u00e9sultats avant de les publier ou de les utiliser \u00e0 des fins commerciales.",
      s9Title: "9) Utilisations interdites",
      s9Body: "Vous vous engagez \u00e0 ne pas\u00a0:",
      s9Li1: "Enfreindre la loi ou violer les droits d\u2019autrui.",
      s9Li2: "Tenter d\u2019acc\u00e9der \u00e0 des syst\u00e8mes auxquels vous n\u2019\u00eates pas autoris\u00e9 \u00e0 acc\u00e9der.",
      s9Li3: "T\u00e9l\u00e9charger des logiciels malveillants ou abuser de l\u2019infrastructure.",
      s9Li4: "Extraire, d\u00e9compiler ou exploiter le Service.",
      s9Li5: "Utiliser le Service pour g\u00e9n\u00e9rer du contenu ill\u00e9gal ou pour harceler, escroquer ou nuire \u00e0 autrui.",
      s10Title: "10) Paiement (le cas \u00e9ch\u00e9ant)",
      s10Body:
        "Si le Service comprend des offres payantes, les tarifs et les conditions de facturation seront affich\u00e9s lors du paiement. Les frais ne sont g\u00e9n\u00e9ralement pas remboursables, sauf si la loi l\u2019exige.",
      s11Title: "11) R\u00e9siliation",
      s11Body:
        "Nous pouvons suspendre ou r\u00e9silier votre acc\u00e8s si vous enfreignez les pr\u00e9sentes Conditions, si la loi l\u2019exige ou pour prot\u00e9ger le Service. Vous pouvez cesser d\u2019utiliser le Service \u00e0 tout moment.",
      s12Title: "12) Exclusions de garantie",
      s12Body:
        "LE SERVICE EST FOURNI \u00abEN L\u2019\u00c9TAT\u00bb ET \u00abSELON DISPONIBILIT\u00c9\u00bb. NOUS EXCLUONS TOUTE GARANTIE DE QUALIT\u00c9 MARCHANDE, D\u2019AD\u00c9QUATION \u00c0 UN USAGE PARTICULIER ET DE NON-CONTREFA\u00c7ON.",
      s13Title: "13) Limitation de responsabilit\u00e9",
      s13Body:
        "Dans toute la mesure permise par la loi, BizSproutAI et Kreyol Thrive Biz ne seront pas responsables des dommages indirects, accessoires, sp\u00e9ciaux, cons\u00e9cutifs ou punitifs, ni de la perte de b\u00e9n\u00e9fices, de revenus, de donn\u00e9es ou de client\u00e8le.",
      s14Title: "14) Modifications du Service ou des Conditions",
      s14Body:
        "Nous pouvons mettre \u00e0 jour le Service et les pr\u00e9sentes Conditions. La poursuite de l\u2019utilisation apr\u00e8s les modifications signifie que vous acceptez les Conditions mises \u00e0 jour.",
      s15Title: "15) Contact",
      s15Pre: "Des questions\u00a0? Contactez-nous \u00e0 ",
      s15Post: ".",
    };
  }

  if (normalized === "es") {
    return {
      title: "T\u00e9rminos de servicio (BizSproutAI)",
      effectiveDate: "Fecha de vigencia: enero de 2026",
      s1Title: "1) Qui\u00e9nes somos",
      s1Body:
        "BizSproutAI (\u00abBizSproutAI\u00bb, \u00abnosotros\u00bb, \u00abnuestro\u00bb) es una marca operada bajo el nombre comercial (DBA) de Kreyol Thrive Biz (\u00abla Empresa\u00bb). Estos T\u00e9rminos rigen su acceso y uso de nuestros sitios web, aplicaciones y servicios relacionados (el \u00abServicio\u00bb).",
      s2Title: "2) Aceptaci\u00f3n de los t\u00e9rminos",
      s2Body:
        "Al acceder o utilizar el Servicio, usted acepta estos T\u00e9rminos. Si no est\u00e1 de acuerdo, no utilice el Servicio.",
      s3Title: "3) Qu\u00e9 hace el Servicio",
      s3Body:
        "BizSproutAI proporciona herramientas para ayudar a los usuarios a validar ideas de negocio y generar materiales como informes, recomendaciones y contenido empresarial (\u00abResultados\u00bb). Los Resultados se generan mediante algoritmos y pueden incluir servicios de terceros.",
      s4Title: "4) Sin asesoramiento profesional",
      s4Body:
        "BizSproutAI no proporciona asesoramiento legal, fiscal, financiero, de inversi\u00f3n, m\u00e9dico ni de ning\u00fan otro tipo profesional. Los Resultados son informativos y deben verificarse de forma independiente. Usted es el \u00fanico responsable de las decisiones que tome basadas en el Servicio.",
      s5Title: "5) Elegibilidad",
      s5Body:
        "Debe tener al menos 13 a\u00f1os para utilizar el Servicio. Si no ha alcanzado la mayor\u00eda de edad en su lugar de residencia, debe contar con el permiso de un padre o tutor.",
      s6Title: "6) Cuentas y seguridad",
      s6Body:
        "Si crea una cuenta, usted es responsable de mantener seguras sus credenciales de inicio de sesi\u00f3n y de toda la actividad en su cuenta.",
      s7Title: "7) Contenido del usuario y propiedad",
      s7Body:
        "Puede enviar texto y otra informaci\u00f3n (\u00abContenido del usuario\u00bb), como ideas de negocio y respuestas a encuestas.",
      s7Li1: "Usted es propietario de su Contenido del usuario.",
      s7Li2:
        "Nos otorga una licencia limitada para usar el Contenido del usuario \u00fanicamente para operar, mantener y mejorar el Servicio (incluida la generaci\u00f3n de Resultados y la resoluci\u00f3n de problemas).",
      s8Title: "8) Resultados y propiedad intelectual",
      s8Li1: "Puede utilizar los Resultados para fines personales o comerciales.",
      s8Li2: "No garantizamos que los Resultados sean precisos, \u00fanicos o que no infrinjan derechos de terceros.",
      s8Li3: "Usted es responsable de verificar los Resultados antes de publicarlos o usarlos comercialmente.",
      s9Title: "9) Uso prohibido",
      s9Body: "Usted se compromete a no:",
      s9Li1: "Infringir la ley o violar los derechos de terceros.",
      s9Li2: "Intentar acceder a sistemas para los que no tiene autorizaci\u00f3n.",
      s9Li3: "Cargar software malicioso o abusar de la infraestructura.",
      s9Li4: "Extraer, aplicar ingenier\u00eda inversa o explotar el Servicio.",
      s9Li5: "Usar el Servicio para generar contenido ilegal o para acosar, defraudar o da\u00f1ar a otros.",
      s10Title: "10) Pago (si corresponde)",
      s10Body:
        "Si el Servicio incluye planes de pago, los precios y las condiciones de facturaci\u00f3n se mostrar\u00e1n al momento del pago. Los cargos generalmente no son reembolsables, salvo que la ley lo exija.",
      s11Title: "11) Terminaci\u00f3n",
      s11Body:
        "Podemos suspender o cancelar su acceso si incumple estos T\u00e9rminos, si lo exige la ley o para proteger el Servicio. Puede dejar de usar el Servicio en cualquier momento.",
      s12Title: "12) Descargos de responsabilidad",
      s12Body:
        "EL SERVICIO SE PROPORCIONA \u00abTAL CUAL\u00bb Y \u00abSEG\u00daN DISPONIBILIDAD\u00bb. RENUNCIAMOS A LAS GARANT\u00cdAS DE COMERCIALIZACI\u00d3N, ADECUACI\u00d3N PARA UN PROP\u00d3SITO PARTICULAR Y NO INFRACCI\u00d3N.",
      s13Title: "13) Limitaci\u00f3n de responsabilidad",
      s13Body:
        "En la m\u00e1xima medida permitida por la ley, BizSproutAI y Kreyol Thrive Biz no ser\u00e1n responsables por da\u00f1os indirectos, incidentales, especiales, consecuentes o punitivos, ni por la p\u00e9rdida de beneficios, ingresos, datos o fondo de comercio.",
      s14Title: "14) Cambios en el Servicio o los T\u00e9rminos",
      s14Body:
        "Podemos actualizar el Servicio y estos T\u00e9rminos. El uso continuado despu\u00e9s de los cambios significa que acepta los T\u00e9rminos actualizados.",
      s15Title: "15) Contacto",
      s15Pre: "\u00bfPreguntas? Cont\u00e1ctenos en ",
      s15Post: ".",
    };
  }

  if (normalized === "ht") {
    return {
      title: "Kondisyon Itilizasyon (BizSproutAI)",
      effectiveDate: "Dat antre an vig\u00e8: janvye 2026",
      s1Title: "1) Kiy\u00e8s nou ye",
      s1Body:
        "BizSproutAI (\u00abBizSproutAI\u00bb, \u00abnou\u00bb, \u00abpa nou\u00bb) se yon mak ki opere anba non komersyal (DBA) Kreyol Thrive Biz (\u00abKonpayi an\u00bb). Kondisyon sa yo gouvenen ak\u00e8 ou ak itilizasyon ou f\u00e8 nan sit entenet nou yo, aplikasyon yo ak s\u00e8vis ki gen rap\u00f2 yo (\u00abS\u00e8vis la\u00bb).",
      s2Title: "2) Akseptasyon kondisyon yo",
      s2Body:
        "L\u00e8 ou jwenn ak\u00e8 oswa itilize S\u00e8vis la, ou dak\u00f2 ak Kondisyon sa yo. Si ou pa dak\u00f2, pa itilize S\u00e8vis la.",
      s3Title: "3) Kisa S\u00e8vis la f\u00e8",
      s3Body:
        "BizSproutAI bay zouti pou ede itilizat\u00e8 yo valid ide biznis epi jenere mat\u00e8ry\u00e8l tankou rap\u00f2, rekomandasyon ak kont\u00e8ni biznis (\u00abRezilta yo\u00bb). Rezilta yo jenere ak alg\u00f2ritm epi yo ka gen l\u00f2t s\u00e8vis ty\u00e8s ladan.",
      s4Title: "4) Pa gen kons\u00e8y pwofesyon\u00e8l",
      s4Body:
        "BizSproutAI pa bay kons\u00e8y legal, fiskal, finansy\u00e8, envestisman, medikal oswa l\u00f2t kons\u00e8y pwofesyon\u00e8l. Rezilta yo se enf\u00f2masyon epi ou ta dwe verifye yo pou kont ou. Se ou s\u00e8l ki responsab desizyon ou pran baze sou S\u00e8vis la.",
      s5Title: "5) Admisibilite",
      s5Body:
        "Ou dwe gen omwen 13 lane pou itilize S\u00e8vis la. Si ou poko gen laj majorite nan kote ou rete a, ou dwe gen otorizasyon yon paran oswa gadyen.",
      s6Title: "6) Kont ak sekirite",
      s6Body:
        "Si ou kreye yon kont, ou responsab pou kenbe enfoumasyon koneksyon ou an sekirite ak tout aktivite anba kont ou a.",
      s7Title: "7) Kont\u00e8ni itilizat\u00e8 ak pwopriyete",
      s7Body:
        "Ou ka soum\u00e8t t\u00e8ks ak l\u00f2t enf\u00f2masyon (\u00abKont\u00e8ni itilizat\u00e8\u00bb), tankou ide biznis ak repons sond\u00e0j.",
      s7Li1: "Ou se met Kont\u00e8ni itilizat\u00e8 ou a.",
      s7Li2:
        "Ou ban nou yon lisans limite pou itilize Kont\u00e8ni itilizat\u00e8 a s\u00e8lman pou opere, ant\u00e8tni ak amelyore S\u00e8vis la (sa gen ladan jenere Rezilta ak rezoud pwoblem).",
      s8Title: "8) Rezilta ak pwopriyete enteltky\u00e8l",
      s8Li1: "Ou ka itilize Rezilta yo pou rezon p\u00e8son\u00e8l oswa komersyal.",
      s8Li2: "Nou pa garanti Rezilta yo egzat, inik oswa yo pa vyole dwa l\u00f2t moun.",
      s8Li3: "Se ou ki responsab pou verifye Rezilta yo anvan ou pibliye oswa itilize yo nan koms\u00e8s.",
      s9Title: "9) Itilizasyon entedi",
      s9Body: "Ou dak\u00f2 pou pa:",
      s9Li1: "Vyole lwa a oswa dwa l\u00f2t moun.",
      s9Li2: "Eseye jwenn ak\u00e8 nan sist\u00e8m ou pa gen otorizasyon pou itilize.",
      s9Li3: "Telechaje lojisy\u00e8l malveyan oswa abize enfrastrikti a.",
      s9Li4: "Ekstr\u00e8, dekonpile oswa eksplwate S\u00e8vis la.",
      s9Li5: "Itilize S\u00e8vis la pou jenere kont\u00e8ni ilegal oswa pou ase, fwode oswa f\u00e8 l\u00f2t moun mal.",
      s10Title: "10) Peman (si sa aplike)",
      s10Body:
        "Si S\u00e8vis la gen plan peyan, pri yo ak kondisyon fakt\u00e8 yo ap afiche nan moman peman an. Fr\u00e8 yo jeneralman pa ranbousab sof si lalwa mande sa.",
      s11Title: "11) Sispansyon",
      s11Body:
        "Nou ka sispann oswa kanpe ak\u00e8 ou si ou vyole Kondisyon sa yo, si lalwa mande sa oswa pou pwoteje S\u00e8vis la. Ou ka sispann itilize S\u00e8vis la nenp\u00f2t ki l\u00e8.",
      s12Title: "12) Deklamasyon",
      s12Body:
        "S\u00c8VIS LA FOUNI \u00abJAN LI YE A\u00bb AK \u00abSELON DISPONIBILITE\u00bb. NOU REFIZE GARANTI KALITE KOMESY\u00c0L, ADAPTASYON POU YON REZON PATIKILYE AK NON-VYOLASYON.",
      s13Title: "13) Limitasyon responsabilite",
      s13Body:
        "Nan limit maksimom lalwa p\u00e8m\u00e8t la, BizSproutAI ak Kreyol Thrive Biz pa p ap responsab pou domaj endirekt, ensidant\u00e8l, espesyal, konsekitif oswa pinitif, oswa p\u00e8t pwofi, rev\u00e8ni, done oswa repitasyon.",
      s14Title: "14) Chanjman nan S\u00e8vis la oswa Kondisyon yo",
      s14Body:
        "Nou ka mete S\u00e8vis la ak Kondisyon sa yo ajou. Kontinyasyon itilizasyon apr\u00e8 chanjman yo vle di ou aksepte Kondisyon ki ajou yo.",
      s15Title: "15) Kontak",
      s15Pre: "Kesyon? Kontakte nou nan ",
      s15Post: ".",
    };
  }

  if (normalized === "pt") {
    return {
      title: "Termos de Servi\u00e7o (BizSproutAI)",
      effectiveDate: "Data de vig\u00eancia: janeiro de 2026",
      s1Title: "1) Quem somos",
      s1Body:
        "BizSproutAI (\u00abBizSproutAI\u00bb, \u00abn\u00f3s\u00bb, \u00abnosso\u00bb) \u00e9 uma marca operada sob o nome fant\u00e1sia (DBA) da Kreyol Thrive Biz (\u00aba Empresa\u00bb). Estes Termos regem o seu acesso e uso dos nossos sites, aplicativos e servi\u00e7os relacionados (o \u00abServi\u00e7o\u00bb).",
      s2Title: "2) Aceita\u00e7\u00e3o dos termos",
      s2Body:
        "Ao acessar ou utilizar o Servi\u00e7o, voc\u00ea concorda com estes Termos. Se n\u00e3o concordar, n\u00e3o utilize o Servi\u00e7o.",
      s3Title: "3) O que o Servi\u00e7o faz",
      s3Body:
        "BizSproutAI fornece ferramentas para ajudar os usu\u00e1rios a validar ideias de neg\u00f3cio e gerar materiais como relat\u00f3rios, recomenda\u00e7\u00f5es e conte\u00fado empresarial (\u00abResultados\u00bb). Os Resultados s\u00e3o gerados por algoritmos e podem incluir servi\u00e7os de terceiros.",
      s4Title: "4) Sem aconselhamento profissional",
      s4Body:
        "BizSproutAI n\u00e3o fornece aconselhamento jur\u00eddico, fiscal, financeiro, de investimento, m\u00e9dico ou qualquer outro aconselhamento profissional. Os Resultados s\u00e3o informativos e devem ser verificados de forma independente. Voc\u00ea \u00e9 o \u00fanico respons\u00e1vel pelas decis\u00f5es tomadas com base no Servi\u00e7o.",
      s5Title: "5) Elegibilidade",
      s5Body:
        "Voc\u00ea deve ter pelo menos 13 anos para utilizar o Servi\u00e7o. Se voc\u00ea n\u00e3o atingiu a maioridade no local onde reside, deve ter a permiss\u00e3o de um pai ou respons\u00e1vel.",
      s6Title: "6) Contas e seguran\u00e7a",
      s6Body:
        "Se voc\u00ea criar uma conta, \u00e9 respons\u00e1vel por manter suas credenciais de login seguras e por toda a atividade em sua conta.",
      s7Title: "7) Conte\u00fado do usu\u00e1rio e propriedade",
      s7Body:
        "Voc\u00ea pode enviar texto e outras informa\u00e7\u00f5es (\u00abConte\u00fado do usu\u00e1rio\u00bb), como ideias de neg\u00f3cio e respostas a pesquisas.",
      s7Li1: "Voc\u00ea \u00e9 o propriet\u00e1rio do seu Conte\u00fado do usu\u00e1rio.",
      s7Li2:
        "Voc\u00ea nos concede uma licen\u00e7a limitada para usar o Conte\u00fado do usu\u00e1rio apenas para operar, manter e melhorar o Servi\u00e7o (incluindo a gera\u00e7\u00e3o de Resultados e solu\u00e7\u00e3o de problemas).",
      s8Title: "8) Resultados e propriedade intelectual",
      s8Li1: "Voc\u00ea pode usar os Resultados para fins pessoais ou comerciais.",
      s8Li2: "N\u00e3o garantimos que os Resultados sejam precisos, exclusivos ou que n\u00e3o infrinjam direitos de terceiros.",
      s8Li3: "Voc\u00ea \u00e9 respons\u00e1vel por verificar os Resultados antes de public\u00e1-los ou us\u00e1-los comercialmente.",
      s9Title: "9) Uso proibido",
      s9Body: "Voc\u00ea concorda em n\u00e3o:",
      s9Li1: "Violar a lei ou os direitos de terceiros.",
      s9Li2: "Tentar acessar sistemas para os quais n\u00e3o possui autoriza\u00e7\u00e3o.",
      s9Li3: "Carregar software malicioso ou abusar da infraestrutura.",
      s9Li4: "Extrair, aplicar engenharia reversa ou explorar o Servi\u00e7o.",
      s9Li5: "Usar o Servi\u00e7o para gerar conte\u00fado ilegal ou para assediar, fraudar ou prejudicar terceiros.",
      s10Title: "10) Pagamento (se aplic\u00e1vel)",
      s10Body:
        "Se o Servi\u00e7o incluir planos pagos, os pre\u00e7os e as condi\u00e7\u00f5es de cobran\u00e7a ser\u00e3o exibidos no momento do pagamento. As taxas geralmente n\u00e3o s\u00e3o reembols\u00e1veis, salvo exig\u00eancia legal.",
      s11Title: "11) Rescis\u00e3o",
      s11Body:
        "Podemos suspender ou encerrar seu acesso se voc\u00ea violar estes Termos, se exigido por lei ou para proteger o Servi\u00e7o. Voc\u00ea pode parar de usar o Servi\u00e7o a qualquer momento.",
      s12Title: "12) Isen\u00e7\u00f5es de responsabilidade",
      s12Body:
        "O SERVI\u00c7O \u00c9 FORNECIDO \u00abNO ESTADO EM QUE SE ENCONTRA\u00bb E \u00abCONFORME DISPONIBILIDADE\u00bb. ISENTAMO-NOS DE GARANTIAS DE COMERCIALIZA\u00c7\u00c3O, ADEQUA\u00c7\u00c3O A UM FIM ESPEC\u00cdFICO E N\u00c3O VIOLA\u00c7\u00c3O.",
      s13Title: "13) Limita\u00e7\u00e3o de responsabilidade",
      s13Body:
        "Na m\u00e1xima extens\u00e3o permitida por lei, BizSproutAI e Kreyol Thrive Biz n\u00e3o ser\u00e3o respons\u00e1veis por danos indiretos, incidentais, especiais, consequenciais ou punitivos, ou pela perda de lucros, receitas, dados ou fundo de com\u00e9rcio.",
      s14Title: "14) Altera\u00e7\u00f5es no Servi\u00e7o ou nos Termos",
      s14Body:
        "Podemos atualizar o Servi\u00e7o e estes Termos. O uso continuado ap\u00f3s as altera\u00e7\u00f5es significa que voc\u00ea aceita os Termos atualizados.",
      s15Title: "15) Contato",
      s15Pre: "D\u00favidas? Entre em contato conosco em ",
      s15Post: ".",
    };
  }

  // Default: English
  return {
    title: "Terms of Service (BizSproutAI)",
    effectiveDate: "Effective Date: January 2026",
    s1Title: "1) Who We Are",
    s1Body:
      "BizSproutAI (\u201cBizSproutAI,\u201d \u201cwe,\u201d \u201cus,\u201d \u201cour\u201d) is a brand operated as a DBA (Doing Business As) of Kreyol Thrive Biz (\u201cCompany\u201d). These Terms govern your access to and use of our websites, apps, and related services (the \u201cService\u201d).",
    s2Title: "2) Agreement to Terms",
    s2Body:
      "By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.",
    s3Title: "3) What the Service Does",
    s3Body:
      "BizSproutAI provides tools to help users validate business ideas and generate materials such as reports, recommendations, and business content (\u201cOutputs\u201d). Outputs are generated using algorithms and may include third-party services.",
    s4Title: "4) No Professional Advice",
    s4Body:
      "BizSproutAI does not provide legal, tax, financial, investment, medical, or other professional advice. Outputs are informational and should be verified independently. You are solely responsible for decisions you make based on the Service.",
    s5Title: "5) Eligibility",
    s5Body:
      "You must be at least 13 years old to use the Service. If you are under the age of majority where you live, you must have a parent/guardian\u2019s permission.",
    s6Title: "6) Accounts and Security",
    s6Body:
      "If you create an account, you are responsible for keeping your login credentials secure and for all activity under your account.",
    s7Title: "7) User Content and Ownership",
    s7Body:
      "You may submit text and other information (\u201cUser Content\u201d), such as business ideas and survey responses.",
    s7Li1: "You own your User Content.",
    s7Li2:
      "You grant us a limited license to use User Content only to operate, maintain, and improve the Service (including generating Outputs and troubleshooting).",
    s8Title: "8) Outputs and Intellectual Property",
    s8Li1: "You may use Outputs for your personal or business purposes.",
    s8Li2: "We do not guarantee Outputs are accurate, unique, or non-infringing.",
    s8Li3: "You are responsible for checking Outputs before publishing or using them commercially.",
    s9Title: "9) Prohibited Use",
    s9Body: "You agree not to:",
    s9Li1: "Break the law or violate others\u2019 rights.",
    s9Li2: "Attempt to access systems you aren\u2019t authorized to use.",
    s9Li3: "Upload malware or abuse infrastructure.",
    s9Li4: "Scrape, reverse engineer, or exploit the Service.",
    s9Li5: "Use the Service to generate illegal content or to harass, defraud, or harm others.",
    s10Title: "10) Payment (If Applicable)",
    s10Body:
      "If the Service includes paid plans, pricing and billing terms will be displayed at checkout. Fees are generally non-refundable unless required by law.",
    s11Title: "11) Termination",
    s11Body:
      "We may suspend or terminate access if you violate these Terms, if required by law, or to protect the Service. You may stop using the Service at any time.",
    s12Title: "12) Disclaimers",
    s12Body:
      "THE SERVICE IS PROVIDED \u201cAS IS\u201d AND \u201cAS AVAILABLE.\u201d WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
    s13Title: "13) Limitation of Liability",
    s13Body:
      "To the maximum extent permitted by law, BizSproutAI and Kreyol Thrive Biz will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or goodwill.",
    s14Title: "14) Changes to the Service or Terms",
    s14Body:
      "We may update the Service and these Terms. Continued use after changes means you accept the updated Terms.",
    s15Title: "15) Contact",
    s15Pre: "Questions? Contact us at ",
    s15Post: ".",
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getTermsCopy(locale);

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
          <p className="mt-2">{t.s2Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s3Title}</h2>
          <p className="mt-2">{t.s3Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s4Title}</h2>
          <p className="mt-2">{t.s4Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s5Title}</h2>
          <p className="mt-2">{t.s5Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s6Title}</h2>
          <p className="mt-2">{t.s6Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s7Title}</h2>
          <p className="mt-2">{t.s7Body}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>{t.s7Li1}</li>
            <li>{t.s7Li2}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s8Title}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>{t.s8Li1}</li>
            <li>{t.s8Li2}</li>
            <li>{t.s8Li3}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s9Title}</h2>
          <p className="mt-2">{t.s9Body}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>{t.s9Li1}</li>
            <li>{t.s9Li2}</li>
            <li>{t.s9Li3}</li>
            <li>{t.s9Li4}</li>
            <li>{t.s9Li5}</li>
          </ul>
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
          <p className="mt-2">{t.s13Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s14Title}</h2>
          <p className="mt-2">{t.s14Body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{t.s15Title}</h2>
          <p className="mt-2">
            {t.s15Pre}<a className="text-emerald-700 hover:text-emerald-800" href="mailto:info@bizsproutai.com">info@bizsproutai.com</a>{t.s15Post}
          </p>
        </section>
      </div>
    </main>
  );
}
