from fastapi import APIRouter, Response
from ..schemas.experiment import ExperimentResult
from ..experiments.runner import BenchmarkRunner

router = APIRouter(prefix="/api/experiments", tags=["experiments"])

# Cache latest benchmark result in memory
_last_benchmark_result: ExperimentResult = None


@router.post("/run", response_model=ExperimentResult)
async def run_benchmarks():
    global _last_benchmark_result
    _last_benchmark_result = BenchmarkRunner.run_all_benchmarks()
    return _last_benchmark_result


@router.get("/latest", response_model=ExperimentResult)
async def get_latest_benchmark():
    global _last_benchmark_result
    if _last_benchmark_result is None:
        _last_benchmark_result = BenchmarkRunner.run_all_benchmarks()
    return _last_benchmark_result


@router.get("/export/csv")
async def export_benchmarks_csv():
    global _last_benchmark_result
    if _last_benchmark_result is None:
        _last_benchmark_result = BenchmarkRunner.run_all_benchmarks()
    csv_data = BenchmarkRunner.generate_csv_export(_last_benchmark_result)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=os_guardian_benchmarks.csv"}
    )


@router.get("/export/json")
async def export_benchmarks_json():
    global _last_benchmark_result
    if _last_benchmark_result is None:
        _last_benchmark_result = BenchmarkRunner.run_all_benchmarks()
    return _last_benchmark_result


@router.get("/export/report")
async def export_markdown_report():
    global _last_benchmark_result
    if _last_benchmark_result is None:
        _last_benchmark_result = BenchmarkRunner.run_all_benchmarks()
    md_report = BenchmarkRunner.generate_markdown_report(_last_benchmark_result)
    return Response(
        content=md_report,
        media_type="text/markdown",
        headers={"Content-Disposition": "attachment; filename=OS_GUARDIAN_BENCHMARK_REPORT.md"}
    )
