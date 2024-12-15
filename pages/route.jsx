
import React, { useState, useEffect } from "react";
import StepOne from "../components/StepOne";
import StepTwo from "../components/StepTwo";
import StepThree from "../components/StepThree";
import StepFour from "../components/StepFour";
import StepFive from "../components/StepFive";
//import StepSix from "../components/StepSix";

import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/authent";
import Cookies from "js-cookie"; // Import js-cookie

const Route = () => {
  const [step, setStep] = useState(1); // Default step is 1
  const [caseUUID, setCaseUUID] = useState("");
  const [sellerInfo, setSellerInfo] = useState({}); // Initialize sellerInfo state
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [buyerInfo, setBuyerInfo] = useState({}); // Store buyer information

  // Retrieve step from cookies on component mount
  useEffect(() => {
    const savedStep = Cookies.get("currentStep");
    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
  }, []);

  // Save step to cookies whenever it changes
  useEffect(() => {
    Cookies.set("currentStep", step.toString());
  }, [step]);

  // Check user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <p></p>;
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div id="ocrContainer" style={{ marginTop: "20px", maxWidth: "1200px", width: "90%" }}>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2 id="heading" style={{ color: "white" }}>Notarization Dashboard</h2>

        {step === 1 && <StepOne setCaseUUID={setCaseUUID} setSellerInfo={setSellerInfo} nextStep={nextStep} />}
        {step === 2 && <StepTwo caseUUID={caseUUID} setBuyerInfo={setBuyerInfo} nextStep={nextStep} prevStep={prevStep} />}
        {step === 3 && (
          <StepThree
            caseUUID={caseUUID}
            sellerInfo={sellerInfo}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 4 && <StepFour caseUUID={caseUUID} buyerInfo={buyerInfo} nextStep={nextStep} prevStep={prevStep} />}
        {step === 5 && <StepFive prevStep={prevStep}/>}
        
      </div>
    </div>
  );
};

export default Route;
