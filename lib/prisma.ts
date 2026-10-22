// lib/prisma.ts (atau lokasi file instansiasi Anda)
import { Pool } from 'pg';
import { PrismaClient } from '@/app/generated/prisma'; // Ubah dari /prisma/client ke /prisma
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Pastikan pg pool dibuat dengan benar untuk mendukung PrismaPg adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
