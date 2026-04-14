import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('S3_BUCKET') || '';

    this.s3 = new S3Client({
      region: this.config.get<string>('S3_REGION') || 'auto',
      endpoint: this.config.get<string>('S3_ENDPOINT') || 'https://storage.railway.app',
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY_ID') || '',
        secretAccessKey: this.config.get<string>('S3_SECRET_ACCESS_KEY') || '',
      },
      forcePathStyle: false, // Railway uses virtual-hosted style
    });
  }

  /**
   * Upload a file buffer to Railway Storage Bucket.
   * Returns the object key.
   */
  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return key;
  }

  /**
   * Generate a presigned URL for reading a private object.
   * Default expiry: 1 hour.
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  /**
   * Generate a presigned POST for direct client-side uploads.
   * Used for avatars, brand logos, banners, deal images.
   */
  async getPresignedPost(
    key: string,
    contentTypePrefix: string = 'image/',
    maxSizeBytes: number = 2_000_000, // 2MB default
  ) {
    const { url, fields } = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Expires: 3600,
      Conditions: [
        { bucket: this.bucket },
        ['eq', '$key', key],
        ['starts-with', '$Content-Type', contentTypePrefix],
        ['content-length-range', 1000, maxSizeBytes],
      ],
    });
    return { url, fields };
  }

  /**
   * Delete an object from the bucket.
   */
  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  /**
   * Generate the storage key for different asset types.
   */
  avatarKey(walletAddress: string): string {
    return `avatars/${walletAddress}.webp`;
  }

  brandLogoKey(brandId: string): string {
    return `brands/${brandId}/logo.webp`;
  }

  brandBannerKey(brandId: string): string {
    return `brands/${brandId}/banner.webp`;
  }

  dealImageKey(dealId: string): string {
    return `deals/${dealId}/image.webp`;
  }

  sponsorBannerKey(campaignId: string): string {
    return `campaigns/${campaignId}/banner.webp`;
  }
}
