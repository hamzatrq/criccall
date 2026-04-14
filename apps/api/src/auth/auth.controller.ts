import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce')
  async getNonce() {
    const nonce = await this.authService.generateNonce();
    return { nonce };
  }

  @Post('verify')
  async verify(@Body() body: { message: string; signature: string }) {
    return this.authService.verify(body.message, body.signature);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.authService.getUser(req.user.sub);
    return user;
  }
}
