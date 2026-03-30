/**
 * Serwis generowania ilustracji bajkowej ze zdjęcia dziecka.
 *
 * Obsługuje:
 *  - Replicate API (gdy REPLICATE_API_TOKEN jest ustawiony)
 *  - Placeholder (gdy brak API — status FAILED z komunikatem)
 *
 * Styl: miękka akwarela, bajkowy, przyjazny dzieciom.
 */

export interface IllustrationResult {
  status: "READY" | "FAILED";
  illustrationUrl?: string;
  error?: string;
}

export interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string[] | string | null;
  error?: string | null;
}

// Model Replicate — cartoonify / fairytale style
// Używamy stabilnego modelu img2img
const REPLICATE_MODEL_VERSION =
  process.env.REPLICATE_MODEL_VERSION ??
  // catacolabs/cartoonify — sprawdzony model kartoonizacji
  "2e112284f006bcd1e5c2f80b890a35f4ef58f2e9339e4e76a0c40dc4e25bfbdd";

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

/**
 * Tworzy nowe zadanie Replicate i zwraca jego ID.
 * Wywołanie jest nieblokujące — status sprawdzamy przez pollReplicatePrediction.
 */
export async function startIllustrationJob(photoUrl: string): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN nie jest skonfigurowany.");

  const prompt =
    "children's book illustration, soft watercolor style, fairytale, " +
    "gentle pastel colors, cute cartoon character, friendly, warm, " +
    "Disney-Pixar inspired, detailed face, magical atmosphere";

  const body = {
    version: REPLICATE_MODEL_VERSION,
    input: {
      image: photoUrl,
      prompt,
      negative_prompt: "ugly, scary, dark, realistic photo, nsfw, violence",
      strength: 0.65,
      guidance_scale: 7.5,
      num_inference_steps: 30,
    },
  };

  const res = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate error: ${res.status} ${err}`);
  }

  const prediction: ReplicatePrediction = await res.json();
  return prediction.id;
}

/**
 * Sprawdza aktualny status zadania Replicate.
 */
export async function pollReplicatePrediction(
  jobId: string
): Promise<ReplicatePrediction> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN nie jest skonfigurowany.");

  const res = await fetch(`${REPLICATE_API_URL}/${jobId}`, {
    headers: { Authorization: `Token ${token}` },
    // Wyłącz cache Next.js — zawsze pobierz świeże dane
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Replicate poll error: ${res.status}`);
  return res.json();
}

/**
 * Mapuje wynik Replicate na URL ilustracji.
 */
export function extractIllustrationUrl(
  prediction: ReplicatePrediction
): string | null {
  if (prediction.status !== "succeeded") return null;
  if (Array.isArray(prediction.output)) return prediction.output[0] ?? null;
  if (typeof prediction.output === "string") return prediction.output;
  return null;
}

/**
 * Sprawdza, czy Replicate API jest skonfigurowany.
 */
export function isReplicateConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}
