# AI DevOps Assistant - Design Guidelines

## Design Approach
**Selected Approach:** Design System (Productivity-Focused)
**Primary Reference:** Linear, GitHub, Vercel aesthetic - clean, developer-focused interfaces with technical authority
**Justification:** DevOps productivity tool requiring clarity, efficiency, and professional credibility for technical audiences

## Typography System
**Font Families:**
- Headings: Inter or System UI stack (700, 600 weights)
- Body: Inter or System UI stack (400, 500 weights)
- Code/Technical: Monospace for any code snippets or technical terms

**Hierarchy:**
- Hero Headline: 3.5rem (desktop) / 2.5rem (mobile), font-weight: 700
- Section Headlines: 2.5rem (desktop) / 2rem (mobile), font-weight: 600
- Feature Titles: 1.5rem, font-weight: 600
- Body Text: 1.125rem, font-weight: 400, line-height: 1.7
- Small Text: 0.875rem for captions/metadata

## Layout System
**Bootstrap Spacing Units:** Consistently use Bootstrap's spacing scale (3, 4, 5 for most cases)
- Section padding: py-5 (80px+)
- Component spacing: mb-4, mt-5
- Card padding: p-4
- Container: Use Bootstrap container-lg for content width

**Grid Strategy:**
- Features: 4-column grid on desktop (col-lg-3), 2-column on tablet (col-md-6), single on mobile
- How It Works: 4-column horizontal timeline on desktop, stacked on mobile
- Maximum content width: container-lg

## Hero Section
**Layout:**
- Full-width section with subtle gradient background or abstract tech pattern
- Centered content with max-width constraint
- Hero image: Abstract illustration of AI/DevOps workflow (code pipelines, automation nodes) positioned on the right side or as background element
- Headline + subheading + CTA button vertically stacked, centered
- Height: 600px desktop, natural height mobile

**Components:**
- Large headline with gradient text effect on key words ("AI Co-Pilot")
- Supporting subheading: 1.25rem explaining the value proposition
- Primary CTA button: Large (btn-lg), with subtle blur background if over image
- Secondary micro-text: "Free for open source projects" or trust indicator below CTA

## Navigation Bar
**Structure:**
- Fixed/sticky top navigation with subtle shadow on scroll
- Logo/brand text on left (combine icon + "AI DevOps Assistant" text)
- Navigation links right-aligned: Analyze YML | Monitor Webhooks | Explain Code | Generate YML
- Add "Get Started" button on far right
- Mobile: Hamburger menu collapsing nav links

## Features Section
**Layout:**
- Section headline centered with supporting subtext
- 4-column grid (col-lg-3 col-md-6 col-12)
- Each feature card with:
  - Font Awesome icon (3rem size): fa-file-code (Analyze), fa-wifi (Monitor), fa-lightbulb (Explain), fa-file-export (Generate)
  - Icon container with subtle background circle/rounded square
  - Title (h4)
  - 3-4 line description
  - Subtle hover lift effect on cards
- Card styling: Minimal borders, subtle shadows, padding p-4

## How It Works Section
**Structure:**
- Horizontal process flow with 4 steps
- Each step contains:
  - Large number indicator (01, 02, 03, 04) with accent styling
  - Step title
  - Brief description
  - Connecting line/arrow between steps (hidden on mobile)
- Desktop: 4 columns with connecting elements
- Mobile: Vertical timeline with left-aligned numbers

## About/Contact Section
**Two-column layout (col-lg-6):**
- Left: About content with mission statement, 2-3 paragraphs about the tool's purpose
- Right: Simple contact form with Name, Email, Message fields, Submit button
- Include social proof elements: "Trusted by 1000+ DevOps teams" with small logos or metrics

## Footer
**Multi-column footer:**
- 4 columns: Product (feature links), Company (About, Blog, Careers), Resources (Docs, API, Support), Social/Newsletter
- Newsletter signup: Email input + Subscribe button
- Bottom bar: Copyright, Privacy Policy, Terms of Service
- Padding: py-5

## Component Library
**Buttons:**
- Primary: Solid, rounded corners (rounded-2), padding (px-4 py-2)
- Secondary: Outline style
- Sizes: Regular and btn-lg for hero CTA

**Cards:**
- Feature cards: Minimal borders, subtle shadows, rounded-3, hover effects
- Consistent padding: p-4
- Background: Subtle off-white or slight transparency

**Forms:**
- Input fields: Rounded-2, padding p-3, subtle borders
- Labels: Uppercase, 0.75rem, letter-spacing
- Focus states: Accent border highlight

## Images
**Hero Section:**
- Large hero image: Abstract DevOps/AI workflow illustration showing code pipelines, containers, and automation. Style should be modern, isometric or flat design with technical elements (gears, code blocks, cloud icons). Positioned as background element or right-side feature image.
- Dimensions: 1200x800px minimum
- Style: Professional tech illustration, not photographic

**Feature Icons:**
- Use Font Awesome 6 icons via CDN
- No custom images needed for features, rely on iconography

## Spacing & Rhythm
**Vertical Rhythm:**
- Section spacing: py-5 (80px) between major sections
- Component spacing: mb-4 (1.5rem) between related elements
- Card internal spacing: p-4
- Maintain consistent gutters in grid layouts (g-4)

## Accessibility
- All interactive elements meet 44px minimum touch target
- Form inputs include visible labels
- Icon-only buttons include aria-labels
- Maintain WCAG AA contrast ratios
- Focus indicators visible on all interactive elements

## Animations
**Minimal, purposeful animations only:**
- Subtle fade-in on scroll for feature cards (optional via intersection observer)
- Smooth hover transitions on cards (0.3s ease)
- No complex scroll-triggered animations
- Keep it professional and restrained

This design creates a modern, authoritative landing page that communicates technical credibility while remaining accessible and conversion-focused for DevOps professionals.