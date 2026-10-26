# 🎮 Terminal Quest — Cyberpunk RPG de Terminal

Um jogo interativo de terminal web com estética retrô/cyberpunk, projetado para simular um sistema operacional de hacking onde o jogador explora diretórios virtuais, investiga logs de intrusão, descobre segredos e soluciona desafios de lógica e programação.

---

## 🌟 Principais Recursos

- 🖥️ **Terminal Interativo Completo:**
  - Suporte aos comandos `help`, `clear`, `whoami`, `status`, `ls`, `cd`, `cat`, `submit`, `decode`, `echo`, `date` e `reset`.
  - Navegação no histórico de comandos utilizando as setas (`↑` e `↓`).
  - Auto-completar inteligente com a tecla `Tab`.
- 📁 **Virtual File System (VFS):**
  - Árvore de diretórios navegável (`/home/agente`, `/sistema`, `/logs`, `/segredos`).
  - Resolução de caminhos relativos e absolutos (`..`, `/`, `~`).
- 🎯 **Sistema de Missões e Progressão RPG:**
  - 4 Missões com narrativa contínua, pistas e objetivos em tempo real.
  - Barra de Experiência (XP) e níveis dinâmicos (*Iniciante*, *Script Kiddie*, *Cyber Novice*, *Netrunner*, *Arquiteto Cyberpunk*).
- 🔊 **Motor de Áudio Retrô Nativo (Web Audio API):**
  - Efeitos sonoros sintetizados em tempo real (clique de teclas, bipes de sucesso, alarmes de erro e acordes de level-up).
  - Sem necessidade de arquivos de áudio externos.
  - Botão de ativar/desativar áudio.
- 💾 **Salvamento Automático:**
  - Persistência de progresso, XP e missões via `localStorage`.
- 🎨 **Visual Cyberpunk & Scanlines:**
  - Efeito CRT scanlines, paleta em verde neon e ciano, tipografia monospace e layout responsivo com HUD lateral.

---

## 📂 Estrutura do Projeto

```
terminal-quest/
│
├── index.html        # Estrutura semântica do terminal, HUD lateral e controles
├── style.css         # Estilização Cyberpunk, CRT Scanlines, animações e responsividade
├── script.js         # Lógica do motor de áudio, sistema de arquivos e missões
└── README.md         # Documentação completa do projeto
```

---

## 🚀 Como Executar

1. Clone ou baixe este repositório.
2. Abra o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Firefox, Edge, Safari).
3. Ou utilize a extensão **Live Server** no VS Code para uma experiência em tempo real.

---

## 🕹️ Comandos Disponíveis

| Comando | Descrição | Exemplo de Uso |
|---|---|---|
| `help` | Exibe o menu com todos os comandos disponíveis | `help` |
| `clear` | Limpa as mensagens do terminal | `clear` |
| `whoami` | Mostra informações do operador e credenciais | `whoami` |
| `status` | Exibe a missão ativa, objetivos e dicas | `status` |
| `ls [caminho]` | Lista pastas e arquivos do diretório | `ls` ou `ls /logs` |
| `cd <pasta>` | Navega para outro diretório | `cd /logs` ou `cd ..` |
| `cat <arquivo>` | Lê o conteúdo de um arquivo | `cat readme.txt` |
| `submit <valor>` | Envia a resposta/evidência da missão | `submit 192.168.42.99` |
| `decode <base64>` | Decodifica texto em Base64 | `decode TkVYVVNfT1Z...` |
| `date` | Exibe data e hora atuais do sistema | `date` |
| `reset` | Reinicia todo o progresso do jogo | `reset` |

---

## 🧠 Arquitetura Técnica

- **Vanilla JavaScript (ES6+):** Programação Orientada a Objetos com classes desacopladas (`AudioEngine`, `VirtualFileSystem`, `QuestManager`, `TerminalController`).
- **Web Audio API:** Sintetizadores com osciladores e controle de ganho nativos.
- **LocalStorage API:** Persistência transparente do progresso do jogador.
- **CSS3 Moderno:** CSS Grid, Flexbox, Variáveis CSS (`:root`), animações `@keyframes` e efeitos visuais com `radial-gradient` e `linear-gradient`.

