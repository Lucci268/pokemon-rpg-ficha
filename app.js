const natures = {
  Hardy: {},
  Lonely: { atk: 20, def: -20 },
  Brave: { atk: 20, spd: -20 },
  Adamant: { atk: 20, spatk: -20 },
  Naughty: { atk: 20, spdef: -20 },
  Docile: {},
  Bold: { def: 20, atk: -20 },
  Modest: { spatk: 20, atk: -20 },
  Mild: { spatk: 20, def: -20 },
  Quiet: { spatk: 20, spd: -20 },
  Rash: { spatk: 20, spdef: -20 },
  Quirky: {},
  Calm: { spdef: 20, atk: -20 },
  Gentle: { spdef: 20, def: -20 },
  Sassy: { spdef: 20, spd: -20 },
  Careful: { spdef: 20, spatk: -20 }
};

const natureSelect = document.getElementById("nature");
for (let n in natures) {
  let opt = document.createElement("option");
  opt.value = n;
  opt.textContent = n;
  natureSelect.appendChild(opt);
}

function aplicarNature(base, nature, stat) {
  if (!natures[nature] || !natures[nature][stat]) return base;
  return base + natures[nature][stat];
}

function calcularStats() {
  let nature = document.getElementById("nature").value;

  let hp = parseInt(document.getElementById("hp_base").value || 0);
  let atk = parseInt(document.getElementById("atk_base").value || 0);
  let def = parseInt(document.getElementById("def_base").value || 0);
  let spatk = parseInt(document.getElementById("spatk_base").value || 0);
  let spdef = parseInt(document.getElementById("spdef_base").value || 0);
  let spd = parseInt(document.getElementById("spd_base").value || 0);

  atk = aplicarNature(atk, nature, "atk");
  def = aplicarNature(def, nature, "def");
  spatk = aplicarNature(spatk, nature, "spatk");
  spdef = aplicarNature(spdef, nature, "spdef");
  spd = aplicarNature(spd, nature, "spd");

  document.getElementById("final_stats").innerHTML = `
    <strong>HP:</strong> ${hp}<br>
    <strong>ATK:</strong> ${atk}<br>
    <strong>DEF:</strong> ${def}<br>
    <strong>SP ATK:</strong> ${spatk}<br>
    <strong>SP DEF:</strong> ${spdef}<br>
    <strong>SPD:</strong> ${spd}<br>
  `;
}

function abrirMovimentos() {
  document.getElementById("modal-movimentos").classList.remove("hidden");
}

function fecharMovimentos() {
  document.getElementById("modal-movimentos").classList.add("hidden");
}

function addMove() {
  let container = document.getElementById("lista-movimentos");
  let div = document.createElement("div");
  div.className = "move-item";
  div.innerHTML = `
    <input type="text" placeholder="Nome do Movimento" />
    <input type="number" placeholder="Power" />
    <input type="number" placeholder="Accuracy %" />
    <hr>
  `;
  container.appendChild(div);
}
