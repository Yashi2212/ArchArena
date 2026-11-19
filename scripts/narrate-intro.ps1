$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
Add-Type -ReferencedAssemblies System.Speech -TypeDefinition @'
using System;
using System.Speech.Synthesis;
public class IntroWord { public double Seconds; public int Position; public int Count; }
public static class IntroNarrator {
 public static IntroWord[] Render(string text, string path) {
  var words = new IntroWord[0];
  using (var speaker = new SpeechSynthesizer()) {
   speaker.SelectVoice("Microsoft Zira Desktop"); speaker.Rate = 2;
   speaker.SpeakProgress += (sender, e) => { Array.Resize(ref words, words.Length+1); words[words.Length-1] = new IntroWord { Seconds=e.AudioPosition.TotalSeconds, Position=e.CharacterPosition, Count=e.CharacterCount }; };
   speaker.SetOutputToWaveFile(path); speaker.Speak(text);
  }
  return words;
 }
}
'@
$projectRoot = Split-Path -Parent $PSScriptRoot
$audioDirectory = Join-Path $projectRoot '.local/intro-video'
New-Item -ItemType Directory -Force -Path $audioDirectory | Out-Null
$chapters = @(
 'Learn is your read-only reference library. Follow HLD from requirements to architecture, and LLD from responsibilities to Java contracts.',
 'Use Companies to study twenty proposed designs. Uber connects location freshness, spatial discovery, exclusive assignment and trip state. Published context is separated from our proposal.',
 'Open Practice to edit a graph and write decisions. Start with scope, workload assumptions, an invariant and one bottleneck prediction.',
 'Keep the same seed, traffic profile and failure setting. Run a baseline, pin it, change one input and rerun. Compare successful throughput, latency and errors.',
 'Inject a bounded outage. Inspect sampled node history and request traces, then export the experiment. This model does not prove payment correctness or exclusive driver assignment.',
 'Use Design Studio to capture requirements, capacity, HLD, API, data model and LLD. Export your browser-local bundle. Practice offers rule-based feedback. AI is disabled.'
)
for ($chapterIndex=0; $chapterIndex -lt $chapters.Count; $chapterIndex++) {
 $words = [IntroNarrator]::Render($chapters[$chapterIndex], (Join-Path $audioDirectory "chapter-$chapterIndex.wav"))
 $words | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $audioDirectory "chapter-$chapterIndex-words.json") -Encoding UTF8
}
Write-Output 'Created six offline synthetic narration chapters.'
