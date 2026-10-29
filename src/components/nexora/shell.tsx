import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Menu,
  X,
  MessageCircle,
  ArrowRight,
  Mail,
  Clock,
  Phone,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "./shared";
import { navigation, contact, socialLinks } from "@/data/site";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/layout/Logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useLocation({ select: (location) => location.pathname });

  const getSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "github":
        return <Github size={13} />;
      case "linkedin":
        return <Linkedin size={13} />;
      case "twitter":
        return <Twitter size={13} />;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* Top Bar: thin navy banner above navbar, hidden below md */}
      <div className="hidden bg-navy text-white text-xs py-1.5 px-4 md:block border-b border-white/10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-6 text-[11px] text-white/80">
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail size={13} className="text-glow" />
              <span>{contact.email}</span>
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} className="text-glow" />
              <span>{contact.workingHours}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                className="text-white/70 hover:text-white transition-colors"
              >
                {getSocialIcon(social.icon)}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border transition-colors">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Left: Navy logo block holding <Logo variant="mark" /> */}
          <Link
            to="/"
            aria-label="Nexora home"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-navy shadow-inner transition-transform group-hover:scale-105">
              <Logo variant="mark" className="size-6 object-contain" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              Nexora<span className="text-royal">.</span>
            </span>
          </Link>

          {/* Middle: Desktop navigation links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-foreground font-semibold after:scale-x-100" }}
                className="relative py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-brand-gradient after:transition-transform after:duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right: ThemeToggle, round bg-brand-gradient contact/call button, hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <Button
              asChild
              className="size-10 rounded-full p-0 bg-brand-gradient text-white shadow-md hover:opacity-90 transition-opacity"
            >
              <Link to="/request" aria-label="Contact / Request a service">
                <Phone className="size-4" />
              </Link>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden text-foreground hover:bg-muted"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {open && (
        <nav
          className="md:hidden border-b border-border bg-background px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-200"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-3">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.to ? "page" : undefined}
                className={`py-2 text-base font-medium transition-colors ${
                  pathname === item.to
                    ? "text-brand-gradient font-semibold"
                    : "text-foreground hover:text-royal"
                }`}
              >
                {item.name}
              </Link>
            ))}

            <Link
              to="/request"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-between rounded-md bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-xs"
            >
              <span>Request a service</span>
              <ArrowRight size={16} />
            </Link>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">Switch Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

// Re-export the restyled 4-column footer
export { SiteFooter } from "@/components/layout/SiteFooter";

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <section className="chat-panel" role="dialog" aria-label="Nexora chat">
          <header>
            <div>
              <strong>Nexora chat</strong>
              <span>Not connected yet</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X />
            </Button>
          </header>
          <div className="chat-empty">
            <MessageCircle size={33} />
            <h3>A conversation starts here.</h3>
            <p>Chat is coming soon.</p>
          </div>
          <Link to="/request" onClick={() => setOpen(false)} className="chat-request">
            Request a service instead
            <ArrowRight size={16} />
          </Link>
        </section>
      )}
      <Button
        className="chat-toggle"
        size="icon"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <MessageCircle />}
        {!open && <span className="chat-status" />}
      </Button>
    </>
  );
}
