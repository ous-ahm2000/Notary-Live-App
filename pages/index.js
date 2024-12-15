import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../src/authent'; // Import the auth instance
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase methods
import styles from '../src/app/Home.module.css';
import Image from 'next/image'; // Import Image component from Next.js



export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container} style={{ marginTop: '20px' , maxWidth: '1200px', width: '90%'}}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          {user ? (
            <span style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              fontSize: '18px', 
              fontWeight: '600', 
              color: 'black', // Blue color for the welcome message
              display: 'block',
              marginBottom: '10px'
            }}>
               {user.displayName}
            </span>         ) : (
            <>
              <Link href="/login" className={styles.navLink} style={{ color: 'white'}}>
                Login
              </Link>
              <Link href="/register" className={styles.navLink} style={{ color: 'white'}}>
                Register
              </Link>
            </>
          )}
        </nav>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
  {/* Font Awesome  */}
  <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
      </header>

      <main className={styles.main}>
      <h1 style={{ 
    fontFamily: 'Montserrat, sans-serif', 
    fontSize: '36px', 
    fontWeight: '700', 
    color: '#a34054', // Dark grey color for the heading
    marginTop: '20px'
  }}>
    Welcome to NOTARY LIVE
  </h1>     
 {/**<p style={{ 
    fontFamily: 'Montserrat, sans-serif', 
    fontSize: '18px', 
    fontWeight: '550', 
    color: '#33354e', // Medium grey color for the paragraph
    lineHeight: '1.4', 
    marginTop: '10px'
  }}>
    Extract text and tables from web images    
  </p><p style={{ 
    fontFamily: 'Montserrat, sans-serif', 
    fontSize: '18px', 
    fontWeight: '550', 
    color: '#33354e', // Medium grey color for the paragraph
    lineHeight: '1.4', 
    marginTop: '10px'
  }}>
   Download to your prefered file format    
  </p> */} 
  {/* Image below the heading */}
  <Image 
    src="/ocr1.png"  // Replace with the actual path to your image
    alt="image to text" 
    width={500}  
    height={732}  
    style={{ 
      width: '100%',  // Adjust the width as needed
      maxWidth: '700px',  // Set a maximum width for larger screens
      height: 'auto',  // Maintain aspect ratio
      margin: '20px 0',  // Add some spacing around the image
      display: 'block',
      borderRadius: '10px'  // Optional: Add rounded corners
    }} 
  />

      </main>

      <footer className={styles.footer} >
      <p style={{ 
    fontFamily: 'Montserrat, sans-serif', 
    fontSize: '20px', 
    fontWeight: '500'}}>NOTARY 2024</p>
      </footer>
      

    </div>
    
  );
}
