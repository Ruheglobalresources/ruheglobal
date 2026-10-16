// prisma/data/journeys/types.ts
// The shape of a journey seed file. One file describes the timeline of one application: its
// stages, the tasks of every stage and the details inputs of every task. Everything in it ends up
// as database rows (ApplicationStage, ApplicationTask, ApplicationTaskField), so after the first
// run it is edited in the database and never in code.
//
// To give another terminal a timeline (visa, accommodation, anything new) copy school.ts, point
// `application` at that application and describe its stages. No code changes are needed.
import type { PortalKind } from "@prisma/client";
import type { ShowWhen } from "../../../src/lib/eligibility";
import type { FieldSeed } from "../eligibility-questions";

export type TaskSeed = {
  slug: string; // unique inside the application, used in the address of the task page
  title: string;
  kind?: "DOCUMENT" | "FORM" | "MILESTONE"; // default DOCUMENT
  group?: string; // heading on the stage page: "Identity"
  subgroup?: string; // smaller heading: "Undergraduate"
  description?: string; // shown above "Fill in your details"
  required?: boolean; // default true
  maxFiles?: number; // pages of one document, default 10
  accept?: string; // file picker filter, default images and PDF
  showWhen?: ShowWhen; // show the task only when an earlier answer matches (study_level, ...)
  qualificationLevel?: string; // which qualification of the profile prefills it ("Bachelor's degree")
  // the details inputs: the key of a question in the field library (or of `extraFields` below)
  fields?: { key: string; required?: boolean; showWhen?: ShowWhen }[];
};

export type StageSeed = {
  number: number; // 1, 2, 3 ... the order on the timeline
  slug: string;
  title: string;
  description?: string;
  // AUTO: complete when the applicant has done every required task.
  // STAFF: complete when a counsellor signs it off (this is what holds the next stage back).
  completion: "AUTO" | "STAFF";
  tasks: TaskSeed[];
};

export type JourneySeed = {
  name: string; // only for the log
  // which application gets the timeline: by kind (the one SCHOOL application) or by its address
  application: { kind: PortalKind } | { terminalSlug: string; slug: string };
  // questions this journey needs that are not in the field library yet
  extraFields?: FieldSeed[];
  stages: StageSeed[];
};