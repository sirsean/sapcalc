import { initStore } from './store';

export const configureStore = () => {
    const actions = {
        SET_DRIFTER_BALANCE: (state, drifterBalance) => {
            state.drifterBalance = drifterBalance;
            return state;
        },
        SET_LOOT_CARD_BALANCE: (state, lootCardBalance) => {
            state.lootCardBalances[lootCardBalance.tokenId] = lootCardBalance;
            return state;
        },
    };

    initStore(actions, {
        drifterBalance: 0n,
        lootCardBalances: {},
    })
}
