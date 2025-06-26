import { Route, Routes, useLocation } from "react-router-dom"
import Navbar from "./component/Navbar"
import Home from "./pages/Home"
import SeatLayout from "./pages/SeatLayout";
import Movies from "./pages/Movies"
import MovieDetails from "./pages/MovieDetails"
import MyBookings from "./pages/MyBookings"
import Favorite from "./pages/Favorite"
import{Toaster} from "react-hot-toast"
import Footer from "./component/Footer"
import Layout from "./pages/admin/Layout";
import DashBoard from "./pages/admin/DashBoard";
import AddShow from "./pages/admin/AddShow";
import ListShow from "./pages/admin/ListShow";
import ListBookings from "./pages/admin/ListBookings";

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Movies" element={<Movies />} />
        <Route path="/Movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/Movies/:id/date" element={<SeatLayout />} />
        <Route path="/my-booking" element={<MyBookings />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/admin/*" element={<Layout />}>
          <Route index element={<DashBoard />} />
          <Route path="add-show" element={<AddShow />} />
          <Route path="list-shows" element={<ListShow />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App