import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve('src/styles/tokens.css'), 'utf8');
const colors = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[\da-fA-F]{6})/g)].map(match => [match[1],match[2]]));
function luminance(color: string) {
  const channels=[1,3,5].map(index => parseInt(color.slice(index,index+2),16)/255);
  return channels.map(value => value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[0.2126,0.7152,0.0722][index],0);
}
function contrast(a:string,b:string) {
  const [dark,light]=[luminance(a),luminance(b)].sort((x,y)=>x-y);
  return (light+0.05)/(dark+0.05);
}
const surfaces=['bg','sidebar','panel','raised','canvas'];
const informative=['text','muted','traffic','healthy','strain','failure'];
const textPairs=surfaces.flatMap(background=>informative.map(foreground=>[foreground,background]));

describe('actual Expedition Console token contrast',()=>{
  it('uses the standard luminance calculation with independent known values',()=>{
    expect(contrast('#000000','#ffffff')).toBeCloseTo(21,9);
    expect(contrast('#777777','#ffffff')).toBeCloseTo(4.478,2);
  });
  it.each(textPairs)('%s text on %s meets 4.5:1', (foreground,background)=>{
    expect(contrast(colors[foreground],colors[background])).toBeGreaterThanOrEqual(4.5);
  });
  it.each(surfaces)('meaningful boundary and focus on %s meet 3:1',background=>{
    expect(contrast(colors.line,colors[background])).toBeGreaterThanOrEqual(3);
    expect(contrast(colors.focus,colors[background])).toBeGreaterThanOrEqual(3);
  });
  it.each(['traffic','healthy','focus'])('dark text on filled %s meets 4.5:1',background=>{
    expect(contrast(colors['on-accent'],colors[background])).toBeGreaterThanOrEqual(4.5);
  });
  it.each([['healthy','healthy-surface'],['failure','failure-surface'],['strain','strain-surface']])('%s alert wording meets 4.5:1', (foreground,background)=>{
    expect(contrast(colors[foreground],colors[background])).toBeGreaterThanOrEqual(4.5);
  });
  it('keeps informative font sizes at least 14px',()=>{
    const sizes=[...css.matchAll(/--text-[\w-]+:\s*(\d+)px/g)].map(match=>Number(match[1]));
    expect(sizes.length).toBeGreaterThan(3);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(14);
  });
  it('does not leave hard-coded theme colors outside the token source',()=>{
    const layout=readFileSync(resolve('src/styles/workbench.css'),'utf8');
    expect(layout).not.toMatch(/#[\da-fA-F]{3,8}\b/);
  });
});

describe('self-hosted font assets',()=>{
  it.each(['sora-latin-wght-normal.woff2','ibm-plex-mono-latin-400-normal.woff2'])('%s is a real WOFF2 asset',filename=>{
    const bytes=readFileSync(resolve(`src/assets/fonts/${filename}`));
    expect(bytes.subarray(0,4).toString()).toBe('wOF2');
    expect(bytes.length).toBeGreaterThan(1000);
  });
  it.each(['sora-OFL.txt','ibm-plex-mono-OFL.txt'])('distributes the original license %s',filename=>{
    expect(readFileSync(resolve(`public/licenses/${filename}`),'utf8')).toContain('SIL OPEN FONT LICENSE');
  });
  it('uses local font URLs without a runtime CDN',()=>{
    const fonts=readFileSync(resolve('src/styles/fonts.css'),'utf8');
    expect(fonts).not.toMatch(/https?:\/\//);
    expect(fonts.match(/src: url\('\.\.\/assets\/fonts\//g)).toHaveLength(2);
  });
});
