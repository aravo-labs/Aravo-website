"use client";

/**
 * The name and the mark, wherever they appear.
 *
 * Both come from the admin panel. They were three copies of a hard-coded
 * string and a drawn glyph - in the navigation, in the footer, in the docs
 * header - which meant renaming the company was a code change in three files,
 * and it had already been done twice.
 *
 * The bundled name is the fallback rather than the source: it renders while
 * the settings request is in flight, so the header does not start empty and
 * jump. An uploaded logo replaces the drawn mark; without one, the drawing is
 * what the site has always used and is still correct.
 */

import { Icons } from "@/components/art/Icons";
import { Wordmark } from "@/components/primitives";
import { site } from "@/content/site";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";

/** The company name, the logo, and the profiles the footer links to. */
export function useBrand() {
  const settings = useAsync(() => publicApi.siteSettings(), []);
  return {
    name: settings.data?.company_name || site.brand.name,
    logoUrl: settings.data?.icon_url ?? null,
    linkedinUrl: settings.data?.linkedin_url ?? null,
    xUrl: settings.data?.x_url ?? null,
  };
}

export function Brand({ size = 22, className = "" }: { size?: number; className?: string }) {
  const { name, logoUrl } = useBrand();

  return (
    <span className={`flex items-center gap-2.5 text-ink ${className}`}>
      {logoUrl ? (
        // An arbitrary uploaded URL, so a plain img rather than next/image and
        // its host allowlist. Contained rather than cropped: a logo trimmed to
        // fill a square is a logo somebody will ask to have put back.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="shrink-0 rounded-[3px] object-contain"
        />
      ) : (
        // The drawn mark carries no size of its own - it fills whatever box it
        // is given - so the box has to come from here, in the same units as
        // the uploaded logo's.
        <span style={{ width: size, height: size }} className="shrink-0">
          <Icons.logo className="size-full" />
        </span>
      )}
      <Wordmark name={name} />
    </span>
  );
}
