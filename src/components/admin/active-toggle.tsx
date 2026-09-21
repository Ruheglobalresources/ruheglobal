"use client";

import { useState } from "react";

interface ActiveToggleProps {
  id: string;
  checked: boolean;
  action: (id: string) => Promise<void>;
}

export function ActiveToggle({ id, checked, action }: ActiveToggleProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await action(id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-green-500" : "bg-neutral-300"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
