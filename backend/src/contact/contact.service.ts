import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class ContactService {
  constructor(@Inject(DATABASE_CONNECTION) private sql: any) {}

  // Submit contact form
  async submitContact(data: { name: string; email: string; subject: string; message: string }) {
    const result = await this.sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${data.name}, ${data.email}, ${data.subject}, ${data.message})
      RETURNING id, created_at
    `;

    return {
      message: 'Thank you for your message! We will get back to you soon.',
      id: result[0].id,
      created_at: result[0].created_at,
    };
  }

  // Get all messages (admin)
  async getAllMessages() {
    const messages = await this.sql`
      SELECT * FROM contact_messages ORDER BY created_at DESC
    `;
    return messages;
  }

  // Mark message as read (admin)
  async markAsRead(messageId: number) {
    await this.sql`
      UPDATE contact_messages SET is_read = true WHERE id = ${messageId}
    `;
    return { message: 'Marked as read' };
  }
}
