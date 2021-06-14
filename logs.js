'use strict';

const Logs = (player_names) => {
    const init_logs = () => {
        // log human readable events as a list of strings
        const logs = ['Game starts'];
        // log stats and data in an object: data.playername.statistic 
        const data = {};
        for (const name of player_names) {
            data[name] = {
                'successful_calls':   0,
                'unsuccessful_calls': 0,
                'successful_lies':    0,
                'unsuccessful_lies':  0,
                'game_wins':          0,
            }
        }
        return [logs, data];
    }
    let [logs, data] = init_logs();

    //// helper functions:
    const check_death = (p) => {if (p.is_dead()) logs.push(`${p.get_name()} just died! :(`)}
    const believe_and_roll = (curr_p, prev_p, announcement, true_roll) => {
        if (!(announcement === null)) logs.push(`${curr_p.get_name()} believes ${prev_p.get_name()}!`);
        logs.push(`${curr_p.get_name()} rolls a: ${true_roll}`);
    }

    return {
        reset_logs: () => {[logs, data] = init_logs()},

        // when a Mia has been announced:
        mia_and_dont_believe_false: (curr_p, prev_p) => {
            logs.push(`The Mia was announced!`);
            logs.push(`${curr_p.get_name()} didn't believe the Mia: loses 2 lives`);
            check_death(curr_p);
            data[curr_p.get_name()].unsuccessful_calls += 1;
        },

        mia_and_dont_believe_true: (curr_p, prev_p) => {
            logs.push(`The Mia was announced!`);
            logs.push(`${curr_p.get_name()} didn't believe the Mia: ${prev_p.get_name()} loses a life`);
            check_death(prev_p);
            data[curr_p.get_name()].successful_calls += 1;
            data[prev_p.get_name()].successful_lies -= 1;
            data[prev_p.get_name()].unsuccessful_lies += 1;
        },

        mia_and_believe: (curr_p, prev_p) => {
            logs.push(`The Mia was announced!`);
            logs.push(`${curr_p.get_name()} believes the Mia and loses a life`);
            check_death(curr_p);
        },


        // when a player believes the previous player and rolls the dice:
        roll_and_lie: (curr_p, prev_p, announced_roll, announcement, true_roll) => {
            believe_and_roll(curr_p, prev_p, announcement, true_roll);
            logs.push(`${curr_p.get_name()} lies and announces: ${announced_roll}`);
            data[curr_p.get_name()].successful_lies += 1;
        },

        roll_and_truth: (curr_p, prev_p, announcement, true_roll) => {
            believe_and_roll(curr_p, prev_p, announcement, true_roll);
            logs.push(`${curr_p.get_name()} tells the truth and announces: ${true_roll}`);
        },


        // when a player does not believe a player and calls them out:
        call_out_and_false: (curr_p, prev_p) => {
            logs.push(`${curr_p.get_name()} calls out ${prev_p.get_name()}!`);
            logs.push(`They were telling the truth.`);
            check_death(curr_p);
            data[curr_p.get_name()].unsuccessful_calls += 1;
        },

        call_out_and_true: (curr_p, prev_p) => {
            logs.push(`${curr_p.get_name()} calls out ${prev_p.get_name()}!`);
            logs.push(`They were indeed lying.`);
            check_death(prev_p);
            data[curr_p.get_name()].successful_calls += 1;
            data[prev_p.get_name()].successful_lies -= 1;
            data[prev_p.get_name()].unsuccessful_lies += 1;
        },


        // when the round or the game is over
        round_ended: () => {
            logs.push(`THE ROUND IS OVER`);
        },

        game_over: (curr_p, prev_p) => {
            let winner = curr_p || prev_p;
            logs.push(`THE GAME IS OVER, ${winner.get_name()} wins!`);
            logs.push(`PRESS SETUP TO RESTART`);
            data[winner.get_name()].game_wins += 1;
        },


        // getters
        get_human_logs: () => logs.join('\n'),

        get_data: () => data,
        get_one_data: (pname) => data[pname],

        get_human_data: () => JSON.stringify(data, null, 4),
        get_one_human_data: (pname) => JSON.stringify(data[pname], null, 4),
    }
}