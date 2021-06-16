'use strict';

const Game = (player_stats, logs, do_rendering) => {
    const init_state = () => {
        let announcement = null;
        let prev_announc = null;
        let true_roll = null;
        let turn_idx = Math.floor(Math.random() * player_stats.length);
        let game_over = false;
        let players = player_stats.map((player_stats) => Player(...player_stats));
        return [announcement, prev_announc, true_roll, turn_idx, game_over, players];
    }
    // remember the previously announced roll, the true roll, and who's turn it is now
    // the dice and renderer are constants, but the players can be reset
    let [announcement, prev_announc, true_roll, turn_idx, game_over, players] = init_state();
    const dice = Dice();
    const render = Render(logs, do_rendering);

    render.update_log_and_data(logs);
    render.init_draw(players);


    //// helper functions:
    // dumbass javascript cant properly do modulo on negative numbers
    const mod = (n, m) => ((n % m) + m) % m;

    // function to return the next or previous player that is still alive
    // if no one else is left alive, return false
    const get_next_player_from = (turn_idx, backwards) => {
        let sign_modifier = backwards ? -1 : 1;
        let offset = backwards ? 0 : 1;
        while (true) {
            let idx = mod(turn_idx + (offset * sign_modifier), players.length);
            if (!players[idx].is_dead()) {
                return players[idx];
            }
            offset += 1;
            if (offset === players.length) {
                return false;
            }
        }
    }

    return {
        game_is_over: () => game_over,
        get_players: () => players,

        render: () => render.force_update_log_and_data(logs),
        rerender: () => {
            render.init_draw(players);
            render.force_update_log_and_data(logs);
            render.update_tooltip();
        },

        reset_game: () => {
            [announcement, prev_announc, true_roll, turn_idx, game_over, players] = init_state();
        },
        play_turn: () => {
            if (game_over) return;
            // get the next and previous still alive players (the bool toggles direction)
            const curr_p = get_next_player_from(turn_idx, false);
            const prev_p = get_next_player_from(turn_idx, true);
            turn_idx = players.indexOf(curr_p);

            // if there is only one player left alive, the game is over.
            if (!curr_p || !prev_p || curr_p.get_name() === prev_p.get_name()) {
                game_over = true;
                logs.game_over(curr_p, prev_p);
                render.update_log_and_data(logs);
                render.update_tooltip();
                return;
            }

            // if the Mia was announced, then the round is over
            if (dice.is_mia(announcement)) {

                // don't believe the Mia
                if (curr_p.believes(logs.get_evidence_on(prev_p))) {

                    // it really was a Mia
                    if (dice.is_mia(true_roll)) {
                        curr_p.lose_life();
                        curr_p.lose_life();
                        logs.mia_and_dont_believe_false(curr_p, prev_p);

                    // it was not a Mia
                    } else {
                        prev_p.lose_life();
                        let necessary = dice.lower_than(true_roll, prev_announc) ? true : false;
                        logs.mia_and_dont_believe_true(curr_p, prev_p, necessary);
                    }

                // believe the Mia
                } else {
                    curr_p.lose_life();
                    logs.mia_and_believe(curr_p, prev_p);
                }

                [announcement, prev_announc, true_roll] = [null, null];
                logs.round_ended();
            }

            // believe the previous player
            else if (announcement === null || curr_p.believes(logs.get_evidence_on(prev_p))) {

                // roll the dice
                const curr_roll = dice.roll_dice();

                // lie
                if (curr_p.wants_to_lie(announcement) || dice.lower_than(curr_roll, announcement)) {
                    const announced_roll = curr_p.lie_with(dice, announcement);
                    logs.roll_and_lie(curr_p, prev_p, announced_roll, announcement, curr_roll);
                    [announcement, prev_announc, true_roll] = [announced_roll, announcement, curr_roll];

                // truth
                } else {
                    logs.roll_and_truth(curr_p, prev_p, announcement, curr_roll);
                    [announcement, prev_announc, true_roll] = [curr_roll, announcement, curr_roll];

                }

            // call out the previous player
            } else {

                // they were telling the truth
                if (announcement === true_roll) {
                    curr_p.lose_life();
                    logs.call_out_and_false(curr_p, prev_p);

                // they were lying
                } else {
                    prev_p.lose_life();
                    let necessary = dice.lower_than(true_roll, prev_announc) ? true : false;
                    logs.call_out_and_true(curr_p, prev_p, necessary);
                }

                [announcement, prev_announc, true_roll] = [null, null, null];
                logs.round_ended();
            }

            // update view
            render.show_turn(curr_p);
            render.update_color(prev_p);
            render.update_log_and_data(logs);
            render.update_tooltip();
        },
    }
}
