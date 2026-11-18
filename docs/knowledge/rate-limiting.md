---
id: rate-limiting
status: draft
verified: no
verified_by: pending
verified_date: pending
sources: [SDI1]
model_parameters: [rate, burst]
---

# Rate limiting notes

## What it is plain

- [RL-01] A token-bucket policy has a refill rate and a bounded token capacity. Source: SDI1, PDF page 72.

## Why it exists

The learning task is to decide how much work to admit while making the effects of admission visible. A rejected request is still a user outcome; reducing backend failures does not mean every user was served.

## How it works

Original teaching sketch: a telescope station issues entry counters from a small dispenser. A visitor needs a counter; the dispenser restores counters over time up to its limit. It can allow a short crowd through without permitting unlimited entry. This is an original analogy with no copied book example or diagram.

## Rules of thumb and numbers

Assumption: choose a small refill rate and a separate burst allowance for a visible experiment. These values are lesson settings, not claims about a vendor API or an optimal protection threshold.

## Trade-offs

- [RL-02] Admission consumes available tokens; a request without the required token is not admitted under that policy. Source: SDI1, PDF page 73.

## Failure modes

Product discussion: a very restrictive setting can protect modeled downstream work while rejecting many users. Per-user fairness and distributed quota agreement require separate design decisions; the current token model does not establish them.

## Misconceptions

A policy rejection is not the same event as a service exception or deadline failure. Read those counts separately in the whole-run result rather than celebrating a low service-error count alone.

## Interview questions

What is the difference between refill rate and burst capacity? Explain a short arrival burst and a long sustained arrival stream, labeling all numerical examples as assumptions.

## How ArchArena models it

Implementation source: `DiscreteEventEngine.java`. `rate` replenishes tokens by elapsed virtual time and `burst` caps the bucket. Requests that lack a token increment policy rejection, separately from service errors. This model is not a distributed rate-limit service, identity-based fairness policy or production quota implementation.

## Sources

SDI1, Alex Xu, *System Design Interview: An Insider's Guide*, inspected PDF pages 72–73. See [source register](sources.md). Original analogy and assumed experiment settings; no quotation or vendor behavior copied into the curriculum.

## Verified by me

No. Awaiting the owner's claim and expression review. Date: pending. Not publishable.
