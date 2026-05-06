# Time to Time Shopping

A complete luxury e-commerce platform with admin panel, built with **React + Vite + Firebase**.

![Brand](https://img.shields.io/badge/brand-Time%20to%20Time-D4AF37)
![Stack](https://img.shields.io/badge/stack-React%2018%20%2B%20Vite%20%2B%20Firebase-3b82f6)
![COD](https://img.shields.io/badge/payment-COD%20%2B%20WhatsApp-25D366)

## ✨ Features

### Storefront
- Mobile-replica design (phone frame on desktop, full-screen on mobile)
- Home with auto-rotating hero banners, categories, trending products
- Search, filter chips, sort by price/rating
- Product detail with image carousel, variant picker, quantity selector
- Cart with quantity controls and free-shipping nudge
- Full checkout with address form
- **Cash on Delivery** payment option
- **WhatsApp Order** integration (sends formatted order via WhatsApp)
- Order history, wishlist, order success page

### Admin Panel
- Password-protected login (default: `admin123`)
- Dashboard with revenue, orders, pending count, low-stock alerts
- Order management — filter by status, view full details, update status, contact customer
- Product CRUD — multi-image, variants, badges, featured toggle, search
- Category CRUD — with safety check (blocks deletion if products use it)
- Banner CRUD — visual previews, active toggle, links to categories
- Full settings — brand info, WhatsApp number, shipping rules, payment toggles, password change

### Tech
- **React 18** + Vite (fast dev, instant HMR)
- **Tailwind CSS** for styling + inline brand colors
- **Lucide React** icons
- **Firebase Firestore** for production database
- **localStorage** fallback for development (zero setup)
- Mobile-first responsive design
- All UI text customizable

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open **http://localhost:5173**. The store works immediately with localStorage — no Firebase setup required.

> 💡 You'll see "Using localStorage" in the browser console. That's the dev mode.

---

## 🔥 Connect Firebase (for production)

1. Go to [Firebase Console](https://console.firebase.google.com) → Add project
2. In the project, enable:
   - **Firestore Database** → Start in production mode → choose region (asia-south1 for India)
   - **Authentication** → Sign-in method → Email/Password (optional, for proper admin login)
3. Project Settings (gear icon) → **Your apps** → click `</>` → register app → copy config
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Fill in your Firebase config values in `.env`
6. Restart dev server:
   ```bash
   npm run dev
   ```

The app **auto-detects** Firebase config and switches data stores automatically. No code changes required.

> 💡 Browser console will now show "🔥 Connected to Firebase Firestore"

---

## 🚢 Deploy to Firebase Hosting

```bash
# Install Firebase CLI (one-time)
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting (choose existing project, public dir = dist, single-page app = yes)
firebase init hosting

# Deploy
npm run deploy
```

Your store will be live at `https://YOUR-PROJECT.web.app` 🎉

---

## 🔐 Admin Access

- **URL**: scroll to footer of homepage → click "Admin Panel" link, or navigate directly
- **Default password**: `admin123` (change in admin → Settings)

> ⚠️ Change the password before going live. For real production, swap the simple password check for Firebase Auth (see `src/admin/AdminLogin.jsx`).

---

## 📱 WhatsApp Setup

In admin → Settings, set your WhatsApp number with country code (no `+` or spaces).

Example: `919876543210` (India 91 + 10-digit number)

When customers click "Order on WhatsApp", a pre-formatted message opens in their WhatsApp with the full order details.

---

## 📁 Project Structure

```
time-to-time-shopping/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                  Entry point
│   ├── App.jsx                   Router + providers
│   ├── index.css                 Tailwind base styles
│   ├── firebase.js               DB abstraction (localStorage / Firestore)
│   ├── data.js                   Brand tokens + seed data + status colors
│   ├── utils.js                  Helpers (formatPrice, WhatsApp builder)
│   ├── contexts.jsx              Store, Route, Toast providers
│   ├── ui.jsx                    Logo + UI primitives
│   ├── storefront/
│   │   ├── PhoneShell.jsx        Mobile frame layout
│   │   ├── StatusBar.jsx         Fake mobile status bar
│   │   ├── BottomNav.jsx         Storefront bottom navigation
│   │   ├── ProductCard.jsx       Reusable product card
│   │   ├── HomeScreen.jsx        Home page
│   │   ├── CategoryScreen.jsx    Category / search
│   │   ├── ProductDetailScreen.jsx
│   │   ├── CartScreen.jsx
│   │   ├── CheckoutScreen.jsx    With COD + WhatsApp options
│   │   ├── OrderSuccessScreen.jsx
│   │   ├── OrdersScreen.jsx      Customer order history
│   │   └── WishlistScreen.jsx
│   └── admin/
│       ├── AdminShell.jsx        Sidebar layout
│       ├── AdminLogin.jsx
│       ├── AdminDashboard.jsx
│       ├── AdminOrders.jsx
│       ├── AdminProducts.jsx
│       ├── AdminCategories.jsx
│       ├── AdminBanners.jsx
│       └── AdminSettings.jsx
├── .env.example                  Firebase config template
├── firebase.json                 Hosting + Firestore config
├── firestore.rules               Security rules
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

---

## 🎨 Customizing

| What                          | Where                                |
|-------------------------------|--------------------------------------|
| Brand colors                  | `src/data.js` → `C` object           |
| Brand name / tagline          | Admin → Settings (or `src/data.js`)  |
| Seed products                 | `src/data.js`                        |
| Categories                    | Admin → Categories (or `src/data.js`)|
| Banners                       | Admin → Banners                      |
| WhatsApp message format       | `src/utils.js`                       |
| Currency / shipping rules     | Admin → Settings                     |
| Logo design                   | `src/ui.jsx` → `LogoMark` SVG        |
| Firestore security rules      | `firestore.rules`                    |

---

## 🐛 Troubleshooting

**Q: I changed `.env` but the app still uses localStorage.**
A: Vite only reads env vars at startup. Restart the dev server (Ctrl+C → `npm run dev`).

**Q: Firebase says "Permission denied" when admin saves.**
A: For proper security, set the `admin` custom claim on your admin user. See `firestore.rules` comments. For development, you can temporarily allow all writes in `app/{id}` rule (already set).

**Q: Where do orders appear?**
A: Customer side: bottom nav → Orders tab. Admin side: Admin → Orders. Real-time once Firebase is connected.

**Q: How do I add product images?**
A: Two options — (1) paste any public image URL when adding products, or (2) use Firebase Storage (see commented helper in `src/firebase.js`).

---

## 📜 License

Private — All rights reserved. © Time to Time Shopping.
# time-to-time-shopping
