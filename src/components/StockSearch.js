import React, { useState } from "react";
import axios from "axios";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import './StockSearch.css';

function StockSearch() {
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchStockPrice = async () => {
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.get(
        `https://live-indian-stock-price.p.rapidapi.com/api/v1/finance/stock/${symbol}/NSE`,
        {
          headers: {
            "x-rapidapi-key": "7cc7d28aa7msh2f244159a35cd84p179e23jsn064f2dd008e7",
            "x-rapidapi-host": "live-indian-stock-price.p.rapidapi.com",
          },
        }
      );

      // Check if the stock symbol exists in the API response
      if (response.data && response.data.data) {
        setPrice(response.data.data);
      } else {
        setError("Invalid stock symbol. Please try again.");
      }
    } catch (error) {
      setError("Error fetching stock price.");
      console.error("Error fetching stock price:", error);
    }
  };

  const handleBuyStock = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("User not logged in.");
      return;
    }

    if (price === null || quantity <= 0) {
      setError("Invalid price or quantity.");
      return;
    }

    const totalCost = (price * quantity).toFixed(2);
    const purchaseDate = new Date().toLocaleDateString();
    const purchaseTime = new Date().toLocaleTimeString();

    try {
      await addDoc(collection(db, "portfolio"), {
        symbol,
        boughtPrice: price,
        quantity,
        uid: user.uid, // Save the user’s UID with the stock data
        boughtDate: purchaseDate,
        boughtTime: purchaseTime,
      });
      setSuccessMessage(`Successfully bought ${quantity} share(s) of ${symbol} for ₹${totalCost}`);
    } catch (error) {
      setError("Error buying stock.");
      console.error("Error buying stock:", error);
    }
  };

  return (
    <div className="stock-search-container">
      <h2>Search Stocks</h2>
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())} // Automatically convert to uppercase
        placeholder="Enter stock symbol"
      />
      <button onClick={fetchStockPrice}>Search</button>
      {price !== null && (
        <div>
          <p>Current Price: ₹{price}</p>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            min="1"
          />
          <button onClick={handleBuyStock}>Buy</button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  );
}

export default StockSearch;
