const contracts = {
  31337: [
    {
      chainId: "31337",
      name: "localhost",
      contracts: {
        HalalGamble: {
          address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
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
              ],
              name: "getCurrentParticipantCount",
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
                  name: "roomNo",
                  type: "uint256",
                },
              ],
              name: "getInvalidRevealers",
              outputs: [
                {
                  internalType: "address[]",
                  name: "",
                  type: "address[]",
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
              name: "getParticipants",
              outputs: [
                {
                  internalType: "address[]",
                  name: "",
                  type: "address[]",
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
              name: "getValidRevealers",
              outputs: [
                {
                  internalType: "address[]",
                  name: "",
                  type: "address[]",
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
                {
                  internalType: "address",
                  name: "who",
                  type: "address",
                },
              ],
              name: "isActiveParticipant",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
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
              inputs: [],
              name: "roomCount",
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
      },
    },
  ],
} as const;

export default contracts;
