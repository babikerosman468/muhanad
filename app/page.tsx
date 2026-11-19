import fs from "fs";
import path from "path";

type Post = {
title: string;
date: string;
excerpt: string;
slug: string;
};

function getPosts(): Post[] {
const postsDir = path.join(process.cwd(), "posts");

return fs
.readdirSync(postsDir)
.filter((file) => file.endsWith(".md"))
.map((file) => {
const text = fs.readFileSync(path.join(postsDir, file), "utf8");
const match = text.match(
/^---[\s\S]?title:\s"([^"]+)"[\s\S]?date:\s"([^"]+)"[\s\S]?excerpt:\s"([^"]+)"[\s\S]*?---/
);

  return {
    title: match?.[1] ?? file.replace(".md", ""),
    date: match?.[2] ?? "",
    excerpt: match?.[3] ?? "",
    slug: file.replace(".md", ""),
  };
})
.sort((a, b) => b.date.localeCompare(a.date));

}

export default function Home() {
const posts = getPosts();

return (
<main className="site">
<header className="header">
<div>
<div className="name">MUHANAD</div>
<div className="tagline">Personal • Family • Life • Future</div>
</div>

    <nav>
      <a href="/">Home</a>
      <a href="#blog">Blog</a>
      <a href="#medical-records">Medical Records</a>
      <a href="#about">About</a>
      <a href="#family">Family</a>
      <a href="#gallery">Gallery</a>
      <a href="#contact">Contact</a>
      <a href="#links">Links</a>
      <a href="/group">Group</a>
    </nav>
  </header>

  <section className="hero">
    <div>
      <p className="label">PERSONAL BLOG</p>
      <h1>Muhanad</h1>
      <p>
        A simple personal space for life, family, memories,
        stories and the future.
      </p>
    </div>
  </section>

  <section id="blog" className="section">
    <h2>Latest Stories</h2>

    <div className="posts">
      {posts.map((post) => (
        <article className="post" key={post.slug}>
          <div className="date">{post.date}</div>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <a href={`/blog/${post.slug}`}>Read More →</a>
        </article>
      ))}
    </div>
  </section>

  <section id="medical-records" className="section">
    <h2>Medical Records</h2>

    <p>
      Medical documentation and an AI-assisted summary of Muhanad's
      medical history, for review by healthcare professionals.
    </p>

    <p>
      <a href="/all.pdf" target="_blank" rel="noopener noreferrer">
        📄 Complete Medical Records (PDF) →
      </a>
    </p>

    <p>
      <a href="/aisummary.pdf" target="_blank" rel="noopener noreferrer">
        🧠 AI Medical Summary (PDF) →
      </a>
    </p>

    <p>
      <a
        href="/Muhanad_Arabic.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        🇸🇩 Arabic Medical Report (PDF) →
      </a>
    </p>

    <p>
      <a
        href="/Muhanad_English.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        🇬🇧 English Medical Report (PDF) →
      </a>
    </p>
  </section>

  <section id="about" className="section">
    <h2>About</h2>
    <p>
      This website is a personal space for Muhanad and his story.
      It will grow gradually with new stories, memories and updates.
    </p>
  </section>

  <section id="family" className="section">
    <h2>Family</h2>
    <p>
      A dedicated space for family stories, memories and important
      moments.
    </p>
  </section>

  <section id="gallery" className="section">
    <h2>Gallery</h2>
    <p>
      Photos and memories can be added here later.
    </p>
  </section>

  <section id="contact" className="section">
    <h2>Contact</h2>
    <p>
      Contact information can be added when required.
    </p>
  </section>

  <section id="links" className="section">
    <h2>Important Links</h2>

    <div className="posts">
      <article className="post">
        <h3>Family & Community Group</h3>
        <p>
          Share discussions, messages and family updates.
        </p>
                  <a href="/group">
              Open Group Board →
            </a>
            <br /><br />
            <a href="/admin/group">
              Group Administration →
            </a>

	  </article>

      <article className="post">
        <h3>Drug Discovery Blog</h3>
        <a
          href="https://drug2026.blogspot.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Blog →
        </a>
      </article>

      <article className="post">
        <h3>Drug Discovery Platform</h3>
        <a
          href="https://drug-discovery-wine.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Platform →
        </a>
      </article>

      <article className="post">
        <h3>Administrator Login</h3>
        <a href="/admin/login">
          Administrator Access →
        </a>
      </article>

      <article className="post">
        <h3>Comment Administration</h3>
        <a href="/admin/comments">
          Manage Comments →
        </a>
      </article>
    </div>
  </section>

  <footer>
    <strong>MUHANAD</strong>
    <span>Personal Blog • Life • Family • Future</span>
  </footer>
</main>

);
}
