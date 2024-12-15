import React from "react";

const StepFive = ({  prevStep }) => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2 style={{ color: "white" }}>Congratulations!</h2>
      <p style={{ color: "white", fontSize: "18px" }}>
        Your registration has been successfully completed.
      </p>
      <p style={{ color: "white", fontSize: "16px" }}>
        Please wait while your submitted document are being reviewed.
      </p>
      <p style={{ color: "white", fontSize: "16px" }}>
        You will be notified once the review is completed.
      </p>
      <button id="convertButton" onClick={prevStep}>Back</button>

    </div>
  );
};

export default StepFive;
