import { renderHook } from '@testing-library/react-hooks';
import React, { ReactNode } from 'react';
import { CartProvider } from '..';
import useCart from '../useCart';
import * as useCartTotalModule from '../useCartTotal';
import { ICartProduct } from 'models';

import { mockCartProducts } from 'utils/test/mocks';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('[contexts] - cart-context', () => {
  describe('useCart', () => {
    let isOpen: boolean;
    const originalUseContext = React.useContext;

    const setupMockUseContext = (initialIsOpen: boolean = false) => {
      isOpen = initialIsOpen;
      const mockIsOpen = jest.fn().mockImplementation((updatedIsOpen) => {
        isOpen = updatedIsOpen;
        return isOpen;
      });
      const mockUseContext = jest.fn().mockImplementation(() => ({
        isOPen: initialIsOpen,
        setIsOpen: mockIsOpen,
      }));
      React.useContext = mockUseContext;
    };

    const resetMocks = () => {
      React.useContext = originalUseContext;
    };

    describe('openCart', () => {
      afterEach(() => {
        resetMocks();
      });

      test('should open cart', () => {
        setupMockUseContext();
        const { result } = renderHook(() => useCart(), { wrapper });

        expect(isOpen).toBe(false);
        result.current.openCart();
        expect(isOpen).toBe(true);
      });

      test('should close cart', () => {
        setupMockUseContext(true);
        const { result } = renderHook(() => useCart(), { wrapper });

        expect(isOpen).toBe(true);
        result.current.closeCart();
        expect(isOpen).toBe(false);
      });
    });

    describe('clearCart', () => {
      let products: ICartProduct[];

      const setupMockProductsContext = (
        initialProducts: ICartProduct[] = []
      ) => {
        products = initialProducts;
        const mockSetProducts = jest
          .fn()
          .mockImplementation((updatedProducts) => {
            products = [...updatedProducts];
            return products;
          });
        const mockUseContext = jest.fn().mockImplementation(() => ({
          isOpen: false,
          setIsOpen: jest.fn(),
          products: initialProducts,
          setProducts: mockSetProducts,
        }));
        React.useContext = mockUseContext;
      };

      afterEach(() => {
        resetMocks();
      });

      test('should expose clearCart which empties the cart', () => {
        setupMockProductsContext([...mockCartProducts]);

        useCartTotalModule.default = jest.fn().mockImplementation(() => ({
          total: {},
          updateCartTotal: jest.fn(),
        }));

        const { result } = renderHook(() => useCart(), { wrapper });

        expect(products).toHaveLength(mockCartProducts.length);
        result.current.clearCart();
        expect(products).toHaveLength(0);
      });
    });
  });
});
