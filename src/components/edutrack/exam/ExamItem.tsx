
"use client";

import { useState, useContext, memo } from "react";
import { Exam } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExamDialog } from "./ExamDialog";
import { Pen, Trash2, Calendar, BookOpen, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Countdown } from "../Countdown";
import { Badge } from "@/components/ui/badge";

interface ExamItemProps {
  exam: Exam;
}

function ExamItemComponent({ exam }: ExamItemProps) {
  const { subjects, dispatch } = useContext(AppDataContext);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleStatusChange = (isCompleted: boolean) => {
    dispatch({
      type: "UPDATE_EXAM",
      payload: { ...exam, isCompleted },
    });
  };
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this exam?")) {
      dispatch({
        type: "DELETE_EXAM",
        payload: exam.id,
      });
    }
  }

  const isPast = new Date(exam.date) < new Date();

  const examDetails = (exam.chapterIds || []).map(chapterId => {
    for (const subject of subjects) {
      if (exam.subjectIds.includes(subject.id)) {
        for (const paper of subject.papers) {
          const chapter = paper.chapters.find(c => c.id === chapterId);
          if (chapter) {
            return {
              subjectName: subject.name,
              chapterName: chapter.name
            };
          }
        }
      }
    }
    return null;
  }).filter(Boolean);

  return (
    <>
      <Card className={cn(
          "flex flex-col transition-all duration-300",
          exam.isCompleted 
            ? "bg-green-50 border-2 border-green-200 shadow-md" 
            : "bg-card border-2 border-primary shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
      )}>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="font-bold text-xl">
              {exam.name}
            </CardTitle>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditDialogOpen(true)}>
                    <Pen className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-4 flex-grow">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-1">
              {examDetails.map((detail, index) => detail && (
                <Badge key={index} variant={exam.isCompleted ? 'default' : 'secondary'} className={cn('px-2.5 py-1 text-sm border-2 border-primary', exam.isCompleted ? 'bg-green-100 text-green-800 border-green-300' : '')}>
                  {detail.subjectName} - {detail.chapterName}
                </Badge>
              ))}
            </div>
            <p className="flex items-center gap-2 pt-2">
              <Calendar className="h-4 w-4" /> {format(new Date(exam.date), "d MMMM, yyyy, p")}
            </p>
          </div>
          <Countdown targetDate={exam.date} isPastOrCompleted={isPast || exam.isCompleted} variant="card" />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
           <div className="flex w-full items-center space-x-2">
                <Button
                    onClick={() => handleStatusChange(false)}
                    variant={!exam.isCompleted ? "destructive" : "outline"}
                    size="sm"
                    className="w-full"
                >
                    <X className="mr-2 h-4 w-4" />
                    Not Completed
                </Button>
                <Button
                    onClick={() => handleStatusChange(true)}
                    variant={exam.isCompleted ? "default" : "outline"}
                    size="sm"
                    className={cn("w-full", exam.isCompleted && "bg-green-600 hover:bg-green-700")}
                >
                    <Check className="mr-2 h-4 w-4" />
                    Completed
                </Button>
            </div>
        </CardFooter>
      </Card>
      {isEditDialogOpen && <ExamDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} exam={exam} />}
    </>
  );
}

export const ExamItem = memo(ExamItemComponent);
