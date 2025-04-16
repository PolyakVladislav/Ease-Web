import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import styles from "../../css/MeetingChat.module.css";
import { sendMessage } from "../../Services/Chat/socketService";
import { ChatMessage } from "../../types/ChatMessage";

interface ChatInputProps {
  socket: typeof Socket;
  meetingId: string;
  userId: string;
  otherUserId: string;
  acceptedSuggestion: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  socket,
  meetingId,
  userId,
  otherUserId,
  acceptedSuggestion,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const MAX_HEIGHT = 200;

  useEffect(() => {
    if (acceptedSuggestion) {
      setInputValue(acceptedSuggestion);
    }
  }, [acceptedSuggestion]);

  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    const newHeight = textarea.scrollHeight;
    if (newHeight < MAX_HEIGHT) {
      textarea.style.height = newHeight + "px";
      textarea.style.overflowY = "hidden";
    } else {
      textarea.style.height = MAX_HEIGHT + "px";
      textarea.style.overflowY = "auto";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = (): void => {
    if (!inputValue.trim()) return;

    const newMsg: ChatMessage = {
      from: userId,
      to: otherUserId,
      message: inputValue.trim(),
      timestamp: new Date(),
    };
    sendMessage(socket, meetingId, newMsg);

    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [inputValue]);

  return (
    <div className={styles.inputArea}>
      <textarea
        ref={textareaRef}
        placeholder="Type your message"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`${styles.messageInput} ${styles.autoResizeTextarea}`}
      />
      <button onClick={handleSend} className={styles.sendButton}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;
