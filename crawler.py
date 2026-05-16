import os
import json
import asyncio
from datetime import datetime
from playwright.async_api import async_playwright
from google import genai
from google.genai import types

client = genai.Client()

async def scrape_page_text(url: str) -> str:
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        c = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        p_page = await c.new_page()
        try:
            await p_page.goto(url, wait_until="networkidle", timeout=60000)
            await p_page.evaluate("window.scrollTo(0, document.body.scrollHeight/2);")
            await asyncio.sleep(2)
            await p_page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
            await asyncio.sleep(2)
            return await p_page.evaluate("() => document.body.innerText")
        except Exception as e:
            print(f"❌ Scrape failed for {url}: {e}")
            return ""
        finally:
            await b.close()

async def process_with_gemini(text: str) -> dict:
    schema = {
        "type": "OBJECT",
        "properties": {
            "offers": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "bike_model": {"type": "STRING"},
                        "current_price": {"type": "NUMBER"},
                        "original_price": {"type": "NUMBER"},
                        "currency": {"type": "STRING"},
                        "rental_company": {"type": "STRING"},
                        "location_text": {"type": "STRING"},
                        "available_dates": {"type": "STRING"},
                        "mileage_limit": {"type": "STRING"},
                        "minimum_rental_days": {"type": "NUMBER"},
                        "category": {"type": "STRING"},
                        "source_listing_url": {"type": "STRING"},
                        "raw_offer_text": {"type": "STRING"}
                    },
                    "required": ["bike_model", "current_price"]
                }
            }
        },
        "required": ["offers"]
    }
    prompt = (
        "You are a fact extraction engine for JetMyMoto. Extract motorcycle rental offers as raw facts matching the schema layout.\n"
        "If original_price is visible via discounts or strikes, extract it. Do NOT compute any scoring parameters.\n\n"
        f"DATA:\n{text}"
    )
    res = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.1
        )
    )
    return json.loads(res.text)

async def main():
    os.makedirs("output", exist_ok=True)
    if not os.path.exists("targets.json"):
        print("❌ missing targets.json")
        return
    with open("targets.json", "r") as f:
        targets = json.load(f)
    records = []
    today = datetime.now().strftime("%Y-%m-%d")
    for t in targets:
        txt = await scrape_page_text(t["target_url"])
        if not txt or len(txt.strip()) < 200:
            continue
        data = await process_with_gemini(txt)
        for o in data.get("offers", []):
            o.update({
                "source_url": t["target_url"],
                "source_platform": t["source_platform"],
                "city": t["city"],
                "country": t["country"],
                "target_type": t["target_type"],
                "extracted_at": today
            })
            records.append({"type": "daily_deal", "data": o})
    with open("output/rental_offers_latest.json", "w") as f:
        json.dump(records, f, indent=2)
    print(f"🎉 Crawler finalized. Collected {len(records)} raw elements.")

if __name__ == "__main__":
    asyncio.run(main())
