import { useState, useEffect, useCallback } from "react";

const WORDS = [
  { word: "MOSES", hint: "Led Israel out of Egypt" },
  { word: "DAVID", hint: "Slew Goliath, became King" },
  { word: "GRACE", hint: "Unmerited divine favour" },
  { word: "FAITH", hint: "Confidence in what we hope for" },
  { word: "ANGEL", hint: "Heavenly messenger" },
  { word: "PSALM", hint: "Sacred song or hymn" },
  { word: "ELIJAH", hint: "Prophet taken to heaven in a chariot" },
  { word: "GOSPEL", hint: "Good news of salvation" },
  { word: "TEMPLE", hint: "House of God in Jerusalem" },
  { word: "SAMSON", hint: "Judge known for great strength" },
  { word: "ESTHER", hint: "Queen who saved her people" },
  { word: "JOSEPH", hint: "Dreamer sold by his brothers" },
  { word: "DANIEL", hint: "Survived the lion's den" },
  { word: "PRAYER", hint: "Communion with God" },
  { word: "ISAIAH", hint: "Prophet who foretold the Messiah" },
  { word: "EXODUS", hint: "Second book of the Bible" },
  { word: "CANAAN", hint: "The Promised Land" },
  { word: "ROMANS", hint: "Epistle by Paul" },
  { word: "THRONE", hint: "God's seat of glory" },
  { word: "SPIRIT", hint: "The Holy ______" },
  { word: "PETER", hint: "The rock on whom the church was built" },
  { word: "JAMES", hint: "Brother of Jesus, wrote an epistle" },
  { word: "JACOB", hint: "Wrestled with God, renamed Israel" },
  { word: "ABRAM", hint: "Original name of Abraham" },
  { word: "SARAH", hint: "Wife of Abraham, mother of Isaac" },
  { word: "ISAAC", hint: "Son of promise to Abraham" },
  { word: "MIRIAM", hint: "Sister of Moses, led women in song" },
  { word: "JOSHUA", hint: "Led Israel into the Promised Land" },
  { word: "GIDEON", hint: "Judge who defeated Midian with 300 men" },
  { word: "BARUCH", hint: "Jeremiah's faithful scribe" },
  { word: "NAOMI", hint: "Ruth's mother-in-law" },
  { word: "DEBORAH", hint: "Female judge and prophetess of Israel" },
  { word: "PARABLE", hint: "A story with a spiritual lesson" },
  { word: "SERMON", hint: "A religious address or discourse" },
  { word: "BAPTISM", hint: "Sacrament of initiation by water" },
  { word: "HEAVEN", hint: "Eternal dwelling place of God" },
  { word: "NAZARETH", hint: "Town where Jesus grew up" },  
];

const MAX_ATTEMPTS = 6;
const DAILY_INDEX = Math.floor(Date.now() / 86400000) % WORDS.length;
const DAILY = WORDS[DAILY_INDEX];

const getTileState = (guess, answer, index) => {
  if (guess[index] === answer[index]) return "correct";
  if (answer.includes(guess[index])) return "present";
  return "absent";
};

const getGuessResult = (guess, answer) =>
  guess.split("").map((_, i) => getTileState(guess, answer, i));

const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

const stateColor = { correct: "#4a7c59", present: "#c9942a", absent: "#3a3a4a", default: "#1e1e2e" };
const stateBorder = { correct: "#4a7c59", present: "#c9942a", absent: "#3a3a4a", default: "#5a5a7a" };

export default function App() {
  const wordLen = DAILY.word.length;
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [revealRow, setRevealRow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const keyStates = {};
  guesses.forEach(({ guess, result }) => {
    guess.split("").forEach((letter, i) => {
      const prev = keyStates[letter];
      const next = result[i];
      if (prev === "correct") return;
      if (prev === "present" && next !== "correct") return;
      keyStates[letter] = next;
    });
  });

  const showMsg = (msg, duration = 1800) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };

  const submitGuess = useCallback(() => {
    if (current.length !== wordLen) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showMsg(`Word must be ${wordLen} letters`);
      return;
    }
    const result = getGuessResult(current, DAILY.word);
    const newGuess = { guess: current, result };
    const newGuesses = [...guesses, newGuess];
    setRevealRow(guesses.length);
    setTimeout(() => setRevealRow(null), wordLen * 150 + 400);
    setGuesses(newGuesses);
    setCurrent("");
    if (current === DAILY.word) {
      setTimeout(() => { setWon(true); setGameOver(true); setShowModal(true); }, wordLen * 150 + 400);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setTimeout(() => { setGameOver(true); setShowModal(true); showMsg(`The word was ${DAILY.word}`, 4000); }, wordLen * 150 + 400);
    }
  }, [current, guesses, wordLen]);

  const handleKey = useCallback((key) => {
    if (gameOver) return;
    if (key === "ENTER") { submitGuess(); return; }
    if (key === "⌫" || key === "BACKSPACE") { setCurrent(p => p.slice(0, -1)); return; }
    if (/^[A-Z]$/.test(key) && current.length < wordLen) setCurrent(p => p + key);
  }, [gameOver, current, wordLen, submitGuess]);

  useEffect(() => {
    const handler = (e) => handleKey(e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const grid = Array.from({ length: MAX_ATTEMPTS }, (_, row) => {
    if (row < guesses.length) return { type: "submitted", data: guesses[row] };
    if (row === guesses.length && !gameOver) return { type: "active" };
    return { type: "empty" };
  });

  const tileSize = wordLen >= 7 ? 44 : wordLen >= 6 ? 48 : 52;

  return (
    <div style={styles.root}>
      <div style={styles.texture} />
      <header style={styles.header}>
        <div style={styles.headerLeft}><span style={{fontSize:24}}>📜</span></div>
        <div style={styles.titleBlock}>
          <div style={styles.titleMain}>SCRIPTURE</div>
          <div style={styles.titleSub}>W · O · R · D · P · L · A · Y</div>
          <div style={styles.titleDomain}>johnsravya.in</div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn} onClick={() => setShowHint(p => !p)} title="Hint">🕯️</button>
        </div>
      </header>

      {showHint && (
        <div style={styles.hintBar}>
          <span style={{color:"#c9942a",fontSize:12}}>✝</span>
          <span style={styles.hintText}>{DAILY.hint}</span>
          <span style={{color:"#c9942a",fontSize:12}}>✝</span>
        </div>
      )}

      {message && <div style={styles.toast}>{message}</div>}
      <div style={styles.badge}>{wordLen}-letter Biblical term • Puzzle #{DAILY_INDEX + 1}</div>

      <div style={styles.grid}>
        {grid.map((row, rowIdx) => {
          const isShaking = shake && row.type === "active";
          const isRevealing = revealRow === rowIdx;
          return (
            <div key={rowIdx} style={{...styles.row, animation: isShaking ? "shake 0.4s ease" : "none"}}>
              {Array.from({ length: wordLen }, (_, col) => {
                let letter = "", bg = "transparent", border = "2px solid #5a5a7a44", color = "#e8dcc8", delay = "0ms", flip = false;
                if (row.type === "submitted") {
                  letter = row.data.guess[col];
                  const state = row.data.result[col];
                  bg = stateColor[state]; border = `2px solid ${stateBorder[state]}`;
                  if (isRevealing) { delay = `${col * 150}ms`; flip = true; }
                } else if (row.type === "active") {
                  letter = current[col] || "";
                  border = col < current.length ? "2px solid #c9942a88" : "2px solid #5a5a7a66";
                }
                return (
                  <div key={col} style={{
                    width: tileSize, height: tileSize, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: tileSize - 28, fontWeight:700, borderRadius:6, border, background:bg, color,
                    fontFamily:"'Cinzel',serif", userSelect:"none", textShadow:"0 1px 3px #00000088",
                    animation: flip ? `flip 0.5s ease ${delay} both` : letter && row.type==="active" ? "pop 0.1s ease" : "none",
                  }}>{letter}</div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} style={styles.kbRow}>
            {row.map(key => {
              const state = keyStates[key];
              const isWide = key === "ENTER" || key === "⌫";
              return (
                <button key={key} onClick={() => handleKey(key)} style={{
                  height:46, minWidth: isWide ? 52 : 32, padding:"0 6px",
                  border:"1px solid", borderRadius:6, cursor:"pointer",
                  fontFamily:"'Cinzel',serif", fontWeight:600,
                  fontSize: isWide ? 11 : 15, transition:"all 0.15s", userSelect:"none",
                  background: state ? stateColor[state] : "#2a2a3e",
                  borderColor: state ? stateBorder[state] : "#4a4a6a",
                  color: state ? "#fff" : "#e8dcc8",
                }}>{key}</button>
              );
            })}
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            <div style={{fontSize:40,marginBottom:8}}>{won ? "✝" : "📖"}</div>
            <div style={styles.modalTitle}>{won ? "Hallelujah!" : "Keep Seeking"}</div>
            <div style={styles.modalWord}>{DAILY.word}</div>
            <div style={styles.modalHint}>{DAILY.hint}</div>
            <div style={styles.modalStats}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:700,color:"#4a7c59"}}>{guesses.length}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#e8dcc866",letterSpacing:2}}>ATTEMPTS</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:700,color:"#c9942a"}}>
                  {won ? Math.max(65 - (guesses.length - 1) * 10, 5) : 5}
                </div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"#e8dcc866",letterSpacing:2}}>POINTS</div>
              </div>
            </div>
            <div style={styles.verse}>"Thy word is a lamp unto my feet" — Psalm 119:105</div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0d1a; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes flip { 0%{transform:rotateX(0)} 50%{transform:rotateX(-90deg);opacity:0.4} 100%{transform:rotateX(0)} }
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.12)} 100%{transform:scale(1)} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight:"100vh", background:"linear-gradient(160deg,#0d0d1a 0%,#1a1025 40%,#0d1a0d 100%)", display:"flex", flexDirection:"column", alignItems:"center", fontFamily:"'Cinzel',serif", position:"relative", overflow:"hidden", paddingBottom:20 },
  texture: { position:"fixed", inset:0, backgroundImage:"radial-gradient(ellipse at 20% 20%,#c9942a08 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,#4a7c5908 0%,transparent 60%)", pointerEvents:"none", zIndex:0 },
  header: { width:"100%", maxWidth:480, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 8px", borderBottom:"1px solid #c9942a33", position:"relative", zIndex:1 },
  headerLeft: { width:40 },
  headerRight: { width:40, display:"flex", justifyContent:"flex-end" },
  titleBlock: { textAlign:"center" },
  titleMain: { fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:700, color:"#c9942a", letterSpacing:6, textShadow:"0 0 20px #c9942a44" },
  titleSub: { fontFamily:"'Cinzel',serif", fontSize:9, color:"#e8dcc866", letterSpacing:4, marginTop:2 },
  titleDomain: { fontFamily:"'Cinzel',serif", fontSize:8, color:"#c9942a55", letterSpacing:2, marginTop:1 },
  iconBtn: { background:"none", border:"none", fontSize:20, cursor:"pointer", padding:4 },
  hintBar: { display:"flex", alignItems:"center", gap:10, background:"#c9942a18", border:"1px solid #c9942a44", borderRadius:8, padding:"8px 16px", margin:"8px 20px 0", maxWidth:440, width:"calc(100% - 40px)", animation:"fadeDown 0.3s ease", zIndex:1 },
  hintText: { fontFamily:"'IM Fell English',serif", fontStyle:"italic", color:"#e8dcc8", fontSize:14, textAlign:"center", flex:1 },
  toast: { position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", background:"#1e1e2e", border:"1px solid #c9942a66", color:"#e8dcc8", fontFamily:"'IM Fell English',serif", fontSize:15, padding:"10px 20px", borderRadius:8, zIndex:100, animation:"fadeDown 0.3s ease", whiteSpace:"nowrap" },
  badge: { fontFamily:"'Cinzel',serif", fontSize:10, color:"#c9942a88", letterSpacing:3, textTransform:"uppercase", margin:"12px 0 8px", zIndex:1 },
  grid: { display:"flex", flexDirection:"column", gap:6, padding:"4px 0 12px", zIndex:1 },
  row: { display:"flex", gap:6 },
  keyboard: { display:"flex", flexDirection:"column", gap:6, zIndex:1, padding:"0 8px" },
  kbRow: { display:"flex", gap:5, justifyContent:"center" },
  modalOverlay: { position:"fixed", inset:0, background:"#00000088", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(4px)" },
  modal: { background:"linear-gradient(135deg,#1a1a2e,#0d1a0d)", border:"1px solid #c9942a55", borderRadius:16, padding:"32px 28px", maxWidth:340, width:"90%", textAlign:"center", position:"relative", animation:"modalIn 0.4s ease", boxShadow:"0 20px 60px #00000099,0 0 40px #c9942a11" },
  closeBtn: { position:"absolute", top:12, right:14, background:"none", border:"none", color:"#e8dcc866", fontSize:16, cursor:"pointer" },
  modalTitle: { fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, color:"#c9942a", letterSpacing:3, marginBottom:12 },
  modalWord: { fontFamily:"'Cinzel',serif", fontSize:32, fontWeight:700, color:"#e8dcc8", letterSpacing:8, marginBottom:6, textShadow:"0 0 20px #c9942a44" },
  modalHint: { fontFamily:"'IM Fell English',serif", fontStyle:"italic", color:"#e8dcc899", fontSize:14, marginBottom:20 },
  modalStats: { display:"flex", justifyContent:"center", gap:32, marginBottom:20 },
  verse: { fontFamily:"'IM Fell English',serif", fontStyle:"italic", color:"#c9942a88", fontSize:12, borderTop:"1px solid #c9942a22", paddingTop:14, lineHeight:1.6 },
};
