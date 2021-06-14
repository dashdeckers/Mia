'use strict';

const Dice = () => {
    // Two dice are rolled simultaneously:
    // The higher die is counted as the higher denomination.
    // Doubles are always higher than normal rolls.
    // The "Mia" (1 and 2) is a special roll and has the highest value.
    const order = [
        31, 32,
        41, 42, 43,
        51, 52, 53, 54,
        61, 62, 63, 64, 65,
        11, 22, 33, 44, 55, 66,
        21,
    ];

    // This is an array containing the probabilities corresponding to the order array
    const probs = Array(21).fill().map(
        // all double rolls have a probability of 1/36
        // all other rolls have a probability of 2/36
        (_, idx) => {return idx < 14 || idx === 20 ? 2/36 : 1/36}
    );

    // single die roll function: returns a random integer in [1, 6]
    const roll_die = () => {return Math.floor(Math.random() * 6) + 1};

    return {
        // roll two dice, sort in decending order, then concatenate
        roll_dice: () => {
            let dice = [roll_die(), roll_die()].sort((a, b) => b - a);
            let dice_roll = Number(`${dice[0]}${dice[1]}`);
            return dice_roll;
        },

        // check if the roll is the Mia
        is_mia: (roll) => {
            return roll === 21;
        },

        // returns true if roll1 is lower than roll2
        lower_than: (roll1, roll2) => {
            return order.indexOf(roll1) <= order.indexOf(roll2);
        },

        // return the probability of rolling higher than 'roll' by summing probs
        prob_rolling_higher_than: (roll) => {
            return probs
                .slice(order.indexOf(roll), probs.length+1)
                .reduce((a, b) => a + b, 0);
        },

        // return a random roll higher than 'roll'
        get_higher_roll_than: (roll) => {
            let higher_rolls = order.slice(order.indexOf(roll) + 1, order.length);
            return higher_rolls[Math.floor(Math.random() * higher_rolls.length)];
        },
    }
}
