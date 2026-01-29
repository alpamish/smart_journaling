# Smart Journal - Advanced Trading Dashboard

Smart Journal is a premium, data-driven trading journal and dashboard built for modern traders. It focuses on providing deep insights into trading performance, managing grid strategies, and tracking spot/futures holdings with a sleek, responsive interface.

## ✨ Features

- **📊 Comprehensive Dashboard**: Visualize your trading performance with real-time stats and interactive charts powered by Recharts.
- **📔 Multi-Market Journaling**: Log and track trades for both Spot and Futures markets with ease.
- **🤖 Grid Strategy Manager**: Create, monitor, and optimize your grid trading strategies with advanced margin and liquidation calculations.
- **🔌 Binance Integration**: Seamlessly fetch real-time market data directly from the Binance API.
- **🌗 Theme-Ready**: Includes a beautiful dark and light mode, powered by `next-themes`.
- **🔐 Secure Authentication**: Robust user authentication using NextAuth.js.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL/SQLite
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+ 
- NPM / PNPM / Yarn

### 2. Installation
```bash
git clone <your-repo-url>
cd smart-journal
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your credentials:
```env
DATABASE_URL="your-database-url"
AUTH_SECRET="your-auth-secret"
# Binance API keys if applicable
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📄 License
This project is licensed under the MIT License.
