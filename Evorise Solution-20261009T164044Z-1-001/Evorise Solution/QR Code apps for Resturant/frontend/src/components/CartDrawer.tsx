import { X, Trash2 } from 'lucide-react';
import { MenuItem } from '../data';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  options: any;
  totalPrice: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
}

export function CartDrawer({ isOpen, onClose, cartItems, onRemoveItem }: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.05; // 5% tax
  const serviceCharge = subtotal * 0.02; // 2% service charge
  const total = subtotal + tax + serviceCharge;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold">Your Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Trash2 size={40} className="text-gray-300" />
              </div>
              <p className="font-medium text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-50">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-gray-900">{item.menuItem.name}</h4>
                      <button onClick={() => onRemoveItem(item.id)} className="text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.options.selectedVariation !== -1 && (
                        <div>Size: {item.menuItem.variations[item.options.selectedVariation].name}</div>
                      )}
                      Qty: {item.quantity}
                    </div>
                    <div className="font-bold text-primary-600 mt-2">৳{item.totalPrice}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>৳{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (2%)</span>
                <span>৳{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg text-gray-900">
                <span>Grand Total</span>
                <span>৳{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button className="w-full bg-primary-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-colors">
              Place Order
            </button>
          </div>
        )}
      </div>
    </>
  );
}
