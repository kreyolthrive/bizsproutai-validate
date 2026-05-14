// ─── IdeaContext — enriched niche detection result ────────────────────────────
//
// Each detected niche produces one IdeaContext that the UI can use to:
//   • personalise the verdict prefix  (nicheLabel)
//   • swap the first-asset reason     (nicheAssetReason)
//   • swap the warning copy           (nicheMistake)
//   • swap the next steps             (nicheSteps — already stage-selected)
//
// English-only. The caller (engine.ts) guards non-English locales to null.

export interface IdeaContext {
  /** Null on fallback contexts — suppresses the "For a X at this stage:" verdict prefix. */
  nicheLabel: string | null;
  audienceLabel: string;
  useCaseLabel: string;
  customerActorLabel: string;
  actionTargetLabel: string;
  nicheMistake: string;
  nicheAssetReason: string;
  nicheSteps: string[];
}

// ─── Stage grouping ───────────────────────────────────────────────────────────

export type IdeaStageKey =
  | "idea"
  | "firstAsset"
  | "assembly"
  | "optimization"
  | "launchReady"
  | "launchScale";

type StageGroup = "early" | "mid" | "late";

function stageGroup(key: IdeaStageKey): StageGroup {
  if (key === "idea" || key === "firstAsset") return "early";
  if (key === "assembly" || key === "optimization") return "mid";
  return "late";
}

// ─── Internal template type ───────────────────────────────────────────────────

interface NicheTemplate {
  pattern: RegExp;
  nicheLabel: string;
  audienceLabel: string;
  useCaseLabel: string;
  customerActorLabel: string;
  actionTargetLabel: string;
  nicheMistake: string;
  nicheAssetReason: string;
  steps: Record<StageGroup, string[]>;
}

// ─── Niche templates ──────────────────────────────────────────────────────────

const NICHE_TEMPLATES: NicheTemplate[] = [
  // ── 1. Church + event (specific — must precede generic church) ──────────────
  {
    pattern:
      /(?:church|churches|ministry|congregation|parish)[\s\S]{0,60}(?:event|schedule|calendar)|(?:event|schedule|calendar)[\s\S]{0,60}(?:church|churches|ministry|congregation|parish)/,
    nicheLabel: "church event management app",
    audienceLabel: "church leaders, pastors, or event coordinators",
    useCaseLabel: "church event",
    customerActorLabel: "church administrator",
    actionTargetLabel: "event",
    nicheMistake:
      "Trying to support every event type and denomination at once kills momentum. Most church apps fail because they over-build before running a single real event through the system.",
    nicheAssetReason:
      "Churches do not pay for software they have not experienced. A booking page for one specific event type — youth nights, fundraisers, or Sunday services — lets church leaders see the value before committing to anything broader.",
    steps: {
      early: [
        "Pick one specific event type — Sunday service, youth night, or fundraiser — and build only for that use case before adding more.",
        "Interview 5 church administrators or event coordinators about how they currently manage sign-ups, reminders, and headcounts.",
        "Offer to run one real church event through your app for free — do the setup yourself so they only have to show up.",
        "Track whether they use it for the next event without being asked. Unprompted repeat use is your first signal of real fit.",
      ],
      mid: [
        "Map the exact path from a church leader hearing about your app to running their first event through it — find where they stall.",
        "Identify the one step causing the most confusion for church admins and fix that before building any new features.",
        "Ask churches that completed one event: what would need to change for them to use it for every event this year?",
        "Go deep on direct outreach to church administrators before adding any self-serve or marketing channels.",
      ],
      late: [
        "Document which event type drives the most repeat usage — standardize and systematize that workflow before adding others.",
        "Build a referral path so church administrators naturally tell other church leaders in their network about the app.",
        "Set up a follow-up touchpoint after each event to re-engage administrators who have not scheduled their next one.",
        "Expand to additional event types only after your first cohort of churches is using the app without being prompted.",
      ],
    },
  },

  // ── 2. Church (general) ────────────────────────────────────────────────────
  {
    pattern: /church|churches|ministry|pastor|congregation|parish|worship|sermon/,
    nicheLabel: "church management app",
    audienceLabel: "church leaders, pastors, or administrators",
    useCaseLabel: "church workflow",
    customerActorLabel: "church administrator",
    actionTargetLabel: "workflow",
    nicheMistake:
      "Building a feature-complete church management system from day one. Start with one workflow — attendance, giving, or volunteer scheduling — and prove it works at one church before expanding.",
    nicheAssetReason:
      "One focused workflow demo'd at a real church is worth more than a full platform nobody has touched. Start with the thing church admins hate doing manually every week.",
    steps: {
      early: [
        "Choose one church workflow — attendance, giving, or volunteer scheduling — and build only for that workflow to start.",
        "Talk to 5 church administrators about the one task they hate doing manually every week.",
        "Offer to set up and run the tool for one church's real workflow at no cost — reduce every barrier to getting started.",
        "Measure whether the church uses it again the following week without being prompted.",
      ],
      mid: [
        "Find the single step in your onboarding process where church admins stall or stop — fix that before anything else.",
        "Ask churches using the app: what would make this the tool they open every Sunday morning without thinking about it?",
        "Identify whether drop-off happens during setup, day-of use, or follow-up reporting — each requires a different fix.",
        "Focus on one outreach channel — pastoral networks or church admin groups — before expanding to others.",
      ],
      late: [
        "Document which workflow feature — attendance, giving, or scheduling — generates the most consistent weekly sessions.",
        "Ask active churches to introduce your tool to one other church in their network or denomination.",
        "Create a simple monthly digest that reminds church leaders of the value they got — reduces churn without adding features.",
        "Add a second workflow module only after the first is used without prompting by every active church.",
      ],
    },
  },

  // ── 3. Therapy / mental health ─────────────────────────────────────────────
  {
    pattern: /therap|counseling|counsellor|mental health|psychiatr/,
    nicheLabel: "therapy practice management app",
    audienceLabel: "therapists, counselors, or practice managers",
    useCaseLabel: "client intake or session booking",
    customerActorLabel: "therapist",
    actionTargetLabel: "intake",
    nicheMistake:
      "Trying to replace the EHR or billing system too early. The biggest wins in therapy apps come from reducing friction in intake and scheduling — not replacing clinical tools therapists are legally required to use.",
    nicheAssetReason:
      "Therapists book by phone or intake form today. A clean online booking page with intake questions reduces no-shows and saves front-desk time — measurable value before a full platform is needed.",
    steps: {
      early: [
        "Choose the single most friction-filled step in a therapist's intake process — scheduling, forms, or first-session prep — and solve only that.",
        "Interview 5 therapists or practice managers about the part of their workflow that wastes the most admin time each week.",
        "Offer to set up a booking and intake flow for one practice at no cost — handle everything so they only have to show up.",
        "Check whether the practice uses it for their next new client intake without a reminder — unprompted repeat use is your fit signal.",
      ],
      mid: [
        "Map the full path from a therapist hearing about your tool to using it for their first 5 client intakes — find what breaks.",
        "Ask practices that have used it once: what would need to change for them to replace their current intake process entirely?",
        "Identify whether drop-off happens at setup, first use, or ongoing sessions — the fix is different for each.",
        "Stay focused on direct outreach to therapists and group practices before adding any self-serve onboarding.",
      ],
      late: [
        "Document which practice size — solo therapist versus group practice — generates the most consistent usage and optimize for that profile.",
        "Build a referral path — therapists talk to other therapists; an easy way to introduce the tool to a colleague is worth more than ads.",
        "Send each practice a monthly summary showing intake completion rates and no-show reduction — makes the value visible.",
        "Expand to session notes or billing integration only after intake is used consistently without prompting at every active practice.",
      ],
    },
  },

  // ── 4. Medical / clinic ────────────────────────────────────────────────────
  {
    pattern: /clinic|medical office|doctor.s office|patient management|healthcare practice/,
    nicheLabel: "medical practice management app",
    audienceLabel: "clinic managers, front-desk staff, or physicians",
    useCaseLabel: "patient appointment or intake workflow",
    customerActorLabel: "clinic manager",
    actionTargetLabel: "appointment",
    nicheMistake:
      "Attempting to solve the entire patient journey at once. Medical practices have rigid workflows and compliance requirements — a narrow, well-integrated solution beats a broad one that touches EHR and billing before proving value.",
    nicheAssetReason:
      "Appointment booking and patient intake is where practices lose the most time. A focused scheduling tool with automated reminders can show ROI in the first week — no integration with clinical systems required to start.",
    steps: {
      early: [
        "Pick one moment in the patient visit workflow — appointment booking, intake paperwork, or post-visit follow-up — and solve only that.",
        "Talk to 5 clinic managers or front-desk staff about what they do manually every morning that slows them down.",
        "Offer to configure the tool for one clinic's real patient flow at no cost — make it easy to say yes by handling the entire setup.",
        "Confirm whether the clinic uses it for their next week of appointments without a check-in from you.",
      ],
      mid: [
        "Trace the path from a clinic administrator seeing your demo to their staff using it on a Monday morning — find where adoption stalls.",
        "Ask clinics that completed their first week: what one change would make this indispensable to their front-desk team?",
        "Identify the compliance or workflow concern that gives clinic managers the most hesitation — address it directly before expanding.",
        "Focus on direct outreach to clinic managers and office administrators rather than broad marketing to physicians.",
      ],
      late: [
        "Identify which clinic size — small independent practice versus multi-provider group — is your highest-converting profile and double down there.",
        "Ask active clinics to refer you to one other clinic in their building or specialist referral network.",
        "Create a weekly patient volume report for each clinic — gives administrators something tangible to show their physicians.",
        "Add EHR or billing integrations only after your core workflow is stable and used consistently by every active clinic.",
      ],
    },
  },

  // ── 5. Fitness / gym ──────────────────────────────────────────────────────
  {
    pattern: /\b(gym|crossfit)\b|fitness studio|personal trainer|yoga studio|pilates/,
    nicheLabel: "fitness business management app",
    audienceLabel: "gym owners, trainers, or studio members",
    useCaseLabel: "class or session booking",
    customerActorLabel: "gym owner",
    actionTargetLabel: "class",
    nicheMistake:
      "Building class scheduling, payment, and progress tracking all at once. Most fitness apps fail because they over-engineer before confirming members will pay to use a digital tool rather than just showing up.",
    nicheAssetReason:
      "Members book through Instagram DMs and text messages today. A booking page for your most popular class or service turns a messy manual process into a trackable, repeatable system — proof of value before you add payments or analytics.",
    steps: {
      early: [
        "Pick one class or session type — your most popular offering — and build booking around only that before adding memberships or packages.",
        "Interview 5 gym owners, trainers, or studio managers about how they currently handle booking and what breaks down.",
        "Offer to run one week of class bookings through your app for one gym or studio at no charge.",
        "Check whether members book through your app again the following week without being nudged — repeat use is your first fit signal.",
      ],
      mid: [
        "Map the path from a gym owner hearing about your tool to their members actively using it for every class — find the drop-off point.",
        "Ask studios that ran one week through the app: what would need to change for them to switch from their current booking method permanently?",
        "Identify whether friction is on the owner side — setup, reporting — or the member side — booking UX, notifications — and fix whichever blocks repeat use.",
        "Go deep on outreach to gym owners and studio managers through fitness industry groups before adding any self-serve marketing.",
      ],
      late: [
        "Document which class type or studio size generates the most consistent repeat bookings and systematize that workflow before adding new ones.",
        "Build a referral path — gym owners know other gym owners; a simple incentive for introducing your tool to a colleague accelerates growth.",
        "Send each studio a weekly booking summary showing attendance trends — reduces churn by making your value visible.",
        "Add membership management or payment features only after class booking is stable and used without prompting at every active studio.",
      ],
    },
  },

  // ── 6. Restaurant / food ──────────────────────────────────────────────────
  {
    pattern: /restaurant|catering business|bakery|food truck|cafe management/,
    nicheLabel: "food business management app",
    audienceLabel: "restaurant owners, managers, or staff",
    useCaseLabel: "reservation or order workflow",
    customerActorLabel: "restaurant manager",
    actionTargetLabel: "reservation",
    nicheMistake:
      "Trying to handle ordering, reservations, and staff scheduling in the same first build. Restaurant operators adopt new tools slowly — solve one painful moment before layering on more.",
    nicheAssetReason:
      "Reservation management is the highest-friction point for most restaurant owners. A simple booking and reminder system shows immediate ROI before you build POS integrations, menu management, or inventory features.",
    steps: {
      early: [
        "Choose one moment in the restaurant workflow — table reservations, special event bookings, or catering inquiries — and solve only that.",
        "Talk to 5 restaurant owners or managers about the thing that generates the most manual back-and-forth with customers.",
        "Offer to set up reservations for one restaurant's next busy weekend at no cost — handle all the configuration yourself.",
        "Check whether the restaurant uses it again the following weekend without a reminder from you.",
      ],
      mid: [
        "Trace the path from a restaurant manager hearing about your tool to their host team using it for every shift — find where it breaks down.",
        "Ask restaurants that ran one weekend through the system: what would need to change for them to stop taking reservations by phone?",
        "Identify whether friction is the manager's setup experience or the diner's booking flow — each requires a different fix.",
        "Focus on direct outreach to restaurant owners through local hospitality groups before adding self-serve channels.",
      ],
      late: [
        "Identify which restaurant type — fine dining, casual, or event-focused — generates the most consistent weekly usage and optimize for that profile.",
        "Ask active restaurants to refer you to one other operator in their building, block, or ownership group.",
        "Send each restaurant a weekly cover count and no-show rate summary — makes ROI visible to managers without them asking.",
        "Expand to additional workflows — waitlist, catering, private events — only after reservation management is stable and used without prompting.",
      ],
    },
  },

  // ── 7. Real estate / property management ─────────────────────────────────
  // (narrowed pattern — bare "real estate" is handled by the agent/buyer template below)
  {
    pattern: /property management|rental property|landlord|tenant management|property (manager|owner)|rental management/,
    nicheLabel: "real estate management app",
    audienceLabel: "landlords, property managers, or agents",
    useCaseLabel: "showing request or maintenance workflow",
    customerActorLabel: "property manager",
    actionTargetLabel: "request",
    nicheMistake:
      "Building a platform that requires a large data import or MLS integration to deliver value. Real estate tools must work on day one with the data the operator already has — not after a two-week onboarding project.",
    nicheAssetReason:
      "Landlords and property managers spend hours chasing paperwork across email, text, and spreadsheets. A lead capture or showing-request page consolidates that into one place — instant value, no integration required.",
    steps: {
      early: [
        "Pick one moment in the landlord or agent workflow — showing requests, maintenance tickets, or lease renewals — and build only for that.",
        "Interview 5 landlords, property managers, or agents about the part of their workflow that generates the most inbound messages.",
        "Offer to handle the setup for one property or listing portfolio — make it easy to say yes before asking for any commitment.",
        "Confirm whether they use it for their next showing or request without you following up.",
      ],
      mid: [
        "Map the path from a property manager hearing about your tool to their tenants or clients actively using it — find where adoption stalls.",
        "Ask properties that ran their first month through the system: what would need to change for them to stop managing requests by email?",
        "Identify whether the barrier is on the manager side — setup, reports — or the tenant or client side — UX, notifications — and fix the bigger blocker first.",
        "Focus on direct outreach to property managers and real estate offices rather than listing on directories.",
      ],
      late: [
        "Document which portfolio size — single property versus multi-unit management company — converts at the highest rate and focus there.",
        "Build a referral path — property managers know other property managers; a simple referral incentive accelerates acquisition.",
        "Send each manager a monthly maintenance resolution report — makes the operational value visible without them having to pull it themselves.",
        "Add listing syndication or tenant portal features only after your core request management workflow is stable and used consistently.",
      ],
    },
  },

  // ── 8. Education / tutoring ───────────────────────────────────────────────
  {
    // Requires app/platform/workflow context alongside "tutoring" — prevents
    // community projects that mention tutoring resources from matching here.
    pattern:
      /tutoring (app|platform|software|system|tool|service|center|booking|scheduling|business|management|marketplace)|tutor(?:ing)? (app|platform|management|booking|scheduling|system)|learning management|lms|school management|student management/,
    nicheLabel: "education management app",
    audienceLabel: "teachers, tutors, or school administrators",
    useCaseLabel: "session booking or student progress workflow",
    customerActorLabel: "tutor or teacher",
    actionTargetLabel: "session",
    nicheMistake:
      "Trying to replace the school's existing student information system. EdTech adoption stalls when the tool competes with what administrators already use — the fastest wins solve one gap the SIS does not address.",
    nicheAssetReason:
      "Tutors and teachers waste time on scheduling and progress updates. A booking and session note system replaces the back-and-forth email chain without touching the school's existing tools.",
    steps: {
      early: [
        "Pick one workflow — session booking, progress reporting, or assignment submission — and build only around that before adding anything else.",
        "Interview 5 teachers, tutors, or school administrators about the part of their week that generates the most admin overhead.",
        "Offer to set up the tool for one tutor or teacher's real schedule and run it through one month of sessions at no cost.",
        "Check whether they use it again for the following month's sessions without a reminder.",
      ],
      mid: [
        "Map the path from a tutor or administrator hearing about your tool to consistently using it every week — find the drop-off step.",
        "Ask educators who completed one term: what would make this the first thing they open when a new student enrolls?",
        "Identify whether friction is on the educator's side — setup, reporting — or the student or parent side — visibility, communication — and fix the bigger one.",
        "Go deep on direct outreach to tutoring centers and individual tutors before adding any school-level marketing.",
      ],
      late: [
        "Document which educator profile — individual tutor, tutoring center, or classroom teacher — drives the most consistent weekly sessions.",
        "Ask active educators to refer you to one colleague in their school, center, or tutoring network.",
        "Send each educator a monthly student progress summary — makes the value visible to parents and reduces churn.",
        "Expand to additional workflows — parent communication, payments — only after scheduling and session tracking are stable and used without prompting.",
      ],
    },
  },

  // ── 9. Nonprofit ──────────────────────────────────────────────────────────
  {
    pattern: /nonprofit|non-profit|charity|volunteer management|ngo|donation platform/,
    nicheLabel: "nonprofit management app",
    audienceLabel: "nonprofit directors, volunteer coordinators, or donors",
    useCaseLabel: "volunteer sign-up or event registration workflow",
    customerActorLabel: "nonprofit director",
    actionTargetLabel: "event",
    nicheMistake:
      "Building donor management and volunteer coordination at the same time. Nonprofits run on tight budgets — a tool that solves one pressing operational pain gets adopted far faster than a full CRM replacement.",
    nicheAssetReason:
      "Volunteer coordination and event registration are still done through Google Forms and email for most nonprofits. A clean sign-up and communication tool can replace that immediately, with no migration from existing donor databases required.",
    steps: {
      early: [
        "Choose one operational pain — volunteer scheduling, event sign-ups, or donation acknowledgment — and solve only that workflow first.",
        "Talk to 5 nonprofit directors or volunteer coordinators about what they currently manage through spreadsheets or email chains.",
        "Offer to set up the tool for one nonprofit's next event or volunteer drive at no cost — handle all the configuration.",
        "Check whether the nonprofit uses it for their following event without being prompted by you.",
      ],
      mid: [
        "Map the path from a nonprofit director hearing about your tool to their volunteers actively using it — find where sign-ups or adoption stalls.",
        "Ask nonprofits that ran one event through the system: what would need to change for them to stop using Google Forms?",
        "Identify whether the blocker is the staff experience — admin overhead — or the volunteer experience — sign-up friction — and address the bigger barrier first.",
        "Focus on outreach through nonprofit networks and community foundation events before scaling to self-serve acquisition.",
      ],
      late: [
        "Document which nonprofit type — community service, faith-based, or advocacy — generates the most consistent re-use and optimize onboarding for that profile.",
        "Ask active nonprofits to introduce your tool to one peer organization in their coalition or funding network.",
        "Send each nonprofit a post-event report showing volunteer hours, attendance, and engagement — makes the operational value visible to board members.",
        "Expand to donor management or grant tracking only after your volunteer and event workflow is stable and used without prompting.",
      ],
    },
  },

  // ── 10. HOA / community ───────────────────────────────────────────────────
  {
    pattern: /hoa|homeowner.s association|community association|condo association/,
    nicheLabel: "community management app",
    audienceLabel: "HOA board members, property managers, or residents",
    useCaseLabel: "maintenance request or community announcement workflow",
    customerActorLabel: "HOA manager",
    actionTargetLabel: "request",
    nicheMistake:
      "Trying to digitize every HOA function — dues, maintenance, voting, and documents — before proving that residents will log in at all. Solve one high-visibility problem first.",
    nicheAssetReason:
      "Maintenance request tracking is the biggest pain for HOA managers. A simple submission and status page eliminates the flood of calls and emails — and gives residents something they will actually use before you build document storage or voting features.",
    steps: {
      early: [
        "Pick one HOA workflow — maintenance requests, community announcements, or violation tracking — and build only for that.",
        "Interview 5 HOA board members or property managers about the workflow that generates the most inbound calls and emails.",
        "Offer to set up the tool for one HOA's real maintenance or announcement workflow at no cost.",
        "Check whether residents or board members use it again the following week without a reminder.",
      ],
      mid: [
        "Map the path from an HOA manager hearing about your tool to residents actively submitting through it — find where adoption stalls.",
        "Ask HOAs that ran one month through the system: what would need to change for them to shut down the community email inbox?",
        "Identify whether the blocker is board member setup friction or resident adoption — fix whichever prevents repeat use.",
        "Focus on direct outreach to property management companies that manage multiple HOAs — the fastest path to multi-community scale.",
      ],
      late: [
        "Document which HOA size — small condo association versus large planned community — drives the most consistent active usage.",
        "Ask active HOA managers to refer your tool to one other community in their management portfolio.",
        "Send each HOA a monthly request resolution report — gives board members a talking point for their next community meeting.",
        "Add online voting or document management only after your primary workflow is stable and used without prompting by every active community.",
      ],
    },
  },

  // ── 11. Wedding / events ──────────────────────────────────────────────────
  {
    pattern: /wedding planner|event planning|event coordinator|venue management/,
    nicheLabel: "event management app",
    audienceLabel: "event coordinators, venues, or clients",
    useCaseLabel: "consultation booking or event planning workflow",
    customerActorLabel: "event coordinator",
    actionTargetLabel: "event",
    nicheMistake:
      "Over-investing in a custom client portal before confirming that event clients prefer software over shared documents and emails. Many coordinators find a focused booking and timeline tool is all they need — not a full collaboration platform.",
    nicheAssetReason:
      "Couples and event clients make the first decision based on how easy it is to book a consultation and understand the process. A booking and intake page replaces the back-and-forth email quote process and creates the first great impression.",
    steps: {
      early: [
        "Pick one moment in the event coordinator workflow — initial consultation booking, timeline sharing, or vendor coordination — and build only for that.",
        "Interview 5 event coordinators, venue managers, or clients about what takes the most time in the initial planning phase.",
        "Offer to set up a booking and intake flow for one coordinator's next two or three inquiries at no cost.",
        "Check whether the coordinator uses it for their next inquiry without a reminder — unprompted repeat use is your first real signal.",
      ],
      mid: [
        "Map the path from an event client receiving your booking link to completing their intake and scheduling a consultation — find where they drop off.",
        "Ask coordinators who completed one event booking cycle: what would need to change for them to stop sending intake information by email?",
        "Identify whether friction is on the coordinator's side — setup, timeline management — or the client side — booking UX, document sharing — and fix the bigger blocker.",
        "Focus on outreach to wedding planners and event venues through local industry networks before adding self-serve marketing.",
      ],
      late: [
        "Identify which event type — weddings, corporate events, or social gatherings — generates the most consistent repeat engagements.",
        "Ask active coordinators to refer your tool to one other planner or venue in their vendor network.",
        "Send each coordinator a post-event summary showing timeline adherence and client communication activity — makes the value visible between projects.",
        "Add vendor coordination or multi-event pipeline management only after consultation booking is stable and used without prompting.",
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Broader category templates — match after specific verticals above.
  // Specific signals win; these fire only when no vertical template matched.
  // ══════════════════════════════════════════════════════════════════════════

  // ── 12. AI SaaS ──────────────────────────────────────────────────────────
  {
    pattern:
      /\b(ai.powered|ai.driven|ai tool|ai platform|artificial intelligence|machine learning|large language model|llm\b|gpt.?\d|generative ai|nlp\b|ai.assisted|ai.generated|ai (automat|analyz|predict|recommend|generat)|vector (database|search)|embeddings?\b|openai|anthropic api|ai saas|saas tool|b2b saas)\b/,
    nicheLabel: "AI-powered SaaS product",
    audienceLabel: "knowledge workers, operators, or business teams",
    useCaseLabel: "AI-assisted workflow",
    customerActorLabel: "operator or knowledge worker",
    actionTargetLabel: "workflow",
    nicheMistake:
      "Building AI features before proving one painful workflow that real users are actively trying to fix. Most AI products fail not because the AI is poor but because no single workflow was specific enough for it to solve. Pick one workflow, identify the manual step that frustrates your target user most, and test whether your AI eliminates that step — before adding any others.",
    nicheAssetReason:
      "A demo page or a 'workflow audit' CTA — where you manually apply your AI to one real example — proves value faster than a polished product. A before/after showing input and AI output for one specific use case generates more qualified interest than any feature list.",
    steps: {
      early: [
        "Define your ICP in one sentence: who they are, which specific workflow they struggle with, and what they currently use to handle it.",
        "Pick the one workflow step that takes the most time or creates the most errors — that is your AI entry point, not the full process.",
        "Build a before/after demo using real or representative data: show the manual input and the AI output side by side.",
        "Send the demo to 10 people who match your ICP and ask: 'Would you pay $X/month to eliminate this step?' — their response tells you more than any survey.",
      ],
      mid: [
        "Map the path from a target user seeing your demo to actively using your AI for their real workflow — find the step where they stall.",
        "Identify whether hesitation is about trust (accuracy), integration (connecting to existing tools), or pricing — address the biggest one first.",
        "Offer a manual 'concierge AI' version to 5 pilot customers: run the workflow manually for them in exchange for feedback and testimonial rights.",
        "Focus on one acquisition channel — communities where your ICP discusses the workflow pain — before expanding to broader marketing.",
      ],
      late: [
        "Document which use case or workflow type generates the most consistent daily active usage — build your growth motion around that specific use case.",
        "Build case studies showing before/after metrics for 3 customers: time saved, errors reduced, or output quality improved.",
        "Set up an in-product re-engagement sequence for users who ran the workflow once but did not return — re-activation is cheaper than acquisition.",
        "Expand to a second workflow or ICP only after your first use case is retained without prompting by the majority of active users.",
      ],
    },
  },

  // ── 13. Local service ─────────────────────────────────────────────────────
  {
    pattern:
      /local service|home service|handyman|plumber|electrician|cleaning service|lawn (care|service)|landscaping|pressure washing|pest control|locksmith|moving service|junk removal|house cleaning|window cleaning|pool service|home repair|appliance repair|gutter cleaning|HVAC service|car detail|auto detail|detailing service|car wash service|mobile (car|auto|vehicle)/,
    nicheLabel: "local service business",
    audienceLabel: "homeowners or local residents",
    useCaseLabel: "local service booking",
    customerActorLabel: "homeowner",
    actionTargetLabel: "service",
    nicheMistake:
      "Buying more equipment, hiring additional staff, or expanding to a second service area before confirming that customers in one specific neighborhood will book and pay for one specific service at a specific price. Most local service businesses fail by going broad too early — competing on price across a wide geography instead of becoming the obvious choice in one neighborhood first.",
    nicheAssetReason:
      "A service page targeting one specific service and one specific area proves real booking demand before you invest in more equipment, vehicles, or staff. A clear page with 2–3 packages, prices, and a booking CTA tells you whether the right customers in your area will actually pay — before you commit to scaling anything.",
    steps: {
      early: [
        "Pick one service type — not every service you can do — and one specific neighborhood or zip code to start in.",
        "Set up a simple service page with a clear headline ('Same-day [service] in [area]'), your service details, and a booking or call CTA.",
        "Create 3–5 listings on local directories — Google Business Profile, Yelp, Nextdoor — pointing to your booking page.",
        "Complete 5 jobs in your target area, even at a reduced rate, and ask each customer for a Google review immediately after.",
      ],
      mid: [
        "Track where your booked customers are coming from — Google, Nextdoor, referral, or direct — and double down on the top source.",
        "Identify the one service that generates the most repeat bookings or highest average ticket — focus there and cut the rest for now.",
        "Ask your best customers: 'Do you know anyone in the neighborhood who needs this?' — referrals are your cheapest acquisition channel.",
        "Add one urgency signal to your booking page — same-day availability or limited slots this week — and test whether it improves conversion.",
      ],
      late: [
        "Document the exact profile of your best recurring customer — the type of home, the trigger that made them book, the service they repeat most.",
        "Build a seasonal campaign: send past customers a reminder before the high-demand period for your service category.",
        "Add a simple follow-up sequence after each job — a thank-you, a review request, and a rebook reminder — to maximize repeat revenue.",
        "Expand to a second service or second neighborhood only after your first area is generating consistent repeat bookings without paid ads.",
      ],
    },
  },

  // ── 14. Coaching / consulting ─────────────────────────────────────────────
  {
    pattern:
      /\b(life coach|business coach|executive coach|career coach|leadership coach|performance coach|mindset coach|financial coach|coaching (business|program|practice|packages?|clients?)|consulting (practice|firm|business|clients?)|freelance consultant|1.on.1 coaching|one.on.one coaching)\b/,
    nicheLabel: "coaching or consulting practice",
    audienceLabel: "clients who need your specific expertise",
    useCaseLabel: "consultation or coaching engagement",
    customerActorLabel: "client",
    actionTargetLabel: "outcome",
    nicheMistake:
      "Selling transformation too broadly — 'I help people achieve their goals' — without a specific client type, a specific problem, and a specific measurable outcome. Coaching and consulting businesses that struggle to get clients almost always have unclear positioning. The clearest offer wins: 'I help [specific person] achieve [specific result] in [specific timeframe].'",
    nicheAssetReason:
      "A service page with a specific client description, a specific outcome, and a consultation CTA is your fastest proof of positioning. It tests whether the right person recognizes themselves in your copy and takes the next step — before you invest in a course, group program, or marketing funnel.",
    steps: {
      early: [
        "Write your positioning statement: 'I help [specific person] achieve [specific measurable result] in [specific timeframe] — without [common obstacle].' If you cannot write it clearly, narrow further.",
        "Talk to 5 people who fit your ideal client description and ask them to describe their biggest challenge in their own words — use their language, not yours.",
        "Offer 3 free discovery calls to people who match your ideal client profile in exchange for detailed feedback on your offer framing.",
        "Set up a simple service page with your positioning statement, one client result or case study, and a single 'book a call' CTA.",
      ],
      mid: [
        "Track your conversion from discovery call to paid engagement — if it is below 30%, your positioning, pricing, or proof needs adjusting before you add more traffic.",
        "Ask every prospect who does not convert: what made you hesitant? Their answer is more valuable than any marketing test.",
        "Identify your best client type — the one who gets results fastest and refers others — and rewrite your positioning to speak specifically to them.",
        "Go deep on one acquisition channel before adding another: referrals, LinkedIn, one community, or one content format — pick the channel your ideal client actually uses.",
      ],
      late: [
        "Document 3 client results as case studies — specific challenge, specific approach, specific outcome — and put them prominently on your service page.",
        "Build a referral program that makes it easy for satisfied clients to introduce you to one colleague or peer in their network.",
        "Test a group offer or lower-ticket product to re-engage leads who could not afford your 1-on-1 rate — not every warm lead needs to be a private client.",
        "Raise your rate once you can show 3 client outcomes and have more inbound interest than capacity — do not wait for 'the right moment.'",
      ],
    },
  },

  // ── 15. Marketplace ──────────────────────────────────────────────────────
  {
    pattern:
      /\bmarketplace\b|two.sided (platform|market)|connect (buyers and sellers|freelancers and clients|providers and buyers)|gig (platform|economy platform)|peer.to.peer (market|platform)|platform (that connects|connecting) (buyers|sellers|providers|freelancers)|\bconnects\b.{0,80}\b(products|sellers?|vendors?)\b|\bconnects\b.{0,60}\bsell\b|\b(sellers?|vendors?)\b.{0,50}\bbuyers?\b|\bbuyers?\b.{0,50}\b(sellers?|vendors?)\b/,
    nicheLabel: "two-sided marketplace",
    audienceLabel: "both buyers and vendors or sellers",
    useCaseLabel: "marketplace transaction",
    customerActorLabel: "buyer or seller",
    actionTargetLabel: "transaction",
    nicheMistake:
      "Building the marketplace platform before validating that both sides will show up. Two-sided platforms fail because sellers will not list without buyers, and buyers will not come without supply. The fastest way to fail is to build the platform and wait. The fastest way to prove it works is to manually broker the first 10 transactions yourself.",
    nicheAssetReason:
      "Two simple intake forms — one for buyers and one for vendors or sellers — test whether real demand and real supply exist before you invest in platform development. If you cannot get 20 vendors to fill out a supply form, the platform will face the same cold-start problem after you build it.",
    steps: {
      early: [
        "Pick one buyer segment and one product or service category first — not the full platform vision. For example: one city or region and one service type, or one diaspora community and one product category.",
        "Create a buyer intake form: what they are looking for, when they need it, and what they would pay.",
        "Create a vendor or seller intake form: what they offer, their pricing, and whether they have capacity right now.",
        "Manually broker 5–10 transactions using the intake forms and your own coordination — prove the transaction works before you automate anything.",
      ],
      mid: [
        "Identify which side of the market is harder to acquire — supply or demand — and focus the next month entirely on that side.",
        "Map where each transaction breaks down: matching, pricing, trust, or payment — fix the biggest failure point first.",
        "Talk to 5 vendors and 5 buyers who completed a transaction: what would make them use the marketplace again instead of going direct?",
        "Find the one acquisition channel that brings the highest-intent buyers — they drive the economics — and go deep before adding supply-side marketing.",
      ],
      late: [
        "Document your best transaction type — the category with the most repeat usage and highest satisfaction on both sides — and build your growth motion around it.",
        "Build a retention mechanic that gives buyers a reason to return to the marketplace instead of going direct to the vendor they found.",
        "Identify your top 20% of vendors by transaction volume and give them something meaningful — priority placement, lower fees, or early access — to keep them active.",
        "Expand to a second city or category only after your first market has liquidity: regular transactions happening without your direct facilitation.",
      ],
    },
  },

  // ── 16. Ecommerce / preorder ─────────────────────────────────────────────
  {
    pattern:
      /ecommerce|e-commerce|dropshipping?|physical product|preorder|pre-order|product launch|online store|shopify|woocommerce|private label|consumer goods|sell (products|goods) online|product (page|listing|inventory)/,
    nicheLabel: "product or ecommerce business",
    audienceLabel: "customers looking to buy your product",
    useCaseLabel: "product purchase or preorder",
    customerActorLabel: "customer",
    actionTargetLabel: "product",
    nicheMistake:
      "Investing in inventory, manufacturing, or a full store before proving that real customers will pay for your specific product at your specific price. Most physical product businesses fail not because the product is bad but because the founder assumed demand instead of testing it. A preorder or pre-sale campaign costs almost nothing and tells you everything.",
    nicheAssetReason:
      "A product landing page with a preorder or pre-sale CTA validates real purchase intent before you spend money on inventory or manufacturing. Someone who enters their payment details is a customer — someone who says 'I love this idea' is not.",
    steps: {
      early: [
        "Pick one hero product — not a catalog — and write a one-page description focused on one customer pain, one specific benefit, and a clear before/after.",
        "Create a product landing page with real images or mockups, your pricing, and a preorder or waitlist CTA.",
        "Drive 100–500 people from your target audience to the page using direct outreach, organic social, or a small paid test — track how many take action.",
        "If preorders exceed your minimum viable batch quantity, fulfill. If not, find out why the page did not convert before investing in inventory.",
      ],
      mid: [
        "Identify which acquisition channel drove the most preorders at the lowest cost — double down on it before adding new channels.",
        "Talk to every preorder customer: what made you buy, and what almost stopped you? These two answers drive your next product page iteration.",
        "Test one offer adjustment — a bundle, a guarantee, or a limited quantity — and measure whether it improves conversion rate.",
        "Add a post-purchase upsell or cross-sell for customers who just bought — they are your highest-intent audience and the easiest next sale.",
      ],
      late: [
        "Document your best customer type — the person who buys quickly, pays full price, and refers others — and write all future product copy to that profile.",
        "Build a retention sequence: post-purchase follow-up, reorder reminder, and a loyalty incentive for your best customers.",
        "Test subscription or replenishment pricing if your product is consumable — recurring revenue fundamentally changes your unit economics.",
        "Launch your second product to existing customers before trying to acquire new ones — current buyers are your cheapest and most qualified audience.",
      ],
    },
  },

  // ── 17. Creator / digital product ────────────────────────────────────────
  // Placed before consumer app / waitlist so that "template kit + waitlist"
  // routes here rather than to the consumer app template.
  {
    pattern:
      /digital (product|download|goods|asset|template)|notion template|template (for sale|shop|pack|bundle|kit|collection|toolkit)|ebook|digital guide|creator (business|economy|product|brand)|sell (templates|ebooks|downloads|digital files|presets|printables|digital goods)|gumroad|etsy digital|digital shop/,
    nicheLabel: "creator or digital product business",
    audienceLabel: "buyers looking for a quick-win resource or tool",
    useCaseLabel: "digital product purchase or download",
    customerActorLabel: "buyer",
    actionTargetLabel: "product",
    nicheMistake:
      "Creating a digital product before confirming that your audience desperately wants the specific outcome it delivers. Most creator products fail because the creator made what they thought was useful, not what their audience was already searching for and willing to pay for. Find the one painful task your audience does manually and repeatedly — that is your product.",
    nicheAssetReason:
      "A simple landing page with a mockup, a clear outcome statement, and a checkout link or waitlist CTA tests demand before you spend time creating the product. A 'buy before it is finished' offer to a warm audience is your fastest proof that the product is worth making.",
    steps: {
      early: [
        "Identify the one painful task your target audience does manually and repeatedly — the thing they Google, ask about in communities, or complain about consistently.",
        "Describe the outcome in one sentence: 'This [template/guide/checklist] helps [specific person] [specific task] in [specific time] — without [common obstacle].'",
        "Create a simple product mockup or 1-page preview and post it to your audience or a relevant community with a pre-sale link or waitlist.",
        "If at least 10–20 people buy or sign up, create the product. If not, the positioning or audience needs to change before you invest more time.",
      ],
      mid: [
        "Identify which product in your lineup drives the most repeat purchases or cross-sells — that product's theme is your brand category.",
        "Ask buyers who purchased but did not leave a review: what result did they get, and what would have made the product more useful?",
        "Create a simple email sequence after purchase that helps buyers implement the product — buyers who get results become reviewers and referrers.",
        "Test a bundle offer combining your top 2–3 products at a discount — bundles increase average order value without requiring new product creation.",
      ],
      late: [
        "Build a review-generation sequence: a follow-up email 3–5 days after purchase asking for a specific, outcome-focused review on your platform.",
        "Identify the content format that drives the most purchases and create a repeatable publishing cadence around it.",
        "Test a membership or subscription tier that gives buyers ongoing access to new products — recurring revenue dramatically improves creator business stability.",
        "Create a deeper resource or course for buyers who already trust your brand and want to go further with the topic.",
      ],
    },
  },

  // ── 18. Consumer app / waitlist ──────────────────────────────────────────
  {
    pattern:
      /\b(waitlist|waiting list)\b|consumer (app|product|facing)|social (app|platform|network) for (people|users|consumers)|b2c (app|product|platform)|app for (everyday|consumers|end users)|pre.launch (app|product|landing)/,
    nicheLabel: "consumer app or pre-launch product",
    audienceLabel: "everyday users or consumers",
    useCaseLabel: "app feature or consumer experience",
    customerActorLabel: "user",
    actionTargetLabel: "feature",
    nicheMistake:
      "Building the app before proving that one specific user segment has one specific repeated pain your app solves better than their current behavior. Most consumer apps fail not because the app is bad but because users lack enough urgency to change a daily habit. Identify the one situation where your user is frustrated often enough and consistently enough to try something new.",
    nicheAssetReason:
      "A landing page with a waitlist captures real user intent before you build a single screen. When someone signs up for early access, you get a signal that the promise resonated — and a warm list to invite for beta testing, which is far more valuable than cold outreach when you have something to test.",
    steps: {
      early: [
        "Define one specific user segment — not 'everyone' — and describe the one repeated situation where they feel the pain your app solves.",
        "Create a landing page with a clear headline describing the outcome (not the features) and a waitlist CTA — no app required.",
        "Drive 200–500 sign-ups from your target user community using organic channels: communities, relevant social posts, or direct outreach.",
        "Interview 20 waitlist sign-ups: how often do they experience the pain, what do they currently do about it, and what would change if it went away?",
      ],
      mid: [
        "Build and ship the smallest possible version that addresses the one core pain — resist adding secondary features until the core is retained.",
        "Track Day 7 and Day 30 retention — if users do not return within 7 days, the core habit or pain is not strong enough to support the app.",
        "Ask churned users what was missing, confusing, or not worth coming back for — their answer is your product roadmap.",
        "Go deep on one acquisition channel before adding others — find the community or content format that brings users with the highest retention rate.",
      ],
      late: [
        "Identify the one in-app action that predicts long-term retention and optimize onboarding to get new users there in their first session.",
        "Build a sharing or referral mechanic that lets retained users bring in one friend naturally — viral coefficient matters more than paid acquisition at this stage.",
        "Set up a re-engagement sequence for users inactive for 7+ days — well-timed, relevant nudges can recover 15–25% of churned users.",
        "Raise your App Store or Play Store rating to 4.5+ before increasing paid acquisition — poor ratings kill conversion from organic search, your cheapest long-term channel.",
      ],
    },
  },

  // ── 19. Education / online course ────────────────────────────────────────
  {
    pattern:
      /online course|course creator|digital course|e.learning|cohort.based|video course|sell (a|the|my|an|online) course|(teach|teaching) online|course (launch|creation|business)|curriculum (creator|builder)|sell (my|a|the) (knowledge|expertise)|course (platform|membership)/,
    nicheLabel: "online course or education product",
    audienceLabel: "learners looking for a specific skill or outcome",
    useCaseLabel: "learning outcome or skill acquisition",
    customerActorLabel: "learner",
    actionTargetLabel: "lesson or module",
    nicheMistake:
      "Building a full course curriculum before proving that one specific learner type will pay to achieve one specific outcome. Most course creators fail because they teach what they know rather than what a paying student desperately needs. Find 5 people who want the outcome, ask them to pay for a live workshop version first, and use that session to build the course.",
    nicheAssetReason:
      "A workshop page, mini-course landing page, or waitlist with a specific outcome promise tests whether real learners will enroll and pay — before you record a single video. A live workshop lets you refine your curriculum in real-time with real learner feedback before you invest in production.",
    steps: {
      early: [
        "Define one learner type and one specific outcome — not 'learn marketing' but 'get your first 5 consulting clients in 90 days.'",
        "Create a waitlist or workshop page with the specific outcome promise, a clear price point, and a buy or reserve CTA.",
        "Run a live 60–90 minute workshop or cohort session for the first 5–15 paying students before recording any pre-recorded content.",
        "Use the live session to identify the 3 biggest learner questions and gaps — let their real confusion shape your curriculum, not your assumptions.",
      ],
      mid: [
        "Map the path from a learner landing on your course page to completing the core module that delivers the promised outcome — find where they drop off.",
        "Calculate your completion rate and identify the module where most learners stop — that module's content, length, or complexity needs to change first.",
        "Ask graduates who got the promised result for a specific testimonial: their starting point, the one thing that shifted, and the measurable outcome.",
        "Go deep on one acquisition channel — your own audience, a partner audience, or one community — before adding paid ads or other channels.",
      ],
      late: [
        "Document 3–5 student success stories with before/after specifics — these are your most powerful sales assets and should be prominent on your sales page.",
        "Build an alumni community or follow-up module that keeps graduates engaged and creates word-of-mouth from people who got results.",
        "Test a payment plan option — reducing upfront cost often increases enrollment 20–40% — and track whether it affects completion rates.",
        "Launch your next course to your existing student list first — they have the highest trust, the lowest acquisition cost, and the most context about what they need next.",
      ],
    },
  },

  // ── 20. Nonprofit / community (broader — formal nonprofit caught above) ───
  {
    pattern:
      /\b(community (platform|app|hub|project|builder)|community.led|membership community|online community|social impact|civic tech|community (building|organizing)|build (a|the|our|my) community|mission.driven)\b/,
    nicheLabel: "community or social impact project",
    audienceLabel: "community members, participants, or supporters",
    useCaseLabel: "community action or participation",
    customerActorLabel: "community member",
    actionTargetLabel: "action",
    nicheMistake:
      "Leading with mission and values before defining one community served, one specific need, one trust signal, and one clear action people can take. Missions inspire people to nod — a specific CTA (volunteer here, donate now, join this group, attend this event) is what makes them act. Without a specific ask, even the best mission statement creates passive supporters, not active participants.",
    nicheAssetReason:
      "A simple mission page with one clear action CTA — volunteer sign-up, donation, event registration, or community join link — tests whether real people will take the first step before you build a platform or launch a full program.",
    steps: {
      early: [
        "Define the community you serve in one sentence — not 'everyone who cares about this' but a specific group with a specific shared need or identity.",
        "Identify the one action that would have the highest impact for your community right now — and create a single CTA that makes that action easy.",
        "Create a simple page or form with your mission statement, the community's core need, one proof of credibility, and the single action CTA.",
        "Share it directly with 20 people who match your community definition and measure how many take the action without follow-up prompting.",
      ],
      mid: [
        "Track which community members act most quickly — they are your core advocates and their profile should shape how you recruit the next wave.",
        "Identify the one program or event that generates the most re-engagement — double down on it before adding new programs.",
        "Ask your most active participants: what would make this community more essential to their life or work?",
        "Build one trust signal into your presence — a visible member count, a key partnership, or a recognizable supporter — before asking for larger commitments.",
      ],
      late: [
        "Document 3 participant impact stories — specific person, specific situation, specific change — and use them as your primary acquisition content.",
        "Build a referral path where active members can easily introduce new members — peer invitation is the most credible form of community growth.",
        "Create a follow-up sequence for people who signed up but have not participated — a specific, time-limited event or action re-engages a meaningful portion of passive sign-ups.",
        "Expand to a second program or geography only after your first cohort is self-sustaining without direct facilitation.",
      ],
    },
  },

  // ── 21. Health / wellness (broad — therapy and fitness caught above) ──────
  {
    pattern:
      /\b(wellness (app|program|platform|brand|coach(?:ing)?|product|service|challenge)|health (app|platform|coaching|coach)|nutrition (coaching|app|platform)|diet (app|coach|plan)|weight loss (program|coach|app)|meditation (app|guide|platform)|mindfulness (app|platform)|sleep (app|tracker|program|better)|stress (management|reduction|program|coaching)|holistic (health|wellness)|corporate wellness|supplement (brand|business)|self.care (routine|program|plan|practice|challenge|habit))\b/,
    nicheLabel: "health or wellness offer",
    audienceLabel: "people pursuing a specific health or wellness outcome",
    useCaseLabel: "health improvement or wellness habit",
    customerActorLabel: "client or user",
    actionTargetLabel: "health goal",
    nicheMistake:
      "Making broad wellness promises — 'feel better,' 'live healthier,' 'reduce stress' — without one specific health goal, one specific user type, and one specific timeframe. Wellness is a crowded category where vague promises are ignored. The clearest outcome wins: 'Lose 10 lbs in 8 weeks for busy parents' outperforms 'live your healthiest life' every time.",
    nicheAssetReason:
      "A challenge page or consultation CTA testing one specific wellness outcome for one specific audience — busy moms, working parents, or postpartum women — validates whether your target customer will sign up before you build the full program. When a wellness offer is specific enough that the right person says 'that is exactly what I need,' they convert — generic wellness promises generate polite interest but rarely bookings or enrollments.",
    steps: {
      early: [
        "Name your specific wellness audience — not 'people who want to be healthy' but 'busy moms who want to reduce stress and sleep better without adding another complicated routine.'",
        "Define one specific, measurable health outcome your product or service delivers and the realistic timeframe to achieve it.",
        "Create a service or challenge page with the specific outcome promise, social proof or credentials, and a consultation or enroll CTA.",
        "Run 5 free consultations or trial sessions with people who match your target profile — use them to refine your outcome promise and find the most common barrier.",
      ],
      mid: [
        "Track your consultation-to-enrollment conversion rate — if it is below 20%, your pricing, outcome promise, or qualification process needs adjusting.",
        "Ask clients who did not enroll: what made you hesitant? Identify whether the barrier is price, trust, specificity, or timing — each has a different fix.",
        "Collect one specific client result with real numbers — pounds lost, sessions completed, measurable metric improved — and lead with it in all marketing.",
        "Go deep on one acquisition channel your target audience uses most — a specific community, a workplace program, or a local partner — before adding more.",
      ],
      late: [
        "Build 3 case studies with before/after metrics and client quotes — wellness outcomes are emotional and visual, and they convert better than benefit lists.",
        "Create a referral program: satisfied clients who got results are your best acquisition channel because they self-select the right new clients.",
        "Test a group or cohort format alongside 1-on-1 — it increases revenue per hour while giving clients accountability benefits they value.",
        "Develop a follow-up program for clients who completed your core offering — a next goal, maintenance tier, or advanced program — to maximize lifetime value.",
      ],
    },
  },

  // ── 22. Real estate agent / buyer-seller service ──────────────────────────
  {
    pattern:
      /real estate( agent)?|realtor|homebuyer|home (buying|selling|buyer|seller)|first.time (buyer|homebuyer)|mortgage broker|property (buyer|seller|listings?)|buyers? agent|sellers? agent|real estate (lead|crm|software|tool)/,
    nicheLabel: "real estate service or lead generation tool",
    audienceLabel: "homebuyers, sellers, or real estate professionals",
    useCaseLabel: "home purchase, sale, or lead capture",
    customerActorLabel: "home buyer or seller",
    actionTargetLabel: "consultation",
    nicheMistake:
      "Competing broadly — 'I help anyone buy or sell a home' — instead of owning one specific buyer or seller situation. Real estate is deeply local and relationship-driven. The most successful real estate tools and services carve out one specific scenario — first-time buyers in one city, investors in one asset class, or sellers in one price range — and become the obvious choice in that one lane.",
    nicheAssetReason:
      "A lead-capture or consultation page targeting one specific buyer or seller situation — 'First-time homebuyers in [city]: book a free 30-minute call' — tests real intent before you build a full tool or brokerage model. A person who books a consultation is a prospect; a person who fills out a generic form may never convert.",
    steps: {
      early: [
        "Define your specific real estate niche: one buyer or seller type (first-time buyers, investors, downsizers), one geography (one city or neighborhood), and one transaction moment.",
        "Create a lead-capture page with a specific headline, a short explanation of your unique angle, and a 'book a free consultation' CTA.",
        "Share the page with 20 people who match your target profile — local Facebook groups, real estate forums, or LinkedIn — and measure how many book.",
        "Run 5 consultations with qualified prospects and ask each: what is the biggest thing you are worried about in this process? Use their answers to refine your positioning.",
      ],
      mid: [
        "Track where your best leads come from — referrals, organic search, social, or directory listings — and focus the next 30 days on that one source.",
        "Build one strong trust signal onto your lead page: a specific testimonial with a named client, a transaction count, or a local press mention.",
        "Identify the one objection that appears in most consultations and create a short piece of content that addresses it directly.",
        "Ask your best past clients to refer one person in their network in a similar situation — real estate referrals close at a dramatically higher rate than cold leads.",
      ],
      late: [
        "Document your best client stories — the situation, the challenge, the outcome — and use them as your primary social proof on your lead page.",
        "Build a nurture sequence for leads who are not ready to transact — quarterly market updates or local data keeps you top of mind until they are ready.",
        "Create a referral partnership with 2–3 adjacent service providers — mortgage brokers, inspectors, attorneys — who serve the same client type and will refer bidirectionally.",
        "Expand to a second buyer or seller type or geography only after your first niche is generating consistent qualified leads and referrals without paid advertising.",
      ],
    },
  },
];

// ─── Public detection function ────────────────────────────────────────────────

export function detectIdeaContext(
  idea: string,
  audience: string,
  stageKey: IdeaStageKey
): IdeaContext | null {
  const text = (idea + " " + audience).toLowerCase();
  const group = stageGroup(stageKey);

  for (const tpl of NICHE_TEMPLATES) {
    if (tpl.pattern.test(text)) {
      return {
        nicheLabel: tpl.nicheLabel,
        audienceLabel: tpl.audienceLabel,
        useCaseLabel: tpl.useCaseLabel,
        customerActorLabel: tpl.customerActorLabel,
        actionTargetLabel: tpl.actionTargetLabel,
        nicheMistake: tpl.nicheMistake,
        nicheAssetReason: tpl.nicheAssetReason,
        nicheSteps: tpl.steps[group],
      };
    }
  }

  return null;
}

// ─── Universal fallback context ───────────────────────────────────────────────
//
// Called by engine.ts when detectIdeaContext returns null (no niche template
// matched). Produces founder-useful guidance from signals in the idea text
// rather than returning weak generic copy.
//
// nicheLabel is null on fallback so the UI skips the "For a X at this stage:"
// verdict prefix — the plain verdict is shown instead.

// Map from asset key string → why that asset fits at this stage
const FALLBACK_ASSET_REASONS: Record<string, string> = {
  booking:
    "A booking or scheduling page is the fastest way to turn interest into a committed time slot — no platform required. Someone willing to put a meeting on their calendar is a stronger proof point than a survey response.",
  mobileApp:
    "A mobile app is a significant build. Before committing to native development, a web-based prototype or simple landing page tests whether your target user will actually sign up — without months of development cost.",
  marketplace:
    "Marketplaces require supply and demand simultaneously, making them the hardest product type to launch cold. A single-sided page targeting either your supply side or demand side first lets you build one half of the market before you build the platform.",
  saas:
    "A demo or landing page for your SaaS tests whether your target customer understands the value proposition and takes action — before you build dashboards, accounts, or infrastructure. A clear description and a single CTA reveal whether the promise lands.",
  webApp:
    "A landing page with a specific promise and one call to action is your fastest proof that the right person is looking for what you are building. It costs almost nothing to set up and answers the most important question: will strangers take action on this?",
  leadFunnel:
    "A lead funnel or email list is the right first asset when your business depends on educating or nurturing buyers before they convert. It lets you test your message and build an audience before you invest in the product.",
  ecommerce:
    "A product page with a pre-order or waitlist option tests real purchase intent before you invest in inventory, fulfillment, or a full storefront. Someone entering their payment details is a stronger signal than any survey response.",
  broadIdea:
    "This idea has multiple broad outcomes — improve lives, make money, stay motivated, become successful — but no specific audience, urgent problem, or paid use case yet. A clarity test helps narrow the idea before building a platform.",
  allInOne:
    "This idea covers too many functions at once. A workflow clarity test identifies which single problem your target customer finds most painful before you invest in building the full platform.",
};

function fallbackAssetReason(assetKey: string): string {
  return (
    FALLBACK_ASSET_REASONS[assetKey] ??
    "A focused landing page with a single promise and one call to action is the fastest way to test whether strangers will take action on your idea — before you invest time and money building the product."
  );
}

/**
 * Returns true when an idea describes an all-in-one platform covering 4+ major
 * business function categories, or uses explicit "all-in-one" language.
 * Used to override the default "Web app" recommendation with "Workflow clarity test."
 */
export function hasAllInOnePlatformScope(idea: string): boolean {
  const text = idea.toLowerCase();
  if (/\ball.in.one\b|all in one|everything in one/.test(text)) return true;
  const functionSignals = [
    /\bmarketing\b/,
    /\bsales\b/,
    /\bbranding\b/,
    /\bwebsites?\b/,
    /\bcontent\b/,
    /\bcustomer management\b|\bcrm\b/,
    /\banalytics\b/,
    /\binvoicing\b/,
    /\bpayroll\b/,
    /\baccounting\b/,
    /\bproject management\b/,
    /\bhr\b|\bhuman resources\b/,
  ];
  return functionSignals.filter((r) => r.test(text)).length >= 4;
}

/**
 * Returns true when an idea contains multiple broad life-improvement outcomes
 * with no specific audience. Used to prevent "platform" in the idea text from
 * forcing a "Web app" asset recommendation when the idea is too vague to build.
 */
export function hasBroadUnclearOutcomes(idea: string, audience: string): boolean {
  const combined = (idea + " " + audience).toLowerCase();
  const broadPatterns = [
    /improve.{0,20}lives?/,
    /make money/,
    /stay motivated/,
    /become successful/,
    /be successful/,
    /achieve.{0,30}goals?/,
    /change.{0,20}(?:their\s+)?life/,
    /be happy/,
    /feel better/,
    /self.?improvement/,
    /personal development/,
    /financial freedom/,
  ];
  const matchCount = broadPatterns.filter((r) => r.test(combined)).length;
  const hasGenericAudience =
    audience.trim().length < 5 ||
    /\b(people|everyone|anyone|individuals|users)\b/.test(combined);
  return matchCount >= 2 && hasGenericAudience;
}

// Detect the most relevant mistake signal in the idea/audience text.
function fallbackMistake(idea: string, audience: string): string {
  const combined = (idea + " " + audience).toLowerCase();
  const audienceTrimmed = audience.trim();

  if (audienceTrimmed.length < 5) {
    // If the idea text itself names an industry or customer type, skip this warning
    const hasNamedCustomer = /\b(firm|firms|law firm|law firms|clinic|clinics|hospital|hospitals|agency|agencies|restaurant|restaurants|retailer|retailers|startup|startups|enterprise|enterprises|freelancer|founders?|operators?|practitioners?|studios?|gyms?|landlords?|property manager|small business|professionals?|homeowners?|entrepreneurs?|residents?|executives?|managers?|employees?|drivers?|contractors?|consumers?|business owners?|moms?|dads?|parents?|women|men|seniors?|students?|teens?|kids|children|coaches?|athletes?|nurses?|teachers?|doctors?)\b/.test(combined);
    if (!hasNamedCustomer) {
      return "You have not named a specific customer type. A vague target leads to a vague product. Before you build, write one sentence: 'I help [specific person] solve [specific problem]' — and make sure you can name a real person who fits that description.";
    }
  }

  if (/\beveryone\b|\banyone\b|\ball (businesses|people|users|companies)\b|\bany business\b|\bgeneral public\b/.test(combined)) {
    return "Targeting everyone means your message reaches no one with enough urgency to act. Pick one specific type of person with one urgent problem and build only for them first — you can expand after your first cohort pays consistently.";
  }

  if (/all.in.one|full platform|complete solution|everything in one|end.to.end|fully.featured|all the features/.test(combined)) {
    return "'All-in-one' is a scope warning at this stage. Your first version should solve exactly one problem for one customer type — not the full platform you will build later. Narrow the scope until it feels uncomfortably small, then ship.";
  }

  if (/\bboth\b.{1,30}\band\b|\bbuyers and sellers\b|\bconsumers and businesses\b|\bb2b and b2c\b|\bmultiple (types|segments|audiences)\b/.test(combined)) {
    return "Serving multiple customer types from the start blurs your focus and your message. Get one specific group to pay consistently before you think about a second customer type.";
  }

  if (!/pay|paid|price|pricing|charge|subscription|fee|revenue|monetize|cost|buy|purchase/.test(combined)) {
    return "There is no mention of how you get paid. Before you build, confirm your target customer will pay — even a casual 'would you pay $X for this?' conversation is more valuable than months of development without a revenue assumption.";
  }

  return "Most early-stage products fail because the founder confirmed interest but not willingness to pay. Find 3 people who match your target customer description and ask them to commit — even $1 — before investing significant time in the build.";
}

const ALL_IN_ONE_EARLY_STEPS: string[] = [
  "Choose one customer segment first — for example coaches, local service owners, freelancers, creators, or ecommerce sellers — not all entrepreneurs at once.",
  "Choose one workflow to solve first: lead capture, follow-up, content creation, sales tracking, website launch, or customer management — not all of them.",
  "Interview 5–10 people in that segment to confirm which single workflow causes the most pain right now.",
  "Build one simple workflow test or demo page for that one problem before adding any other platform features.",
];

const FALLBACK_STEPS: Record<StageGroup, string[]> = {
  early: [
    "Write one sentence naming your target customer, their specific problem, and why they have it right now — if you cannot write it in one sentence, the idea needs more narrowing first.",
    "Find 5 people who match that description and ask them to describe the problem in their own words. Do not pitch your solution yet — just listen for the words they use.",
    "Set up the simplest possible asset — a page, a form, or a booking link — and send it directly to those 5 people to see if any of them take action without being pushed.",
  ],
  mid: [
    "Identify the single step where your target customer stops engaging — that is the one thing to fix before building anything new.",
    "Pick one acquisition channel — direct outreach, one social platform, or one community — and go deep on it before adding a second channel.",
    "Test one specific offer with a real call to action — not a waitlist, but a payment or a scheduling commitment — and measure how many people follow through.",
  ],
  late: [
    "Map your current funnel from first contact to payment and find the one step with the biggest drop-off — that is your highest-leverage improvement.",
    "Collect at least 3 written or recorded testimonials from paying customers and place them on your main landing or product page.",
    "Build a follow-up sequence for leads who showed interest but did not convert — re-engaging warm leads is faster and cheaper than finding new ones.",
  ],
};

export function buildFallbackIdeaContext(
  idea: string,
  audience: string,
  stageKey: IdeaStageKey,
  assetKey: string
): IdeaContext {
  const group = stageGroup(stageKey);
  const isBroad =
    (assetKey === "webApp" || assetKey === "saas") &&
    hasBroadUnclearOutcomes(idea, audience);
  const isAllInOne =
    !isBroad &&
    (assetKey === "webApp" || assetKey === "saas") &&
    hasAllInOnePlatformScope(idea);
  const effectiveAssetKey = isBroad ? "broadIdea" : isAllInOne ? "allInOne" : assetKey;
  return {
    nicheLabel: null,
    audienceLabel: audience.trim().length >= 5 ? audience.trim() : "your target customers",
    useCaseLabel: "your core use case",
    customerActorLabel: "potential customer",
    actionTargetLabel: "solution",
    nicheMistake: fallbackMistake(idea, audience),
    nicheAssetReason: fallbackAssetReason(effectiveAssetKey),
    nicheSteps: isAllInOne && group === "early" ? ALL_IN_ONE_EARLY_STEPS : FALLBACK_STEPS[group],
  };
}
