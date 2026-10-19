#!/usr/bin/env python3
"""Best-effort offline voice pack. Public school word data only; no user data, no API keys."""
import asyncio, json, os, sys
from pathlib import Path
import edge_tts

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'_audio_cache'
OUT.mkdir(parents=True,exist_ok=True)
VOICE='nl-BE-DenaNeural'
CONCURRENCY=int(os.getenv('VOICE_CONCURRENCY','5'))

async def main():
    entries=json.loads((OUT/'inputs.json').read_text(encoding='utf-8'))
    jobs=[(entry['id']+'-'+kind+'.mp3',entry[kind]) for entry in entries for kind in ('word','example')]
    semaphore=asyncio.Semaphore(CONCURRENCY)
    failed=[]
    async def generate(filename,text):
        target=OUT/filename
        if target.exists() and target.stat().st_size>1200:return
        async with semaphore:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text,VOICE).save(str(target))
                    if target.stat().st_size>1200:return
                except Exception as exc:
                    if target.exists():target.unlink()
                    if attempt==2:failed.append((filename,str(exc)[:100]))
                    await asyncio.sleep((attempt+1)*1.5)
    await asyncio.gather(*(generate(name,text) for name,text in jobs))
    available=[filename for filename,_ in jobs if (OUT/filename).exists() and (OUT/filename).stat().st_size>1200]
    (OUT/'manifest.json').write_text(json.dumps({'voice':VOICE,'files':available},ensure_ascii=False),encoding='utf-8')
    print('Flemish recordings ready:',len(available),'/',len(jobs))
    for name,error in failed[:10]:print('Voice generation failed:',name,error)
    # Fallback to device voice for unsuccessful clips: never prevent publishing.
if __name__=='__main__':asyncio.run(main())
