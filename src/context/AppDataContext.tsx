
"use client";

import { createContext, ReactNode, useReducer, useEffect, useMemo } from "react";
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
  | { type: "SET_INITIAL_DATA"; payload: { subjects: Subject[], exams: Exam[] } }
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

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return { ...state, subjects: action.payload.subjects, exams: action.payload.exams, isLoading: false };
    case "ADD_SUBJECT":
      return { ...state, subjects: [...state.subjects, action.payload] };
    case "UPDATE_SUBJECT":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s) };
    case "DELETE_SUBJECT":
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    case "ADD_EXAM":
        return { ...state, exams: [...state.exams, action.payload] };
    case "UPDATE_EXAM":
        return { ...state, exams: state.exams.map(e => e.id === action.payload.id ? action.payload : e) };
    case "DELETE_EXAM":
        return { ...state, exams: state.exams.filter(e => e.id !== action.payload) };
    case "ADD_PAPER":
    case "UPDATE_PAPER":
    case "DELETE_PAPER":
    case "ADD_CHAPTER":
    case "UPDATE_CHAPTER":
    case "DELETE_CHAPTER":
    case "DUPLICATE_CHAPTER":
    case "REORDER_CHAPTERS": {
      const { subjectId } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map(subject => {
          if (subject.id === subjectId) {
            let newPapers = [...subject.papers];
            if (action.type === 'ADD_PAPER') {
              newPapers.push(action.payload.paper);
            } else if (action.type === 'UPDATE_PAPER') {
              newPapers = newPapers.map(p => p.id === action.payload.paper.id ? action.payload.paper : p);
            } else if (action.type === 'DELETE_PAPER') {
              newPapers = newPapers.filter(p => p.id !== action.payload.paperId);
            } else {
              const { paperId } = action.payload;
              newPapers = newPapers.map(paper => {
                if (paper.id === paperId) {
                  let newChapters = [...paper.chapters];
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
                  return {...paper, chapters: newChapters };
                }
                return paper;
              });
            }
            return {...subject, papers: newPapers };
          }
          return subject;
        })
      };
    }
    default:
      return state;
  }
}

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
  const [state, dispatch] = useReducer(appReducer, initialState);

  const subjectsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'subjects') : null, [user, firestore]);
  const examsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'exams') : null, [user, firestore]);

  const { data: subjectsData, isLoading: subjectsLoading } = useCollection<Subject>(subjectsRef);
  const { data: examsData, isLoading: examsLoading } = useCollection<Exam>(examsRef);

  const isDataLoading = subjectsLoading || examsLoading;

  useEffect(() => {
    if (!isDataLoading) {
        dispatch({
            type: "SET_INITIAL_DATA",
            payload: {
                subjects: subjectsData || [],
                exams: examsData || [],
            },
        });
    }
  }, [isDataLoading, subjectsData, examsData]);

  const appDispatch = (action: Action) => {
    if (!user) return;
    
    // Optimistic UI update
    dispatch(action);

    switch (action.type) {
      case "ADD_SUBJECT":
      case "UPDATE_SUBJECT": {
        const subject = action.payload;
        const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subject.id);
        setDocumentNonBlocking(subjectRef, subject, {merge: true});
        break;
      }
       case "DELETE_SUBJECT": {
        const subjectId = action.payload;
        const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subjectId);
        deleteDocumentNonBlocking(subjectRef);
        break;
      }
      case "ADD_PAPER": 
      case "UPDATE_PAPER":
      case "DELETE_PAPER": {
          const { subjectId } = action.payload;
          const subject = state.subjects.find(s => s.id === subjectId);
          if (subject) {
            let updatedSubject;
            if(action.type === 'ADD_PAPER') {
                updatedSubject = {...subject, papers: [...subject.papers, action.payload.paper]};
            } else if (action.type === 'UPDATE_PAPER') {
                updatedSubject = {...subject, papers: subject.papers.map(p => p.id === action.payload.paper.id ? action.payload.paper : p)};
            } else { // DELETE_PAPER
                updatedSubject = {...subject, papers: subject.papers.filter(p => p.id !== action.payload.paperId)};
            }
            const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subjectId);
            updateDocumentNonBlocking(subjectRef, updatedSubject);
          }
          break;
      }
      case "ADD_CHAPTER":
      case "UPDATE_CHAPTER":
      case "DELETE_CHAPTER":
      case "DUPLICATE_CHAPTER":
      case "REORDER_CHAPTERS": {
         const { subjectId, paperId } = action.payload;
         const subject = state.subjects.find(s => s.id === subjectId);
         if (subject) {
            const paper = subject.papers.find(p => p.id === paperId);
            if(paper){
                let newChapters = [...paper.chapters];
                 if (action.type === 'ADD_CHAPTER') {
                    newChapters.push(action.payload.chapter);
                } else if (action.type === 'UPDATE_CHAPTER') {
                    newChapters = newChapters.map(c => c.id === action.payload.chapter.id ? action.payload.chapter : c);
                } else if (action.type === 'DELETE_CHAPTER') {
                    newChapters = newChapters.filter(c => c.id !== action.payload.chapterId);
                } else if (action.type === 'DUPLICATE_CHAPTER') {
                    const originalChapter = action.payload.chapter;
                    const newChapter: Chapter = {...originalChapter, id: uuidv4(), name: `${originalChapter.name} (Copy)`};
                    // Get the index of the original chapter to insert the copy after it
                    const originalIndex = newChapters.findIndex(c => c.id === originalChapter.id);
                    newChapters.splice(originalIndex + 1, 0, newChapter);
                } else if (action.type === 'REORDER_CHAPTERS') {
                    const [removed] = newChapters.splice(action.payload.startIndex, 1);
                    newChapters.splice(action.payload.endIndex, 0, removed);
                }

                const updatedPaper = {...paper, chapters: newChapters};
                const updatedPapers = subject.papers.map(p => p.id === paperId ? updatedPaper : p);
                const updatedSubject = {...subject, papers: updatedPapers};

                const subjectRef = doc(firestore, `users/${user.uid}/subjects`, subjectId);
                updateDocumentNonBlocking(subjectRef, updatedSubject);
            }
         }
          break;
      }
      case "ADD_EXAM":
      case "UPDATE_EXAM": {
        const exam = action.payload;
        const examRef = doc(firestore, `users/${user.uid}/exams`, exam.id);
        setDocumentNonBlocking(examRef, exam, { merge: true });
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
  
  return (
    <AppDataContext.Provider value={{ ...state, isLoading: state.isLoading, dispatch: appDispatch }}>
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

    