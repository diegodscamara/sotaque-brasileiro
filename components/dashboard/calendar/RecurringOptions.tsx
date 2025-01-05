import { addDays, format } from "date-fns";

import { Calendar } from "@phosphor-icons/react";

interface RecurringConfig {
  pattern: 'weekly';
  daysOfWeek: number[];
  occurrences: number;
  endType: 'after' | 'on';
  endDate?: Date;
}

interface RecurringOptionsProps {
  config: RecurringConfig;
  onChange: (config: RecurringConfig) => void;
  maxOccurrences: number;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const RecurringOptions = ({ config, onChange, maxOccurrences }: RecurringOptionsProps) => {
  return (
    <div className="flex items-start gap-3">
      <Calendar className="mt-2 w-5 h-5 text-base-content/70" />
      <div className="flex-1 space-y-4">
        <div>
          <label className="block mb-2 font-medium text-sm">Repeats on</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <button
                key={index}
                type="button"
                className={`
                  rounded-full
                   text-sm font-medium btn min-h-fit h-6 w-6 px-5 py-2.5
                  ${config.daysOfWeek.includes(index)
                    ? 'btn-primary text-base-100'
                    : 'btn-outline btn-primary'
                  }
                `}
                onClick={() => {
                  onChange({
                    ...config,
                    daysOfWeek: config.daysOfWeek.includes(index)
                      ? config.daysOfWeek.filter(d => d !== index)
                      : [...config.daysOfWeek, index]
                  });
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-medium text-sm">Ends</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                className="radio radio-primary radio-sm"
                checked={config.endType === 'after'}
                onChange={() => onChange({ ...config, endType: 'after' })}
              />
              <span>After</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input-bordered w-20 input input-primary input-sm"
                min="1"
                max={maxOccurrences}
                value={config.occurrences}
                disabled={config.endType !== 'after'}
                onChange={(e) => onChange({
                  ...config,
                  occurrences: Math.min(parseInt(e.target.value) || 1, maxOccurrences)
                })}
              />
              <span>occurrences</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                className="radio radio-primary radio-sm"
                checked={config.endType === 'on'}
                onChange={() => onChange({ ...config, endType: 'on' })}
              />
              <span>On</span>
            </label>
            <input
              type="date"
              className="input-bordered input input-primary input-sm"
              disabled={config.endType !== 'on'}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              value={config.endDate ? format(config.endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => onChange({
                ...config,
                endDate: e.target.value ? new Date(e.target.value) : undefined
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 