"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { FormSchema, QuizImpactsSchema } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orpc } from "@/lib/orpc";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      eventualities: [],
      questionImpacts: [],
      questions: [],
    },
    mode: "onChange",
  });

  const control = form.control;

  const {
    fields: fieldsOutcomes,
    append: appendOutcomes,
    remove: removeOutcomes,
  } = useFieldArray({
    control,
    name: "eventualities",
  });

  const {
    fields: fieldsQuestions,
    append: appendQuestions,
    remove: removeQuestions,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const {
    append: appendImpacts,
    update: updateImpacts,
    remove: removeImpacts,
  } = useFieldArray({
    control,
    name: "questionImpacts",
  });

  const watchedImpacts = useWatch({
    control: form.control,
    name: "questionImpacts",
  });

  const watchedOutcomes = useWatch({
    control: form.control,
    name: "eventualities",
  });

  async function createQuiz() {
    try {
      const quizId = await orpc.quiz.create.call({
        formData: form.getValues(),
      });
      router.push(`/quiz/${quizId}`);
    } catch (e) {
      console.log("Error creating quiz: ", e);
    }
  }

  return (
    <div className="h-screen h-full w-screen flex overflow-y-auto">
      <div className="flex flex-col w-screen items-center p-8 pt-24 pb-10">
        <div className="flex flex-col min-w-md max-w-md">
          <Form {...form}>
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="publish">Publish</TabsTrigger>
              </TabsList>
              <TabsContent value="basic">
                <div className="gap-4 flex flex-col">
                  <Card className="min-w-md gap-2">
                    <CardHeader>
                      <CardTitle>Quiz Details</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-2 flex flex-col">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="Title" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                className="bg-white resize-none border-2"
                                placeholder="Short description"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  <Card className="min-w-md gap-2">
                    <CardHeader>
                      <CardTitle>Outcomes</CardTitle>
                      <CardDescription>
                        Outcomes are the possible categories that quiz-takers
                        are placed in based on their answers.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 gap-2 flex flex-col">
                      {fieldsOutcomes.map((item, idx) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name={`eventualities.${idx}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex flex-row gap-2 items-center">
                                <FormControl>
                                  <Input {...field} placeholder="Outcome..." />
                                </FormControl>
                                <Trash2
                                  onClick={() => {
                                    removeOutcomes(idx);
                                    for (
                                      let i = 0;
                                      i < fieldsQuestions.length;
                                      i++
                                    ) {
                                      let newList: z.infer<
                                        typeof QuizImpactsSchema.shape.outcomes
                                      > = [];
                                      if (
                                        watchedImpacts[i].outcomes.length > 0
                                      ) {
                                        newList = watchedImpacts[
                                          i
                                        ].outcomes.filter(
                                          (item3, idx3) => idx3 != idx
                                        );
                                      }
                                      updateImpacts(i, {
                                        outcomes: newList,
                                      });
                                    }
                                  }}
                                ></Trash2>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                      <Button
                        onClick={() => {
                          appendOutcomes({
                            name: "",
                            resultDescription: "",
                          });
                          for (let i = 0; i < fieldsQuestions.length; i++) {
                            const newList = watchedImpacts[i].outcomes ?? [];
                            newList.push({ affirmative: "", negative: "" });
                            updateImpacts(i, { outcomes: newList });
                          }
                        }}
                        className="w-fit"
                        variant="neutral"
                      >
                        <Plus></Plus>
                        Add Outcome
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="questions">
                <div className="gap-4 flex flex-col">
                  {fieldsQuestions.map((item, idx) => (
                    <Card key={item.id} className="min-w-md gap-2">
                      <CardHeader>
                        <div className="flex flex-row gap-2 justify-between items-center">
                          <CardTitle>{`Question ${idx + 1}`}</CardTitle>
                          <Trash2
                            onClick={() => {
                              removeQuestions(idx);
                              removeImpacts(idx);
                            }}
                          ></Trash2>
                        </div>
                      </CardHeader>
                      <CardContent className="gap-2 flex flex-col">
                        <FormField
                          control={form.control}
                          name={`questions.${idx}.questionText`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Question Text..."
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {(watchedOutcomes && watchedOutcomes.length) > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-center min-w-full max-w-[125px]">
                                  Outcome
                                </TableHead>
                                <TableHead className="text-center">
                                  Yes
                                </TableHead>
                                <TableHead className="text-center">
                                  No
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {watchedOutcomes.map((item2, idx2) => {
                                return (
                                  <TableRow key={`q${idx}${idx2}-trow`}>
                                    <TableCell className="font-medium text-center min-w-full w-[125px] break-all inline-block whitespace-normal align-middle">
                                      {item2.name}
                                    </TableCell>
                                    <TableCell className="font-medium text-center">
                                      <FormField
                                        control={form.control}
                                        name={`questionImpacts.${idx}.outcomes.${idx2}.affirmative`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input
                                                {...field}
                                                className="text-center"
                                                placeholder="-"
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium text-center">
                                      <FormField
                                        control={form.control}
                                        name={`questionImpacts.${idx}.outcomes.${idx2}.negative`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input
                                                {...field}
                                                className="text-center"
                                                placeholder="-"
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium text-center"></TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-center">
                            Add an outcome to set how this question impacts
                            results
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(watchedOutcomes && watchedOutcomes.length) > 0 ? (
                    <Button
                      onClick={() => {
                        appendQuestions({
                          questionText: "",
                        });
                        appendImpacts({
                          outcomes: watchedOutcomes.map(() => {
                            return { affirmative: "", negative: "" };
                          }),
                        });
                      }}
                      className="w-fit"
                      variant="neutral"
                    >
                      <Plus></Plus>
                      Add Question
                    </Button>
                  ) : (
                    <p className="text-center">
                      Add an outcome to add a question
                    </p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="publish">
                <Button onClick={() => createQuiz()}>Publish Quiz!</Button>
              </TabsContent>
            </Tabs>
          </Form>
          <div className="mb-6"></div>
        </div>
      </div>
    </div>
  );
}
