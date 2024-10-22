// src/pages/CategoriesPage.js

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import fetchGraphQL from '../utils/fetchGraphQL';

class CategoriesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      loading: true,
      error: null,
    };
  }

  async componentDidMount() {
    const query = `
      query {
        categories {
          id
          name
        }
      }
    `;

    try {
      const data = await fetchGraphQL(query);
      this.setState({ categories: data.categories, loading: false });
    } catch (error) {
      console.error("Error fetching categories:", error); // Log error for debugging
      this.setState({ error: "Failed to load categories. Please try again later.", loading: false });
    }
  }

  render() {
    const { loading, error, categories } = this.state;

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
      <div className="categories-page container">
        <h1 className="text-center">Categories</h1>
        <ul className="list-unstyled categories-list">
          {categories.map((category) => (
            <li key={category.id} className="category-item mb-2">
              <Link 
                to={`/category/${category.id}`} 
                className="btn btn-outline-primary w-100" 
                data-testid="category-link"
                aria-label={`Go to ${category.name} category`}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default CategoriesPage;
