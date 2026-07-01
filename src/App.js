import 'bootstrap/dist/css/bootstrap.min.css';
import SignUp from './Signup_Page/signup';
import Home from './Home_Page/home';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResidentLogin from './Login_Page/login';
import ResidentDashboard from './Resident_dashboard/resident_dashboard';
import LiveTracking from './track_page/track';
import CollectionSchedule from './collection_schedule_page/collection_schedule';
import ComplaintManagement from './Complaints_Page/complaints';
import Scanner from './Scanner_Page/scanner';
import Feedback from './Feedback_Page/Feedback';
import AdminDashboard from './Admin_Dashboard_Page/Admin_Dashboard';
import Drivr_dashboard from './Driver_Dashboard_Page/driver_dashboard';
import AddDriver from './Add_Driver_Page/add_driver';
import ManageDrivers from './Driver_Managment_page/driver_managment';
import ManageResidents from './Resident_Managment_Page/resident_managment';
import AddTruck from './Add_Truck_Page/add_truck';
import ManageTruck from './Truck_Management_Page/truck_management';
import AddRoute from './Add_Route_Page/add_route';
import ManageRoutes from './Route_Managment/route_managment';
import AddBin from './Add_Bin_Page/add_bin';
import ManageBin from './Bin_Managment_Page/bin_managment';
import AddQRCode from './Add_QR_Code_Page/add_qr_code'; 
import ManageQRCode from './QR_Code_Management_Page/qr_code_manage';
import AddSchedule from './Add_Schedule_Page/add_schedule';
import ManageSchedules from './Schedule_Managment_Page/schedule_management';
import AddContent from './Add_Content_Page/add_content';
import ManageContent from './Content_Management_Page/content_managment';
import AdminFeedback from './Feedback_Management_Page/feedback_management';
import ComplaintManagementAdmin from './Complaint_Managment_Page/complaint_managment';
import SpecialRequest from './Special_Pickup_Request_Page/pickup_request';
import AdminSpecialRequests from './Pickup_Request_Managment_Page/pickup_managment';
import AddEmergencyAlert from './Add_Emergency_Alert/add_emergency_alert';
import ManageEmergencyAlerts from './Emergency_alert_Management/emergency_alert_managment';


function App() {
  return (
    <BrowserRouter>
      <Routes>       
      <Route path="/home" element={<Home />} />
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<ResidentLogin/>} />
        <Route path="/resident_dashboard" element={<ResidentDashboard/>} />
          <Route path="/track" element={<LiveTracking/>} />
         <Route path="/collection_schedule" element={<CollectionSchedule/>} />
         <Route path="/complaints" element={<ComplaintManagement/>} />
         <Route path="/scanner" element={<Scanner/>} />
         <Route path="/Feedback" element={<Feedback/>} />
         <Route path="/Admin_Dashboard" element={<AdminDashboard/>} />
         <Route path="/driver_dashboard" element={<Drivr_dashboard/>} />
         <Route path="/add_driver" element= {<AddDriver/>} />      
        <Route path="/driver_managment" element= {<ManageDrivers/>} /> 
        <Route path="/resident_managment" element= {<ManageResidents/>} />
        <Route path="/add_truck" element= {<AddTruck/>} />
        <Route path="/truck_management" element= {<ManageTruck/>} />
        <Route path="/add_route" element= {<AddRoute/>} />
        <Route path="/route_managment" element= {<ManageRoutes/>} />
        <Route path="/add_bin" element= {<AddBin/>} />
        <Route path="/bin_managment" element= {<ManageBin/>} />
        <Route path="/add_qr_code" element= {<AddQRCode/>} />
        <Route path="/qr_code_manage" element= {<ManageQRCode/>} />
        <Route path="/add_schedule" element= {<AddSchedule/>} />
        <Route path="/schedule_management" element= {<ManageSchedules/>} />
        <Route path="/add_content" element= {<AddContent/>} />
        <Route path="/content_managment" element= {<ManageContent/>} />
        <Route path="/feedback_management" element= {<AdminFeedback/>} />
        <Route path="/complaint_managment" element= {<ComplaintManagementAdmin/>} />
        <Route path="/pickup_request" element= {<SpecialRequest/>} />
        <Route path="/pickup_managment" element= {<AdminSpecialRequests/>} />
        <Route path="/add_emergency_alert" element= {<AddEmergencyAlert/>} />    
        <Route path="/emergency_alert_managment" element= {<ManageEmergencyAlerts/>} />    
      </Routes>
    </BrowserRouter>
  );}
export default App;
 