import { useState } from "react";
import { createSigner } from "fast-jwt";
import { BigNumber } from "bignumber.js";

export default function useMinter() {
  const [image, setImage] = useState({ file: "", width: "", height: "" });
  const [input, setInput] = useState({
    name: "",
    description: "",
    pair: "",
    buyPrice: "",
    sellPrice: "",
  });
  const [state, setState] = useState("MINT BOT AND NFT");
  const [tx, setTx] = useState(false);

  const generateAccessToken = () => {
    const walletSignature = window.localStorage.getItem("signature");
    if (walletSignature !== undefined) {
      const sign = createSigner({ key: process.env.REACT_APP_TOKEN_SECRET });
      const tokenSign = sign({ signature: walletSignature });
      return tokenSign;
    } else {
      return false;
    }
  };

  const calculateDimensions = () => {
    const { width, height } = image;

    let dimensions;
    const defaultDimension = 1000;
    if (width >= defaultDimension) {
      dimensions = {
        width: defaultDimension,
        height: Math.round((height * defaultDimension) / width),
      };
    } else {
      if (height >= defaultDimension) {
        dimensions = {
          width: Math.round((width * defaultDimension) / height),
          height: defaultDimension,
        };
      } else {
        dimensions = {
          width: width,
          height: height,
        };
      }
    }
    return dimensions;
  };

  // const resizeImage = (account) => {
  //   const jwt = generateAccessToken();
  //   if (!jwt) {
  //     return false;
  //   }

  //   const converter = `${process.env.REACT_APP_API_URL}/api/v1/converter/image?wallet=${account}`;
  //   const dimensions = calculateDimensions();
  //   const { file } = image;

  //   const formData = new FormData();
  //   formData.append("image", file, file.name);
  //   formData.append("dimensions", dimensions);

  //   return fetch(converter, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${jwt}`,
  //     },
  //     body: formData,
  //   }).then((res) => {
  //     return res.json().then((data) => {
  //       return data;
  //     });
  //   });
  // };

  const uploadMetadataNFT = () => {
    const jwt = generateAccessToken();
    if (!jwt) {
      return false;
    }
    const upload = `${process.env.REACT_APP_API_URL}/api/v1/nft/upload`;
    const { file } = image;
    const { width, height } = calculateDimensions();
    const { name, description } = input;
    const formData = new FormData();
    formData.append("image", file, file.name);
    formData.append(
      "data",
      JSON.stringify({ width, height, name, description })
    );

    return fetch(upload, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    }).then((res) => {
      return res.json().then((tokenUri) => {
        return tokenUri;
      });
    });
  };

  const createDbDoc = (tokenUri, account) => {
    const jwt = generateAccessToken();
    if (!jwt) {
      return false;
    }

    const write = `${process.env.REACT_APP_API_URL}/api/v1/nft/create?wallet=${account}`;

    return fetch(write, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cid: tokenUri.ipnft,
      }),
    })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  };

  const sendTransaction = (web3, account, contract, tokenUri, setList) => {
    const buyConvert = new BigNumber(parseInt(input.buyPrice) * 100000000);
    const buyPrice = web3.quickNode.utils.toBN(buyConvert).toString();

    const sellConvert = new BigNumber(parseInt(input.sellPrice) * 100000000);
    const sellPrice = web3.quickNode.utils.toBN(sellConvert).toString();

    contract.metamask.gridBotFactory.methods
      .factoryNewGrid(
        input.name,
        tokenUri.url,
        input.pair,
        buyPrice,
        sellPrice,
        account
      )
      .send({
        from: account,
        value: web3.quickNode.utils.toWei("0.02", "ether"),
        // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
        // gasLimit: 500000,
      })
      .on("receipt", (receipt) => {
        const preview = document.querySelector("#preview-photo");
        preview.src = "reader.result";
        preview.style.visibility = "hidden";
        setImage("");
        setInput({
          name: "",
          description: "",
          pair: "",
          buyPrice: "",
          sellPrice: "",
        });
        setState("MINT BOT AND NFT");
        setTx(receipt);
        setList("list");
      })
      .on("error", (err, receipt) => {
        setList("list");
        if (err.code === -32603) {
          console.error("This transaction needs more gas to be executed");
          return false;
        }
        if (err.code === 4001) {
          console.error("Denied transaction signature");
          return false;
        }
        if (!err.code) {
          console.error("Transaction reverted");
          return false;
        }
      });
  };

  const mintBot = (web3, account, contract, setList) => {
    setState("UPLOADING...");
    uploadMetadataNFT()
      .then((tokenUri) => {
        setState("MINTING...");
        createDbDoc(tokenUri, account);
        sendTransaction(web3, account, contract, tokenUri, setList);
      })
      .catch((error) => console.error(error));
  };

  return {
    image,
    setImage,
    input,
    setInput,
    state,
    tx,
    setTx,
    mintBot,
  };
}
