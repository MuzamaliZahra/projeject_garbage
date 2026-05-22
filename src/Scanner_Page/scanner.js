import "./scanner.css";
import NavBar from "../Navigation_Bar_Page/Navigation";
import Footer from "../Footer_Page/Footer";
import { useEffect, useRef, useState } from "react";


const API_BASE = "http://localhost:5000";


function Scanner() {

  const [scanning, setScanning] = useState(false);
  const [binData, setBinData] = useState(null);
  const [error, setError] = useState ("");
  const [loading, setLoading] = useState(false);
  const [manualQR, setManualQR] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // fetch bin by qr
  const fetchBinByQR = async (qrID) => {
    setLoading(true);
    setError("");
    setBinData(null);

    try{
      const res = await fetch (`${API_BASE}/get-bin-by-qr/${encodeURIComponent(qrID)}`);
      const data = await res.json();
      if (data.success && data.bin) {
        setBinData(data.bin);
      } else {
        setError("No bin found for this QR code");
      }
    } catch {
      setError("Network error. Could not fetch bin details.");
    } finally {
      setLoading(false);
    }
  };


  // start camera to scan
  const startScanning = async () => {
    setError("");
    setBinData(null);

    try{
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "ebvironment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);
    } catch {
      setError("Camera access denied. Please allow camera or use manual entry below.");

    }
  };

    // Stop Camera
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };


  //manual qr
  const handleManualSearch = () => {
    if (!manualQR.trim()) {
      setError("Please enter a QR ID");
      return;
    }
    fetchBinByQR(manualQR.trim());
  }

  //cleanup
  useEffect(() => {
    return () => stopScanning();
  }, []);

  // Helpers 
  const formatDate = (d) => d ? d.split("T")[0] : "Not available";
  const formatTime = (t) => t ? t.slice(0, 5) : "";

    const getBinIcon = (type) => {
    if (!type) return "🗑️";
    if (type.toLowerCase().includes("recycl"))    return "♻️";
    if (type.toLowerCase().includes("organic"))   return "🌿";
    if (type.toLowerCase().includes("hazardous")) return "☢️";
    return "🗑️";
  };

  return (
    <>
      <NavBar />
   
<div className="scanner_page">
       {/* Headings*/}
        <div className="scanner_heading">
          <h2 className="title">QR Code Scanner</h2>
          <p className="subtitle">
            Scan the bin QR code to view
             bin information
          </p>
        </div>
      
          {/* Scanner Card */}
          <div className="scanner_card">


            {/*camera placeholder*/}

            <div className="scanner_box">
              {scanning ? (
                <video ref={videoRef} className="scannert_video" autoPlay playsInline muted/>
              ) : (
                <span>  📷 </span>
              )}
              {scanning && <div className="scanner_overlay"><div className="scanner_line" /></div>}
              </div>
              {/*scan button*/}
              
              {!scanning ? (
            <button className="scan_btn" onClick={startScanning}>Start Scanning</button>
              ) : (

            <button className="scan_btn scan_btn_stop" onClick={stopScanning}>⏹ Stop Scanning</button>
              )}

            {/* Manual Entry */}
            <div className="manual_entry">
              <p className="manual_label">Or enter QR ID manually:</p>
              <div className="manual_row">
              <input
                className="manual_input"
                placeholder="e.g. QR001"
                value={manualQR}
                onChange={(e) => setManualQR(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <button className="manual_btn" onClick={handleManualSearch}>Search</button>
            </div>
          </div>
          </div>

          {/* error */}

          {error && <div className="scanner_error">⚠️{error}</div>}

          {/* loading */}

          {loading && <div className="scanner_loading">🔍 Fetching bin details...</div>}
        
        {/* Bin Information */}
        {binData && (
        <div className="info_card">
            <div className="info_card_header">
              <h3>Bin Information</h3>
              <span className="bin_icon_large">{getBinIcon(binData.type)}</span>
            </div>

            <div className="info_grid">
              <div className="info_item">
                <label>Bin ID</label>
                <p>{binData.bin_ID}</p>
              </div>

              <div className="info_item">
                <label>Bin Type</label>
                <p>{getBinIcon(binData.type)} {binData.type}</p>
              </div>

              <div className="info_item">
                <label>Location</label>
                <p>📍 {binData.location}</p>
              </div>

              <div className="info_item">
                <label>Status</label>
                <span className={`status ${binData.status === "Empty" ? "status_empty" : "status_filled"}`}>
                  {binData.status === "Empty" ? "🟢 Empty" : "🔴 Filled" }  
                </span>
              </div>

              <div className="info_item">
                <label>Last Collection</label>
                <p>
                  {binData.lst_clctn_date
                    ? `📅 ${formatDate(binData.lst_clctn_date)} 🕐 ${formatTime(binData.lst_clctn_time)}`
                  : "Not collected yet"}
                </p>
              </div>

              <div className="info_item">
                <label>QR Code</label>
                <p>📱 {binData.QR_ID}</p>
              </div>

              
              <div className="info_item">
                <label>Route Name</label>
                <p>{binData.route_name || "—"}</p>
              </div>

            </div>
          </div>

      

      )}
        </div>

      <Footer />
    </>
  );
}

export default Scanner;
