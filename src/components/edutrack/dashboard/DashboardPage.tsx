
"use client";

import { useState, useMemo, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import NextExamCard from '@/components/edutrack/exam/NextExamCard';
import { ExamList } from '@/components/edutrack/exam/ExamList';
import { SubjectList } from '@/components/edutrack/subject/SubjectList';
import { PlusCircle, BookOpen, Target, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Paper, Subject } from '@/lib/types';

const SubjectDialog = dynamic(() => import('@/components/edutrack/subject/SubjectDialog').then(mod => mod.SubjectDialog), {
  loading: () => <div className="p-4"><Loader className="animate-spin" /></div>,
  ssr: false
});

type View = 'subjects' | 'exams' | null;

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<View>(null);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const { exams, subjects } = useContext(AppDataContext);

  const nextExam = useMemo(() => {
    const upcoming = exams
      .filter(exam => new Date(exam.date) >= new Date() && !exam.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0];
  }, [exams]);

  return (
    <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Dashboard
        </h1>
        
        {nextExam ? (
          <NextExamCard
            exam={nextExam}
          />
        ) : (
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader>
              <CardTitle>No Upcoming Exams</CardTitle>
              <CardDescription className="text-primary-foreground/80">Add an exam to start tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => setActiveView('exams')}>Add Exam</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Card 
              className={cn("hover:shadow-lg transition-all cursor-pointer", activeView === 'subjects' && 'border-primary ring-2 ring-primary')}
              onClick={() => setActiveView('subjects')}
            >
                <CardHeader className="flex flex-row items-center gap-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle className="text-xl">Subjects & Syllabus</CardTitle>
                        <CardDescription>Manage all your subjects, papers, and chapters.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card 
              className={cn("hover:shadow-lg transition-all cursor-pointer", activeView === 'exams' && 'border-primary ring-2 ring-primary')}
              onClick={() => setActiveView('exams')}
            >
                <CardHeader className="flex flex-row items-center gap-4">
                    <Target className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle className="text-xl">Exams</CardTitle>
                        <CardDescription>Track all your upcoming and past exams.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>

        <div className="mt-8">
          {activeView === 'subjects' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Subjects</h2>
                    <Button variant="outline" size="sm" onClick={() => setIsSubjectDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Subject
                    </Button>
                </div>
                <SubjectList />
             </div>
          )}
          {activeView === 'exams' && <ExamList />}
        </div>
      
      {isSubjectDialogOpen && <SubjectDialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen} />}
    </div>
  );
}

    