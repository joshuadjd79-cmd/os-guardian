from .routes_simulation import router as simulation_router
from .routes_processes import router as processes_router
from .routes_recovery import router as recovery_router
from .routes_experiments import router as experiments_router
from .routes_config import router as config_router
from .websocket import router as ws_router

__all__ = [
    "simulation_router",
    "processes_router",
    "recovery_router",
    "experiments_router",
    "config_router",
    "ws_router",
]
