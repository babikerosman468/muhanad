"use client";

import { useCallback, useEffect, useState } from "react";

type Message = {
  id: number;
  name: string;
  message: string;
  created_at: string;
  parent_id: number | null;
  is_announcement: boolean;
};

const words = {
  en: {
    title: "Muhanad Live Group",
    subtitle: "Family, friends and community.",
    live: "LIVE DISCUSSION",
    join: "Join the conversation",
    name: "Your name",
    write: "Write your message...",
    send: "Send message",
    sending: "Sending...",
    discussions: "Community discussions",
    announcements: "Community announcements",
    refresh: "Refresh",
    reply: "Reply",
    replyPlaceholder: "Write a reply...",
    empty: "No approved messages yet.",
    approval: "Messages appear publicly after administrator approval.",
    sent: "Your contribution is awaiting approval.",
    footer: "Family · Friendship · Humanity",
  },
  ar: {
    title: "مجموعة مهند المباشرة",
    subtitle: "مساحة للعائلة والأصدقاء والمجتمع.",
    live: "نقاش مباشر",
    join: "شارك في الحوار",
    name: "اسمك",
    write: "اكتب رسالتك...",
    send: "إرسال الرسالة",
    sending: "جارٍ الإرسال...",
    discussions: "نقاشات المجتمع",
    announcements: "إعلانات المجتمع",
    refresh: "تحديث",
    reply: "رد",
    replyPlaceholder: "اكتب ردك...",
    empty: "لا توجد رسائل منشورة حتى الآن.",
    approval: "تظهر الرسائل بعد موافقة الإدارة.",
    sent: "رسالتك بانتظار موافقة الإدارة.",
    footer: "العائلة · الصداقة · الإنسانية",
  },
};

export default function GroupBoard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const t = words[language];

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/group", {
        cache: "no-store"
      });

      if (!response.ok) throw new Error();

      setMessages(await response.json());
    } catch {
      setStatus("Unable to refresh messages.");
    }
  }, []);

  useEffect(() => {
    loadMessages();
    const timer = setInterval(loadMessages, 8000);
    return () => clearInterval(timer);
  }, [loadMessages]);

  async function submit(
    event: React.FormEvent,
    text: string,
    parentId: number | null
  ) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          message: text,
          parentId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      if (parentId === null) setMessage("");
      else {
        setReplyText("");
        setReplyTo(null);
      }

      setStatus(t.sent);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const announcements = messages.filter(
    (item) => item.is_announcement
  );

  const discussions = messages.filter(
    (item) => !item.is_announcement && item.parent_id === null
  );

  function replies(id: number) {
    return messages.filter((item) => item.parent_id === id);
  }

  return (
    <main className="group-page" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="group-header">
        <div className="group-language">
          <button onClick={() => setLanguage("en")}>English</button>
          <button onClick={() => setLanguage("ar")}>العربية</button>
        </div>

        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        <span className="group-live">● {t.live}</span>
      </header>

      <section className="group-panel">
        <h2>{t.join}</h2>

        <form onSubmit={(e) => submit(e, message, null)}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.name}
            maxLength={80}
            required
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.write}
            maxLength={2000}
            required
          />

          <button disabled={loading}>
            {loading ? t.sending : t.send}
          </button>
        </form>

        <p className="group-note">{t.approval}</p>
        {status && <p role="status">{status}</p>}
      </section>

      {announcements.length > 0 && (
        <section className="group-panel">
          <h2>📢 {t.announcements}</h2>

          {announcements.map((item) => (
            <article className="group-announcement" key={item.id}>
              <strong>{item.name}</strong>
              <p>{item.message}</p>
              <small>{new Date(item.created_at).toLocaleString()}</small>
            </article>
          ))}
        </section>
      )}

      <section className="group-panel">
        <div className="group-heading">
          <h2>{t.discussions}</h2>
          <button className="group-refresh" onClick={loadMessages}>
            {t.refresh}
          </button>
        </div>

        {discussions.length === 0 && <p>{t.empty}</p>}

        {discussions.map((item) => (
          <article className="group-message" key={item.id}>
            <strong>{item.name}</strong>
            <p className="group-text">{item.message}</p>
            <small>{new Date(item.created_at).toLocaleString()}</small>

            <div className="group-replies">
              {replies(item.id).map((reply) => (
                <div className="group-reply" key={reply.id}>
                  <strong>{reply.name}</strong>
                  <p>{reply.message}</p>
                  <small>
                    {new Date(reply.created_at).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>

            <button
              className="group-reply-button"
              onClick={() => setReplyTo(
                replyTo === item.id ? null : item.id
              )}
            >
              {t.reply}
            </button>

            {replyTo === item.id && (
              <form onSubmit={(e) => submit(e, replyText, item.id)}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t.replyPlaceholder}
                  maxLength={2000}
                  required
                />
                <button disabled={loading}>{t.send}</button>
              </form>
            )}
          </article>
        ))}
      </section>

      <footer className="group-footer">
        Muhanad Community · {t.footer}
      </footer>
    </main>
  );
}
