"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: number;
  name: string;
  comment: string;
  created_at: string;
};

export default function Comments({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  async function loadComments() {
    const response = await fetch(`/api/comments?post=${encodeURIComponent(postSlug)}`);
    if (response.ok) setComments(await response.json());
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
      body: JSON.stringify({ name, comment, postSlug }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Unable to submit comment");
      return;
    }

    setName("");
    setComment("");
    setMessage("Comment submitted for approval.");
  }

  return (
    <section className="comments">
      <h2>Comments</h2>

      {comments.map((item) => (
        <div className="comment" key={item.id}>
          <strong>{item.name}</strong>
          <p>{item.comment}</p>
        </div>
      ))}

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
          placeholder="Write a comment..."
          maxLength={2000}
          rows={5}
          required
        />
        <button type="submit">Submit Comment</button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}
