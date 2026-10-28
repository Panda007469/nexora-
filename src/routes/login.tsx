import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, meta } from "@/components/nexora/shared";
export const Route = createFileRoute("/login")({
  head: () => meta("Log in", "Nexora login preview. Account access is not connected yet."),
  component: Login,
});
function Login() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  return (
    <main className="login-wrap">
      <PageHeading
        eyebrow="WELCOME TO NEXORA"
        title="Good to see you."
        text="A little closer to your next great project."
      />
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            required
            placeholder="you@college.edu"
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={visible ? "text" : "password"}
              required
              placeholder="Your password"
              autoComplete="current-password"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>
        <Button type="submit" size="lg">
          Log in
          <ArrowRight />
        </Button>
        {submitted && (
          <p className="login-message" role="status">
            This is a login preview. Account access isn’t connected yet; no credentials were sent or
            saved.
          </p>
        )}
        <p className="form-note text-center">UI preview only. Accounts are not available yet.</p>
      </form>
    </main>
  );
}
