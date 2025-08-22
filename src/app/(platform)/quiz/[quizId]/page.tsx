"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { orpc } from "@/lib/orpc";
import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

const FormSchema = z.object({
  questions: z.array(
    z.object({
      answer: z.enum(["yes", "no", "neutral", "-"], {
        message: "You must select an answer",
      }),
    })
  ),
});

type ParamsType = {
  quizId: string;
};

export default function QuizPage() {
  const quizId = parseInt(useParams<ParamsType>().quizId);

  const scrollBox = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<(boolean | null)[] | null>(null);
  const [currentScrollPos, setCurrentScrollPos] = useState(-1);
  const [scrollBoxWidth, setScrollBoxWidth] = useState(400);

  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    console.log("on");
    console.log(values);
    try {
      const submissionId = await orpc.quiz.submitResponse.call({
        quizId: quizData?.id || 0,
        answers: values.questions.map((q) => q.answer),
      });
      router.push(`/results/${submissionId}`);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  }

  const { isLoading, data: quizData } = useQuery(
    orpc.quiz.find.queryOptions({
      input: { id: quizId },
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching quiz:", error);
      },
    })
  );

  if (!isLoading && !answers) {
    setAnswers(quizData?.quizQuestions.map(() => null) || []);
  }

  useEffect(() => {
    const updatePosition = () => {
      setScrollBoxWidth(scrollBox.current?.clientWidth || 0);
      // setCurrentScrollAmount(scrollBox.current?.scrollLeft || 0);
      if (!scrollBox.current) {
        setCurrentScrollPos(0);
      } else {
        if (scrollBox.current.scrollLeft < scrollBox.current.clientWidth / 2) {
          setCurrentScrollPos(-1);
        } else if (
          scrollBox.current.scrollWidth -
            scrollBox.current.clientWidth -
            scrollBox.current.scrollLeft <
          scrollBox.current.clientWidth / 2
        ) {
          setCurrentScrollPos(1);
        } else {
          setCurrentScrollPos(0);
        }
      }
    };

    const scrollBoxNode = scrollBox.current;
    scrollBoxNode?.addEventListener("scroll", updatePosition);

    return () => {
      scrollBoxNode?.removeEventListener("scroll", updatePosition);
    };
  }, []);

  return (
    <>
      <div className="p-8 pt-24 pb-10 relative h-screen h-full w-full flex flex-row">
        <div
          ref={scrollBox}
          className="w-full scroll-smooth snap-x snap-mandatory flex flex-row items-center overflow-y-hidden overflow-x-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="w-full flex-shrink-0 w-[100%] snap-start snap-center flex items-center justify-center p-4">
            {isLoading && (
              <div className="flex flex-row max-w-md flex-grow-1 justify-center w-full">
                <Spinner variant={"ellipsis"} size={32} />
              </div>
            )}
            {!isLoading && (
              <Card className="max-w-md flex-grow-1">
                <CardHeader>
                  <div className="flex flex-row items-center gap-2">
                    <Pin className="w-5 h-5" />
                    <CardTitle>{quizData?.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{quizData?.description}</p>
                  <div className="flex flex-row items-center justify-end mt-4">
                    <Button
                      onClick={() => {
                        scrollBox.current!.scrollBy({
                          left: scrollBoxWidth,
                          behavior: "smooth",
                        });
                      }}
                    >
                      Take Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <Form {...form}>
            {quizData?.quizQuestions.map((question, questionIndex) => (
              <div
                key={question.id + "-div"}
                className={
                  "flex-shrink-0 w-[100%] snap-center flex flex-col items-center justify-center p-4 gap-4"
                }
              >
                <Card
                  key={question.id + "-card"}
                  className="min-w-md flex-grow-1"
                >
                  <CardHeader key={question.id + "-header"}>
                    <CardTitle key={question.id + "-title"}>
                      Question {questionIndex + 1}:
                    </CardTitle>
                    <CardDescription key={question.id + "description"}>
                      {question.questionText}
                    </CardDescription>
                  </CardHeader>
                  <CardContent key={question.id + "-content"}>
                    <FormField
                      key={question.id + "-formfield"}
                      control={form.control}
                      name={`questions.${questionIndex}.answer`}
                      render={({ field }) => (
                        <FormControl key={question.id + "-control"}>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={""}
                            key={question.id + "-radiogroup"}
                          >
                            <FormItem
                              className="flex items-center gap-3"
                              key={question.id + "-formitem1"}
                            >
                              <FormControl key={question.id + "-control2"}>
                                <RadioGroupItem
                                  value="yes"
                                  key={question.id + "-radiogroupitem1"}
                                />
                              </FormControl>
                              <FormLabel key={question.id + "-label1"}>
                                Yes
                              </FormLabel>
                            </FormItem>
                            <FormItem
                              className="flex items-center gap-3"
                              key={question.id + "-formitem2"}
                            >
                              <FormControl key={question.id + "-control3"}>
                                <RadioGroupItem
                                  value="no"
                                  key={question.id + "-radiogroupitem2"}
                                />
                              </FormControl>
                              <FormLabel key={question.id + "-label2"}>
                                No
                              </FormLabel>
                            </FormItem>
                            <FormItem
                              className="flex items-center gap-3"
                              key={question.id + "-formitem3"}
                            >
                              <FormControl key={question.id + "-control4"}>
                                <RadioGroupItem
                                  value="neutral"
                                  key={question.id + "-radiogroupitem3"}
                                />
                              </FormControl>
                              <FormLabel key={question.id + "-label3"}>
                                Neutral
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      )}
                    ></FormField>
                  </CardContent>
                </Card>
                {questionIndex ===
                  (quizData?.quizQuestions.length || 0) - 1 && (
                  <div
                    className="min-w-md flex items-end flex-col"
                    key={question.id + "-submitdiv"}
                  >
                    <Button
                      onClick={() => {
                        console.log("submit");
                        form.handleSubmit(onSubmit)();
                      }}
                      key={question.id + "-submitbtn"}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </Form>
        </div>
        {currentScrollPos > -1 && (
          <Button
            onClick={() => {
              // setCurrentScrollAmount(scrollBox.current?.scrollLeft || 0);
              scrollBox.current!.scrollBy({
                left: -scrollBoxWidth,
                behavior: "smooth",
              });
              // setCurrentScrollAmount(currentScrollAmount - 400);
            }}
            size="icon"
            className="top-[50%] size-10 absolute left-2"
          >
            <ChevronLeft />
          </Button>
        )}
        {currentScrollPos == 0 && (
          <Button
            onClick={() => {
              // setCurrentScrollAmount(scrollBox.current?.scrollLeft || 0);
              scrollBox.current!.scrollBy({
                left: scrollBoxWidth,
                behavior: "smooth",
              });
              // setCurrentScrollAmount(currentScrollAmount + 400);
            }}
            size="icon"
            className="top-[50%] size-10 absolute right-2"
          >
            <ChevronRight />
          </Button>
        )}
      </div>
    </>
  );
}
