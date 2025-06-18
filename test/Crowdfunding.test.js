// test/Crowdfunding.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

// npx hardhat test

async function getBigIntBalance(address) {
  const balance = await ethers.provider.getBalance(address);
  return BigInt(balance.toString());
}

describe("Crowdfunding", function () {
  let crowdfunding, owner, donor1, donor2;

  beforeEach(async () => {
    [owner, donor1, donor2] = await ethers.getSigners();
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding", owner);
    crowdfunding = await Crowdfunding.deploy();
  });

  it("should allow owner to create a campaign", async () => {
    await crowdfunding.createCampaign(
      "Bantu Sekolah",
      "Deskripsi",
      1000,
      Math.floor(Date.now() / 1000) + 86400
    );
    const campaign = await crowdfunding.getCampaignDetails(1);
    expect(campaign.title).to.equal("Bantu Sekolah");
    expect(campaign.active).to.equal(true);
  });

  it("should not allow non-owner to create a campaign", async () => {
    await expect(
      crowdfunding
        .connect(donor1)
        .createCampaign(
          "Hack",
          "Malicious",
          1000,
          Math.floor(Date.now() / 1000) + 86400
        )
    ).to.be.revertedWithCustomError(crowdfunding, "OwnableUnauthorizedAccount"); //
  });

  it("should allow donation to an active campaign", async () => {
    await crowdfunding.createCampaign(
      "Kampanye",
      "Deskripsi",
      1000,
      Math.floor(Date.now() / 1000) + 86400
    );
    await crowdfunding.connect(donor1).donateToCampaign(1, { value: 500 });
    const detail = await crowdfunding.getCampaignDetails(1);
    expect(detail.amountCollected).to.equal(500);
  });

  it("should not allow donation to an inactive campaign", async () => {
    await crowdfunding.createCampaign(
      "Kampanye",
      "Deskripsi",
      1000,
      Math.floor(Date.now() / 1000) + 86400
    );
    await crowdfunding.deactivateCampaign(1);
    await expect(
      crowdfunding.connect(donor1).donateToCampaign(1, { value: 500 })
    ).to.be.revertedWith("Campaign is not active"); //
  });

  it("should allow owner to withdraw campaign funds", async () => {
    await crowdfunding.createCampaign(
      "Kampanye",
      "Desc",
      1000,
      Math.floor(Date.now() / 1000) + 86400
    );
    const donationAmount = ethers.parseEther("1.0");
    const txDonate = await crowdfunding
      .connect(donor1)
      .donateToCampaign(1, { value: donationAmount });
    await txDonate.wait();

    const beforeBalance = await getBigIntBalance(owner.address); //

    const txWithdraw = await crowdfunding.withdrawCampaignFunds(1);
    const receipt = await txWithdraw.wait();

    const gasUsed = BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice);

    const afterBalance = await getBigIntBalance(owner.address); //

    expect(afterBalance).to.equal(beforeBalance + donationAmount - gasUsed);
  });
});
