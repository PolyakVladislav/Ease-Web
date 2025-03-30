import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchPostById, postComment } from "../Services/postsService";
import { fetchCommentsByPostId } from "../Services/commentsService"; 
import { Post } from "../types/post";
import { Comment } from "../types/comment";
import CommentForm from "./CommentForm";
import styles from "../css/PostDetails.module.css"; 
import CONFIG from "../config"; 

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const getPost = async () => {
      try {
        const postResult = await fetchPostById(postId!);
        setPost(postResult);
      } catch (err) {
        console.error("Error loading post", err);
      }
    };

    getPost();
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!hasMore || loading) return; 
      setLoading(true);
  
      try {
        const result = await fetchCommentsByPostId(postId!, page, 10); 
  
        setComments((prevComments) => {
          const newComments = result.data || [];
          const uniqueComments = newComments.filter(
            (comment) => !prevComments.some((prev) => prev._id === comment._id) 
          );
          return [...prevComments, ...uniqueComments];
        });
  
        setHasMore(Boolean(result.next));
      } catch (err) {
        console.error("Error loading comments", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchComments();
  }, [page, postId]); 

  const lastCommentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prevPage) => prevPage + 1); 
      }
    });

    if (lastCommentRef.current) {
      observer.current.observe(lastCommentRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loading]);

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 
    if (loading || !newComment.trim()) return;
  
    setLoading(true); 
    try {
      const comment = await postComment(postId!, newComment.trim()); 
      setComments((prev) => [comment, ...prev]);
      setNewComment(""); 
    } catch (err) {
      console.error("Error posting comment", err);
    } finally {
      setLoading(false); 
    }
  };

  if (!post) {
    return <p className={styles.loading}>Loading post...</p>;
  }

  return (
    <div className={styles.postDetailsContainer}>
      <div className={styles.postDetails}>
        <div className={styles.postHeader}>
          {/* Аватар автора (опционально) */}
          {/* <img src={`${CONFIG.SERVER_URL}${post.authorAvatar}`} alt="Author Avatar" className={styles.authorAvatar} /> */}
          <div className={styles.postAuthorInfo}>
            <span className={styles.authorName}>{post.author}</span>
            <span className={styles.postDate}>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <h2 className={styles.postTitle}>{post.title}</h2>
        <p className={styles.postContent}>{post.content}</p>
        {post.image && (
          <img
            src={`${CONFIG.SERVER_URL}${post.image}`}
            alt="Post"
            className={styles.postImage}
            loading="lazy"
          />
        )}
      </div>

      <div className={styles.commentsSection}>
        <h3 className={styles.commentsHeader}>Comments</h3>
        <div className={styles.commentsList}>
          {comments.map((comment, index) => (
            <div
              key={comment._id.toString()}
              ref={index === comments.length - 1 ? lastCommentRef : null}
              className={styles.comment}
            >
              <p>
                <strong>{comment.author}</strong>: {comment.content}
              </p>
            </div>
          ))}
          {loading && <p className={styles.loading}>Loading comments...</p>}
          {!hasMore && !loading && (
            <p className={styles.noMoreComments}>No more comments available.</p>
          )}
        </div>
        <CommentForm 
          newComment={newComment} 
          setNewComment={setNewComment} 
          onSubmit={handleCommentSubmit} 
          postId={postId!} 
        />
      </div>
    </div>
  );
}

export default PostDetails;
