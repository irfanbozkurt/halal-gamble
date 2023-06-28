const contracts = {
  31337: [
    {
      chainId: "31337",
      name: "localhost",
      contracts: {
        HalalGamble: {
          address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
          abi: [
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "entrar",
                  type: "address",
                },
              ],
              name: "EnterRoom",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "revealer",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "bool",
                  name: "valid",
                  type: "bool",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "randomNumber",
                  type: "uint256",
                },
              ],
              name: "Revealed",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
              ],
              name: "RoomAbolished",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "creator",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "roomFee",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint8",
                  name: "capacity",
                  type: "uint8",
                },
              ],
              name: "RoomCreated",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "winner",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "prize",
                  type: "uint256",
                },
              ],
              name: "RoomEnded",
              type: "event",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
              ],
              name: "abolishRoom",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "roomFee",
                  type: "uint256",
                },
                {
                  internalType: "uint8",
                  name: "capacity",
                  type: "uint8",
                },
                {
                  internalType: "uint256",
                  name: "revealExpirationPeriod",
                  type: "uint256",
                },
                {
                  internalType: "bytes32",
                  name: "hashRndNumber",
                  type: "bytes32",
                },
              ],
              name: "createRoom",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
                {
                  internalType: "bytes32",
                  name: "hashRndNumber",
                  type: "bytes32",
                },
              ],
              name: "joinRoom",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "rndNumber",
                  type: "uint256",
                },
              ],
              name: "reveal",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              name: "rooms",
              outputs: [
                {
                  internalType: "uint256",
                  name: "roomNo",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "createdBy",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "roomFee",
                  type: "uint256",
                },
                {
                  internalType: "uint8",
                  name: "capacity",
                  type: "uint8",
                },
                {
                  internalType: "uint256",
                  name: "startTime",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "revealExpirationPeriod",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "revealExpiresAt",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "endTime",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "xor",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "winner",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "prize",
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
                  name: "roomNo",
                  type: "uint256",
                },
              ],
              name: "triggerRevealExpiry",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
        },
        Lottery: {
          address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
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
              inputs: [],
              name: "FULL_PRICE",
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
              name: "HALF_PRICE",
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
              name: "QUARTER_PRICE",
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
              stateMutability: "payable",
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
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
