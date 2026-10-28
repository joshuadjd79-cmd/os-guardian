# OS Guardian 2.0 — Security & Privacy Architecture

This document outlines the security controls, safety boundaries, and vulnerability mitigations implemented in OS Guardian.

---

## 1. Educational Safety Boundary

- **In-Memory Confinement:** All CPU execution, memory allocations, thread state machines, and recovery actions are computed strictly in-memory on synthetic data structures (`ProcessControlBlock`, `ReadyQueue`, `MemoryModel`).
- **No Host OS Privileges:** The application runs as an unprivileged user process. It does not invoke `ctypes`, Win32 API hooks, root/sudo operations, or terminate host processes.

---

## 2. Injection & Input Sanitization

- **CSV Formula Injection (RFC-4180):** In `backend/app/experiments/runner.py`, all user-controlled text fields and process names exported to CSV are checked for dangerous formula prefix characters (`=`, `+`, `-`, `@`). Any matching string is sanitized with a prepended single-quote (`'`).
- **Pydantic Validation:** All REST API inputs (`ProcessCreate`, `SimulationConfig`) enforce strict bounds validation (burst > 0, priority >= 1, arrival >= 0) to prevent negative time loops or numerical instability.

---

## 3. Secret & Credential Zero-Leakage Policy

- **Automated Regex Scans:** The repository has been scanned for cloud API keys, private tokens, passwords, and user filesystem paths across all tracked files. 0 secrets detected.
- **Git Hygiene:** `.gitignore` excludes `.env`, `venv/`, `node_modules/`, `.pytest_cache/`, and local build directories.
