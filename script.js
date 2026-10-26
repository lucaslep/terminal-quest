/**
 * ==============================================================================
 * TERMINAL QUEST — RPG DE HACKING & PROGRAMAÇÃO (CYBERPUNK)
 * ==============================================================================
 * Código modular e estruturado:
 * 1. AudioEngine        - Síntese de áudio retro nativa (Web Audio API)
 * 2. VirtualFileSystem  - Estrutura de diretórios e arquivos em memória
 * 3. QuestManager       - Sistema de missões, objetivos, XP e progressão RPG
 * 4. TerminalController - Interpretador de comandos, I/O e histórico
 * 5. App Initialization - Conexão de eventos e ciclo de vida
 * ==============================================================================
 */

// ==============================================================================
// 1. MOTOR DE ÁUDIO NATIVO (Web Audio API)
// Não depende de arquivos MP3 externos — sintetiza sons futuristas direto no browser!
// ==============================================================================
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Clique de tecla suave de terminal mecânico
    playKeyClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
    }

    // Bipe de comando executado / sucesso
    playSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // Acorde C-E-G-C

        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.07);

            gain.gain.setValueAtTime(0.08, now + index * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + index * 0.07);
            osc.stop(now + index * 0.07 + 0.18);
        });
    }

    // Som de alerta / comando com erro
    playError() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.18);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Som de Level Up épico
    playLevelUp() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51];

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.1, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.25);
        });
    }
}

// ==============================================================================
// 2. SISTEMA DE ARQUIVOS VIRTUAL (Virtual File System - VFS)
// Simula uma árvore hierárquica de pastas e arquivos navegáveis via terminal.
// ==============================================================================
class VirtualFileSystem {
    constructor() {
        this.root = {
            name: '/',
            type: 'dir',
            parent: null,
            children: {}
        };

        this.currentDir = this.root;
        this.initFilesystem();
    }

    initFilesystem() {
        // Criar estrutura básica: /home/agente, /sistema, /logs, /segredos
        this.mkdir('/', 'home');
        this.mkdir('/home', 'agente');
        this.mkdir('/', 'sistema');
        this.mkdir('/', 'logs');
        this.mkdir('/', 'segredos');

        // Arquivos em /home/agente
        this.touch('/home/agente', 'readme.txt', 
`=== PROTOCOLO NEXUS: MANUAL DO OPERADOR ===
Seja bem-vindo ao sistema de terminal virtual da NEXUS CORP.
Sua missão é operar terminais seguros, rastrear ameaças e corrigir falhas de segurança.

COMANDOS BÁSICOS:
- 'help'           : Exibe os comandos disponíveis.
- 'ls'             : Lista arquivos da pasta atual.
- 'cd <diretório>' : Entra em uma pasta (ex: 'cd logs', 'cd ..', 'cd /').
- 'cat <arquivo>'  : Lê o conteúdo de um arquivo de texto.
- 'whoami'         : Identifica suas credenciais de operador.
- 'status'         : Exibe o progresso da sua missão e seu nível de agente.
- 'submit <resp>'  : Envia a resposta de uma missão para validação.
`);

        this.touch('/home/agente', 'notas.txt',
`[ANOTAÇÕES PESSOAIS DO AGENTE]
- Lembrete: Nunca compartilhe credenciais em texto puro.
- O analista anterior mencionou comportamento anômalo vindo do firewall.
- Se precisar limpar a tela a qualquer momento, use o comando 'clear'.
`);

        // Arquivos em /logs
        this.touch('/logs', 'acesso.log',
`[2026-10-26 03:14:02] LOGIN_OK - user: admin - IP: 127.0.0.1
[2026-10-26 03:22:15] AUTH_FAIL - user: root - IP: 192.168.42.99 [TENTATIVA_INVALIDA]
[2026-10-26 03:22:18] AUTH_FAIL - user: root - IP: 192.168.42.99 [TENTATIVA_INVALIDA]
[2026-10-26 03:22:21] BREACH_ALERT - Falha contornada via porta 8080! IP ALVO: 192.168.42.99
[2026-10-26 03:25:00] SYSTEM - Conexão encerrada pelo host remoto.
`);

        this.touch('/logs', 'auditoria.log',
`Integridade dos pacotes do núcleo: 100% OK
Daemon de criptografia: ATIVO
Memória alocada: 2048 MB / 4096 MB
`);

        // Arquivos em /sistema
        this.touch('/sistema', 'firewall.js',
`// SCRIPT DE VALIDAÇÃO DE PACOTES DE REDE
function validarAcesso(pacote) {
    let autorizado = false;
    
    // LINHA 4 - ATENÇÃO: ERRO DE LÓGICA GRAVE DETECTADO AQUI!
    // Usaram atribuição (=) em vez de comparação estrita (===)
    if (pacote.origem = "externa") {
        autorizado = true; // Permite qualquer pacote externo por engano!
    }
    
    return autorizado;
}
// Pista para o agente: Para corrigir a linha 4, a comparação deve ser 'pacote.origem === "interna"'
`);

        this.touch('/sistema', 'config.sys',
`KERNEL_VERSION=2.4.0-CYBER
NET_INTERFACE=eth0
FIREWALL_STATUS=COMPROMETIDO
SECURITY_LEVEL=AMBER
`);

        // Arquivos em /segredos
        this.touch('/segredos', 'malware_payload.b64',
`TkVYVVNfT1ZFUlJJREVfS0VZXzIwMjY=
// Dica: Esse texto foi codificado em Base64.
// Use o comando 'decode <texto>' para decodificá-lo!
`);

        // Diretório padrão inicial é a home do agente
        this.cd('/home/agente');
    }

    // Cria diretório
    mkdir(parentPath, name) {
        const parent = this.resolvePath(parentPath);
        if (!parent || parent.type !== 'dir') return false;
        if (parent.children[name]) return false;

        parent.children[name] = {
            name,
            type: 'dir',
            parent,
            children: {}
        };
        return true;
    }

    // Cria arquivo de texto
    touch(parentPath, name, content = '') {
        const parent = this.resolvePath(parentPath);
        if (!parent || parent.type !== 'dir') return false;

        parent.children[name] = {
            name,
            type: 'file',
            parent,
            content
        };
        return true;
    }

    // Resolve caminhos absolutos ou relativos (ex: '/', '/home/agente', '..', 'logs')
    resolvePath(pathStr) {
        if (!pathStr || pathStr === '.') return this.currentDir;
        if (pathStr === '~') pathStr = '/home/agente';

        let current = pathStr.startsWith('/') ? this.root : this.currentDir;
        const segments = pathStr.split('/').filter(p => p.length > 0 && p !== '.');

        for (const seg of segments) {
            if (seg === '..') {
                if (current.parent) {
                    current = current.parent;
                }
            } else {
                if (current.type !== 'dir' || !current.children[seg]) {
                    return null; // Caminho não existe
                }
                current = current.children[seg];
            }
        }
        return current;
    }

    // Retorna string do caminho atual (ex: /home/agente)
    getCurrentPathString() {
        if (this.currentDir === this.root) return '/';
        const parts = [];
        let curr = this.currentDir;
        while (curr && curr.parent) {
            parts.unshift(curr.name);
            curr = curr.parent;
        }
        return '/' + parts.join('/');
    }

    // Altera o diretório atual
    cd(targetPath) {
        if (!targetPath || targetPath === '~') {
            const home = this.resolvePath('/home/agente');
            if (home) {
                this.currentDir = home;
                return { success: true, path: this.getCurrentPathString() };
            }
        }

        const target = this.resolvePath(targetPath);
        if (!target) {
            return { success: false, message: `cd: diretório não encontrado: ${targetPath}` };
        }
        if (target.type !== 'dir') {
            return { success: false, message: `cd: não é um diretório: ${targetPath}` };
        }

        this.currentDir = target;
        return { success: true, path: this.getCurrentPathString() };
    }

    // Lista conteúdo do diretório
    ls(targetPath) {
        const dir = targetPath ? this.resolvePath(targetPath) : this.currentDir;
        if (!dir) {
            return { success: false, message: `ls: diretório inexistente: ${targetPath}` };
        }
        if (dir.type !== 'dir') {
            return { success: false, message: `ls: ${targetPath} não é um diretório` };
        }

        const entries = Object.values(dir.children).map(item => ({
            name: item.name + (item.type === 'dir' ? '/' : ''),
            type: item.type
        }));

        return { success: true, entries };
    }

    // Lê arquivo
    cat(filePath) {
        if (!filePath) {
            return { success: false, message: `cat: informe o nome do arquivo` };
        }
        const file = this.resolvePath(filePath);
        if (!file) {
            return { success: false, message: `cat: arquivo não encontrado: ${filePath}` };
        }
        if (file.type === 'dir') {
            return { success: false, message: `cat: '${filePath}' é um diretório, não um arquivo.` };
        }
        return { success: true, content: file.content };
    }
}

// ==============================================================================
// 3. GERENCIADOR DE MISSÕES E PROGRESSÃO RPG (QuestManager)
// Controla XP, níveis, patentes e a narrativa do jogador.
// ==============================================================================
class QuestManager {
    constructor() {
        this.quests = [
            {
                id: 1,
                title: "Missão 1: Protocolo de Iniciação",
                desc: "Acesse o sistema operacional NEXUS, aprenda os comandos básicos e identifique suas credenciais de operador.",
                objectives: [
                    { id: "use_help", text: "Executar o comando 'help'", completed: false },
                    { id: "use_whoami", text: "Executar o comando 'whoami'", completed: false },
                    { id: "read_readme", text: "Ler o arquivo 'readme.txt' com 'cat readme.txt'", completed: false }
                ],
                rewardXp: 100,
                hint: "Digite 'help' para comandos, 'whoami' para ver seu usuário e 'cat readme.txt' para ler o arquivo."
            },
            {
                id: 2,
                title: "Missão 2: O Rastreio de Intrusão",
                desc: "Alerta de segurança! Um hacker tentou invadir o sistema. Investigue a pasta '/logs', encontre o IP suspeito no 'acesso.log' e envie com 'submit <IP>'.",
                objectives: [
                    { id: "enter_logs", text: "Navegar até a pasta '/logs' com 'cd /logs'", completed: false },
                    { id: "read_access_log", text: "Ler o arquivo 'acesso.log' com 'cat acesso.log'", completed: false },
                    { id: "submit_ip", text: "Enviar o IP do invasor via 'submit 192.168.42.99'", completed: false }
                ],
                rewardXp: 150,
                hint: "Use 'cd /logs', depois 'cat acesso.log'. Quando achar o IP invasor, envie com 'submit <IP>'."
            },
            {
                id: 3,
                title: "Missão 3: O Bug no Firewall",
                desc: "O invasor comprometeu a segurança explorando uma falha de código no script '/sistema/firewall.js'. Examine o código e identifique o número da linha com o erro.",
                objectives: [
                    { id: "read_firewall", text: "Inspecionar o arquivo '/sistema/firewall.js'", completed: false },
                    { id: "submit_bug", text: "Enviar a linha do erro com 'submit 4' ou 'submit linha 4'", completed: false }
                ],
                rewardXp: 200,
                hint: "Use 'cat /sistema/firewall.js' para ver o código em JavaScript. Qual linha contém a atribuição '=' em vez de comparação?"
            },
            {
                id: 4,
                title: "Missão 4: Quebra de Criptografia Neural",
                desc: "Localizamos um artefato de malware em '/segredos/malware_payload.b64'. Decodifique o texto Base64 e envie a chave mestre com 'submit <CHAVE>'.",
                objectives: [
                    { id: "read_payload", text: "Ler o arquivo '/segredos/malware_payload.b64'", completed: false },
                    { id: "decode_b64", text: "Usar o comando 'decode <hash>' para decifrar a mensagem", completed: false },
                    { id: "submit_key", text: "Enviar a chave secreta com 'submit NEXUS_OVERRIDE_KEY_2026'", completed: false }
                ],
                rewardXp: 300,
                hint: "Leia o arquivo com 'cat /segredos/malware_payload.b64'. Depois use 'decode <conteúdo>' e envie o resultado!"
            }
        ];

        this.currentQuestIndex = 0;
        this.xp = 0;
        this.level = 1;
        this.ranks = [
            { level: 1, title: "Iniciante", minXp: 0 },
            { level: 2, title: "Script Kiddie", minXp: 100 },
            { level: 3, title: "Cyber Novice", minXp: 250 },
            { level: 4, title: "Netrunner", minXp: 450 },
            { level: 5, title: "Arquiteto Cyberpunk", minXp: 750 }
        ];

        this.loadProgress();
    }

    getCurrentQuest() {
        if (this.currentQuestIndex >= this.quests.length) {
            return null; // Todas as missões foram finalizadas!
        }
        return this.quests[this.currentQuestIndex];
    }

    // Atualiza um objetivo da missão atual
    checkObjective(objectiveId) {
        const quest = this.getCurrentQuest();
        if (!quest) return false;

        const obj = quest.objectives.find(o => o.id === objectiveId);
        if (obj && !obj.completed) {
            obj.completed = true;
            this.saveProgress();

            // Verifica se todos os objetivos foram cumpridos
            const allDone = quest.objectives.every(o => o.completed);
            if (allDone) {
                this.completeQuest();
                return { objectiveCompleted: true, questCompleted: true };
            }
            return { objectiveCompleted: true, questCompleted: false };
        }
        return false;
    }

    // Conclui a missão atual e concede XP
    completeQuest() {
        const quest = this.getCurrentQuest();
        if (!quest) return;

        this.addXp(quest.rewardXp);
        this.currentQuestIndex++;
        this.saveProgress();
    }

    // Adiciona XP e calcula subida de nível
    addXp(amount) {
        this.xp += amount;

        // Calcular se subiu de nível
        let newLevel = 1;
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (this.xp >= this.ranks[i].minXp) {
                newLevel = this.ranks[i].level;
                break;
            }
        }

        const leveledUp = newLevel > this.level;
        this.level = newLevel;
        this.saveProgress();

        return { leveledUp, newLevel, currentRank: this.getCurrentRank().title };
    }

    getCurrentRank() {
        const rank = this.ranks.slice().reverse().find(r => this.level >= r.level);
        return rank || this.ranks[0];
    }

    getNextLevelXp() {
        const nextRank = this.ranks.find(r => r.level === this.level + 1);
        return nextRank ? nextRank.minXp : this.ranks[this.ranks.length - 1].minXp;
    }

    // Persistência em LocalStorage
    saveProgress() {
        const state = {
            currentQuestIndex: this.currentQuestIndex,
            xp: this.xp,
            level: this.level,
            quests: this.quests
        };
        try {
            localStorage.setItem('terminal_quest_save', JSON.stringify(state));
        } catch (e) {
            console.warn('Falha ao salvar no localStorage', e);
        }
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('terminal_quest_save');
            if (saved) {
                const state = JSON.parse(saved);
                this.currentQuestIndex = state.currentQuestIndex ?? 0;
                this.xp = state.xp ?? 0;
                this.level = state.level ?? 1;
                if (state.quests && state.quests.length === this.quests.length) {
                    this.quests = state.quests;
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar do localStorage', e);
        }
    }

    resetProgress() {
        localStorage.removeItem('terminal_quest_save');
        this.currentQuestIndex = 0;
        this.xp = 0;
        this.level = 1;
        this.quests.forEach(q => q.objectives.forEach(o => o.completed = false));
        this.saveProgress();
    }
}

// ==============================================================================
// 4. CONTROLADOR DO TERMINAL (TerminalController)
// Trata I/O, comandos do usuário, histórico e feedback visual.
// ==============================================================================
class TerminalController {
    constructor() {
        this.vfs = new VirtualFileSystem();
        this.questManager = new QuestManager();
        this.audio = new AudioEngine();

        // Elementos do DOM
        this.terminalOutput = document.getElementById('terminalOutput');
        this.commandInput = document.getElementById('commandInput');
        this.executeButton = document.getElementById('executeButton');
        this.promptLabel = document.getElementById('promptLabel');
        this.currentPathLabel = document.getElementById('currentPathLabel');

        // Elementos do HUD
        this.hudLevel = document.getElementById('hudLevel');
        this.hudRank = document.getElementById('hudRank');
        this.hudXpCurrent = document.getElementById('hudXpCurrent');
        this.hudXpNext = document.getElementById('hudXpNext');
        this.hudXpPercent = document.getElementById('hudXpPercent');
        this.hudXpBar = document.getElementById('hudXpBar');
        this.hudQuestTitle = document.getElementById('hudQuestTitle');
        this.hudQuestDesc = document.getElementById('hudQuestDesc');
        this.hudQuestObjectives = document.getElementById('hudQuestObjectives');
        this.hudQuestReward = document.getElementById('hudQuestReward');

        // Botões de áudio e reset
        this.toggleAudioBtn = document.getElementById('toggleAudioBtn');
        this.audioStatusText = document.getElementById('audioStatusText');
        this.audioIcon = document.getElementById('audioIcon');
        this.resetGameBtn = document.getElementById('resetGameBtn');
        this.systemClock = document.getElementById('systemClock');

        // Histórico de comandos
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        this.bindEvents();
        this.startClock();
        this.updateHUD();
        this.printWelcomeMessage();
    }

    bindEvents() {
        // Envio pelo botão ou pressionando Enter
        this.executeButton.addEventListener('click', () => this.handleCommandSubmit());
        this.commandInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));

        // Sons ao digitar no campo
        this.commandInput.addEventListener('input', () => this.audio.playKeyClick());

        // Controle de áudio
        this.toggleAudioBtn.addEventListener('click', () => {
            const enabled = this.audio.toggle();
            this.audioStatusText.textContent = enabled ? 'ON' : 'OFF';
            this.audioIcon.textContent = enabled ? '🔊' : '🔇';
            if (enabled) this.audio.playSuccess();
        });

        // Botão de reinicialização
        this.resetGameBtn.addEventListener('click', () => {
            if (confirm('Deseja realmente resetar todo o progresso do jogo?')) {
                this.questManager.resetProgress();
                this.vfs = new VirtualFileSystem();
                this.terminalOutput.innerHTML = '';
                this.updateHUD();
                this.printLine('[SISTEMA REINICIADO COM SUCESSO]', 'warning');
                this.printWelcomeMessage();
            }
        });

        // Atalhos rápidos no HUD
        document.querySelectorAll('.shortcut-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                this.commandInput.value = cmd;
                this.handleCommandSubmit();
            });
        });

        // Clicar no terminal mantém o foco no input
        this.terminalOutput.addEventListener('click', () => this.commandInput.focus());
    }

    // Relógio dinâmico do sistema
    startClock() {
        const update = () => {
            const now = new Date();
            this.systemClock.textContent = now.toTimeString().split(' ')[0];
        };
        update();
        setInterval(update, 1000);
    }

    // Tratamento de teclas: Enter para executar, ArrowUp/ArrowDown para histórico
    handleInputKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleCommandSubmit();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.history.length > 0 && this.historyIndex > 0) {
                this.historyIndex--;
                this.commandInput.value = this.history[this.historyIndex];
            } else if (this.historyIndex === -1 && this.history.length > 0) {
                this.historyIndex = this.history.length - 1;
                this.commandInput.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex !== -1 && this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.commandInput.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = -1;
                this.commandInput.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.handleAutoCompletion();
        }
    }

    // Auto-completar inteligente com Tab
    handleAutoCompletion() {
        const input = this.commandInput.value.trim();
        const availableCommands = ['help', 'clear', 'status', 'ls', 'cd', 'cat', 'whoami', 'submit', 'decode', 'echo', 'date', 'reset'];

        if (!input.includes(' ')) {
            const match = availableCommands.find(c => c.startsWith(input));
            if (match) {
                this.commandInput.value = match + ' ';
            }
        } else {
            const [cmd, arg] = input.split(' ');
            if (['cd', 'cat', 'ls'].includes(cmd)) {
                const lsResult = this.vfs.ls();
                if (lsResult.success) {
                    const matchEntry = lsResult.entries.find(e => e.name.toLowerCase().startsWith(arg.toLowerCase()));
                    if (matchEntry) {
                        this.commandInput.value = `${cmd} ${matchEntry.name}`;
                    }
                }
            }
        }
    }

    // Processamento da execução de um comando digitado
    handleCommandSubmit() {
        const rawInput = this.commandInput.value;
        const trimmedInput = rawInput.trim();

        if (trimmedInput === '') return;

        // Adiciona ao histórico de comandos
        this.history.push(rawInput);
        this.historyIndex = -1;

        // Imprime o eco do comando no terminal
        const promptText = `agente@nexus:${this.vfs.getCurrentPathString()}$ ${rawInput}`;
        this.printLine(promptText, 'command-echo');

        // Limpa o input
        this.commandInput.value = '';

        // Executa o comando
        this.executeCommand(trimmedInput);

        // Rola até o final
        this.scrollToBottom();
    }

    // Interpretador e despachante de comandos
    executeCommand(commandString) {
        // Divide o comando e argumentos (mantendo suporte a aspas básicas)
        const parts = commandString.split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'help':
                this.cmdHelp();
                this.processObjectiveTrigger('use_help');
                break;

            case 'clear':
                this.cmdClear();
                break;

            case 'whoami':
                this.cmdWhoami();
                this.processObjectiveTrigger('use_whoami');
                break;

            case 'status':
            case 'missions':
            case 'missao':
                this.cmdStatus();
                break;

            case 'ls':
                this.cmdLs(args[0]);
                break;

            case 'cd':
                this.cmdCd(args[0]);
                break;

            case 'cat':
                this.cmdCat(args[0]);
                break;

            case 'submit':
            case 'enviar':
                this.cmdSubmit(args.join(' '));
                break;

            case 'decode':
            case 'b64':
                this.cmdDecode(args.join(' '));
                break;

            case 'echo':
                this.printLine(args.join(' '));
                break;

            case 'date':
                this.printLine(new Date().toLocaleString('pt-BR'), 'info');
                break;

            case 'reset':
                this.resetGameBtn.click();
                break;

            default:
                this.audio.playError();
                this.printLine(`Comando não reconhecido: '${command}'. Digite 'help' para visualizar a lista de comandos.`, 'error');
                break;
        }

        // Atualiza o prompt atual
        this.updatePromptPath();
    }

    // --------------------------------------------------------------------------
    // IMPLEMENTAÇÃO DOS COMANDOS DO TERMINAL
    // --------------------------------------------------------------------------

    cmdHelp() {
        this.audio.playSuccess();
        const helpText = 
`╔═══════════════════════════════════════════════════════════════════════════════╗
║                      NEXUS TERMINAL — MANUAL DE COMANDOS                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ COMANDOS GERAIS:                                                              ║
║   help             - Exibe este menu com as instruções do sistema             ║
║   clear            - Limpa todo o histórico de texto na tela                  ║
║   whoami           - Informações sobre a identidade do operador conectado     ║
║   status           - Resumo da missão atual, nível, XP e objetivos            ║
║   date             - Mostra a data e hora do servidor                         ║
║                                                                               ║
║ NAVEGAÇÃO E ARQUIVOS:                                                         ║
║   ls [caminho]     - Lista pastas e arquivos no diretório                     ║
║   cd <diretório>   - Muda de diretório (ex: 'cd logs', 'cd ..', 'cd /')       ║
║   cat <arquivo>    - Lê o conteúdo de um arquivo de texto                     ║
║                                                                               ║
║ RESOLUÇÃO DE MISSÕES:                                                         ║
║   submit <resposta>- Envia a solução ou evidência para validar a missão ativa ║
║   decode <base64>  - Decodifica uma sequência de texto em Base64              ║
║   reset            - Reinicia todo o progresso do jogo                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝`;
        this.printLine(helpText, 'info');
    }

    cmdClear() {
        this.terminalOutput.innerHTML = '';
    }

    cmdWhoami() {
        this.audio.playSuccess();
        const rank = this.questManager.getCurrentRank();
        const info = 
`[IDENTIFICAÇÃO DO SISTEMA]
Codinome    : Agente-0
Patente     : ${rank.title} (Nível ${this.questManager.level})
Experiência : ${this.questManager.xp} XP
Autorização : Nível de Acesso Alpha
Ambiente    : Nexus Virtual Sandboxed Workstation`;
        this.printLine(info, 'info');
    }

    cmdStatus() {
        this.audio.playSuccess();
        const quest = this.questManager.getCurrentQuest();
        if (!quest) {
            this.printLine("PARABÉNS! Você completou todas as missões disponíveis nesta versão do Terminal Quest!", "success");
            return;
        }

        let output = `[STATUS DA MISSÃO ATIVA]\n`;
        output += `Título: ${quest.title}\n`;
        output += `Descrição: ${quest.desc}\n\n`;
        output += `Objetivos:\n`;
        quest.objectives.forEach(obj => {
            output += `  [${obj.completed ? '✓ CONCLUÍDO' : 'PENDENTE'}] ${obj.text}\n`;
        });
        output += `\nDica: ${quest.hint}`;
        this.printLine(output, 'warning');
    }

    cmdLs(pathArg) {
        const result = this.vfs.ls(pathArg);
        if (!result.success) {
            this.audio.playError();
            this.printLine(result.message, 'error');
            return;
        }

        if (result.entries.length === 0) {
            this.printLine("(Diretório vazio)", "system");
            return;
        }

        let output = "";
        result.entries.forEach(item => {
            const isDir = item.type === 'dir';
            output += `${isDir ? '📁' : '📄'} ${item.name.padEnd(20)} `;
        });
        this.printLine(output, 'info');
    }

    cmdCd(pathArg) {
        const result = this.vfs.cd(pathArg);
        if (!result.success) {
            this.audio.playError();
            this.printLine(result.message, 'error');
            return;
        }

        this.audio.playKeyClick();
        this.updatePromptPath();

        // Checagem de objetivos relacionados à navegação
        if (this.vfs.getCurrentPathString() === '/logs') {
            this.processObjectiveTrigger('enter_logs');
        }
    }

    cmdCat(fileArg) {
        if (!fileArg) {
            this.audio.playError();
            this.printLine("cat: especifique o nome do arquivo a ser lido. Ex: 'cat readme.txt'", 'error');
            return;
        }

        const result = this.vfs.cat(fileArg);
        if (!result.success) {
            this.audio.playError();
            this.printLine(result.message, 'error');
            return;
        }

        this.audio.playSuccess();
        this.printLine(result.content, 'system');

        // Gatilhos de leitura de arquivos para missões
        if (fileArg.includes('readme.txt')) {
            this.processObjectiveTrigger('read_readme');
        }
        if (fileArg.includes('acesso.log')) {
            this.processObjectiveTrigger('read_access_log');
        }
        if (fileArg.includes('firewall.js')) {
            this.processObjectiveTrigger('read_firewall');
        }
        if (fileArg.includes('malware_payload.b64')) {
            this.processObjectiveTrigger('read_payload');
        }
    }

    // Comando Submit: Envia respostas para validar desafios de lógica e segurança
    cmdSubmit(answer) {
        if (!answer) {
            this.audio.playError();
            this.printLine("submit: informe a resposta que deseja enviar. Ex: 'submit 192.168.42.99'", 'error');
            return;
        }

        const clean = answer.trim().toLowerCase();
        const currentQuest = this.questManager.getCurrentQuest();

        if (!currentQuest) {
            this.printLine("Todas as missões já foram finalizadas com sucesso!", 'success');
            return;
        }

        if (currentQuest.id === 2) {
            // Missão 2 espera o IP 192.168.42.99
            if (clean.includes('192.168.42.99')) {
                this.audio.playSuccess();
                this.printLine(`[EVIDÊNCIA ACEITA] IP invasor 192.168.42.99 confirmado e bloqueado no roteador!`, 'success');
                this.processObjectiveTrigger('submit_ip');
            } else {
                this.audio.playError();
                this.printLine(`[FALHA] O IP informado não corresponde à ameaça registrada no log. Revise o 'acesso.log'.`, 'error');
            }
        } else if (currentQuest.id === 3) {
            // Missão 3 espera a linha 4 ou menção ao operador '='
            if (clean.includes('4') || clean.includes('linha 4') || clean.includes('===')) {
                this.audio.playSuccess();
                this.printLine(`[VULNERABILIDADE CORRIGIDA] Erro de operador de atribuição na Linha 4 sanado com sucesso!`, 'success');
                this.processObjectiveTrigger('submit_bug');
            } else {
                this.audio.playError();
                this.printLine(`[FALHA] Resposta incorreta. Inspecione a linha onde foi usada atribuição '=' em vez de comparação de igualdade.`, 'error');
            }
        } else if (currentQuest.id === 4) {
            // Missão 4 espera a chave decodificada NEXUS_OVERRIDE_KEY_2026
            if (answer.trim() === 'NEXUS_OVERRIDE_KEY_2026') {
                this.audio.playLevelUp();
                this.printLine(`[CHAVE MESTRE ACEITA] A ameaça de malware foi neutralizada no servidor central!`, 'success');
                this.processObjectiveTrigger('submit_key');
            } else {
                this.audio.playError();
                this.printLine(`[CHAVE INVÁLIDA] Use o utilitário 'decode' na cadeia Base64 para obter a chave correta.`, 'error');
            }
        } else {
            this.printLine(`Nenhuma resposta pendente de 'submit' para a missão atual. Siga as instruções do painel.`, 'system');
        }
    }

    // Utilitário decodificador de Base64
    cmdDecode(str) {
        if (!str) {
            this.audio.playError();
            this.printLine("decode: passe o texto codificado. Ex: 'decode TkVYVVNfT1ZFUlJJREVfS0VZXzIwMjY='", 'error');
            return;
        }

        try {
            // Limpa quebras de linha ou espaços
            const cleanStr = str.replace(/\s+/g, '');
            const decoded = atob(cleanStr);
            this.audio.playSuccess();
            this.printLine(`[TEXTO DECODIFICADO]:\n${decoded}`, 'success');
            this.processObjectiveTrigger('decode_b64');
        } catch (e) {
            this.audio.playError();
            this.printLine(`decode: erro ao decodificar a string Base64 informada. Verifique se o texto está correto.`, 'error');
        }
    }

    // Processa disparo de gatilhos de objetivos
    processObjectiveTrigger(objectiveId) {
        const result = this.questManager.checkObjective(objectiveId);
        if (result && result.objectiveCompleted) {
            this.audio.playSuccess();
            this.updateHUD();

            if (result.questCompleted) {
                this.audio.playLevelUp();
                this.printLine(`\n★ PARABÉNS! VOCÊ COMPLETOU A MISSÃO COM SUCESSO! ★`, 'success');
                this.printLine(`+${this.questManager.getCurrentRank()?.minXp || 100} XP Concedidos!\n`, 'warning');
                
                const nextQuest = this.questManager.getCurrentQuest();
                if (nextQuest) {
                    this.printLine(`>> NOVA MISSÃO DESBLOQUEADA: ${nextQuest.title}`, 'info');
                    this.printLine(`Objetivo: ${nextQuest.desc}\n`, 'system');
                } else {
                    this.printLine(`🏆 VOCÊ ZEROU A CAMPANHA DEMO DO TERMINAL QUEST!`, 'success');
                    this.printLine(`Você agora detém o título de ${this.questManager.getCurrentRank().title}.`, 'info');
                }
            }
        }
    }

    // --------------------------------------------------------------------------
    // UTILITÁRIOS VISUAIS E DE ATUALIZAÇÃO
    // --------------------------------------------------------------------------

    updatePromptPath() {
        const path = this.vfs.getCurrentPathString();
        const displayPath = path === '/home/agente' ? '~' : path;
        this.currentPathLabel.textContent = displayPath;
    }

    updateHUD() {
        // Nível e Rank
        this.hudLevel.textContent = this.questManager.level;
        this.hudRank.textContent = this.questManager.getCurrentRank().title;

        // Barra de Experiência
        const currentXp = this.questManager.xp;
        const nextXp = this.questManager.getNextLevelXp();
        this.hudXpCurrent.textContent = currentXp;
        this.hudXpNext.textContent = nextXp;

        const percent = Math.min(100, Math.round((currentXp / nextXp) * 100));
        this.hudXpPercent.textContent = `${percent}%`;
        this.hudXpBar.style.width = `${percent}%`;

        // Informações da Missão
        const quest = this.questManager.getCurrentQuest();
        if (quest) {
            this.hudQuestTitle.textContent = quest.title;
            this.hudQuestDesc.textContent = quest.desc;
            this.hudQuestReward.textContent = `+${quest.rewardXp} XP`;

            this.hudQuestObjectives.innerHTML = '';
            quest.objectives.forEach(obj => {
                const li = document.createElement('li');
                li.className = obj.completed ? 'done' : '';
                li.textContent = obj.text;
                this.hudQuestObjectives.appendChild(li);
            });
        } else {
            this.hudQuestTitle.textContent = "TODAS AS MISSÕES CONCLUÍDAS!";
            this.hudQuestDesc.textContent = "Você provou seu valor dominando os comandos e protegendo o núcleo do Nexus.";
            this.hudQuestObjectives.innerHTML = '<li class="done">Campanha finalizada</li>';
            this.hudQuestReward.textContent = "NÍVEL MÁXIMO";
        }
    }

    printLine(text, cssClass = '') {
        const div = document.createElement('div');
        div.className = `term-line ${cssClass}`;
        div.textContent = text;
        this.terminalOutput.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }

    printWelcomeMessage() {
        const banner = 
`  _______                  _             _    ____                  _   
 |__   __|                (_)           | |  / __ \\                | |  
    | | ___ _ __ _ __ ___  _ _ __   __ _| | | |  | |_   _  ___  ___| |_ 
    | |/ _ \\ '__| '_ \` _ \\| | '_ \\ / _\` | | | |  | | | | |/ _ \\/ __| __|
    | |  __/ |  | | | | | | | | | | (_| | | | |__| | |_| |  __/\\__ \\ |_ 
    |_|\\___|_|  |_| |_| |_|_|_| |_|\\__,_|_|  \\___\\_\\\\__,_|\\___||___/\\__|
                                                       CYBERPUNK RPG v1.0`;

        this.printLine(banner, 'ascii-art');
        this.printLine("--------------------------------------------------------------------------------", "system");
        this.printLine("Iniciando ambiente neural Nexus OS...", "system");
        this.printLine("Kernel carregado. Conexão encriptada estabelecida.", "system");
        this.printLine("Digite 'help' para listar todos os comandos disponíveis.", "warning");
        this.printLine("--------------------------------------------------------------------------------\n", "system");
    }
}

// ==============================================================================
// 5. INICIALIZAÇÃO DA APLICAÇÃO
// ==============================================================================
window.addEventListener('DOMContentLoaded', () => {
    // Instancia o controlador geral do jogo
    window.gameApp = new TerminalController();
});
