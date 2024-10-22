import React, { Component } from 'react';
import fetchGraphQL from '../utils/fetchGraphQL';
import { useParams } from 'react-router-dom';
import ProductCard from './ProductCard'; // Import the new ProductCard component

class CategoryProductsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      error: null,
    };
  }

  fetchProducts = async (categoryId) => {
    const query = `
      query {
        products(category: ${categoryId}) {
          id
          name
          prices {
            amount
            symbol
          }
          gallery
          inStock
          attributes {
            id
            items {
              id
              value
            }
          }
        }
      }
    `;

    try {
      const data = await fetchGraphQL(query);
      if (data.products.length === 0) {
        throw new Error('No products found');
      }
      this.setState({ products: data.products, loading: false });
    } catch (error) {
      console.error("Error fetching products:", error);
      this.setState({ error: error.message || "Failed to load products. Please try again later.", loading: false });
    }
  };

  componentDidMount() {
    const { categoryId } = this.props;
    this.fetchProducts(categoryId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.categoryId !== this.props.categoryId) {
      this.setState({ loading: true });
      this.fetchProducts(this.props.categoryId);
    }
  }

  render() {
    const { loading, error, products } = this.state;

    if (loading) {
      return (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return <div className="alert alert-danger text-center">Error: {error}</div>;
    }

    return (
      <div className="category-products-page container my-4">
        <h1 className="text-center mb-4">Filtered Products</h1>
        <div className="row">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={this.props.addToCart} />
          ))}
        </div>
      </div>
    );
  }
}

// Wrapper to use useParams and pass categoryId
const CategoryProductsPageWrapper = (props) => {
  const { categoryId } = useParams();
  return <CategoryProductsPage categoryId={categoryId} addToCart={props.addToCart} />;
};

export default CategoryProductsPageWrapper;
