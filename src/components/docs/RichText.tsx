/**
 * Formatted copy written in the admin panel.
 *
 * The body arrives as HTML because that is what the editor produces, and it is
 * cleaned by the API on write - `app/core/richtext.py` - against an allowlist
 * that is the shape of the editor's toolbar and nothing more. No script, no
 * style, no iframe, no img, no event handlers, no `javascript:` or `data:`
 * hrefs, and the only classes that survive are the four size steps below.
 *
 * That is why `dangerouslySetInnerHTML` is defensible here and would not be
 * for anything arriving from a form on the public site. The rule is that the
 * boundary is on write: what is in the column is already safe, so every reader
 * of it - this page, an export, a future client - is safe without each having
 * to remember to sanitise.
 *
 * Styling is done with descendant selectors on a wrapper rather than a prose
 * plugin, so the output sits in this site's palette instead of a library's
 * defaults, and code blocks - the part of an SDK doc anyone actually reads -
 * keep the attention they had.
 */

export function RichText({ html, className = "" }: { html: string; className?: string }) {
  if (!html?.trim()) return null;

  return (
    <div
      className={`rich-text ${className}`}
      // Safe by construction: see the note above.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
