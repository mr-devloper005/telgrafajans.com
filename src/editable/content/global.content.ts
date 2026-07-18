import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'A neighborhood guide worth keeping.',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'A neighborhood guide worth keeping.',
    // Navbar intentionally does not link to task archives — the footer is the discovery surface.
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Get started', href: '/signup' },
      secondary: { label: 'Search', href: '/search' },
    },
  },
  footer: {
    tagline: 'A neighborhood guide worth keeping.',
    description: `${slot4BrandConfig.siteName} is a neighborhood guide to independent places worth visiting and reading-room references worth keeping close. Made with quiet attention, one entry at a time.`,
    columns: [
      {
        title: 'Discover',
        links: [
          { label: 'Places', href: '/listing' },
          { label: 'Reading Room', href: '/pdf' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Search', href: '/search' },
        ],
      },
    ],
    bottomNote: 'Made with quiet attention.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
    search: 'Search',
  },
} as const
