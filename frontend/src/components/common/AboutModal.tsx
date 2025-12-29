import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/components/about-modal.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch the markdown file from public directory
    fetch('/about.md')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load about content');
        }
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="about-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="about-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="about-modal-header">
          <h2 id="about-modal-title">Información</h2>
          <button
            className="about-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="about-modal-body">
          {loading && <p>Cargando...</p>}
          {error && <p className="about-modal-error">Error: {error}</p>}
          {!loading && !error && (
            <ReactMarkdown className="about-modal-markdown">
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}


