import React, { useState } from "react";
import { parseTask } from "../../parser/task-parser.js";

interface TaskInputProps {
  onSubmit: (input: ReturnType<typeof parseTask>) => void;
  placeholder?: string;
}

export function TaskInput({ onSubmit, placeholder }: TaskInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    const parsed = parseTask(value);
    onSubmit(parsed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? 'Add a task... (e.g., "buy milk tomorrow p1 #groceries")'}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </form>
  );
}
