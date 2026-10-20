import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-display font-bold text-primary">৪০৪</p>
      <h1 className="text-xl font-semibold">পেজটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-sm text-text-muted">আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে ফেলা হয়েছে।</p>
      <Link href="/">
        <Button size="lg">হোমে ফিরে যান</Button>
      </Link>
    </div>
  );
}
