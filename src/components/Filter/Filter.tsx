import { ChangeEvent } from 'react';

import { useProducts, SortOrder } from 'contexts/products-context';

import * as S from './style';

export const availableSizes = ['XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL'];

const Filter = () => {
  const { filters, filterProducts, sort, sortProducts } = useProducts();

  const selectedCheckboxes = new Set(filters);

  const toggleCheckbox = (label: string) => {
    if (selectedCheckboxes.has(label)) {
      selectedCheckboxes.delete(label);
    } else {
      selectedCheckboxes.add(label);
    }

    const filters = Array.from(selectedCheckboxes) as [];

    filterProducts(filters);
  };

  const createCheckbox = (label: string) => (
    <S.Checkbox label={label} handleOnChange={toggleCheckbox} key={label} />
  );

  const createCheckboxes = () => availableSizes.map(createCheckbox);

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    sortProducts(event.target.value as SortOrder);
  };

  return (
    <S.Container>
      <S.Title>Sizes:</S.Title>
      {createCheckboxes()}
      <S.Title>Sort by price:</S.Title>
      <S.Select value={sort} onChange={handleSortChange}>
        <option value="">None</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="price-asc">Price: Low to High</option>
      </S.Select>
    </S.Container>
  );
};

export default Filter;
