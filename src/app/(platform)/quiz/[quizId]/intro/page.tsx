'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Start() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4">
            <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
                The Big Quiz
            </h1>
            <Button onClick={() => router.push('/quiz')}>Start</Button>
            <Button variant="neutral">About the Quiz</Button>
        </div>
    )
}