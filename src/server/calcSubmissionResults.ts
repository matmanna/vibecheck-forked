import { QuizSubmissionType } from "@/lib/schema";

export async function calcSubmissionResults(submission: QuizSubmissionType) {
  const eventualityScores = submission.quiz.quizEventualities.map(() => 0);
  submission.quiz.quizQuestions.forEach((question, index) => {
    const answer = submission.answers[index];
    const feature = submission.quiz.quizFeatures.find(
      (f) => f.id === question.featureId
    );
    if (feature) {
      feature.quizFeatureEventualities
        .filter((item) => item.featureId == feature.id)
        .forEach((linkRecord) => {
          if (answer === "yes") {
            eventualityScores[
              submission.quiz.quizEventualities
                .map((item) => item.id)
                .indexOf(linkRecord.eventualityId)
            ] += linkRecord.affirmativePoints;
          } else if (answer === "no") {
            eventualityScores[
              submission.quiz.quizEventualities
                .map((item) => item.id)
                .indexOf(linkRecord.eventualityId)
            ] += linkRecord.negativePoints;
          }
        });
    }
  });
  return {
    ...submission,
    results: eventualityScores,
  };
}
