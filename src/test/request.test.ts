import { describe, it, expect } from "vitest";
import { requestSchema } from "@/data/request";
import { projects } from "@/data/projects";
import { team } from "@/data/site";
const valid = {
  name: "Test Student",
  college: "Test College",
  email: "student@example.com",
  service: "hardware",
  description: "Build a sensor prototype.",
  deadline: "2026-11-20",
};
describe("Nexora requirements", () => {
  it("accepts a complete request", () => expect(requestSchema.safeParse(valid).success).toBe(true));
  for (const field of ["name", "college", "email", "service", "description", "deadline"] as const) {
    it(`requires ${field}`, () =>
      expect(requestSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false));
  }
  it("rejects malformed emails", () =>
    expect(requestSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false));
  it("rejects unknown services", () =>
    expect(requestSchema.safeParse({ ...valid, service: "unknown" }).success).toBe(false));
  it("provides 12 placeholder projects", () => expect(projects).toHaveLength(12));
  it("provides 3 team members", () => expect(team).toHaveLength(3));
});
