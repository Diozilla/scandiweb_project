import React from 'react';
import fetchGraphQL from '../utils/fetchGraphQL';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ProductDetailsWrapper = (props) => {
  const { id } = useParams();
  return <ProductDetails {...props} productId={id} />;
};

class ProductDetails extends React.Component {
  state = {
    product: null,
    loading: true,
    error: null,
    selectedAttributes: {},
  };

  componentDidMount() {
    const { productId } = this.props;
    this.fetchProductDetails(productId);
  }

  fetchProductDetails = async (productId) => {
    const query = `
      query {
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
            type
            items {
              display_value
              value
            }
          }
          inStock
        }
      }
    `;

    try {
      const data = await fetchGraphQL(query);
      this.setState({
        product: data.product,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      this.setState({ error: "Failed to load product details. Please try again later.", loading: false });
    }
  };

  handleAttributeSelect = (attrId, value) => {
    this.setState(prevState => ({
      selectedAttributes: {
        ...prevState.selectedAttributes,
        [attrId]: value,
      }
    }));
  };

  renderAttribute = (attr) => {
    const { selectedAttributes } = this.state;
    const { product } = this.state;

    return (
      <div className="d-flex flex-wrap" data-testid={`product-attribute-${attr.name.toLowerCase()}`}>
        {attr.items.map(value => (
          attr.type === 'color' ? (
            <div
              key={value.value}
              onClick={() => this.handleAttributeSelect(attr.id, value.value)}
              className={`color-swatch me-2 mb-2 ${selectedAttributes[attr.id] === value.value ? 'selected' : ''}`}
              style={{
                backgroundColor: value.value,
                width: '40px',
                height: '40px',
                border: selectedAttributes[attr.id] === value.value ? '2px solid #000' : '1px solid #ddd',
                cursor: 'pointer',
              }}
              title={value.display_value}
            />
          ) : (
            <button
              key={value.value}
              className={`btn btn-sm me-2 mb-2 ${selectedAttributes[attr.id] === value.value ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => this.handleAttributeSelect(attr.id, value.value)}
              disabled={!product.inStock}
            >
              {value.display_value}
            </button>
          )
        ))}
      </div>
    );
  };

  render() {
    const { product, loading, error, selectedAttributes } = this.state;
    const { addToCart } = this.props;

    if (loading) return <div className="spinner-border" role="status"><span className="sr-only">Loading...</span> Loading product details...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!product) return <div className="alert alert-warning">Product not found.</div>;

    // Limit the gallery to the first 7 images
    const limitedGallery = product.gallery.slice(1, 7);

    return (
      <div className="product-details container py-5">
        <div className="row">
          {/* Carousel for the product images */}
          <div className="col-md-6 mb-4">
            <div id="productCarousel" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-inner">
                {limitedGallery.map((image, index) => (
                  <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
                    <img data-testid='product-gallery'
                      src={image}
                      alt={`Product Img ${index + 1}`}
                      className="d-block w-100"
                      style={{ objectFit: 'contain', maxHeight: '450px' }}
                      onError={(e) => { e.target.src = '/placeholder.png'; }} // Fallback image
                    />
                  </div>
                ))}
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

          {/* Attributes and Add to Cart */}
          <div className="col-md-6 d-flex flex-column align-items-start">
            <h1 className="mb-3">{product.name}</h1>
            <h2 className="mb-4">{product.prices[0].symbol}{product.prices[0].amount.toFixed(2)}</h2>

            <div className="attributes mb-4">
              {product.attributes.map(attr => (
                <div key={attr.id} className="mb-3">
                  <h5 className="attribute-name">{attr.name}</h5>
                  {this.renderAttribute(attr)}
                </div>
              ))}
            </div>

            <button 
              data-testid='add-to-cart'
              className="btn btn-success btn-lg"
              onClick={() => addToCart(product, selectedAttributes)}
              disabled={Object.keys(selectedAttributes).length < product.attributes.length || !product.inStock} // Disable if not all attributes selected
            >
              Add to Cart
            </button>

            <p className="mb-4" data-testid='product-description'>
              {product.description}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductDetailsWrapper;
