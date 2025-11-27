import { useScrollDetection } from '../../hooks/useScrollDetection';
import '../../styles/components/filete-sign.css';

interface FileteSignProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function FileteSign({
  title = 'Bienvenidos a la Usina de la Fábrica de Jingles',
  subtitle,
  className = '',
}: FileteSignProps) {
  const { opacity } = useScrollDetection({
    threshold: 100,
    fadeDistance: 200,
  });

  return (
    <div
      className={`filete-sign ${className}`}
      style={{ opacity }}
    >
      <div className="filete-sign__container">
        {/* Curved Top Crest with Filete Decorations */}
        <div className="filete-sign__crest">
          <svg className="filete-sign__crest-svg" viewBox="0 0 800 120" preserveAspectRatio="none">
            {/* Ornate scrollwork and floral motifs */}
            <defs>
              <linearGradient id="filete-red" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff0000" />
                <stop offset="100%" stopColor="#ff6b35" />
              </linearGradient>
              <linearGradient id="filete-orange" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#ffe66d" />
              </linearGradient>
              <linearGradient id="filete-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffe66d" />
                <stop offset="100%" stopColor="#ffd700" />
              </linearGradient>
              <linearGradient id="filete-green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="filete-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ecdc4" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
            </defs>
            {/* Curved top border */}
            <path
              d="M 0 120 Q 200 80, 400 60 T 800 120"
              fill="url(#filete-red)"
              opacity="0.9"
            />
            {/* Scrollwork patterns */}
            <path
              d="M 50 80 Q 100 40, 150 60 Q 200 80, 150 100 Q 100 120, 50 100 Z"
              fill="url(#filete-orange)"
              opacity="0.8"
            />
            <path
              d="M 200 70 Q 250 30, 300 50 Q 350 70, 300 90 Q 250 110, 200 90 Z"
              fill="url(#filete-yellow)"
              opacity="0.8"
            />
            <path
              d="M 500 70 Q 550 30, 600 50 Q 650 70, 600 90 Q 550 110, 500 90 Z"
              fill="url(#filete-green)"
              opacity="0.8"
            />
            <path
              d="M 650 80 Q 700 40, 750 60 Q 800 80, 750 100 Q 700 120, 650 100 Z"
              fill="url(#filete-blue)"
              opacity="0.8"
            />
            {/* Floral motifs */}
            <circle cx="100" cy="60" r="15" fill="#ff0000" opacity="0.7" />
            <circle cx="100" cy="60" r="8" fill="#ffe66d" opacity="0.9" />
            <circle cx="700" cy="60" r="15" fill="#4ade80" opacity="0.7" />
            <circle cx="700" cy="60" r="8" fill="#ffe66d" opacity="0.9" />
          </svg>
        </div>

        <div className="filete-sign__frame">
          {/* Side border decorations */}
          <div className="filete-sign__border-decoration filete-sign__border-decoration--left" />
          <div className="filete-sign__border-decoration filete-sign__border-decoration--right" />

          <div className="filete-sign__content">
            <h1 className="filete-sign__title">{title}</h1>
            {subtitle && (
              <p className="filete-sign__subtitle">{subtitle}</p>
            )}
          </div>

          {/* Bottom decorative flourish */}
          <div className="filete-sign__bottom-flourish">
            <svg viewBox="0 0 200 40" preserveAspectRatio="xMidYMid meet">
              <path
                d="M 20 20 Q 50 10, 80 15 Q 110 20, 100 25 Q 90 30, 60 28 Q 30 26, 20 20 Z"
                fill="url(#filete-yellow)"
                opacity="0.8"
              />
              <path
                d="M 100 20 Q 130 10, 160 15 Q 190 20, 180 25 Q 170 30, 140 28 Q 110 26, 100 20 Z"
                fill="url(#filete-orange)"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
