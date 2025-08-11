import { redirect, notFound } from "next/navigation";

type Props = {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function PlaySlugPage({ params, searchParams }: Props) {
  const { slug } = params;

  // Temporary mapping: send duo to the existing /duo page
  if (slug === "duo") {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams ?? {})) {
      if (typeof v === "string") sp.set(k, v);
    }
    redirect(`/duo${sp.size ? `?${sp.toString()}` : ""}`);
  }

  // Unknown game
  notFound();
}
