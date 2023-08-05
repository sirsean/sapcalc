import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal, Web3Button } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig, useAccount, useContractRead } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { useState, useContext, createContext } from 'react';
import DrifterABI from '../abi/DrifterABI.js';
import LootCardABI from '../abi/LootCardABI.js';
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

function drifterBonus(balance) {
  if (balance >= 100n) {
      return 130n;
  } else if (balance >= 50n) {
      return 60n;
  } else if (balance >= 35n) {
      return 38n;
  } else if (balance >= 20n) {
      return 20n;
  } else if (balance >= 10n) {
      return 9n;
  } else if (balance >= 5n) {
      return 4n;
  } else if (balance >= 3n) {
      return 2n;
  } else {
      return 0n;
  }
}

class LootCard {
  constructor(tokenId, name, sap) {
    this.tokenId = tokenId;
    this.name = name;
    this.sap = BigInt(sap);
  }

  sapMax(balance) {
    return balance * this.sap;
  }

  sapSafe(balance) {
    if (balance > 1n) {
      const safeBalance = balance - 1n;
      return safeBalance * this.sap;
    } else {
      return 0n;
    }
  }
}

class LootCardBalance extends LootCard {
  constructor(lootCard, balance) {
    super(lootCard.tokenId, lootCard.name, lootCard.sap);
    this.balance = balance;
  }

  get sapMax() {
    return this.balance * this.sap;
  }

  get sapSafe() {
    if (this.balance > 1n) {
      return (this.balance - 1n) * this.sap;
    } else {
      return 0n;
    }
  }
}

const LOOT_CARDS = [
  new LootCard(1, 'Hivver', 3),
  new LootCard(2, 'Blybold', 2),
  new LootCard(3, 'Dozegrass', 1),
  new LootCard(4, 'Scableaf', 1),
  new LootCard(5, 'Skrit', 9),
  new LootCard(6, 'Juicebox', 1),
  new LootCard(7, 'Rare Skull', 539),
  new LootCard(8, 'Linno Beetle', 539),
  new LootCard(9, 'Ommonite', 3),
  new LootCard(10, 'Augurbox', 539),
  new LootCard(11, 'Pelgrejo', 9),
  new LootCard(12, 'Ranch Milk', 14),
  new LootCard(13, 'Brember', 8),
  new LootCard(14, 'Astersilk', 1),
  new LootCard(15, 'Yum Nubs', 1),
  new LootCard(16, 'Ferqun', 1),
  new LootCard(17, 'Gastropod', 1),
  new LootCard(18, 'Ivory Tar', 1),
  new LootCard(19, 'Flux', 4),
  new LootCard(20, 'Murk Ring', 6),
  new LootCard(21, 'SUIT COAG', 6),
];

function numDriftersToSapCans(numDrifters) {
  return (numDrifters * 5n) + drifterBonus(numDrifters);
}

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
  return (
    <tr>
      <td>{lootCard.name}</td>
      <td>{balance?.balance.toString()}</td>
      <td>{balance?.sapMax.toString()}</td>
      <td>{balance?.sapSafe.toString()}</td>
    </tr>
  )
}

function LootCards() {
  const [ state, _ ] = useStore();
  const lootCardSapMax = Object.values(state.lootCardBalances).map(b => b.sapMax).reduce((a, b) => a+b, 0n);
  const lootCardSapSafe = Object.values(state.lootCardBalances).map(b => b.sapSafe).reduce((a, b) => a+b, 0n);
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
  const lootCardSapMax = Object.values(state.lootCardBalances).map(b => b.sapMax).reduce((a, b) => a+b, 0n);
  const lootCardSapSafe = Object.values(state.lootCardBalances).map(b => b.sapSafe).reduce((a, b) => a+b, 0n);
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