import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import PrivateRoute from "./PrivateRoute";
import Layout from "./Layout";
import AllPosts from "./AllPosts";
import CreatePost from "./CreatePost";
import PostDetails from "./PostDetails";
import OAuthCallback from "./OAuthCallback";
import ChatGPTPage from "./ChatGPTPage";
import AdminPanel from "./AdminPanel";
import AppointmentsPage from "./Appointments/ManageAppointmentsPage";
import UserProfileClean from "./DoctorProfile/UserProfileClean";
import ChatContainer from "./Chat/ChatContainer";
import NotAllowedPage from "./NotAllowedPage";
import SessionSummaryPage from "./SessionSummary"; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/not-allowed" element={<NotAllowedPage />} />
        <Route path="/"element={<PrivateRoute><Layout /></PrivateRoute>} >
          <Route path="/profile" element={<UserProfileClean />} />
          <Route path="/all-posts" element={<AllPosts />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/chatgpt" element={<ChatGPTPage />} />
          <Route path="/appointmens" element={<AppointmentsPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/meetings/:meetingId/chat" element={<ChatContainer />} />
          <Route path="/summary/:meetingId" element={<SessionSummaryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
