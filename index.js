#!/usr/bin/env node
import { intro, confirm, spinner, outro, select } from "@clack/prompts";
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

  outro(chalk.green(`${figures.info} Your Project Setup is ready`));
}

main();
