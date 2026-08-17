'use client';

import dynamic from 'next/dynamic';

const TelegramChatSimulation = dynamic(() => import('./TelegramChatSimulation'), {
  ssr: false,
});

export default function TelegramChatWrapper() {
  return <TelegramChatSimulation />;
}
