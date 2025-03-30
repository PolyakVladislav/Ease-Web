import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import styles from "../css/UserProfile.module.css";
import CONFIG from "../config";
import { IUserProfileResponse } from "../types/UserProfileResponse";
import { IProfileForm } from "../types/UserProfileForm"; 
import { Post } from "../types/post"; 
import api from "../Services/axiosInstance";

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<IUserProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState(false);
  const [postEditMode, setPostEditMode] = useState<string | null>(null);
  const [formData, setFormData] = useState<IProfileForm>({ username: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPostTitle, setCurrentPostTitle] = useState<string>("");
  const [currentPostContent, setCurrentPostContent] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [posts, setPosts] = useState<Post[]>([]); 
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [selectedPostImage, setSelectedPostImage] = useState<File | null>(null);
  const [postEditError, setPostEditError] = useState<string | null>(null);
  const editRef = useRef<HTMLDivElement>(null);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`${CONFIG.SERVER_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: localStorage.getItem("userId"), page, limit: 5 },
      });

      setUserData(response.data);
      setFormData({
        username: response.data.user.username,
        profilePicture: response.data.user.profilePicture,
      });

      if (response.data.user.profilePicture) {
        localStorage.setItem("profilePicture", response.data.user.profilePicture);
      }

      setPosts((prevPosts) => {
        const newPosts = response.data.posts.filter(
          (post: Post) => !prevPosts.some((p: Post) => p._id === post._id)
        );
        return [...prevPosts, ...newPosts];
      });

      setHasMorePosts(response.data.hasMorePosts);
    } catch {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMorePosts) return;
    setLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
    setLoadingMore(false);
  }, [loadingMore, hasMorePosts]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, page]);

  useEffect(() => {
    function handleWindowScroll() {
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      if (scrollHeight - (scrollTop + clientHeight) < 2 && !loadingMore && hasMorePosts) {
        loadMorePosts();
      }
    }

    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [loadingMore, hasMorePosts, loadMorePosts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: IProfileForm) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    if (postEditMode && editRef.current) {
      editRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [postEditMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveChanges = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setUsernameError(null);
    setError(null);
  
    if (!formData.username.trim()) {
      setUsernameError("Username cannot be empty.");
      return;
    }
  
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("No token found");
      return;
    }
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username.trim());
      if (selectedFile) {
        formDataToSend.append("profilePicture", selectedFile);
      }
  
      const response = await api.put(
        `${CONFIG.SERVER_URL}/api/users/profile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          params: { userId: localStorage.getItem("userId") },
        }
      );
  
      if (response.data?.user?.profilePicture) {
        localStorage.setItem("profilePicture", response.data.user.profilePicture);
      }
  
      setPage(1);
      setPosts([]);
      await fetchUserData();
      setEditable(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
        setUsernameError("Username is already taken.");
      } else {
        setError("Error updating user data");
      }
    }
  };

  const handlePostEdit = (postId: string, currentTitle: string, currentContent: string) => {
    setPostEditMode(postId);
    setCurrentPostTitle(currentTitle);
    setCurrentPostContent(currentContent);
    setSelectedPostImage(null);
  };

  const handleSavePostChanges = async (postId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("No token found");
      return;
    }
  
    if (!currentPostTitle.trim() || !currentPostContent.trim()) {
      setPostEditError("Title and content cannot be empty.");
      return;
    } else {
      setPostEditError(null);
    }
  
    const formData = new FormData();
    formData.append("title", currentPostTitle.trim());
    formData.append("content", currentPostContent.trim());
    if (selectedPostImage) {
      formData.append("PostImage", selectedPostImage);
    }
  
    try {
      const response = await api.put(
        `${CONFIG.SERVER_URL}/posts/${postId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, ...response.data } : post
        )
      );
  
      setPostEditMode(null);
      setCurrentPostTitle("");
      setCurrentPostContent("");
      setSelectedPostImage(null);
    } catch {
      setError("Error saving post changes");
    }
  };
  

  const handleDeletePost = async (postId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("No token found");
      return;
    }

    try {
      await api.delete(`${CONFIG.SERVER_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      setShowDeleteConfirmation(null);
    } catch {
      setError("Error deleting post");
    }
  };

  if (loading) {
    return (
      <div className={styles.userProfileContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.userProfileContainer}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.userProfileContainer}>
      {userData ? (
        <div className={styles.userProfileCard}>
          <div className={styles.userInfo}>
            <img
              src={userData.user.profilePicture}
              className={styles.profilePicture}
              alt="Profile"
            />
            {editable ? (
              <div className={styles.editForm}>
              <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className={`${styles.inputField} ${usernameError ? styles.inputError : ""}`}
                />
                {usernameError && <span className={styles.errorMessage}>{usernameError}</span>}
                <label>Profile Image:</label>
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                  className={styles.inputField}
                />
                <div className={styles.buttonGroup}>
                  <button onClick={handleSaveChanges} className={styles.saveButton}>
                    Save Changes
                  </button>
                  <button onClick={() => setEditable(false)} className={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewDetails}>
                <h1 className={styles.username}>{userData.user.username}</h1>
                <p className={styles.userEmail}>Email: {userData.user.email}</p>
                <button onClick={() => setEditable(true)} className={styles.editButton}>
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className={styles.userPosts}>
            <h2 className={styles.postsHeader}>My Posts</h2>
            {posts && posts.length > 0 ? (
              <ul className={styles.postsList}>
                {posts.map((post) => (
                  <li key={post._id} className={styles.postItem}>
                    {postEditMode === post._id ? (
                      <div className={styles.postEditContainer} ref={editRef}>
                        {postEditError && <p className={styles.postEditError}>{postEditError}</p>}
                        <div>
                          <label>Post Title:</label>
                          <div className={styles.postEditField}>
                            <input
                              type="text"
                              value={currentPostTitle}
                              onChange={(e) => setCurrentPostTitle(e.target.value)}
                              className={styles.postInput}
                            />
                          </div>
                          <label>Post Content:</label>
                          <div className={styles.postEditField}>
                            <textarea
                              value={currentPostContent}
                              onChange={(e) => setCurrentPostContent(e.target.value)}
                              className={styles.postInput}
                              rows={5}
                            />
                          </div>
                          {selectedPostImage ? (
                            <div className={styles.currentPostImageContainer}>
                              <img
                                src={URL.createObjectURL(selectedPostImage)}
                                alt="New Post"
                                className={styles.currentPostImage}
                              />
                            </div>
                          ) : (
                            post.image && (
                              <div className={styles.currentPostImageContainer}>
                                <img
                                  src={`${CONFIG.SERVER_URL}${post.image}`}
                                  alt="Current Post"
                                  className={styles.currentPostImage}
                                />
                              </div>
                            )
                          )}
                          <label>Post Image:</label>
                          <div className={styles.postEditField}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files && setSelectedPostImage(e.target.files[0])}
                              className={styles.postInput}
                            />
                          </div>
                          <div className={styles.buttonGroup}>
                            <button
                              onClick={() => handleSavePostChanges(post._id)}
                              className={styles.saveButton}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setPostEditMode(null)}
                              className={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className={styles.postTitle}>{post.title}</h3>
                        <p className={styles.postContent}>{post.content}</p>
                        {post.image && (
                          <img
                            src={`${CONFIG.SERVER_URL}${post.image}`}
                            alt="Post"
                            className={styles.postImage}
                            loading="lazy"
                          />
                        )}
                        <div className={styles.postActions}>
                          <button
                            className={styles.editButton}
                            onClick={() => handlePostEdit(post._id, post.title, post.content)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => setShowDeleteConfirmation(post._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {showDeleteConfirmation === post._id && (
                      <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                          <p>Are you sure you want to delete this post?</p>
                          <div className={styles.modalButtons}>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className={styles.confirmDeleteButton}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirmation(null)}
                              className={styles.cancelDeleteButton}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noPosts}>You haven't uploaded any posts yet.</p>
            )}

            {loadingMore && (
              <div className={styles.loadingMore}>
                <div className={styles.spinner}></div>
                <p>Loading more posts...</p>
              </div>
            )}
            {!hasMorePosts && (
              <p className={styles.noMorePosts}>No more posts available.</p>
            )}
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default UserProfile;