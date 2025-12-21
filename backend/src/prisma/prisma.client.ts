import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

export const prismaClient = new PrismaClient().$extends(withAccelerate());
