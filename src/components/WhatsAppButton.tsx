"use client";

/**
 * A way to start a conversation without filling in a form.
 *
 * The site's only other route to a human is the SDK access form, which asks
 * for a name, a company and a fleet size before anybody says anything. That is
 * the right shape for a qualified enquiry and the wrong shape for "does this
 * work on iOS", so this sits alongside it rather than replacing it.
 *
 * It renders only when a number is configured in the admin panel. A button
 * that opens a chat with nobody is worse than no button, and the number is
 * empty until somebody fills it in.
 *
 * Placed above the back-to-top button and offset from it, so the two do not
 * stack into an unexplained column of circles in the corner.
 */

import { publicApi } from "@/lib/api/public";
import { site } from "@/content/site";
import { useAsync } from "@/lib/useAsync";

export function WhatsAppButton() {
  const settings = useAsync(() => publicApi.siteSettings(), []);
  const number = settings.data?.whatsapp_number;

  if (!number) return null;

  const message = encodeURIComponent(
    `Hello ${settings.data?.company_name ?? site.brand.name}, I have a question about the SDK.`,
  );

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Message us on WhatsApp"
      className="fixed right-5 bottom-20 z-40 flex items-center gap-2.5 rounded-full bg-[#25d366] py-3 pr-5 pl-4 text-white shadow-[0_2px_14px_rgba(16,23,28,0.18)] transition-transform hover:-translate-y-0.5 sm:right-8 sm:bottom-24"
    >
      {/* WhatsApp's own mark. Recognised at a glance, which a generic speech
          bubble is not - and the colour is theirs, so the button says which
          application it opens without a label doing the work. */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.2 5.07 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23z" />
      </svg>
      <span className="text-[14px] font-medium">WhatsApp</span>
    </a>
  );
}
