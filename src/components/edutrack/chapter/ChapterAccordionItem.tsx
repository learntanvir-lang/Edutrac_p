
"use client";

import { useState, useContext, memo } from "react";
import dynamic from 'next/dynamic';
import { Chapter } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Trash2, ChevronDown, Copy, GripVertical, Link as LinkIcon, Edit, ExternalLink, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppDataContext } from "@/context/AppDataContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

const ChapterDialog = dynamic(() => import('@/components/edutrack/chapter/ChapterDialog').then(mod => mod.ChapterDialog), { ssr: false });


interface ChapterAccordionItemProps {
    chapter: Chapter;
    subjectId: string;
    paperId: string;
}

function ChapterAccordionItemComponent({ chapter, subjectId, paperId }: ChapterAccordionItemProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditingChapter, setIsEditingChapter] = useState(false);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this chapter?")) {
            dispatch({
                type: "DELETE_CHAPTER",
                payload: { subjectId, paperId, chapterId: chapter.id },
            });
        }
    };

    const handleDuplicate = () => {
        // The optimistic update will now be handled by the reducer
        // It needs the full chapter object to create a duplicate
        dispatch({
            type: "DUPLICATE_CHAPTER",
            payload: { subjectId, paperId, chapter },
        });
    };
    
    return (
        <>
            <AccordionItem value={chapter.id} className="border-none">
                <div className="bg-card rounded-lg shadow-sm">
                    <div className="flex items-center justify-between w-full p-3">
                        <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <span className="font-bold text-lg text-primary">
                                    {chapter.name}
                                </span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </div>
                        </AccordionTrigger>
                        <div className="flex items-center gap-1 ml-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setIsEditingChapter(true)}>
                                        <Pen className="mr-2 h-4 w-4" /> Edit Chapter
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDuplicate}>
                                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <AccordionContent className="px-3 pb-3 pt-0">
                        <div className="border-t pt-4 space-y-6">
                            
                            {/* Progress Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Activity className="w-4 h-4" />
                                    <span>Progress Trackers</span>
                                </div>
                                <div className="space-y-4 rounded-md bg-muted/50 p-4">
                                    {chapter.progressItems.map(item => {
                                        const progress = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
                                        return (
                                            <div key={item.id}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-foreground font-semibold">{item.name}</span>
                                                    <span className="text-sm font-medium text-muted-foreground">{item.completed} / {item.total}</span>
                                                </div>
                                                <div className="relative">
                                                  <Progress value={progress} className="h-5" />
                                                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-foreground">
                                                    {progress}%
                                                  </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {chapter.progressItems.length === 0 && (
                                        <p className="text-sm text-center text-muted-foreground py-2">No progress trackers added.</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Resources Section */}
                            {chapter.resourceLinks && chapter.resourceLinks.length > 0 && (
                                <div className="space-y-3">
                                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <LinkIcon className="w-4 h-4" />
                                        <span>Resources</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {chapter.resourceLinks.map(link => (
                                             <Button key={link.id} variant="outline" size="sm" className="w-full justify-between bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300" asChild>
                                                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                                    <span className="truncate">{link.description || link.url}</span>
                                                    <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                                                </Link>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             <Button variant="outline" size="sm" className="w-full mt-4 hover:bg-accent/50 hover:text-accent-foreground" onClick={() => setIsEditingChapter(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Chapter Details
                            </Button>
                        </div>
                    </AccordionContent>
                </div>
            </AccordionItem>

            {/* This dialog now handles everything */}
            {isEditingChapter && <ChapterDialog
                open={isEditingChapter}
                onOpenChange={setIsEditingChapter}
                subjectId={subjectId}
                paperId={paperId}
                chapter={chapter}
            />}
        </>
    );
}

export const ChapterAccordionItem = memo(ChapterAccordionItemComponent);
