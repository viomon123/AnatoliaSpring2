import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuickAddProps {
  onAdd: (quantity: number) => void;
  isLoading?: boolean;
}

export function QuickAdd({ onAdd, isLoading = false }: QuickAddProps) {
  const [regularCount, setRegularCount] = useState(0);

  const handleAddRegular = () => {
    if (regularCount > 0) {
      onAdd(regularCount);
      setRegularCount(0);
    }
  };

  return (
    <div className="bg-white/95 p-4 md:p-6 rounded-xl shadow-lg border border-[#e2e7ff]">
      <h2 className="text-xl md:text-2xl font-extrabold headline-font text-[#131b2e] mb-4">Regular Sales</h2>
      
      <div className="border border-[#e2e7ff] bg-[#f8f7ff] rounded-xl p-4 md:p-6">
        <p className="text-[#464555] mb-4 text-sm md:text-base">Price: ₱15 per bottle</p>
        
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-6">
          <button
            onClick={() => setRegularCount(Math.max(0, regularCount - 1))}
            className="p-3 md:p-4 bg-[#ba1a1a] text-white rounded-lg hover:opacity-90 active:scale-95 transition-transform disabled:bg-gray-300"
            disabled={isLoading}
          >
            <Minus size={24} />
          </button>
          <div className="text-5xl md:text-6xl font-bold text-[#483ede] w-24 md:w-28 text-center">
            {regularCount}
          </div>
          <button
            onClick={() => setRegularCount(regularCount + 1)}
            className="p-3 md:p-4 bg-[#483ede] text-white rounded-lg hover:opacity-90 active:scale-95 transition-transform disabled:bg-gray-300"
            disabled={isLoading}
          >
            <Plus size={24} />
          </button>
        </div>

        <input
          type="number"
          min="0"
          value={regularCount}
          onChange={(e) => setRegularCount(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full border border-[#c7c4d7] rounded-lg px-3 py-3 md:py-4 mb-4 text-lg md:text-base bg-white"
          placeholder="Or type number"
          disabled={isLoading}
        />

        <button
          onClick={handleAddRegular}
          disabled={regularCount === 0 || isLoading}
          className="w-full primary-gradient text-white py-3 md:py-4 rounded-lg font-bold text-lg md:text-base active:scale-95 transition-all disabled:bg-gray-300"
        >
          {isLoading ? 'Adding...' : `Add ${regularCount} Bottles`}
        </button>
      </div>
    </div>
  );
}
