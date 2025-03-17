"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function PasswordInput({
  label = "Password",
  value,
  onChange,
  error,
  required = false,
  className = "",
}: PasswordInputProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(value);

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score === 3) return "Medium password";
    return "Strong password";
  };

  return (
    <div className={className}>
      {/* Password input field with toggle visibility button */}
      <div className="*:not-first:mt-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            className={`pe-9 ${error ? "border-red-500" : ""}`}
            placeholder="Password"
            type={isVisible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-describedby={`${id}-description`}
            required={required}
            aria-invalid={!!error}
            aria-errormessage={error ? `${id}-error` : undefined}
          />
          <button
            className="focus:z-10 absolute inset-y-0 flex justify-center items-center disabled:opacity-50 focus-visible:border-ring rounded-e-md outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] w-9 h-full text-muted-foreground/80 hover:text-foreground transition-[color,box-shadow] disabled:cursor-not-allowed disabled:pointer-events-none end-0"
            type="button"
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            aria-controls="password"
          >
            {isVisible ? (
              <EyeOffIcon size={16} aria-hidden="true" />
            ) : (
              <EyeIcon size={16} aria-hidden="true" />
            )}
          </button>
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1 text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Password strength indicator */}
      <div
        className="mt-3 mb-4 bg-border rounded-full w-full h-1 overflow-hidden"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 4) * 100}%` }}
        ></div>
      </div>

      {/* Password strength description */}
      <p id={`${id}-description`} className="mb-2 font-medium text-foreground text-sm">
        {getStrengthText(strengthScore)}. Must contain:
      </p>

      {/* Password requirements list */}
      <ul className="space-y-1.5" aria-label="Password requirements">
        {strength.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <CheckIcon size={16} className="text-green-700 dark:text-green-500" aria-hidden="true" />
            ) : (
              <XIcon size={16} className="text-muted-foreground/80" aria-hidden="true" />
            )}
            <span className={`text-xs ${req.met ? "text-green-700 dark:text-green-500" : "text-muted-foreground"}`}>
              {req.text}
              <span className="sr-only">
                {req.met ? " - Requirement met" : " - Requirement not met"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
} 