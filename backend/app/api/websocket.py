from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..core.state import simulation_manager

router = APIRouter()


@router.websocket("/ws/simulation")
async def websocket_simulation_stream(websocket: WebSocket):
    await simulation_manager.connect_ws(websocket)
    try:
        while True:
            # Client can send ping or commands over ws
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        simulation_manager.disconnect_ws(websocket)
    except Exception:
        simulation_manager.disconnect_ws(websocket)
