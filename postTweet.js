const fs = require("fs");

const REGION = process.env.REGION; // india | us
const TOKEN = process.env.X_BEARER_TOKEN;

if (!REGION || !TOKEN) {
  console.error("❌ Missing REGION or X_BEARER_TOKEN");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync("tweets.json", "utf8"));

// Pick next tweet for this region only
const tweet = data.tweets.find(t => t.posted[REGION] === false);

if (!tweet) {
  console.log(`✅ No tweets left for ${REGION}`);
  process.exit(0);
}

const text = `${tweet.text}\n\n${tweet.hashtags[REGION].join(" ")}`;

(async () => {
  const res = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ X API error:", err);
    process.exit(1);
  }

  const json = await res.json();
  console.log("✅ Tweet posted:", json.data.id);

  // Update flag ONLY for this region
  tweet.posted[REGION] = true;
  fs.writeFileSync("tweets.json", JSON.stringify(data, null, 2));

  console.log(`✅ Marked tweet as posted for ${REGION}`);
})();
