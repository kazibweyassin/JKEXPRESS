"use client";

import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

type Props = {
  whatsapp?: string | null;
  companyName?: string;
};

export function WhatsAppFloat({
  whatsapp,
  companyName = "JK Express",
}: Props) {
  const href = whatsappLink(
    whatsapp,
    `Hello ${companyName}, I would like to inquire about your services.`,
  );

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/30 transition hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-7 w-7 fill-current" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
