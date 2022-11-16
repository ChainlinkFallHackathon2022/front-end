import { useEffect, useState } from "react";
import {
  Button,
  List,
  IconButton,
  Card,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Tabs,
  Tab,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import useMinter from "../../hooks/useMinter";
import useNFTStorage from "../../hooks/useNFTStorage";
import { btcMockAddress, ethMockAddress } from "../../utils/address";
import { Warning } from "../Warning";
import { SnackBar } from "../SnackBar";

const CreateBot = ({ account, contract, web3, switchNetwork, setList }) => {
  const [error, setError] = useState(false);
  const { image, setImage, input, setInput, state, tx, setTx, mintBot } =
    useMinter(account);

  useEffect(() => {
    const iconButton = document.querySelector("#icon");

    const addOpacity = () => {
      iconButton.style.opacity = "1";
    };

    const removeOpacity = () => {
      iconButton.style.opacity = "0";
    };

    if (image.file === "") {
      iconButton.style.opacity = "1";
      iconButton.removeEventListener("mouseover", addOpacity);
      iconButton.removeEventListener("mouseleave", removeOpacity);
    } else {
      iconButton.style.opacity = "0";
      iconButton.addEventListener("mouseover", addOpacity);
      iconButton.addEventListener("mouseleave", removeOpacity);
    }

    return () => {
      iconButton.removeEventListener("mouseover", addOpacity);
      iconButton.removeEventListener("mouseleave", removeOpacity);
    };
  }, [image]);

  const handleImage = () => {
    const file = document.querySelector("#input-photo").files[0];
    const preview = document.querySelector("#preview-photo");
    const reader = new FileReader();
    const imageObject = new Image();

    if (file) {
      reader.readAsDataURL(file);
      imageObject.src = URL.createObjectURL(file);
    }

    reader.addEventListener("load", () => {
      setImage({
        file: "loading",
        width: "",
        height: "",
      });
      preview.src = reader.result;
      preview.style.visibility = "visible";
    });

    imageObject.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imageObject.naturalWidth;
      canvas.height = imageObject.naturalHeight;
      canvas.getContext("2d").drawImage(imageObject, 0, 0);
      canvas.toBlob((blob) => {
        const webpImage = new File([blob], "nft-image.webp", {
          type: blob.type,
        });
        setImage({
          file: webpImage,
          width: Math.round(imageObject.naturalWidth),
          height: Math.round(imageObject.naturalHeight),
        });
      }, "image/webp");
    };
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (
      e.target.value.length < 11 ||
      e.target.name === "pair" ||
      e.target.name === "description" ||
      e.target.name === "buyPrice" ||
      e.target.name === "sellPrice"
    ) {
      setInput({
        ...input,
        [e.target.name]: e.target.value,
      });
    }
  };

  const verifyData = () => {
    if (!account) {
      setError({ field: false, account: true });
      return false;
    }

    const isConnected = switchNetwork();
    if (!isConnected) {
      return false;
    }

    if (
      image.file === "loading" ||
      image.file === "" ||
      input.name === "" ||
      input.description === "" ||
      input.pair === "" ||
      input.buyPrice === "" ||
      input.sellPrice === ""
    ) {
      setError({ field: true, account: false });
      return false;
    }

    mintBot(web3, account, contract, setList);
  };

  return (
    <>
      <Card
        sx={{
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <div className="container">
          <img id="preview-photo" src="" alt="Upload image" />
          <div id="icon">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              sx={{
                width: "100%",
                height: "150px",
                borderRadius: "0px",
              }}
            >
              <input
                onChange={handleImage}
                hidden
                id="input-photo"
                accept="image/*"
                type="file"
              />
              <PhotoCamera
                sx={{
                  color: "#ffffff",
                  fontSize: "32px",
                }}
              />
            </IconButton>
          </div>
        </div>
        <TextField
          onChange={handleChange}
          name="name"
          fullWidth
          id="input-name"
          label="Name"
          type="text"
          size="small"
          value={input.name}
        />
        <TextField
          onChange={handleChange}
          name="description"
          size="small"
          fullWidth
          id="input-description"
          label="Description"
          rows={1}
          maxRows={1}
          multiline
          value={input.description}
        />
        <FormControl size="small">
          <InputLabel id="select-pair-label">Pair</InputLabel>
          <Select
            onChange={handleChange}
            name="pair"
            labelId="select-pair-label"
            id="input-pair"
            autoWidth
            label="Pair"
          >
            <MenuItem value={btcMockAddress}>WBTC / USDC</MenuItem>
            <MenuItem value={ethMockAddress}>WETH / USDC</MenuItem>
          </Select>
        </FormControl>
        <TextField
          onChange={handleChange}
          name="buyPrice"
          fullWidth
          id="input-buy-price"
          label="Buy Price"
          type="number"
          size="small"
        />
        <TextField
          onChange={handleChange}
          name="sellPrice"
          fullWidth
          id="input-SELL-price"
          label="Sell Price"
          type="number"
          size="small"
        />
        <div>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            fullWidth
            type="submit"
            onClick={verifyData}
            disabled={state !== "MINT BOT AND NFT"}
          >
            {state}
          </Button>
        </div>
      </Card>
      {error && (
        <SnackBar
          open={error.field || error.account}
          setOpen={setError}
          label={
            (error.field && "Complete all fields") ||
            (error.account && "Connect wallet")
          }
          state={"error"}
          position={{ vertical: "bottom", horizontal: "left" }}
        />
      )}
      {tx && (
        <SnackBar
          open={tx}
          setOpen={setTx}
          label={
            <>
              <span>Successfully minted!</span>
              &nbsp;
              <Link
                underline="hover"
                href={`https://mumbai.polygonscan.com/address/${tx.events.RoleGranted[0].address}`}
                target="_blank"
                rel="noopener"
              >
                View Bot
              </Link>
              &nbsp;
              <Link
                underline="hover"
                href={`https://mumbai.polygonscan.com/token/${
                  tx.events[1].address
                }?a=${web3.quickNode.utils.hexToNumber(
                  tx.events[1].raw.topics[3]
                )}`}
                target="_blank"
                rel="noopener"
              >
                View NFT
              </Link>
            </>
          }
          state={"success"}
          position={{ vertical: "down", horizontal: "left" }}
        />
      )}
    </>
  );
};

const ListBot = ({ web3, contract, account, bot, setBot }) => {
  const { nftUserList, getUserNfts } = useNFTStorage();

  useEffect(() => {
    if (web3 && contract && web3)
      getUserNfts({ web3, contract, owner: account, setBot });
  }, [account]);

  return nftUserList ? (
    <List sx={{ padding: 0, marginTop: 1.9 }}>
      {nftUserList.map((nft, index) => {
        return (
          <div key={index}>
            <div
              className={`data-container ${
                nft.botAddress === bot.botAddress ? "selected" : ""
              }`}
              onClick={() => setBot(nft)}
            >
              <div className="nft-info">
                <img
                  className="nft-image"
                  src={`https://${nft.image}.ipfs.nftstorage.link/blob`}
                  alt="nft"
                />
                <h4>{nft.name}</h4>
              </div>

              <div className="bot-info">
                <div className="buy-sell">
                  {nft.pair === btcMockAddress && <h4>WBTC / USDC</h4>}
                  {nft.pair === ethMockAddress && <h4>WETH / USDC</h4>}
                </div>

                <div className="buy-sell">
                  <span className="green">{nft.buyPrice}</span>
                  <span>&nbsp;/&nbsp;</span>
                  <span className="red">{nft.sellPrice}</span>
                </div>
              </div>
            </div>
            <div className="divider-bot"></div>
          </div>
        );
      })}
    </List>
  ) : (
    <Warning label={"MINT BOT"} />
  );
};

export default function Bots({
  account,
  contract,
  web3,
  bot,
  setBot,
  switchNetwork,
}) {
  const [list, setList] = useState("bot");

  useEffect(() => {
    bot === false ? setList("mint") : setList("bot");
  }, [bot, account]);

  const handleChange = (event, value) => {
    setList(value);
  };

  return (
    <>
      {account && contract && web3 ? (
        <>
          <div className="bot-selector-trade">
            <Tabs
              sx={{ minWidth: "300px" }}
              onChange={handleChange}
              value={list}
              aria-label="Tabs where each tab needs to be selected manually"
            >
              <Tab sx={{ minWidth: "150px" }} label="BOTS" value="bot" />
              <Tab sx={{ minWidth: "150px" }} label="MINT" value="mint" />
            </Tabs>
          </div>

          {list === "mint" ? (
            <CreateBot
              account={account}
              contract={contract}
              web3={web3}
              switchNetwork={switchNetwork}
              setList={setList}
            />
          ) : (
            <ListBot
              web3={web3}
              contract={contract}
              account={account}
              bot={bot}
              setBot={setBot}
            />
          )}
        </>
      ) : (
        <Warning label={"CONNECT WALLET"} />
      )}
    </>
  );
}
