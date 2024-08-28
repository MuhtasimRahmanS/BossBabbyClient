import { Link } from "react-router-dom";

const ShoeCard = ({ shoe }) => {
  return (
    <div className="border shadow hover:shadow-2xl transform transition-transform duration-300 hover:-translate-y-2">
      <Link to={`/details/${shoe._id}`}>
        <img src={shoe.images[0]} alt="" />
        <div className="py-5 text-center">
          <h2>{shoe.name}</h2>
          <p>{shoe.sizes[0].price}</p>
        </div>
      </Link>
    </div>
  );
};

export default ShoeCard;
