import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import {
  createSocket,
  startChat,
  requestAISuggestion,
  endConsultation,
  disconnectSocket,
} from "../../Services/Chat/socketService";
import {
  fetchChatHistory,
  fetchMeetingDetails,
} from "../../Services/Chat/chatService";
import { fetchUserProfile } from "../../Services/userService";
import { updateAppointment } from "../../Services/appointmentService";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import AISuggestionsContainer from "./AISuggestionsContainer";
import ToastNotification from "./ToastNotification";
import styles from "../../css/MeetingChat.module.css";
import { ChatMessage } from "../../types/ChatMessage";
import { Appointment } from "../../types/appointment";

const ChatContainer: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const userId = localStorage.getItem("userId") || "";
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [meetingData, setMeetingData] = useState<Appointment | null>(null);
  const [acceptedSuggestion, setAcceptedSuggestion] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerAvatar, setPartnerAvatar] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAISuggestionRef = useRef<string>("");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!meetingId) return;
    fetchChatHistory(meetingId)
      .then((history) => setMessages(history))
      .catch(() => setToastMessage("Error loading chat history"));
  }, [meetingId]);

  useEffect(() => {
    if (!meetingId) return;
    fetchMeetingDetails(meetingId)
      .then((data) => {
        setMeetingData(data);
        if (data.aiMessages) setAiMessages(data.aiMessages);
        if (data.status && data.status.toLowerCase() === "passed") setReadOnly(true);
      })
      .catch(() => setToastMessage("Error loading meeting details"));
  }, [meetingId]);

  useEffect(() => {
    if (!userId || !meetingId) return;
    const s = createSocket(userId);
    setSocket(s);
    startChat(s, meetingId, userId);

    s.on("newMessage", (msg: ChatMessage) => {
      setMessages((prev) => {
        const updated = [...prev, msg];
        if (msg.from !== userId && lastAISuggestionRef.current !== msg.message) {
          lastAISuggestionRef.current = msg.message;
          const ctx = updated.map((m) => m.message).join("\n");
          requestAISuggestion(s, meetingId, ctx, msg.message);
        }
        return updated;
      });
    });

    s.on("aiSuggestion", (data: { suggestion: string }) => {
      setAiMessages((prev) => [...prev, data.suggestion]);
    });

    s.on("consultationEnded", () => {
      setReadOnly(true);
      setToastMessage("Consultation ended: AI summary is available in your profile");
    });

    return () => {
      disconnectSocket(s);
    };
  }, [userId, meetingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!meetingData || typeof meetingData.patientId !== "string") return;
    fetchUserProfile(meetingData.patientId).then((res) => {
      if (res.user) {
        setPartnerName(res.user.username || "");
        setPartnerAvatar(res.user.profilePicture || "");
      }
    });
  }, [meetingData]);

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

  const otherUserId =
    typeof meetingData.patientId === "string" ? meetingData.patientId : "";

  const handleManualAISuggestion = () => {
    if (!socket || !meetingId) return;
    const ctx = messages.map((m) => m.message).join("\n");
    const last = messages.length ? messages[messages.length - 1].message : "";
    requestAISuggestion(socket, meetingId, ctx, last);
  };

  const handleEndConsultation = async () => {
    if (!socket || !meetingId) return;
    endConsultation(socket, meetingId, userId);
    try {
      await updateAppointment(meetingId, { status: "passed" });
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const lastAiMessage = aiMessages.length ? aiMessages[aiMessages.length - 1] : "";
  const handleAcceptSuggestion = () => {
    if (lastAiMessage) setAcceptedSuggestion(lastAiMessage);
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
          <div className={styles.chatPartnerInfo}>
            {partnerAvatar ? (
              <img src={partnerAvatar} alt="" className={styles.partnerAvatar} />
            ) : (
              <div className={styles.partnerAvatarPlaceholder} />
            )}
            <span className={styles.partnerName}>{partnerName}</span>
          </div>
          <div className={styles.messagesContainer}>
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </div>
          {!readOnly && socket && meetingId && meetingData && (
            <ChatInput
              socket={socket}
              meetingId={meetingId}
              userId={userId}
              otherUserId={otherUserId}
              acceptedSuggestion={acceptedSuggestion}
            />
          )}
        </div>
        {!readOnly && (
          <AISuggestionsContainer
            suggestion={lastAiMessage}
            onRequestSuggestion={handleManualAISuggestion}
            onAcceptSuggestion={handleAcceptSuggestion}
          />
        )}
      </div>
      <ToastNotification message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  );
};

export default ChatContainer;