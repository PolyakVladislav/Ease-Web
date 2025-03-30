import React, { useEffect, useState, useRef, useCallback } from "react";
import { createSocket, sendMessage, startChat, disconnectSocket } from "../Services/SocketService";
import { Message } from "../types/message";
import { User } from "../types/user";
import styles from "../css/ChatPage.module.css";
import { Socket } from "socket.io-client";
import CONFIG from "../config";

const Chat: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const currentUserId = localStorage.getItem("userId") || "";
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<typeof Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/users`);
        const data: User[] = await response.json();
        const filtered = data.filter((u) => u._id !== currentUserId);
        setUsers(filtered);

        const dict: Record<string, string> = {};
        data.forEach((u) => {
          dict[u._id] = u.username;
        });
        setUserMap(dict);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();

    const newSocket = createSocket(currentUserId);
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        disconnectSocket(newSocket);
      }
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (message: {
      from: string;
      to: string;
      content: string;
      timestamp: Date;
    }) => {
      if (selectedUser && message.from === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, selectedUser]);

  const fetchChatHistory = async (otherUserId: string) => {
    try {
      const response = await fetch(`${CONFIG.SERVER_URL}/api/chat/${currentUserId}/${otherUserId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const startChatHandler = async (user: User) => {
    if (selectedUser?._id === user._id) return;
    setSelectedUser(user);
    if (socket) {
      startChat(socket, currentUserId, user._id);
    }
    await fetchChatHistory(user._id);
  };

  const sendMessageHandler = () => {
    if (!newMessage.trim() || !currentUserId || !selectedUser || !socket) return;
    sendMessage(socket, currentUserId, selectedUser._id, newMessage);
    setMessages((prev) => [
      ...prev,
      {
        from: currentUserId,
        to: selectedUser._id,
        content: newMessage,
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatSidebar}>
        <h3>Users</h3>
        <ul className={styles.usersList}>
          {users.map((user) => (
            <li key={user._id} onClick={() => startChatHandler(user)} className={styles.userItem}>
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.chatMain}>
        {selectedUser ? (
          <>
            <div className={styles.chatHeader}>
              Chat with {selectedUser.username}
            </div>
            <div className={styles.chatMessages}>
              {messages.map((msg, index) => {
                const isMyMessage = msg.from === currentUserId;
                const fromName = userMap[msg.from] || msg.from;
                return (
                  <div
                    key={index}
                    className={`${styles.chatMessage} ${isMyMessage ? styles.sent : styles.received}`}
                  >
                    <span className={styles.messageSender}>{fromName}:</span>
                    {msg.content}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className={styles.chatInputArea}>
              <input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" ? sendMessageHandler() : null}
                className={styles.messageInput}
              />
              <button onClick={sendMessageHandler} className={styles.sendButton}>Send</button>
            </div>
          </>
        ) : (
          <div className={styles.chatPlaceholder}>
            <h2>Welcome to the Chat</h2>
            <p>Select a user on the right to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
