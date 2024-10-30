import { Outlet } from "react-router-dom";
import Navbar from "../component/NavBar";

const Main = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Main;
