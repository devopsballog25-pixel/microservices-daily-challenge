FROM node:18-slim

# Install FFmpeg for video/audio processing
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY . .

# Create music directory and generate silent placeholder files.
# Replace with real royalty-free MP3s and rebuild for actual background music.
# See music/README.md for sources.
RUN mkdir -p /app/music && \
    ffmpeg -f lavfi -i "anullsrc=r=44100:cl=stereo" -t 120 -q:a 9 -acodec libmp3lame \
      -y /app/music/calm-piano.mp3 2>/dev/null && \
    cp /app/music/calm-piano.mp3 /app/music/uplifting-ambient.mp3 && \
    cp /app/music/calm-piano.mp3 /app/music/electronic-chill.mp3

EXPOSE 3004

CMD ["node", "server.js"]
