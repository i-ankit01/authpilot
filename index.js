#!/usr/bin/env node
import {
  intro,
  confirm,
  spinner,
  outro,
  select,
  multiselect,
} from "@clack/prompts";
import { exec } from "child_process";
import { promises as fs } from "fs";
import { promisify } from "util";
import chalk from "chalk";
import figures from "figures";
import { fileURLToPath } from "url";
import path from "path";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cancelFunction(value) {
  if (!value) {
    outro(chalk.yellow(`${figures.warning} Installation cancelled.`));
    process.exit(0);
  }
}

async function hasSrcDirectory() {
  try {
    const stats = await fs.stat("src");
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
}

const srcExists = await hasSrcDirectory();

async function overrideSchema(srcExists, dbType) {
  const schemaPath = srcExists
    ? path.join(process.cwd(), "src", "prisma", "schema.prisma")
    : path.join(process.cwd(), "prisma", "schema.prisma");

  const templatePath = path.join(__dirname, "templates", `${dbType}.prisma`);

  const templateContent = await fs.readFile(templatePath, "utf-8");
  await fs.writeFile(schemaPath, templateContent);
}



function configureImportName(str) {
  return str+"Provider";
}
function buildProvidersCode(selected) {
  const importLines = selected.map(
    (p) => `import ${configureImportName(p)} from "next-auth/providers/${p.toLowerCase()}"`
  );

  const providerInstances = selected.map(
    (p) => `${configureImportName(p)}({
      clientId: process.env.${p.toUpperCase()}_CLIENT_ID!,
      clientSecret: process.env.${p.toUpperCase()}_CLIENT_SECRET!,
    })`
  );

  return `
${importLines.join("\n")}
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    ${providerInstances.join(",\n    ")}
  ],
} satisfies NextAuthConfig;
`;
}


async function generateAuthConfig(selectedProviders) {
  const code = buildProvidersCode(selectedProviders);

  const targetPath = path.join(process.cwd(), "auth.config.ts");
  await fs.writeFile(targetPath, code);
}


async function main() {
  intro(chalk.cyan(`${figures.play} AuthPilot CLI`));

  const dbType = await select({
    message: "Pick Your Database",
    options: [
      { value: "postgresql", label: "PostgeSQL" },
      { value: "mongodb", label: "MongoDB" },
    ],
  });

  cancelFunction(dbType);

  const s = spinner();

  try {
    s.start("Initialzing Prisma...");
    await execAsync("npm install prisma --save-dev");
    await execAsync("npm install @prisma/client");
    await execAsync("npx prisma init");
    s.stop(chalk.green(`${figures.tick} Prisma initialized successfully!`));
  } catch (err) {
    s.stop(chalk.red(`${figures.cross} Installation failed.`));
    outro(chalk.red(err.message));
  }

  const confirmOverwrite = await confirm({
    message: "Do you want to overwrite your schema.prisma file?",
    initialValue: true,
  });

  cancelFunction(confirmOverwrite);

  try {
    s.start("Updating schema.prisma");
    await overrideSchema(srcExists, dbType);
    s.stop(chalk.green(`${figures.tick} Updated schema.prisma!`));
  } catch (error) {
    s.stop(chalk.red(`${figures.cross} Update failed.`));
    outro(chalk.red(err.message));
    process.exit(1);
  }

  const providers = await multiselect({
    message: "Select the authentication providers you want to use:",
    options: [
      { value: "Credentials", label: "Credentials" },
      { value: "Google", label: "Google", hint: "recommended" },
      { value: "GitHub", label: "GitHub" },
      { value: "Facebook", label: "FaceBook" },
      { value: "Discord", label: "Discord" },
      { value: "LinkedIn", label: "LinkedIn" },
      { value: "Reddit", label: "Reddit" },
      { value: "Twitter", label: "Twitter" },
      { value: "Twitch", label: "Twitch" },
    ],
    required: false,
  });

  try {
    s.start("Creating auth.config.ts");
    await generateAuthConfig(providers)
    s.stop(chalk.green(`${figures.tick} Created auth.config.ts file!`));
  } catch (error) {
    s.stop(chalk.red(`${figures.cross} Creation failed.`));
    outro(chalk.red(err.message));
    process.exit(1);
  }

  outro(chalk.green(`${figures.info} Your Project Setup is ready`));
}

main();
