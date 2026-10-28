from typing import List, Optional
from fastapi import APIRouter, HTTPException
from ..schemas.process import ProcessCreate, ProcessModel
from ..schemas.simulation import SimulationSnapshot
from ..schemas.experiment import WorkloadType
from ..experiments.workloads import get_workload
from ..core.state import simulation_manager

router = APIRouter(prefix="/api/processes", tags=["processes"])


@router.get("", response_model=List[ProcessModel])
async def list_processes():
    return [p.to_model() for p in simulation_manager.engine.all_processes]


@router.get("/{pid}", response_model=ProcessModel)
async def get_process(pid: int):
    for p in simulation_manager.engine.all_processes:
        if p.pid == pid:
            return p.to_model()
    raise HTTPException(status_code=404, detail=f"Process with PID {pid} not found")


@router.post("/workload/{workload_type}", response_model=SimulationSnapshot)
async def load_predefined_workload(workload_type: WorkloadType):
    processes = get_workload(workload_type)
    async with simulation_manager.lock:
        simulation_manager.engine.load_workload(processes)
        await simulation_manager.broadcast_snapshot()
        return simulation_manager.engine.get_snapshot()


@router.post("/custom", response_model=SimulationSnapshot)
async def load_custom_workload(processes: List[ProcessCreate]):
    if not processes:
        raise HTTPException(status_code=400, detail="Custom workload must contain at least 1 process")
    
    seen_pids = set()
    for p in processes:
        if p.pid in seen_pids:
            raise HTTPException(status_code=400, detail=f"Duplicate PID {p.pid} in workload")
        seen_pids.add(p.pid)

    async with simulation_manager.lock:
        simulation_manager.engine.load_workload(processes)
        await simulation_manager.broadcast_snapshot()
        return simulation_manager.engine.get_snapshot()
