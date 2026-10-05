# 🐍 Alimente a Cobrinha — Ajuda

## 📖 Sobre o Jogo

**Alimente a Cobrinha** é um clássico arcade onde você controla uma cobra que se move pelo campo. O objetivo é comer o máximo de maçãs possível, fazendo a cobra crescer e acumulando pontos.

---

## 🎮 Controles

| Ação | Tecla |
|------|-------|
| Mover para cima | `↑` ou `W` |
| Mover para baixo | `↓` ou `S` |
| Mover para esquerda | `←` ou `A` |
| Mover para direita | `→` ou `D` |
| Pausar / Retomar | `Espaço` |
| Controles mobile | Botões direcionais na tela ou **swipe** no canvas |

---

## 🎯 Dificuldades

Antes de iniciar, escolha uma das 3 dificuldades:

### 🟢 Fácil
- **Paredes:** A cobra atravessa e aparece do outro lado
- **Velocidade:** Começa mais lenta (180ms)
- **Velocidade progressiva:** Aumenta +5 a cada 30 segundos
- **Ideal para:** Iniciantes e prática

### 🟡 Normal
- **Paredes:** **Morre** ao colidir — game over instantâneo
- **Velocidade:** Média (150ms), fixa
- **Aumento por nível:** -10ms ao subir de nível
- **Ideal para:** Quem já tem experiência

### 🔴 Difícil
- **Paredes:** **Morre** ao colidir — game over instantâneo
- **Velocidade:** Começa rápida (120ms)
- **Velocidade progressiva:** Aumenta +8 a cada 30 segundos
- **Aumento por nível:** -10ms ao subir de nível
- **Ideal para:** Desafio máximo

---

## 📈 Níveis e Progressão

- O **nível** sobe a cada **5 comidas** coletadas
- A **barra de progresso** mostra quantas comidas faltam para o próximo nível
- Ao subir de nível:
  - A velocidade aumenta (exceto no Fácil)
  - Uma notificação aparece no topo

---

## 🏅 Medalhas

Medalhas são conquistadas pela **pontuação total**:

| Medalha | Pontuação Mínima |
|---------|-----------------|
| 🥉 Bronze | 1.000 |
| 🥈 Prata | 2.500 |
| 🥇 Ouro | 5.000 |
| 💎 Diamante | 10.000 |

---

## 💰 Pontuação

- Cada maçã coletada vale **10 × nível atual**
- Exemplo: no nível 3, cada maçã vale **30 pontos**
- Quanto mais tempo sobreviver, mais pontos por maçã!

---

## 🔊 Áudio

- **Efeitos sonoros:** comer, mover, game over, level up, medalha
- **Música de fundo:** as faixas tocam em sequência, trocando só quando uma termina
- Botões no canto superior direito para ativar/desativar som e música separadamente

---

## ⏸️ Pausa

- Pressione `Espaço` para pausar
- Durante a pausa: jogo, timer, música e velocidade ficam congelados
- Pressione `Espaço` novamente para retomar

---

## 💾 Salvamento

- **Recorde geral:** salvo automaticamente no navegador (localStorage)
- **Records por dificuldade:** salvos em `records.json` (requer servidor/backend)

---

## 📁 Estrutura de Arquivos

```
Alimente-a-Cobrinha/
├── index.html             ← Estrutura do jogo
├── style.css              ← Estilos visuais
├── script.js              ← Lógica do jogo
├── records.json           ← Records por dificuldade
└── AJUDA.md               ← Este arquivo
```

---

## 🎯 Dicas

1. **No Fácil:** aproveite para praticar rotas sem medo das paredes
2. **No Normal:** planeje movimentos com antecedência — uma batida e era
3. **No Difícil:** reflita rápido! A velocidade aumenta constantemente
4. **Maximize pontos:** sobreviva mais tempo para multiplicar o valor das maçãs
5. **Use o pause** se precisar de uma pausa rápida

---

## 🐛 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Jogo não inicia | Clique em "Iniciar Jogo" primeiro |
| Sem som | Verifique o botão 🔊 no canto superior direito |
| Sem música | Verifique o botão 🎵 no canto superior direito |
| Controles não respondem | Clique no canvas primeiro para dar foco |
