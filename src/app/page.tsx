"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/quiz/1");
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Button>Start</Button>
    </div>
  );
}
