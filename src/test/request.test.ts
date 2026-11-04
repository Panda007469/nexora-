import { describe, it, expect } from "vitest";
import { requestSchema } from "@/data/request";
import { projects } from "@/data/projects";
import { team } from "@/data/site";

const valid = {
  customer_type: "Student",
  name: "Test Student",
  college: "Test College",
  email: "student@example.com",
  phone: "+91 98765 43210",
  service: "embedded",
  description: "Build a sensor prototype.",
  deadline: "2028-11-20",
};

describe("Nexora requirements", () => {
  it("accepts a complete request", () => expect(requestSchema.safeParse(valid).success).toBe(true));

  for (const field of [
    "customer_type",
    "name",
    "college",
    "email",
    "phone",
    "service",
    "description",
    "deadline",
  ] as const) {
    it(`requires ${field}`, () =>
      expect(requestSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false));
  }

  it("makes college optional when customer_type is not Student", () => {
    expect(
      requestSchema.safeParse({ ...valid, customer_type: "Startup", college: "" }).success,
    ).toBe(true);
    expect(
      requestSchema.safeParse({ ...valid, customer_type: "Business", college: "" }).success,
    ).toBe(true);
    expect(
      requestSchema.safeParse({ ...valid, customer_type: "Individual", college: "" }).success,
    ).toBe(true);
    expect(
      requestSchema.safeParse({ ...valid, customer_type: "Researcher", college: "" }).success,
    ).toBe(true);
    expect(requestSchema.safeParse({ ...valid, customer_type: "Other", college: "" }).success).toBe(
      true,
    );
  });

  it("rejects past deadline with correct message", () => {
    const res = requestSchema.safeParse({ ...valid, deadline: "2020-01-01" });
    expect(res.success).toBe(false);
    if (!res.success) {
      const issue = res.error.issues.find((i) => i.path[0] === "deadline");
      expect(issue?.message).toBe("Pick a date from today onward");
    }
  });

  it("rejects malformed emails", () =>
    expect(requestSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false));

  it("rejects unknown services", () =>
    expect(requestSchema.safeParse({ ...valid, service: "unknown" }).success).toBe(false));

  it("provides 12 placeholder projects", () => expect(projects).toHaveLength(12));
  it("provides 3 team members", () => expect(team).toHaveLength(3));
});
