"use client";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";
import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState("signin");
  return (
    <div className="h-screen h-full w-screen flex overflow-y-auto">
      <div className="flex flex-col w-screen items-center p-8 pt-24 pb-10">
        <div className="flex flex-col min-w-md max-w-md gap-4">
          {mode === "signin" && <SignIn toggle={() => setMode("signup")}></SignIn>}
          {mode === "signup" && <SignUp toggle={() => setMode("signin")}></SignUp>}
          <div className="mb-6"></div>
        </div>
      </div>
    </div>
  );
}
