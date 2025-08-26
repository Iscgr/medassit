import React from "react";
import { Loader2 } from "lucide-react";

export default function LazyLoadImage({ 
  src, 
  alt, 
  className = "", 
  placeholder = null,
  onLoad = null,
  onError = null 
}) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef(null);

  // Intersection Observer برای lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsError(true);
    if (onError) onError();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isInView ? (
        // Placeholder تا تصویر در view نباشد
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          {placeholder || <Loader2 className="w-6 h-6 animate-spin text-gray-400" />}
        </div>
      ) : (
        <>
          {/* تصویر اصلی */}
          {isInView && (
            <img
              src={src}
              alt={alt}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              } ${className}`}
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
            />
          )}

          {/* Loading state */}
          {!isLoaded && !isError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-sm">خطا در بارگذاری تصویر</div>
                <div className="text-xs mt-1">{alt}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}