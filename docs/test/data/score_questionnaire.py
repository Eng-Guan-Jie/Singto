"""Score SUS and TAM responses exported from Google Forms.

Usage: python3 score_questionnaire.py responses.csv

The CSV needs the columns: code, SUS1..SUS10, PU1..PU3, PEOU1..PEOU3, BI1, BI2
(rename the Google Forms column headers to these before running).
Each answer is 1-5. Prints per-user scores and a summary as markdown tables.
"""
import csv
import statistics
import sys

SUS = [f"SUS{i}" for i in range(1, 11)]
CONSTRUCTS = {
    "PU": ["PU1", "PU2", "PU3"],
    "PEOU": ["PEOU1", "PEOU2", "PEOU3"],
    "BI": ["BI1", "BI2"],
}


def sus_score(row):
    total = 0
    for i, col in enumerate(SUS, start=1):
        answer = int(row[col])
        total += (answer - 1) if i % 2 == 1 else (5 - answer)
    return total * 2.5


def summary(name, values):
    sd = statistics.stdev(values) if len(values) > 1 else 0.0
    return (f"| {name} | {len(values)} | {statistics.mean(values):.2f} | "
            f"{statistics.median(values):.2f} | {sd:.2f} | "
            f"{min(values):.2f} | {max(values):.2f} |")


def main(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    results = []
    for row in rows:
        scores = {"code": row["code"].strip(), "SUS": sus_score(row)}
        for name, cols in CONSTRUCTS.items():
            scores[name] = statistics.mean(int(row[c]) for c in cols)
        results.append(scores)
    results.sort(key=lambda r: r["code"])

    print("| User | SUS | PU | PEOU | BI |")
    print("|---|---|---|---|---|")
    for r in results:
        print(f"| {r['code']} | {r['SUS']:.1f} | {r['PU']:.2f} | "
              f"{r['PEOU']:.2f} | {r['BI']:.2f} |")

    print()
    print("| Measure | n | Mean | Median | SD | Min | Max |")
    print("|---|---|---|---|---|---|---|")
    print(summary("SUS", [r["SUS"] for r in results]))
    for name in CONSTRUCTS:
        label = name if name == "BI" else f"TAM {name}"
        print(summary(label, [r[name] for r in results]))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
