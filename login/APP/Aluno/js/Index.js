// Index.js
// Sala do Futuro V2
// Area do aluno


/*========================================
FIREBASE
========================================*/

import {
  initializeApp
}
from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
  getAuth,
  onAuthStateChanged,
  signOut
}
from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where
}
from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/*----------Realtime Database----------*/

import {
  getDatabase,
  ref,
  set,
  get,
  serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*========================================
CONFIGURACAO
========================================*/

const firebaseConfig = {

  apiKey:
  "AIzaSyCey_SsTCeHuTKwBaZ-Eo6_7LRa4l-5A80",

  authDomain:
  "salafuturov2prot.firebaseapp.com",

  projectId:
  "salafuturov2prot",

  storageBucket:
  "salafuturov2prot.firebasestorage.app",

  messagingSenderId:
  "352042722106",

  appId:
  "1:352042722106:web:395ba7ef400d1421426603",

  measurementId:
  "G-LW16X3NHH8"

};


/*========================================
INICIAR
========================================*/

const app =
initializeApp(
  firebaseConfig
);


const auth =
getAuth(app);


const db =
getFirestore(app);


const realtime =
getDatabase(app);


let usuarioAtual =
null;


let perfilAluno =
null;


/*========================================
ROTAS
========================================*/

const rotas = {

  login:
  "../loginal.html",


/*----------Ainda sem link----------*/

  tarefaSP:
  "",

  redacaoSP:
  "",


/*----------Plataformas----------*/

  matific:
  "https://www.matific.com/bra/pt-br/home/",

  ef:
  "https://www.ef.com.br/",

  elefante:
  "https://www.elefanteletrado.com.br/"

};


/*========================================
ATALHO
========================================*/

function $(id) {

  return document
  .getElementById(id);

}


/*========================================
TEXTO SEGURO
========================================*/

function textoSeguro(valor) {

  return String(
    valor ?? ""
  )

  .replaceAll(
    "&",
    "&amp;"
  )

  .replaceAll(
    "<",
    "&lt;"
  )

  .replaceAll(
    ">",
    "&gt;"
  )

  .replaceAll(
    '"',
    "&quot;"
  )

  .replaceAll(
    "'",
    "&#039;"
  );

}


/*========================================
MENU
========================================*/

function abrirPagina(nome) {

  document
  .querySelectorAll(
    ".pagina"
  )

  .forEach(
  function(pagina) {

    pagina.classList
    .remove(
      "ativa"
    );

  });


  const pagina =
  $("pagina-" + nome);


  if (pagina) {

    pagina.classList
    .add(
      "ativa"
    );

  }


  document
  .querySelectorAll(
    ".menu-botao"
  )

  .forEach(
  function(botao) {

    botao.classList
    .remove(
      "ativo"
    );

  });


  const botao =

  document
  .querySelector(

    '[data-pagina="' +
    nome +
    '"]'

  );


  if (botao) {

    botao.classList
    .add(
      "ativo"
    );

  }


  if (
    nome ===
    "notas"
  ) {

    carregarNotas();

  }


  window.scrollTo({

    top:
    0,

    behavior:
    "smooth"

  });

}


/*----------Menu lateral----------*/

document
.querySelectorAll(
  "[data-pagina]"
)

.forEach(
function(botao) {

  botao
  .addEventListener(
  "click",
  function() {

    abrirPagina(
      botao.dataset.pagina
    );

  });

});


/*----------Botoes internos----------*/

document
.querySelectorAll(
  "[data-abrir-pagina]"
)

.forEach(
function(botao) {

  botao
  .addEventListener(
  "click",
  function() {

    abrirPagina(
      botao.dataset.abrirPagina
    );

  });

});


/*----------Voltar inicio----------*/

if (
  $("voltarInicioBtn")
) {

  $("voltarInicioBtn")
  .addEventListener(
  "click",
  function() {

    abrirPagina(
      "inicio"
    );

  });

}


/*----------Abrir notas----------*/

if (
  $("abrirNotasCard")
) {

  $("abrirNotasCard")
  .addEventListener(
  "click",
  function() {

    abrirPagina(
      "notas"
    );

  });

}


/*========================================
LOGIN
========================================*/

onAuthStateChanged(
auth,
async function(user) {

  if (!user) {

    window.location.href =
    rotas.login;

    return;

  }


  usuarioAtual =
  user;


  await carregarPerfil();

  await carregarResumo();

});


/*========================================
PERFIL
========================================*/

async function carregarPerfil() {

  try {

    const resultado =

    await getDoc(

      doc(
        db,
        "usuarios",
        usuarioAtual.uid
      )

    );


    if (
      resultado.exists()
    ) {

      perfilAluno = {

        id:
        resultado.id,

        ...resultado.data()

      };

    }


    else {

      perfilAluno = {

        nome:
        usuarioAtual.displayName ||
        "Aluno",

        email:
        usuarioAtual.email ||
        "",

        turma:
        "",

        escolaId:
        "",

        faltas:
        0,

        xp:
        0

      };

    }


    atualizarPerfilTela();

  }


  catch(erro) {

    console.error(
      "Erro no perfil:",
      erro
    );

  }

}


/*========================================
ATUALIZAR PERFIL
========================================*/

function atualizarPerfilTela() {

  const nome =
  perfilAluno.nome ||
  "Aluno";


  const email =
  usuarioAtual.email ||
  perfilAluno.email ||
  "-";


  const turma =
  perfilAluno.turma ||
  "Turma não informada";


  const escola =
  perfilAluno.escolaNome ||
  perfilAluno.escolaId ||
  "Escola não informada";


  const iniciais =
  gerarIniciais(nome);


  if ($("nomeAluno")) {

    $("nomeAluno")
    .textContent =
    nome;

  }


  if ($("nomeTopo")) {

    $("nomeTopo")
    .textContent =
    nome;

  }


  if ($("turmaAluno")) {

    $("turmaAluno")
    .textContent =
    turma;

  }


  if ($("escolaAluno")) {

    $("escolaAluno")
    .textContent =
    escola;

  }


  if ($("avatarTopo")) {

    $("avatarTopo")
    .textContent =
    iniciais;

  }


  if ($("avatarPrincipal")) {

    $("avatarPrincipal")
    .textContent =
    iniciais;

  }


  if ($("turmaPlataformas")) {

    $("turmaPlataformas")
    .textContent =

    "Visualizando " +
    turma;

  }


/*----------Perfil----------*/

  if ($("perfilNome")) {

    $("perfilNome")
    .textContent =
    nome;

  }


  if ($("perfilEmail")) {

    $("perfilEmail")
    .textContent =
    email;

  }


  if ($("perfilTurma")) {

    $("perfilTurma")
    .textContent =
    turma;

  }


  if ($("perfilEscola")) {

    $("perfilEscola")
    .textContent =
    escola;

  }


/*----------Carteirinha----------*/

  if ($("avatarCarteirinha")) {

    $("avatarCarteirinha")
    .textContent =
    iniciais;

  }


  if ($("carteirinhaNome")) {

    $("carteirinhaNome")
    .textContent =
    nome;

  }


  if ($("carteirinhaTurma")) {

    $("carteirinhaTurma")
    .textContent =
    turma;

  }


  if ($("carteirinhaId")) {

    $("carteirinhaId")
    .textContent =

    "ID: " +
    usuarioAtual.uid;

  }

}


/*========================================
INICIAIS
========================================*/

function gerarIniciais(nome) {

  const partes =

  String(nome)
  .trim()
  .split(/\s+/);


  if (
    partes.length === 1
  ) {

    return partes[0]
    .substring(
      0,
      2
    )
    .toUpperCase();

  }


  return (

    partes[0][0]

    +

    partes[
      partes.length - 1
    ][0]

  )
  .toUpperCase();

}


/*========================================
RESUMO
========================================*/

async function carregarResumo() {


/*----------Faltas----------*/

  if (
    $("quantidadeFaltas")
  ) {

    $("quantidadeFaltas")
    .textContent =

    Number(
      perfilAluno.faltas ||
      0
    );

  }


/*----------Pendencias----------*/

  await carregarPendencias();

}


/*========================================
TAREFAS INTERNAS
========================================*/

async function carregarPendencias() {

  try {

    const tarefas =

    await getDocs(

      collection(
        db,
        "tarefas"
      )

    );


    const entregas =

    await getDocs(

      query(

        collection(
          db,
          "entregas"
        ),

        where(
          "alunoId",
          "==",
          usuarioAtual.uid
        )

      )

    );


    const tarefasEntregues =
    new Set();


    entregas
    .forEach(
    function(documento) {

      const dados =
      documento.data();


      if (
        dados.tarefaId
      ) {

        tarefasEntregues.add(
          dados.tarefaId
        );

      }

    });


    let pendencias =
    0;


    tarefas
    .forEach(
    function(documento) {

      const tarefa =
      documento.data();


      const mesmaTurma =

      !tarefa.turma

      ||

      String(
        tarefa.turma
      )
      .toUpperCase()

      ===

      String(
        perfilAluno.turma
      )
      .toUpperCase();


      const ativa =

      tarefa.ativa !==
      false;


      const entregue =

      tarefasEntregues
      .has(
        documento.id
      );


      if (

        mesmaTurma

        &&

        ativa

        &&

        !entregue

      ) {

        pendencias++;

      }

    });


    if (
      $("quantidadePendencias")
    ) {

      $("quantidadePendencias")
      .textContent =
      pendencias;

    }


    if (
      $("contadorTarefas")
    ) {

      $("contadorTarefas")
      .textContent =
      pendencias;

    }

  }


  catch(erro) {

    console.error(
      "Erro nas tarefas:",
      erro
    );

  }

}


/*========================================
PLATAFORMAS
========================================*/

document
.querySelectorAll(
  "[data-plataforma]"
)

.forEach(
function(botao) {

  botao
  .addEventListener(
  "click",
  function() {

    const plataforma =
    botao.dataset.plataforma;


/*----------Tarefa SP----------*/

    if (
      plataforma ===
      "tarefa-sp"
    ) {

      if (
        !rotas.tarefaSP
      ) {

        alert(
          "Tarefa SP ainda será configurada."
        );

        return;

      }


      window.open(
        rotas.tarefaSP,
        "_blank"
      );

    }


/*----------Redacao Paulista----------*/

    if (
      plataforma ===
      "redacao-sp"
    ) {

      if (
        !rotas.redacaoSP
      ) {

        alert(
          "Redação Paulista ainda será configurada."
        );

        return;

      }


      window.open(
        rotas.redacaoSP,
        "_blank"
      );

    }


/*----------Matific----------*/

    if (
      plataforma ===
      "matific"
    ) {

      window.open(

        rotas.matific,

        "_blank",

        "noopener,noreferrer"

      );

    }


/*----------EF----------*/

    if (
      plataforma ===
      "ef"
    ) {

      window.open(

        rotas.ef,

        "_blank",

        "noopener,noreferrer"

      );

    }


/*----------Elefante Letrado----------*/

    if (
      plataforma ===
      "elefante"
    ) {

      window.open(

        rotas.elefante,

        "_blank",

        "noopener,noreferrer"

      );

    }

  });

});


/*========================================
MENSAGEM DO ALUNO
REALTIME DATABASE
========================================*/

if (
  $("atividadeDiaForm")
) {

  $("atividadeDiaForm")
  .addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    if (
      !usuarioAtual
    ) {

      return;

    }


    const hoje =
    dataHoje();


/*
Estrutura:

mensagensAlunos
   UID
      2026-08-28
*/


    const caminho =

    "mensagensAlunos/" +

    usuarioAtual.uid +

    "/" +

    hoje;


    const referencia =

    ref(
      realtime,
      caminho
    );


    try {


/*----------Verificar se ja publicou hoje----------*/

      const resultado =

      await get(
        referencia
      );


      if (
        resultado.exists()
      ) {

        mostrarStatusMensagem(

          "erro",

          "Você já publicou a mensagem de hoje."

        );

        return;

      }


/*----------Salvar mensagem----------*/

      await set(

        referencia,

        {

          alunoId:
          usuarioAtual.uid,

          alunoNome:
          perfilAluno.nome ||
          "Aluno",

          email:
          usuarioAtual.email ||
          "",

          turma:
          perfilAluno.turma ||
          "",

          escolaId:
          perfilAluno.escolaId ||
          "",

          data:
          hoje,

          titulo:
          $("atividadeTitulo")
          .value
          .trim(),

          mensagem:
          $("atividadeTexto")
          .value
          .trim(),

          criadoEm:
          serverTimestamp()

        }

      );


      mostrarStatusMensagem(

        "ok",

        "Mensagem publicada."

      );


      $("atividadeDiaForm")
      .reset();


      atualizarContadorMensagem();

    }


    catch(erro) {

      console.error(
        "Erro no Realtime Database:",
        erro
      );


      mostrarStatusMensagem(

        "erro",

        "Não foi possível publicar a mensagem."

      );

    }

  });

}


/*========================================
STATUS DA MENSAGEM
========================================*/

function mostrarStatusMensagem(
  tipo,
  texto
) {

  const elemento =
  $("atividadeMensagem");


  if (!elemento) {

    return;

  }


  elemento.className =

  "mensagem-status " +
  tipo;


  elemento.textContent =
  texto;

}


/*========================================
VER SE PUBLICOU HOJE
========================================*/

async function atualizarContadorMensagem() {

  if (
    !usuarioAtual
  ) {

    return;

  }


  try {

    const hoje =
    dataHoje();


    const referencia =

    ref(

      realtime,

      "mensagensAlunos/" +

      usuarioAtual.uid +

      "/" +

      hoje

    );


    const resultado =

    await get(
      referencia
    );


    const quantidade =

    resultado.exists()
    ? 1
    : 0;


    if (
      $("quantidadeMensagens")
    ) {

      $("quantidadeMensagens")
      .textContent =
      quantidade;

    }


    if (
      $("contadorMensagensMenu")
    ) {

      $("contadorMensagensMenu")
      .textContent =
      quantidade;

    }

  }


  catch(erro) {

    console.error(
      erro
    );

  }

}


/*========================================
DATA ATUAL
========================================*/

function dataHoje() {

  const agora =
  new Date();


  const ano =
  agora.getFullYear();


  const mes =

  String(
    agora.getMonth() + 1
  )

  .padStart(
    2,
    "0"
  );


  const dia =

  String(
    agora.getDate()
  )

  .padStart(
    2,
    "0"
  );


  return (

    ano +
    "-" +
    mes +
    "-" +
    dia

  );

}


/*========================================
NOTAS
========================================*/

async function carregarNotas() {

  if (
    !usuarioAtual
  ) {

    return;

  }


  const tabela =
  $("tabelaNotas");


  if (!tabela) {

    return;

  }


  tabela.innerHTML =

  `

  <tr>

    <td colspan="3">

      Carregando...

    </td>

  </tr>

  `;


  try {

    const resultado =

    await getDocs(

      query(

        collection(
          db,
          "notas"
        ),

        where(
          "alunoId",
          "==",
          usuarioAtual.uid
        )

      )

    );


    tabela.innerHTML =
    "";


    resultado
    .forEach(
    function(documento) {

      const nota =
      documento.data();


      tabela
      .insertAdjacentHTML(

        "beforeend",

        `

        <tr>

          <td>

            ${textoSeguro(
              nota.disciplina ||
              "-"
            )}

          </td>

          <td>

            ${textoSeguro(
              nota.bimestre ||
              "-"
            )}

          </td>

          <td>

            ${textoSeguro(
              nota.nota ??
              "-"
            )}

          </td>

        </tr>

        `

      );

    });


    if (
      resultado.empty
    ) {

      tabela.innerHTML =

      `

      <tr>

        <td colspan="3">

          Nenhuma nota registrada.

        </td>

      </tr>

      `;

    }

  }


  catch(erro) {

    console.error(
      erro
    );


    tabela.innerHTML =

    `

    <tr>

      <td colspan="3">

        Erro ao carregar notas.

      </td>

    </tr>

    `;

  }

}


/*========================================
SAIR
========================================*/

if (
  $("sairBtn")
) {

  $("sairBtn")
  .addEventListener(
  "click",
  async function() {

    await signOut(
      auth
    );


    window.location.href =
    rotas.login;

  });

}


/*========================================
WEB SPEECH API
========================================*/

function falar(texto) {

  if (
    !(
      "speechSynthesis"
      in window
    )
  ) {

    alert(
      "Leitura por voz não disponível."
    );

    return;

  }


  window
  .speechSynthesis
  .cancel();


  const fala =

  new SpeechSynthesisUtterance(
    texto
  );


  fala.lang =
  "pt-BR";


  fala.rate =
  1;


  fala.pitch =
  1;


  window
  .speechSynthesis
  .speak(
    fala
  );

}


/*----------Ler pagina----------*/

if (
  $("lerPagina")
) {

  $("lerPagina")
  .addEventListener(
  "click",
  function() {

    falar(

      $("conteudo")
      .innerText

    );

  });

}


/*----------Ler selecionado----------*/

if (
  $("lerSelecionado")
) {

  $("lerSelecionado")
  .addEventListener(
  "click",
  function() {

    const texto =

    window
    .getSelection()
    .toString()
    .trim();


    if (!texto) {

      alert(
        "Selecione algum texto."
      );

      return;

    }


    falar(
      texto
    );

  });

}


/*----------Parar leitura----------*/

if (
  $("pararLeitura")
) {

  $("pararLeitura")
  .addEventListener(
  "click",
  function() {

    window
    .speechSynthesis
    .cancel();

  });

}


/*========================================
INICIAR CONTADOR
========================================*/

onAuthStateChanged(
auth,
function(user) {

  if (user) {

    atualizarContadorMensagem();

  }

});
