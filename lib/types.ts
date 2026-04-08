export interface SectionData {
  summary: string;
  evidence: string[];
}

export interface AnalysisResult {
  topic?: SectionData;
  methodology?: SectionData;
  conclusion?: SectionData;
  implications?: SectionData;
  counterarguments?: SectionData;
}

export type SectionKey = keyof AnalysisResult;

export interface SectionMeta {
  key: SectionKey;
  label: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export interface SavedAnalysis {
  id: string;
  user_id: string;
  title: string;
  result: AnalysisResult;
  created_at: string;
}

export const SECTIONS: SectionMeta[] = [
  {
    key: "topic",
    label: "주제",
    description: "이 문헌이 다루는 핵심 질문 또는 주장",
    color: "#3B82F6",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    key: "methodology",
    label: "방법론",
    description: "어떤 방식으로 주장을 뒷받침하는가",
    color: "#8B5CF6",
    borderColor: "border-violet-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
  },
  {
    key: "conclusion",
    label: "결론",
    description: "최종적으로 도달한 결과",
    color: "#10B981",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    key: "implications",
    label: "시사점",
    description: "이 결론이 실무/연구에 주는 의미",
    color: "#F59E0B",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  {
    key: "counterarguments",
    label: "반론",
    description: "이 문헌의 주장에 제기 가능한 반박 포인트",
    color: "#EF4444",
    borderColor: "border-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
];
