const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", require("./routes/authRoutes"));
app.use("/", require("./routes/driverRoutes"));
app.use("/", require("./routes/residentRoutes"));
app.use("/", require("./routes/truckRoutes"));
app.use("/", require("./routes/routeRoutes"));
app.use("/", require("./routes/binRoutes"));
app.use("/", require("./routes/qrRoutes"));
app.use("/", require("./routes/scheduleRoutes"));
app.use("/", require("./routes/awarenessRoutes"));
app.use("/", require("./routes/complaintRoutes"));
app.use("/", require("./routes/feedbackRoutes"));
app.use("/", require("./routes/specialRequestRoutes"));
app.use("/", require("./routes/dashboardRoute"));
app.use("/", require("./routes/emergencyAlertRoutes"));


app.listen(5000, () => {
  console.log("Server running on port 5000");
});