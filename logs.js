'use strict';

const Logs = (player_stats) => {
    const init_logs_and_data = () => {
        // log human readable events as a list of strings
        const logs = ['Game starts\n'];
        // log stats and data in an object: data.playername.statistic
        const data = {};
        for (const [name, lying_prob] of player_stats) {
            data[name] = {
                'game_wins':          0,
                'public_lies':        0,
                'public_truths':      0,
                'lying_probability':  lying_prob,
                'K':                  {},
            }
            // K is the knowledge each agent has about each other agent
            for (const [next_name, next_lying_prob] of player_stats) {
                if (name === next_name) {continue};

                data[name]['K'][next_name] = {
                    'inference': 0.5,
                    'truth': next_lying_prob,
                }
            }
        }
        return [logs, data];
    }
    let [logs, data] = init_logs_and_data();
    let do_logging = true;

    //// helper functions:
    const check_death = (p) => {if (p.is_dead()) logs.push(`${p.get_name()} just died! :(`)}
    const believe_and_roll = (curr_p, prev_p, announcement, true_roll) => {
        if (!(announcement === null)) logs.push(`${curr_p.get_name()} believes ${prev_p.get_name()}!`);
        logs.push(`${curr_p.get_name()} rolls a: ${true_roll}`);
    }

    return {
        turn_on_logging: () => do_logging = true,
        turn_off_logging: () => do_logging = false,

        reset_logs_and_data: () => {[logs, data] = init_logs_and_data()},
        truncate_logs: () => {logs = ['Logs truncated\n']},

        // when a Mia has been announced:
        mia_and_dont_believe_false: (curr_p, prev_p) => {
            if (do_logging) {
                logs.push(`The Mia was announced!`);
                logs.push(`${curr_p.get_name()} didn't believe the Mia: loses 2 lives`);
                check_death(curr_p);
            }
            data[prev_p.get_name()].public_truths++;
            data[curr_p.get_name()]['K'][prev_p.get_name()]['inference'] = curr_p.get_inference()
        },

        mia_and_dont_believe_true: (curr_p, prev_p, necessary) => {
            if (do_logging) {
                logs.push(`The Mia was announced!`);
                logs.push(`${curr_p.get_name()} didn't believe the Mia: ${prev_p.get_name()} loses a life`);
                check_death(prev_p);
            }
            if (!necessary) {data[prev_p.get_name()].public_lies++};
            data[curr_p.get_name()]['K'][prev_p.get_name()]['inference'] = curr_p.get_inference()
        },

        mia_and_believe: (curr_p, prev_p) => {
            if (do_logging) {
                logs.push(`The Mia was announced!`);
                logs.push(`${curr_p.get_name()} believes the Mia and loses a life`);
                check_death(curr_p);
            }
        },


        // when a player believes the previous player and rolls the dice:
        roll_and_lie: (curr_p, prev_p, announced_roll, announcement, true_roll) => {
            if (do_logging) {
                believe_and_roll(curr_p, prev_p, announcement, true_roll);
                logs.push(`${curr_p.get_name()} lies and announces: ${announced_roll}`);
            }
        },

        roll_and_truth: (curr_p, prev_p, announcement, true_roll) => {
            if (do_logging) {
                believe_and_roll(curr_p, prev_p, announcement, true_roll);
                logs.push(`${curr_p.get_name()} tells the truth and announces: ${true_roll}`);
            }
        },


        // when a player does not believe a player and calls them out:
        call_out_and_false: (curr_p, prev_p) => {
            if (do_logging) {
                logs.push(`${curr_p.get_name()} calls out ${prev_p.get_name()}!`);
                logs.push(`They were telling the truth.`);
                check_death(curr_p);
            }
            data[prev_p.get_name()].public_truths++;
            data[curr_p.get_name()]['K'][prev_p.get_name()]['inference'] = curr_p.get_inference()
        },

        call_out_and_true: (curr_p, prev_p, necessary) => {
            if (do_logging) {
                logs.push(`${curr_p.get_name()} calls out ${prev_p.get_name()}!`);
                logs.push(`They were indeed lying.`);
                check_death(prev_p);
            }
            if (!necessary) {data[prev_p.get_name()].public_lies++};
            data[curr_p.get_name()]['K'][prev_p.get_name()]['inference'] = curr_p.get_inference()
        },


        // when the round or the game is over
        round_ended: () => {
            if (do_logging) {
                logs.push(`THE ROUND IS OVER\n`);
            }
        },

        game_over: (curr_p, prev_p) => {
            let winner = curr_p || prev_p;
            if (do_logging) {
                logs.push(`THE GAME IS OVER, ${winner.get_name()} wins!`);
                logs.push(`PRESS SETUP TO RESTART\n\n`);
            }
            data[winner.get_name()].game_wins += 1;
        },


        // getters
        get_human_logs: () => logs.join('\n'),

        get_data: () => data,
        get_one_data: (pname) => data[pname],

        get_human_data: () => JSON.stringify(data, null, 4),
        get_one_human_data: (pname) => JSON.stringify(data[pname], null, 4),

        get_evidence_on: (p) => (({public_lies, public_truths}) => ({public_lies, public_truths}))(data[p.get_name()])
    }
}
