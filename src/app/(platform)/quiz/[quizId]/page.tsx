'use client';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/lib/orpc";
import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";

export default function QuizPage() {
    const { isLoading, data: quizData } = useQuery(orpc.quiz.find.queryOptions({
        input: { id: 1 },
        onError: (error: ORPCError<string, unknown>) => {
            console.error("Error fetching quiz:", error);
        }
    }))

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <Card className="p-4 px-0 w-full max-w-md">
                <CardHeader>
                    {isLoading ? <RotateCw className="animate-spin" />
                        : null}
                    <CardTitle>{quizData?.title}</CardTitle>
                </CardHeader>
                {JSON.stringify(quizData, null, 2)}
            </Card>
        </div>
    )
}