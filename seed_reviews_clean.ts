import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kzxuaajqquykeahdcvtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eHVhYWpxcXV5a2VhaGRjdnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjE0MzAsImV4cCI6MjEwMDUzNzQzMH0.CZENFEtrpGit6ZWY2bC2AgFEI6rS2bGBiB_O3RmMTh8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const names = [
  // USA/UK/Australia
  "John Smith", "Emma Johnson", "Michael Brown", "Sarah Williams", "David Jones", 
  "Jessica Garcia", "Thomas Miller", "Ashley Davis", "Daniel Rodriguez", "Amanda Martinez",
  "James Taylor", "Emily Thomas", "Robert Moore", "Olivia Martin", "William Jackson",
  "Sophia White", "Joseph Thompson", "Isabella Garcia", "Charles Clark", "Mia Lewis",
  "Oliver Smith", "Charlotte Jones", "Jack Williams", "Ava Brown", "Noah Taylor",
  "Thomas Evans", "Chloe Davies", "James Wilson", "Emily Thomas", "Harry Roberts",
  "Oscar Johnson", "Grace Lewis", "William Walker", "Lily Robinson", "Henry Wood",
  // Europe
  "Lucas Schmidt", "Julia Müller", "Lars Jensen", "Sophie Dubois", "Matteo Rossi", 
  "Anna Nowak", "Sven Andersson", "Laura Garcia", "Hugo Silva", "Elena Popa",
  "Oliver Hansen", "Maria Fischer", "Arthur Laurent", "Clara Wagner", "Maxime Moreau",
  "Leon Weber", "Mia Becker", "Paul Hoffmann", "Emma Schulz", "Finn Koch",
  "Luis Richter", "Hannah Klein", "Jonas Wolf", "Lina Schröder", "Elias Neumann",
  "Gabriel Blanc", "Louise Roux", "Raphaël Colin", "Alice Vidal", "Louis Lemaire",
  // Russia
  "Ivan Ivanov", "Elena Smirnova", "Dmitry Sokolov", "Anna Volkova", "Alexey Lebedev",
  "Maria Novikova", "Sergey Morozov", "Natalia Egorova", "Mikhail Pavlov", "Olga Kozlova",
  "Pavel Stepanov", "Tatiana Nikolaeva", "Vladimir Orlov", "Svetlana Zakharova", "Andrey Makarov",
  "Ekaterina Tarasova", "Maxim Belov", "Yulia Borisova", "Igor Fedorov", "Daria Romanova"
];

const comments = [
  // Expats (Monthly rentals / Commuting)
  "I've been renting this bike monthly for my commute in D1 and D3. Absolutely reliable and great fuel economy.",
  "Perfect scooter for an expat living in Thao Dien. Handles the HCM traffic perfectly. The owner is super responsive.",
  "Rented this on a monthly basis to get to my office in District 7. Best decision ever. Zero breakdowns.",
  "Living in Saigon can be chaotic, but this bike makes my daily commute to work a breeze. Highly recommend for expats.",
  "Very reliable for long-term rental in HCMC. The maintenance is top-notch and it saves me so much time.",
  "Great monthly rate and the scooter is in perfect condition. I use it everyday to go to work in D1.",
  "As an English teacher here in Saigon, this bike is my best friend. Very durable and comfortable for daily rides.",
  "I've renewed my monthly contract three times already. The bike is flawless for surviving Saigon traffic.",
  "Commuting from District 2 to District 1 is so easy with this scooter. Fast, reliable, and great customer service.",
  "Perfect long-term rental option in Ho Chi Minh City. The bike is well-maintained and never gave me any trouble on the way to work.",
  
  // Tourists (Short term / Sightseeing HCM)
  "Rented this to explore Ho Chi Minh City for a week. We went to Cu Chi tunnels and back without any issues!",
  "Amazing experience! We drove around District 1, saw the Notre Dame Cathedral and Ben Thanh market. Bike was super smooth.",
  "Exploring Saigon's hidden alleyways on this bike was the highlight of our trip. Very easy to maneuver.",
  "Highly recommend renting from here if you're visiting HCMC. The bike was in great shape and perfect for city tours.",
  "Rode this to Cholon (Chinatown) and all around Saigon. It was so much fun and the bike felt very safe.",
  "Great way to see Ho Chi Minh City! The scooter had great brakes which is a must here.",
  "We took this bike around the city center to try different street foods. Perfect condition, highly recommended for tourists.",
  "Renting this made our Saigon trip 10x better. It's the only way to truly experience the city's vibe.",
  "The owner gave us great tips for riding in HCM traffic. The bike handled it all perfectly.",
  "Fantastic scooter for tourists! We zipped around D1, D3, and D4 easily. It made our trip unforgettable."
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr: any[]) {
  return arr[getRandomInt(0, arr.length - 1)];
}

async function seed() {
  console.log("Fetching bikes...");
  const { data: bikes, error: fetchError } = await supabase.from('bikes').select('id, name');
  
  if (fetchError || !bikes) {
    console.error("Failed to fetch bikes:", fetchError);
    return;
  }

  console.log(`Found ${bikes.length} bikes. Generating 4.8-4.9-5.0 reviews...`);

  let newReviews = [];

  // Distribution options to get mostly 4.8 and 4.9.
  // 0 = 15/15 5-star => 5.0 avg
  // 1 = 14/15 5-star => 4.93 avg
  // 2 = 13/15 5-star => 4.86 avg
  // 3 = 12/15 5-star => 4.80 avg
  // We want mostly 4.8 and 4.9.
  const numFourStarOptions = [
    0, // 5.0 (1 chance)
    1, 1, 1, 2, 2, 2, // ~4.9 (6 chances)
    3, 3, 3 // 4.8 (3 chances)
  ];

  for (const bike of bikes) {
    const numReviews = 15;
    
    // Pick how many 4-star reviews to give this bike
    const numFourStar = getRandomItem(numFourStarOptions);
    
    // Array of ratings (e.g. if numFourStar=2, then 13 fives and 2 fours)
    let ratings = Array(numReviews - numFourStar).fill(5).concat(Array(numFourStar).fill(4));
    // Shuffle the ratings
    ratings.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numReviews; i++) {
      const daysAgo = getRandomInt(1, 180);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      newReviews.push({
        bike_id: bike.id,
        author_name: getRandomItem(names),
        rating: ratings[i],
        comment: getRandomItem(comments),
        created_at: date.toISOString(),
      });
    }
  }

  console.log(`Inserting ${newReviews.length} new reviews...`);
  
  const chunkSize = 100;
  let totalInserted = 0;
  for (let i = 0; i < newReviews.length; i += chunkSize) {
    const chunk = newReviews.slice(i, i + chunkSize);
    const { error: insertError } = await supabase.from('reviews').insert(chunk);
    if (insertError) {
      console.error(`Error inserting chunk ${i}:`, insertError);
    } else {
      totalInserted += chunk.length;
      console.log(`Inserted ${totalInserted} / ${newReviews.length}`);
    }
  }

  console.log("Done! RLS should be off so inserts should work perfectly.");
}

seed();
