# Background Music Files

Place royalty-free MP3 files here. They are mixed at 15% volume under the AI voiceover.

## Required filenames

| File | Niche keywords | Used when |
|------|---------------|-----------|
| `calm-piano.mp3` | wisdom, default | Default for most niches |
| `uplifting-ambient.mp3` | motivation | Niche contains "motivation" |
| `electronic-chill.mp3` | ai | Niche contains "ai" |

## Where to get free music

- **Pixabay Audio** — https://pixabay.com/music/ (free, royalty-free, no attribution required)
  - Search: "calm piano", "ambient", "lo-fi chill"
- **Free Music Archive** — https://freemusicarchive.org
- **ccMixter** — https://ccmixter.org

## Notes

- Music must be at least as long as the video (15–30 seconds). Longer files are trimmed automatically.
- If a file is missing the system falls back to voice-only (no music).
- The Dockerfile auto-generates silent placeholder files so the container starts without errors.
  Replace them with real music files and rebuild: `docker-compose build visual-producer`
