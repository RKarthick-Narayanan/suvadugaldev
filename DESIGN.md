# Suvadugal homepage design

Status: approved direction with open decisions listed in [PROGRESS.md](PROGRESS.md). The [Figma Homepage frame, node 1272:13472](https://www.figma.com/design/dthv3hBWC5mrmPT4Z934Nx/Tholkudi-Suvadugal?node-id=1272-13472) controls visual treatment. The approved hierarchy and footer content below control functionality.

## Page order

1. Shared header
2. Hero carousel
3. Archive Search using DSpace Discovery
4. Browse by Entity: Art Forms, Artist Profiles, Instruments
5. Browse by Art Domain: Performing Arts, Fine Arts, Martial Arts
6. Recent Additions from DSpace item search
7. Shared footer

## Visual reference

The inspected desktop frame is 1440 × 3433 px. Header is 75 px tall. The approved hero is 1440 × 450 px at 1440 px width, preserving the supplied 3.2:1 image ratio. Archive Search occupies a 276 px region with a centered 644 × 60 px search control. Use 48 px desktop content gutters as shown in the grids and footer. Entity and domain cards are approximately 411 × 458 px with white surfaces, thin grey borders, offset colored accents, and arrow affordances. The recent grid shows four cards. Its repeated example record is mock content. Use the Figma asset exports for static imagery and real archive data for the recent cards.

Use Playfair Display Medium headings (48 px archive heading, 36 px section headings, 32 px browse card titles in the desktop reference) and Roboto for body text and controls. Principal colors include #1E1916 (heading), #726C60 (muted text), #8D8E8C (dark grey), white, and light neutrals. Apply Figma colors and spacing locally to the affected components. The header reference is desktop without search and shows English selected. Preserve header search access and functional language/auth controls.

Only the desktop frame was inspected. No separate mobile design will be supplied. Adapt the desktop design using existing DSpace responsive conventions. Preserve reading order, avoid horizontal overflow, let grids and footer columns reflow, and keep controls reachable by keyboard and touch. Translate new interface text into natural Tamil using existing Suvadugal terminology and a suitable Tamil font fallback. Do not translate archival metadata.

## Hero carousel

Use the supplied `/home/karthick/Documents/Suvadugal Working folder/Banner/banners.zip` images in order B01.jpeg, B02.jpeg, B03.jpeg, B04.jpeg. Each is a 1280 × 400 RGB JPEG. Automatically advance every seven seconds unless reduced motion is requested; provide a pause/play control and pause on pointer hover or keyboard focus. Provide previous/next controls, slide indicators, keyboard support and meaningful descriptions. Keep one slide active, preserve aspect ratio, and scale the 3.2:1 frame responsively without cropping or distortion. Mobile embedded text legibility is an accepted limitation. Images were inspected as a contact sheet; in-page rendering remains to be validated. Do not add images.

Do not move keyboard focus automatically. Announce user-selected slide changes appropriately, respect reduced motion, and make controls usable with touch. Transition style, wrapping and exact alt wording remain implementation choices subject to visual and accessibility review.

## Shared footer

Adapt the Figma white footer to four groups using its typography, muted labels, spacing, divider and attribution treatment. The inspected footer variant has 48 px horizontal padding, 64 px vertical padding, and 40 px separation between its principal blocks. Reflow the groups on narrow screens. Use the following link order and retain the existing DSpace cookie settings action and institutional/software attribution in the footer utility area.

| Group | Approved links in order |
|---|---|
| About | About Suvadugal; About the Initiative; Partner Institutions |
| Information & Policies | Access & Usage Policy; Copyright & Attribution; Privacy Policy |
| Contact | Contact Us; Share Feedback |
| Important Links | Department of Social Justice, Government of Tamil Nadu; Directorate of Tribal Welfare, Government of Tamil Nadu; Ministry of Tribal Affairs, Government of India |

External destinations verified on official government sites:

- [Department of Social Justice, Government of Tamil Nadu](https://tnadwpoa.tn.gov.in/) (government departmental portal identifying itself as ADW&TW – Social Justice Department)
- [Directorate of Tribal Welfare, Government of Tamil Nadu](https://www.tntribalwelfare.tn.gov.in/)
- [Ministry of Tribal Affairs, Government of India](https://tribal.nic.in/home.aspx)

Privacy Policy and Share Feedback reuse existing DSpace destinations and visibility rules. Create the other internal information pages using the existing DSpace info routes and themed component conventions. Their substantive content requires approval; do not publish placeholder pages or invent policies, contact details, or institutional facts. Use only the three approved About links. Preserve accessibility and agreement actions where enabled.

## Interactions

Use the existing shared header and footer across routes. Submit archive search through DSpace's search form. Use DSpace community routes for the three domain cards and Discovery entity search routes for the three entity cards. Use real Angular links for cards and recent items. Preserve entity navigation, language switching, mobile menu and authentication. Provide loading, empty and error states for dynamic content. See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for Discovery contracts and acceptance checks.

The approved shared header logo is the supplied 01.jpeg, copied without alteration into the dspace theme assets.

## Validation status

The footer uses a responsive grid with a wider Important Links column, Roboto text, and separate utility and attribution regions. Sections with no publishable links are hidden while all four approved groups remain in the component configuration. The six internal footer destinations require approved content and routes. Desktop, tablet and mobile footer geometry and Figma fidelity remain unverified in a browser.
