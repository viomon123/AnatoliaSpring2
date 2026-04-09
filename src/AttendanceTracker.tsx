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

  // Get all dates in current month
  const getDaysInMonth = () => {
    const [year, month] = currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const days = [];
    
    while (date.getMonth().toString() === (parseInt(month) - 1).toString()) {
      days.push(new Date(date).toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  };

  const daysInMonth = getDaysInMonth();

  // Calculate attendance summary
  const person1Days = attendance.filter(a => a.person1).length;
  const person2Days = attendance.filter(a => a.person2).length;

  const monthName = new Date(`${currentMonth}-01`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 Attendance Tracker</h2>
        <button
          onClick={() => setExpandMonth(!expandMonth)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {expandMonth ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-700 mb-2">Person 1</h3>
          <p className="text-3xl font-bold text-blue-600">{person1Days}</p>
          <p className="text-sm text-gray-600">days present in {monthName}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-gray-700 mb-2">Person 2</h3>
          <p className="text-3xl font-bold text-purple-600">{person2Days}</p>
          <p className="text-sm text-gray-600">days present in {monthName}</p>
        </div>
      </div>

      {/* Daily Calendar */}
      {expandMonth && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-700 mb-4">Daily Attendance - {monthName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysInMonth.map(date => {
              const dayAttendance = attendance.find(a => a.date === date);
              const dateObj = new Date(date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dateObj.getDate();

              return (
                <div key={date} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-3">
                    {dayName}, {dayNum}
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => onToggle(date, 'person1')}
                      className={`w-full py-2 px-3 rounded text-sm font-medium transition ${
                        dayAttendance?.person1
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {dayAttendance?.person1 ? '✓ Person 1' : 'Person 1'}
                    </button>
                    
                    <button
                      onClick={() => onToggle(date, 'person2')}
                      className={`w-full py-2 px-3 rounded text-sm font-medium transition ${
                        dayAttendance?.person2
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {dayAttendance?.person2 ? '✓ Person 2' : 'Person 2'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
