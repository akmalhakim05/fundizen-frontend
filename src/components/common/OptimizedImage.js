import React, { useState } from 'react';
import { uploadService } from '../../services/uploadService';
import './OptimizedImage.css';

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

  React.useEffect(() => {
    if (src && src.includes('cloudinary.com')) {
      // Get optimized version for Cloudinary images
      uploadService.getOptimizedImageUrl(src, width, height, crop)
        .then(optimizedUrl => {
          setImageSrc(optimizedUrl);
        })
        .catch(() => {
          setImageSrc(src); // Fallback to original
        });
    } else {
      setImageSrc(src);
    }
  }, [src, width, height, crop]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (imageError && fallback) {
    return fallback;
  }

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

export default OptimizedImage;