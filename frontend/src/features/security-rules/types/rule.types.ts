import { Severity, RuleAction, PatternType } from "../../../shared/types/common.types";

export interface SecurityRule {
  id: number;
  name: string;
  keyword: string;
  pattern_type: PatternType;
  category: string;
  severity: Severity;
  action: RuleAction;
  risk_score: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SecurityRuleInput {
  name: string;
  keyword: string;
  pattern_type: PatternType;
  category: string;
  severity: Severity;
  action: RuleAction;
  risk_score: number;
  description?: string;
  is_active: boolean;
}
