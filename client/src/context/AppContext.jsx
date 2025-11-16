import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client'; // --- NEW IMPORT ---

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState([]);
  const [socket, setSocket] = useState(null); // --- NEW STATE FOR SOCKET ---

  // SFetch user data
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data");
      if (data.success) {
        setUser(data.user); // ✅ set user properly
        setIsOwner(data.user.role === "owner");
      } else {
        setUser(null);
        setIsOwner(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //  Fetch all cars
  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/user/cars");
      data.success ? setCars(data.cars) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  //  Logout
  const logout = () => {
    if (socket) {
      socket.disconnect(); // --- NEW: Disconnect socket on logout ---
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    axios.defaults.headers.common["Authorization"] = "";
    toast.success("You have been logged out");
  };

  //  On first load → restore token + fetch cars
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    fetchCars();
  }, []);

  //  React to token changes → fetch user AND connect to socket
  useEffect(() => {
    if (token) {
      // 1. Set auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // 2. Fetch user data
      fetchUser();

      // 3. --- NEW: Create socket connection ---
      const newSocket = io(import.meta.env.VITE_BASE_URL, {
        auth: {
          token: token // Send token to server for auth
        }
      });
      setSocket(newSocket);
      // -------------------------------------

    } else {
      // User is logged out
      setUser(null);
      setIsOwner(false);
      // --- NEW: Disconnect socket ---
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      // --------------------------
    }

    // Cleanup: Disconnect socket when component unmounts
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token]); // This effect depends only on the token

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    socket, // --- NEW: Pass socket to all components ---
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
