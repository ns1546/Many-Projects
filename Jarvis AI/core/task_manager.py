"""
J.A.R.V.I.S. Task Execution, Queue & Concurrency Subsystem
High-Capacity Working Capacity Engine:
- Priority Scheduling (Urgent / Emergency vs Normal vs Background Telemetry)
- Concurrent Multi-Worker Execution Pool (ThreadPoolExecutor)
- Working Capacity Telemetry (Throughput, Latency, Queue Saturation)
- Multi-Step Compound Directive Decomposition
"""

import re
import time
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed


@dataclass
class JarvisTask:
    id: int
    description: str
    status: str = "pending"  # "pending", "in_progress", "completed", "failed"
    priority: int = 2        # 1 = Urgent/Emergency, 2 = Standard, 3 = Background
    result: Optional[str] = None
    created_at: float = 0.0
    completed_at: Optional[float] = None
    execution_time_ms: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TaskManager:
    """
    Manages J.A.R.V.I.S. High-Capacity Task Queue, Multi-Worker Concurrency,
    and Compound Directive Decomposition.
    """

    def __init__(self, max_workers: int = 8):
        self.tasks: List[JarvisTask] = []
        self._next_id = 1
        self.max_workers = max_workers
        self._pool = ThreadPoolExecutor(max_workers=self.max_workers, thread_name_prefix="JarvisWorker")
        self.total_completed = 0
        self.total_failed = 0
        self.execution_latencies: List[float] = []

    def add_task(self, description: str, priority: int = 2) -> JarvisTask:
        """Adds a single task with priority ranking (1=Urgent, 2=Normal, 3=Background)."""
        clean_desc = description.strip()
        # Automatically detect urgent priority if keywords are present
        lower = clean_desc.lower()
        if any(w in lower for w in ["urgent", "asap", "critical", "emergency", "immediately", "priority 1"]):
            priority = 1

        task = JarvisTask(
            id=self._next_id,
            description=clean_desc,
            status="pending",
            priority=priority,
            created_at=time.time()
        )
        self._next_id += 1
        self.tasks.append(task)
        return task

    def add_multiple_tasks(self, descriptions: List[str], priority: int = 2) -> List[JarvisTask]:
        """Adds a sequence of tasks to the queue."""
        created = []
        for desc in descriptions:
            if desc.strip():
                created.append(self.add_task(desc, priority=priority))
        return created

    def get_pending_tasks(self) -> List[JarvisTask]:
        """Returns all uncompleted tasks, sorted by priority (1 before 2 before 3)."""
        pending = [t for t in self.tasks if t.status == "pending"]
        return sorted(pending, key=lambda t: (t.priority, t.created_at))

    def list_tasks(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns tasks matching optional status as dictionaries."""
        if status:
            return [t.to_dict() for t in self.tasks if t.status == status]
        return [t.to_dict() for t in self.tasks]

    def get_all_tasks(self) -> List[JarvisTask]:
        return list(self.tasks)

    def get_next_task(self) -> Optional[JarvisTask]:
        """Fetches the highest-priority pending task."""
        pending = self.get_pending_tasks()
        return pending[0] if pending else None

    def mark_in_progress(self, task_id: int):
        for t in self.tasks:
            if t.id == task_id:
                t.status = "in_progress"
                break

    def mark_completed(self, task_id: int, result: Optional[str] = None):
        for t in self.tasks:
            if t.id == task_id:
                t.status = "completed"
                t.result = result
                t.completed_at = time.time()
                t.execution_time_ms = round((t.completed_at - t.created_at) * 1000, 2)
                self.total_completed += 1
                self.execution_latencies.append(t.execution_time_ms)
                break

    def mark_failed(self, task_id: int, error: Optional[str] = None):
        for t in self.tasks:
            if t.id == task_id:
                t.status = "failed"
                t.result = error
                t.completed_at = time.time()
                t.execution_time_ms = round((t.completed_at - t.created_at) * 1000, 2)
                self.total_failed += 1
                break

    def clear_all(self):
        self.tasks.clear()

    def clear_completed(self):
        self.tasks = [t for t in self.tasks if t.status != "completed"]

    def execute_tasks_concurrently(
        self,
        task_descriptions: List[str],
        worker_fn: Callable[[str], Dict[str, Any]],
        timeout_sec: float = 30.0
    ) -> List[Dict[str, Any]]:
        """
        Executes a batch of independent tasks concurrently across worker threads.
        Significantly increases working capacity and throughput for parallel actions.
        """
        if not task_descriptions:
            return []

        futures = {}
        for desc in task_descriptions:
            task_obj = self.add_task(desc)
            self.mark_in_progress(task_obj.id)
            future = self._pool.submit(worker_fn, desc)
            futures[future] = task_obj

        results = []
        for future in as_completed(futures, timeout=timeout_sec):
            task_obj = futures[future]
            try:
                res = future.result()
                summary = res.get("summary", "Completed successfully") if isinstance(res, dict) else str(res)
                self.mark_completed(task_obj.id, result=summary)
                results.append({"task_id": task_obj.id, "description": task_obj.description, "success": True, "data": res})
            except Exception as e:
                err_msg = str(e)
                self.mark_failed(task_obj.id, error=err_msg)
                results.append({"task_id": task_obj.id, "description": task_obj.description, "success": False, "error": err_msg})

        return results

    def get_capacity_metrics(self) -> Dict[str, Any]:
        """Returns deep telemetry on system working capacity and queue saturation."""
        pending_count = len(self.get_pending_tasks())
        avg_latency = round(sum(self.execution_latencies[-20:]) / max(1, len(self.execution_latencies[-20:])), 2)
        return {
            "max_concurrent_workers": self.max_workers,
            "total_tasks_registered": len(self.tasks),
            "pending_tasks": pending_count,
            "completed_tasks": self.total_completed,
            "failed_tasks": self.total_failed,
            "average_latency_ms": avg_latency,
            "queue_saturation": round(pending_count / max(1, self.max_workers * 10) * 100, 1),
            "working_capacity_status": "optimal" if pending_count < 10 else "high_load"
        }

    @staticmethod
    def decompose_multi_step_request(text: str) -> List[str]:
        """
        Decomposes a multi-step user instruction into distinct actionable subtasks.
        Supports:
        - "first X, then Y, and finally Z"
        - "1. X, 2. Y, 3. Z"
        - "step 1: X, step 2: Y"
        - "X, and then Y, and also Z"
        """
        raw = text.strip()

        # Clean prefix
        clean_raw = re.sub(
            r"^(?:(?:hey\s+)?jarvis[,:\s]+)?(?:please\s+)?(?:do\s+these\s+tasks|take\s+these\s+tasks|perform\s+these\s+actions|execute\s+these\s+tasks)[:,\s]+",
            "",
            raw,
            flags=re.IGNORECASE
        ).strip()

        # Check for numbered list: 1. ... 2. ...
        numbered_matches = re.split(r"(?:^|\s+)(?:\d+[\.\)]|step\s+\d+[:\.]?)\s+", clean_raw, flags=re.IGNORECASE)
        if len(numbered_matches) > 2:
            steps = [s.strip(" ,;.") for s in numbered_matches if s.strip(" ,;.")]
            if len(steps) >= 2:
                return steps

        # Check for "first ..., then ..., finally ..."
        if re.search(r"\bfirst\b", clean_raw, re.IGNORECASE) and re.search(r"\bthen\b", clean_raw, re.IGNORECASE):
            chunks = re.split(r"\b(?:then|and then|after that|finally|next)\b", clean_raw, flags=re.IGNORECASE)
            cleaned = []
            for c in chunks:
                sub = re.sub(r"^\s*(?:first|firstly|1[\.\)]|step\s+1[:\.]?)\s*", "", c, flags=re.IGNORECASE).strip()
                sub = re.sub(r"^(?:and|so|please|jarvis)\s+", "", sub, flags=re.IGNORECASE).strip()
                sub = sub.strip(" ,;.")
                if sub:
                    cleaned.append(sub)
            if len(cleaned) >= 2:
                return cleaned

        # Check for "and then", ", then", or "and also" chaining
        if re.search(r"(?:,\s*then\b|\band then\b|\band also\b)", clean_raw, re.IGNORECASE):
            chunks = re.split(r"(?:,\s*then\b|\band then\b|\band also\b)", clean_raw, flags=re.IGNORECASE)
            cleaned = [c.strip(" ,;.") for c in chunks if c.strip(" ,;.")]
            if len(cleaned) >= 2:
                return cleaned

        return []
