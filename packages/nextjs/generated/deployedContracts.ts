const contracts = {
  31337: [
    {
      chainId: "31337",
      name: "localhost",
      contracts: {
        Lottery: {
          address: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
          abi: [
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "prize",
                  type: "uint256",
                },
              ],
              name: "PrizeCollected",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "buyer",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint8",
                  name: "ticketType",
                  type: "uint8",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "roundTotalMoney",
                  type: "uint256",
                },
              ],
              name: "TicketBought",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
              ],
              name: "TicketLost",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "buyer",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint8",
                  name: "ticketType",
                  type: "uint8",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "roundTotalMoney",
                  type: "uint256",
                },
              ],
              name: "TicketRefunded",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "buyer",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint8",
                  name: "ticketType",
                  type: "uint8",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "randomNumber",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "bool",
                  name: "validReveal",
                  type: "bool",
                },
              ],
              name: "TicketRevealed",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint8",
                  name: "place",
                  type: "uint8",
                },
                {
                  indexed: false,
                  internalType: "uint8",
                  name: "ticketType",
                  type: "uint8",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "prize",
                  type: "uint256",
                },
              ],
              name: "TicketWonLottery",
              type: "event",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "hashRndNumber",
                  type: "bytes32",
                },
                {
                  internalType: "uint8",
                  name: "ticketType",
                  type: "uint8",
                },
              ],
              name: "buyTicket",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
              ],
              name: "checkIfTicketWon",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
              ],
              name: "collectTicketPrize",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
              ],
              name: "collectTicketRefund",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              name: "depositEther",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [],
              name: "getBalance",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "getCurrentLotteryInPurchase",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "getCurrentLotteryInReveal",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "i",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
              ],
              name: "getIthOwnedTicketNo",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "uint8",
                  name: "",
                  type: "uint8",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "i",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
              ],
              name: "getIthWinningTicket",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
              ],
              name: "getLastOwnedTicketNo",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "uint8",
                  name: "",
                  type: "uint8",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "unixTime",
                  type: "uint256",
                },
              ],
              name: "getLotteryNos",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint8",
                  name: "ticketType",
                  type: "uint8",
                },
              ],
              name: "getTicketPrice",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "pure",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
              ],
              name: "getTotalLotteryMoneyCollected",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "lotteryNo",
                  type: "uint256",
                },
              ],
              name: "getYieldedAmounts",
              outputs: [
                {
                  internalType: "uint256[]",
                  name: "",
                  type: "uint256[]",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "ticketNo",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "rndNumber",
                  type: "uint256",
                },
              ],
              name: "revealRndNumber",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "startTimeOfContract",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              name: "withdrawEther",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
