import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import CartOverlay from './components/CartOverlay';
import ProductDetails from './components/Product/ProductDetailsPage';
import ProductListing from './components/Product/ProductListing';
import OrderPage from './components/Order/OrderPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../src/styles.css';
import CategoryProductsPage from './components/Category/CategoryProductsPage';

class App extends React.Component {
  state = {
    cartItems: [],
    isCartOverlayOpen: false,
  };

  toggleCartOverlay = () => {
    this.setState((prevState) => ({
      isCartOverlayOpen: !prevState.isCartOverlayOpen,
    }));
  };

  addToCart = (product, selectedAttributes) => {
    const { cartItems } = this.state;
    const existingItem = cartItems.find(
      item =>
        item.product.id === product.id &&
        JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
    );

    let updatedCartItems;
    if (existingItem) {
      updatedCartItems = cartItems.map(item =>
        item.product.id === product.id && JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCartItems = [...cartItems, { product, selectedAttributes, quantity: 1 }];
    }

    this.setState({ cartItems: updatedCartItems });
  };

  updateCartItems = (updatedCartItems) => {
    this.setState({ cartItems: updatedCartItems });
  };

  updateItemQuantity = (item, change) => {
    const updatedCartItems = this.state.cartItems.map((cartItem) => {
      if (
        cartItem.product.id === item.product.id &&
        JSON.stringify(cartItem.selectedAttributes) === JSON.stringify(item.selectedAttributes)
      ) {
        return {
          ...cartItem,
          quantity: Math.max(1, cartItem.quantity + change),
        };
      }
      return cartItem;
    });
    this.setState({ cartItems: updatedCartItems });
  };

  placeOrder = () => {
    if (this.state.cartItems.length > 0) {
      alert("Your order has been placed!");
      this.setState({ cartItems: [] });
      this.toggleCartOverlay();
    } else {
      alert("Your cart is empty!");
    }
  };

  render() {
    const { cartItems, isCartOverlayOpen } = this.state;

    return (
      <Router>
        <div className="app-container">
          <Header
            itemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            toggleCartOverlay={this.toggleCartOverlay}
          />

          {isCartOverlayOpen && (
            <CartOverlay
              cartItems={cartItems}
              toggleCartOverlay={this.toggleCartOverlay}
              updateItemQuantity={this.updateItemQuantity}
              placeOrder={this.placeOrder}
            />
          )}

          <main>
            <Routes>
              <Route path="/" element={<ProductListing addToCart={this.addToCart} />} />
              <Route path="/products" element={<ProductListing addToCart={this.addToCart} />} />
              <Route path="/category/:categoryId" element={<CategoryProductsPage addToCart={this.addToCart} />} />
              <Route path="/product/:id" element={<ProductDetails addToCart={this.addToCart} />} />
              <Route path="/order" element={<OrderPage cartItems={cartItems} placeOrder={this.placeOrder} updateCartItems={this.updateCartItems} />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
