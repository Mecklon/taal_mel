import "./App.css";
import Site from "./components/Site";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Chat from "./components/Chat";
import Profile from "./components/Profile";
import { useAuthContext } from "./hooks/useAuthContext";
import Trending from "./components/Trending";
import Notifications from "./components/Notifications";
import ProfilePost from "./components/ProfilePost";
import MkPost from "./components/MkPost";
import Opportunities from "./components/Opportunities";
import JobPosts from "./components/JobPosts";
import YourJobPosts from "./components/YourJobPosts";
import Applications from "./components/Applications";
const App = () => {
  const { user } = useAuthContext();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Site /> : <Navigate to="/login" />}>
            <Route path="" element={<Chat />}></Route>
            <Route path="profile">
              <Route index element={<Profile />}></Route>
              <Route path="post" element={<ProfilePost />}></Route>
              <Route path="newPost" element={<MkPost />}></Route>
            </Route>
            <Route path="trending" element={<Trending />}></Route>
            <Route path="notifications" element={<Notifications />}></Route>
            <Route path="opportunities" element={<Opportunities />}>
              <Route index element={<JobPosts />}></Route>
              <Route path="applications" element={<Applications />}></Route>
              <Route path="yourPosts" element={<YourJobPosts />}></Route>
            </Route>
          </Route>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          ></Route>
          <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <Signup />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
