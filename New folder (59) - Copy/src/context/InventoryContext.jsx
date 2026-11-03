import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProductEntities, getGodownStock } from '../firebase/godownServices';
import { getShopInventory } from '../firebase/shopServices';
import { useAuth } from './AuthContext';

const InventoryContext = createContext({});

export const InventoryProvider = ({ children }) => {
  const { profile } = useAuth();
  const [entities, setEntities] = useState([]);
  const [shopStock, setShopStock] = useState({});
  const [godownStock, setGodownStock] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [ents, gStock, sStock] = await Promise.all([
        getProductEntities(),
        getGodownStock(),
        getShopInventory(),
      ]);
      setEntities(ents);
      
      const gm = {};
      gStock.forEach(s => { gm[s.entityId] = s.qtyInStock; });
      setGodownStock(gm);
      
      const sm = {};
      sStock.forEach(s => { sm[s.entityId] = { qty: s.qty, sellingPrice: s.sellingPrice }; });
      setShopStock(sm);
    } catch (e) {
      console.error('Error fetching inventory context', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      fetchAll();
    }
  }, [profile]);

  return (
    <InventoryContext.Provider value={{ entities, shopStock, godownStock, loading, refreshInventory: fetchAll }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
