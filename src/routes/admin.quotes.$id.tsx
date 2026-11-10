import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/components/nexora/shared";
import { QuoteEditor } from "@/pages/admin/QuoteEditor";

export const Route = createFileRoute("/admin/quotes/$id")({
  head: () =>
    meta("Quote Editor | Admin", "Draft, adjust pricing, and send client project quotes."),
  component: AdminQuoteEditorRoute,
});

function AdminQuoteEditorRoute() {
  const { id } = Route.useParams();
  return <QuoteEditor id={id} />;
}
