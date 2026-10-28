from fastapi import APIRouter
from ..schemas.simulation import SimulationConfig, SimulationSnapshot
from ..core.state import simulation_manager

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("", response_model=SimulationConfig)
async def get_config():
    return simulation_manager.config


@router.put("", response_model=SimulationSnapshot)
async def update_config(new_config: SimulationConfig):
    async with simulation_manager.lock:
        simulation_manager.config = new_config
        simulation_manager.engine.config = new_config
        simulation_manager.engine.detector.config = new_config
        simulation_manager.engine.recovery_engine.config = new_config
        simulation_manager.engine.recovery_engine.evaluator.config = new_config
        await simulation_manager.broadcast_snapshot()
        return simulation_manager.engine.get_snapshot()
