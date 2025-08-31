"use client";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MePage() {
  const router = useRouter();

  const { data: session, isPending, error } = authClient.useSession();

  if (error || (!session && !isPending)) {
    router.push("/login");
  }

  async function createQuiz() {
    try {
      const quizId = await orpc.quiz.createBlank.call();
      router.push(`/quiz/${quizId}/edit`);
    } catch {
      toast("Error creating quiz", {
        description: "An error occurred creating the quiz",
      });
    }
  }

  const { isPending: submissionsLoading, data: submissions } = useQuery(
    orpc.quiz.getSubmissions.queryOptions({
      staleTime: Infinity,
      cacheTime: Infinity,
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching submissions:", error);
      },
    })
  );

  const { isPending: quizzesLoading, data: quizzes } = useQuery(
    orpc.quiz.findMany.queryOptions({
      staleTime: Infinity,
      cacheTime: Infinity,
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching quizzes:", error);
      },
    })
  );

  return (
    <div className="h-screen h-full w-screen flex overflow-y-auto">
      <div className="flex flex-col w-screen items-center p-8 pt-24 pb-10">
        <div className="flex flex-col min-w-md max-w-md">
          {!isPending && session ? (
            <div className="gap-4 flex flex-col">
              <p className="text-2xl">{session.user.name}</p>
              <p className="text-l">My Quizzes</p>
              {quizzesLoading ? (
                <Spinner variant={"ellipsis"} size={32} />
              ) : (
                quizzes?.map((quiz) => (
                  <Card key={quiz.id} className="flex-grow-1 py-4">
                    <CardContent className="flex flex-col gap-2">
                      <p>{quiz.title}</p>
                      <p className="text-sm">{`Edited ${Intl.DateTimeFormat(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      ).format(quiz.edited)}`}</p>
                      <CardAction className="flex flex-row gap-4">
                        <Button
                          variant="neutral"
                          onClick={() => router.push(`/quiz/${quiz.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="neutral"
                          onClick={() => router.push(`/quiz/${quiz.id}`)}
                        >
                          View
                        </Button>
                      </CardAction>
                    </CardContent>
                  </Card>
                ))
              )}
              <Button className="w-fit" onClick={createQuiz}>
                Create Quiz
              </Button>
              <p className="text-l">My Quiz Submissions</p>
              {submissionsLoading ? (
                <Spinner variant={"ellipsis"} size={32} />
              ) : (
                submissions?.map((submission) => (
                  <Card key={submission.id} className="flex-grow-1 py-4">
                    <CardContent className="flex flex-col gap-2">
                      <Link
                        href={`/results/${submission.id}`}
                        className="underline"
                      >
                        {submission.quiz.title}
                      </Link>
                      <p className="text-sm">{`Submitted ${Intl.DateTimeFormat(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      ).format(submission.submitted)}`}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-row max-w-md flex-grow-1 justify-center w-full">
              <Spinner variant={"ellipsis"} size={32} />
            </div>
          )}
          <div className="mb-6"></div>
        </div>
      </div>
    </div>
  );
}
