import { Link } from "react-router-dom";

const ShoeCard = ({ shoe }) => {
  const minPrice = Math.min(...shoe.sizes.map((size) => size.price));
  const maxPrice = Math.max(...shoe.sizes.map((size) => size.price));

  const minDiscountPrice = Math.min(
    ...shoe.sizes
      .filter((size) => size.discountPrice > 0)
      .map((size) => size.discountPrice)
  );
  const maxDiscountPrice = Math.max(
    ...shoe.sizes
      .filter((size) => size.discountPrice > 0)
      .map((size) => size.discountPrice)
  );

  const hasDiscount = minDiscountPrice < minPrice;

  return (
    <div className="border shadow hover:shadow-2xl transform transition-transform duration-300 hover:-translate-y-1">
      <Link to={`/details/${shoe._id}`}>
        <img
          src={shoe.images[0]}
          alt={shoe.name}
          className="w-full  object-cover"
        />
        <div className="p-3">
          <h2 className="font-medium">{shoe.name}</h2>
          <p className="font-medium">
            {hasDiscount ? (
              <>
                <span className="line-through text-red-500">
                  {minPrice === maxPrice
                    ? `${minPrice}৳`
                    : `${minPrice} - ${maxPrice}৳`}
                </span>{" "}
                <span className="text-green-600">
                  {minDiscountPrice === maxDiscountPrice
                    ? `${minDiscountPrice}৳`
                    : `${minDiscountPrice} - ${maxDiscountPrice}৳`}
                </span>
              </>
            ) : (
              <>
                {minPrice === maxPrice
                  ? `${minPrice}৳`
                  : `${minPrice} - ${maxPrice}৳`}
              </>
            )}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ShoeCard;
