import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import '../css/Fees.css';
import parentService from '../../../services/parentService';

function Fees() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [fees, setFees] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadFees();
      loadPaymentHistory();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    const data = await parentService.getMyChildren();
    if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0]);
    }
    setLoading(false);
  };

  const loadFees = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildFees(selectedChild.id);
    if (data) {
      setFees(data);
    }
  };

  const loadPaymentHistory = async () => {
    if (!selectedChild) return;
    const data = await parentService.getPaymentHistory(selectedChild.id);
    if (data) {
      setPayments(data);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="fees-container">
      <div className="fees-header">
        <h1>Fee & Payment Management</h1>
        <p>Manage your child's school fees and payment history</p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="child-selector-bar">
          <label>Select Child:</label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => c.id === parseInt(e.target.value));
              setSelectedChild(child);
            }}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {children.length === 0 && (
        <div className="no-data-container">
          <p>No children found. Please link your children to your account.</p>
        </div>
      )}

      {/* Fee Summary Cards */}
      {fees && (
        <div className="fees-summary">
          <div className="fee-card total">
            <DollarSign size={24} />
            <div>
              <h3>Total Fees</h3>
              <p>${fees.totalAmount || 0}</p>
            </div>
          </div>

          <div className="fee-card paid">
            <CheckCircle size={24} />
            <div>
              <h3>Amount Paid</h3>
              <p>${fees.paidAmount || 0}</p>
            </div>
          </div>

          <div className={`fee-card ${fees.outstandingAmount > 0 ? 'pending' : ''}`}>
            <AlertCircle size={24} />
            <div>
              <h3>Outstanding Balance</h3>
              <p>${fees.outstandingAmount || 0}</p>
            </div>
          </div>

          <div className="fee-card">
            <CreditCard size={24} />
            <div>
              <h3>Payment Status</h3>
              <p>{fees.outstandingAmount > 0 ? 'Pending' : 'Paid'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fee Breakdown */}
      {fees && fees.feeComponents && (
        <div className="fee-breakdown">
          <h2>Fee Breakdown</h2>
          <div className="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Fee Component</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.feeComponents.map((component, idx) => (
                  <tr key={idx}>
                    <td>{component.name}</td>
                    <td>${component.amount}</td>
                    <td>
                      <span className={`status-badge ${component.paid ? 'paid' : 'pending'}`}>
                        {component.paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="payment-history">
        <h2>Payment History</h2>
        {payments.length > 0 ? (
          <div className="payments-list">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-item">
                <div className="payment-info">
                  <h3>{payment.paymentMethod}</h3>
                  <p>Transaction ID: {payment.transactionId}</p>
                  <span className="payment-date">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="payment-amount">
                  <span className={`amount ${payment.status}`}>${payment.amount}</span>
                  <span className={`payment-status ${payment.status}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No payment records</p>
        )}
      </div>

      {/* Payment Methods */}
      <div className="payment-methods">
        <h2>Payment Methods</h2>
        <div className="methods-grid">
          <div className="method-card">
            <div className="method-icon">💳</div>
            <h3>Credit/Debit Card</h3>
            <p>Safe and secure online payment</p>
            <button className="pay-btn">Pay Now</button>
          </div>
          <div className="method-card">
            <div className="method-icon">🏦</div>
            <h3>Bank Transfer</h3>
            <p>Direct bank to school account</p>
            <button className="pay-btn">View Details</button>
          </div>
          <div className="method-card">
            <div className="method-icon">📱</div>
            <h3>Mobile Payment</h3>
            <p>Pay via mobile money</p>
            <button className="pay-btn">Pay Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Fees;
