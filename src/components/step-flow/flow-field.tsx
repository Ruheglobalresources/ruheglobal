"use client";

// src/components/step-flow/flow-field.tsx
// Draws ONE question of a flow with the right control, from what the admin set on the field:
//   SELECT        PILLS -> pills     CARDS -> cards with a plain-words line     otherwise -> search box with a list
//   MULTI_SELECT  PILLS -> pills     CARDS -> cards     otherwise -> search bar with chips (and quick-pick suggestions)
//   TEXT, NUMBER, EMAIL, PHONE, DATE, TEXTAREA -> floating-label input
//   CHECKBOX -> a yes/no pill pair
// A SELECT with "allowOther" ends its list with an "Other" choice that opens a text box (what is typed
// is the answer). A list that comes back empty shows the text box straight away.
// File and image questions are not part of a flow and are not drawn.
import { useState, type ReactNode } from "react";
import { fieldError, joinMulti, splitMulti, type FlowField, type OptionNotes } from "@/lib/eligibility";
import { CardSelect } from "./card-select"
import { FloatingInput } from "./floating-input";
import { PillSelect } from "./pill-select";
import { SearchSelect } from "./search-select";

type FlowFieldInputProps = {
  field: FlowField;
  /** The stored answer: a multi-select is its choices joined with commas. */
  value: string;
  /** The choices to offer. For a list that depends on an earlier answer the flow passes what it loaded. */
  options: string[];
  /** The plain-words line, card title and emoji of the choices (visa goals, visa types, cities). */
  notes?: OptionNotes;
  loadingOptions?: boolean;
  /** For a list that depends on an earlier answer that is not given yet. */
  blockedText?: string;
  onChange: (next: string) => void;
};

const labelClass = "mb-2 block text-[15px] text-neutral-600";

type ChoiceProps = {
  field: FlowField;
  options: string[];
  notes: OptionNotes;
  selected: string[];
  set: (next: string[]) => void;
  loading?: boolean;
  blockedText?: string;
  help: ReactNode;
};

// One single-choice question drawn the way its display says.
function SingleChoice({ field, options, notes, selected, set, loading, blockedText, help }: ChoiceProps) {
  const required = field.isRequired;

  if (field.display === "PILLS" || field.display === "CARDS") {
    return (
      <div>
        <span className={labelClass}>
          {field.label}
          {required ? " *" : ""}
        </span>
        {blockedText && options.length === 0 ? (
          <p className="px-1 text-sm text-neutral-500">{blockedText}</p>
        ) : loading ? (
          <p className="px-1 text-sm text-neutral-500">Loading...</p>
        ) : field.display === "CARDS" ? (
          <CardSelect options={options} notes={notes} value={selected} onChange={set} />
        ) : (
          <PillSelect options={options} value={selected} onChange={set} />
        )}
        {help}
      </div>
    );
  }

  return (
    <div>
      <SearchSelect
        label={field.label}
        options={options}
        value={selected}
        onChange={set}
        required={required}
        loading={loading}
        disabled={!!blockedText}
        emptyText={blockedText ?? "No results"}
      />
      {blockedText ? <p className="mt-1 px-1 text-xs text-neutral-500">{blockedText}</p> : help}
    </div>
  );
}

// A single SELECT that may end with "Other".
function SelectWithOther({
  field,
  value,
  options,
  notes,
  loadingOptions: loading,
  blockedText,
  help,
  onChange,
}: Omit<FlowFieldInputProps, "notes"> & { notes: OptionNotes; help: ReactNode }) {
  const otherLabel = field.otherLabel?.trim() || "Other";
  const [otherPicked, setOtherPicked] = useState(false);

  const inList = !!value && options.includes(value);
  const emptyList = !loading && !blockedText && options.length === 0;
  // typing a custom answer: the list is empty, "Other" was picked, or the saved answer is not in the list
  const showText = emptyList || otherPicked || (!!value && !inList);

  const choices = emptyList ? [] : [...options, otherLabel];
  const selected = showText ? (emptyList ? [] : [otherLabel]) : value ? [value] : [];

  const set = (next: string[]) => {
    const picked = next[0] ?? "";
    if (picked === otherLabel) {
      setOtherPicked(true);
      onChange("");
    } else {
      setOtherPicked(false);
      onChange(picked);
    }
  };

  return (
    <div className="space-y-4">
      {!emptyList && (
        <SingleChoice
          field={field}
          options={choices}
          notes={notes}
          selected={selected}
          set={set}
          loading={loading}
          blockedText={blockedText}
          help={help}
        />
      )}
      {showText && (
        <FloatingInput
          label={emptyList ? field.label : `Type your ${field.label.toLowerCase()}`}
          value={inList ? "" : value}
          onChange={onChange}
          required={field.isRequired}
        />
      )}
    </div>
  );
}

export function FlowFieldInput({
  field,
  value,
  options,
  notes = {},
  loadingOptions,
  blockedText,
  onChange,
}: FlowFieldInputProps) {
  const required = field.isRequired;

  const help = field.helpText ? <p className="mt-2 px-1 text-sm text-neutral-500">{field.helpText}</p> : null;

  if (field.type === "SELECT" || field.type === "MULTI_SELECT") {
    const multiple = field.type === "MULTI_SELECT";
    const selected = multiple ? splitMulti(value) : value ? [value] : [];
    const set = (next: string[]) => onChange(multiple ? joinMulti(next) : (next[0] ?? ""));

    if (!multiple && field.allowOther) {
      return (
        <SelectWithOther
          field={field}
          value={value}
          options={options}
          notes={notes}
          loadingOptions={loadingOptions}
          blockedText={blockedText}
          help={help}
          onChange={onChange}
        />
      );
    }

    if (!multiple) {
      return (
        <SingleChoice
          field={field}
          options={options}
          notes={notes}
          selected={selected}
          set={set}
          loading={loadingOptions}
          blockedText={blockedText}
          help={help}
        />
      );
    }

    if (field.display === "PILLS" || field.display === "CARDS") {
      return (
        <div>
          <span className={labelClass}>
            {field.label}
            {required ? " *" : ""}
          </span>
          {field.display === "CARDS" ? (
            <CardSelect options={options} notes={notes} value={selected} onChange={set} multiple max={field.maxSelections} />
          ) : (
            <PillSelect options={options} value={selected} onChange={set} multiple max={field.maxSelections} />
          )}
          {help}
        </div>
      );
    }

    return (
      <div>
        <span className={labelClass}>
          {field.label}
          {required ? " *" : ""}
        </span>
        <SearchSelect
          label={field.label}
          options={options}
          value={selected}
          onChange={set}
          multiple
          max={field.maxSelections}
          placeholder={field.placeholder ?? "Search here"}
        />
        {help}
        {field.suggestions.length > 0 && (
          <div className="mt-5">
            <span className={labelClass}>Popular searches</span>
            <PillSelect options={field.suggestions} value={selected} onChange={set} multiple max={field.maxSelections} />
          </div>
        )}
      </div>
    );
  }

  if (field.type === "CHECKBOX") {
    return (
      <div>
        <span className={labelClass}>
          {field.label}
          {required ? " *" : ""}
        </span>
        <PillSelect
          options={["Yes", "No"]}
          value={value === "true" ? ["Yes"] : value === "false" ? ["No"] : []}
          onChange={(next) => onChange(next[0] === "Yes" ? "true" : "false")}
        />
        {help}
      </div>
    );
  }

  if (field.type === "FILE" || field.type === "IMAGE") return null;

  const inputType = field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : field.type === "DATE" ? "date" : "text";

  return (
    <div>
      <FloatingInput
        label={field.label}
        value={value}
        onChange={onChange}
        type={inputType}
        inputMode={field.type === "NUMBER" ? "decimal" : undefined}
        required={required}
        multiline={field.type === "TEXTAREA"}
        error={fieldError(field, value)}
      />
      {help}
    </div>
  );
}

// "use client";

// // src/components/step-flow/flow-field.tsx
// // Draws ONE question of a flow with the right control, from what the admin set on the field:
// //   SELECT        PILLS -> pills            otherwise -> search box with a list
// //   MULTI_SELECT  PILLS -> pills            otherwise -> search bar with chips (and quick-pick suggestions)
// //   TEXT, NUMBER, EMAIL, PHONE, DATE, TEXTAREA -> floating-label input
// //   CHECKBOX -> a yes/no pill pair
// // File and image questions are not part of a flow and are not drawn.
// import { fieldError, joinMulti, splitMulti, type FlowField } from "@/lib/eligibility";
// import { FloatingInput } from "./floating-input";
// import { PillSelect } from "./pill-select";
// import { SearchSelect } from "./search-select";

// type FlowFieldInputProps = {
//   field: FlowField;
//   /** The stored answer: a multi-select is its choices joined with commas. */
//   value: string;
//   /** The choices to offer. For a list that depends on an earlier answer the flow passes what it loaded. */
//   options: string[];
//   loadingOptions?: boolean;
//   /** For a list that depends on an earlier answer that is not given yet. */
//   blockedText?: string;
//   onChange: (next: string) => void;
// };

// const labelClass = "mb-2 block text-[15px] text-neutral-600";

// export function FlowFieldInput({ field, value, options, loadingOptions, blockedText, onChange }: FlowFieldInputProps) {
//   const required = field.isRequired;

//   const help = field.helpText ? <p className="mt-2 px-1 text-sm text-neutral-500">{field.helpText}</p> : null;

//   if (field.type === "SELECT" || field.type === "MULTI_SELECT") {
//     const multiple = field.type === "MULTI_SELECT";
//     const selected = multiple ? splitMulti(value) : value ? [value] : [];
//     const set = (next: string[]) => onChange(multiple ? joinMulti(next) : (next[0] ?? ""));

//     if (field.display === "PILLS") {
//       return (
//         <div>
//           <span className={labelClass}>
//             {field.label}
//             {required ? " *" : ""}
//           </span>
//           <PillSelect options={options} value={selected} onChange={set} multiple={multiple} max={field.maxSelections} />
//           {help}
//         </div>
//       );
//     }

//     if (multiple) {
//       return (
//         <div>
//           <span className={labelClass}>
//             {field.label}
//             {required ? " *" : ""}
//           </span>
//           <SearchSelect
//             label={field.label}
//             options={options}
//             value={selected}
//             onChange={set}
//             multiple
//             max={field.maxSelections}
//             placeholder={field.placeholder ?? "Search here"}
//           />
//           {help}
//           {field.suggestions.length > 0 && (
//             <div className="mt-5">
//               <span className={labelClass}>Popular searches</span>
//               <PillSelect
//                 options={field.suggestions}
//                 value={selected}
//                 onChange={set}
//                 multiple
//                 max={field.maxSelections}
//               />
//             </div>
//           )}
//         </div>
//       );
//     }

//     return (
//       <div>
//         <SearchSelect
//           label={field.label}
//           options={options}
//           value={selected}
//           onChange={set}
//           required={required}
//           loading={loadingOptions}
//           disabled={!!blockedText}
//           emptyText={blockedText ?? "No results"}
//         />
//         {blockedText ? <p className="mt-1 px-1 text-xs text-neutral-500">{blockedText}</p> : help}
//       </div>
//     );
//   }

//   if (field.type === "CHECKBOX") {
//     return (
//       <div>
//         <span className={labelClass}>
//           {field.label}
//           {required ? " *" : ""}
//         </span>
//         <PillSelect
//           options={["Yes", "No"]}
//           value={value === "true" ? ["Yes"] : value === "false" ? ["No"] : []}
//           onChange={(next) => onChange(next[0] === "Yes" ? "true" : "false")}
//         />
//         {help}
//       </div>
//     );
//   }

//   if (field.type === "FILE" || field.type === "IMAGE") return null;

//   const inputType = field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : field.type === "DATE" ? "date" : "text";

//   return (
//     <div>
//       <FloatingInput
//         label={field.label}
//         value={value}
//         onChange={onChange}
//         type={inputType}
//         inputMode={field.type === "NUMBER" ? "decimal" : undefined}
//         required={required}
//         multiline={field.type === "TEXTAREA"}
//         error={fieldError(field, value)}
//       />
//       {help}
//     </div>
//   );
// }