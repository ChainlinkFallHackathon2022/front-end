import { AdvancedChart } from "react-tradingview-embed";
import { btcMockAddress, ethMockAddress } from "../../utils/address";

export default function Chart({ bot }) {
  return (
    <>
      <AdvancedChart
        widgetProps={{
          width: "100%",
          height: "100%",
          // autosize: true,
          symbol: bot
            ? (bot.pair === btcMockAddress && "UNISWAP3POLYGON:WBTCUSDC") ||
              (bot.pair === ethMockAddress && "UNISWAP3POLYGON:WETHUSDC")
            : "UNISWAP3POLYGON:WBTCUSDC",
          interval: "1H",
          range: "1D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: "uniswap-v3-pair",
        }}
      />
    </>
  );
}
