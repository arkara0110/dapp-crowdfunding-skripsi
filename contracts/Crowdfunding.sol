// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Crowdfunding is Ownable, ReentrancyGuard {
    struct Campaign {
        uint256 id;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        bool active;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        uint256 campaignId;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public campaignDonations;
    mapping(address => Donation[]) public donorHistory;

    event CampaignCreated(
        uint256 indexed campaignId,
        string title,
        uint256 target,
        uint256 deadline
    );
    event Donated(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );
    event CampaignDeactivated(uint256 indexed campaignId);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline
    ) external onlyOwner {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_target > 0, "Target must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            title: _title,
            description: _description,
            target: _target,
            deadline: _deadline,
            amountCollected: 0,
            active: true
        });

        emit CampaignCreated(campaignCount, _title, _target, _deadline);
    }

    function deactivateCampaign(uint256 _campaignId) external onlyOwner {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Invalid campaign ID"
        );
        require(campaigns[_campaignId].active, "Campaign is already inactive");

        campaigns[_campaignId].active = false;
        emit CampaignDeactivated(_campaignId);
    }

    function withdrawCampaignFunds(
        uint256 _campaignId
    ) external onlyOwner nonReentrant {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Invalid campaign ID"
        );
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.amountCollected > 0, "No funds to withdraw");

        if (campaign.active) {
            campaign.active = false;
            emit CampaignDeactivated(_campaignId);
        }

        uint256 amount = campaign.amountCollected;
        campaign.amountCollected = 0;

        (bool sent, ) = owner().call{value: amount}("");
        require(sent, "Failed to send funds");

        emit FundsWithdrawn(_campaignId, owner(), amount);
    }

    function donateToCampaign(
        uint256 _campaignId
    ) external payable nonReentrant {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Invalid campaign ID"
        );
        require(campaigns[_campaignId].active, "Campaign is not active");
        require(
            block.timestamp <= campaigns[_campaignId].deadline,
            "Campaign has ended"
        );
        require(msg.value > 0, "Donation must be greater than 0");

        Campaign storage campaign = campaigns[_campaignId];
        campaign.amountCollected += msg.value;

        Donation memory newDonation = Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            campaignId: _campaignId
        });

        campaignDonations[_campaignId].push(newDonation);
        donorHistory[msg.sender].push(newDonation);

        emit Donated(_campaignId, msg.sender, msg.value);
    }

    function getCampaignDetails(
        uint256 _campaignId
    )
        external
        view
        returns (
            string memory title,
            string memory description,
            uint256 target,
            uint256 deadline,
            uint256 amountCollected,
            bool active
        )
    {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Invalid campaign ID"
        );
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.title,
            campaign.description,
            campaign.target,
            campaign.deadline,
            campaign.amountCollected,
            campaign.active
        );
    }

    function getAllCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory result = new Campaign[](campaignCount);
        for (uint256 i = 0; i < campaignCount; i++) {
            result[i] = campaigns[i + 1];
        }
        return result;
    }

    function getCampaignDonations(
        uint256 _campaignId
    ) external view returns (Donation[] memory) {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Invalid campaign ID"
        );
        return campaignDonations[_campaignId];
    }

    function getDonorHistory(
        address _donor
    ) external view returns (Donation[] memory) {
        return donorHistory[_donor];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
