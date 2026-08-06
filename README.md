# 1ª Avaliação de Ciências — E.E. Feliz Lusitânia

Prova objetiva de **Ecologia Básica** (definição de Ecologia, indivíduo, população,
comunidade, ecossistema, habitat e nicho ecológico), para o **6º ano do Ensino
Fundamental**. Feita para rodar nos Chromebooks da escola: instala como aplicativo
(PWA), funciona sem internet depois da primeira abertura e corrige a nota sozinha.

**Diretora:** Carla Nilce · **Professor:** Amauri Junior

---

## Como o aluno usa

1. Abre o app e toca em **Iniciar avaliação**.
2. Preenche **nome** e **turma** (série e turno são opcionais).
3. Responde as **20 questões** — escolhe a alternativa e toca em *Confirmar e avançar*.
   Depois de confirmar, a questão trava e não dá para voltar.
4. No fim aparece o **comprovante de nota**, com os dados do aluno, o número de
   acertos e o gabarito comparado com as respostas dele.

Cada questão vale **0,5 ponto** — 20 questões, nota total **10,0**.

## Alternativas sorteadas

Toda vez que o app abre, as quatro alternativas de cada questão são embaralhadas
por `crypto.getRandomValues`, então dois Chromebooks lado a lado recebem
gabaritos diferentes. Cada sorteio gera um **código de versão** de 4 caracteres,
mostrado na capa e no comprovante impresso, para o professor distinguir as provas.

A ordem das questões (1 a 20) é fixa e segue a prova em papel.

## Instalar no Chromebook

Abra o endereço no Chrome e use o botão **Instalar no Chromebook** na capa —
ou o ícone de instalar na barra de endereço. Depois de instalado, o app abre em
janela própria e funciona offline.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | O app inteiro — questões, estilo e lógica, tudo em um arquivo só |
| `manifest.webmanifest` | Nome, cores e ícones do app instalado |
| `sw.js` | Service worker: guarda a prova para abrir sem internet |
| `icons/` | Ícones do app, gerados a partir do brasão da escola |

## Mexer nas questões

As 20 questões ficam na constante `QUESTOES`, dentro de `index.html`. Cada uma tem:

```js
{ q:"enunciado da questão",
  o:["alternativa 1","alternativa 2","alternativa 3","alternativa 4"],
  r:2 }   // r = índice da correta na lista acima, contando de 0
```

Escreva as alternativas **na ordem natural** e marque a correta em `r` — o
embaralhamento é feito sozinho quando o app abre.

> Depois de alterar a prova, troque o número em `const CACHE = "prova-fl-ecologia-v1"`
> no `sw.js`. É ele que descarta o pacote antigo e faz os Chromebooks já
> instalados baixarem a versão nova. Mantenha o prefixo `prova-fl-ecologia-`:
> a limpeza do `sw.js` só apaga caches com esse prefixo, para não derrubar o
> pacote offline das outras provas publicadas no mesmo site.

## Sobre o gabarito

A correção acontece no próprio navegador do aluno, então as respostas certas
estão no código da página e podem ser lidas por quem abrir o inspetor. O
embaralhamento atrapalha a cola entre colegas, mas **não substitui a aplicação
presencial supervisionada**. Impedir isso de verdade exigiria um servidor
corrigindo a prova.
