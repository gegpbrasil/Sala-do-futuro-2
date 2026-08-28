// Index.js
// Sala do Futuro V2
// Area do aluno


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

  setDoc,

  query,

  where,

  serverTimestamp

}
from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/*========================================
Vou fazer a configuração manual
========================================*/


const firebaseConfig = {

  apiKey:
  "",

  authDomain:
  "",

  projectId:
  "",

  storageBucket:
  "",

  messagingSenderId:
  "",

  appId:
  ""

};


const app =
initializeApp(
  firebaseConfig
);


const auth =
getAuth(app);


const db =
getFirestore(app);


let usuarioAtual =
null;


let perfilAluno =
null;


/*========================================
Encaminhamentos
========================================*/


const rotas = {


/*----------Login----------*/

  login:

  "../loginal.html",


/*----------Ainda sera configurado----------*/

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
Caminhos secundarios
========================================*/


function $(id) {

  return document
  .getElementById(id);

}


/*========================================
Parte incial
========================================*/


function abrirPagina(
  nome
) {


  document
  .querySelectorAll(
    ".pagina"
  )

  .forEach(
  function(pagina) {

    pagina
    .classList
    .remove(
      "ativa"
    );

  });


  const pagina =

  $(
    "pagina-" +
    nome
  );


  if (pagina) {

    pagina
    .classList
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

    botao
    .classList
    .remove(
      "ativo"
    );

  });


  const menu =

  document
  .querySelector(

    '[data-pagina="' +
    nome +
    '"]'

  );


  if (menu) {

    menu
    .classList
    .add(
      "ativo"
    );

  }


/*----------Carregamentos especificos----------*/


  if (
    nome ===
    "mensagens"
  ) {

    carregarMensagens();

  }


  if (
    nome ===
    "notas"
  ) {

    carregarNotas();

  }

}


/*----------Botoes do menu----------*/


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


/*----------Outros botoes da navegacao----------*/


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


  await carregarMensagens();


});


/*========================================
PERFIL
========================================*/


async function carregarPerfil() {


  try {


    const referencia =

    doc(
      db,
      "usuarios",
      usuarioAtual.uid
    );


    const resultado =

    await getDoc(
      referencia
    );


    if (
      resultado.exists()
    ) {

      perfilAluno =
      resultado.data();

    }


    else {

      perfilAluno = {

        nome:
        usuarioAtual.displayName ||
        "Aluno",

        email:
        usuarioAtual.email,

        turma:
        "",

        escolaId:
        ""

      };

    }


    atualizarPerfilNaTela();


  }


  catch(erro) {

    console.error(

      "Erro ao carregar perfil:",

      erro

    );

  }

}


/*========================================
DADOS DO PERFIL NA TELA
========================================*/


function atualizarPerfilNaTela() {


  const nome =

  perfilAluno.nome ||
  "Aluno";


  const email =

  usuarioAtual.email ||
  perfilAluno.email ||
  "-";


  const classe =

  perfilAluno.turma ||
  "Turma não informada";


  const escola =

  perfilAluno.escolaNome ||
  perfilAluno.escolaId ||
  "Escola não informada";


  const iniciais =

  gerarIniciais(
    nome
  );


/*----------Inicio----------*/


  $("nomeAluno")
  .textContent =
  nome;


  $("turmaAluno")
  .textContent =
  classe;


  $("escolaAluno")
  .textContent =
  escola;


/*----------Topo----------*/


  $("nomeTopo")
  .textContent =
  nome;


  $("avatarTopo")
  .textContent =
  iniciais;


  $("avatarPrincipal")
  .textContent =
  iniciais;


/*----------Plataformas----------*/


  $("turmaPlataformas")
  .textContent =

  "Visualizando " +
  classe;


/*----------Perfil----------*/


  $("perfilNome")
  .textContent =
  nome;


  $("perfilEmail")
  .textContent =
  email;


  $("perfilTurma")
  .textContent =
  classe;


  $("perfilEscola")
  .textContent =
  escola;


/*----------Carteirinha----------*/


  $("avatarCarteirinha")
  .textContent =
  iniciais;


  $("carteirinhaNome")
  .textContent =
  nome;


  $("carteirinhaTurma")
  .textContent =
  classe;


  $("carteirinhaId")
  .textContent =

  "ID: " +
  usuarioAtual.uid;

}


/*========================================
INICIAIS DO ALUNO
========================================*/


function gerarIniciais(
  nome
) {


  const partes =

  String(nome)
  .trim()
  .split(/\s+/);


  if (
    partes.length ===
    1
  ) {

    return partes[0]
    .substring(
      0,
      2
    )
    .toUpperCase();

  }


  return (

    partes[0][0] +

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


  const faltas =

  Number(
    perfilAluno.faltas ||
    0
  );


  $("quantidadeFaltas")
  .textContent =
  faltas;


/*----------Tarefas----------*/


  try {


    const resultado =

    await getDocs(

      collection(
        db,
        "tarefas"
      )

    );


    let pendencias =
    0;


    resultado
    .forEach(
    function(documento) {


      const tarefa =
      documento.data();


      if (

        !perfilAluno.turma ||

        tarefa.turma ===
        perfilAluno.turma

      ) {

        pendencias++;

      }


    });


    $("quantidadePendencias")
    .textContent =
    pendencias;


    $("contadorTarefas")
    .textContent =
    pendencias;


  }


  catch(erro) {

    console.error(
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

    botao
    .dataset
    .plataforma;


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


/*----------Redacao SP----------*/


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


/*----------Elefante----------*/


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
COMUNICA SP
========================================*/


async function carregarMensagens() {


  if (
    !usuarioAtual ||
    !perfilAluno
  ) {

    return;

  }


  const lista =

  $("listaMensagens");


  try {


    const resultado =

    await getDocs(

      collection(
        db,
        "comunicacoes"
      )

    );


    const mensagens =
    [];


    resultado
    .forEach(
    function(documento) {


      const dados =
      documento.data();


      const destino =

      String(
        dados.destino ||
        ""
      )
      .trim();


      const destinoNormal =

      destino
      .toUpperCase();


      const turmaAluno =

      String(
        perfilAluno.turma ||
        ""
      )
      .toUpperCase();


      const emailAluno =

      String(
        usuarioAtual.email ||
        ""
      )
      .toLowerCase();


      const mostrar =

      destinoNormal ===
      "TODOS"

      ||

      destinoNormal ===
      turmaAluno

      ||

      destino ===
      usuarioAtual.uid

      ||

      destino.toLowerCase() ===
      emailAluno;


      if (mostrar) {

        mensagens.push({

          id:
          documento.id,

          ...dados

        });

      }


    });


    lista.innerHTML =
    "";


    mensagens
    .forEach(
    function(item) {


      lista
      .insertAdjacentHTML(

        "beforeend",

        `

        <div class="mensagem-item">

          <h3>
            ${textoSeguro(item.titulo || "Mensagem")}
          </h3>

          <p>
            ${textoSeguro(item.mensagem || "")}
          </p>

          <small>
            ${dataBonita(item.criadoEm)}
          </small>

        </div>

        `

      );


    });


    if (
      !mensagens.length
    ) {

      lista.innerHTML =

      `

      <p class="vazio">

        Nenhuma mensagem.

      </p>

      `;

    }


    $("quantidadeMensagens")
    .textContent =
    mensagens.length;


    $("contadorMensagensMenu")
    .textContent =
    mensagens.length;


    $("contadorNotificacoes")
    .textContent =
    mensagens.length;


  }


  catch(erro) {

    console.error(
      erro
    );


    lista.innerHTML =

    `

    <p class="vazio">

      Não foi possível carregar
      as mensagens.

    </p>

    `;

  }

}


/*========================================
UMA ATIVIDADE POR DIA
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

    gerarDataChave();


/*
O ID e sempre:

UID_DATA

Exemplo:

abc123_2026-08-28

Assim a interface usa
um documento por aluno por dia.
*/


    const idDocumento =

    usuarioAtual.uid +
    "_" +
    hoje;


    const referencia =

    doc(
      db,
      "atividadesAluno",
      idDocumento
    );


    try {


/*----------Verifica se ja enviou----------*/


      const existente =

      await getDoc(
        referencia
      );


      if (
        existente.exists()
      ) {

        statusAtividade(

          "erro",

          "Você já enviou sua atividade de hoje."

        );

        return;

      }


/*----------Salva----------*/


      await setDoc(

        referencia,

        {

          alunoId:
          usuarioAtual.uid,

          alunoNome:
          perfilAluno.nome ||
          "",

          turma:
          perfilAluno.turma ||
          "",

          dataChave:
          hoje,

          titulo:
          $("atividadeTitulo")
          .value
          .trim(),

          texto:
          $("atividadeTexto")
          .value
          .trim(),

          enviadoEm:
          serverTimestamp()

        }

      );


      statusAtividade(

        "ok",

        "Atividade do dia enviada."

      );


      $("atividadeDiaForm")
      .reset();


  }


  catch(erro) {


    console.error(
      erro
    );


    statusAtividade(

      "erro",

      "Não foi possível enviar a atividade."

    );


  }


  });

}


/*========================================
DATA DO DOCUMENTO
========================================*/


function gerarDataChave() {


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
STATUS ATIVIDADE
========================================*/


function statusAtividade(
  tipo,
  texto
) {


  const elemento =

  $("atividadeMensagem");


  elemento.className =

  "mensagem-status " +
  tipo;


  elemento.textContent =
  texto;

}


/*========================================
NOTAS
========================================*/


async function carregarNotas() {


  const tabela =

  $("tabelaNotas");


  tabela.innerHTML =

  `

  <tr>

    <td colspan="3">

      Carregando...

    </td>

  </tr>

  `;


  try {


/*
Estrutura usada aqui:

notas/
  documento
    alunoId
    disciplina
    bimestre
    nota
*/


    const pesquisa =

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

    );


    const resultado =

    await getDocs(
      pesquisa
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
            ${textoSeguro(nota.disciplina || "-")}
          </td>

          <td>
            ${textoSeguro(nota.bimestre || "-")}
          </td>

          <td>
            ${textoSeguro(nota.nota ?? "-")}
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
ESCAPAR TEXTO
========================================*/


function textoSeguro(
  valor
) {


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
DATA BONITA
========================================*/


function dataBonita(
  valor
) {


  if (!valor) {

    return "";

  }


  if (
    typeof valor.toDate ===
    "function"
  ) {


    return valor
    .toDate()
    .toLocaleString(
      "pt-BR"
    );

  }


  return String(
    valor
  );

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


function falar(
  texto
) {


  if (
    !(
      "speechSynthesis"
      in window
    )
  ) {


    alert(

      "Seu navegador não suporta leitura por voz."

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

        "Selecione algum texto primeiro."

      );


      return;

    }


    falar(
      texto
    );


  });

}


/*----------Parar----------*/


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
