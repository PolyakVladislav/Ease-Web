import api from "./axiosInstance"; 

export interface PaginatedApiResponse<T> {
  success: boolean;
  data?: T[]; 
  next?: { page: number; limit: number }; 
  previous?: { page: number; limit: number }; 
  message?: string; 
}

export const fetchPosts = async <T>(
  page: number,
  limit: number,
): Promise<PaginatedApiResponse<T>> => {
  try {
    const userId = localStorage.getItem("userId");
    const response = await api.get("/posts", {
      params: {
        page,
        limit,
        userId,
      },
    });
    const data = response.data;
    return {
      success: true,
      data: data?.results || [],
      next: data?.next,
      previous: data?.previous,
    };
  } catch (error) {
    if (error) {
      return {
        success: false,
        message: "An error occurred",
      };
    } else {
      return { success: false, message: "An unexpected error occurred" };
    }
  }
};

export const fetchPostById = async (id: string) => {
  try {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Post not found");
  }
};

export const fetchCommentsByPostId = async (postId: string) => {
  try {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Comments not found");
  }
};

export const postComment = async (postId: string, content: string) => {
  try {
    const response = await api.post(
      "/comments",
      {
        postId,
        content,
        author: localStorage.getItem("username"),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting comment:", error);
    throw new Error("Failed to post comment");
  }
};

export const createPost = async (title: string, content: string, image: File | null) => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("author", localStorage.getItem("username") || "");
    if (image) {
      formData.append("image", image);
    }
    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, message: "An error occurred" };
  }
};

export const toggleLike = async (postId: string) => {
  try {
    const response = await api.post(`/posts/${postId}/like`, {});
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, message: "An error occurred while toggling like" };
  }
};