import { useRouter } from 'next/router';

export default function Logout() {
    const router = useRouter();

    const handleLogout = () => {
        // Remove the JWT token cookie
        // Here, we are setting the cookie to expire immediately
        document.cookie = "auth_token=; Max-Age=0; path=/;";

        // Redirect to the home page
        router.push('/');
    };

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

