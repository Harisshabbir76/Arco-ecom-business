import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

const RecommendedProducts = ({ currentProductId, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        if (!category) {
          setLoading(false);
          return;
        }

        console.log(`Fetching products for category: ${category}`); // Debug log
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/catalog?category=${encodeURIComponent(typeof category === 'object' ? category.name : category)}`
        );

        console.log('API response:', res.data); // Debug log

        // Handle different response structures
        let productList = [];
        if (Array.isArray(res.data)) {
          productList = res.data;
        } else if (res.data && Array.isArray(res.data.products)) {
          productList = res.data.products;
        } else if (res.data && Array.isArray(res.data.data)) {
          productList = res.data.data;
        }

        // Filter out current product and limit to 4
        const filteredProducts = productList
          .filter(product => product._id !== currentProductId)
          .slice(0, 4);

        console.log('Filtered products:', filteredProducts); // Debug log
        setProducts(filteredProducts);
      } catch (err) {
        console.error('Error fetching recommended products:', err);
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [category, currentProductId]);

  if (!category) {
    return null; // Don't show if no category provided
  }

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" variant="primary" />
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="my-4">
        {error}
      </Alert>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no recommendations
  }

  return (
    <div className="mt-5">
      <h4 className="mb-4">You may also like</h4>
      <Row className="g-4">
        {products.map((product) => {
          // Handle image URL
          const imageUrl = product.image?.[0]?.startsWith('http')
            ? product.image[0]
            : `${process.env.REACT_APP_API_URL}${product.image?.[0] || ''}`;

          return (
            <Col key={product._id} xs={6} md={3}>
              <Card as={Link} to={`/product/${product._id}`} className="h-100 text-decoration-none">
                <Card.Img
                  variant="top"
                  src={imageUrl}
                  alt={product.name}
                  style={{
                    height: '180px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                  }}
                />
                <Card.Body>
                  <Card.Title className="fs-6">{product.name}</Card.Title>
                  <div>
                    <span className="text-danger fw-bold">Rs. {product.discountedPrice || product.price}</span>
                    {product.discountedPrice < product.originalPrice && (
                      <del className="text-muted ms-2">Rs. {product.originalPrice}</del>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default RecommendedProducts;