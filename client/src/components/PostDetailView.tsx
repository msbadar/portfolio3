"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { formatCount } from "@/utils/formatters";
import { shareContent } from "@/utils/share";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import type { Post, Comment } from "@/types";

interface PostDetailViewProps {
  postId: number;
}

export const PostDetailView = ({ postId }: PostDetailViewProps) => {
  const router = useRouter();
  const { showToast } = useApp();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          api.posts.getById(postId),
          api.posts.getComments(postId),
        ]);
        setPost(postData);
        setComments(commentsData);
      } catch {
        showToast("Failed to load post", "error");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, router, showToast]);

  const handleLike = async () => {
    if (!post) return;

    const prevLiked = post.liked;
    const prevLikes = post.likes;

    // Optimistic update
    setPost({
      ...post,
      liked: !post.liked,
      likes: post.liked ? post.likes - 1 : post.likes + 1,
    });

    try {
      await api.posts.like(postId);
    } catch {
      // Revert on error
      setPost({ ...post, liked: prevLiked, likes: prevLikes });
      showToast("Failed to like post", "error");
    }
  };

  const handleShare = async () => {
    if (!post) return;

    const success = await shareContent({
      title: `Post by @${post.user.username}`,
      text: post.content.slice(0, 100) + (post.content.length > 100 ? "..." : ""),
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });

    if (success) {
      showToast("Shared successfully!", "success");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const newComment = await api.posts.createComment({
        parentId: postId,
        content: commentText,
      });
      setComments([newComment, ...comments]);
      setCommentText("");
      showToast("Comment added!", "success");

      // Update comment count
      if (post) {
        setPost({ ...post, comments: post.comments + 1 });
      }
    } catch {
      showToast("Failed to add comment", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--surface)] rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-[var(--surface)] rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-[var(--surface)] rounded w-2/3"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!post) return null;

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] mb-6 transition-colors"
        >
          {Icons.back()}
          <span className="font-medium">Back</span>
        </button>

        {/* Post content */}
        <article className="bg-[var(--surface)] rounded-3xl p-8 shadow-card mb-6">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-6">
            <Image
              src={post.user.avatar}
              alt={post.user.name}
              width={56}
              height={56}
              className="w-14 h-14 rounded-2xl object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--foreground)]">
                  {post.user.username}
                </span>
                {post.user.verified && Icons.verified()}
              </div>
              <span className="text-sm text-[var(--muted)]">{post.time}</span>
            </div>
          </div>

          {/* Post text */}
          <p className="text-base leading-relaxed mb-6 text-[var(--foreground)] whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Post image */}
          {post.image && (
            <div className="mb-6 rounded-2xl overflow-hidden relative">
              <Image
                src={post.image}
                alt="Post image"
                width={800}
                height={600}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 py-4 border-t border-[var(--border)]">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                post.liked
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "hover:bg-[var(--surface-hover)] text-[var(--muted)]"
              }`}
            >
              {Icons.heart(post.liked)}
              <span>{formatCount(post.likes)}</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] font-medium transition-all">
              {Icons.comment()} {formatCount(post.comments)}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] font-medium transition-all ml-auto"
            >
              {Icons.share()} Share
            </button>
          </div>
        </article>

        {/* Comments section */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 shadow-card">
          <h3 className="text-xl font-bold mb-6 text-[var(--foreground)]">
            Comments ({formatCount(comments.length)})
          </h3>

          {/* Add comment form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-[var(--foreground)] placeholder-[var(--muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="px-6 py-2.5 bg-[var(--accent)] text-[var(--background)] rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-[var(--muted)] py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-4 bg-[var(--background)] rounded-2xl"
                >
                  <Image
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[var(--foreground)]">
                        {comment.user.username}
                      </span>
                      {comment.user.verified && Icons.verified()}
                      <span className="text-xs text-[var(--muted)]">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--foreground)]">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
