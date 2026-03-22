import { Controller, Post, Get, Put, Body, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RequireAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Register new user
  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string; phone?: string }
  ) {
    return this.usersService.register(body);
  }

  // Login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.usersService.login(body.email, body.password);
  }

  // Get current user profile (requires auth)
  @Get('profile')
  @UseGuards(RequireAuthGuard)
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  // Update profile (requires auth)
  @Put('profile')
  @UseGuards(RequireAuthGuard)
  async updateProfile(
    @Request() req: any,
    @Body() body: { name?: string; phone?: string }
  ) {
    return this.usersService.updateProfile(req.user.userId, body);
  }

  // Change password (requires auth)
  @Post('change-password')
  @UseGuards(RequireAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: any,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    return this.usersService.changePassword(req.user.userId, body.oldPassword, body.newPassword);
  }
}
