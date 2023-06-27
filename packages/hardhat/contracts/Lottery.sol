//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Lottery {
  event TicketBought(
    address indexed buyer,
    uint256 indexed lotteryNo,
    uint256 ticketNo,
    uint8 ticketType,
    uint256 roundTotalMoney
  );
  event TicketRefunded(
    address indexed buyer,
    uint256 indexed lotteryNo,
    uint256 ticketNo,
    uint8 ticketType,
    uint256 roundTotalMoney
  );
  event TicketRevealed(
    address indexed buyer,
    uint256 lotteryNo,
    uint256 ticketNo,
    uint8 ticketType,
    uint256 randomNumber,
    bool validReveal
  );
  event TicketWonLottery(
    uint256 indexed lotteryNo,
    uint256 indexed ticketNo,
    uint8 place,
    uint8 ticketType,
    uint256 prize
  );
  event PrizeCollected(address indexed owner, uint256 lotteryNo, uint256 ticketNo, uint256 prize);
  event TicketLost(address indexed owner, uint256 lotteryNo, uint256 ticketNo);

  struct Ticket {
    address owner;
    uint8 ticketType; // 1: full ticket, 2: half ticket, 3: quarter ticket
    bytes32 hashRndNumber;
    uint8 revealStatus; // 0: unrevealed, 1: invalid reveal, 2: revealed
  }

  struct LotteryRound {
    mapping(uint256 => Ticket) tickets;
    uint256 ticketCount;
    uint256 totalMoneyCollected;
    uint256 xor;
    uint256[] revealedTickets;
    uint256[3] winners;
    bool[3] collected;
    uint256[3] yieldedAmounts;
    uint256 carryOut;
  }

  uint256 lastCollectedCarryOut = 0;
  uint256 lastPopulatedWinners = 0;

  // A mapping that stores the lottery rounds keyed to their incremental IDs
  mapping(uint256 => LotteryRound) private _lotteryRounds;
  mapping(address => uint256) private _userBalances;

  uint256 public startTimeOfContract = block.timestamp;
  uint256 constant period = 10 minutes;

  /* Business Logic */

  /// @dev Allows users to purchase a ticket for the lottery.
  /// @dev Users shall only buy tickets of an on-going lottery.
  /// @param hashRndNumber sha3 hash of the ordered encodation the following:
  /// [a random uint256, an ethereum address]
  /// @param ticketType 1 for full, 2 for half, 3 for quarter tickets
  function buyTicket(bytes32 hashRndNumber, uint8 ticketType) public {
    require(ticketType >= 1 && ticketType <= 3, "Invalid ticket type");

    uint256 ticketPrice = getTicketPrice(ticketType);
    require(getBalance() >= ticketPrice, "Insufficient balance");

    uint256 currentLotteryNo = getCurrentLotteryInPurchase();
    uint256 ticketNo = _lotteryRounds[currentLotteryNo].ticketCount + 1;
    _lotteryRounds[currentLotteryNo].tickets[ticketNo] = Ticket({
      owner: msg.sender,
      ticketType: ticketType,
      hashRndNumber: hashRndNumber,
      revealStatus: 0
    });

    _lotteryRounds[currentLotteryNo].ticketCount++;
    _userBalances[msg.sender] -= ticketPrice;
    _lotteryRounds[currentLotteryNo].totalMoneyCollected += ticketPrice;

    emit TicketBought(
      msg.sender,
      currentLotteryNo,
      ticketNo,
      ticketType,
      _lotteryRounds[currentLotteryNo].totalMoneyCollected
    );
  }

  /// @dev Allows users to collect a refund for a ticket that has not been revealed.
  /// @param ticketNo ticketNo of the boughet ticket.
  function collectTicketRefund(uint256 ticketNo) public {
    uint256 lotteryNo = getCurrentLotteryInPurchase();
    if (
      !_isTicketOwner(lotteryNo, ticketNo) ||
      _isTicketRevealed(lotteryNo, ticketNo) ||
      !_isHashSubmitted(lotteryNo, ticketNo)
    ) revert("User doesn't have an unrevealed ticket for lottery in purchase");

    uint8 ticketType = _lotteryRounds[lotteryNo].tickets[ticketNo].ticketType;
    uint256 ticketPrice = getTicketPrice(ticketType);
    delete _lotteryRounds[lotteryNo].tickets[ticketNo];
    _lotteryRounds[lotteryNo].totalMoneyCollected -= ticketPrice;
    _userBalances[msg.sender] += ticketPrice;

    emit TicketRefunded(msg.sender, lotteryNo, ticketNo, ticketType, _lotteryRounds[lotteryNo].totalMoneyCollected);
  }

  /// @dev Allows users to reveal the random number for a ticket.
  /// @dev Users shall only buy reveal their random numbers if the reveal stage
  /// is active for the lotteryNo in question.
  /// @param ticketNo Number of the bought ticket
  /// @param rndNumber 1 for full, 2 for half, 3 for quarter tickets
  function revealRndNumber(uint256 ticketNo, uint256 rndNumber) public {
    uint256 lotteryNo = getCurrentLotteryInReveal();
    require(lotteryNo != 0, "Reveal stage is not active");
    require(
      _lotteryRounds[lotteryNo].tickets[ticketNo].revealStatus != 1,
      "Ticket is forfeit. User attempted reveal and could not provide the same random number."
    );
    require(_lotteryRounds[lotteryNo].tickets[ticketNo].revealStatus != 2, "Already revealed");

    if (
      !_isTicketOwner(lotteryNo, ticketNo) ||
      _isTicketRevealed(lotteryNo, ticketNo) ||
      !_isHashSubmitted(lotteryNo, ticketNo)
    ) revert("User doesn't have an unrevealed ticket for lottery in purchase");

    if (keccak256(abi.encode(rndNumber, msg.sender)) == _lotteryRounds[lotteryNo].tickets[ticketNo].hashRndNumber) {
      _lotteryRounds[lotteryNo].xor ^= rndNumber;
      _lotteryRounds[lotteryNo].tickets[ticketNo].revealStatus = 2;
      _lotteryRounds[lotteryNo].revealedTickets.push(ticketNo);

      emit TicketRevealed(
        msg.sender,
        lotteryNo,
        ticketNo,
        _lotteryRounds[lotteryNo].tickets[ticketNo].ticketType,
        rndNumber,
        true
      );
    } else {
      _lotteryRounds[lotteryNo].tickets[ticketNo].revealStatus = 1; // Invalid reveal
      emit TicketRevealed(
        msg.sender,
        lotteryNo,
        ticketNo,
        _lotteryRounds[lotteryNo].tickets[ticketNo].ticketType,
        rndNumber,
        false
      );
    }
  }

  /// @dev Allows users to collect the prize for a winning ticket.
  /// @dev Users shall only claim prize after the reveal stage ends for
  /// lottery in question.
  /// @param lotteryNo LotteryNo during which the ticket was purchased
  /// @param ticketNo Number of the bought ticket
  function collectTicketPrize(uint256 lotteryNo, uint256 ticketNo) public {
    require(
      lotteryNo > 0 && getCurrentLotteryInReveal() >= lotteryNo + 1,
      "Prizes are determined after the reveal stage ends."
    );
    if (!_areWinnersPopulated(lotteryNo)) _populateWinners(lotteryNo);
    require(_isTicketOwner(lotteryNo, ticketNo), "Caller is not the ticket owner");
    if (!_isTicketWinner(lotteryNo, ticketNo)) {
      emit TicketLost(msg.sender, lotteryNo, ticketNo);
      return;
    }

    // Check if given ticket is one of the three winners.
    uint8 place = _getPlaceOfWinningTicket(lotteryNo, ticketNo);
    uint prize = _lotteryRounds[lotteryNo].yieldedAmounts[place - 1];
    _userBalances[msg.sender] += prize;
    _lotteryRounds[lotteryNo].collected[place - 1] = true;

    emit PrizeCollected(msg.sender, lotteryNo, ticketNo, prize);
  }

  /// @dev Checks if a ticket has won a prize and returns the amount if it has.
  /// @dev It requires the reveal stage has ended for lottery in question.
  /// @param lotteryNo LotteryNo during which the ticket was purchased
  /// @param ticketNo Number of the bought ticket
  function checkIfTicketWon(uint256 lotteryNo, uint256 ticketNo) public returns (uint256) {
    require(
      lotteryNo > 0 && getCurrentLotteryInReveal() >= lotteryNo + 1,
      "Prizes are determined after the reveal stage ends."
    );
    if (!_areWinnersPopulated(lotteryNo)) _populateWinners(lotteryNo);

    if (_lotteryRounds[lotteryNo].xor == 0) return 0;
    if (!_isTicketWinner(lotteryNo, ticketNo)) return 0;

    return _lotteryRounds[lotteryNo].yieldedAmounts[_getPlaceOfWinningTicket(lotteryNo, ticketNo) - 1];
  }

  /* Base Monatery Functionality */

  /// @dev Allows users to deposit Ether into their accounts
  /// @param amount in wei
  function depositEther(uint256 amount) external payable {
    require(amount > 0 && msg.value >= amount, "Invalid amount");
    _userBalances[msg.sender] += amount;
    if (msg.value - amount > 0) payable(msg.sender).transfer(msg.value - amount);
  }

  /// @dev Allows users to withdraw Ether from their accounts
  /// @param amount in wei
  function withdrawEther(uint256 amount) external {
    require(amount > 0, "Invalid amount");
    require(getBalance() >= amount, "Insufficient balance");
    _userBalances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
  }

  /// @dev Returns the balance of the caller's account
  function getBalance() public view returns (uint256) {
    return _userBalances[msg.sender];
  }

  /* Time Arithmetics */

  /// @dev Returns the current lottery round that accepts ticket purchases
  function getCurrentLotteryInPurchase() public view returns (uint256) {
    return 1 + getCurrentLotteryInReveal();
  }

  /// @dev Returns the current lottery round that accepts number reveals
  function getCurrentLotteryInReveal() public view returns (uint256) {
    return (block.timestamp - startTimeOfContract) / period;
  }

  /* Read functions for state variables */

  /// @dev Returns the price of a ticket based on its type.
  function getTicketPrice(uint8 ticketType) public pure returns (uint256) {
    if (ticketType == 1) return (8 ether) / 1000;
    if (ticketType == 2) return (4 ether) / 1000;
    if (ticketType == 3) return (2 ether) / 1000;
    revert("Invalid ticket type");
  }

  /// @dev Returns the total money collected for the given lottery round.
  /// @param lotteryNo in question
  function getTotalLotteryMoneyCollected(uint256 lotteryNo) external view returns (uint256) {
    uint256 currentLotteryInPurchase = getCurrentLotteryInPurchase();
    require(lotteryNo <= currentLotteryInPurchase, "Lottery round does not exist");
    return _lotteryRounds[lotteryNo].totalMoneyCollected;
  }

  /// @dev Returns the last owned ticket number and its status for a lottery round.
  /// 0: not revealed, 1: revealed, 2: collected
  /// @param lotteryNo in question
  function getLastOwnedTicketNo(uint256 lotteryNo) public view returns (uint256, uint8) {
    require(lotteryNo > 0 && lotteryNo <= getCurrentLotteryInPurchase(), "Lottery round does not exist");

    uint256 lastTicketNo = _lotteryRounds[lotteryNo].ticketCount;
    if (lastTicketNo == 0) return (0, 0);

    uint8 status;
    if (_isTicketRevealed(lotteryNo, lastTicketNo)) status = 1;
    if (_isTicketWinner(lotteryNo, lastTicketNo)) {
      uint8 place;
      for (uint8 i = 0; i < 3; i++)
        if (_lotteryRounds[lotteryNo].winners[i] == lastTicketNo) {
          place = i + 1;
          break;
        }
      if (place != 0 && _lotteryRounds[lotteryNo].collected[place - 1]) status = 2;
    }

    return (lastTicketNo, status);
  }

  /// @dev Returns the i-th owned ticket number and its status for a lottery round.
  /// @dev Tickets are enumerated based on number of existing tickets, starting
  /// from 1. This means a validator has a partial saying on what ticket numbers in
  /// a narrow timeframe will be.
  /// @param i Order of the bought ticket
  /// @param lotteryNo LotteryNo during which the ticket was purchased
  /// @return i back
  /// @return status of the i'th owned ticket. 0: not revealed, 1: revealed, 2: collected
  function getIthOwnedTicketNo(uint256 i, uint256 lotteryNo) public view returns (uint256, uint8) {
    require(lotteryNo > 0 && lotteryNo <= getCurrentLotteryInPurchase(), "Lottery round does not exist");
    require(i > 0 && i <= _lotteryRounds[lotteryNo].ticketCount, "Invalid ticket index");

    uint8 status;
    if (_isTicketRevealed(lotteryNo, i)) status = 1;
    if (_isTicketWinner(lotteryNo, i)) {
      uint8 place;
      for (uint8 j = 0; j < 3; j++)
        if (_lotteryRounds[lotteryNo].winners[j] == i) {
          place = j + 1;
          break;
        }
      if (place != 0 && _lotteryRounds[lotteryNo].collected[place - 1]) status = 2;
    }

    return (i, status);
  }

  /// @dev Returns the i-th winning ticket number and its prize amount for a lottery round.
  /// @dev Tickets are enumerated based on number of existing tickets, starting
  /// from 1. This means a validator has a partial saying on what ticket numbers in
  /// a narrow timeframe will be.
  /// @param i 1, 2, or 3
  /// @param lotteryNo LotteryNo during which the ticket was issued
  /// @return ticketNo winning at the i'th place
  /// @return amount won by the i'th winning ticket in Wei
  function getIthWinningTicket(uint256 i, uint256 lotteryNo) public returns (uint256, uint256) {
    require(
      lotteryNo > 0 && getCurrentLotteryInReveal() >= lotteryNo + 1,
      "Prizes are determined after the reveal stage ends."
    );
    if (!_areWinnersPopulated(lotteryNo)) _populateWinners(lotteryNo);
    require(i > 0 && i < 4, "Invalid winning ticket index");

    uint256 ticketNo = _lotteryRounds[lotteryNo].winners[i - 1];
    require(ticketNo != 0, "No data found for given lottery and place.");

    return (ticketNo, _lotteryRounds[lotteryNo].yieldedAmounts[i - 1]);
  }

  // InPurchase, InReveal
  /// @dev Returns the lottery numbers (in purchase and reveal stages) for a given Unix timestamp.
  /// @param unixTime Queried time as unix timestamp
  /// @return uint256 lotteryNo in purchase
  /// @return uint256 lotteryNo in reveal
  function getLotteryNos(uint256 unixTime) public view returns (uint256, uint256) {
    require(unixTime >= startTimeOfContract, "You're giving a very old date.");

    uint256 inReveal = (unixTime - startTimeOfContract) / period;
    return (inReveal + 1, inReveal);
  }

  /// @dev Returns the yielded amounts for the winners of a specific lottery round.
  /// @param lotteryNo Lottery number for which the yielded amounts are queried.
  /// @return . An array of uint256 representing the yielded amounts for the winners.
  function getYieldedAmounts(uint256 lotteryNo) external returns (uint256[] memory) {
    require(
      lotteryNo > 0 && getCurrentLotteryInReveal() >= lotteryNo + 1,
      "Prizes are determined after the reveal stage ends."
    );
    if (!_areWinnersPopulated(lotteryNo)) _populateWinners(lotteryNo);

    uint256[] memory result = new uint256[](3);
    for (uint256 i = 0; i < 3; i++) result[i] = _lotteryRounds[lotteryNo].yieldedAmounts[i];

    return result;
  }

  /* Internal Helpers */
  /// @dev Checks if the caller is the owner of the given ticket.
  /// @param lotteryNo The lottery number
  /// @param ticketNo The ticket number
  /// @return bool indicating whether the caller is the owner of the ticket
  function _isTicketOwner(uint256 lotteryNo, uint256 ticketNo) internal view returns (bool) {
    return msg.sender == _lotteryRounds[lotteryNo].tickets[ticketNo].owner;
  }

  /// @dev Checks if a ticket has been revealed.
  /// @param lotteryNo The lottery number
  /// @param ticketNo The ticket number
  /// @return bool indicating whether the ticket has been revealed
  function _isTicketRevealed(uint256 lotteryNo, uint256 ticketNo) internal view returns (bool) {
    return _lotteryRounds[lotteryNo].tickets[ticketNo].revealStatus > 0;
  }

  /// @dev Checks if a ticket is a winner.
  /// @param lotteryNo The lottery number
  /// @param ticketNo The ticket number
  /// @return bool indicating whether the ticket is a winner
  function _isTicketWinner(uint256 lotteryNo, uint256 ticketNo) internal view returns (bool) {
    if (lotteryNo == 0 || ticketNo == 0) return false;
    for (uint8 i = 0; i < 3; i++) {
      if (_lotteryRounds[lotteryNo].winners[i] == ticketNo) return true;
    }
    return false;
  }

  /// @dev Check if the specified ticket in the given lottery round has a submitted hash
  /// @param lotteryNo The lottery number
  /// @param ticketNo The ticket number
  /// @return bool indicating whether the hash for the ticket has been submitted

  function _isHashSubmitted(uint256 lotteryNo, uint256 ticketNo) internal view returns (bool) {
    return _lotteryRounds[lotteryNo].tickets[ticketNo].hashRndNumber != bytes32(0);
  }

  /// @dev Returns the total prize amount for a given lottery number
  /// @dev See how it calculates all carry-outs up until today.
  /// @param lotteryNo The lottery number
  /// @return uint256 representing the total prize amount
  function _getTotalPrize(uint256 lotteryNo) internal returns (uint256) {
    if (lotteryNo == 0) return 0;
    uint256 totalPrize = _lotteryRounds[lotteryNo].totalMoneyCollected;
    for (uint256 i = lastCollectedCarryOut + 1; i < lotteryNo; i++) totalPrize += _lotteryRounds[i].carryOut;
    lastCollectedCarryOut = lotteryNo - 1;
    return totalPrize;
  }

  /// @dev Checks if the winners for a lottery round have been populated.
  /// @param lotteryNo The lottery number
  /// @return bool indicating whether the winners for the lottery round have been populated
  function _areWinnersPopulated(uint256 lotteryNo) internal view returns (bool) {
    return _lotteryRounds[lotteryNo].winners[0] != 0;
  }

  /// @dev Populates the winners for a given lottery round.
  /// @dev Very critical function. As smart contracts cannot update themselves,
  /// this function keeps track of last issued lottery rounds (in terms of determining
  /// the winners), calculates total prize by getting the carry-outs of all the
  /// contracts in between, and declares the winners to the world.
  /// @param lotteryNo The lottery number
  function _populateWinners(uint256 lotteryNo) internal {
    for (uint256 i = lastPopulatedWinners + 1; i <= lotteryNo; i++) __populateWinners(i);
    lastPopulatedWinners = lotteryNo;
  }

  /// @dev Populates the winners for a given lottery round.
  /// @param lotteryNo The lottery number
  function __populateWinners(uint256 lotteryNo) internal {
    uint256 totalPrize = _getTotalPrize(lotteryNo);
    uint256 sampleSize = _lotteryRounds[lotteryNo].revealedTickets.length;

    uint256 firstPlaceIndex;
    if (sampleSize > 0) {
      firstPlaceIndex = _lotteryRounds[lotteryNo].xor % sampleSize;
      uint256 firstPlaceTicketId = _lotteryRounds[lotteryNo].revealedTickets[firstPlaceIndex];
      _lotteryRounds[lotteryNo].winners[0] = firstPlaceTicketId;

      uint8 ticketType = _lotteryRounds[lotteryNo].tickets[firstPlaceTicketId].ticketType;
      uint256 prize = _calculatePrizeByPosition(totalPrize, 1, ticketType);
      _lotteryRounds[lotteryNo].yieldedAmounts[0] = prize;

      emit TicketWonLottery(lotteryNo, firstPlaceTicketId, 1, ticketType, prize);
    }

    uint256 secondPlaceIndex;
    if (sampleSize > 1) {
      _lotteryRounds[lotteryNo].xor ^= block.timestamp;
      secondPlaceIndex = _lotteryRounds[lotteryNo].xor % sampleSize;
      while (secondPlaceIndex == firstPlaceIndex) {
        secondPlaceIndex++;
        if (secondPlaceIndex >= sampleSize) secondPlaceIndex = 0;
      }
      uint256 secondPlaceTicketId = _lotteryRounds[lotteryNo].revealedTickets[secondPlaceIndex];
      _lotteryRounds[lotteryNo].winners[1] = secondPlaceTicketId;

      uint8 ticketType = _lotteryRounds[lotteryNo].tickets[secondPlaceTicketId].ticketType;
      uint256 prize = _calculatePrizeByPosition(
        totalPrize,
        2,
        _lotteryRounds[lotteryNo].tickets[secondPlaceTicketId].ticketType
      );

      _lotteryRounds[lotteryNo].yieldedAmounts[1] = prize;

      emit TicketWonLottery(lotteryNo, secondPlaceTicketId, 2, ticketType, prize);
    }

    uint256 thirdPlaceIndex;
    if (sampleSize > 2) {
      _lotteryRounds[lotteryNo].xor ^= block.timestamp;
      thirdPlaceIndex = _lotteryRounds[lotteryNo].xor % sampleSize;
      while (thirdPlaceIndex == secondPlaceIndex || thirdPlaceIndex == firstPlaceIndex) {
        thirdPlaceIndex++;
        if (thirdPlaceIndex >= sampleSize) thirdPlaceIndex = 0;
      }
      uint256 thirdPlaceTicketId = _lotteryRounds[lotteryNo].revealedTickets[thirdPlaceIndex];
      _lotteryRounds[lotteryNo].winners[2] = thirdPlaceTicketId;

      uint8 ticketType = _lotteryRounds[lotteryNo].tickets[thirdPlaceTicketId].ticketType;
      uint256 prize = _calculatePrizeByPosition(
        totalPrize,
        3,
        _lotteryRounds[lotteryNo].tickets[thirdPlaceTicketId].ticketType
      );
      _lotteryRounds[lotteryNo].yieldedAmounts[2] = prize;

      emit TicketWonLottery(lotteryNo, thirdPlaceTicketId, 3, ticketType, prize);
    }

    _lotteryRounds[lotteryNo].carryOut =
      totalPrize -
      (_lotteryRounds[lotteryNo].yieldedAmounts[0] +
        _lotteryRounds[lotteryNo].yieldedAmounts[1] +
        _lotteryRounds[lotteryNo].yieldedAmounts[2]);
  }

  /// @dev Calculates the prize amount based on the position and ticket type.
  /// @param totalMoney The total prize amount
  /// @param place The position of the ticket
  /// @param ticketType The type of the ticket
  /// @return uint256 The calculated prize amount
  function _calculatePrizeByPosition(
    uint256 totalMoney,
    uint256 place,
    uint256 ticketType
  ) internal pure returns (uint256) {
    uint256 prize;
    if (place == 1) {
      if (ticketType == 1) prize = totalMoney / 2;
      else if (ticketType == 2) prize = totalMoney / 4;
      else if (ticketType == 3) prize = totalMoney / 8;
    } else if (place == 2) {
      if (ticketType == 1) prize = totalMoney / 4;
      else if (ticketType == 2) prize = totalMoney / 8;
      else if (ticketType == 3) prize = totalMoney / 16;
    } else if (place == 3) {
      if (ticketType == 1) prize = totalMoney / 8;
      else if (ticketType == 2) prize = totalMoney / 16;
      else if (ticketType == 3) prize = totalMoney / 32;
    }
    return prize;
  }

  /// @dev Returns the position of a winning ticket in a given lottery round.
  /// @param lotteryNo The lottery number
  /// @param ticketNo The ticket number
  /// @return uint8 The position of the winning ticket (0 if not a winner, 1-3 for winners)
  function _getPlaceOfWinningTicket(uint256 lotteryNo, uint256 ticketNo) internal view returns (uint8) {
    uint8 place;
    for (uint8 i = 0; i < 3; i++)
      if (_lotteryRounds[lotteryNo].winners[i] == ticketNo) {
        place = i + 1;
        break;
      }
    return place;
  }
}
