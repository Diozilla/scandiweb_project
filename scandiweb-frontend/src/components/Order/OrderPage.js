import React from "react";

class Order extends React.Component {
  calculateTotalPrice = (cartItems = []) => {
    return cartItems.reduce((total, item) => {
      const price = item.product.prices[0]?.amount || 0;
      return total + price * item.quantity;
    }, 0);
  };

  handleCompleteOrder = () => {
    const { cartItems, placeOrder } = this.props;
    if (cartItems.length > 0) {
      alert("Your order has been placed!");
      placeOrder();
    } else {
      alert("Your cart is empty. Add some items before completing your order.");
    }
  };

  // Update cart item attributes without duplication
  handleAttributeChange = (item, attribute, value) => {
    const newAttributes = {
      ...item.selectedAttributes,
      [attribute]: value,
    };

    const existingItemIndex = this.props.cartItems.findIndex(
      (cartItem) =>
        cartItem.product.id === item.product.id &&
        JSON.stringify(cartItem.selectedAttributes) ===
          JSON.stringify(newAttributes)
    );

    if (existingItemIndex >= 0) {
      alert("Item with selected attributes already exists in the cart.");
      return;
    }

    const originalItemIndex = this.props.cartItems.findIndex(
      (cartItem) =>
        cartItem.product.id === item.product.id &&
        JSON.stringify(cartItem.selectedAttributes) ===
          JSON.stringify(item.selectedAttributes)
    );

    if (originalItemIndex >= 0) {
      const updatedCart = [...this.props.cartItems];
      updatedCart[originalItemIndex].selectedAttributes = newAttributes;
      this.props.updateCartItems(updatedCart);
    }
  };

  render() {
    const { cartItems } = this.props;
    const totalPrice = this.calculateTotalPrice(cartItems);

    return (
      <div className="order-page container my-4">
        <h1>Your Order</h1>
        <div className="order-items">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={`${item.product.id}-${JSON.stringify(item.selectedAttributes)}`}
                className="order-item d-flex align-items-center mb-3 border p-3 rounded shadow-sm"
                data-testid={`cart-item-${item.product.id}`}
              >
                <img
                  src={item.product.gallery[0]}
                  alt={item.product.name}
                  className="order-item-img img-thumbnail me-3"
                  style={{ width: "100px" }}
                />
                <div className="flex-grow-1">
                  <h3>{item.product.name}</h3>
                  {item.selectedAttributes &&
                    Object.entries(item.selectedAttributes).map(([name, value]) => (
                      <div
                        key={name}
                        data-testid={`cart-item-attribute-${name.replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        <strong>{name}:</strong>
                        <select
                          value={value}
                          onChange={(e) =>
                            this.handleAttributeChange(item, name, e.target.value)
                          }
                          data-testid={`cart-item-attribute-${name.replace(/\s+/g, "-").toLowerCase()}-${value.replace(/\s+/g, "-").toLowerCase()}`}
                          className="form-select mt-1"
                        >
                          {item.product.attributes
                            .find((attr) => attr.name === name)
                            ?.items.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.display_value}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  <p>Quantity: {item.quantity}</p>
                  <p>
                    Total: {item.product.prices[0]?.symbol}
                    {(item.product.prices[0]?.amount * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p data-testid="empty-order" className="text-muted">
              Your order is currently empty. Browse our products and add some to your cart!
            </p>
          )}
        </div>

        <h2 className="mt-4" data-testid="total-price">
          Total Price:{" "}
          {cartItems.length > 0
            ? `${cartItems[0].product.prices[0]?.symbol}${totalPrice.toFixed(2)}`
            : "0.00"}
        </h2>

        <button
          className="btn btn-primary mt-4"
          data-testid="complete-order-button"
          onClick={this.handleCompleteOrder}
        >
          Complete Order
        </button>
      </div>
    );
  }
}

export default Order;
