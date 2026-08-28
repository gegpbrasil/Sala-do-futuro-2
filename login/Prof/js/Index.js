// professor.js
// Sala do Futuro V2

import { initializeApp }
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
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  increment
}
from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/*----------Firebase----------*/

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


const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const db =
getFirestore(app);

let usuarioAtual = null;


/*----------Atalho----------*/

function $(id) {

  return document
  .getElementById(id);

}


/*----------Mensagem----------*/

function mensagem(
  id,
  tipo,
  texto
) {

  const elemento = $(id);

  if (!elemento) {
    return;
  }

  elemento.className =
  "mensagem mostrar " + tipo;

  elemento.textContent =
  texto;

}


/*----------Turma----------*/

function turma(valor) {

  return String(valor || "")
  .trim()
  .toUpperCase()
  .replace(/\s+/g, "");

}


/*----------Segurança do texto----------*/

function textoSeguro(valor) {

  return String(valor ?? "")

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
  );

}


/*----------Gerar codigo----------*/

function gerarCodigo(
  tamanho = 10
) {

  const letras =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const numeros =
  new Uint32Array(tamanho);

  crypto.getRandomValues(
    numeros
  );

  let codigo = "";

  for (
    let i = 0;
    i < tamanho;
    i++
  ) {

    codigo +=
    letras[
      numeros[i] %
      letras.length
    ];

  }

  return codigo;

}


/*========================================
LOGIN
========================================*/

onAuthStateChanged(
auth,
async function(user) {

  if (!user) {

    window.location.href =
    "../login/logingov.html";

    return;

  }

  usuarioAtual = user;


  if ($("professorEmail")) {

    $("professorEmail")
    .textContent =
    user.email || user.uid;

  }


  if ($("statusFirebase")) {

    $("statusFirebase")
    .textContent =
    "Firebase conectado";

  }


  try {

    const perfil = await getDoc(

      doc(
        db,
        "usuarios",
        user.uid
      )

    );


    if (perfil.exists()) {

      const dados =
      perfil.data();


      if (
        dados.nome &&
        $("professorEmail")
      ) {

        $("professorEmail")
        .textContent =

        dados.nome +
        " | " +
        user.email;

      }

    }

  }

  catch(erro) {

    console.error(
      erro
    );

  }


  atualizarPainel();

});


/*----------Sair----------*/

if ($("sairBtn")) {

  $("sairBtn")
  .addEventListener(
  "click",
  async function() {

    await signOut(auth);

    window.location.href =
    "../login/logingov.html";

  });

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
    .remove("ativa");

  });


  const pagina =
  $("pagina-" + nome);


  if (pagina) {

    pagina.classList
    .add("ativa");

  }


  document
  .querySelectorAll(
    ".menu-botao"
  )

  .forEach(
  function(botao) {

    botao.classList
    .remove("ativo");

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
    .add("ativo");

  }

}


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


/*----------Documentos----------*/

if ($("documentosBtn")) {

  $("documentosBtn")
  .addEventListener(
  "click",
  function() {

    alert(
      "Documentos ainda não disponível."
    );

  });

}


/*========================================
REGISTRAR AULA
========================================*/

if ($("aulaForm")) {

  $("aulaForm")
  .addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const titulo =
    $("aulaTitulo")
    .value
    .trim();


    const classe =
    turma(
      $("aulaTurma").value
    );


    const data =
    $("aulaData").value;


    const conteudo =
    $("aulaConteudo")
    .value
    .trim();


    const xp =
    Number(
      $("aulaXp").value
    );


    const prazo =
    $("aulaPrazo").value;


    const tarefas =

    $("aulaTarefas")
    .value

    .split("\n")

    .map(
      item =>
      item.trim()
    )

    .filter(Boolean);


    try {

      mensagem(
        "aulaMensagem",
        "info",
        "Registrando aula..."
      );


      const aula =

      await addDoc(

        collection(
          db,
          "aulas"
        ),

        {

          titulo:
          titulo,

          turma:
          classe,

          data:
          data,

          conteudo:
          conteudo,

          professorId:
          usuarioAtual.uid,

          criadoEm:
          serverTimestamp()

        }

      );


/*----------Criar tarefas automaticas----------*/

      const ids = [];


      for (
        const tarefa
        of tarefas
      ) {

        const novaTarefa =

        await addDoc(

          collection(
            db,
            "tarefas"
          ),

          {

            titulo:
            tarefa,

            turma:
            classe,

            xp:
            xp,

            prazo:
            prazo || null,

            aulaId:
            aula.id,

            professorId:
            usuarioAtual.uid,

            ativa:
            true,

            criadoEm:
            serverTimestamp()

          }

        );


        ids.push(
          novaTarefa.id
        );

      }


      mensagem(

        "aulaMensagem",

        "ok",

        "Aula registrada. " +
        tarefas.length +
        " tarefa(s) criada(s)."

      );


      console.log(
        "IDs:",
        ids
      );


      $("aulaForm")
      .reset();


      $("aulaXp")
      .value = 10;


      carregarTarefas();

      atualizarPainel();

    }


    catch(erro) {

      console.error(
        erro
      );


      mensagem(

        "aulaMensagem",

        "erro",

        "Erro ao registrar aula."

      );

    }

  });

}


/*========================================
CRIAR TAREFA MANUAL
========================================*/

if ($("tarefaForm")) {

  $("tarefaForm")
  .addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    try {

      const tarefa =

      await addDoc(

        collection(
          db,
          "tarefas"
        ),

        {

          titulo:
          $("tarefaTitulo")
          .value
          .trim(),

          turma:
          turma(
            $("tarefaTurma")
            .value
          ),

          xp:
          Number(
            $("tarefaXp")
            .value
          ),

          prazo:
          $("tarefaPrazo")
          .value || null,

          descricao:
          $("tarefaDescricao")
          .value
          .trim(),

          professorId:
          usuarioAtual.uid,

          ativa:
          true,

          criadoEm:
          serverTimestamp()

        }

      );


      mensagem(

        "tarefaMensagem",

        "ok",

        "Tarefa criada. ID: " +
        tarefa.id

      );


      $("tarefaForm")
      .reset();


      $("tarefaXp")
      .value = 10;


      carregarTarefas();

      atualizarPainel();

    }


    catch(erro) {

      console.error(
        erro
      );


      mensagem(

        "tarefaMensagem",

        "erro",

        "Erro ao criar tarefa."

      );

    }

  });

}


/*========================================
LISTAR TAREFAS
========================================*/

async function carregarTarefas() {

  const tabela =
  $("tarefasTabela");


  if (!tabela) {
    return;
  }


  tabela.innerHTML =
  "";


  try {

    const resultado =

    await getDocs(

      collection(
        db,
        "tarefas"
      )

    );


    resultado
    .forEach(
    function(documento) {

      const tarefa =
      documento.data();


      tabela
      .insertAdjacentHTML(

      "beforeend",

      `

      <tr>

        <td>
          ${textoSeguro(documento.id)}
        </td>

        <td>
          ${textoSeguro(tarefa.titulo)}
        </td>

        <td>
          ${textoSeguro(tarefa.turma)}
        </td>

        <td>
          ${textoSeguro(tarefa.xp || 0)}
        </td>

        <td>
          ${textoSeguro(tarefa.prazo || "-")}
        </td>

      </tr>

      `

      );

    });


    if (resultado.empty) {

      tabela.innerHTML =

      `

      <tr>

        <td colspan="5">
          Nenhuma tarefa.
        </td>

      </tr>

      `;

    }

  }


  catch(erro) {

    console.error(
      erro
    );

  }

}


if ($("carregarTarefasBtn")) {

  $("carregarTarefasBtn")
  .addEventListener(

    "click",

    carregarTarefas

  );

}


/*========================================
ENTREGAS POR ID
========================================*/

if ($("buscarEntregasBtn")) {

  $("buscarEntregasBtn")
  .addEventListener(
  "click",
  async function() {

    const tarefaId =

    $("entregaTarefaId")
    .value
    .trim();


    const tabela =
    $("entregasTabela");


    try {

      const pesquisa =

      query(

        collection(
          db,
          "entregas"
        ),

        where(
          "tarefaId",
          "==",
          tarefaId
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

        const entrega =
        documento.data();


        tabela
        .insertAdjacentHTML(

        "beforeend",

        `

        <tr>

          <td>
            ${textoSeguro(
              entrega.alunoNome ||
              entrega.alunoEmail ||
              "-"
            )}
          </td>

          <td>
            ${textoSeguro(
              entrega.alunoId ||
              "-"
            )}
          </td>

          <td>
            ${textoSeguro(
              entrega.status ||
              "entregue"
            )}
          </td>

        </tr>

        `

        );

      });


      mensagem(

        "entregaMensagem",

        "ok",

        resultado.size +
        " entrega(s)."

      );

    }


    catch(erro) {

      console.error(
        erro
      );

    }

  });

}


/*========================================
BUSCAR ALUNOS
========================================*/

async function buscarAlunos() {

  const resultado =

  await getDocs(

    collection(
      db,
      "usuarios"
    )

  );


  const alunos = [];


  resultado
  .forEach(
  function(documento) {

    const dados =
    documento.data();


    if (
      dados.tipo ===
      "aluno"
    ) {

      alunos.push({

        id:
        documento.id,

        ...dados

      });

    }

  });


  return alunos;

}


/*========================================
CHAMADA
========================================*/

if ($("carregarChamadaBtn")) {

  $("carregarChamadaBtn")
  .addEventListener(
  "click",
  async function() {

    const classe =

    turma(
      $("chamadaTurma")
      .value
    );


    const alunos =
    await buscarAlunos();


    const lista =
    $("listaChamada");


    lista.innerHTML =
    "";


    alunos

    .filter(
      aluno =>
      turma(aluno.turma)
      === classe
    )

    .forEach(
    function(aluno) {


      lista
      .insertAdjacentHTML(

      "beforeend",

      `

      <div
        class="aluno-chamada"
        data-id="${aluno.id}"
      >

        <strong>
          ${textoSeguro(
            aluno.nome
          )}
        </strong>


        <select
          class="presenca"
        >

          <option value="presente">
            Presente
          </option>

          <option value="ausente">
            Ausente
          </option>

          <option value="justificado">
            Justificado
          </option>

        </select>


        <input
          class="comportamento"
          placeholder="Comportamento"
        >

      </div>

      `

      );

    });

  });

}


/*----------Salvar chamada----------*/

if ($("salvarChamadaBtn")) {

  $("salvarChamadaBtn")
  .addEventListener(
  "click",
  async function() {

    const registros = [];


    document
    .querySelectorAll(
      ".aluno-chamada"
    )

    .forEach(
    function(aluno) {

      registros.push({

        alunoId:
        aluno.dataset.id,

        presenca:
        aluno
        .querySelector(
          ".presenca"
        )
        .value,

        comportamento:
        aluno
        .querySelector(
          ".comportamento"
        )
        .value

      });

    });


    try {

      await addDoc(

        collection(
          db,
          "chamadas"
        ),

        {

          turma:
          turma(
            $("chamadaTurma")
            .value
          ),

          data:
          $("chamadaData")
          .value,

          registros:
          registros,

          professorId:
          usuarioAtual.uid,

          criadoEm:
          serverTimestamp()

        }

      );


      mensagem(

        "chamadaMensagem",

        "ok",

        "Chamada salva."

      );

    }


    catch(erro) {

      console.error(
        erro
      );

    }

  });

}


/*========================================
GUILDAS
========================================*/

async function carregarGuildas() {

  const tabela =
  $("guildasTabela");


  if (!tabela) {
    return;
  }


  tabela.innerHTML =
  "";


  const resultado =

  await getDocs(

    collection(
      db,
      "guildas"
    )

  );


  resultado
  .forEach(
  function(documento) {

    const guilda =
    documento.data();


    tabela
    .insertAdjacentHTML(

    "beforeend",

    `

    <tr>

      <td>
        ${textoSeguro(
          guilda.nome ||
          documento.id
        )}
      </td>

      <td>
        ${textoSeguro(
          guilda.turma ||
          "-"
        )}
      </td>

      <td>
        ${textoSeguro(
          guilda.status ||
          "pendente"
        )}
      </td>

      <td>

        <button
          class="aprovarGuilda"
          data-id="${documento.id}"
        >
          Aprovar
        </button>

        <button
          class="rejeitarGuilda"
          data-id="${documento.id}"
        >
          Rejeitar
        </button>

      </td>

    </tr>

    `

    );

  });


/*----------Aprovar----------*/

  document
  .querySelectorAll(
    ".aprovarGuilda"
  )

  .forEach(
  function(botao) {

    botao
    .addEventListener(
    "click",
    async function() {

      await updateDoc(

        doc(
          db,
          "guildas",
          botao.dataset.id
        ),

        {

          status:
          "aprovada"

        }

      );


      carregarGuildas();

    });

  });


/*----------Rejeitar----------*/

  document
  .querySelectorAll(
    ".rejeitarGuilda"
  )

  .forEach(
  function(botao) {

    botao
    .addEventListener(
    "click",
    async function() {

      await updateDoc(

        doc(
          db,
          "guildas",
          botao.dataset.id
        ),

        {

          status:
          "rejeitada"

        }

      );


      carregarGuildas();

    });

  });

}


if ($("carregarGuildasBtn")) {

  $("carregarGuildasBtn")
  .addEventListener(

    "click",

    carregarGuildas

  );

}


/*========================================
RANKING
========================================*/

async function carregarRanking() {

  const tabela =
  $("rankingTabela");


  if (!tabela) {
    return;
  }


  const alunos =
  await buscarAlunos();


  alunos.sort(

    (a,b) =>

    Number(b.xp || 0) -
    Number(a.xp || 0)

  );


  tabela.innerHTML =
  "";


  alunos
  .forEach(
  function(aluno, posicao) {


    tabela
    .insertAdjacentHTML(

    "beforeend",

    `

    <tr>

      <td>
        ${posicao + 1}
      </td>

      <td>
        ${textoSeguro(
          aluno.nome ||
          aluno.id
        )}
      </td>

      <td>
        ${textoSeguro(
          aluno.turma ||
          "-"
        )}
      </td>

      <td>
        ${aluno.xp || 0}
      </td>

      <td>

        <input
          id="xp-${aluno.id}"
          type="number"
          min="1"
          max="50"
          value="10"
        >

        <button
          class="darXp"
          data-id="${aluno.id}"
        >
          Dar XP
        </button>

      </td>

    </tr>

    `

    );

  });


  document
  .querySelectorAll(
    ".darXp"
  )

  .forEach(
  function(botao) {

    botao
    .addEventListener(
    "click",
    async function() {

      const alunoId =
      botao.dataset.id;


      const xp =

      Number(

        $("xp-" + alunoId)
        .value

      );


      if (
        xp < 1 ||
        xp > 50
      ) {

        alert(
          "Máximo de 50 XP."
        );

        return;

      }


      await updateDoc(

        doc(
          db,
          "usuarios",
          alunoId
        ),

        {

          xp:
          increment(xp)

        }

      );


      carregarRanking();

    });

  });

}


if ($("carregarRankingBtn")) {

  $("carregarRankingBtn")
  .addEventListener(

    "click",

    carregarRanking

  );

}


/*========================================
COMUNICA SP
========================================*/

if ($("comunicaForm")) {

  $("comunicaForm")
  .addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    await addDoc(

      collection(
        db,
        "comunicacoes"
      ),

      {

        destino:
        $("comunicaDestino")
        .value,

        titulo:
        $("comunicaTitulo")
        .value,

        mensagem:
        $("comunicaMensagemTexto")
        .value,

        professorId:
        usuarioAtual.uid,

        criadoEm:
        serverTimestamp()

      }

    );


    mensagem(

      "comunicaMensagem",

      "ok",

      "Mensagem enviada."

    );


    $("comunicaForm")
    .reset();

  });

}


/*========================================
TOTENS
========================================*/

if ($("totemForm")) {

  $("totemForm")
  .addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const codigo =
    gerarCodigo(8);


    await addDoc(

      collection(
        db,
        "totens"
      ),

      {

        titulo:
        $("totemTitulo")
        .value,

        turma:
        turma(
          $("totemTurma")
          .value
        ),

        tarefaId:
        $("totemTarefaId")
        .value || null,

        tipo:
        $("totemTipo")
        .value,

        codigo:
        codigo,

        professorId:
        usuarioAtual.uid,

        criadoEm:
        serverTimestamp()

      }

    );


    mensagem(

      "totemMensagem",

      "ok",

      "Totem criado: " +
      codigo

    );

  });

}


/*========================================
TOKENS
========================================*/

if ($("gerarTokenBtn")) {

  $("gerarTokenBtn")
  .addEventListener(
  "click",
  async function() {


    const token =
    gerarCodigo(12);


    const validade =

    Number(
      $("tokenValidade")
      .value
    );


    await addDoc(

      collection(
        db,
        "tokens"
      ),

      {

        token:
        token,

        tipo:
        $("tokenTipo")
        .value,

        expiraEm:

        Date.now() +
        validade *
        60000,

        usado:
        false,

        professorId:
        usuarioAtual.uid,

        criadoEm:
        serverTimestamp()

      }

    );


    mensagem(

      "tokenMensagem",

      "ok",

      "Token: " +
      token

    );

  });

}


/*========================================
RELATORIOS
========================================*/

if ($("relatorioForm")) {

  $("relatorioForm")
  .addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    await addDoc(

      collection(
        db,
        "relatorios"
      ),

      {

        tipo:
        $("relatorioTipo")
        .value,

        referencia:
        $("relatorioTurma")
        .value,

        texto:
        $("relatorioTexto")
        .value,

        professorId:
        usuarioAtual.uid,

        criadoEm:
        serverTimestamp()

      }

    );


    mensagem(

      "relatorioMensagem",

      "ok",

      "Relatório enviado."

    );


    $("relatorioForm")
    .reset();

  });

}


/*========================================
MURAL
========================================*/

if ($("avisoForm")) {

  $("avisoForm")
  .addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    await addDoc(

      collection(
        db,
        "avisos"
      ),

      {

        titulo:
        $("avisoTitulo")
        .value,

        turma:
        turma(
          $("avisoTurma")
          .value
        ) || "TODOS",

        mensagem:
        $("avisoTexto")
        .value,

        notificar:
        true,

        professorId:
        usuarioAtual.uid,

        criadoEm:
        serverTimestamp()

      }

    );


    mensagem(

      "avisoMensagem",

      "ok",

      "Aviso publicado."

    );


    $("avisoForm")
    .reset();


    atualizarPainel();

  });

}


/*========================================
PAINEL
========================================*/

async function atualizarPainel() {

  try {

    const tarefas =

    await getDocs(

      collection(
        db,
        "tarefas"
      )

    );


    const avisos =

    await getDocs(

      collection(
        db,
        "avisos"
      )

    );


    const alunos =
    await buscarAlunos();


    if ($("metricaTarefas")) {

      $("metricaTarefas")
      .textContent =
      tarefas.size;

    }


    if ($("metricaAlunos")) {

      $("metricaAlunos")
      .textContent =
      alunos.length;

    }


    if ($("metricaAvisos")) {

      $("metricaAvisos")
      .textContent =
      avisos.size;

    }

  }


  catch(erro) {

    console.error(
      erro
    );

  }

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


  speechSynthesis
  .cancel();


  const fala =

  new SpeechSynthesisUtterance(
    texto
  );


  fala.lang =
  "pt-BR";


  speechSynthesis
  .speak(
    fala
  );

}


if ($("lerPagina")) {

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


if ($("lerSelecionado")) {

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
        "Selecione um texto."
      );

      return;

    }


    falar(
      texto
    );

  });

}


if ($("pararLeitura")) {

  $("pararLeitura")
  .addEventListener(
  "click",
  function() {

    speechSynthesis
    .cancel();

  });

}


/*----------Data atual----------*/

if ($("aulaData")) {

  $("aulaData")
  .valueAsDate =
  new Date();

}


if ($("chamadaData")) {

  $("chamadaData")
  .valueAsDate =
  new Date();

}
