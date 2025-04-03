import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { createSocket, startChat, requestAISuggestion, endConsultation, disconnectSocket } from "../../Services/Chat/socketService";
import { fetchChatHistory, fetchMeetingDetails } from "../../Services/Chat/chatService";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import AISuggestionsContainer from "./AISuggestionsContainer";
import ToastNotification from "./ToastNotification";
import styles from "../../css/MeetingChat.module.css";
import { ChatMessage } from "../../types/ChatMessage";
import { updateAppointment } from "../../Services/appointmentService";
import { Appointment } from "../../types/appointment";

const ChatContainer: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const userId: string = localStorage.getItem("userId") || "";
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [meetingData, setMeetingData] = useState<Appointment | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!meetingId) return;
    fetchChatHistory(meetingId)
      .then((history: ChatMessage[]) => setMessages(history))
      .catch((err: unknown) => {
        console.error("Error fetching chat history", err);
        setToastMessage("Error loading chat history");
      });
  }, [meetingId]);

  useEffect(() => {
    if (!meetingId) return;
    fetchMeetingDetails(meetingId)
      .then((data: Appointment) => {
        setMeetingData(data);
        if (data.aiMessages) {
          setAiMessages(data.aiMessages);
        }
        if (data.status && data.status.toLowerCase() === "passed") {
          setReadOnly(true);
        }
      })
      .catch((err: unknown) => {
        console.error("Error fetching meeting details", err);
        setToastMessage("Error loading meeting details");
      });
  }, [meetingId]);

  const lastAISuggestionRef = useRef<string>("");

  useEffect(() => {
    if (!userId || !meetingId) return;
    const newSocket: typeof Socket = createSocket(userId);
    setSocket(newSocket);
    startChat(newSocket, meetingId, userId);
  
    newSocket.on("newMessage", (msg: ChatMessage) => {
      setMessages((prev) => {
        const updatedMessages = [...prev, msg];
        if (msg.from !== userId && lastAISuggestionRef.current !== msg.message) {
          lastAISuggestionRef.current = msg.message;
          const chatContext = updatedMessages.map((m) => m.message).join("\n");
          requestAISuggestion(newSocket, meetingId, chatContext, msg.message);
        }
        return updatedMessages;
      });
    });
  
    newSocket.on("aiSuggestion", (data: { suggestion: string }) => {
      setAiMessages((prev) => [...prev, data.suggestion]);
    });
  
    newSocket.on("consultationEnded", () => {
      setReadOnly(true);
      setToastMessage("Consultation ended: AI summary is available in your profile");
    });
  
    return () => {
      disconnectSocket(newSocket);
    };
  }, [userId, meetingId]);
  
  
  

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!meetingData) {
    return (
      <div className={styles.chatContainer}>
        <header className={styles.chatHeader}>
          <h2>Meeting Chat</h2>
        </header>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading meeting details...</p>
        </div>
      </div>
    );
  }
  
  const otherUserId = meetingData && typeof meetingData.patientId === "string" ? meetingData.patientId : "";

  const handleManualAISuggestion = (): void => {
    if (!socket || !meetingId) return;
    const chatContext = messages.map(m => m.message).join("\n");
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].message : "";
    requestAISuggestion(socket, meetingId, chatContext, lastMessage);
  };

  const handleEndConsultation = async (): Promise<void> => {
    if (!socket || !meetingId) return;
    endConsultation(socket, meetingId, userId);
    try {
      await updateAppointment(meetingId, { status: "passed" });
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <h2>Meeting Chat</h2>
        <div>
          {!readOnly ? (
            <button onClick={handleEndConsultation} className={styles.sendButton}>
              End Consultation
            </button>
          ) : (
            <span className={styles.readOnlyLabel}>Consultation Ended (Read-Only)</span>
          )}
        </div>
      </header>
      <div className={styles.chatContent}>
        <div className={styles.mainChat}>
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
          {!readOnly && socket && meetingId && meetingData && (
            <ChatInput
              socket={socket}
              meetingId={meetingId}
              userId={userId}
              otherUserId={otherUserId}
            />
          )}
        </div>
        {!readOnly && (
          <AISuggestionsContainer
            suggestions={aiMessages}
            onRequestSuggestion={handleManualAISuggestion}
          />
        )}
      </div>
      <ToastNotification message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  );
};

export default ChatContainer;