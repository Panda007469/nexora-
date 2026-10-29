import { createFileRoute } from "@tanstack/react-router";
import { services } from "@/data/site";
import { PageHeading, ServiceCard, meta } from "@/components/nexora/shared";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/services")({
  head: () =>
    meta(
      "Services",
      "Explore Nexora hardware projects, embedded systems, front-end development and student advice.",
    ),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHeader
        title="Our Services"
        breadcrumb={[{ label: "Services" }]}
      />
      <main className="container page-body">
        <PageHeading
          eyebrow="OUR EXPERTISE"
          title="Good ideas deserve great support."
          text="From your first circuit to your next website, let’s make something that works. Choose where you’d like to start."
        />
        <div className="service-page-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} full />
          ))}
        </div>
      </main>
    </>
  );
}
