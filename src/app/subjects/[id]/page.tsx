"use client";

import { useContext, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { AppDataContext } from "@/context/AppDataContext";
import { Breadcrumbs } from "@/components/edutrack/Breadcrumbs";
import { PaperList } from "@/components/edutrack/paper/PaperList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Subject } from "@/lib/types";

const PaperDialog = dynamic(() => import('@/components/edutrack/paper/PaperDialog').then(mod => mod.PaperDialog), { ssr: false });

export default function SubjectPage() {
  const { id } = useParams();
  const { subjects } = useContext(AppDataContext);
  const [isPaperDialogOpen, setIsPaperDialogOpen] = useState(false);
  const router = useRouter();

  const subjectId = Array.isArray(id) ? id[0] : id;
  const subject = subjects.find((s) => s.id === subjectId) as Subject | undefined;

  if (!subject) {
    // Redirect or handle appropriately
    // For now, let's just notFound(), but a redirect might be better UX
    notFound();
  }
  
  // This page might become redundant if all chapter management happens on the dashboard.
  // For now, we'll keep it as a dedicated view.
  if (!subject) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Breadcrumbs
        segments={[
          { title: "Home", href: "/" },
          { title: "Subjects", href: "/" },
          { title: subject.name, href: `/subjects/${subject.id}` },
        ]}
      />
      <div className="flex items-center justify-between my-6">
        <h1 className="text-3xl font-bold">{subject.name}</h1>
        <Button variant="outline" onClick={() => setIsPaperDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Paper
        </Button>
      </div>
      
      <PaperList subjectId={subject.id} papers={subject.papers} />

      {isPaperDialogOpen && (
        <PaperDialog 
          open={isPaperDialogOpen}
          onOpenChange={setIsPaperDialogOpen}
          subjectId={subject.id}
        />
      )}
    </div>
  );
}
