"use client";

// src/components/journey/use-dependent-options.ts
// The choices of questions whose list depends on an earlier answer (the universities of a country,
// the cities of a destination, the visas of a destination and purpose). They are loaded when that
// answer is given and kept, so going back and forth does not ask again. The same behaviour as the
// eligibility check, packaged as a hook so any screen that draws FlowFieldInput can use it.
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadDependentOptions } from "@/actions/eligibility";
import { isDependentSource, type AnswerMap, type FlowField, type OptionNotes } from "@/lib/eligibility";
import type { DependentOptions } from "@/lib/eligibility-data";

export type FieldOptions = { options: string[]; notes: OptionNotes; loading: boolean; blocked?: string };

export function useDependentOptions(fields: FlowField[], answers: AnswerMap) {
  const [dependent, setDependent] = useState<Record<string, DependentOptions | "loading">>({});

  const dependentFields = useMemo(() => fields.filter((f) => isDependentSource(f.optionsSource)), [fields]);

  const dependencyOf = useCallback(
    (field: FlowField) => {
      const a = field.dependsOnKey ? (answers[field.dependsOnKey]?.trim() ?? "") : "";
      const b = field.alsoDependsOnKey ? (answers[field.alsoDependsOnKey]?.trim() ?? "") : "";
      const ready = !!a && (!field.alsoDependsOnKey || !!b);
      return { a, b, ready, cacheKey: `${field.optionsSource}|${a}|${b}` };
    },
    [answers]
  );

  useEffect(() => {
    for (const field of dependentFields) {
      const { a, b, ready, cacheKey } = dependencyOf(field);
      if (!ready || dependent[cacheKey] !== undefined) continue;
      setDependent((prev) => ({ ...prev, [cacheKey]: "loading" }));
      loadDependentOptions(field.optionsSource, a, b)
        .then((loaded) => setDependent((prev) => ({ ...prev, [cacheKey]: loaded })))
        .catch(() => setDependent((prev) => ({ ...prev, [cacheKey]: { options: [], notes: {} } })));
    }
  }, [dependentFields, dependencyOf, dependent]);

  const optionsFor = (field: FlowField): FieldOptions => {
    if (!isDependentSource(field.optionsSource)) return { options: field.options, notes: field.notes, loading: false };

    const { ready, cacheKey } = dependencyOf(field);
    if (!ready) {
      const waitingFor = [field.dependsOnKey, field.alsoDependsOnKey]
        .filter((key): key is string => !!key && !answers[key]?.trim())
        .map((key) => fields.find((f) => f.key === key)?.label.toLowerCase() ?? "the question above");
      return { options: [], notes: {}, loading: false, blocked: `Choose ${waitingFor.join(" and ")} first` };
    }
    const entry = dependent[cacheKey];
    if (!entry || entry === "loading") return { options: [], notes: {}, loading: true };
    return { options: entry.options, notes: entry.notes, loading: false };
  };

  return { optionsFor };
}

// Sets one answer and drops the answers that depended on it (a university of the old country).
export function withAnswer(fields: FlowField[], answers: AnswerMap, field: FlowField, value: string): AnswerMap {
  const next = { ...answers };
  if (value.trim()) next[field.key] = value;
  else delete next[field.key];
  for (const other of fields) {
    if (other.dependsOnKey === field.key || other.alsoDependsOnKey === field.key) delete next[other.key];
  }
  return next;
}