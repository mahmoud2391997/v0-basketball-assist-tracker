# Basketball Assist Tracker

An animated, real-time basketball assist tracker widget for monitoring Braden Smith's pursuit of the national career assists record.

## Features

- **Real-time Updates**: Firebase Firestore integration for live data synchronization
- **Smooth Animations**: Sub-300ms transitions at 60fps
- **Assist Management**: Increment assists and undo functionality
- **Admin Panel**: Secure interface for managing all player statistics
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Purdue Branding**: Black and gold color scheme matching Purdue athletics

## Setup

### Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd basketball-assist-tracker
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. Configure Firebase:

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

Enable Firestore Database in Native mode

Copy your Firebase config and add to `.env.local`:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
\`\`\`

4. Seed Firestore data:

Create a `players` collection in Firestore with documents following this schema:

\`\`\`json
{
  "id": "braden-smith",
  "name": "Braden Smith",
  "school": "Purdue",
  "assists": 758,
  "imageUrl": "/purdue-basketball-player.jpg",
  "isTracked": true,
  "lastUpdated": "2025-10-15T00:00:00Z"
}
\`\`\`

Add documents for the top 10 leaders (Bobby Hurley, Chris Corchiani, etc.)

### Development

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Public Leaderboard

Visit the homepage at `/` to view the real-time leaderboard. The tracked player (Braden Smith) is highlighted with gold accents and includes quick controls to add assists or undo the last change.

### Admin Panel

Access the admin panel at `/admin` to manage all player statistics:

1. **Login**: Enter the admin password (set in `NEXT_PUBLIC_ADMIN_PASSWORD`)
2. **Update Stats**: Use +/- buttons to increment or decrement any player's assists
3. **Edit Players**: Click the edit button to modify player details (name, school, image, tracked status)
4. **Add Players**: Click "Add New Player" to add additional players to the leaderboard
5. **Delete Players**: Remove players from the database (with confirmation)

All changes sync in real-time across all connected clients within 2 seconds.

## Testing

### Acceptance Criteria Checklist

- [ ] **Assist Entry & Undo**: Click "Add Assist" to increment, "Undo" to revert
- [ ] **Admin Panel**: Access `/admin`, login, and manage player stats
- [ ] **Cross-Browser**: Test in Chrome, Safari, Firefox, iOS Safari, Android Chrome
- [ ] **Animations**: Verify transitions complete in <300ms (use DevTools Performance tab)
- [ ] **Auto-Refresh**: Open in two browsers, update in one, verify sync within 2 seconds
- [ ] **Mobile Responsive**: Test on various screen sizes (320px to 1920px)
- [ ] **README**: Follow setup instructions from clean machine

### Manual Testing

1. Open the app in two browser windows
2. Click "Add Assist" in one window
3. Verify the other window updates within 2 seconds
4. Click "Undo" to revert the change
5. Check animations are smooth (60fps target)
6. Access `/admin` and test player management features

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard (Settings → Environment Variables)
4. Deploy

### Other Platforms

Build the production bundle:

\`\`\`bash
npm run build
\`\`\`

Deploy the `.next` folder to your hosting provider.

## Architecture

- **Framework**: Next.js 15 with App Router
- **Database**: Firebase Firestore (real-time sync)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: shadcn/ui component library
- **Animations**: CSS transitions with `will-change` optimization
- **Authentication**: Session-based admin authentication

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes (for real-time) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes (for real-time) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes (for real-time) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes (for real-time) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes (for real-time) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes (for real-time) |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Admin panel password | Yes (for admin access) |

**Note**: The app works in demo mode without Firebase, using local fallback data.

## Security

- Admin panel uses session-based authentication
- Password is stored in environment variables (not in code)
- For production, consider implementing proper authentication (Firebase Auth, NextAuth.js, etc.)
- Set Firestore security rules to restrict write access

### Recommended Firestore Security Rules

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if true;
      allow write: if request.auth != null; // Require authentication for writes
    }
  }
}
\`\`\`

## License

MIT
