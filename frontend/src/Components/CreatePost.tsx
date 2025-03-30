import React, { useState, useRef, useEffect } from "react";
import { createPost } from "../Services/postsService"; 
import { AiFillPicture } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import FormField from "./FormField"; 
import styles from "../css/CreatePost.module.css"; 
import { useNavigate } from "react-router-dom";

const CreatePost: React.FC = () => {
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newPostContent.trim() || !newPostTitle.trim()) {
      setError("Please fill in both title and content!");
      return;
    }

    try {
      const response = await createPost(newPostTitle, newPostContent, image);
      
      if (response.success) {
        setNewPostContent("");
        setNewPostTitle("");
        setImagePreview(null);
        setImage(null);
        setConfirmationMessage("Post created successfully!");
        setTimeout(() => setConfirmationMessage(""), 3000);
        setError(null);

        setTimeout(() => {
          navigate("/all-posts"); 
        }, 1000);

      } else {
        setError(response.message || "Error creating post");
      }
    } catch {
      setError("An error occurred. Please try again later.");
    }
  };

  const handleTextareaChange = (value: string) => {
    setNewPostContent(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  

  return (
    <div className={styles.container}>
      <div className={styles.createPostContainer}>
        <h2 className={styles.heading}>Create Post</h2>
        {confirmationMessage && (
          <div className={styles.confirmationMessage}>{confirmationMessage}</div>
        )}
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form onSubmit={handleCreatePost} className={styles.createPostForm}>
          <FormField
            label="Post Title"
            value={newPostTitle}
            onChange={setNewPostTitle}
            className={styles.formField}
          />
          <FormField
            label="Write your post..."
            value={newPostContent}
            onChange={handleTextareaChange}
            isTextArea
            textareaRef={textareaRef}
            className={styles.formField}
          />

          <div className={styles.uploadSection}>
            <button
              type="button"
              className={styles.imageUploadButton}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add Photo"
            >
              <AiFillPicture size={20} className={styles.uploadIcon} />
              <span className={styles.uploadText}>Add Photo</span>
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              className={styles.inputFile}
              id="fileInput"
              ref={fileInputRef}
            />
          </div>

          {imagePreview && (
            <div className={styles.imagePreviewContainer}>
              <img src={imagePreview} alt="Selected" className={styles.imagePreview} />
              <button
                type="button"
                className={styles.removeImageButton}
                onClick={handleRemoveImage}
                aria-label="Remove image"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <button type="submit" className={styles.createPostButton}>
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
