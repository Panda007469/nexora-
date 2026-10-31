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
    <div className="relative overflow-hidden bg-navy text-white min-h-[200px] md:min-h-[260px] flex flex-col justify-center py-10 md:py-14">
      {/* Background layer: page-banner.webp with navy gradient fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/page-banner.webp'), linear-gradient(135deg, #00122B, #001B3D, #0A2347)",
        }}
        aria-hidden="true"
      />

      {/* Navy overlay at 70% opacity */}
      <div
        className="absolute inset-0 bg-navy/70 pointer-events-none"
        aria-hidden="true"
      />

      {/* Large diagonal bg-brand-gradient shape on the right side (~35% width, partially transparent, clipped with polygon) */}
      <div
        className="absolute top-0 right-0 bottom-0 w-[45%] md:w-[35%] bg-brand-gradient opacity-30 pointer-events-none"
        style={{
          clipPath: "polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle secondary geometric glow for depth */}
      <div
        className="hidden md:block absolute top-0 right-0 bottom-0 w-[20%] bg-brand-gradient opacity-20 pointer-events-none"
        style={{
          clipPath: "polygon(55% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="container relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3 md:mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/80">
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
                    <ChevronRight size={13} className="text-white/40 shrink-0" />
                    {item.href && !isLast ? (
                      <Link
                        to={item.href}
                        className="transition-colors hover:text-white hover:underline underline-offset-4"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className="text-glow font-medium"
                        aria-current={isLast ? "page" : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          {title}
        </h1>
      </div>

      {/* Thin brand-gradient line along the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gradient z-20 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
