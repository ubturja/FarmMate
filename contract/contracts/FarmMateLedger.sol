// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title FarmMateLedger
/// @notice Minimal ledger for produce batches, provenance, escrow, and incentives.
/// @dev Prototype-level contract optimized for clarity over gas.
contract FarmMateLedger {
    enum BatchState {
        Created,
        Listed,
        EscrowFunded,
        Delivered,
        Released,
        Refunded
    }

    struct Batch {
        uint256 id;
        address payable farmer;
        string metadataCID; // IPFS CID with batch metadata
        uint8 qualityScore; // 0-100
        bool dataVerified; // off-chain verified flag (e.g., AI or auditor)
        uint256 priceWei; // listing price in wei
        address payable buyer;
        uint256 escrowAmountWei;
        BatchState state;
        uint256 createdAt;
        string[] provenanceCIDs; // append-only provenance notes (IPFS CIDs)
    }

    // simple non-transferable incentive points for prototype
    mapping(address => uint256) public incentivePoints;

    // storage of batches
    uint256 private nextBatchId = 1;
    mapping(uint256 => Batch) private batches;

    // Reentrancy guard
    uint256 private _reentrancyLock = 1;
    modifier nonReentrant() {
        require(_reentrancyLock == 1, "REENTRANT");
        _reentrancyLock = 2;
        _;
        _reentrancyLock = 1;
    }

    // Events
    event BatchCreated(uint256 indexed batchId, address indexed farmer, string metadataCID, uint256 priceWei);
    event BatchListed(uint256 indexed batchId, uint256 priceWei);
    event QualityUpdated(uint256 indexed batchId, uint8 qualityScore, bool dataVerified);
    event MetadataUpdated(uint256 indexed batchId, string metadataCID);
    event ProvenanceAdded(uint256 indexed batchId, string noteCID);
    event EscrowFunded(uint256 indexed batchId, address indexed buyer, uint256 amountWei);
    event Delivered(uint256 indexed batchId);
    event Released(uint256 indexed batchId, uint256 amountWei);
    event Refunded(uint256 indexed batchId, uint256 amountWei);
    event IncentiveAwarded(address indexed account, uint256 amount);

    // Create a new batch (farmer only implicit)
    function createBatch(string calldata metadataCID, uint256 priceWei) external returns (uint256 batchId) {
        require(priceWei > 0, "PRICE");
        batchId = nextBatchId++;
        Batch storage b = batches[batchId];
        b.id = batchId;
        b.farmer = payable(msg.sender);
        b.metadataCID = metadataCID;
        b.priceWei = priceWei;
        b.state = BatchState.Created;
        b.createdAt = block.timestamp;
        emit BatchCreated(batchId, msg.sender, metadataCID, priceWei);
    }

    // List or update listing price (farmer only)
    function listBatch(uint256 batchId, uint256 newPriceWei) external {
        Batch storage b = _mustOwn(batchId);
        require(b.state == BatchState.Created || b.state == BatchState.Listed, "STATE");
        require(newPriceWei > 0, "PRICE");
        b.priceWei = newPriceWei;
        b.state = BatchState.Listed;
        emit BatchListed(batchId, newPriceWei);
    }

    // Update quality and verification flag (farmer only)
    function updateQuality(uint256 batchId, uint8 qualityScore, bool dataVerified) external {
        Batch storage b = _mustOwn(batchId);
        require(b.state == BatchState.Created || b.state == BatchState.Listed || b.state == BatchState.EscrowFunded, "STATE");
        require(qualityScore <= 100, "RANGE");
        b.qualityScore = qualityScore;
        b.dataVerified = dataVerified;
        emit QualityUpdated(batchId, qualityScore, dataVerified);
    }

    // Update metadata CID (farmer only, not after finalization)
    function updateMetadata(uint256 batchId, string calldata newCID) external {
        Batch storage b = _mustOwn(batchId);
        require(b.state != BatchState.Released && b.state != BatchState.Refunded, "FINAL");
        b.metadataCID = newCID;
        emit MetadataUpdated(batchId, newCID);
    }

    // Append provenance note CID
    function addProvenance(uint256 batchId, string calldata noteCID) external {
        Batch storage b = batches[batchId];
        require(b.id != 0, "NOT_FOUND");
        // Anyone can append provenance; in production, add role checks.
        b.provenanceCIDs.push(noteCID);
        emit ProvenanceAdded(batchId, noteCID);
    }

    // Buyer funds escrow for listed batch
    function fundEscrow(uint256 batchId) external payable nonReentrant {
        Batch storage b = batches[batchId];
        require(b.id != 0, "NOT_FOUND");
        require(b.state == BatchState.Listed, "STATE");
        require(msg.value == b.priceWei, "AMOUNT");
        require(b.buyer == address(0), "HAS_BUYER");
        b.buyer = payable(msg.sender);
        b.escrowAmountWei = msg.value;
        b.state = BatchState.EscrowFunded;
        emit EscrowFunded(batchId, msg.sender, msg.value);
    }

    // Farmer marks as delivered
    function markDelivered(uint256 batchId) external {
        Batch storage b = _mustOwn(batchId);
        require(b.state == BatchState.EscrowFunded, "STATE");
        b.state = BatchState.Delivered;
        emit Delivered(batchId);
    }

    // Buyer releases funds to farmer after delivery
    function releaseToFarmer(uint256 batchId) external nonReentrant {
        Batch storage b = batches[batchId];
        require(b.id != 0, "NOT_FOUND");
        require(b.state == BatchState.Delivered, "STATE");
        require(msg.sender == b.buyer, "ONLY_BUYER");
        uint256 amount = b.escrowAmountWei;
        b.escrowAmountWei = 0;
        b.state = BatchState.Released;
        (bool ok, ) = b.farmer.call{value: amount}("");
        require(ok, "PAY_FAIL");
        emit Released(batchId, amount);
        // Prototype incentive: award points on verified data and decent quality
        if (b.dataVerified && b.qualityScore >= 60) {
            uint256 reward = 10e18; // arbitrary units
            incentivePoints[b.farmer] += reward;
            emit IncentiveAwarded(b.farmer, reward);
        }
    }

    // Refund: allowed before delivery by buyer or farmer
    function refundBuyer(uint256 batchId) external nonReentrant {
        Batch storage b = batches[batchId];
        require(b.id != 0, "NOT_FOUND");
        require(b.state == BatchState.EscrowFunded, "STATE");
        require(msg.sender == b.buyer || msg.sender == b.farmer, "ROLE");
        uint256 amount = b.escrowAmountWei;
        address payable buyerPayable = b.buyer;
        b.escrowAmountWei = 0;
        b.state = BatchState.Refunded;
        (bool ok, ) = buyerPayable.call{value: amount}("");
        require(ok, "REFUND_FAIL");
        emit Refunded(batchId, amount);
    }

    // Views
    function getBatch(uint256 batchId) external view returns (
        uint256 id,
        address farmer,
        string memory metadataCID,
        uint8 qualityScore,
        bool dataVerified,
        uint256 priceWei,
        address buyer,
        uint256 escrowAmountWei,
        BatchState state,
        uint256 createdAt
    ) {
        Batch storage b = batches[batchId];
        require(b.id != 0, "NOT_FOUND");
        return (
            b.id,
            b.farmer,
            b.metadataCID,
            b.qualityScore,
            b.dataVerified,
            b.priceWei,
            b.buyer,
            b.escrowAmountWei,
            b.state,
            b.createdAt
        );
    }

    function getProvenanceCIDs(uint256 batchId) external view returns (string[] memory) {
        Batch storage b = batches[batchId];
        require(b.id != 0, "NOT_FOUND");
        return b.provenanceCIDs;
    }

    // Internal helpers
    function _mustOwn(uint256 batchId) internal view returns (Batch storage) {
        Batch storage b = batches[batchId];
        require(b.id != 0, "NOT_FOUND");
        require(b.farmer == msg.sender, "ONLY_FARMER");
        return b;
    }
}


