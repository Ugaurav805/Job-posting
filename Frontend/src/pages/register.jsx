import { useState } from 'react';
import './Register.css'; // Import the CSS file

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        phone: '',
        password: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch("http://localhost:3000/api/users/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.status === 200) {
                alert('Registration successful');
            } else {
                const data = await res.json();
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.log(error);
            setError('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input
                    onChange={(event) => setFormData((prev) => ({ ...prev, username: event.target.value }))}
                    value={formData.username}
                    type='text'
                    placeholder='Username'
                />
                <input
                    onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                    value={formData.name}
                    type='text'
                    placeholder='Name'
                />
                <input
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    value={formData.email}
                    type='email'
                    placeholder='Email'
                />
                <input
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                    value={formData.phone}
                    type='text'
                    placeholder='Phone'
                />
                <input
                    onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                    value={formData.password}
                    type='password'
                    placeholder='Password'
                />
                <button type='submit' disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
                    {error && <p>{error}</p>}
                </form>
            </div>
        );
    }