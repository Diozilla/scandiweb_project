import React, { Component } from 'react';
import ProductCard from './ProductCard';
import fetchGraphQL from '../utils/fetchGraphQL';
import { Link } from 'react-router-dom';

class ProductListing extends Component {
    state = {
        products: [],
        loading: true,
        error: null,
    };

    componentDidMount() {
        this.fetchProducts();
    }

    fetchProducts = async () => {
        const query = `
            query {
                products {
                    id
                    name
                    gallery
                    prices {
                        amount
                        symbol
                    }
                    inStock
                }
            }
        `;

        try {
            const data = await fetchGraphQL(query);
            this.setState({ products: data.products, loading: false });
        } catch (error) {
            console.error('Error fetching products:', error);
            this.setState({ error: "Failed to load products. Please try again later.", loading: false });
        }
    };

    render() {
        const { products, loading, error } = this.state;
        const { addToCart } = this.props;

        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading products...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            );
        }

        return (
            <div className="product-listing container mt-4" data-testid="product-listing">
                <div className="row">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="col-sm-6 col-md-4 col-lg-3 mb-4" data-testid={`product-${product.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                <Link to={`/product/${product.id}`} className="text-decoration-none">
                                    <ProductCard product={product} addToCart={addToCart} />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <p className="text-center" data-testid="no-products-message">No products available.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ProductListing;
