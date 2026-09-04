export const GAME_CATEGORIES = {
  f1: {
    id: "f1",
    label: "🏎️ Formula 1 Drivers",
    cards: [
      { id: "lh44", name: "Lewis Hamilton", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png", traits: { champion: true, redBull: false, ferrari: true, veteran: true, rookie: false, raceWinner: true, british: true } },
      { id: "cl16", name: "Charles Leclerc", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png", traits: { champion: false, redBull: false, ferrari: true, veteran: false, rookie: false, raceWinner: true, british: false } },
      { id: "gr63", name: "George Russell", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: false, rookie: false, raceWinner: true, british: true } },
      { id: "aka12", name: "Andrea Kimi Antonelli", image: "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcR1hDXu5W8vHKvMD8iTtL4VAaVUcRL9UqF80y1yzJaSsFiMn3i1WDC0oGew6oG6rl-SDQcHdCi_voPK8dFNeG4bODmEhjZoPwGfQZgdr9zCLzLVS7iZMDTcILKJh_Eo0ZbU3aZOdtYylrYi&s=19", traits: { champion: false, redBull: false, ferrari: false, veteran: false, rookie: true, raceWinner: false, british: false } },
      { id: "ln4", name: "Lando Norris", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: false, rookie: false, raceWinner: true, british: true } },
      { id: "op81", name: "Oscar Piastri", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: false, rookie: false, raceWinner: true, british: false } },
      { id: "mv1", name: "Max Verstappen", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png", traits: { champion: true, redBull: true, ferrari: false, veteran: true, rookie: false, raceWinner: true, british: false } },
      { id: "ih6", name: "Isack Hadjar", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png", traits: { champion: false, redBull: true, ferrari: false, veteran: false, rookie: true, raceWinner: false, british: false } },
      { id: "ll30", name: "Liam Lawson", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png", traits: { champion: false, redBull: true, ferrari: false, veteran: false, rookie: false, raceWinner: false, british: false } },
      { id: "yt22", name: "Yuki Tsunoda", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png", traits: { champion: false, redBull: true, ferrari: false, veteran: false, rookie: false, raceWinner: false, british: false } },
      { id: "al18", name: "Arvid Lindblad", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBA7vWRLe6kAOAsPgQVPQsG81o8j-wtCGWBksZkIutZxlpPB7drCFfumJWh6sWUwq-gY2N1j1wrKzAfJPewuJW0S0Ovd6QV9GfDI1ZFoP-dA&s=10", traits: { champion: false, redBull: true, ferrari: false, veteran: false, rookie: true, raceWinner: false, british: true } },
      { id: "fa14", name: "Fernando Alonso", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png", traits: { champion: true, redBull: false, ferrari: true, veteran: true, rookie: false, raceWinner: true, british: false } },
      { id: "ls18", name: "Lance Stroll", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: true, rookie: false, raceWinner: false, british: false } },
      { id: "aa23", name: "Alexander Albon", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png", traits: { champion: false, redBull: true, ferrari: false, veteran: true, rookie: false, raceWinner: false, british: true } },
      { id: "cs55", name: "Carlos Sainz", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png", traits: { champion: false, redBull: false, ferrari: true, veteran: true, rookie: false, raceWinner: true, british: false } },
      { id: "pg10", name: "Pierre Gasly", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png", traits: { champion: false, redBull: true, ferrari: false, veteran: true, rookie: false, raceWinner: true, british: false } },
      { id: "fc43", name: "Franco Colapinto", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: false, rookie: true, raceWinner: false, british: false } },
      { id: "eo31", name: "Esteban Ocon", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: true, rookie: false, raceWinner: true, british: false } },
      { id: "ob87", name: "Oliver Bearman", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png", traits: { champion: false, redBull: false, ferrari: true, veteran: false, rookie: true, raceWinner: false, british: true } },
      { id: "nh27", name: "Nico Hülkenberg", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: true, rookie: false, raceWinner: false, british: false } },
      { id: "gb5", name: "Gabriel Bortoleto", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: false, rookie: true, raceWinner: false, british: false } },
      { id: "sp11", name: "Sergio Pérez", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png", traits: { champion: false, redBull: true, ferrari: false, veteran: true, rookie: false, raceWinner: true, british: false } },
      { id: "vb77", name: "Valtteri Bottas", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png", traits: { champion: false, redBull: false, ferrari: false, veteran: true, rookie: false, raceWinner: true, british: false } }
    ],
    questions: [
      { id: "f1_q1", text: "Has this driver won a World Drivers' Championship?", traitKey: "champion" },
      { id: "f1_q2", text: "Has this driver driven for Red Bull / AlphaTauri / RB?", traitKey: "redBull" },
      { id: "f1_q3", text: "Has this driver driven for Ferrari (or subbed for them)?", traitKey: "ferrari" },
      { id: "f1_q4", text: "Has this driver competed in over 100 Grand Prix races?", traitKey: "veteran" },
      { id: "f1_q5", text: "Is this driver a rookie or recent 2024/2025/2026 debutant?", traitKey: "rookie" },
      { id: "f1_q6", text: "Has this driver won at least one Formula 1 Grand Prix?", traitKey: "raceWinner" },
      { id: "f1_q7", text: "Is this driver British / from the United Kingdom?", traitKey: "british" }
    ]
  },

  fictional_live_action: {
    id: "fictional_live_action",
    label: "📖 Fictional Characters (Live-Action)",
    cards: [
      { id: "hp", name: "Harry Potter", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJC3aOkRQ_E4SfVdRnW4tzsZd2m1xzNbYxmPjfBh_Lpg&s=100", traits: { magic: true, hogwarts: true, marvel: false, villain: false, kdrama: false, deathGame: false } },
      { id: "hg", name: "Hermione Granger", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_HlNq0xx_fvNlODBnCj_X_vs9LBYYMKBsAjXYEPrTrw&s=10", traits: { magic: true, hogwarts: true, marvel: false, villain: false, kdrama: false, deathGame: false } },
      { id: "rw", name: "Ron Weasley", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpbjFlgVx0UnT8ePnP8qRrj2RKzaFDPi_GbaBncQtAew&s=10", traits: { magic: true, hogwarts: true, marvel: false, villain: false, kdrama: false, deathGame: false } },
      { id: "ss", name: "Severus Snape", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQPQa5ubmuk0iuOwdvr7No0mnpnI1q0nxuxSNvSGYITA&s=10", traits: { magic: true, hogwarts: true, marvel: false, villain: true, kdrama: false, deathGame: false } },
      { id: "rh", name: "Rubeus Hagrid", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8x7hNQ3yfJTndVjKPS-CfcrjmQNi9tbtCjz_-0qNthA&s=10", traits: { magic: true, hogwarts: true, marvel: false, villain: false, kdrama: false, deathGame: false } },
      { id: "aesun", name: "Oh Ae-sun", image: "https://assets.gqindia.com/photos/67c962782084f0b90d807d38/2:3/w_720,h_1080,c_limit/When-Life-Gives-You-Tangerines-OTT-release.jpg  ", traits: { magic: false, hogwarts: false, marvel: false, villain: false, kdrama: true, deathGame: false } },
      { id: "gwansik", name: "Yang Gwan-sik", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqLbQI6bvpkl3rvwA9h-SKDLv6djuFIc7vO5ZW7B4Pkw&s=10", traits: { magic: false, hogwarts: false, marvel: false, villain: false, kdrama: true, deathGame: false } },
      { id: "arisu", name: "Ryohei Arisu", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1ANP7k4nlNRffWCdM-GhCkpKqrbtPvBQUx7ScO9v8Fg&s=10  ", traits: { magic: false, hogwarts: false, marvel: false, villain: false, kdrama: false, deathGame: true } },
      { id: "usagi", name: "Yuzuha Usagi", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNovOUtqERssD1vYRawThzMU9llbG2rOq2v-Qk6s_VBw&s=10  ", traits: { magic: false, hogwarts: false, marvel: false, villain: false, kdrama: false, deathGame: true } },
      { id: "chishiya", name: "Shuntaro Chishiya", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgXmkY6PwgyK6A8Z5JFmTPVvwYbK8xu6m8kJ9_XX4aXw&s=10", traits: { magic: false, hogwarts: false, marvel: false, villain: false, kdrama: false, deathGame: true } },
      { id: "kuina", name: "Hikaru Kuina", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsDjLQc-W2PJ7dYi8QgYvvxR_2xMe1DFHqpGwZLP1Trw&s=10", traits: { magic: false, hogwarts: false, marvel: false, villain: false, kdrama: false, deathGame: true } },
      { id: "ann", name: "Ann Rizuna", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6mjf72hbpngETF1mQBhfor5JrD0uzoeAj8K3P3xUt8A&s=10", traits: { magic: false, hogwarts: false, marvel: false, villain: false, kdrama: false, deathGame: true } },
      { id: "niragi", name: "Suguru Niragi", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKPKSsqEt5UjqndulXZEpTKNAi1aybHmp2kqB1YOVO0A&s=10", traits: { magic: false, hogwarts: false, marvel: false, villain: true, kdrama: false, deathGame: true } },
      { id: "spiderman", name: "Spider-Man", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv-zhz6qgdnW0wAG581n-5OIUhM0Ym2rApi0Yny14DgKNGr2uLbPXIi9VD&s=10", traits: { magic: false, hogwarts: false, marvel: true, villain: false, kdrama: false, deathGame: false } },
      { id: "ironman", name: "Iron Man", image: "https://ew.com/thmb/CqHtyXtZ6UpZUfakBhOylkRuK5k=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/mcdirma_ec058-2000-3666fa31c3c84dc88f359fe4c7c65922.jpg ", traits: { magic: false, hogwarts: false, marvel: true, villain: false, kdrama: false, deathGame: false } },
      { id: "cap", name: "Captain America", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJmu8AmHyZGhBG6nD5lNRqXHzIA9o7XuQaNfrk-j-KVg&s=10", traits: { magic: false, hogwarts: false, marvel: true, villain: false, kdrama: false, deathGame: false } },
      { id: "thor", name: "Thor", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgKZJm1AscHobahtgRvZm_WuQW9LQ3o2FSdIcrTsF7Bw&s=10 ", traits: { magic: true, hogwarts: false, marvel: true, villain: false, kdrama: false, deathGame: false } },
      { id: "hulk", name: "Hulk", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS17Mty5JNejKmIJr1jLcYPBkJXhoXzESxVqIFVGdBetA&s=10", traits: { magic: false, hogwarts: false, marvel: true, villain: false, kdrama: false, deathGame: false } },
      { id: "natasha", name: "Black Widow", image: "https://static0.srcdn.com/wordpress/wp-content/uploads/2018/11/Black-Widow-Iron-Man-2.jpg?w=1600&h=900&fit=crop", traits: { magic: false, hogwarts: false, marvel: true, villain: false, kdrama: false, deathGame: false } },
      { id: "loki", name: "Loki", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqGXf0lGk29NjarCb21h0R2tsr35YGcYJ33Pxcq0qWG_FwzFRv9sZJENqL&s=10", traits: { magic: true, hogwarts: false, marvel: true, villain: true, kdrama: false, deathGame: false } },
      { id: "hawkeye", name: "Hawkeye", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34HVWtn1fQT0NQIR3IK6UmhhVgFh7jX5COyW03gWlzQ&s=10 ", traits: { magic: false, hogwarts: false, marvel: true, villain: false, kdrama: false, deathGame: false } }
    ],
    questions: [
      { id: "fla_q1", text: "Does this character wield magic, spells, or godlike mystical powers?", traitKey: "magic" },
      { id: "fla_q2", text: "Is this character a wizard or witch affiliated with Hogwarts / Wizarding World?", traitKey: "hogwarts" },
      { id: "fla_q3", text: "Is this character an Avengers hero or superhero from Marvel?", traitKey: "marvel" },
      { id: "fla_q4", text: "Is this character an evil villain, antagonist, or morally grey anti-hero?", traitKey: "villain" },
      { id: "fla_q5", text: "Is this character from a realistic slice-of-life Korean drama (e.g., 'When Life Gives You Tangerines')?", traitKey: "kdrama" },
      { id: "fla_q6", text: "Is this character trapped playing high-stakes survival games (e.g., 'Alice in Borderland')?", traitKey: "deathGame" }
    ]
  },

  fictional_animated: {
    id: "fictional_animated",
    label: "🎨 Animated Characters",
    cards: [
      { id: "luffy", name: "Monkey D. Luffy", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCxN4KeNRmr7g-e34kmXq1yk8Xr1rjTEmA99pd_qPh7g&s=10", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "zoro", name: "Roronoa Zoro", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNPRRJdnVRRYhp7WC0yODrv6fyI3Lomq4SjTVMw1POEQ&s=10 ", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "nami", name: "Nami", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwDohrDO6Tz-zUlMc0kBejZWMxTEIYIYC4KmkbtIy4sQ&s=10", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: true } },
      { id: "usopp", name: "Usopp", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi_dJOyzUXrivDY1uZ6nnn609clAISWNxHSw5_VkxJJA&s=10", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "sanji", name: "Sanji", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdErPDW6rjXif_zrmjjfjh7InBy7S4arxsuLNMIQtR9w&s=10", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "chopper", name: "Tony Tony Chopper", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc2cW47n7w1YFOlmMTfcODvAuMdAMa06UC9USlIuRD0Q&s=10", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "robin", name: "Nico Robin", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtABzTO3NJzt5_PcVqiEnav9MQbJ4I5Mb2l8uN-is8Dg&s=10", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: true } },
      { id: "franky", name: "Franky", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "brook", name: "Brook", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhOW6EKEKI7EwOr7ILwkDDUOoe8WKtJ49pC8gbK2Y8Qw&s=10", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "ace", name: "Portgas D. Ace", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzQyC1jMlt3IF2_EO56JjCuXWxoCLj_oks2PhaIutwsw&s=10  ", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "shanks", name: "Shanks", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtIYGJdbg14n5zl9VhQtGsHZqm8-usFZCR40V9e8kDqA&s=10", traits: { onePiece: true, pirate: true, disney: false, ghibli: false, toy: false, female: false } },
      { id: "chihiro", name: "Chihiro", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZhg64jNldRq4XGlgIs9gVuFoNW8h6hJ9E_rkKENSx4A&s=10", traits: { onePiece: false, pirate: false, disney: false, ghibli: true, toy: false, female: true } },
      { id: "totoro", name: "Totoro", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpR52XoDrS1h-L6nP-Ok20zlkvUri9wvg-vAOk17A_Kg&s=10", traits: { onePiece: false, pirate: false, disney: false, ghibli: true, toy: false, female: false } },
      { id: "kiki", name: "Kiki", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqrnI4LiLEfrv6TBD0oUDIJKY3pRigx34PfH0Qk2ZWNA&s=10", traits: { onePiece: false, pirate: false, disney: false, ghibli: true, toy: false, female: true } },
      { id: "snowwhite", name: "Snow White", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRXsolXU3G0ZnqURt7-wRmi8y2bRcahZzQF6ZaA4uRKw&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "cinderella", name: "Cinderella", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiYxskTvrL1IrFEe15pb3RAYYi1GtgXVbPvxsjiCsdig&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "ariel", name: "Ariel", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVTj3LzLHwBVrJ2pKpr4ncGiIwMU54xMi71rC__vjt7w&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "belle", name: "Belle", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR17fI2Tr-RtpLaYTfNsAFImzk3wE-zwOGamGEFC5n4pg&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "mulan", name: "Mulan", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBr3whHScdcFLc5akqyXone9imn1gmsBrtinU4mAR1MQ&s=10 ", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "moana", name: "Moana", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbUUKliUPGtQoZzyrSEBK1RFOYbJHrL_YZe085E5vKMQ&s=10 ", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "aladdin", name: "Aladdin", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZrmzQl1JTyPczVlNx--J9mJqHzNtMum4pO6c720ax6Q&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: false } },
      { id: "elsa", name: "Elsa", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJL7bOibd4dBiSZD_u8WZ81Qrva5IW95PmDud23KtuhQ&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "anna", name: "Anna", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKzAbHzuBRdjKTrfuQxKN0tUvNP75u5X2p7sNFdHUehg&s=10 ", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "olaf", name: "Olaf", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH05ozeV4fTClz21QIMlDHCN5lJOQT2TINESe6YHuooA&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: false } },
      { id: "steve", name: "Steve (Minecraft)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9gsGkX9UeiiMG2oYP7ne1EECW6defA5ZnIChwEh1vCQ&s=10", traits: { onePiece: false, pirate: false, disney: false, ghibli: false, toy: false, female: false } },
      { id: "lilo", name: "Lilo", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHGcDUIuwWTzQQqz-KMrmFdUmznC47kSe39OnNPAw-Zg&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: true } },
      { id: "stitch", name: "Stitch", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYjy7znX3O6TTVfJXqDdt3bKjvjOyh_J686nS5wDP6Vw&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: false } },
      { id: "woody", name: "Woody", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSPMWK8rJwh3Zt8_K8S_OqInfqi9VKpAYqQhPHlLC5_w&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: true, female: false } },
      { id: "buzz", name: "Buzz Lightyear", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRElHcOLKVDoqBCLFDvnRJdGzg5QeGKH7ek5SkgpEOzLg&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: true, female: false } },
      { id: "jessie", name: "Jessie", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrzBgXw4un73tNQJs1BTQ5V9i87EN9Z0hg5M4LGlXWyg&s", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: true, female: true } },
      { id: "coco", name: "Miguel (Coco)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYynwmaXFIq8Q4OcJ-eEVdntgEAzxV0lJqylsynZv3uw&s=10", traits: { onePiece: false, pirate: false, disney: true, ghibli: false, toy: false, female: false } }
    ],
    questions: [
      { id: "fa_q1", text: "Is this character from an anime series set on the high seas (e.g., One Piece)?", traitKey: "onePiece" },
      { id: "fa_q2", text: "Is this character a pirate, swashbuckler, or high-seas crew member?", traitKey: "pirate" },
      { id: "fa_q3", text: "Is this character created by Disney or Pixar Animation Studios?", traitKey: "disney" },
      { id: "fa_q4", text: "Is this character from a hand-drawn Studio Ghibli fantasy universe?", traitKey: "ghibli" },
      { id: "fa_q5", text: "Is this character a living toy or action figure (e.g., Toy Story)?", traitKey: "toy" },
      { id: "fa_q6", text: "Is this character female?", traitKey: "female" }
    ]
  },

  bollywood: {
    id: "bollywood",
    label: "🎬 Bollywood Celebrities",
    cards: [
      { id: "srk", name: "Shah Rukh Khan", image: "https://ts2.mm.bing.net/th?id=OIP.IiDB0-UTKsD-VBzrfKhanAHaFV&pid=15.1&o=7&rm=3", traits: { khan: true, female: false, veteran: true, nationalAward: false, actionStar: false } },
      { id: "salman", name: "Salman Khan", image: "https://ts3.mm.bing.net/th?id=OIP.8lpcDZXRiy3GB5PyPAOC8wHaLH&pid=15.1&o=7&rm=3", traits: { khan: true, female: false, veteran: true, nationalAward: false, actionStar: true } },
      { id: "aamir", name: "Aamir Khan", image: "https://ts2.mm.bing.net/th?id=OIP.iZxwF_BHjKyJEuAHDSbGbgHaFj&pid=15.1&o=7&rm=3", traits: { khan: true, female: false, veteran: true, nationalAward: true, actionStar: false } },
      { id: "akshay", name: "Akshay Kumar", image: "https://ts1.mm.bing.net/th?id=OIP.PNmXY6ii8jb3Pa5wUg6p6AHaJQ&pid=15.1&o=7&rm=3  ", traits: { khan: false, female: false, veteran: true, nationalAward: true, actionStar: true } },
      { id: "amitabh", name: "Amitabh Bachchan", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwK0ccsXyXv0Iugja89GIn9QQAFQsP0EQpD5bPg-S6Wg&s=10", traits: { khan: false, female: false, veteran: true, nationalAward: true, actionStar: true } },
      { id: "shahid", name: "Shahid Kapoor", image: "https://ts1.mm.bing.net/th?id=OIP.lWQpPFo9qlyBhUzstkW-eQAAAA&pid=15.1&o=7&rm=3 ", traits: { khan: false, female: false, veteran: false, nationalAward: false, actionStar: false } },
      { id: "alia", name: "Alia Bhatt", image: "https://ts2.mm.bing.net/th?id=OIF.8jw1LcLaqzEZfYMnT%2fA%2bPw&pid=15.1&o=7&rm=3  ", traits: { khan: false, female: true, veteran: false, nationalAward: true, actionStar: false } },
      { id: "anil", name: "Anil Kapoor", image: "https://ts4.mm.bing.net/th?id=OIP.kEZE7-mcNb1wym6Merg-wgHaJ4&pid=15.1&o=7&rm=3 ", traits: { khan: false, female: false, veteran: true, nationalAward: true, actionStar: false } },
      { id: "deepika", name: "Deepika Padukone", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR349kM58HsxlyaQ3qTNSBaChl-bnf5lgu4VkPCEIzCXA&s=10  ", traits: { khan: false, female: true, veteran: false, nationalAward: false, actionStar: true } },
      { id: "kajol", name: "Kajol", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiWXUYUuvkUK1QemqVTSn7InJjdCwMrc3KfJVcnBvLJg&s=10 ", traits: { khan: false, female: true, veteran: true, nationalAward: false, actionStar: false } },
      { id: "kapil", name: "Kapil Sharma", image: "https://ts1.mm.bing.net/th?id=OIP.D2TMlMuqrmFwiHOx9PLsjwHaFi&pid=15.1&o=7&rm=3 ", traits: { khan: false, female: false, veteran: false, nationalAward: false, actionStar: false } },
      { id: "ajay", name: "Ajay Devgn", image: "https://ts3.mm.bing.net/th?id=OIP.alueQtHBgdOprMyK0q_DewHaEK&pid=15.1&o=7&rm=3", traits: { khan: false, female: false, veteran: true, nationalAward: true, actionStar: true } },
      { id: "priyanka", name: "Priyanka Chopra", image: "https://ts2.mm.bing.net/th?id=OIP.lU5cQRfeBxLAv6JFnLatfwHaKD&pid=15.1&o=7&rm=3", traits: { khan: false, female: true, veteran: true, nationalAward: true, actionStar: true } },
      { id: "saif", name: "Saif Ali Khan", image: "https://ts3.mm.bing.net/th?id=OIP.9evfgHOPEycCQBCTTGBOLwHaEK&pid=15.1&o=7&rm=3", traits: { khan: true, female: false, veteran: true, nationalAward: true, actionStar: false } },
      { id: "rani", name: "Rani Mukerji", image: "https://ts2.mm.bing.net/th?id=OIP.qdQeuIST1yP_weNi68a7mQHaJ4&pid=15.1&o=7&rm=3", traits: { khan: false, female: true, veteran: true, nationalAward: false, actionStar: false } },
      { id: "farah", name: "Farah Khan", image: "https://ts4.mm.bing.net/th?id=OIP.AVu-M1sgWAxOymvR_O8jrgHaJq&pid=15.1&o=7&rm=3", traits: { khan: true, female: true, veteran: true, nationalAward: true, actionStar: false } },
      { id: "aishwarya", name: "Aishwarya Rai Bachchan", image: "https://ts4.mm.bing.net/th?id=OIP.zr9xVZG7Lak-y6hWK3z5SgHaK0&pid=15.1&o=7&rm=3", traits: { khan: false, female: true, veteran: true, nationalAward: false, actionStar: false } },
      { id: "madhuri", name: "Madhuri Dixit", image: "https://ts4.mm.bing.net/th?id=OIP.W7MyYqlY0mXbQe8gG8t2oAHaJW&pid=15.1&o=7&rm=3", traits: { khan: false, female: true, veteran: true, nationalAward: false, actionStar: false } }
    ],
    questions: [
      { id: "bw_q1", text: "Is this celebrity one of the Khans or carrying Khan in their name?", traitKey: "khan" },
      { id: "bw_q2", text: "Is this person an actress, director, or female celebrity?", traitKey: "female" },
      { id: "bw_q3", text: "Did this person debut or start working before 2000?", traitKey: "veteran" },
      { id: "bw_q4", text: "Has this person won a National Film Award?", traitKey: "nationalAward" },
      { id: "bw_q5", text: "Is this actor famous for high-octane action roles?", traitKey: "actionStar" }
    ]
  }
};