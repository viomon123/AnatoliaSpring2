import type {} from 'react';
import { Dealer, Sale } from '../types';
import { formatCurrency, formatDateTime } from '../utils/calculations';
import { Trash2 } from 'lucide-react';

interface TransactionLogProps {
  sales: Sale[];
  dealers?: Dealer[];
  onDelete?: (saleId: string) => void;
  isLoading?: boolean;
}

export function TransactionLog({ sales, dealers = [], onDelete, isLoading = false }: TransactionLogProps) {
  const getSaleTypeLabel = (sale: Sale) => {
    if (!sale.dealer_id) {
      return 'Regular';
    }

    if (sale.dealer_name) {
      return sale.dealer_name;
    }

    return dealers.find(d => d.id === sale.dealer_id)?.name || 'Dealer';
  };

  return (
    <div className="bg-white/95 p-6 rounded-xl shadow-lg border border-[#e2e7ff]">
      <h2 className="text-2xl font-extrabold headline-font text-[#131b2e] mb-4">Transaction Log</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f2f3ff] border-b border-[#dae2fd]">
            <tr>
              <th className="px-4 py-2 text-left">Date & Time</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-center">Quantity</th>
              <th className="px-4 py-2 text-right">Price/Unit</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[#767586] py-8">
                  No transactions yet
                </td>
              </tr>
            ) : (
              sales.map(sale => (
                <tr key={sale.id} className="border-b border-[#e2e7ff] hover:bg-[#f8f7ff]">
                  <td className="px-4 py-3">{formatDateTime(sale.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sale.dealer_id 
                        ? 'bg-[#eaddff] text-[#5a00c6]' 
                        : 'bg-[#e2dfff] text-[#3323cc]'
                    }`}>
                      {getSaleTypeLabel(sale)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{sale.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(sale.price_per_bottle)}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#005f89]">
                    {formatCurrency(sale.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {onDelete && (
                      <button
                        onClick={() => onDelete(sale.id)}
                        disabled={isLoading}
                        className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded disabled:text-gray-300"
                        title="Delete transaction"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
