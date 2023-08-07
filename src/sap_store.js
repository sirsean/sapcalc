import { initStore } from './store';

export const configureStore = () => {
    const actions = {
        SET_ADDRESS_OVERRIDE: (state, addressOverride) => {
            state.addressOverride = addressOverride;
            return state;
        },
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
        addressOverride: null,
        drifterBalance: 0n,
        lootCardBalances: {},
    })
}
