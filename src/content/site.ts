/**
 * Every string on the landing page lives here.
 * Swap these values to rebrand the whole page — no component edits needed.
 *
 * -------------------------------------------------------------------------
 * PROVENANCE — read before editing.
 *
 * This file was rewritten from scratch. The previous version was, almost
 * word for word, the marketing copy of another company's website — the same
 * headlines, the same four feature cards, the same FAQ, the same footer
 * tagline. Some of the claims in it had already been removed for being untrue
 * of this company ("$8M seed round", "$10B+ lost to fraud", "48% of fraud
 * comes from false refund claims", "trusted by", "backed by leading
 * investors"), but the surrounding copy was left in place.
 *
 * Everything below is written only from what the SDK demonstrably does, per
 * the API contract and the SDK documentation: it detects parking, building
 * entry, floor ascent and drop-off from the driver’s phone, and reports each
 * with a confidence score.
 *
 * The rules that keep it that way:
 *   - No market-size or fraud statistics. They need a citation to name.
 *   - No funding, customer, or "trusted by" claims.
 *   - No performance number that is not measured.
 *   - Nothing that describes a capability the SDK does not have.
 *
 * If a claim cannot be pointed at something real, it does not go on the page.
 * -------------------------------------------------------------------------
 */

export const site = {
  meta: {
    title: "Aravo — delivery tracking for the last hundred metres",
    description:
      "GPS stops at the kerb. Aravo detects parking, building entry, floor ascent and drop-off from the driver’s phone, so you know which floor and which door.",
  },

  brand: {
    name: "Aravo",
    /* The name here is the fallback the page renders while the settings
       request is in flight, and the one it keeps if that request fails. The
       live name is set in the admin panel, which is where it belongs: it has
       been changed twice already, and each time it was a code change.

       The domain is unchanged. The company is Aravo, the site it is served
       from is still getinsideroute.com, and the two are allowed to differ
       until a new domain exists. */
    domain: "getinsideroute.com",
  },

  nav: {
    links: [
      { label: "How it works", href: "/#problem" },
      { label: "SDK docs", href: "/docs" },
      { label: "Team", href: "/team" },
      { label: "Careers", href: "/careers" },
    ],
    cta: { label: "Contact us", href: "/sdk-access" },
  },

  /* No default text. Anything here is a public factual claim, so it belongs to
     whoever can verify it: publish an announcement banner from the admin panel
     and the bar appears. Leave this null and it does not render. */
  announcement: {
    text: null,
    linkLabel: null,
    href: null,
  },

  /* ---------------------------------------------------------------------
     KERB — the hero. Where GPS stops.
     --------------------------------------------------------------------- */
  hero: {
    level: "KERB",
    elevation: "0 m",
    headline: {
      lead: "GPS stops",
      accent: "at the kerb.",
      rest: "The delivery doesn’t.",
    },
    body: "The last hundred metres of a delivery goes upward — through a door, up a stairwell, along a corridor. Aravo detects that part from the driver’s phone, and tells you which floor and which door.",
    primary: { label: "Request SDK access", href: "/sdk-access" },
    /* Straight to LEVEL 02, the delivery console. The two calls to action
       above are for someone who has decided; this is for someone who has not
       and wants to see the thing first. */
    tertiary: { label: "View dashboard", href: "/#dashboard" },
    secondary: { label: "Read the docs", href: "/docs" },
    scrollHint: "Scroll to climb",
    /* Plain-language callouts pinned to the drawing.

       The section drawing was accurate and unreadable: it assumed the reader
       already knew why indoor delivery is hard, which is the one thing the top
       of the page cannot assume. These name what is happening at each point in
       ordinary words, so the picture explains itself rather than needing the
       paragraph beside it. */
    callouts: [
      { id: "car", at: "kerb", title: "Driver parks", body: "GPS is accurate here. This is the last point it is." },
      { id: "door", at: "entrance", title: "Goes inside", body: "The satellite fix is lost at the threshold." },
      { id: "stairs", at: "stair", title: "Climbs 3 floors", body: "The phone knows: pressure change, step cadence." },
      { id: "package", at: "door", title: "Delivers to 4A", body: "Right floor, right door, on the record." },
    ],

    /* Signal strength at each level of the drawing, 0-4. The decay is the
       point of the illustration, so it is data rather than decoration. */
    signal: [
      { level: "KERB", bars: 4 },
      { level: "LOBBY", bars: 2 },
      { level: "STAIR", bars: 1 },
      { level: "DOOR", bars: 0 },
    ],
  },

  /* ---------------------------------------------------------------------
     GROUND — the gap. Why the last hundred metres fails.
     --------------------------------------------------------------------- */
  gap: {
    level: "GROUND",
    eyebrow: "The gap",
    heading: { lead: "A rooftop fix and a photo of", accent: "a door." },
    lede: "That is everything most delivery stacks know about the moment a package changed hands. It is not enough to settle a dispute, and it is not enough to improve a route.",
    items: [
      {
        code: "01",
        title: "A satellite fix cannot see through a floor slab",
        body: "Indoors, a position comes from whatever the phone can still reach — and the answer drifts to the middle of the building, or to the street it last saw. The reading is not wrong so much as it is about the wrong place.",
      },
      {
        code: "02",
        title: "A photo of a door names no door",
        body: "Proof of delivery shows a threshold. It does not carry which unit, which floor, or whether the corridor it was taken in belongs to the right address.",
      },
      {
        code: "03",
        title: "Disputes are settled without the middle of the story",
        body: "The trip is recorded up to the kerb and after the drop-off. The part everyone actually disagrees about is the part with no data in it.",
      },
    ],
    /* The illustration alongside: the divergence between a satellite fix and
       where the package went. Labels only — no invented distances. */
    figure: {
      caption: "What GPS detected against the actual dropoff point",
      fixLabel: "What GPS detected",
      actualLabel: "Actual dropoff point",
      note: "Same address. Different floor, different door.",
    },
  },

  /* ---------------------------------------------------------------------
     LEVEL 01 — the sequence. What the SDK detects.
     --------------------------------------------------------------------- */
  sequence: {
    level: "LEVEL 01",
    eyebrow: "The sequence",
    heading: { lead: "Four events, in", accent: "the order they happen." },
    lede: "Each one is detected from sensors the driver’s phone already has. Nothing is scanned, nothing is tapped, and the driver delivers exactly as they did before.",
    /* These four are the SDK's actual event names, in order. */
    events: [
      {
        id: "parked",
        event: "parked",
        title: "The vehicle stops",
        body: "Motion and speed decay separate a delivery stop from a traffic light, so the clock starts where the walk starts.",
        detected: "Motion + speed decay",
        icon: "car",
      },
      {
        id: "entered",
        event: "entered_building",
        title: "The driver goes inside",
        body: "A pressure step at the threshold, together with the loss of a clean satellite fix, marks the door — the moment every other system stops recording.",
        detected: "Barometric step + signal loss",
        icon: "door",
      },
      {
        id: "ascended",
        event: "ascended",
        title: "The floors go by",
        body: "Air pressure falls measurably per storey. That difference is the floor count, and it works in a stairwell and a lift alike.",
        detected: "Pressure differential",
        icon: "stairs",
      },
      {
        id: "dropped",
        event: "dropped_off",
        title: "The package changes hands",
        body: "Dwell time and device pose mark the hand-off, at the floor and the door it actually happened on.",
        detected: "Dwell + device pose",
        icon: "package",
      },
    ],
    footnote:
      "Every event carries a confidence score. Readings the SDK is unsure of are reported as unsure rather than quietly rounded up.",
  },

  /* ---------------------------------------------------------------------
     LEVEL 02 — the evidence. What you get back.
     --------------------------------------------------------------------- */
  evidence: {
    level: "LEVEL 02",
    eyebrow: "The record",
    heading: { lead: "One delivery,", accent: "end to end." },
    lede: "The same four events, arriving as a timeline your support team can read and a payload your systems can act on.",
    /* Illustrative record. Marked as such on the page — this is a sample
       shape, not a customer's delivery. */
    sample: {
      label: "Sample record",
      address: "Building entrance to unit door",
      reference: "Order A-4417",
      rows: [
        { time: "16:04:10", event: "parked", detail: "Kerbside", confidence: "0.97" },
        { time: "16:06:47", event: "entered_building", detail: "Main entrance", confidence: "0.88" },
        { time: "16:07:12", event: "ascended", detail: "3 floors · staircase", confidence: "0.91" },
        { time: "16:10:12", event: "dropped_off", detail: "In-building", confidence: "0.94" },
      ],
      totals: [
        { label: "Total", value: "6m 02s" },
        { label: "In building", value: "3m 25s" },
        { label: "Elevation", value: "3 floors" },
        { label: "Method", value: "Staircase" },
      ],
    },
    outcomes: [
      {
        title: "Settle a dispute with the middle of the trip",
        body: "The floor, the door and the timings are on the record, so a claim is answered with what happened rather than with what was assumed.",
      },
      {
        title: "See where time actually goes",
        body: "Parking, walking, climbing and waiting are separate numbers. The one to fix is usually not the one anyone guessed.",
      },
      {
        title: "Send a driver to the right entrance",
        body: "Once a building has been delivered to, its entrance and vertical route are known — and the next driver does not have to work them out again.",
      },
    ],
  },

  /* ---------------------------------------------------------------------
     LEVEL 03 — integrate.
     --------------------------------------------------------------------- */
  integrate: {
    level: "LEVEL 03",
    eyebrow: "Integrate",
    heading: { lead: "Four calls in your", accent: "existing driver app." },
    lede: "There is no second app and no hardware. The SDK runs inside the app your drivers already open, and the events arrive by webhook.",
    steps: [
      { code: "01", label: "Install", body: "Add the package for your platform." },
      { code: "02", label: "Configure", body: "Once at boot, with a fleet-scoped key." },
      { code: "03", label: "Bracket the stop", body: "Start and end each delivery." },
      { code: "04", label: "Receive", body: "Events arrive on your webhook, signed." },
    ],
    snippet: {
      filename: "DeliveryTracker.kt",
      language: "kotlin",
      /* Editable from the admin panel; this is the fallback shipped in the
         bundle so the page renders before the API answers, and if it never
         does. */
      code: `import com.aravo.sdk.AravoTracker

AravoTracker.configure(
    context = applicationContext,
    apiKey = BuildConfig.ARAVO_KEY,
    driverId = session.driverId,
)

val stop = AravoTracker.startDelivery(
    orderId = "A-4417",
)

// parked, entered_building, ascended and
// dropped_off are detected on their own.
stop.markDelivered()`,
    },
    faqHeading: "Common questions",
    faq: [
      {
        q: "How does the detection work?",
        a: "Sensor fusion on the driver’s own phone. Motion, barometric pressure and satellite signal quality are read together — the combination is what distinguishes entering a building from stopping outside one, and one storey from three.",
      },
      {
        q: "What does it need from the phone?",
        a: "Background location, motion, and the barometer. Each maps to a specific capability, and the SDK degrades rather than fails when one is refused: without the barometer, floor ascent stops being reported and the other three events continue.",
      },
      {
        q: "What happens to battery life?",
        a: "The SDK is built around sensors that are already running for other reasons, and it does not hold a continuous high-accuracy location lock. Measure it in your own app before you ship it — that is the only number worth quoting.",
      },
      {
        q: "Do drivers have to do anything differently?",
        a: "No. There is nothing to tap and nothing to scan. The four events are detected, not entered, which is the reason the data stays consistent across a fleet.",
      },
      {
        q: "Where does the data go?",
        a: "To your webhook, signed, within seconds of detection. Verify the signature before trusting the body — the endpoint is public by necessity.",
      },
    ],
    actions: {
      primary: { label: "Request SDK access", href: "/sdk-access" },
      secondary: { label: "Read the docs", href: "/docs" },
    },
  },

  /* ---------------------------------------------------------------------
     DOOR — arrival.
     --------------------------------------------------------------------- */
  cta: {
    level: "DOOR",
    heading: {
      lead: "Know which floor.",
      accent: "And which door.",
    },
    body: "Request access and we will get you a key and the integration guide.",
    primary: { label: "Request access", href: "/sdk-access" },
    secondary: { label: "Read the docs", href: "/docs" },
  },

  footer: {
    tagline:
      "Delivery tracking for the part of the route that has no map — from the kerb to the door.",
    /* The social profiles are settings, not content: they were placeholders
       pointing at the networks' own homepages here, and nothing about a
       placeholder that renders correctly looks like one.

       The policies are gone from this list too. They are pages written in the
       admin panel, and the footer reads their titles and addresses from the
       same place, so renaming one renames the link. */
    links: [
      { label: "SDK docs", href: "/docs" },
      { label: "Team", href: "/team" },
      { label: "Request access", href: "/sdk-access" },
    ],
    hiring: { label: "Careers", badge: "We’re hiring", href: "/careers" },
    copyright: "© 2026 Aravo All rights reserved.",
  },
} as const;
