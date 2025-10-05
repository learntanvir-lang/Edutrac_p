
"use client";

import { useState, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Subject } from '@/lib/types';
import { AppDataContext } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pen, Trash2, ChevronDown, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PaperList } from '../paper/PaperList';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SubjectDialog = dynamic(() => import('./SubjectDialog').then(mod => mod.SubjectDialog), { ssr: false });
const PaperDialog = dynamic(() => import('../paper/PaperDialog').then(mod => mod.PaperDialog), { ssr: false });

const SubjectProgressBadge = ({ subject }: { subject: Subject }) => {
    const overallProgress = useMemo(() => {
        const allProgressItems = subject.papers.flatMap(p => p.chapters.flatMap(c => c.progressItems));
        const totalCompleted = allProgressItems.reduce((acc, item) => acc + item.completed, 0);
        const totalOverall = allProgressItems.reduce((acc, item) => acc + item.total, 0);
        if (totalOverall === 0) {
            return 0;
        }
        return Math.round((totalCompleted / totalOverall) * 100);
    }, [subject.papers]);

    return (
        <Badge variant={overallProgress === 100 ? "default" : "secondary"} className={cn("ml-2", overallProgress === 100 && "bg-green-600")}>
            {overallProgress}%
        </Badge>
    );
};

export function SubjectList() {
  const { subjects, dispatch } = useContext(AppDataContext);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isPaperDialogOpen, setIsPaperDialogOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const handleDelete = (subjectId: string) => {
    if (window.confirm("Are you sure you want to delete this subject? This will also delete all papers, chapters, and activities within it.")) {
      dispatch({ type: 'DELETE_SUBJECT', payload: subjectId });
    }
  };

  const handleAddPaperClick = (subjectId: string) => {
    setActiveSubjectId(subjectId);
    setIsPaperDialogOpen(true);
  };

  const onPaperDialogChange = (open: boolean) => {
    if (!open) {
      setActiveSubjectId(null);
    }
    setIsPaperDialogOpen(open);
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">No subjects yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a subject to begin organizing your studies.</p>
      </div>
    );
  }

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4">
        {subjects.map(subject => (
          <AccordionItem key={subject.id} value={subject.id} className="border-none">
            <Card className="shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between p-3 md:p-4">
                <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                   <div className="flex items-center gap-4">
                     <CardTitle className="flex items-center text-lg md:text-xl">
                       {subject.name}
                       <SubjectProgressBadge subject={subject} />
                      </CardTitle>
                     <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                   </div>
                </AccordionTrigger>
                <div className="flex items-center ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingSubject(subject)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(subject.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <AccordionContent className="p-3 md:p-6 pt-0">
                 <div className="border-t pt-4 space-y-4">
                    <PaperList subjectId={subject.id} papers={subject.papers} />
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddPaperClick(subject.id)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Paper
                    </Button>
                 </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      {editingSubject && (
        <SubjectDialog
          open={!!editingSubject}
          onOpenChange={() => setEditingSubject(null)}
          subject={editingSubject}
        />
      )}
      {activeSubjectId && isPaperDialogOpen && (
        <PaperDialog
            open={isPaperDialogOpen}
            onOpenChange={onPaperDialogChange}
            subjectId={activeSubjectId}
        />
      )}
    </>
  );
}
