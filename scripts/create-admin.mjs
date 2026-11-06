import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

// Parse .env manually
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  process.env[key] = val;
}

const bcrypt = require('bcryptjs');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('.prisma/client');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Tạo/update admin account
  const hash = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rewore.vn' },
    update: { password: hash, role: 'ADMIN', isVerified: true, name: 'Eleanor Vance' },
    create: {
      email: 'admin@rewore.vn',
      password: hash,
      name: 'Eleanor Vance',
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin account:', admin.email, '| role:', admin.role);

  // 2. Tạo/update seller account test
  const sellerHash = await bcrypt.hash('Seller@123456', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@rewore.vn' },
    update: { password: sellerHash, role: 'SELLER', isVerified: true, name: 'Minh Tú Shop' },
    create: {
      email: 'seller@rewore.vn',
      password: sellerHash,
      name: 'Minh Tú Shop',
      role: 'SELLER',
      isVerified: true,
    },
  });
  console.log('✅ Seller account:', seller.email, '| role:', seller.role);

  // 3. Tạo SellerProfile cho seller nếu chưa có
  const existingProfile = await prisma.sellerProfile.findUnique({ where: { userId: seller.id } });
  if (!existingProfile) {
    const profile = await prisma.sellerProfile.create({
      data: {
        userId: seller.id,
        shopName: 'Minh Tú Vintage',
        idCardFrontUrl: 'https://placehold.co/800x500?text=ID+Front',
        idCardBackUrl: 'https://placehold.co/800x500?text=ID+Back',
        selfieUrl: 'https://placehold.co/800x500?text=Selfie',
        bankAccountName: 'NGUYEN MINH TU',
        bankAccountNumber: '0123456789',
        bankName: 'Vietcombank',
        pickupAddress: '123 Lê Lợi, Quận 1, TP.HCM',
        status: 'APPROVED',
      },
    });
    console.log('✅ SellerProfile created:', profile.id, '| status:', profile.status);
  } else {
    console.log('ℹ️  SellerProfile already exists:', existingProfile.id, '| status:', existingProfile.status);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});

