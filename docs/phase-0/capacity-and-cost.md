# Capacity and cost assumptions

## Separate two kinds of capacity

ArchArena hosts a few people. Those people may model a fictional service receiving millions of requests. The hosting server must process bounded simulation events, not replay every fictional production request.

All figures below are planning calculations, not measured throughput or quotes. Currency is USD before tax. Proposed AWS region is Mumbai (`ap-south-1`) for an India-based owner; verify availability, eligibility and region-specific prices before adoption. No AWS console access or deployment occurred in Phase 0.

## Demo hosting envelope

| Input | Calculation | Implication |
|---|---|---|
| 5 sessions, one preview per 10 seconds | 5 × 6 = 30 previews/min | Rate-limit globally as well as per session; a slider must not create unlimited jobs |
| 6 simulation runs/min | 6 / 60 = 0.1 runs/s | At 3 seconds service time, illustrative utilization is 0.3 for one worker |
| 5-second execution hard limit | 0.1 × 5 = 0.5 nominal utilization | A capacity envelope, not a queueing/latency proof; admission bursts still queue |
| One active run, four waiting | Up to five accepted jobs | A fifth waiting job is rejected with retry guidance; worst-case admitted completion can approach 25 seconds plus scheduling overhead |
| p95 execution target 3 seconds | Five × 3 = 15 seconds | A 20-second submission p95 is a target to load-test, not a guarantee inferred by adding percentiles |
| 200,000 events over a 120-second virtual horizon | 200,000 / 120 ≈ 1,667 events/s of virtual time | This is an average budget for a full-horizon run, not a uniform per-second limit; event processing per real second must be benchmarked |

The illustrative utilization uses assumed service time; p95 is not the mean required for Little's Law. Measure mean execution and arrival rate before applying L = λW to real queue sizing. A bounded queue protects the process when arrival bursts violate averages.

### Storage envelope

Assume 30 demo runs/day, 7 days raw retention, 30 nodes, 120 time buckets and 8 float64 series per node. Numeric series alone: `30 × 120 × 8 × 8 = 230,400 bytes/run`. Budget **1 MiB/run** for JSON and metadata, but enforce the encoded output cap and measure actual sizes. Raw retention: 210 MiB. This is not a worst-case guarantee until serialization caps exist.

Add 100 saved designs × 64 KiB ≈6.25 MiB, 900 monthly summaries ×20 KiB ≈17.6 MiB, 3×50 MiB log days =150 MiB, and a 1 GiB rolling backup allowance. Reserve 2 GiB application data plus DB/WAL overhead; provision 20 GB disk as an initial planning envelope and alert well before disk exhaustion. Keep at most seven rolling backups, not an accumulating copy per day. At 10x activity, retention storage grows roughly 10x and log suppression and time-series compression become necessary.

### Practice scenario worksheet

Assumptions, explicitly editable in the future UI:

- Creates: 100,000,000 new URLs/day. Average create QPS = 100,000,000 / 86,400 ≈ **1,157.41/s**.
- Redirect reads:create ratio 10:1. Average reads ≈ **11,574.07/s**.
- Peak factor 3. Peak writes ≈ **3,472.22/s**, peak reads ≈ **34,722.22/s**.
- Record 512 decimal bytes. Raw creates/day = **51.2 GB**; 365 days = **18.688 TB**, excluding indexes, backups, replication and deletion overhead.
- Redirect response 1,024 bytes. Average read egress ≈ **11.85 MB/s**, before TLS/headers. At the peak factor, ≈35.56 MB/s. Read responses/day total 1.024 TB under these assumptions.
- A 95% read-cache hit ratio reduces average read DB traffic to ≈578.70/s; writes remain ≈1,157.41/s. Do not route writes through the same assumed hit ratio.

Model traffic through a declared normalization factor (for example virtual arrivals ×1,000), and scale capacities consistently. Do not multiply measured simulation p99 by that factor: normalization does not establish real-world timing fidelity. A 120-second run with 10,000 arrivals cannot directly replay the full peak workload. The engine must reject unsupported fidelity claims and label sampling/normalization.

## AWS account gate

The user already has an account created after July 15, 2025. That alone does not establish whether it is currently on the Free plan, Paid plan, expired, or has credits remaining. Verify these in **Billing → account plan, Credits and Free Tier**, including exact expiry and service exclusions. Never upgrade the account or activate a paid-only service to make this demo work.

AWS documents a Free plan lasting up to six months or credit exhaustion, whichever happens first, with restricted service access. See [AWS Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/) and [plan selection documentation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html). Account creation, not project deployment, starts the eligibility clock. If it has ended, use the local demo and recording; postponing deployment does not preserve elapsed account time.

## Lean versus full profile

This is a **budget worksheet**, not an AWS Pricing Calculator export. Apart from the linked public IPv4 list rate, rates/allotments below are deliberately labeled assumed planning inputs. Replace them with current `ap-south-1` Calculator estimates and console eligibility before deployment. Do not claim any service is automatically free.

| Concern | Lean portfolio deployment, conditional | Full production reference, not deployed |
|---|---|---|
| Sessions / jobs | 5 / 6 admissions per minute | 100 / 60 admissions per minute |
| Compute | One on-demand 2 vCPU/4 GiB-class EC2 host; validate exact size against free-plan availability; API + worker + container PostgreSQL | Multi-AZ ECS Fargate API and worker pools; autoscale workers by queue age/depth |
| Network | Public subnet, strict security group, no NAT/ALB; owner access through SSM/SSH tunnel where possible; reverse proxy/TLS for any public demo | Two AZs, private tasks, ALB, WAF; explicit NAT and/or endpoints, costed per route |
| Data | Single PostgreSQL container on encrypted disk, backup to S3; optional RDS only after independent budget/eligibility review | RDS Multi-AZ with PITR, ElastiCache, tested restore |
| Messaging / objects | SQS + DLQ and private S3 only if allowed; LocalStack locally | Managed SQS + DLQ and S3 lifecycle rules |
| Identity | Owner-only access first; Cognito for hosted sign-in only if eligible | Cognito/OIDC and per-user authorization |
| Frontend | React static build; local server or eligible S3/CloudFront arrangement, API SSE behavior tested | CloudFront plus private origin arrangement and separately secured API |
| Operations | 60 host-hours/month, auto stop, 3-day logs, scheduled teardown | 730-hour month, alerting, backups and HA |
| Incremental cash target | $0 only with valid coverage or no AWS deployment | Outside $0 constraint; planning placeholder $400/month |

### Lean worksheet

| Item | Planning input | Gross monthly estimate | How to verify before use |
|---|---|---:|---|
| EC2 | Assumed $0.04/hour ×60 hours | $2.40 | [EC2 pricing](https://aws.amazon.com/ec2/pricing/on-demand/), exact instance/architecture/region, allowed plan and credits |
| Public IPv4 | $0.005/hour ×60 hours, one in-use address | $0.30 | [VPC pricing](https://aws.amazon.com/vpc/pricing/), billed allocations and current coverage; release idle Elastic IPs |
| EBS | Assumed 20 GB ×$0.10/GB-month | $2.00 | [EBS pricing](https://aws.amazon.com/ebs/pricing/), volume type, snapshots and provisioned IOPS; stopping EC2 does not remove disk charges |
| S3, SQS/DLQ, CloudFront, Cognito, logs, backup/transfer | Combined placeholder; not a service quote or guaranteed allowance | $2.00 | Check each service's pricing and console Free Tier usage; replace aggregate with per-service calculator rows |
| Total | 60-hour demo schedule | **$6.70 gross/month** | Expected credits consumed ≈$6.70 only if all usage qualifies and no allowance offsets it |

At 730 hours, the same compute/IPv4/disk/other assumptions total **$36.85/month**, before variable usage and taxes. A stopped host still incurs storage and retained-resource charges. A $1 budget alert does not cap charges or guarantee timely notification.

If eligible credits remaining are C dollars and there are M months left, the credit runway estimate is `min(C / 6.70, M)` months for the scheduled scenario. C and M are unknown. Never assume the maximum advertised credits were earned or are still available. Net cash is conditionally zero only when the account plan and all coverage are verified; otherwise do not deploy under the user's $0 rule.

### Full monthly worksheet

Illustrative budget allocations, **not current regional quotes**: Fargate API/workers $90; ALB $25; WAF $10; RDS Multi-AZ $110; Redis $30; two-AZ NAT $70; selected endpoints $20; S3/SQS $5; CDN/transfer $15; logs/metrics $15; secret storage $5; backups $5. Total **$400/month**. Each must be recomputed from hours, task CPU/RAM, requests, LCUs, GB and data paths in the Calculator. This allocation does not prove those resources can meet the goals. Do not deploy it or count it as a free-tier design. At 10x, worker CPU, DB connection budgets, LLM quotas and egress need independent sizing, not a blind 10x bill multiplier.

### Per-service verification and traps

| Service | Billing exposure / confirmation | Lean choice |
|---|---|---|
| NAT gateway | Hourly and data processing; [VPC pricing](https://aws.amazon.com/vpc/pricing/) | Excluded |
| ALB | Hourly and capacity units; [ELB pricing](https://aws.amazon.com/elasticloadbalancing/pricing/) | Excluded |
| WAF | ACL/rule/request charges; [WAF pricing](https://aws.amazon.com/waf/pricing/) | Excluded; app limits still required |
| EKS | Cluster control-plane cost plus compute; [EKS pricing](https://aws.amazon.com/eks/pricing/) | Excluded; over-engineering for this demo |
| RDS Multi-AZ | Instance hours, storage and backup; [RDS pricing](https://aws.amazon.com/rds/postgresql/pricing/) | Excluded; single-AZ RDS optional only after repricing |
| ElastiCache | Node/serverless usage and data; [ElastiCache pricing](https://aws.amazon.com/elasticache/pricing/) | Excluded; Redis interface optional |
| Secrets Manager | Secret storage and API calls; [pricing](https://aws.amazon.com/secrets-manager/pricing/) | Prefer eligible standard SSM parameters; check [SSM pricing](https://aws.amazon.com/systems-manager/pricing/) and KMS charges |
| SQS and DLQ | API requests, payload size and retries; [SQS pricing](https://aws.amazon.com/sqs/pricing/) | Cap jobs/retries; verify account allowance |
| S3 | Stored bytes, requests, transitions and transfer; [S3 pricing](https://aws.amazon.com/s3/pricing/) | Private bucket, bounded retention, no gratuitous lifecycle transitions |
| Cognito | Active-user/features tier; [pricing](https://aws.amazon.com/cognito/pricing/) | Owner-only hosted identity if eligible |
| CloudFront | Transfer/request or plan-specific terms; [pricing](https://aws.amazon.com/cloudfront/pricing/) | Optional; verify origin privacy and eligible plan |
| CloudWatch | Ingestion, retention, queries, metrics and alarms; [pricing](https://aws.amazon.com/cloudwatch/pricing/) | Short retention, low volume; confirm actual free usage |
| Public IPv4, EBS, snapshots, transfer | Allocated/idle resources and inter-AZ/Internet bytes | Inventory after stop and teardown; verify zero residual resources |
| LLM provider | Free quotas/availability may change; external data handling | No paid fallback; deterministic feedback if no free capacity |

Before provisioning **any** service, open its current official pricing page, confirm its allowance and Free-plan access in this account, and save a dated Calculator estimate. Do not infer eligibility from a historical “always free” label. LocalStack emulation does not establish AWS compatibility or cloud cost. This worksheet intentionally leaves eligibility open rather than claiming an unverified $0 deployment.
