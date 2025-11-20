#!/usr/bin/env node
import {
  intro,
  confirm,
  spinner,
  outro,
  select,
  multiselect,
  text,
  isCancel,
  cancel,
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
const args = process.argv.slice(2);
const command = args[0];

if (command === "init") {
  function cancelFunction(value) {
    if (!value) {
      outro(chalk.yellow(`${figures.warning} Installation cancelled.`));
      process.exit(1);
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

  async function overrideSchema(dbType) {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

    const templatePath = path.join(
      __dirname,
      "templates",
      "schemas",
      `${dbType}.prisma`
    );

    const templateContent = await fs.readFile(templatePath, "utf-8");
    await fs.writeFile(schemaPath, templateContent);
  }

  async function createPrismaInstance(srcExists) {
    const libPath = srcExists
      ? path.join(process.cwd(), "src", "lib")
      : path.join(process.cwd(), "lib");

    await fs.mkdir(libPath, { recursive: true });

    const templatePath = path.join(
      __dirname,
      "templates",
      "schemas",
      "dbTemplate.ts"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    const targetPath = path.join(libPath, "db.ts");
    await fs.writeFile(targetPath, templateContent, "utf-8");
  }

  async function askForDatabaseUrl() {
    const databaseUrl = await text({
      message: "Enter your DATABASE_URL:",
      placeholder: "e.g. postgresql://user:password@localhost:5432/mydb",
      validate(value) {
        if (!value) return "DATABASE_URL cannot be empty";
        if (!/^postgresql|mysql|mongodb|sqlite/.test(value)) {
          return "It should start with postgresql://, mysql://, etc.";
        }
      },
    });

    if (isCancel(databaseUrl)) {
      cancel("Setup cancelled.");
      process.exit(0);
    }

    return databaseUrl;
  }

  async function writeDatabaseUrlInEnv(databaseUrl) {
    const code = `DATABASE_URL="${databaseUrl}"`;

    const targetPath = path.join(process.cwd(), ".env");
    await fs.writeFile(targetPath, code);
  }

  async function updatePrismaConfigFile() {
    const configPath = path.join(process.cwd(), "prisma.config.ts");

    const templatePath = path.join(
      __dirname,
      "templates",
      "schemas",
      "prismaConfigTemplate.ts"
    );

    const templateContent = await fs.readFile(templatePath, "utf-8");
    await fs.writeFile(configPath, templateContent);
  }

  async function resetDb() {
    const shouldContinue = await confirm({
      message:
        chalk.red(
          "Database migration failed. Do you want to RESET the database?"
        ) +
        "\n" +
        chalk.yellow("(This will permanently delete data)"),
    });

    if (isCancel(shouldContinue) || !shouldContinue) {
      cancel("Database reset aborted.");
      return false;
    }

    return true;
  }

  function buildProvidersCode(selected) {
    const importLines = selected.map(
      (p) => `import ${p} from "next-auth/providers/${p.toLowerCase()}"`
    );

    const providerInstances = selected.map(
      (p) => `${p}({
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

  async function generateAuthConfig(srcExists, selectedProviders) {
    const code = buildProvidersCode(selectedProviders);

    const targetPath = srcExists
      ? path.join(process.cwd(), "src", "auth.config.ts")
      : path.join(process.cwd(), "auth.config.ts");
    await fs.writeFile(targetPath, code);
  }

  async function generateAuthActions(srcExists) {
    const actionsDir = srcExists
      ? path.join(process.cwd(), "src", "actions", "auth")
      : path.join(process.cwd(), "actions", "auth");

    await fs.mkdir(actionsDir, { recursive: true });

    const templatePath = path.join(
      __dirname,
      "templates",
      "auth",
      "authActionsTemplate.ts"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    const targetPath = path.join(actionsDir, "index.ts");
    await fs.writeFile(targetPath, templateContent, "utf-8");
  }

  async function generateAuthFile(srcExists) {
    const authFilePath = srcExists
      ? path.join(process.cwd(), "src", "auth.ts")
      : path.join(process.cwd(), "auth.ts");

    const templatePath = path.join(
      __dirname,
      "templates",
      "auth",
      "authTemplate.ts"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    await fs.writeFile(authFilePath, templateContent, "utf-8");
  }

  async function createAuthRoute(srcExists) {
    const authRouteDir = srcExists
      ? path.join(process.cwd(), "src", "app", "api", "auth", "[...nextauth]")
      : path.join(process.cwd(), "app", "api", "auth", "[...nextauth]");

    await fs.mkdir(authRouteDir, { recursive: true });

    const templatePath = path.join(
      __dirname,
      "templates",
      "auth",
      "authRouteTemplate.ts"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    const targetPath = path.join(authRouteDir, "route.ts");
    await fs.writeFile(targetPath, templateContent, "utf-8");
  }

  async function createMiddlewareFile(srcExists) {
    const middelwarePath = srcExists
      ? path.join(process.cwd(), "src", "proxy.ts")
      : path.join(process.cwd(), "proxy.ts");

    const templatePath = path.join(
      __dirname,
      "templates",
      "auth",
      "middlewareTemplate.ts"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    await fs.writeFile(middelwarePath, templateContent, "utf-8");
  }

  function buildEnvCode(selectedProviders, databaseUrl) {
    const header = [
      `DATABASE_URL="${databaseUrl}"`,
      `NEXTAUTH_URL=http://localhost:3000`,
      `NEXTAUTH_SECRET=secret_token`,
      "",
    ];

    const providerLines = selectedProviders.flatMap((p) => [
      `${p.toUpperCase()}_CLIENT_ID=`,
      `${p.toUpperCase()}_CLIENT_SECRET=`,
      "",
    ]);

    return [...header, ...providerLines].join("\n");
  }

  async function updateEnvFile(selectedProviders, databaseUrl) {
    const code = buildEnvCode(selectedProviders, databaseUrl);

    const targetPath = path.join(process.cwd(), ".env");
    await fs.writeFile(targetPath, code);
  }

  async function createUserHook(srcExists) {
    const hookPath = srcExists
      ? path.join(process.cwd(), "src", "hooks")
      : path.join(process.cwd(), "hooks");

    await fs.mkdir(hookPath, { recursive: true });

    const templatePath = path.join(
      __dirname,
      "templates",
      "auth",
      "useCurrentUserHookTemplate.ts"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    const targetPath = path.join(hookPath, "use-current-user.ts");
    await fs.writeFile(targetPath, templateContent, "utf-8");
  }

  async function updateRootLayout(srcExists) {
    const layoutFilePath = srcExists
      ? path.join(process.cwd(), "src", "app", "layout.tsx")
      : path.join(process.cwd(), "app", "layout.tsx");

    const templatePath = path.join(
      __dirname,
      "templates",
      "ui",
      "rootLayoutTemplate.tsx"
    );

    const templateContent = await fs.readFile(templatePath, "utf-8");
    await fs.writeFile(layoutFilePath, templateContent);
  }

  async function updateRootPage(srcExists) {
    const rootPagePath = srcExists
      ? path.join(process.cwd(), "src", "app", "page.tsx")
      : path.join(process.cwd(), "app", "page.tsx");

    const templatePath = path.join(
      __dirname,
      "templates",
      "ui",
      "landingPageTemplate.tsx"
    );

    const templateContent = await fs.readFile(templatePath, "utf-8");
    await fs.writeFile(rootPagePath, templateContent);
  }

  async function createDashboardPage(srcExists) {
    const dashboardDir = srcExists
      ? path.join(process.cwd(), "src", "app", "dashboard")
      : path.join(process.cwd(), "app", "dashboard");

    await fs.mkdir(dashboardDir, { recursive: true });

    const templatePath = path.join(
      __dirname,
      "templates",
      "ui",
      "dashboardTemplate.tsx"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    const targetPath = path.join(dashboardDir, "page.tsx");
    await fs.writeFile(targetPath, templateContent, "utf-8");
  }

  async function createUserGuide(srcExists) {
    const guidePath = srcExists
      ? path.join(process.cwd(), "src", "userGuide.md")
      : path.join(process.cwd(), "userGuide.md");

    const templatePath = path.join(
      __dirname,
      "templates",
      "ui",
      "userGuide.md"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    await fs.writeFile(guidePath, templateContent, "utf-8");
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

    if (isCancel(dbType)) {
      outro(chalk.yellow(`${figures.warning} Installation cancelled.`));
      process.exit(1);
    }

    const providers = await multiselect({
      message:
        "Select the authentication providers you want to use: (Use space key to select)",
      options: [
        // { value: "Credentials", label: "Credentials" },
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

    if (isCancel(providers)) {
      outro(chalk.yellow(`${figures.warning} Installation cancelled.`));
      process.exit(1);
    }

    const s = spinner();
    try {
      s.start("Initialzing Prisma...");
      await execAsync("npm install prisma@6.16.0 @prisma/client@6.16.0 --save-dev");
      await execAsync("npx prisma init");

      await createPrismaInstance(srcExists);

      s.stop(chalk.green(`${figures.tick} Prisma initialized successfully!`));
    } catch (error) {
      s.stop(chalk.red(`${figures.cross} Installation failed.`));
      outro(chalk.red(error.message));
    }

    const confirmOverwrite = await confirm({
      message: "Do you want to overwrite your schema.prisma file?",
      initialValue: true,
    });

    cancelFunction(confirmOverwrite);

    try {
      s.start("Updating schema.prisma");
      await overrideSchema(dbType);
      s.stop(chalk.green(`${figures.tick} Updated schema.prisma!`));
    } catch (error) {
      s.stop(chalk.red(`${figures.cross} Update failed.`));
      outro(chalk.red(error.message));
      process.exit(1);
    }

    try {
      const databaseUrl = await askForDatabaseUrl();
      await writeDatabaseUrlInEnv(databaseUrl);
      await updateEnvFile(providers, databaseUrl);
      await updatePrismaConfigFile();
      console.log(
        chalk.green(`${figures.tick} Updated .env with DATABASE_URL!`)
      );
    } catch (error) {
      outro(chalk.red(error.message));
      process.exit(1);
    }

    if (dbType == "postgresql") {
      try {
        s.start("Generating prisma client");
        await execAsync("npx prisma migrate dev --name init");
        await execAsync("npx prisma generate");
        s.stop(chalk.green(`${figures.tick} Generated prisma client!`));
      } catch (error) {
        s.stop(chalk.red(`${figures.cross} Generation failed.`));

        const wantReset = await resetDb();
        if (wantReset) {
          s.start("Resetting database");
          await execAsync("npx prisma migrate reset --force");
          await execAsync("npx prisma migrate dev --name init");
          await execAsync("npx prisma generate");
          s.stop(chalk.green(`${figures.tick} Generated prisma client!`));
        } else {
          outro(chalk.red(error.message));
          process.exit(1);
        }
      }
    } else {
      try {
        s.start("Generating prisma client");
        await execAsync("npx prisma db push");
        await execAsync("npx prisma generate");
        s.stop(chalk.green(`${figures.tick} Generated prisma client!`));
      } catch (error) {
        s.stop(chalk.red(`${figures.cross} Generation failed.`));

        const wantReset = await resetDb();
        if (wantReset) {
          s.start("Resetting database");
          await prisma.$runCommandRaw({ dropDatabase: 1 });
          await execAsync("npx prisma db push");
          await execAsync("npx prisma generate");
          s.stop(chalk.green(`${figures.tick} Generated prisma client!`));
        } else {
          outro(chalk.red(error.message));
          process.exit(1);
        }
      }
    }

    try {
      s.start("Installing Next-Auth v5(beta) & Prisma Adapter");
      await execAsync("npm install next-auth@beta @auth/prisma-adapter");
      await execAsync("npm install lucide-react");
      s.stop(
        chalk.green(
          `${figures.tick} Installed Next-Auth v5(beta) & Prisma Adapter`
        )
      );
    } catch (error) {
      s.stop(chalk.red(`${figures.cross} Installation failed.`));
      outro(chalk.red(error.message));
      process.exit(1);
    }

    try {
      s.start("Creating auth.config.ts & actions/auth file!");
      await generateAuthConfig(srcExists, providers);
      await generateAuthActions(srcExists);
      s.stop(
        chalk.green(
          `${figures.tick} Created auth.config.ts & actions/auth file!`
        )
      );
    } catch (error) {
      s.stop(chalk.red(`${figures.cross} Creation failed.`));
      outro(chalk.red(error.message));
      process.exit(1);
    }

    try {
      s.start("Creating auth.ts & api/auth/[...nextauth]/routes.ts file!");
      await generateAuthFile(srcExists);
      await createAuthRoute(srcExists);
      s.stop(
        chalk.green(
          `${figures.tick} Created auth.ts & api/auth/[...nextauth]/routes.ts file!`
        )
      );
    } catch (error) {
      s.stop(chalk.red(`${figures.cross} Creation failed.`));
      outro(chalk.red(error.message));
      process.exit(1);
    }

    try {
      s.start("Creating middleware.ts file!");
      await createMiddlewareFile(srcExists);
      s.stop(chalk.green(`${figures.tick} Created middleware.ts file!`));
    } catch (error) {
      s.stop(chalk.red(`${figures.cross} Creation failed.`));
      outro(chalk.red(error.message));
      process.exit(1);
    }

    const confirmRootOverwrite = await confirm({
      message: "Do you want to overwrite your root page.tsx and layout.tsx?",
      initialValue: true,
    });

    if (confirmRootOverwrite) {
      try {
        s.start("Updating layout.tsx and page.tsx!");
        await updateRootLayout(srcExists);
        await createUserHook(srcExists);
        await updateRootPage(srcExists);
        s.stop(
          chalk.green(
            `${figures.tick} Updated layout.tsx with SessionProvider !`
          )
        );
      } catch (error) {
        s.stop(chalk.red(`${figures.cross} Update failed.`));
        outro(chalk.red(error.message));
        process.exit(1);
      }
    } else {
      try {
        s.start("Creating User Guide");
        await createUserGuide(srcExists);
        s.stop(
          chalk.yellow(
            `${figures.tick} Created userGuide.md please go through the steps !`
          )
        );
      } catch (error) {
        s.stop(chalk.red(`${figures.cross} creation failed.`));
        outro(chalk.red(error.message));
        process.exit(1);
      }
    }

    try {
      s.start("Creating Dashboard & Current User Hook!");
      await createDashboardPage(srcExists);
      s.stop(
        chalk.green(`${figures.tick} Created Dashboard & Current User Hook !`)
      );
    } catch (error) {
      s.stop(chalk.red(`${figures.cross} Update failed.`));
      outro(chalk.red(error.message));
      process.exit(1);
    }

    try {
      outro(
        [
          chalk.yellow("Update your .env variables and run the dev server"),
        ].join("\n")
      );
    } catch (error) {
      outro(chalk.red(error.message));
      process.exit(1);
    }

    outro(chalk.green(`${figures.info} Your Project Setup is ready`));
  }

  main();
} else {
  outro(chalk.red(`${figures.info} Incorrect command try npx authpilot init`));
  process.exit(1);
}
