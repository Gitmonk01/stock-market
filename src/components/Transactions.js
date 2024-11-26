import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Ensure auth is imported to get the current user
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [netProfitLoss, setNetProfitLoss] = useState(0); // State to hold net profit/loss

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTransactions(currentUser.uid);
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const fetchTransactions = async (uid) => {
    const q = query(collection(db, 'logs'), where('uid', '==', uid), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => doc.data());
    setTransactions(logs);
    calculateNetProfitLoss(logs); // Calculate net profit/loss after fetching transactions
  };

  const calculateNetProfitLoss = (transactions) => {
    const totalProfitLoss = transactions.reduce((acc, transaction) => {
      return acc + parseFloat(calculateProfitLoss(parseFloat(transaction.boughtPrice), parseFloat(transaction.price), transaction.quantity));
    }, 0);
    setNetProfitLoss(totalProfitLoss.toFixed(2)); // Update state with net profit/loss
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';

    const [hours, minutes, secondsAndPeriod] = time.split(':');
    const [seconds, period] = secondsAndPeriod.split(' ');

    let hours24 = parseInt(hours, 10);
    if (period === 'PM' && hours24 !== 12) hours24 += 12;
    if (period === 'AM' && hours24 === 12) hours24 = 0;

    return `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatSoldDateTime = (timestamp) => {
    if (!timestamp) return 'N/A N/A';

    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const calculateProfitLoss = (boughtPrice, soldPrice, quantity) => {
    return ((soldPrice - boughtPrice) * quantity).toFixed(2); // Returning the result to 2 decimal places
  };

  const formatAmount = (amount) => {
    return `₹ ${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  return (
    <div className="transactions-page">
      <h2>Transaction History</h2>
      <div className="net-profit-loss" style={{ textAlign: 'left', marginBottom: '20px' }}>
        <h3>
          Net Profit/Loss Booked: <span style={{ color: netProfitLoss >= 0 ? 'green' : 'red' }}>{formatAmount(netProfitLoss)}</span>
        </h3>
      </div>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Stock Name</th>
              <th>Quantities Sold</th>
              <th>Bought Price</th>
              <th>Sold Price</th>
              <th>Bought Date & Time</th>
              <th>Sold Date & Time</th>
              <th>Profit/Loss Booked</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => {
              const profitLoss = calculateProfitLoss(parseFloat(transaction.boughtPrice), transaction.price, transaction.quantity);
              return (
                <tr key={index}>
                  <td>{transaction.symbol}</td>
                  <td>{transaction.quantity}</td>
                  <td>{formatAmount(parseFloat(transaction.boughtPrice).toFixed(2))}</td>
                  <td>{formatAmount(parseFloat(transaction.price).toFixed(2))}</td>
                  <td>
                    {formatDate(transaction.boughtDate)}{' '}
                    {transaction.boughtTime ? formatTime(transaction.boughtTime) : 'N/A'}
                  </td>
                  <td>
                    {transaction.type === 'Sell' ? (
                      formatSoldDateTime(transaction.timestamp)
                    ) : (
                      'N/A N/A'
                    )}
                  </td>
                  <td style={{ color: profitLoss >= 0 ? 'green' : 'red' }}>
                    {formatAmount(profitLoss)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transactions;
