import { useEffect, useState } from "react";
import ShoeCard from "./ShoeCard";

const BoyShoe = () => {
  const [shoes, setShoes] = useState([]);

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const response = await fetch("./shoe.json");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setShoes(data);
      } catch (error) {
        console.error("Error fetching shoes:", error);
      }
    };

    fetchShoes();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mt-5">
        {shoes.map((shoe) => (
          <ShoeCard key={shoe._id} shoe={shoe} />
        ))}
      </div>
    </div>
  );
};

export default BoyShoe;
