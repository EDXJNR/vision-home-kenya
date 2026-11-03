# vision-home-kenya

The Vision Homes Kenya website — a static HTML site for a Nairobi luxury real estate agency. Public pages list homes for sale and rent; an admin dashboard lets staff manage listings, viewing appointments, and enquiries.

## What it does

**Listings** — Browse properties by type, neighborhood, beds, and budget. Cards open a quick-view modal or the full property page.

**Property page** — Photo gallery, price and specs, amenities, optional YouTube video tour, map, enquiry form, and “Book a Viewing” (pre-fills the contact form).

**Neighborhoods** — Cards for each served area (including Ngong, Kikuyu, Syokimau, and Westlands) with live listing counts and links into filtered listings.

**Contact** — Enquiry types: property viewing (date + time slot), free valuation, or general message. Viewing slots are blocked when full or when an admin marks a day unavailable.

**Stay With Us** — Dedicated short-stay page (`airbnb.html`) for the furnished Westlands Airbnb: amenities, nightly rate, WhatsApp booking. Linked from the nav (“Stay With Us”), footer, and a home-page teaser.

**About** — Founder-led “Meet Marilyn” page (photo, focus areas, contact), not a multi-agent team roster.

**Admin** — Sign-in required. Add/edit/hide listings, upload photos, accept/reject/reschedule viewings, block off days, read enquiries, and see newsletter subscribers.

## Quick start

This is a static site (no Node server). Open it over HTTP so nav/footer `fetch` and Supabase calls work — do not double-click HTML files (`file://`).

```bash
# from the project root, any local server, e.g.
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed local URL (typically `http://localhost:3000` or `:8080`).

Public entry pages: `index.html`, `listings.html`, `property.html?id=…`, `contact.html`, `neighborhoods.html`, `about.html`, `airbnb.html`.  
Staff: `admin.html`.

Copy values into `js/config.js` from the team (never commit real keys to a public fork). See **Config** below.

## Auth model

| Layer | Who | How |
|--------|-----|-----|
| Public site | Visitors | No login. Reads listings; submits enquiries and newsletter sign-up using the public (anon) client. |
| Admin | Staff | Email + password via Supabase Auth. Required for listing writes, appointment status, blocked dates, and photo uploads. |

Row Level Security on the database must allow public **read** of active properties and **insert** of enquiries/subscribers, and authenticated **update** of enquiries and storage.

## Config

All client config lives in `js/config.js`:

- Supabase project URL and anon key  
- WhatsApp number used on enquiry CTAs  
- Storage bucket name for listing photos (default: `property-images`)

Treat the anon key as **public-but-restricted** (RLS), not as a secret admin key. Do not put the service-role key in this repo.

## Data (Supabase)

Typical tables:

- `properties` — listings (`amenities`, `video_links`, active flag, etc.)  
- `property_images` — photo URLs and sort order  
- `enquiries` — contact and viewing bookings (`appointment_date` / `slot`, optional reschedule fields, status, admin notes)  
- `subscribers` — newsletter emails  
- `blocked_dates` — days visitors cannot book  

Photos go to a **public** Storage bucket so listing pages can load them. SQL helpers (if present) live under `supabase/`.

## Key tech

- **Static HTML + CSS + vanilla JS** — no React/build step  
- **Supabase** — Postgres, Auth, Storage  
- **Leaflet** — property map (`property.html`)  
- **`js/layout.js`** — loads `components/nav.html` and `components/footer.html`  
- **`js/properties.js`** — fetch/filter/render listings  
- **`js/booking.js`** — viewing slots, blocked dates, video-tour helpers  
- **`js/theme.js`** — light/dark (default light if unset)  

Admin UI is mostly **inline script in `admin.html`** (there is an unused `js/admin.js` leftover).

## Pages

| File | Audience |
|------|----------|
| `index.html` | Home, featured listings, Airbnb teaser |
| `listings.html` | Full catalogue + filters (type, neighborhood, budget) |
| `property.html` | Single listing |
| `neighborhoods.html` | Area cards and listing counts |
| `contact.html` | Enquiries and viewings |
| `about.html` | Meet Marilyn |
| `airbnb.html` | Westlands short stay |
| `admin.html` | Staff only |

## Documentation

- `docs/ADMIN_GUIDE.md` — how staff use the dashboard (listings, appointments, blocked dates, enquiries)

## Notes

- Listing photos are served at **original upload size**. Smaller files load faster (resize/compress before upload).  
- Demo listings appear if Supabase is unreachable.  
- `js/newspaper.js` is unused; newsletter logic is `js/newsletter.js`.  
- Founder photo on About is `images/marilyn.jpg` (optional; a placeholder shows if the file is missing).
