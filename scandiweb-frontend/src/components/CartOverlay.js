import React from "react";
import { Link } from "react-router-dom";

class CartOverlay extends React.Component {
  calculateTotalPrice = () => {
    return this.props.cartItems
      .reduce((total, item) => {
        return total + (item.product.prices[0]?.amount || 0) * item.quantity;
      }, 0)
      .toFixed(2);
  };

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
    const { cartItems, toggleCartOverlay, updateItemQuantity, placeOrder } = this.props;

    return (
      <div className="cart-overlay-wrapper">
        <div
          className="cart-overlay position-fixed top-0 end-0 p-3 bg-white shadow"
          style={{
            width: "400px",
            height: "60vh",
            overflowY: "auto",
            zIndex: 1050,
          }}
        >
          {/* Close Button */}
          <button
            className="btn-close"
            onClick={toggleCartOverlay}
            aria-label="Close"
          ></button>

          {/* Cart Heading */}
          <h3 className="mb-4">Your Cart</h3>

          {/* Empty Cart Message */}
          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              {/* Product List */}
              <ul className="list-group mb-3">
                {cartItems.map((item, index) => {
                  const imageSrc =
                    item.product.gallery && item.product.gallery[0]
                      ? item.product.gallery[0]
                      : "/placeholder.png";
                  return (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                      data-testid={`cart-item-${item.product.name.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {/* Product Image */}
                      <img
                        src={imageSrc}
                        alt={item.product.name}
                        className="img-thumbnail"
                        style={{ width: "60px" }}
                      />
                      <div className="ms-3 flex-grow-1">
                        <h5>{item.product.name}</h5>

                        {/* Price */}
                        <p>
                          <strong>Price:</strong>{" "}
                          {item.product.prices[0]?.symbol}
                          {item.product.prices[0]?.amount}
                        </p>

                        {/* Selected Attributes */}
                        <div className="d-flex mb-2">
                          {Object.entries(item.selectedAttributes).map(([key, value]) => {
                            const attribute = item.product.attributes.find(attr => attr.name === key);
                            return (
                              <div key={key} className="me-2" data-testid={`cart-item-attribute-${key.replace(/\s+/g, '-').toLowerCase()}`}>
                                <span className="d-block">{key}:</span>
                                <select
                                  value={value}
                                  onChange={(e) =>
                                    this.handleAttributeChange(item, key, e.target.value)
                                  }
                                  className="form-select"
                                >
                                  {attribute.items.map((option) => {
                                    const isSelected = option.value === value;
                                    return (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                       
                                        data-testid={isSelected ? `cart-item-attribute-${key.replace(/\s+/g, '-').toLowerCase()}-${option.value.replace(/\s+/g, '-').toLowerCase()}-selected` : ""}
                                      >
                                        {option.display_value}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            );
                          })}
                        </div>

                        {/* Quantity Controller */}
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => updateItemQuantity(item, -1)}
                            disabled={item.quantity <= 1}
                            data-testid="cart-item-amount-decrease"
                          >
                            -
                          </button>
                          <span className="mx-2" data-testid="cart-item-amount">{item.quantity}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => updateItemQuantity(item, 1)}
                            data-testid="cart-item-amount-increase"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Cart Total */}
              <div className="d-flex justify-content-between mb-3" data-testid="cart-total">
                <h5>Total:</h5>
                <h5>
                  {cartItems[0].product.prices[0]?.symbol || ""}
                  {this.calculateTotalPrice()}
                </h5>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-between">
                <Link
                  to="/order"
                  className="btn btn-primary"
                  onClick={placeOrder}
                  disabled={cartItems.length === 0}
                  style={{
                    pointerEvents: cartItems.length === 0 ? "none" : "auto",
                    opacity: cartItems.length === 0 ? 0.6 : 1,
                  }}
                >
                  Place Order
                </Link>
                <button
                  className="btn btn-outline-secondary"
                  onClick={toggleCartOverlay}
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>

        {/* Grey out background when cart is open */}
        {cartItems.length > 0 && (
          <div
            className="cart-overlay-backdrop position-fixed top-0 start-0 w-100 h-100 bg-dark"
            style={{ opacity: 0.5, zIndex: 1040 }}
            onClick={toggleCartOverlay}
          ></div>
        )}
      </div>
    );
  }
}

export default CartOverlay;
