import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../src/authent';
import '../src/app/globals.css';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component from Next.js

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div>
      <header style={{ position: 'relative', height: 'auto', padding: '10px 20px' }}>
  {/* Logo positioned absolutely in the top-left corner */                        }
  <div className="logo-container" style={{ position: 'absolute', top: '0px', left: '0px', height: '100%' }}>
    <Link href="/">
      <Image
        src="/ocr.png"  
        alt="Logo" 
        className="logo-image"
        width={423}
        height={130} 
        style={{ 
          width: 'auto',
          height: '100%',
          maxHeight: '80px',  // Set a maximum height for larger screens
        }} 
      />
    </Link>
  </div>

  <nav className="horizontal-nav" style={{ display: 'flex', justifyContent: 'center' }}>
    <ul 
      style={{ 
        listStyle: 'none', 
        display: 'flex', 
        gap: '20px', 
        color: 'white', 
        margin: '0', 
        padding: '0', 
        fontSize: '1rem',
      }}
    >

<li><Link href="/" className="nav-link">Home</Link></li>
{/*<li><Link href="/ocrManager" className="nav-link">Image to text</Link></li>*/                    }
{/*<li><Link href="/ocrTableManager" className="nav-link">Image to table</Link></li>*/             }
<li><Link href="/route" className="nav-link">Dashboard</Link></li>
<li><Link href="/verify" className="nav-link">Verification</Link></li>
<li><Link href="/ocr" className="nav-link">Audit</Link></li>
<li><Link href="/redact" className="nav-link">Redaction</Link></li>



    </ul>
  </nav>

  {/* Profile Picture Container */  }
  
  
</header>

<style jsx>{`
  @media (max-width: 600px) {
    .logo-container {
      display: none;
    }
    
`}</style>




      {/* Background */  }
      <div className="background-container">
        <div className="area">
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
      </div>

      <Component {...pageProps} />

      {/* Sign Out Button at the bottom right */  }
      {user && (
        <button
          onClick={handleSignOut}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'red',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      )}
    </div>
  );
}

export default MyApp;
