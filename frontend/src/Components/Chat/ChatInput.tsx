import React, { useState } from "react";
import styles from "../../css/MeetingChat.module.css";
import { sendMessage } from "../../Services/Chat/socketService";
import { ChatMessage } from "../../types/ChatMessage";
import { Socket } from "socket.io-client"; 


interface ChatInputProps {
  socket: typeof Socket;
  meetingId: string;
  userId: string;
  onNewMessage: (msg: ChatMessage) => void;
}


const ChatInput: React.FC<ChatInputProps> = ({ socket, meetingId, userId, onNewMessage }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleSend = (): void => {
    if (!inputValue.trim()) return;
    const newMsg: ChatMessage = {
      from: userId,
      to: "",
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    sendMessage(socket, meetingId, newMsg);
    onNewMessage(newMsg);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSend();
    }
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
