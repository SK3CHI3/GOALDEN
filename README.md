# GOALDEN - eFootball Tournament Platform

A modern, mobile-first Progressive Web App for automated eFootball tournaments with real-time bracket management, match verification, and prize distribution.

## Features

### Core Features ✅
- **Authentication System** - Email/phone/password registration with role-based access (Player/Admin)
- **Tournament Management** - Single and double elimination formats with flexible scheduling modes
- **Automated Bracket Generation** - Smart pairing algorithms for tournament brackets
- **Match Submission** - Mobile-first score submission with screenshot upload (camera/gallery)
- **Automatic Verification** - Instant match resolution when scores match, dispute flagging on mismatch
- **Real-time Updates** - Live bracket updates and tournament chat using Supabase Realtime
- **Player Profiles** - Comprehensive stats tracking (tournaments played, win rate, earnings)
- **Admin Dashboard** - Tournament creation, dispute resolution, player management, analytics
- **Progressive Web App** - Installable, offline-capable, native app-like experience

### Pending Features 🚧
- **WhatsApp Notifications** (Twilio integration) - Match assignments, result notifications
- **M-PESA Payment Integration** - Entry fee collection and prize distribution
- **Admin Dispute Resolution UI** - Screenshot comparison interface for disputed matches

## Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Premium component library
- **Framer Motion** - Smooth animations
- **PWA** - Progressive Web App capabilities

### Backend
- **Supabase** - PostgreSQL database, Authentication, Real-time subscriptions, Storage
- **Supabase Edge Functions** - Serverless functions for automation
- **Row Level Security** - Database-level access control

### Design System
- **Glassmorphism** - Modern frosted glass UI effects
- **Gradient Colors** - Neon green (#00FF88) + Amber (#FFB800)
- **Mobile-First** - Optimized for smartphones with bottom navigation

## Database Schema

### Core Tables
- `profiles` - User profiles extending Supabase auth
- `player_stats` - Tournament statistics and earnings
- `tournaments` - Tournament configuration and status
- `registrations` - Player tournament registrations with payment status
- `matches` - Match results, scores, and screenshots
- `disputes` - Score mismatch disputes for admin review
- `chat_messages` - Tournament chat messages

### Storage Buckets
- `match-screenshots` - Player-submitted result screenshots
- `tournament-media` - Tournament banners and assets

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd GAMIFY
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# To be configured
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
```

4. **Run database migrations**

The migrations are already applied via Supabase MCP. If you need to reapply:
```bash
# Run migrations through Supabase dashboard or CLI
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions (auth, tournaments, matches)
│   ├── admin/            # Admin dashboard routes
│   ├── dashboard/        # Player dashboard routes
│   │   ├── matches/      # Match submission pages
│   │   ├── tournaments/  # Tournament detail pages
│   │   └── profile/      # Player profile
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # ShadCN UI components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication forms
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout components (navigation)
│   ├── matches/          # Match submission forms
│   └── tournaments/      # Tournament components
└── lib/
    ├── supabase/         # Supabase client configuration
    ├── bracket-generator.ts  # Tournament bracket algorithms
    ├── database.types.ts     # TypeScript types from database
    └── utils.ts          # Utility functions
```

## Key Workflows

### Tournament Creation (Admin)
1. Admin creates tournament with format, slots, entry fee, mode
2. System calculates prize pool and sets registration status
3. Tournament appears on player dashboard

### Player Registration
1. Player browses available tournaments
2. Registers for tournament (payment placeholder)
3. Added to confirmed participants or waitlist

### Match Flow
1. Tournament starts → Bracket generated
2. Players paired → Match status set to "ongoing"
3. Both players submit score + screenshot
4. **If scores match**: Winner advances automatically
5. **If scores conflict**: Admin dispute review

### Dispute Resolution (Admin)
1. Admin reviews both screenshots side-by-side
2. Determines correct winner
3. Winner advances, loser eliminated

## API Integration Points (To Be Implemented)

### Twilio WhatsApp Notifications
```typescript
// src/app/actions/notifications.ts
export async function sendWhatsAppNotification(
  phoneNumber: string,
  message: string
) {
  // Twilio API implementation
}
```

### M-PESA Payment Integration
```typescript
// src/app/actions/payments.ts
export async function initiateMpesaPayment(
  phoneNumber: string,
  amount: number,
  tournamentId: string
) {
  // M-PESA Daraja API implementation
}
```

## Security

- **Row Level Security (RLS)** - Database-level access control
- **Server Actions** - All mutations happen server-side
- **Input Validation** - Client and server-side validation
- **File Upload Limits** - Max 5MB for screenshots
- **Anti-Fraud** - One account per phone number, device fingerprinting

## Performance Optimizations

- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Dynamic imports for large components
- **PWA Caching** - Service worker for offline functionality
- **Optimistic Updates** - Instant UI feedback

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Other Platforms
- Configure environment variables
- Set Node.js version to 18+
- Configure build command: `npm run build`
- Configure start command: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

See LICENSE file for details.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: support@matchfy.com

## Roadmap

### Phase 1 (Current) ✅
- Core tournament functionality
- Match verification system
- Real-time features

### Phase 2 (Next)
- M-PESA payment integration
- WhatsApp notifications
- Mobile apps (iOS/Android)

### Phase 3 (Future)
- Multi-game support
- Streaming integration
- Betting/predictions
- Tournament templates
- API for third-party integrations

---

Built with ❤️ by the GOALDEN Team


│   ├── auth/             # Authentication forms

│   ├── dashboard/        # Dashboard components

│   ├── layout/           # Layout components (navigation)

│   ├── matches/          # Match submission forms

│   └── tournaments/      # Tournament components

└── lib/

    ├── supabase/         # Supabase client configuration

    ├── bracket-generator.ts  # Tournament bracket algorithms

    ├── database.types.ts     # TypeScript types from database

    └── utils.ts          # Utility functions

```



## Key Workflows



### Tournament Creation (Admin)

1. Admin creates tournament with format, slots, entry fee, mode

2. System calculates prize pool and sets registration status

3. Tournament appears on player dashboard



### Player Registration

1. Player browses available tournaments

2. Registers for tournament (payment placeholder)

3. Added to confirmed participants or waitlist



### Match Flow

1. Tournament starts → Bracket generated

2. Players paired → Match status set to "ongoing"

3. Both players submit score + screenshot

4. **If scores match**: Winner advances automatically

5. **If scores conflict**: Admin dispute review



### Dispute Resolution (Admin)

1. Admin reviews both screenshots side-by-side

2. Determines correct winner

3. Winner advances, loser eliminated



## API Integration Points (To Be Implemented)



### Twilio WhatsApp Notifications

```typescript

// src/app/actions/notifications.ts

export async function sendWhatsAppNotification(

  phoneNumber: string,

  message: string

) {

  // Twilio API implementation

}

```



### M-PESA Payment Integration

```typescript

// src/app/actions/payments.ts

export async function initiateMpesaPayment(

  phoneNumber: string,

  amount: number,

  tournamentId: string

) {

  // M-PESA Daraja API implementation

}

```



## Security



- **Row Level Security (RLS)** - Database-level access control

- **Server Actions** - All mutations happen server-side

- **Input Validation** - Client and server-side validation

- **File Upload Limits** - Max 5MB for screenshots

- **Anti-Fraud** - One account per phone number, device fingerprinting



## Performance Optimizations



- **Image Optimization** - Next.js automatic image optimization

- **Code Splitting** - Dynamic imports for large components

- **PWA Caching** - Service worker for offline functionality

- **Optimistic Updates** - Instant UI feedback



## Deployment



### Vercel (Recommended)

```bash

vercel deploy

```



### Other Platforms

- Configure environment variables

- Set Node.js version to 18+

- Configure build command: `npm run build`

- Configure start command: `npm start`



## Contributing



1. Fork the repository

2. Create a feature branch

3. Commit your changes

4. Push to the branch

5. Open a Pull Request



## License



See LICENSE file for details.



## Support



For issues or questions:

- Open an issue on GitHub

- Contact: support@matchfy.com



## Roadmap



### Phase 1 (Current) ✅

- Core tournament functionality

- Match verification system

- Real-time features



### Phase 2 (Next)

- M-PESA payment integration

- WhatsApp notifications

- Mobile apps (iOS/Android)



### Phase 3 (Future)

- Multi-game support

- Streaming integration

- Betting/predictions

- Tournament templates

- API for third-party integrations



---



Built with ❤️ by the MATCHFY Team


│   ├── auth/             # Authentication forms

│   ├── dashboard/        # Dashboard components

│   ├── layout/           # Layout components (navigation)

│   ├── matches/          # Match submission forms

│   └── tournaments/      # Tournament components

└── lib/

    ├── supabase/         # Supabase client configuration

    ├── bracket-generator.ts  # Tournament bracket algorithms

    ├── database.types.ts     # TypeScript types from database

    └── utils.ts          # Utility functions

```



## Key Workflows



### Tournament Creation (Admin)

1. Admin creates tournament with format, slots, entry fee, mode

2. System calculates prize pool and sets registration status

3. Tournament appears on player dashboard



### Player Registration

1. Player browses available tournaments

2. Registers for tournament (payment placeholder)

3. Added to confirmed participants or waitlist



### Match Flow

1. Tournament starts → Bracket generated

2. Players paired → Match status set to "ongoing"

3. Both players submit score + screenshot

4. **If scores match**: Winner advances automatically

5. **If scores conflict**: Admin dispute review



### Dispute Resolution (Admin)

1. Admin reviews both screenshots side-by-side

2. Determines correct winner

3. Winner advances, loser eliminated



## API Integration Points (To Be Implemented)



### Twilio WhatsApp Notifications

```typescript

// src/app/actions/notifications.ts

export async function sendWhatsAppNotification(

  phoneNumber: string,

  message: string

) {

  // Twilio API implementation

}

```



### M-PESA Payment Integration

```typescript

// src/app/actions/payments.ts

export async function initiateMpesaPayment(

  phoneNumber: string,

  amount: number,

  tournamentId: string

) {

  // M-PESA Daraja API implementation

}

```



## Security



- **Row Level Security (RLS)** - Database-level access control

- **Server Actions** - All mutations happen server-side

- **Input Validation** - Client and server-side validation

- **File Upload Limits** - Max 5MB for screenshots

- **Anti-Fraud** - One account per phone number, device fingerprinting



## Performance Optimizations



- **Image Optimization** - Next.js automatic image optimization

- **Code Splitting** - Dynamic imports for large components

- **PWA Caching** - Service worker for offline functionality

- **Optimistic Updates** - Instant UI feedback



## Deployment



### Vercel (Recommended)

```bash

vercel deploy

```



### Other Platforms

- Configure environment variables

- Set Node.js version to 18+

- Configure build command: `npm run build`

- Configure start command: `npm start`



## Contributing



1. Fork the repository

2. Create a feature branch

3. Commit your changes

4. Push to the branch

5. Open a Pull Request



## License



See LICENSE file for details.



## Support



For issues or questions:

- Open an issue on GitHub

- Contact: support@matchfy.com



## Roadmap



### Phase 1 (Current) ✅

- Core tournament functionality

- Match verification system

- Real-time features



### Phase 2 (Next)

- M-PESA payment integration

- WhatsApp notifications

- Mobile apps (iOS/Android)



### Phase 3 (Future)

- Multi-game support

- Streaming integration

- Betting/predictions

- Tournament templates

- API for third-party integrations



---



Built with ❤️ by the MATCHFY Team


