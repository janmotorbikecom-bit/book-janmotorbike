import { supabase } from "./supabase";
import { toast } from "sonner";

const names = [
  "John Smith", "Emma Johnson", "Michael Brown", "Sarah Williams", "David Jones", 
  "Jessica Garcia", "Thomas Miller", "Ashley Davis", "Daniel Rodriguez", "Amanda Martinez",
  "James Taylor", "Emily Thomas", "Robert Moore", "Olivia Martin", "William Jackson",
  "Sophia White", "Joseph Thompson", "Isabella Garcia", "Charles Clark", "Mia Lewis",
  "Oliver Smith", "Charlotte Jones", "Jack Williams", "Ava Brown", "Noah Taylor",
  "Thomas Evans", "Chloe Davies", "James Wilson", "Harry Roberts",
  "Oscar Johnson", "Grace Lewis", "William Walker", "Lily Robinson", "Henry Wood",
  "Lucas Schmidt", "Julia Müller", "Lars Jensen", "Sophie Dubois", "Matteo Rossi", 
  "Anna Nowak", "Sven Andersson", "Laura Garcia", "Hugo Silva", "Elena Popa",
  "Oliver Hansen", "Maria Fischer", "Arthur Laurent", "Clara Wagner", "Maxime Moreau",
  "Leon Weber", "Mia Becker", "Paul Hoffmann", "Emma Schulz", "Finn Koch",
  "Luis Richter", "Hannah Klein", "Jonas Wolf", "Lina Schröder", "Elias Neumann",
  "Gabriel Blanc", "Louise Roux", "Raphaël Colin", "Alice Vidal", "Louis Lemaire",
  "Ivan Ivanov", "Elena Smirnova", "Dmitry Sokolov", "Anna Volkova", "Alexey Lebedev",
  "Maria Novikova", "Sergey Morozov", "Natalia Egorova", "Mikhail Pavlov", "Olga Kozlova",
  "Pavel Stepanov", "Tatiana Nikolaeva", "Vladimir Orlov", "Svetlana Zakharova", "Andrey Makarov",
  "Ekaterina Tarasova", "Maxim Belov", "Yulia Borisova", "Igor Fedorov", "Daria Romanova"
];

const comments = [
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

function getRandomItem<T>(arr: T[]): T {
  return arr[getRandomInt(0, arr.length - 1)];
}

export async function generateFakeReviewsForBike(bikeId: string) {
  const numReviews = getRandomInt(12, 38);
  const targetAverages = [5.0, 4.9, 4.9, 4.9, 4.9, 4.8, 4.8, 4.8];
  const targetAvg = getRandomItem(targetAverages);
  
  let numFourStar = 0;
  if (targetAvg === 4.9) {
    numFourStar = Math.round(numReviews * 0.1);
  } else if (targetAvg === 4.8) {
    numFourStar = Math.round(numReviews * 0.2);
  }
  
  const fuzz = getRandomInt(-1, 1);
  numFourStar = Math.max(0, numFourStar + fuzz);
  
  let ratings = Array(numReviews - numFourStar).fill(5).concat(Array(numFourStar).fill(4));
  ratings.sort(() => Math.random() - 0.5);
  
  const newReviews = [];
  for (let i = 0; i < numReviews; i++) {
    const daysAgo = getRandomInt(1, 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    newReviews.push({
      bike_id: bikeId,
      author_name: getRandomItem(names),
      rating: ratings[i],
      comment: getRandomItem(comments),
      created_at: date.toISOString(),
    });
  }

  const { error } = await supabase.from('reviews').insert(newReviews);
  if (error) {
    console.error("Failed to insert fake reviews:", error);
    throw new Error(error.message);
  }
}
