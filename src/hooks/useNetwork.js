export default function useNetwork() {
  const addNetwork = ({ chainId, name, rpc }) => {
    window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainId,
          chainName: chainId === "0x89" ? "POLYGON" : "BSC",
          rpcUrls: [
            chainId === "0x89"
              ? "https://polygon-rpc.com"
              : "https://bscrpc.com",
          ],
          nativeCurrency: {
            name: chainId === "0x89" ? "MATIC" : "BNB",
            symbol: chainId === "0x89" ? "MATIC" : "BNB",
            decimals: 18,
          },
        },
      ],
    });
  };

  const changeNetwork = ({ chainId, name, rpc }) => {
    window.ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      })
      .catch((err) => {
        if (err.code === 4902) {
          addNetwork({ chainId, name, rpc });
        }
      });
  };

  return { changeNetwork };
}
