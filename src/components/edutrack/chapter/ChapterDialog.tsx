
"use client";

import { z } from "zod";
import { useForm, useFieldArray, DragEvent } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chapter } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const chapterSchema = z.object({
  name: z.string().min(1, "Chapter name is required"),
  number: z.string().optional(),
  progressItems: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    completed: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
  })).optional(),
  resourceLinks: z.array(z.object({
    id: z.string(),
    url: z.string().url("Must be a valid URL"),
    description: z.string().min(1, "Description is required"),
  })).optional(),
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

interface ChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  paperId: string;
  chapter?: Chapter;
}

export function ChapterDialog({ open, onOpenChange, subjectId, paperId, chapter }: ChapterDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!chapter;

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: isEditing ? chapter : {
      name: "",
      number: "",
      progressItems: [
          { id: uuidv4(), name: 'Class Sessions', completed: 0, total: 0 },
          { id: uuidv4(), name: 'Practice Problems', completed: 0, total: 0 },
      ],
      resourceLinks: [],
    },
  });

  useEffect(() => {
    // When the dialog opens for editing, reset the form with chapter data.
    // When opening for creation, reset with default values.
    // This ensures `useFieldArray` is correctly populated.
    if (open) {
      const defaultValues = isEditing ? chapter : {
        name: "",
        number: "",
        progressItems: [
          { id: uuidv4(), name: 'Class Sessions', completed: 0, total: 0 },
          { id: uuidv4(), name: 'Practice Problems', completed: 0, total: 0 },
        ],
        resourceLinks: [],
      };
      form.reset(defaultValues);
    }
  }, [open, chapter, isEditing, form.reset]);


  const { fields: progressFields, append: appendProgress, remove: removeProgress, move: moveProgress } = useFieldArray({
    control: form.control,
    name: "progressItems"
  });
  
  const { fields: linkFields, append: appendLink, remove: removeLink, move: moveLink } = useFieldArray({
    control: form.control,
    name: "resourceLinks"
  });

  const [draggedItem, setDraggedItem] = useState<{type: 'progress' | 'link', index: number} | null>(null);

  const handleDragStart = (type: 'progress' | 'link', index: number) => {
    setDraggedItem({ type, index });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: 'progress' | 'link', index: number) => {
    e.preventDefault();
    if (draggedItem && draggedItem.type === type && draggedItem.index !== index) {
      if (type === 'progress') {
        moveProgress(draggedItem.index, index);
      } else {
        moveLink(draggedItem.index, index);
      }
    }
    setDraggedItem(null);
  };


  const onSubmit = (values: ChapterFormValues) => {
    const totalItems = values.progressItems?.reduce((sum, item) => sum + item.total, 0) || 0;
    const completedItems = values.progressItems?.reduce((sum, item) => sum + item.completed, 0) || 0;
    const isCompleted = totalItems > 0 && completedItems >= totalItems;

    const chapterData: Chapter = {
      id: chapter?.id || uuidv4(),
      name: values.name,
      number: values.number,
      isCompleted: isCompleted,
      progressItems: values.progressItems || [],
      resourceLinks: values.resourceLinks || [],
    };

    dispatch({
      type: isEditing ? "UPDATE_CHAPTER" : "ADD_CHAPTER",
      payload: {
        subjectId,
        paperId,
        chapter: chapterData,
      },
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-2xl max-h-[90svh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Chapter" : "Add New Chapter"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update details, progress, and resources for this chapter." : "Add a new chapter with custom progress trackers."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="pr-6 -mr-6 flex-grow">
          <div className="py-4">
            <Form {...form}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1 or 5.2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Vector" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Progress Items */}
                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">Progress Trackers</h3>
                    <div className="space-y-2">
                    {progressFields.map((field, index) => (
                        <div 
                            key={field.id} 
                            className={cn(
                                "flex items-start sm:items-center gap-2 p-2 rounded-md border border-transparent flex-col sm:flex-row",
                                draggedItem?.type === 'progress' && draggedItem?.index === index && "opacity-50 border-dashed border-primary"
                            )}
                            draggable
                            onDragStart={() => handleDragStart('progress', index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, 'progress', index)}
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab mt-2 shrink-0 hidden sm:block" />
                            <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                               <FormField
                                    control={form.control}
                                    name={`progressItems.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel className="sr-only">Tracker Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Tracker Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`progressItems.${index}.completed`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Completed</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Completed" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`progressItems.${index}.total`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Total</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Total" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeProgress(index)} className="shrink-0 text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendProgress({ id: uuidv4(), name: '', completed: 0, total: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Tracker
                    </Button>
                </div>
                
                {/* Resource Links */}
                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">Resource Links</h3>
                    <div className="space-y-2">
                    {linkFields.map((field, index) => (
                        <div 
                            key={field.id} 
                             className={cn(
                                "flex items-start gap-2 p-2 rounded-md border border-transparent",
                                draggedItem?.type === 'link' && draggedItem?.index === index && "opacity-50 border-dashed border-primary"
                            )}
                            draggable
                            onDragStart={() => handleDragStart('link', index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, 'link', index)}
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab mt-2 shrink-0" />
                            <div className="flex-grow space-y-2">
                                <FormField
                                    control={form.control}
                                    name={`resourceLinks.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Description" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name={`resourceLinks.${index}.url`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)} className="mt-2 text-destructive shrink-0">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendLink({ id: uuidv4(), url: '', description: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                    </Button>
                </div>

              </form>
            </Form>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
          <Button onClick={form.handleSubmit(onSubmit)}>{isEditing ? "Save Changes" : "Add Chapter"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
