# Plataforma de Pagamento (simulação)

Uma lojinha com carrinho e pagamento de mentirinha (cartão, Pix ou boleto).
Nenhum dinheiro é cobrado e nenhum dado é enviado ou guardado.

## Como rodar

Abra o arquivo `index.html` no navegador (clique duas vezes). Não precisa instalar nada.

## Estrutura

```
plataforma-pagamento/
├── index.html      -> a página
├── css/
│   └── estilo.css  -> o visual
└── js/
    ├── produtos.js -> a lista de produtos (edite aqui para mudar a loja)
    └── app.js      -> carrinho, validação do pagamento e simulação
```

## O que ele faz

- Adiciona e remove produtos do carrinho e calcula o total
- Valida o cartão (número pelo algoritmo de Luhn, validade e CVV)
- Simula a aprovação do pagamento depois de 1,5 segundo

## Para testar

Use o cartão de teste `4111 1111 1111 1111`, uma validade futura (ex.: 12/35) e qualquer CVV (ex.: 123).
# plataforma-pagemento
