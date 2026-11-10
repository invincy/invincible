export function createGpuCoordinator() {
  let tail = Promise.resolve(), blocked = null;
  return {
    block(reason) { blocked = reason; },
    run(operation) {
      const next = tail.then(() => { if (blocked) throw Error(blocked); return operation(); });
      tail = next.catch(() => {}); return next;
    },
  };
}
