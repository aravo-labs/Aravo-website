"use client";

import { Eyebrow, Shell } from "@/components/primitives";
import { RequestAccessForm, SDK_COPY } from "@/components/sdk/RequestAccessForm";
import { Closing } from "@/components/sections/Closing";
import { Nav } from "@/components/sections/Nav";

/** What a request gets you, so the form is not the whole page. */
const WHAT_HAPPENS = [
  {
    label: "Integration keys",
    body: "Sandbox credentials to build against, with no commitment and no contract first.",
  },
  {
    label: "A test environment",
    body: "Replay real delivery traces against your own build before any driver sees it.",
  },
  {
    label: "An engineer to talk to",
    body: "Someone who has done the integration, not a form that ends in a sales sequence.",
  },
];

export default function SdkAccessPage() {
  return (
    <main className="theme-marketing w-full">
      <Nav />

      <Shell>
        <div className="flex flex-col gap-5 px-6 pt-14 pb-10 sm:px-10 lg:pt-20">
          <Eyebrow>{SDK_COPY.eyebrow}</Eyebrow>
          <h1 className="text-[2rem] leading-[1.2] font-normal tracking-[-0.01em] text-[var(--color-accent)] sm:text-[2.5rem]">
            {SDK_COPY.title}
          </h1>
          <p className="max-w-[62ch] text-[16px] leading-[1.65] text-[var(--color-muted)]">
            {SDK_COPY.intro}
          </p>
        </div>

        <div className="grid border-t border-[var(--color-rule)] lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* min-w-0: a grid item will not shrink below its content otherwise,
              which pushes the whole page sideways on a narrow screen. */}
          <div className="min-w-0 px-6 py-10 sm:px-10">
            <RequestAccessForm />
          </div>

          <aside className="min-w-0 border-t border-[var(--color-rule)] px-6 py-10 sm:px-10 lg:border-t-0 lg:border-l">
            <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
              What happens next
            </p>
            <ul className="mt-5 flex flex-col gap-6">
              {WHAT_HAPPENS.map((item) => (
                <li key={item.label}>
                  <p className="text-[15px] text-[var(--color-ink)]">{item.label}</p>
                  <p className="mt-1 text-[14px] leading-[1.6] text-[var(--color-muted)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Shell>

      <Closing />
    </main>
  );
}
