const contracts = {
  31337: [
    {
      chainId: "31337",
      name: "localhost",
      contracts: {
        HalalGamble: {
          address: "0x59b670e9fA9D0A427751Af201D676719a970857b",
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
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "nexRevealExpiry",
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
              inputs: [],
              name: "REVEAL_EXPIRATION_PERIOD",
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
              name: "getCurrentXor",
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
                  internalType: "address",
                  name: "who",
                  type: "address",
                },
              ],
              name: "isParticipant",
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
  11155111: [
    {
      chainId: "11155111",
      name: "sepolia",
      contracts: {
        HalalGamble: {
          address: "0x7477221443163FBf23fa3926245746445AEFb7b4",
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
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "nexRevealExpiry",
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
              inputs: [],
              name: "REVEAL_EXPIRATION_PERIOD",
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
              name: "getCurrentXor",
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
                  internalType: "address",
                  name: "who",
                  type: "address",
                },
              ],
              name: "isParticipant",
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
