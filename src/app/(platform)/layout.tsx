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

const queryClient = new QueryClient();

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex-col flex items-center gap-8 w-full">
      <div className="absolute top-0 block w-full max-w-[700px]">
        <NavigationMenu className="z-5 mt-5 ml-5 mr-5 block max-w-full!">
          <NavigationMenuList className="px-4! flex items-center justify-between">
            <NavigationMenuItem className="items-center flex flex-row w-full w-fit">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={20}
                className="mx-auto"
              />
            </NavigationMenuItem>
            <div className="flex flex-row items-center gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="sm:block hidden">
                <NavigationMenuLink asChild>
                  <Link href="https://ui.shadcn.com/docs">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="https://ui.shadcn.com/docs">Settings</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </div>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
}
