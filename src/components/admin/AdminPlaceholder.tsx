import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminPlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
  actionLabel?: string;
  actionTo?: "/admin" | "/admin/requests" | "/admin/messages";
}

export function AdminPlaceholder({
  title,
  description,
  icon: Icon,
  badgeText = "Coming Soon",
  actionLabel = "Go to Requests",
  actionTo = "/admin/requests",
}: AdminPlaceholderProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-5 border-b border-border">
        <div className="size-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-xs shrink-0">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
            <Badge
              variant="outline"
              className="text-[11px] font-semibold bg-royal/10 text-royal dark:text-glow border-royal/20"
            >
              {badgeText}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardContent className="py-16 px-6 text-center flex flex-col items-center">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <Icon className="size-7" />
          </div>
          <h2 className="font-heading font-bold text-lg text-foreground mb-1.5">
            {title} workspace is queued for a future phase
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            {description}
          </p>
          <Button asChild variant="outline" size="sm" className="rounded-xl border-border gap-1.5">
            <Link to={actionTo}>
              <span>{actionLabel}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
