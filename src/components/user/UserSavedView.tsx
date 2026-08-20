import React, { useState, useEffect } from 'react';
import { Property } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { PropertyCard } from './PropertyCard.tsx';
import { Heart, Building2, Loader2, ArrowRight } from 'lucide-react';

interface UserSavedViewProps {
  onSelectProperty: (property: Property) => void;
  onExplore: () => void;
}

export const UserSavedView: React.FC<UserSavedViewProps> = ({ onSelectProperty, onExplore }) => {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSaved = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSavedProperties();
      setSavedProperties(res.savedProperties);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleToggleSave = async (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.toggleSaveProperty(propertyId);
      setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-sm">Loading saved homes...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900">Saved Properties ({savedProperties.length})</h2>
        <p className="text-xs text-slate-500">Your shortlisted 0% brokerage rooms and apartments</p>
      </div>

      {savedProperties.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Saved Properties</h3>
          <p className="text-xs text-slate-500">
            Click the heart icon on any property in Wakad, Pune or beyond to save it here for quick review.
          </p>
          <button
            id="saved-explore-btn"
            onClick={onExplore}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onSelect={onSelectProperty}
              onToggleSave={handleToggleSave}
              isSaved={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
