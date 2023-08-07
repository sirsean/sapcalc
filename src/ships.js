class Ship {
    constructor(name, cost) {
        this.name = name;
        this.cost = cost;
    }
}

export const SHIPS = [
    ["Boondocker", 5],
    ["Boondocker + Tools", 7],
    ["Boondocker + Creature/Hab", 10],
    ["Lego Competition Winner", 9],
    ["Lego Competition Winner + Upgrade", 12],
    ["Longbow", 15],
    ["Longbow + Lander", 20],
    ["Longbow Double", 30],
    ["Longbow Quad", 60],
    ["Rackworm", 50],
    ["Rackworm + Battering Ram", 70],
    ["Rackwork + Laser", 80],
    ["MHC-DS Spigot", 100],
    ["MHC-DS Chop-Hauler", 130],
    ["MHC-DS Harridan", 175],
    ["MHC-DS Avraga", 410],
    ["Cruiser", 250],
    ["Cruiser + Grow Unit", 325],
    ["Cruiser Double", 500],
].map(([name, cost]) => new Ship(name, cost))