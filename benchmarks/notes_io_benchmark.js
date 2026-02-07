
// Simulate localStorage
const mockStorage = {
  writes: 0,
  setItem: function(key, value) {
    this.writes++;
    // Simulate synchronous blocking I/O (e.g., waiting for FS write)
    const start = Date.now();
    while (Date.now() - start < 1); // 1ms synchronous block
  },
  reset: function() {
    this.writes = 0;
  }
};

// Simulate user typing
const TOTAL_KEYSTROKES = 50;
const KEYSTROKE_DELAY_MS = 50; // Fast typing (20 wpm approx if chars/word=5, but very fast)

// Simple debounce implementation for simulation
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function runBaseline() {
  console.log('--- Baseline: Synchronous Updates ---');
  mockStorage.reset();

  const startTime = Date.now();

  for (let i = 0; i < TOTAL_KEYSTROKES; i++) {
    // Simulate updating state
    const value = `Note content update ${i}`;

    // Simulate the useEffect in NotesApp:
    // useEffect(() => { localStorage.setItem(...) }, [notes])
    mockStorage.setItem('os_notes', JSON.stringify({ content: value }));

    // Wait for next keystroke
    await new Promise(resolve => setTimeout(resolve, KEYSTROKE_DELAY_MS));
  }

  const duration = Date.now() - startTime;
  console.log(`Total Writes: ${mockStorage.writes}`);
  console.log(`Time Taken: ${duration}ms`);

  return mockStorage.writes;
}

async function runOptimized() {
  console.log('\n--- Optimized: Debounced Updates (1000ms delay) ---');
  mockStorage.reset();

  const startTime = Date.now();

  // The debounced save function simulates the effect of the hook:
  // Updates to state happen instantly, but the *write to storage* is delayed.
  // We model this by debouncing the storage write call.
  const saveToStorage = debounce((value) => {
    mockStorage.setItem('os_notes', JSON.stringify({ content: value }));
  }, 1000);

  for (let i = 0; i < TOTAL_KEYSTROKES; i++) {
    const value = `Note content update ${i}`;

    // Simulate the component re-render + debounced effect logic
    saveToStorage(value);

    // Wait for next keystroke
    await new Promise(resolve => setTimeout(resolve, KEYSTROKE_DELAY_MS));
  }

  // Wait for the final debounce to fire
  await new Promise(resolve => setTimeout(resolve, 1500));

  const duration = Date.now() - startTime;
  console.log(`Total Writes: ${mockStorage.writes}`);
  console.log(`Time Taken: ${duration}ms (includes debounce wait)`);

  return mockStorage.writes;
}

async function main() {
  const baselineWrites = await runBaseline();
  const optimizedWrites = await runOptimized();

  console.log('\n--- Results ---');
  console.log(`Reduction in I/O Operations: ${baselineWrites} -> ${optimizedWrites}`);
  // Avoid division by zero if something weird happens
  if (baselineWrites > 0) {
      console.log(`Improvement: ${((baselineWrites - optimizedWrites) / baselineWrites * 100).toFixed(1)}% fewer writes`);
  }
}

main().catch(console.error);
