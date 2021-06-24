# Mia, the lying dice game.
Modeling the dice game Mia (also called Mäxchen) with a Kripke model.

This is a simulation of the game Mia with, optionally, somewhat artificially intelligent players. When the AI toggle is turned off, players are random and have a 50% chance of calling out the previous player. Otherwise, they base their decision off of the history of the game and what they have observed. See below for a description of the how the game is played and how it is implemented.

Please find the actual simulation hosted on the associated [GitHub Pages website](https://dashdeckers.github.io/Mia/), and the report hosted [in this repository](https://github.com/dashdeckers/Mia/blob/main/report.pdf) (also accessible via the GitHub Pages link).

## How to play the game

For an explanation of the game, consider 3 players: Alice, Bob and Eve. Alice starts the round by rolling the dice in a dice cup to cover the results. She rolls a 5 and a 4, and the higher roll always counts as the higher denomination, so she publicly (and truthfully) declares to have rolled a 54 and passes the dice, still covered, to Bob. 

Bob can now decide to believe her and roll the dice without looking, or call her a liar and look at the dice to check. Bob sees no incentive for Eve to have lied on the first round so he rolls the dice. He rolls a 43 and because you can only ever declare a number higher than the one declared previously, he is forced to lie so he declares to have rolled a 55 and passes the dice to Eve. 

This is a bold move because doubles always count higher so this is the second highest possible roll in the game. Eve considers it unlikely for Bob to have successfully rolled higher than 54, so she calls him a liar, checks the dice and Bob loses a life. Eve can now start a new round. 

Due to the fact the declared number always has to be higher than before, it becomes less and less likely for someone to have told the truth as the dice are passed around. There is also a special roll called the Mia (1 and 2), that can end the round at any point someone declares it (truthfully or not) because if you are passed the dice after a Mia has been declared you can only either accept losing a life or call the previous player a liar and either lose 2 lives if you are wrong or the previous player loses a life if they lied. A Mia is also the only roll that can be declared after accepting a 66. After losing 6 lives a player dies, and the last person still alive is crowned the winner.

## What this game is about
The goal of the game is not to figure out or guess the exact value of the dice passed to you, but rather to figure out whether the person passing you the dice was telling the truth or not. As such, the interesting and main point of the game is the bluffing and calling-out a bluff. 

This can get very (infinitely?) complex to model in higher-order knowledge logic and so while the game itself is simulated accurately, the players have been simplified to reduce complexity. For one, players have a fixed lying probability of either 0.2, 0.5 or 0.8 and this is common knowledge. We also only model the player behavior as trying to infer the other players lying probability based on observed lies / truths and then adjusting their calling-out probability to be equal to the most likely lying probability of the other player.

For details of how this fits into the Kripke logic framework please refer to the report included [in this repository](https://github.com/dashdeckers/Mia/blob/main/report.pdf).


## Details of the simulation
There are 5 buttons on the top left to interact with the game.
- Setup resets the game completely to its initial values
- Step plays a single turn, and shows both in the logs and the dots what is happening
- Play 10 games fast forwards a full 10 games into the future
- Play 100 games fast forwards a full 100 games into the future
- Toggle AI can be used to enable or disable random players

The logs on the right show at each step what has happened, and the data on the left shows the current state of the game as seen from each player. There is a circle of players shown in the center that take turns playing their turn. There are tooltips available by hovering over the players to see who's who.

The true lying probabilities as well as the knowledge ("K") field of each player is private and hidden from other players, but the game wins, public lies and public truths are common knowledge. Please note that the "truth" within this "K" field is just for ease of reading and is also not actually known to that player.

When a player is called out, other players can observe that either a lie or the truth has been told by that player. As a public lie, only those lies count that were not necessary. If Bob is called out on a lie but it turns out he had no choice anyway, no information about Bob's lying probability was gained and so this information is disregarded by the other players.

Inferences are made simply by calculating the ratio of public lies to the total public truths and public lies of that player.
