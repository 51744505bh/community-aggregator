import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const ownerEmail = process.env.ADMIN_OWNER_EMAIL;
  if (!ownerEmail) {
    console.error("ADMIN_OWNER_EMAIL 환경변수를 설정해주세요.");
    process.exit(1);
  }

  const email = ownerEmail.toLowerCase().trim();

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {
      role: "OWNER",
      status: "ACTIVE",
    },
    create: {
      email,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  console.log(`Owner 계정 생성/업데이트 완료: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
