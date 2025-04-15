// --- 定数 ---
const EMPTY = 0; const BLACK = 1; const WHITE = 2; const BOARD_SIZE = 8; const NON_BREAKING_SPACE = '\u00A0';
const POSITIONAL_WEIGHTS = [ [120, -20, 20, 5, 5, 20, -20, 120], [-20, -40, -5, -5, -5, -5, -40, -20], [20, -5, 15, 3, 3, 15, -5, 20], [5, -5, 3, 3, 3, 3, -5, 5], [5, -5, 3, 3, 3, 3, -5, 5], [20, -5, 15, 3, 3, 15, -5, 20], [-20, -40, -5, -5, -5, -5, -40, -20], [120, -20, 20, 5, 5, 20, -20, 120] ];
const MOBILITY_WEIGHT = 5; const AI_MOVE_DELAY = 500; const NUM_IMAGES = 29; const DEFAULT_BLACK_VALUE = 'default_black'; const DEFAULT_WHITE_VALUE = 'default_white';
const IMAGE_NAMES = {'001': 'じゃが','002': 'さくら','003': 'プリン','004': 'かぷちーも','005': 'とっとこハム娘。','006': 'くべし','007': 'リョータ','008': 'ハムまろ','009': 'リーゼント丸','010': 'もみじ','011': 'アクア','012': 'うずら','013': 'すいめい','014': 'ハムりん','015': 'ラッキー','016': 'なないろ','017': 'くり坊','018': 'みたらし','019': 'タンゴ','020': 'ついてる','021': 'バク','022': 'このは','023': 'たいあん','024': 'ハムレット','025': 'クリオネア','026': 'むらむすめ','027': 'あんみつ姫','028': 'べにたん','029': 'もな'};

// --- Supabase クライアント初期化 ---
const SUPABASE_URL = 'https://xreugxrfaegoyhewfyid.supabase.co'; // ★★★ あなたのURLに書き換える ★★★
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZXVneHJmYWVnb3loZXdmeWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTg4ODUsImV4cCI6MjA2MDI3NDg4NX0.QkORDNLczY1cDn7bTRnO6zAbWGYscttj62z7Fx0xkwI'; // ★★★ あなたのanonキーに書き換える ★★★
let supabaseClient = null;
try { if (window.supabase) { const { createClient } = window.supabase; supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); console.log('Supabase client initialized:', supabaseClient ? 'OK' : 'Failed'); if (!supabaseClient) throw new Error("Initialization failed"); } else { throw new Error('Supabase library not loaded!'); } } catch (error) { console.error('Error initializing Supabase client:', error); alert('Supabase接続エラー'); }

// --- HTML要素取得 (トップレベルで宣言はOK) ---
const authContainer = document.getElementById('auth-container');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const guestButton = document.getElementById('guest-button');
const authMessage = document.getElementById('auth-message');
const gameSetupElement = document.getElementById('game-setup');
const aiSettingsElement = document.getElementById('ai-settings');
const aiLevelSelect = document.getElementById('aiLevel');
const playerColorRadios = document.querySelectorAll('input[name="playerColor"]'); // NodeList
const imageSettingsElement = document.getElementById('image-settings');
const blackImageSelect = document.getElementById('blackImageSelect');
const whiteImageSelect = document.getElementById('whiteImageSelect');
const startButton = document.getElementById('start-button');
const logoutButton = document.getElementById('logout-button');
const gameContainerElement = document.querySelector('.game-container');
const boardElement = document.getElementById('game-board');
const currentPlayerElement = document.getElementById('current-player');
const gameStatusElement = document.getElementById('game-status');
const scoreElement = document.getElementById('score');
const gameResultElement = document.getElementById('game-result');
const resultMessageElement = document.getElementById('result-message');
const resetButton = document.getElementById('reset-button');

// --- グローバル変数 ---
let board = []; let currentPlayer = BLACK; let gameOver = false;
let playerBlackType = 'human'; let playerWhiteType = 'ai_level2';
let lastMoveRow = -1; let lastMoveCol = -1;
let playerBlackImage = ''; let playerWhiteImage = '';
let currentUser = null;

// --- Helper Function ---
function formatImageNumber(num) { return String(num).padStart(3, '0'); }
function populateImageSelectors() { /* ... (内容は変更なし) ... */ } // (実装は省略)

// --- UI 表示切り替え関数 ---
function showAuthScreen() { if(authContainer) authContainer.style.display = 'flex'; if(gameSetupElement) gameSetupElement.style.display = 'none'; if(gameContainerElement) gameContainerElement.style.display = 'none'; if(logoutButton) logoutButton.style.display = 'none'; }
// script.js の showSetupScreen 関数を修正

/** 設定画面を表示 */
function showSetupScreen() {
    if(authContainer) authContainer.style.display = 'none';
    if(gameSetupElement) gameSetupElement.style.display = 'flex'; // 設定画面を表示
    if(gameContainerElement) gameContainerElement.style.display = 'none';
    if(logoutButton) logoutButton.style.display = 'inline-block';

    // ★★★ 設定画面表示時に画像選択肢を再生成 ★★★
    populateImageSelectors();
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★
}
function showGameScreen() { if(authContainer) authContainer.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'none'; if(gameContainerElement) gameContainerElement.style.display = 'flex'; }
function setAuthMessage(message, isError = false) { if(authMessage) { authMessage.textContent = message; authMessage.style.color = isError ? 'red' : 'green'; } }

// --- 認証関連の処理 ---
async function handleGuestLogin() { if (!supabaseClient) return setAuthMessage('Supabase接続エラー', true); setAuthMessage('ゲストログイン中...'); try { const { data, error } = await supabaseClient.auth.signInAnonymously(); if (error) throw error; console.log('Guest login successful:', data.user); currentUser = data.user; setAuthMessage(''); showSetupScreen(); } catch (error) { console.error('Guest login error:', error); setAuthMessage(`ゲストログイン失敗: ${error.message || error}`, true); } }
async function handleSignup() { if (!supabaseClient) return setAuthMessage('Supabase接続エラー', true); const email = emailInput.value; const password = passwordInput.value; if (!email || !password) return setAuthMessage('メールアドレスとパスワードを入力してください。', true); setAuthMessage('新規登録中...'); try { const { data, error } = await supabaseClient.auth.signUp({ email, password }); if (error) throw error; console.log('Signup successful, user:', data.user); if (data.user && data.user.identities && data.user.identities.length === 0) { setAuthMessage('確認メールを送信しました。メールを確認してください。', false); } else if (data.user) { setAuthMessage('登録成功！再度ログインしてください。', false); } else { setAuthMessage('登録に成功しましたが、ユーザー情報が取得できませんでした。', true); } } catch (error) { console.error('Signup error:', error); setAuthMessage(`登録失敗: ${error.message || error}`, true); } }
async function handleLogin() { if (!supabaseClient) return setAuthMessage('Supabase接続エラー', true); const email = emailInput.value; const password = passwordInput.value; if (!email || !password) return setAuthMessage('メールアドレスとパスワードを入力してください。', true); setAuthMessage('ログイン中...'); try { const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) throw error; console.log('Login successful:', data.user); currentUser = data.user; setAuthMessage(''); showSetupScreen(); } catch (error) { console.error('Login error:', error); setAuthMessage(`ログイン失敗: ${error.message || error}`, true); } }
async function handleLogout() { if (!supabaseClient) return alert('Supabase接続エラー'); try { const { error } = await supabaseClient.auth.signOut(); if (error) throw error; console.log('Logout successful'); currentUser = null; showAuthScreen(); } catch (error) { console.error('Logout error:', error); alert(`ログアウト失敗: ${error.message || error}`); } }

// --- ゲームロジック等の関数定義 ---
// (renderBoard, startGame, initializeGame, handleBoardClick, updateUI, setStatusMessage, isValidMove, etc... すべてのゲーム関連関数はここに記述。内容は変更なし)
/** 盤面を描画 */
function renderBoard() { /* ... */ }
/** ゲーム開始処理 */
function startGame() { /* ... */ }
/** ゲーム初期化 */
function initializeGame() { /* ... */ }
/** ゲーム盤面のクリック処理 */
function handleBoardClick(event) { /* ... */ }
/** UI更新 */
function updateUI() { /* ... */ }
/** 有効手判定 (現在の盤面) */
function isValidMove(row, col, player) { return isValidMoveOnBoard(board, row, col, player); }
/** 石を置き、ひっくり返す (現在の盤面) */
function makeMove(row, col, player) { makeMoveOnBoard(board, row, col, player); }
/** 有効手のリストを取得 (現在の盤面) */
function getValidMoves(player) { return getValidMovesForBoard(board, player); }
/** ひっくり返せる石の数を数える (現在の盤面) */
function countFlips(row, col, player) { /* ... */ }
/** 盤面のディープコピーを作成 */
function cloneBoard(boardToClone) { /* ... */ }
/** 指定された盤面上で手を打ち、石を反転させる */
function makeMoveOnBoard(boardInstance, row, col, player) { /* ... */ }
/** 盤面を評価 (位置 + Mobility) */
function evaluateBoard(currentBoard, player) { /* ... */ }
/** 指定された盤面状態で有効手を取得 */
function getValidMovesForBoard(boardState, player) { /* ... */ }
/** 指定された盤面状態で有効手か判定 */
function isValidMoveOnBoard(boardState, row, col, player) { /* ... */ }
/** 現在のプレイヤーがAIならAIのターンを実行 */
function checkAndTriggerAI() { /* ... */ }
/** AIレベル1: ランダム */
function getAIRandomMove(validMoves) { /* ... */ }
/** AIレベル2: 貪欲法 */
function getAIGreedyMove(validMoves, player) { /* ... */ }
/** AIレベル3: 評価関数ベース */
function getAIEvaluationMove(validMoves, player) { /* ... */ }
/** Minimax + AlphaBeta 再帰関数 */
function minimaxAlphaBeta(boardState, depth, isMaximizingPlayer, aiPlayer, alpha, beta) { /* ... */ }
/** AIレベル4+: AlphaBeta探索 */
function getAIMinimaxMoveAlphaBeta(validMoves, player, depth) { /* ... */ }
/** AIの手番処理 */
function makeAIMove() { /* ... */ }
/** プレイヤー交代・パス・終了チェック */
function switchPlayer() { /* ... */ }
/** ゲーム終了処理 */
function endGame() { /* ... */ }
/** スコア計算 */
function calculateScore() { /* ... */ }


// --- 初期化処理 & イベントリスナー設定 (DOMContentLoaded内) ---
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★ イベントリスナー設定を DOMContentLoaded 内に移動 ★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    console.log("Setting up event listeners inside DOMContentLoaded...");
    const gameModeRadiosLocal = document.querySelectorAll('input[name="gameMode"]'); // ローカル変数で取得
    const startButtonLocal = document.getElementById('start-button');
    const resetButtonLocal = document.getElementById('reset-button');
    const boardElementLocal = document.getElementById('game-board');
    const guestButtonLocal = document.getElementById('guest-button');
    const loginButtonLocal = document.getElementById('login-button');
    const signupButtonLocal = document.getElementById('signup-button');
    const logoutButtonLocal = document.getElementById('logout-button');

    // 要素取得チェック
    if (!gameModeRadiosLocal || !startButtonLocal || !resetButtonLocal || !boardElementLocal || !guestButtonLocal || !loginButtonLocal || !signupButtonLocal || !logoutButtonLocal) {
         console.error("One or more elements required for event listeners not found!");
         // return; // ここで処理を中断するべきかもしれない
    }

    gameModeRadiosLocal.forEach(radio => { radio.addEventListener('change', () => { if(aiSettingsElement) aiSettingsElement.style.display = (radio.value === 'hva') ? 'block' : 'none'; populateImageSelectors(); }); });
    if (startButtonLocal) startButtonLocal.addEventListener('click', startGame);
    if (resetButtonLocal) resetButtonLocal.addEventListener('click', () => { if(gameContainerElement) gameContainerElement.style.display = 'none'; if(gameResultElement) gameResultElement.style.display = 'none'; if(resetButtonLocal) resetButtonLocal.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'flex'; });
    if (boardElementLocal) boardElementLocal.addEventListener('click', handleBoardClick);
    if (guestButtonLocal) guestButtonLocal.addEventListener('click', handleGuestLogin);
    if (loginButtonLocal) loginButtonLocal.addEventListener('click', handleLogin);
    if (signupButtonLocal) signupButtonLocal.addEventListener('click', handleSignup);
    if (logoutButtonLocal) logoutButtonLocal.addEventListener('click', handleLogout);

    console.log("Event listeners setup complete.");
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    // 画像選択肢を生成
    populateImageSelectors();
    if(aiSettingsElement) aiSettingsElement.style.display = 'block'; // 初期表示

    // 既存セッション確認
    if (!supabaseClient) { showAuthScreen(); return; } // Supabase未接続なら認証画面
    console.log("Checking existing session...");
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        if (session) {
            console.log("User already logged in:", session.user);
            currentUser = session.user; showSetupScreen();
        } else {
            console.log("User not logged in."); showAuthScreen();
        }
    } catch(error) { console.error("Error getting session:", error); showAuthScreen(); }

    // 認証状態の変化を監視
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        currentUser = session?.user ?? null;
        // SIGNED_IN イベントは getSession でもハンドルされるので、ここでは主にUIを更新する
        if (!currentUser) { // ログアウトした場合など
             showAuthScreen();
        } else if (authContainer && authContainer.style.display !== 'none') { // ログイン成功直後など
             showSetupScreen();
        }
        // TODO: 必要に応じて、ユーザー情報を画面に表示するなどの処理を追加
    });
});