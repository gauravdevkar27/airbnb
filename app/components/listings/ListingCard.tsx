import Image from "next/image";

interface ListingCardProps {
    data: {
        id: string;
        title: string;
        description: string;
        imageSrc: string;
        category: string;
        roomCount: number;
        bathroomCount: number;
        guestCount: number;
        locationValue: string;
        price: number;
        rating: number;
    };
}

const ListingCard: React.FC<ListingCardProps> = ({ data }) => {
    return (
        <div className="col-span-1 cursor-pointer group">
            <div className="flex flex-col gap-2 w-full">
                {/* 1. Image */}
                <div className="aspect-square w-full relative overflow-hidden rounded-xl">
                    <Image
                        fill
                        className="object-cover h-full w-full group-hover:scale-110 transition"
                        src={data.imageSrc}
                        alt={data.title}
                        unoptimized 
                    />
                </div>

                {/* 2. Location & Rating */}
                <div className="flex flex-row justify-between items-center">
                    <div className="font-semibold text-lg">
                        {data.locationValue}
                    </div>
                    <div className="font-light flex items-center gap-1">
                        ★ {data.rating}
                    </div>
                </div>

                {/* 3. Category & Description */}
                <div className="font-light text-neutral-500">
                    {data.category}
                </div>
                <div className="font-light text-neutral-500 line-clamp-1">
                    {data.title}
                </div>

                {/* 4. Rooms Info */}
                <div className="font-light text-neutral-500 text-sm">
                    {data.guestCount} guests · {data.roomCount} rooms · {data.bathroomCount} baths
                </div>

                {/* 5. Price */}
                <div className="flex flex-row items-center gap-1 mt-1">
                    <div className="font-semibold">
                        ₹ {data.price}
                    </div>
                    <div className="font-light truncate">night</div>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
