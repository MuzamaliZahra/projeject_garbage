import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./add_qr_code.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function AddQRCode() {

    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        QR_id: "",
        data: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
        setSuccess("");
    };

    // Generate QR data
    const generateData = () => {
        const timestamp = Date.now();
        const rand = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        const data = `CLEANLAND-BIN-${rand}-${timestamp}`;

        setFormData(prev => ({
            ...prev,
            data
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.QR_id || !formData.data) {
            setError("All fields are required.");
            return;
        }

        axios.post(
            "http://localhost:5000/add-qrcode",
            formData
        )
        .then(() => {
            setSuccess(
                `QR Code "${formData.QR_id}" added successfully!`
            );

            setFormData({
                QR_id: "",
                data: ""
            });
        })
        .catch(err => {
            setError(
                err.response?.data ||
                "Server error. Please try again."
            );
        });
    };

    return (
        <div className="aq_page">

            <AdminNavBar />

            <div className="aq_body">

                {/* Page Title */}
                <div className="aq_page_title">
                    <h2>Add New QR Code</h2>
                    <p>
                        Enter a QR ID manually and generate
                        a unique QR code
                    </p>
                </div>

                {/* Stats Row */}
                <div className="status_row">

                    <div className="status_card green">
                        <div className="status_num">
                            <i className="bi bi-qr-code-scan"></i>
                        </div>
                        <div className="status_label">
                            New QR Code
                        </div>
                    </div>

                    <div className="status_card orange">
                        <div className="status_num">
                            <i className="bi bi-pencil-square"></i>
                        </div>
                        <div className="status_label">
                            Enter QR ID
                        </div>
                    </div>

                    <div className="status_card blue">
                        <div className="status_num">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <div className="status_label">
                            Generate QR Code
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="aq_card">

                    {/* Avatar */}
                    <div className="aq_avatar_wrap">
                        <div className="aq_avatar">
                            <i className="bi bi-qr-code"></i>
                        </div>

                        <div className="aq_avatar_label">
                            QR Code Registration
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="aq_alert aq_alert_error">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="aq_alert aq_alert_success">
                            <i className="bi bi-check-circle-fill"></i>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* QR ID */}
                        <div className="aq_form_group">
                            <label>QR ID</label>

                            <input
                                type="text"
                                name="QR_id"
                                placeholder="e.g. QR001"
                                value={formData.QR_id}
                                onChange={handleChange}
                            />
                        </div>

                        {/* QR Data */}
                        <div className="aq_form_group">

                            <label>QR Code Data</label>

                            <div className="aq_input_with_btn">

                                <input
                                    type="text"
                                    name="data"
                                    placeholder="Click Generate to create QR data..."
                                    value={formData.data}
                                    onChange={handleChange}
                                    readOnly
                                    style={{
                                        background: "#f9f9f9",
                                        color: "#555",
                                        cursor: "default"
                                    }}
                                />

                                <button
                                    type="button"
                                    className="aq_generate_btn_inline"
                                    onClick={generateData}
                                >
                                    <i className="bi bi-lightning-charge-fill"></i>
                                    Generate
                                </button>
                            </div>

                            {/* Generated Info */}
                            {formData.data && (
                                <div className="aq_data_info">
                                    <i className="bi bi-check-circle-fill"></i>
                                    Unique QR data generated —
                                    click Generate again to refresh
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        {formData.data && (
                            <div className="aq_preview">

                                <QRCodeCanvas
                                    value={formData.data}
                                    size={150}
                                />

                                <div className="aq_preview_details">
                                    <div>
                                        <strong>QR ID:</strong>
                                        {" "}
                                        {formData.QR_id}
                                    </div>

                                    <div>
                                        <strong>Data:</strong>
                                        {" "}
                                        {formData.data}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="aq_btn_row">

                            <button
                                type="button"
                                className="aq_btn_cancel"
                                onClick={() => navigate(-1)}
                            >
                                <i className="bi bi-x-circle"></i>
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="aq_btn_submit"
                                disabled={!formData.data}
                            >
                                <i className="bi bi-qr-code-scan"></i>
                                Add QR Code
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddQRCode;