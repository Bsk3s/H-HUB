import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Star, ChevronLeft, ChevronRight, Heart, BookOpen, Sun, Moon } from 'lucide-react-native';
import ActivityRing from '../../../components/home/ActivityRing';
import { format, startOfWeek, addDays, getWeek, subWeeks, addWeeks, isToday, isSameDay } from 'date-fns';

// --- Color and UI Constants ---

const COLOR_MAP = {
    rose:   { ring: '#ff2d55', bg: 'rgba(255, 45, 85, 0.1)' },
    blue:   { ring: '#0a84ff', bg: 'rgba(10, 132, 255, 0.1)' },
    amber:  { ring: '#ffcc00', bg: 'rgba(255, 204, 0, 0.1)' },
    indigo: { ring: '#bf5af2', bg: 'rgba(191, 90, 242, 0.1)' }
};
const DEFAULT_COLOR = COLOR_MAP.blue;
const resolveColor = (colorName) => COLOR_MAP[colorName] || DEFAULT_COLOR;

// --- Helper Functions ---
const parseDuration = (duration) => {
    if (!duration) return { current: '0', goal: '0' };
    const parts = duration.replace(/m|chapters/g, '').trim().split('/');
    return {
        current: parts[0]?.trim() || '0',
        goal: parts[1]?.trim() || '0'
    }
}

const TimeViewSelector = memo(({ timeView, onViewChange }) => (
  <View className="flex-row justify-center gap-2 mb-4">
    {['Day', 'Week', 'Month'].map((view) => (
      <TouchableOpacity
        key={view}
        onPress={() => onViewChange(view.toLowerCase())}
        className={`px-4 py-1.5 rounded-full ${
          timeView === view.toLowerCase() ? 'bg-gray-900' : 'bg-gray-100'
        }`}
      >
        <Text className={`text-sm font-medium ${
          timeView === view.toLowerCase() ? 'text-white' : 'text-gray-600'
        }`}>
          {view.charAt(0).toUpperCase() + view.slice(1)}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
));

const DayView = React.memo(({ activities, onActivitySelect, getCurrentProgress }) => (
    <View className="flex-row flex-wrap justify-between mt-4">
    {activities.map((activity) => (
        <TouchableOpacity
            key={activity.type}
            onPress={() => onActivitySelect(activity)}
            className="w-[48%] mb-4"
        >
            <View className="items-center">
                <ActivityRing 
                  activity={activity} 
                  size={130} 
                  getCurrentProgress={getCurrentProgress}
                />
            </View>
      </TouchableOpacity>
    ))}
  </View>
));

const MonthView = React.memo(({ rawActivities, activities }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const { ringsForDate } = useMemo(() => {
        if (!rawActivities) return { ringsForDate: {} };

        const grouped = rawActivities.reduce((acc, log) => {
            const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(log);
            return acc;
        }, {});

        Object.keys(grouped).forEach(dateKey => {
            const logsOnDate = grouped[dateKey];
            grouped[dateKey] = activities.map(activityDef => {
                const logsForActivity = logsOnDate.filter(l => l.activityType === activityDef.type);
                const progress = logsForActivity.reduce((sum, l) => sum + l.progress, 0);
                const goal = activityDef.dailyGoal;
                return {
                    ...activityDef,
                    // Calculate progress as a percentage for the ring
                    progress: goal > 0 ? Math.min((progress / goal) * 100, 100) : 0,
                };
            });
        });
        return { ringsForDate: grouped };
    }, [rawActivities, activities]);

    const renderDay = useCallback(({ date }) => {
        if (!date) return <View style={{ flex: 1, height: 70 }} />;
        
        const dateKey = date.dateString;
        const dayRingsData = ringsForDate[dateKey] || activities.map(a => ({ ...a, progress: 0 }));
        const ringSize = 38;
        const isCurrentDay = isToday(date.dateObject);

        return (
            <View style={{ 
                flex: 1, 
                height: 70, 
                alignItems: 'center', 
                justifyContent: 'center',
            }}>
                <View style={{
                    backgroundColor: isCurrentDay ? '#4f46e5' : 'transparent',
                    borderRadius: 999, // Make it a circle
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                    marginBottom: 4,
                }}>
                    <Text style={{ 
                        color: isCurrentDay ? 'white' : 'black',
                        fontWeight: isCurrentDay ? 'bold' : 'normal',
                        fontSize: 12 
                    }}>
                    {date.day}
                </Text>
                </View>
                <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
                    {dayRingsData.map((activity, idx) => {
                        const scaleFactor = 1 - (idx * 0.2);
                        return (
                            <View key={idx} style={{ position: 'absolute', width: ringSize * scaleFactor, height: ringSize * scaleFactor }}>
                                <ActivityRing
                                    activity={activity}
                                    size={ringSize * scaleFactor}
                                    hideText={true}
                                    isCalendarView={true}
                                />
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }, [ringsForDate, activities]);
    
    // This is a simplified version of your original CustomCalendar logic
    const getDaysInMonth = useCallback((date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        const days = [];
        for (let i = 0; i < startingDay; i++) {
          days.push({ id: `empty-start-${i}`, date: null });
        }
        for (let i = 1; i <= daysInMonth; i++) {
          const dayDate = new Date(year, month, i);
          days.push({ 
            id: `day-${i}`, 
            date: {
              day: i,
              dateString: format(dayDate, 'yyyy-MM-dd'),
              dateObject: dayDate,
            }
          });
        }
        return days;
    }, []);

    const days = getDaysInMonth(currentMonth);
    const monthYear = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    return (
        <View className="p-4">
             <View className="flex-row items-center justify-between mb-5">
                <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2">
                    <ChevronLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold">{monthYear}</Text>
                <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2">
                    <ChevronRight size={24} color="#333" />
                </TouchableOpacity>
            </View>
            <View className="flex-row mb-3">
                {weekDays.map((day, index) => <Text key={index} className="flex-1 text-center text-gray-400">{day}</Text>)}
            </View>
            <View className="flex-row flex-wrap">
                {days.map((day, index) => (
                    <View key={index} style={{ width: `${100/7}%`, height: 70 }}>
                        {renderDay(day)}
                    </View>
                ))}
            </View>
        </View>
    );
});

const ACTIVITY_DEFINITIONS = {
  prayer: { color: '#F43F5E' },
  bible: { color: '#60A5FA' },
  devotional: { color: '#F59E0B' },
  'evening-prayer': { color: '#6366F1' },
};

// This WeekView component will display the calendar-like grid
const WeekView = ({ activityLogs, activities }) => {
    const [weekOffset, setWeekOffset] = useState(0);

    const { weekDays, weekLabel } = useMemo(() => {
        const start = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
        const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
        const label = `Week ${getWeek(start, { weekStartsOn: 1 })}`;
        return { weekDays: days, weekLabel: label };
    }, [weekOffset]);

    const completedStatus = useMemo(() => {
        if (!activityLogs) return {};

        const groupedByDate = activityLogs.reduce((acc, log) => {
            const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = {};
            }
            if (!acc[dateKey][log.activityType]) {
                acc[dateKey][log.activityType] = 0;
            }
            acc[dateKey][log.activityType] += log.progress;
            return acc;
        }, {});

        const status = {};
        for (const dateKey in groupedByDate) {
            status[dateKey] = {};
            for (const activityType in groupedByDate[dateKey]) {
                const activity = activities.find(a => a.type === activityType);
                if (activity) {
                    status[dateKey][activityType] = groupedByDate[dateKey][activityType] >= activity.dailyGoal;
                }
            }
        }
        return status;
    }, [activityLogs, activities]);

    return (
        <View className="bg-white p-4 rounded-xl shadow-sm">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)} className="p-2">
                    <ChevronLeft size={20} color="#374151" />
      </TouchableOpacity>
                <Text className="text-base font-semibold text-gray-700">{weekLabel}</Text>
                <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)} className="p-2">
                    <ChevronRight size={20} color="#374151" />
      </TouchableOpacity>
    </View>

            {/* Week Grid */}
            <View className="flex-row justify-around">
                {weekDays.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayActivities = completedStatus[dateKey] || {};

                    return (
                        <View key={day.toISOString()} className="items-center space-y-2">
                            <Text className={`text-xs font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-500'}`}>
                                {format(day, 'EEE')}
                            </Text>
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${isToday(day) ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <Text className={`text-sm font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-800'}`}>
                                    {format(day, 'd')}
                                </Text>
                            </View>

                            {/* Activity Indicators */}
                            <View className="h-10 justify-center items-center space-y-1 mt-1">
                                {activities.map(activity => {
                                    const isCompleted = dayActivities[activity.type];
                                    const colorInfo = resolveColor(activity.color);
                                    return (
              <View
                                            key={activity.type}
                style={{
                                                width: 20,
                                                height: 5,
                                                borderRadius: 2.5,
                                                backgroundColor: isCompleted ? colorInfo.ring : '#e5e7eb',
                }}
              />
                                    );
                                })}
          </View>
        </View>
                    );
                })}
    </View>
  </View>
);
};

const ICONS = {
  Heart,
  BookOpen,
  Sun,
  Moon,
};

const ActivitySummary = ({ activities, onActivitySelect }) => {
  const colorMap = {
    rose: { ring: '#ff2d55', bg: 'bg-rose-100', text: 'text-rose-500' },
    blue: { ring: '#0a84ff', bg: 'bg-blue-100', text: 'text-blue-500' },
    amber: { ring: '#ffcc00', bg: 'bg-amber-100', text: 'text-amber-500' },
    indigo: { ring: '#bf5af2', bg: 'bg-indigo-100', text: 'text-indigo-500' },
    gray: { ring: '#8e8e93', bg: 'bg-gray-100', text: 'text-gray-500' },
  };

  return (
    <View className="mt-8 px-4">
      <Text className="text-lg font-bold mb-4">Activity Summary</Text>
      {activities.map((activity) => {
        const Icon = ICONS[activity.icon];
        const uiColors = colorMap[activity.color] || colorMap.gray;
        const streakColors = colorMap.amber; // Streaks are always amber/gold
        
        return (
          <TouchableOpacity 
            key={activity.type} 
            onPress={() => onActivitySelect(activity)}
            className={`rounded-xl p-4 mb-3 flex-row items-center justify-between ${uiColors.bg}`}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
                  {Icon && <Icon size={24} color={uiColors.ring} />}
              </View>
              <View>
                <Text className="text-base font-semibold">{activity.title}</Text>
                <Text className="text-gray-500">
                  {`Goal: ${activity.dailyGoal} ${activity.goalUnit}`}
                </Text>
              </View>
            </View>
            {activity.streak > 0 && (
              <View className={`flex-row items-center ${streakColors.bg} rounded-full px-3 py-1`}>
                <Star size={14} color={streakColors.ring} />
                <Text className={`${streakColors.text} font-semibold ml-1`}>{activity.streak}d</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      )}
    </View>
  );
};

const StatsView = ({ activities }) => {
  const stats = useMemo(() => {
    const completedCount = activities.filter(a => a.progress >= a.dailyGoal).length;
    const totalCount = activities.length;
    
    const maxStreak = activities.reduce((max, a) => Math.max(max, a.streak || 0), 0);

    return {
      completed: `${completedCount}/${totalCount}`,
      streak: `${maxStreak}d`,
      hasStreak: maxStreak > 0,
    };
  }, [activities]);

  return (
    <View className="mt-8 px-4">
      <Text className="text-lg font-bold mb-4">Today's Stats</Text>
      <View className="flex-row justify-around">
        <View className="items-center bg-gray-50 p-4 rounded-xl w-1/2 mr-2">
          <Text className="text-gray-500">Completed</Text>
          <Text className="text-2xl font-bold mt-1">{stats.completed}</Text>
        </View>
        <View className="items-center bg-gray-50 p-4 rounded-xl w-1/2 ml-2">
          <Text className="text-gray-500">Streak</Text>
          <View className="flex-row items-center mt-1">
            {stats.hasStreak && <Text className="text-2xl">🔥</Text>}
            <Text className="text-2xl font-bold ml-1">{stats.streak}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const DailyProgressPage = ({ onBack, activities, activityLogs, onActivitySelect, getCurrentProgress }) => {
  const [timeView, setTimeView] = useState('day');
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity 
          onPress={onBack}
          className="p-2"
        >
          <ArrowLeft size={20} color="#4b5563" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold ml-2">Daily Progress</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <TimeViewSelector 
          timeView={timeView} 
          onViewChange={setTimeView} 
        />
        
        {timeView === 'day' && (
            <DayView 
              activities={activities} 
              onActivitySelect={onActivitySelect}
              getCurrentProgress={getCurrentProgress}
            />
        )}
        
        {timeView === 'month' && <MonthView rawActivities={activityLogs} activities={activities} />}

        {timeView === 'week' && <WeekView activityLogs={activityLogs} activities={activities} />}

        <ActivitySummary activities={activities} onActivitySelect={onActivitySelect} />
        <StatsView activities={activities} />

      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyProgressPage; 