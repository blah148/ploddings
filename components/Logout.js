import { useRouter } from 'next/router';

export default function Logout() {
    const router = useRouter();

		const handleLogout = async () => {
			await fetch('/api/logout', { method: 'POST' });
			router.push('/');
		};

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

