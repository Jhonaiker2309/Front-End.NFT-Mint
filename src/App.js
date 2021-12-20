import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import {ethers} from "ethers";
import myEpicNft from './utils/myEpicNFT.json';
import dotenv from "dotenv"

const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

dotenv.config();

const App = () => {
	const [currentAccount, setCurrentAccount] = useState("");

    const askContractToMintNft = async () => {
			
			try {
				const { ethereum } = window;

				if (ethereum) {
					const provider = new ethers.providers.Web3Provider(ethereum);
					const signer = provider.getSigner();
					const connectedContract = new ethers.Contract(
						process.env.REACT_APP_CONTRACT_ADRESS,
						myEpicNft.abi,
						signer,
					);

					console.log("Going to pop wallet now to pay gas...");
					let nftTxn = await connectedContract.makeAnEpicNFT();

					console.log("Mining...please wait.");
					await nftTxn.wait();
                    console.log(nftTxn);
					console.log(
						`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`,
					);
				} else {
					console.log("Ethereum object doesn't exist!");
				}
			} catch (error) {
				console.log(error);
			}
		};

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have metamask!");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}

			/*
			 * Fancy method to request access to account.
			 */
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			/*
			 * Boom! This should print out public address once we authorize Metamask.
			 */
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
            setupEventListener(); 
		} catch (error) {
			console.log(error);
		}
	};

      const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

	// Render Methods
	const renderNotConnectedContainer = () => (
		<button
			onClick={connectWallet}
			className="cta-button connect-wallet-button">
			Connect to Wallet
		</button>
	);

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	/*
	 * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
	 */
	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">My NFT Collection</p>
					<p className="sub-text">
						Each unique. Each beautiful. Discover your NFT today.
					</p>
					{currentAccount === "" ? (
						renderNotConnectedContainer()
					) : (
						<button
							onClick={askContractToMintNft}
							className="cta-button connect-wallet-button">
							Mint NFT
						</button>
					)}
				</div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer">{`built on @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
