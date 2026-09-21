export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "NONE";
export type RuleAction = "BLOCK" | "SANITIZE" | "FLAG_AND_LOG";
export type PatternType = "CONTAINS" | "EXACT" | "REGEX" | "FUZZY";

export interface BaseApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}
