import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
}

export function PageHeader({ title, breadcrumb = [] }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-navy text-white py-14 md:py-20">
      {/* Background image with fallback navy gradient & dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none"
        style={{
          backgroundImage: "url('/images/page-banner.webp'), linear-gradient(135deg, #00122B, #001B3D, #0A2347)",
        }}
        aria-hidden="true"
      />
      {/* Navy gradient wash overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative diagonal brand-gradient shape on the right */}
      <div
        className="absolute -right-20 -bottom-32 md:-bottom-24 w-72 md:w-96 h-72 md:h-96 rounded-3xl bg-brand-gradient opacity-35 blur-2xl transform rotate-45 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="hidden md:block absolute right-0 top-0 bottom-0 w-1/4 bg-brand-gradient opacity-15 skew-x-[-20deg] origin-top-right pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="container relative z-10">
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
              <li>
                <Link
                  to="/"
                  className="transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Home
                </Link>
              </li>
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                    <ChevronRight size={13} className="text-white/40" />
                    {item.href && !isLast ? (
                      <Link
                        to={item.href}
                        className="transition-colors hover:text-white hover:underline underline-offset-4"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-white font-medium" aria-current={isLast ? "page" : undefined}>
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          {title}
        </h1>
      </div>
    </div>
  );
}

