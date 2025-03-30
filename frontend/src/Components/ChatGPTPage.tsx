import React, { useState, useEffect, useRef } from "react";
import styles from "../css/ChatGPTPage.module.css";
import CONFIG from "../config"; 

interface ChatMessage {
  sender: "user" | "gpt";
  content: string;
}

const ChatGPTPage: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", content: input }]);
    const userMessage = input;
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${CONFIG.SERVER_URL}/api/chatgpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          store: false, 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        if (errorData.error && errorData.error.message) {
          setError(errorData.error.message);
        } else {
          setError("An error occurred while communicating with ChatGPT.");
        }
        setMessages((prev) => [
          ...prev,
          { sender: "gpt", content: "Sorry, an error occurred." },
        ]);
        return;
      }

      const data = await response.json();
      const gptMessage = data.message;

      setMessages((prev) => [...prev, { sender: "gpt", content: gptMessage }]);
    } catch (error: unknown) {
      console.error("Error communicating with ChatGPT:", error);
      setError("Sorry, an error occurred while communicating with ChatGPT.");
      setMessages((prev) => [
        ...prev,
        { sender: "gpt", content: "Sorry, an error occurred." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className={styles.chatgptContainer}>
      <h2 className={styles.header}>Chat with ChatGPT</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.sender === "user" ? styles.userMessage : styles.gptMessage
            }`}
          >
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.gptMessage}`}>
            <div className={styles.messageContent}>ChatGPT is responding...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.inputField}
        />
        <button onClick={handleSend} disabled={loading} className={styles.sendButton}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatGPTPage;
