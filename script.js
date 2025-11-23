// --- 1. BANCO DE DADOS (Simulado) ---
// Aqui definimos os Stats Base que serão usados nas fórmulas.
// Adicione mais pokémons aqui conforme precisar.
const pokedex = {
    "squirtle": { 
        nome: "Squirtle", type: "Water", 
        base: { hp: 44, atk: 48, def: 65, spatk: 50, spdef: 64, speed: 43 } 
    },
    "charmander": { 
        nome: "Charmander", type: "Fire", 
        base: { hp: 39, atk: 52, def: 43, spatk: 60, spdef: 50, speed: 65 } 
    },
    "bulbasaur": { 
        nome: "Bulbasaur", type: "Grass", 
        base: { hp: 45, atk: 49, def: 49, spatk: 65, spdef: 65, speed: 45 } 
    }
};

// Carregar dados salvos ou iniciar vazio
let myPokemons = JSON.parse(localStorage.getItem('rpg_save_data')) || [];

// --- 2. SISTEMA DE CÁLCULOS (Suas Fórmulas) ---
function calcularStatus(baseStats, nivel) {
    // Fórmulas fornecidas:
    
    // HP: ((Vida + Def + SpDef) * Nível) / 50
    // Nota: A soma dos base stats pode ser alta, ajustei para garantir valor mínimo de 1.
    const hpMax = Math.floor(((baseStats.hp + baseStats.def + baseStats.spdef) * nivel) / 50) || 1;

    // Attack Dano: 1 + ((Status/5) * Nível) / 100
    const atkDano = 1 + ((baseStats.atk / 5) * nivel) / 100;
    
    // Sp. Attack Dano
    const spAtkDano = 1 + ((baseStats.spatk / 5) * nivel) / 100;

    // Defense (Redução): ((Status/5) * Nível) / 100
    const defRed = ((baseStats.def / 5) * nivel) / 100;

    // Sp. Defense (Redução)
    const spDefRed = ((baseStats.spdef / 5) * nivel) / 100;

    // Speed Mod: ((Velocidade/5) * Nível) / 10
    const speedMod = ((baseStats.speed / 5) * nivel) / 10;

    // PA: 5 + mod.velocidade/100
    // Ajuste: Arredondando o PA para ter um número inteiro utilizável, ou mantendo float se preferir
    const paMax = 5 + (speedMod / 100);

    return {
        hp: Math.floor(hpMax),
        atk: Math.floor(atkDano) + "d", // Formato "1d", "2d"
        spAtk: Math.floor(spAtkDano) + "d",
        def: Math.floor(defRed),
        spDef: Math.floor(spDefRed),
        speed: speedMod.toFixed(1),
        pa: paMax.toFixed(2) // Mostrando com decimais conforme fórmula
    };
}

// --- 3. FUNÇÕES DE GERENCIAMENTO ---

function salvarDados() {
    localStorage.setItem('rpg_save_data', JSON.stringify(myPokemons));
    renderizarTela();
}

function criarPokemon(evento) {
    evento.preventDefault();

    const speciesKey = document.getElementById('species-select').value;
    const nickname = document.getElementById('nickname').value;
    const level = parseInt(document.getElementById('level').value);
    const isAlpha = document.getElementById('is-alpha').checked;
    let isShiny = document.getElementById('is-shiny').checked;

    // Regra: Se é Alpha, é automaticamente Shiny
    if (isAlpha) isShiny = true;

    // Verificar espaço no time
    const timeCount = myPokemons.filter(p => p.local === 'TIME').length;
    const localInicial = timeCount < 6 ? 'TIME' : 'BOX';

    const novoPoke = {
        id: Date.now(), // ID único baseado no tempo
        especie: speciesKey,
        apelido: nickname || pokedex[speciesKey].nome,
        nivel: level,
        shiny: isShiny,
        alpha: isAlpha,
        local: localInicial,
        evasion: 0 // Valor inicial neutro
    };

    myPokemons.push(novoPoke);
    salvarDados();
    document.getElementById('pokemon-form').reset();
    alert(`${novoPoke.apelido} foi enviado para: ${localInicial}`);
}

function moverPokemon(id) {
    const poke = myPokemons.find(p => p.id === id);
    const timeCount = myPokemons.filter(p => p.local === 'TIME').length;

    if (poke.local === 'BOX') {
        if (timeCount >= 6) {
            alert("Seu time já está cheio (6)!");
            return;
        }
        poke.local = 'TIME';
    } else {
        poke.local = 'BOX';
    }
    salvarDados();
}

function deletarPokemon(id) {
    if(confirm("Tem certeza que deseja deletar este Pokémon?")) {
        myPokemons = myPokemons.filter(p => p.id !== id);
        salvarDados();
    }
}

// --- 4. RENDERIZAÇÃO (MOSTRAR NA TELA) ---

function renderizarTela() {
    const partyContainer = document.getElementById('party-container');
    const boxContainer = document.getElementById('box-container');
    const partyCount = document.getElementById('party-count');

    partyContainer.innerHTML = '';
    boxContainer.innerHTML = '';

    const timePokemons = myPokemons.filter(p => p.local === 'TIME');
    partyCount.innerText = `${timePokemons.length}/6`;

    myPokemons.forEach(poke => {
        const dadosBase = pokedex[poke.especie].base;
        const stats = calcularStatus(dadosBase, poke.nivel);
        
        // Classes CSS dinâmicas
        let classes = 'pokemon-card';
        if (poke.shiny) classes += ' shiny';
        if (poke.alpha) classes += ' alpha';

        // Tags visuais
        let tags = '';
        if (poke.alpha) tags += '<span style="color:red">🌟 ALPHA</span> ';
        else if (poke.shiny) tags += '<span style="color:goldenrod">✨ SHINY</span> ';

        const html = `
            <div class="${classes}">
                <div class="card-header">
                    ${poke.apelido} (Lv. ${poke.nivel}) <br>
                    <small>${pokedex[poke.especie].nome} - ${pokedex[poke.especie].type}</small>
                    <div>${tags}</div>
                </div>
                
                <div class="stats-box">
                    <strong>HP:</strong> ${stats.hp}/${stats.hp} <br>
                    <strong>Atk:</strong> ${stats.atk} | <strong>Sp.Atk:</strong> ${stats.spAtk}<br>
                    <strong>Def:</strong> ${stats.def} | <strong>Sp.Def:</strong> ${stats.spDef}<br>
                    <strong>Speed:</strong> ${stats.speed}<br>
                    <strong>PA:</strong> ${stats.pa}<br>
                    <strong>Evasion:</strong> ${poke.evasion}
                </div>

                <div class="actions">
                    <button class="btn-move" onclick="moverPokemon(${poke.id})">
                        ${poke.local === 'TIME' ? 'Mover p/ Box' : 'Mover p/ Time'}
                    </button>
                    <button class="btn-release" onclick="deletarPokemon(${poke.id})">X</button>
                </div>
            </div>
        `;

        if (poke.local === 'TIME') {
            partyContainer.innerHTML += html;
        } else {
            boxContainer.innerHTML += html;
        }
    });
}

// --- INICIALIZAÇÃO ---
// Preencher o select de espécies
const select = document.getElementById('species-select');
for (let key in pokedex) {
    const option = document.createElement('option');
    option.value = key;
    option.innerText = pokedex[key].nome;
    select.appendChild(option);
}

document.getElementById('pokemon-form').addEventListener('submit', criarPokemon);
renderizarTela(); // Renderiza ao carregar a página

