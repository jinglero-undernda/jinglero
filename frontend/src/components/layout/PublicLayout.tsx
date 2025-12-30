import { Outlet } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import FloatingHeader from '../composite/FloatingHeader';
import './PublicLayout.css';

/**
 * PublicLayout component that wraps all public routes with the FloatingHeader.
 * This ensures consistent header navigation across all public pages.
 * Dynamically calculates and applies padding-top to match the header height.
 */
export default function PublicLayout() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        // Set CSS variable for use in CSS if needed
        document.documentElement.style.setProperty('--floating-header-height', `${height}px`);
      }
    };

    // Initial measurement
    updateHeaderHeight();

    // Update on resize
    window.addEventListener('resize', updateHeaderHeight);
    
    // Use ResizeObserver for more accurate measurements when header content changes
    let resizeObserver: ResizeObserver | null = null;
    if (headerRef.current) {
      resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (resizeObserver && headerRef.current) {
        resizeObserver.unobserve(headerRef.current);
      }
    };
  }, []);

  return (
    <>
      <FloatingHeader ref={headerRef} />
      <div 
        className="public-layout__content"
        style={{ paddingTop: headerHeight > 0 ? `${headerHeight}px` : '0' }}
      >
        <Outlet />
      </div>
    </>
  );
}

