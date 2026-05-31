# Vision Homes Kenya — Admin Dashboard Guide

This guide explains how to use the admin dashboard to manage listings, appointments, and customer enquiries on the Vision Homes Kenya website.

**Admin URL:** Open `admin.html` on your live website (for example: `https://yoursite.com/admin.html`).

---

## 1. Signing in

1. Open the admin page in your browser.
2. Enter your **email** and **password** (these are your Supabase admin account credentials).
3. Click **Sign In to Dashboard**.

If sign-in fails, check that your email and password are correct. Contact your site developer if you need a new admin account.

**Sign out:** Use the **Sign Out** button in the top-right corner when you are finished.

**Theme:** Use the moon/sun icon in the top bar to switch between dark and light mode.

**Mobile:** On smaller screens, tap the menu icon (☰) in the top bar to open the sidebar.

---

## 2. Dashboard overview

After signing in, the left sidebar shows all main sections:

| Section | What it does |
|--------|----------------|
| **All Listings** | View, edit, activate/deactivate, and delete properties |
| **Add Property** | Opens the form to create a new listing |
| **Appointments** | Manage property viewing bookings |
| **Enquiries** | Read general messages, valuation requests, and property enquiries |
| **Subscribers** | View newsletter email sign-ups |
| **View Live Site** | Opens the public website in a new tab |

Numbers beside **All Listings**, **Appointments**, and **Enquiries** show how many items are in each section. The appointments count highlights **pending** bookings that may need your attention.

---

## 3. Managing properties

### 3.1 View all listings

Go to **All Listings** to see every property in a table with:

- Photo thumbnail  
- Title, area, price, type (Sale / Rent)  
- Status (Active / Inactive)  
- Action buttons  

**Summary cards** at the top show total listings, active listings, for sale, and for rent.

**Search:** Type in the search box to filter by property name or neighborhood.

**Filters:** Use the pills to show **All**, **For Sale**, **For Rent**, or **Inactive** listings.

### 3.2 Add a new property

1. Click **Add Property** in the sidebar, or **Add Property** on the All Listings page.
2. Fill in the form (see fields below).
3. Click **Save Property**.

### 3.3 Edit a property

1. On **All Listings**, click **Edit** on the row you want to change.
2. Update the form.
3. Click **Save Property**.

### 3.4 Activate or deactivate a listing

- **Deactivate** — hides the property from the public website without deleting it.
- **Activate** — makes it visible again on the site.

Use the **Deactivate** / **Activate** button on each row. Inactive listings still appear when you filter by **Inactive**.

### 3.5 Delete a property

1. Click the red **Delete** (trash) button on a listing.
2. Confirm in the popup.

**Warning:** Deletion is permanent. The property and its photos are removed from the system.

---

## 4. Property form — field guide

### Basic information

| Field | Required | Notes |
|-------|----------|-------|
| **Property Title** | Yes | e.g. “3-bedroom luxury apartment” |
| **Listing Type** | Yes | For Sale or For Rent |
| **Neighborhood** | Yes | Karen, Runda, Westlands, etc. |
| **Price** | Yes | e.g. `KES 65,000,000` or `KES 85,000 / mo` |
| **Description** | No | Full text shown on the property page |

### Property specs

| Field | Notes |
|-------|-------|
| **Bedrooms** | Number of bedrooms |
| **Bathrooms** | Number of bathrooms |
| **Floor Size** | e.g. `1,400 sqft` |

### Location

| Field | Notes |
|-------|-------|
| **Google Maps Link** | Paste a Google Maps URL — latitude and longitude are filled in automatically |
| **Latitude / Longitude** | Can be entered manually; used for the map on the property page |

### Photos

- Click the upload area or drag and drop images.
- Supported formats: JPEG, PNG, WEBP (max **5 MB** each).
- The **first image** is used as the cover photo on listings.
- Remove an image with the ✕ on its preview before saving.

### Video tours

- Click **Add Video Link** and paste a YouTube URL (watch link, youtu.be, or embed link).
- The video appears on the property page when visitors click play.
- **Important:** In YouTube Studio, the video must have **Allow embedding** turned on (Content → video → Show more → Allow embedding).

### Amenities

Click any amenity chip to select it (it highlights when selected). Amenities appear on the property page under Features & Amenities.

Categories include outdoor, parking & security, indoor, fitness, utility, and smart home features.

### Visibility

| Option | Effect |
|--------|--------|
| **Active — visible on site** | Property appears on the public website |
| **Inactive — hidden from site** | Property is saved but not shown to visitors |

---

## 5. Appointments (property viewings)

Customers book viewings through the **Contact** page. Those bookings appear under **Appointments**.

### 5.1 Viewing time slots

Each day has three slots:

| Slot | Time |
|------|------|
| Morning | 8:00 AM – 11:00 AM |
| Midday | 11:00 AM – 2:00 PM |
| Afternoon | 2:00 PM – 5:00 PM |

Each slot can hold one booking. When all three slots on a day are taken, that day is fully booked on the contact page.

### 5.2 Appointment statuses

| Status | Meaning |
|--------|---------|
| **Pending** | New booking — waiting for your response |
| **Accepted** | You confirmed the appointment |
| **Rescheduled** | You moved it to a new date/time |
| **Rejected** | You declined the booking; the original slot becomes free again |

### 5.3 Calendar view

- The **calendar** shows which days have bookings (coloured dots).
- **Click a day** to see all bookings for that date in the panel on the right, grouped by time slot.
- Click **View** on a booking to open full details.

### 5.4 Appointments table

Below the calendar, the table lists all appointments. You can:

- **Search** by name or phone  
- **Filter** by status: All, Pending, Accepted, Rescheduled, Rejected  
- **Refresh** to load the latest data  

**Quick actions on each row:**

| Button | Action |
|--------|--------|
| **View** (eye) | Open full details |
| **Accept** (✓) | Confirm the appointment |
| **Reject** (✕) | Decline the appointment |
| **Reschedule** (calendar) | Pick a new date and time |

### 5.5 Reschedule an appointment

1. Click **Reschedule** on the appointment row or inside the detail popup.
2. Choose a new **date** on the calendar (only days with free slots are selectable).
3. Choose an available **time slot**.
4. Click **Confirm Reschedule**.

The client’s booking moves to the new date. The **old date and time are freed** so another customer can book them.

### 5.6 Appointment detail popup

When you click **View**, you see:

- Client name, phone, WhatsApp  
- Date, time slot, and status  
- Property or subject they enquired about  
- Their message  
- **Admin notes** (internal only — not visible to the client)  

**Actions in the popup:**

- **Call** / **WhatsApp** — contact the client directly  
- **Save Notes** — save internal notes about this booking  
- **Accept** / **Reject** / **Reschedule** — manage the appointment  

---

## 6. Blocking unavailable dates

Use this when you are **not available** for viewings on certain days (travel, leave, fully booked offline, etc.).

### How to block a date

1. Go to **Appointments**.
2. Scroll to **Unavailable Dates**.
3. Click a day on the calendar to **block** it.
4. Click again to **unblock** it.

Blocked dates:

- Appear highlighted on the admin calendar  
- Are listed as tags below the calendar (click **×** on a tag to unblock)  
- **Cannot be selected** by customers on the contact page  

Blocked dates also apply when you **reschedule** — you cannot move an appointment to a blocked day.

---

## 7. Enquiries (non-appointment messages)

The **Enquiries** tab shows messages that are **not** viewing appointments:

| Type | Source |
|------|--------|
| **General** | General contact form messages |
| **Valuation** | Free valuation requests |
| **Property** | “Send Enquiry” form on a property page |

### What you can do

- **Search** by name, phone, or subject  
- **Filter** by enquiry type  
- **View** full details in a popup  
- **Call** or **WhatsApp** the client from the popup  
- **Save admin notes** for your internal records  

Enquiries do not use the appointment calendar or time slots.

---

## 8. Newsletter subscribers

The **Subscribers** tab lists email addresses from the “Stay Informed” newsletter form in the website footer.

- View email and subscription date  
- Click **Refresh** to load new sign-ups  

There is no delete or export button in the dashboard; contact your developer if you need to export the list or manage subscriptions elsewhere.

---

## 9. How customers reach you (public site)

Understanding the public site helps you know where admin data comes from:

| Customer action | Where it appears in admin |
|-----------------|---------------------------|
| Books a viewing on Contact page | **Appointments** |
| Clicks “Book a Viewing” on a property | Contact page (property pre-filled) → **Appointments** |
| Sends enquiry on property page | **Enquiries** (type: Property) |
| General contact / valuation form | **Enquiries** |
| Newsletter signup in footer | **Subscribers** |
| Browses listings | **All Listings** (properties you manage) |

---

## 10. Daily workflow (recommended)

1. **Sign in** and check the **Appointments** count for new pending bookings.  
2. Review **Pending** appointments — accept, reject, or reschedule as needed.  
3. **Block dates** when you know you will be unavailable.  
4. Check **Enquiries** for new messages and respond via phone or WhatsApp.  
5. Update **All Listings** — add new properties, deactivate sold/rented ones, refresh photos and prices.  
6. **Sign out** when done, especially on shared computers.

---

## 11. Tips and troubleshooting

### Actions not saving?

If Accept, Reject, Reschedule, Save Notes, or Save Property fails, you may see an error toast at the bottom of the screen. Common causes:

- Your session expired — **sign out and sign in again**  
- Database permissions — contact your developer to check Supabase settings  

### Photos not uploading?

- Each image must be under **5 MB**  
- Use JPEG, PNG, or WEBP  
- Check your internet connection  

### Video not playing on property page?

- Use a valid YouTube link  
- Enable **Allow embedding** in YouTube Studio for that video  

### Customer says a date is unavailable but you did not block it?

- All three time slots may already be booked  
- Check the **Appointments** calendar for that day  

### Rescheduled appointment still showing old date?

- After reschedule, the **new** date is the active booking  
- The old slot should be free for new customers  
- Click **Refresh** on the Appointments tab if the calendar looks outdated  

---

## 12. Quick reference

| I want to… | Go to… |
|------------|--------|
| Add a new listing | **Add Property** |
| Hide a sold property | **All Listings** → **Deactivate** |
| Confirm a viewing | **Appointments** → **Accept** |
| Move a viewing to another day | **Appointments** → **Reschedule** |
| Mark a day as unavailable | **Appointments** → **Unavailable Dates** → click day |
| Read a general message | **Enquiries** → **View** |
| See newsletter sign-ups | **Subscribers** |
| Preview the public website | **View Live Site** |

---

*Vision Homes Kenya Admin Dashboard — for authorised staff only. Keep your login details confidential.*
