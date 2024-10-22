import React, { Component } from 'react';
import QuickShopModal from '../Order/QuickShopModal';
import { useNavigate } from 'react-router-dom';

class ProductCard extends Component {
  state = {
    isModalOpen: false,
    selectedAttributes: {},
  };

  handleQuickShopClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { product } = this.props;
    if (product.attributes) {
      const defaults = product.attributes.reduce((acc, attr) => {
        // Check if items are defined and have at least one element
        if (attr.items && attr.items.length > 0) {
          acc[attr.id] = attr.items[0].value; // Only set default if there's an item
        }
        return acc;
      }, {});
      this.setState({ selectedAttributes: defaults });
    }

    this.setState({ isModalOpen: true });
  };

  handleCloseModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleCardClick = (e) => {
    e.stopPropagation(); // Prevent the event from bubbling up
    const { product } = this.props;
    this.props.navigate(`/product/${product.id}`);
  };

  render() {
    const { product, addToCart } = this.props;
    const { isModalOpen, selectedAttributes } = this.state;

    return (
      <div className="col mb-4 position-relative" onClick={this.handleCardClick}>
        <div className="card h-100">
          <img
            src={product.gallery[0]}
            alt={product.name}
            className="card-img-top"
            style={{ objectFit: 'contain', maxHeight: '200px' }}
          />
          <div className="card-body text-center">
            <h5 className="card-title">{product.name}</h5>
            <p className="card-text">{`${product.prices[0].symbol}${product.prices[0].amount.toFixed(2)}`}</p>
            {product.inStock ? (
              <div className="quick-shop-button-container">
                <button className="quick-shop-btn" onClick={this.handleQuickShopClick}>
                  <i className="bi bi-cart" />
                </button>
              </div>
            ) : (
              <p className="text-danger">Out of Stock</p>
            )}
          </div>
        </div>

        {isModalOpen && (
          <QuickShopModal
            productId={product.id}
            selectedAttributes={selectedAttributes}
            addToCart={addToCart}
            onClose={this.handleCloseModal}
          />
        )}
      </div>
    );
  }
}

// Functional wrapper to use useNavigate
const ProductCardWithNavigate = (props) => {
  const navigate = useNavigate();
  return <ProductCard {...props} navigate={navigate} />;
};

export default ProductCardWithNavigate;
