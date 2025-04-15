// --- 定数 ---
const EMPTY = 0; const BLACK = 1; const WHITE = 2; const BOARD_SIZE = 8; const NON_BREAKING_SPACE = '\u00A0';
const POSITIONAL_WEIGHTS = [ [120, -20, 20, 5, 5, 20, -20, 120], [-20, -40, -5, -5, -5, -5, -40, -20], [20, -5, 15, 3, 3, 15, -5, 20], [5, -5, 3, 3, 3, 3, -5, 5], [5, -5, 3, 3, 3, 3, -5, 5], [20, -5, 15, 3, 3, 15, -5, 20], [-20, -40, -5, -5, -5, -5, -40, -20], [120, -20, 20, 5, 5, 20, -20, 120] ];
const MOBILITY_WEIGHT = 5; const AI_MOVE_DELAY = 500; const NUM_IMAGES = 29; const DEFAULT_BLACK_VALUE = 'default_black'; const DEFAULT_WHITE_VALUE = 'default_white';
const IMAGE_NAMES = {'001': 'じゃが','002': 'さくら','003': 'プリン','004': 'かぷちーも','005': 'とっとこハム娘。','006': 'くべし','007': 'リョータ','008': 'ハムまろ','009': 'リーゼント丸','010': 'もみじ','011': 'アクア','012': 'うずら','013': 'すいめい','014': 'ハムりん','015': 'ラッキー','016': 'なないろ','017': 'くり坊','018': 'みたらし','019': 'タンゴ','020': 'ついてる','021': 'バク','022': 'このは','023': 'たいあん','024': 'ハムレット','025': 'クリオネア','026': 'むらむすめ','027': 'あんみつ姫','028': 'べにたん','029': 'もな'};

// --- Supabase クライアント初期化 ---
const SUPABASE_URL = 'https://xreugxrfaegoyhewfyid.supabase.co'; // ★★★ あなたのURLに書き換える ★★★
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZXVneHJmYWVnb3loZXdmeWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTg4ODUsImV4cCI6MjA2MDI3NDg4NX0.QkORDNLczY1cDn7bTRnO6zAbWGYscttj62z7Fx0xkwI'; // ★★★ あなたのanonキーに書き換える ★★★
let supabaseClient = null;
try { if (window.supabase) { const { createClient } = window.supabase; supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); console.log('Supabase client initialized:', supabaseClient ? 'OK' : 'Failed'); if (!supabaseClient) throw new Error("Initialization failed"); } else { throw new Error('Supabase library not loaded!'); } } catch (error) { console.error('Error initializing Supabase client:', error); /* alert('Supabase接続エラー'); */ } // alertは一旦コメントアウト

// --- HTML要素取得 (トップレベルでの宣言) ---
// (宣言部分は変更なし、ただし null チェックはリスナー設定時に行う)
const authContainer = document.getElementById('auth-container'); const emailInput = document.getElementById('email-input'); const passwordInput = document.getElementById('password-input'); const loginButton = document.getElementById('login-button'); const signupButton = document.getElementById('signup-button'); const guestButton = document.getElementById('guest-button'); const authMessage = document.getElementById('auth-message'); const gameSetupElement = document.getElementById('game-setup'); const aiSettingsElement = document.getElementById('ai-settings'); const aiLevelSelect = document.getElementById('aiLevel'); const playerColorRadios = document.querySelectorAll('input[name="playerColor"]'); const imageSettingsElement = document.getElementById('image-settings'); const blackImageSelect = document.getElementById('blackImageSelect'); const whiteImageSelect = document.getElementById('whiteImageSelect'); const startButton = document.getElementById('start-button'); const logoutButton = document.getElementById('logout-button'); const onlineMatchButton = document.getElementById('online-match-button'); const gameContainerElement = document.querySelector('.game-container'); const boardElement = document.getElementById('game-board'); const currentPlayerElement = document.getElementById('current-player'); const gameStatusElement = document.getElementById('game-status'); const scoreElement = document.getElementById('score'); const gameResultElement = document.getElementById('game-result'); const resultMessageElement = document.getElementById('result-message'); const resetButton = document.getElementById('reset-button');

// --- グローバル変数 ---
let board = []; let currentPlayer = BLACK; let gameOver = false; let playerBlackType = 'human'; let playerWhiteType = 'ai_level2'; let lastMoveRow = -1; let lastMoveCol = -1; let playerBlackImage = ''; let playerWhiteImage = ''; let currentUser = null; let currentGameId = null; let realtimeChannel = null;

// --- Helper Function ---
function formatImageNumber(num) { return String(num).padStart(3, '0'); }
function populateImageSelectors() { /* ... (内容は変更なし) ... */ }

// --- UI 表示切り替え関数 ---
function showAuthScreen() { if(authContainer) authContainer.style.display = 'flex'; if(gameSetupElement) gameSetupElement.style.display = 'none'; if(gameContainerElement) gameContainerElement.style.display = 'none'; if(logoutButton) logoutButton.style.display = 'none'; }
function showSetupScreen() { if(authContainer) authContainer.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'flex'; if(gameContainerElement) gameContainerElement.style.display = 'none'; if(logoutButton) logoutButton.style.display = 'inline-block'; populateImageSelectors(); }
function showGameScreen() { if(authContainer) authContainer.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'none'; if(gameContainerElement) gameContainerElement.style.display = 'flex'; }
function setAuthMessage(message, isError = false) { if(authMessage) { authMessage.textContent = message; authMessage.style.color = isError ? 'red' : 'green'; } }

// --- 認証関連の処理 ---
async function handleGuestLogin() { /* ... (内容は変更なし) ... */ }
async function handleSignup() { /* ... (内容は変更なし) ... */ }
async function handleLogin() { /* ... (内容は変更なし) ... */ }
async function handleLogout() { /* ... (内容は変更なし) ... */ }

// --- オンライン対戦関連の関数 ---
async function handleOnlineMatchmaking() { /* ... (内容は変更なし) ... */ }
function enterOnlineGame(gameId) { /* ... (内容は変更なし) ... */ }
function handleRealtimeUpdate(payload) { /* ... (内容は変更なし) ... */ }
async function fetchAndRenderGameState() { /* ... (内容は変更なし) ... */ }

// --- ゲームロジック等の関数定義 ---
function renderBoard() { /* ... (内容は変更なし) ... */ }
function startGame() { /* ... (内容は変更なし) ... */ }
function initializeGame() { /* ... (内容は変更なし) ... */ }
function handleBoardClick(event) { /* ... (内容は変更なし) ... */ }
function updateUI() { /* ... (内容は変更なし) ... */ }
function setStatusMessage(message) { /* ... (内容は変更なし) ... */ }
function isValidMove(row, col, player) { return isValidMoveOnBoard(board, row, col, player); }
function makeMove(row, col, player) { makeMoveOnBoard(board, row, col, player); }
function getValidMoves(player) { return getValidMovesForBoard(board, player); }
function countFlips(row, col, player) { /* ... (内容は変更なし) ... */ }
function cloneBoard(boardToClone) { /* ... (変更なし) ... */ }
function makeMoveOnBoard(boardInstance, row, col, player) { /* ... (変更なし) ... */ }
function evaluateBoard(currentBoard, player) { /* ... (内容は変更なし) ... */ }
function getValidMovesForBoard(boardState, player) { /* ... (変更なし) ... */ }
function isValidMoveOnBoard(boardState, row, col, player) { /* ... (変更なし) ... */ }
function checkAndTriggerAI() { /* ... (変更なし) ... */ }
function getAIRandomMove(validMoves) { /* ... (変更なし) ... */ }
function getAIGreedyMove(validMoves, player) { /* ... (変更なし) ... */ }
function getAIEvaluationMove(validMoves, player) { /* ... (変更なし) ... */ }
function minimaxAlphaBeta(boardState, depth, isMaximizingPlayer, aiPlayer, alpha, beta) { /* ... (内容は変更なし) ... */ }
function getAIMinimaxMoveAlphaBeta(validMoves, player, depth) { /* ... (内容は変更なし) ... */ }
function makeAIMove() { /* ... (内容は変更なし) ... */ }
function switchPlayer() { /* ... (内容は変更なし) ... */ }
function endGame() { /* ... (内容は変更なし) ... */ }
function calculateScore() { /* ... (内容は変更なし) ... */ }


// --- 初期化処理 & イベントリスナー設定 (DOMContentLoaded内) ---
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');

    // ★ イベントリスナー設定は DOMContentLoaded 内で行う ★
    console.log("Setting up event listeners inside DOMContentLoaded...");
    // 要素をここで再取得するか、トップレベルの宣言を使うか（トップレベルでOKのはず）
    // nullチェックはここで行うのがより安全
    const gameModeRadiosLocal = document.querySelectorAll('input[name="gameMode"]'); // ローカルスコープで使う場合は再取得

    if (gameModeRadiosLocal) {
        gameModeRadiosLocal.forEach(radio => { radio.addEventListener('change', () => { if(aiSettingsElement) aiSettingsElement.style.display = (radio.value === 'hva') ? 'block' : 'none'; populateImageSelectors(); }); });
    } else { console.error("gameModeRadios not found!"); }

    if (startButton) { startButton.addEventListener('click', startGame); } else { console.error("Start button not found!"); }
    if (resetButton) { resetButton.addEventListener('click', () => { if(gameContainerElement) gameContainerElement.style.display = 'none'; if(gameResultElement) gameResultElement.style.display = 'none'; if(resetButton) resetButton.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'flex'; if(realtimeChannel){ supabaseClient.removeChannel(realtimeChannel); realtimeChannel = null; } currentGameId = null; }); } else { console.error("Reset button not found!"); }
    if (boardElement) { boardElement.addEventListener('click', handleBoardClick); } else { console.error("Board element not found!"); }
    if (guestButton) { guestButton.addEventListener('click', handleGuestLogin); } else { console.error("Guest button not found!"); }
    if (loginButton) { loginButton.addEventListener('click', handleLogin); } else { console.error("Login button not found!"); }
    if (signupButton) { signupButton.addEventListener('click', handleSignup); } else { console.error("Signup button not found!"); }
    if (logoutButton) { logoutButton.addEventListener('click', handleLogout); } else { console.error("Logout button not found!"); }
    if (onlineMatchButton) { onlineMatchButton.addEventListener('click', handleOnlineMatchmaking); } else { console.error("Online Match button not found!"); }

    console.log("Event listeners setup complete.");
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    // 画像選択肢を生成（要素が存在するはずのこのタイミングで呼ぶ）
    populateImageSelectors();
    if(aiSettingsElement) aiSettingsElement.style.display = 'block';

    // 既存セッション確認
    if (!supabaseClient) { showAuthScreen(); console.warn("Supabase client not ready, showing auth screen."); return; } // Supabase準備できてなければ認証画面
    console.log("Checking existing session...");
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        if (session) { console.log("User already logged in:", session.user); currentUser = session.user; showSetupScreen(); }
        else { console.log("User not logged in."); showAuthScreen(); }
    } catch(error) { console.error("Error getting session:", error); showAuthScreen(); }

    // 認証状態の変化を監視
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        const prevUser = currentUser?.id; // 以前のユーザーIDを保持
        currentUser = session?.user ?? null;
        // 状態が変わった時にUIを更新
        if (!currentUser && prevUser) { // ログアウトした場合など
             showAuthScreen();
             if(realtimeChannel){ supabaseClient.removeChannel(realtimeChannel); realtimeChannel = null; }
             currentGameId = null;
        } else if (currentUser && (!prevUser || authContainer?.style.display !== 'none')) { // ログインした場合など
             showSetupScreen();
        }
    });

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ ここが DOMContentLoaded リスナーの終わり ★
});
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ ファイルの末尾に、以前のような関数の空定義がないことを確認 ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★