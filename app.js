// ======== CARREGAR DADOS ========
async function loadJSON(path) {
    const res = await fetch(path);
    return await res.json();
}

let movesDB = {};
let pokeDB = {};
let natureDB = {};

// ======== FUNÇÕES DE CÁLCULO ========

// Vida: HP = floor(BaseHP / 5) + 5
function calcHP(base) {
    return Math.floor(base / 5) + 5;
}

// PA = floor(SpeedBase / 10) + 3
function calcPA(baseSpeed) {
    return Math.floor(baseSpeed / 10) + 3;
}

// Converte atributos ofensivos → Dados
function atribToDice(value) {
    if (value <= 4) return "0";
    if (value <= 20) return "1d";
    if (value <= 50) return "2d";
    if (value <= 80) return "3d";
    if (value <= 120) return "4d";
    return "5d";
}

// Aplica aumento/diminuição da nature
function applyNatureStat(base, natureMod) {
    if (natureMod === "+") return Math.floor(base * 1.1);
    if (natureMod === "-") return Math.floor(base * 0.9);
    return base;
}

// ======== RENDERIZAR FICHA ========
function renderFicha(pokemon) {
    const nature = natureDB[pokemon.nature] || natureDB["Hardy"];
    const base = pokeDB[pokemon.species];

    // ----- CÁLCULO DE ATRIBUTOS -----

    // Aplicar modificadores de Nature
    const atkFinal  = applyNatureStat(base.stats.attack,      nature.mods.attack);
    const defFinal  = applyNatureStat(base.stats.defense,     nature.mods.defense);
    const spAtkFinal = applyNatureStat(base.stats.sp_attack,  nature.mods.sp_attack);
    const spDefFinal = applyNatureStat(base.stats.sp_defense, nature.mods.sp_defense);
    const spdFinal   = applyNatureStat(base.stats.speed,      nature.mods.speed);

    // HP e PA
    const hp = calcHP(base.stats.hp);
    const pa = calcPA(base.stats.speed);

    // Dados por atributo
    const diceAtk    = atribToDice(atkFinal);
    const diceSpAtk  = atribToDice(spAtkFinal);

    // Exibir + ou – segundo a nature
    const defNature  = nature.mods.defense     === "-" ? "0 -" : "0";
    const spAtkNature = nature.mods.sp_attack  === "+" ? `${diceSpAtk}+` : diceSpAtk;
    const atkNature   = nature.mods.attack     === "+" ? `${diceAtk}+` : diceAtk;

    // Movimentos
    let movesHTML = "";
    pokemon.moves.forEach(mov => {
        if (!movesDB[mov]) return;
        movesHTML += `
        <li><b>${movesDB[mov].name}</b> <code>${movesDB[mov].power}</code></li>`;
    });

    // HTML Final
    document.getElementById("ficha").innerHTML = `
<h1>❦ Pokémon ❦</h1>

<b>Nome</b><br>
<code>${pokemon.nick} (${pokemon.species})</code><br><br>

<b>Vida</b><br>
<code>${hp}/${hp}</code><br><br>

<b>Nível</b><br>
<code>${pokemon.level}</code><br><br>

<b>Tipo</b><br>
<code>${base.types.join(", ")}</code><br><br>

<b>Nature</b><br>
<code>${pokemon.nature} (${nature.name_pt})</code><br><br>

<b>Gênero</b><br>
<code>${pokemon.gender}</code><br><br>

<b>Habilidade</b><br>
<code>${pokemon.ability}</code><br><br>

<b>Item</b><br>
<code>${pokemon.item || "Nenhum"}</code>

<h2>Atributos</h2>
<pre>
Attack:       ${atkNature}
Defense:      ${defNature}
Sp. Attack:   ${spAtkNature}
Sp. Defense:  0
Speed:        ${spdFinal}
PA:           ${pa}
</pre>

<h2>Movimentos</h2>
<ul>${movesHTML}</ul>
    `;
}

// ======== INICIALIZAÇÃO ========
async function init() {
    movesDB  = await loadJSON("./moves.json");
    pokeDB   = await loadJSON("./pokemon-data.json");
    natureDB = await loadJSON("./natures.json");

    // EXEMPLO DE TESTE
    const exemplo = {
        nick: "Gato Maconha",
        species: "Sprigatito",
        level: 5,
        nature: "Mild",
        gender: "Fêmea",
        ability: "Overgrow",
        item: "???",
        moves: ["Leafage", "Scratch", "Tail Whip"]
    };

    renderFicha(exemplo);
}

init();

