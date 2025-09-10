"use client";

import Link from "next/link";

import { BookOpen, LogIn } from "lucide-react";

import Star40 from "@/components/stars/s40";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="h-screen h-full w-screen flex overflow-y-auto">
      <div className="flex flex-col w-screen items-center pt-30 pb-10">
        <div className="flex flex-col min-w-md max-w-md gap-4 px-8">
          <div className="flex flex-row gap-4">
            <h1 className="text-3xl text-rose-500 dark:text-rose-400 font-heading">
              Welcome to vibecheck
            </h1>
            <Star40
              className="text-rose-500 dark:text-rose-400 motion-safe:animate-spin"
              pathClassName="stroke-black dark:stroke-white"
              size={40}
              strokeWidth={0}
            />
          </div>
          <p>
            vibecheck is the place to be for creating and sharing personality
            quizzes, whether a fun quiz for your friends or a more intensive,
            calculated assessment.
          </p>

          <div className="mt-4 flex flex-row gap-2 items-center">
            <Link href="/login">
              <Button variant="default">
                <LogIn />
                Log in
              </Button>
            </Link>
            <Link href="https://github.com/awesomeosep/vibecheck/wiki">
              <Button variant="neutral">
                <BookOpen />
                Read the Docs
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-foreground/70">
            * Legal disclaimer: good vibes only. We are not responsible for any
            bad energy you may encounter.
          </p>
        </div>
      </div>
    </div>
  );
}
