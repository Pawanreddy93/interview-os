# InterviewOS AI

## Project Overview
InterviewOS is an AI-powered mock interview platform for IT roles. It uses a local question bank system with browser-native speech APIs to conduct interviews, then makes a single Gemini API call at the end to generate comprehensive analytics.

## Architecture
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Firebase Auth (email/password + Google)
- **AI**: Google Gemini 1.5 Flash — ONE call per interview (final analytics only)
- **Questions**: Local JSON files in `/public/data/questions/`
- **Storage**: localStorage for interview sessions and analytics

## Key Design Decisions
- NO continuous AI calls during interviews — questions come from local JSON banks
- Browser SpeechRecognition API for voice input (no external STT service)
- Browser speechSynthesis for reading questions aloud
- Max 4 interviews/day per user (localStorage-based rate limiting)
- All interview data stored in localStorage — no backend database required

## Question Banks
- `public/data/questions/software-engineer.json` — 60 questions (easy/medium/hard)
- `public/data/questions/technical-support.json` — 60 questions (easy/medium/hard)
- `public/data/questions/qa-tester.json` — 60 questions (easy/medium/hard)

Each question has follow-up questions for deeper exploration.

## Environment Variables Required
- `NEXT_PUBLIC_GEMINI_API_KEY` — Google Gemini API key
- `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## User Preferences
- Keep the dark slate/blue theme throughout
- No emojis in UI unless already present
- Mobile responsive layout required
- Single Gemini API call per interview — never per question
