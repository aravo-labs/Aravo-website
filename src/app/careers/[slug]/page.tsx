import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RolePage } from "@/components/careers/RolePage";
import { publicApi } from "@/lib/api/public";

/**
 * One role, at its own address.
 *
 * The careers page shows roles in a client-side list, which is right for
 * browsing and wrong for everything else: a role could not be linked to, sent
 * to a candidate, or posted anywhere, and search engines saw one page with no
 * roles on it.
 *
 * Rendered on the server so the description is in the HTML, with the metadata
 * a shared link needs.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const job = await publicApi.job(slug);
    return {
      title: `${job.title} — Aravo`,
      description: `${job.title}, ${job.location}. ${job.employment_type}.`,
    };
  } catch {
    return { title: "Role not found — Aravo" };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetched outside the JSX. React renders lazily, so a component constructed
  // inside a try block would throw after the block has already exited and the
  // catch would never see it.
  const job = await publicApi.job(slug).catch(() => null);

  // Unpublished, renamed, or never existed. All of them are "not here".
  if (!job) notFound();

  return <RolePage job={job} />;
}
