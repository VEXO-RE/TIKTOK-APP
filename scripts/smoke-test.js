const port = Number(process.env.PORT || 4100);

const url = `http://127.0.0.1:${port}/health`;

try {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  console.log("SMOKE OK", data);
} catch (error) {
  console.error("SMOKE FAILED:", error.message);
  process.exit(1);
}
