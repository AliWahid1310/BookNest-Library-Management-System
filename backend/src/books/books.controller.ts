import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // GET /api/books - Get all books
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('available') available?: string,
  ) {
    return this.booksService.findAll(category, search, available);
  }

  // GET /api/books/categories - Get all categories
  @Get('categories')
  async getCategories() {
    return this.booksService.getCategories();
  }

  // GET /api/books/:id - Get single book
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.booksService.findOne(parseInt(id));
  }

  // POST /api/books - Create new book
  @Post()
  async create(@Body() bookData: any) {
    return this.booksService.create(bookData);
  }

  // PUT /api/books/:id - Update book
  @Put(':id')
  async update(@Param('id') id: string, @Body() bookData: any) {
    return this.booksService.update(parseInt(id), bookData);
  }

  // DELETE /api/books/:id - Delete book
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.booksService.remove(parseInt(id));
  }
}
