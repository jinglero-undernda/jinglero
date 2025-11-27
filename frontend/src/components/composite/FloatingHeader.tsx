import { useNavigate } from 'react-router-dom';
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
  isAuthenticated = false,
  onAdvancedSearchClick,
  onLoginClick,
}: FloatingHeaderProps) {
  const navigate = useNavigate();

  const handleAdvancedSearch = () => {
    if (onAdvancedSearchClick) {
      onAdvancedSearchClick();
    } else {
      navigate('/search/advanced');
    }
  };

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <header className="floating-header">
      <nav className="floating-header__nav">
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
            className="floating-header__button floating-header__button--login"
            onClick={handleLogin}
            aria-label={isAuthenticated ? 'Perfil de Usuario' : 'Iniciar Sesión'}
          >
            {isAuthenticated ? 'Perfil' : 'Iniciar Sesión'}
          </button>
        )}
      </nav>
    </header>
  );
}

