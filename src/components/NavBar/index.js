import { Button, Chip, Tabs, Tab } from "@mui/material";
import {
  FiberManualRecordRounded,
  ExitToAppRounded,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useLocation } from "react-router-dom";

export default function NavBar({ account, connectWallet }) {
  let location = useLocation();
  let navigate = useNavigate();
  const resolution = useMediaQuery("(min-width:600px)");

  const handleChange = (event, value) => {
    navigate(value);
  };

  return (
    <>
      <div>
        <h2>GRID BOT</h2>
      </div>

      <div>
        <Tabs
          onChange={handleChange}
          value={location.pathname}
          aria-label="Tabs where each tab needs to be selected manually"
        >
          <Tab label="BOT" value="/bot" />
          <Tab label="NFT" value="/nft" />
        </Tabs>
      </div>

      <div>
        {account ? (
          <Chip
            deleteIcon={<FiberManualRecordRounded />}
            label={
              <div id="account">
                <FiberManualRecordRounded
                  sx={{
                    fontSize: "14px",
                    color: "#00ff00",
                  }}
                />

                <span>
                  {account.substring(0, 5) + "..." + account.substring(38, 42)}
                </span>

                <ExitToAppRounded
                  onClick={() => connectWallet({ change: true })}
                  sx={{
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "#ff0000",
                  }}
                />
              </div>
            }
          />
        ) : (
          <Button
            onClick={() => connectWallet()}
            variant="contained"
            disableElevation
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </>
  );
}
