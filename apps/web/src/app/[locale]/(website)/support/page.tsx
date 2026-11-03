import { SupportForm } from "@/website/components/support-form";
import { createPageMetadata } from "@/website/lib/metadata";

export const metadata = createPageMetadata({
  title: "Support",
  description:
    "Get help with AqarDesk. Contact our team for assistance with any questions or issues you may have.",
  path: "/support",
  og: { title: "Support", description: "We're here to help" },
});

export default function SupportPage() {
  return <SupportForm />;
}
