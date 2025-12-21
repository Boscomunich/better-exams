import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  async updateAvailableStorage(
    userId: string,
    bytes: bigint,
    direction: 'INCREASE' | 'DECREASE',
  ): Promise<void> {
    await this.prisma.storageUsage.update({
      where: { userId },
      data: {
        usedBytes:
          direction === 'INCREASE'
            ? { increment: bytes }
            : { decrement: bytes },
      },
    });
  }
}
