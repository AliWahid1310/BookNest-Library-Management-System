import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  // Submit contact form (public)
  @Post()
  async submitContact(
    @Body() body: { name: string; email: string; subject: string; message: string }
  ) {
    return this.contactService.submitContact(body);
  }

  // Get all messages (admin)
  @Get()
  async getAllMessages() {
    return this.contactService.getAllMessages();
  }

  // Mark as read (admin)
  @Put(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.markAsRead(id);
  }
}
