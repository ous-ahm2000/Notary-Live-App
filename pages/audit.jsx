import { useRouter } from "next/router";
import React, { useState, useEffect } from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/authent';

const Audit = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  if (!user) {
    return <p>...</p>;
  }

  // Handlers for navigation
  const handleImageToText = () => {
    router.push("/ocrManager");
  };

  const handleImageToTable = () => {
    router.push("/ocrTableManager");
  };

  return (
    <div id="ocrContainer" style={{ marginTop: '20px' , maxWidth: '1200px', width: '90%'}}>
            <h2 id="heading" style={{ color: "white" }}>Audit your contract documents and export to your prefered structure </h2>

      <div className="audit-button-container">
        <button id="convertButton" onClick={handleImageToText}>
          Text
        </button>
        <button id="convertButton" onClick={handleImageToTable}>
          Table
        </button>
      </div>
    </div>
  );
};

export default Audit;
