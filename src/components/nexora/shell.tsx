import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, MessageCircle, ArrowUpRight, Github, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "./shared";
import { navigation } from "@/data/site";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useLocation({ select: (location) => location.pathname });
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link to="/" aria-label="Nexora home" onClick={() => setOpen(false)}>
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "active" }}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Button asChild variant="ghost" className="login-link">
            <Link to="/login">
              Log in
              <ArrowUpRight size={14} />
            </Link>
          </Button>
          <Button asChild className="nav-request">
            <Link to="/request">
              Request a service
              <ArrowUpRight />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.to ? "page" : undefined}
            >
              {item.name}
            </Link>
          ))}
          <Link to="/request" onClick={() => setOpen(false)}>
            Request a service
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/login" onClick={() => setOpen(false)}>
            Log in
          </Link>
        </nav>
      )}
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link to="/">
            <Brand />
          </Link>
          <p>Built by students. Made for possibilities.</p>
        </div>
        <nav aria-label="Footer navigation">
          {navigation.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="socials">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Nexora GitHub (placeholder)"
          >
            <Github size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Nexora LinkedIn (placeholder)"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Nexora. All rights reserved.</span>
        <span>
          Student-led. Curiosity-driven.
          <span className="small-dot" />
        </span>
      </div>
    </footer>
  );
}
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
