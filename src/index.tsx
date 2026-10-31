'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
const DAY = 86400000;
export function parseDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new TypeError('Use YYYY-MM-DD.');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value ||
    date.getUTCFullYear() < 1900 ||
    date.getUTCFullYear() > 2100
  )
    throw new RangeError('Date must be valid and within1900..2100.');
  return date;
}
export const formatDate = (date: Date) => date.toISOString().slice(0, 10);
export type DateValue = string | null | readonly [string | null, string | null];
export interface DatePickerProps {
  value?: DateValue;
  defaultValue?: DateValue;
  onChange?: (value: DateValue) => void;
  mode?: 'single' | 'range';
  min?: string;
  max?: string;
  disabledDate?: (date: string) => boolean;
  disabledWeekdays?: readonly number[];
  maxRangeDays?: number;
  locale?: string;
  firstDayOfWeek?: number;
  initialMonth?: string;
  label?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}
export function DatePicker({
  value: controlled,
  defaultValue = null,
  onChange,
  mode = 'single',
  min = '1900-01-01',
  max = '2100-12-31',
  disabledDate,
  disabledWeekdays = [],
  maxRangeDays = 366,
  locale = 'en-US',
  firstDayOfWeek = 1,
  initialMonth,
  label = 'Choose date',
  name,
  disabled = false,
  className,
}: DatePickerProps) {
  const minTime = parseDate(min).getTime();
  const maxTime = parseDate(max).getTime();
  if (
    minTime > maxTime ||
    !Number.isInteger(firstDayOfWeek) ||
    firstDayOfWeek < 0 ||
    firstDayOfWeek > 6 ||
    !Number.isInteger(maxRangeDays) ||
    maxRangeDays < 1 ||
    maxRangeDays > 3660 ||
    !['single', 'range'].includes(mode) ||
    disabledWeekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  )
    throw new RangeError('Invalid calendar bounds.');
  const [internal, setValue] = useState<DateValue>(defaultValue);
  const value = controlled === undefined ? internal : controlled;
  const range = Array.isArray(value) ? value : [typeof value === 'string' ? value : null, null];
  for (const day of range) if (day !== null && day !== undefined) parseDate(day);
  const today = formatDate(new Date());
  const start = initialMonth
    ? `${initialMonth}-01`
    : (range[0] ?? (today < min ? min : today > max ? max : today));
  parseDate(start);
  const [month, setMonth] = useState(start.slice(0, 7));
  const [focused, setFocused] = useState(start);
  const [error, setError] = useState<string | null>(null);
  const focusRequested = useRef(false);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const id = useId();
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' }),
    [locale],
  );
  const dayFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }),
    [locale],
  );
  const weekday = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }),
    [locale],
  );
  const monthDate = parseDate(`${month}-01`);
  const offset = (monthDate.getUTCDay() - firstDayOfWeek + 7) % 7;
  const first = monthDate.getTime() - offset * DAY;
  const days = Array.from({ length: 42 }, (_, index) => formatDate(new Date(first + index * DAY)));
  const unavailable = (day: string) =>
    disabled ||
    day < min ||
    day > max ||
    disabledWeekdays.includes(new Date(`${day}T00:00:00Z`).getUTCDay()) ||
    Boolean(disabledDate?.(day));
  useEffect(() => {
    if (focusRequested.current) {
      refs.current.get(focused)?.focus();
      focusRequested.current = false;
    }
  }, [focused, month]);
  const choose = (day: string) => {
    if (unavailable(day)) return;
    let next: DateValue = day;
    if (mode === 'range') {
      if (!range[0] || range[1]) next = [day, null];
      else {
        const lower = day < range[0] ? day : range[0];
        const upper = day < range[0] ? range[0] : day;
        const count = (parseDate(upper).getTime() - parseDate(lower).getTime()) / DAY + 1;
        if (count > maxRangeDays) {
          setError('Range exceeds its day limit.');
          return;
        }
        for (let index = 0; index < count; index += 1)
          if (unavailable(formatDate(new Date(parseDate(lower).getTime() + index * DAY)))) {
            setError('Range contains a disabled date.');
            return;
          }
        next = [lower, upper];
      }
    }
    if (controlled === undefined) setValue(next);
    onChange?.(next);
    setError(null);
  };
  const moveMonth = (delta: number) => {
    const date = new Date(monthDate);
    date.setUTCMonth(date.getUTCMonth() + delta);
    const day = formatDate(date);
    if (day.slice(0, 7) < min.slice(0, 7) || day.slice(0, 7) > max.slice(0, 7)) return;
    setMonth(day.slice(0, 7));
    setFocused(day);
  };
  const selected = (day: string) =>
    mode === 'range'
      ? Boolean(range[0] && day >= range[0] && day <= (range[1] ?? range[0]))
      : value === day;
  return (
    <fieldset className={className} disabled={disabled}>
      <legend>{label}</legend>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          aria-label="Previous month"
          disabled={month <= min.slice(0, 7)}
          onClick={() => moveMonth(-1)}
        >
          {'<'}
        </button>
        <strong id={`${id}-month`} aria-live="polite">
          {formatter.format(monthDate)}
        </strong>
        <button
          type="button"
          aria-label="Next month"
          disabled={month >= max.slice(0, 7)}
          onClick={() => moveMonth(1)}
        >
          {'>'}
        </button>
      </div>
      <table role="grid" aria-labelledby={`${id}-month`} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, index) => (
              <th key={index} scope="col">
                {weekday.format(new Date(Date.UTC(2024, 0, 7 + ((firstDayOfWeek + index) % 7))))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const outside = day.slice(0, 7) !== month;
                return (
                  <td key={day} aria-selected={selected(day)}>
                    <button
                      ref={(node) => {
                        if (node) refs.current.set(day, node);
                        else refs.current.delete(day);
                      }}
                      type="button"
                      tabIndex={focused === day ? 0 : -1}
                      disabled={outside || unavailable(day)}
                      aria-label={dayFormat.format(new Date(`${day}T00:00:00Z`))}
                      aria-pressed={selected(day)}
                      onFocus={() => setFocused(day)}
                      onClick={() => choose(day)}
                      onKeyDown={(event) => {
                        let delta = 0;
                        if (event.key === 'ArrowRight') delta = 1;
                        if (event.key === 'ArrowLeft') delta = -1;
                        if (event.key === 'ArrowDown') delta = 7;
                        if (event.key === 'ArrowUp') delta = -7;
                        if (event.key === 'Home')
                          delta = -(
                            (new Date(`${day}T00:00:00Z`).getUTCDay() - firstDayOfWeek + 7) %
                            7
                          );
                        if (event.key === 'End')
                          delta =
                            6 -
                            ((new Date(`${day}T00:00:00Z`).getUTCDay() - firstDayOfWeek + 7) % 7);
                        if (!delta && !['Home', 'End'].includes(event.key)) return;
                        event.preventDefault();
                        let next = formatDate(
                          new Date(new Date(`${day}T00:00:00Z`).getTime() + delta * DAY),
                        );
                        for (let attempts = 0; attempts < 366; attempts += 1) {
                          if (next < min || next > max) return;
                          if (!unavailable(next)) {
                            setMonth(next.slice(0, 7));
                            setFocused(next);
                            focusRequested.current = true;
                            return;
                          }
                          next = formatDate(
                            new Date(
                              new Date(`${next}T00:00:00Z`).getTime() + (delta < 0 ? -1 : 1) * DAY,
                            ),
                          );
                        }
                      }}
                      style={{
                        minWidth: 32,
                        minHeight: 32,
                        font: 'inherit',
                        background: selected(day) ? 'Highlight' : undefined,
                        color: selected(day) ? 'HighlightText' : undefined,
                      }}
                    >
                      {new Intl.NumberFormat(locale).format(Number(day.slice(-2)))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() => {
          const next = mode === 'range' ? ([null, null] as const) : null;
          if (controlled === undefined) setValue(next);
          onChange?.(next);
          setError(null);
        }}
      >
        Clear
      </button>
      {name &&
        (mode === 'range' ? (
          <>
            <input type="hidden" name={`${name}.start`} value={range[0] ?? ''} />
            <input type="hidden" name={`${name}.end`} value={range[1] ?? ''} />
          </>
        ) : (
          <input type="hidden" name={name} value={typeof value === 'string' ? value : ''} />
        ))}
      {error && <p role="alert">{error}</p>}
    </fieldset>
  );
}
export default DatePicker;
