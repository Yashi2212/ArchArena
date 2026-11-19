"""Rebuild the original ArchArena tutorial. Requires Pillow and isolated imageio-ffmpeg.
No external artwork, recordings, book excerpts or paid services are used.
Run narrate-intro.ps1 first to generate six offline synthetic speech WAVs.
"""
from pathlib import Path
import json, subprocess, sys, textwrap, wave
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tools/video-libs'))
import imageio_ffmpeg
ENCODER = imageio_ffmpeg.get_ffmpeg_exe()
OUT = ROOT / 'frontend/public/media'
WORK = ROOT / '.local/intro-video'
OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)
FONT = Path('C:/Windows/Fonts/arial.ttf')
BOLD = Path('C:/Windows/Fonts/arialbd.ttf')
def font(size, bold=False): return ImageFont.truetype(str(BOLD if bold else FONT),size)
chapters = [
 ('Find your route', 'LEARN / READ-ONLY REFERENCE', 'Follow HLD from requirements to architecture. Follow LLD from responsibilities to Java contracts.', ['Requirements','Architecture','Contracts'], 'Learn is your read-only reference library. Follow HLD from requirements to architecture, and LLD from responsibilities to Java contracts.'),
 ('Study a company', '20 ORIGINAL REFERENCE DESIGNS', 'Uber: location freshness, spatial discovery, exclusive assignment and authoritative trip state.', ['Fresh location','Candidates','Assignment'], 'Use Companies to study twenty proposed designs. Uber connects location freshness, spatial discovery, exclusive assignment and trip state. Published context is separated from our proposal.'),
 ('Build a hypothesis', 'PRACTICE / EDITABLE PLAYGROUND', 'State scope, assumptions and an invariant. Draw your request path. Predict one bottleneck.', ['Scope','Draw a graph','Predict'], 'Open Practice to edit a graph and write decisions. Start with scope, workload assumptions, an invariant and one bottleneck prediction.'),
 ('Run a controlled experiment', 'SAME SEED / ONE CHANGE', 'Run a baseline. Pin it. Change one input. Rerun with the same seed, profile and failure setting.', ['Baseline','One change','Compare'], 'Keep the same seed, traffic profile and failure setting. Run a baseline, pin it, change one input and rerun. Compare successful throughput, latency and errors.'),
 ('Inspect failure and replay', 'BOUNDED MODEL / HONEST LIMITS', 'Inject an outage. Inspect sampled history and request traces. Export the experiment as Markdown.', ['Inject failure','Inspect replay','Export'], 'Inject a bounded outage. Inspect sampled node history and request traces, then export the experiment. This model does not prove payment correctness or exclusive driver assignment.'),
 ('Capture your design', 'DESIGN STUDIO / SIX ARTIFACTS', 'Requirements, capacity, HLD, API, data model and LLD. Export your browser-local design bundle.', ['Requirements','HLD + API','Data + LLD'], 'Use Design Studio to capture requirements, capacity, HLD, API, data model and LLD. Export your browser-local bundle. Practice offers rule-based feedback. AI is disabled.'),
]

def draw_frame(chapter, local):
 title,kicker,description,steps,_=chapters[chapter]
 im=Image.new('RGB',(1280,720),'#101411');d=ImageDraw.Draw(im)
 d.text((64,36),'ARCHARENA',font=font(24,True),fill='#65dfce')
 d.text((1015,40),f'FIELD GUIDE  {chapter+1}/6',font=font(16),fill='#bdc8bb')
 d.line((64,88,1216,88),fill='#465349',width=2)
 d.text((64,121),kicker,font=font(17,True),fill='#a5e2a1')
 d.text((64,160),title,font=font(44,True),fill='#f3f0e3')
 for j,line in enumerate(textwrap.wrap(description,width=76)):
  d.text((64,232+j*34),line,font=font(25),fill='#bdc8bb')
 for j,step in enumerate(steps):
  x=64+j*392;active=int(local//4)==j
  d.rounded_rectangle((x,377,x+352,483),radius=12,fill='#253b31' if active else '#1b221d',outline='#65dfce' if active else '#465349',width=2)
  d.text((x+20,391),f'0{j+1}',font=font(16),fill='#65dfce')
  d.text((x+20,426),step,font=font(24,True),fill='#f3f0e3')
  if j<2:
   d.line((x+354,429,x+388,429),fill='#829584',width=3)
   dot=x+356+(local%2)/2*29
   d.ellipse((dot-4,425,dot+4,433),fill='#65dfce')
 d.text((64,525),'Illustrated workflow, not live telemetry. No company blueprint or correctness guarantee.',font=font(17),fill='#f5c86a')
 d.text((64,567),'Original illustrations | Offline synthetic narration | English captions',font=font(16),fill='#bdc8bb')
 d.rectangle((64,650,1216,655),fill='#465349')
 d.rectangle((64,650,64+1152*(chapter*12+local)/72,655),fill='#65dfce')
 d.text((64,674),'LEARN   >   PRACTICE   >   DESIGN STUDIO',font=font(15),fill='#bdc8bb')
 return im

if '--captions-only' not in sys.argv:
 video=WORK/'silent.mp4'
 pipe=subprocess.Popen([ENCODER,'-y','-f','rawvideo','-vcodec','rawvideo','-s','1280x720','-pix_fmt','rgb24','-r','12','-i','-','-an','-vcodec','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p',str(video)],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
 for frame in range(72*12):pipe.stdin.write(draw_frame(frame//144,(frame%144)/12).tobytes())
 pipe.stdin.close()
 if pipe.wait()!=0:raise RuntimeError('Video encoding failed')
 draw_frame(0,1).save(OUT/'archarena-intro-poster.jpg',quality=90)
 audio_args=[]
 for i in range(6):audio_args+=['-i',str(WORK/f'chapter-{i}.wav')]
 filters=';'.join(f'[{i}:a]apad,atrim=duration=12,asetpts=PTS-STARTPTS[a{i}]' for i in range(6))+';'+''.join(f'[a{i}]' for i in range(6))+'concat=n=6:v=0:a=1[out]'
 subprocess.run([ENCODER,'-y',*audio_args,'-filter_complex',filters,'-map','[out]','-c:a','aac','-b:a','96k',str(WORK/'narration.m4a')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 subprocess.run([ENCODER,'-y','-i',str(video),'-i',str(WORK/'narration.m4a'),'-map','0:v','-map','1:a','-c','copy','-movflags','+faststart','-shortest',str(OUT/'archarena-intro.mp4')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def timestamp(seconds):
 millis=round(seconds*1000)
 return f'{millis//3600000:02}:{millis//60000%60:02}:{millis//1000%60:02}.{millis%1000:03}'
captions=['WEBVTT','']
transcript=['# ArchArena introduction','', 'Original animation and offline synthetic narration. Duration: 72 seconds.','']
for i,(title,_,_,_,speech) in enumerate(chapters):
 # Use speech boundaries, not the chapter's silent padding. At a non-default voice
 # rate, System.Speech progress clocks can differ from WAV time; normalize the clock.
 marks=json.loads((WORK/f'chapter-{i}-words.json').read_text(encoding='utf-8-sig'))
 with wave.open(str(WORK/f'chapter-{i}.wav')) as wav:duration=wav.getnframes()/wav.getframerate()
 clock_scale=duration/max(duration,marks[-1]['Seconds']+0.35)
 for j in range(3):
  start=marks[j*len(marks)//3];end=marks[(j+1)*len(marks)//3] if j<2 else None
  text_end=end['Position'] if end else len(speech)
  captions += [f"{timestamp(i*12+start['Seconds']*clock_scale)} --> {timestamp(i*12+(end['Seconds']*clock_scale if end else duration))}",speech[start['Position']:text_end].strip(),'']
 transcript += [f'## {i*12//60:02}:{i*12%60:02} {title}', '',speech,'']
(OUT/'archarena-intro.vtt').write_text('\n'.join(captions),encoding='utf-8')
(OUT/'archarena-intro-transcript.md').write_text('\n'.join(transcript),encoding='utf-8')
print(json.dumps({'video':str(OUT/'archarena-intro.mp4'),'bytes':(OUT/'archarena-intro.mp4').stat().st_size,'seconds':72,'frames':864,'fps':12,'narration':'Microsoft Zira offline synthetic voice'}))
