import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ArrowUpRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services, steps } from "@/data/site";
import { requestSchema } from "@/data/request";
import { PageHeading, meta } from "@/components/nexora/shared";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/request")({
  validateSearch: (search: Record<string, unknown>): { service?: string | undefined } => ({
    service: typeof search["service"] === "string" ? search["service"] : undefined,
  }),
  head: () =>
    meta("Request a service", "Tell Nexora about your student project and the support you need."),
  component: Request,
});

function Request() {
  const search = Route.useSearch();
  const [values, setValues] = useState({
    name: "",
    college: "",
    email: "",
    service: search.service ?? "",
    description: "",
    deadline: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("success"), 450);
    return () => clearTimeout(timer);
  }, [status]);
  function update(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = requestSchema.safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        next[String(issue.path[0])] = issue.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("loading");
  }
  return (
    <>
      <PageHeader
        title="Request a Service"
        breadcrumb={[{ label: "Request" }]}
      />
      <main className="container page-body">
        <PageHeading
          eyebrow="LET’S MAKE IT HAPPEN"
          title="Tell us what you have in mind."
          text="A big idea, a small prototype, or just a little guidance. Your next step starts with a conversation."
        />
        <div className="form-layout">
          <div>
            {status === "success" ? (
              <section className="success-panel" role="status">
                <CheckCircle2 size={45} />
                <h2>You’re all set, {values.name.split(" ")[0]}.</h2>
                <p>
                  Your sample request passed validation.
                  <br />
                  This is a preview — nothing has been saved or sent.
                </p>
                <Button
                  onClick={() => {
                    setStatus("idle");
                    setValues({
                      name: "",
                      college: "",
                      email: "",
                      service: "",
                      description: "",
                      deadline: "",
                    });
                  }}
                >
                  Create another request
                </Button>
              </section>
            ) : (
              <form className="request-form" noValidate onSubmit={submit}>
                {(["name", "college", "email"] as const).map((key) => (
                  <div className={`field ${key === "email" ? "field-wide" : ""}`} key={key}>
                    <label htmlFor={key}>
                      {key === "name"
                        ? "Full name"
                        : key === "college"
                          ? "College / University"
                          : "Email address"}{" "}
                      <span>*</span>
                    </label>
                    <input
                      id={key}
                      type={key === "email" ? "email" : "text"}
                      autoComplete={
                        key === "name" ? "name" : key === "email" ? "email" : "organization"
                      }
                      value={values[key]}
                      placeholder={
                        key === "name"
                          ? "Your full name"
                          : key === "college"
                            ? "Where do you study?"
                            : "you@college.edu"
                      }
                      aria-invalid={!!errors[key]}
                      aria-describedby={errors[key] ? `${key}-error` : undefined}
                      onChange={(e) => update(key, e.target.value)}
                    />
                    {errors[key] && (
                      <span id={`${key}-error`} className="field-error">
                        {errors[key]}
                      </span>
                    )}
                  </div>
                ))}
                <div className="field">
                  <label htmlFor="service">
                    Service type <span>*</span>
                  </label>
                  <select
                    id="service"
                    value={values.service}
                    onChange={(e) => update("service", e.target.value)}
                    aria-invalid={!!errors["service"]}
                    aria-describedby="service-error"
                  >
                    <option value="">Choose a service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {errors["service"] && (
                    <span id="service-error" className="field-error">
                      {errors["service"]}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="deadline">
                    Target completion <span>*</span>
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    value={values.deadline}
                    aria-invalid={!!errors["deadline"]}
                    aria-describedby={errors["deadline"] ? "deadline-error" : undefined}
                    onChange={(e) => update("deadline", e.target.value)}
                  />
                  {errors["deadline"] && (
                    <span id="deadline-error" className="field-error">
                      {errors["deadline"]}
                    </span>
                  )}
                </div>
                <div className="field field-wide">
                  <label htmlFor="description">
                    Project brief <span>*</span>
                  </label>
                  <textarea
                    id="description"
                    value={values.description}
                    placeholder="Tell us what you're building, what components you have, and where you need help."
                    aria-invalid={!!errors["description"]}
                    aria-describedby={errors["description"] ? "description-error" : undefined}
                    onChange={(e) => update("description", e.target.value)}
                  />
                  {errors["description"] && (
                    <span id="description-error" className="field-error">
                      {errors["description"]}
                    </span>
                  )}
                </div>
                <div className="form-actions">
                  <Button type="submit" size="lg" disabled={status === "loading"}>
                    {status === "loading" ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        Validating request...
                      </>
                    ) : (
                      <>
                        Submit request preview
                        <ArrowUpRight />
                      </>
                    )}
                  </Button>
                  <p className="form-note mt-3">Preview only. No request will be saved or sent.</p>
                </div>
              </form>
            )}
          </div>
          <aside className="request-aside">
            <h3>What happens next?</h3>
            {steps.map((step, i) => (
              <div className="step" key={step.label}>
                <span className="step-number">0{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
            <p className="placeholder-note">This form is a demo. We’re not receiving requests yet.</p>
          </aside>
        </div>
      </main>
    </>
  );
}
