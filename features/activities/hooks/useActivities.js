import { useState, useEffect } from 'react';
import { activities as defaultActivities } from '../../../data/homeData';

// Hook for managing activities state and progress
const useActivities = () => {
  const [activities, setActivities] = useState(defaultActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);

  const setLiveDraft = (activityId, progress) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, progress: Math.min(100, progress) }
        : activity
    ));
  };

  const commitLiveDraft = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setActivityLogs(prev => [...prev, {
        id: Date.now(),
        activityId,
        progress: activity.progress,
        timestamp: new Date()
      }]);
    }
  };

  const getCurrentProgress = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    return activity?.progress || 0;
  };

  return {
    activities,
    isLoading,
    error,
    setLiveDraft,
    commitLiveDraft,
    getCurrentProgress,
    activityLogs
  };
};

export default useActivities;