const FITNESS_API = "https://www.googleapis.com/fitness/v1/users/me"

// Google Fit activity type 79 = Dancing (closest to karaoke/singing)
const KARAOKE_ACTIVITY_TYPE = 79

async function getOrCreateDataSource(accessToken: string): Promise<string> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }

  const createRes = await fetch(`${FITNESS_API}/dataSources`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      dataStreamName: "karaoke_calories",
      type: "raw",
      application: { name: "Karaoke App", version: "1" },
      dataType: { name: "com.google.calories.expended" },
      device: {
        manufacturer: "Web",
        model: "Browser",
        type: "unknown",
        uid: "1",
        version: "1",
      },
    }),
  })

  if (createRes.ok) {
    const data = await createRes.json()
    console.log("[GoogleFit] Data source created:", data.dataStreamId)
    return data.dataStreamId as string
  }

  if (createRes.status === 409) {
    console.log("[GoogleFit] Data source already exists, fetching list...")
    const listRes = await fetch(
      `${FITNESS_API}/dataSources?dataTypeName=com.google.calories.expended`,
      { headers }
    )
    const list = await listRes.json()
    console.log("[GoogleFit] Data sources found:", JSON.stringify(list))
    if (!listRes.ok) throw new Error("Failed to list data sources")
    const existing = list.dataSource?.find(
      (ds: { dataStreamName: string; dataStreamId: string }) =>
        ds.dataStreamName === "karaoke_calories"
    )
    if (!existing) throw new Error("Could not find existing karaoke data source")
    console.log("[GoogleFit] Using existing data source:", existing.dataStreamId)
    return existing.dataStreamId as string
  }

  const errBody = await createRes.text()
  throw new Error(`Failed to create data source: ${createRes.status} ${errBody}`)
}

async function createSession(
  accessToken: string,
  startMs: number,
  endMs: number,
  songTitle: string
): Promise<void> {
  const sessionId = `karaoke_${startMs}`

  const res = await fetch(`${FITNESS_API}/sessions/${sessionId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: sessionId,
      name: `Karaoke: ${songTitle}`,
      description: `Karaoke singing session`,
      startTimeMillis: startMs.toString(),
      endTimeMillis: endMs.toString(),
      activityType: KARAOKE_ACTIVITY_TYPE,
      application: {
        name: "Karaoke App",
        version: "1",
      },
    }),
  })

  const body = await res.text()
  console.log("[GoogleFit] Session response:", res.status, body)
  if (!res.ok) {
    throw new Error(`Failed to create session: ${res.status} ${body}`)
  }
}

export async function recordCaloriesToGoogleFit(
  accessToken: string,
  calories: number,
  durationMs: number,
  songTitle: string = "Unknown Song"
): Promise<void> {
  const endMs = Math.floor(Date.now())
  const startMs = Math.floor(endMs - durationMs)
  // Google Fit uses nanoseconds; multiply ms × 1_000_000 (must be integers)
  const startNs = `${startMs}000000`
  const endNs = `${endMs}000000`

  // Step 1: Write calorie dataset
  const dataSourceId = await getOrCreateDataSource(accessToken)
  console.log("[GoogleFit] Writing dataset to:", dataSourceId)
  console.log("[GoogleFit] Calories:", calories, "| startNs:", startNs, "| endNs:", endNs)

  const datasetId = `${startNs}-${endNs}`
  const patchRes = await fetch(
    `${FITNESS_API}/dataSources/${encodeURIComponent(dataSourceId)}/datasets/${datasetId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dataSourceId,
        maxEndTimeNs: endNs,
        minStartTimeNs: startNs,
        point: [
          {
            startTimeNanos: startNs,
            endTimeNanos: endNs,
            dataTypeName: "com.google.calories.expended",
            value: [{ fpVal: calories }],
          },
        ],
      }),
    }
  )

  const patchBody = await patchRes.text()
  console.log("[GoogleFit] Write response:", patchRes.status, patchBody)
  if (!patchRes.ok) {
    throw new Error(`Failed to write Google Fit dataset: ${patchRes.status} ${patchBody}`)
  }

  // Step 2: Create activity session (this makes it show in Google Fit app)
  await createSession(accessToken, startMs, endMs, songTitle)
  console.log("[GoogleFit] Session created successfully")
}
