import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

/*
  User-visible copy for each task archive. Uses the editable rename:
    listing → Places
    pdf     → Reading Room
  Never uses "Business Listing" / "Business Listings" / "PDF" / "PDFs" / "Documents".
*/
export const taskPageVoices = {
  article: {
    eyebrow: 'Field Notes',
    headline: 'Field notes from the guide.',
    description: 'Long-form reads, essays and interviews from around the neighborhood. Added by hand, kept short-ish.',
    filterLabel: 'Filter by topic',
    secondaryNote: 'Reading takes room. Everything below has been given some.',
    chips: ['Editorial pacing', 'One at a time', 'Long-read friendly'],
  },
  classified: {
    eyebrow: 'Board',
    headline: 'The community board.',
    description: 'Short-turn offers, opportunities and notices from within the community. Act quickly — these move.',
    filterLabel: 'Filter the board',
    secondaryNote: 'Kept short so you can act fast.',
    chips: ['Fast turn', 'Community offers', 'Short notes'],
  },
  sbm: {
    eyebrow: 'Shelf',
    headline: 'The shelf of saved things.',
    description: 'Bookmarks and links we keep coming back to — tools, references, small internet things worth knowing about.',
    filterLabel: 'Filter the shelf',
    secondaryNote: 'A rotating shelf of small useful things.',
    chips: ['Small internet', 'Reference links', 'Curated'],
  },
  profile: {
    eyebrow: 'People',
    headline: 'The people behind the guide.',
    description: 'Makers, hosts, cooks, writers, technicians — the people who keep the neighborhood interesting.',
    filterLabel: 'Filter by role',
    secondaryNote: 'Say hello. Most of them like it.',
    chips: ['Makers', 'Hosts', 'Community'],
  },
  pdf: {
    eyebrow: 'Reading Room',
    headline: 'The reading room — guides, reports and references.',
    description: 'A quiet room of downloadable guides, reports and references kept for later. Everything opens or downloads in one tap.',
    filterLabel: 'Filter the reading room',
    secondaryNote: 'Take one home, or keep it in the tab for later.',
    chips: ['Guides', 'References', 'Downloadable'],
  },
  listing: {
    eyebrow: 'Places',
    headline: 'Independent places worth visiting.',
    description: 'A short directory of shops, studios, kitchens and host-run spaces from around the neighborhood. Each entry gets a location, a phone, and a note about what makes it worth visiting.',
    filterLabel: 'Filter places',
    secondaryNote: 'Go visit. Say hi from the guide.',
    chips: ['Independent', 'Neighborhood', 'Worth visiting'],
  },
  image: {
    eyebrow: 'Gallery',
    headline: 'The gallery — images from around the guide.',
    description: 'Photographs of the places, the people and the printed things we cover. Best browsed slowly.',
    filterLabel: 'Filter the gallery',
    secondaryNote: 'Browse slowly. There is no scoreboard.',
    chips: ['Photographs', 'Slow scroll', 'Portfolio mood'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
