import React from "react";
import styles from "../../css/MeetingChat.module.css";
import { ChatMessage } from "../../types/ChatMessage";

interface MessageListProps {
  messages: ChatMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const currentUserId: string = localStorage.getItem("userId") || "";
  return (
    <div className={styles.messagesContainer}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${styles.message} ${
            msg.from === currentUserId
              ? styles.sent
              : msg.from === "system"
              ? styles.system
              : styles.received
          }`}
        >
          <div className={styles.messageContent}>{msg.content}</div>
          <div className={styles.messageTimestamp}>
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
