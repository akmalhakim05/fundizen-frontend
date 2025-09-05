import React, { useState, useEffect, useRef } from 'react';
import { uploadService } from '../../services/uploadService';
import './OptimizedImage.css';

// Global cache to prevent duplicate optimization requests
const optimizationCache = new Map();
const pendingOptimizations = new Map();

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  crop = 'fill',
  className = '',
  fallback = null,
  loading = 'lazy'
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Ref to track component mount state
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!src) {
      setImageError(true);
      setImageLoading(false);
      return;
    }

    // Reset states when src changes
    setImageError(false);
    setImageLoading(true);
    
    // Only optimize Cloudinary images
    if (src.includes('cloudinary.com')) {
      optimizeImage(src, width, height, crop);
    } else {
      setImageSrc(src);
    }
  }, [src, width, height, crop]);

  const optimizeImage = async (originalUrl, w, h, c) => {
    try {
      // Create cache key
      const cacheKey = `${originalUrl}_${w}_${h}_${c}`;
      
      // Check cache first
      if (optimizationCache.has(cacheKey)) {
        console.log('OptimizedImage: Using cached optimization:', cacheKey);
        if (isMounted.current) {
          setImageSrc(optimizationCache.get(cacheKey));
        }
        return;
      }

      // Check if optimization is already pending
      if (pendingOptimizations.has(cacheKey)) {
        console.log('OptimizedImage: Waiting for pending optimization:', cacheKey);
        
        // Wait for pending optimization to complete
        try {
          const optimizedUrl = await pendingOptimizations.get(cacheKey);
          if (isMounted.current) {
            setImageSrc(optimizedUrl);
          }
        } catch (error) {
          console.warn('OptimizedImage: Pending optimization failed, using original:', error);
          if (isMounted.current) {
            setImageSrc(originalUrl);
          }
        }
        return;
      }

      console.log('OptimizedImage: Starting new optimization:', cacheKey);
      
      // Create promise for this optimization
      const optimizationPromise = uploadService.getOptimizedImageUrl(originalUrl, w, h, c)
        .then(optimizedUrl => {
          // Cache the result
          optimizationCache.set(cacheKey, optimizedUrl);
          
          // Remove from pending
          pendingOptimizations.delete(cacheKey);
          
          console.log('OptimizedImage: Optimization completed and cached:', optimizedUrl);
          return optimizedUrl;
        })
        .catch(error => {
          // Remove from pending
          pendingOptimizations.delete(cacheKey);
          
          console.warn('OptimizedImage: Optimization failed, using original:', error);
          
          // Cache the original URL as fallback
          optimizationCache.set(cacheKey, originalUrl);
          return originalUrl;
        });

      // Store pending promise
      pendingOptimizations.set(cacheKey, optimizationPromise);
      
      // Wait for result
      const optimizedUrl = await optimizationPromise;
      
      if (isMounted.current) {
        setImageSrc(optimizedUrl);
      }
      
    } catch (error) {
      console.error('OptimizedImage: Unexpected error during optimization:', error);
      if (isMounted.current) {
        setImageSrc(originalUrl); // Fallback to original
      }
    }
  };

  const handleImageLoad = () => {
    if (isMounted.current) {
      setImageLoading(false);
    }
  };

  const handleImageError = () => {
    if (isMounted.current) {
      console.error('OptimizedImage: Failed to load image:', imageSrc);
      setImageError(true);
      setImageLoading(false);
    }
  };

  // Return fallback if image failed and fallback is provided
  if (imageError && fallback) {
    return fallback;
  }

  // Return placeholder if image failed and no fallback
  if (imageError) {
    return (
      <div className={`image-placeholder ${className}`} style={{ width, height }}>
        <span>Image not available</span>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`}>
      {imageLoading && (
        <div className="image-loading" style={{ width, height }}>
          <div className="loading-spinner-small"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ 
          display: imageLoading ? 'none' : 'block',
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto'
        }}
      />
    </div>
  );
};

// Export function to clear cache if needed
export const clearOptimizationCache = () => {
  optimizationCache.clear();
  pendingOptimizations.clear();
  console.log('OptimizedImage: Cache cleared');
};

export default OptimizedImage;
