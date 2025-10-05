
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

    const examDate = new Date(exam.date);
    const formattedDate = format(examDate, "PPPP");
    const formattedTime = format(examDate, "p");

  return (
    <>
      <Card className="bg-primary text-primary-foreground border-0 shadow-xl rounded-2xl [--card-foreground:theme(colors.primary.foreground)] [--muted-foreground:theme(colors.primary.foreground/0.8)] transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Next Exam</span>
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-bold">
                    {exam.name}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-base text-primary-foreground/90 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span className="text-xl font-bold">
                           {formattedDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                         <span className="text-xl font-bold">
                           {formattedTime}
                        </span>
                      </div>
                  </div>
              </div>
              <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)} className="w-10 h-10 flex-shrink-0 rounded-full bg-transparent border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground self-start">
                  <Pen className="h-5 w-5" />
              </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                  <Info className="h-4 w-4" />
                  <span>Syllabus</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {examDetails.map((detail, index) => detail && (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-primary-foreground/20 text-primary-foreground transition-all hover:bg-primary-foreground/30">
                    {detail.subjectName} - {detail.chapterName}
                  </Badge>
                ))}
                {examDetails.length === 0 && (
                   <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary-foreground/20 text-primary-foreground">
                    No specific chapters selected
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-3">
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
