import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, addDoc } from "firebase/firestore";
import axios from "axios";
import "./Portfolio.css";

function Portfolio() {
    const [stocks, setStocks] = useState([]);
    const [error, setError] = useState("");
    const [sellQuantities, setSellQuantities] = useState({});
    const [loading, setLoading] = useState(true);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    setError("User not logged in");
                    return;
                }
                const q = query(collection(db, "portfolio"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const portfolioData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setStocks(portfolioData);
                await refreshPrices(portfolioData);
            } catch (error) {
                setError("Error fetching portfolio.");
                console.error("Error fetching portfolio:", error);
            }
        };
        fetchPortfolio();
    }, []);

    const fetchCurrentPrice = async (symbol) => {
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
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            return null;
        }
    };

    const refreshPrices = async (stocks) => {
        const updatedStocks = await Promise.all(
            stocks.map(async (stock) => {
                const currentPrice = await fetchCurrentPrice(stock.symbol);
                const profitLoss =
                    currentPrice && stock.boughtPrice
                        ? ((currentPrice - stock.boughtPrice) * stock.quantity).toFixed(2)
                        : 0;
                const totalValue = currentPrice ? (currentPrice * stock.quantity).toFixed(2) : 0;
                return { ...stock, currentPrice, profitLoss, totalValue };
            })
        );
        setStocks(updatedStocks);
        calculateTotalPortfolioValue(updatedStocks);
    };

    const calculateTotalPortfolioValue = (stocks) => {
        setLoading(true);
        const totalValue = stocks.reduce((acc, stock) => {
            return acc + (stock.currentPrice ? stock.currentPrice * stock.quantity : 0);
        }, 0);
        setTotalPortfolioValue(totalValue.toFixed(2));
        setLoading(false);
    };

    const handleQuantityChange = (stockId, quantity) => {
        setSellQuantities((prevQuantities) => ({
            ...prevQuantities,
            [stockId]: quantity,
        }));
    };

    const logTransaction = async (transaction) => {
        try {
            console.log("Logging transaction:", transaction);
            const transactionData = {
                ...transaction,
                quantity: Number(transaction.quantity),
                price: Number(transaction.price),
                timestamp: new Date().toISOString(),
            };
            const docRef = await addDoc(collection(db, "logs"), transactionData);
            console.log("Transaction logged successfully with ID:", docRef.id);
        } catch (error) {
            console.error("Error logging transaction:", error.message);
            alert("Error logging transaction. Please try again.");
        }
    };

    const handleSellStock = async (stock) => {
        const sellQuantity = Number(sellQuantities[stock.id]) || 0;
        if (sellQuantity <= 0 || sellQuantity > stock.quantity) {
            setError("Invalid sell quantity.");
            return;
        }
        const remainingQuantity = stock.quantity - sellQuantity;
        try {
            if (remainingQuantity > 0) {
                await updateDoc(doc(db, "portfolio", stock.id), { quantity: remainingQuantity });
                setStocks((prevStocks) =>
                    prevStocks.map((s) =>
                        s.id === stock.id ? { ...s, quantity: remainingQuantity } : s
                    )
                );
            } else {
                await deleteDoc(doc(db, "portfolio", stock.id));
                setStocks((prevStocks) => prevStocks.filter((s) => s.id !== stock.id));
            }
            const sellTransaction = {
                uid: auth.currentUser.uid,
                symbol: stock.symbol,
                quantity: sellQuantity,
                price: stock.currentPrice || 0,
                type: "Sell",
                boughtPrice: stock.boughtPrice,
                boughtDate: stock.boughtDate,
                boughtTime: stock.boughtTime,
            };
            await logTransaction(sellTransaction);
        } catch (error) {
            setError("Error processing the sell order.");
            console.error("Error updating or deleting stock:", error);
        }
    };

    const calculateTotalProfitLoss = () => {
        const totalProfitLoss = stocks.reduce((acc, stock) => {
            const profitLoss =
                stock.currentPrice && stock.boughtPrice
                    ? (stock.currentPrice - stock.boughtPrice) * stock.quantity
                    : 0;
            return acc + parseFloat(profitLoss);
        }, 0);
        return totalProfitLoss.toFixed(2);
    };

    const calculateTotalInvested = () => {
        const totalInvested = stocks.reduce((acc, stock) => {
            return acc + (stock.boughtPrice * stock.quantity);
        }, 0);
        return totalInvested.toFixed(2);
    };

    const formatNumberWithCommas = (number) => {
        return new Intl.NumberFormat("en-IN").format(number);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatTime = (timeString) => {
        const [time, modifier] = timeString.split(" ");
        let [hours, minutes, seconds] = time.split(":");
        if (modifier === "PM" && hours !== "12") {
            hours = (parseInt(hours, 10) + 12).toString();
        } else if (modifier === "AM" && hours === "12") {
            hours = "00";
        }
        return `${hours}:${minutes}:${seconds}`;
    };

    const totalProfitLoss = calculateTotalProfitLoss();
    const totalInvested = calculateTotalInvested();
    
    // Determine text color based on profit/loss
    const profitLossColorClass =
      totalProfitLoss >= 0 ? "green-text" : "red-text";

    // Sort stocks alphabetically by symbol
    const sortedStocks = [...stocks].sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );

    return (
      <div>
          <h2>My Portfolio</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button onClick={() => refreshPrices(stocks)}>Refresh Prices</button>
          <div className="portfolio-summary">
              <div>
                  <h3>Total Profit/Loss</h3>
                  <p className={profitLossColorClass}>₹{formatNumberWithCommas(totalProfitLoss)}</p>
              </div>
              <div>
                  <h3>Total Amount Invested</h3>
                  <p>₹{formatNumberWithCommas(totalInvested)}</p>
              </div>
              <div>
                  <h3>Total Portfolio Value</h3>
                  {loading ? (
                      <div className="loader"></div>
                  ) : (
                      <p>₹{formatNumberWithCommas(totalPortfolioValue)}</p>
                  )}
              </div>
          </div>
          <div className="portfolio-grid">
              {sortedStocks.length > 0 ? (
                  sortedStocks.map((stock) => (
                      <div key={stock.id} className="portfolio-card">
                          <h3>{stock.symbol}</h3>
                          <p>Quantity: {stock.quantity}</p>
                          <p>Bought Price: ₹{formatNumberWithCommas(stock.boughtPrice)}</p>
                          <p>Current Price: {stock.currentPrice !== null ? `₹${formatNumberWithCommas(stock.currentPrice)}` : "N/A"}</p>
                          <p>Total Amount: ₹{formatNumberWithCommas((stock.boughtPrice * stock.quantity).toFixed(2))}</p>
                          <p>Total Value: {stock.totalValue ? `₹${formatNumberWithCommas(stock.totalValue)}` : "N/A"}</p>
                          <p>Bought Date: {formatDate(stock.boughtDate)}</p>
                          <p>Bought Time: {formatTime(stock.boughtTime)}</p>
                          {/* Apply color based on profit/loss for numbers only */}
                          <p>Profit/Loss Amount:&nbsp; 
                              <span className={stock.profitLoss >= 0 ? 'green-text' : 'red-text'}>
                                  ₹{stock.profitLoss ? formatNumberWithCommas(stock.profitLoss) : "N/A"}
                              </span>
                          </p>
                          <input type="number" min="1" value={sellQuantities[stock.id] || ""} onChange={(e) => handleQuantityChange(stock.id, e.target.value)} placeholder="Quantity to Sell" />
                          <button onClick={() => handleSellStock(stock)}>Sell</button>
                      </div>
                  ))
              ) : (
                  <p>No stocks in portfolio</p>
              )}
          </div>
      </div>
  );
}

export default Portfolio;