import React from "react";

interface MessageProps {
  id: number | string;
  pfp: string;
  text: string;
  name: string;
}

export const Message = ({ id, pfp, text, name }: MessageProps) => {
  const isThinking = id === "thinking";

  return (
    <div className="flex items-start space-x-2">
      <img
        src={pfp}
        alt={`${name} profile`}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="whitespace-normal break-words max-w-full">
        <p className="font-semibold">{name}</p>
        {isThinking ? <ThinkingDots /> : <p>{text}</p>}
      </div>
    </div>
  );
};

function ThinkingDots() {
  return (
    <div className="flex items-center space-x-1 mt-2">
      <div
        className="w-1 h-1 bg-white opacity-50 rounded-full animate-bounce"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="w-1 h-1 bg-white opacity-50 rounded-full animate-bounce"
        style={{ animationDelay: ".2s" }}
      />
      <div
        className="w-1 h-1 bg-white opacity-50 rounded-full animate-bounce"
        style={{ animationDelay: ".4s" }}
      />
    </div>
  );
}
