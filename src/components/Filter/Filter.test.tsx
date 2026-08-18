import { renderWithThemeProvider } from 'utils/test/test-utils';
import { ProductsProvider } from 'contexts/products-context/';

import Filter from '.';
import { availableSizes } from './Filter';

describe('[components] - Filter', () => {
  const setup = () => {
    return renderWithThemeProvider(
      <ProductsProvider>
        <Filter />
      </ProductsProvider>
    );
  };

  test('should render correctly', () => {
    const view = setup();
    expect(view).toMatchSnapshot();
  });

  test('should render every filter size avaliable', () => {
    const { getByText } = setup();
    expect(availableSizes.every((size) => getByText(size))).toBe(true);
  });

  test('should render both sort options', () => {
    const { getByText } = setup();
    expect(getByText('Price: High to Low')).toBeTruthy();
    expect(getByText('Price: Low to High')).toBeTruthy();
  });

  test('should have no sort selected by default', () => {
    const { getByRole } = setup();
    const select = getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('');
  });
});
