
"use client";

import { useState, useContext, DragEvent } from "react";
import { Chapter } from "@/lib/types";
import { Accordion } from "@/components/ui/accordion";
import { AppDataContext } from "@/context/AppDataContext";
import { cn } from "@/lib/utils";
import { ChapterAccordionItem } from "./ChapterAccordionItem";

interface ChapterListProps {
  chapters: Chapter[];
  subjectId: string;
  paperId: string;
}

export function ChapterList({ chapters, subjectId, paperId }: ChapterListProps) {
  const { dispatch } = useContext(AppDataContext);

  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState<Chapter | null>(null);
  const [dragOverItem, setDragOverItem] = useState<Chapter | null>(null);
  
  const handleDragStart = (e: DragEvent<HTMLDivElement>, chapter: Chapter) => {
    setDraggedItem(chapter);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>, chapter: Chapter) => {
    e.preventDefault();
    if(draggedItem?.id === chapter.id) return;
    setDragOverItem(chapter);
  };
  
  const handleDragEnd = () => {
    if (draggedItem && dragOverItem && draggedItem.id !== dragOverItem.id) {
      const startIndex = chapters.findIndex(c => c.id === draggedItem.id);
      const endIndex = chapters.findIndex(c => c.id === dragOverItem.id);
      
      if (startIndex !== -1 && endIndex !== -1) {
        dispatch({
          type: "REORDER_CHAPTERS",
          payload: {
            subjectId,
            paperId,
            startIndex: startIndex,
            endIndex: endIndex,
          },
        });
      }
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };
  

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-8 md:p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">No Chapters Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a chapter to get started.</p>
      </div>
    );
  }

  return (
      <div className="w-full">
        <Accordion type="multiple" className="w-full space-y-2">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              draggable
              onDragStart={(e) => handleDragStart(e, chapter)}
              onDragOver={(e) => handleDragOver(e, chapter)}
              onDragEnd={handleDragEnd}
              onDragLeave={() => setDragOverItem(null)}
              className={cn(
                "transition-all",
                draggedItem?.id === chapter.id && "opacity-50",
                dragOverItem?.id === chapter.id && "bg-accent"
              )}
            >
              <ChapterAccordionItem 
                chapter={chapter}
                subjectId={subjectId}
                paperId={paperId}
              />
            </div>
          ))}
        </Accordion>
      </div>
  );
}
