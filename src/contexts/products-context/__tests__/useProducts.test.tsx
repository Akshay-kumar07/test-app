import { renderHook, act } from '@testing-library/react-hooks';
import { ReactNode } from 'react';
import { ProductsProvider } from '..';
import useProducts from '../useProducts';
import * as productsService from 'services/products';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ProductsProvider>{children}</ProductsProvider>
);

describe('[contexts] - products-context', () => {
  describe('useProducts', () => {
    test('should filter products by size', async () => {
      const { result } = renderHook(() => useProducts(), { wrapper });

      await act(async () => {
        result.current.fetchProducts();
      });

      act(() => {
        result.current.filterProducts(['M']);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].availableSizes).toContain('M');
    });

    test('should sort products by price, low to high', async () => {
      const { result } = renderHook(() => useProducts(), { wrapper });

      await act(async () => {
        result.current.fetchProducts();
      });

      act(() => {
        result.current.sortProducts('price-asc');
      });

      const prices = result.current.products.map((p) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    test('should sort products by price, high to low', async () => {
      const { result } = renderHook(() => useProducts(), { wrapper });

      await act(async () => {
        result.current.fetchProducts();
      });

      act(() => {
        result.current.sortProducts('price-desc');
      });

      const prices = result.current.products.map((p) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    test('should keep existing filters applied when sorting', async () => {
      const { result } = renderHook(() => useProducts(), { wrapper });

      await act(async () => {
        result.current.fetchProducts();
      });

      act(() => {
        result.current.filterProducts(['M']);
      });
      act(() => {
        result.current.sortProducts('price-desc');
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].availableSizes).toContain('M');
    });

    test('should keep existing sort applied when filtering', async () => {
      const { result } = renderHook(() => useProducts(), { wrapper });

      await act(async () => {
        result.current.fetchProducts();
      });

      act(() => {
        result.current.sortProducts('price-asc');
      });
      act(() => {
        result.current.filterProducts(['XL']);
      });

      const prices = result.current.products.map((p) => p.price);
      expect(prices.length).toBeGreaterThan(0);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    test('should not refetch products when filtering or sorting', async () => {
      const getProductsSpy = jest.spyOn(productsService, 'getProducts');

      const { result } = renderHook(() => useProducts(), { wrapper });

      await act(async () => {
        result.current.fetchProducts();
      });

      expect(getProductsSpy).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.filterProducts(['M']);
      });
      act(() => {
        result.current.sortProducts('price-asc');
      });

      expect(getProductsSpy).toHaveBeenCalledTimes(1);

      getProductsSpy.mockRestore();
    });
  });
});
