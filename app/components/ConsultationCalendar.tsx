'use client';

import { useState, useMemo } from 'react';
import { Check, Calendar } from 'lucide-react';
import {
  generateTimeSlotsForDate,
  getAvailableDays,
  type TimeSlot,
} from '@/lib/consultation-slots';

// ============================================================================
// ConsultationCalendar - Visual mini-calendar for booking consultations
// ============================================================================
// Shows next 48 hours of available weekday time slots (9 AM – 5 PM EST).
// User picks two preferred times (first choice + alternate).
// Slots are filtered by consultation duration so no slot overflows business hours.

interface SelectedSlots {
  first: TimeSlot | null;
  second: TimeSlot | null;
}

interface ConsultationCalendarProps {
  /** Duration of the consultation in minutes (15, 30, or 45) */
  durationMinutes: number;
  /** Called when both slots are selected */
  onSlotsSelected: (first: TimeSlot, second: TimeSlot) => void;
  /** Called when selection is cleared/incomplete */
  onSlotsCleared: () => void;
}

function formatDayLabel(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
}

// ============================================================================
// Component
// ============================================================================

export default function ConsultationCalendar({
  durationMinutes,
  onSlotsSelected,
  onSlotsCleared,
}: ConsultationCalendarProps) {
  const [selected, setSelected] = useState<SelectedSlots>({ first: null, second: null });
  const [selectingSlot, setSelectingSlot] = useState<'first' | 'second'>('first');

  const availableDays = useMemo(() => getAvailableDays(), []);

  // Generate time slots for each available day, filtered by duration
  const slotsByDay = useMemo(() => {
    return availableDays.map((day) => ({
      day,
      slots: generateTimeSlotsForDate(day, durationMinutes),
    }));
  }, [availableDays, durationMinutes]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (selectingSlot === 'first') {
      const newSelected = { first: slot, second: null };
      setSelected(newSelected);
      setSelectingSlot('second');
      onSlotsCleared();
    } else {
      // Don't allow same slot for both choices
      if (selected.first && slot.date.getTime() === selected.first.date.getTime()) return;
      const newSelected = { ...selected, second: slot };
      setSelected(newSelected);
      if (newSelected.first && newSelected.second) {
        onSlotsSelected(newSelected.first, newSelected.second);
      }
    }
  };

  const isSlotSelected = (slot: TimeSlot, which: 'first' | 'second') => {
    const sel = which === 'first' ? selected.first : selected.second;
    return sel?.date.getTime() === slot.date.getTime();
  };

  const resetSelection = () => {
    setSelected({ first: null, second: null });
    setSelectingSlot('first');
    onSlotsCleared();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">
            Pick your two best times
          </h3>
          <p className="text-xs text-slate-400">
            {selectingSlot === 'first' ? 'Select your preferred time' : 'Now pick a backup time'}
          </p>
        </div>
      </div>

      {/* Selection indicators */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { setSelectingSlot('first'); }}
          className={`flex-1 p-3 rounded-xl text-left text-sm transition-all ${
            selectingSlot === 'first'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
              : selected.first
                ? 'bg-white/5 border border-white/10 text-white'
                : 'bg-white/5 border border-white/10 text-slate-500'
          }`}
        >
          <span className="block text-xs text-slate-400 mb-1">First choice</span>
          {selected.first ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400" />
              {formatDayLabel(selected.first.date)} {selected.first.label}
            </span>
          ) : (
            <span className="text-slate-500">Not selected</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { if (selected.first) setSelectingSlot('second'); }}
          className={`flex-1 p-3 rounded-xl text-left text-sm transition-all ${
            selectingSlot === 'second'
              ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
              : selected.second
                ? 'bg-white/5 border border-white/10 text-white'
                : 'bg-white/5 border border-white/10 text-slate-500'
          }`}
        >
          <span className="block text-xs text-slate-400 mb-1">Backup time</span>
          {selected.second ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-blue-400" />
              {formatDayLabel(selected.second.date)} {selected.second.label}
            </span>
          ) : (
            <span className="text-slate-500">Not selected</span>
          )}
        </button>
      </div>

      {/* Day columns with time slots */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {slotsByDay.map(({ day, slots }) => (
          <div key={day.toISOString()} className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-sm font-semibold text-white mb-3">
              {formatDayLabel(day)}
            </p>
            {slots.length === 0 ? (
              <p className="text-xs text-slate-500">No slots available</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {slots.map((slot) => {
                  const isFirst = isSlotSelected(slot, 'first');
                  const isSecond = isSlotSelected(slot, 'second');
                  const isAnySelected = isFirst || isSecond;

                  return (
                    <button
                      key={slot.date.toISOString()}
                      type="button"
                      onClick={() => handleSlotClick(slot)}
                      className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        isFirst
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isSecond
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        {slot.label}
                        {isAnySelected && (
                          <Check className={`w-3.5 h-3.5 ${isFirst ? 'text-emerald-400' : 'text-blue-400'}`} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reset link */}
      {(selected.first || selected.second) && (
        <button
          type="button"
          onClick={resetSelection}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Reset selection
        </button>
      )}
    </div>
  );
}
