import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Plus, Minus } from 'lucide-react';
import { Dealer, Sale } from '../types';

interface DealerManagerProps {
  dealers: Dealer[];
  sales: Sale[];
  onAdd: (dealerName: string) => void;
  onAddBottles: (dealerId: string, quantity: number) => void;
  onDelete: (dealerId: string) => void;
  isLoading?: boolean;
}

export function DealerManager({ dealers, sales, onAdd, onAddBottles, onDelete, isLoading = false }: DealerManagerProps) {
  const [newDealerName, setNewDealerName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedDealer, setExpandedDealer] = useState<string | null>(null);
  const [dealerBottles, setDealerBottles] = useState<Record<string, number>>({});

  const handleAddDealer = () => {
    if (newDealerName.trim()) {
      onAdd(newDealerName.trim());
      setNewDealerName('');
      setShowForm(false);
    }
  };

  const handleAddBottles = (dealerId: string) => {
    const quantity = dealerBottles[dealerId] || 0;
    if (quantity > 0) {
      onAddBottles(dealerId, quantity);
      setDealerBottles({ ...dealerBottles, [dealerId]: 0 });
    }
  };

  const getDealerSales = (dealerId: string) => {
    return sales.filter(s => s.dealer_id === dealerId && s.price_per_bottle === 13);
  };

  const getDealerTotal = (dealerId: string) => {
    return getDealerSales(dealerId).reduce((sum, s) => sum + s.total_amount, 0);
  };

  return (
    <div className="bg-white/95 p-4 md:p-6 rounded-xl shadow-lg border border-[#e2e7ff]">
      <h2 className="text-xl md:text-2xl font-extrabold headline-font text-[#131b2e] mb-4">Dealer Sales</h2>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full primary-gradient text-white px-4 py-3 md:py-4 rounded-lg font-semibold active:scale-95 transition-all text-base md:text-lg mb-4"
          disabled={isLoading}
        >
          + Add New Dealer
        </button>
      ) : (
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <input
            type="text"
            value={newDealerName}
            onChange={(e) => setNewDealerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddDealer()}
            placeholder="Dealer name"
            className="flex-1 border border-[#c7c4d7] rounded-lg px-3 py-3 md:py-4 text-base md:text-sm bg-white"
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={handleAddDealer}
            disabled={!newDealerName.trim() || isLoading}
            className="bg-[#483ede] text-white px-4 py-3 md:py-4 rounded-lg hover:opacity-90 disabled:bg-gray-300 active:scale-95 transition-all font-semibold text-base md:text-sm"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setNewDealerName('');
            }}
            className="bg-[#dae2fd] text-[#464555] px-4 py-3 md:py-4 rounded-lg hover:bg-[#c7d1f4] active:scale-95 transition-all font-semibold text-base md:text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-3">
        {dealers.length === 0 ? (
          <p className="text-[#767586] text-center py-6 text-sm md:text-base">No dealers added yet</p>
        ) : (
          dealers.map(dealer => {
            const dealerSales = getDealerSales(dealer.id);
            const dealerTotal = getDealerTotal(dealer.id);
            const isExpanded = expandedDealer === dealer.id;
            const currentBottles = dealerBottles[dealer.id] || 0;

            return (
              <div key={dealer.id} className="border border-[#e2e7ff] rounded-xl overflow-hidden">
                {/* Dealer Header */}
                <button
                  onClick={() => setExpandedDealer(isExpanded ? null : dealer.id)}
                  className="w-full bg-[#f2f3ff] p-4 md:p-5 flex justify-between items-center hover:bg-[#eaedff] transition-all"
                >
                  <div className="text-left flex-1">
                    <p className="font-bold text-[#131b2e] text-base md:text-lg">{dealer.name}</p>
                    <p className="text-sm md:text-base text-[#464555]">
                      {dealerSales.length} sale{dealerSales.length !== 1 ? 's' : ''} • ₱{dealerTotal.toFixed(2)}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>

                {/* Dealer Details */}
                {isExpanded && (
                  <div className="bg-white p-4 md:p-5 border-t border-[#e2e7ff] space-y-4">
                    {/* Add Bottles Section */}
                    <div className="bg-[#f8f7ff] rounded-xl p-4 md:p-5 border border-[#e2e7ff]">
                      <h4 className="font-semibold text-[#131b2e] mb-4 text-base md:text-lg">Add Bottles (₱13 each)</h4>
                      
                      <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                        <button
                          onClick={() => setDealerBottles({ ...dealerBottles, [dealer.id]: Math.max(0, currentBottles - 1) })}
                          className="p-2 md:p-3 bg-[#ba1a1a] text-white rounded-lg hover:opacity-90 active:scale-95 transition-transform disabled:bg-gray-300"
                          disabled={isLoading}
                        >
                          <Minus size={20} />
                        </button>
                        <div className="text-4xl md:text-5xl font-bold text-[#712ae2] w-20 md:w-24 text-center">
                          {currentBottles}
                        </div>
                        <button
                          onClick={() => setDealerBottles({ ...dealerBottles, [dealer.id]: currentBottles + 1 })}
                          className="p-2 md:p-3 bg-[#483ede] text-white rounded-lg hover:opacity-90 active:scale-95 transition-transform disabled:bg-gray-300"
                          disabled={isLoading}
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        value={currentBottles}
                        onChange={(e) => setDealerBottles({ ...dealerBottles, [dealer.id]: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full border border-[#c7c4d7] rounded-lg px-3 py-3 md:py-4 mb-4 text-base md:text-sm bg-white"
                        placeholder="Type quantity"
                        disabled={isLoading}
                      />

                      <button
                        onClick={() => handleAddBottles(dealer.id)}
                        disabled={currentBottles === 0 || isLoading}
                        className="w-full bg-[#712ae2] text-white py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:opacity-90 active:scale-95 transition-all disabled:bg-gray-300"
                      >
                        {isLoading ? 'Adding...' : `Add ${currentBottles} Bottles`}
                      </button>
                    </div>

                    {/* Sales History */}
                    <div>
                      <h4 className="font-semibold text-[#131b2e] mb-3 text-base md:text-lg">Recent Sales</h4>
                      {dealerSales.length === 0 ? (
                        <p className="text-[#767586] text-sm md:text-base py-3">No sales yet</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {dealerSales.slice(0, 10).map(sale => (
                            <div key={sale.id} className="flex justify-between items-center text-sm md:text-base bg-[#f2f3ff] p-3 rounded-lg">
                              <span className="text-[#464555]">
                                {sale.quantity} bottle{sale.quantity !== 1 ? 's' : ''}
                              </span>
                              <span className="font-semibold text-[#712ae2]">₱{sale.total_amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDelete(dealer.id)}
                      disabled={isLoading}
                      className="w-full mt-4 p-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg font-semibold text-base md:text-sm active:scale-95 transition-all disabled:text-gray-300 flex items-center justify-center gap-2"
                    >
                      <X size={20} /> Delete Dealer
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
