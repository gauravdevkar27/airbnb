import './globals.css'
import { listings } from "./data/listings";
import ListingCard from "./components/listings/ListingCard";
export default function Home() {
  return (
    
    <main className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Explore Listings</h1>
            
            {/* The Grid to hold the cards */}
            <div className="
                grid 
                grid-cols-1 
                sm:grid-cols-2 
                md:grid-cols-3 
                lg:grid-cols-4 
                xl:grid-cols-5 
                2xl:grid-cols-6 
                gap-8
            ">
                {/* The Loop: mapping every item in listings to a ListingCard */}
                {listings.map((listing) => (
                    <ListingCard 
                        key={listing.id} 
                        data={listing}   
                    />
                ))}
            </div>
        </main>
     );
}
