import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IsString, IsIn } from 'class-validator';

class SetRoleDto {
  @IsString()
  @IsIn(['user', 'sponsor', 'super_admin'])
  role: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users/:walletAddress/role')
  async setUserRole(
    @Param('walletAddress') walletAddress: string,
    @Body() body: SetRoleDto,
  ) {
    return this.adminService.setUserRole(walletAddress, body.role);
  }
}
