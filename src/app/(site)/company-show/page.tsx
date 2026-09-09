import { CompanyShowPage } from "@/components/CompanyShowPage";
import { COMPANY_SHOW } from "@/data/company-show";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "The Company Show | Done-For-You Business Podcast Jacksonville",
  description: `${COMPANY_SHOW.tagline} Hosted company video podcast for Northeast Florida businesses — one afternoon into a month of content. Founding spots open.`,
  path: "/company-show",
});

export default function CompanyShowRoute() {
  return <CompanyShowPage />;
}
