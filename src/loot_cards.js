export class LootCard {
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

export class LootCardBalance extends LootCard {
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

export function sumSapMax(coll) {
    return coll.map(b => b.sapMax).reduce((a, b) => a + b, 0n);
}

export function sumSapSafe(coll) {
    return coll.map(b => b.sapSafe).reduce((a, b) => a + b, 0n);
}

export const LOOT_CARDS = [
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