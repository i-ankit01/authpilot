# Follow the steps :

## Update your layout.tsx with SessionProvider

```bash
import { SessionProvider } from "next-auth/react"; // <============
import { auth } from "@/auth"; // <============


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth(); // <============
  return (
    <html lang="en">
      <SessionProvider session={session}> // <============
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      </SessionProvider>
    </html>
  );
}
```

## Create a signin button on home page

```bash

<Link
    href="/api/auth/signin?callbackUrl=/dashboard"
    className="rounded-full font-mono border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-6 sm:h-8 px-4 sm:px-5 sm:w-auto">
    Sign in
</Link>

```
