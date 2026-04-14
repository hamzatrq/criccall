import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Brand profile not found');
    }
    return profile;
  }

  async createProfile(
    userId: string,
    data: {
      brandName: string;
      description?: string;
      category: string;
      brandUrl?: string;
    },
  ) {
    const existing = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('Brand profile already exists');
    }

    return this.prisma.brandProfile.create({
      data: {
        userId,
        brandName: data.brandName,
        description: data.description,
        category: data.category,
        brandUrl: data.brandUrl,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: {
      brandName?: string;
      description?: string;
      category?: string;
      brandUrl?: string;
      brandLogo?: string;
      brandBanner?: string;
    },
  ) {
    const profile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Brand profile not found');
    }

    return this.prisma.brandProfile.update({
      where: { userId },
      data,
    });
  }
}
