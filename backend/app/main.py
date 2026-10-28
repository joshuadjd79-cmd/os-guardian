from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import (
    simulation_router,
    processes_router,
    recovery_router,
    experiments_router,
    config_router,
    ws_router
)

app = FastAPI(
    title="OS Guardian Backend",
    description="Explainable, Self-Healing Operating System Simulator API",
    version="1.0.0"
)

# Enable CORS for local, mobile LAN, and tunnel clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(simulation_router)
app.include_router(processes_router)
app.include_router(recovery_router)
app.include_router(experiments_router)
app.include_router(config_router)
app.include_router(ws_router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "OS Guardian Simulator API",
        "version": "1.0.0",
        "safety_boundary": "All process execution, resource allocations, and recovery actions are simulated in-memory. No real operating system resources or processes are modified.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
