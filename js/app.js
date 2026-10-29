// Plataforma de Pagamento (simulação)
// Mostra os produtos, controla o carrinho e simula o pagamento.
// A lista "produtos" vem do arquivo produtos.js

// O carrinho guarda: número do produto -> quantidade. Exemplo: { 1: 2, 3: 1 }
let carrinho = {};

// Pegando os elementos da página
const telaCompra = document.getElementById("telaCompra");
const telaResultado = document.getElementById("telaResultado");
const listaProdutos = document.getElementById("listaProdutos");
const listaCarrinho = document.getElementById("listaCarrinho");
const carrinhoVazio = document.getElementById("carrinhoVazio");
const textoTotal = document.getElementById("textoTotal");
const formulario = document.getElementById("formularioPagamento");
const campoNome = document.getElementById("nomeCliente");
const campoMetodo = document.getElementById("metodo");
const campoNumeroCartao = document.getElementById("numeroCartao");
const campoValidade = document.getElementById("validade");
const campoCvv = document.getElementById("cvv");
const textoErro = document.getElementById("mensagemErro");
const botaoPagar = document.getElementById("botaoPagar");
const textoResultado = document.getElementById("textoResultado");


// ---------- Funções de ajuda ----------

function formatarDinheiro(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buscarProduto(id) {
  return produtos.find(function (produto) {
    return produto.id === id;
  });
}

function calcularTotal() {
  let total = 0;
  for (const id in carrinho) {
    total += buscarProduto(Number(id)).preco * carrinho[id];
  }
  return total;
}

function carrinhoEstaVazio() {
  return Object.keys(carrinho).length === 0;
}

function criarBotao(texto, aoClicar) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "pequeno";
  botao.textContent = texto;
  botao.addEventListener("click", aoClicar);
  return botao;
}


// ---------- Produtos e carrinho ----------

function mostrarProdutos() {
  listaProdutos.innerHTML = "";

  produtos.forEach(function (produto) {
    const item = document.createElement("li");

    const textos = document.createElement("div");
    const nome = document.createElement("div");
    nome.className = "item-nome";
    nome.textContent = produto.nome;
    const preco = document.createElement("div");
    preco.className = "item-preco";
    preco.textContent = formatarDinheiro(produto.preco);
    textos.append(nome, preco);

    const botao = criarBotao("Adicionar", function () {
      mudarQuantidade(produto.id, 1);
    });

    item.append(textos, botao);
    listaProdutos.appendChild(item);
  });
}

// Soma (ou subtrai) a quantidade de um produto no carrinho
function mudarQuantidade(id, diferenca) {
  const quantidadeNova = (carrinho[id] || 0) + diferenca;

  if (quantidadeNova <= 0) {
    delete carrinho[id]; // zerou, tira do carrinho
  } else {
    carrinho[id] = quantidadeNova;
  }

  mostrarCarrinho();
}

function mostrarCarrinho() {
  listaCarrinho.innerHTML = "";
  carrinhoVazio.hidden = !carrinhoEstaVazio();

  for (const id in carrinho) {
    const produto = buscarProduto(Number(id));
    const quantidade = carrinho[id];

    const item = document.createElement("li");

    const textos = document.createElement("div");
    const nome = document.createElement("div");
    nome.className = "item-nome";
    nome.textContent = produto.nome;
    const subtotal = document.createElement("div");
    subtotal.className = "item-preco";
    subtotal.textContent = formatarDinheiro(produto.preco * quantidade);
    textos.append(nome, subtotal);

    const controle = document.createElement("div");
    controle.className = "controle-quantidade";
    const textoQuantidade = document.createElement("span");
    textoQuantidade.textContent = quantidade;
    controle.append(
      criarBotao("−", function () { mudarQuantidade(produto.id, -1); }),
      textoQuantidade,
      criarBotao("+", function () { mudarQuantidade(produto.id, 1); })
    );

    item.append(textos, controle);
    listaCarrinho.appendChild(item);
  }

  textoTotal.textContent = formatarDinheiro(calcularTotal());
}


// ---------- Formulário de pagamento ----------

// Mostra só os campos da forma de pagamento escolhida
function trocarMetodo() {
  const metodo = campoMetodo.value;
  document.getElementById("blocoCartao").hidden = metodo !== "cartao";
  document.getElementById("blocoPix").hidden = metodo !== "pix";
  document.getElementById("blocoBoleto").hidden = metodo !== "boleto";
  textoErro.textContent = "";
}

// Deixa só números e coloca um espaço a cada 4 dígitos
function formatarNumeroCartao() {
  const numeros = campoNumeroCartao.value.replace(/\D/g, "").slice(0, 16);
  campoNumeroCartao.value = numeros.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// Deixa só números e coloca a barra no meio: 1230 vira 12/30
function formatarValidade() {
  const numeros = campoValidade.value.replace(/\D/g, "").slice(0, 4);
  campoValidade.value = numeros.length > 2 ? numeros.slice(0, 2) + "/" + numeros.slice(2) : numeros;
}

// Confere o número do cartão com o algoritmo de Luhn (usado pelos cartões de verdade)
function numeroCartaoValido(numero) {
  if (numero.length < 13 || numero.length > 19) return false;

  let soma = 0;
  let dobrar = false;

  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = Number(numero[i]);
    if (dobrar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    soma += digito;
    dobrar = !dobrar;
  }

  return soma % 10 === 0;
}

function validadeValida(texto) {
  if (!/^\d{2}\/\d{2}$/.test(texto)) return false;

  const mes = Number(texto.slice(0, 2));
  const ano = 2000 + Number(texto.slice(3));
  if (mes < 1 || mes > 12) return false;

  // O cartão vale até o último dia do mês da validade
  const hoje = new Date();
  const fimDaValidade = new Date(ano, mes, 0, 23, 59, 59);
  return fimDaValidade >= hoje;
}

// Devolve um texto de erro, ou "" se estiver tudo certo
function validarFormulario() {
  if (carrinhoEstaVazio()) {
    return "Adicione pelo menos um produto ao carrinho.";
  }
  if (campoNome.value.trim() === "") {
    return "Digite seu nome.";
  }

  if (campoMetodo.value === "cartao") {
    const numero = campoNumeroCartao.value.replace(/\s/g, "");
    if (!numeroCartaoValido(numero)) {
      return "Número do cartão inválido.";
    }
    if (!validadeValida(campoValidade.value)) {
      return "Validade inválida ou vencida. Use o formato MM/AA.";
    }
    if (!/^\d{3,4}$/.test(campoCvv.value)) {
      return "CVV inválido. Digite 3 ou 4 números.";
    }
  }

  return "";
}

function pagar(evento) {
  evento.preventDefault(); // não deixa a página recarregar

  const erro = validarFormulario();
  textoErro.textContent = erro;
  if (erro !== "") return;

  // Finge que está falando com o banco: espera um pouquinho e aprova
  botaoPagar.disabled = true;
  botaoPagar.textContent = "Processando...";

  setTimeout(function () {
    mostrarResultado();
    botaoPagar.disabled = false;
    botaoPagar.textContent = "Pagar";
  }, 1500);
}


// ---------- Resultado ----------

function mostrarResultado() {
  const nomesDosMetodos = { cartao: "cartão de crédito", pix: "Pix", boleto: "boleto" };
  const codigoPedido = "PED-" + Math.floor(100000 + Math.random() * 900000);

  textoResultado.textContent =
    "Pedido " + codigoPedido + " confirmado, " + campoNome.value.trim() + ". " +
    "Valor: " + formatarDinheiro(calcularTotal()) + ", pago com " + nomesDosMetodos[campoMetodo.value] + ". " +
    "(Simulação: nada foi cobrado.)";

  telaCompra.hidden = true;
  telaResultado.hidden = false;
}

function novoPedido() {
  carrinho = {};
  formulario.reset();
  trocarMetodo();
  mostrarCarrinho();

  telaResultado.hidden = true;
  telaCompra.hidden = false;
}


// ---------- Ligando os eventos ----------

campoMetodo.addEventListener("change", trocarMetodo);
campoNumeroCartao.addEventListener("input", formatarNumeroCartao);
campoValidade.addEventListener("input", formatarValidade);
formulario.addEventListener("submit", pagar);
document.getElementById("botaoNovoPedido").addEventListener("click", novoPedido);

// Monta a página assim que ela abre
mostrarProdutos();
mostrarCarrinho();
