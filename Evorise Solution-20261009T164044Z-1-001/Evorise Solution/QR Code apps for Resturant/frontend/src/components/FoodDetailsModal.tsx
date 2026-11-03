import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '../data';

interface FoodDetailsModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, options: any) => void;
}

export function FoodDetailsModal({ item, onClose, onAddToCart }: FoodDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(item.variations.length > 0 ? 0 : -1);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [instructions, setInstructions] = useState("");

  const handleAddonClick = (index: number) => {
    if (selectedAddons.includes(index)) {
      setSelectedAddons(selectedAddons.filter(i => i !== index));
    } else {
      setSelectedAddons([...selectedAddons, index]);
    }
  };

  const calculateTotal = () => {
    let base = item.discountPrice || item.price;
    if (selectedVariation !== -1) {
      base += item.variations[selectedVariation].price;
    }
    const addonsTotal = selectedAddons.reduce((sum, index) => sum + item.addons[index].price, 0);
    return (base + addonsTotal) * quantity;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:w-[500px] sm:rounded-2xl rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up sm:animate-fade-in shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/40 text-white p-2 rounded-full backdrop-blur-md"
        >
          <X size={20} />
        </button>
        
        <div className="w-full h-64 shrink-0">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 pb-24">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            <span className="text-xl font-bold text-primary-600">
              ৳{item.discountPrice || item.price}
            </span>
          </div>
          <p className="text-gray-500 mb-4">{item.description}</p>
          
          {item.variations.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Size</h3>
              <div className="space-y-2">
                {item.variations.map((v, idx) => (
                  <label key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="variation" 
                        className="w-5 h-5 text-primary-600 focus:ring-primary-600"
                        checked={selectedVariation === idx}
                        onChange={() => setSelectedVariation(idx)}
                      />
                      <span className="font-medium text-gray-800">{v.name}</span>
                    </div>
                    {v.price > 0 && <span className="text-gray-500">+৳{v.price}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {item.addons.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Add-ons</h3>
              <div className="space-y-2">
                {item.addons.map((addon, idx) => (
                  <label key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-primary-600 focus:ring-primary-600 rounded"
                        checked={selectedAddons.includes(idx)}
                        onChange={() => handleAddonClick(idx)}
                      />
                      <span className="font-medium text-gray-800">{addon.name}</span>
                    </div>
                    <span className="text-gray-500">+৳{addon.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Special instructions</h3>
            <textarea 
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
              placeholder="E.g. Less spicy, no onions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-full">
              <button 
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-black"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={20} />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button 
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-black"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <button 
              onClick={() => {
                onAddToCart(item, quantity, { selectedVariation, selectedAddons, instructions });
              }}
              className="flex-1 bg-primary-600 text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
            >
              <ShoppingBag size={20} />
              Add - ৳{calculateTotal()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
