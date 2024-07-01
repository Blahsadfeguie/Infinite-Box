addLayer("p", {
    name: "boxes", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 0,
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#7C5439",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "empty boxes", // Name of prestige currency
    baseResource: "resolve", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone('r',0)) keep.push(11)
        if (layers[resettingLayer].row > this.row) {
            layerDataReset("p", [])
            player[this.layer].upgrades = keep
        }
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasUpgrade('p', 23)) mult = mult.times(upgradeEffect('p', 23))
        mult = mult.times(buyableEffect('r',11))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for empty boxes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    resetDescription: "Open some boxes: ",
    infoboxes: {
        lore: {
            title: "The Package",
            body() { return "You received a mysterious package in the mail. When you open it, you find that there's a smaller box inside. In fact, it appears to be boxes all the way down!<br><br>But there must be <i>something</i> in the middle of it all. You'll just have to build up enough <b>Resolve</b> to open all of its layers and get to the center!" },
        },
    },
    upgrades: {
        11: {
            title: "Deep Breath",
            description: "Prepare yourself for some serious box-opening action. Begin generating resolve.",
            cost: new Decimal(1),
        },
        21: {
            title: "Calm Mind",
            description: "Don't lose track of yourself. Doubles resolve gain.",
            cost: new Decimal(10),
        },
        12: {
            title: "Motivation",
            description: "Let your progress motivate you. Increase resolve gain based on empty boxes.",
            cost: new Decimal(2),
            effect() {
                let pointvalue = new Decimal(0);
                if (hasUpgrade('r',13)) {pointvalue = player[this.layer].total}
                else {pointvalue = player[this.layer].points}
                return pointvalue.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        22: {
            title: "Confidence",
            description: "Look at how resolved you are and use that to fuel your resolve further.",
            cost: new Decimal(15),
            effect() {
                return player.points.add(1).pow(0.12)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Frenzy",
            description: "Unleash all your energy in one go. Increase boxes opened based on resolve.",
            cost: new Decimal(5),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        23: {
            title: "Cascade",
            description: "The sight of all these empty boxes makes you want more. Empty boxes boosts itself.",
            cost: new Decimal(25),
            effect() {
                if (hasUpgrade('r',12)) return player[this.layer].points.add(1).pow(0.2)
                else return player[this.layer].points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    },
})
addLayer("r", {
    name: "recycle", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#00FF90",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "karma", // Name of prestige currency
    baseResource: "empty boxes", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.times(buyableEffect('r',13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ['p'],
    hotkeys: [
        {key: "r", description: "R: Reset for recycling karma", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    resetDescription: "Recycle empty boxes for ",
    infoboxes: {
        lore: {
            title: "Recycling Center",
            body() { return "With your quarters filled with empty boxes and nothing to show for it, you decide to take a break and turn them in to the <b>Recycling Center</b>.<br><br>These recycling enthusiasts have a <b>Karma</b> system in which turning in recyclables grants you reward points which you can cash in for various equipment and benefits. This should simplify your box-opening journey somewhat." },
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 total karma",
            effectDescription: "Keep the first box upgrade on reset",
            done() {return player.r.total.gte(2)}
        }
    },
    buyables: {
        11: {
            cost(x) { return new Decimal(getBuyableAmount(this.layer, this.id)).add(1).pow(2.2) },
            title: "Boxcutter",
            display() { return "A must-have for any aspiring box-opener. Boosts boxes opened. Currently: "+format(this.effect())+"x<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "<br>Cost: " + format(this.cost()) + " Karma" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                return new Decimal(1.3).pow(getBuyableAmount(this.layer, this.id))
            }
        },
        12: {
            cost(x) { return new Decimal(getBuyableAmount(this.layer, this.id)).add(1).pow(2.5) },
            title: "Watercooler",
            display() { return "A convenient source of water for hydration. Boosts resolve gain. Currently: "+format(this.effect())+"x<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "<br>Cost: " + format(this.cost()) + " Karma" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                return new Decimal(1.3).pow(getBuyableAmount(this.layer, this.id))
            }
        },
        13: {
            cost(x) { return new Decimal(getBuyableAmount(this.layer, this.id)).add(1).pow(3) },
            title: "Fancy Hat",
            display() { return "Recyclers here love really fancy hats, and wearing one will boost your karma gain. Currently: "+format(this.effect())+"x<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "<br>Cost: " + format(this.cost()) + " Karma" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                return new Decimal(1.3).pow(getBuyableAmount(this.layer, this.id))
            }
        }
    },
    upgrades: {
        11: {
            title: "Contributor",
            description: "Your efforts are appreciated by the recycling community. Boosts resolve gain based on total karma.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].total.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        12: {
            title: "Cardboard Addict",
            description: "There's something about the texture... Makes <b>Cascade</b> stronger.",
            cost: new Decimal(5),
        },
        13: {
            title: "Share Your Story",
            description: "Your tale intrigues recyclers. Makes <b>Motivation</b> instead based on total boxes opened since last recycle.",
            cost: new Decimal(10),
        }
    },
})
