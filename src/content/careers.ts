/**
 * Careers page content. Same shape as the rest of the site: edit here, not in
 * the components. Add or remove roles freely - the list and detail views are
 * driven entirely off `jobs`.
 */

export type Job = {
  slug: string;
  department: string;
  title: string;
  location: string;
  type: string;
  about: string;
  doing: string[];
  looking: string[];
  bonus: string[];
};

export const careers = {
  eyebrow: "We're hiring",
  title: "Aravo Careers",

  // Rewritten 2026-08-19. The previous version claimed to be "the first
  // predictive delivery intelligence platform", to be "trusted by" a list of
  // roles, and to be "backed by leading investors" and "well-capitalized and
  // scaling globally". All four came from the template this site was modelled
  // on and none were true of this company. Candidates make decisions on this
  // page, so it says what the work is instead of what the company has raised.
  intro: [
    "Aravo builds delivery intelligence for logistics and e-commerce: software that shows where a package actually went, down to the entrance, the floor and the door.",
    "Our SDK runs on the driver's existing phone and detects delivery events indoors, where GPS stops being reliable. That turns a disputed delivery from an argument into a record.",
    "The problems are the interesting kind. Sensor fusion on hardware we do not control, inference that has to hold up when someone's refund depends on it, and an SDK that has to be invisible to the driver using it.",
  ],

  note: [
    "Click on any position below to view details and apply directly through our application form.",
    "We're excited to hear from you.",
  ],

  form: {
    heading: "Apply for Position",
    sections: { personal: "Personal Information", resume: "Resume" },
    fields: {
      first: "First Name",
      last: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      linkedin: "LinkedIn Profile",
      linkedinPlaceholder: "https://linkedin.com/in/yourprofile",
      github: "GitHub Profile",
      githubPlaceholder: "https://github.com/yourhandle",
      upload: "Upload Resume",
      dropzone: "Click to upload or drag and drop",
      dropzoneHint: "PDF, DOC, DOCX up to 10MB",
    },
    submit: "Submit Application",
    disclaimer:
      "By submitting this application, you agree to our privacy policy and terms of service.",
    success: {
      title: "Application received",
      body: "Thanks for applying. Our team reviews every application and will be in touch if there's a fit.",
      again: "Apply for another role",
    },
  },

  cta: {
    heading: {
      lead: "Join us and help shape the future of",
      accent: "predictive delivery intelligence.",
    },
    /* Not the site-wide pair. Somebody reading a job advert has not come here
       for SDK credentials, and pointing them at a developer form is a dead
       end dressed as a call to action. */
    actions: {
      primary: { label: "See open roles", href: "#roles" },
      secondary: { label: "About the team", href: "/team" },
    },
  },

} as const;
