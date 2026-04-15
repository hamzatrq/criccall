import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: { sub: string; wallet: string; role: string }) {
    return this.usersService.getMe(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('me/sync-balance')
  @UseGuards(JwtAuthGuard)
  syncBalance(@CurrentUser() user: { sub: string; wallet: string; role: string }) {
    return this.usersService.syncBalance(user.sub);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: MAX_AVATAR_SIZE },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }
    return this.usersService.uploadAvatar(user.sub, user.wallet, file);
  }

  @Get('me/predictions')
  @UseGuards(JwtAuthGuard)
  getPredictions(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getPredictions(user.sub, page, limit);
  }

  @Get('me/rewards')
  @UseGuards(JwtAuthGuard)
  getRewards(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
  ) {
    return this.usersService.getRewards(user.sub);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  getStats(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
  ) {
    return this.usersService.getStats(user.sub);
  }

  @Get('leaderboard')
  getLeaderboard(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getLeaderboard(page, limit);
  }

  @Get(':address')
  getPublicProfile(@Param('address') address: string) {
    return this.usersService.getPublicProfile(address);
  }
}
