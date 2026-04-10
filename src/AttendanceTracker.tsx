import { useState } from 'react';

interface Attendance {
  date: string;
  person1: boolean;
  person2: boolean;
}

interface AttendanceTrackerProps {
  attendance: Attendance[];
  onToggle: (date: string, person: 'person1' | 'person2') => void;
  currentMonth: string;
}

export function AttendanceTracker({ attendance, onToggle, currentMonth }: AttendanceTrackerProps) {
  const [expandMonth, setExpandMonth] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(a => a.date === today);

  // Calculate attendance summary
  const person1Days = attendance.filter(a => a.person1).length;
  const person2Days = attendance.filter(a => a.person2).length;

  const monthName = new Date(`${currentMonth}-01`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white/95 rounded-xl shadow-lg border border-[#e2e7ff] p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold headline-font text-[#131b2e]">Attendance Tracker</h2>
        <button
          onClick={() => setExpandMonth(!expandMonth)}
          className="px-4 py-2 primary-gradient text-white rounded-lg transition"
        >
          {expandMonth ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
          <h3 className="font-semibold text-[#3323cc] mb-2">Person 1</h3>
          <p className="text-3xl font-bold text-[#483ede]">{person1Days}</p>
          <p className="text-sm text-[#464555]">days present in {monthName}</p>
        </div>
        <div className="bg-[#f2f3ff] p-4 rounded-xl border border-[#e2e7ff]">
          <h3 className="font-semibold text-[#5a00c6] mb-2">Person 2</h3>
          <p className="text-3xl font-bold text-[#712ae2]">{person2Days}</p>
          <p className="text-sm text-[#464555]">days present in {monthName}</p>
        </div>
      </div>

      {/* Daily Calendar */}
      {expandMonth && (
        <div className="border-t border-[#e2e7ff] pt-6">
          <h3 className="font-semibold text-[#464555] mb-4">Today Attendance Only</h3>
          <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#e2e7ff]">
            <p className="font-semibold text-[#131b2e] mb-3">
              {new Date(today).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onToggle(today, 'person1')}
                className={`w-full py-2 px-3 rounded text-sm font-medium transition ${
                  todayAttendance?.person1
                    ? 'bg-[#483ede] text-white'
                    : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
                }`}
              >
                {todayAttendance?.person1 ? '✓ Person 1' : 'Person 1'}
              </button>

              <button
                onClick={() => onToggle(today, 'person2')}
                className={`w-full py-2 px-3 rounded text-sm font-medium transition ${
                  todayAttendance?.person2
                    ? 'bg-[#712ae2] text-white'
                    : 'bg-[#eaedff] text-[#464555] hover:bg-[#dae2fd]'
                }`}
              >
                {todayAttendance?.person2 ? '✓ Person 2' : 'Person 2'}
              </button>
            </div>

            <p className="mt-3 text-xs text-[#767586]">
              Attendance can only be marked for today. Past and future dates are locked.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
