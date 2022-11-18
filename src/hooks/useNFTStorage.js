import { useState } from "react";
import { createSigner } from "fast-jwt";

export default function useNFTStorage(account, contract) {
  const [nftUserList, setNftUserList] = useState(false);
  const [nftGlobalList, setNftGlobalList] = useState([]);
  const [indexGlobalList, setIndexGlobalList] = useState(false);

  const generateAccessToken = (account) => {
    const walletSignature = window.localStorage.getItem("signature");
    if (walletSignature !== null) {
      const sign = createSigner({ key: process.env.REACT_APP_TOKEN_SECRET });
      const tokenSign = sign({ signature: walletSignature });
      return tokenSign;
    } else {
      return false;
    }
  };

  const getCidUrl = (uri) => {
    return /^(\w+):\/\/([^\/]+)([^]+)$/.exec(uri);
  };

  const randomPosition = (max) => {
    const number = Math.floor(Math.random() * max);
    let className = "content";
    if (number === 1) {
      className = "content horizontal";
    }
    if (number === 2) {
      className = "content vertical";
    }
    return className;
  };

  const handleLike = ({ NFT }) => {
    const jwt = generateAccessToken();
    if (!jwt) {
      return false;
    }

    const write = `${process.env.REACT_APP_API_URL}/api/v1/nft/create?wallet=${account}`;
    const read = `${process.env.REACT_APP_API_URL}/api/v1/nft/metadata`;

    fetch(`${write}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cid: NFT.cid,
      }),
    }).then(() => {
      Promise.all(
        nftUserList.map((bot) => {
          const {
            owner,
            botAddress,
            id,
            buyPrice,
            sellPrice,
            pair,
            balance,
            cid,
            name,
            description,
            image,
          } = bot;

          return fetch(`${read}/${cid}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
          }).then((res) => {
            return res.json().then((metadata) => {
              const { value, wallets } = metadata.likes;
              const isWallet = wallets.find((wallet) => wallet === account);
              return {
                // GRID DATA
                owner,
                botAddress,
                id,
                buyPrice,
                sellPrice,
                pair,
                balance,
                // NFT DATA
                cid,
                name,
                description,
                image,
                likes: value,
                isWallet: isWallet !== undefined ? true : false,
              };
            });
          });
        })
      ).then((updatedData) => {
        setNftUserList(updatedData);
      });
    });
  };

  const getUserNfts = ({ contract, setBot = false, owner, web3 }) => {
    const jwt = generateAccessToken();
    if (!jwt) {
      return false;
    }

    const api = `${process.env.REACT_APP_API_URL}/api/v1/nft/metadata`;

    contract.quickNode.gridBotFactory.methods
      .getTotalNumberOfGrid(owner)
      .call()
      .then((amount) => {
        if (amount === "0") {
          setBot && setBot(false);
          return false;
        }
        const bots = Array.apply(null, Array(parseInt(amount)));
        Promise.all(
          bots.map((noData, index) => {
            return contract.quickNode.gridBotFactory.methods
              .getGridDataPerUser(owner, index)
              .call()
              .then((gridData) => {
                return contract.quickNode.nftGridData.methods
                  .tokenURI(gridData.nftID)
                  .call()
                  .then((uri) => {
                    const metadataCid = getCidUrl(uri);
                    return fetch(`${api}/${metadataCid[2]}`, {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${jwt}`,
                        "Content-Type": "application/json",
                      },
                    })
                      .then((res) => {
                        return res.json().then((metadata) => {
                          if (!metadata || !metadata.likes) return false;
                          return contract.quickNode.usdcMock.methods
                            .balanceOf(gridData[0])
                            .call()
                            .then((balance) => {
                              const imageCid = getCidUrl(metadata.image);
                              const { value, wallets } = metadata.likes;
                              const isWallet = wallets.find(
                                (wallet) => wallet === account
                              );

                              return {
                                // GRID DATA
                                owner: owner,
                                botAddress: gridData[0],
                                id: gridData.nftID,
                                buyPrice:
                                  parseInt(gridData.buyPrice) / 100000000,
                                sellPrice:
                                  parseInt(gridData.sellPrice) / 100000000,
                                pair: gridData[4],
                                balance: parseFloat(
                                  web3.quickNode.utils.fromWei(balance, "ether")
                                ),
                                // NFT DATA
                                cid: metadataCid[2],
                                name: metadata.name,
                                description: metadata.description,
                                image: imageCid[2],
                                likes: value,
                                isWallet: isWallet !== undefined ? true : false,
                              };
                            });
                        });
                      })
                      .catch((err) => {
                        console.error(err);
                        return false;
                      });
                  });
              });
          })
        )
          .then((data) => {
            const filter = data.filter(Boolean);
            setBot && setBot(filter.length === 0 ? false : filter[0]);
            setNftUserList(filter.length === 0 ? false : filter);
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  const getGlobalNfts = () => {
    if (!account || !contract) return false;

    contract.quickNode.gridBotFactory.methods
      .totalGrids()
      .call()
      .then((amount) => {
        const gridsIds = Array.apply(null, Array(parseInt(amount)));
        setIndexGlobalList(gridsIds);
      });
  };

  const readLimitNFT = ({ from, to, actualData }) => {
    const jwt = generateAccessToken();

    if (!jwt || !account || !contract) return false;

    const api = `${process.env.REACT_APP_API_URL}/api/v1/nft/metadata`;

    Promise.all(
      indexGlobalList.slice(from, to).map((noData, index) => {
        return contract.quickNode.gridBotFactory.methods
          .listOfAllGrid(index)
          .call()
          .then((gridAddress) => {
            return contract.quickNode.gridBotFactory.methods
              .getDataPerGrid(gridAddress)
              .call()
              .then((gridInfo) => {
                return contract.quickNode.gridBotFactory.methods
                  .getGridDataPerUser(gridInfo[0], gridInfo[1])
                  .call()
                  .then((gridData) => {
                    return contract.quickNode.nftGridData.methods
                      .tokenURI(gridData.nftID)
                      .call()
                      .then((uri) => {
                        if (uri === "asd") return false;
                        const metadataCid = getCidUrl(uri);
                        return fetch(`${api}/${metadataCid[2]}`, {
                          method: "GET",
                          headers: {
                            Authorization: `Bearer ${jwt}`,
                            "Content-Type": "application/json",
                          },
                        }).then((res) => {
                          return res.json().then((metadata) => {
                            if (!metadata || !metadata.likes) return false;
                            const position = randomPosition(3);
                            const imageCid = getCidUrl(metadata.image);
                            const { value, wallets } = metadata.likes;
                            const isWallet = wallets.find(
                              (wallet) => wallet === account
                            );
                            return {
                              position,
                              // GRID DATA
                              owner: gridInfo[0].toLowerCase(),
                              botAddress: gridData[0],
                              id: gridData.nftID,
                              buyPrice: gridData.buyPrice,
                              sellPrice: gridData.sellPrice,
                              pair: gridData[4],
                              //NFT DATA
                              cid: metadataCid[2],
                              name: metadata.name,
                              description: metadata.description,
                              image: imageCid[2],
                              likes: value,
                              isWallet: isWallet !== undefined ? true : false,
                            };
                          });
                        });
                      })
                      .catch((err) => console.error(err));
                  })
                  .catch((err) => console.error(err));
              });
          })
          .catch((err) => console.error(err));
      })
    )
      .then((nfts) => {
        setNftGlobalList([...actualData, ...nfts]);
      })
      .catch((err) => console.error(err));
  };

  return {
    nftUserList,
    nftGlobalList,
    indexGlobalList,
    getUserNfts,
    getGlobalNfts,
    readLimitNFT,
    randomPosition,
    handleLike,
  };
}
