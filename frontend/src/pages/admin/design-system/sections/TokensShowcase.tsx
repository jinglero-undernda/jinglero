import TokenDisplay from '../components/TokenDisplay';

export default function TokensShowcase() {
  return (
    <div className="tokens-showcase">
      <h2>Design Tokens</h2>
      <p>Design tokens are the atomic design values used throughout the system.</p>

      <section className="tokens-showcase__section">
        <h3>Colors</h3>
        <div className="tokens-showcase__grid">
          <TokenDisplay
            name="Primary Color"
            value="#1a73e8"
            cssVariable="--primary-color"
            description="Primary actions, links, brand elements"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: '4px',
                }}
              />
            }
          />
          <TokenDisplay
            name="Secondary Color"
            value="#5f6368"
            cssVariable="--secondary-color"
            description="Secondary actions, supporting elements"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--secondary-color)',
                  borderRadius: '4px',
                }}
              />
            }
          />
          <TokenDisplay
            name="Background Color"
            value="#ffffff"
            cssVariable="--background-color"
            description="Main page background"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--background-color)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            }
          />
          <TokenDisplay
            name="Text Color"
            value="#202124"
            cssVariable="--text-color"
            description="Primary text content"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--text-color)',
                  borderRadius: '4px',
                }}
              />
            }
          />
          <TokenDisplay
            name="Error Color"
            value="#d93025"
            cssVariable="--error-color"
            description="Error states, validation errors"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--error-color)',
                  borderRadius: '4px',
                }}
              />
            }
          />
          <TokenDisplay
            name="Success Color"
            value="#1e8e3e"
            cssVariable="--success-color"
            description="Success states, confirmation messages"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--success-color)',
                  borderRadius: '4px',
                }}
              />
            }
          />
          <TokenDisplay
            name="Warning Color"
            value="#f9ab00"
            cssVariable="--warning-color"
            description="Warning states, caution messages"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--warning-color)',
                  borderRadius: '4px',
                }}
              />
            }
          />
        </div>
      </section>

      <section className="tokens-showcase__section">
        <h3>Typography</h3>
        <div className="tokens-showcase__grid">
          <TokenDisplay
            name="Font Family"
            value="system-ui, -apple-system, ..."
            cssVariable="--font-family"
            description="System font stack for optimal performance"
          />
          <TokenDisplay
            name="Base Font Size"
            value="16px"
            cssVariable="--font-size-base"
            description="Base font size for body text"
          />
          <TokenDisplay
            name="Base Line Height"
            value="1.5"
            cssVariable="--line-height-base"
            description="Base line height for readable text"
          />
        </div>
      </section>

      <section className="tokens-showcase__section">
        <h3>Spacing</h3>
        <div className="tokens-showcase__grid">
          <TokenDisplay
            name="Extra Small"
            value="4px"
            cssVariable="--spacing-xs"
            description="Tight spacing, icon padding"
            visualExample={
              <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
              </div>
            }
          />
          <TokenDisplay
            name="Small"
            value="8px"
            cssVariable="--spacing-sm"
            description="Compact spacing, form fields"
            visualExample={
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
              </div>
            }
          />
          <TokenDisplay
            name="Medium"
            value="16px"
            cssVariable="--spacing-md"
            description="Standard spacing, default padding"
            visualExample={
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
              </div>
            }
          />
          <TokenDisplay
            name="Large"
            value="24px"
            cssVariable="--spacing-lg"
            description="Section spacing, larger gaps"
            visualExample={
              <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
              </div>
            }
          />
          <TokenDisplay
            name="Extra Large"
            value="32px"
            cssVariable="--spacing-xl"
            description="Major section spacing"
            visualExample={
              <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary-color)' }} />
              </div>
            }
          />
        </div>
      </section>

      <section className="tokens-showcase__section">
        <h3>Shadows</h3>
        <div className="tokens-showcase__grid">
          <TokenDisplay
            name="Small Shadow"
            value="0 1px 3px rgba(0, 0, 0, 0.1)"
            cssVariable="--shadow-sm"
            description="Subtle elevation, hover states"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: '4px',
                }}
              />
            }
          />
          <TokenDisplay
            name="Medium Shadow"
            value="0 4px 6px rgba(0, 0, 0, 0.1)"
            cssVariable="--shadow-md"
            description="Standard elevation, cards"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'white',
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: '4px',
                }}
              />
            }
          />
          <TokenDisplay
            name="Large Shadow"
            value="0 10px 15px rgba(0, 0, 0, 0.1)"
            cssVariable="--shadow-lg"
            description="High elevation, modals"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'white',
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: '4px',
                }}
              />
            }
          />
        </div>
      </section>

      <section className="tokens-showcase__section">
        <h3>Borders</h3>
        <div className="tokens-showcase__grid">
          <TokenDisplay
            name="Small Border Radius"
            value="4px"
            cssVariable="--border-radius-sm"
            description="Small elements, buttons"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: 'var(--border-radius-sm)',
                }}
              />
            }
          />
          <TokenDisplay
            name="Medium Border Radius"
            value="8px"
            cssVariable="--border-radius-md"
            description="Standard elements, cards"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              />
            }
          />
          <TokenDisplay
            name="Large Border Radius"
            value="16px"
            cssVariable="--border-radius-lg"
            description="Large elements, modals"
            visualExample={
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: 'var(--border-radius-lg)',
                }}
              />
            }
          />
        </div>
      </section>

      <section className="tokens-showcase__section">
        <h3>Transitions</h3>
        <div className="tokens-showcase__grid">
          <TokenDisplay
            name="Fast Transition"
            value="150ms ease"
            cssVariable="--transition-fast"
            description="Quick interactions, hover states"
          />
          <TokenDisplay
            name="Normal Transition"
            value="250ms ease"
            cssVariable="--transition-normal"
            description="Standard interactions"
          />
          <TokenDisplay
            name="Slow Transition"
            value="350ms ease"
            cssVariable="--transition-slow"
            description="Deliberate animations"
          />
        </div>
      </section>

      <section className="tokens-showcase__section">
        <h3>Z-Index Layers</h3>
        <div className="tokens-showcase__grid">
          <TokenDisplay
            name="Dropdown"
            value="1000"
            cssVariable="--z-index-dropdown"
            description="Dropdown menus"
          />
          <TokenDisplay
            name="Modal"
            value="2000"
            cssVariable="--z-index-modal"
            description="Modal dialogs"
          />
          <TokenDisplay
            name="Tooltip"
            value="3000"
            cssVariable="--z-index-tooltip"
            description="Tooltips"
          />
        </div>
      </section>
    </div>
  );
}

