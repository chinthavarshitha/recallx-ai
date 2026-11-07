export type Severity = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "Detected" | "Investigating" | "Mitigating" | "Resolved";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  workspace_id?: string;
  avatar_url?: string;
  created_at: string;
}

export interface TimelineEvent {
  timestamp: string;
  author: string;
  message: string;
  type: "note" | "status_change" | "verified_resolution" | "memory_retained" | "agent_action" | "telemetry";
}

export interface Incident {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  affected_services: string[];
  infrastructure_details?: string;
  error_logs?: string;
  stack_trace?: string;
  root_cause?: string;
  resolution_steps?: string;
  verified_resolution?: string;
  is_verified: boolean;
  hindsight_memory_id?: string;
  hindsight_synced: boolean;
  assignee_id?: string;
  investigation_notes?: string;
  tags: string[];
  timeline: TimelineEvent[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface RootCauseCard {
  title: string;
  probability: number;
  description: string;
  is_verified_historical: boolean;
  historical_incident_id?: string;
  historical_resolution?: string;
  evidence: string;
}

export interface SuggestedAction {
  id: string;
  title: string;
  action_cmd?: string;
  explanation: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
}

export interface RecalledMemory {
  id: string;
  text: string;
  type: string;
  score?: number;
  timestamp?: string;
  is_verified_fix?: boolean;
  source_incident?: string;
  metadata?: Record<string, any>;
}

export interface InvestigationResponse {
  session_id: string;
  incident_id: string;
  with_memory: boolean;
  summary: string;
  reply: string;
  root_causes: RootCauseCard[];
  suggested_actions: SuggestedAction[];
  recalled_memories: RecalledMemory[];
  evidence_notes: string[];
  hindsight_status: string;
  llm_model: string;
  created_at: string;
}

export interface CompareMemoryResponse {
  incident_id: string;
  without_memory: InvestigationResponse;
  with_memory: InvestigationResponse;
  key_differences: string[];
  time_saved_estimate: string;
  accuracy_delta: string;
}

export interface BankHealth {
  bank_id: string;
  status: string;
  base_url: string;
  sdk_version: string;
  total_memories_stored: number;
  total_recalls_performed: number;
  total_reflections: number;
  last_sync?: string;
  error_message?: string;
}

export interface MemoryExplorerItem {
  id: string;
  bank_id: string;
  type: string;
  title: string;
  content: string;
  root_cause?: string;
  incident_id?: string;
  incident_title?: string;
  severity?: string;
  services: string[];
  timestamp: string;
  synced_to_hindsight: boolean;
  tags: string[];
}

export interface AnalyticsOverview {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  verified_incidents: number;
  mttr_minutes: number;
  memory_recall_accuracy: number;
  ai_learning_activity: {
    total_memories_indexed: number;
    verified_fixes_retained: number;
    active_knowledge_graphs: number;
    learning_rate: string;
  };
  severity_distribution: Array<{ name: string; value: number; color: string }>;
  incident_trends: Array<{ date: string; incidents: number; resolved: number }>;
  recurring_patterns: Array<{
    id: string;
    pattern_name: string;
    affected_service: string;
    recurrence_count: number;
    confidence: number;
    verified_resolution_available: boolean;
    remediation: string;
    status: string;
  }>;
  system_health: Record<string, string>;
}
