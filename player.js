'use strict';

const Player = (name, lying_prob) => {
    let lives = 6;
    let x, y = 0;

    // each player starts off with a kripke model where the possible worlds corresponding to
    // the possible lying probabilities of the previous player are indistinguishable.

    // we assume that it is common knowledge that 0.2, 0.5 and 0.8 are the only valid lying
    // probabilities, and it is publicly announced when someone is called out and the result.

    let possible_worlds = [0.2, 0.5, 0.8];
    let inference = 0.5;

    return {
        get_lives: () => lives,
        get_name: () => name,
        get_color: () => lives === 0 ? 'red': 'black',
        get_x: () => x,
        get_y: () => y,
        get_inference: () => inference,
        get_lying_prob: () => lying_prob,

        is_dead: () => lives === 0,
        lose_life: () => {lives > 0 ? lives -= 1 : lives = 0;},
        set_pos: (new_x, new_y) => {[x, y] = [new_x, new_y]},

        wants_to_lie: (announcement) => Math.random() < lying_prob,
        believes: (evidence) => {
            // infer most probable world from evidence, by default guess 0.5
            // evidence is the publicly known data on the relevant person
            let probable_world = 0.5;

            if (evidence.public_lies + evidence.public_truths > 0) {
                // get the possible_world closest to internal inference
                inference = evidence.public_lies / (evidence.public_lies + evidence.public_truths);
                inference = Math.round((inference + Number.EPSILON) * 100) / 100
                probable_world = possible_worlds.reduce(
                    (curr, prev) => (Math.abs(curr - inference) < Math.abs(prev - inference) ? curr : prev)
                );
            }
            return Math.random() < probable_world;
        },
        lie_with: (dice, announcement) => {
            // differentiate here between necessary lies and willful lies?
            return dice.get_higher_roll_than(announcement)
        },
    }
}
