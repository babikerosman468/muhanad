"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: number;
  name: string;
  comment: string;
  created_at: string;
  parent_id: number | null;
};

export default function Comments({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadComments() {
    const response = await fetch(
      `/api/comments?post=${encodeURIComponent(postSlug)}`
    );

    if (response.ok) {
      setComments(await response.json());
    }
  }

  useEffect(() => {
    loadComments();
  }, [postSlug]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        comment,
        postSlug,
        parentId: replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Unable to submit comment");
      return;
    }

    setName("");
    setComment("");
    setReplyTo(null);
    setMessage("Comment submitted for approval.");
  }

  const topLevel = comments.filter((item) => item.parent_id === null);

  return (
    <section className="comments">
      <h2>Comments</h2>

      {topLevel.map((item) => {
        const replies = comments.filter(
          (reply) => reply.parent_id === item.id
        );

        return (
          <div className="comment" key={item.id}>
            <strong>{item.name}</strong>
            <p>{item.comment}</p>

            <button type="button" onClick={() => setReplyTo(item.id)}>
              Reply
            </button>

            {replies.map((reply) => (
              <div className="comment-reply" key={reply.id}>
                <strong>{reply.name}</strong>
                <p>{reply.comment}</p>
              </div>
            ))}
          </div>
        );
      })}

      {replyTo !== null && (
        <p>
          Replying to a comment{" "}
          <button type="button" onClick={() => setReplyTo(null)}>
            Cancel
          </button>
        </p>
      )}

      <form onSubmit={submitComment}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={80}
          required
        />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            replyTo !== null ? "Write a reply..." : "Write a comment..."
          }
          maxLength={2000}
          rows={5}
          required
        />

        <button type="submit">
          {replyTo !== null ? "Submit Reply" : "Submit Comment"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}
