"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "./message";

interface ChatMessage {
  id: number | string;
  pfp: string;
  text: string;
  name: string;
}

interface MessagesProps {
	pfp: string;
	name: string;
	route: string;
	initialText: string;
}

export const MessageChat = ({pfp, name, route, initialText}: MessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: Date.now(),
      pfp: pfp,
      name: name,
      text: initialText,
    },
  ]);

  const [isAwaitingAI, setIsAwaitingAI] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const mapToOpenAIRoleContent = (msg: ChatMessage) => {
    return {
      role: msg.name === "You" ? "user" : "assistant",
      content: msg.text,
    };
  };

  const handleSend = async () => {
    const trimmedText = inputValue.trim();
    if (!trimmedText || isAwaitingAI) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      pfp: "/pfp/user.png",
      name: "You",
      text: trimmedText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setIsAwaitingAI(true);

    const thinkingMessage: ChatMessage = {
      id: "thinking",
      pfp: pfp,
      name: name,
      text: "",
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const conversation = [...messages, userMessage].map(
        mapToOpenAIRoleContent
      );

      const res = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: conversation }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await res.json();
      const aiText = data.response.choices[0].message.content;

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "thinking")
      );

      const aiMessage: ChatMessage = {
        id: Date.now(),
        pfp: pfp,
        name: name,
        text: aiText,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error calling AI:", err);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "thinking").concat({
          id: Date.now(),
          pfp: pfp,
          name: name,
          text: "Oops, something went wrong. Please try again.",
        })
      );
    } finally {
      setIsAwaitingAI(false);
    }
  };

  return (
    <div
      className="w-[80%] h-[72.5vh] backdrop-blur-md bg-black/50 rounded-lg p-4 flex flex-col"
    >
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-2 custom-scrollbar"
      >
        {messages.map((msg) => (
          <Message
            key={msg.id}
            id={msg.id}
            pfp={msg.pfp}
            text={msg.text}
            name={msg.name}
          />
        ))}
      </div>

      <div className="flex items-center mt-4 w-full h-12 px-4 bg-background/60 rounded-full">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow bg-transparent outline-none text-white placeholder-gray-300"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={false}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isAwaitingAI}
          className={`ml-2 px-4 py-1 rounded-full font-semibold transition-colors
            ${
              !inputValue.trim() || isAwaitingAI
                ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
            }
          `}
        >
          Send
        </button>
      </div>
    </div>
  );
};
