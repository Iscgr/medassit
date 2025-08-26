import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import MessageBubble from "./MessageBubble";

export default function VirtualizedMessageList({ messages, isLoading, estimatedItemHeight = 84 }) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerH, setContainerH] = useState(480);
  const [itemHeights, setItemHeights] = useState(new Map());
  const OVERSCAN = 6;
  const total = messages.length;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerH(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Calculate dynamic heights for messages
  const messagePositions = useMemo(() => {
    const positions = [];
    let currentTop = 0;
    
    messages.forEach((msg, index) => {
      const height = itemHeights.get(msg.id) || estimatedItemHeight;
      positions.push({
        index,
        top: currentTop,
        height
      });
      currentTop += height + 8; // Add 8px gap between messages
    });
    
    return positions;
  }, [messages, itemHeights, estimatedItemHeight]);

  const totalHeight = messagePositions.length > 0 
    ? messagePositions[messagePositions.length - 1].top + messagePositions[messagePositions.length - 1].height
    : 0;

  // Autoscroll to bottom on new message
  useEffect(() => {
    const el = containerRef.current;
    if (!el || messages.length === 0) return;
    
    // Always scroll to bottom for new messages in chat
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
  }, [messages.length]);

  // Calculate visible range based on dynamic positions
  const { startIndex, endIndex } = useMemo(() => {
    if (messagePositions.length === 0) return { startIndex: 0, endIndex: 0 };
    
    let start = 0;
    let end = messagePositions.length - 1;
    
    // Find first visible item
    for (let i = 0; i < messagePositions.length; i++) {
      const pos = messagePositions[i];
      if (pos.top + pos.height >= scrollTop - OVERSCAN * estimatedItemHeight) {
        start = i;
        break;
      }
    }
    
    // Find last visible item
    for (let i = start; i < messagePositions.length; i++) {
      const pos = messagePositions[i];
      if (pos.top > scrollTop + containerH + OVERSCAN * estimatedItemHeight) {
        end = i - 1;
        break;
      }
    }
    
    return { 
      startIndex: Math.max(0, start), 
      endIndex: Math.min(messagePositions.length - 1, end) 
    };
  }, [scrollTop, containerH, messagePositions, estimatedItemHeight]);

  const items = useMemo(() => {
    const res = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const m = messages[i];
      const pos = messagePositions[i];
      if (!m || !pos) continue;
      
      res.push(
        <div
          key={m.id}
          style={{
            position: "absolute",
            top: pos.top,
            left: 0,
            right: 0,
            minHeight: pos.height,
            display: "flex",
            alignItems: "flex-start",
            paddingBottom: "8px"
          }}
        >
          <MessageBubble 
            message={m} 
            onHeightChange={(height) => {
              setItemHeights(prev => {
                const newMap = new Map(prev);
                newMap.set(m.id, height);
                return newMap;
              });
            }}
          />
        </div>
      );
    }
    return res;
  }, [messages, messagePositions, startIndex, endIndex]);

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll} 
      className="flex-1 overflow-auto relative" 
      style={{ height: "100%" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {items}
      </div>
      {isLoading && (
        <div className="absolute bottom-3 right-3 text-xs bg-white border rounded-full px-2 py-1 shadow">
          در حال پردازش...
        </div>
      )}
    </div>
  );
}