import { SERVICES, getService } from "@/data/services";
import { pageMeta } from "@/lib/seo";
import { ServiceDetail } from "@/components/ServiceDetail";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return pageMeta({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/lineup/${service.slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return <ServiceDetail service={service} />;
}
