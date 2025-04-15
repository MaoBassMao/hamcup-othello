// --- 定数 ---
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const BOARD_SIZE = 8;
const NON_BREAKING_SPACE = '\u00A0'; // 非改行スペース
const POSITIONAL_WEIGHTS = [
    [120, -20,  20,   5,   5,  20, -20, 120], [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
    [ 20,  -5,  15,   3,   3,  15,  -5,  20], [  5,  -5,   3,   3,   3,   3,  -5,   5],
    [  5,  -5,   3,   3,   3,   3,  -5,   5], [ 20,  -5,  15,   3,   3,  15,  -5,  20],
    [-20, -40,  -5,  -5,  -5,  -5, -40, -20], [120, -20,  20,   5,   5,  20, -20, 120]
];
const MOBILITY_WEIGHT = 5;
const AI_MOVE_DELAY = 750;
const NUM_IMAGES = 29;
const DEFAULT_BLACK_VALUE = 'default_black';
const DEFAULT_WHITE_VALUE = 'default_white';

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ ユーザー提供の画像名リストを反映 ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const IMAGE_NAMES = {
    '001': 'じゃが',
    '002': 'さくら',
    '003': 'プリン',
    '004': 'かぷちーも',
    '005': 'とっとこハム娘。',
    '006': 'くべし',
    '007': 'リョータ',
    '008': 'ハムまろ',
    '009': 'リーゼント丸',
    '010': 'もみじ',
    '011': 'アクア',
    '012': 'うずら',
    '013': 'すいめい',
    '014': 'ハムりん',
    '015': 'ラッキー',
    '016': 'なないろ',
    '017': 'くり坊',
    '018': 'みたらし',
    '019': 'タンゴ',
    '020': 'ついてる',
    '021': 'バク',
    '022': 'このは',
    '023': 'たいあん',
    '024': 'ハムレット',
    '025': 'クリオネア',
    '026': 'むらむすめ',
    '027': 'あんみつ姫',
    '028': 'べにたん',
    '029': 'もな'
};
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// --- HTML要素取得 ---
const gameSetupElement = document.getElementById('game-setup');
const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
const aiSettingsElement = document.getElementById('ai-settings');
const aiLevelSelect = document.getElementById('aiLevel');
const playerColorRadios = document.querySelectorAll('input[name="playerColor"]');
const imageSettingsElement = document.getElementById('image-settings');
const blackImageSelect = document.getElementById('blackImageSelect');
const whiteImageSelect = document.getElementById('whiteImageSelect');
const startButton = document.getElementById('start-button');
const gameContainerElement = document.querySelector('.game-container');
const boardElement = document.getElementById('game-board');
const currentPlayerElement = document.getElementById('current-player');
const gameStatusElement = document.getElementById('game-status');
const scoreElement = document.getElementById('score');
const gameResultElement = document.getElementById('game-result');
const resultMessageElement = document.getElementById('result-message');
const resetButton = document.getElementById('reset-button');

// --- グローバル変数 ---
let board = [];
let currentPlayer = BLACK;
let gameOver = false;
let playerBlackType = 'human';
let playerWhiteType = 'ai_level2';
let lastMoveRow = -1;
let lastMoveCol = -1;
let playerBlackImage = ''; // Initialize as empty, set in startGame
let playerWhiteImage = '';

// --- Helper Function ---
/** 数値を3桁ゼロ埋め文字列にする */
function formatImageNumber(num) { return String(num).padStart(3, '0'); }

/** 画像選択のドロップダウンを生成 (名前表示・「画像」削除) */
function populateImageSelectors() {
    console.log('Populating image selectors...');
    try {
        const selectedModeElement = document.querySelector('input[name="gameMode"]:checked');
        if (!selectedModeElement) { // 初期読み込み時などでまだ選択がない場合
            console.warn("No game mode selected yet for populating images.");
             // デフォルト(HvA)の想定で仮生成しておくか、何もしない
             // ここでは何もしないでおく (DOMContentLoadedで呼ばれるため問題ないはず)
             return;
        }
        const selectedMode = selectedModeElement.value;
        const currentBlackVal = blackImageSelect.value; const currentWhiteVal = whiteImageSelect.value;
        blackImageSelect.innerHTML = ''; whiteImageSelect.innerHTML = '';

        const defaultBlackOpt = document.createElement('option'); defaultBlackOpt.value = DEFAULT_BLACK_VALUE; defaultBlackOpt.textContent = 'デフォルト (黒)'; blackImageSelect.appendChild(defaultBlackOpt);
        const defaultWhiteOpt = document.createElement('option'); defaultWhiteOpt.value = DEFAULT_WHITE_VALUE; defaultWhiteOpt.textContent = 'デフォルト (白)'; whiteImageSelect.appendChild(defaultWhiteOpt);

        const generateOption = (index) => {
            const numStr = formatImageNumber(index);
            const displayName = IMAGE_NAMES[numStr] || `不明 (${numStr})`; // 名前がなければ番号
            const option = document.createElement('option');
            option.value = numStr;
            option.textContent = `${numStr}: ${displayName}`;
            return option;
        };

        if (selectedMode === 'hvh') {
            for (let i = 1; i <= NUM_IMAGES; i++) {
                if (i % 2 !== 0) { blackImageSelect.appendChild(generateOption(i)); }
                if (i % 2 === 0) { whiteImageSelect.appendChild(generateOption(i)); }
            }
        } else {
            for (let i = 1; i <= NUM_IMAGES; i++) {
                blackImageSelect.appendChild(generateOption(i).cloneNode(true));
                whiteImageSelect.appendChild(generateOption(i).cloneNode(true));
            }
        }
        // 選択値の復元/デフォルト設定
        blackImageSelect.value = (blackImageSelect.querySelector(`option[value="${currentBlackVal}"]`)) ? currentBlackVal : DEFAULT_BLACK_VALUE;
        whiteImageSelect.value = (whiteImageSelect.querySelector(`option[value="${currentWhiteVal}"]`)) ? currentWhiteVal : DEFAULT_WHITE_VALUE;
        if (blackImageSelect.options.length === 1) blackImageSelect.value = DEFAULT_BLACK_VALUE;
        if (whiteImageSelect.options.length === 1) whiteImageSelect.value = DEFAULT_WHITE_VALUE;

        console.log('Image selectors populated with names.');
    } catch (error) { console.error("Error in populateImageSelectors:", error); }
}


// --- イベントリスナー設定 ---
console.log("Setting up event listeners...");
gameModeRadios.forEach(radio => { radio.addEventListener('change', () => { if(aiSettingsElement) aiSettingsElement.style.display = (radio.value === 'hva') ? 'block' : 'none'; populateImageSelectors(); }); });
if (startButton) { startButton.addEventListener('click', startGame); console.log("Start button listener added."); } else { console.error("Start button not found!"); }
if (resetButton) { resetButton.addEventListener('click', () => { if(gameContainerElement) gameContainerElement.style.display = 'none'; if(gameResultElement) gameResultElement.style.display = 'none'; if(resetButton) resetButton.style.display = 'none'; if(gameSetupElement) gameSetupElement.style.display = 'flex'; }); } else { console.error("Reset button not found!"); }
if (boardElement) { boardElement.addEventListener('click', handleBoardClick); } else { console.error("Board element not found!"); }
window.addEventListener('DOMContentLoaded', () => { console.log('DOM fully loaded and parsed'); if(aiSettingsElement) aiSettingsElement.style.display = 'block'; populateImageSelectors(); }); // 初期表示のために呼ぶ
console.log("Event listeners setup complete.");

// --- 関数定義 --- (以下、変更なし)

/** 盤面を描画 */
function renderBoard() { if (!boardElement) { console.error("renderBoard: boardElement is null!"); return; } boardElement.innerHTML = ''; const highlighted = boardElement.querySelector('.last-move'); if (highlighted) highlighted.classList.remove('last-move'); if (!board || board.length !== BOARD_SIZE) { console.error("renderBoard: board data is invalid!"); return; } for (let r = 0; r < BOARD_SIZE; r++) { if (!board[r] || board[r].length !== BOARD_SIZE) { console.error(`renderBoard: board row ${r} is invalid!`); continue; } for (let c = 0; c < BOARD_SIZE; c++) { const cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.row = r; cell.dataset.col = c; const discType = board[r][c]; if (discType !== EMPTY) { const source = (discType === BLACK) ? playerBlackImage : playerWhiteImage; if (source === DEFAULT_BLACK_VALUE || source === DEFAULT_WHITE_VALUE) { const discDiv = document.createElement('div'); discDiv.className = 'disc ' + (discType === BLACK ? 'black' : 'white'); cell.appendChild(discDiv); } else if (typeof source === 'string' && source.includes('.png')) { const discImg = document.createElement('img'); discImg.className = 'disc-image'; discImg.src = source; discImg.alt = (discType === BLACK) ? '黒石' : '白石'; discImg.onerror = () => { console.error(`Failed to load image: ${source}`); cell.textContent = '?'; }; cell.appendChild(discImg); } else { console.error(`Invalid image source value: ${source}`); cell.textContent = '?'; } } if (r === lastMoveRow && c === lastMoveCol) { cell.classList.add('last-move'); } boardElement.appendChild(cell); } } }
/** ゲーム開始処理 */
function startGame() { console.log("Starting game..."); try { const selectedMode = document.querySelector('input[name="gameMode"]:checked').value; let selectedAiLevel = aiLevelSelect.value; const blackSelection = blackImageSelect.value; const whiteSelection = whiteImageSelect.value; if (!blackSelection || !whiteSelection) { console.error("Image selection is missing!", {black: blackSelection, white: whiteSelection}); alert("石の画像が正しく選択されていません。"); return; } playerBlackImage = (blackSelection === DEFAULT_BLACK_VALUE) ? DEFAULT_BLACK_VALUE : `images/${blackSelection}.png`; playerWhiteImage = (whiteSelection === DEFAULT_WHITE_VALUE) ? DEFAULT_WHITE_VALUE : `images/${whiteSelection}.png`; console.log(`Disc Settings - Black: ${playerBlackImage}, White: ${playerWhiteImage}`); if (selectedMode === 'hvh') { playerBlackType = 'human'; playerWhiteType = 'human'; console.log("Mode: Human vs Human"); } else { const selectedColor = document.querySelector('input[name="playerColor"]:checked').value; if (selectedColor === 'black') { playerBlackType = 'human'; playerWhiteType = selectedAiLevel; console.log(`Mode: Human (Black) vs ${selectedAiLevel} (White)`); } else { playerBlackType = selectedAiLevel; playerWhiteType = 'human'; console.log(`Mode: ${selectedAiLevel} (Black) vs Human (White)`); } } gameSetupElement.style.display = 'none'; gameContainerElement.style.display = 'flex'; initializeGame(); } catch(error) { console.error("Error during startGame:", error); } }
/** ゲーム初期化 */
function initializeGame() { console.log("Enter initializeGame"); try { gameOver = false; lastMoveRow = -1; lastMoveCol = -1; board = [[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, WHITE, BLACK, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, BLACK, WHITE, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],]; currentPlayer = BLACK; console.log("Board array initialized:", board ? 'OK' : 'Failed'); console.log("Target boardElement:", boardElement ? 'OK' : 'Failed'); console.log("Calling renderBoard..."); renderBoard(); console.log("renderBoard finished."); console.log("Calling updateUI..."); updateUI(); console.log("updateUI finished."); setStatusMessage(NON_BREAKING_SPACE); resultMessageElement.textContent = NON_BREAKING_SPACE; gameResultElement.style.display = 'none'; resetButton.style.display = 'none'; console.log("Game initialized variables set."); console.table(board); checkAndTriggerAI(); } catch (error) { console.error("Error during initializeGame:", error); } console.log("Exit initializeGame"); }
/** ゲーム盤面のクリック処理 */
function handleBoardClick(event) { if (gameOver) return; const currentPlayerType = (currentPlayer === BLACK) ? playerBlackType : playerWhiteType; if (currentPlayerType !== 'human') return; const targetCell = event.target.closest('.cell'); if (!targetCell) return; const row = parseInt(targetCell.dataset.row, 10); const col = parseInt(targetCell.dataset.col, 10); if (!isValidMove(row, col, currentPlayer)) { setStatusMessage("そこには置けません。"); return; } setStatusMessage(NON_BREAKING_SPACE); lastMoveRow = row; lastMoveCol = col; makeMove(row, col, currentPlayer); renderBoard(); switchPlayer(); }
/** UI更新 */
function updateUI() { try { if (gameOver) return; currentPlayerElement.textContent = (currentPlayer === BLACK ? '黒' : '白'); const scores = calculateScore(); if (scores) { scoreElement.textContent = `黒: ${scores.black} - 白: ${scores.white}`; } else { console.error("calculateScore returned undefined/error in updateUI!"); scoreElement.textContent = 'スコア計算エラー'; } } catch(e){ console.error("Error in updateUI:", e); } }
/** ステータスメッセージ設定 */
function setStatusMessage(message) { try { gameStatusElement.textContent = (message === "" || message === null || message === undefined) ? NON_BREAKING_SPACE : message; } catch(e){ console.error("Error in setStatusMessage:", e); } }
/** 有効手判定 (現在の盤面) */
function isValidMove(row, col, player) { return isValidMoveOnBoard(board, row, col, player); }
/** 石を置き、ひっくり返す (現在の盤面) */
function makeMove(row, col, player) { makeMoveOnBoard(board, row, col, player); }
/** 有効手のリストを取得 (現在の盤面) */
function getValidMoves(player) { return getValidMovesForBoard(board, player); }
/** ひっくり返せる石の数を数える (現在の盤面) */
function countFlips(row, col, player) { if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return 0; const opponent = (player === BLACK) ? WHITE : BLACK; const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]; let totalFlips = 0; for (const [dr, dc] of directions) { let r = row + dr; let c = col + dc; let stonesToFlipInThisDirection = 0; let foundOpponent = false; while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) { if (board[r][c] === opponent) { foundOpponent = true; stonesToFlipInThisDirection++; r += dr; c += dc; } else if (board[r][c] === player) { if (foundOpponent && stonesToFlipInThisDirection > 0) { totalFlips += stonesToFlipInThisDirection; } break; } else { break; } } } return totalFlips; }
/** 盤面のディープコピーを作成 */
function cloneBoard(boardToClone) { return boardToClone.map(row => [...row]); }
/** 指定された盤面上で手を打ち、石を反転させる */
function makeMoveOnBoard(boardInstance, row, col, player) { boardInstance[row][col] = player; const opponent = (player === BLACK) ? WHITE : BLACK; const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]; let flippedStones = []; for (const [dr, dc] of directions) { let r = row + dr; let c = col + dc; let stonesToFlipInThisDirection = []; while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) { if (boardInstance[r][c] === opponent) { stonesToFlipInThisDirection.push([r, c]); r += dr; c += dc; } else if (boardInstance[r][c] === player) { if (stonesToFlipInThisDirection.length > 0) { flippedStones.push(...stonesToFlipInThisDirection); } break; } else { break; } } } for (const [r, c] of flippedStones) { boardInstance[r][c] = player; } }
/** 盤面を評価 (位置 + Mobility) */
function evaluateBoard(currentBoard, player) { let positionalScore = 0; let myMoves = 0; let opponentMoves = 0; const opponent = (player === BLACK) ? WHITE : BLACK; for (let r = 0; r < BOARD_SIZE; r++) { for (let c = 0; c < BOARD_SIZE; c++) { if (currentBoard[r][c] === player) { positionalScore += POSITIONAL_WEIGHTS[r][c]; } else if (currentBoard[r][c] === opponent) { positionalScore -= POSITIONAL_WEIGHTS[r][c]; } } } myMoves = getValidMovesForBoard(currentBoard, player).length; opponentMoves = getValidMovesForBoard(currentBoard, opponent).length; let mobilityScore = 0; if (myMoves !== 0 || opponentMoves !== 0) { mobilityScore = MOBILITY_WEIGHT * (myMoves - opponentMoves); } const finalScore = positionalScore + mobilityScore; return finalScore; }
/** 指定された盤面状態で有効手を取得 */
function getValidMovesForBoard(boardState, player) { const validMoves = []; for (let r = 0; r < BOARD_SIZE; r++) { for (let c = 0; c < BOARD_SIZE; c++) { if (boardState[r][c] === EMPTY && isValidMoveOnBoard(boardState, r, c, player)) { validMoves.push([r, c]); } } } return validMoves; }
/** 指定された盤面状態で有効手か判定 */
function isValidMoveOnBoard(boardState, row, col, player) { if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE || boardState[row][col] !== EMPTY) { return false; } const opponent = (player === BLACK) ? WHITE : BLACK; const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]; let canFlip = false; for (const [dr, dc] of directions) { let r = row + dr; let c = col + dc; let foundOpponent = false; while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) { if (boardState[r][c] === opponent) { foundOpponent = true; r += dr; c += dc; } else if (boardState[r][c] === player) { if (foundOpponent) canFlip = true; break; } else { break; } } if (canFlip) break; } return canFlip; }
/** 現在のプレイヤーがAIならAIのターンを実行 */
function checkAndTriggerAI() { if (gameOver) return; const currentPlayerType = (currentPlayer === BLACK) ? playerBlackType : playerWhiteType; if (currentPlayerType.startsWith('ai_')) { setTimeout(makeAIMove, 50); } }
/** AIレベル1: ランダム */
function getAIRandomMove(validMoves) { if (!validMoves || validMoves.length === 0) return null; const randomIndex = Math.floor(Math.random() * validMoves.length); return validMoves[randomIndex]; }
/** AIレベル2: 貪欲法 */
function getAIGreedyMove(validMoves, player) { if (!validMoves || validMoves.length === 0) return null; let bestScore = -1; let bestMoves = []; for (const move of validMoves) { const [r, c] = move; const currentScore = countFlips(r, c, player); if (currentScore > bestScore) { bestScore = currentScore; bestMoves = [move]; } else if (currentScore === bestScore) { bestMoves.push(move); } } if (bestMoves.length === 0) return null; const randomIndex = Math.floor(Math.random() * bestMoves.length); return bestMoves[randomIndex]; }
/** AIレベル3: 評価関数ベース */
function getAIEvaluationMove(validMoves, player) { if (!validMoves || validMoves.length === 0) return null; let bestScore = -Infinity; let bestMoves = []; for (const move of validMoves) { const [r, c] = move; const tempBoard = cloneBoard(board); makeMoveOnBoard(tempBoard, r, c, player); const currentScore = evaluateBoard(tempBoard, player); if (currentScore > bestScore) { bestScore = currentScore; bestMoves = [move]; } else if (currentScore === bestScore) { bestMoves.push(move); } } if (bestMoves.length === 0) return null; const randomIndex = Math.floor(Math.random() * bestMoves.length); return bestMoves[randomIndex]; }
/** Minimax + AlphaBeta 再帰関数 */
function minimaxAlphaBeta(boardState, depth, isMaximizingPlayer, aiPlayer, alpha, beta) { const currentPlayerColor = isMaximizingPlayer ? aiPlayer : (aiPlayer === BLACK ? WHITE : BLACK); const validMoves = getValidMovesForBoard(boardState, currentPlayerColor); if (depth === 0 || validMoves.length === 0) { return evaluateBoard(boardState, aiPlayer); } if (isMaximizingPlayer) { let maxEval = -Infinity; for (const move of validMoves) { const [r, c] = move; const childBoard = cloneBoard(boardState); makeMoveOnBoard(childBoard, r, c, currentPlayerColor); const evalScore = minimaxAlphaBeta(childBoard, depth - 1, false, aiPlayer, alpha, beta); maxEval = Math.max(maxEval, evalScore); alpha = Math.max(alpha, evalScore); if (beta <= alpha) { break; } } return maxEval; } else { let minEval = +Infinity; for (const move of validMoves) { const [r, c] = move; const childBoard = cloneBoard(boardState); makeMoveOnBoard(childBoard, r, c, currentPlayerColor); const evalScore = minimaxAlphaBeta(childBoard, depth - 1, true, aiPlayer, alpha, beta); minEval = Math.min(minEval, evalScore); beta = Math.min(beta, evalScore); if (beta <= alpha) { break; } } return minEval; } }
/** AIレベル4+: AlphaBeta探索 */
function getAIMinimaxMoveAlphaBeta(validMoves, player, depth) { if (!validMoves || validMoves.length === 0) return null; let bestScore = -Infinity; let bestMoves = []; let alpha = -Infinity; let beta = +Infinity; const startTime = performance.now(); console.log(`--- AlphaBeta Start (Player: ${player===BLACK?'B':'W'}, Depth: ${depth}) ---`); for (const move of validMoves) { const [r, c] = move; const tempBoard = cloneBoard(board); makeMoveOnBoard(tempBoard, r, c, player); const currentScore = minimaxAlphaBeta(tempBoard, depth - 1, false, player, alpha, beta); console.log(`[D${depth}] Move (${r}, ${c}) eval'd. Score: ${currentScore}`); if (currentScore > bestScore) { console.log(`  => New best score: ${currentScore} (was ${bestScore}) for move (${r},${c})`); bestScore = currentScore; bestMoves = [move]; } else if (currentScore === bestScore) { console.log(`  => Tied best score: ${currentScore} for move (${r},${c})`); bestMoves.push(move); } alpha = Math.max(alpha, bestScore); } const endTime = performance.now(); console.log(`--- AlphaBeta End (Depth ${depth}) --- Time: ${(endTime - startTime).toFixed(2)} ms. Best score: ${bestScore}`); if (bestMoves.length === 0) { console.error("AlphaBeta could not find a best move!"); return validMoves[Math.floor(Math.random() * validMoves.length)]; } const randomIndex = Math.floor(Math.random() * bestMoves.length); const chosen = bestMoves[randomIndex]; console.log(`Chosen move from best [${bestMoves.map(m => `(${m[0]},${m[1]})`).join(', ')}]: (${chosen[0]}, ${chosen[1]})`); return chosen; }
/** AIの手番処理 */
function makeAIMove() { const currentPlayerType = (currentPlayer === BLACK) ? playerBlackType : playerWhiteType; if (gameOver || !currentPlayerType.startsWith('ai_')) return; const aiPlayerColor = (currentPlayer === BLACK ? '黒' : '白'); console.log(`AI (${aiPlayerColor} - ${currentPlayerType}) thinking...`); setStatusMessage(`相手(${aiPlayerColor})が考えています...`); const validMoves = getValidMoves(currentPlayer); let chosenMove = null; let thinkingTime = AI_MOVE_DELAY; /* Default thinking time for L1-3 */ if (validMoves && validMoves.length > 0) { switch (currentPlayerType) { case 'ai_level1': chosenMove = getAIRandomMove(validMoves); break; case 'ai_level2': chosenMove = getAIGreedyMove(validMoves, currentPlayer); break; case 'ai_level3': chosenMove = getAIEvaluationMove(validMoves, currentPlayer); break; case 'ai_level4': chosenMove = getAIMinimaxMoveAlphaBeta(validMoves, currentPlayer, 2); thinkingTime = 100; break; /* Shorter delay after calc */ case 'ai_level5': chosenMove = getAIMinimaxMoveAlphaBeta(validMoves, currentPlayer, 4); thinkingTime = 100; break; /* Shorter delay after calc */ default: chosenMove = getAIRandomMove(validMoves); } if (chosenMove) { const [row, col] = chosenMove; const currentTime = performance.now(); console.log(`>>> AI move chosen: (${row}, ${col}). Scheduling execution in ${thinkingTime}ms at ${currentTime.toFixed(2)}ms`); setTimeout(() => { const executionTime = performance.now(); console.log(`<<< Executing AI move (${row}, ${col}) after delay at ${executionTime.toFixed(2)}ms (Scheduled at ${currentTime.toFixed(2)}ms)`); if (gameOver) return; const currentTypeCheck = (currentPlayer === BLACK) ? playerBlackType : playerWhiteType; if(!currentTypeCheck.startsWith('ai_')) return; lastMoveRow = row; lastMoveCol = col; makeMove(row, col, currentPlayer); renderBoard(); switchPlayer(); }, thinkingTime); } else { console.error(`AI (${aiPlayerColor} - ${currentPlayerType}) could not choose a move.`); switchPlayer(); } } else { console.log(`AI (${aiPlayerColor} - ${currentPlayerType}) has no moves. Passing.`); switchPlayer(); } }
/** プレイヤー交代・パス・終了チェック */
function switchPlayer() { if (gameOver) return; let nextPlayer = (currentPlayer === BLACK) ? WHITE : BLACK; let validMovesForNextPlayer = getValidMoves(nextPlayer); if (validMovesForNextPlayer && validMovesForNextPlayer.length > 0) { currentPlayer = nextPlayer; updateUI(); setStatusMessage(NON_BREAKING_SPACE); checkAndTriggerAI(); } else if (validMovesForNextPlayer) { const passPlayerColor = (nextPlayer === BLACK ? '黒' : '白'); setStatusMessage(`プレイヤー ${passPlayerColor} はパスです。`); let validMovesForCurrentPlayer = getValidMoves(currentPlayer); if (validMovesForCurrentPlayer && validMovesForCurrentPlayer.length > 0) { updateUI(); checkAndTriggerAI(); } else if (validMovesForCurrentPlayer) { endGame(); } else { console.error("Pass Error C"); endGame(); } } else { console.error("Pass Error N"); endGame(); } }
/** ゲーム終了処理 */
function endGame() { if (gameOver) return; gameOver = true; const scores = calculateScore(); let resultText = `ゲーム終了！ 結果: 黒 ${scores.black} - 白 ${scores.white} で `; if (scores.black > scores.white) { resultText += "黒の勝ち！"; } else if (scores.white > scores.black) { resultText += "白の勝ち！"; } else { resultText += "引き分け！"; } setStatusMessage(resultText); resultMessageElement.textContent = resultText; gameResultElement.style.display = 'block'; resetButton.style.display = 'inline-block'; console.log("Game ended: " + resultText); }
/** スコア計算 */
function calculateScore() { let blackScore = 0; let whiteScore = 0; for (let r = 0; r < BOARD_SIZE; r++) { for (let c = 0; c < BOARD_SIZE; c++) { if (board[r][c] === BLACK) blackScore++; else if (board[r][c] === WHITE) whiteScore++; } } return { black: blackScore, white: whiteScore }; }
