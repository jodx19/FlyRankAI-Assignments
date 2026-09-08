import axios from 'axios';

export interface SocialPublisher {
  publish(content: string, idempotencyKey: string): Promise<any>;
}

export class TelegramPublisher implements SocialPublisher {
  private botToken: string;
  private chatId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
  }

  async publish(content: string, idempotencyKey: string): Promise<any> {
    if (!this.botToken || !this.chatId) {
      throw new Error('Telegram credentials not configured');
    }

    // Telegram doesn't support idempotency keys natively, but we can append it as invisible text or just ignore it 
    // since our scheduler prevents duplicate calls if a success history exists.
    // For safety, we will just send the message.
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: this.chatId,
      text: content,
      parse_mode: 'Markdown'
    });

    return response.data;
  }
}

export class MockXPublisher implements SocialPublisher {
  async publish(content: string, idempotencyKey: string): Promise<any> {
    console.log(`[MockXPublisher] Publishing with idempotency key ${idempotencyKey}:\n${content}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { status: 'published', platform: 'x', id: 'mock-x-123' };
  }
}

export class MockLinkedInPublisher implements SocialPublisher {
  async publish(content: string, idempotencyKey: string): Promise<any> {
    console.log(`[MockLinkedInPublisher] Publishing with idempotency key ${idempotencyKey}:\n${content}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return { status: 'published', platform: 'linkedin', id: 'mock-li-456' };
  }
}

// Factory to get publisher based on platform
export function getPublisher(platform: string): SocialPublisher {
  switch (platform) {
    case 'telegram': return new TelegramPublisher();
    case 'x': return new MockXPublisher();
    case 'linkedin': return new MockLinkedInPublisher();
    default: throw new Error(`No publisher configured for platform: ${platform}`);
  }
}
