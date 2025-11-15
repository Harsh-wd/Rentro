import React from 'react';
// Correcting the import path again. This assumes 'components' and 'context' are sibling folders inside 'src'.
import { useAppContext } from '../context/AppContext'; 
import toast from 'react-hot-toast';

// Reusable UI component for displaying each password requirement.
const PasswordRequirement = ({ isValid, text }) => {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${isValid ? 'text-green-500' : 'text-gray-500'}`}>
      {isValid ? (
        // Checkmark icon for valid requirements
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      ) : (
        // Circle icon for pending requirements
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
      )}
      <span>{text}</span>
    </div>
  );
};

const Login = () => {
  const { setShowLogin, axios, setToken, setUser, navigate } = useAppContext();
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPasswordReqs, setShowPasswordReqs] = React.useState(false);
  
  // State for toggling password visibility
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  // State to track the validity of each password requirement
  const [passwordValidity, setPasswordValidity] = React.useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  // This function runs every time the user types in the password field
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Use regular expressions to check each requirement
    setPasswordValidity({
      length: newPassword.length >= 8,
      lowercase: /[a-z]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      number: /\d/.test(newPassword), 
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  };

  // Check if all password requirements are met
  const isPasswordValid = Object.values(passwordValidity).every(Boolean);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (state === "register" && !isPasswordValid) {
        toast.error("Please ensure your password meets all requirements.");
        return;
    }

    try {
      const { data } = await axios.post(`/api/user/${state}`, { name, email, password });
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        if (data.user) {
          setUser(data.user);
        }
        
        toast.success(state === "login" ? "Login successful" : "Account created successfully");
        navigate('/');
        setShowLogin(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center text-sm text-gray-600 bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200 bg-white w-[90%] max-w-sm"
      >
        <p className="text-2xl font-medium m-auto mb-4">
          <span className="text-primary">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="type here"
              className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full ">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="type here"
            className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary"
            type="email"
            required
          />
        </div>

        <div className="w-full ">
          <p>Password</p>
          <div className="relative w-full">
            <input
              onChange={handlePasswordChange}
              onFocus={() => setShowPasswordReqs(true)}
              value={password}
              placeholder="type here"
              type={passwordVisible ? "text" : "password"}
              className="border border-gray-300 rounded w-full p-2 mt-1 outline-primary pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
            >
              {passwordVisible ? (
                // Eye-off icon
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                // Eye icon
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>
        
        {state === "register" && showPasswordReqs && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-1">
            <PasswordRequirement isValid={passwordValidity.length} text="At least 8 characters" />
            <PasswordRequirement isValid={passwordValidity.lowercase} text="A lowercase letter" />
            <PasswordRequirement isValid={passwordValidity.uppercase} text="An uppercase letter" />
            <PasswordRequirement isValid={passwordValidity.number} text="A number" />
            <PasswordRequirement isValid={passwordValidity.special} text="A special character" />
          </div>
        )}


        {state === "register" ? (
          <p className='mt-2'>
            Already have an account?{" "}
            <span onClick={() => { setState("login"); setShowPasswordReqs(false); }} className="text-primary cursor-pointer font-semibold">
              Login here
            </span>
          </p>
        ) : (
          <p className='mt-2'>
            Create a new account?{" "}
            <span onClick={() => setState("register")} className="text-primary cursor-pointer font-semibold">
              Click here
            </span>
          </p>
        )}

        <button 
          type="submit"
          disabled={state === "register" && !isPasswordValid}
          className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2.5 rounded-md cursor-pointer mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;

