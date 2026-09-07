import db from '../src/db.js';

const evalPosts = [
  { title: "The Behavior of Red Foxes", content: "Red foxes are solitary hunters who feed on rodents, rabbits, birds, and other small game. They are known for their distinct orange fur and bushy tails." },
  { title: "Wolves in the Wild", content: "Gray wolves are pack animals, highly social and cooperative hunters. They roam large territories in forests and tundras." },
  { title: "Choosing the Right Dog", content: "Golden Retrievers are excellent family pets. They are loyal, intelligent, and have a beautiful golden coat." },
  { title: "Encounters with Brown Bears", content: "Brown bears are massive omnivores found in North America and Eurasia. They can be dangerous if provoked, especially when defending cubs." },
  { title: "White-tailed Deer Habitats", content: "These agile herbivores are commonly found in North American forests. They are easily recognized by the white underside of their tail." },
  { title: "Urban Foxes", content: "Foxes have increasingly adapted to human environments, scavenging in cities at night. They remain cautious but opportunistic." },
  { title: "Wolf Conservation Efforts", content: "Reintroducing wolves into Yellowstone has had profound ecological impacts. Their presence manages prey populations effectively." },
  { title: "German Shepherd Training", content: "A versatile working dog, the German Shepherd excels in obedience, tracking, and protection tasks." },
  { title: "Black Bear Diet", content: "Despite their size, a significant portion of a black bear's diet consists of berries, nuts, and insects." },
  { title: "The Grace of Fallow Deer", content: "Fallow deer, known for their spotted coats even in adulthood, are commonly kept in parks and large estates." }
];

console.log("Seeding eval posts into database...");

// Clear existing posts
db.prepare('DELETE FROM posts').run();

const insertPost = db.prepare(`INSERT INTO posts (title, content) VALUES (?, ?)`);

for (const post of evalPosts) {
  insertPost.run(post.title, post.content);
}

console.log(`Seeded ${evalPosts.length} posts.`);
