cat >> app/globals.css <<'EOF'

.article-site {
  max-width: 900px;
  min-height: 100vh;
  margin: 0 auto;
  background: white;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 22px 28px;
  border-bottom: 1px solid #d9dee5;
}

.article-header a {
  text-decoration: none;
  color: #26384d;
  font-size: 14px;
}

.article {
  padding: 65px 55px;
}

.article h1 {
  margin: 10px 0 20px;
  font-size: clamp(38px, 7vw, 62px);
  line-height: 1.1;
}

.excerpt {
  font-size: 19px;
  line-height: 1.7;
  color: #5b6673;
  padding-bottom: 25px;
  border-bottom: 1px solid #e1e5ea;
}

.content {
  margin-top: 35px;
}

.content p {
  font-size: 17px;
  line-height: 1.9;
  color: #3f4b58;
  margin-bottom: 25px;
}

.article-site footer {
  border-top: 1px solid #d9dee5;
  padding: 22px 28px;
  display: flex;
  justify-content: space-between;
  color: #687383;
  font-size: 12px;
}

@media (max-width: 700px) {
  .article-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .article {
    padding: 40px 25px;
  }

  .article-site footer {
    flex-direction: column;
    gap: 10px;
  }
}
EOF

npm run build
