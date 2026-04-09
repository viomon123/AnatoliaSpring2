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
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Dealer Sales</h2>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-green-600 text-white px-4 py-3 md:py-4 rounded-lg font-semibold hover:bg-green-700 active:scale-95 transition-all text-base md:text-lg mb-4"
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
            className="flex-1 border border-gray-300 rounded-lg px-3 py-3 md:py-4 text-base md:text-sm"
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={handleAddDealer}
            disabled={!newDealerName.trim() || isLoading}
            className="bg-green-600 text-white px-4 py-3 md:py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 active:scale-95 transition-all font-semibold text-base md:text-sm"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setNewDealerName('');
            }}
            className="bg-gray-300 text-gray-700 px-4 py-3 md:py-4 rounded-lg hover:bg-gray-400 active:scale-95 transition-all font-semibold text-base md:text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-3">
        {dealers.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm md:text-base">No dealers added yet</p>
        ) : (
          dealers.map(dealer => {
            const dealerSales = getDealerSales(dealer.id);
            const dealerTotal = getDealerTotal(dealer.id);
            const isExpanded = expandedDealer === dealer.id;
            const currentBottles = dealerBottles[dealer.id] || 0;

            return (
              <div key={dealer.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Dealer Header */}
                <button
                  onClick={() => setExpandedDealer(isExpanded ? null : dealer.id)}
                  className="w-full bg-gradient-to-r from-purple-50 to-blue-50 p-4 md:p-5 flex justify-between items-center hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 transition-all"
                >
                  <div className="text-left flex-1">
                    <p className="font-bold text-gray-800 text-base md:text-lg">{dealer.name}</p>
                    <p className="text-sm md:text-base text-gray-600">
                      {dealerSales.length} sale{dealerSales.length !== 1 ? 's' : ''} • ₱{dealerTotal.toFixed(2)}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>

                {/* Dealer Details */}
                {isExpanded && (
                  <div className="bg-white p-4 md:p-5 border-t border-gray-200 space-y-4">
                    {/* Add Bottles Section */}
                    <div className="bg-purple-50 rounded-lg p-4 md:p-5">
                      <h4 className="font-semibold text-gray-800 mb-4 text-base md:text-lg">Add Bottles (₱13 each)</h4>
                      
                      <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                        <button
                          onClick={() => setDealerBottles({ ...dealerBottles, [dealer.id]: Math.max(0, currentBottles - 1) })}
                          className="p-2 md:p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-transform disabled:bg-gray-300"
                          disabled={isLoading}
                        >
                          <Minus size={20} />
                        </button>
                        <div className="text-4xl md:text-5xl font-bold text-purple-600 w-20 md:w-24 text-center">
                          {currentBottles}
                        </div>
                        <button
                          onClick={() => setDealerBottles({ ...dealerBottles, [dealer.id]: currentBottles + 1 })}
                          className="p-2 md:p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-transform disabled:bg-gray-300"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 md:py-4 mb-4 text-base md:text-sm"
                        placeholder="Type quantity"
                        disabled={isLoading}
                      />

                      <button
                        onClick={() => handleAddBottles(dealer.id)}
                        disabled={currentBottles === 0 || isLoading}
                        className="w-full bg-purple-600 text-white py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-purple-700 active:scale-95 transition-all disabled:bg-gray-300"
                      >
                        {isLoading ? 'Adding...' : `Add ${currentBottles} Bottles`}
                      </button>
                    </div>

                    {/* Sales History */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 text-base md:text-lg">Recent Sales</h4>
                      {dealerSales.length === 0 ? (
                        <p className="text-gray-500 text-sm md:text-base py-3">No sales yet</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {dealerSales.slice(0, 10).map(sale => (
                            <div key={sale.id} className="flex justify-between items-center text-sm md:text-base bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-700">
                                {sale.quantity} bottle{sale.quantity !== 1 ? 's' : ''}
                              </span>
                              <span className="font-semibold text-purple-600">₱{sale.total_amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDelete(dealer.id)}
                      disabled={isLoading}
                      className="w-full mt-4 p-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-base md:text-sm active:scale-95 transition-all disabled:text-gray-300 flex items-center justify-center gap-2"
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
