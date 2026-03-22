import { Controller, Get, Post, Delete, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { RequireAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(RequireAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  // Get user's wishlist
  @Get()
  async getWishlist(@Request() req: any) {
    return this.wishlistService.getWishlist(req.user.userId);
  }

  // Add to wishlist
  @Post(':bookId')
  async addToWishlist(
    @Request() req: any,
    @Param('bookId', ParseIntPipe) bookId: number
  ) {
    return this.wishlistService.addToWishlist(req.user.userId, bookId);
  }

  // Remove from wishlist
  @Delete(':bookId')
  async removeFromWishlist(
    @Request() req: any,
    @Param('bookId', ParseIntPipe) bookId: number
  ) {
    return this.wishlistService.removeFromWishlist(req.user.userId, bookId);
  }

  // Check if in wishlist
  @Get('check/:bookId')
  async checkInWishlist(
    @Request() req: any,
    @Param('bookId', ParseIntPipe) bookId: number
  ) {
    return this.wishlistService.checkInWishlist(req.user.userId, bookId);
  }
}
