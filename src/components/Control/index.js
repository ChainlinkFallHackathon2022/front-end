import { useEffect, useState } from "react";
import { Warning } from "../Warning";
import { Button, Card, TextField, Slider, Link } from "@mui/material";
import { SnackBar } from "../SnackBar";
import { Loader } from "../Loader";
import { btcMockAddress, ethMockAddress } from "../../utils/address";

export default function Control({
  account,
  contract,
  web3,
  bot,
  botContract,
  readBalance,
  switchNetwork,
}) {
  const [state, setState] = useState(false);
  const [error, setError] = useState(false);
  const [tx, setTx] = useState(false);
  const [data, setData] = useState(false);
  const [addBalance, setAddBalance] = useState(0);
  const [withdraw, setWithdraw] = useState(false);
  const [deposit, setDeposit] = useState({ approve: false, deposit: false });

  useEffect(() => {
    if (bot && botContract && web3 && account) {
      getBotData();
    } else {
      setData(false);
    }
  }, [bot, botContract, web3, state, account]);

  const truncateDecimals = function (number, digits) {
    var multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? "ceil" : "floor"](adjustedNum);

    return truncatedNum / multiplier;
  };

  const getBotData = async () => {
    setData(false);

    const usdcBalance = truncateDecimals(
      parseFloat(
        web3.quickNode.utils.fromWei(
          await botContract.quickNode.spotBotGrid.methods
            .getBalanceStable()
            .call(),
          "ether"
        )
      ),
      4
    );
    const pairBalance = truncateDecimals(
      parseFloat(
        web3.quickNode.utils.fromWei(
          await botContract.quickNode.spotBotGrid.methods
            .getBalanceTradeableToken()
            .call(),
          "ether"
        )
      ),
      4
    );

    const walletBalance = await readBalance();
    const allowance = await contract.quickNode.usdcMock.methods
      .allowance(account, bot.botAddress)
      .call();

    setData({
      bot: { usdc: usdcBalance, pair: pairBalance },
      walletBalance,
      allowance,
    });
  };

  const approveBalance = () => {
    if (!account) {
      setError({ field: false, account: true });
      return false;
    }

    const isConnected = switchNetwork();
    if (!isConnected) {
      return false;
    }

    setDeposit({ deposit: false, approve: true });
    contract.metamask.usdcMock.methods
      .approve(
        bot.botAddress,
        web3.quickNode.utils.toWei(
          "100000000000000000000000000000000000000000000000000000000000",
          "ether"
        )
      )
      .send({
        from: account,
        // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
        // gasLimit: 500000,
      })
      .on("receipt", (receipt) => {
        setDeposit({ deposit: false, approve: false });
        setTx({ approve: receipt });
        setState(!state);
      })
      .on("error", (err, receipt) => {
        setDeposit({ deposit: false, approve: false });
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

  const depositBalance = () => {
    if (!account) {
      setError({ field: false, account: true });
      return false;
    }

    const isConnected = switchNetwork();
    if (!isConnected) {
      return false;
    }

    if (
      addBalance <= 0 ||
      addBalance > data.walletBalance.usdc ||
      isNaN(parseFloat(addBalance))
    ) {
      setError({ field: true, account: false });
      return false;
    }

    setDeposit({ deposit: true, approve: false });
    contract.metamask.usdcMock.methods
      .transfer(
        bot.botAddress,
        web3.quickNode.utils.toWei(addBalance.toString(), "ether")
      )
      .send({
        from: account,
        // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
        // gasLimit: 500000,
      })
      .on("receipt", (receipt) => {
        setDeposit({ deposit: false, approve: false });
        setTx({ deposit: receipt });
        setAddBalance(0);
        setState(!state);
      })
      .on("error", (err, receipt) => {
        setDeposit({ deposit: false, approve: false });
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

  const withdrawBalance = () => {
    if (!account) {
      setError({ field: false, account: true });
      return false;
    }

    const isConnected = switchNetwork();
    if (!isConnected) {
      return false;
    }

    if (data.bot.usdc <= 0 && data.bot.pair <= 0) {
      setError({ field: true, account: false });
      return false;
    }

    setWithdraw(true);
    botContract.metamask.spotBotGrid.methods
      .withdraw()
      .send({
        from: account,
        // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
        // gasLimit: 500000,
      })
      .on("receipt", (receipt) => {
        setWithdraw(false);
        setTx({ withdraw: receipt });
        setState(!state);
      })
      .on("error", (err, receipt) => {
        setWithdraw(false);
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

  const handleChange = (e) => {
    e.preventDefault();
    setAddBalance(parseFloat(e.target.value));
  };

  const handleChangeSlider = (e, value) => {
    e.preventDefault();
    setAddBalance((parseFloat(data.walletBalance.usdc) * value) / 100);
  };

  const getAriaValueText = (value) => {
    return `${value}%`;
  };

  return (
    <>
      {account && contract && web3 ? (
        <>
          {data && (
            <Card
              sx={{
                padding: "15px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <h3>{bot.name}</h3>
              <img
                className="nft-profile-image"
                src={`https://${bot.image}.ipfs.nftstorage.link/blob`}
                alt="nft"
              />
              &nbsp;
              <h4>Grid Bot</h4>
              <div className="balance">
                <span>State: </span>
                <span
                  className={data.bot.usdc > 0 ? "bold orange" : "bold red"}
                >
                  {data.bot.usdc > 0 ? "RUNNING" : "STOPPED"}
                </span>
              </div>
              {/* <div className="balance">
                <span>Gas:</span>
                <span className="bold">{data.bot.pair} LINK</span>
              </div> */}
              {/* <div className="divider-control"></div> */}
              <div className="balance">
                <span>Available balance:</span>
                <span className="bold">{data.bot.usdc} USDC</span>
              </div>
              <div className="balance">
                <span>Purchased balance:</span>
                <span className="bold">
                  {data.bot.pair} {bot.pair === btcMockAddress && "WBTC"}
                  {bot.pair === ethMockAddress && "WBTC"}
                </span>
              </div>
              <Button
                variant="contained"
                color="warning"
                disableElevation
                fullWidth
                onClick={withdrawBalance}
                disabled={
                  (data.bot.usdc <= 0 && data.bot.pair <= 0) || withdraw
                }
              >
                {withdraw ? "WITHDRAWING..." : "WITHDRAW ALL"}
              </Button>
              &nbsp;
              <h4>Wallet</h4>
              <TextField
                onChange={handleChange}
                name="addBalance"
                fullWidth
                id="input-add-balance"
                label="Add Balance"
                type="number"
                size="small"
                value={addBalance}
                InputProps={{
                  endAdornment: "USDC",
                }}
              ></TextField>
              <Slider
                aria-label="%"
                onChange={handleChangeSlider}
                defaultValue={0}
                getAriaValueText={getAriaValueText}
                valueLabelDisplay="auto"
                step={20}
                marks
                min={0}
                max={100}
              />
              <div className="balance">
                <span>Available balance:</span>
                <span className="bold">{data.walletBalance.usdc} USDC</span>
              </div>
              <Button
                disabled={deposit.approve || deposit.deposit}
                variant="contained"
                color="primary"
                disableElevation
                fullWidth
                onClick={
                  data.allowance === "0" ? approveBalance : depositBalance
                }
              >
                {!deposit.deposit && !deposit.approve && (
                  <>{data.allowance === "0" ? "APPROVE" : "DEPOSIT"}</>
                )}
                {deposit.approve && "APPROVING..."}
                {deposit.deposit && "DEPOSITING..."}
              </Button>
              {error && (
                <SnackBar
                  open={error.field || error.account}
                  setOpen={setError}
                  label={
                    (error.field && "Insufficient balance") ||
                    (error.account && "Connect wallet")
                  }
                  state={"error"}
                  position={{ vertical: "bottom", horizontal: "right" }}
                />
              )}
              {tx && (
                <SnackBar
                  open={tx}
                  setOpen={setTx}
                  label={
                    <>
                      {tx.approve && <span>Successfully approved!</span>}
                      {tx.deposit && <span>Successfully deposited!</span>}
                      {tx.withdraw && <span>Successfully withdrawn!</span>}
                      &nbsp;
                      <Link
                        underline="hover"
                        href={`https://mumbai.polygonscan.com/tx/${
                          (tx.approve && tx.approve.transactionHash) ||
                          (tx.deposit && tx.deposit.transactionHash) ||
                          (tx.withdraw && tx.withdraw.transactionHash)
                        }`}
                        target="_blank"
                        rel="noopener"
                      >
                        View TX
                      </Link>
                    </>
                  }
                  state={"success"}
                  position={{ vertical: "bottom", horizontal: "right" }}
                />
              )}
            </Card>
          )}
        </>
      ) : (
        <Warning label={"CONNECT WALLET"} />
      )}

      {bot && !data && <Loader />}
      {!bot && account && <Warning label={"MINT BOT"} />}
    </>
  );
}
