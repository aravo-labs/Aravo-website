/**
 * The homepage, as specified.
 *
 * Copy is transcribed from the deck rather than rewritten: the numbers carry
 * claims about the Indian last-mile market that somebody sourced, and the
 * three failure modes are the client's own framing of the problem they sell
 * against. Where the deck abbreviates for a slide it is expanded here, because
 * a slide is read with someone talking over it and a page is not.
 *
 * The figures are marked as estimates in the deck and are marked as estimates
 * here. Putting a rupee number on a page without saying where it came from is
 * how a marketing claim becomes a liability.
 */

export const home = {
  hero: {
    headline: ["The rider reached the gate.", "Aravo tells you if he reached the door."],
    lede:
      "From the building gate to the customer's door - every step, every floor, every delivery. Verified.",
    primary: { label: "View the Dashboard", href: "/#dashboard" },
    contact: { label: "Contact us", href: "/sdk-access" },
  },

  action: {
    eyebrow: "Aravo in Action",
    heading: ["Every delivery, from the gate to the door", "Recorded by Aravo"],
    body: [
      "No new app. No hardware. No change for the rider.",
      "Just proof - floor by floor, step by step, door by door.",
    ],
  },

  problem: {
    eyebrow: "The problem",
    heading: "Unverified deliveries. Endless disputes. Zero proof.",
    lede:
      "A single tap makes it delivered. But which floor? Which door? GPS shows the street, not where the package actually landed.",
    stats: [
      {
        value: "\u20b94,800 Cr.",
        label: "Lost to delivery fraud every year in India.",
        /* The deck marks this an estimate. So does the page. */
        note: "Estimated false delivery claims across last-mile logistics.",
      },
      {
        value: "\u20b954,000 Cr.",
        label: "India's last-mile delivery market in 2024.",
        note: "Growing at 13.7% annually.",
      },
    ],
    failures: [
      {
        title: "GPS dies at the building entrance",
        body:
          "The moment a rider walks through a gate or lobby, GPS drifts. No system knows which floor he went to, or if he went up at all.",
      },
      {
        title: "OTP proves a call was made. Not a delivery.",
        body:
          "A rider can call, get no answer, and mark it delivered. Or share the OTP over the phone. The order closes. The customer never got it.",
      },
      {
        title: "Disputes are settled with nothing",
        body:
          "Your ops team gets a complaint and checks the GPS. It shows the street. That is all they have. Every dispute costs 15 to 30 minutes of manual investigation.",
      },
    ],
  },

  solution: {
    eyebrow: "The solution",
    heading: { lead: "Stop paying", accent: "refunds", tail: "for deliveries that happened" },
    lede:
      "Aravo gives your ops team floor-level delivery proof, so every refund decision is backed by data, every dispute is closed in seconds, and every rupee lost to false claims is recovered.",
    features: [
      {
        title: "Last 100 metre proof",
        body:
          "Every step from the society gate to the customer's door, time stamped and on record.",
      },
      {
        title: "Dispute resolution in seconds",
        body:
          "Your ops team sees exactly which floor and door the rider reached. No calls. No guessing. Just proof.",
      },
      {
        title: "Fraud pattern detection",
        body:
          "Aravo flags riders who consistently mark delivered without reaching the door, before it becomes a pattern.",
      },
      {
        title: "Refund intelligence",
        body:
          "Approve genuine refunds instantly. Reject false claims with evidence. Every rupee accounted for.",
      },
    ],
  },

  integrate: {
    eyebrow: "How to integrate",
    heading: { lead: "Four lines of", accent: "SDK", tail: "code. Full delivery visibility." },
    lede:
      "Aravo plugs directly into your existing driver app. No second app, no new hardware, no retraining your riders. Your team gets floor-level proof from day one.",
  },
} as const;
