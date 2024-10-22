import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom'; 
import fetchGraphQL from '../utils/fetchGraphQL'; 

class QuickShopModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      loading: true,
      error: null,
      currentAttributes: {},
    };
  }

  async componentDidMount() {
    const { productId } = this.props;
    const query = `query {
      product(id: "${productId}") {
        id
        name
        prices {
          amount
          symbol
        }
        description
        gallery
        attributes {
          id
          name
          items {
            display_value
            value
          }
        }
        inStock
      }
    }`;

    try {
      const data = await fetchGraphQL(query);
      this.setState({ product: data.product, loading: false });

      if (data.product.attributes && Array.isArray(data.product.attributes)) {
        const defaults = data.product.attributes.reduce((acc, attr) => {
          if (attr.items && attr.items.length > 0) {
            acc[attr.id] = attr.items[0].value; 
          }
          return acc;
        }, {});
        this.setState({ currentAttributes: defaults });
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      this.setState({ error: "Failed to load product details. Please try again later.", loading: false });
    }
  }

  handleAttributeChange = (attrId, value, e) => {
    e.preventDefault();
    this.setState(prev => ({
      currentAttributes: {
        ...prev.currentAttributes,
        [attrId]: value,
      },
    }));
  };

  handleAddToCart = (e) => {
    e.preventDefault();
    this.props.addToCart(this.state.product, this.state.currentAttributes);
    this.props.onClose(); // Close the modal after adding to cart
  };

  handleProceedToCheckout = (e) => {
    e.preventDefault();
    this.props.addToCart(this.state.product, this.state.currentAttributes); 
    this.props.onClose(); // Close modal
    this.props.navigate('/order'); // Redirect to order page
  };

  render() {
    const { loading, error, product, currentAttributes } = this.state;

    if (loading) return <div className="spinner-border" role="status"><span className="sr-only">Loading...</span> Loading product details...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!product) return <div className="alert alert-warning">Product not found.</div>;

    return (
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" onClick={this.props.onClose}>
        <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{product.name}</h5>
              <button type="button" className="close" onClick={this.props.onClose} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div id="productCarousel" className="carousel slide" data-ride="carousel">
                <div className="carousel-inner">
                  {product.gallery.map((image, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                      <img 
                        src={image} 
                        alt={product.name} 
                        className="d-block w-100" 
                        style={{ maxHeight: '300px', objectFit: 'contain' }} 
                        onError={(e) => { e.target.src = '/placeholder.png'; }} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {product.attributes && product.attributes.length > 0 ? (
                product.attributes.map((attribute) => (
                  <div key={attribute.id} className="mt-3">
                    <h6>{attribute.name}</h6>
                    <ul className="list-inline">
                      {attribute.items.map((item) => (
                        <li key={item.value} className="list-inline-item">
                          <button
                            className={`btn ${currentAttributes[attribute.id] === item.value ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={(e) => this.handleAttributeChange(attribute.id, item.value, e)}
                          >
                            {item.display_value}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p>No attributes available for this product.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={this.handleAddToCart} data-testid="continue-shopping-button">Continue Shopping</button>
              <button className="btn btn-primary" onClick={this.handleProceedToCheckout} data-testid="proceed-to-checkout-button">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const QuickShopModalWithNavigate = (props) => {
  const navigate = useNavigate();
  return <QuickShopModal {...props} navigate={navigate} />;
};

export default QuickShopModalWithNavigate;
