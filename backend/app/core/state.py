import asyncio
from typing import List, Optional, Set
from fastapi import WebSocket
from ..schemas.simulation import SimulationConfig, SimulationStatus, SimulationSnapshot
from ..simulation.engine import SimulationEngine
from ..experiments.workloads import get_workload, WorkloadType


class GlobalSimulationManager:
    """Singleton simulation manager coordinating background execution and WebSocket broadcasting."""

    def __init__(self):
        self.config: SimulationConfig = SimulationConfig()
        self.engine: SimulationEngine = SimulationEngine(self.config)
        self.lock = asyncio.Lock()
        self.active_websockets: Set[WebSocket] = set()
        self._playback_task: Optional[asyncio.Task] = None
        
        # Load balanced workload initially by default
        initial_workload = get_workload(WorkloadType.BALANCED)
        self.engine.load_workload(initial_workload)

    async def connect_ws(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_websockets.add(websocket)
        # Send initial snapshot
        snapshot = self.engine.get_snapshot()
        await websocket.send_json(snapshot.model_dump())

    def disconnect_ws(self, websocket: WebSocket) -> None:
        self.active_websockets.discard(websocket)

    async def broadcast_snapshot(self) -> None:
        if not self.active_websockets:
            return
        snapshot = self.engine.get_snapshot()
        payload = snapshot.model_dump()
        dead = []
        for ws in self.active_websockets:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active_websockets.discard(ws)

    async def start(self) -> SimulationSnapshot:
        async with self.lock:
            self.engine.status = SimulationStatus.RUNNING
            if self._playback_task is None or self._playback_task.done():
                self._playback_task = asyncio.create_task(self._continuous_loop())
            return self.engine.get_snapshot()

    async def pause(self) -> SimulationSnapshot:
        async with self.lock:
            self.engine.status = SimulationStatus.PAUSED
            if self._playback_task and not self._playback_task.done():
                self._playback_task.cancel()
                self._playback_task = None
            return self.engine.get_snapshot()

    async def resume(self) -> SimulationSnapshot:
        return await self.start()

    async def step(self) -> SimulationSnapshot:
        async with self.lock:
            if self.engine.status == SimulationStatus.RUNNING:
                self.engine.status = SimulationStatus.PAUSED
                if self._playback_task and not self._playback_task.done():
                    self._playback_task.cancel()
                    self._playback_task = None

            snapshot = self.engine.step()
            await self.broadcast_snapshot()
            return snapshot

    async def reset(self, new_config: Optional[SimulationConfig] = None) -> SimulationSnapshot:
        async with self.lock:
            if self._playback_task and not self._playback_task.done():
                self._playback_task.cancel()
                self._playback_task = None

            if new_config:
                self.config = new_config

            self.engine.reset(self.config)
            initial_workload = get_workload(WorkloadType.BALANCED)
            self.engine.load_workload(initial_workload)
            snapshot = self.engine.get_snapshot()
            await self.broadcast_snapshot()
            return snapshot

    async def _continuous_loop(self) -> None:
        """Background continuous execution loop."""
        try:
            while self.engine.status == SimulationStatus.RUNNING:
                async with self.lock:
                    snapshot = self.engine.step()
                    if snapshot.status in {SimulationStatus.COMPLETED, SimulationStatus.STOPPED}:
                        await self.broadcast_snapshot()
                        break
                    await self.broadcast_snapshot()

                delay_sec = max(0.05, self.config.speed_ms / 1000.0)
                await asyncio.sleep(delay_sec)
        except asyncio.CancelledError:
            pass
        except Exception:
            pass


simulation_manager = GlobalSimulationManager()
