import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal, Web3Button } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig, useAccount, useContractRead } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { useState, useContext, createContext } from 'react';
import DrifterABI from '../abi/DrifterABI.js';
import LootCardABI from '../abi/LootCardABI.js';
import { numDriftersToSapCans } from './drifters.js';
import { LootCardBalance, LOOT_CARDS, sumSapMax, sumSapSafe } from './loot_cards.js'
import { useStore } from './store';
import './App.css';

const chains = [mainnet]
const projectId = '1e7bdc454bbc86a76b3a0477cacf9999'

const DRIFTER_ADDRESS = '0xe3B399AAb015D2C0D787ECAd40410D88f4f4cA50';
const LOOT_CARD_ADDRESS = '0x39F8166484486c3b72C5c58c468A016D036E1a02';

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

function Drifters() {
  const [ _, dispatch ] = useStore();
  const [ numDrifters, setNumDrifters ] = useState(null);
  const { address } = useAccount();
  useContractRead({
    address: DRIFTER_ADDRESS,
    abi: DrifterABI,
    functionName: 'balanceOf',
    args: [address],
    onSuccess(data) {
      setNumDrifters(data);
      dispatch('SET_DRIFTER_BALANCE', data);
    },
  })
  if (numDrifters) {
    return (
      <div className="box">
        <h2>Drifters</h2>
        <table>
          <tbody>
            <tr>
              <th>Drifters</th>
              <td>{numDrifters.toString()}</td>
            </tr>
            <tr>
              <th>SAP Cans</th>
              <td>{numDriftersToSapCans(numDrifters).toString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

function LootCardView({ lootCard }) {
  const [ _, dispatch ] = useStore();
  const [ balance, setBalance ] = useState(null);
  const { address } = useAccount();
  useContractRead({
    address: LOOT_CARD_ADDRESS,
    abi: LootCardABI,
    functionName: 'balanceOf',
    args: [address, lootCard.tokenId],
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

function LootCards() {
  const [ state, _ ] = useStore();
  const lootCardSapMax = sumSapMax(Object.values(state.lootCardBalances));
  const lootCardSapSafe = sumSapSafe(Object.values(state.lootCardBalances));
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
  const [ state, _ ] = useStore();
  const drifterSap = numDriftersToSapCans(state.drifterBalance);
  const lootCardSapMax = sumSapMax(Object.values(state.lootCardBalances));
  const lootCardSapSafe = sumSapSafe(Object.values(state.lootCardBalances));
  const maxSap = drifterSap + lootCardSapMax;
  const safeSap = drifterSap + lootCardSapSafe;
  return (
    <div className="box">
      <h2>Totals</h2>
      <table>
        <tbody>
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

function HomePage() {
  const { address, isConnected } = useAccount();
  return (
    <>
      <Web3Button />
      {isConnected && <>
        <Totals />
        <Drifters />
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