import { Injectable, Inject, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private sql: any,
    private authService: AuthService,
  ) {}

  // Register new user
  async register(userData: { name: string; email: string; password: string; phone?: string }) {
    // Check if user exists
    const existing = await this.sql`SELECT id FROM users WHERE email = ${userData.email}`;
    if (existing.length > 0) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(userData.password);

    // Create user
    const result = await this.sql`
      INSERT INTO users (name, email, password, phone)
      VALUES (${userData.name}, ${userData.email}, ${hashedPassword}, ${userData.phone || null})
      RETURNING id, name, email, phone, is_admin, created_at
    `;

    const user = result[0];
    const token = this.authService.generateToken(user.id, user.email);

    return {
      message: 'User registered successfully',
      user,
      token,
    };
  }

  // Login user
  async login(email: string, password: string) {
    // Find user
    const users = await this.sql`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = users[0];

    // Check password
    const isValid = await this.authService.comparePasswords(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.authService.generateToken(user.id, user.email);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        is_admin: user.is_admin,
      },
      token,
    };
  }

  // Get user profile
  async getProfile(userId: number) {
    const users = await this.sql`
      SELECT id, name, email, phone, is_admin, created_at 
      FROM users WHERE id = ${userId}
    `;
    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }
    return users[0];
  }

  // Update user profile
  async updateProfile(userId: number, userData: { name?: string; phone?: string }) {
    const result = await this.sql`
      UPDATE users 
      SET name = COALESCE(${userData.name}, name), 
          phone = COALESCE(${userData.phone}, phone),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING id, name, email, phone, is_admin
    `;
    if (result.length === 0) {
      throw new NotFoundException('User not found');
    }
    return result[0];
  }

  // Change password
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    // Get current user
    const users = await this.sql`SELECT password FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isValid = await this.authService.comparePasswords(oldPassword, users[0].password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.authService.hashPassword(newPassword);

    // Update password
    await this.sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`;

    return { message: 'Password changed successfully' };
  }
}
