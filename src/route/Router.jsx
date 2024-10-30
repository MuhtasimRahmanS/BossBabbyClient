import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";
import Home from "../pages/Home";
import Details from "../pages/Details";
import SearchResults from "../pages/SearchResults";
import AllProductBoy from "../pages/AllProductBoy";
import AllProductGirl from "../pages/AllProductGirl";
import AllProductNewborn from "../pages/AllProductNewborn";
import CheckoutOrder from "../pages/CheckoutOrder";
import ViewCart from "../pages/ViewCart";
import CheckoutCart from "../pages/CheckoutCart";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/details/:id",
        element: <Details />,
      },
      {
        path: "/search",
        element: <SearchResults />,
      },
      {
        path: "/Boy-collection",
        element: <AllProductBoy />,
      },
      {
        path: "/Girl-collection",
        element: <AllProductGirl />,
      },
      {
        path: "/Newborn-collection",
        element: <AllProductNewborn />,
      },
      {
        path: "/checkout-order",
        element: <CheckoutOrder />,
      },
      {
        path: "/cart",
        element: <ViewCart />,
      },
      {
        path: "/checkout-cart",
        element: <CheckoutCart />,
      },
    ],
  },
]);

export default router;
