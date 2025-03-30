import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchProtectedData } from '../Services/authService';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            console.log("Checking authentication...");
            const res = await fetchProtectedData();

            if (res.success) {
                console.log("Auth check result:", res.message || "Success");
                setIsAuthenticated(true);
            } else {
                console.log("Auth check result failed:", res.message);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        console.log("Authentication failed");
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}

export default PrivateRoute;
