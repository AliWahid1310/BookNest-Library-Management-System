import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ContactModule } from './contact/contact.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Database connection
    DatabaseModule,
    // Feature modules
    AuthModule,
    BooksModule,
    UsersModule,
    CartModule,
    ReservationsModule,
    ReviewsModule,
    ContactModule,
    WishlistModule,
  ],
})
export class AppModule {}
