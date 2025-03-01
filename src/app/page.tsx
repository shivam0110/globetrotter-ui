"use client";

import GameBoard from '@/components/GameBoard';
// import Header from '@/components/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* <Header /> */}
      <div className="container mx-auto px-4 py-8">
        <GameBoard />
      </div>
    </main>
  );
}
