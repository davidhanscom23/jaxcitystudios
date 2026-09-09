import { pageMeta } from "@/lib/seo";
import { AgreementLookupClient } from "@/components/agreement/AgreementLookupClient";

export const metadata = pageMeta({
  title: "Find Rental Agreement | JaxCity Studios",
  description: "Look up a saved JaxCity Studios electronic rental agreement by email.",
  path: "/agreement/lookup",
});

export default function AgreementLookupPage() {
  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[0.7rem] text-muted">Agreements</p>
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Find yours</h1>
      <p className="mt-4 max-w-xl text-paper-dim">
        Enter the email used on the rental agreement to reopen drafts or signed
        copies. You can update details anytime; signed agreements clear
        signatures and ask for a fresh e-sign after changes.
      </p>
      <div className="mt-10">
        <AgreementLookupClient />
      </div>
    </div>
  );
}
