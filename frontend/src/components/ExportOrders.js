import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FiDownload, FiFileText, FiTruck, FiCheckCircle } from 'react-icons/fi';
import * as XLSX from 'xlsx';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b', // Navbar primary color
  secondary: '#e65c70', // Navbar secondary color
  light: '#ffd1d4', // Navbar light color
  dark: '#d64555', // Navbar dark color
  background: '#fff5f6', // Super light - almost white
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)', // Navbar gradient
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)', // Very soft gradient
};

const ExportOrders = ({ orders }) => {
  const exportToExcel = (ordersToExport, fileName) => {
    // Prepare data for Excel
    const data = ordersToExport.map(order => ({
      'Order ID': order._id,
      'Customer Name': order.customerName,
      'Email': order.email,
      'Phone': order.phone,
      'Address': `${order.address}, ${order.city}, ${order.zipCode}`,
      'Order Date': new Date(order.orderDate).toLocaleString(),
      'Products': order.products.map(p => `${p.name} (x${p.quantity})`).join(', '),
      'Total Amount': `$${order.totalAmount.toFixed(2)}`,
      'Status': order.status,
      'Payment Method': order.paymentMethod
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Export the file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleExportClick = (type) => {
    switch (type) {
      case 'all':
        exportToExcel(orders, 'all_orders');
        break;
      case 'delivery':
        const deliveryOrders = orders.filter(order => order.status === 'out-for-delivery');
        exportToExcel(deliveryOrders, 'delivery_orders');
        break;
      case 'completed':
        const completedOrders = orders.filter(order => order.status === 'completed');
        exportToExcel(completedOrders, 'completed_orders');
        break;
      default:
        break;
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="light"
        className="d-flex align-items-center"
        style={{
          background: logoColors.softGradient,
          border: `1px solid ${logoColors.light}`,
          color: logoColors.dark,
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = logoColors.gradient;
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = logoColors.softGradient;
          e.currentTarget.style.color = logoColors.dark;
          e.currentTarget.style.borderColor = logoColors.light;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <FiDownload className="me-1" /> Export
      </Dropdown.Toggle>
      <Dropdown.Menu style={{
        borderRadius: '8px',
        border: `1px solid ${logoColors.light}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
        padding: '0.5rem',
        minWidth: '200px'
      }}>
        <Dropdown.Item
          onClick={() => handleExportClick('all')}
          style={{
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = logoColors.softGradient;
            e.currentTarget.style.color = logoColors.dark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4A5568';
          }}
        >
          <FiFileText className="me-2" style={{ color: logoColors.primary }} /> All Orders
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => handleExportClick('delivery')}
          style={{
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = logoColors.softGradient;
            e.currentTarget.style.color = logoColors.dark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4A5568';
          }}
        >
          <FiTruck className="me-2" style={{ color: logoColors.primary }} /> Out for Delivery
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => handleExportClick('completed')}
          style={{
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = logoColors.softGradient;
            e.currentTarget.style.color = logoColors.dark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4A5568';
          }}
        >
          <FiCheckCircle className="me-2" style={{ color: logoColors.primary }} /> Completed Orders
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ExportOrders;