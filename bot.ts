import axios from 'axios';
import WebSocket from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = "vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A"
const API_SECRET = "NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j";
const TELEGRAM_API_KEY = '';
const TELEGRAM_CHAT_ID = '315944628';

// Binance API Base URL
const BASE_URL = 'https://api.binance.com/api/v3';

// Trading Symbol
const SYMBOL = 'unfiusdt';

// Buy and sell thresholds (adjust according to your strategy)
const BUY_THRESHOLD = 0.025; // Buy when the price drops 5% from the recent high
const SELL_THRESHOLD = 0.05; // Sell when the price increases 5% from the recent buy price

let boughtPrice: number = 0; // Store the price at which BTC was bought
let balance: number = 1000; // Initial balance for the simulation
let numBuys: number = 0; // Number of buy actions performed
let numSells: number = 0; // Number of sell actions performed

// Function to get the latest price
// Function to get the latest price
// async function getLatestPrice() {
//   try {
//     const response = await axios.get(`${BASE_URL}/ticker/price`, {
//       params: { symbol: SYMBOL },
//     });

//     return parseFloat(response.data.price);
//   } catch (error: any) { // Use 'any' type assertion here
//     console.error('Error fetching latest price:', (error as Error).message); // Perform 'any' type assertion here
//     return null;
//   }
// }

// // Function to get Binance account information
// async function getAccountInfo() {
//   try {
//     const response = await axios.get(`${BASE_URL}/account`, {
//       headers: { 'X-MBX-APIKEY': API_KEY },
//       params: { timestamp: Date.now() },
//     });

//     return response.data;
//   } catch (error: any) { // Use 'any' type assertion here
//     console.error('Error fetching account info:', (error as Error).message); // Perform 'any' type assertion here
//     return null;
//   }
// }


// Function to simulate a buy action
function simulateBuy(price: number, quantity: number) {
  balance -= price * quantity;
  numBuys++;
}

// Function to simulate a sell action
function simulateSell(price: number, quantity: number) {
  balance += price * quantity;
  numSells++;
}

// Function to execute the trading logic based on the latest price
function executeTradingLogic(latestPrice: number) {
  if (boughtPrice === 0) {
    // Buy condition: Price is lower than the threshold (recent high)
    if (latestPrice <= boughtPrice * BUY_THRESHOLD) {
      // Simulate Buy BTC using all available balance
      const quantityToBuy = balance / latestPrice;

      simulateBuy(latestPrice, quantityToBuy);
      boughtPrice = latestPrice;

      console.log('Buy Action - Price:', latestPrice, 'Quantity:', quantityToBuy, 'Balance:', balance);
    }
  } else {
    // Sell condition: Price is higher than the threshold (recent buy price)
    if (latestPrice >= boughtPrice * SELL_THRESHOLD) {
      // Simulate Sell all BTC balance
      simulateSell(latestPrice, balance / latestPrice);
      boughtPrice = 0;

      console.log('Sell Action - Price:', latestPrice, 'Quantity:', balance / latestPrice, 'Balance:', balance);
    }
  }
}

// Set up the WebSocket to monitor price changes
const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${SYMBOL}@ticker`);

ws.on('message', (data) => {
  const parsedData = JSON.parse(data.toString());
  const latestPrice = parseFloat(parsedData.c);

  console.log('Latest Price:', latestPrice);

  // Execute the trading logic based on the latest price
  executeTradingLogic(latestPrice);
});

async function sendTelegramMessage(message: string) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
    const payload = { chat_id: TELEGRAM_CHAT_ID, text: message };

    const response = await axios.post(url, payload);
    if (!response.data.ok) {
      throw new Error('Failed to send Telegram message');
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

// Function to get Binance account information

// Simple report function
function printReport() {
  console.log('-------------- Trading Bot Report --------------');
  console.log('Balance:', balance);
  console.log('Number of Buys:', numBuys);
  console.log('Number of Sells:', numSells);
  console.log('-----------------------------------------------');
}

function printReportAndSendTelegram() {
  const reportMessage = `-------------- Trading Bot Report --------------
Balance: ${balance}
Number of Buys: ${numBuys}
Number of Sells: ${numSells}
-----------------------------------------------`;

  console.log(reportMessage);
  sendTelegramMessage(reportMessage);
}

// Main function to periodically print the report
function main() {
  printReportAndSendTelegram();
}

// Run the main function periodically (adjust interval based on your needs)
setInterval(main, 90000); // Print the report every 10 seconds

// Start the bot by printing the initial report
main();
