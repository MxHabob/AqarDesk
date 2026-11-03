import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About",
  description:
    "About AqarDesk. Learn more about the team and company behind the property management platform.",
  path: "/about",
  og: {
    title: "About AqarDesk",
    description: "The team behind your business stack",
  },
});

export default function AboutPage() {
  return <div>AboutPage</div>;
}
