import { InteractionManager, DeviceEventEmitter } from 'react-native';

// Performance monitoring utilities for development
class PerformanceMonitor {
  constructor() {
    this.isEnabled = __DEV__;
    this.measurements = new Map();
    this.memoryWarnings = [];
    this.renderCounts = new Map();
  }

  /**
   * Start measuring performance for a specific operation
   */
  startMeasurement(key) {
    if (!this.isEnabled) return;
    
    this.measurements.set(key, {
      startTime: Date.now(),
      startMemory: this.getMemoryUsage(),
    });
  }

  /**
   * End measurement and log results
   */
  endMeasurement(key, context = '') {
    if (!this.isEnabled) return;
    
    const measurement = this.measurements.get(key);
    if (!measurement) {
      console.warn(`No measurement found for key: ${key}`);
      return;
    }

    const duration = Date.now() - measurement.startTime;
    const memoryDelta = this.getMemoryUsage() - measurement.startMemory;
    
    console.log(`📊 Performance [${key}]:`, {
      duration: `${duration}ms`,
      memoryDelta: `${memoryDelta.toFixed(2)}MB`,
      context,
    });

    // Warn if operation is slow
    if (duration > 100) {
      console.warn(`⚠️ Slow operation detected: ${key} took ${duration}ms`);
    }

    // Warn if memory usage increased significantly
    if (memoryDelta > 10) {
      console.warn(`⚠️ High memory usage: ${key} increased memory by ${memoryDelta.toFixed(2)}MB`);
    }

    this.measurements.delete(key);
  }

  /**
   * Track component render counts
   */
  trackRender(componentName) {
    if (!this.isEnabled) return;
    
    const current = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, current + 1);
    
    // Warn about excessive re-renders
    if ((current + 1) % 50 === 0) {
      console.warn(`⚠️ Component ${componentName} has rendered ${current + 1} times`);
    }
  }

  /**
   * Get current memory usage (approximate)
   */
  getMemoryUsage() {
    // This is a rough estimate - in production you'd use more sophisticated tools
    return process.memoryUsage ? process.memoryUsage().heapUsed / 1024 / 1024 : 0;
  }

  /**
   * Monitor for memory warnings
   */
  startMemoryMonitoring() {
    if (!this.isEnabled) return;

    // Listen for memory warnings on iOS
    const memoryWarningListener = DeviceEventEmitter.addListener(
      'memoryWarning',
      () => {
        const warning = {
          timestamp: Date.now(),
          memoryUsage: this.getMemoryUsage(),
        };
        this.memoryWarnings.push(warning);
        console.warn('🚨 Memory warning received:', warning);
      }
    );

    return () => {
      memoryWarningListener.remove();
    };
  }

  /**
   * Measure list performance
   */
  measureListPerformance(listName, itemCount) {
    if (!this.isEnabled) return;
    
    console.log(`📋 List Performance [${listName}]:`, {
      itemCount,
      renderBatch: Math.min(10, itemCount),
      windowSize: Math.min(10, Math.ceil(itemCount / 10)),
    });
  }

  /**
   * Get performance summary
   */
  getSummary() {
    if (!this.isEnabled) return null;
    
    return {
      activeAeasurements: this.measurements.size,
      renderCounts: Object.fromEntries(this.renderCounts),
      memoryWarnings: this.memoryWarnings.length,
      currentMemory: `${this.getMemoryUsage().toFixed(2)}MB`,
    };
  }

  /**
   * Clear all monitoring data
   */
  reset() {
    this.measurements.clear();
    this.renderCounts.clear();
    this.memoryWarnings = [];
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startMeasurement = (key) => performanceMonitor.startMeasurement(key);
export const endMeasurement = (key, context) => performanceMonitor.endMeasurement(key, context);
export const trackRender = (componentName) => performanceMonitor.trackRender(componentName);
export const measureListPerformance = (listName, itemCount) => performanceMonitor.measureListPerformance(listName, itemCount);
export const getPerformanceSummary = () => performanceMonitor.getSummary();
export const resetPerformanceMonitor = () => performanceMonitor.reset();
export const startMemoryMonitoring = () => performanceMonitor.startMemoryMonitoring();

export default performanceMonitor;


