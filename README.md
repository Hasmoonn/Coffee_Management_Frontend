# ☕ Brew & Co. - Artisanal Coffee Experience

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

Welcome to the frontend of **Brew & Co.**, a premium, cinematic web platform designed for an artisanal coffee shop experience. This application combines high-end aesthetics with powerful e-commerce and management features.

## ✨ Core Features

- **🎬 Cinematic Hero Section**: An immersive introduction with elegant parallax effects and dynamic content cycling.
- **📜 Digital Menu**: A beautifully crafted interface to explore coffee variants, artisanal pastries, and seasonal specials.
- **🛒 Smart Cart System**: Seamless product selection with a persistent cart and streamlined checkout flow.
- **📅 Table Reservations**: An integrated booking system allowing users to reserve their favorite spots in advance.
- **💎 Loyalty Program**: A dedicated space for members to track points, unlock rewards, and view exclusive offers.
- **📊 Performance Intelligence (Admin)**: A sophisticated admin dashboard with real-time analytics, revenue trajectory charts, and inventory management.
- **🔐 Secure Authentication**: Polished login and registration flows with modern validation and cinematic transitions.
- **📱 Responsive Excellence**: Fully optimized for all devices, from desktop wide-screens to mobile handhelds.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme Management**: [Next Themes](https://github.com/pacocoursey/next-themes)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd pro-normal/client
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root of the `client` directory and add your backend URL:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000) to see the result.

## 📁 Project Structure

```text
src/
├── app/            # Next.js App Router (Routes & Layouts)
│   ├── admin/      # Admin Dashboard logic & views
│   ├── auth/       # Login & Registration pages
│   ├── cart/       # Shopping cart & Checkout
│   ├── loyalty/    # Rewards system views
│   ├── menu/       # Product catalog
│   └── reservations/# Table booking system
├── components/     # Reusable UI components (Shared & Feature-specific)
├── hooks/          # Custom React hooks (Auth, Cart, UI state)
├── lib/            # Utility functions & API clients
└── types/          # TypeScript definitions & interfaces
```

## 🎨 Design System

The project follows the **"Artisanal Elegance"** design system:
- **Typography**: Premium serif for headings, clean sans-serif for readability.
- **Palette**: Deep coffee tones, rich creams, and gold accents.
- **Feel**: Luxurious, minimalist, and responsive.

## 🤝 Contribution

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
Built with ❤️ by the Brew & Co. Team.
