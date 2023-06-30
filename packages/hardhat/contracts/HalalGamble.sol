//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract HalalGamble {
  /* Room Management */
  struct Room {
    uint256 roomNo;
    address createdBy;
    uint256 roomFee;
    uint8 capacity;
    //
    uint256 startTime;
    uint256 revealExpiresAt;
    uint256 endTime;
    //
    address[] participants;
    mapping(address => bool) participantsMap;
    mapping(address => bytes32) randHash;
    mapping(address => uint8) revealStatus; // 0: unrevealed, 1: invalid reveal, 2: revealed
    //
    uint256 xor;
    address[] validRevealers;
    address[] invalidRevealers;
    //
    address winner;
    uint256 prize;
  }

  event RoomCreated(uint256 indexed roomNo, address indexed creator, uint256 roomFee, uint8 capacity);
  event RoomAbolished(uint256 indexed roomNo);
  event EnterRoom(uint256 indexed roomNo, address indexed entrar);
  event Revealed(
    uint256 indexed roomNo,
    address indexed revealer,
    bool valid,
    uint256 randomNumber,
    uint256 nexRevealExpiry
  );
  event RoomEnded(uint256 indexed roomNo, address indexed winner, uint256 prize);

  mapping(uint256 => Room) public rooms;
  uint256 public roomCount;

  uint256 public constant REVEAL_EXPIRATION_PERIOD = 3 minutes;

  /* Getters for Arrays of struct */
  function getValidRevealers(uint256 roomNo) external view returns (address[] memory) {
    return rooms[roomNo].validRevealers;
  }

  function getCurrentXor(uint256 roomNo) external view returns (uint256) {
    return rooms[roomNo].xor;
  }

  function getCurrentParticipantCount(uint256 roomNo) external view returns (uint256) {
    return rooms[roomNo].participants.length;
  }

  function isParticipant(uint256 roomNo, address who) external view returns (bool) {
    return rooms[roomNo].participantsMap[who];
  }

  function isActiveParticipant(uint256 roomNo, address who) external view returns (bool) {
    if (rooms[roomNo].winner != address(0)) return false;
    return rooms[roomNo].participantsMap[who];
  }

  /* Business Logic */

  function createRoom(uint256 roomFee, uint8 capacity, bytes32 hashRndNumber) external payable {
    require(roomFee > 0, "No one wants to play a free gambling game");
    require(msg.value >= roomFee, "Creator is the first player, so they must pay a roomFee");
    require(capacity > 1, "You need friends to play with");

    // Calculate room index
    uint256 roomNo = roomCount;
    roomCount++;
    // Initialize room fields
    rooms[roomNo].roomNo = roomNo;
    rooms[roomNo].createdBy = msg.sender;
    rooms[roomNo].roomFee = roomFee;
    rooms[roomNo].capacity = capacity;
    rooms[roomNo].startTime = block.timestamp;
    rooms[roomNo].participants.push(msg.sender);
    rooms[roomNo].randHash[msg.sender] = hashRndNumber;
    rooms[roomNo].participantsMap[msg.sender] = true;

    // Pay back the surplus
    if (msg.value > roomFee) payable(msg.sender).transfer(msg.value - roomFee);

    emit RoomCreated(roomNo, msg.sender, roomFee, capacity);
    emit EnterRoom(roomNo, msg.sender);
  }

  function abolishRoom(uint256 roomNo) external {
    require(msg.sender == rooms[roomNo].createdBy, "Only the creator can abolish");
    require(rooms[roomNo].participants.length < rooms[roomNo].capacity, "Cannot abolish after capacity is full");

    _refund(roomNo); // Refund people their money

    delete rooms[roomNo]; // Destroy record

    emit RoomAbolished(roomNo);
  }

  function joinRoom(uint256 roomNo, bytes32 hashRndNumber) external payable {
    require(rooms[roomNo].participants.length != 0, "No such room");
    require(!rooms[roomNo].participantsMap[msg.sender], "You already joined this room");
    require(rooms[roomNo].participants.length < rooms[roomNo].capacity, "Capacity full");
    uint256 fee = rooms[roomNo].roomFee;
    require(msg.value >= fee, "Send more than room fee");

    rooms[roomNo].participants.push(msg.sender);
    rooms[roomNo].randHash[msg.sender] = hashRndNumber;
    rooms[roomNo].participantsMap[msg.sender] = true;

    if (msg.value > fee) payable(msg.sender).transfer(msg.value - fee); // Pay back the surplus

    emit EnterRoom(roomNo, msg.sender);
  }

  function reveal(uint256 roomNo, uint256 rndNumber) external {
    require(rooms[roomNo].participants.length == rooms[roomNo].capacity, "Capacity must be fulfilled first");
    require(rooms[roomNo].participantsMap[msg.sender], "You didn't join this room");
    require(rooms[roomNo].revealStatus[msg.sender] == 0, "You already revealed your number");

    bool validReveal;
    if (keccak256(abi.encode(rndNumber, msg.sender)) == rooms[roomNo].randHash[msg.sender]) {
      console.log("VALID REVEAL BY:", msg.sender, " number ", rndNumber);
      validReveal = true;

      rooms[roomNo].xor ^= rndNumber;
      rooms[roomNo].revealStatus[msg.sender] = 2; // Valid reveal
      rooms[roomNo].validRevealers.push(msg.sender);
    } else {
      console.log("INVALID REVEAL BY:", msg.sender, " number ", rndNumber);
      rooms[roomNo].revealStatus[msg.sender] = 1; // Invalid reveal
      rooms[roomNo].invalidRevealers.push(msg.sender);
    }

    rooms[roomNo].revealExpiresAt = block.timestamp + REVEAL_EXPIRATION_PERIOD;
    emit Revealed(roomNo, msg.sender, validReveal, rndNumber, rooms[roomNo].revealExpiresAt);

    uint256 totalReveals = rooms[roomNo].invalidRevealers.length + rooms[roomNo].validRevealers.length;
    if (totalReveals == rooms[roomNo].capacity) _determineWinnerAndPay(roomNo);
  }

  function triggerRevealExpiry(uint256 roomNo) external {
    require(block.timestamp > rooms[roomNo].revealExpiresAt, "Didn't expire yet");
    _determineWinnerAndPay(roomNo);
  }

  /* 
    Refund to all participants in cases of no valid reveals, determine a winner
    and pay them in other ones.
  */
  function _determineWinnerAndPay(uint256 roomNo) internal {
    require(rooms[roomNo].winner == address(0), "Winner of room already collected prize");
    uint256 sampleSize = rooms[roomNo].validRevealers.length;

    if (sampleSize > 0) {
      uint256 winnerIndex = rooms[roomNo].xor % sampleSize;

      rooms[roomNo].winner = rooms[roomNo].validRevealers[winnerIndex];
      rooms[roomNo].prize = rooms[roomNo].capacity * rooms[roomNo].roomFee;

      payable(rooms[roomNo].winner).transfer(rooms[roomNo].prize);

      emit RoomEnded(roomNo, rooms[roomNo].winner, rooms[roomNo].prize);
    } else {
      _refund(roomNo);
      emit RoomEnded(roomNo, address(0), rooms[roomNo].roomFee);
    }

    rooms[roomNo].endTime = block.timestamp;
  }

  function _refund(uint256 roomNo) internal {
    for (uint256 i = 0; i < rooms[roomNo].participants.length; i++)
      payable(rooms[roomNo].participants[i]).transfer(rooms[roomNo].roomFee);
  }
}
