// src/lib/journey/engine.ts
// The rules of the application engine, as pure functions: which tasks an applicant sees, which
// stage is open, which are locked, and what is still missing on a task. No database and no React,
// so the portal, the server actions (which check everything again on the server) and the admin
// review page all run the very same rules.
//
// Stage rules:
//   - a stage is LOCKED until the stage before it is COMPLETE
//   - a stage is COMPLETE when a counsellor has signed it off, or (completion AUTO only) when the
//     applicant has submitted every required task
//   - a STAFF stage whose required tasks are all submitted is IN_REVIEW: the applicant is done,
//     the counsellor has not signed off yet, so the next stage stays locked
//   - only a sign off locks the tasks of a stage; an AUTO stage that completed by itself keeps its
//     optional tasks open (CV, personal statement) until a counsellor verifies them
import { fieldError, getVisibleSteps, parseShowWhen, splitMulti } from "@/lib/eligibility";
import type { AnswerMap, FlowField, ShowWhen } from "@/lib/eligibility";
import type {
  JourneyStageDef,
  JourneyStageEntry,
  JourneyTaskDef,
  JourneyTaskEntry,
  JourneyView,
  StageView,
  TaskView,
} from "./types";

export { parseShowWhen };

// Same rule as the eligibility check: `in` = the answer is one of these, `notIn` = none of these.
export function matchesShowWhen(rule: ShowWhen, answers: AnswerMap): boolean {
  const raw = answers[rule.fieldKey]?.trim();
  if (!raw) return false;
  // a single choice may itself contain a comma, so the whole answer counts as one candidate too
  const chosen = [raw, ...splitMulti(raw)];
  if (rule.in && !chosen.some((v) => rule.in!.includes(v))) return false;
  if (rule.notIn && chosen.some((v) => rule.notIn!.includes(v))) return false;
  return true;
}

export const isTaskVisible = (task: Pick<JourneyTaskDef, "showWhen">, context: AnswerMap) =>
  !task.showWhen || matchesShowWhen(task.showWhen, context);

// The details inputs of a task that apply to the answers given so far (a field can hide itself
// with its own showWhen, using the same rule as the eligibility check).
export function visibleTaskFields(task: Pick<JourneyTaskDef, "fields">, answers: AnswerMap): FlowField[] {
  const step = { stepNumber: 1, title: "", emoji: null, fields: task.fields };
  return getVisibleSteps([step], answers)[0]?.fields ?? [];
}

// null = ready to send. Otherwise one short sentence for the applicant.
export function taskMissing(
  task: Pick<JourneyTaskDef, "kind" | "title" | "fields">,
  answers: AnswerMap,
  fileCount: number
): string | null {
  if (task.kind === "MILESTONE") return null;
  if (task.kind === "DOCUMENT" && fileCount === 0) return `Upload at least one page of "${task.title}"`;

  for (const field of visibleTaskFields(task, answers)) {
    const value = answers[field.key];
    if (field.isRequired && !value?.trim()) return `"${field.label}" is required`;
    const problem = fieldError(field, value);
    if (problem) return `"${field.label}": ${problem}`;
  }
  return null;
}

// Only the answers of the inputs that are shown are kept, trimmed.
export function cleanTaskAnswers(task: Pick<JourneyTaskDef, "fields">, answers: AnswerMap): AnswerMap {
  const clean: AnswerMap = {};
  for (const field of visibleTaskFields(task, answers)) {
    const value = answers[field.key]?.trim();
    if (value) clean[field.key] = value;
  }
  return clean;
}

type ComputeInput = {
  stages: JourneyStageDef[];
  taskEntries: JourneyTaskEntry[];
  stageEntries: JourneyStageEntry[];
  /** What the task rules read: the eligibility answers and the chosen course (see journey/context.ts). */
  context: AnswerMap;
};

export function computeJourney({ stages, taskEntries, stageEntries, context }: ComputeInput): JourneyView {
  const entryByTask = new Map(taskEntries.map((e) => [e.taskId, e]));
  const entryByStage = new Map(stageEntries.map((e) => [e.stageId, e]));

  const ordered = [...stages].sort((a, b) => a.stageNumber - b.stageNumber);
  const views: StageView[] = [];
  let previousComplete = true;

  for (const stage of ordered) {
    const { tasks, ...stageDef } = stage;
    const signOff = entryByStage.get(stage.id);
    const signedOff = !!signOff?.completedAt;
    const unlocked = previousComplete;

    const visible = [...tasks]
      .filter((t) => isTaskVisible(t, context))
      .sort((a, b) => a.order - b.order);

    const taskViews: TaskView[] = visible.map((def) => {
      const entry = entryByTask.get(def.id) ?? null;
      const state = entry?.status ?? "NOT_STARTED";
      const done = def.kind === "MILESTONE" ? state === "VERIFIED" : state === "SUBMITTED" || state === "VERIFIED";
      const editable = unlocked && !signedOff && def.kind !== "MILESTONE" && state !== "VERIFIED";
      return { def, entry, state, done, editable };
    });

    const required = taskViews.filter((t) => t.def.isRequired);
    const requiredDone = required.filter((t) => t.done).length;
    const allRequiredDone = requiredDone === required.length;

    let complete = false;
    if (unlocked) {
      if (signedOff) complete = true;
      else if (stage.completion === "AUTO") complete = allRequiredDone && visible.length > 0;
    }

    const status = !unlocked
      ? "LOCKED"
      : complete
        ? "COMPLETE"
        : stage.completion === "STAFF" && required.length > 0 && allRequiredDone
          ? "IN_REVIEW"
          : "ACTIVE";

    const percent = complete ? 100 : required.length > 0 ? Math.round((requiredDone / required.length) * 100) : 0;

    views.push({
      def: stageDef,
      status,
      tasks: taskViews,
      requiredTotal: required.length,
      requiredDone,
      percent: unlocked ? percent : 0,
      signedOff,
      completedAt: signOff?.completedAt ?? null,
      note: signOff?.note ?? null,
    });

    previousComplete = complete;
  }

  const current = views.find((v) => v.status !== "COMPLETE") ?? null;
  const completeCount = views.filter((v) => v.status === "COMPLETE").length;
  const overall =
    views.length === 0 ? 0 : Math.round(((completeCount + (current ? current.percent / 100 : 0)) / views.length) * 100);

  return {
    stages: views,
    currentStageNumber: current?.def.stageNumber ?? null,
    percent: overall,
    complete: views.length > 0 && !current,
  };
}

export function findTaskView(view: JourneyView, taskSlug: string): { stage: StageView; task: TaskView } | null {
  for (const stage of view.stages) {
    const task = stage.tasks.find((t) => t.def.slug === taskSlug);
    if (task) return { stage, task };
  }
  return null;
}

// The tasks of a stage grouped by their headings, in order ("Identity", then "Academic Certificates"
// with its "Senior high school" and "Undergraduate" blocks, then "Professional Records").
export type TaskGroup = { title: string | null; blocks: { title: string | null; tasks: TaskView[] }[] };

export function groupTasks(tasks: TaskView[]): TaskGroup[] {
  const groups: TaskGroup[] = [];
  for (const task of tasks) {
    const groupTitle = task.def.groupTitle;
    let group = groups.find((g) => g.title === groupTitle);
    if (!group) {
      group = { title: groupTitle, blocks: [] };
      groups.push(group);
    }
    const blockTitle = task.def.subgroupTitle;
    let block = group.blocks.find((b) => b.title === blockTitle);
    if (!block) {
      block = { title: blockTitle, tasks: [] };
      group.blocks.push(block);
    }
    block.tasks.push(task);
  }
  return groups;
}