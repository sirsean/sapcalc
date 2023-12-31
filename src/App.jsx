import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal, Web3Button } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig, useAccount, useContractRead } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { createPublicClient, http } from 'viem';
import { normalize } from 'viem/ens';
import { useState } from 'react';
import DrifterABI from '../abi/DrifterABI.js';
import LootCardABI from '../abi/LootCardABI.js';
import SapCanABI from '../abi/SapCanABI.js';
import { LootCardBalance, LOOT_CARDS, sumSapMax, sumSapSafe } from './loot_cards.js'
import { SHIPS } from './ships.js';
import { useStore } from './store';
import './App.css';

const chains = [mainnet]
const projectId = '1e7bdc454bbc86a76b3a0477cacf9999'

const DRIFTER_ADDRESS = '0xe3B399AAb015D2C0D787ECAd40410D88f4f4cA50';
const LOOT_CARD_ADDRESS = '0x39F8166484486c3b72C5c58c468A016D036E1a02';
const SAP_CAN_ADDRESS = '0xbB27281Ce6A780A5bD99253f37D1b2eA18b4d578';

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

function LootCardView({ lootCard }) {
  const { address } = useAccount();
  const [ state, dispatch ] = useStore();
  const [ balance, setBalance ] = useState(null);
  useContractRead({
    address: LOOT_CARD_ADDRESS,
    abi: LootCardABI,
    functionName: 'balanceOf',
    args: [state.addressOverride || address, lootCard.tokenId],
    onSuccess(data) {
      const lootCardBalance = new LootCardBalance(lootCard, data);
      setBalance(lootCardBalance);
      dispatch('SET_LOOT_CARD_BALANCE', lootCardBalance);
    },
  })
  const href = `https://opensea.io/assets/ethereum/${LOOT_CARD_ADDRESS}/${balance?.tokenId}`;
  return (
    <tr>
      <td><a target="_blank" href={href}>{lootCard.name}</a></td>
      <td>{balance?.balance.toString()}</td>
      <td>{balance?.sapMax.toString()}</td>
      <td>{balance?.sapSafe.toString()}</td>
    </tr>
  )
}

function calculateSap(state) {
  const lootCardSapMax = sumSapMax(Object.values(state.lootCardBalances));
  const lootCardSapSafe = sumSapSafe(Object.values(state.lootCardBalances));
  return {
    lootCardSapMax,
    lootCardSapSafe,
    maxSap: lootCardSapMax,
    safeSap: lootCardSapSafe,
  }
}

function LootCards() {
  const [ state, _ ] = useStore();
  const { lootCardSapMax, lootCardSapSafe } = calculateSap(state);
  return (
    <div className="box">
      <h2>Loot Cards</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Balance</th>
            <th>Max SAP</th>
            <th>Safe SAP</th>
          </tr>
        </thead>
        <tbody>
          {LOOT_CARDS.map(lc => <LootCardView key={lc.tokenId} lootCard={lc} />)}
          <tr>
            <td><em>Total</em></td>
            <td></td>
            <td>{lootCardSapMax.toString()}</td>
            <td>{lootCardSapSafe.toString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Totals() {
  const { address } = useAccount();
  const [ state, _ ] = useStore();
  const { maxSap, safeSap } = calculateSap(state);
  const [ sapBalance, setSapBalance ] = useState(null);
  useContractRead({
    address: SAP_CAN_ADDRESS,
    abi: SapCanABI,
    functionName: 'balanceOf',
    args: [state.addressOverride || address, 1],
    onSuccess(data) {
      setSapBalance(data);
    },
  })
  return (
    <div className="box">
      <h2>Totals</h2>
      <table>
        <tbody>
          <tr>
            <th>Current SAP Cans</th>
            <td>{(sapBalance || 0).toString()}</td>
          </tr>
          <tr>
            <th>Max SAP Cans</th>
            <td>{maxSap.toString()}</td>
          </tr>
          <tr>
            <th>Safe SAP Cans</th>
            <td>{safeSap.toString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Ships() {
  const [ state, _ ] = useStore();
  const { maxSap, safeSap } = calculateSap(state);
  const allShips = SHIPS.filter(({ cost }) => cost <= maxSap);
  const safeShipNames = new Set(SHIPS.filter(({ cost }) => cost <= safeSap).map(s => s.name));
  return (
    <div className="box">
      <h2>Ships</h2>
      <table>
        <thead>
          <tr>
            <th>Ship</th>
            <th>Cost</th>
            <th>Safe?</th>
          </tr>
        </thead>
        <tbody>
          {allShips.map(s => <tr key={s.name}><td>{s.name}</td><td>{s.cost}</td><td>{safeShipNames.has(s.name) ? "✔️" : ""}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

function isAddress(address) {
  // Check if the string is a valid Ethereum address
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

function isENSName(name) {
  // Check if the string is a valid ENS name
  return /^[a-z0-9\.]{1,63}$/.test(name);
}

function AddressForm() {
  const [ _, dispatch ] = useStore();
  const onSubmit = async (e) => {
    e.preventDefault();
    const value = e.target.children.address.value;
    if (isAddress(value)) {
      dispatch('SET_ADDRESS_OVERRIDE', value);
    } else if (isENSName(value)) {
      const addr = await ensClient.getEnsAddress({
        name: normalize(value),
      })
      dispatch('SET_ADDRESS_OVERRIDE', addr);
    } else {
      dispatch('SET_ADDRESS_OVERRIDE', null);
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <input type="text" name="address" placeholder="Search..." />
    </form>
  )
}

function HomePage() {
  const { isConnected } = useAccount();
  return (
    <>
      <Web3Button />
      {isConnected && <>
        <AddressForm />
        <Totals />
        <Ships />
        <LootCards />
      </>}
      {!isConnected && <>
        <h1>SapCalc</h1>
        <p>You want to know how many SAP Cans your wallet is entitled to?</p>
        <p>Connect and find out.</p>
      </>}
    </>
  )
}

function App() {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <HomePage />
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}

export default App;