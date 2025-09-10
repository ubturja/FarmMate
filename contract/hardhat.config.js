require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const POLYGON_MUMBAI_URL = process.env.POLYGON_MUMBAI_URL || "";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: Object.assign(
    {
      hardhat: {},
      localhost: {
        url: "http://127.0.0.1:8545",
      },
    },
    POLYGON_MUMBAI_URL
      ? {
          polygonMumbai: {
            url: POLYGON_MUMBAI_URL,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
          },
        }
      : {}
  ),
};


