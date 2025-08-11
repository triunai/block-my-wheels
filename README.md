# 🚗 PaRQed

**Smart QR sticker system to connect vehicle owners with those they might be blocking.**

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## 🏗️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + Shadcn/UI
- **Database:** Supabase (PostgreSQL)
- **State:** TanStack Query + React Context
- **Package Manager:** Bun

## 📋 Key Features

- **QR Code Stickers:** Generate unique QR codes for vehicles
- **Instant Notifications:** WhatsApp alerts when vehicle blocks someone
- **Driver Dashboard:** Manage incidents and stickers
- **Admin Panel:** System oversight and management
- **Real-time Updates:** Live incident tracking

## 🔧 Development

See `PHOENIX.md` for comprehensive refactoring guide and architecture details.

**Essential Files:**
- `STICKER_RPC_MIGRATION.md` - Required database migration
- `supabase-schema.sql` - Database schema
- `database-diagnostics.sql` - Diagnostic queries

## 🌐 Environment Setup

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🚦 Project Status

**Active Development** - See `PHOENIX.md` for current refactoring roadmap.

---

*Built with ❤️ for better urban mobility* 