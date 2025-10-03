
"use client";

import { createContext, ReactNode, useContext } from "react";
import { Subject, Exam, Paper, Chapter } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { doc, collection, runTransaction } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type AppState = {
  subjects: Subject[];
  exams: Exam[];
  isLoading: boolean;
};

type Action =
  | { type: "ADD_SUBJECT"; payload: Subject }
  | { type: "UPDATE_SUBJECT"; payload: Subject }
  | { type: "DELETE_SUBJECT"; payload: string }
  | { type: "ADD_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "UPDATE_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "DELETE_PAPER"; payload: { subjectId: string; paperId: string } }
  | { type: "ADD_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "UPDATE_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "DELETE_CHAPTER"; payload: { subjectId: string; paperId: string; chapterId: string } }
  | { type: "DUPLICATE_CHAPTER", payload: { subjectId: string, paperId: string, chapter: Chapter } }
  | { type: "REORDER_CHAPTERS", payload: { subjectId: string, paperId: string, startIndex: number, endIndex: number } }
  | { type: "ADD_EXAM"; payload: Exam }
  | { type: "UPDATE_EXAM"; payload: Exam }
  | { type: "DELETE_EXAM"; payload: string };

const initialState: AppState = {
  subjects: [],
  exams: [],
  isLoading: true,
};

export const AppDataContext = createContext<{
  subjects: Subject[];
  exams: Exam[];
  dispatch: React.Dispatch<Action>;
  isLoading: boolean;
}>({
  ...initialState,
  dispatch: () => null,
});

const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();

  const subjectsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'subjects') : null, [user, firestore]);
  const examsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'exams') : null, [user, firestore]);

  const { data: subjectsData, isLoading: subjectsLoading } = useCollection<Subject>(subjectsRef);
  const { data: examsData, isLoading: examsLoading } = useCollection<Exam>(examsRef);

  const appDispatch = (action: Action) => {
    if (!user) return;

    switch (action.type) {
      case "ADD_SUBJECT": {
        const newSubject = action.payload;
        const subjectRef = doc(firestore, `users/${user.uid}/subjects`, newSubject.id);
        setDocumentNonBlocking(subjectRef, newSubject, {});
        break;
      }
      case "UPDATE_SUBJECT": {
        const updatedSubject = action.payload;
        const subjectRef = doc(firestore, `users/${user.uid}/subjects`, updatedSubject.id);
        updateDocumentNonBlocking(subjectRef, updatedSubject);
        break;
      }
       case "DELETE_SUBJECT": {
        const subjectId = action.payload;
        const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subjectId);
        deleteDocumentNonBlocking(subjectRef);
        break;
      }
      case "ADD_PAPER": {
          const { subjectId, paper } = action.payload;
          const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subjectId);
          runTransaction(firestore, async (transaction) => {
              const subjectDoc = await transaction.get(subjectRef);
              if (!subjectDoc.exists()) throw "Subject does not exist!";
              const currentPapers = subjectDoc.data().papers || [];
              transaction.update(subjectRef, { papers: [...currentPapers, paper] });
          }).catch(console.error);
          break;
      }
      case "UPDATE_PAPER": {
          const { subjectId, paper } = action.payload;
          const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subjectId);
          runTransaction(firestore, async (transaction) => {
              const subjectDoc = await transaction.get(subjectRef);
              if (!subjectDoc.exists()) throw "Subject does not exist!";
              const currentPapers = subjectDoc.data().papers.map((p: Paper) => p.id === paper.id ? paper : p);
              transaction.update(subjectRef, { papers: currentPapers });
          }).catch(console.error);
          break;
      }
      case "DELETE_PAPER": {
          const { subjectId, paperId } = action.payload;
          const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subjectId);
           runTransaction(firestore, async (transaction) => {
              const subjectDoc = await transaction.get(subjectRef);
              if (!subjectDoc.exists()) throw "Subject does not exist!";
              const currentPapers = subjectDoc.data().papers.filter((p: Paper) => p.id !== paperId);
              transaction.update(subjectRef, { papers: currentPapers });
          }).catch(console.error);
          break;
      }
      case "ADD_CHAPTER":
      case "UPDATE_CHAPTER":
      case "DELETE_CHAPTER":
      case "REORDER_CHAPTERS":
      case "DUPLICATE_CHAPTER": {
         const { subjectId, paperId } = action.payload;
         const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subjectId);
          runTransaction(firestore, async (transaction) => {
              const subjectDoc = await transaction.get(subjectRef);
              if (!subjectDoc.exists()) throw "Subject does not exist!";
              
              const newPapers = subjectDoc.data().papers.map((p: Paper) => {
                  if (p.id === paperId) {
                      let newChapters = [...p.chapters];
                      if (action.type === 'ADD_CHAPTER') {
                          newChapters.push(action.payload.chapter);
                      } else if (action.type === 'UPDATE_CHAPTER') {
                           newChapters = newChapters.map(c => c.id === action.payload.chapter.id ? action.payload.chapter : c);
                      } else if (action.type === 'DELETE_CHAPTER') {
                          newChapters = newChapters.filter(c => c.id !== action.payload.chapterId);
                      } else if (action.type === 'DUPLICATE_CHAPTER') {
                         const newChapter: Chapter = {...action.payload.chapter, id: uuidv4(), name: `${action.payload.chapter.name} (Copy)`};
                         newChapters.push(newChapter);
                      } else if (action.type === 'REORDER_CHAPTERS') {
                          const [removed] = newChapters.splice(action.payload.startIndex, 1);
                          newChapters.splice(action.payload.endIndex, 0, removed);
                      }
                      return {...p, chapters: newChapters};
                  }
                  return p;
              });
              transaction.update(subjectRef, { papers: newPapers });
          }).catch(console.error);
          break;
      }
      case "ADD_EXAM": {
        const newExam = action.payload;
        const examRef = doc(firestore, `users/${user.uid}/exams`, newExam.id);
        setDocumentNonBlocking(examRef, newExam, {});
        break;
      }
      case "UPDATE_EXAM": {
        const updatedExam = action.payload;
        const examRef = doc(firestore, `users/${user.uid}/exams`, updatedExam.id);
        updateDocumentNonBlocking(examRef, updatedExam);
        break;
      }
      case "DELETE_EXAM": {
        const examId = action.payload;
        const examRef = doc(firestore, `users/${user.uid}/exams`, examId);
        deleteDocumentNonBlocking(examRef);
        break;
      }
      default:
        break;
    }
  };

  const state: AppState = {
    subjects: subjectsData || [],
    exams: examsData || [],
    isLoading: subjectsLoading || examsLoading,
  }

  return (
    <AppDataContext.Provider value={{ ...state, dispatch: appDispatch }}>
      {children}
    </AppDataContext.Provider>
  );
};


export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return null; // Or a loading spinner for the whole app
  }
  
  // If there's no user, we don't need to provide the data context,
  // as the page will redirect to /login anyway.
  if (!user) {
    return <>{children}</>;
  }
  
  // Only render the DataProvider if there is a logged-in user
  return <DataProvider>{children}</DataProvider>;
}

    