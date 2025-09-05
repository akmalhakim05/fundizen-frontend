class OptimizationCache {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
  }

  generateKey(url, width, height, crop) {
    return `${url}_${width}_${height}_${crop}`;
  }

  async getOptimizedUrl(originalUrl, width, height, crop, optimizationFunction) {
    const key = this.generateKey(originalUrl, width, height, crop);
    
    // Check cache first
    if (this.cache.has(key)) {
      console.log('Cache hit for:', key);
      return this.cache.get(key);
    }

    // Check if optimization is already pending
    if (this.pending.has(key)) {
      console.log('Waiting for pending optimization:', key);
      return this.pending.get(key);
    }

    // Start new optimization
    console.log('Starting new optimization:', key);
    const promise = optimizationFunction(originalUrl, width, height, crop)
      .then(result => {
        // Cache the result
        this.cache.set(key, result);
        this.pending.delete(key);
        console.log('Optimization completed and cached:', key);
        return result;
      })
      .catch(error => {
        // Remove from pending on error
        this.pending.delete(key);
        // Cache the original URL as fallback
        this.cache.set(key, originalUrl);
        console.warn('Optimization failed, cached original URL:', error);
        return originalUrl;
      });

    // Store pending promise
    this.pending.set(key, promise);
    
    return promise;
  }

  clear() {
    this.cache.clear();
    this.pending.clear();
    console.log('Optimization cache cleared');
  }

  getStats() {
    return {
      cached: this.cache.size,
      pending: this.pending.size
    };
  }
}

// Export singleton instance
export const optimizationCache = new OptimizationCache();

// Export class for testing
export default OptimizationCache;