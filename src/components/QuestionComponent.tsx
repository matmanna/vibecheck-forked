import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestionComponent({ question }: { question: Question }) {

    return (
        <Card className="p-4 px-0 w-full max-w-md">
            <CardHeader>
                <CardTitle>{question.questionText}</CardTitle>
                <CardDescription>{ }</CardDescription>
            </CardHeader>
        </Card>
    );
}