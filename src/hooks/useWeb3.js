import { useEffect, useState } from "react";
import Web3 from "web3";
import GridBotFactoryAbi from "../abis/mumbai/GridBotFactory.json";
import NFTGridDataAbi from "../abis/mumbai/NFTGridData.json";
import UpKeepIDRegisterFactoryAbi from "../abis/mumbai/UpKeepIDRegisterFactory.json";
import SpotBotGridAbi from "../abis/mumbai/SpotBotGrid.json";
import ERC20StandardAbi from "../abis/mumbai/ERC20Standard.json";
import {
  GridBotFactoryAddress,
  NFTGridDataAddress,
  UpKeepIDRegisterFactoryAddress,
  usdcMockAddress,
  btcMockAddress,
  ethMockAddress,
} from "../utils/address";
import { mumbai, quickNodeRPC } from "../utils/network";
import useNetwork from "./useNetwork";

export default function useWeb3() {
  const [maticPrice, setMaticPrice] = useState(false);
  const [account, setAccount] = useState(false);
  const [network, setNetwork] = useState(false);
  const [balance, setBalance] = useState(0);
  const [bot, setBot] = useState(undefined);
  const [botContract, setBotContract] = useState(0);
  const [web3, setWeb3] = useState(false);
  const [contract, setContract] = useState(false);
  const { changeNetwork } = useNetwork();

  useEffect(() => {
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((account) => setAccount(account[0]))
      .catch((err) => console.error(err));

    window.ethereum
      .request({ method: "eth_chainId" })
      .then((chainId) => setNetwork(chainId))
      .catch((err) => console.error(err));

    window.ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
    });

    window.ethereum.on("chainChanged", (_chainId) => {
      setNetwork(_chainId);
    });

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", (accounts) => {
          setAccount(accounts);
        });

        window.ethereum.removeListener("chainChanged", (_chainId) => {
          setNetwork(_chainId);
        });
      }
    };
  }, []);

  useEffect(() => {
    connectProvider();
  }, [account, network]);

  const switchNetwork = () => {
    if (network !== mumbai.chainId) {
      changeNetwork(mumbai);
      return false;
    } else {
      return true;
    }
  };

  const connectProvider = () => {
    if (typeof window.ethereum === "undefined") {
      window.alert("Metamask not installed");
      return false;
    }

    if (!account && !network) return false;

    switchNetwork();

    const quickNode = new Web3(
      new Web3.providers.WebsocketProvider(quickNodeRPC.mumbai)
    );

    const metamask = new Web3(window.ethereum);
    setWeb3({ quickNode, metamask });

    const gridBotFactoryM = new metamask.eth.Contract(
      JSON.parse(GridBotFactoryAbi.result),
      GridBotFactoryAddress
    );

    const nftGridDataM = new metamask.eth.Contract(
      JSON.parse(NFTGridDataAbi.result),
      NFTGridDataAddress
    );

    const upKeepIDRegisterFactoryM = new metamask.eth.Contract(
      JSON.parse(UpKeepIDRegisterFactoryAbi.result),
      UpKeepIDRegisterFactoryAddress
    );

    const usdcMockM = new metamask.eth.Contract(
      ERC20StandardAbi,
      usdcMockAddress
    );

    const btcMockM = new metamask.eth.Contract(
      ERC20StandardAbi,
      btcMockAddress
    );

    const ethMockM = new metamask.eth.Contract(
      ERC20StandardAbi,
      ethMockAddress
    );

    const gridBotFactoryQ = new quickNode.eth.Contract(
      JSON.parse(GridBotFactoryAbi.result),
      GridBotFactoryAddress
    );

    const nftGridDataQ = new quickNode.eth.Contract(
      JSON.parse(NFTGridDataAbi.result),
      NFTGridDataAddress
    );

    const upKeepIDRegisterFactoryQ = new quickNode.eth.Contract(
      JSON.parse(UpKeepIDRegisterFactoryAbi.result),
      UpKeepIDRegisterFactoryAddress
    );

    const usdcMockQ = new quickNode.eth.Contract(
      ERC20StandardAbi,
      usdcMockAddress
    );

    const btcMockQ = new metamask.eth.Contract(
      ERC20StandardAbi,
      btcMockAddress
    );

    const ethMockQ = new metamask.eth.Contract(
      ERC20StandardAbi,
      ethMockAddress
    );

    setContract({
      metamask: {
        gridBotFactory: gridBotFactoryM,
        nftGridData: nftGridDataM,
        upKeepIDRegisterFactory: upKeepIDRegisterFactoryM,
        usdcMock: usdcMockM,
        btcMock: btcMockM,
        ethMock: ethMockM,
      },
      quickNode: {
        gridBotFactory: gridBotFactoryQ,
        nftGridData: nftGridDataQ,
        upKeepIDRegisterFactory: upKeepIDRegisterFactoryQ,
        usdcMock: usdcMockQ,
        btcMock: btcMockQ,
        ethMock: ethMockQ,
      },
    });
  };

  const truncateDecimals = function (number, digits) {
    var multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? "ceil" : "floor"](adjustedNum);

    return truncatedNum / multiplier;
  };

  useEffect(() => {
    if (bot) {
      readBotContract();
    }
  }, [bot]);

  const readBotContract = () => {
    const spotBotGridM = new web3.metamask.eth.Contract(
      SpotBotGridAbi.abi,
      bot.botAddress
    );
    const spotBotGridQ = new web3.quickNode.eth.Contract(
      SpotBotGridAbi.abi,
      bot.botAddress
    );
    setBotContract({
      metamask: { spotBotGrid: spotBotGridM },
      quickNode: { spotBotGrid: spotBotGridQ },
    });
  };

  const readBalance = async () => {
    const usdc = web3.quickNode.utils.fromWei(
      await contract.quickNode.usdcMock.methods.balanceOf(account).call(),
      "ether"
    );
    const native = web3.quickNode.utils.fromWei(
      await web3.metamask.eth.getBalance(account),
      "ether"
    );
    return { usdc, native };
  };

  useEffect(() => {
    const walletSignature = window.localStorage.getItem("signature");
    if (account && walletSignature === null && web3) {
      signMessage();
    }
  }, [account, web3]);

  const signMessage = () => {
    const message = "CHAINLINK HACKATHON 2022 | Welcome to grid bot";
    // const hash = web3.metamask.utils.sha3(message);
    web3.metamask.eth.personal.sign(message, account).then((signature) => {
      window.localStorage.setItem("signature", signature);
      window.location.reload();
    });
  };

  const connectWallet = (change) => {
    if (typeof window.ethereum === "undefined") {
      return false;
    }

    if (change) {
      setAccount(false);
      window.ethereum
        .request({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {},
            },
          ],
        })
        .then((account) => setAccount(account[0].caveats[0].value[0]));
    } else {
      window.ethereum
        .request({
          method: "eth_requestAccounts",
        })
        .then((accounts) => setAccount(accounts[0]));
    }
  };

  return {
    changeNetwork,
    connectWallet,
    readBalance,
    switchNetwork,
    setBot,
    bot,
    account,
    balance,
    web3,
    contract,
    maticPrice,
    botContract,
  };
}
