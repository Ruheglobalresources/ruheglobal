// src/lib/journey/types.ts
// The shapes of the application engine (the timeline). Plain data only, no database and no React,
// so the server, the browser and later the mobile app all read the same types.
// Everything that crosses to the browser is serialisable: dates are ISO strings.
import type { AnswerMap, FlowField, ShowWhen } from "@/lib/eligibility";

export type TaskKindValue = "DOCUMENT" | "FORM" | "MILESTONE";
export type StageCompletionValue = "AUTO" | "STAFF";
export type TaskStatusValue = "DRAFT" | "SUBMITTED" | "VERIFIED" | "CHANGES_REQUESTED";
export type StageStatusValue = "LOCKED" | "ACTIVE" | "IN_REVIEW" | "COMPLETE";

// What an applicant sees on a task card. NOT_STARTED = nothing saved yet.
export type TaskStateValue = TaskStatusValue | "NOT_STARTED";

export type JourneyTaskDef = {
  id: string;
  slug: string;
  stageId: string;
  groupTitle: string | null;
  subgroupTitle: string | null;
  title: string;
  description: string | null;
  kind: TaskKindValue;
  isRequired: boolean;
  order: number;
  maxFiles: number;
  accept: string | null;
  showWhen: ShowWhen | null;
  qualificationLevel: string | null;
  /** The details inputs ("Fill in your details"), already resolved with their choices. */
  fields: FlowField[];
};

export type JourneyStageDef = {
  id: string;
  stageNumber: number;
  slug: string;
  title: string;
  description: string | null;
  completion: StageCompletionValue;
  tasks: JourneyTaskDef[];
};

export type JourneyFile = {
  id: string;
  url: string;
  name: string;
  mimeType: string | null;
  size: number | null;
  order: number;
};

// What one applicant has saved on one task.
export type JourneyTaskEntry = {
  taskId: string;
  status: TaskStatusValue;
  answers: AnswerMap;
  files: JourneyFile[];
  reviewNote: string | null;
  badge: string | null;
  submittedAt: string | null;
};

// A staff sign off of one stage.
export type JourneyStageEntry = {
  stageId: string;
  completedAt: string | null;
  note: string | null;
};

export type TaskView = {
  def: JourneyTaskDef;
  entry: JourneyTaskEntry | null;
  state: TaskStateValue;
  /** Counts toward finishing the stage. */
  done: boolean;
  /** The applicant may still change it. */
  editable: boolean;
};

export type StageView = {
  def: Omit<JourneyStageDef, "tasks">;
  status: StageStatusValue;
  tasks: TaskView[];
  requiredTotal: number;
  requiredDone: number;
  percent: number;
  signedOff: boolean;
  completedAt: string | null;
  note: string | null;
};

export type JourneyView = {
  stages: StageView[];
  /** The first stage that is not complete. null = the whole journey is complete. */
  currentStageNumber: number | null;
  percent: number;
  complete: boolean;
};