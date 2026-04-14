import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VALID_ROLES = ['user', 'sponsor', 'super_admin'];

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async setUserRole(walletAddress: string, role: string) {
    if (!VALID_ROLES.includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}. Valid roles: ${VALID_ROLES.join(', ')}`);
    }

    const user = await this.prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException(`User with wallet ${walletAddress} not found`);
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { role },
      select: {
        id: true,
        walletAddress: true,
        role: true,
        displayName: true,
      },
    });
  }
}
