import BassPlayerCard, { type BassPlayer } from './BassPlayerCard'
import './App.css'

const players: BassPlayer[] = [
  {
    rank: 1,
    name: 'Jaco Pastorius',
    instrument: 'Fretless Fender Jazz Bass',
    bands: 'Weather Report, Headhunters, solo',
    bio: 'Jaco shattered what people thought an electric bass could be, bringing jazz vocabulary, orchestral dynamics, and a singing fretless tone to the low end. He made the bass a true lead voice and opened the door for every fretless player who followed. He remains the single most influential figure in modern bass playing.',
  },
  {
    rank: 2,
    name: 'James Jamerson',
    instrument: 'Fender Precision Bass',
    bands: 'Motown house band',
    bio: 'The most recorded bassist in history, Jamerson wrote the groove book at Motown with a warm, chugging tone and an ear for what a song needed. He laid down the low end on hundreds of classics that still define the sound of an era. Few players have ever made the rhythm section feel so alive.',
  },
  {
    rank: 3,
    name: 'Flea',
    instrument: 'Electric Bass (Fender, Music Man)',
    bands: 'Red Hot Chili Peppers',
    bio: 'Flea turned slap into a rhythmic weapon and made the bass the frontman of the band. His wild leaps, percussive pops, and relentless groove defined 80s alternative rock and proved a bassist could be the star of the show. Few players have matched his instinct for locking rhythm and lead together.',
  },
  {
    rank: 4,
    name: 'Bootsy Collins',
    instrument: 'Fender Precision Bass',
    bands: 'Parliament, Funkadelic',
    bio: 'The soul of P-Funk, Bootsy is the godfather of funk bass and the origin of the signature "slap and pop" sound. His grooves are warm, loose, and hypnotic, built for dancing rather than impressing. He redefined how the bass could carry the entire feel of a song.',
  },
  {
    rank: 5,
    name: 'Marcus Miller',
    instrument: 'Fender Jazz Bass',
    bands: 'Marcus Miller, session & solo',
    bio: 'Miller is a virtuosic finger- and slap-player whose fluid, singing lines blend jazz harmony with rock power. He has an extraordinary feel for swing and space, letting notes breathe in a way that keeps grooves alive. His technical command never gets in the way of his feel for rhythm.',
  },
  {
    rank: 6,
    name: 'Paul McCartney',
    instrument: 'Höfner 500/1 Violin Bass',
    bands: 'The Beatles, Wings, solo',
    bio: 'The famous Höfner line is iconic for a reason: McCartney played the bass with the melodic instinct of a guitarist and the songcraft of a composer. His lines drive some of the most recognizable songs in history while staying deceptively simple. He proved a bassist could be a true co-lead.',
  },
  {
    rank: 7,
    name: 'Charlie Haden',
    instrument: 'Upright (double) Bass',
    bands: 'Ornette Coleman, Various',
    bio: "A giant of jazz upright bass, Haden played with a deep, orchestral tone and an unmatched sense of drama and silence. He gave the double bass a new emotional weight and turned it into a singing, expressive lead. He is the bridge between the instrument's jazz soul and everything modern.",
  },
  {
    rank: 8,
    name: 'Geddy Lee',
    instrument: 'Rickenbacker, Fender, custom basses',
    bands: 'Rush',
    bio: 'Lee is a master of tone and control, layering effects to make one bass sound like a full band. His playing is precise, dynamic, and full of personality, driving Rush from rock to prog to new wave. He is a modern benchmark for technical and tonal range on the instrument.',
  },
  {
    rank: 9,
    name: 'Robert Trujillo',
    instrument: 'Fender, Music Man, custom basses',
    bands: 'Metallica, Machine Head, Infectious Grooves',
    bio: "Trujillo is the modern face of metal bass, pairing punishing low-end drive with a playful, genre-hopping groove. His riffs are heavy but melodic, and his feel keeps metal's low end danceable. He has made the electric bass a star in a genre long defined by the guitar.",
  },
  {
    rank: 10,
    name: 'Victor Wooten',
    instrument: 'Fingerstyle & slap, custom basses',
    bands: 'Beastie Boys, solo, bass collective',
    bio: 'Wooten is a one-man orchestra, able to play multiple lines, percussion, and harmony at once with a mind-blowing fluidity. His approach to the bass as a complete rhythm section inspired a whole wave of players to expand what the instrument can do. He remains one of the most technically gifted players of his generation.',
  },
]

function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="hero__eyebrow">The all-time list</p>
        <h1 className="hero__title">
          The Greatest
          <span className="hero__title-accent"> Bass Players</span>
          <span className="hero__title-of"> of All Time</span>
        </h1>
        <p className="hero__tagline">
          A hand-picked top ten of the players who defined the bass — across
          jazz, funk, rock, and metal.
        </p>
        <a className="hero__cta" href="#list">
          Meet the ten <span aria-hidden="true">↓</span>
        </a>
      </header>

      <main className="list" id="list">
        <h2 className="list__heading">Top 10 Bass Players of All Time</h2>
        <div className="list__grid">
          {players.map((player) => (
            <BassPlayerCard key={player.name} player={player} />
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>An original, opinionated list. Disagreements welcome.</p>
      </footer>
    </div>
  )
}

export default App
