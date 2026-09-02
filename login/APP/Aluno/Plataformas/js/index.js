/*====================================================
01 - FIREBASE
====================================================*/

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-ai.js";


const firebaseConfig = {
  apiKey: "AIzaSyCey_SsTCeHuTKwBaZ-Eo6_7LRa4l-5A80",
  authDomain: "salafuturov2prot.firebaseapp.com",
  projectId: "salafuturov2prot",
  storageBucket: "salafuturov2prot.firebasestorage.app",
  messagingSenderId: "352042722106",
  appId: "1:352042722106:web:395ba7ef400d1421426603",
  measurementId: "G-LW16X3NHH8"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/*====================================================
02 - GEMINI PELO FIREBASE AI LOGIC
====================================================*/

const ai = getAI(
  app,
  {
    backend: new GoogleAIBackend()
  }
);


const schemaDesafio = Schema.object({
  properties: {
    titulo: Schema.string(),
    componente: Schema.string(),
    enunciado: Schema.string(),
    alternativas: Schema.array({
      items: Schema.string()
    }),
    respostaCorreta: Schema.number(),
    explicacao: Schema.string()
  }
});


const modeloDesafio = getGenerativeModel(
  ai,
  {
    model: "gemini-3.7-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schemaDesafio
    }
  }
);


/*====================================================
03 - ESTADO DO APP
====================================================*/

let usuarioAtual = null;
let perfilAluno = null;
let dadosJSON = null;
let atividades = [];
let entregas = new Map();
let ranking = [];
let guildas = [];
let trabalhosGuilda = [];
let premiacoes = [];
let atividadeAtual = null;
let desafioAtual = null;

let pontuacaoAtual = {
  pontosSemana: 0,
  pontosQuinzena: 0,
  pontosTotal: 0
};


/*====================================================
04 - ATALHOS
====================================================*/

function $(id) {
  return document.getElementById(id);
}


function textoSeguro(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function normalizar(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}


function hojeISO() {
  const data = new Date();

  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, "0"),
    String(data.getDate()).padStart(2, "0")
  ].join("-");
}


function hojeLegivel() {
  return new Date().toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
}


function semanaId() {
  const hoje = new Date();
  const inicio = new Date(hoje);
  const dia = hoje.getDay();
  const ajuste = dia === 0 ? -6 : 1 - dia;

  inicio.setDate(
    hoje.getDate() + ajuste
  );

  return [
    inicio.getFullYear(),
    String(inicio.getMonth() + 1).padStart(2, "0"),
    String(inicio.getDate()).padStart(2, "0")
  ].join("-");
}


function aviso(texto) {
  if ($("avisoSistema")) {
    $("avisoSistema").textContent = texto;
  }
}


/*====================================================
05 - LOGIN
====================================================*/

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {
      window.location.href = "../index.html";
      return;
    }

    usuarioAtual = user;

    try {
      await carregarPerfil();
      await carregarJSON();

      await Promise.all([
        carregarEntregas(),
        carregarPontuacao(),
        carregarRanking(),
        carregarGuildas(),
        carregarTrabalhosGuilda(),
        carregarPremiacoes()
      ]);

      prepararFiltros();
      renderizarTudo();

      // O desafio diário é carregado depois do restante da tela.
      // Se a IA falhar, o JSON possui um fallback para a apresentação continuar funcionando.
      await carregarDesafioDiario();
    }

    catch (erro) {
      console.error(
        "Erro ao iniciar Tarefa SP:",
        erro
      );

      aviso(
        "Não foi possível iniciar o Tarefa SP."
      );
    }
  }
);


/*====================================================
06 - PERFIL DO ALUNO
====================================================*/

async function carregarPerfil() {
  const referencia = doc(
    db,
    "usuarios",
    usuarioAtual.uid
  );

  const resultado = await getDoc(
    referencia
  );

  if (!resultado.exists()) {
    throw new Error(
      "Perfil do aluno não encontrado."
    );
  }

  perfilAluno = {
    id: resultado.id,
    ...resultado.data()
  };

  const nome =
    perfilAluno.nome
    || usuarioAtual.email
    || "Aluno";

  $("nomeAlunoTopo").textContent = nome;
  $("avatarAluno").textContent = nome.charAt(0).toUpperCase();
}


/*====================================================
07 - CARREGAR JSON
====================================================*/

async function carregarJSON() {
  const resposta = await fetch(
    "./atividades.json",
    {
      cache: "no-store"
    }
  );

  if (!resposta.ok) {
    throw new Error(
      "Erro ao carregar atividades.json"
    );
  }

  dadosJSON = await resposta.json();

  atividades = Array.isArray(
    dadosJSON.atividades
  )
    ? dadosJSON.atividades
    : [];
}


/*====================================================
08 - ENTREGAS
====================================================*/

async function carregarEntregas() {
  entregas = new Map();

  const resultado = await getDocs(
    query(
      collection(
        db,
        "entregasTarefaSP"
      ),
      where(
        "alunoId",
        "==",
        usuarioAtual.uid
      )
    )
  );

  resultado.forEach(item => {
    const entrega = {
      id: item.id,
      ...item.data()
    };

    entregas.set(
      entrega.atividadeId,
      entrega
    );
  });
}


/*====================================================
09 - PONTUAÇÃO
====================================================*/

async function carregarPontuacao() {
  const referencia = doc(
    db,
    "pontuacaoTarefaSP",
    usuarioAtual.uid
  );

  const resultado = await getDoc(
    referencia
  );

  if (!resultado.exists()) {
    pontuacaoAtual = {
      pontosSemana: 0,
      pontosQuinzena: 0,
      pontosTotal: 0
    };

    return;
  }

  const dados = resultado.data();

  pontuacaoAtual = {
    pontosSemana: Number(dados.pontosSemana || 0),
    pontosQuinzena: Number(dados.pontosQuinzena || 0),
    pontosTotal: Number(dados.pontosTotal || 0)
  };
}


/*====================================================
10 - RANKING
====================================================*/

async function carregarRanking() {
  const resultado = await getDocs(
    collection(
      db,
      "pontuacaoTarefaSP"
    )
  );

  ranking = [];

  resultado.forEach(item => {
    ranking.push({
      id: item.id,
      ...item.data()
    });
  });

  ranking.sort(
    (a, b) =>
      Number(b.pontosSemana || 0)
      -
      Number(a.pontosSemana || 0)
  );
}


/*====================================================
11 - GUILDAS
====================================================*/

async function carregarGuildas() {
  const resultado = await getDocs(
    collection(
      db,
      "guildas"
    )
  );

  guildas = [];

  resultado.forEach(item => {
    guildas.push({
      id: item.id,
      ...item.data()
    });
  });
}


/*====================================================
12 - TRABALHOS DA GUILDA
====================================================*/

async function carregarTrabalhosGuilda() {
  const resultado = await getDocs(
    collection(
      db,
      "trabalhosGuilda"
    )
  );

  trabalhosGuilda = [];

  resultado.forEach(item => {
    trabalhosGuilda.push({
      id: item.id,
      ...item.data()
    });
  });
}


/*====================================================
13 - PREMIAÇÕES
====================================================*/

async function carregarPremiacoes() {
  const resultado = await getDocs(
    collection(
      db,
      "premiacoes"
    )
  );

  premiacoes = [];

  resultado.forEach(item => {
    const dados = item.data();

    if (dados.ativo !== false) {
      premiacoes.push({
        id: item.id,
        ...dados
      });
    }
  });
}


/*====================================================
14 - FILTROS
====================================================*/

function prepararFiltros() {
  const turmas = new Set();

  if (
    Array.isArray(
      perfilAluno.turmas
    )
  ) {
    perfilAluno.turmas.forEach(turma => {
      turmas.add(turma);
    });
  }

  if (perfilAluno.turma) {
    turmas.add(
      perfilAluno.turma
    );
  }

  turmas.forEach(turma => {
    const option = document.createElement(
      "option"
    );

    option.value = turma;
    option.textContent = turma;

    $("filtroTurma").appendChild(
      option
    );
  });

  const componentes =
    dadosJSON?.config?.componentes
    || [];

  componentes.forEach(componente => {
    const option = document.createElement(
      "option"
    );

    option.value = componente;
    option.textContent = componente;

    $("filtroComponente").appendChild(
      option
    );
  });

  $("filtroTurma").addEventListener(
    "change",
    renderizarAtividades
  );

  $("filtroStatus").addEventListener(
    "change",
    renderizarAtividades
  );

  $("filtroComponente").addEventListener(
    "change",
    renderizarAtividades
  );
}


/*====================================================
15 - QUINZENA ATUAL
====================================================*/

function quinzenaAtual() {
  const hoje = hojeISO();

  return dadosJSON
    ?.quinzenas
    ?.find(
      item =>
        hoje >= item.inicio
        &&
        hoje <= item.fim
    )
    || null;
}


/*====================================================
16 - ATIVIDADES DISPONÍVEIS
====================================================*/

function alunoPodeVerAtividade(atividade) {
  if (
    !atividade.turmas
    ||
    !atividade.turmas.length
  ) {
    return true;
  }

  const turmasAluno = new Set();

  if (
    Array.isArray(
      perfilAluno.turmas
    )
  ) {
    perfilAluno.turmas.forEach(turma => {
      turmasAluno.add(
        normalizar(turma)
      );
    });
  }

  if (perfilAluno.turma) {
    turmasAluno.add(
      normalizar(
        perfilAluno.turma
      )
    );
  }

  return atividade.turmas.some(
    turma =>
      turmasAluno.has(
        normalizar(turma)
      )
  );
}


/*====================================================
17 - FILTRAR ATIVIDADES
====================================================*/

function obterAtividadesFiltradas() {
  const turma = $("filtroTurma").value;
  const status = $("filtroStatus").value;
  const componente = $("filtroComponente").value;

  return atividades
    .filter(
      alunoPodeVerAtividade
    )
    .filter(atividade => {

      if (turma !== "todas") {
        const pertence = atividade.turmas?.some(
          item =>
            normalizar(item)
            ===
            normalizar(turma)
        );

        if (!pertence) {
          return false;
        }
      }

      if (
        componente !== "todos"
        &&
        atividade.componente !== componente
      ) {
        return false;
      }

      const entregue = entregas.has(
        atividade.id
      );

      if (
        status === "a-fazer"
        &&
        entregue
      ) {
        return false;
      }

      if (
        status === "entregues"
        &&
        !entregue
      ) {
        return false;
      }

      return true;
    });
}


/*====================================================
18 - RENDERIZAR ATIVIDADES
====================================================*/

function renderizarAtividades() {
  const lista = $("listaAtividades");
  const filtradas = obterAtividadesFiltradas();

  $("textoQuantidadeAtividades").textContent =
    `${filtradas.length} atividade(s)`;

  if (!filtradas.length) {
    lista.innerHTML = `
      <div class="vazio">
        <div style="font-size:60px;margin-bottom:15px;">☑</div>
        Nenhuma Tarefa encontrada
      </div>
    `;

    return;
  }

  lista.innerHTML = filtradas
    .map(atividade => {
      const entregue = entregas.has(
        atividade.id
      );

      return `
        <article class="atividade-card ${entregue ? "entregue" : ""}">
          <div>
            <span class="etiqueta">
              ${textoSeguro(atividade.componente)}
            </span>

            <h3>${textoSeguro(atividade.titulo)}</h3>

            <p>${textoSeguro(atividade.descricao)}</p>

            <p>
              <strong>
                ${Number(atividade.pontos || 0)} pontos
              </strong>
            </p>

            <span class="etiqueta ${entregue ? "status-entregue" : "status-pendente"}">
              ${entregue ? "Entregue" : "A fazer"}
            </span>
          </div>

          <div class="atividade-acoes">
            <button
              class="botao-principal"
              type="button"
              data-atividade="${textoSeguro(atividade.id)}"
            >
              ${entregue ? "Ver resultado" : "Fazer atividade"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  lista
    .querySelectorAll(
      "[data-atividade]"
    )
    .forEach(botao => {
      botao.addEventListener(
        "click",
        () => {
          abrirAtividade(
            botao.dataset.atividade
          );
        }
      );
    });
}


/*====================================================
19 - ABRIR ATIVIDADE
====================================================*/

function abrirAtividade(id) {
  atividadeAtual = atividades.find(
    item => item.id === id
  );

  if (!atividadeAtual) {
    return;
  }

  const entrega = entregas.get(
    atividadeAtual.id
  );

  $("modalComponente").textContent =
    atividadeAtual.componente;

  $("modalTitulo").textContent =
    atividadeAtual.titulo;

  $("modalDescricao").textContent =
    atividadeAtual.descricao || "";

  $("modalEnunciado").textContent =
    atividadeAtual.enunciado || "";

  $("resultadoAtividade").className =
    "resultado";

  $("resultadoAtividade").innerHTML = "";
  $("areaResposta").innerHTML = "";
  $("botaoEntregar").hidden = false;

  if (entrega) {
    mostrarResultado(entrega);
  }
  else {
    montarResposta();
  }

  $("modalAtividade").hidden = false;

  document.body.style.overflow =
    "hidden";

  $("fecharModal").focus();
}


/*====================================================
20 - MONTAR CAMPO DE RESPOSTA
====================================================*/

function montarResposta() {
  const area = $("areaResposta");

  if (
    atividadeAtual.tipo
    ===
    "multiplaEscolha"
  ) {
    area.innerHTML = atividadeAtual
      .alternativas
      .map(alternativa => `
        <label class="alternativa">

          <input
            type="radio"
            name="resposta"
            value="${textoSeguro(alternativa.id)}"
            required
          >

          ${textoSeguro(alternativa.texto)}

        </label>
      `)
      .join("");

    return;
  }

  area.innerHTML = `

    <label for="respostaTexto">

      <strong>
        Sua resposta
      </strong>

    </label>

    <textarea
      id="respostaTexto"
      maxlength="${Number(
        atividadeAtual.maximoCaracteres
        || 2000
      )}"
      required
    ></textarea>

  `;
}


/*====================================================
21 - ENTREGAR ATIVIDADE
====================================================*/

$("formAtividade").addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    if (
      !atividadeAtual
      ||
      entregas.has(
        atividadeAtual.id
      )
    ) {
      return;
    }

    let resposta = "";
    let resultado = "enviado";

    if (
      atividadeAtual.tipo
      ===
      "multiplaEscolha"
    ) {

      const selecionada =
        document.querySelector(
          'input[name="resposta"]:checked'
        );

      if (!selecionada) {

        aviso(
          "Escolha uma alternativa."
        );

        return;
      }

      resposta =
        selecionada.value;

      resultado =
        resposta
        ===
        atividadeAtual.respostaCorreta

          ? "correto"

          : "incorreto";
    }

    else {

      resposta =
        $("respostaTexto")
          ?.value
          .trim()
        || "";

      if (!resposta) {
        return;
      }

      resultado =
        "aguardando-correcao";
    }

    $("botaoEntregar").disabled =
      true;

    try {

      await registrarEntrega(
        resposta,
        resultado
      );

      await Promise.all([
        carregarEntregas(),
        carregarPontuacao(),
        carregarRanking()
      ]);

      renderizarTudo();

      const entrega =
        entregas.get(
          atividadeAtual.id
        );

      mostrarResultado(
        entrega
      );

      aviso(
        "Atividade entregue com sucesso."
      );
    }

    catch (erro) {
