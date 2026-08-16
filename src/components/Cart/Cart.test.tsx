import { fireEvent, screen } from '@testing-library/react';
import { renderWithThemeProvider } from 'utils/test/test-utils';
import { CartProvider } from 'contexts/cart-context';
import * as useCartModule from 'contexts/cart-context/useCart';

import Cart from '.';
import { mockCartProducts } from 'utils/test/mocks';

describe('[components] - Cart', () => {
  const setup = () => {
    return renderWithThemeProvider(
      <CartProvider>
        <Cart />
      </CartProvider>
    );
  };

  test('should render correctly', () => {
    const view = setup();
    expect(view).toMatchSnapshot();
  });

  describe('clear cart', () => {
    const mockClearCart = jest.fn();

    beforeEach(() => {
      jest.spyOn(useCartModule, 'default').mockReturnValue({
        products: [...mockCartProducts],
        total: {
          productQuantity: mockCartProducts.length,
          installments: 0,
          totalPrice: 0,
          currencyId: 'USD',
          currencyFormat: '$',
        },
        isOpen: true,
        openCart: jest.fn(),
        closeCart: jest.fn(),
        addProduct: jest.fn(),
        removeProduct: jest.fn(),
        increaseProductQuantity: jest.fn(),
        decreaseProductQuantity: jest.fn(),
        clearCart: mockClearCart,
        updateCartTotal: jest.fn(),
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should clear the cart when the user confirms', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      setup();

      fireEvent.click(screen.getByText('Clear Cart'));

      expect(mockClearCart).toHaveBeenCalledTimes(1);
    });

    test('should not clear the cart when the user cancels', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      setup();

      fireEvent.click(screen.getByText('Clear Cart'));

      expect(mockClearCart).not.toHaveBeenCalled();
    });
  });
});
