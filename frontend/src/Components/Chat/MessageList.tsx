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
      {messages.map((msg, index) => {
        let messageClass = styles.received;
        if (msg.from === currentUserId) {
          messageClass = styles.sent;
        } else if (msg.from === "system") {
          messageClass = styles.system;
        }

        return (
          <div key={index} className={`${styles.message} ${messageClass}`}>
            <div className={styles.messageContent}>
              {msg.message}
            </div>
            <div className={styles.messageTimestamp}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;