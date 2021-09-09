import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from "@walletconnect/web3-provider";
import ERC20Abi from './abi/erc20.json';
import MigratorAbi from './abi/migrator.json';
import { MaxUint256 } from '@ethersproject/constants';
import { Octagon, RefreshCw } from 'react-feather';

const FLIP_ADDRESS = '0xb6505dEfE58759C09e0dF0739f8F5A6f32bffd44';
const RYNO_ADDRESS = '0xC59615DA2DA226613B1C78F0c6676CAC497910bC';
const MIGRATOR_ADDRESS = '0x759aF327C89BFCdc6f0DeBd08cb9b538C5107AD0';


const web3Modal = new Web3Modal({
  network: "poa-core",
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          99: 'https://core.poa.network'
        },
        chainId: 99,
        bridge: 'https://bridge.walletconnect.org',
        qrcode: true,
        pollingInterval: 15000
      }
    }
  }
});

function App() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [flipBalance, setFlipBalance] = useState(null);
  const [rynoBalance, setRynoBalance] = useState(null);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  function getFlipContract() {
    return new web3.eth.Contract(ERC20Abi, FLIP_ADDRESS);
  }

  function getRynoContract() {
    return new web3.eth.Contract(ERC20Abi, RYNO_ADDRESS);
  }

  function getMigratorContract() {
    return new web3.eth.Contract(MigratorAbi, MIGRATOR_ADDRESS)
  }

  async function handleConnect() {
    const provider = await web3Modal.connect();
    const web3 = new Web3(provider);

    setWeb3(web3);
    setAccount((await web3.eth.getAccounts())[0]);

    provider.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
      setFlipBalance(null);
    });

    provider.on("disconnect", (accounts) => {
      setAccount(null);
      setFlipBalance(null);
    });
  }

  async function handleApprove() {
    setLoading(true);
    try {
      await getFlipContract().methods.approve(MIGRATOR_ADDRESS, MaxUint256).send({ from: account, gas: 150000, gasPrice: 30000000000 });
    } catch(e) {}
    setLoading(false);
  }

  async function handleMigrate() {
    setLoading(true);
    try {
      const migrator = getMigratorContract();
      await migrator.methods.migrate(flipBalance).send({ from: account, gas: 150000, gasPrice: 30000000000 });
      await fetchBalances();
    } catch(e) {}
    setLoading(false);
  }

  async function fetchBalances() {
    const [flipBalance, rynoBalance] = await Promise.all([
      getFlipContract().methods.balanceOf(account).call(),
      getRynoContract().methods.balanceOf(account).call()
    ]);

    setFlipBalance(flipBalance);
    setRynoBalance(rynoBalance);
  }

  useEffect(async () => {
    if (!account) return;

    async function getData() {
      setLoading(true);
      await fetchBalances();
      const allowance = await getFlipContract().methods.allowance(account, MIGRATOR_ADDRESS).call();
      setLoading(false);

      setApproved(allowance === MaxUint256.toString());
    }

    getData();
  }, [account]);

  const buttonClass = `
    flex
    items-center
    justify-center
    text-white
    bg-red-600
    rounded-sm
    font-mono
    p-3
    transition
    hover:bg-red-700
  `;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-xs mx-auto">
          <h1 className="text-2xl font-bold mb-2 font-mono">FLIP → RYNO Migrator</h1>
          <p>
            Fliple is now re-branded and the new name, <u>Ryno</u>. 
            You can convert your old FLIP tokens to new RYNO tokens using this app.
          </p>

          <hr className="my-6" />

          {flipBalance !== null && rynoBalance !== null && (
            <div className="bg-gray-800 rounded p-4 mb-6">
              <p className="text-lg font-medium">Your Account</p>
              <p className="text-sm font-mono truncate">{account}</p>
              <hr className="my-4 border-gray-500 border-dashed" />
              <div className="font-mono">
                <p>{Number(web3.utils.fromWei(flipBalance, 'ether')).toLocaleString()} <b>FLIP</b></p>
                <p>{Number(web3.utils.fromWei(rynoBalance, 'ether')).toLocaleString()} <b>RYNO</b></p>
              </div>
            </div>
          )}
          {loading ? (
            <div>
              <RefreshCw className="animate-spin inline mr-2 w-5" />
            </div>
          ) : (
            account ? (
              approved ? (
                <a onClick={handleMigrate} className={buttonClass}>Convert FLIP to RYNO</a>
              ) : (
                <a onClick={handleApprove} className={buttonClass}>Approve FLIP</a>    
              )
            ) : (
              <a onClick={handleConnect} className={buttonClass}>Connect wallet</a>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
