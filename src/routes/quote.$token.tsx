import { createFileRoute } from "@tanstack/react-router";
import { QuoteApproval } from "@/pages/QuoteApproval";

export const Route = createFileRoute("/quote/$token")({
  head: () => ({
    meta: [
      { title: "Project Quote | Nexora Technologies" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: CustomerQuoteRoute,
});

function CustomerQuoteRoute() {
  const { token } = Route.useParams();
  return <QuoteApproval token={token} />;
}
