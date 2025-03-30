import React, { useRef, useEffect, useState } from "react";
import styles from "../css/CommentForm.module.css"; 
import { generateSuggestedComment } from "../Services/commentsService"; 

interface CommentFormProps {
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (event: React.FormEvent) => void;
  postId: string; 
}

const CommentForm: React.FC<CommentFormProps> = ({ newComment, setNewComment, onSubmit, postId }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false); 

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleGenerateComment = async () => {
    try {
      setIsGenerating(true);
      const suggestedComment = await generateSuggestedComment(postId);
      setNewComment(suggestedComment);
    } catch (error: unknown) {
      console.error("Error generating suggested comment:", error);
      alert("Failed to generate comment. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.commentForm}>
      <textarea
        ref={textareaRef}
        value={newComment}
        onChange={handleTextareaChange}
        placeholder="Add a comment..."
        required
        className={`${styles.autoResize} ${styles.textarea}`}
      ></textarea>
      <div className={styles.commentFormButtons}>
        <button
          type="button"
          className={styles.generateCommentButton}
          onClick={handleGenerateComment}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Comment"}
        </button>
        <button
          type="submit"
          className={styles.postCommentButton}
          disabled={isGenerating}
        >
          Post Comment
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
