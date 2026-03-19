import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert(error.message);
        } else {
            // Skill Flex: Save the access token for our Python API
            localStorage.setItem('supabase_token', data.session.access_token);
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">PrimeTrade Login</h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            placeholder="bhanuhanda09990@gmail.com"
                            className="w-full p-3 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full p-3 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        Login
                    </button>
                    <p className="mt-4 text-center text-sm">
                        Don't have an account? {' '}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Sign Up here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}