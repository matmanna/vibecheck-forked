"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Image from "next/image";

import { GithubIcon } from "lucide-react";

import { ThemeSwitcher } from "@/components/theme-switcher";

const queryClient = new QueryClient();

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex-col flex items-center gap-8 w-full">
      <div className="absolute top-0 block px-5 items-center flex flex-col">
        <NavigationMenu className="z-5 mt-5 block text-main-foreground">
          <NavigationMenuList className="px-4! flex items-center justify-between gap-6">
            <NavigationMenuItem className="items-center flex flex-row w-full w-fit">
              <Link href="/" className="sr-only">
                Vibecheck Home
              </Link>
              <Link href="/">
                <Image
                  src="/logo.svg"
                  alt="Vibecheck Logo with Sparkles"
                  width={144}
                  height={22}
                  className="mx-auto"
                />
              </Link>
            </NavigationMenuItem>
            <div className="flex flex-row py-2 items-center gap-2 underline-offset-4">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/me">home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="sm:block hidden">
                <NavigationMenuLink asChild>
                  <Link href="https://github.com/awesomeosep/vibecheck/wiki">
                    docs
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/settings">settings</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <ThemeSwitcher />
              <Link
                href="https://github.com/awesomeosep/vibecheck"
                className="p-2 "
              >
                <GithubIcon className="w-6 h-6" />
              </Link>
            </div>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
}
