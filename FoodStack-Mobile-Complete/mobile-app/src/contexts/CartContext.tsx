import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MenuItem } from '../types';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  customizations?: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceDelta: number;
  }[];
  notes?: string;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  tableInfo?: any;
  sessionToken?: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TABLE_INFO'; payload: { tableInfo: any; sessionToken?: string } };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => 
          item.menuItem.id === action.payload.menuItem.id &&
          JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations)
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { 
                ...item, 
                quantity: item.quantity + action.payload.quantity,
                subtotal: (item.quantity + action.payload.quantity) * calculateItemPrice(item.menuItem, item.customizations)
              }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + item.subtotal, 0),
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { 
              ...item, 
              quantity: action.payload.quantity,
              subtotal: action.payload.quantity * calculateItemPrice(item.menuItem, item.customizations)
            }
          : item
      ).filter(item => item.quantity > 0);

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + item.subtotal, 0),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + item.subtotal, 0),
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };

    case 'SET_TABLE_INFO':
      return {
        ...state,
        tableInfo: action.payload.tableInfo,
        sessionToken: action.payload.sessionToken,
      };

    default:
      return state;
  }
}

function calculateItemPrice(menuItem: MenuItem, customizations?: CartItem['customizations']): number {
  let price = Number(menuItem.price);
  
  if (customizations) {
    customizations.forEach(custom => {
      price += Number(custom.priceDelta);
    });
  }
  
  return price;
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setTableInfo: (tableInfo: any, sessionToken?: string) => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: Omit<CartItem, 'id' | 'subtotal'>) => {
    const id = `${item.menuItem.id}-${Date.now()}-${Math.random()}`;
    const subtotal = item.quantity * calculateItemPrice(item.menuItem, item.customizations);
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...item,
        id,
        subtotal,
      },
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setTableInfo = (tableInfo: any, sessionToken?: string) => {
    dispatch({ type: 'SET_TABLE_INFO', payload: { tableInfo, sessionToken } });
  };

  const getTotalItems = () => state.totalItems;
  const getTotalAmount = () => state.totalAmount;

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setTableInfo,
        getTotalItems,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}