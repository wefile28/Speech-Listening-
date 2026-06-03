import { create } from "zustand";

export interface StudentInfo {
  first_name: string;
  last_name: string;
  nickname: string;
  age: number;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  date_of_assessment: string;
  test_type: "Placement Test" | "In-Class Promotion";
}

export interface QuestionItem {
  id: string;
  level: "Seed" | "Sprout" | "Sapling" | "Tree";
  sublevel: string;
  skill: "Listening" | "Speaking";
  standard: string;
  example: string;
  question: string;
  visualPromptId?: string;
  isCustom?: boolean;
}

interface AssessmentState {
  studentInfo: StudentInfo;
  activeLevel: "Seed" | "Sprout" | "Sapling" | "Tree";
  scores: Record<string, boolean>; // id -> isCanDo
  customQuestions: QuestionItem[];
  teacherComment: string;
  confirmedLevel: string;
  activeStep: 1 | 2 | 3;
  assessmentMode: "checklist" | "game";
  setStudentInfo: (info: Partial<StudentInfo>) => void;
  setActiveLevel: (level: "Seed" | "Sprout" | "Sapling" | "Tree") => void;
  toggleScore: (id: string, isCanDo: boolean) => void;
  addCustomQuestion: (text: string, skill: "Listening" | "Speaking") => void;
  setTeacherComment: (comment: string) => void;
  setConfirmedLevel: (level: string) => void;
  setStep: (step: 1 | 2 | 3) => void;
  setAssessmentMode: (mode: "checklist" | "game") => void;
  resetStore: () => void;
}

const initialStudentInfo: StudentInfo = {
  first_name: "",
  last_name: "",
  nickname: "",
  age: 5,
  guardian_name: "",
  guardian_phone: "",
  guardian_email: "",
  date_of_assessment: new Date().toISOString().split("T")[0],
  test_type: "Placement Test",
};

export const useAssessmentStore = create<AssessmentState>((set) => ({
  studentInfo: initialStudentInfo,
  activeLevel: "Seed",
  scores: {},
  customQuestions: [],
  teacherComment: "",
  confirmedLevel: "Seed 🌰",
  activeStep: 1,
  assessmentMode: "checklist",

  setStudentInfo: (info) => 
    set((state) => ({ studentInfo: { ...state.studentInfo, ...info } })),
    
  setActiveLevel: (level) => 
    set(() => ({ activeLevel: level })),

  toggleScore: (id, isCanDo) => 
    set((state) => ({
      scores: {
        ...state.scores,
        [id]: isCanDo,
      },
    })),

  addCustomQuestion: (text, skill) =>
    set((state) => {
      const customId = `custom_${Date.now()}`;
      const newQuestion: QuestionItem = {
        id: customId,
        level: state.activeLevel,
        sublevel: "CUSTOM PROBE",
        skill,
        standard: "Custom ad-hoc question added by teacher.",
        example: "Dynamic question",
        question: text,
        isCustom: true,
      };
      return {
        customQuestions: [...state.customQuestions, newQuestion],
      };
    }),

  setTeacherComment: (comment) => 
    set(() => ({ teacherComment: comment })),

  setConfirmedLevel: (level) => 
    set(() => ({ confirmedLevel: level })),

  setStep: (step) => 
    set(() => ({ activeStep: step })),

  setAssessmentMode: (mode) =>
    set(() => ({ assessmentMode: mode })),

  resetStore: () => 
    set(() => ({
      studentInfo: {
        ...initialStudentInfo,
        date_of_assessment: new Date().toISOString().split("T")[0],
      },
      activeLevel: "Seed",
      scores: {},
      customQuestions: [],
      teacherComment: "",
      confirmedLevel: "Seed 🌰",
      activeStep: 1,
      assessmentMode: "checklist",
    })),
}));
