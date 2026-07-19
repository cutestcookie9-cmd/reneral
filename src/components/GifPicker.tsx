import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

interface Gif {
  id: string;
  url: string;
  preview: string;
  title: string;
}

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingGifs, setTrendingGifs] = useState<Gif[]>([]);

  useEffect(() => {
    // Load trending GIFs on mount
    loadTrendingGifs();
  }, []);

  const loadTrendingGifs = async () => {
    try {
      const response = await fetch('https://tenor.googleapis.com/v2/trending?key=LIVDSRZULELA&limit=20');
      const data = await response.json();
      const gifData = data.results.map((gif: any) => ({
        id: gif.id,
        url: gif.media_formats.gif.url,
        preview: gif.media_formats.nanogif.url,
        title: gif.content_description || 'GIF'
      }));
      setTrendingGifs(gifData);
    } catch (error) {
      console.error('Error loading trending GIFs:', error);
    }
  };

  const searchGifs = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setGifs([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchQuery)}&key=LIVDSRZULELA&limit=20`);
      const data = await response.json();
      const gifData = data.results.map((gif: any) => ({
        id: gif.id,
        url: gif.media_formats.gif.url,
        preview: gif.media_formats.nanogif.url,
        title: gif.content_description || 'GIF'
      }));
      setGifs(gifData);
    } catch (error) {
      console.error('Error searching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchGifs(query);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const displayGifs = query ? gifs : trendingGifs;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-[#2b2d31] border border-[#1e1f22] rounded-lg shadow-xl w-96 max-h-96 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1e1f22]">
        <span className="text-sm font-semibold text-white">GIF Picker</span>
        <button onClick={onClose} className="text-[#b5bac1] hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#1e1f22]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b5bac1]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs"
            className="w-full pl-10 pr-4 py-2 bg-[#1e1f22] border border-[#1e1f22] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865f2] text-white placeholder-[#b5bac1]"
          />
        </div>
      </div>

      {/* GIFs */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
          </div>
        ) : displayGifs.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-[#b5bac1]">
            <p>No GIFs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {displayGifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  onSelect(gif.url);
                  onClose();
                }}
                className="aspect-square rounded-md overflow-hidden hover:ring-2 hover:ring-[#5865f2] transition-all"
              >
                <img
                  src={gif.preview}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
