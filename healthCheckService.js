// Health Check Service - Implements Step 1 of the frontend integration plan
class HealthCheckService {
  constructor() {
    this.baseUrl = 'https://livekit-voice-agent-0jz0.onrender.com';
    this.isHealthy = false;
    this.lastCheckTime = null;
    this.healthCheckInterval = null;
    this.listeners = [];
  }

  // Add event listener for health status changes
  onHealthChange(callback) {
    this.listeners.push(callback);
  }

  // Remove event listener
  removeHealthListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  // Notify all listeners of health status change
  notifyHealthChange(isHealthy) {
    if (this.isHealthy !== isHealthy) {
      this.isHealthy = isHealthy;
      this.listeners.forEach(callback => callback(isHealthy));
    }
  }

  // Perform health check as specified in the integration plan
  async checkHealth() {
    try {
      console.log('🏥 Performing health check...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Health check response:', data);
      
      // Check for expected response format
      if (data.status === 'healthy') {
        console.log('✅ Backend is healthy');
        this.lastCheckTime = new Date();
        this.notifyHealthChange(true);
        return true;
      } else {
        throw new Error(`Service not healthy: ${data.status}`);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
      this.notifyHealthChange(false);
      
      if (error.name === 'AbortError') {
        throw new Error('Health check timed out');
      }
      throw error;
    }
  }

  // Start periodic health checks
  startPeriodicHealthChecks(intervalMs = 60000) { // Default: 1 minute
    if (this.healthCheckInterval) {
      this.stopPeriodicHealthChecks();
    }

    console.log(`🏥 Starting periodic health checks every ${intervalMs}ms`);
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error) {
        console.warn('⚠️ Periodic health check failed:', error.message);
      }
    }, intervalMs);

    // Perform initial health check
    this.checkHealth().catch(error => {
      console.warn('⚠️ Initial health check failed:', error.message);
    });
  }

  // Stop periodic health checks
  stopPeriodicHealthChecks() {
    if (this.healthCheckInterval) {
      console.log('🛑 Stopping periodic health checks');
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Get current health status
  getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheckTime: this.lastCheckTime,
      isMonitoring: !!this.healthCheckInterval
    };
  }

  // Check if backend is ready for connections
  async waitForHealthy(maxWaitMs = 30000, checkIntervalMs = 2000) {
    console.log(`⏳ Waiting for backend to be healthy (max ${maxWaitMs}ms)...`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      try {
        const isHealthy = await this.checkHealth();
        if (isHealthy) {
          console.log('✅ Backend is ready for connections');
          return true;
        }
      } catch (error) {
        console.log(`⏳ Backend not ready yet: ${error.message}`);
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
    
    throw new Error(`Backend did not become healthy within ${maxWaitMs}ms`);
  }
}

export default new HealthCheckService(); 