# Piggies (Next.js Edition)

This project is now built with **Next.js 14+ (App Router)**, using file-based routing for all main pages. It features:

- **Next.js 14+** (App Router, `/app` directory)
- **Tailwind CSS** for styling
- **Convex** for backend/database
- **URL-based routing** for all main pages (refresh and deep linking supported)

## Main Pages

- `/map` — Map view
- `/people` — People nearby
- `/profile` — Profile editor
- `/chat` — Chat
- `/user/[userId]` — User profile page

## Directory Structure

- `/app` — Next.js App Router pages
- `/components` — UI and common components
- `/convex` — Convex backend functions
- `/styles` — Tailwind CSS and global styles

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Notes

- All navigation is URL-based. You can refresh or share any page.
- Vite is no longer used. This project is now fully Next.js.
- Tailwind CSS and Convex are fully supported.

---

For more details, see the code in the `/app` directory.
