import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import PrivateRoute from "./PrivateRoute";
import Layout from "./Layout";
import OAuthCallback from "./OAuthCallback";
import ChatGPTPage from "./ChatGPTPage";
import AdminPanel from "./AdminDashboard/AdminPanel";
import AppointmentsPage from "./Appointments/ManageAppointmentsPage";
import UserProfileClean from "./DoctorProfile/UserProfileClean";
import ChatContainer from "./Chat/ChatContainer";
import NotAllowedPage from "./NotAllowedPage";
import SessionSummaryPage from "./DoctorProfile/SessionSummary";
import PatientRecord from "./DoctorProfile/PatientRecord";
import DoctorDashboard from "./DoctorDashboard/DoctorDashboard";
import NotFoundPage from "./NotFoundPage";
import NotificationCenter from "./Notifications/NotificationCenter";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/not-allowed" element={<NotAllowedPage />} />
        <Route path="/"element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/profile" element={<UserProfileClean />} />
          <Route path="/chatgpt" element={<ChatGPTPage />} />
          <Route path="/appointmens" element={<AppointmentsPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/meetings/:meetingId/chat" element={<ChatContainer />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/summary/:meetingId" element={<SessionSummaryPage />} />
          <Route
            path="/patients/:patientId/record"
            element={<PatientRecord />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
