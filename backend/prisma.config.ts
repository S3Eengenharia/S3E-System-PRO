import { defineConfig } from "prisma/config";
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  seed: {
    script: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});

