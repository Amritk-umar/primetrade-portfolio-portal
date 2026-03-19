import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // --- STEP 1: Supabase Sign Up ---
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      // --- STEP 2: Success Handling ---
      // If email confirmation is ON in Supabase, they need to check email.
      // If OFF, they are created immediately.
      setMessage('Registration successful! You can now log in.');
      setLoading(false);
      
      // Optional: Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form 
        onSubmit={handleRegister} 
        className="p-8 bg-white border rounded-lg shadow-lg w-96"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Create Account</h2>
        
        {message && (
          <div className={`p-2 mb-4 text-sm text-center rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-600">Email</label>
          <input 
            type="email" 
            placeholder="email@example.com" 
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-600">Password</label>
          <input 
            type="password" 
            placeholder="Min 6 characters" 
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}