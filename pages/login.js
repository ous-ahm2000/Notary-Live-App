import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/authent';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to main page after login
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="container" style={{ 
      margin: '20px auto', 
      maxWidth: '1200px', 
      width: '90%', 
      textAlign: 'center' 
    }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter email"
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
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            margin: '10px 0',
            padding: '10px',
            width: '100%',
            maxWidth: '400px'
          }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{
          padding: '10px 20px',
          marginTop: '10px'
        }}>Login</button>
      </form>
      
      <p>
        <Link href="/reset" style={{ color: 'blue', textDecoration: 'underline' }}>
          Forgot Password?
        </Link>
      </p>

      <p>
        Dont have an account? <Link href="/register">Register here</Link>.
      </p>
    </div>
  );
}

