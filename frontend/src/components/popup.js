import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './heroSlider.css'

const Popup = ({ 
  show, 
  onHide, 
  title, 
  children, 
  size, 
  closeButton,
  headerClass,
  bodyClass,
  footerContent
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size={size}
      centered // This enables vertical centering
      backdrop="static"
      dialogClassName="modal-center" // Custom class for horizontal centering
    >
      {title && (
        <Modal.Header closeButton={closeButton} className={headerClass}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      
      <Modal.Body className={bodyClass}>
        {children}
      </Modal.Body>

      {footerContent && (
        <Modal.Footer>
          {footerContent}
        </Modal.Footer>
      )}
    </Modal>
  );
};

Popup.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  closeButton: PropTypes.bool,
  headerClass: PropTypes.string,
  bodyClass: PropTypes.string,
  footerContent: PropTypes.node
};

Popup.defaultProps = {
  size: 'md',
  closeButton: true,
  headerClass: '',
  bodyClass: '',
};

export default Popup;