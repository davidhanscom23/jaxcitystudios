import { pageMeta } from "@/lib/seo";
import { AgreementEditor } from "@/components/agreement/AgreementEditor";

export const metadata = pageMeta({
  title: "Sign Rental Agreement | JaxCity Studios",
  description: "View, update, and electronically sign your JaxCity Studios rental agreement.",
  path: "/agreement",
});

export default async function AgreementDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { id } = await params;
  const { code = "" } = await searchParams;

  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[18px] text-muted">Agreement</p>
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Review & sign</h1>
      <div className="mt-10">
        <AgreementEditor id={id} initialCode={code} />
      </div>
    </div>
  );
}
