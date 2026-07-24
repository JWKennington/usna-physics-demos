#!/usr/bin/env bash
# build-media.sh — regenerate the Semester Preview web-ready media.
#
# Downloads the public-domain / open-access sources (Wikimedia Commons + GWOSC),
# trims and normalizes them with ffmpeg into public/media/semester-preview/.
# Fully reproducible: no raw source binaries are committed, only this script and
# the normalized MP4/WAV the app ships. Run from anywhere:  bash build-media.sh
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"                 # demos repo root
OUT="$root/public/media/semester-preview"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"
command -v ffmpeg >/dev/null || { echo "ffmpeg required: brew install ffmpeg"; exit 1; }

commons_url () { # $1 = "File:Title.ext" -> direct upload URL
  curl -s --max-time 30 "https://commons.wikimedia.org/w/api.php?action=query&titles=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$1")&prop=imageinfo&iiprop=url&format=json" \
    | python3 -c 'import sys,json;print(list(json.load(sys.stdin)["query"]["pages"].values())[0]["imageinfo"][0]["url"])'
}

# vid <File title> <out.mp4> <ss> <dur> <height> <crf> [keepaudio]
vid () {
  local u; u="$(commons_url "$1")"
  curl -fsSL -A "usna-edu-download" -o "$TMP/in" "$u"
  local a=(-an)
  [ "${7:-}" = "audio" ] && a=(-c:a aac -b:a 96k)
  ffmpeg -y -loglevel error -ss "$3" -i "$TMP/in" -t "$4" -vf "scale=-2:$5" \
    -c:v libx264 -crf "$6" -preset slow -pix_fmt yuv420p "${a[@]}" -movflags +faststart "$2"
  echo "  built $(basename "$2")"
}

echo "Building Semester Preview media -> $OUT"
# Unit I-a: US Marine sniper, 31st MEU (bullet drop is projectile motion, wind is drag)
vid "File:31st MEU - U S Marines conduct aerial sniper training - B-Roll 8-8 (1011621).webm" "$OUT/sniper-marine.mp4"   3 12 720 24
# Act I-b: Apollo 15 hammer & feather (keep the narration audio)
vid "File:Apollo 15 feather and hammer drop.ogv"                                     "$OUT/apollo15-hammer-feather.mp4"  0 48 480 27 audio
# Unit II-a: sea mine detonation (EOD / mine warfare, impulse and energy)
vid "File:What a sea mine explosion looks like.webm"                                 "$OUT/eod-seamine.mp4"              0 10 720 24
# Act II-b: gravity-assist flyby (NASA Lucy)
vid "File:Lucy Earth Gravity Assist One- Animations (SVS20372 - Lucy EGA Shot6 2160p30).webm" "$OUT/lucy-gravity-assist.mp4" 2 16 720 24
# Act III-a: spinning millisecond pulsar (NASA)
vid "File:Millisecond pulsar and accretion disk - NASA animation (hi-res).ogv"       "$OUT/pulsar-spin.mp4"              6 12 720 24
# Act III-b: Earth from low orbit (ISS)
vid "File:Down the American West Coast.ogv"                                           "$OUT/earth-orbit.mp4"              0 15 720 24
# Act IV-a: SM-2 air-defense missile launch (US Navy, USS Porter)
vid "File:230520-N-NQ285-2004 - USS Porter SM-2 launch Formidable Shield 2023.webm"  "$OUT/ddg-sm2-launch.mp4"           5 10 720 24
# Act IV-b: binary black hole merger (NASA), trimmed to the inspiral + merger
vid "File:Spinning binary black holes merging.webm"                                  "$OUT/bbh-merger.mp4"              33 16 720 24
# Unit I-c: Blue Angels banking turn (US Navy) — circular motion / g-loading
vid "File:Blue Angels US Navy 2025.webm"                                             "$OUT/blueangels-turn.mp4"         85 10 720 24
# Unit II-c: roller coaster — kinetic <-> potential energy
vid "File:Roller coaster vertical loop.ogv"                                          "$OUT/coaster-energy.mp4"           0 11 640 24
# Unit III-c: Marine amphibious assault vehicles swimming ashore (buoyancy)
vid "File:Amphibious Assault Vehicles.ogv"                                           "$OUT/aav-amphibious.mp4"         12 12 720 24
# Unit IV-c: Tacoma Narrows oscillation and collapse, 1940
vid "File:Tacoma Narrows Bridge destruction.ogv"                                     "$OUT/tacoma-oscillation.mp4"      98 20 480 24

# Act IV-b audio: LIGO GW150914 chirp (GWOSC open data)
curl -fsSL -o "$OUT/gw150914-chirp.wav" "https://gwosc.org/GW150914data/GW150914_H1_shifted.wav"
echo "  built gw150914-chirp.wav"
echo "Done."
