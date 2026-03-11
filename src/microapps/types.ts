export type MicroAppType = "consultation_booking" | "service_request" | "waitlist";

export type ContactStatus = "lead" | "interested" | "customer";

export type ContactChannel =
  | "micro_app_booking"
  | "micro_app_service_request"
  | "micro_app_waitlist";

export type ContactRecord = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  channel: ContactChannel;
  status: ContactStatus;
  notes: string;
  sourceMicroAppType: MicroAppType;
  createdAt: string;
  updatedAt: string;
};

export type MicroAppConfig = {
  id: string;
  type: MicroAppType;
  title: string;
  description: string;
  mainOffer: string;
  contactMethods: Array<"email" | "whatsapp" | "phone">;
  serviceOptions: string[];
  buttonLabel: string;
  thankYouMessage: string;
  nextStepNote?: string;
  urlPath: "/book" | "/request" | "/waitlist";
  enabled: boolean;
};

export type MicroAppSubmission = {
  id: string;
  microAppType: MicroAppType;
  microAppTitle: string;
  channel: ContactChannel;
  status: ContactStatus;
  submittedAt: string;
  name: string;
  email?: string;
  phone?: string;
  preferredDateTime?: string;
  helpRequest?: string;
  addressOrNeighborhood?: string;
  serviceType?: string;
  requestDescription?: string;
  profile?: string;
  qualificationAnswers?: string[];
};
