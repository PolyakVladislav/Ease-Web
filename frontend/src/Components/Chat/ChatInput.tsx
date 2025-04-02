import React, { useState } from "react";
import { Socket } from "socket.io-client";
import styles from "../../css/MeetingChat.module.css";
import { sendMessage } from "../../Services/Chat/socketService";
import { ChatMessage } from "../../types/ChatMessage";

interface ChatInputProps {
  socket: typeof Socket;
  meetingId: string;
  userId: string;
  otherUserId: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ socket, meetingId, userId, otherUserId }) => {
  const [inputValue, setInputValue] = useState<string>("");

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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={styles.inputArea}>
      <input
        type="text"
        placeholder="Type your message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.messageInput}
      />
      <button onClick={handleSend} className={styles.sendButton}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;
