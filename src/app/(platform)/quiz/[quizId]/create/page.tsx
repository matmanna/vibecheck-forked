"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  QuizEventualitiesSchema,
  QuizFeaturesSchema,
  QuizQuestionsSchema,
  QuizSchema,
} from "@/lib/schema";
import { Input } from "@/components/ui/input";
import z, { string } from "zod";
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

const FeaturesSchema = QuizFeaturesSchema.omit({
  quizFeatureEventualities: true,
  id: true,
  quizId: true,
});

const QuestionsSchema = QuizQuestionsSchema.omit({
  id: true,
  quizId: true,
  featureId: true,
});

const OutcomesSchema = QuizEventualitiesSchema.omit({
  id: true,
  quizId: true,
});

const QuizImpactsSchema = z.object({
  outcomes: z.array(z.object({ affirmative: string(), negative: string() })),
});

const FormSchema = QuizSchema.omit({
  id: true,
  quizFeatures: true,
  quizEventualities: true,
  quizQuestions: true,
})
  .and(z.object({ features: z.array(FeaturesSchema) }))
  .and(z.object({ questions: z.array(QuestionsSchema) }))
  .and(z.object({ eventualities: z.array(OutcomesSchema) }))
  .and(
    z.object({
      questionImpacts: z.array(QuizImpactsSchema),
    })
  );

export default function CreatePage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
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
    fields: fieldsFeatures,
    // append: appendFeatures,
    // remove: removeFeatures,
  } = useFieldArray({
    control,
    name: "features",
  });

  const {
    // fields: fieldsImpacts,
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

  // const watchedFeatures = useWatch({
  //   control: form.control,
  //   name: "features",
  // });

  const watchedOutcomes = useWatch({
    control: form.control,
    name: "eventualities",
  });

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
                          console.log(fieldsFeatures);
                        }}
                        className="w-fit"
                        variant="neutral"
                      >
                        <Plus></Plus>
                        Add Outcome
                      </Button>
                    </CardContent>
                  </Card>
                  {/* <Card className="min-w-md gap-2">
                    <CardHeader>
                      <CardTitle>Features</CardTitle>
                      <CardDescription>
                        {`Features are categories of questions. For example, a question of "Do you like donuts" could be linked to a feature called "likes donuts".`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 gap-2 flex flex-col">
                      {fieldsFeatures.map((item, idx) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name={`quizFeatures.${idx}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex flex-row gap-2 items-center">
                                <FormControl>
                                  <Input {...field} placeholder="Feature..." />
                                </FormControl>
                                <Trash2
                                  onClick={() => removeFeatures(idx)}
                                ></Trash2>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                      <Button
                        onClick={() => {
                          appendFeatures({
                            id: 0,
                            quizId: 0,
                            name: "",
                            category: "",
                          });
                          console.log(fieldsFeatures);
                        }}
                        className="w-fit"
                        variant="neutral"
                      >
                        <Plus></Plus>
                        Add Feature
                      </Button>
                    </CardContent>
                  </Card> */}
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center">
                                Outcome
                              </TableHead>
                              <TableHead className="text-center">Yes</TableHead>
                              <TableHead className="text-center">No</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {watchedOutcomes.map((item2, idx2) => {
                              return (
                                <TableRow key={`q${idx}${idx2}-trow`}>
                                  <TableCell className="font-medium text-center">
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
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    onClick={() => {
                      appendQuestions({
                        questionText: "",
                      });
                      console.log(
                        watchedOutcomes.map(() => {
                          return { affirmative: "", negative: "" };
                        })
                      );
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
                </div>
              </TabsContent>
              <TabsContent value="publish">
                <Button>Publish Quiz!</Button>
              </TabsContent>
            </Tabs>
          </Form>
          <div className="mb-6"></div>
        </div>
      </div>
    </div>
  );
}
