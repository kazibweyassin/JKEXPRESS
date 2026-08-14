export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 prose prose-slate">
      <h1 className="text-3xl font-bold text-navy-900">Privacy policy</h1>
      <p className="mt-4 text-slate-600">
        JK Express collects personal information you provide through our website and portals
        (such as name, contact details and inquiry content) to respond to requests, manage
        tenancies, process property transactions and improve our services.
      </p>
      <p className="mt-4 text-slate-600">
        We do not sell personal data. Access to tenant, owner and employee records is restricted
        by role-based permissions. Contact us to request access or correction of your data.
      </p>
      <p className="mt-4 text-sm text-slate-400">Last updated: 2026</p>
    </div>
  );
}
