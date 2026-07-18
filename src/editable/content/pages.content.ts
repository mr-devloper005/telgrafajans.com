import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: `${slot4BrandConfig.siteName} — a neighborhood guide worth keeping`,
      description: `A carefully kept guide to independent places worth visiting and reading-room references worth close attention.`,
      openGraphTitle: `${slot4BrandConfig.siteName} — a neighborhood guide worth keeping`,
      openGraphDescription: `Places, guides and quiet references, all under one warm cream cover.`,
      keywords: ['neighborhood guide', 'local directory', 'reading room', 'reference library', 'independent places'],
    },
    hero: {
      badge: 'A guide worth keeping',
      title: ['Independent places worth visiting.', 'Reading-room references worth keeping.'],
      description: `${slot4BrandConfig.siteName} is a small, hand-kept guide to the places and reading that make a neighborhood feel like one.`,
      primaryCta: { label: 'Wander the guide', href: '/listing' },
      secondaryCta: { label: 'Open the Reading Room', href: '/pdf' },
      searchPlaceholder: 'Search places, guides, references…',
      focusLabel: 'On the cover',
      featureCardBadge: 'this week',
      featureCardTitle: 'This week, on the cover of the guide.',
      featureCardDescription: 'A rotating spotlight on a place or reference worth returning to.',
    },
    intro: {
      badge: 'About the guide',
      title: 'Two things, kept in one place.',
      paragraphs: [
        `${slot4BrandConfig.siteName} holds two collections side by side — a small directory of independent places worth visiting, and a quiet reading room of guides and references worth keeping close.`,
        'Every entry is added by hand, kept short, and given room to breathe. Nothing infinite-scrolls, nothing shouts.',
        'Start on the cover, wander the shelves, come back when you need a place or a reference again.',
      ],
      sideBadge: 'What you get',
      sidePoints: [
        'A hand-kept directory of independent places, with a location, a phone, and a note.',
        'A reading room of downloadable guides and references, categorized, dated and searchable.',
        'Cross-references between the two — a place worth visiting, a guide worth reading first.',
        'A warm, quiet interface that stays out of the way while you look.',
      ],
      primaryLink: { label: 'Browse the directory', href: '/listing' },
      secondaryLink: { label: 'Open the Reading Room', href: '/pdf' },
    },
    cta: {
      badge: 'Add to the guide',
      title: 'Do you keep a place, or a guide, worth adding?',
      description: 'Independent shops, studios, kitchens, host-run spaces, community reports and reading-room references are all welcome. Send us a note — we read every one by hand.',
      primaryCta: { label: 'Submit an entry', href: '/create' },
      secondaryCta: { label: 'Say hello', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'A short view onto what has been added lately.',
    },
  },
  about: {
    badge: 'The story',
    title: 'A neighborhood guide made with quiet attention.',
    description: `${slot4BrandConfig.siteName} is a two-part guide — independent places worth visiting on one side of the shelf, a reading room of guides and references on the other. It is made slowly, kept short, and updated by hand.`,
    paragraphs: [
      'We started this because the places we care about were getting lost between algorithmic feeds and paid maps. A guide should feel like a well-kept notebook, not a marketplace.',
      'Every entry is added by hand and left to breathe. Nothing autoplays, nothing tracks, nothing pushes.',
      'If you would like to add something — a place, a guide, a small correction — we would love to hear from you.',
    ],
    values: [
      {
        title: 'Hand-kept, not scraped',
        description: 'Every entry is added, edited and dated by a person. Nothing is bulk-imported.',
      },
      {
        title: 'Two collections, one cover',
        description: 'The directory and the reading room live under one roof so browsing one leads naturally to the other.',
      },
      {
        title: 'Quiet by default',
        description: 'No autoplaying media, no infinite scroll, no dark patterns. Just the guide, and space to think in.',
      },
    ],
  },
  contact: {
    eyebrow: `Write to ${slot4BrandConfig.siteName}`,
    title: 'A quiet inbox for corrections, suggestions and hellos.',
    description: 'Add a place, propose a guide, flag a mistake, or just say hi. We read every note in the order it arrives — usually within a few days.',
    formTitle: 'Send a note',
  },
  search: {
    metadata: {
      title: `Search — ${slot4BrandConfig.siteName}`,
      description: 'Search across the neighborhood guide — places, reading-room guides and everything in between.',
    },
    hero: {
      badge: 'Search the guide',
      title: 'Look through the whole shelf.',
      description: 'Places, reading-room references, notes and profiles — one search across everything currently kept in the guide.',
      placeholder: 'Search by name, category, or a word from a note…',
    },
    resultsTitle: 'Most recently added',
  },
  create: {
    metadata: {
      title: 'Submit — add to the guide',
      description: 'Suggest a place, guide or reference for inclusion in the guide.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to add to the guide.',
      description: 'Contributors sign in with an email so we can follow up on submissions and keep the guide credited well.',
    },
    hero: {
      badge: 'Submission workspace',
      title: 'Add to the guide.',
      description: 'Choose what kind of entry you are adding, then give it a title, a short note and a link. We read every submission by hand.',
    },
    formTitle: 'Entry details',
    submitLabel: 'Send for review',
    successTitle: 'Thank you — the entry is in the queue.',
  },
  auth: {
    login: {
      metadataDescription: `Sign in to ${slot4BrandConfig.siteName}.`,
      badge: 'Members',
      title: 'Welcome back to the guide.',
      description: 'Sign in to submit entries, follow up on corrections and keep drafts saved to your account.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched those details. Please make an account first.',
      success: 'Signed in — taking you back to the guide…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: `Get started with ${slot4BrandConfig.siteName}.`,
      badge: 'New members',
      title: 'Get started as a contributor.',
      description: 'Create a light contributor account so you can submit entries, save drafts and follow up on edits.',
      formTitle: 'Create your account',
      submitLabel: 'Create account',
      passwordShort: 'Please use at least 4 characters for the password.',
      success: 'Account created — welcome to the guide.',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'More field notes',
      fallbackTitle: 'Field note',
    },
    listing: {
      relatedTitle: 'More from the directory',
      fallbackTitle: 'Directory entry',
    },
    image: {
      relatedTitle: 'More from the gallery',
      fallbackTitle: 'Gallery entry',
    },
    profile: {
      relatedTitle: 'More people to meet',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit their site',
    },
  },
} as const
