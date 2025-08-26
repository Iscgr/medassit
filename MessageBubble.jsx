import React, { useMemo, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function MessageBubbleBase({ message, onHeightChange }) {
  const bubbleRef = useRef(null);
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  const formattedTime = useMemo(() => {
    const d = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp || Date.now());
    try {
      return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [message.timestamp]);

  // Report height changes to parent
  useEffect(() => {
    if (bubbleRef.current && onHeightChange) {
      const observer = new ResizeObserver((entries) => {
        const height = entries[0]?.contentRect?.height || 0;
        onHeightChange(Math.max(84, height)); // Minimum height of 84px
      });
      
      observer.observe(bubbleRef.current);
      
      // Initial height report
      const initialHeight = bubbleRef.current.scrollHeight;
      onHeightChange(Math.max(84, initialHeight));
      
      return () => observer.disconnect();
    }
  }, [onHeightChange]);

  if (isSystem) {
    return (
      <div ref={bubbleRef} className="w-full flex justify-center my-2">
        <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={bubbleRef}
      className={`flex items-end gap-2 px-3 w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-pink-100 text-pink-600 text-sm">SY</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
          isUser ? "bg-pink-600 text-white rounded-br-none" : "bg-white text-gray-800 border rounded-bl-none"
        }`}
      >
        <div className="text-sm break-words">{message.content}</div>
        <div className={`text-[10px] opacity-70 mt-1 ${isUser ? "text-right" : "text-left"}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
}

const MessageBubble = React.memo(MessageBubbleBase);
export default MessageBubble;