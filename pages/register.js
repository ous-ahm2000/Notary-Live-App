
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../src/authent';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  // Password validation function
  const isPasswordValid = (password) => {
    const lengthCheck = password.length >= 8;
    const uppercaseCheck = /[A-Z]/.test(password);
    const lowercaseCheck = /[a-z]/.test(password);
    const digitCheck = /[0-9]/.test(password);
    const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return lengthCheck && uppercaseCheck && lowercaseCheck && digitCheck && specialCharCheck;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!isPasswordValid(password)) {
      setError("Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character.");
      return;
    }
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to main page after registration
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ 
      margin: '20px auto', 
      maxWidth: '1200px', 
      width: '90%', 
      textAlign: 'center' 
    }}>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link href="/login">Login here</Link>.
      </p>
    </div>
  );
}
