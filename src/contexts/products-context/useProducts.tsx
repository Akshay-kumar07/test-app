import { useCallback } from 'react';

import { useProductsContext, SortOrder } from './ProductsContextProvider';
import { IProduct } from 'models';
import { getProducts } from 'services/products';

const filterByFilters = (products: IProduct[], filters: string[]) => {
  if (!filters || filters.length === 0) {
    return products;
  }

  return products.filter((p: IProduct) =>
    filters.find((filter: string) =>
      p.availableSizes.find((size: string) => size === filter)
    )
  );
};

const sortByOrder = (products: IProduct[], sort: SortOrder) => {
  if (sort === 'price-asc') {
    return [...products].sort((a, b) => a.price - b.price);
  }

  if (sort === 'price-desc') {
    return [...products].sort((a, b) => b.price - a.price);
  }

  return products;
};

const useProducts = () => {
  const {
    isFetching,
    setIsFetching,
    products,
    setProducts,
    filters,
    setFilters,
    sort,
    setSort,
  } = useProductsContext();

  const fetchProducts = useCallback(() => {
    setIsFetching(true);
    getProducts().then((products: IProduct[]) => {
      setIsFetching(false);
      setProducts(products);
    });
  }, [setIsFetching, setProducts]);

  const filterProducts = (filters: string[]) => {
    setIsFetching(true);

    getProducts().then((products: IProduct[]) => {
      setIsFetching(false);
      const filteredProducts = sortByOrder(
        filterByFilters(products, filters),
        sort
      );

      setFilters(filters);
      setProducts(filteredProducts);
    });
  };

  const sortProducts = (sort: SortOrder) => {
    setIsFetching(true);

    getProducts().then((products: IProduct[]) => {
      setIsFetching(false);
      const sortedProducts = sortByOrder(
        filterByFilters(products, filters),
        sort
      );

      setSort(sort);
      setProducts(sortedProducts);
    });
  };

  return {
    isFetching,
    fetchProducts,
    products,
    filterProducts,
    filters,
    sortProducts,
    sort,
  };
};

export default useProducts;
