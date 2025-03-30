import React, { useEffect, useState,useRef } from "react";
import { fetchMedicalNews } from "../Services/newsService";
import styles from "../css/MedicalNews.module.css"; 

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string; // Image (optional)
  source: { name: string };
}

const MedicalNews: React.FC = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [query, setQuery] = useState<string>(""); // Search term
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getNews = async () => {
      setLoading(true);
      const news = await fetchMedicalNews(query || "health", 1, 10); // Default search "health"
      setArticles(news);
      setLoading(false);
    };

    getNews();
  }, [query]);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Medical News</h1>
      <div className={styles.searchContainer}>
        <input
          type="text"
          ref={searchRef}
          className={styles.searchInput}
          placeholder="Search for news..."
          id="search-articles"
        />
        <button
          onClick={() => setQuery(searchRef.current?.value || "")}
          className={styles.searchButton}
        >
          Search
        </button>
      </div>
      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <ul className={styles.articlesList}>
          {articles.map((article, index) => (
            <li key={index} className={styles.articleItem}>
              <h2 className={styles.articleTitle}>{article.title}</h2>
              {article.urlToImage && (
                <img src={article.urlToImage} alt={article.title} className={styles.articleImage} />
              )}
              <p className={styles.articleDescription}>{article.description}</p>
              <a href={article.url} className={styles.articleLink} target="_blank" rel="noopener noreferrer">
                Read more
              </a>
              <p className={styles.articleSource}>Source: {article.source.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MedicalNews;