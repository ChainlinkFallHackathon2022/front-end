import { useState, useEffect } from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Warning } from "../Warning";
import {
  btcMockAddress,
  ethMockAddress,
  usdcMockAddress,
} from "../../utils/address";

const columns = [
  {
    id: "pair",
    label: "Pair",
    minWidth: 50,
    align: "left",
  },
  {
    id: "swap",
    label: "Swap",
    minWidth: 50,
    align: "left",
    format: (value) => (
      <span className={value === "BUY" ? "green" : "red"}>{value}</span>
    ),
  },
  {
    id: "amount",
    label: "Amount",
    minWidth: 50,
    align: "left",
    // format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "entry",
    label: "Entry Price",
    minWidth: 50,
    align: "left",
    // format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "exit",
    label: "Exit Price",
    minWidth: 50,
    align: "left",
    // format: (value) => value.toFixed(2),
  },
  {
    id: "time",
    label: "Time",
    minWidth: 50,
    align: "left",
  },
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // "&:nth-of-type(odd)": {
  //   backgroundColor: "#2e7e009f",
  // },
  // "&:nth-of-type(even)": {
  //   backgroundColor: "#7700009f",
  // },
  "&:hover": {
    cursor: "pointer",
    backgroundColor: "#9e9e9e5b",
  },
  "td, th": {
    border: 0,
  },
}));

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

export default function Transactions({
  account,
  contract,
  web3,
  bot,
  botContract,
}) {
  const [events, setEvents] = useState(false);

  const rows =
    events &&
    events.reverse().map((event) => {
      const usdc = event.values.tokenOut === usdcMockAddress ? "USDC" : "";
      const wbtc = event.values.tokenIn === btcMockAddress ? "WBTC" : "";
      const weth = event.values.tokenIn === ethMockAddress ? "WETH" : "";

      return {
        pair: `${wbtc}${weth} / ${usdc}`,
        swap: event.event,
        amount: event.values.balance ? event.values.balance : "",
        entry: bot.buyPrice,
        exit: bot.sellPrice,
        closed: +10,
        time: timeAgo.format(new Date(event.time * 1000)),
        txHash: event.txHash,
      };
    });

  useEffect(() => {
    if (botContract) {
      readBotEvents();
    }
  }, [botContract]);

  const readBotEvents = async () => {
    const actualBlock = await web3.quickNode.eth.getBlockNumber();
    const actualTime = Math.floor(Date.now() / 1000);

    botContract.quickNode.spotBotGrid
      .getPastEvents("allEvents", {
        filter: {},

        fromBlock: actualBlock - 9999,
        toBlock: "latest",
      })
      .then(function (events) {
        const values = events.map((data) => {
          if (data.event !== "BUY" && data.event !== "SELL") {
            return false;
          }
          const secondsAgo = (actualBlock - parseInt(data.blockNumber)) * 2;
          const time = actualTime - secondsAgo;

          return {
            event: data.event,
            values: data.returnValues,
            blockNumber: data.blockNumber,
            txHash: data.transactionHash,
            time,
          };
        });

        const filter = values.filter(Boolean);
        setEvents(filter);
      });
  };

  return (
    <>
      {account && contract && web3 ? (
        <>
          {bot && rows ? (
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column, index) => (
                    <StyledTableCell
                      key={index}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(12).map((row, index) => {
                  return (
                    <StyledTableRow key={index}>
                      {columns.map((column, index) => {
                        const value = row[column.id];
                        return (
                          <StyledTableCell
                            onClick={() =>
                              window.open(
                                `https://mumbai.polygonscan.com/tx/${row.txHash}`
                              )
                            }
                            key={index}
                            align={column.align}
                          >
                            {column.format ? column.format(value) : value}
                          </StyledTableCell>
                        );
                      })}
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Warning label={"MINT BOT"} />
          )}
        </>
      ) : (
        <Warning label={"CONNECT WALLET"} />
      )}
    </>
  );
}
