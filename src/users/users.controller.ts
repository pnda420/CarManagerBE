import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Patch, 
    Delete, 
    HttpCode, 
    HttpStatus,
    UseGuards 
  } from '@nestjs/common';
  import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, UpdateUserDto } from './users.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
  
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    // Öffentliche Routen (keine Auth erforderlich)
    
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: CreateUserDto) {
      return this.usersService.create(dto);
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
      const user = await this.usersService.login(dto);
      return {
        message: 'Login successful',
        user,
        // TODO: Hier später JWT Token zurückgeben
        // token: this.authService.generateToken(user)
      };
    }
  
  
    // User Management Routen
    // Später: nur Admin oder der User selbst darf zugreifen
    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get()
    async findAll() {
      return this.usersService.findAll();
    }
  
    // @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.usersService.findOne(id);
    }
  
    // @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
      @Param('id') id: string, 
      @Body() dto: UpdateUserDto
    ) {
      return this.usersService.update(id, dto);
    }
  
    // @UseGuards(AdminGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
      return this.usersService.delete(id);
    }
  
    // Eigenes Profil abrufen (wenn eingeloggt)
    // @UseGuards(JwtAuthGuard)
    // @Get('me')
    // async getProfile(@CurrentUser() user: User) {
    //   return this.usersService.findOne(user.id);
    // }
  }