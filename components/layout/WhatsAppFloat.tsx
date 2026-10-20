import { MessageCircle } from "lucide-react";

export function WhatsAppFloat({ whatsapp }: { whatsapp: string }) {
  return (
    <aside aria-label="সাপোর্ট">
      <a
        href={`https://wa.me/${whatsapp}`}
        aria-label="হোয়াটসঅ্যাপে চ্যাট করুন"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-pill bg-whatsapp text-whatsapp-on shadow-pop sm:bottom-6"
      >
        <MessageCircle aria-hidden="true" className="h-6 w-6" />
      </a>
    </aside>
  );
}
