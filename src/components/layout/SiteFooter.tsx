import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mail,
  Clock,
  MapPin,
  Send,
  Github,
  Linkedin,
  Twitter,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { navigation, contact, socialLinks, services, tagline } from "@/data/site";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
  };

  const getSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "github":
        return <Github size={16} />;
      case "linkedin":
        return <Linkedin size={16} />;
      case "twitter":
        return <Twitter size={16} />;
      default:
        return null;
    }
  };

  // Render tagline with "Innovation" in text-brand-gradient
  const renderTagline = () => {
    const parts = tagline.split("Innovation");
    return (
      <span>
        {parts[0]}
        <span className="text-brand-gradient font-bold">Innovation</span>
        {parts[1] ?? ""}
      </span>
    );
  };

  return (
    <footer className="bg-navy text-white/90 pt-16 pb-8 border-t border-white/10 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Full Logo & Brief Description */}
          <div className="flex flex-col items-start gap-4">
            <Link to="/" aria-label="Nexora home" className="inline-block">
              <Logo
                variant="full"
                className="h-10 sm:h-12 w-auto object-contain brightness-0 invert drop-shadow-md"
              />
            </Link>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-2 max-w-xs">
              Empowering engineers and innovators with cutting-edge Embedded IoT, VLSI, and modern software development.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                >
                  {getSocialIcon(social.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links & Services */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
              {navigation.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all"
                  >
                    <ArrowRight size={12} className="text-royal" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all"
                >
                  <ArrowRight size={12} className="text-royal" />
                  <span>FAQ</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all"
                >
                  <ArrowRight size={12} className="text-royal" />
                  <span>Contact</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/request"
                  className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all"
                >
                  <ArrowRight size={12} className="text-royal" />
                  <span>Request a Service</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter Subscription */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Stay Connected
            </h3>
            <p className="text-xs sm:text-sm text-white/70 mb-4 leading-relaxed">
              Subscribe for project updates, hardware engineering insights, and tech tutorials.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3 text-xs text-white">
                <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 border border-white/15 focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal pr-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Subscribe to newsletter"
                    className="absolute right-1 top-1 size-8 rounded bg-brand-gradient text-white hover:opacity-90 transition-opacity p-0"
                  >
                    <Send size={13} />
                  </Button>
                </div>
                <span className="text-[10px] text-white/50">
                  Browser-only preview. We respect your privacy.
                </span>
              </form>
            )}
          </div>

          {/* Column 4: Contact Information */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="text-glow shrink-0 mt-0.5" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="text-glow shrink-0 mt-0.5" />
                <span>{contact.workingHours}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-glow shrink-0 mt-0.5" />
                <span>{contact.city}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Tagline & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-white/60 text-center sm:text-left">
          <div className="font-heading text-sm tracking-wide text-white">
            {renderTagline()}
          </div>
          <div>
            © {new Date().getFullYear()} Nexora Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

