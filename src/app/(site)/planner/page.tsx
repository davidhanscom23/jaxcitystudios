import { PlannerPage } from "@/components/PlannerPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Build Your Show | Podcast Episode Planner Jacksonville | JaxCity",
  description:
    "Plan your podcast episode timeline, room fit, studio hours, and running cost from JaxCity Studios’ published Jacksonville rates.",
  path: "/planner",
});

export default function Page() {
  return <PlannerPage />;
}
