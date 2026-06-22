# GiftunwrapAdminportal — Admin Dashboard (CLAUDE.md)

Internal admin dashboard. React 18 + Vite 6 + React Router 7. Package name: `admin-portal`. `bootstrap` is in dependencies but pages mostly use inline `style={}` and Tailwind-looking utility class names with no Tailwind config present — don't assume Tailwind is actually wired up here.

## Structure
- `src/App.jsx` — holds the login gate AND the route tree (see Auth below).
- `src/components/Sidebar.jsx` — left-nav with a hardcoded `menuItems` list (path + label), highlights the active route via `useLocation()`.
- `src/components/Topbar.jsx`, `src/components/AdminReviews.jsx`.
- `src/pages/` — one file per section: `Dashboard.jsx`, `Users.jsx`, `Products.jsx`, `PostProduct.jsx`, `Orders.jsx`, `Quotes.jsx`, `Messages.jsx`, `Blogs.jsx`, `GiftBoxItems.jsx`, `BoxesAndCards.jsx`.
- `src/api/index.js` — **single centralized axios client** for the whole app (unlike the customer frontend). Every CRUD action for every resource is a named export here (`fetchX`, `createX`, `updateX`, `deleteX`, `toggleXStock`), all built on one `axios.create({ baseURL: 'https://giftunwrapbackend.vercel.app/api' })` instance. Add new endpoints here, not inline in pages.

## Auth / permissions
There is no real authentication. `App.jsx` keeps `isAuth` in `useState` and compares plaintext `ADMIN_ID`/`ADMIN_PASS` constants hardcoded at the top of the file — no JWT, no backend login call, no token, no persistence (a page refresh logs you out), no roles/permissions of any kind. Don't assume any request from this app is authenticated — the backend itself has no auth middleware either (see backend CLAUDE.md).

## Data management / CRUD pattern
Every resource page (`GiftBoxItems.jsx` is the clearest example) follows the same shape:
1. `useState` for the list, a `loading` flag, a `showForm` toggle, an `editingItem`, and a `formData` object.
2. `useEffect(() => { fetchItems() }, [])` to load on mount, calling the matching `fetch*` from `src/api/index.js`.
3. Plain HTML `<table>` + inline-styled/utility-class rows for listing, with Edit / Toggle Stock / Delete buttons per row.
4. Add/Edit uses a single form (toggled via `showForm`) that branches on `editingItem` to call either `createX` or `updateX`.
5. Image fields use `<input type="file">` collected into `FormData` (see `buildMultipartFormData` in `GiftBoxItems.jsx`) and posted with `headers: { 'Content-Type': 'multipart/form-data' }` — never JSON when an image is involved.
6. Feedback is via `alert(...)` and `window.confirm(...)`, not toasts/modals.

## Cloudinary
The admin portal never talks to Cloudinary directly. It uploads raw `File` objects via multipart `FormData` to backend routes (e.g. `POST /gift-box-items`, `POST /boxes`, `POST /blogs`); the backend's `multer-storage-cloudinary` middleware does the actual upload and the response includes the resulting URL. The admin UI only displays the URL it gets back (`<img src={item.image} />` / `<img src={editingItem.image} />`) and re-uploads a new file to *replace* an image — there's no explicit "delete from Cloudinary" call from here.

## Routing
`react-router-dom` v7, `BrowserRouter` wraps everything but only renders once `isAuth` is true. Routes are flat, one per page, no protected-route wrapper (since there's no real auth, see above).

## Env / deploy
- No `.env` files — API base URL is hardcoded in `src/api/index.js` (same backend URL as the customer frontend).
- `vercel.json` does a single SPA rewrite (`"/(.*)" → "/"`) for client-side routing on Vercel.
