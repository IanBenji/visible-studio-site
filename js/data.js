/* ==========================================================================
   ★ CONTENT FILE — edit this file to change the website's content.
   --------------------------------------------------------------------------
   • SITE         → studio name, contact details, social links
   • CATEGORIES   → portfolio filter categories (colour-coded)
   • PROJECTS     → portfolio items (add a new object to add a project)
   • SERVICES     → services index
   • PROCESS      → the four process steps
   • FORM_CONFIG  → connect the contact form to an email service

   Media paths are relative to index.html. See docs/MEDIA-GUIDE.md for
   export settings and naming conventions.
   ========================================================================== */

export const SITE = {
  // Placeholder studio name — replace with your own. Used in nav, footer, page title.
  name: 'Visible Studio',
  shortName: 'VISIBLE',
  tagline: 'Creative video production & motion design',
  email: 'benjaminsian132@gmail.com',
  whatsapp: '256755385061', // international format without "+" or spaces
  whatsappLabel: '+256 755 385 061', // how the number is displayed
  location: 'Kampala', // shown in footer next to the live clock
  timezone: 'Africa/Kampala', // footer clock shows Kampala time for every visitor
  socials: [
    // Replace the URLs; delete any you don't use.
    { label: 'Instagram', url: 'https://instagram.com/' },
    { label: 'YouTube', url: 'https://youtube.com/' },
    { label: 'TikTok', url: 'https://tiktok.com/' },
    { label: 'LinkedIn', url: 'https://linkedin.com/' },
    { label: 'Vimeo', url: 'https://vimeo.com/' },
  ],
  // Showreel: the big video at the top of the page (first thing visitors see).
  showreel: {
    poster: 'assets/images/studio-showreel/poster.webp',
    preview: 'assets/videos/studio-showreel/preview.webm', // silent loop
    video: { webm: '', mp4: 'assets/videos/Showreel_Editing_16x9_1920x1080_YouTube_v01.mp4' }, // full version with sound
    placeholder: false,
  },
};

/* Category keys are used in PROJECTS[].category and in URLs (#work/<key>).
   filter → the short name shown on the filter buttons.
   label  → the broader group name shown above each card's title. */
export const CATEGORIES = [
  { key: 'showreel', filter: 'Showreel', label: 'Studio Showreel', short: 'REEL', color: 'var(--violet)' },
  { key: 'explainer', filter: 'Explainers', label: 'Education & Storytelling', short: 'EXPLAIN', color: 'var(--cobalt)' },
  { key: 'travel', filter: 'Travel', label: 'Travel & Lifestyle', short: 'TRAVEL', color: 'var(--orange)' },
  { key: 'podcast', filter: 'Podcasts', label: 'Podcast & Interview', short: 'POD', color: 'var(--lime)' },
  { key: 'commercial', filter: 'Commercials', label: 'Product & Brand Commercials', short: 'COMM', color: 'var(--orange)' },
  { key: 'talking-head', filter: 'Talking Head', label: 'Personal Brand', short: 'BRAND', color: 'var(--violet)' },
  { key: 'motion-graphics', filter: 'Motion Graphics', label: 'Ads & Social Media', short: 'MOTION', color: 'var(--orange)' },
];

/* --------------------------------------------------------------------------
   PROJECTS — one card per type of video we edit.
   To add one, copy an object below and edit it.

   aspect   → '16:9' | '9:16' | '1:1' | '4:5' | '2.39:1'  (aspect of the first format)
   poster   → still image shown before the video loads (WebP/AVIF/JPG)
   preview  → short silent loop (MP4 or WebM, ~5–10s) in the project's main aspect
   backdrop → (vertical-only projects) blurred 16:9 still shown behind the
              phone-shaped video on the work card
   formats  → the full-length videos shown on the project page, one per format, with a
              "Watch as" switch above the player. The first entry is shown by default
              and should match aspect. Usually:
                { label: 'YouTube', aspect: '16:9', video: { mp4, webm } }
                { label: 'Reel',    aspect: '9:16', poster: '…', video: { mp4, webm } }
              Optional per format: poster, preview (silent 5–10s loop in that shape) and
              duration (e.g. '1:24', shown on the card).
              The work grid uses the 16:9 entry; the Reels row uses the 9:16 entry.
              Provide mp4 and/or webm. File names with spaces need %20 instead of a space.
   gallery  → (optional) extra stills or cutdowns shown on the project page.
   placeholder: true → shows a "Demo media" badge. Keep false for real media.

   ⚠ Leave client/year empty until you have real, approved information.
   -------------------------------------------------------------------------- */
export const PROJECTS = [
  {
    slug: 'studio-showreel',
    title: 'Studio Showreel',
    category: 'showreel',
    aspect: '16:9',
    featured: true,
    client: '',
    year: '',
    summary: 'A quick tour of what we edit — podcasts, travel, explainers, commercials and more — in one video.',
    overview:
      'Our showreel brings together the kinds of videos we make, cut to a fast pace with on-screen graphics, and delivered for YouTube and as a vertical Reel.',
    approach:
      'Short, punchy cuts of each style we work in, tied together with kinetic type and clean transitions so you can see the range in under a minute.',
    services: ['Video editing', 'Motion graphics', 'Kinetic typography', 'Colour grading', 'Sound design', 'Vertical reframing'],
    deliverables: ['16:9 YouTube showreel', '9:16 Reel showreel'],
    poster: 'assets/images/studio-showreel/poster.webp',
    preview: 'assets/videos/studio-showreel/preview.webm',
    formats: [
      { label: 'YouTube', aspect: '16:9', duration: '0:55', video: { mp4: 'assets/videos/Showreel_Editing_16x9_1920x1080_YouTube_v01.mp4', webm: '' } },
      { label: 'Reel', aspect: '9:16', duration: '0:55', poster: 'assets/images/studio-showreel/poster-reel.webp', preview: 'assets/videos/studio-showreel/preview-reel.webm', video: { mp4: 'assets/videos/Showreel_Editing_9x16_1080x1920_v01.mp4', webm: '' } },
    ],
    placeholder: false,
  },
  {
    slug: 'explainer-videos',
    title: 'Explainer Videos',
    category: 'explainer',
    aspect: '16:9',
    featured: true,
    client: '',
    year: '',
    summary: 'Complex topics turned into clear, engaging visual stories — for YouTube and for vertical feeds.',
    overview:
      'Two explainers in two formats: an animated long-form explainer built for YouTube, and a vertical history explainer told through archive photos, animated maps and timelines.',
    approach:
      'Every explainer starts with the story: what the viewer needs to understand, and in what order. Visuals, maps, on-screen text and sound design are then built to carry that structure so it stays easy to follow.',
    services: ['Scripting & story structure', 'Motion graphics', 'Animated maps & timelines', 'Archive & visual research', 'Kinetic typography', 'Sound design'],
    deliverables: ['16:9 YouTube explainer', '9:16 vertical explainer'],
    poster: 'assets/images/explainer-videos/poster.webp',
    preview: 'assets/videos/explainer-videos/preview.webm',
    formats: [
      { label: 'YouTube', aspect: '16:9', duration: '3:10', video: { mp4: 'assets/videos/explainer_Mailroom_YouTube.mp4', webm: '' } },
      { label: 'Reel', aspect: '9:16', duration: '9:01', poster: 'assets/images/explainer-videos/poster-reel.webp', preview: 'assets/videos/explainer-videos/preview-reel.webm', video: { mp4: 'assets/videos/WWII_Explainer.mp4', webm: '' } },
    ],
    placeholder: false,
  },
  {
    slug: 'travel-edits',
    title: 'Travel Video Edits',
    category: 'travel',
    aspect: '16:9',
    featured: true,
    client: '',
    year: '',
    summary: 'Cinematic travel edits that make people want to pack a bag — cut to music, graded for mood.',
    overview:
      'A travel film edited as a journey: big landscapes and title moments, then people, places and small details — delivered as a YouTube film and a vertical Reel.',
    approach:
      'The edit follows the rhythm of the music and the feeling of a trip. Bold titles, a warm grade and sound design pull the viewer in, and the vertical version is reframed for the phone screen.',
    services: ['Travel & lifestyle editing', 'Music-driven editing', 'Colour grading', 'Title design', 'Sound design', 'Vertical reframing'],
    deliverables: ['16:9 YouTube film', '9:16 Reel'],
    poster: 'assets/images/travel-edits/poster.webp',
    preview: 'assets/videos/travel-edits/preview.webm',
    formats: [
      { label: 'YouTube', aspect: '16:9', duration: '0:58', video: { mp4: 'assets/videos/travel_World_Journey_YouTube_16x9.mp4', webm: '' } },
      { label: 'Reel', aspect: '9:16', duration: '0:58', poster: 'assets/images/travel-edits/poster-reel.webp', preview: 'assets/videos/travel-edits/preview-reel.webm', video: { mp4: 'assets/videos/travel_World_Journey_Reel_PREVIEW.mp4', webm: '' } },
    ],
    placeholder: false,
  },
  {
    slug: 'podcast-edits',
    title: 'Podcast Video Edits',
    category: 'podcast',
    aspect: '16:9',
    featured: true,
    client: '',
    year: '',
    summary: 'Podcast moments edited into short, captioned highlights that people actually stop and watch.',
    overview:
      'A podcast highlight edited for YouTube and for Reels: a strong moment from the conversation, with animated captions and a branded outro.',
    approach:
      'We find the moment worth sharing, cut it tight, and let captions carry the key words so it works even with the sound off. The vertical version is reframed around the speaker.',
    services: ['Podcast editing', 'Highlight clips', 'Animated captions', 'Audio clean-up', 'Speaker reframing', 'Branded intros & outros'],
    deliverables: ['16:9 YouTube highlight', '9:16 Reel'],
    poster: 'assets/images/podcast-edits/poster.webp',
    preview: 'assets/videos/podcast-edits/preview.webm',
    formats: [
      { label: 'YouTube', aspect: '16:9', duration: '0:34', video: { mp4: 'assets/videos/podcast_YouTube_TalkLessHearMore_16x9_v01.mp4', webm: '' } },
      { label: 'Reel', aspect: '9:16', duration: '0:34', poster: 'assets/images/podcast-edits/poster-reel.webp', preview: 'assets/videos/podcast-edits/preview-reel.webm', video: { mp4: 'assets/videos/podcast_Reels_PodcastHighlight_v01.mp4', webm: '' } },
    ],
    placeholder: false,
  },
  {
    slug: 'commercial-videos',
    title: 'Product Commercials',
    category: 'commercial',
    aspect: '16:9',
    featured: true,
    client: '',
    year: '',
    summary: 'Cinematic product ads that sell a feeling first — slow, warm visuals and a clear brand moment.',
    overview:
      'A product commercial for a coffee brand, shot and edited as a slow morning ritual and delivered for YouTube and as a vertical Reel for social feeds.',
    approach:
      'Every shot is built around one product truth. Close, tactile visuals, a warm grade and restrained on-screen text lead to a clean product and logo moment at the end.',
    services: ['Product advertising', 'Cinematic editing', 'Colour grading', 'Title design', 'Sound design', 'Vertical reframing'],
    deliverables: ['16:9 YouTube ad', '9:16 Reel ad'],
    poster: 'assets/images/commercial-videos/poster.webp',
    preview: 'assets/videos/commercial-videos/preview.webm',
    formats: [
      { label: 'YouTube', aspect: '16:9', duration: '0:42', video: { mp4: 'assets/videos/HUSH_SlowRoast_SpecAd_16x9_1920x1080_YouTube.mp4', webm: '' } },
      { label: 'Reel', aspect: '9:16', duration: '0:42', poster: 'assets/images/commercial-videos/poster-reel.webp', preview: 'assets/videos/commercial-videos/preview-reel.webm', video: { mp4: 'assets/videos/HUSH_SlowRoast_SpecAd_9x16_1080x1920.mp4', webm: '' } },
    ],
    placeholder: false,
  },
  {
    slug: 'talking-head',
    title: 'Talking-Head Videos',
    category: 'talking-head',
    aspect: '9:16',
    featured: true,
    client: '',
    year: '',
    summary: 'Personal brand and talking-head content with captions, punch-ins and graphics that hold attention.',
    overview:
      'A vertical talking-head video for social media: one speaker, edited with rhythm, animated captions and on-screen graphics that reinforce what is being said.',
    approach:
      'Punch-ins and reframing create energy from a single camera angle. Captions and graphics highlight the key words, so the message lands in the first few seconds.',
    services: ['Talking-head editing', 'Animated captions', 'Punch-ins & reframing', 'On-screen graphics', 'Sound design'],
    deliverables: ['9:16 Reel / TikTok / Short'],
    poster: 'assets/images/talking-head/poster-reel.webp',
    preview: 'assets/videos/talking-head/preview-reel.webm',
    backdrop: 'assets/images/talking-head/backdrop.webp',
    formats: [
      { label: 'Reel', aspect: '9:16', duration: '0:51', video: { mp4: 'assets/videos/Preview%20v1%20720p.mp4', webm: '' } },
    ],
    placeholder: false,
  },
  {
    slug: 'motion-graphics',
    title: 'Motion Graphics Ads',
    category: 'motion-graphics',
    aspect: '9:16',
    featured: true,
    client: '',
    year: '',
    summary: 'Animated ads that explain a service in seconds — bold type, clean interface animation and a clear call to action.',
    overview:
      'A vertical motion graphics ad for an SEO service, built from animated type, interface graphics and sound.',
    approach:
      'The ad opens with a question the viewer recognises, shows the problem and the result visually, and ends on one clear call to action — paced for the sound-off social feed.',
    services: ['Motion graphics', 'Kinetic typography', 'UI animation', 'Social ads', 'Sound design'],
    deliverables: ['9:16 social ad'],
    poster: 'assets/images/motion-graphics/poster-reel.webp',
    preview: 'assets/videos/motion-graphics/preview-reel.webm',
    backdrop: 'assets/images/motion-graphics/backdrop.webp',
    formats: [
      { label: 'Reel', aspect: '9:16', duration: '0:40', video: { mp4: 'assets/videos/seo-reel-1080x1920-30fps.mp4', webm: '' } },
    ],
    placeholder: false,
  },
];

/* Services index.
   icon    → a key from js/icons.js */
export const SERVICES = [
  { title: 'Video Editing', icon: 'scissors', text: 'Story-first editing with rhythm, pacing and polish — from raw footage to finished film.', color: 'var(--violet)' },
  { title: 'Commercial & Promotional Videos', icon: 'clapperboard', text: 'Ads and promos that make products and brands impossible to scroll past.', color: 'var(--orange)' },
  { title: 'Documentary & Explainer Videos', icon: 'book-open', text: 'Research-led storytelling with maps, timelines and clear visual explanation.', color: 'var(--cobalt)' },
  { title: 'Personal Brand Videos', icon: 'user', text: 'Talking-head content with kinetic captions and an unmistakable visual voice.', color: 'var(--violet)' },
  { title: 'Podcast & Interview Editing', icon: 'mic', text: 'Multi-cam edits, clean audio and social clips that carry the conversation further.', color: 'var(--lime)' },
  { title: 'Motion Graphics & Animation', icon: 'sparkles', text: 'Typography, infographics, logo animation and motion systems that move with purpose.', color: 'var(--orange)' },
  { title: 'Social Media Content', icon: 'share-2', text: 'Vertical-first cutdowns, hooks and captions built for each platform.', color: 'var(--lime)' },
  { title: 'Corporate Video Production', icon: 'building-2', text: 'Company profiles, explainers and presentations that communicate with clarity.', color: 'var(--cobalt)' },
  { title: 'Creative Direction & Storytelling', icon: 'lightbulb', text: 'Concept, structure and visual direction — the thinking behind the frames.', color: 'var(--violet)' },
];

export const PROCESS = [
  { title: 'Discover', text: "Understand the client's goals, audience and vision.", tc: '00:00:00:00' },
  { title: 'Create', text: 'Develop creative direction, structure and visual approach.', tc: '00:00:15:00' },
  { title: 'Produce', text: 'Edit, animate, design and refine the project.', tc: '00:00:30:00' },
  { title: 'Deliver', text: 'Finalise, optimise and deliver content for its intended platforms.', tc: '00:00:45:00' },
];

/* --------------------------------------------------------------------------
   CONTACT FORM
   The form validates in the browser but needs a service to actually send.
   Choose ONE provider and fill in its value:

   provider: 'formspree'  → endpoint: 'https://formspree.io/f/xxxxxxx'
   provider: 'web3forms'  → accessKey: 'your-web3forms-access-key'
   provider: 'custom'     → endpoint: 'https://your-api.example.com/contact' (receives JSON POST)

   While provider is null the form will NOT pretend to send — it shows a clear
   "not connected yet" message and offers a pre-filled email instead.
   -------------------------------------------------------------------------- */
export const FORM_CONFIG = {
  provider: null,
  endpoint: '',
  accessKey: '',
};
