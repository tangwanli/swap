import React, { useState, useEffect } from "react";

const ErrorMessage = (props) => {
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        setShowError(true);

        const timer = setTimeout(() => {
            setShowError(false);
            props.setErrorText(null)
        }, 6000);

        return () => {
            clearTimeout(timer);
        };
    }, [props.errorMessage]);

    const errorDialogStyle = {
        position: "fixed",
        top: "10vh",
        right: "5vw",
        // margin: "20px",
        backgroundColor: "#ffffff",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
        borderRadius: "5px",
        padding: "20px",
        zIndex: "9999",
        display: showError ? "block" : "none",
        width: '90vw',
        maxWidth: '400px',
        color:'black',
    };

    const errorContentStyle = {
        color: "#e74c3c",
        fontSize: "18px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "5px"
    };

    return (
        <div style={errorDialogStyle}>
            <div style={errorContentStyle}>
                {props.errorMessage}
            </div>
        </div>
    );
};

export default ErrorMessage;