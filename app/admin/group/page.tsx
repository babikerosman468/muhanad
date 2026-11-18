"use client";

import { useCallback, useEffect, useState } from "react";

type Message = {
  id: number;
  name: string;
  message: string;
  approved: boolean;
  created_at: string;
  parent_id: number | null;
  is_announcement: boolean;
};

export default function AdminGroupPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/group", {
        cache: "no-store"
      });

      if (response.status === 401) {
        setError("Administrator login required.");
        return;
      }

      if (!response.ok) throw new Error();

      setMessages(await response.json());
      setError("");
    } catch {
      setError("Unable to load group messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function moderate(id: number, action: "approve" | "delete") {
    const response = await fetch("/api/admin/group", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action })
    });

    if (!response.ok) {
      setError("Moderation failed.");
      return;
    }

    await load();
  }

  async function publishAnnouncement(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch("/api/admin/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Muhanad Administration",
        message: announcement
      })
    });

    if (!response.ok) {
      setError("Unable to publish announcement.");
      return;
    }

    setAnnouncement("");
    await load();
  }

  return (
    <main className="group-admin">
      <h1>Muhanad Group Administration</h1>
      <p>Review messages, manage replies and publish announcements.</p>

      <section className="group-admin-card">
        <h2>📢 Publish announcement</h2>

        <form onSubmit={publishAnnouncement}>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Write an official announcement..."
            maxLength={2000}
            required
          />
          <button>Publish announcement</button>
        </form>
      </section>

      <button onClick={load}>Refresh messages</button>

      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading...</p>}

      {messages.map((item) => (
        <article className="group-admin-card" key={item.id}>
          <div className="group-admin-row">
            <strong>{item.name}</strong>
            <span>
              {item.is_announcement
                ? "Announcement"
                : item.parent_id
                  ? "Reply"
                  : "Discussion"}
            </span>
            <span>{item.approved ? "Approved" : "Pending"}</span>
          </div>

          <p className="group-text">{item.message}</p>

          <small>{new Date(item.created_at).toLocaleString()}</small>

          <div className="group-admin-actions">
            {!item.approved && (
              <button
                onClick={() => moderate(item.id, "approve")}
                className="group-approve"
              >
                Approve
              </button>
            )}

            <button
              onClick={() => {
                if (window.confirm("Delete this message?")) {
                  moderate(item.id, "delete");
                }
              }}
              className="group-delete"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </main>
  );
}
