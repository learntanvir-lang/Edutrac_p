
"use client";

import { useState, useContext } from "react";
import { Exam } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Countdown } from "../Countdown";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExamDialog } from "./ExamDialog";
import { Book, Calendar, Pen, Clock, Info } from "lucide-react";
import { AppDataContext } from "@/context/AppDataContext";
import { Badge } from "@/components/ui/badge";

interface NextExamCardProps {
  exam: Exam;
}

export default function NextExamCard({ exam }: NextExamCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { subjects } = useContext(AppDataContext);
    const isPast = new Date(exam.date) < new Date();

    const examDetails = (exam.chapterIds || []).map(chapterId => {
      for (const subject of subjects) {
        if (exam.subjectIds.includes(subject.id)) {
          for (const paper of subject.papers) {
            const chapter = paper.chapters.find(c => c.id === chapterId);
            if (chapter) {
              return {
                subjectName: subject.name,
                chapterName: chapter.name,
                paperName: paper.name
              };
            }
          }
        }
      }
      return null;
    }).filter(Boolean);

  return (
    <>
      <Card className="bg-primary text-primary-foreground border-0 shadow-xl rounded-2xl [--card-foreground:theme(colors.primary.foreground)] [--muted-foreground:theme(colors.primary.foreground/0.8)] transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl">
        <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Next Exam</span>
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-bold">
                    {exam.name}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-4 text-primary-foreground/90 text-lg font-semibold">
                      <Calendar className="h-5 w-5" /> <span>{format(new Date(exam.date), "PPPPp")}</span>
                  </CardDescription>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsEditDialogOpen(true)} className="w-full sm:w-auto">
                  <Pen className="mr-2 h-4 w-4" />
                  Edit
              </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-2 pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                  <Info className="h-4 w-4" />
                  <span>Syllabus</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {examDetails.map((detail, index) => detail && (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm md:text-base bg-primary-foreground/20 text-primary-foreground transition-all hover:bg-primary-foreground/30 hover:scale-105 animate-pulse">
                    {detail.subjectName} - {detail.chapterName}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                    <Clock className="h-4 w-4" />
                    <span>Time Remaining</span>
                </div>
                <Countdown targetDate={exam.date} isPastOrCompleted={isPast || exam.isCompleted} />
            </div>
        </CardContent>
      </Card>
      <ExamDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} exam={exam} />
    </>
  );
}
