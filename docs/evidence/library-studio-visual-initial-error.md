# Initial visual follow-up failure

The 1024px Practice capture began before its async analytic preview settled. Page height changed from 5339 to 5398 during screenshot stabilization. The final actual image and baseline have exactly identical pixels: difference bounding box None.

Fix: explicitly wait for the visible database-demand analytic result before screenshot capture. No timeout, pixel tolerance, baseline or application behavior was changed for this correction. Final comparison rerun is recorded separately.



```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 10000ms
  Failed to take two consecutive stable screenshots.

  Snapshot: practice-foundations.png

Call log:
  - Expect "toHaveScreenshot(practice-foundations.png)" with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1024px by 5398px, received 1024px by 5339px. 57955 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1024px by 5339px, received 1024px by 5398px. 57955 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - Timeout 10000ms exceeded.

```



## 390px follow-up



```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 10000ms
  Failed to take two consecutive stable screenshots.

  Snapshot: practice-foundations.png

Call log:
  - Expect "toHaveScreenshot(practice-foundations.png)" with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 390px by 7953px, received 390px by 7873px. 47623 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 390px by 7873px, received 390px by 7953px. 47623 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - Timeout 10000ms exceeded.

```


The same pre-readiness capture instability appears in the worker loaded before the test correction.
