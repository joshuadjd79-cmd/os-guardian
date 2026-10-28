class SimulationClock:
    """Discrete-time deterministic simulation clock."""
    
    def __init__(self, initial_time: int = 0):
        self._time: int = initial_time

    @property
    def current_time(self) -> int:
        return self._time

    def tick(self, step: int = 1) -> int:
        if step < 1:
            raise ValueError("Clock step must be at least 1")
        self._time += step
        return self._time

    def reset(self, initial_time: int = 0) -> None:
        if initial_time < 0:
            raise ValueError("Initial time cannot be negative")
        self._time = initial_time
