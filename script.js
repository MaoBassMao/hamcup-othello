// --- 定数 ---
const EMPTY = 0; const BLACK = 1; const WHITE = 2; const BOARD_SIZE = 8; const NON_BREAKING_SPACE = '\u00A0';
const POSITIONAL_WEIGHTS = [ [120, -20, 20, 5, 5, 20, -20, 120], [-20, -40, -5, -5, -5, -5, -40, -20], [20, -5, 15, 3, 3, 15, -5, 20], [5, -5, 3, 3, 3, 3, -5, 5], [5, -5, 3, 3, 3, 3, -5, 5], [20, -5, 15, 3, 3, 15, -5, 20], [-20, -40, -5, -5, -5, -5, -40, -20], [120, -20, 20, 5, 5, 20, -20, 120] ];
const MOBILITY_WEIGHT = 5; const AI_MOVE_DELAY = 500; const NUM_IMAGES = 29; const DEFAULT_BLACK_VALUE = 'default_black'; const DEFAULT_WHITE_VALUE = 'default_white';
const IMAGE_NAMES = {'001': 'じゃが','002': 'さくら','003': 'プリン','004': 'かぷちーも','005': 'とっとこハム娘。','006': 'くべし','007': 'リョータ','008': 'ハムまろ','009': 'リーゼント丸','010': 'もみじ','011': 'アクア','012': 'うずら','013': 'すいめい','014': 'ハムりん','015': 'ラッキー','016': 'なないろ','017': 'くり坊','018': 'みたらし','019': 'タンゴ','020': 'ついてる','021': 'バク','022': 'このは','023': 'たいあん','024': 'ハムレット','025': 'クリオネア','026': 'むらむすめ','027': 'あんみつ姫','028': 'べにたん','029': 'もな'};

// --- Supabase クライアント初期化 ---
const SUPABASE_URL = 'https://xrugexrfaeogowiwif.supabase.co'; // ★★★ あなたのURLに書き換える ★★★
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZXVneHJmYWVnb3loZXdmeWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTg4ODUsImV4cCI6MjA2MDI3NDg4NX0.QkORDNLczY1cDn7bTRnO6zAbWGYscttj62z7Fx0xkwI'; // ★★★ あなたのanonキーに書き換える ★★★
let supabaseClient = null;
try { if (window.supabase) { const { createClient } = window.supabase; supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); console.log('Supabase client initialized:', supabaseClient ? 'OK' : 'Failed'); if (!supabaseClient) throw new Error("Initialization failed"); } else { throw new Error('Supabase library not loaded!'); } } catch (error) { console.error('Error initializing Supabase client:', error); }

// --- グローバル変数 (ゲーム状態など) ---
let board = []; let currentPlayer = BLACK; let gameOver = false;
let playerBlackType = 'human'; let playerWhiteType = 'ai_level2';
let lastMoveRow = -1; let lastMoveCol = -1;
let playerBlackImage = ''; let playerWhiteImage = '';
let currentUser = null; let currentGameId = null; let realtimeChannel = null;

// --- HTML要素への参照 (グローバルで宣言し、DOMContentLoadedで取得) ---
// (nullで初期化しておき、DOM準備完了後に要素を代入)
let authContainer = null; let emailInput = null; let passwordInput = null; let loginButton = null; let signupButton = null; let guestButton = null; let authMessage = null; let gameSetupElement = null; let aiSettingsElement = null; let aiLevelSelect = null; let playerColorRadios = null; let imageSettingsElement = null; let blackImageSelect = null; let whiteImageSelect = null; let startButton = null; let logoutButton = null; let onlineMatchButton = null; let gameContainerElement = null; let boardElement = null; let currentPlayerElement = null; let gameStatusElement = null; let scoreElement = null; let gameResultElement = null; let resultMessageElement = null; let resetButton = null;


// --- Helper Function ---
function formatImageNumber(num) { return String(num).padStart(3, '0'); }

/** 画像選択のドロップダウンを生成 */
function populateImageSelectors() {
    // この関数が呼ばれる時点では、要素は取得済みのはず (DOMContentLoaded内で呼ばれるため)
    console.log('Populating image selectors...');
    try {
        if (!blackImageSelect || !whiteImageSelect || !gameModeRadios) { console.error("Required elements for populateImageSelectors not found inside function."); return; } // 要素存在チェック
        const selectedModeElement = document.querySelector('input[name="gameMode"]:checked');
        if (!selectedModeElement) { console.warn("No game mode selected yet for populating images."); return; }
        const selectedMode = selectedModeElement.value;
        const currentBlackVal = blackImageSelect.value; const currentWhiteVal = whiteImageSelect.value;
        blackImageSelect.innerHTML = ''; whiteImageSelect.innerHTML = '';

        const defaultBlackOpt = document.createElement('option'); defaultBlackOpt.value = DEFAULT_BLACK_VALUE; defaultBlackOpt.textContent = 'デフォルト (黒)'; blackImageSelect.appendChild(defaultBlackOpt);
        const defaultWhiteOpt = document.createElement('option'); defaultWhiteOpt.value = DEFAULT_WHITE_VALUE; defaultWhiteOpt.textContent = 'デフォルト (白)'; whiteImageSelect.appendChild(defaultWhiteOpt);

        const generateOption = (index) => { const numStr = formatImageNumber(index); const displayName = IMAGE_NAMES[numStr] || `不明 (${numStr})`; const option = document.createElement('option'); option.value = numStr; option.textContent = `${numStr}: ${displayName}`; return option; };

        if (selectedMode === 'hvh') { for (let i = 1; i <= NUM_IMAGES; i++) { if (i % 2 !== 0) { blackImageSelect.appendChild(generateOption(i)); } if (i % 2 === 0) { whiteImageSelect.appendChild(generateOption(i)); } } }
        else { for (let i = 1; i <= NUM_IMAGES; i++) { blackImageSelect.appendChild(generateOption(i).cloneNode(true)); whiteImageSelect.appendChild(generateOption(i).cloneNode(true)); } }
        blackImageSelect.value = (blackImageSelect.querySelector(`option[value="${currentBlackVal}"]`)) ? currentBlackVal : DEFAULT_BLACK_VALUE;
        whiteImageSelect.value = (whiteImageSelect.querySelector(`option[value="${currentWhiteVal}"]`)) ? currentWhiteVal : DEFAULT_WHITE_VALUE;
        if (blackImageSelect.options.length === 1) blackImageSelect.value = DEFAULT_BLACK_VALUE;
        if (whiteImageSelect.options.length === 1) whiteImageSelect.value = DEFAULT_WHITE_VALUE;

        console.log('Image selectors populated with names.');
    } catch (error) { console.error("Error in populateImageSelectors:", error); }
} // <<< populateImageSelectors 関数の閉じ括弧

// --- UI 表示切り替え関数 ---
function showAuthScreen() { if(authContainer) authContainer.style.display = 'flex'; if(gameSetupElement) gameSetupElement.style.display = 'none'; if(gameContainerElement) gameContainerElement.style.display = 'none'; if(logoutButton) logoutButton.style.display = 'none'; }
function showSetupScreen() { if(authContainer) authContainer.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'flex'; if(gameContainerElement) gameContainerElement.style.display = 'none'; if(logoutButton) logoutButton.style.display = 'inline-block'; populateImageSelectors(); }
function showGameScreen() { if(authContainer) authContainer.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'none'; if(gameContainerElement) gameContainerElement.style.display = 'flex'; }
function setAuthMessage(message, isError = false) { if(authMessage) { authMessage.textContent = message; authMessage.style.color = isError ? 'red' : 'green'; } }

// --- 認証関連の処理 ---
async function handleGuestLogin() { /* ... (変更なし) ... */ }
async function handleSignup() { /* ... (変更なし) ... */ }
async function handleLogin() { /* ... (変更なし) ... */ }
async function handleLogout() { /* ... (変更なし) ... */ }

// --- オンライン対戦関連の関数 ---
async function handleOnlineMatchmaking() { /* ... (変更なし) ... */ }
function enterOnlineGame(gameId) { /* ... (変更なし) ... */ }
function handleRealtimeUpdate(payload) { /* ... (変更なし) ... */ }
async function fetchAndRenderGameState() { /* ... (変更なし) ... */ }

// --- ゲームロジック等の関数定義 ---
function renderBoard() { /* ... (変更なし) ... */ }
function startGame() { /* ... (変更なし) ... */ }
function initializeGame() { /* ... (変更なし) ... */ }
function handleBoardClick(event) { if (currentGameId) { handleOnlineMove(event); } else { handleOfflineMove(event); } }
function handleOfflineMove(event) { /* ... (変更なし) ... */ }
async function handleOnlineMove(event) { /* ... (変更なし) ... */ }
function makeMove(row, col, player) { makeMoveOnBoard(board, row, col, player); }
function getValidMoves(player) { return getValidMovesForBoard(board, player); }
function countFlips(row, col, player) { /* ... (変更なし) ... */ }
function cloneBoard(boardToClone) { /* ... (変更なし) ... */ }
function makeMoveOnBoard(boardInstance, row, col, player) { /* ... (変更なし) ... */ }
function evaluateBoard(currentBoard, player) { /* ... (変更なし) ... */ }
function getValidMovesForBoard(boardState, player) { /* ... (変更なし) ... */ }
function isValidMoveOnBoard(boardState, row, col, player) { /* ... (変更なし) ... */ }
function checkAndTriggerAI() { /* ... (変更なし) ... */ }
function getAIRandomMove(validMoves) { /* ... (変更なし) ... */ }
function getAIGreedyMove(validMoves, player) { /* ... (変更なし) ... */ }
function getAIEvaluationMove(validMoves, player) { /* ... (変更なし) ... */ }
function minimaxAlphaBeta(boardState, depth, isMaximizingPlayer, aiPlayer, alpha, beta) { /* ... (変更なし) ... */ }
function getAIMinimaxMoveAlphaBeta(validMoves, player, depth) { /* ... (変更なし) ... */ }
function makeAIMove() { /* ... (変更なし) ... */ }
function switchPlayer() { /* ... (変更なし) ... */ }
function endGame() { /* ... (変更なし) ... */ }
function calculateScore() { /* ... (変更なし) ... */ }


// --- ★★★ 初期化処理 & イベントリスナー設定 (DOMContentLoaded内) ★★★ ---
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');

    // ★ Step 1: HTML要素への参照をここで取得・代入
    console.log("Getting HTML elements...");
    authContainer = document.getElementById('auth-container');
    emailInput = document.getElementById('email-input');
    passwordInput = document.getElementById('password-input');
    loginButton = document.getElementById('login-button');
    signupButton = document.getElementById('signup-button');
    guestButton = document.getElementById('guest-button');
    authMessage = document.getElementById('auth-message');
    gameSetupElement = document.getElementById('game-setup');
    aiSettingsElement = document.getElementById('ai-settings');
    aiLevelSelect = document.getElementById('aiLevel');
    playerColorRadios = document.querySelectorAll('input[name="playerColor"]'); // NodeList
    imageSettingsElement = document.getElementById('image-settings');
    blackImageSelect = document.getElementById('blackImageSelect');
    whiteImageSelect = document.getElementById('whiteImageSelect');
    startButton = document.getElementById('start-button');
    logoutButton = document.getElementById('logout-button');
    onlineMatchButton = document.getElementById('online-match-button');
    gameContainerElement = document.querySelector('.game-container');
    boardElement = document.getElementById('game-board');
    currentPlayerElement = document.getElementById('current-player');
    gameStatusElement = document.getElementById('game-status');
    scoreElement = document.getElementById('score');
    gameResultElement = document.getElementById('game-result');
    resultMessageElement = document.getElementById('result-message');
    resetButton = document.getElementById('reset-button');
    console.log("HTML elements obtained.");

    // ★ Step 2: イベントリスナー設定 (取得した要素に対して)
    console.log("Setting up event listeners inside DOMContentLoaded...");
    try {
        // 要素が取得できているか確認してからリスナーを設定
        if (gameModeRadios) { gameModeRadios.forEach(radio => { radio.addEventListener('change', () => { if(aiSettingsElement) aiSettingsElement.style.display = (radio.value === 'hva') ? 'block' : 'none'; populateImageSelectors(); }); }); } else { console.error("gameModeRadios not found!"); }
        if (startButton) { startButton.addEventListener('click', startGame); } else { console.error("Start button not found!"); }
        if (resetButton) { resetButton.addEventListener('click', () => { if(gameContainerElement) gameContainerElement.style.display = 'none'; if(gameResultElement) gameResultElement.style.display = 'none'; if(resetButton) resetButton.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'flex'; if(realtimeChannel){ try { supabaseClient.removeChannel(realtimeChannel); } catch(e){} realtimeChannel = null; } currentGameId = null; }); } else { console.error("Reset button not found!"); }
        if (boardElement) { boardElement.addEventListener('click', handleBoardClick); } else { console.error("Board element not found!"); }
        if (guestButton) { guestButton.addEventListener('click', handleGuestLogin); } else { console.error("Guest button not found!"); }
        if (loginButton) { loginButton.addEventListener('click', handleLogin); } else { console.error("Login button not found!"); }
        if (signupButton) { signupButton.addEventListener('click', handleSignup); } else { console.error("Signup button not found!"); }
        if (logoutButton) { logoutButton.addEventListener('click', handleLogout); } else { console.error("Logout button not found!"); }
        if (onlineMatchButton) { onlineMatchButton.addEventListener('click', handleOnlineMatchmaking); } else { console.error("Online Match button not found!"); }
        console.log("Event listeners setup complete.");
    } catch (error) {
        console.error("Error setting up event listeners:", error);
    }

    // ★ Step 3: 画像選択肢を生成 & 初期表示
    if(aiSettingsElement) aiSettingsElement.style.display = 'block'; // デフォルトはAI設定表示
    populateImageSelectors(); // 画像選択肢生成を呼び出し

    // ★ Step 4: 既存セッション確認 & 初期画面表示
    if (!supabaseClient) { console.warn("Supabase client not ready, showing auth screen."); showAuthScreen(); return; }
    console.log("Checking existing session...");
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        if (session) { console.log("User already logged in:", session.user); currentUser = session.user; showSetupScreen(); }
        else { console.log("User not logged in."); showAuthScreen(); }
    } catch(error) { console.error("Error getting session:", error); showAuthScreen(); }

    // ★ Step 5: 認証状態の変化を監視
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        const prevUser = currentUser?.id;
        currentUser = session?.user ?? null;
        if (!currentUser && prevUser) { showAuthScreen(); if(realtimeChannel){ try{ supabaseClient.removeChannel(realtimeChannel); } catch(e){} realtimeChannel = null; } currentGameId = null; }
        else if (currentUser && (!prevUser || authContainer?.style.display !== 'none')) { showSetupScreen(); }
    });

}); // <<< DOMContentLoaded Listener End