import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRegComment, FaHeart } from "react-icons/fa";
import { Post } from "../types/post";
import { toggleLike } from "../Services/postsService";
import { formatDate } from "../utiles/formatDate";
import styles from "../css/PostCard.module.css";
import CONFIG from "../config";

interface PostCardProps {
  post: Post;
  likedPosts: string[];
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked || false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLiked(post.isLiked || false);
  }, [post.isLiked]);

  const handleLikeClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await toggleLike(post._id);
      if (response.success) {
        setLikesCount(response.data.likesCount);
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error("An error occurred while toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
          {/* <img src={`${CONFIG.SERVER_URL}${post.authorAvatar}`} alt="Author Avatar" className={styles.authorAvatar} /> */}
          <div className={styles.postAuthorInfo}>
          <span className={styles.authorName}>{post.author}</span>
          <span className={styles.postDate}>{formatDate(post.createdAt)}</span>
        </div>
      </div>
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
        <FaHeart
          className={`${styles.likeIcon} ${isLiked ? styles.liked : ""}`}
          onClick={handleLikeClick}
          role="button"
          aria-pressed={isLiked}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleLikeClick();
          }}
        />
        <span className={styles.likesCount}>
          {likesCount} {likesCount === 1 ? "like" : "likes"}
        </span>
        <Link to={`/post/${post._id}`} className={styles.commentsSection}>
          <FaRegComment className={styles.commentIcon} />{" "}
          {post.comments ? post.comments.length : 0}{" "}
          {post.comments && post.comments.length === 1 ? "comment" : "comments"}
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
