const datiIniziali = [
  { id: 1, titolo: "Beauty Behind the Madness", artista: "The Weeknd", anno: 2015, stato: "Ascoltato"    },
  { id: 2, titolo: "Thriller",                  artista: "Michael Jackson", anno: 1982, stato: "Ascoltato"    },
  { id: 3, titolo: "Random Access Memories",    artista: "Daft Punk",  anno: 2013, stato: "Non ascoltato" },
  { id: 4, titolo: "Back in Black",             artista: "AC/DC",      anno: 1980, stato: "Non ascoltato" },
  { id: 5, titolo: "To Pimp a Butterfly",       artista: "Kendrick Lamar", anno: 2015, stato: "Ascoltato"  },
];
let album = [];
let filtroCorrente = "Tutti";
let ordinamentoCorrente = "anno-asc";
let ricercaCorrente = "";

const salvato = localStorage.getItem("dati");
       if (salvato) {
        album = JSON.parse(salvato);
       } else {
        album = [...datiIniziali];
       }
 


/* RENDER */
function render() {
  let risultato = [...album];
 
  // Filtra per stato
  if (filtroCorrente !== "Tutti") {
    risultato = risultato.filter(a => a.stato === filtroCorrente);
  }
 
  // Filtra per ricerca
  if (ricercaCorrente.trim() !== "") {
    const q = ricercaCorrente.toLowerCase();
    risultato = risultato.filter(
      a =>
        a.titolo.toLowerCase().includes(q) ||
        a.artista.toLowerCase().includes(q)
    );
  }
 
  // Ordina
  risultato.sort((a, b) => {
    switch (ordinamentoCorrente) {
      case "anno-asc":    return (a.anno || 0) - (b.anno || 0);
      case "anno-desc":   return (b.anno || 0) - (a.anno || 0);
      case "titolo-asc":  return a.titolo.localeCompare(b.titolo);
      case "titolo-desc": return b.titolo.localeCompare(a.titolo);
      default:            return 0;
    }
  });
 
  // Svuota il container DOM
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
 
  // Ricrea gli elementi DOM
  risultato.forEach(alb => {
    const card = document.createElement("div");
    card.className =
      "libro-card " +
      (alb.stato === "Ascoltato" ? "stato-letto" : "stato-da-leggere");
    card.dataset.id = alb.id;
 
    const badgeClass =
      alb.stato === "Ascoltato" ? "badge badge-letto" : "badge badge-da-leggere";
 
    const btnToggleLabel =
      alb.stato === "Ascoltato" ? "Segna non ascoltato" : "Segna ascoltato";
 
    card.innerHTML = `
      <div class="libro-info">
        <div class="libro-titolo">${alb.titolo}</div>
        <div class="libro-meta">${alb.artista}${alb.anno ? " — " + alb.anno : ""}</div>
      </div>
      <div class="libro-azioni">
        <span class="${badgeClass}">${alb.stato}</span>
        <button class="btn-azione btn-toggle" data-id="${alb.id}">${btnToggleLabel}</button>
        <button class="btn-azione btn-modifica" data-id="${alb.id}">Modifica</button>
        <button class="btn-azione btn-elimina" data-id="${alb.id}">Elimina</button>
      </div>
    `;
 
    lista.appendChild(card);
  });
 
  // Aggiorna statistiche
  const totale = album.length;
  const ascoltati = album.filter(a => a.stato === "Ascoltato").length;
  const nonAscoltati = totale - ascoltati;
  const percentuale = totale > 0 ? Math.round((ascoltati / totale) * 100) : 0;
 
  document.getElementById("totale").textContent = totale;
  document.getElementById("ascoltati").textContent = ascoltati;
  document.getElementById("nonAscoltati").textContent = nonAscoltati;
  document.getElementById("barra").style.width = percentuale + "%";
 
  localStorage.setItem("dati", JSON.stringify(album));
}



// FORM CON VALIDAZIONE

document.getElementById("formAlbum").addEventListener("submit", function (event) {
  event.preventDefault();
 
  const titolo  = document.getElementById("titolo").value.trim();
  const artista = document.getElementById("artista").value.trim();
  const anno    = document.getElementById("anno").value.trim();
  const stato   = document.getElementById("stato").value;
 
  if (!titolo || !artista) {
    notifica("Titolo e artista sono obbligatori.");
    return;
  }
 
  const nuovoAlbum = {
    id: Date.now(),
    titolo,
    artista,
    anno: anno ? parseInt(anno) : null,
    stato,
  };
 
  album.push(nuovoAlbum);
  this.reset();
  render();
  notifica("Album aggiunto!");
});


// INTERAZIONI BASE 

document.getElementById("lista").addEventListener("click", function (e) {
  const id = parseInt(e.target.dataset.id);
  if (!id) return;

  // BUTTON SU
  if (e.target.classList.contains("btn-su")) {
    const idx = album.findIndex(a => a.id === id);
    if (idx > 0) {
      [album[idx - 1], album[idx]] = [album[idx], album[idx - 1]];
      render();
    }
    return;
  }
 
  // BUTTON GIU
  if (e.target.classList.contains("btn-giu")) {
    const idx = album.findIndex(a => a.id === id);
    if (idx < album.length - 1) {
      [album[idx], album[idx + 1]] = [album[idx + 1], album[idx]];
      render();
    }
    return;
  }
 
  // ELIMINA
  if (e.target.classList.contains("btn-elimina")) {
    album = album.filter(a => a.id !== id);
    render();
    notifica("Album eliminato.");
    return;
  }
 
  // TOGGLE STATO
  if (e.target.classList.contains("btn-toggle")) {
    const alb = album.find(a => a.id === id);
    if (alb) {
      alb.stato = alb.stato === "Ascoltato" ? "Non ascoltato" : "Ascoltato";
      render();
    }
    return;
  }
 
  // MODIFICA INLINE
  if (e.target.classList.contains("btn-modifica")) {
    const card = e.target.closest(".libro-card");
    const titoloEl = card.querySelector(".libro-titolo");
 
    if (card.querySelector(".input-modifica")) return;
 
    const valoreAttuale = titoloEl.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "input-modifica";
    input.value = valoreAttuale;
 
    titoloEl.replaceWith(input);
    input.focus();
 
    function confermaModifica() {
      const nuovoTitolo = input.value.trim();
      if (nuovoTitolo) {
        const alb = album.find(a => a.id === id);
        if (alb) alb.titolo = nuovoTitolo;
      }
      render();
    }
 
    input.addEventListener("blur", confermaModifica);
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter")  input.blur();
      if (ev.key === "Escape") render();
    });
  }
});


// RICERCA, FILTRO, ORDINAMENTO

document.getElementById("ricerca").addEventListener("input", function () {
  ricercaCorrente = this.value;
  render();
});
 
/* ─────────────────── FILTRO ─────────────────── */
document.getElementById("filtro").addEventListener("change", function () {
  filtroCorrente = this.value;
  render();
});
 
/* ─────────────────── ORDINAMENTO ─────────────────── */
document.getElementById("ordinamento").addEventListener("change", function () {
  ordinamentoCorrente = this.value;
  render();
});


// NOTIFICHE TEMPORANEE

function notifica(testo) {
  const el = document.getElementById("notifica");
  el.textContent = testo;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 3000);
}


// TEMA CHIARO/SCURO

document.getElementById("btnTema").addEventListener("click", function () {
  document.body.classList.toggle("dark");
  this.textContent = document.body.classList.contains("dark")
    ? "Tema chiaro"
    : "Tema scuro";
});

render();
