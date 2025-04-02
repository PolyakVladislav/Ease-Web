import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  createSocket,
  startChat,
  disconnectSocket,
} from "../../Services/Chat/socketService";
import { Socket } from "socket.io-client";
import { fetchChatHistory } from "../../Services/Chat/chatService";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ToastNotification from "./ToastNotification";
import styles from "../../css/MeetingChat.module.css";
import { ChatMessage } from "../../types/ChatMessage";

const ChatContainer: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const userId: string = localStorage.getItem("userId") || "";

  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [readOnly, setReadOnly] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Загрузка истории чата через HTTP
  useEffect(() => {
    if (!meetingId) return;
    fetchChatHistory(meetingId)
      .then((history: ChatMessage[]) => setMessages(history))
      .catch((err: unknown) => {
        console.error("Error fetching chat history", err);
        setToastMessage("Error loading chat history");
      });
  }, [meetingId]);

  // Инициализация сокета и подписка на события
  useEffect(() => {
    if (!userId || !meetingId) return;
    const newSocket: typeof Socket = createSocket(userId);
    setSocket(newSocket);
    startChat(newSocket, meetingId, userId);

    newSocket.on("receiveMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("aiSuggestion", (data: { suggestion: string }) => {
      setToastMessage(data.suggestion);
    });

    newSocket.on("consultationEnded", (data: { meetingId: string; summary: string }) => {
      setReadOnly(true);
      setToastMessage(`Consultation ended: ${data.summary}`);
    });

    return () => {
      disconnectSocket(newSocket);
    };
  }, [userId, meetingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleNewMessage = (msg: ChatMessage): void => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <h2>Meeting Chat</h2>
        {readOnly && (
          <span className={styles.readOnlyLabel}>Consultation Ended (Read-Only)</span>
        )}
      </header>
      <MessageList messages={messages} />
      <div ref={messagesEndRef} />
      {!readOnly && socket && meetingId && (
        <ChatInput
          socket={socket}
          meetingId={meetingId}
          userId={userId}
          onNewMessage={handleNewMessage}
        />
      )}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
};

export default ChatContainer;
