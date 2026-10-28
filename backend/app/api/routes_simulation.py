from fastapi import APIRouter
from ..schemas.simulation import SimulationSnapshot, SimulationConfig
from ..core.state import simulation_manager

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


@router.get("/state", response_model=SimulationSnapshot)
async def get_simulation_state():
    return simulation_manager.engine.get_snapshot()


@router.post("/start", response_model=SimulationSnapshot)
async def start_simulation():
    snapshot = await simulation_manager.start()
    return snapshot


@router.post("/pause", response_model=SimulationSnapshot)
async def pause_simulation():
    snapshot = await simulation_manager.pause()
    return snapshot


@router.post("/resume", response_model=SimulationSnapshot)
async def resume_simulation():
    snapshot = await simulation_manager.resume()
    return snapshot


@router.post("/step", response_model=SimulationSnapshot)
async def step_simulation():
    snapshot = await simulation_manager.step()
    return snapshot


@router.post("/reset", response_model=SimulationSnapshot)
async def reset_simulation(config: SimulationConfig = None):
    snapshot = await simulation_manager.reset(config)
    return snapshot
