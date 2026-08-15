// 這是一個 Vercel 伺服器端小程式（不是網頁），作用是幫網站跟 Google Apps Script 中間傳話。
// 因為這個檔案跟網站放在同一個網域下執行，瀏覽器（包含 iPhone Safari）不會把它當成「第三方請求」擋掉。

const GAS_URL = "https://script.google.com/macros/s/AKfycbxM6-3hbsyEJChrRNxkviVcrNeoU4lRJ8aWJvTWQuhQI5GFHQXPBWeEg_edYQpdV2SS/exec";

export default async function handler(req, res) {
  try {
    let response;

    if (req.method === "GET") {
      const params = new URLSearchParams(req.query).toString();
      response = await fetch(`${GAS_URL}?${params}`);
    } else if (req.method === "POST") {
      const body = req.body || {};
      const params = new URLSearchParams(body).toString();
      response = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
    } else {
      res.status(405).json({ error: "method not allowed" });
      return;
    }

    const text = await response.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    // 禁止任何快取（瀏覽器、CDN）保存這個回應，確保每次都拿到最新資料
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
