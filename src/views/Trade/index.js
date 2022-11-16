import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import Bots from "../../components/Bots";
import Chart from "../../components/Chart";
import Control from "../../components/Control";
import Transactions from "../../components/Transactions";
import useWeb3 from "../../hooks/useWeb3";
import "./index.css";

export default function Trade() {
  const {
    account,
    contract,
    web3,
    bot,
    botContract,
    setBot,
    readBalance,
    connectWallet,
    switchNetwork,
  } = useWeb3();

  useEffect(() => {
    setBot(undefined);
  }, [account]);

  return (
    <div className="trade-grid-container">
      <header className="header">
        <NavBar account={account} connectWallet={connectWallet} />
      </header>
      <nav className="bots">
        <Bots
          account={account}
          contract={contract}
          web3={web3}
          bot={bot}
          setBot={setBot}
          switchNetwork={switchNetwork}
        />
      </nav>
      <section className="chart">
        <Chart bot={bot} />
      </section>
      <article className="transactions">
        <Transactions
          account={account}
          contract={contract}
          web3={web3}
          bot={bot}
          botContract={botContract}
        />
      </article>
      <aside className="control">
        <Control
          account={account}
          contract={contract}
          web3={web3}
          bot={bot}
          botContract={botContract}
          readBalance={readBalance}
          switchNetwork={switchNetwork}
        />
      </aside>
    </div>
  );
}
