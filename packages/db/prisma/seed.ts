/**
 * Seed de développement — à exécuter avec `pnpm db:seed`
 * Crée un utilisateur admin et quelques produits de test.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Utilisateur admin de développement
  const admin = await prisma.user.upsert({
    where: { email: "admin@patrimoine.local" },
    update: {},
    create: {
      email: "admin@patrimoine.local",
      name: "Administrateur",
      password: "$2b$12$placeholder.hash.for.dev.only", // À remplacer par un vrai hash
      role: "ADMIN",
    },
  });

  // Utilisateur analyste de développement
  const analyst = await prisma.user.upsert({
    where: { email: "analyste@patrimoine.local" },
    update: {},
    create: {
      email: "analyste@patrimoine.local",
      name: "Jean Dupont",
      password: "$2b$12$placeholder.hash.for.dev.only",
      role: "ANALYST",
    },
  });

  console.warn(`Seed complete: admin=${admin.id}, analyst=${analyst.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
