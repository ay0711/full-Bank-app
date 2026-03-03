const DEFAULT_BACKEND_URL = 'https://full-bank-app.onrender.com';

module.exports = async function handler(req, res) {
  const backendUrl = process.env.WARMUP_BACKEND_URL || DEFAULT_BACKEND_URL;
  const healthUrl = `${backendUrl}/api/auth/health`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'securebank-warmup/1.0',
      },
    });

    clearTimeout(timeout);

    return res.status(response.ok ? 200 : 503).json({
      ok: response.ok,
      target: healthUrl,
      status: response.status,
      warmedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      target: healthUrl,
      message: 'Warm-up ping failed',
      error: error?.name || 'UnknownError',
      warmedAt: new Date().toISOString(),
    });
  }
};
