import React from 'react';
import ChatViewScreen from '@/components/app/chat';
import { useAuthStore } from '@/features/auth/stores';

export default function ChatScreen() {
  return <ChatViewScreen useFor={'customer'} />;
}
