"use client";

import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Check, X } from "@phosphor-icons/react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/libs/utils";
import { Badge } from "@/components/ui/badge";

// Common learning goals
const COMMON_GOALS = [
  { id: "conversation", name: "Conversation Skills" },
  { id: "grammar", name: "Grammar Improvement" },
  { id: "vocabulary", name: "Vocabulary Building" },
  { id: "pronunciation", name: "Pronunciation" },
  { id: "business", name: "Business Portuguese" },
  { id: "travel", name: "Travel & Tourism" },
  { id: "academic", name: "Academic Portuguese" },
  { id: "culture", name: "Cultural Understanding" },
  { id: "reading", name: "Reading Comprehension" },
  { id: "writing", name: "Writing Skills" },
  { id: "exam", name: "Exam Preparation" },
];

interface MultiGoalsComboboxProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

export function MultiGoalsCombobox({
  values,
  onChange,
  placeholder = "Select learning goals...",
  className,
  emptyMessage = "No goals found.",
  searchPlaceholder = "Search goals..."
}: MultiGoalsComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter goals based on the search term
  const filteredGoals = React.useMemo(() => {
    if (!searchTerm) return COMMON_GOALS;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return COMMON_GOALS.filter((goal) =>
      goal.name.toLowerCase().includes(lowerSearchTerm) || 
      goal.id.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm]);

  // Find the selected goals
  const selectedGoals = React.useMemo(() => {
    return COMMON_GOALS.filter((goal) => values.includes(goal.id));
  }, [values]);

  // Toggle a goal selection
  const toggleGoal = (goalId: string) => {
    if (values.includes(goalId)) {
      onChange(values.filter(id => id !== goalId));
    } else {
      onChange([...values, goalId]);
    }
  };

  // Remove a goal from selection
  const removeGoal = (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    onChange(values.filter(id => id !== goalId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-popover hover:bg-popover dark:hover:bg-popover border-gray-300 focus:border-green-700 dark:focus:border-green-500 dark:border-gray-500 focus:ring-0 focus:ring-offset-0 min-h-10",
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-2 max-w-[90%]">
            {selectedGoals.length > 0 ? (
              selectedGoals.map(goal => (
                <Badge 
                  key={goal.id} 
                  variant="default"
                >
                  {goal.name}
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer"
                    onClick={(e) => removeGoal(e, goal.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        removeGoal(e as any, goal.id);
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                    <span className="sr-only">Remove {goal.name}</span>
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder || "Search goals by name..."} 
            onValueChange={setSearchTerm}
            className="border-none focus:ring-0"
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredGoals.map((goal) => (
              <CommandItem
                key={goal.id}
                value={`${goal.id} ${goal.name}`}
                onSelect={() => toggleGoal(goal.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    values.includes(goal.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {goal.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 