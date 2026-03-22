import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard, RequireAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Get reviews for a book (public)
  @Get('book/:bookId')
  async getBookReviews(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.reviewsService.getBookReviews(bookId);
  }

  // Get user's reviews (requires auth)
  @Get('user')
  @UseGuards(RequireAuthGuard)
  async getUserReviews(@Request() req: any) {
    return this.reviewsService.getUserReviews(req.user.userId);
  }

  // Create review (requires auth)
  @Post()
  @UseGuards(RequireAuthGuard)
  async createReview(
    @Request() req: any,
    @Body() body: { bookId: number; rating: number; comment?: string }
  ) {
    return this.reviewsService.createReview(
      req.user.userId,
      body.bookId,
      body.rating,
      body.comment
    );
  }

  // Update review (requires auth)
  @Put(':id')
  @UseGuards(RequireAuthGuard)
  async updateReview(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rating: number; comment?: string }
  ) {
    return this.reviewsService.updateReview(req.user.userId, id, body.rating, body.comment);
  }

  // Delete review (requires auth)
  @Delete(':id')
  @UseGuards(RequireAuthGuard)
  async deleteReview(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.reviewsService.deleteReview(req.user.userId, id);
  }
}
