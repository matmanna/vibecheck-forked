"use client";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreatePage() {
  const router = useRouter();

  async function createQuiz() {
    try {
      const quizId = await orpc.quiz.createBlank.call();
      router.push(`/quiz/${quizId}/edit`);
    } catch (e) {
      console.log("Error creating quiz: ", e);
      toast("Erorr updating quiz", {
        description: "An error occurred updating the quiz",
      });
    }
  }

  return (
    <div className="h-screen h-full w-screen flex overflow-y-auto">
      <div className="flex flex-col w-screen items-center p-8 pt-24 pb-10">
        <div className="flex flex-col min-w-md max-w-md">
          <div className="flex flex-col w-full items-center gap-4">
            <p>Are you sure you would like to create a new quiz?</p>
            <Button className="w-fit" onClick={createQuiz}>
              Create & Edit New Quiz
            </Button>
          </div>
          <div className="mb-6"></div>
        </div>
      </div>
    </div>
  );
}
