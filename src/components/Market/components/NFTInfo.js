import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Link,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import {
  btcMockAddress,
  ethMockAddress,
  NFTGridDataAddress,
} from "../../../utils/address";
import { Loader } from "../../../components/Loader";

export default function NFTInfo({
  owner,
  id,
  setSelectedNFT,
  handleLike,
  handleShare,
  getUserNfts,
  nftUserList,
  contract,
  web3,
}) {
  const [details, setDetails] = useState("nft");
  const [balances, setBalances] = useState("actual");
  const [item, setItem] = useState(id);
  const [NFT, setNFT] = useState(false);
  const [allNFT, setAllNFT] = useState(false);
  const [expanded, setExpanded] = useState("details");

  const handleChangeDetails = (event, value) => {
    setDetails(value);
  };

  const handleChangeBalances = (event, value) => {
    setBalances(value);
  };

  useEffect(() => {
    getUserNfts({ owner, contract, web3 });
  }, []);

  useEffect(() => {
    selectedNft();
  }, [nftUserList, item]);

  useEffect(() => {
    readAllNFTData();
  }, [nftUserList]);

  const selectedNft = () => {
    if (!nftUserList) return false;
    setNFT(nftUserList.filter((nft) => nft.id === item)[0]);
  };

  const readAllNFTData = async () => {
    if (!nftUserList) return false;
    const balance = nftUserList.reduce((a, b) => a + b.balance, 0);
    // const tx = nftUserList.reduce((a, b) => a + b.balance, 0);
    const holders = await contract.quickNode.gridBotFactory.methods
      .getNFTid()
      .call();
    setAllNFT({ balance, holders });
  };

  const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      {nftUserList && NFT && allNFT ? (
        <div className="grid-container">
          <div className="nft-view">
            <div className="arrow-back">
              <ArrowBackIcon
                sx={{ cursor: "pointer" }}
                onClick={() => setSelectedNFT(false)}
              />
            </div>
            <img
              style={{ borderRadius: "20px" }}
              src={`https://${NFT.image}.ipfs.nftstorage.link/blob`}
              alt=""
            />
            <Accordion
              square={true}
              expanded={expanded === "description"}
              onChange={handleChangeAccordion("description")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <InfoIcon />
                &nbsp;
                <h3>Description</h3>
              </AccordionSummary>
              <AccordionDetails>
                <span>{NFT.description}</span>
              </AccordionDetails>
            </Accordion>

            {expanded === "details" && (
              <div className="bot-selector">
                <Tabs
                  sx={{ minWidth: "300px" }}
                  onChange={handleChangeDetails}
                  value={details}
                  aria-label="Tabs where each tab needs to be selected manually"
                >
                  <Tab sx={{ minWidth: "200px" }} label="NFT" value="nft" />
                  <Tab sx={{ minWidth: "200px" }} label="BOT" value="bot" />
                </Tabs>
              </div>
            )}

            <Accordion
              square={true}
              expanded={expanded === "details"}
              expandIcon={<ExpandMoreIcon />}
              onChange={handleChangeAccordion("details")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ border: "none" }}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <DescriptionIcon />
                &nbsp;
                <h3>Details</h3>
              </AccordionSummary>
              <AccordionDetails>
                {details === "nft" && (
                  <>
                    <div className="nft-details">
                      <div className="details-title">
                        <span>NFT Address</span>
                        <span>Network</span>
                        <span>Collection</span>
                        <span>Symbol</span>
                        <span>Holders</span>
                        <span>NFT ID</span>
                        <span>Standard token</span>
                      </div>

                      <div className="details-data">
                        <span className="bold">
                          <Link
                            underline="hover"
                            href={`https://mumbai.polygonscan.com/address/${NFTGridDataAddress}`}
                            target="_blank"
                            rel="noopener"
                          >
                            {NFTGridDataAddress.substring(0, 5) +
                              "..." +
                              NFTGridDataAddress.substring(37, 42)}
                          </Link>
                        </span>
                        <span className="bold">Mumbai</span>
                        <span className="bold">NFTGridData</span>
                        <span className="bold">NGD</span>
                        <span className="bold">{allNFT.holders}</span>
                        <span className="bold">{NFT.id}</span>
                        <span className="bold">ERC721</span>
                      </div>
                    </div>
                  </>
                )}
                {details === "bot" && (
                  <>
                    <div className="nft-details">
                      <div className="details-title">
                        <span>BOT Address</span>
                        <span>Network</span>
                        <span>BOT ID</span>
                        <span>Pair</span>
                        <span>Buy Price</span>
                        <span>Sell Price</span>
                      </div>

                      <div className="details-data">
                        <span className="bold">
                          <Link
                            underline="hover"
                            href={`https://mumbai.polygonscan.com/address/${NFT.botAddress}`}
                            target="_blank"
                            rel="noopener"
                          >
                            {NFT.botAddress.substring(0, 5) +
                              "..." +
                              NFT.botAddress.substring(37, 42)}
                          </Link>
                        </span>
                        <span className="bold">Mumbai</span>
                        <span className="bold">{NFT.id}</span>
                        <span className="bold">
                          {NFT.pair === btcMockAddress && " WBTC / USDC"}
                          {NFT.pair === ethMockAddress && " WETH / USDC"}
                        </span>
                        <span className="bold">{NFT.buyPrice}</span>
                        <span className="bold">{NFT.sellPrice}</span>
                      </div>
                    </div>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </div>

          <div className="bot-view">
            <div className="nft-header">
              <h1>
                {NFT.name} #{NFT.id}
              </h1>
              <div className="tools">
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => handleLike({ NFT })}
                >
                  {NFT.isWallet ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </div>
                <span>{NFT.likes}</span>
                &nbsp; &nbsp;
                <div>
                  <ShareIcon
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleShare({ NFT })}
                  />
                </div>
              </div>
            </div>
            <div className="owner">
              <span>
                Owner: &nbsp;
                <span className="bold">
                  <Link
                    underline="hover"
                    href={`https://mumbai.polygonscan.com/address/${NFT.owner}`}
                    target="_blank"
                    rel="noopener"
                  >
                    {NFT.owner.substring(0, 5) +
                      "..." +
                      NFT.owner.substring(37, 42)}
                  </Link>
                </span>
              </span>
              &nbsp;
              <span>
                Bots: <span className="bold">{nftUserList.length}</span>
              </span>
              <div className="nft-preview">
                {nftUserList.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="item-preview"
                      onClick={() => setItem(data.id)}
                    >
                      <img
                        style={{ borderRadius: "50%" }}
                        className={
                          data.id === NFT.id
                            ? "nft-image-mini bot-selected"
                            : "nft-image-mini"
                        }
                        src={`https://${data.image}.ipfs.nftstorage.link/blob`}
                        alt=""
                        width={32}
                        height={32}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bot-selector">
              <Tabs
                sx={{ minWidth: "300px" }}
                onChange={handleChangeBalances}
                value={balances}
                aria-label="Tabs where each tab needs to be selected manually"
              >
                <Tab
                  sx={{ minWidth: "200px" }}
                  label="ACTUAL BOT"
                  value="actual"
                />
                <Tab sx={{ minWidth: "200px" }} label="ALL BOTS" value="all" />
              </Tabs>
            </div>
            <div className="nft-details">
              <div className="details-title">
                <small>Balance</small>
                <div className="bot-balance">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    data-name="86977684-12db-4850-8f30-233a7c267d11"
                    viewBox="0 0 2000 2000"
                    width={24}
                    height={24}
                  >
                    <path
                      d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
                      fill="#2775ca"
                    />
                    <path
                      d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
                      fill="#fff"
                    />
                    <path
                      d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
                      fill="#fff"
                    />
                  </svg>
                  <h3>
                    {balances === "actual" ? NFT.balance : allNFT.balance}
                  </h3>
                </div>
              </div>
              <div className="details-data">
                <small>Profit</small>
                <div className="bot-balance">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    data-name="86977684-12db-4850-8f30-233a7c267d11"
                    viewBox="0 0 2000 2000"
                    width={24}
                    height={24}
                  >
                    <path
                      d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
                      fill="#2775ca"
                    />
                    <path
                      d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
                      fill="#fff"
                    />
                    <path
                      d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
                      fill="#fff"
                    />
                  </svg>
                  <h3>-</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
}
