export const metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900">Terms and conditions</h1>
      <p className="mt-4 text-slate-600">
        Use of the JK Express website and portals is subject to applicable Ugandan law.
        Property listings are indicative and subject to availability, verification and contract.
        Online inquiries do not create a binding agreement until confirmed in writing.
      </p>
      <p className="mt-4 text-slate-600">
        Portal users must keep credentials confidential and report unauthorised access promptly.
        We may suspend accounts that misuse the system or violate company policies.
      </p>
      <p className="mt-4 text-sm text-slate-400">Last updated: 2026</p>
    </div>
  );
}
