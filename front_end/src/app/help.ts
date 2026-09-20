import {
  Camera,
  ClipboardList,
  Map,
  MessageSquare,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type HelpTopic = 'getting-started' | 'diagnosis' | 'chat' | 'officers' | 'account' | 'contacts'

export const HELP_TOPICS: Array<{ id: HelpTopic | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'getting-started', label: 'Getting started' },
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'chat', label: 'Coco AI' },
  { id: 'officers', label: 'Officers' },
  { id: 'account', label: 'Account' },
  { id: 'contacts', label: 'Contacts' },
]

export interface HelpGuide {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export interface HelpFaq {
  q: string
  a: string
  topic: HelpTopic
}

export const HELP_GUIDES: HelpGuide[] = [
  {
    title: 'Scan a coconut leaf',
    description: 'Upload a leaflet photo and let the vision model classify common leaf diseases.',
    href: '/app/disease-detection/leaves',
    icon: Camera,
  },
  {
    title: 'Check stem, bud, or fruit',
    description: 'Work through a CRI symptom questionnaire when a photo of the leaflet is not enough.',
    href: '/app/disease-detection',
    icon: ClipboardList,
  },
  {
    title: 'Ask Coco AI',
    description: 'Get answers from Coconut Research Institute circulars, with sources on every reply.',
    href: '/app/chatbot',
    icon: MessageSquare,
  },
  {
    title: 'Talk to a regional officer',
    description: 'Send a note, photo, short video, or voice note to the officer for your farm district.',
    href: '/app/consultations',
    icon: UserRound,
  },
  {
    title: 'Watch nearby outbreaks',
    description: 'See verified cases on the heatmap and open alerts that reach farms in the same area.',
    href: '/app/heatmap',
    icon: Map,
  },
  {
    title: 'Manage farms and profile',
    description: 'Add estates, set a primary farm, and use Edit or Password to update your account.',
    href: '/app/profile',
    icon: UserRound,
  },
]

export const HELP_FAQS: HelpFaq[] = [
  {
    topic: 'getting-started',
    q: 'How do I get my farm into Coco Care?',
    a: 'Open Profile, add each estate with a name, acreage, tree count, and map pin. The primary farm is used for weather, routing officer requests, and outbreak alerts. You can switch the primary farm any time.',
  },
  {
    topic: 'diagnosis',
    q: 'How accurate is the leaf diagnosis?',
    a: 'Leaf scans use a trained vision model. High-confidence results can be auto-verified. When the photo and symptoms disagree, the report is sent to a regional officer so a person can review it.',
  },
  {
    topic: 'diagnosis',
    q: 'What if I cannot take a clear leaf photo?',
    a: 'Use Disease Diagnosis and pick stem, bud, or fruit. Those paths use a short CRI questionnaire instead of the camera. You can still attach a later scan when you message an officer.',
  },
  {
    topic: 'chat',
    q: 'Does Coco AI make things up?',
    a: 'Coco AI answers from Coconut Research Institute advisory circulars stored in the knowledge base. Replies include the source passage. Use Officer consultations when you need a person to look at your farm.',
  },
  {
    topic: 'officers',
    q: 'Who receives my officer consultation?',
    a: 'Requests are routed to a regional agricultural officer for the district on the farm you select. Coco AI stays in Chat. The officer can reply with notes, photos, video, or a voice note.',
  },
  {
    topic: 'officers',
    q: 'Can I send photos, videos, or a voice note?',
    a: 'Yes. A new request and every reply can include up to three photos, one short video under 6 MB, or a voice note up to 60 seconds. You can also delete a whole conversation from the thread header.',
  },
  {
    topic: 'officers',
    q: 'How do outbreak alerts work?',
    a: 'When a case is verified, farmers near that farm receive an alert with the disease and a link to the heatmap. Open Notifications to mark alerts read, or Heatmap to see what is nearby.',
  },
  {
    topic: 'account',
    q: 'How do I change my password or farm details?',
    a: 'Open View Profile. Use Edit to change your name, email, or phone, and Password to set a new one. On the same page you can add, edit, or delete a farm and choose which estate is primary.',
  },
  {
    topic: 'contacts',
    q: 'How do I call CRI or CDA?',
    a: 'Use the Government contacts section on this page. Coconut Research Institute (CRI) handles research and advisory circulars. Coconut Development Authority (CDA) handles development, processing, and marketing. For a farm visit or a nearby outbreak, start with Officer consultations in Coco Care.',
  },
]

export const HELP_MORE = {
  title: 'Still need a person?',
  body: 'Coco AI is for CRI manuals. A regional officer can look at a scan, a farm visit, or an outbreak near you.',
}

export interface HelpPhone {
  label: string
  href: string
}

export interface HelpContactLine {
  label: string
  phones?: HelpPhone[]
  website?: { label: string; href: string }
}

export interface HelpInstitution {
  name: string
  shortName: string
  summary: string
  lines: HelpContactLine[]
}

export const HELP_INSTITUTIONS: HelpInstitution[] = [
  {
    name: 'Coconut Research Institute',
    shortName: 'CRI',
    summary: 'Research, advisory circulars, and farmer support for coconut pests and diseases.',
    lines: [
      {
        label: 'Head Office Hotline',
        phones: [
          { label: '+94 (0)31-2255300', href: 'tel:+94312255300' },
          { label: '+94 (0)31-2262000', href: 'tel:+94312262000' },
        ],
      },
      {
        label: 'WhatsApp Support / Info',
        phones: [{ label: '+94 (0)70-4001928', href: 'https://wa.me/94704001928' }],
      },
      {
        label: 'General Hotline',
        phones: [{ label: '1928', href: 'tel:1928' }],
      },
      {
        label: 'Official Website',
        website: { label: 'cri.gov.lk', href: 'https://cri.gov.lk' },
      },
    ],
  },
  {
    name: 'Coconut Development Authority',
    shortName: 'CDA',
    summary: 'Development, processing, and marketing support for coconut growers.',
    lines: [
      {
        label: 'Head Office',
        phones: [
          { label: '+94 (0)11-2502502', href: 'tel:+94112502502' },
          { label: '+94 (0)11-2508729', href: 'tel:+94112508729' },
        ],
      },
      {
        label: "Chairman's Office",
        phones: [{ label: '+94 (0)11-2502501', href: 'tel:+94112502501' }],
      },
      {
        label: "Director-General's Office",
        phones: [{ label: '+94 (0)11-2508730', href: 'tel:+94112508730' }],
      },
      {
        label: 'Fort Office (Processing & Marketing)',
        phones: [
          { label: '+94 (0)11-2322796', href: 'tel:+94112322796' },
          { label: '+94 (0)11-2421028', href: 'tel:+94112421028' },
        ],
      },
      {
        label: 'Official Website',
        website: { label: 'cda.gov.lk', href: 'https://www.cda.gov.lk' },
      },
    ],
  },
]
