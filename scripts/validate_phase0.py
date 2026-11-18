"""Validate Phase 0 planning arithmetic and document integrity, not application behavior."""

import json
import math
from pathlib import Path
import re
import sys


def main():
    root = Path(__file__).resolve().parents[1]
    config = json.loads((root / "docs/phase-0/planning.json").read_text(encoding="utf-8"))
    failures = []
    checks = []

    def check(condition, label):
        (checks if condition else failures).append(label)

    check(config["phase"] == 0, "Phase remains 0")
    total = config["hoursPerWeek"] * config["weeks"]
    check(total == config["plannedDeliveryHours"] + config["contingencyHours"], "Delivery and contingency fit the weekly time budget")
    check(config["contingencyHours"] >= total * 0.10, "At least 10 percent contingency reserved")
    check(config["executionP95SecondsTarget"] < config["executionHardLimitSeconds"], "Execution p95 target is below hard timeout")
    nominal_utilization = (config["simulationAdmissionsPerMinute"] / 60 * config["executionHardLimitSeconds"] / config["workerConcurrency"])
    check(nominal_utilization < 1, "Nominal admission envelope is below worker service bound; this is not a latency proof")
    check(config["maxEdges"] >= config["maxNodes"] - 1, "Graph edge allowance permits a connected graph")
    check(config["maxEvents"] > config["maxArrivals"], "Processed-event budget exceeds arrival budget")

    qps = config["practiceNewUrlsPerDay"] / 86400
    peak_reads = qps * config["practiceReadWriteRatio"] * config["practicePeakFactor"]
    storage_gb = config["practiceNewUrlsPerDay"] * config["practiceRecordBytes"] / 1e9
    check(math.isclose(qps, 1157.4074074074074), "100M creates/day converts to 1157.4074 creates/s")
    check(math.isclose(peak_reads, 34722.22222222222), "10:1 reads and 3x peak convert to 34722.2222 reads/s")
    check(math.isclose(storage_gb, 51.2), "Raw daily storage is 51.2 decimal GB")

    hourly = config["leanPlanningComputeUSDPerHour"] + config["leanPlanningIPv4USDPerHour"]
    fixed = config["leanPlanningDiskGB"] * config["leanPlanningDiskUSDPerGBMonth"] + config["leanPlanningOtherUSDPerMonth"]
    lean = config["leanPlanningHoursPerMonth"] * hourly + fixed
    continuous = 730 * hourly + fixed
    check(math.isclose(lean, 6.70), "Illustrative scheduled gross cost is USD 6.70/month")
    check(math.isclose(continuous, 36.85), "Illustrative 730-hour gross cost is USD 36.85/month")
    check(config["newMonthlySpendTargetUSD"] == 0, "New monthly cash spend target remains zero")

    for name in config["requiredDocs"]:
        path = root / name
        check(path.is_file() and bool(path.read_text(encoding="utf-8").strip()), "Required document: " + name)

    issues = (root / "ISSUES.md").read_text(encoding="utf-8")
    ids = re.findall(r"^\| (R\d{2})\b", issues, re.MULTILINE)
    check(len(ids) == 10 and len(set(ids)) == 10, "Ten distinct top-level product risks documented")

    for source in root.rglob("*.md"):
        text = source.read_text(encoding="utf-8")
        for target in re.findall(r"(?<!!)\[[^\]]+\]\(([^)]+)\)", text):
            if re.match(r"https?://|mailto:|#", target):
                continue
            local = target.split("#", 1)[0]
            check((source.parent / local).exists(), "Local link: " + str(source.relative_to(root)) + " -> " + local)

    for label in checks:
        print("PASS " + label)
    for label in failures:
        print("FAIL " + label)
    print(f"\n{len(checks)} planning checks passed; {len(failures)} failed.")
    print(f"Budget: {total} hours. Nominal hard-limit utilization envelope: {nominal_utilization:.2f}.")
    print("No application, simulator, browser, AI, authorization or cloud-cost behavior has been tested.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
