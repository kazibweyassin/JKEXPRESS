import Link from "next/link";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_PROFILE_HREF } from "@/lib/trust";

export function ProfileCta() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" asChild>
        <a href={COMPANY_PROFILE_HREF} download>
          <FileDown className="h-4 w-4" />
          Download company profile
        </a>
      </Button>
      <Button variant="accent" asChild>
        <Link href="/contact">Talk to our team</Link>
      </Button>
    </div>
  );
}
