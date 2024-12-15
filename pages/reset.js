import { useState } from 'react';
import { auth } from '../src/authent';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      // Only set the success message if no error occurs
      setMessage('Password reset link has been sent to your email.');
    } catch (err) {
      // Handle specific error codes
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send reset email. Please check the email address and try again.');
      }
    }
  };

  return (
    <div className="container" style={{ 
      margin: '20px auto', 
      maxWidth: '1200px', 
      width: '90%', 
      textAlign: 'center' 
    }}>
      <h1>Reset Password</h1>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            margin: '10px 0',
            padding: '10px',
            width: '100%',
            maxWidth: '400px'
          }}
        />
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{
          padding: '10px 20px',
          marginTop: '10px'
        }}>Send Reset Link</button>
      </form>
      
      <p>
        <Link href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Back to Login
        </Link>
      </p>
    </div>
  );
}
