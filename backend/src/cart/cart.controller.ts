import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { RequireAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(RequireAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  // Get user's cart
  @Get()
  async getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  // Add item to cart
  @Post()
  async addToCart(
    @Request() req: any,
    @Body() body: { bookId: number; quantity?: number }
  ) {
    return this.cartService.addToCart(req.user.userId, body.bookId, body.quantity || 1);
  }

  // Update cart item quantity
  @Put(':id')
  async updateQuantity(
    @Request() req: any,
    @Param('id', ParseIntPipe) cartId: number,
    @Body() body: { quantity: number }
  ) {
    return this.cartService.updateQuantity(req.user.userId, cartId, body.quantity);
  }

  // Remove item from cart
  @Delete(':id')
  async removeFromCart(
    @Request() req: any,
    @Param('id', ParseIntPipe) cartId: number
  ) {
    return this.cartService.removeFromCart(req.user.userId, cartId);
  }

  // Clear cart
  @Delete()
  async clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }
}
