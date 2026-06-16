#!/usr/bin/env python3
"""Hands-on asyncio examples.

Run from the aisys-thoughts project root:
    python3 python/async.py

The janus example needs janus installed in this project's virtual environment:
    .venv/bin/python python/async.py

This file is intentionally named async.py because it is meant to be run as a
script. Do not import it as "import async"; async is a Python keyword.
"""

from __future__ import annotations

import asyncio
import threading
import time
from collections.abc import Awaitable
from typing import Any


START = time.perf_counter()


def log(message: str) -> None:
    """Print a timestamped line so scheduling is easy to see."""
    elapsed = time.perf_counter() - START
    print(f"{elapsed:6.2f}s | {message}")


async def fake_io(name: str, delay: float) -> str:
    """Stand in for an async wait: network I/O, queue data, disk I/O, or model output."""
    log(f"{name}: start, then await sleep({delay})")
    await asyncio.sleep(delay)
    log(f"{name}: finished")
    return f"{name}-result"


async def demo_01_sequential_vs_concurrent() -> None:
    """Show the difference between waiting sequentially and scheduling work.

    Awaiting one coroutine after another is still sequential. create_task
    schedules both coroutines on the current event loop, so they can make
    progress during the same one-second sleep window. gather waits for both
    tasks and returns their results in order.
    """
    log("\nDEMO 1: sequential await")
    # Sequential path: seq-B starts only after seq-A finishes.
    result_a = await fake_io("seq-A", 1.0)
    result_b = await fake_io("seq-B", 1.0)
    log(f"sequential results: {result_a}, {result_b}")

    log("\nDEMO 1: concurrent tasks")
    # Concurrent path: both sleeps wait at the same time, so total time is near 1 second.
    task_a = asyncio.create_task(fake_io("task-A", 1.0))
    task_b = asyncio.create_task(fake_io("task-B", 1.0))
    results = await asyncio.gather(task_a, task_b)
    log(f"concurrent results: {results}")


async def producer(queue: asyncio.Queue[str | None]) -> None:
    """Produce a few messages for the async queue demo."""
    for item in ["request-1", "request-2", "request-3"]:
        log(f"producer: put {item}")
        await queue.put(item)
        await asyncio.sleep(0.2)

    log("producer: put sentinel None")
    await queue.put(None)


async def consumer(queue: asyncio.Queue[str | None]) -> None:
    """Consume queue messages until the sentinel arrives."""
    while True:
        item = await queue.get()
        try:
            if item is None:
                log("consumer: got sentinel, stop")
                return

            log(f"consumer: handle {item}")
            await asyncio.sleep(0.5)
            log(f"consumer: done {item}")
        finally:
            queue.task_done()


async def demo_02_queue() -> None:
    """Use asyncio.Queue to decouple producers from consumers.

    Both tasks run on the same event loop. When the consumer reaches
    queue.get() before data is available, it suspends itself instead of
    blocking the loop. The None value is a simple sentinel that tells the
    consumer there is no more work.
    """
    log("\nDEMO 2: asyncio.Queue")
    queue: asyncio.Queue[str | None] = asyncio.Queue()
    producer_task = asyncio.create_task(producer(queue))
    consumer_task = asyncio.create_task(consumer(queue))

    await asyncio.gather(producer_task, consumer_task)
    log("queue demo finished")


async def event_waiter(name: str, event: asyncio.Event) -> None:
    """Wait for a shared signal."""
    log(f"{name}: waiting for event")
    await event.wait()
    log(f"{name}: event received")


async def demo_03_event() -> None:
    """Use asyncio.Event as a one-to-many signal.

    Several tasks can wait on the same Event. Once set() is called, every task
    waiting on event.wait() is released. This is useful for state changes such
    as "ready", "start", or "shutdown".
    """
    log("\nDEMO 3: asyncio.Event")
    event = asyncio.Event()
    waiters = [
        asyncio.create_task(event_waiter("waiter-A", event)),
        asyncio.create_task(event_waiter("waiter-B", event)),
    ]

    await asyncio.sleep(0.7)
    log("main: event.set()")
    event.set()
    await asyncio.gather(*waiters)


async def slow_operation() -> str:
    """A coroutine with enough delay to demonstrate timeout and cancellation."""
    try:
        log("slow_operation: started")
        await asyncio.sleep(2.0)
        log("slow_operation: finished")
        return "slow-result"
    except asyncio.CancelledError:
        log("slow_operation: got CancelledError, clean up here")
        raise


async def demo_04_timeout_and_cancel() -> None:
    """Show the two common ways a task stops early.

    wait_for wraps an awaitable with a deadline. If the deadline expires, the
    inner coroutine receives CancelledError and gets a chance to clean up.
    task.cancel() does the same kind of cancellation explicitly for an
    already-created Task.
    """
    log("\nDEMO 4: asyncio.wait_for timeout")
    try:
        result = await asyncio.wait_for(slow_operation(), timeout=0.8)
        log(f"unexpected result: {result}")
    except asyncio.TimeoutError:
        log("main: slow_operation timed out")

    log("\nDEMO 4: manual task.cancel()")
    task = asyncio.create_task(slow_operation())
    await asyncio.sleep(0.5)
    log("main: cancel task")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        log("main: observed task cancellation")


def blocking_cpu_or_io(label: str, seconds: float) -> str:
    """A regular blocking function; calling it directly would stop the current thread."""
    log(f"{label}: blocking function starts")
    time.sleep(seconds)
    log(f"{label}: blocking function ends")
    return f"{label}-result"


async def demo_05_to_thread() -> None:
    """Run blocking synchronous code without freezing the event loop.

    blocking_cpu_or_io uses time.sleep, so calling it directly inside an async
    function would freeze the event loop. to_thread sends it to the default
    thread pool, letting the event loop continue scheduling other coroutines.
    """
    log("\nDEMO 5: asyncio.to_thread")
    # thread_work runs in a thread pool while async_work stays on the current event loop.
    thread_work = asyncio.to_thread(blocking_cpu_or_io, "thread-work", 1.0)
    async_work = fake_io("async-work", 0.3)
    results = await asyncio.gather(thread_work, async_work)
    log(f"to_thread results: {results}")


def janus_sync_producer(sync_q: Any) -> None:
    """Send messages from a normal thread through janus's synchronous side."""
    for item in ["engine-input-1", "engine-input-2", "engine-input-3"]:
        log(f"sync-thread: sync_q.put({item})")
        sync_q.put(item)
        time.sleep(0.2)

    log("sync-thread: sync_q.put(None)")
    sync_q.put(None)


async def janus_async_consumer(async_q: Any) -> None:
    """Receive messages from the same janus queue through its async side."""
    while True:
        item = await async_q.get()
        try:
            if item is None:
                log("async-loop: got sentinel None")
                return

            log(f"async-loop: async_q.get() -> {item}")
            await asyncio.sleep(0.35)
            log(f"async-loop: processed {item}")
        finally:
            async_q.task_done()


async def demo_06_janus_queue() -> None:
    """Bridge a normal thread and an asyncio event loop with janus.Queue.

    This mirrors the shape of many runtime systems: a synchronous caller or
    control thread submits work, while an asyncio loop owns the async scheduler
    or orchestrator. A plain asyncio.Queue is not safe as a cross-thread queue,
    and queue.Queue.get() would block the event loop if used directly there.

    janus.Queue gives both sides the interface they expect:
    - bridge_queue.sync_q behaves like queue.Queue for normal threads.
    - bridge_queue.async_q behaves like asyncio.Queue for coroutines.

    In the output, the sync thread calls sync_q.put(...), and the async loop
    receives those same messages with await async_q.get(). None is used as a
    sentinel to mark the end of the stream.
    """
    log("\nDEMO 6: janus.Queue sync_q <-> async_q")
    try:
        import janus
    except ModuleNotFoundError:
        log("janus is not installed in this interpreter; skip this demo")
        log("install janus in the project venv, then run: .venv/bin/python python/async.py")
        return

    # One janus.Queue exposes both sides of the bridge.
    bridge_queue = janus.Queue()

    # The producer is ordinary threaded code. It does not know about asyncio.
    producer_thread = threading.Thread(
        target=janus_sync_producer,
        args=(bridge_queue.sync_q,),
        name="janus-sync-producer",
    )

    producer_thread.start()
    # The consumer is async code. It awaits the async side of the same queue.
    await janus_async_consumer(bridge_queue.async_q)

    # Thread.join blocks, so run it in a worker thread instead of the event loop.
    await asyncio.to_thread(producer_thread.join)

    # Close janus cleanly so its internal notification tasks have a chance to finish.
    bridge_queue.close()
    await bridge_queue.wait_closed()
    log("janus queue closed")


async def run_step(title: str, step: Awaitable[Any]) -> None:
    log(f"\n========== {title} ==========")
    await step


async def main() -> None:
    log("asyncio demo starts")
    await run_step("1. sequential vs concurrent", demo_01_sequential_vs_concurrent())
    await run_step("2. queue", demo_02_queue())
    await run_step("3. event", demo_03_event())
    await run_step("4. timeout and cancellation", demo_04_timeout_and_cancel())
    await run_step("5. to_thread", demo_05_to_thread())
    await run_step("6. janus queue", demo_06_janus_queue())
    log("\nasyncio demo done")


if __name__ == "__main__":
    asyncio.run(main())
