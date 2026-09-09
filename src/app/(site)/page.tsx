import { HomePage } from "@/components/HomePage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Recording Studio Jacksonville | Podcast Studio | JaxCity Studios",
  description:
    "JaxCity Studios in Jacksonville, Florida — music recording and podcast production. Engineered sessions $60/hr first-time, $50/hr returning. Affordable recording studio Jacksonville. Press Record.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
