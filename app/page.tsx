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
        /^---[\s\S]*?title:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"[\s\S]*?excerpt:\s*"([^"]+)"[\s\S]*?---/
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
          <a href="#about">About</a>
          <a href="#family">Family</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
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

      <footer>
        <strong>MUHANAD</strong>
        <span>Personal Blog • Life • Family • Future</span>
      </footer>
    </main>
  );
}
