import { createContext, useContext, FC, useState } from 'react';

import { IProduct } from 'models';

export type SortOrder = 'price-asc' | 'price-desc' | '';

export interface IProductsContext {
  isFetching: boolean;
  setIsFetching(state: boolean): void;
  rawProducts: IProduct[];
  setRawProducts(products: IProduct[]): void;
  filters: string[];
  setFilters(filters: string[]): void;
  sort: SortOrder;
  setSort(sort: SortOrder): void;
}

const ProductsContext = createContext<IProductsContext | undefined>(undefined);
const useProductsContext = (): IProductsContext => {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error(
      'useProductsContext must be used within a ProductsProvider'
    );
  }

  return context;
};

const ProductsProvider: FC = (props) => {
  const [isFetching, setIsFetching] = useState(false);
  const [rawProducts, setRawProducts] = useState<IProduct[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOrder>('');

  const ProductContextValue: IProductsContext = {
    isFetching,
    setIsFetching,
    rawProducts,
    setRawProducts,
    filters,
    setFilters,
    sort,
    setSort,
  };

  return <ProductsContext.Provider value={ProductContextValue} {...props} />;
};

export { ProductsProvider, useProductsContext };
