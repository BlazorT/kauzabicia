// src/components/store/StoreInfo/components/StoreContacts.tsx
import { GlobeIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";

interface StoreContactsProps {
  webAddress?: string;
  whatsApp?: string;
  phone?: string;
}

export const StoreContacts = ({
  webAddress,
  whatsApp,
  phone,
}: StoreContactsProps) => {
  if (!webAddress && !whatsApp && !phone) return null;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-4">
        {webAddress && (
          <Link
            href={`${
              webAddress.startsWith("http")
                ? webAddress
                : `https://${webAddress}`
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          >
            <GlobeIcon className="w-4 h-4" />
            <span>{webAddress.replace(/^https?:\/\//, "")}</span>
          </Link>
        )}
        {whatsApp && (
          <Link
            href={`https://wa.me/${whatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          >
            <MessageCircleIcon className="w-4 h-4" />
            <span>WhatsApp</span>
          </Link>
        )}
        {phone && (
          <Link
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            <span>{phone}</span>
          </Link>
        )}
      </div>
    </div>
  );
};
