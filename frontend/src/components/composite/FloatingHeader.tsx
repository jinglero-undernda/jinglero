import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AboutModal from '../common/AboutModal';
import '../../styles/components/floating-header.css';

interface FloatingHeaderProps {
  showAdvancedSearch?: boolean;
  showLogin?: boolean;
  isAuthenticated?: boolean;
  onAdvancedSearchClick?: () => void;
  onLoginClick?: () => void;
}

export default function FloatingHeader({
  showAdvancedSearch = true,
  showLogin = true,
  onAdvancedSearchClick,
  isAuthenticated = false, // Reserved for future use
  onLoginClick, // Reserved for future use
}: FloatingHeaderProps) {
  // Suppress unused variable warnings for reserved props
  void isAuthenticated;
  void onLoginClick;
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide header when scrolling down (but not at the very top)
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleAdvancedSearch = () => {
    if (onAdvancedSearchClick) {
      onAdvancedSearchClick();
    } else {
      navigate('/search');
    }
  };

  const handleInfo = () => {
    setIsAboutModalOpen(true);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <>
      <header className={`floating-header ${isVisible ? 'floating-header--visible' : 'floating-header--hidden'}`}>
        <nav className="floating-header__nav">
          {!isLandingPage && (
            <button
              className="floating-header__button floating-header__button--home"
              onClick={handleHome}
              aria-label="Inicio"
            >
              Inicio
            </button>
          )}
          <div className="floating-header__right">
            {showAdvancedSearch && (
              <button
                className="floating-header__button floating-header__button--advanced-search"
                onClick={handleAdvancedSearch}
                aria-label="Búsqueda Avanzada"
              >
                Búsqueda Avanzada
              </button>
            )}
            {showLogin && (
              <button
                className="floating-header__button floating-header__button--info"
                onClick={handleInfo}
                aria-label="Información"
              >
                Info
              </button>
            )}
          </div>
        </nav>
      </header>
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </>
  );
}

