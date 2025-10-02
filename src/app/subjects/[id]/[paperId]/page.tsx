"use client";

import { useContext, useState } from "react";
import { useParams, notFound } from "next/navigation";
import dynamic from 'next/dynamic';
import { AppDataContext } from "@/context/AppDataContext";
import { Breadcrumbs } from "@/components/edutrack/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ChapterList } from "@/components/edutrack/chapter/ChapterList";
import type { Subject, Paper } from "@/lib/types";

const ChapterDialog = dynamic(() => import('@/components/edutrack/chapter/ChapterDialog').then(mod => mod.ChapterDialog), { ssr: false });

export default function PaperPage() {
  const { id, paperId: pId } = useParams();
  const { subjects } = useContext(AppDataContext);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);

  const subjectId = Array.isArray(id) ? id[0] : id;
  const paperId = Array.isArray(pId) ? pId[0] : pId;

  const subject = subjects.find((s) => s.id === subjectId) as Subject | undefined;
  const paper = subject?.papers.find((p) => p.id === paperId) as Paper | undefined;

  if (!subject || !paper) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Breadcrumbs
        segments={[
          { title: "Home", href: "/" },
          { title: "Subjects", href: "/" },
          { title: subject.name, href: `/subjects/${subject.id}` },
          { title: paper.name, href: `/subjects/${subject.id}/${paper.id}` },
        ]}
      />
      <div className="flex items-center justify-between my-6">
        <h1 className="text-3xl font-bold">{paper.name}</h1>
        <Button variant="outline" onClick={() => setIsChapterDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Chapter
        </Button>
      </div>

      <ChapterList subjectId={subject.id} paperId={paper.id} chapters={paper.chapters} />

      {isChapterDialogOpen && (
        <ChapterDialog
          open={isChapterDialogOpen}
          onOpenChange={setIsChapterDialogOpen}
          subjectId={subject.id}
          paperId={paper.id}
        />
      )}
    </div>
  );
}
