import { Injectable } from '@nestjs/common';

type AuthPhase = 'idle' | 'awaiting_username' | 'awaiting_password';

interface ChatState {
  phase: AuthPhase;
  tmpUsername?: string;
}

@Injectable()
export class TelegramStateService {
  private chats = new Map<string, ChatState>();

  get(chatId: string): ChatState {
    return this.chats.get(chatId) ?? { phase: 'idle' };
  }

  set(chatId: string, state: ChatState) {
    this.chats.set(chatId, state);
  }

  reset(chatId: string) {
    this.chats.set(chatId, { phase: 'idle' });
  }
}

