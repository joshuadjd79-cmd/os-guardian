import sys
from backend.app.experiments.runner import BenchmarkRunner

print("Running benchmark comparison across all 7 scenarios...")
result = BenchmarkRunner.run_all_benchmarks()
assert len(result.comparisons) == 7, f"Expected 7 comparisons, got {len(result.comparisons)}"

csv_data = BenchmarkRunner.generate_csv_export(result)
assert "Scenario_ID" in csv_data, "CSV export failed header validation"

md_report = BenchmarkRunner.generate_markdown_report(result)
assert "# OS Guardian" in md_report, "Markdown report generation failed"

total_actions = sum(c.adaptive_result.recovery_action_count for c in result.comparisons)
print(f"Verified all 7 benchmark scenarios. Total recovery actions applied across suite: {total_actions}")
print("Verification passed successfully.")
sys.exit(0)
