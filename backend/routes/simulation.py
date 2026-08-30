from fastapi import APIRouter
from ..schemas import SimulationRequest
from ..ml.simulator import simulator

router = APIRouter(prefix="/simulation", tags=["simulation"])

@router.post("/run")
def run_simulation(req: SimulationRequest):
    return simulator.run_simulation(
        solar_delta_pct=req.solar_delta_pct,
        wind_delta_pct=req.wind_delta_pct,
        temp_delta_c=req.temp_delta_c,
        load_delta_pct=req.load_delta_pct,
    )
