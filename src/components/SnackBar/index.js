import { Snackbar, Alert, Slide } from "@mui/material";

export const SnackBar = ({ open, setOpen, label, state, position }) => {
  return (
    <Snackbar anchorOrigin={position} open={open} autoHideDuration={10000}>
      <Slide direction="right">
        <Alert
          onClose={() => setOpen(false)}
          severity={state}
          sx={{ width: "100%" }}
        >
          {label}
        </Alert>
      </Slide>
    </Snackbar>
  );
};
