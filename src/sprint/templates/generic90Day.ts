import type { SprintTemplate, SprintWeek } from "@/src/sprint/types";

export const GENERIC_90_DAY_WEEK_1: SprintWeek = {
  week: 1,
  goal: "Get clear on your idea and publish a simple page you can share.",
  tasks: [
    {
      taskId: "w1_t1",
      title: "Describe your idea and choose your business type",
      why: "So we can tailor your Launch Kit and Sprint to what you're building.",
      how: "Open Launch Kit -> Plan. Write a 1-2 sentence description of your idea, pick your business type, and choose your region.",
      module: "launch_kit.plan",
      ctaLabel: "Open Launch Kit",
    },
    {
      taskId: "w1_t2",
      title: "Define your ideal customer",
      why: "So your brand, page, and messages speak to the right people.",
      how: "In Launch Kit -> Plan, fill in who you want to help, where they are, and what problem they want solved.",
      module: "launch_kit.plan",
      ctaLabel: "Open Launch Kit",
    },
    {
      taskId: "w1_t3",
      title: "Choose your main offer and starting price",
      why: "You need something concrete to invite people to buy or join.",
      how: "In Launch Kit -> Offers, define one main offer and choose a realistic starting price.",
      module: "launch_kit.offers",
      ctaLabel: "Open Offers",
    },
    {
      taskId: "w1_t4",
      title: "Generate your Brand Kit",
      why: "So you stop overthinking branding and start showing up consistently.",
      how: "Open Brand Kit, generate name + tagline + colors, then pick one set to use for now.",
      module: "brand_kit",
      ctaLabel: "Open Brand Kit",
    },
    {
      taskId: "w1_t5",
      title: "Build your first page from a template",
      why: "You need a place to send people when they're interested.",
      how: "Open Website Builder, choose a template for your business type, use AI to fill a draft, then edit hero, offer, and CTA.",
      module: "website_builder",
      ctaLabel: "Open Website Builder",
    },
    {
      taskId: "w1_t6",
      title: "Publish your page (even on a subdomain)",
      why: "A real link makes your idea feel real to you and to others.",
      how: "In Website Builder, click Publish. Use a BizSproutAI subdomain if you don't have a domain yet.",
      module: "website_builder.publish",
      ctaLabel: "Publish my page",
    },
    {
      taskId: "w1_t8",
      title: "Set up your first micro-app (booking, request, or waitlist)",
      why: "A focused form gives people one clear action and captures real leads in your CRM.",
      how: "Open Website Builder, configure one micro-app title + offer + contact method, and add its link to your website CTA.",
      module: "website_builder",
      ctaLabel: "Configure micro-app",
    },
    {
      taskId: "w1_t9",
      title: "Test your micro-app by submitting it once yourself",
      why: "You verify the flow works before sending real people to it.",
      how: "Open your /book, /request, or /waitlist link, submit a test response, then confirm it appears in Micro-App Submissions and Contacts.",
      module: "micro_apps",
      ctaLabel: "Open submissions",
    },
    {
      taskId: "w1_t7",
      title: "Post once about what you're building",
      why: "Your first post starts the story and might bring your first curious leads.",
      how: "Open Social Media Agent, generate 3 post ideas, pick one, and publish it on your main channel.",
      module: "social_media_agent",
      ctaLabel: "Open Social Media Agent",
    },
    {
      taskId: "w1_t10",
      title: "Share your micro-app link with 5 people on WhatsApp",
      why: "Direct outreach is the fastest way to get your first qualified conversations.",
      how: "Copy your micro-app URL, send it to 5 ideal contacts, and log any replies in CRM.",
      module: "social_media_agent",
      ctaLabel: "Generate outreach copy",
    },
  ],
};

export const GENERIC_90_DAY_TEMPLATE: SprintTemplate = {
  sprintTemplateId: "generic_90_day",
  name: "90-Day Launch & First Sale Sprint",
  phases: [
    {
      id: "phase_1",
      title: "Clarity & Assets",
      daysLabel: "Days 1-30",
      milestones: [
        "Idea & customer defined",
        "Offer & price locked in",
        "Site/app live with lead capture + micro-app",
      ],
    },
    {
      id: "phase_2",
      title: "Launch & Leads",
      daysLabel: "Days 31-60",
      milestones: [
        "Primary channels selected",
        "Launch push executed with micro-app link sharing",
        "Lead capture + follow-up running",
      ],
    },
    {
      id: "phase_3",
      title: "Sales & Iteration",
      daysLabel: "Days 61-90",
      milestones: [
        "Direct sales push completed",
        "Offer refined from objections + lead feedback",
        "Next 90-day growth plan drafted",
      ],
    },
  ],
  weeks: [GENERIC_90_DAY_WEEK_1],
};
