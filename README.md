# Globetrotter UI

A geography quiz game built with Next.js where players test their knowledge of world destinations.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm package manager
- Backend server running (see globetrotter-be repository)

### Development Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000  # Your backend API URL
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the game.

## Project Structure

```
globetrotter-ui/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── services/     # API integration
│   └── store/        # State management
├── public/           # Static assets
└── .next/           # Build output
```

## Features

- Interactive geography quiz game
- Real-time feedback on answers
- Score tracking and personal best records
- Global leaderboard
- Responsive design for all devices

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction) - State management
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS

## License

[MIT License](LICENSE)
