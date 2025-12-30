import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar';
import FileteSign from '../components/composite/FileteSign';
import FeaturedFabricaPlaceholder from '../components/composite/FeaturedFabricaPlaceholder';
import VolumetricIndicators from '../components/sections/VolumetricIndicators';
import FeaturedEntitiesSection from '../components/sections/FeaturedEntitiesSection';
import '../styles/pages/home.css';
import '../styles/patterns/combined-layout.css';

export default function Home() {
  const navigate = useNavigate();

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <main className="home-page">
      <FileteSign />
      <div className="home-page__hero">
        <div className="home-page__search-bar">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar jingles, canciones, artistas, temáticas, fábricas..."
          />
        </div>
      </div>

      <FeaturedFabricaPlaceholder />

      <div className="combined-layout">
        <div className="combined-layout__indicators">
          <VolumetricIndicators />
        </div>
        <div className="combined-layout__entities">
          <FeaturedEntitiesSection />
        </div>
      </div>
    </main>
  );
}
