import { useState, useEffect, useRef } from 'react';
import { Home, Mail, Palette } from 'lucide-react';

type Theme = 'classic' | 'candy' | 'spooky' | 'rainbow' | 'underwater';
type Page = 'home' | 'contact';

interface EmojiParticle {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  size: number;
}

interface BubbleParticle {
  id: number;
  left: number;
  duration: number;
  size: number;
}

interface FishParticle {
  id: number;
  emoji: string;
  top: number;
  duration: number;
  direction: 'left' | 'right';
}

const CANDY_EMOJIS = ['🍭', '🍬', '🧁', '🍩', '🎂', '🍫', '🍪'];
const SPOOKY_EMOJIS = ['🕷️', '🎃', '🐍', '🦇', '👻', '💀', '🦴', '🕸️'];
const FISH_EMOJIS = ['🐟', '🐠', '🐡', '🦈'];

const CHECKER_COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#a855f7', '#f97316'];
const CELL = 48;
const SPEED = 24; // px/sec — one full cell cycle every 2s

function CheckerboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let start: number | null = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (timestamp: number) => {
      if (start === null) start = timestamp;
      const offset = Math.floor(((timestamp - start) / 1000) * SPEED);

      const w = canvas.width;
      const h = canvas.height;
      const cols = Math.ceil(w / CELL) + 2;
      const rows = Math.ceil(h / CELL) + 2;
      const ox = offset % CELL;
      const oy = offset % CELL;

      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ci = ((c + r) % 5 + 5) % 5;
          ctx.fillStyle = CHECKER_COLORS[ci];
          ctx.fillRect(c * CELL - ox, r * CELL - oy, CELL, CELL);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
}

function App() {
  const [page, setPage] = useState<Page>('home');
  const [theme, setTheme] = useState<Theme>('classic');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [emojis, setEmojis] = useState<EmojiParticle[]>([]);
  const [bubbles, setBubbles] = useState<BubbleParticle[]>([]);
  const [fishes, setFishes] = useState<FishParticle[]>([]);
  const nextIdRef = useRef(0);

  const getId = () => ++nextIdRef.current;

  // Emoji shower for candy & spooky
  useEffect(() => {
    if (theme !== 'candy' && theme !== 'spooky') {
      setEmojis([]);
      return;
    }
    const pool = theme === 'candy' ? CANDY_EMOJIS : SPOOKY_EMOJIS;
    const interval = setInterval(() => {
      const emoji: EmojiParticle = {
        id: getId(),
        emoji: pool[Math.floor(Math.random() * pool.length)],
        left: Math.random() * 95,
        duration: 7 + Math.random() * 6,
        size: 20 + Math.random() * 16,
      };
      setEmojis(prev => (prev.length > 20 ? prev.slice(-20) : [...prev, emoji]));
    }, 700);
    return () => clearInterval(interval);
  }, [theme]);

  // Bubbles for underwater
  useEffect(() => {
    if (theme !== 'underwater') {
      setBubbles([]);
      return;
    }
    const interval = setInterval(() => {
      const bubble: BubbleParticle = {
        id: getId(),
        left: Math.random() * 95,
        duration: 7 + Math.random() * 6,
        size: 10 + Math.random() * 24,
      };
      setBubbles(prev => (prev.length > 12 ? prev.slice(-12) : [...prev, bubble]));
    }, 1000);
    return () => clearInterval(interval);
  }, [theme]);

  // Fish for underwater
  useEffect(() => {
    if (theme !== 'underwater') {
      setFishes([]);
      return;
    }
    const interval = setInterval(() => {
      const fish: FishParticle = {
        id: getId(),
        emoji: FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)],
        top: 15 + Math.random() * 65,
        duration: 8 + Math.random() * 8,
        direction: Math.random() > 0.4 ? 'left' : 'right',
      };
      setFishes(prev => (prev.length > 5 ? prev.slice(-5) : [...prev, fish]));
    }, 3000);
    return () => clearInterval(interval);
  }, [theme]);

  // Prune old particles
  useEffect(() => {
    const timeout = setTimeout(() => {
      setEmojis(prev => prev.slice(-15));
    }, 14000);
    return () => clearTimeout(timeout);
  }, [emojis]);

  const bgClass = (() => {
    switch (theme) {
      case 'classic': return 'bg-black';
      case 'candy': return 'bg-pink-400';
      case 'spooky': return 'bg-orange-500';
      case 'rainbow': return 'rainbow-bg';
      case 'underwater': return 'bg-blue-600';
      default: return 'bg-black';
    }
  })();

  return (
    <div className={`min-h-screen relative overflow-hidden ${bgClass}`}>
      {/* Checkerboard canvas for classic theme */}
      {theme === 'classic' && <CheckerboardCanvas />}

      {/* Emoji particles */}
      {(theme === 'candy' || theme === 'spooky') && emojis.map(e => (
        <div
          key={e.id}
          className="emoji-particle"
          style={{
            left: `${e.left}%`,
            fontSize: `${e.size}px`,
            animationDuration: `${e.duration}s`,
            top: '-5vh',
          }}
        >
          {e.emoji}
        </div>
      ))}

      {/* Bubbles */}
      {theme === 'underwater' && bubbles.map(b => (
        <div
          key={b.id}
          className="bubble-particle"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}

      {/* Fish */}
      {theme === 'underwater' && fishes.map(f => (
        <div
          key={f.id}
          className={`fish-particle ${f.direction === 'left' ? 'fish-left' : 'fish-right'}`}
          style={{
            top: `${f.top}%`,
            animationDuration: `${f.duration}s`,
          }}
        >
          {f.emoji}
        </div>
      ))}

      {/* Theme switcher */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setThemeMenuOpen(!themeMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-all shadow-lg"
        >
          <Palette size={18} />
          <span className="text-sm font-medium hidden sm:inline">Theme</span>
        </button>
        {themeMenuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-black/80 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-white/10">
            {([
              { key: 'classic' as Theme, label: 'Classic' },
              { key: 'candy' as Theme, label: 'Candy' },
              { key: 'spooky' as Theme, label: 'Spooky' },
              { key: 'rainbow' as Theme, label: 'Rainbow' },
              { key: 'underwater' as Theme, label: 'Underwater' },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => { setTheme(t.key); setThemeMenuOpen(false); }}
                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  theme === t.key
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-center gap-2 pt-6 pb-2 px-4">
        <button
          onClick={() => setPage('home')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all text-sm sm:text-base ${
            page === 'home'
              ? 'bg-white/25 text-white shadow-lg backdrop-blur-sm'
              : 'bg-black/20 text-white/80 hover:bg-black/30 hover:text-white backdrop-blur-sm'
          }`}
        >
          <Home size={18} />
          Home
        </button>
        <button
          onClick={() => setPage('contact')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all text-sm sm:text-base ${
            page === 'contact'
              ? 'bg-white/25 text-white shadow-lg backdrop-blur-sm'
              : 'bg-black/20 text-white/80 hover:bg-black/30 hover:text-white backdrop-blur-sm'
          }`}
        >
          <Mail size={18} />
          Contact
        </button>
      </nav>

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        {page === 'home' ? <HomePage /> : <ContactPage />}
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <p className="text-white text-lg md:text-xl font-normal mb-2 drop-shadow-lg">Hey, I'm</p>
      <h1 className="rainbow-text text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight py-1">
        billie stewart
      </h1>
      <p className="text-white/95 text-base md:text-lg leading-relaxed max-w-xl mx-auto drop-shadow-md">
        A blooket knockoff fan, amateur artist, a [rather] noob developer. Very enthusiastic and love chatting. Love Techno music, edm, hackers, all sorts of food, insects, spiders, reptile, video games, aliens and books. Soundgod, Xotic, Izumiihd and all other developers are amazing.
      </p>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="rainbow-text text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 py-1">
        Social links
      </h2>
      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-8">
        <a
          href="https://discord.gg/Jb2pPcMMd8"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-[#5865F2] text-white font-semibold rounded-xl hover:bg-[#4752C4] transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-block"
        >
          Join Discord
        </a>
        <a
          href="https://github.com/Misrblacket/Woolberry"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-[#333] text-white font-semibold rounded-xl hover:bg-[#555] transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-block"
        >
          View GitHub
        </a>
        <a
          href="https://romulet.neocities.org/Bloooooket"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-block"
        >
          Blooket Knockoff Links
        </a>
      </div>
      <p className="text-white/90 text-base md:text-lg drop-shadow-md">
        or email me: <span className="font-semibold">blacketmisr@outlook.com</span>
      </p>
    </div>
  );
}

export default App;
