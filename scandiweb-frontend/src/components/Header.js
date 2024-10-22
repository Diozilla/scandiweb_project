import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {
  render() {
    const { itemCount, toggleCartOverlay, activeCategory } = this.props; // Assuming you have activeCategory prop to manage the current active category

    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <div className="d-flex justify-content-between w-100">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link ${activeCategory === 'all' ? 'active' : ''}`}
                  to="/products"
                  data-testid={activeCategory === 'all' ? 'active-category-link' : 'category-link'}
                >
                  All
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${activeCategory === 'cloths' ? 'active' : ''}`}
                  to="/category/2"
                  data-testid={activeCategory === 'cloths' ? 'active-category-link' : 'category-link'}
                >
                  Cloths
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${activeCategory === 'tech' ? 'active' : ''}`}
                  to="/category/3"
                  data-testid={activeCategory === 'tech' ? 'active-category-link' : 'category-link'}
                >
                  Tech
                </Link>
              </li>
            </ul>
            <Link className="navbar-brand mx-auto" to="/" data-testid='active-category-link'>Logo</Link>
            <button
              className="nav-link btn position-relative"
              onClick={(e) => {
                e.stopPropagation(); // Prevent the click from closing the overlay
                toggleCartOverlay(e);
              }}
              data-testid="cart-btn"
            >
              {/* Cart Icon */}
              <i className="bi bi-cart" style={{ fontSize: '1.5rem' }} data-testid='cart-btn'>cart</i>
              {/* Badge for Item Count */}
              {itemCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">
                  {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                  <span className="visually-hidden">unread messages</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    );
  }
}

export default Header;
