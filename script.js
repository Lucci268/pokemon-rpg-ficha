// --- 1. GESTÃO DE DADOS LOCAL ---
let myPokemons = JSON.parse(localStorage.getItem('rpg_save_data_v2')) || [];

function salvarDados() {
    localStorage.setItem('rpg_save_data_v2', JSON.stringify(myPokemons));
    renderizarTela();
}

// --- 2. INTEGRAÇÃO COM POKEAPI ---

// Função assíncrona para buscar dados na API
async function fetchPokeAPIData(speciesName) {
    const formattedName = speciesName.toLowerCase().trim();
    const url = `https://pokeapi.co/api/v2/pokemon/${formattedName}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Pokémon não encontrado!');
        const data = await response.json();

        // Mapear os stats da API para o nosso formato interno
        const baseStats = {};
        data.stats.forEach(statEntry => {
            switch(statEntry.stat.name) {
                case 'hp': baseStats.hp = statEntry.base_stat; break;
                case 'attack': baseStats.atk = statEntry.base_stat; break;
                case 'defense': baseStats.def = statEntry.base_stat; break;
                case 'special-attack': baseStats.spatk = statEntry.base_stat; break;
                case 'special-defense': baseStats.spdef = statEntry.base_stat; break;
                case 'speed': baseStats.speed = statEntry.base_stat; break;
            }
        });

        // Pegar imagem oficial (artwork fica mais bonito que o sprite 2d)
        const imageUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
        const typesStr = data.types.map(t => t.type.name).join('/');

        return { baseStats, imageUrl, officialName: data.name, typesStr };

    } catch (error) {
        console.error(error);
        return null; // Retorna nulo se der erro
    }
}


// --- 3. CÁLCULOS RPG (Sessão Mantida) ---
function calcularStatus(baseStats, nivel) {
    const hpMax = Math.floor(((baseStats.hp + baseStats.def + baseStats.spdef) * nivel) / 50) || 1;
    const atkDano = 1 + ((baseStats.atk / 5) * nivel) / 100;
    const spAtkDano = 1 + ((baseStats.spatk / 5) * nivel) / 100;
    const defRed = ((baseStats.def / 5) * nivel) / 100;
    const spDefRed = ((baseStats.spdef / 5) * nivel) / 100;
    const speedMod = ((baseStats.speed / 5) * nivel) / 10;
    const paMax = 5 + (speedMod / 100);

    return {
        hp: Math.floor(hpMax),
        atk: Math.floor(atkDano) + "d",
        spAtk: Math.floor(spAtkDano) + "d",
        def: Math.floor(defRed),
        spDef: Math.floor(spDefRed),
        speed: speedMod.toFixed(1),
        pa: paMax.toFixed(2)
    };
}

// --- 4. AÇÕES DO USUÁRIO (Criar, Mover, Editar) ---

// Agora esta função é ASYNC porque precisa esperar a API
async function criarPokemonBotao(evento) {
    evento.preventDefault();
    
    const nameInput = document.getElementById('species-name');
    const loadingMsg = document.getElementById('loading-msg');
    const btnSubmit = document.getElementById('btn-submit');

    // UI de Carregamento
    loadingMsg.style.display = 'block';
    btnSubmit.disabled = true;

    // 1. Buscar na API
    const apiResult = await fetchPokeAPIData(nameInput.value);

    // UI Fim do Carregamento
    loadingMsg.style.display = 'none';
    btnSubmit.disabled = false;

    if (!apiResult) {
        alert(`Erro: Pokémon "${nameInput.value}" não encontrado na PokeAPI. Verifique o nome em inglês.`);
        return;
    }

    // 2. Coletar dados do formulário
    const nickname = document.getElementById('nickname').value;
    const level = parseInt(document.getElementById('level').value);
    const isAlpha = document.getElementById('is-alpha').checked;
    let isShiny = document.getElementById('is-shiny').checked;
    if (isAlpha) isShiny = true;

    // Coletar Movimentos Iniciais
    const moves = [
        document.getElementById('move1').value,
        document.getElementById('move2').value,
        document.getElementById('move3').value,
        document.getElementById('move4').value
    ].filter(m => m.trim() !== ""); // Remove inputs vazios

    // 3. Verificar Box/Time
    const timeCount = myPokemons.filter(p => p.local === 'TIME').length;
    const localInicial = timeCount < 6 ? 'TIME' : 'BOX';

    // 4. Criar o objeto Pokémon (Agora salvamos a URL da imagem e os Base Stats nele)
    const novoPoke = {
        id: Date.now(),
        speciesName: apiResult.officialName,
        types: apiResult.typesStr,
        imageUrl: apiResult.imageUrl, // Salvamos o link da imagem
        savedBaseStats: apiResult.baseStats, // Salvamos os stats base para não consultar a API sempre
        apelido: nickname || apiResult.officialName,
        nivel: level,
        shiny: isShiny,
        alpha: isAlpha,
        local: localInicial,
        evasion: 0,
        moves: moves // Array de strings
    };

    myPokemons.push(novoPoke);
    salvarDados();
    document.getElementById('pokemon-form').reset();
    alert(`${novoPoke.apelido} registrado com sucesso no ${localInicial}!`);
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
    if(confirm("Tem certeza?")) {
        myPokemons = myPokemons.filter(p => p.id !== id);
        salvarDados();
    }
}

// Nova função para editar movimentos
function editarMovimentos(id) {
    const poke = myPokemons.find(p => p.id === id);
    // Usando prompts simples para edição rápida por enquanto
    const newM1 = prompt("Movimento 1:", poke.moves[0] || "");
    const newM2 = prompt("Movimento 2:", poke.moves[1] || "");
    const newM3 = prompt("Movimento 3:", poke.moves[2] || "");
    const newM4 = prompt("Movimento 4:", poke.moves[3] || "");

    // Atualiza a lista filtrando vazios
    poke.moves = [newM1, newM2, newM3, newM4].filter(m => m && m.trim() !== "");
    salvarDados();
}


// --- 5. RENDERIZAÇÃO ---

function renderizarTela() {
    const partyContainer = document.getElementById('party-container');
    const boxContainer = document.getElementById('box-container');
    const partyCount = document.getElementById('party-count');

    partyContainer.innerHTML = '';
    boxContainer.innerHTML = '';

    const timePokemons = myPokemons.filter(p => p.local === 'TIME');
    partyCount.innerText = `${timePokemons.length}/6`;

    myPokemons.forEach(poke => {
        // Usamos os stats base salvos no objeto
        const stats = calcularStatus(poke.savedBaseStats, poke.nivel);
        
        let classes = 'pokemon-card';
        if (poke.shiny) classes += ' shiny';
        if (poke.alpha) classes += ' alpha';

        let tags = '';
        if (poke.alpha) tags += '🌟 ALPHA ';
        else if (poke.shiny) tags += '✨ SHINY ';

        // Renderizar lista de moves
        let movesHtml = poke.moves.length > 0 ? '<ul>' : 'Isqueiro (Nenhum)';
        poke.moves.forEach(m => movesHtml += `<li>${m}</li>`);
        if (poke.moves.length > 0) movesHtml += '</ul>';

        // HTML do Card atualizado com imagem e área de moves
        const html = `
            <div class="${classes}">
                <div class="card-header">
                    <img src="${poke.imageUrl}" alt="${poke.speciesName}" class="poke-img">
                    <div class="poke-info-header">
                        <h3>${poke.apelido} (Lv. ${poke.nivel})</h3>
                        <div class="poke-type">${poke.types}</div>
                        <small style="font-weight:bold; color: orange;">${tags}</small>
                    </div>
                </div>
                
                <div class="stats-box">
                    <strong>HP:</strong> ${stats.hp}/${stats.hp} | <strong>PA:</strong> ${stats.pa}<br>
                    <strong>Atk:</strong> ${stats.atk} | <strong>Sp.Atk:</strong> ${stats.spAtk}<br>
                    <strong>Def:</strong> ${stats.def} | <strong>Sp.Def:</strong> ${stats.spDef}<br>
                    <strong>Speed:</strong> ${stats.speed} | <strong>Eva:</strong> ${poke.evasion}
                </div>

                <div class="moves-box">
                    <strong>Movimentos:</strong>
                    ${movesHtml}
                </div>

                <div class="actions">
                    <button class="btn-move" onclick="moverPokemon(${poke.id})">
                        ${poke.local === 'TIME' ? 'Box' : 'Time'}
                    </button>
                    <button class="btn-edit-moves" onclick="editarMovimentos(${poke.id})">Moves</button>
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
document.getElementById('pokemon-form').addEventListener('submit', criarPokemonBotao);
renderizarTela();
