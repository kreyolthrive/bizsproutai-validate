import { describe, expect, it } from "vitest";
import { classifyCategory, hasVerticalSaasSignals } from "../src/validation/engine/classifyCategory";

describe("Vertical SaaS Detection", () => {
  describe("hasVerticalSaasSignals", () => {
    it("detects booking app for barber as vertical SaaS", () => {
      const idea = "Build a simple appointment booking app for a barber with time slots, basic client info, and appointment confirmation screen.";
      expect(hasVerticalSaasSignals(idea)).toBe(true);
    });

    it("detects scheduling software for salon as vertical SaaS", () => {
      const idea = "Create a scheduling software for salons that handles appointments and client management.";
      expect(hasVerticalSaasSignals(idea)).toBe(true);
    });

    it("detects booking platform for dentists as vertical SaaS", () => {
      const idea = "Build a booking platform for dentists with time slots and patient management.";
      expect(hasVerticalSaasSignals(idea)).toBe(true);
    });

    it("does NOT detect actual local service business as vertical SaaS", () => {
      const idea = "I want to start a barbershop in downtown with modern styling services.";
      expect(hasVerticalSaasSignals(idea)).toBe(false);
    });

    it("does NOT detect wellness studio as vertical SaaS", () => {
      const idea = "Open a yoga studio offering classes, memberships, and drop-in sessions.";
      expect(hasVerticalSaasSignals(idea)).toBe(false);
    });
  });

  describe("classifyCategory", () => {
    it("classifies booking app for barber as SaaS, not local_service", () => {
      const idea = "Build a simple appointment booking app for a barber with time slots, basic client info, and appointment confirmation screen.";
      const result = classifyCategory({ idea });
      
      expect(result.category).toBe("saas");
      expect(result.confidence).toBeGreaterThan(0.8);
      // Evidence should mention it's a software product for local service operators
      expect(result.evidence.length).toBeGreaterThan(0);
    });

    it("classifies actual barbershop business as local_service", () => {
      const idea = "I want to start a barbershop in downtown with modern styling services and great customer experience.";
      const result = classifyCategory({ idea });
      
      expect(result.category).toBe("local_service");
    });

    it("classifies scheduling software for clinics as SaaS", () => {
      const idea = "Develop a patient scheduling software for medical clinics with appointment reminders and calendar sync.";
      const result = classifyCategory({ idea });
      
      expect(result.category).toBe("saas");
    });
  });
});
