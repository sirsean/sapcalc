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


export function numDriftersToSapCans(numDrifters) {
    return (numDrifters * 5n) + drifterBonus(numDrifters);
}