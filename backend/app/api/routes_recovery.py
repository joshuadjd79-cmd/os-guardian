from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..schemas.recovery import RecoveryDecisionRecord, CandidateAction
from ..schemas.simulation import SimulationSnapshot
from ..recovery.actions import RecoveryActionHandler
from ..core.state import simulation_manager

router = APIRouter(prefix="/api/recovery", tags=["recovery"])


class ApprovalRequest(BaseModel):
    decision_id: str
    approved: bool


@router.get("/decisions", response_model=List[RecoveryDecisionRecord])
async def list_recovery_decisions():
    return simulation_manager.engine.recovery_engine.decisions_history


@router.post("/approve", response_model=SimulationSnapshot)
async def approve_recovery_decision(request: ApprovalRequest):
    async with simulation_manager.lock:
        engine = simulation_manager.engine
        target_record: Optional[RecoveryDecisionRecord] = None
        for r in engine.recovery_engine.decisions_history:
            if r.decision_id == request.decision_id:
                target_record = r
                break

        if not target_record:
            raise HTTPException(status_code=404, detail=f"Decision {request.decision_id} not found")

        if target_record.was_applied:
            raise HTTPException(status_code=400, detail="Decision has already been applied")

        target_record.approved = request.approved
        if request.approved:
            action = target_record.chosen_action
            result = RecoveryActionHandler.apply_action(
                action_type=action.action_type,
                target_pids=action.target_pids,
                parameters=action.parameters,
                all_processes=engine.all_processes,
                ready_queue=engine.ready_queue,
                config=engine.config,
                current_time=engine.clock.current_time
            )
            target_record.was_applied = True
            target_record.applied_timestamp = engine.clock.current_time
            engine.metrics_tracker.record_recovery_action(overhead_ticks=1)

        await simulation_manager.broadcast_snapshot()
        return engine.get_snapshot()
