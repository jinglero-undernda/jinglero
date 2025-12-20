/* Design System: Filete Sign Component
 * Implements: Single SVG structure with viewBox 0 0 1000 350
 * Reference: docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md
 * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html
 * Task: TASK-001 - Refactor to Single SVG Structure
 */

import { useScrollDetection } from '../../hooks/useScrollDetection';
import '../../styles/components/filete-sign.css';

interface FileteSignProps {
  className?: string;
  // Note: title and subtitle props removed - using fixed three-line text layout
  // This matches the documented design system specification
}

export default function FileteSign({
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
        {/* Single unified SVG structure matching reference implementation */}
        <svg
          className="filete-sign__svg"
          viewBox="0 0 1000 350"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
            {/* TASK-003: Gradient Definitions
             * Design System: Filete Sign Component - Gradients
             * Reference: docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md
             * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:51-65
             */}
            
            {/* Gold Gradient - Used for border frame, main title text, corner scroll spirals */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF5C3" stopOpacity="1" />
              <stop offset="30%" stopColor="#FFD700" stopOpacity="1" />
              <stop offset="100%" stopColor="#DAA520" stopOpacity="1" />
              </linearGradient>

            {/* Flower Gradient - Used for flower petals, decorative balls */}
            <linearGradient id="flowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" stopOpacity="1" />
              <stop offset="100%" stopColor="#c92a2a" stopOpacity="1" />
              </linearGradient>

            {/* Leaf Gradient - Used for acanthus leaves in corner scrolls */}
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#63e6be" stopOpacity="1" />
              <stop offset="100%" stopColor="#0ca678" stopOpacity="1" />
            </linearGradient>

            {/* TASK-009: Text Shadow Filter
             * Design System: Filete Sign Component - Text Shadow Filter
             * Reference: docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md
             * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:68-71
             */}
            <filter id="textShadow">
              <feDropShadow dx="3" dy="3" stdDeviation="0" floodColor="#000" floodOpacity="1" />
              <feDropShadow dx="2" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.5" />
            </filter>

            {/* TASK-004: Corner Scroll Ornament Component
             * Design System: Filete Sign Component - Corner Scroll Ornaments
             * Reference: docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md
             * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:74-88
             */}
            <g id="cornerScroll">
              {/* Main Spiral */}
            <path
                d="M 10 10 C 50 10, 80 40, 90 80 C 95 100, 85 110, 75 100 C 65 90, 70 70, 80 70"
                fill="none"
                stroke="url(#goldGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              
              {/* Stylized Acanthus Leaves */}
            <path
                d="M 10 10 Q 40 20 60 5 S 80 30 50 40"
                fill="url(#leafGrad)"
                stroke="#000"
                strokeWidth="0.5"
            />
            <path
                d="M 10 10 Q 20 50 5 70 S 40 80 50 50"
                fill="url(#leafGrad)"
                stroke="#000"
                strokeWidth="0.5"
              />
              
              {/* Inner Volute Details */}
              <path
                d="M 20 20 C 35 25, 45 45, 35 55"
                fill="none"
                stroke="#FFF"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* The decorative "Ball" often seen in joints */}
              <circle cx="10" cy="10" r="8" fill="url(#flowerGrad)" stroke="#333" strokeWidth="1" />
            </g>

            {/* TASK-005: Central Flower Component
             * Design System: Filete Sign Component - Central Flowers
             * Reference: docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md
             * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:91-98
             */}
            <g id="fileteoFlower">
              <path d="M0 -15 Q 10 -30 20 -15 Q 10 0 0 0" fill="url(#flowerGrad)" /> {/* Petal 1 */}
              <path d="M0 0 Q 30 -10 30 10 Q 10 10 0 0" fill="url(#flowerGrad)" />   {/* Petal 2 */}
              <path d="M0 0 Q 20 25 0 30 Q -20 25 0 0" fill="url(#flowerGrad)" />    {/* Petal 3 */}
              <path d="M0 0 Q -30 10 -30 -10 Q -10 0 0 0" fill="url(#flowerGrad)" /> {/* Petal 4 */}
              <path d="M0 0 Q -20 -15 -10 -30 Q 0 -15 0 0" fill="url(#flowerGrad)" /> {/* Petal 5 */}
              <circle cx="0" cy="0" r="5" fill="#FFD700" />
            </g>
          </defs>

          {/* TASK-002: Background Board and Borders
           * Design System: Filete Sign Component - Background and Borders
           * Reference: docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md
           * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:102, 105-106
           */}
          
          {/* Background Board */}
          <rect
            x="10"
            y="10"
            width="980"
            height="330"
            rx="15"
            fill="#1a1a1a"
            stroke="#4a4a4a"
            strokeWidth="2"
          />

          {/* Outer Border - Gold gradient */}
          <rect
            x="25"
            y="25"
            width="950"
            height="300"
            rx="10"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="3"
          />

          {/* Inner Border - Red accent */}
          <rect
            x="32"
            y="32"
            width="936"
            height="286"
            rx="5"
            fill="none"
            stroke="#e03131"
            strokeWidth="1.5"
          />

          {/* TASK-004: Corner Scroll Ornaments - Placed at all 4 corners
           * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:110-116
           */}
          {/* Top Left */}
          <use href="#cornerScroll" transform="translate(35, 35) scale(1.5)" />
          {/* Top Right (Mirrored X) */}
          <use href="#cornerScroll" transform="translate(965, 35) scale(-1.5, 1.5)" />
          {/* Bottom Left (Mirrored Y) */}
          <use href="#cornerScroll" transform="translate(35, 315) scale(1.5, -1.5)" />
          {/* Bottom Right (Mirrored X & Y) */}
          <use href="#cornerScroll" transform="translate(965, 315) scale(-1.5, -1.5)" />

          {/* TASK-005: Central Flowers - Side Accents
           * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:119-120
           */}
          {/* Left side flower */}
          <use href="#fileteoFlower" transform="translate(130, 175) scale(1.2) rotate(90)" />
          {/* Right side flower */}
          <use href="#fileteoFlower" transform="translate(870, 175) scale(1.2) rotate(-90)" />

          {/* TASK-006: Decorative Swirls - Above and below text area
           * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:123-124
           */}
          {/* Swirl above text */}
          <path
            d="M 200 80 Q 500 120 800 80"
            fill="none"
            stroke="#63e6be"
            strokeWidth="2"
            opacity="0.8"
          />
          {/* Swirl below text */}
              <path
            d="M 200 270 Q 500 230 800 270"
            fill="none"
            stroke="#63e6be"
            strokeWidth="2"
                opacity="0.8"
              />

          {/* TASK-007 & TASK-008: Three-Line Text Layout with Typography
           * Design System: Filete Sign Component - Text Layout and Typography
           * Reference: docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md
           * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html:130-163
           */}
          
          {/* Top Line: "Bienvenido a la" */}
          <text
            x="500"
            y="130"
            fontFamily="'Rye', serif"
            fontSize="45"
            fill="#FFF"
            textAnchor="middle"
            filter="url(#textShadow)"
            letterSpacing="2"
          >
            Bienvenido a la
          </text>

          {/* Main Title: "USINA" */}
          <text
            x="500"
            y="200"
            fontFamily="'Sancreek', serif"
            fontSize="80"
            fill="url(#goldGrad)"
            stroke="#5c4208"
            strokeWidth="1.5"
            textAnchor="middle"
            filter="url(#textShadow)"
            letterSpacing="3"
          >
            COOPERATIVA
          </text>

          {/* Bottom Line: "de la Fábrica de Jingles" */}
          <text
            x="500"
            y="260"
            fontFamily="'Rye', serif"
            fontSize="40"
            fill="#FFF"
            textAnchor="middle"
            filter="url(#textShadow)"
            letterSpacing="1"
          >
            de la Fábrica de Jingles
          </text>
            </svg>
      </div>
    </div>
  );
}
