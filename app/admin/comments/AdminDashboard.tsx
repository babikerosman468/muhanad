"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: number;
  post_slug: string;
  name: string;
  comment: string;
  created_at: string;
  approved: boolean;
  parent_id: number | null;
};

type Statistics = {
  total: number;
  pending: number;
  approved: number;
};

export default function AdminDashboard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    pending: 0,
    approved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/comments", {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load comments");
      }

      setComments(data.comments);
      setStatistics(data.statistics);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Loading failed"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  async function moderate(id: number, action: "approve" | "reject") {
    if (
      action === "reject" &&
      !window.confirm(
        "Permanently delete this comment? Any replies to it will also be deleted."
      )
    ) {
      return;
    }

    setBusyId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: action === "approve" ? "PATCH" : "DELETE",
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Action failed");
      }

      await loadComments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Moderation failed"
      );
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      window.location.assign("/admin/login");
    }
  }

  const pending = comments.filter((item) => !item.approved);
  const published = comments.filter((item) => item.approved);

  function renderComment(item: Comment) {
    return (
      <article
        key={item.id}
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "18px",
          marginBottom: "14px",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <strong>{item.name}</strong>

          <span style={{ fontSize: "13px", color: "#666" }}>
            {new Date(item.created_at).toLocaleString()}
          </span>
        </div>

        <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {item.comment}
        </p>

        <p style={{ fontSize: "13px", color: "#555" }}>
          Post: {item.post_slug}
          {item.parent_id !== null && (
            <> · Reply to comment #{item.parent_id}</>
          )}
        </p>

        <p
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            color: item.approved ? "green" : "#a05a00",
          }}
        >
          {item.approved ? "Published" : "Pending approval"}
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          {!item.approved && (
            <button
              disabled={busyId === item.id}
              onClick={() => moderate(item.id, "approve")}
            >
              Approve
            </button>
          )}

          <button
            disabled={busyId === item.id}
            onClick={() => moderate(item.id, "reject")}
          >
            {busyId === item.id ? "Processing..." : "Reject"}
          </button>
        </div>
      </article>
    );
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "35px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1>Muhanad — Comment Administration</h1>
          <p>Review and manage visitor comments.</p>
        </div>

        <button onClick={logout}>Sign out</button>
      </header>

      <section
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          margin: "25px 0",
        }}
      >
        <div>Total: {statistics.total}</div>
        <div>Pending: {statistics.pending}</div>
        <div>Published: {statistics.approved}</div>
      </section>

      <button onClick={() => void loadComments()} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh comments"}
      </button>

      {error && (
        <p role="alert" style={{ color: "darkred" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : (
        <>
          <h2>Pending comments ({pending.length})</h2>
          {pending.length ? (
            pending.map(renderComment)
          ) : (
            <p>No pending comments.</p>
          )}

          <h2>Published comments ({published.length})</h2>
          {published.length ? (
            published.map(renderComment)
          ) : (
            <p>No published comments.</p>
          )}
        </>
      )}
    </main>
  );
}
