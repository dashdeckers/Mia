'use strict';

const Player = (name, lying_prob) => {
    let lives = 1;
    let x, y = 0;

    return {
        get_lives: () => lives,
        get_name: () => name,
        get_color: () => lives === 0 ? 'red': 'black',
        get_x: () => x,
        get_y: () => y,

        lose_life: () => {lives > 0 ? lives -= 1 : lives = 0;},
        is_dead: () => lives === 0,
        set_pos: (new_x, new_y) => {[x, y] = [new_x, new_y]},

        wants_to_lie: (announcement) => Math.random() < lying_prob,
        believes: (announcement, prev_p) => Math.random() < 0.5,
        lie_with: (dice, announcement) => {
            // differentiate here between necessary lies and willful lies?
            return dice.get_higher_roll_than(announcement)
        },
    }
}
