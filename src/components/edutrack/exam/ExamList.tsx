
"use client";

import { useContext, useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import { AppDataContext } from "@/context/AppDataContext";
import { ExamItem } from "./ExamItem";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ExamDialog = dynamic(() => import('@/components/edutrack/exam/ExamDialog').then(mod => mod.ExamDialog), {
  loading: () => <div className="p-4"><Loader className="animate-spin" /></div>,
  ssr: false
});

export function ExamList() {
  const { exams } = useContext(AppDataContext);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);

  const { upcomingExams, pastExams } = useMemo(() => {
    const now = new Date();
    const upcoming = exams
      .filter(exam => new Date(exam.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = exams
      .filter(exam => new Date(exam.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { upcomingExams: upcoming, pastExams: past };
  }, [exams]);

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Exams</h2>
            <Button variant="outline" onClick={() => setIsExamDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Exam
            </Button>
        </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-muted-foreground">No exams found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add an exam to start tracking your schedule.</p>
        </div>
      ) : (
        <>
          {upcomingExams.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Upcoming</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {upcomingExams.map(exam => (
                    <div key={exam.id}>
                        <ExamItem exam={exam} />
                    </div>
                ))}
              </div>
            </div>
          )}

          {pastExams.length > 0 && (
            <div>
              {upcomingExams.length > 0 && <Separator className="my-8" />}
              <h3 className="text-xl font-semibold mb-4">Past</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {pastExams.map(exam => (
                   <div key={exam.id}>
                        <ExamItem exam={exam} />
                    </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isExamDialogOpen && <ExamDialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen} />}
    </div>
  );
}
