import { connection } from "next/server";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { StickyCtaBar } from "@/components/layout/sticky-cta-bar";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { JsonLd } from "@/components/seo/json-ld";
import { getCompanySettings } from "@/lib/company";
import { organizationJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const company = await getCompanySettings();

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <PublicHeader companyName={company.companyName} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <PublicFooter
        companyName={company.companyName}
        email={company.email ?? undefined}
        phone={company.phone ?? undefined}
        address={
          [company.address, company.city, company.country]
            .filter(Boolean)
            .join(", ") || undefined
        }
      />
      <StickyCtaBar />
      <WhatsAppFloat
        whatsapp={company.whatsapp ?? company.phone}
        companyName={company.companyName}
      />
    </>
  );
}
