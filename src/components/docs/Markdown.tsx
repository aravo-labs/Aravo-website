"use client";

/**
 * Markdown rendering for the SDK docs.
 *
 * The elements are styled explicitly rather than through a prose plugin, so
 * the output sits in the marketing palette instead of a library's defaults,
 * and so code blocks - the part of an SDK doc anyone actually reads - get real
 * attention.
 *
 * The body comes from the admin panel, which only authenticated administrators
 * can write to, and `react-markdown` does not render raw HTML unless a plugin
 * is added to allow it. No such plugin is added here, so an author cannot
 * inject markup into the public page.
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => (
          <h2
            className="mt-10 mb-4 text-[28px] leading-[1.25] font-normal tracking-[-0.01em] text-[var(--color-ink)] first:mt-0"
            {...props}
          />
        ),
        h2: (props) => (
          <h3
            className="mt-10 mb-3 text-[22px] leading-[1.3] font-normal text-[var(--color-ink)] first:mt-0"
            {...props}
          />
        ),
        h3: (props) => (
          <h4
            className="mt-8 mb-2 text-[17px] font-medium text-[var(--color-ink)]"
            {...props}
          />
        ),
        p: (props) => (
          <p
            className="mb-4 text-[16px] leading-[1.7] text-[var(--color-muted)]"
            {...props}
          />
        ),
        a: (props) => (
          <a
            className="text-[var(--color-accent)] underline underline-offset-2 hover:no-underline"
            target={props.href?.startsWith("http") ? "_blank" : undefined}
            rel={props.href?.startsWith("http") ? "noreferrer" : undefined}
            {...props}
          />
        ),
        ul: (props) => (
          <ul className="mb-4 flex list-none flex-col gap-2 pl-0" {...props} />
        ),
        ol: (props) => (
          <ol className="mb-4 flex list-decimal flex-col gap-2 pl-5" {...props} />
        ),
        li: (props) => (
          <li
            className="text-[16px] leading-[1.6] text-[var(--color-muted)] marker:text-[var(--color-accent)]"
            {...props}
          />
        ),
        strong: (props) => (
          <strong className="font-medium text-[var(--color-ink)]" {...props} />
        ),
        blockquote: (props) => (
          <blockquote
            className="mb-4 border-l-2 border-[var(--color-accent)] pl-4 text-[16px] text-[var(--color-muted)] italic"
            {...props}
          />
        ),
        hr: () => <hr className="my-8 border-[var(--color-rule)]" />,
        code: ({ className, children, ...rest }) => {
          // react-markdown gives inline code no language class; fenced blocks
          // arrive wrapped in <pre>, which is styled below.
          const isBlock = /language-/.test(className ?? "");
          if (isBlock) {
            return (
              <code className={`${className ?? ""} font-mono text-[13px]`} {...rest}>
                {children}
              </code>
            );
          }
          return (
            <code
              className="rounded bg-[var(--color-accent-soft)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--color-accent)]"
              {...rest}
            >
              {children}
            </code>
          );
        },
        pre: (props) => (
          <pre
            className="mb-5 overflow-x-auto rounded-lg border border-[#1f2937] bg-[#111827] px-4 py-4 leading-[1.7] text-[#e5e7eb]"
            {...props}
          />
        ),
        table: (props) => (
          // Wide tables scroll inside their own box rather than pushing the page.
          <div className="mb-5 overflow-x-auto rounded-lg border border-[var(--color-rule)]">
            <table className="w-full border-collapse text-left" {...props} />
          </div>
        ),
        th: (props) => (
          <th
            className="border-b border-[var(--color-rule)] px-4 py-2.5 font-mono text-[11px] font-normal tracking-[0.06em] text-[var(--color-muted)] uppercase"
            {...props}
          />
        ),
        td: (props) => (
          <td
            className="border-b border-[var(--color-rule)] px-4 py-2.5 text-[15px] text-[var(--color-muted)] last:border-b-0"
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
