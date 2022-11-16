import { useEffect, useState, useRef, useMemo } from "react";
import {
  Skeleton,
  TextField,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Warning } from "../Warning";
import useNFTStorage from "../../hooks/useNFTStorage";
import useNearScreen from "../../hooks/useNearScreen";
import { btcMockAddress, ethMockAddress } from "../../utils/address";
import NFTInfo from "./components/NFTInfo";

export default function Market({ account, contract, web3 }) {
  const {
    nftGlobalList,
    indexGlobalList,
    nftUserList,
    getGlobalNfts,
    randomPosition,
    readLimitNFT,
    handleLike,
    getUserNfts,
  } = useNFTStorage(account, contract);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);
  const [selectedNFT, setSelectedNFT] = useState(false);
  const [address, setAddress] = useState("");
  const [radio, setRadio] = useState("");
  const [NFTFilter, setNFTFilter] = useState(false);
  const skeletonList = useMemo(
    () => [...Array(10)].map((x) => randomPosition(3)),
    []
  );
  const screenRef = useRef();
  const { isNearScreen } = useNearScreen({
    distance: "400px",
    externalRef: nftGlobalList.length > 0 ? screenRef : null,
    once: false,
  });

  useEffect(() => {
    if (isNearScreen && nftGlobalList.length === to) {
      setFrom((prevState) => prevState + 10);
      setTo((prevState) => prevState + 10);
    }
  }, [isNearScreen, nftGlobalList, to]);

  useEffect(() => {
    getGlobalNfts();
  }, [account, contract]);

  useEffect(() => {
    getGridNftDatainScroll();
  }, [nftGlobalList, from, to, indexGlobalList, account, contract]);

  const getGridNftDatainScroll = () => {
    if (!account || !contract) return false;

    if (
      nftGlobalList.length < to &&
      indexGlobalList.length > 0 &&
      nftGlobalList.length < indexGlobalList.length
    ) {
      readLimitNFT({
        from,
        to: indexGlobalList.length > to ? to : indexGlobalList.length,
        actualData: nftGlobalList,
        account,
      });
    }
  };

  const SkeletonImage = ({ limit }) => {
    return skeletonList.slice(0, limit).map((position, index) => (
      <div className={position} key={index}>
        <div className="picture">
          <div className="front">
            <Skeleton
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              variant="rectangular"
            />
          </div>
          <div className="back"></div>
        </div>
      </div>
    ));
  };

  const handleShare = async ({ NFT }) => {
    const response = await fetch(
      `https://${NFT.image}.ipfs.nftstorage.link/blob`
    );
    const blob = await response.blob();
    const filesArray = [
      new File([blob], "meme.jpg", {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      }),
    ];
    const share = {
      files: filesArray,
      title: `${NFT.name} - NFT GRID BOT`,
      text: `${NFT.descripion}.\n${NFT.likes} likes.\nhttps://wispy-snowflake-7196.on.fleek.co/`,
    };
    if (!navigator.canShare) {
      console.error("share not supported");
      return false;
    } else if (navigator.canShare(share)) {
      navigator.share(share);
      return true;
    } else {
      console.error("invalid share data");
      return false;
    }
  };

  useEffect(() => {
    getFilters();
  }, [nftGlobalList]);

  const getFilters = () => {
    setNFTFilter(nftGlobalList);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAddress(e.target.value.toLowerCase());
  };

  useEffect(() => {
    handleFilters();
  }, [address]);

  const handleFilters = () => {
    if (address.length !== 42) {
      setNFTFilter(nftGlobalList);
      return false;
    }

    const filter = nftGlobalList.filter((nft) => nft.owner === address);
    setNFTFilter(filter);
  };

  const handleDelete = () => {
    setAddress("");
    setRadio("");
    setNFTFilter(nftGlobalList);
  };

  const handleRadio = (e) => {
    e.preventDefault();
    if (e.target.value === "own") setAddress(account);
    if (e.target.value === "custom") setAddress("");

    setRadio(e.target.value);
  };

  return (
    <>
      {account && contract && web3 ? (
        <>
          {!selectedNFT ? (
            <>
              <div className="market-container">
                <div className="filter-panel">
                  <FormControl>
                    <FormLabel id="demo-row-radio-buttons-group-label">
                      Filter by owner address
                    </FormLabel>
                    <RadioGroup
                      value={radio}
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                    >
                      <FormControlLabel
                        onChange={handleRadio}
                        value="own"
                        control={<Radio />}
                        label="Own"
                      />
                      <FormControlLabel
                        onChange={handleRadio}
                        value="custom"
                        control={<Radio />}
                        label="Custom"
                      />
                    </RadioGroup>
                  </FormControl>
                  {radio === "custom" && (
                    <TextField
                      onChange={handleSearch}
                      name="owner"
                      id="input-owner"
                      label="Owner address"
                      type="text"
                      size="small"
                      value={address}
                    />
                  )}

                  {address.length === 42 && (
                    <Chip
                      label={
                        address.substring(0, 5) +
                        "..." +
                        address.substring(37, 42)
                      }
                      onDelete={handleDelete}
                    />
                  )}
                </div>

                <div className="masonry-container">
                  {NFTFilter.length > 0 &&
                    NFTFilter.map(
                      (nft, index) =>
                        nft && (
                          <div
                            style={{ borderRadius: "20px" }}
                            className={nft.position}
                            key={index}
                          >
                            <div
                              style={{ borderRadius: "20px" }}
                              className="picture"
                            >
                              <div
                                style={{ borderRadius: "20px" }}
                                className="front"
                              >
                                <img
                                  style={{ borderRadius: "20px" }}
                                  src={`https://${nft.image}.ipfs.nftstorage.link/blob`}
                                  alt=""
                                />
                              </div>
                              <div
                                style={{
                                  borderRadius: "20px",
                                  cursor: "pointer",
                                }}
                                className="back"
                                onClick={() =>
                                  setSelectedNFT({
                                    owner: nft.owner,
                                    id: nft.id,
                                  })
                                }
                              >
                                <Warning label={"VIEW NFT"} />
                              </div>
                            </div>
                          </div>
                        )
                    )}
                  {skeletonList && nftGlobalList.length === 0 && (
                    <SkeletonImage limit={6} />
                  )}
                  {skeletonList &&
                    nftGlobalList.length !== indexGlobalList.length &&
                    nftGlobalList.length < to &&
                    nftGlobalList.length !== 0 && <SkeletonImage limit={6} />}
                  <div id="final-page" ref={screenRef}></div>
                </div>
              </div>
            </>
          ) : (
            <NFTInfo
              {...selectedNFT}
              setSelectedNFT={setSelectedNFT}
              handleShare={handleShare}
              handleLike={handleLike}
              contract={contract}
              web3={web3}
              nftUserList={nftUserList}
              getUserNfts={getUserNfts}
            />
          )}
        </>
      ) : (
        <Warning label={"CONNECT WALLET"} />
      )}
    </>
  );
}
