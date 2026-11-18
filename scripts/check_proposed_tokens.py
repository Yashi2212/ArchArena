"""Check the proposed palette only; this does not certify the current website."""
from pathlib import Path
import json


def luminance(hex_color):
    channels=[int(hex_color[i:i+2],16)/255 for i in (1,3,5)]
    linear=[v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4 for v in channels]
    return sum(v*w for v,w in zip(linear,(0.2126,0.7152,0.0722)))


def contrast(a,b):
    light,dark=sorted((luminance(a),luminance(b)),reverse=True)
    return (light+0.05)/(dark+0.05)


def main():
    assert abs(contrast('#000000','#ffffff')-21)<1e-9
    data=json.loads((Path(__file__).resolve().parents[1]/'docs/ui/proposed-tokens.json').read_text())
    failed=0
    for pair in data['pairs']:
        ratio=contrast(data['colors'][pair['foreground']],data['colors'][pair['background']])
        valid=ratio>=pair['minimum']
        failed+=not valid
        print(f'{"PASS" if valid else "FAIL"} {pair["foreground"]}/{pair["background"]}: {ratio:.2f}:1; target {pair["minimum"]}:1')
    print(f'{len(data["pairs"])} proposal pairs checked; {failed} failed. Runtime UI contrast remains unverified.')
    return 1 if failed else 0


if __name__=='__main__':
    raise SystemExit(main())
