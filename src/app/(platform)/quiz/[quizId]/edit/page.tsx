"use client";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import EditComponent from "./EditComponent";
import { ORPCError } from "@orpc/client";
import z from "zod";
import { FormSchema } from "@/lib/schema";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

let sendData: z.infer<typeof FormSchema> | null = null;

type ParamsType = {
  quizId: string;
};

export default function EditPage() {
  const quizId = parseInt(useParams<ParamsType>().quizId);
  const [unauthed, setUnauthed] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const { isLoading, data: quizData } = useQuery(
    orpc.quiz.find.queryOptions({
      input: { id: quizId },
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching quiz:", error);
      },
    })
  );

  if (!sendData && !isLoading && quizData) {
    console.log(quizData.user, session?.user.id);
    if (!isPending && session && quizData.user == session.user.id) {
      const tempSendData = {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.quizQuestions.map((item) => {
          return {
            questionText: item.questionText,
            featureId: item.featureId,
            id: item.id,
            topic:
              quizData.quizFeatures.find((item2) => item2.id == item.featureId)
                ?.name ?? "topicname",
          };
        }),
        eventualities: quizData.quizEventualities.map((item) => {
          return {
            name: item.name,
            resultDescription: item.resultDescription,
            id: item.id,
          };
        }),
        questionImpacts: quizData.quizQuestions.map((item) => {
          return {
            outcomes: quizData.quizEventualities.map((item2) => {
              return {
                affirmative:
                  quizData.quizFeatures
                    .find((item3) => item3.id == item.featureId)
                    ?.quizFeatureEventualities.find(
                      (item3) => item3.eventualityId == item2.id
                    )
                    ?.affirmativePoints!.toString() ?? "",
                negative:
                  quizData.quizFeatures
                    .find((item3) => item3.id == item.featureId)
                    ?.quizFeatureEventualities.find(
                      (item3) => item3.eventualityId == item2.id
                    )
                    ?.negativePoints.toString() ?? "",
              };
            }),
          };
        }),
        user: quizData.user,
      };
      sendData = tempSendData;
      setUnauthed(false);
    } else {
      if (!unauthed) {
        setUnauthed(true);
      }
    }
  }

  return (
    <div className="h-screen h-full w-screen flex overflow-y-auto">
      <div className="flex flex-col w-screen items-center p-8 pt-24 pb-10">
        <div className="flex flex-col min-w-md max-w-md">
          {!unauthed && (isLoading || !quizData || !sendData) ? (
            <div className="self-center">
              <Spinner variant={"ellipsis"} size={32} />
            </div>
          ) : !unauthed ? (
            <EditComponent
              quizId={quizId}
              prefillData={sendData!}
            ></EditComponent>
          ) : (
            <div className="self-center">
              <p>Could not find quiz</p>
            </div>
          )}
          <div className="mb-6"></div>
        </div>
      </div>
    </div>
  );
}
