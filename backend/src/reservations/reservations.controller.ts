import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { RequireAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservations')
@UseGuards(RequireAuthGuard)
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  // Get user's reservations
  @Get()
  async getUserReservations(@Request() req: any) {
    return this.reservationsService.getUserReservations(req.user.userId);
  }

  // Get all reservations (admin)
  @Get('all')
  async getAllReservations() {
    return this.reservationsService.getAllReservations();
  }

  // Create reservation (checkout route for frontend compatibility)
  @Post('checkout')
  async checkout(
    @Request() req: any,
    @Body() body: { userId?: number; items: { bookId: number; pickupDate?: string; returnDate?: string; quantity?: number }[] }
  ) {
    // Transform frontend format to backend format
    const transformedItems = body.items.map(item => ({
      book_id: item.bookId,
      quantity: item.quantity || 1,
    }));
    
    // Use the first item's pickup date or default to tomorrow
    const pickupDate = body.items[0]?.pickupDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.reservationsService.createReservation(
      req.user.userId,
      transformedItems,
      pickupDate,
      undefined
    );
  }

  // Create reservation (original format)
  @Post()
  async createReservation(
    @Request() req: any,
    @Body() body: { items: { book_id: number; quantity: number }[]; pickupDate: string; notes?: string }
  ) {
    return this.reservationsService.createReservation(
      req.user.userId,
      body.items,
      body.pickupDate,
      body.notes
    );
  }

  // Update reservation status (admin)
  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string }
  ) {
    return this.reservationsService.updateStatus(id, body.status);
  }

  // Cancel reservation (user)
  @Delete(':id')
  async cancelReservation(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.reservationsService.cancelReservation(req.user.userId, id);
  }
}
