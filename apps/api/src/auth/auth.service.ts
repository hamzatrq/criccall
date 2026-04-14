import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SiweMessage } from 'siwe';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async generateNonce(): Promise<string> {
    const nonce = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.nonce.create({
      data: { nonce, expiresAt },
    });

    // Clean up expired nonces (bounded to 100 to avoid unbounded deletes)
    await this.prisma.nonce.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return nonce;
  }

  async verify(
    message: string,
    signature: string,
  ): Promise<{ accessToken: string; user: { id: string; walletAddress: string; role: string } }> {
    let fields: any;

    try {
      const siweMessage = new SiweMessage(message);
      const result = await siweMessage.verify({ signature });
      fields = result.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid SIWE message or signature');
    }

    // Verify nonce exists and is not expired
    const nonceRecord = await this.prisma.nonce.findUnique({
      where: { nonce: fields.nonce },
    });

    if (!nonceRecord || nonceRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }

    // Delete used nonce
    await this.prisma.nonce.delete({ where: { id: nonceRecord.id } });

    // Find or create user
    const walletAddress = fields.address.toLowerCase();
    let user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { walletAddress },
      });
    }

    // Issue JWT
    const payload = {
      sub: user.id,
      wallet: user.walletAddress,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
      },
    };
  }

  async getUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
