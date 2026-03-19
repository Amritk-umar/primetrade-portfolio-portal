import { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTasks = async () => {
        setLoading(true); // Ensure loading starts
        const token = localStorage.getItem('supabase_token');

        if (!token) {
            console.error("No token found!");
            navigate('/login');
            return;
        }

        try {
            // TIP: Try changing localhost to 127.0.0.1 if it hangs
            const res = await axios.get('http://127.0.0.1:8000/tasks', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000 // 5 second timeout so it doesn't hang forever
            });

            console.log("Data received:", res.data);
            setTasks(res.data);
        } catch (err) {
            console.error("Full Error Object:", err);
            // If the backend is down, this will catch it
            if (err.code === 'ECONNABORTED') alert("Backend is taking too long to respond!");
        } finally {
            setLoading(false); // THIS IS CRITICAL - it hides the "Loading..." text
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_token');
        navigate('/login');
    };

    useEffect(() => {
        fetchTasks();
    }, []);


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-600">PrimeTrade Portal</h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
                >
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <main className="max-w-4xl mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Your Tasks</h2>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {tasks.length} Total
                    </span>
                </div>

                {/* Task List */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center">
                        <Clock className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-600">No tasks found</h3>
                        <p className="text-gray-400">Try adding a task manually in Supabase to see it here!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between group hover:border-blue-300 transition">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">{task.title || 'Untitled Task'}</h3>
                                    <p className="text-gray-500">{task.description || 'No description provided'}</p>
                                </div>
                                <CheckCircle className="text-gray-200 group-hover:text-green-500 transition" size={24} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}