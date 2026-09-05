import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// All seeded accounts use this password, for local testing once Phase 2 auth lands.
const SEED_PASSWORD = "password123";

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@glowhub.test" },
    update: {},
    create: {
      name: "Ada Admin",
      email: "admin@glowhub.test",
      phone: "+2348000000001",
      passwordHash,
      role: "ADMIN",
    },
  });

  const vendorUserA = await prisma.user.upsert({
    where: { email: "vendor.amaka@glowhub.test" },
    update: {},
    create: {
      name: "Amaka Okafor",
      email: "vendor.amaka@glowhub.test",
      phone: "+2348000000002",
      passwordHash,
      role: "VENDOR",
      vendorProfile: {
        create: {
          businessName: "Amaka's Glow Skincare",
          verificationStatus: "APPROVED",
          trustTier: "READY_STOCK",
          payoutAccountDetails: "GTBank 0123456789",
        },
      },
    },
    include: { vendorProfile: true },
  });

  const vendorUserB = await prisma.user.upsert({
    where: { email: "vendor.tunde@glowhub.test" },
    update: {},
    create: {
      name: "Tunde Bakare",
      email: "vendor.tunde@glowhub.test",
      phone: "+2348000000003",
      passwordHash,
      role: "VENDOR",
      vendorProfile: {
        create: {
          businessName: "Tunde's Bespoke Fashion",
          verificationStatus: "PENDING",
          trustTier: "MADE_TO_ORDER",
          payoutAccountDetails: "Zenith Bank 9876543210",
        },
      },
    },
    include: { vendorProfile: true },
  });

  const vendorA = vendorUserA.vendorProfile!;
  const vendorB = vendorUserB.vendorProfile!;

  const buyers = await Promise.all(
    [
      { name: "Chidinma Eze", email: "buyer.chidinma@glowhub.test", phone: "+2348000000004" },
      { name: "Femi Adeyemi", email: "buyer.femi@glowhub.test", phone: "+2348000000005" },
      { name: "Ngozi Umeh", email: "buyer.ngozi@glowhub.test", phone: "+2348000000006" },
    ].map((buyer) =>
      prisma.user.upsert({
        where: { email: buyer.email },
        update: {},
        create: { ...buyer, passwordHash, role: "BUYER" },
      }),
    ),
  );
  const [buyer1, buyer2] = buyers;

  const products = await Promise.all([
    prisma.product.create({
      data: {
        vendorId: vendorA.id,
        title: "Glow Vitamin C Serum",
        category: "SKINCARE",
        description: "Brightening serum with 15% vitamin C, 30ml.",
        price: 12500,
        images: ["https://picsum.photos/seed/glow-serum/600/600"],
        stockStatus: "IN_STOCK",
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendorA.id,
        title: "Hydrating Clay Face Mask",
        category: "SKINCARE",
        description: "Kaolin clay mask for oily and combination skin, 100g.",
        price: 8000,
        images: ["https://picsum.photos/seed/clay-mask/600/600"],
        stockStatus: "IN_STOCK",
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendorA.id,
        title: "Matte Liquid Lipstick Set",
        category: "MAKEUP",
        description: "Set of 3 long-wear matte liquid lipsticks.",
        price: 15000,
        images: ["https://picsum.photos/seed/lipstick-set/600/600"],
        stockStatus: "OUT_OF_STOCK",
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendorB.id,
        title: "Custom Ankara Two-Piece",
        category: "FASHION",
        description: "Made-to-measure Ankara top and wrapper set.",
        price: 45000,
        images: ["https://picsum.photos/seed/ankara-set/600/600"],
        stockStatus: "IN_STOCK",
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendorB.id,
        title: "Beaded Wedding Sandals",
        category: "SHOES",
        description: "Handmade beaded sandals, made to order per size.",
        price: 22000,
        images: ["https://picsum.photos/seed/beaded-sandals/600/600"],
        stockStatus: "IN_STOCK",
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendorB.id,
        title: "Gold-Plated Statement Earrings",
        category: "ACCESSORIES",
        description: "Oversized gold-plated hoop earrings.",
        price: 9500,
        images: ["https://picsum.photos/seed/gold-earrings/600/600"],
        stockStatus: "IN_STOCK",
      },
    }),
  ]);
  const [serum, , , ankaraSet] = products;

  // Order 1: still at checkout, nothing paid yet.
  await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      vendorId: vendorA.id,
      productId: serum.id,
      quantity: 1,
      totalAmount: serum.price,
      status: "PENDING_PAYMENT",
      escrowTransaction: {
        create: {
          amountHeld: serum.price,
          releasePercentageOnDispatch: 80,
          status: "HELD",
        },
      },
    },
  });

  // Order 2: paid and dispatched — vendor has submitted proof, partial release logged.
  const dispatchedOrder = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      vendorId: vendorB.id,
      productId: ankaraSet.id,
      quantity: 1,
      totalAmount: ankaraSet.price,
      status: "DISPATCHED",
      escrowTransaction: {
        create: {
          amountHeld: ankaraSet.price,
          amountReleasedToVendor: ankaraSet.price.times(0.8),
          releasePercentageOnDispatch: 80,
          status: "PARTIALLY_RELEASED",
        },
      },
      dispatchProofs: {
        create: {
          courierName: "GIG Logistics",
          waybillNumber: "GIG-000123456",
          submittedById: vendorB.id,
        },
      },
    },
  });

  await prisma.payout.create({
    data: {
      vendorId: vendorB.id,
      orderId: dispatchedOrder.id,
      amount: ankaraSet.price.times(0.8),
      status: "COMPLETED",
      paymentReference: "PSK-SEED-000001",
    },
  });

  console.log({
    admin: admin.email,
    vendors: [vendorUserA.email, vendorUserB.email],
    buyers: buyers.map((b) => b.email),
    products: products.length,
    seedPassword: SEED_PASSWORD,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
