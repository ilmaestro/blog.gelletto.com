export interface BassPlayer {
  rank: number
  name: string
  instrument: string
  bands: string
  bio: string
}

interface BassPlayerCardProps {
  player: BassPlayer
}

export default function BassPlayerCard({ player }: BassPlayerCardProps) {
  return (
    <article className="player-card">
      <div className="player-card__rank" aria-hidden="true">
        {String(player.rank).padStart(2, '0')}
      </div>

      <div className="player-card__body">
        <div className="player-card__head">
          <h3 className="player-card__name">{player.name}</h3>
          <span className="player-card__instrument">{player.instrument}</span>
        </div>

        <p className="player-card__bands">{player.bands}</p>

        <p className="player-card__bio">{player.bio}</p>
      </div>
    </article>
  )
}
