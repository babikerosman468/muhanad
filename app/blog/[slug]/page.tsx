import fs from "fs";
import path from "path";
import Link from "next/link";

type Post = {
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

function getPost(slug: string): Post | null {
  const file = path.join(process.cwd(), "posts", `${slug}.md`);

  if (!fs.existsSync(file)) {
    return null;
  }

  const text = fs.readFileSync(file, "utf8");

  const match = text.match(
    /^---[\s\S]*?title:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"[\s\S]*?excerpt:\s*"([^"]+)"[\s\S]*?---\s*([\s\S]*)$/
  );

  if (!match) return null;

  return {
    title: match[1],
    date: match[2],
    excerpt: match[3],
    content: match[4].trim(),
  };
}

export function generateStaticParams() {
  const postsDir = path.join(process.cwd(), "posts");

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      slug: file.replace(".md", ""),
    }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return (
      <main className="article-site">
        <h1>Post not found</h1>
        <Link href="/">← Back to Blog</Link>
      </main>
    );
  }

  return (
    <main className="article-site">
      <header className="article-header">
        <div>
          <div className="name">MUHANAD</div>
          <div className="tagline">Personal • Family • Life • Future</div>
        </div>

        <Link href="/">← Back to Blog</Link>
      </header>

      <article className="article">
        <div className="date">{post.date}</div>
        <h1>{post.title}</h1>
        <p className="excerpt">{post.excerpt}</p>

        <div className="content">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <footer>
        <strong>MUHANAD</strong>
        <span>Personal Blog • Life • Family • Future</span>
      </footer>
    </main>
  );
}
