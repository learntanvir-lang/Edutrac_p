
"use client";

import { useState, useContext, useMemo } from "react";
import dynamic from 'next/dynamic';
import { Paper } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Trash2, ChevronDown, PlusCircle, Loader } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChapterList } from "../chapter/ChapterList";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PaperDialog = dynamic(() => import('@/components/edutrack/paper/PaperDialog').then(mod => mod.PaperDialog), { ssr: false });
const ChapterDialog = dynamic(() => import('@/components/edutrack/chapter/ChapterDialog').then(mod => mod.ChapterDialog), { ssr: false });


interface PaperListProps {
  papers: Paper[];
  subjectId: string;
}

const PaperProgressBadge = ({ paper }: { paper: Paper }) => {
    const overallProgress = useMemo(() => {
        const allProgressItems = paper.chapters.flatMap(c => c.progressItems);
        const totalCompleted = allProgressItems.reduce((acc, item) => acc + item.completed, 0);
        const totalOverall = allProgressItems.reduce((acc, item) => acc + item.total, 0);
        if (totalOverall === 0) {
            return 0;
        }
        return Math.round((totalCompleted / totalOverall) * 100);
    }, [paper.chapters]);

    return (
        <Badge variant={overallProgress === 100 ? "default" : "secondary"} className={cn("ml-2", overallProgress === 100 && "bg-green-600")}>
            {overallProgress}%
        </Badge>
    );
};


export function PaperList({ papers, subjectId }: PaperListProps) {
  const { dispatch } = useContext(AppDataContext);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);


  const handleDelete = (paperId: string) => {
    if (window.confirm("Are you sure you want to delete this paper? This will also delete all chapters and activities within it.")) {
      dispatch({ type: "DELETE_PAPER", payload: { subjectId, paperId } });
    }
  };

  const handleAddChapterClick = (paperId: string) => {
    setActivePaperId(paperId);
    setIsChapterDialogOpen(true);
  };

  const onChapterDialogChange = (open: boolean) => {
    if (!open) {
      setActivePaperId(null);
    }
    setIsChapterDialogOpen(open);
  }

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">No Papers Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a paper to organize your chapters.</p>
      </div>
    );
  }

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-3">
        {papers.map((paper) => (
          <AccordionItem key={paper.id} value={paper.id} className="border-none">
            <Card className="shadow-sm bg-muted/30">
              <div className="flex items-center justify-between p-4">
                <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                   <div className="flex items-center gap-4">
                     <CardTitle className="text-lg flex items-center">{paper.name} <PaperProgressBadge paper={paper} /></CardTitle>
                     <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                   </div>
                </AccordionTrigger>
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingPaper(paper)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(paper.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <AccordionContent className="px-4 pb-4 pt-0">
                 <div className="border-t pt-4 space-y-4">
                    <ChapterList subjectId={subjectId} paperId={paper.id} chapters={paper.chapters} />
                     <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddChapterClick(paper.id)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Chapter
                    </Button>
                 </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
      {editingPaper && (
        <PaperDialog
          open={!!editingPaper}
          onOpenChange={() => setEditingPaper(null)}
          subjectId={subjectId}
          paper={editingPaper}
        />
      )}
       {activePaperId && isChapterDialogOpen && (
        <ChapterDialog
            open={isChapterDialogOpen}
            onOpenChange={onChapterDialogChange}
            subjectId={subjectId}
            paperId={activePaperId}
        />
      )}
    </>
  );
}

    