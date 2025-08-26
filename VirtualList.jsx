import React from "react";

export default function VirtualList({
  items = [],
  itemHeight = 60,
  overscan = 5,
  renderItem,
  className = ""
}) {
  const containerRef = React.useRef(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(0);

  const onScroll = React.useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = items[i];
    if (!item) continue;
    
    visibleItems.push(
      <div
        key={item.id || i}
        style={{
          position: "absolute",
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight
        }}
      >
        {renderItem(item, i)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={`relative overflow-auto ${className}`}
      style={{ willChange: "transform" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems}
      </div>
    </div>
  );
}