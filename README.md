# Reneral - Discord-like Messaging App

A modern, real-time messaging application built with React, Firebase, and Railway deployment support.

## Features

- **User Authentication**: Email/password and Google OAuth authentication
- **Servers**: Create and join multiple servers like Discord
- **Channels**: Text and voice channels within servers
- **Real-time Messaging**: Instant message delivery using Firebase Real-time Database
- **Member Management**: See online status and server members
- **Modern UI**: Beautiful dark theme interface using TailwindCSS

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + custom CSS variables
- **Backend**: Firebase (Firestore, Auth, Real-time Database)
- **Icons**: Lucide React
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project with:
  - Authentication enabled (Email/Password and Google)
  - Firestore Database
  - Real-time Database
  - Storage (optional, for avatars)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd reneral-project
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password and Google)
   - Create Firestore Database
   - Create Real-time Database
   - Copy your Firebase config

4. Create environment file:
```bash
cp .env.example .env
```

5. Update `.env` with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Railway

1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Railway will automatically detect it as a Vite project
4. Add your environment variables in Railway dashboard
5. Deploy!

## Firebase Security Rules

### Firestore Rules
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /servers/{serverId} {
      allow read: if request.auth != null && resource.data.members.contains(request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Real-time Database Rules
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "servers": {
      "$serverId": {
        ".read": "auth != null && root.child('servers').child($serverId).child('members').child(auth.uid).exists()",
        "channels": {
          "$channelId": {
            "messages": {
              ".read": "auth != null",
              ".write": "auth != null"
            }
          }
        }
      }
    }
  }
}
```

## Project Structure

```
reneral-project/
├── src/
│   ├── components/       # React components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ServerList.tsx
│   │   ├── ChannelList.tsx
│   │   ├── ChatArea.tsx
│   │   ├── MemberList.tsx
│   │   └── CreateServerModal.tsx
│   ├── lib/             # Utilities and Firebase config
│   │   ├── firebase.ts
│   │   └── utils.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/              # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] Direct messaging between users
- [ ] Voice/video calls
- [ ] File uploads and sharing
- [ ] Message reactions
- [ ] User profiles and settings
- [ ] Server roles and permissions
- [ ] Rich text formatting
- [ ] Emoji picker
- [ ] Message search
- [ ] Notifications

## License

MIT License - feel free to use this project for your own purposes!
